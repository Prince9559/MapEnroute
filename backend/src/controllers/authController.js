const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }
    const user = await User.create({ name, email, password });
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          token: generateToken(user._id)
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile & avatar photo (with cleanup)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.file) {
      // 1. Purani image delete karein agar already exist karti hai
      if (user.avatarUrl && user.avatarUrl.includes('cloudinary.com')) {
        try {
          const parts = user.avatarUrl.split('/');
          const filename = parts[parts.length - 1]; // e.g. i3lorkmz9d98ktsocyif.jpg
          const publicIdWithoutExt = filename.split('.')[0];
          const folder = parts[parts.length - 2];   // mapenroute_avatars
          const oldPublicId = `${folder}/${publicIdWithoutExt}`;

          await cloudinary.uploader.destroy(oldPublicId);
        } catch (cleanupError) {
          console.error('Failed to remove old avatar:', cleanupError.message);
        }
      }

      // 2. Nayi image upload karein
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'mapenroute_avatars',
              transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
      };

      const result = await uploadToCloudinary();
      user.avatarUrl = result.secure_url;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};