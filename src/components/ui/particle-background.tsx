"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
  className?: string;
}

export function ParticleBackground({
  particleCount = 50,
  colors = ["#ec4899", "#f472b6", "#a855f7", "#3b82f6"],
  className = ""
}: ParticleBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Memoize colors to prevent unnecessary re-renders
  const memoizedColors = useMemo(() => colors, [colors.join(',')]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        color: memoizedColors[Math.floor(Math.random() * memoizedColors.length)],
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      });
    }
    
    setParticles(newParticles);
  }, [particleCount, memoizedColors]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, particle.x * 0.5 - 25, 0], // Use particle's x instead of random
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
