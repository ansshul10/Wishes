import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-3xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="mb-4">The page you are looking for does not exist.</p>
      <Link to="/" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;