import HeroSection from "../components/landing/HeroSection";
import FeatureGrid from "../components/landing/FeatureGrid";
import DashboardPreview from "../components/landing/DashboardPreview";
import WorkflowSection from "../components/landing/WorkflowSection";
import CTASection from "../components/landing/CTASection";
import LandingFooter from "../components/landing/LandingFooter";
import LuxuryBackground from "../components/landing/LuxuryBackground";

export default function Landing() {
  return (
    <div className="min-h-screen text-gray-200 font-sans selection:bg-purple-500/30 selection:text-white relative">
      <LuxuryBackground />
      <div className="relative z-10 text-gray-300/90">
        <HeroSection />
        <FeatureGrid />
        <WorkflowSection />
        <DashboardPreview />
        <CTASection />
        <LandingFooter />
      </div>
    </div>
  );
}
