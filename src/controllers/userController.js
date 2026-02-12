const User = require("../models/User");
const Leads = require("../models/Leads");
const Target = require("../models/Target");

exports.getAllClients = async (req, res) => {
  try {
    const clients = await User.find({ role: "CLIENT" }).select("-password");
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Cascade delete: Remove all data linked to this user first
    await Leads.deleteMany({ client: clientId });
    await Target.deleteMany({ client: clientId });

    // Finally delete the user
    const deletedUser = await User.findByIdAndDelete(clientId);
    
    if (!deletedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
        success: true,
        message: "Client and all associated data deleted",
      });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();
    res
      .status(200)
      .json({
        success: true,
        message: `User is now ${user.isActive ? "Active" : "Deactivated"}`,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    await Leads.deleteMany({ client: clientId });

    await Target.deleteMany({ client: clientId });

    await User.findByIdAndDelete(clientId);

    res
      .status(200)
      .json({
        success: true,
        message: "Client and all associated data deleted",
      });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
