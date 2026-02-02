const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const generateToken = (user) => {
  return  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};


router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    
    res.status(500).json({ message: "Server Error"  , error: error.message});
  }
});



router.post("/login" , async (req, res) =>{
    try {
        const {email , password} = req.body;
        const user = await User.findOne({email});

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({message: "Invalid email or password"});
        }

        if(!user.isActive){
            return res.status(403).json({message: "User account is deactivated"});
        }


        res.json({
            message: "Login successful",
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
            }
        })
    } catch (error) {
        res.status(500).json({message: "Server Error"  , error: error.message});
    }
})



module.exports = router;