import { motion } from "framer-motion";

const steps = [
  { id: "01", title: "Create Workspace", description: "Set up your digital HQ in seconds." },
  { id: "02", title: "Add Projects", description: "Organize chaos into structured missions." },
  { id: "03", title: "Execute Tasks", description: "Smash deadlines with precision." },
];

export default function WorkflowSection() {
  return (
    <section className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-extrabold mb-12">
              <span className="text-purple-500">Simple</span> by design.<br />
              <span className="text-gray-500">Powerful</span> in execution.
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
          <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl rotate-3 opacity-20" />
             <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 aspect-square flex flex-col justify-center items-center">
                 <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold text-white">Ready for takeoff</h3>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
