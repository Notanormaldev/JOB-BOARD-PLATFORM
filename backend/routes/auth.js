const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_123', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (candidate or employer)
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role, companyName, companyWebsite, companyBio, title, skills, bio } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userObj = {
      name,
      email,
      password: hashedPassword,
      role: role || 'candidate',
    };

    if (role === 'employer') {
      userObj.employerProfile = {
        companyName: companyName || '',
        companyWebsite: companyWebsite || '',
        companyBio: companyBio || '',
      };
    } else if (role === 'candidate') {
      userObj.candidateProfile = {
        title: title || '',
        skills: skills ? skills.split(',').map(s => s.trim()) : [],
        bio: bio || '',
      };
    }

    const user = await User.create(userObj);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: signToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: signToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    if (user.role === 'candidate') {
      const skillsArr = Array.isArray(req.body.skills) 
        ? req.body.skills 
        : (req.body.skills ? req.body.skills.split(',').map(s => s.trim()) : user.candidateProfile.skills);

      user.candidateProfile = {
        title: req.body.title !== undefined ? req.body.title : user.candidateProfile.title,
        skills: skillsArr,
        bio: req.body.bio !== undefined ? req.body.bio : user.candidateProfile.bio,
        resumeUrl: req.body.resumeUrl !== undefined ? req.body.resumeUrl : user.candidateProfile.resumeUrl,
      };
    } else if (user.role === 'employer') {
      user.employerProfile = {
        companyName: req.body.companyName !== undefined ? req.body.companyName : user.employerProfile.companyName,
        companyWebsite: req.body.companyWebsite !== undefined ? req.body.companyWebsite : user.employerProfile.companyWebsite,
        companyBio: req.body.companyBio !== undefined ? req.body.companyBio : user.employerProfile.companyBio,
      };
    }

    const updatedUser = await user.save();
    // Return sanitized user without password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
