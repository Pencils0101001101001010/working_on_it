const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // NO wildcards (*) allowed when using credentials
    credentials: true, // Crucial: Allows cookies to travel over cross-origin headers
  }),
);

app.use(express.json());

app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/logout", authRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database Connected!");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on ${process.env.PORT}`);
    });
  })
  .catch(console.error);
