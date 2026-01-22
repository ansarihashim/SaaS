import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import QuoteCarousel from "./QuoteCarousel";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-100 leading-tight mb-6 tracking-tight">
            Manage Projects <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
              Like a Boss
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
            TaskFlow,The project management tool for teams who want to move fast and break nothing. 
            Bold, fast, and uncompromising.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)]"
            >
              Get Started <FiArrowRight />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-transparent border border-gray-700 hover:border-white text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center hover:bg-white/5"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Abstract Visual Replacement -> Quote Carousel */}
        <QuoteCarousel />
      </div>
    </section>
  );
}
