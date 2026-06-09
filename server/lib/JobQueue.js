import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import Video from "../models/videos.js";
import FF from "./FF.js";
import util from "./util.js";

/**
 * JobQueue Class
 * Manages video processing tasks sequentially (one at a time) to prevent
 * the server's CPU and memory from crashing under heavy loads.
 */
class JobQueue {
  constructor() {
    this.jobs = []; // Array holding tasks waiting to be processed (First In, First Out).
    this.currentJob = null; // Keeps track of the task currently running.

    // Trigger the automated system recovery line asynchronously.
    // This runs in the background so it doesn't block the application from starting.
    this.resumeUnfinishedJobs();
  }

  /**
   * CRASH RECOVERY
   * If the server crashes mid-job, MongoDB still marks the video as "processing: true".
   * This method scans the database on startup to find and restart those broken jobs.
   */
  async resumeUnfinishedJobs() {
    try {
      // Find all videos that have at least one resize variant stuck in "processing: true"
      const videosWithPendingJobs = await Video.find({
        resizes: { $exists: true },
      });

      for (const video of videosWithPendingJobs) {
        // .entries() lets us loop through Mongoose Maps as [key, value] pairs.
        // Example: key = "1920x1080", value = { processing: true }
        for (const [key, value] of video.resizes.entries()) {
          if (value.processing) {
            const [width, height] = key.split("x"); // Splits "1920x1080" into ["1920", "1080"]
            console.log(
              `[Queue Recovery] Resuming interrupted resize job: ${width}x${height} for video ${video.videoId}`,
            );

            // Re-add the lost job back into the execution queue
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

  /**
   * Adds a new task to the end of the line and attempts to run it.
   */
  enqueue(job) {
    this.jobs.push(job);
    this.executeNext();
  }

  /**
   * Removes and returns the very first task in the queue array.
   */
  dequeue() {
    return this.jobs.shift();
  }

  /**
   * Orchestrates the flow. If the engine is idle, it grabs the next job.
   */
  executeNext() {
    // Safety Guard: If a job is already running, stop. Wait for it to call executeNext().
    if (this.currentJob) return;

    // Get the next job. If the queue is empty, stop.
    this.currentJob = this.dequeue();
    if (!this.currentJob) return;

    // Run the job
    this.execute(this.currentJob);
  }

  /**
   * Core execution block. Handles downloading, processing, uploading, and cleanup.
   */
  async execute(job) {
    if (job.type === "resize") {
      const { videoId, width, height } = job;
      const resolutionKey = `${width}x${height}`; // e.g., "1280x720"

      // Define unique, isolated server paths for this specific background job workspace.
      // Isolating paths ensures multiple simultaneous jobs don't overwrite each other's files.
      const tempDir = `./storage/temp-resize-${videoId}-${resolutionKey}`;

      try {
        // 1. Grab fresh video document profile parameters out of MongoDB
        const video = await Video.findOne({ videoId });
        if (!video) throw new Error("Video database record missing.");

        // Create the temporary workspace directory on the server disk if it doesn't exist
        await fs.mkdir(tempDir, { recursive: true });
        const localOriginalPath = `${tempDir}/original.${video.extension}`;
        const localResizedPath = `${tempDir}/${resolutionKey}.${video.extension}`;

        // 2. Download the original clip from the public Supabase CDN link
        // redirect: "follow" ensures we follow any asset link forwarding automatically
        const response = await fetch(video.videoUrl, { redirect: "follow" });
        if (!response.ok)
          throw new Error(
            `CDN download failed with HTTP code ${response.status}`,
          );
        if (!response.body) throw new Error("Video payload stream empty.");

        // STREAMING DATA: pipeline() pipes chunks of the internet download straight to the disk.
        // This keeps RAM usage incredibly low, even for multi-gigabyte video files.
        await pipeline(response.body, createWriteStream(localOriginalPath));

        // 3. Execute FFmpeg transformations safely on the temporary local server file
        // This hits the server CPU heavily to scale down the downloaded video file.
        await FF.resize(localOriginalPath, localResizedPath, width, height);

        // 4. Initialize the Supabase Storage core S3 connection pipeline wrapper
        // Supabase storage uses an S3-compatible API under the hood.
        const supabaseS3 = new S3Client({
          forcePathStyle: true, // Required by Supabase to properly parse the URL structure
          region: process.env.SUPABASE_REGION || "eu-west-1",
          endpoint: process.env.SUPABASE_ENDPOINT,
          credentials: {
            accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
            secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
          },
        });

        // 5. Upload the newly created transcoded resolution file up to Supabase
        const cloudResizeKey = `${videoId}/${resolutionKey}.${video.extension}`;

        // Upload (from @aws-sdk/lib-storage) automatically splits large files into
        // parallel chunks (multipart upload) for reliability and performance.
        const cloudUpload = new Upload({
          client: supabaseS3,
          params: {
            Bucket: process.env.SUPABASE_BUCKET_NAME,
            Key: cloudResizeKey,
            Body: createReadStream(localResizedPath), // Stream from disk to save RAM
            ContentType: `video/${video.extension}`, // Helps browsers play it correctly
          },
        });
        await cloudUpload.done();

        // 6. Update the specific key layout inside MongoDB (processing: false)
        // CRITICAL CONCURRENCY FIX: Fetch the document again right now.
        // If a user changed the video title *while* we were processing for 10 minutes,
        // using the old 'video' variable from Step 1 would overwrite and erase their change.
        const freshVideoDoc = await Video.findOne({ videoId });
        freshVideoDoc.resizes.set(resolutionKey, { processing: false });
        await freshVideoDoc.save();

        // 7. Clear the workspace directory out of your server's disk instantly
        // Keeps the server hard drive clean and prevents running out of disk space.
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
        // This prevents broken, half-processed video files from filling up the disk.
        await util.deleteFolder(tempDir);
      }
    }

    // Reset currentJob to null so the queue knows the engine is free to pick up work.
    this.currentJob = null;
    this.executeNext(); // Loop to the next item
  }
}

export default JobQueue;
