import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const quotes = [
  {
    text: "Clarity is the foundation of execution.",
    highlight: "Clarity",
    subtext: "Why structured task management matters"
  },
  {
    text: "Great teams don't work harder, they work structured.",
    highlight: "structured",
    subtext: "Efficiency through organization"
  },
  {
    text: "What gets organized gets done.",
    highlight: "organized",
    subtext: "The power of planning"
  },
  {
    text: "Progress is built on visibility, not urgency.",
    highlight: "visibility",
    subtext: "Sustainable growth"
  },
  {
    text: "Tasks don't fail. Systems do.",
    highlight: "Systems",
    subtext: "Build better workflows"
  }
];

export default function QuoteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayPauseTill = useRef(0);

  // Auto-rotation logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Only advance if not hovered AND pause timer has expired
      if (!isHovered && now > autoPlayPauseTill.current) {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleManualChange = (index) => {
    setCurrentIndex(index);
    // Pause auto-play for 5 seconds after manual interaction
    autoPlayPauseTill.current = Date.now() + 5000;
  };

  const handlePrev = () => {
    handleManualChange((currentIndex - 1 + quotes.length) % quotes.length);
  };

  const handleNext = () => {
    handleManualChange((currentIndex + 1) % quotes.length);
  };

  const currentQuote = quotes[currentIndex];

  const getHighlightedText = (text, highlight) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <span key={i} className="text-purple-500 font-bold">{part}</span> : 
        part
    );
  };

  return (
    <div 
      className="hidden lg:flex relative h-96 items-center justify-center p-12 bg-gray-900/30 rounded-3xl border border-gray-800/50 backdrop-blur-sm group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
       {/* Background ambient glow - subtle */}
       <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl" />
       
       <AnimatePresence mode="wait">
        <motion.div
            key={currentIndex}
            initial={{ opacity: 0, filter: 'brightness(0.4)' }}
            animate={{ opacity: 1, filter: 'brightness(1)' }}
            exit={{ opacity: 0, filter: 'brightness(0.4)' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="text-center z-10 max-w-xl absolute px-12"
        >
            <h3 className="text-3xl md:text-4xl font-medium text-gray-200 leading-relaxed mb-6 font-display select-none">
                "{getHighlightedText(currentQuote.text, currentQuote.highlight)}"
            </h3>
            <div className="flex items-center justify-center gap-4 opacity-60">
                <div className="h-px w-8 bg-purple-500/50"></div>
                <p className="text-sm uppercase tracking-widest text-purple-200 font-semibold select-none">
                    {currentQuote.subtext}
                </p>
                <div className="h-px w-8 bg-purple-500/50"></div>
            </div>
        </motion.div>
       </AnimatePresence>

       {/* Navigation Arrows */}
       <button 
         onClick={handlePrev}
         className="absolute left-6 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 z-20 cursor-pointer opacity-0 group-hover:opacity-100 duration-300"
         aria-label="Previous quote"
       >
         <FiChevronLeft size={24} />
       </button>

       <button 
         onClick={handleNext}
         className="absolute right-6 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 z-20 cursor-pointer opacity-0 group-hover:opacity-100 duration-300"
         aria-label="Next quote"
       >
         <FiChevronRight size={24} />
       </button>

       {/* Pagination Dots */}
       <div className="absolute bottom-8 flex gap-2 z-20">
         {quotes.map((_, idx) => (
           <button 
             key={idx}
             onClick={() => handleManualChange(idx)}
             className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
               idx === currentIndex 
                ? "w-8 bg-purple-500" 
                : "w-2 bg-gray-700 hover:bg-gray-600 hover:w-4"
             }`}
             aria-label={`Go to quote ${idx + 1}`}
           />
         ))}
       </div>
    </div>
  );
}
