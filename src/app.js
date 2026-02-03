const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRouth');
const leadRoutes = require('./routes/leadRouths');
const protectedRoutes = require('./routes/protected');
const targetRoutes = require('./routes/targetRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express();

// app.use(cors());
app.use(cors({
  origin: "https://sri-sri-associates.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth' , authRoutes);
app.use('/uploads' , express.static(path.join(__dirname , '..' , 'uploads')));
app.use("/api/protected" , protectedRoutes);
app.use("/api/leads" , leadRoutes);
app.use("/api/targets" , targetRoutes);
app.use("/api/users", userRoutes); 

app.get('/' , (req , res) =>{
    res.send("HELLO WORLD");
});

module.exports = app;
