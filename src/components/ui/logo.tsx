"use client";

import React from "react";
import { motion } from "framer-motion";

export function Logo({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative`}
      whileHover={{ 
        rotate: 360,
        scale: 1.1,
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Outer Ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-0.5"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          {/* Inner Content */}
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Brain Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'}`}
            >
              <motion.path
                d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73C13.6 6.07 14 6.74 14 7.5C14 8.33 13.33 9 12.5 9H11.5C10.67 9 10 8.33 10 7.5C10 6.74 10.4 6.07 11 5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z"
                fill="url(#gradient1)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
              <motion.path
                d="M9 10C9.55 10 10 10.45 10 11V13C10 13.55 9.55 14 9 14C8.45 14 8 13.55 8 13V11C8 10.45 8.45 10 9 10Z"
                fill="url(#gradient2)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
              />
              <motion.path
                d="M15 10C15.55 10 16 10.45 16 11V13C16 13.55 15.55 14 15 14C14.45 14 14 13.55 14 13V11C14 10.45 14.45 10 15 10Z"
                fill="url(#gradient3)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }}
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Floating Dots */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-pink-400 rounded-full"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${30 + i * 20}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
