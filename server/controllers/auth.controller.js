// @ts-nocheck
const User = require("../models/Users.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//configure cookies

const cookieOptions = {
  httpOnly: true, //prevent client-side scripts from reading token
  secure: process.env.NODE_ENV === "production", //use HTTPS in production
  sameSite: "strict", //Protects againts CSRF attacks
  maxAge: 24 * 60 * 60 * 1000, //24 hours life
  path: "/",
};

const signup = async (req, res) => {
  try {
    //grab the field submited
    const { username, email, password, firstName, lastName, age } = req.body;

    //compare the data submitted to the data in data base
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hass password
    const hashPassword = await bcrypt.hash(password, 10);

    //Send new data to database
    const user = await User.create({
      username,
      email,
      password: hashPassword,
      firstName,
      lastName,
      age,
    });

    //create a token
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

    //set token inside HTTP-Only cookie
    res.cookie("authToken", token, cookieOptions);

    res.status(201).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const login = async (req, res) => {
  try {
    //Get user from request
    const { username, password } = req.body;

    // find the user in the database
    const user = await User.findOne({
      username,
    });

    //incorrect details
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    //compare the password in request to the one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    // if incorrect return message
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    //create token if everything passes

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    //Remove password before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // Set token inside HTTP-Only cookie
    res.cookie("authToken", token, cookieOptions);

    //return user and token if all is a isMatch
    res.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const logout = async (req, res) => {
  try {
    //Clear cookie by overwriting it and exporong it immediatly
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({ message: "Logged out!" });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { signup, login, logout };
