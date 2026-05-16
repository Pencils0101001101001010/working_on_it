const User = require("../models/Users.js");

const getUser = async (req, res) => {
  const user = await User.findById(req.user.userId);

  res.json(user);
};

const getAllUsers = async (req, res) => {
  const users = await User.find();

  res.json(users);
};

module.exports = {
  getUser,
  getAllUsers,
};
