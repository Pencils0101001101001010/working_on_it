// @ts-nocheck
const User = require("../models/Users.js");

const getUser = async (req, res) => {
  //req.user is requested safly by auth middleware
  const currentUserId = req.user.userId;

  // get user data excluding the password by using select("minus password") you can also choose to only select certain fields by using select("username email age")
  const user = await User.findById(currentUserId).select("-password");

  res.json(user);
};

const getAllUsers = async (req, res) => {
  //only select non sensitive data to return
  // mongoose will pull only this spefic fields mentioned in the select()
  const users = await User.find().select(
    "username email role fisrtName lastName age",
  );

  res.json(users);
};

module.exports = {
  getUser,
  getAllUsers,
};
