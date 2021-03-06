const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

//root rout
router.get("/", function(req, res) {
  res.render("landing");
});

//show register form
router.get("/register", function(req, res) {
  res.render("register", { page: "register" });
});
//handle sign up logic
router.post("/register", function(req, res) {
  const newUser = new User({ username: req.body.username });
  if (req.body.adminCode === "1234") {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render("register", { error: err.message });
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome to YelpCamp " + user.username);
      res.redirect("/campgrounds");
    });
  });
});

//show login form
router.get("/login", function(req, res) {
  res.render("login", { page: "login" });
});
//handling login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);

//logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out. See you next time!");
  res.redirect("/campgrounds");
});

module.exports = router;
