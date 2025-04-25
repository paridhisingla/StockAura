import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaBookReader, FaChartLine, FaGraduationCap, FaFilter, FaClock, FaStar, FaTimes } from 'react-icons/fa';
import { BiAnalyse, BiSearchAlt2 } from 'react-icons/bi';
import { SiYoutube } from 'react-icons/si';
import { MdAccessTime, MdTrendingUp, MdNewReleases } from 'react-icons/md';

const VideoModal = ({ videoId, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.5 }}
        className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white bg-red-500 rounded-full p-2 hover:bg-red-600 transition-colors"
        >
          <FaTimes />
        </button>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0"
        />
      </motion.div>
    </motion.div>
  );
};

const Learning = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [duration, setDuration] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const courseData = [
    {
      id: 1,
      title: "Complete Stock Market Basics for Beginners",
      youtubeId: "3UF0ymVdYLA",
      category: "basics",
      description: "Master the fundamentals of stock market investing with comprehensive coverage of key concepts",
      duration: "45",
      difficulty: "beginner",
      rating: 4.8,
      students: 15420,
      instructor: "Sarah Johnson",
      tags: ["fundamentals", "investing", "stocks"]
    },
    {
      id: 2,
      title: "Technical Analysis Masterclass",
      youtubeId: "3UF0ymVdYLA",
      category: "technical",
      description: "Learn advanced technical analysis patterns and strategies for better trading decisions",
      duration: "60",
      difficulty: "advanced",
      rating: 4.9,
      students: 12340,
      instructor: "Mike Thompson",
      tags: ["technical", "charts", "patterns"]
    },
    {
      id: 3,
      title: "Fundamental Analysis Deep Dive",
      youtubeId: "3UF0ymVdYLA",
      category: "fundamental",
      description: "Understanding company valuations and financial statements for long-term investing",
      duration: "55",
      difficulty: "intermediate",
      rating: 4.7,
      students: 9870,
      instructor: "Emily Chen",
      tags: ["fundamental", "valuation", "finance"]
    },
    {
      id: 4,
      title: "Day Trading Strategies",
      youtubeId: "3UF0ymVdYLA",
      category: "advanced",
      description: "Professional day trading techniques and risk management strategies",
      duration: "70",
      difficulty: "advanced",
      rating: 4.6,
      students: 11250,
      instructor: "David Wilson",
      tags: ["day trading", "strategies", "risk management"]
    },
    {
      id: 5,
      title: "Options Trading for Beginners",
      youtubeId: "3UF0ymVdYLA",
      category: "basics",
      description: "Introduction to options trading concepts and basic strategies",
      duration: "50",
      difficulty: "beginner",
      rating: 4.8,
      students: 13680,
      instructor: "Lisa Anderson",
      tags: ["options", "derivatives", "basics"]
    },
    {
      id: 6,
      title: "Cryptocurrency Trading Essentials",
      youtubeId: "3UF0ymVdYLA",
      category: "technical",
      description: "Learn to trade cryptocurrencies with technical analysis",
      duration: "65",
      difficulty: "intermediate",
      rating: 4.7,
      students: 14520,
      instructor: "Alex Kumar",
      tags: ["crypto", "blockchain", "trading"]
    },
    {
      id: 7,
      title: "Swing Trading Mastery",
      youtubeId: "3UF0ymVdYLA",
      category: "technical",
      description: "Master the art of swing trading with proven strategies",
      duration: "40",
      difficulty: "intermediate",
      rating: 4.9,
      students: 10890,
      instructor: "Robert Brown",
      tags: ["swing trading", "technical", "strategies"]
    },
    {
      id: 8,
      title: "Risk Management in Trading",
      youtubeId: "3UF0ymVdYLA",
      category: "advanced",
      description: "Essential risk management principles for successful trading",
      duration: "35",
      difficulty: "advanced",
      rating: 4.8,
      students: 8940,
      instructor: "Jennifer Lee",
      tags: ["risk", "management", "trading"]
    },
    {
      id: 9,
      title: "Market Psychology and Trading",
      youtubeId: "3UF0ymVdYLA",
      category: "fundamental",
      description: "Understanding market psychology and emotional control in trading",
      duration: "55",
      difficulty: "intermediate",
      rating: 4.7,
      students: 12760,
      instructor: "Mark Stevens",
      tags: ["psychology", "emotions", "trading"]
    }
  ];

  const filterCourses = () => {
    return courseData
      .filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
        const matchesDifficulty = difficulty === 'all' || course.difficulty === difficulty;
        const matchesDuration = duration === 'all' || 
                              (duration === 'short' && course.duration <= 30) ||
                              (duration === 'medium' && course.duration > 30 && course.duration <= 60) ||
                              (duration === 'long' && course.duration > 60);
        
        return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'popular': return b.students - a.students;
          case 'rating': return b.rating - a.rating;
          case 'duration': return a.duration - b.duration;
          default: return 0;
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal videoId={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
          Master Stock Trading
        </h1>

      
        <div className="relative max-w-2xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search courses, topics, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 rounded-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-400"
          />
          <BiSearchAlt2 className="absolute right-6 top-1/2 transform -translate-y-1/2 text-2xl text-gray-400" />
        </div>

        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 mx-auto mb-6 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <FaFilter />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

       
        <motion.div
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
          className="overflow-hidden mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-800/50 rounded-2xl">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="basics">Basics</option>
                <option value="technical">Technical Analysis</option>
                <option value="fundamental">Fundamental Analysis</option>
                <option value="advanced">Advanced Trading</option>
              </select>
            </div>

            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

           
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Any Duration</option>
                <option value="short">Under 30 mins</option>
                <option value="medium">30-60 mins</option>
                <option value="long">Over 60 mins</option>
              </select>
            </div>

          
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </motion.div>

        
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filterCourses().map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800/50 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300"
            >
              
              <div className="relative aspect-video group">
                <img
                  src={`https://img.youtube.com/vi/${course.youtubeId}/maxresdefault.jpg`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaPlay className="text-4xl text-white" />
                </div>
              </div>

              
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold line-clamp-2">{course.title}</h3>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <FaStar /> {course.rating}
                  </span>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <MdAccessTime /> {course.duration}m
                  </span>
                  <span className="flex items-center gap-1">
                    <FaGraduationCap /> {course.students.toLocaleString()} students
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedVideo(course.youtubeId)}
                  className="block w-full text-center py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  Watch Now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Learning;