import React, { useState, useEffect, useCallback, useRef, Suspense, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import Tilt from 'react-parallax-tilt';
import { debounce } from 'lodash';
import { FaFacebook, FaTwitter, FaLinkedin, FaPaperPlane, FaSearch, FaUser, FaCalendar, FaEnvelope } from 'react-icons/fa';
import BirthdayWish from '../components/BirthdayWish';

// Birthday Countdown Component
const BirthdayCountdown = ({ date, name }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const birthday = new Date(date);
      birthday.setFullYear(now.getFullYear());
      const isBirthdayToday = now.toDateString() === birthday.toDateString();
      setIsToday(isBirthdayToday);

      if (isBirthdayToday) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        if (birthday < now) birthday.setFullYear(now.getFullYear() + 1);
        const diff = birthday - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [date]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`p-3 rounded-lg ${isToday ? 'bg-gradient-to-r from-yellow-400 to-pink-500 shadow-lg' : 'bg-black bg-opacity-80 backdrop-blur-lg border border-gray-800'}`}
    >
      {isToday ? (
        <div className="text-center">
          <h3 className="text-lg font-bold text-white">Happy Birthday, {name}! 🎉</h3>
          <p className="text-base text-white">Today is your special day! 🥳</p>
        </div>
      ) : (
        <div className="flex justify-around text-center">
          <div>
            <motion.span
              key={timeLeft.days}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl font-bold text-blue-400"
            >
              {timeLeft.days}
            </motion.span>
            <p className="text-xs text-gray-300">Days</p>
          </div>
          <div>
            <motion.span
              key={timeLeft.hours}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl font-bold text-blue-400"
            >
              {timeLeft.hours}
            </motion.span>
            <p className="text-xs text-gray-300">Hours</p>
          </div>
          <div>
            <motion.span
              key={timeLeft.minutes}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl font-bold text-blue-400"
            >
              {timeLeft.minutes}
            </motion.span>
            <p className="text-xs text-gray-300">Minutes</p>
          </div>
          <div>
            <motion.span
              key={timeLeft.seconds}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl font-bold text-blue-400"
            >
              {timeLeft.seconds}
            </motion.span>
            <p className="text-xs text-gray-300">Seconds</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Autocomplete Search Component
const AutocompleteSearch = memo(({ setUserName, handleSearch, suggestions, setSuggestions }) => {
  const [inputValue, setInputValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef();
  const listRef = useRef();

  const debouncedFetchSuggestions = useCallback(
    debounce(async (value) => {
      if (value.length > 2) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/birthday/autocomplete?name=${value}`
          );
          setSuggestions(response.data);
        } catch (error) {
          console.error('Error fetching autocomplete suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    [setSuggestions]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setUserName(value);
    debouncedFetchSuggestions(value);
    setFocusedIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setUserName(suggestion);
    setSuggestions([]);
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[focusedIndex]);
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex];
      focusedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  return (
    <div className="relative w-full max-w-sm" role="search">
      <div className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for a birthday..."
          className="w-full p-2 rounded-lg bg-gray-800 text-white border-2 border-gray-600 focus:outline-none focus:border-blue-500 transition-all"
          aria-label="Search for a birthday"
          aria-autocomplete="list"
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition"
          aria-label="Search birthday"
          disabled={!inputValue.trim()}
        >
          <FaSearch />
        </button>
      </div>
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.ul
            ref={listRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full bg-gray-800 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-10"
            role="listbox"
            aria-label="Birthday suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick(suggestion)}
                tabIndex={0}
                className={`p-2 text-white cursor-pointer hover:bg-gray-700 ${index === focusedIndex ? 'bg-gray-700' : ''}`}
                role="option"
                aria-selected={index === focusedIndex}
              >
                {suggestion}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
});

// Birthday Quote Generator
const BirthdayQuote = () => {
  const quotes = [
    "Another year older, wiser, and even more fabulous!",
    "May your birthday be the start of a wonderful new chapter.",
    "Age is just a number, but yours is huge! Happy Birthday!",
    "Wishing you endless joy and cake on your special day!",
    "Here’s to a day full of love, laughter, and celebration!",
    "Cheers to a birthday filled with dreams come true!",
    "May your special day sparkle as bright as you do!",
  ];
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  };

  return (
    <div className="text-center max-w-md mx-auto mt-6">
      <p className="text-lg italic text-gray-300">"{currentQuote}"</p>
      <button
        onClick={getRandomQuote}
        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
        aria-label="Generate new quote"
      >
        New Quote
      </button>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-500">
          Something went wrong: {this.state.error?.message || 'Unknown error'}. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

// Main Home Component
const Home = () => {
  const [userName, setUserName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [formData, setFormData] = useState({ name: '', dob: '', email: '' });
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  // Fetch all birthdays
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/birthday/upcoming`);
        setBirthdays(response.data);
      } catch (error) {
        console.error('Error fetching birthdays:', error);
        setError('Failed to load birthdays. Please try again.');
      }
    };
    fetchBirthdays();
  }, []);

  // Filter and sort birthdays
  const today = new Date();
  const todaysBirthdays = birthdays.filter((birthday) => {
    const bday = new Date(birthday.date);
    return bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate();
  });

  const upcomingBirthdays = birthdays
    .filter((birthday) => {
      const bday = new Date(birthday.date);
      return !(bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate());
    })
    .sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      aDate.setFullYear(today.getFullYear());
      bDate.setFullYear(today.getFullYear());
      if (aDate < today) aDate.setFullYear(today.getFullYear() + 1);
      if (bDate < today) bDate.setFullYear(today.getFullYear() + 1);
      return aDate - bDate;
    });

  // Handle Search
  const handleSearch = useCallback(async () => {
    if (!userName.trim()) {
      setError('Please enter a name to search.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/birthday?name=${userName}`
      );
      navigate(`/celebration/${response.data.name}`);
    } catch (error) {
      console.error('Error fetching birthday:', error);
      setError('Birthday not found. Please try another name.');
    } finally {
      setIsLoading(false);
      setShowSearch(false);
    }
  }, [userName, navigate]);

  // Handle Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a valid name.');
      return;
    }
    if (!formData.dob) {
      setError('Please select a date of birth.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const dob = new Date(formData.dob);
    const now = new Date();
    if (isNaN(dob) || dob >= now) {
      setError('Please select a valid past date of birth.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/birthday/add`, {
        name: formData.name,
        date: formData.dob,
        email: formData.email,
        message: '',
        theme: 'default',
      });
      setBirthdays([...birthdays, response.data]);
      setFormData({ name: '', dob: '', email: '' });
      setError('');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      navigate(`/celebration/${response.data.name}`);
    } catch (error) {
      console.error('Error adding birthday:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add birthday. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Contact Form Submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;

    if (!email || !message) {
      setError('Please fill in both email and message fields.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/contact`, {
        email,
        message,
      });
      form.reset();
      setError('');
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending contact message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // Animation Variants
  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const boxVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const inputVariants = {
    hover: { scale: 1.02, borderColor: '#3B82F6', transition: { duration: 0.3 } },
    focus: { scale: 1.05, boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' },
  };

  const buttonVariants = {
    hover: { scale: 1.1, backgroundColor: '#2563EB', transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-black text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-lg border-b border-gray-800 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white">
            Birthday Wisher 🎉
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-base text-gray-300 hover:text-blue-400 transition hidden md:block">
              Home
            </Link>
            <Link to="/contact" className="text-base text-gray-300 hover:text-blue-400 transition hidden md:block">
              Contact
            </Link>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              aria-label="Toggle search"
            >
              <FaSearch size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-lg z-40 px-4 py-4"
          >
            <div className="max-w-6xl mx-auto flex justify-center">
              <AutocompleteSearch
                setUserName={setUserName}
                handleSearch={handleSearch}
                suggestions={suggestions}
                setSuggestions={setSuggestions}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </motion.div>
      )}

      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-50"
        >
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-white font-bold"
            aria-label="Close error message"
          >
            ×
          </button>
        </motion.div>
      )}

      <main className="pt-16 pb-8">
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Content */}
                <div className="md:col-span-2 flex flex-col">
                  <motion.div variants={textVariants} initial="hidden" animate="visible" className="space-y-6 flex flex-col justify-center">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-left">
                      Make Every Birthday Magical! 🥳
                    </h2>
                    <p className="text-base text-gray-300 max-w-lg text-left">
                      Welcome to Birthday Wisher, your go-to platform for celebrating birthdays with personalized wishes, interactive countdowns, and heartfelt joy! Create, share, and enjoy magical birthday moments. 🎈
                    </p>
                  </motion.div>

                  {/* Today's Birthdays Box */}
                  {todaysBirthdays.length > 0 && (
                    <motion.div
                      variants={boxVariants}
                      initial="hidden"
                      animate="visible"
                      className="mt-8 bg-black bg-opacity-80 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 p-4 w-full"
                    >
                      <h3 className="text-xl font-bold text-white mb-3 text-center">Today's Birthdays 🎉</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {todaysBirthdays.map((birthday) => (
                          <Tilt
                            key={birthday._id}
                            tiltMaxAngleX={15}
                            tiltMaxAngleY={15}
                            glareEnable={true}
                            glareMaxOpacity={0.3}
                            glareColor="#ffffff"
                            glarePosition="all"
                            perspective={1000}
                            scale={1.05}
                          >
                            <Link
                              to={`/celebration/${birthday.name}`}
                              className="bg-black from-yellow-400 to-pink-500 rounded-lg p-3 cursor-pointer hover:opacity-90 transition w-full block"
                            >
                              <h4 className="text-xl font-dancing-script text-white text-center mb-2">{birthday.name}</h4>
                              <BirthdayCountdown date={birthday.date} name={birthday.name} />
                            </Link>
                          </Tilt>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Upcoming Birthdays Box */}
                  {upcomingBirthdays.length > 0 && (
                    <motion.div
                      variants={boxVariants}
                      initial="hidden"
                      animate="visible"
                      className="mt-6 bg-black bg-opacity-80 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 p-4 w-full"
                    >
                      <h3 className="text-xl font-bold text-white mb-3 text-center">Upcoming Birthdays 🎂</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingBirthdays.map((birthday) => (
                          <Tilt
                            key={birthday._id}
                            tiltMaxAngleX={15}
                            tiltMaxAngleY={15}
                            glareEnable={true}
                            glareMaxOpacity={0.3}
                            glareColor="#ffffff"
                            glarePosition="all"
                            perspective={1000}
                            scale={1.05}
                          >
                            <Link
                              to={`/celebration/${birthday.name}`}
                              className="bg-black bg-opacity-80 backdrop-blur-lg border border-gray-800 rounded-lg p-3 cursor-pointer hover:opacity-90 transition w-full block"
                            >
                              <h4 className="text-xl font-dancing-script text-white text-center mb-2">{birthday.name}</h4>
                              <BirthdayCountdown date={birthday.date} name={birthday.name} />
                            </Link>
                          </Tilt>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Birthday Quote */}
                  <BirthdayQuote />
                </div>

                {/* Right Sidebar - Birthday Form Box */}
                <div className="flex items-start">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full md:max-w-sm bg-black bg-opacity-80 backdrop-blur-lg p-4 rounded-xl shadow-2xl border border-gray-800 h-fit min-h-0"
                  >
                    <h2 className="text-xl font-bold mb-4 text-center text-white">
                      Add Your Birthday 🎂
                    </h2>
                    <form onSubmit={handleFormSubmit} className="space-y-2">
                      <div className="relative">
                        <motion.div
                          whileHover="hover"
                          whileFocus="focus"
                          variants={inputVariants}
                          className="flex items-center border rounded-lg p-1.5 bg-[#1A1A1A] border-gray-700"
                        >
                          <FaUser className="text-gray-400 mr-2" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your Name"
                            className="w-full bg-[#1A1A1A] text-white placeholder-gray-400 focus:outline-none"
                            aria-label="Your name"
                            required
                            disabled={isLoading}
                          />
                        </motion.div>
                      </div>
                      <div className="relative">
                        <motion.div
                          whileHover="hover"
                          whileFocus="focus"
                          variants={inputVariants}
                          className="flex items-center border rounded-lg p-1.5 bg-[#1A1A1A] border-gray-700"
                        >
                          <FaEnvelope className="text-gray-400 mr-2" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Your Email"
                            className="w-full bg-[#1A1A1A] text-white placeholder-gray-400 focus:outline-none"
                            aria-label="Your email"
                            required
                            disabled={isLoading}
                          />
                        </motion.div>
                      </div>
                      <div className="relative">
                        <motion.div
                          whileHover="hover"
                          whileFocus="focus"
                          variants={inputVariants}
                          className="flex items-center border rounded-lg p-1.5 bg-[#1A1A1A] border-gray-700"
                        >
                          <FaCalendar className="text-gray-400 mr-2" />
                          <input
                            type="date"
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            className="w-full bg-[#1A1A1A] text-white placeholder-gray-400 focus:outline-none"
                            aria-label="Date of birth"
                            required
                            disabled={isLoading}
                          />
                        </motion.div>
                      </div>
                      <motion.button
                        type="submit"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        className="w-full p-2 rounded-lg font-semibold shadow-lg bg-blue-600 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Adding Birthday...' : 'Celebrate Your Birthday! 🎈'}
                      </motion.button>
                    </form>
                  </motion.div>
                </div>
              </div>
            </section>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="py-4 bg-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-base font-semibold mb-3 text-white">About Us</h3>
              <p className="text-sm text-gray-400">
                We bring joy to birthdays with personalized wishes, interactive experiences, and heartfelt celebrations.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-3 text-white">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/privacy" className="text-sm text-gray-400 hover:text-blue-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-400 hover:text-blue-400">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-400 hover:text-blue-400">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-3 text-white">Connect</h3>
              <div className="flex space-x-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                  <FaFacebook size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                  <FaTwitter size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700">
                  <FaLinkedin size={20} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-3 text-white">Get in Touch</h3>
              <form onSubmit={handleContactSubmit}>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full p-2 mb-2 rounded-lg bg-black text-white border-2 border-gray-600 focus:outline-none focus:border-blue-500"
                  aria-label="Email for contact"
                />
                <textarea
                  placeholder="Your message"
                  className="w-full p-2 rounded-lg bg-black text-white border-2 border-gray-600 focus:outline-none focus:border-blue-500"
                  rows="3"
                  aria-label="Contact message"
                />
                <button
                  type="submit"
                  className="mt-2 w-full bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition"
                >
                  <FaPaperPlane className="mr-2" /> Send
                </button>
              </form>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-700 pt-6 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Birthday Wisher. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;