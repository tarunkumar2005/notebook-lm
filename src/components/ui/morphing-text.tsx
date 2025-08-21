"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MorphingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
  typewriter?: boolean;
  gradient?: boolean;
}

export function MorphingText({
  texts,
  interval = 3000,
  className,
  typewriter = false,
  gradient = false
}: MorphingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!typewriter) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [texts.length, interval, typewriter]);

  useEffect(() => {
    if (typewriter) {
      const currentText = texts[currentIndex];
      let charIndex = 0;
      setDisplayText("");
      setIsTyping(true);

      const typeTimer = setInterval(() => {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeTimer);
          
          setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % texts.length);
          }, interval);
        }
      }, 100);

      return () => clearInterval(typeTimer);
    }
  }, [currentIndex, texts, interval, typewriter]);

  if (typewriter) {
    return (
      <div className={cn("relative", className)}>
        <span className={cn(
          "font-bold",
          gradient && "gradient-text"
        )}>
          {displayText}
        </span>
        {isTyping && (
          <motion.span
            className="inline-block w-0.5 h-6 bg-pink-500 ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          transition={{
            duration: 0.5,
            ease: "easeInOut"
          }}
          className={cn(
            "inline-block font-bold",
            gradient && "gradient-text"
          )}
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
