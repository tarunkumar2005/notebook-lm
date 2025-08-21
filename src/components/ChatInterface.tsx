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

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
  sources?: string[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm your AI assistant powered by advanced RAG technology. I can help you analyze and discuss the content you've uploaded. Upload some documents to get started, and I'll be able to provide insights based on your specific content.",
      role: "assistant",
      timestamp: new Date(),
      sources: ["System"],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fixed: Simple scroll function without useCallback
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

  // Fixed: Only depend on messages length, not the function
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages.length]); // Only messages.length as dependency

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    // Simulate typing indicator
    const typingMessage: Message = {
      id: "typing",
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages((prev) => [...prev, typingMessage]);

    // Simulate AI response with more realistic document references
    setTimeout(() => {
      const responses = [
        {
          content: "Based on the documents you've uploaded, I can see several key themes emerging. Let me analyze the content and provide you with specific insights from your sources. The information suggests that...",
          sources: ["Document_1.pdf", "Text Document 1", "example.com"],
        },
        {
          content: "That's an excellent question! From analyzing your uploaded content, I found relevant information across multiple sources. Here's what the data shows, with specific references to the sections that support this analysis...",
          sources: ["Website: docs.example.com", "Research_Paper.pdf"],
        },
        {
          content: "I've processed your query against the vector database and found several matching passages. The most relevant information comes from your uploaded documents, particularly focusing on the key concepts you've asked about...",
          sources: ["Text Document 2", "Technical_Guide.pdf", "blog.example.com"],
        },
        {
          content: "Great question! The documents you've shared contain valuable insights on this matter. Let me synthesize the key findings from across your knowledge base and provide you with a comprehensive answer...",
          sources: ["Manual.pdf", "Text Document 1"],
        },
        {
          content: "I can see from your uploaded sources that this topic is covered extensively. Let me break down the information I found and cross-reference it with the different documents to give you the most accurate response...",
          sources: ["research.example.com", "Whitepaper.pdf", "Text Document 3"],
        },
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== "typing")
          .concat({
            id: Math.random().toString(36).substr(2, 9),
            content: randomResponse.content,
            role: "assistant",
            timestamp: new Date(),
            sources: randomResponse.sources,
          })
      );
      setIsLoading(false);
      setIsTyping(false);
    }, 2000);
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
                  <span className="text-gray-500">GPT-4o</span>
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
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                            
                            {/* Message Metadata for Assistant */}
                            {message.role === "assistant" && (
                              <div className="mt-3 pt-2 border-t border-gray-200/50">
                                <div className="flex items-center justify-between">
                                  {/* Sources - Enhanced display */}
                                  {message.sources && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      <span className="text-xs font-medium text-gray-600 mr-1">Sources:</span>
                                      {message.sources.map((source, idx) => (
                                        <motion.div
                                          key={idx}
                                          className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs rounded-full border border-pink-200"
                                          whileHover={{ scale: 1.05, y: -1 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          {source.includes('.pdf') && <FileText className="h-3 w-3" />}
                                          {source.includes('.com') && <Globe className="h-3 w-3" />}
                                          {source.includes('Text Document') && <Type className="h-3 w-3" />}
                                          {source === 'System' && <Bot className="h-3 w-3" />}
                                          <span>{source}</span>
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
                <span>AI is typing</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
