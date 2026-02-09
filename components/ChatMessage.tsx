
import React from 'react';
import { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
          isUser 
            ? 'bg-blue-600 border-blue-500 text-white' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
        }`}>
          {isUser ? 'U' : 'P'}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-blue-600/10 text-zinc-100 border border-blue-500/30' 
              : 'bg-zinc-900/50 text-zinc-300 border border-zinc-800/50'
          }`}>
            <MarkdownRenderer content={message.content} />
            {message.isStreaming && (
              <span className="inline-block w-1 h-4 ml-1 bg-zinc-500 animate-pulse align-middle" />
            )}
          </div>
          <span className="mt-2 text-[10px] text-zinc-600 font-medium uppercase tracking-widest px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
