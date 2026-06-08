import { spawn } from "node:child_process";

//using node_child process we create and safe a thumbnail image
const makeThumbnail = (fullPath, thumbnailPath) => {
  //ffmpeg -i video.mp4 -ss 5 -vframes 1 thumbnail.jpg
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      fullPath,
      "-ss",
      5, //we want the frame at the 5th second
      "-vframes",
      1,
      thumbnailPath,
    ]);

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        console.log("thumbnail created!");
        resolve();
      } else {
        reject(`FFmpeg exited with this code ${code}`);
      }
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
};

//gte dimensions using ffprobe and then resolving(returning it )
const getDimensions = (fullPath) => {
  // ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 original.mp4
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0",
      fullPath,
    ]);

    let dimensions = "";

    ffprobe.stdout.on("data", (data) => {
      dimensions += data.toString("utf8");
    });

    ffprobe.on("close", (code) => {
      if (code === 0) {
        console.log("dimensions collected");
        //alternatively to remove white spaces : dimensions.replace(/\s/g, "")
        const response = dimensions.trim().split(",");
        const width = Number(response[0]);
        const height = Number(response[1]);
        // console.log("width:  ", width);
        // console.log("height:  ", height);
        resolve({
          width,
          height,
        });
      } else {
        reject(`FFprobe exited with this code ${code}`);
      }
    });

    // Handle unexpected system/spawn errors
    ffprobe.on("error", (error) => {
      reject(error);
    });
  });
};

//ffmpeg -i original.mp4 -vn -c:a copy audio.aac
const extractAudio = (originalVideoPath, targetAudioPath) => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      originalVideoPath,
      "-vn", // don't do any processing on video
      "-c:a",
      "copy",
      targetAudioPath,
    ]);

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        console.log("audio extracted");
        resolve();
      } else {
        reject(`FFmpeg exited with this code ${code}`);
      }
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
};

//ffmpeg -i original.mp4 -vf scale=320:240 -c:a copy  video-320x240.mp4
const resize = (originalVideoPath, targetVideoPath, width, height) => {
  return new Promise((resolve, reject) => {
    // to know about more process allocation and priority processing there is stuff like the nice command that scales priority on a scale of -20 - 19
    // with using the command ps you can see the nice value v
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      originalVideoPath,
      "-vf",
      `scale=${width}:${height}`,
      "-c:a",
      "copy",
      "-threads", // this
      "2", // and this tells ffmpeg to only use 2 cores
      "-y",
      targetVideoPath,
    ]);

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        console.log("Video resized");
        resolve();
      } else {
        reject(`FFmpeg exited with this code ${code}`);
      }
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
};
export default { makeThumbnail, getDimensions, extractAudio, resize };
