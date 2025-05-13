import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Guestbook = ({ birthdayName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch guestbook messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/birthday/guestbook?name=${birthdayName}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching guestbook messages:', error);
      }
    };
    fetchMessages();
  }, [birthdayName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/birthday/guestbook`, {
          name: birthdayName,
          text: newMessage,
        });
        setMessages(response.data);
        setNewMessage('');
      } catch (error) {
        console.error('Error posting guestbook message:', error);
      }
    }
  };

  return (
    <div className="mt-12 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-white mb-4">Guestbook for {birthdayName}</h3>
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Leave a birthday message..."
          className="w-full p-3 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:border-blue-500"
          rows="4"
          aria-label="Guestbook message"
        />
        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          aria-label="Submit guestbook message"
        >
          Post Message
        </button>
      </form>
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700 p-4 rounded-lg"
          >
            <p className="text-white">{msg.text}</p>
            <p className="text-sm text-gray-400">
              {new Date(msg.timestamp).toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Guestbook;