import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

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
      className="hidden lg:flex relative h-96 items-center justify-center p-12 bg-gray-900/30 rounded-3xl border border-gray-800/50 backdrop-blur-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
       {/* Background ambient glow - subtle */}
       <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl" />
       
       <AnimatePresence mode="wait">
        <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Smooth ease
            className="text-center z-10 max-w-xl"
        >
            <h3 className="text-3xl md:text-4xl font-medium text-gray-200 leading-relaxed mb-6 font-display">
                "{getHighlightedText(currentQuote.text, currentQuote.highlight)}"
            </h3>
            <div className="flex items-center justify-center gap-4 opacity-60">
                <div className="h-px w-8 bg-purple-500/50"></div>
                <p className="text-sm uppercase tracking-widest text-purple-200 font-semibold">
                    {currentQuote.subtext}
                </p>
                <div className="h-px w-8 bg-purple-500/50"></div>
            </div>
        </motion.div>
       </AnimatePresence>

       {/* Loading/Timer Indicator (Optional but nice for UX) */}
       <div className="absolute bottom-8 flex gap-2">
         {quotes.map((_, idx) => (
           <div 
             key={idx}
             className={`h-1 rounded-full transition-all duration-500 ${
               idx === currentIndex ? "w-8 bg-purple-500" : "w-2 bg-gray-700"
             }`}
           />
         ))}
       </div>
    </div>
  );
}
