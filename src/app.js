const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRouth');
const leadRoutes = require('./routes/leadRouths');
const protectedRoutes = require('./routes/protected');
const targetRoutes = require('./routes/targetRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const downloadRoutes = require('./routes/downloadRoutes');


const app = express();

app.use(cors({
  origin: ["https://sri-sri-associates.vercel.app", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/download", downloadRoutes);


app.get('/', (req, res) => {
    res.send("SRI SRI ASSOCIATES API IS RUNNING");
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

module.exports = app;