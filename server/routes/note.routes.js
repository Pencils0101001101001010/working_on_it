import express from "express";
import {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getNotes).post(createNote);

router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

export default router;
