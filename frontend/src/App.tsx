import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './pages/Chat';
import { Conversation, Message } from './types/chat';
import { sendMessage as apiSendMessage } from './services/api';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const createNewChat = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
    setSidebarOpen(false);
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (activeConversationId === id) {
      setActiveConversationId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const sendMessage = async (text: string) => {
    let currentConversationId = activeConversationId;
    if (!currentConversationId) {
      const newConversation: Conversation = {
        id: uuidv4(),
        title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setConversations(prev => [newConversation, ...prev]);
      currentConversationId = newConversation.id;
      setActiveConversationId(currentConversationId);
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setConversations(prev => prev.map(c => {
      if (c.id === currentConversationId) {
        return {
          ...c,
          messages: [...c.messages, userMessage],
          updatedAt: new Date(),
          title: c.messages.length === 0 ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : c.title
        };
      }
      return c;
    }));

    setIsLoading(true);

    try {
      const response = await apiSendMessage({ message: text, conversationId: currentConversationId });
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
        queryType: response.queryType
      };

      setConversations(prev => prev.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [...c.messages, assistantMessage],
            updatedAt: new Date()
          };
        }
        return c;
      }));
    } catch (error: any) {
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: error.message || 'An error occurred while communicating with the assistant.',
        timestamp: new Date(),
        isError: true
      };
      setConversations(prev => prev.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [...c.messages, errorMessage],
            updatedAt: new Date()
          };
        }
        return c;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-screen bg-db-gray text-slate-800 font-sans overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onNewChat={createNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col h-full w-full">
        <Chat
          messages={activeConversation?.messages || []}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          onNewChat={createNewChat}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}

export default App;
