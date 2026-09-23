import React from 'react';
import { Conversation } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30 w-72 bg-db-dark text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Section */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-db-red">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <div>
              <h1 className="font-bold text-lg leading-tight">Databricks AI</h1>
              <span className="text-xs text-gray-300">Customer Support</span>
            </div>
            {/* Mobile close button */}
            <button className="md:hidden ml-auto text-gray-300 hover:text-white" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <button 
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Middle Section: Chat History */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                activeId === conv.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="truncate text-sm text-gray-200">{conv.title}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1"
                title="Delete chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="p-4 text-xs text-gray-400 flex items-center justify-center gap-2 border-t border-gray-800">
          Powered by 
          <span className="font-semibold text-gray-200">Databricks</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
