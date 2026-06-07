import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import noteRoutes from "./routes/note.routes.js";
// import editRoutes from "./routes/image.edit.route.js";
// import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // NO wildcards (*) allowed when using credentials
    credentials: true, // Crucial: Allows cookies to travel over cross-origin headers
  }),
);

// This adds secure HTTP headers to prevent XSS and clickjacking
// app.use(helmet());

// sanitizes user input to completely prevent NoSQL injection attempts
// app.use(mongoSanitize());

app.use(express.json());

app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/logout", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/edit", editRoutes);

//handle all errors
app.use((error, req, res, next) => {
  if (error && error.status) {
    res.status(error.status).json({ error: error.message });
  } else {
    console.log(error);
    res.status(500).json({
      error: "Sorry, something happened on our side.",
    });
  }
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database Connected!");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on ${process.env.PORT}`);
    });
  })
  .catch(console.error);
