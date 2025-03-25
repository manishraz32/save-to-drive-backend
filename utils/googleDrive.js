// utils/googleDrive.js
const { google } = require('googleapis')

function getOAuthClient(tokens) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  )
  oAuth2Client.setCredentials(tokens)
  return oAuth2Client
}

async function createGoogleDoc(auth, content) {
  const docs = google.docs({ version: 'v1', auth })
  const drive = google.drive({ version: 'v3', auth })

  // Step 1: Create an empty doc
  const doc = await docs.documents.create({
    requestBody: {
      title: 'Letter from MERN App'
    }
  })

  const documentId = doc.data.documentId

  // Step 2: Insert content into the doc
  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    }
  })

  // Step 3: Get shareable link
  await drive.permissions.create({
    fileId: documentId,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  })

  const file = await drive.files.get({
    fileId: documentId,
    fields: 'webViewLink'
  })

  return file.data.webViewLink
}

module.exports = {
  getOAuthClient,
  createGoogleDoc
}
