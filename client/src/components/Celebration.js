import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import Confetti from 'react-confetti';
import Tilt from 'react-parallax-tilt';
import Particles from 'react-tsparticles';
import { tsParticles } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';
import { ReactTyped } from 'react-typed';
import { io } from 'socket.io-client';
import { FaFacebook, FaTwitter, FaLinkedin, FaPlay, FaPause, FaGift } from 'react-icons/fa';
import BirthdayWish from './BirthdayWish';

// Simple hash function for consistent randomization
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Guestbook Component
const Guestbook = ({ birthdayName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    socketRef.current.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    const fetchGuestbook = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/birthday/guestbook?name=${birthdayName}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching guestbook messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuestbook();

    return () => socketRef.current.disconnect();
  }, [birthdayName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const message = { name: birthdayName, text: newMessage, timestamp: new Date() };
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/birthday/guestbook`,
        message
      );
      socketRef.current.emit('newMessage', message);
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error posting guestbook message:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
      className="mt-16 w-full max-w-4xl bg-black bg-opacity-80 backdrop-blur-lg border border-gray-800 rounded-lg shadow-2xl p-6 flex flex-col items-center"
    >
      <h3 className="text-2xl font-bold text-white mb-4">Guestbook for {birthdayName}</h3>
      <form onSubmit={handleSubmit} className="mb-6 w-full">
        <motion.textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Leave a birthday message..."
          className="w-full p-3 rounded-lg bg-[#1A1A1A] text-white border-2 border-gray-600 focus:outline-none focus:border-blue-500 transition-all"
          rows="4"
          aria-label="Guestbook message"
          whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}
        />
        <motion.button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          aria-label="Submit guestbook message"
          disabled={!newMessage.trim()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Post Message
        </motion.button>
      </form>
      {isLoading ? (
        <p className="text-gray-400">Loading messages...</p>
      ) : messages.length > 0 ? (
        <div className="space-y-4 w-full">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700"
            >
              <p className="text-white">{msg.text}</p>
              <p className="text-sm text-gray-400">
                {new Date(msg.timestamp).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No messages yet. Be the first to leave a wish!</p>
      )}
    </motion.div>
  );
};

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

  const flipVariants = {
    initial: { rotateX: 90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: -90, opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: isToday ? [0] : 1 }}
      transition={{ duration: 0.8, type: 'spring', stiffness: 100, repeat: isToday ? Infinity : 0, repeatType: 'reverse' }}
      className={`p-4 rounded-lg relative ${isToday ? 'bg-gradient-to-r from-yellow-400 to-pink-500 shadow-lg' : 'bg-black bg-opacity-80 backdrop-blur-lg border border-gray-800'}`}
    >
      {isToday ? (
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">Happy Birthday, {name}!</h3>
          <p className="text-lg text-white">Today is your special day! 🎉</p>
        </div>
      ) : (
        <div className="flex justify-center gap-4 text-center">
          {['days', 'hours', 'minutes', 'seconds'].map((unit, index) => (
            <div key={unit}>
              <motion.span
                key={timeLeft[unit]}
                variants={flipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-blue-400"
              >
                {timeLeft[unit]}
              </motion.span>
              <p className="text-sm text-gray-300 capitalize">{unit}</p>
            </div>
          ))}
        </div>
      )}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-blue-500 opacity-0"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};

// Virtual Gift Box Component
const GiftBox = ({ name, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wishes = [
    `Wishing you lots of love, ${name}! ❤️`,
    `Wishing you lots of luck, ${name}! 🍀`,
    `Wishing you lots of happiness, ${name}! 😊`,
  ];
  const wishIndex = Math.floor(Math.random() * wishes.length); // Randomly select one wish

  const boxVariants = {
    closed: { scale: 1, rotate: 0 },
    open: { scale: 1.2, rotate: 360, transition: { duration: 0.5 } },
  };

  const messageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.5, type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="text-center mt-4">
      <motion.button
        variants={boxVariants}
        animate={isOpen ? 'open' : 'closed'}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full"
        aria-label="Open gift box"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaGift size={24} />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`mt-4 p-4 rounded-lg bg-black bg-opacity-80 backdrop-blur-lg border border-gray-800 ${theme.text}`}
            role="alert"
            aria-live="polite"
          >
            <p className="text-lg font-semibold">{wishes[wishIndex]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Life Timeline Component
const LifeTimeline = ({ dob, name, isToday, theme }) => {
  const [timeLived, setTimeLived] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentAge, setCurrentAge] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const birthDate = new Date(dob);
      const endDate = new Date(birthDate);
      endDate.setFullYear(birthDate.getFullYear() + 100); // Assume 100 years lifespan

      // Calculate current age
      let age = now.getFullYear() - birthDate.getFullYear();
      const monthDiff = now.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
        age--;
      }
      setCurrentAge(age);

      // Calculate time lived (from birth to now)
      const livedDiff = now - birthDate;
      const livedDays = Math.floor(livedDiff / (1000 * 60 * 60 * 24));
      const livedHours = Math.floor((livedDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const livedMinutes = Math.floor((livedDiff % (1000 * 60 * 60)) / (1000 * 60));
      const livedSeconds = Math.floor((livedDiff % (1000 * 60)) / 1000);
      setTimeLived({ days: livedDays, hours: livedHours, minutes: livedMinutes, seconds: livedSeconds });

      // Calculate time remaining (from now to age 100)
      const remainingDiff = endDate - now;
      const remainingDays = Math.floor(remainingDiff / (1000 * 60 * 60 * 24));
      const remainingHours = Math.floor((remainingDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingDiff % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((remainingDiff % (1000 * 60)) / 1000);
      setTimeRemaining({ days: remainingDays, hours: remainingHours, minutes: remainingMinutes, seconds: remainingSeconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [dob]);

  const years = Array.from({ length: 100 }, (_, i) => i + 1);
  const flipVariants = {
    initial: { rotateX: 90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: -90, opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
      className="mt-8 w-full bg-black bg-opacity-80 backdrop-blur-lg border border-gray-800 rounded-lg shadow-2xl p-6"
      role="region"
      aria-label={`Life timeline for ${name}`}
    >
      <h3 className="text-2xl font-bold text-white mb-4 text-center">
        {name}'s Life Journey
      </h3>
      {/* Time Counters */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Time Lived */}
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-2">Time Lived</h4>
          <div className="flex justify-around text-center">
            {['days', 'hours', 'minutes', 'seconds'].map((unit, index) => (
              <div key={unit}>
                <motion.span
                  key={timeLived[unit]}
                  variants={flipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0 }}
                  className="text-xl font-bold text-blue-400"
                >
                  {timeLived[unit]}
                </motion.span>
                <p className="text-sm text-gray-300 capitalize">{unit}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Time Remaining */}
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-2">Time Until 100</h4>
          <div className="flex justify-around text-center">
            {['days', 'hours', 'minutes', 'seconds'].map((unit, index) => (
              <div key={unit}>
                <motion.span
                  key={timeRemaining[unit]}
                  variants={flipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0 }}
                  className="text-xl font-bold text-blue-400"
                >
                  {timeRemaining[unit]}
                </motion.span>
                <p className="text-sm text-gray-300 capitalize">{unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Celebration Component
const Celebration = () => {
  const { name } = useParams();
  const [birthdayData, setBirthdayData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [theme, setTheme] = useState('vibrant');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/audio/birthday-tune.mp3');
    audioRef.current.loop = true;

    const fetchBirthday = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/birthday?name=${name}`
        );
        if (!response.data.date || isNaN(new Date(response.data.date))) {
          throw new Error('Invalid date of birth');
        }
        setBirthdayData(response.data);
        const today = new Date();
        const birthdayDate = new Date(response.data.date);
        birthdayDate.setFullYear(today.getFullYear());
        setShowConfetti(today.toDateString() === birthdayDate.toDateString());
      } catch (error) {
        console.error('Error fetching birthday:', error);
        setBirthdayData(null); // Handle invalid data gracefully
      } finally {
        setIsLoading(false);
      }
    };
    fetchBirthday();

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [name]);

  // Social Sharing
  const shareWish = (platform) => {
    const url = window.location.href;
    const text = `Celebrate ${birthdayData?.name}'s birthday with us! 🎉`;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    };
    window.open(shareUrls[platform], '_blank');
  };

  // Dynamic Celebration Note
  const celebrationNotes = [
    `To ${birthdayData?.name || 'you'}, may your special day be as amazing as you are!`,
    'Let’s make today epic!',
    'Time to party like never before!',
    'Your special day deserves all the love!',
    'Here’s to a day full of surprises!',
    'Celebrate with all your heart!',
    'Make every moment count today!',
    'Your birthday is a gift to us all!',
    'Let’s light up the sky with joy!',
  ];
  const noteIndex = birthdayData ? simpleHash(birthdayData.name) % celebrationNotes.length : 0;

  // Theme Configuration
  const themes = {
    vibrant: { gradient: 'from-yellow-400 to-pink-500', text: 'text-white', glow: 'blue-500' },
    elegant: { gradient: 'from-purple-500 to-blue-500', text: 'text-gray-200', glow: 'purple-500' },
    cosmic: { gradient: 'from-indigo-500 to-black', text: 'text-cyan-300', glow: 'cyan-500' },
  };

  // Music Toggle
  const toggleMusic = () => {
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error('Audio play failed:', e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  // Particle Initialization
  const particlesInit = async () => {
    await loadSlim(tsParticles);
  };

  // Particle Options
  const particlesOptions = {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: ['#ff4d4d', '#4d4dff', '#4dff4d', '#ffd44d'] },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 10, random: true },
      move: { enable: true, speed: 2, direction: 'none', random: true, out_mode: 'out' },
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
      modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } },
    },
    retina_detect: true,
  };

  // Spring Animation for Card
  const x = useSpring(0, { stiffness: 0, damping: 0 });
  const y = useSpring(0, { stiffness: 0, damping: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = e.clientY - rect.top - centerY;
    x.set(mouseX * 0.05);
    y.set(mouseY * 0.05);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-black text-white overflow-x-hidden relative">
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="absolute inset-0 z-0" />
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </motion.div>
      )}

      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} colors={['#ff4d4d', '#4d4dff', '#4dff4d', '#ffd44d']} />
      )}

      <main className="pt-20 pb-12 relative z-10">
        <section className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: 'spring', stiffness: 20 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500"
          >
            Celebrate { birthdayData?.name }'s Birthday!
          </motion.h2>

          {birthdayData ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
              className="w-full max-w-2xl"
            >
              <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0} glareColor="#ffffff" glarePosition="all" perspective={1000} scale={1}>
                <motion.div
                  style={{ x, y }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="bg-black bg-opacity-80 backdrop-blur-lg border border-gray-800 rounded-lg shadow-2xl p-4 flex flex-col items-center"
                >
                  <motion.h3
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`text-2xl font-dancing-script bg-gradient-to-r ${themes[theme].gradient} text-transparent bg-clip-text text-center mb-8`}
                  >
                    Happy Birthday, {birthdayData.name}!
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mb-4"
                  >
                    <BirthdayWish name={birthdayData.name} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <BirthdayCountdown date={birthdayData.date} name={birthdayData.name} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-center mt-4"
                  >
                    <ReactTyped
                      strings={[celebrationNotes[noteIndex]]}
                      typeSpeed={50}
                      backSpeed={30}
                      loop={false}
                      className={`text-lg ${themes[theme].text} italic`}
                    />
                  </motion.div>
                  <LifeTimeline
                    dob={birthdayData.date}
                    name={birthdayData.name}
                    isToday={new Date().toDateString() === new Date(birthdayData.date).toDateString()}
                    theme={themes[theme]}
                  />
                  <GiftBox name={birthdayData.name} theme={themes[theme]} />
                  <div className="flex justify-center space-x-4 mt-4">
                    {['facebook', 'twitter', 'linkedin'].map((platform, index) => (
                      <motion.button
                        key={platform}
                        onClick={() => shareWish(platform)}
                        className={`p-2 bg-${platform === 'facebook' ? 'blue-600' : platform === 'twitter' ? 'blue-400' : 'blue-700'} text-white rounded-full hover:bg-${platform === 'facebook' ? 'blue-700' : platform === 'twitter' ? 'blue-500' : 'blue-800'} transition`}
                        aria-label={`Share on ${platform}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {platform === 'facebook' && <FaFacebook size={24} />}
                        {platform === 'twitter' && <FaTwitter size={24} />}
                        {platform === 'linkedin' && <FaLinkedin size={24} />}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <motion.select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="p-2 rounded-lg bg-[#1A1A1A] text-white border-2 border-gray-600 focus:outline-none"
                      aria-label="Select celebration theme"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.6 }}
                    >
                      <option value="vibrant">Vibrant</option>
                      <option value="elegant">Elegant</option>
                      <option value="cosmic">Cosmic</option>
                    </motion.select>
                    <motion.button
                      onClick={toggleMusic}
                      className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
                      aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.8 }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isMusicPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
                    </motion.button>
                  </div>
                </motion.div>
              </Tilt>
              <Guestbook birthdayName={birthdayData.name} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-500"
            >
              loading birthday data.
            </motion.div>
          )}
          <Link to="/" className="mt-8 text-blue-400 hover:text-blue-500 transition">
            Back to Home
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Celebration;