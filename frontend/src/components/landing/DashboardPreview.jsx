import { motion } from "framer-motion";

export default function DashboardPreview() {
  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
       {/* Background Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px]" />

       <div className="max-w-7xl mx-auto px-6 relative z-10">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
               Command Center
            </h2>
            <p className="text-gray-400">
               Everything you need, exactly where you expect it.
            </p>
         </div>

         <motion.div
           initial={{ opacity: 0, y: 50, rotateX: 20 }}
           whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
           transition={{ duration: 1 }}
           viewport={{ once: true }}
           className="relative mx-auto max-w-5xl"
           style={{ perspective: "1000px" }}
         >
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-2 shadow-2xl">
              {/* Abstract Representation of Dashboard */}
              <div className="bg-gray-950 rounded-lg overflow-hidden aspect-video border border-gray-800 relative group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                       <div className="text-purple-500 text-6xl font-black mb-4 opacity-50 select-none">TASKFLOW</div>
                       <p className="text-gray-600 uppercase tracking-[0.2em] text-sm">Dashboard UI Preview</p>
                    </div>
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
         </motion.div>
       </div>
    </section>
  );
}
