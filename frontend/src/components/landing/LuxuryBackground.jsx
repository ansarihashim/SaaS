import { useEffect, useRef } from 'react';

export default function LuxuryBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let stars = [];
    let animationFrameId;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((width * height) / 10000); // Increased density slightly for visibility
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.5 + 1, // 1px to 3.5px
          opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8 opacity (significantly more visible)
          speed: Math.random() * 0.05 + 0.02 // Subtle drift
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw background gradient (Deep black/blue)
      // We can do this in CSS for performance, but Canvas gives us control too if we want.
      // Let's stick to transparent canvas over CSS background for the gradient.

      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Update position (Slow upward drift)
        star.y -= star.speed;
        if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width;
        }
      });
      
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#090B10]">
      {/* Base Gradient - Rich Black Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14] via-[#0E1117] to-[#090B10] opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,24,35,0.2)_0%,rgba(9,11,16,0.8)_100%)]" />
      
      {/* Stars Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
