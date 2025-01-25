const express = require("express");
const router = express.Router();

const { getAllUsers, createNewUser } = require("../controller/userController");

router.route("/").get(getAllUsers).post(createNewUser);

module.exports = router;
