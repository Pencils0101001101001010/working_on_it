// @ts-nocheck
import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Configure cookies for production across domains vs local development
const cookieOptions = {
  httpOnly: true, // Prevent client-side scripts from reading token
  secure: true, // MUST be true in production to support sameSite: "none"
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-domain compatibility for Vercel
  maxAge: 24 * 60 * 60 * 1000, // 24 hours lifetime
  path: "/",
};

export const signup = async (req, res) => {
  try {
    // Grab the fields submitted
    const { username, email, password, firstName, lastName, age } = req.body;

    // Compare the data submitted to the data in database
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Send new data to database
    const user = await User.create({
      username,
      email,
      password: hashPassword,
      firstName,
      lastName,
      age,
    });

    // Create a token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // Set token inside cookie (fallback mechanism)
    res.cookie("authToken", token, cookieOptions);

    // Return user AND token string so frontend AuthContext can save it to localStorage
    return res.status(201).json({
      user: userWithoutPassword,
      token: token,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  try {
    // Get user from request
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({
      username,
    });

    // Incorrect details
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    // Compare the password in request to the one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    // If incorrect return message
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    // Create token if everything passes
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    // Remove password before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // Set token inside cookie (fallback mechanism)
    res.cookie("authToken", token, cookieOptions);

    // Return user AND token string so frontend AuthContext can save it to localStorage
    return res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token: token,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const logout = async (req, res) => {
  try {
    // Clear cookie by overwriting it and expiring it immediately
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out!" });
  } catch (error) {
    return res.status(500).json(error);
  }
};
