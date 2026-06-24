import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import cluster from "node:cluster";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import jwt from "jsonwebtoken";
import util from "../lib/util.js";
import FF from "../lib/FF.js";
import Video from "../models/videos.js";
import JobQueue from "../lib/JobQueue.js";

let jobs;
if (cluster.isPrimary) {
  jobs = new JobQueue();
}

export const getVideo = async (req, res, errHandling) => {
  try {
    //.sort insures the latest videos are displayed on top by the frontend
    const video = await Video.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    if (video.length === 0) {
      return errHandling("No videos were found for this user");
    }

    // console.log(video);

    res.status(200).json(video);
  } catch (error) {
    errHandling(error.message);
  }
};

export const uploadVideo = async (req, res, handleErr) => {
  //Get filename in custom header
  const specifiedFileName = req.headers.filename;

  if (!specifiedFileName) {
    return handleErr({
      status: 400,
      message:
        "Missing 'filename' header. Please provide a file name with an extension.",
    });
  }

  //get file extension
  const extension = path.extname(specifiedFileName).substring(1).toLowerCase();
  const name = path.parse(specifiedFileName).name;
  //create random id for video
  const videoId = crypto.randomBytes(4).toString("hex");

  const FORMATS_SUPPORTED = ["mov", "mp4"];
  if (FORMATS_SUPPORTED.indexOf(extension) == -1) {
    return handleErr({
      status: 400,
      message: "Only these formats are supported: mov, mp4",
    });
  }

  // --- COOKIE & JWT EXTRACTOR ---
  let authenticatedUserId = req.user.userId;

  if (!authenticatedUserId) {
    return res.status(401).json({
      status: "error",
      message: "Authentication failed. No active session token found.",
    });
  }

  try {
    // 1. Create a temporary local folder on server for FFmpeg processing
    const tempDir = `./storage/${videoId}`;
    await fs.mkdir(tempDir, { recursive: true });

    const fullPath = `${tempDir}/original.${extension}`;
    const thumbnailPath = `${tempDir}/thumbnail.jpg`;

    // 2. Open a stream and write the upload bytes to local disk first
    const file = await fs.open(fullPath, "w");
    const fileStream = file.createWriteStream();
    await pipeline(req, fileStream);

    // 3. Run local FFmpeg processing pipelines safely on local disk files
    await FF.makeThumbnail(fullPath, thumbnailPath);
    const dimensions = await FF.getDimensions(fullPath);

    // 4. Initialize live Supabase cloud storage client gateway connection
    const supabaseS3 = new S3Client({
      forcePathStyle: true,
      region: process.env.SUPABASE_REGION || "eu-west-1",
      endpoint: process.env.SUPABASE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
        secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
      },
    });

    // 5. Upload the original video file from disk straight to Supabase
    const cloudVideoKey = `${videoId}/original.${extension}`;
    const videoUpload = new Upload({
      client: supabaseS3,
      params: {
        Bucket: process.env.SUPABASE_BUCKET_NAME,
        Key: cloudVideoKey,
        Body: createReadStream(fullPath),
        ContentType: `video/${extension}`,
      },
    });
    await videoUpload.done();

    // 6. Upload the newly generated thumbnail image to Supabase
    const cloudThumbKey = `${videoId}/thumbnail.jpg`;
    const thumbUpload = new Upload({
      client: supabaseS3,
      params: {
        Bucket: process.env.SUPABASE_BUCKET_NAME,
        Key: cloudThumbKey,
        Body: createReadStream(thumbnailPath),
        ContentType: "image/jpeg",
      },
    });
    await thumbUpload.done();

    // Fix the endpoint address before saving to MongoDB
    const publicCdnBase = process.env.SUPABASE_ENDPOINT.replace(
      ".storage.supabase.co/storage/v1/s3",
      ".supabase.co/storage/v1/object/public",
    );

    // 7. Construct public internet download addresses
    const cloudVideoUrl = `${publicCdnBase}/${process.env.SUPABASE_BUCKET_NAME}/${cloudVideoKey}`;
    const cloudThumbUrl = `${publicCdnBase}/${process.env.SUPABASE_BUCKET_NAME}/${cloudThumbKey}`;

    // 8. Wipe out the temporary folder on server disk immediately to save space!
    await util.deleteFolder(tempDir);

    // 9. Fetch current document sequence counter
    const videoCount = await Video.countDocuments();

    // 10. Commit data properties cleanly into MongoDB collection
    await Video.create({
      id: videoCount,
      videoId,
      name,
      extension,
      videoUrl: cloudVideoUrl,
      thumbnailUrl: cloudThumbUrl,
      dimensions,
      userId: authenticatedUserId,
      extractedAudio: false,
      resizes: {},
    });

    res.status(201).json({
      status: "success",
      message: "Uploaded, processed, and synced to cloud storage successfully!",
    });
  } catch (e) {
    util.deleteFolder(`./storage/${videoId}`);
    if (e.code !== "ECONNRESET") return handleErr(e);
  }
};

