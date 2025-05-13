import React from 'react';

const BirthdayTimeline = ({ name }) => (
  <div className="mt-8 p-4 bg-black bg-opacity-80 rounded-lg">
    <h3 className="text-xl font-bold text-white">{name}'s Birthday Timeline</h3>
    <p className="text-gray-300">Timeline events will be displayed here.</p>
  </div>
);

export default BirthdayTimeline;