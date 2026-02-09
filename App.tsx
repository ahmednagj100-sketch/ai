
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './types';
import { createGeminiChat, streamChatResponse } from './services/gemini';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello! I'm Pulse, your advanced Gemini assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check if API Key is selected on mount
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  // Initialize chat when key is present
  useEffect(() => {
    if (hasKey) {
      chatRef.current = createGeminiChat();
      inputRef.current?.focus();
    }
  }, [hasKey]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOpenKeySelector = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per race condition mitigation guidelines
      setHasKey(true);
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const tempAiMessageId = uuidv4();
    const initialAiMessage: Message = {
      id: tempAiMessageId,
      role: 'model',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, initialAiMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Create chat if it doesn't exist
      if (!chatRef.current) {
        chatRef.current = createGeminiChat();
      }

      await streamChatResponse(chatRef.current, userMessage.content, (text) => {
        setMessages(prev => prev.map(msg => 
          msg.id === tempAiMessageId 
            ? { ...msg, content: text } 
            : msg
        ));
      });

      setMessages(prev => prev.map(msg => 
        msg.id === tempAiMessageId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));
    } catch (err: any) {
      const errorMsg = err.message || "Failed to communicate with the AI.";
      
      // Handle the "Requested entity was not found" error by prompting for key re-selection
      if (errorMsg.includes("Requested entity was not found")) {
        setError("Your API key session has expired or is invalid. Please re-select your key.");
        setHasKey(false);
      } else {
        setError(errorMsg);
      }
      
      setMessages(prev => prev.filter(msg => msg.id !== tempAiMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-zinc-300 p-6">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Unlock Gemini Pulse</h1>
        <p className="text-zinc-500 text-center max-w-md mb-8 leading-relaxed">
          Pulse uses the high-performance Gemini 3 Pro model. To begin, please connect your Google Cloud project with billing enabled.
        </p>
        <button
          onClick={handleOpenKeySelector}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-600/20 flex items-center gap-3 group"
        >
          <span>Connect with API Key</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 text-sm text-zinc-600 hover:text-zinc-400 underline underline-offset-4 transition-colors"
        >
          Learn about API billing & projects
        </a>
      </div>
    );
  }

  if (hasKey === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-zinc-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">Gemini Pulse</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase">Encrypted Session</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMessages([messages[0]])}
            className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors tracking-widest"
          >
            RESET
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 md:px-0 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {error && (
            <div className="p-4 mb-8 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
              {error.includes("re-select your key") && (
                <button 
                  onClick={handleOpenKeySelector}
                  className="ml-auto bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-400 transition-colors font-bold text-xs uppercase"
                >
                  Select Key
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer / Input Area */}
      <footer className="p-4 border-t border-zinc-900 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-2xl py-4 pl-4 pr-14 text-zinc-100 placeholder-zinc-600 resize-none outline-none transition-all duration-200 min-h-[56px] max-h-[200px]"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all duration-200 ${
                !inputValue.trim() || isLoading 
                  ? 'bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-3 text-[10px] text-center text-zinc-600 font-medium tracking-widest uppercase">
            Powered by Gemini 3 Pro · Premium AI Tier
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
