import HeroSection from "../components/landing/HeroSection";
import FeatureGrid from "../components/landing/FeatureGrid";
import DashboardPreview from "../components/landing/DashboardPreview";
import WorkflowSection from "../components/landing/WorkflowSection";
import CTASection from "../components/landing/CTASection";
import LandingFooter from "../components/landing/LandingFooter";
import CursorGlow from "../components/landing/CursorGlow";

export default function Landing() {
  return (
    <div className="bg-gray-950 min-h-screen text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      <CursorGlow />
      <HeroSection />
      <FeatureGrid />
      <WorkflowSection />
      <DashboardPreview />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
