var express = require("express");
var router = express.Router();

const { signout, signup, signin } = require("../controllers/auth");

const { check } = require("express-validator");

router.post(
  "/signup",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("must be at least 3 chars long"),
    check("email").isEmail().withMessage("Email is Required"),
    check("password")
      .isLength({ min: 3 })
      .withMessage("password should be at least 3 char"),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email").isEmail().withMessage("Email is Required"),
    check("password")
      .isLength({ min: 3 })
      .withMessage("password field is required"),
  ],
  signin
);

router.get("/signout", signout);

module.exports = router;
