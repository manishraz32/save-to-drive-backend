// routes/drive.js
const express = require("express");
const router = express.Router();
const { getOAuthClient, createGoogleDoc } = require("../utils/googleDrive");

router.post("/save-to-drive", async (req, res) => {
  try {
    const user = req.session?.passport?.user;

    console.log("user: ", user);
    if (!user || !user.tokens) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    console.log("req body: ", req.body);
    const { content } = req.body;
    const auth = getOAuthClient(user.tokens);

    const link = await createGoogleDoc(auth, content);

    res.status(200).json({ message: "Document created", link });
  } catch (err) {
    console.error("Drive error:", err);
    res.status(500).json({ message: "Failed to save to Google Drive" });
  }
});

module.exports = router;
