const router = require("express").Router();

const auth = require("../middleware/auth.middleware.js");

const { getUser, getAllUsers } = require("../controllers/user.controller.js");

router.get("/", auth, getUser);

router.get("/all", auth, getAllUsers);

module.exports = router;
