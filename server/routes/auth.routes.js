const router = require("express").Router();

const { signup, login, logout } = require("../controllers/auth.controller.js");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
