export default function LandingFooter() {
  return (
    <footer className="py-8 bg-black border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white">T</div>
           <span className="text-xl font-bold text-white">TaskFlow</span>
        </div>
        <p className="text-gray-500 text-sm">
           &copy; {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