export const extractAudio = async (req, res, handleErr) => {
  const videoId = req.query.videoId;

  try {
    // 1. Locate video in MongoDB
    const video = await Video.findOne({ videoId });

    if (!video) {
      return res
        .status(404)
        .json({ status: "error", message: "Video record not found!" });
    }

    // Safety Gate: Verify videoUrl property actually exists on this document
    if (!video.videoUrl) {
      return res.status(400).json({
        status: "error",
        message:
          "This video document is missing a valid cloud storage videoUrl property. Please test with a newly uploaded video.",
      });
    }

    if (video.extractedAudio) {
      return handleErr({
        status: 400,
        message: "The audio has already been extracted.",
      });
    }

    // 2. Set up temporary paths on local server disk
    const tempDir = `./storage/temp-audio-${videoId}`;
    await fs.mkdir(tempDir, { recursive: true });

    const localVideoPath = `${tempDir}/original.${video.extension}`;
    const localAudioPath = `${tempDir}/audio.aac`;

    // 3. Download directly via the pre-formatted URL stored in database
    // console.log("Downloading via direct Public CDN link:", video.videoUrl);

    const response = await fetch(video.videoUrl, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(
        `Cloud download failed with HTTP status ${response.status} (${response.statusText})`,
      );
    }

    if (!response.body) {
      throw new Error(
        "Failed to stream video data payload from cloud storage.",
      );
    }

    // Pipe the public stream safely into your local temporary video directory file
    await pipeline(response.body, createWriteStream(localVideoPath));

    // 4. Run FFmpeg safely on the temporary local disk file
    await FF.extractAudio(localVideoPath, localAudioPath);

    // 5. Initialize the Supabase storage client
    const supabaseS3 = new S3Client({
      forcePathStyle: true,
      region: process.env.SUPABASE_REGION || "eu-west-1",
      endpoint: process.env.SUPABASE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
        secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
      },
    });

    // 6. Stream the processed audio file to cloud bucket
    const cloudAudioKey = `${videoId}/audio.aac`;
    const audioUpload = new Upload({
      client: supabaseS3,
      params: {
        Bucket: process.env.SUPABASE_BUCKET_NAME,
        Key: cloudAudioKey,
        Body: createReadStream(localAudioPath),
        ContentType: "audio/aac",
      },
    });
    await audioUpload.done();

    // 7. Update status properties and clean up disk
    video.extractedAudio = true;
    await video.save();

    // Wipe the temporary folder completely clean to save disk space
    await util.deleteFolder(tempDir);

    res.status(200).json({
      status: "success",
      message: "Audio was extracted and synced to cloud successfully",
    });
  } catch (error) {
    await util.deleteFolder(`./storage/temp-audio-${videoId}`);
    return handleErr(error);
  }
};

export const resizeVideo = async (req, res, handleErr) => {
  const videoId = req.body.videoId;
  const width = Number(req.body.width);
  const height = Number(req.body.height);
  try {
    const video = await Video.findOne({ videoId });

    if (!video) {
      return res
        .status(404)
        .json({ status: "error", message: "Video record not found." });
    }

    const resolutionKey = `${width}x${height}`;

    // Mongoose Maps require utilizing the explicit .set() function to mark changes
    video.resizes.set(resolutionKey, { processing: true });
    await video.save();

    if (cluster.isPrimary) {
      jobs.enqueue({
        type: "resize",
        videoId,
        width,
        height,
      });
    } else {
      process.send({
        messageType: "new-resize",
        data: { videoId, width, height },
      });
    }

    res.status(200).json({
      status: "success",
      message: "The video is now being processed",
    });
  } catch (error) {
    return handleErr(error);
  }
};

export const getVideoAsset = async (req, res, handleErr) => {
  const videoId = req.query.videoId;
  const type = req.query.type; // thumbnail, original, audio, or resize

  try {
    const video = await Video.findOne({ videoId });

    if (!video) {
      return res
        .status(404)
        .json({ status: "error", message: "Video asset registry not found." });
    }

    //  Format the base endpoint address to point to the Public CDN gateway
    const publicCdnBase = process.env.SUPABASE_ENDPOINT.replace(
      ".storage.supabase.co/storage/v1/s3",
      ".supabase.co/storage/v1/object/public",
    );

    let redirectUrl = "";

    switch (type) {
      case "thumbnail":
        //  use public CDN gateway
        redirectUrl = `${publicCdnBase}/${process.env.SUPABASE_BUCKET_NAME}/${videoId}/thumbnail.jpg`;
        break;

      case "audio":
        if (!video.extractedAudio) {
          return res.status(400).json({
            status: "error",
            message: "Audio has not been extracted yet.",
          });
        }
        // use public CDN gateway
        redirectUrl = `${publicCdnBase}/${process.env.SUPABASE_BUCKET_NAME}/${videoId}/audio.aac`;
        break;

      case "resize":
        const dimensions = req.query.dimensions;
        const resizeInfo = video.resizes.get(dimensions);

        if (!resizeInfo) {
          return res.status(404).json({
            status: "error",
            message: "This resize layout does not exist.",
          });
        }
        if (resizeInfo.processing) {
          return res.status(202).json({
            status: "processing",
            message: "Video variant is still being transcoded.",
          });
        }

        // use public CDN gateway
        redirectUrl = `${publicCdnBase}/${process.env.SUPABASE_BUCKET_NAME}/${videoId}/${dimensions}.${video.extension}`;
        break;

      case "original":
        redirectUrl = video.videoUrl;
        break;

      default:
        return res.status(400).json({
          status: "error",
          message: "Invalid asset request type.",
        });
    }

    // Directs the frontend or Postman to stream the file straight out of Supabase
    return res.redirect(302, redirectUrl);
  } catch (error) {
    return handleErr(error);
  }
};
