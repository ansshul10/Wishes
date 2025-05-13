const express = require('express');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// Handle contact form submission
router.post('/', async (req, res) => {
  const { email, message } = req.body;
  try {
    if (!email || !message) {
      return res.status(400).json({ message: 'Email and message are required' });
    }

    // Send email notification to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${email}`,
      text: `Message: ${message}\nFrom: ${email}`,
    });

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error handling contact form:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;