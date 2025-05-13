import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-gray-300 mb-4">
          Have questions or feedback? Reach out to us at{' '}
          <a href="mailto:support@birthdayapp.com" className="text-blue-400">
            support@birthdayapp.com
          </a>.
        </p>
        <Link to="/" className="text-blue-400">Back to Home</Link>
      </div>
    </div>
  );
};

export default Contact;