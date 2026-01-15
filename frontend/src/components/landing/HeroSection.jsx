import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gray-950 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-6">
            v2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Manage Projects <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Like a Boss
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
            The project management tool for teams who want to move fast and break nothing. 
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
        </motion.div>

        {/* Abstract Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl blur-3xl opacity-20 animate-pulse" />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-3 h-3 rounded-full bg-red-500" />
               <div className="w-3 h-3 rounded-full bg-yellow-500" />
               <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="space-y-4">
               <div className="h-8 bg-gray-800 rounded w-3/4 animate-pulse" />
               <div className="h-32 bg-gray-800/50 rounded w-full border border-gray-700/50" />
               <div className="flex gap-4">
                 <div className="h-20 bg-purple-900/20 rounded w-1/2 border border-purple-500/20" />
                 <div className="h-20 bg-gray-800/50 rounded w-1/2" />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
