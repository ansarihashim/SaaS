import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-32 bg-transparent">
      <motion.div 
        initial={{ opacity: 0, filter: 'brightness(0.4)' }}
        whileInView={{ opacity: 1, filter: 'brightness(1)' }}
        transition={{ duration: 2, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-4xl mx-auto px-6 text-center"
      >
        <h2 className="text-5xl md:text-6xl font-black text-gray-100 mb-8 tracking-tight">
          Ready to <span className="text-purple-600">Level Up?</span>
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Join thousands of high-performers who trust TaskFlow to keep their empires organized.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-3 px-10 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 shadow-[0_0_30px_-5px_rgba(147,51,234,0.6)]"
        >
          Start For Free <FiArrowRight />
        </Link>
      </motion.div>
    </section>
  );
}
