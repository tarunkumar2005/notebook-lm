"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageCircle,
  Brain,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Globe,
  Type,
} from "lucide-react";

interface Source {
  index: number;
  relevanceScore: number;
  preview: string;
  metadata: {
    sourceName: string;
    sourceType: string;
    chunkIndex: number;
  };
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
  sources?: Source[]; // Updated to use Source interface
  error?: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm your AI assistant powered by advanced RAG technology. I can help you analyze and discuss the content you've uploaded. Upload some documents to get started, and I'll be able to provide insights based on your specific content.",
      role: "assistant",
      timestamp: new Date(),
      sources: [],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: "typing",
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages((prev) => [...prev, typingMessage]);

    try {
      // Call the RAG API
      const response = await fetch('/api/rag/retriver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: currentQuery }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          content: data.answer,
          role: "assistant",
          timestamp: new Date(),
          sources: data.sources,
        };

        setMessages((prev) =>
          prev
            .filter((msg) => msg.id !== "typing")
            .concat(assistantMessage)
        );
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error calling RAG API:', error);
      
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        error: true,
        sources: [],
      };

      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== "typing")
          .concat(errorMessage)
      );
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'pdf':
        return <FileText className="h-3 w-3" />;
      case 'url':
        return <Globe className="h-3 w-3" />;
      case 'text':
        return <Type className="h-3 w-3" />;
      default:
        return <Bot className="h-3 w-3" />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header - Fixed Height */}
      <div className="flex-shrink-0 border-b border-pink-100/50" style={{ height: '100px' }}>
        <CardHeader className="h-full flex justify-center py-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(236, 72, 153, 0.3)",
                    "0 0 30px rgba(236, 72, 153, 0.5)",
                    "0 0 20px rgba(236, 72, 153, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <span className="gradient-text-pink text-xl font-bold">
                  AI Assistant
                </span>
                <div className="flex items-center space-x-2 text-sm mt-1">
                  <motion.div 
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-green-600 font-medium">Online</span>
                  <span className="text-gray-500">•</span>
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className="text-gray-500">RAG Enhanced</span>
                </div>
              </div>
            </div>
            
            <motion.div
              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm rounded-full shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {messages.filter(m => !m.isTyping).length} messages
            </motion.div>
          </CardTitle>
        </CardHeader>
      </div>

      {/* Messages Area - Takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <CardContent className="p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    className={`flex items-start space-x-3 group ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <motion.div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-blue-400"
                          : message.error
                          ? "bg-gradient-to-r from-red-500 to-red-400"
                          : "bg-gradient-to-r from-pink-500 to-pink-400"
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {message.role === "user" ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <Bot className="h-5 w-5 text-white" />
                      )}
                    </motion.div>

                    {/* Message Content */}
                    <div className={`flex-1 max-w-[75%] ${
                      message.role === "user" ? "text-right" : ""
                    }`}>
                      <motion.div
                        className={`inline-block p-3 rounded-2xl shadow-lg micro-lift ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white"
                            : message.error
                            ? "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200"
                            : "glass-card text-gray-800"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        {message.isTyping ? (
                          <div className="flex items-center space-x-2">
                            <LoadingSpinner size="sm" variant="dots" />
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            
                            {/* Message Metadata for Assistant */}
                            {message.role === "assistant" && !message.error && (
                              <div className="mt-3 pt-2 border-t border-gray-200/50">
                                <div className="flex items-center justify-between">
                                  {/* Sources */}
                                  {message.sources && message.sources.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      <span className="text-xs font-medium text-gray-600 mr-1">
                                        Sources ({message.sources.length}):
                                      </span>
                                      {message.sources.map((source, idx) => (
                                        <motion.div
                                          key={idx}
                                          className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs rounded-full border border-pink-200"
                                          whileHover={{ scale: 1.05, y: -1 }}
                                          transition={{ duration: 0.2 }}
                                          title={`Relevance: ${(source.relevanceScore * 100).toFixed(1)}%`}
                                        >
                                          {getSourceIcon(source.metadata.sourceType)}
                                          <span>{source.metadata.sourceName}</span>
                                          <span className="text-pink-500 font-mono">
                                            {(source.relevanceScore * 100).toFixed(0)}%
                                          </span>
                                        </motion.div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Action Buttons */}
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyMessage(message.content)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                      
                      {/* Timestamp */}
                      <p className={`text-xs text-gray-500 mt-1 ${
                        message.role === "user" ? "text-right" : ""
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed Height */}
      <div className="flex-shrink-0 border-t border-pink-100/50" style={{ height: '120px' }}>
        <div className="p-4 h-full flex flex-col justify-center">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your uploaded content..."
                className="pr-12 focus-ring-advanced glass-morphism py-3 text-sm"
                disabled={isLoading}
              />
              <motion.div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-pink-400" />
              </motion.div>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-12 w-12"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span>GPT-4o</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Brain className="h-3 w-3" />
                <span>RAG Enhanced</span>
              </span>
            </div>
            
            {isTyping && (
              <motion.div
                className="flex items-center space-x-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                <span>AI is thinking</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}