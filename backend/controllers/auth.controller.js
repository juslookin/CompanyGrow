const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const SECRET = process.env.JWT_SECRET || 'companygrow_secret_key';

// Login Controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    const token = jwt.sign({ _id: user._id, role: user.role }, SECRET, {
      expiresIn: '1h'
    });

    res.json({
      token,
      _id: user._id,
      role: user.role
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
};

// Logout Controller
const logoutUser = async (req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).send('Server error');
  }
};

module.exports = { loginUser, logoutUser };