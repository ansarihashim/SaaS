import { useEffect, useState } from "react";

export default function Loader({ delay = 0 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // If there's a delay requirement before showing (to avoid flashing for super fast loads),
    // we could handle it here. For this request, we want immediate show but 
    // minimal duration is handled by the parent logic. 
    // The prompt says "Loading appears immediately when navigation starts".
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center min-h-[400px] animate-fadeIn">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute h-12 w-12 rounded-full border-4 border-purple-100 opacity-50"></div>
        {/* Spinning Ring */}
        <div className="h-12 w-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-purple-600 font-medium text-sm animate-pulse">
        Loading...
      </p>
    </div>
  );
}
