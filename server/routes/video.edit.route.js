import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  getVideo,
  uploadVideo,
  getVideoAsset,
  extractAudio,
  resizeVideo,
} from "../controllers/video.edit.controller.js";

const router = express.Router();

router.get("/", auth, getVideo).post("/", auth, uploadVideo);

router.patch("/extract-audio", auth, extractAudio);

router.put("/resize", resizeVideo);

router.get("/get-video-asset", getVideoAsset);

export default router;
