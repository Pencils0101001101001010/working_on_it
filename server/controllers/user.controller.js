// @ts-nocheck
import User from "../models/Users.js";

export const getUser = async (req, res) => {
  //req.user is requested safely by auth middleware
  const currentUserId = req.user.userId;

  // get user data excluding the password by using select("minus password") you can also choose to only select certain fields by using select("username email age")
  const user = await User.findById(currentUserId).select("-password");

  res.json(user);
};

export const getAllUsers = async (req, res) => {
  //only select non sensitive data to return
  // mongoose will pull only this specific fields mentioned in the select()
  const users = await User.find().select(
    "username email role fisrtName lastName age",
  );

  res.json(users);
};

export const updateUser = async (req, res) => {
  const currentUserId = req.user.userId;
  try {
    // console.log("req body: ", req.body);
    // console.log("req userID: ", currentUserId);

    const user = await User.findByIdAndUpdate(
      { _id: currentUserId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
  }
};

export const deleteUser = () => {};
