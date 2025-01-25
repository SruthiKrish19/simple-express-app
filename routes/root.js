const express = require("express");
const router = express.Router();

router.get("/hello-world", (req, res) => {
  res.send("Hello World");
});

// Route Handlers
router.get(
  "/route-handler",
  (req, res, next) => {
    console.log("this is a route handler");
    next();
  },
  (req, res) => {
    res.send("Route Handler");
  }
);

// Chaining Route Handlers
const one = (req, res, next) => {
  console.log("Route chain one");
  next();
};

const two = (req, res, next) => {
  console.log("Route chain two");
  res.send("Route Chain");
};

router.get("/route-chain", [one, two]);

module.exports = router;
