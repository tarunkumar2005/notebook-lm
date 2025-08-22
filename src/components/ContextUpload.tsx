"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CldUploadWidget } from "next-cloudinary";
import { useSourcesStore, Source } from "@/store/useSourcesStore";
import axios from "axios";
import {
  Upload,
  FileText,
  Globe,
  Type,
  X,
  CheckCircle,
  FolderOpen,
  Link,
  Zap,
  ExternalLink,
  Search,
  Trash2,
} from "lucide-react";

export default function ContextUpload() {
  const { sources, addSource, removeSource } = useSourcesStore();

  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [activeInput, setActiveInput] = useState<"text" | "url" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getTypeIcon = (type: Source["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "text":
        return <Type className="h-4 w-4 text-blue-500" />;
      case "url":
        return <Globe className="h-4 w-4 text-green-500" />;
    }
  };

  const filteredFiles = sources.filter(
    (source) =>
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSource = async (source: Source) => {
    try {
      const response = await axios.post('/api/rag/index', source);
      if (response.status === 200) {
        addSource(source);
      } else {
        alert(`Failed to index source: ${source.name}`);
      }
    } catch (error) {
      alert(`Failed to index source: ${source.name}`);
    }
  };

  const handleRemoveSource = async (id: string) => {
    try {
      const response = await axios.delete(`/api/rag/deindex`, { data: { sourceId: id } });
      if (response.status === 200) {
        removeSource(id);
      } else {
        alert(`Failed to deindex source: ${id}`);
      }
    } catch (error) {
      alert(`Failed to deindex source: ${id}`);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-400 shadow-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <FolderOpen className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Knowledge Sources
            </h2>
            <p className="text-xs text-gray-500">
              Upload documents or add content
            </p>
          </div>
          {sources.length > 0 && (
            <div className="ml-auto px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
              {sources.length} source{sources.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="flex-shrink-0 px-6 py-4 bg-gray-50/50">
        {/* Main Upload Area */}
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result) => {
            const file = result.info as any;
            handleAddSource({
              id: crypto.randomUUID(),
              type: "pdf",
              content: file.secure_url,
              name: file.original_filename || "Uploaded File",
              isIndexed: false,
              createdAt: new Date(),
            });
          }}
          options={{
            clientAllowedFormats: ["pdf"],
          }}
          onError={(error) => {
            console.error("Upload error:", error);
            // Handle error appropriately
          }}
          onQueuesEnd={(result, { widget }) => {
            widget.close();
          }}
        >
          {({ open }) => {
            function handleFileUploadClick() {
              open();
            }
            return (
              <motion.div
                className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-300 mb-3 border-gray-300 hover:border-pink-300 hover:bg-pink-50/50`}
                whileHover={{ scale: 1.01 }}
                onClick={handleFileUploadClick}
              >
                <Upload className="h-6 w-6 mx-auto mb-2 text-pink-500" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Upload Documents
                </p>
                <p className="text-xs text-gray-500">
                  Drag & drop or click to browse
                </p>
              </motion.div>
            );
          }}
        </CldUploadWidget>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setActiveInput(activeInput === "text" ? null : "text")
            }
            className="h-8 text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Add Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveInput(activeInput === "url" ? null : "url")}
            className="h-8 text-xs"
          >
            <Globe className="h-3 w-3 mr-1" />
            Add URL
          </Button>
        </div>

        {/* Input Forms */}
        <AnimatePresence>
          {activeInput === "text" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <Textarea
                placeholder="Paste your text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="h-16 text-xs resize-none"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    handleAddSource({
                      id: crypto.randomUUID(),
                      type: "text",
                      content: textInput,
                      name: "Uploaded Text",
                      isIndexed: false,
                      createdAt: new Date(),
                    });
                    setTextInput("");
                  }}
                  disabled={!textInput.trim()}
                  size="sm"
                  className="text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Add
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

          {activeInput === "url" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <Input
                placeholder="https://example.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="text-xs"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    handleAddSource({
                      id: crypto.randomUUID(),
                      type: "url",
                      content: urlInput,
                      name: urlInput,
                      isIndexed: false,
                      createdAt: new Date(),
                    });
                    setUrlInput("");
                  }}
                  disabled={!urlInput.trim()}
                  size="sm"
                  className="text-xs"
                >
                  <Link className="h-3 w-3 mr-1" />
                  Add
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
      </div>

      {/* Files List */}
      <div className="flex-1 min-h-0">
        {sources.length > 0 ? (
          <div className="h-full flex flex-col">
            {/* Search */}
            <div className="flex-shrink-0 px-6 py-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-7 text-xs"
                />
              </div>
            </div>

            {/* Scrollable Files */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  <AnimatePresence>
                    {filteredFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="group"
                      >
                        <Card className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <div className="flex-shrink-0">
                                  {getTypeIcon(file.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <div className="transition-opacity flex items-center space-x-1">
                                  {file.type === "url" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        window.open(file.content, "_blank")
                                      }
                                      className="h-6 w-6 p-0"
                                    >
                                      <ExternalLink className="h-3 w-3 text-gray-500" />
                                    </Button>
                                  )}
                                  <CheckCircle
                                    className="h-5 w-5 text-green-500"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSource(file.id)}
                                    className="h-6 w-6 p-0 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty Search State */}
                  {searchQuery && filteredFiles.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No documents found matching "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                No documents uploaded
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Upload PDFs, add text content, or index websites to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
