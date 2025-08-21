"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CldUploadButton } from 'next-cloudinary';
import {
  Upload,
  FileText,
  Globe,
  Type,
  X,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Link,
  Zap,
  Plus,
  File,
  Eye,
  Calendar,
  Hash,
  ExternalLink,
  Search,
  Trash2,
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type: "pdf" | "text" | "url";
  content?: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  size?: string;
  chunks?: number;
  uploadDate?: Date;
  lastModified?: Date;
  preview?: string;
  wordCount?: number;
}

export default function ContextUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [activeInput, setActiveInput] = useState<"text" | "url" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type === "application/pdf" ? "pdf" : "text",
        status: "uploading",
        progress: 0,
        size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        chunks: Math.ceil(file.size / 1000),
        uploadDate: new Date(),
        lastModified: new Date(file.lastModified),
        wordCount: Math.floor(Math.random() * 5000) + 500,
        preview: file.type === "text/plain" ? "Text content preview will appear here..." : undefined,
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 8;
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id
              ? {
                  ...f,
                  progress: Math.min(progress, 100),
                  status: progress >= 100 ? "processing" : "uploading",
                }
              : f
          )
        );

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === newFile.id
                  ? { ...f, status: "completed", progress: 100 }
                  : f
              )
            );
          }, 1200);
        }
      }, 180);
    });
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Text Document ${uploadedFiles.filter(f => f.type === 'text').length + 1}`,
      type: "text",
      content: textInput,
      status: "processing",
      progress: 70,
      size: `${(textInput.length / 1024).toFixed(1)}KB`,
      chunks: Math.ceil(textInput.length / 500),
      uploadDate: new Date(),
      wordCount: textInput.split(' ').length,
      preview: textInput.substring(0, 100) + (textInput.length > 100 ? "..." : ""),
    };

    setUploadedFiles((prev) => [...prev, newFile]);
    setTextInput("");
    setActiveInput(null);

    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id
            ? { ...f, status: "completed", progress: 100 }
            : f
        )
      );
    }, 800);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: new URL(urlInput).hostname,
      type: "url",
      status: "processing",
      progress: 40,
      content: urlInput,
      chunks: Math.floor(Math.random() * 10) + 5,
      uploadDate: new Date(),
      wordCount: Math.floor(Math.random() * 3000) + 1000,
      preview: `Website content from ${new URL(urlInput).hostname}`,
    };

    setUploadedFiles((prev) => [...prev, newFile]);
    setUrlInput("");
    setActiveInput(null);

    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id
            ? { ...f, status: "completed", progress: 100 }
            : f
        )
      );
    }, 1500);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return <LoadingSpinner size="sm" variant="default" />;
      case "processing":
        return <LoadingSpinner size="sm" variant="pulse" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTypeIcon = (type: UploadedFile["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "text":
        return <Type className="h-5 w-5 text-blue-500" />;
      case "url":
        return <Globe className="h-5 w-5 text-green-500" />;
    }
  };

  const getTypeColor = (type: UploadedFile["type"]) => {
    switch (type) {
      case "pdf":
        return "from-red-500 to-red-400";
      case "text":
        return "from-blue-500 to-blue-400";
      case "url":
        return "from-green-500 to-green-400";
    }
  };

  const filteredFiles = uploadedFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden scroll-container">
      {/* Enhanced Header */}
      <div className="h-20 flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 relative z-30">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <FolderOpen className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Knowledge Sources</h2>
              <p className="text-xs text-gray-600 mt-0.5">Upload PDFs, text files, or index websites</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {uploadedFiles.length > 0 && (
              <motion.div 
                className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-xs rounded-full font-medium shadow-lg"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {uploadedFiles.length} {uploadedFiles.length === 1 ? 'source' : 'sources'}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="h-64 flex-shrink-0 px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 relative z-20 upload-section">
        {/* <motion.div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 mb-4 drag-area ${
            isDragging
              ? "border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 scale-[1.01]"
              : "border-gray-300 hover:border-pink-300 hover:bg-gradient-to-br hover:from-pink-50/50 hover:to-purple-50/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Input
            type="file"
            accept=".pdf,.txt"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <motion.div
            animate={isDragging ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
            className="pointer-events-none"
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-pink-500" />
          </motion.div>
          <h4 className="text-base font-semibold text-gray-800 mb-2 pointer-events-none">Upload Your Documents</h4>
          <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto pointer-events-none">
            Drag & drop PDF or text files here, or click to browse
          </p>
          <Button variant="outline" className="pointer-events-none px-4 py-2 text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </motion.div> */}

        <CldUploadButton uploadPreset="<Upload Preset>" />

        {/* Alternative Options */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
              activeInput === "text" 
                ? "border-blue-400 bg-blue-50 shadow-md" 
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
            }`}
            onClick={() => setActiveInput(activeInput === "text" ? null : "text")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Type className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Add Text</h4>
                <p className="text-xs text-gray-600">Paste content directly</p>
              </div>
            </div>
            
            <AnimatePresence>
              {activeInput === "text" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Textarea
                    placeholder="Paste your text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="h-20 text-sm resize-none border-blue-200"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim()}
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Add Text
                    </Button>
                    <Button
                      onClick={() => setActiveInput(null)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
              activeInput === "url" 
                ? "border-green-400 bg-green-50 shadow-md" 
                : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
            }`}
            onClick={() => setActiveInput(activeInput === "url" ? null : "url")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Index Website</h4>
                <p className="text-xs text-gray-600">Scrape website content</p>
              </div>
            </div>
            
            <AnimatePresence>
              {activeInput === "url" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Input
                    placeholder="https://example.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="text-sm border-green-200"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleUrlSubmit}
                      disabled={!urlInput.trim()}
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      <Link className="h-3 w-3 mr-1" />
                      Index URL
                    </Button>
                    <Button
                      onClick={() => setActiveInput(null)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Files List */}
      <div className="flex-1 min-h-0 relative z-10 files-section">
        {uploadedFiles.length > 0 && (
          <div className="h-full flex flex-col">
            {/* Files Header with Search */}
            <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                  <File className="h-4 w-4 mr-2 text-pink-500" />
                  Uploaded Sources ({filteredFiles.length})
                </h3>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm border-gray-200 h-8"
                />
              </div>
            </div>
            
            {/* Files Grid */}
            <div className="flex-1 min-h-0 bg-gray-50/30 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3 animate-presence-container">
                  <AnimatePresence>
                    {filteredFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group"
                      >
                        <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 overflow-hidden">
                          {/* File Header */}
                          <div className="flex items-center justify-between p-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <motion.div 
                                className={`p-2 rounded-lg bg-gradient-to-r ${getTypeColor(file.type)} shadow-sm flex-shrink-0`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                {getTypeIcon(file.type)}
                              </motion.div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                  {file.name}
                                </h4>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                                  <span className="capitalize">{file.type}</span>
                                  {file.size && <span>• {file.size}</span>}
                                  {file.wordCount && <span>• {file.wordCount.toLocaleString()} words</span>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {getStatusIcon(file.status)}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                {file.type === "url" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(file.content, '_blank')}
                                    className="h-7 w-7 p-0"
                                  >
                                    <ExternalLink className="h-3 w-3 text-gray-500" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                >
                                  <Eye className="h-3 w-3 text-gray-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                  className="h-7 w-7 p-0 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* File Content Preview */}
                          {file.preview && file.status === "completed" && (
                            <div className="px-3 py-2 bg-gray-50/50">
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {file.preview}
                              </p>
                            </div>
                          )}
                          
                          {/* Progress Bar for Uploading Files */}
                          {file.status !== "completed" && (
                            <div className="px-3 py-2 bg-gray-50/50">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {file.status === "uploading" ? "Uploading..." : "Processing..."}
                                </span>
                                <span className="text-xs text-gray-500">{Math.round(file.progress)}%</span>
                              </div>
                              <Progress value={file.progress} className="h-1.5" />
                            </div>
                          )}
                          
                          {/* File Metadata */}
                          {file.status === "completed" && (
                            <div className="px-3 py-2 bg-gray-50/30 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-3">
                                  {file.uploadDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Added {formatDate(file.uploadDate)}</span>
                                    </div>
                                  )}
                                  {file.chunks && (
                                    <div className="flex items-center space-x-1">
                                      <Hash className="h-3 w-3" />
                                      <span>{file.chunks} chunks</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span>Indexed</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Empty State for Search */}
                  {searchQuery && filteredFiles.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No documents found matching "{searchQuery}"</p>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {uploadedFiles.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700 mb-2">No documents uploaded yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Upload PDFs, add text content, or index websites to get started with your AI assistant.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
