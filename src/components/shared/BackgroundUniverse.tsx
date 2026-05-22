import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { useUI } from '../../contexts/UIContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  char: string;
}

export function BackgroundUniverse() {
  const { theme } = useUI();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [particles, setParticles] = useState<Particle[]>([]);

  // Update window sizes
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update mouse position for dynamic flashlight tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate cosmic floating financial streams
  useEffect(() => {
    const characters = ['đ', '$', '▲', '📈', '％', '💎', '•', '01', 'DCA', 'AI'];
    const generated: Particle[] = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      size: Math.random() * 12 + 8, // px
      speed: Math.random() * 20 + 20, // seconds per full float cycle
      char: characters[i % characters.length],
    }));
    setParticles(generated);
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. INTERACTIVE CHRONOS RADIAL LIGHT (Interactive Cursor Light) */}
      <div
        className="absolute transition-opacity duration-500 rounded-full"
        style={{
          left: mousePos.x - 300,
          top: mousePos.y - 300,
          width: '600px',
          height: '600px',
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.02) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(204, 251, 241, 0.4) 0%, rgba(224, 242, 254, 0.2) 50%, transparent 80%)',
          transform: 'translate3d(0, 0, 0)',
        }}
      />

      {/* 2. ATMOSPHERIC NEBULA BLOB 1 */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 right-[10%] w-[450px] h-[450px] rounded-full blur-[120px]"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, rgba(6, 182, 212, 0.03) 50%, transparent 100%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 100%)',
        }}
      />

      {/* 3. ATMOSPHERIC NEBULA BLOB 2 */}
      <motion.div
        animate={{
          x: [0, -30, 50, 0],
          y: [0, 40, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-1/4 left-[5%] w-[400px] h-[400px] rounded-full blur-[130px]"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.02) 60%, transparent 100%)'
            : 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, rgba(196, 181, 253, 0.04) 60%, transparent 100%)',
        }}
      />

      {/* 4. DESIGN GRID PROJECTOR (Subtle Tech Grids) */}
      <div 
        className="absolute inset-0 opacity-[0.03] sm:opacity-[0.05]"
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(to right, rgb(255,255,255) 1px, transparent 1px), linear-gradient(to bottom, rgb(255,255,255) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgb(0,0,0) 1px, transparent 1px), linear-gradient(to bottom, rgb(0,0,0) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 5. DYNAMIC FINTECH FLOATING DATA RAYS (The drifting nodes) */}
      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Floating background nodes connected by vector curves */}
        <motion.path
          d="M 100,200 Q 300,100 600,250 T 1100,150"
          fill="none"
          stroke="url(#grid-grad)"
          strokeWidth="1.5"
          strokeDasharray="5 15"
          animate={{ strokeDashoffset: [0, -100] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />

        <motion.path
          d="M 50,550 Q 400,650 800,450 T 1300,500"
          fill="none"
          stroke="url(#grid-grad)"
          strokeWidth="1.2"
          strokeDasharray="6 12"
          animate={{ strokeDashoffset: [0, 80] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* 6. CORNER ACCENT: Geometric Radar Rings */}
      <div className="absolute -top-36 -left-36 w-96 h-96 opacity-[0.08] lg:opacity-[0.14] border border-dashed rounded-full border-emerald-400 flex items-center justify-center animate-[spin_180s_linear_infinite]">
        <div className="w-80 h-80 border border-emerald-500 rounded-full flex items-center justify-center">
          <div className="w-64 h-64 border border-dashed border-cyan-500 rounded-full" />
        </div>
      </div>

      {/* 7. DIGITAL WEALTH CHAOS DRIFT (Particles running upwards) */}
      {particles.map((p) => {
        return (
          <motion.span
            key={p.id}
            initial={{ opacity: 0, y: `${p.y}%`, x: `${p.x}%` }}
            animate={{
              y: [`${p.y}%`, `${(p.y - 30 + 100) % 100}%`],
              opacity: [0, 0.45, 0.45, 0.2, 0],
            }}
            transition={{
              duration: p.speed,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute select-none font-mono font-bold select-none tracking-tighter"
            style={{
              fontSize: `${p.size}px`,
              color: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.35)',
              textShadow: isDark ? '0 0 8px rgba(16, 185, 129, 0.25)' : 'none',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {p.char}
          </motion.span>
        );
      })}
    </div>
  );
}
