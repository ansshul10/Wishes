import React from 'react';

const GreetingCard = ({ name, message }) => (
  <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
    <h3 className="text-2xl font-bold">Happy Birthday, {name}!</h3>
    <p className="mt-2">{message}</p>
  </div>
);

export default GreetingCard;