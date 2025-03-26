// utils/googleDrive.js
const { google } = require("googleapis");
const { JSDOM } = require("jsdom");

function getOAuthClient(tokens) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function createGoogleDoc(auth, htmlContent) {
  const docs = google.docs({ version: "v1", auth });
  const drive = google.drive({ version: "v3", auth });

  const folderName = "Letters";
  let folderId;

  // 1. Check if the folder already exists
  const folderList = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    fields: "files(id, name)",
  });

  if (folderList.data.files.length > 0) {
    // Folder exists, use its ID
    folderId = folderList.data.files[0].id;
  } else {
    // Folder does not exist, create one
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    folderId = folder.data.id;
  }

  // 2. Create an empty Google Doc
  const doc = await docs.documents.create({
    requestBody: {
      title: "Letter from MERN App",
    },
  });

  const documentId = doc.data.documentId;

  // 3. Move doc to the folder
  await drive.files.update({
    fileId: documentId,
    addParents: folderId,
    removeParents: "", // Removes from root
    fields: "id, parents",
  });

  // 4. Convert HTML to Docs content (your existing logic)
  let requests = [];
  let index = 1;

  const dom = new JSDOM(`<body>${htmlContent}</body>`);
  const body = dom.window.document.body;

  const walkNodes = (node) => {
    if (node.nodeType === 3) {
      const text = node.textContent || "";
      if (text.trim()) {
        requests.push({
          insertText: {
            location: { index },
            text,
          },
        });
        index += text.length;
      }
    } else if (node.nodeType === 1) {
      const startIndex = index;

      for (const child of node.childNodes) {
        walkNodes(child);
      }

      const endIndex = index;

      let textStyle = {};
      if (["B", "STRONG"].includes(node.tagName)) {
        textStyle.bold = true;
      }
      if (["I", "EM"].includes(node.tagName)) {
        textStyle.italic = true;
      }
      if (["H1"].includes(node.tagName)) {
        textStyle.bold = true;
        textStyle.fontSize = { magnitude: 24, unit: "PT" };
      }

      if (Object.keys(textStyle).length > 0 && endIndex > startIndex) {
        requests.push({
          updateTextStyle: {
            range: { startIndex, endIndex },
            textStyle,
            fields: Object.keys(textStyle).join(","),
          },
        });
      }
    }
  };

  for (const child of body.childNodes) {
    walkNodes(child);
    requests.push({
      insertText: {
        location: { index },
        text: "\n",
      },
    });
    index += 1;
  }

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests,
    },
  });

  await drive.permissions.create({
    fileId: documentId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  const file = await drive.files.get({
    fileId: documentId,
    fields: "webViewLink",
  });

  return file.data.webViewLink;
}

module.exports = {
  getOAuthClient,
  createGoogleDoc,
};
