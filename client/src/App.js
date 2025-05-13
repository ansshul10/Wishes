import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Celebration from './components/Celebration';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Contact from './components/Contact';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-black text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/celebration/:name" element={<Celebration />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;