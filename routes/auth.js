import { Router } from "express";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import generateJWTToken from "../services/token.service.js";

const router = Router();

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login | Express App",
    loginError: req.flash("loginError"),
  });
});

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register | Express App",
    registerError: req.flash("registerError"),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash("loginError", "All fields is required");
    res.redirect("/login");
    return;
  }

  const existUser = await User.findOne({ email });
  if (!existUser) {
    req.flash("loginError", "User not found");
    res.redirect("/login");
    return;
  }

  const isPassEqual = await bcrypt.compare(password, existUser.password);
  if (!isPassEqual) {
    req.flash("loginError", "Password wrong");
    res.redirect("/login");
    return;
  }
  const token = generateJWTToken(existUser._id);

  res.cookie("token", token, { secure: true });
  res.redirect("/");
});

router.post("/register", async (req, res) => {
  const { firstname, lastName, email, password } = req.body;

  if (!firstname || !lastName || !email || !password) {
    req.flash("registerError", "All Fields must be filled");
    res.redirect("/register");
    return;
  }

  const isExistUser = await User.findOne({ email });

  if (isExistUser) {
    req.flash("registerError", "This user is exist. Please log in");
    res.redirect("/register");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = {
    firstName: firstname,
    lastName,
    email,
    password: hashedPassword,
  };

  const user = await User.create(userData);
  const token = generateJWTToken(user._id);

  res.cookie("token", token, { secure: true });
  res.redirect("/");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

export default router;
