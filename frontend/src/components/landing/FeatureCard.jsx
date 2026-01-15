import { motion } from "framer-motion";

export default function FeatureCard({ icon: Icon, title, description }) {
  const cardVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={cardVariants}
      transition={{ duration: 2.5, ease: 'easeOut' }}
      className="group p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-purple-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
