"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContextUpload from "@/components/ContextUpload";
import ChatInterface from "@/components/ChatInterface";
import { ParticleBackground } from "@/components/ui/particle-background";
import { MorphingText } from "@/components/ui/morphing-text";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const morphingTexts = [
    "NotebookLM",
    "RAG Assistant", 
    "AI Chat",
    "Smart Docs"
  ];

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <ParticleBackground particleCount={20} />
      
      {/* Main Container */}
      <div className="h-full flex flex-col relative z-10">
        {/* Improved Navbar */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-24 flex-shrink-0 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-pink-100/50"
        >
          <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
            {/* Left - Logo and Title */}
            <div className="flex items-center space-x-4">
              <Logo size="sm" />
              <div className="text-2xl font-bold text-gray-800">
                <MorphingText 
                  texts={morphingTexts}
                  interval={3000}
                  gradient={false}
                  className="text-gray-800"
                />
              </div>
            </div>

            {/* Right - Status */}
            <motion.div
              className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div 
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-gray-700">System Online</span>
            </motion.div>
          </div>
        </motion.header>

        {/* Main Content Area - Enhanced proportions */}
        <div className="flex-1 min-h-0 px-6 py-4 flex items-center justify-center">
          <div className="w-full max-w-[1400px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar - Context Upload - Enhanced size */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -30 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-5"
              >
                <div className="glass-card rounded-2xl shadow-xl border border-white/20" style={{ height: '650px', width: '100%' }}>
                  <ContextUpload />
                </div>
              </motion.div>

              {/* Right Side - Chat Interface - Enhanced size */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 30 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="lg:col-span-7"
              >
                <div className="glass-card rounded-2xl shadow-xl border border-white/20" style={{ height: '650px', width: '100%' }}>
                  <ChatInterface />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-white z-50 flex items-center justify-center"
          >
            <Logo size="lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
