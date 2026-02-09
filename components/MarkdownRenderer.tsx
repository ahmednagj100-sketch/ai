
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // A simplified renderer that handles basic markdown elements
  // In a production environment, you'd use react-markdown or similar.
  // For this implementation, we handle code blocks, bold, and line breaks.

  const renderContent = () => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
        const language = match?.[1] || 'code';
        const code = match?.[2] || '';
        
        return (
          <div key={index} className="my-4 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{language}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto mono text-sm leading-relaxed text-zinc-300">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      
      // Basic text processing: Bold and line breaks
      return part.split('\n').map((line, i) => (
        <p key={`${index}-${i}`} className="mb-2 last:mb-0">
          {line.split(/(\*\*.*?\*\*)/g).map((subPart, j) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={j} className="font-bold text-white">{subPart.slice(2, -2)}</strong>;
            }
            return subPart;
          })}
        </p>
      ));
    });
  };

  return <div className="text-zinc-300 leading-relaxed text-sm md:text-base">{renderContent()}</div>;
};

export default MarkdownRenderer;
