import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import noteRoutes from "./routes/note.routes.js";
import editRoutes from "./routes/video.edit.route.js";
import connectDB from "./db.js";
import JobQueue from "./lib/JobQueue.js";

dotenv.config();
const app = express();
export const jobs = new JobQueue();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "filename"],
  }),
);

app.use(cookieParser());

app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      res
        .status(500)
        .json({ error: "Database connection failed in production" });
    }
  });
}

//handle all errors
app.use((error, req, res, next) => {
  if (error && error.status) {
    res.status(error.status).json({ error: error.message });
  } else {
    console.log(error);
    res.status(500).json(error);
  }
});

app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/logout", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/videos", editRoutes);

// CLEAN LOCAL STARTUP
if (process.env.NODE_ENV !== "production") {
  connectDB()
    .then(async () => {
      app.listen(process.env.PORT || 5050, () => {
        console.log(
          `Server running locally on port ${process.env.PORT || 5050}`,
        );
      });

      // 2. Call the recovery method safely on the shared instance
      console.log("Database connected. Recovering lost video jobs...");
      await jobs.resumeUnfinishedJobs();
    })
    .catch(console.error);
}

export default app;
