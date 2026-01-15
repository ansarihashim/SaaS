import logo from "../../assets/logo.png";

export default function LandingFooter() {
  return (
    <footer className="py-8 bg-transparent border-t border-gray-800/30">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <img src={logo} alt="TaskFlow" className="w-8 h-8 rounded-lg object-contain" />
           <span className="text-xl font-bold text-gray-200">TaskFlow</span>
        </div>
        <p className="text-gray-500 text-sm">
           &copy; {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
