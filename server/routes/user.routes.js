import express from "express";
import auth from "../middleware/auth.middleware.js";
import { getUser, getAllUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", auth, getUser);

router.get("/all", auth, getAllUsers);

export default router;
