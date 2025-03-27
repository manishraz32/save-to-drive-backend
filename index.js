const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("dotenv").config();
require("./auth/google");
const MemoryStore = require("memorystore")(session);
const driveRoutes = require("./routes/drive");
const authRoutes = require("./routes/auth");

const app = express();

// CORS for React app
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new MemoryStore({
      checkPeriod: 86400000, 
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(express.json());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api", driveRoutes);

app.get("/", (req, res) => {
  res.json({ message: "server is up" });
});
app.get("/profile", (req, res) => {
  console.log("req", req);
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
