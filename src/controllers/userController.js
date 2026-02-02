const User = require("../models/User");

exports.getAllClients = async (req, res) => {
    try {
    const clients = await User.find({ role: 'CLIENT' }).select("-password");
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ success: true, message: `User is now ${user.isActive ? 'Active' : 'Deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};