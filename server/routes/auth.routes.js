const router = require("express").Router();

const { signup, login } = require("../controllers/auth.controller.js");

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
