import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, FileText } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  file?: File;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        `That's an interesting question about "${userMessage}". Let me help you with that.`,
        `I understand you're asking about "${userMessage}". Here's what I can tell you...`,
        `Thanks for sharing that with me. Regarding "${userMessage}", I'd suggest considering multiple perspectives.`,
        `Great question! Based on what you've asked about "${userMessage}", here are some key points to consider.`,
        `I'd be happy to help you with "${userMessage}". Let me break this down for you.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: randomResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() && !uploadedFile) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      file: uploadedFile || undefined,
    };
    
    setMessages(prev => [...prev, userMessage]);
    simulateAIResponse(inputValue.trim() || 'a document');
    setInputValue('');
    setUploadedFile(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-100 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_50%)] opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.3),transparent_50%)]" />
      
      {/* Header */}
      <div className="relative z-10 px-12 py-8">
        <h1 className="text-lg font-bold text-pink-800">DealGPT</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 drop-shadow-sm">
              {getGreeting()}, I'm your DEAL assistant.
            </h2>
            <p className="text-gray-700 text-lg">How can I help you?</p>
          </div>
        ) : (
          /* Messages Area */
          <div className="w-full max-w-4xl flex-1 overflow-y-auto px-6 py-4 space-y-4 mb-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 backdrop-blur-sm ${
                    message.type === 'user'
                      ? 'bg-white/60 text-gray-800 border border-white/50 shadow-lg'
                      : 'bg-white/40 text-gray-800 border border-white/40 shadow-lg'
                  }`}
                >
                  {message.file && (
                    <div className="mb-2 p-2 bg-white/30 rounded-lg flex items-center space-x-2 text-sm">
                      <FileText className="w-4 h-4" />
                      <span className="flex-1 truncate">{message.file.name}</span>
                      <span className="text-xs opacity-70">
                        {formatFileSize(message.file.size)}
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className="text-xs opacity-60 mt-2">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/40 border border-white/40 rounded-2xl px-4 py-3 max-w-[80%] backdrop-blur-sm shadow-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area - Always Centered */}
        <div className="w-full max-w-2xl px-4">
          {/* File Upload Preview */}
          {uploadedFile && (
            <div className="mb-3 p-3 bg-white/50 backdrop-blur-lg rounded-lg flex items-center justify-between border border-white/60 shadow-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-gray-800 font-medium truncate max-w-xs">
                    {uploadedFile.name}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
          
          {/* Input Box */}
          <div className="relative">
            <div className="bg-white/50 backdrop-blur-lg border border-white/60 rounded-2xl shadow-2xl">
              <div className="flex items-end">
                {/* Attach Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 text-gray-600 hover:text-gray-800 hover:bg-white/20 rounded-l-2xl transition-all duration-200"
                  title="Upload document"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                {/* Text Input */}
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent px-4 py-4 text-gray-800 placeholder-gray-500 resize-none focus:outline-none max-h-32 min-h-[56px]"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
                
                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() && !uploadedFile}
                  className={`p-4 rounded-r-2xl transition-all duration-200 ${
                    inputValue.trim() || uploadedFile
                      ? 'bg-white/40 hover:bg-white/60 text-gray-800 shadow-lg'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx"
          />
        </div>
      </div>
    </div>
  );
}

export default App;