import React from 'react';
import { motion } from 'framer-motion';

// Simple hash function for consistent randomization
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const BirthdayWish = ({ name }) => {
  const wishes = [
    `Happy Birthday, ${name}! May your day be filled with joy and laughter!`,
    `Wishing you a fantastic year ahead, ${name}! Celebrate big!`,
    `Cheers to you on your special day, ${name}! Let's make it unforgettable!`,
    `Happy Birthday, ${name}! May all your dreams come true!`,
    `To ${name}, may your birthday sparkle with love and happiness!`,
    `Happy Birthday, ${name}! Here's to new adventures and endless smiles!`,
    `Wishing you a day full of surprises, ${name}! You deserve it!`,
    `Happy Birthday, ${name}! May your heart be filled with warmth today!`,
    `To ${name}, may your special day be as amazing as you are!`,
    `Happy Birthday, ${name}! Let’s toast to your incredible journey!`,
    `Wishing you boundless joy on your birthday, ${name}! Shine bright!`,
    `Happy Birthday, ${name}! May every moment today feel magical!`,
  ];

  const funFacts = [
    'Did you know? The oldest known birthday celebration dates back to ancient Egypt!',
    'Fun fact: The song "Happy Birthday" was first published in 1893!',
    'Quote of the day: "Age is merely the number of years the world has been enjoying you!"',
    'Did you know? In some cultures, birthdays are celebrated with noodles for long life!',
    'Motivation: "Your birthday is the start of a new chapter—make it epic!"',
    'Fun fact: The most common birthday in the world is September 9!',
    'Quote: "Count your age by friends, not years. Count your life by smiles!"',
    'Did you know? Birthday cakes became popular in Germany during the Middle Ages!',
    'Inspiration: "Today is your day to shine brighter than ever!"',
    'Fun fact: In Mexico, piñatas are a classic birthday tradition!',
    'Quote: "A birthday is a new beginning—embrace it with joy!"',
    'Did you know? The tradition of blowing out candles started in ancient Greece!',
  ];

  // Select wish and fact based on name and date for variety
  const wishIndex = simpleHash(name) % wishes.length;
  const factIndex = simpleHash(name + new Date().toDateString()) % funFacts.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-black bg-opacity-80 backdrop-blur-lg border border-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-center hover:shadow-glow"
    >
      <h2 className="text-2xl font-dancing-script text-white mb-4">Birthday Wish for {name}</h2>
      <p className="text-lg text-gray-300 mb-4">{wishes[wishIndex]}</p>
      <div className="bg-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-300 italic">{funFacts[factIndex]}</p>
      </div>
    </motion.div>
  );
};

export default BirthdayWish;