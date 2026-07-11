'use client';

import { useEffect, useRef } from 'react';
import { useWeatherTheme } from './weather-theme-context';

export function WeatherEffects() {
  const { activeTheme } = useWeatherTheme();

  switch (activeTheme) {
    case 'rainy':
      return <RainCanvas isStormy={false} density={60} speedMultiplier={1} slant={-1} />;
    case 'stormy':
      return <RainCanvas isStormy={true} density={100} speedMultiplier={1.4} slant={-3} />;
    case 'cloudy':
      return <CloudCanvas />;
    case 'sunny':
      return <SunnyEffect />;
    default:
      return null;
  }
}

// 1. Canvas Rain Animation (Rainy / Stormy)
interface RainCanvasProps {
  isStormy: boolean;
  density: number;
  speedMultiplier: number;
  slant: number;
}

function RainCanvas({ isStormy, density, speedMultiplier, slant }: RainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Raindrops definition
    const drops: Array<{
      x: number;
      y: number;
      len: number;
      yspeed: number;
      opacity: number;
      width: number;
    }> = [];

    const count = isStormy ? density * 1.8 : density;
    for (let i = 0; i < count; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        len: Math.random() * 20 + 12,
        yspeed: (Math.random() * 10 + 10) * speedMultiplier,
        opacity: Math.random() * 0.16 + 0.04,
        width: Math.random() * 1.2 + 0.4 + (isStormy ? 0.4 : 0),
      });
    }

    // Lightning flash logic for Stormy
    let flashOpacity = 0;
    let nextFlashFrame = Math.random() * 400 + 300;

    const draw = () => {
      // Clear with very slight transparency to leave a trail
      ctx.clearRect(0, 0, width, height);

      // Draw lightning flash if stormy
      if (isStormy) {
        if (flashOpacity > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
          ctx.fillRect(0, 0, width, height);
          flashOpacity -= 0.05; // Fade out lightning
        } else {
          nextFlashFrame--;
          if (nextFlashFrame <= 0) {
            flashOpacity = Math.random() * 0.35 + 0.05; // Trigger flash
            nextFlashFrame = Math.random() * 600 + 400; // Reset timer
          }
        }
      }

      // Draw raindrops
      ctx.strokeStyle = isStormy ? 'rgba(192, 132, 252, 0.4)' : 'rgba(56, 189, 248, 0.3)';
      
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        ctx.lineWidth = d.width;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + slant, d.y + d.len);
        ctx.stroke();

        // Update coordinates
        d.y += d.yspeed;
        d.x += slant * 0.15;

        // Reset if off bottom
        if (d.y > height) {
          d.y = -d.len;
          d.x = Math.random() * width;
          d.yspeed = (Math.random() * 10 + 10) * speedMultiplier;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isStormy, density, speedMultiplier, slant]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen', opacity: 0.65 }}
    />
  );
}

// 2. Canvas Cloud/Mist Animation (Cloudy)
function CloudCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const clouds: Array<{
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      opacity: number;
    }> = [];

    // Initialize 6 drifting mist patches
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.5),
        r: Math.random() * 180 + 120,
        vx: Math.random() * 0.12 + 0.04,
        vy: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.06 + 0.02,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        grad.addColorStop(0, `rgba(148, 163, 184, ${c.opacity})`);
        grad.addColorStop(0.5, `rgba(100, 116, 139, ${c.opacity * 0.5})`);
        grad.addColorStop(1, 'rgba(100, 116, 139, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();

        // Drifting motion
        c.x += c.vx;
        c.y += c.vy;

        // Wrap around horizontally
        if (c.x - c.r > width) {
          c.x = -c.r;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}

// 3. CSS Sunny Glow Effect (Sunny)
function SunnyEffect() {
  return (
    <>
      <div 
        className="fixed -top-48 -right-48 w-[400px] h-[400px] rounded-full pointer-events-none z-0 blur-[130px] opacity-40 transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(245,158,11,0.05) 70%, rgba(0,0,0,0) 100%)',
          animation: 'sunny-pulsing 10s ease-in-out infinite'
        }}
      />
      <style jsx global>{`
        @keyframes sunny-pulsing {
          0%, 100% { transform: scale(1) translate(0px, 0px); opacity: 0.35; }
          50% { transform: scale(1.15) translate(-20px, 20px); opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
