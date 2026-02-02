const express = require('express');
const {protect , authorize} = require('../lib/auth');

const router = express.Router();

router.get('/client' , protect , (req , res) => {
    res.json({message: "User " , user: req.user });
})

router.get("/admin" , protect , authorize("ADMIN") , (req , res) => {
    res.json({message: "Admin " , user: req.user });
})

module.exports = router;