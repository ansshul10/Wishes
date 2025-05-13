const express = require('express');
const Birthday = require('../models/Birthday');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// Get birthday by name
router.get('/', async (req, res) => {
  const { name } = req.query;
  try {
    const birthday = await Birthday.findOne({ name });
    if (!birthday) {
      return res.status(404).json({ message: 'Birthday not found' });
    }
    res.json(birthday);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Autocomplete search for names
router.get('/autocomplete', async (req, res) => {
  const { name } = req.query;
  try {
    if (!name || name.length < 3) {
      return res.json([]);
    }
    const birthdays = await Birthday.find({
      name: { $regex: `^${name}`, $options: 'i' },
    }).limit(5);
    res.json(birthdays.map((b) => b.name));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new birthday
router.post('/add', async (req, res) => {
  const { name, date, email, message, theme } = req.body;
  try {
    let birthday = await Birthday.findOne({ name });
    if (birthday) {
      return res.status(400).json({ message: 'Birthday already exists' });
    }

    birthday = new Birthday({
      name,
      date: new Date(date),
      email,
      message,
      theme,
    });

    await birthday.save();

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Welcome to Happy Birthday Wisher! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #1A1A1A, #000000); color: #ffffff; border-radius: 10px;">
          <h1 style="text-align: center; color: #FFD700;">Welcome, ${name}!</h1>
          <p style="font-size: 16px; line-height: 1.5; text-align: center;">
            You have successfully subscribed to <strong>Happy Birthday Wisher</strong>! 🎂
            Your special day on <strong>${new Date(date).toLocaleDateString()}</strong> will be celebrated with love and joy on our website.
          </p>
          <p style="font-size: 16px; line-height: 1.5; text-align: center;">
            Get ready for a magical birthday experience filled with heartfelt wishes and surprises! 🎈
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.REACT_APP_API_URL || 'http://localhost:3000'}" style="background-color: #2563EB; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Visit Our Website
            </a>
          </div>
          <p style="font-size: 14px; color: #A1A1AA; text-align: center; margin-top: 20px;">
            © ${new Date().getFullYear()} Happy Birthday Wisher. All rights reserved.
          </p>
        </div>
      `,
    });

    res.json(birthday);
  } catch (error) {
    console.error('Error adding birthday:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming birthdays
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const birthdays = await Birthday.find().sort({ date: 1 });

    // Filter and sort birthdays by their next occurrence
    const sortedBirthdays = birthdays
      .map((birthday) => {
        const bday = new Date(birthday.date);
        bday.setFullYear(today.getFullYear());
        if (bday < today) bday.setFullYear(today.getFullYear() + 1);
        return { ...birthday._doc, nextOccurrence: bday };
      })
      .filter((birthday) => birthday.nextOccurrence >= today)
      .sort((a, b) => a.nextOccurrence - b.nextOccurrence)
      .map(({ nextOccurrence, ...birthday }) => birthday);

    res.json(sortedBirthdays);
  } catch (error) {
    console.error('Error fetching upcoming birthdays:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post guestbook message
router.post('/guestbook', async (req, res) => {
  const { name, text } = req.body;
  try {
    const birthday = await Birthday.findOne({ name });
    if (!birthday) {
      return res.status(404).json({ message: 'Birthday not found' });
    }

    birthday.guestbook.push({ text, timestamp: new Date() });
    await birthday.save();

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Guestbook Message for ${name}`,
      text: `A new guestbook message was posted for ${name}: "${text}"`,
    });

    res.json(birthday.guestbook);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get guestbook messages
router.get('/guestbook', async (req, res) => {
  const { name } = req.query;
  try {
    const birthday = await Birthday.findOne({ name });
    if (!birthday) {
      return res.status(404).json({ message: 'Birthday not found' });
    }
    res.json(birthday.guestbook);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;