const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const { JSDOM } = require("jsdom");
const { getOAuthClient, createGoogleDoc } = require("../utils/googleDrive");

router.post("/save-to-drive", async (req, res) => {
  try {
    const user = req.session?.passport?.user;
    if (!user || !user.tokens) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { fileName, content } = req.body;
    const auth = getOAuthClient(user.tokens);
    const link = await createGoogleDoc(auth, fileName, content);

    res.status(200).json({ message: "Document created", link });
  } catch (err) {
    res.status(500).json({ message: "Failed to save to Google Drive" });
  }
});

router.get("/letters", async (req, res) => {
  try {
    const user = req.session?.passport?.user;

    if (!user || !user.tokens) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const auth = getOAuthClient(user.tokens);

    const drive = google.drive({ version: "v3", auth });

    const folderName = "Letters";

    // Step 1: Find folder by name
    const folderResponse = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: "files(id, name)",
    });

    if (folderResponse.data.files.length === 0) {
      return res.status(404).json({ message: "Letters folder not found" });
    }

    const folderId = folderResponse.data.files[0].id;

    // Step 2: List all Google Docs inside that folder
    const docsResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
      fields: "files(id, name, createdTime, modifiedTime, webViewLink)",
    });


    return res.status(200).json({
      documents: docsResponse.data.files,
    });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
