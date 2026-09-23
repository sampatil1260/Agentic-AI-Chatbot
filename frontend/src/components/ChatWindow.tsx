import React, { useRef, useEffect } from 'react';
import { Message } from '../types/chat';
import ChatMessage from './ChatMessage';
import SuggestedQuestions from './SuggestedQuestions';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onQuestionClick: (question: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onQuestionClick }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl w-full">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-db-blue">
              <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">How can I help you today?</h2>
          <p className="text-gray-500 mb-8">Ask a question about our products, documentation, or your account.</p>
          <SuggestedQuestions onQuestionClick={onQuestionClick} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex w-full justify-start mb-6">
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-db-blue flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" />
                </svg>
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm rounded-tl-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
