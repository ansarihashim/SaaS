import FeatureCard from "./FeatureCard";
import { FiLayout, FiUsers, FiActivity, FiShield, FiZap, FiCommand } from "react-icons/fi";

const features = [
  { icon: FiLayout, title: "Kanban Boards", description: "Visualize work with powerful, intuitive boards that keep your team moving forward." },
  { icon: FiUsers, title: "Team Collaboration", description: "Real-time updates and seamless communication to keep everyone aligned." },
  { icon: FiActivity, title: "Activity Tracking", description: "Monitor every action and update with detailed audit logs and timelines." },
  { icon: FiZap, title: "Instant Performance", description: "Built for speed. No lag, no loading screens, just pure productivity." },
  { icon: FiShield, title: "Enterprise Security", description: "Bank-grade encryption and role-based access control standard on all plans." },
  { icon: FiCommand, title: "Power Management", description: "Keyboard shortcuts and command menus for power users who hate mouses." },
];

export default function FeatureGrid() {
  return (
    <section className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Built for the <span className="text-purple-500">Ambitious</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to dominate your industry, packaged in a beautiful interface.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
