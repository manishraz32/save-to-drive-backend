const router = require("express").Router();
const passport = require("passport");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.CLIENT_URL}/dashboard`,
    failureRedirect: `${process.env.CLIENT_URL}/`,
  })
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logged out");
  });
});

module.exports = router;
