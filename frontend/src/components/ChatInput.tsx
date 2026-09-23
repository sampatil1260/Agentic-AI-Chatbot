import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 w-full shrink-0">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-white rounded-xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-db-blue focus-within:border-transparent p-1 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about our products..."
          disabled={isLoading}
          className="w-full max-h-[150px] bg-transparent border-none focus:ring-0 resize-none py-3 pl-4 pr-12 text-sm text-gray-800 disabled:opacity-50"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors flex items-center justify-center
            ${input.trim() && !isLoading ? 'bg-db-blue text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-400'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <div className="max-w-4xl mx-auto text-center mt-2">
        <span className="text-[11px] text-gray-400">Press Enter to send, Shift + Enter for new line. AI can make mistakes.</span>
      </div>
    </div>
  );
};

export default ChatInput;
