const express = require('express');
const upload = require('../middlewares/cloudinary.middleware');
const User = require('../models/user');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/upload-profile-pic/:userId', authenticateToken, upload.single('profilePic'), async (req, res) => {
  const { userId } = req.params;

  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePicUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading profile picture', error });
  }
});

module.exports = router;
