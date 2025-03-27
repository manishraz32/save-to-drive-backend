# Backend - Save To Drive

This is the backend server for **Save To Drive**, built with **Node.js**, **Express**.
It provides REST APIs to support the frontend and handle business logic and google authentication.

---

## ⚙️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: Session / OAuth
---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/manishraz32/save-to-drive-backend.git
cd save-to-drive-backend
```

### 2. Install dependencies
```bash
yarn install
# or
npm install
```

### 3. Set up Environment Variables
Create a .env file in the root with the following:
```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL=""
SESSION_SECRET=""
CLIENT_URL=""
```
### 4. Run the server
```bash
yarn dev
# or
npm run dev
```

Once started, the backend will be running at:

👉 http://localhost:5000



