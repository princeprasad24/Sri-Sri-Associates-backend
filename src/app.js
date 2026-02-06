const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRouth');
const leadRoutes = require('./routes/leadRouths');
const protectedRoutes = require('./routes/protected');
const targetRoutes = require('./routes/targetRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1. Updated CORS for Production
// This allows your Vercel frontend to make requests to Render
app.use(cors({
  origin: ["https://sri-sri-associates.vercel.app", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());

// 2. API Routes
app.use('/api/auth', authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/users", userRoutes);

// Note: app.use('/uploads') is removed because we now use Cloudinary URLs!

app.get('/', (req, res) => {
    res.send("SRI SRI ASSOCIATES API IS RUNNING");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

module.exports = app;