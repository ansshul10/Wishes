const mongoose = require('mongoose');

const guestbookSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const birthdaySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  message: { type: String, default: '' },
  theme: { type: String, default: 'default' },
  guestbook: [guestbookSchema],
});

module.exports = mongoose.model('Birthday', birthdaySchema);