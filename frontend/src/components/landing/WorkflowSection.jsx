import { motion } from "framer-motion";
import { FiCheck, FiX, FiZap, FiAlertCircle, FiClock, FiTrendingUp, FiHelpCircle } from "react-icons/fi";
import Stack from "./Stack";

const steps = [
  { id: "01", title: "Create Workspace", description: "Set up your digital HQ in seconds." },
  { id: "02", title: "Add Projects", description: "Organize chaos into structured missions." },
  { id: "03", title: "Execute Tasks", description: "Smash deadlines with precision." },
];

const cards = [
  // --- BOTTOM OF STACK (Last to be seen) ---
  
  // Solution 3: Scale
  <div className="w-full h-full bg-gradient-to-br from-indigo-900/90 to-gray-900 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-2xl select-none relative overflow-hidden">
     <div className="absolute inset-0 bg-indigo-500/10"></div>
     <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
       <FiTrendingUp className="text-white text-3xl" />
     </div>
     <h3 className="text-xl font-bold text-white mb-2">Infinite Scale</h3>
     <p className="text-indigo-200/80 leading-relaxed font-medium">
       Grow without breaking.<br/>The platform scales with you.
     </p>
  </div>,

  // Problem 3: Uncertainty
  <div className="w-full h-full bg-[#1A1D24] border border-gray-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl select-none">
     <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
       <FiHelpCircle className="text-gray-500 text-3xl" />
     </div>
     <h3 className="text-lg font-bold text-gray-400 mb-2">Zero Accountability</h3>
     <p className="text-gray-500 leading-relaxed">
       "I thought you were doing that?"<br/>Blame games and confusion.
     </p>
  </div>,

  // Solution 2: Automation
  <div className="w-full h-full bg-gradient-to-br from-purple-900/90 to-gray-900 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-2xl select-none relative overflow-hidden">
     <div className="absolute inset-0 bg-purple-500/10"></div>
     <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
       <FiZap className="text-white text-3xl" />
     </div>
     <h3 className="text-xl font-bold text-white mb-2">Automated Flows</h3>
     <p className="text-purple-200/80 leading-relaxed font-medium">
       Stop chasing updates.<br/>The system does the heavy lifting.
     </p>
  </div>,

  // Problem 2: Missed Deadlines
  <div className="w-full h-full bg-[#1A1D24] border border-gray-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl select-none">
     <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
       <FiClock className="text-gray-500 text-3xl" />
     </div>
     <h3 className="text-lg font-bold text-gray-400 mb-2">Missed Deadlines</h3>
     <p className="text-gray-500 leading-relaxed">
       Projects dragging on forever.<br/>Always playing catch-up.
     </p>
  </div>,

  // Solution 1: Clarity
  <div className="w-full h-full bg-gradient-to-br from-blue-900/90 to-gray-900 border border-blue-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-2xl select-none relative overflow-hidden">
     <div className="absolute inset-0 bg-blue-500/10"></div>
     <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
       <FiCheck className="text-white text-3xl" />
     </div>
     <h3 className="text-xl font-bold text-white mb-2">Total Clarity</h3>
     <p className="text-blue-200/80 leading-relaxed font-medium">
       Everything in one place.<br/>Everyone aligned instantly.
     </p>
  </div>,

  // --- TOP OF STACK (First to be seen) ---

  // Problem 1: Chaos
  <div className="w-full h-full bg-[#1A1D24] border border-gray-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl select-none">
     <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
       <FiAlertCircle className="text-gray-500 text-3xl" />
     </div>
     <h3 className="text-lg font-bold text-gray-400 mb-2">Complete Chaos</h3>
     <p className="text-gray-500 leading-relaxed">
       Scattered across email, slack, <br/>and random spreadsheets.
     </p>
  </div>
];

export default function WorkflowSection() {
  return (
    <section className="py-24 bg-transparent text-gray-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-extrabold mb-12 text-gray-100">
              <span className="text-purple-500">Simple</span> by design.<br />
              <span className="text-gray-400">Powerful</span> in execution.
            </h2>
            <div className="space-y-8">
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-6 group cursor-default"
                >
                  <span className="text-5xl font-black text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                    {step.id}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-purple-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-500">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="relative flex justify-center items-center h-[500px]">
             <div className="w-[300px] h-[360px] md:w-[350px] md:h-[420px]">
                <Stack
                  randomRotation={true}
                  sensitivity={180}
                  sendToBackOnClick={true}
                  autoplay={true}
                  autoplayDelay={3500}
                  pauseOnHover={true}
                  cards={cards}
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
