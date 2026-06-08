import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import Video from "../models/videos.js";
import FF from "./FF.js";
import util from "./util.js";

class JobQueue {
  constructor() {
    this.jobs = [];
    this.currentJob = null;

    // Trigger the automated system recovery line asynchronously
    this.resumeUnfinishedJobs();
  }

  //   MongoDB-compatible system crash recovery line
  async resumeUnfinishedJobs() {
    try {
      // Find all videos that have at least one resize variant stuck in "processing: true"
      const videosWithPendingJobs = await Video.find({
        resizes: { $exists: true },
      });

      for (const video of videosWithPendingJobs) {
        // Read through Mongoose Map keys cleanly
        for (const [key, value] of video.resizes.entries()) {
          if (value.processing) {
            const [width, height] = key.split("x");
            console.log(
              `[Queue Recovery] Resuming interrupted resize job: ${width}x${height} for video ${video.videoId}`,
            );

            this.enqueue({
              type: "resize",
              videoId: video.videoId,
              width: Number(width),
              height: Number(height),
            });
          }
        }
      }
    } catch (error) {
      console.error(
        "Failed to recover unfinished jobs from MongoDB:",
        error.message,
      );
    }
  }

  enqueue(job) {
    this.jobs.push(job);
    this.executeNext();
  }

  dequeue() {
    return this.jobs.shift();
  }

  executeNext() {
    if (this.currentJob) return;
    this.currentJob = this.dequeue();
    if (!this.currentJob) return;
    this.execute(this.currentJob);
  }

  async execute(job) {
    if (job.type === "resize") {
      const { videoId, width, height } = job;
      const resolutionKey = `${width}x${height}`;

      // Define unique, isolated server paths for this specific background job workspace
      const tempDir = `./storage/temp-resize-${videoId}-${resolutionKey}`;

      try {
        // 1. Grab fresh video document profile parameters out of MongoDB
        const video = await Video.findOne({ videoId });
        if (!video) throw new Error("Video database record missing.");

        await fs.mkdir(tempDir, { recursive: true });
        const localOriginalPath = `${tempDir}/original.${video.extension}`;
        const localResizedPath = `${tempDir}/${resolutionKey}.${video.extension}`;

        // 2. Download the original clip from the public Supabase CDN link
        const response = await fetch(video.videoUrl, { redirect: "follow" });
        if (!response.ok)
          throw new Error(
            `CDN download failed with HTTP code ${response.status}`,
          );
        if (!response.body) throw new Error("Video payload stream empty.");

        await pipeline(response.body, createWriteStream(localOriginalPath));

        // 3. Execute FFmpeg transformations safely on the temporary local server file
        await FF.resize(localOriginalPath, localResizedPath, width, height);

        // 4. Initialize the Supabase Storage core S3 connection pipeline wrapper
        const supabaseS3 = new S3Client({
          forcePathStyle: true,
          region: process.env.SUPABASE_REGION || "eu-west-1",
          endpoint: process.env.SUPABASE_ENDPOINT,
          credentials: {
            accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
            secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
          },
        });

        // 5. Upload the newly created transcoded resolution file up to Supabase
        const cloudResizeKey = `${videoId}/${resolutionKey}.${video.extension}`;
        const cloudUpload = new Upload({
          client: supabaseS3,
          params: {
            Bucket: process.env.SUPABASE_BUCKET_NAME,
            Key: cloudResizeKey,
            Body: createReadStream(localResizedPath),
            ContentType: `video/${video.extension}`,
          },
        });
        await cloudUpload.done();

        // 6. Update the specific key layout inside MongoDB (processing: false)
        // Fetch document again to prevent overwriting mutations that happened while transcoding
        const freshVideoDoc = await Video.findOne({ videoId });
        freshVideoDoc.resizes.set(resolutionKey, { processing: false });
        await freshVideoDoc.save();

        // 7. Clear the workspace directory out of your server's disk instantly
        await util.deleteFolder(tempDir);
        console.log(
          `Done resizing! Number of jobs remaining: ${this.jobs.length}`,
        );
      } catch (error) {
        console.error(
          `Error processing background resize job for ${videoId}:`,
          error.message,
        );
        // Error Safe Cleanup: Make sure local folder gets wiped if anything crashes
        await util.deleteFolder(tempDir);
      }
    }

    this.currentJob = null;
    this.executeNext();
  }
}

export default JobQueue;
