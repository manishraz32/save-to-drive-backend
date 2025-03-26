const router = require("express").Router();
const passport = require("passport");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/documents.readonly",
    ],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.CLIENT_URL}/editor`,
    failureRedirect: `${process.env.CLIENT_URL}/`,
  })
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logged out");
  });
});

module.exports = router;
