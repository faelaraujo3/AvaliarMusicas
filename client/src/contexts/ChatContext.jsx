import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen]       = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingChatUser, setPendingChatUser] = useState(null); // abre direto num chat

  const refreshUnread = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    try {
      const res  = await fetch(`http://localhost:5000/api/chat/conversas/${user.id_user}`);
      const data = await res.json();
      const total = Array.isArray(data)
        ? data.reduce((acc, c) => acc + (c.nao_lidas || 0), 0)
        : 0;
      setUnreadCount(total);
    } catch {
      // silencioso
    }
  }, [user]);

  // Polling leve de badge (a cada 15 s)
  useEffect(() => {
    refreshUnread();
    const id = setInterval(refreshUnread, 15000);
    return () => clearInterval(id);
  }, [refreshUnread]);

  const openChat = (chatUser = null) => {
    setPendingChatUser(chatUser);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setPendingChatUser(null);
  };

  const toggleChat = () => (isOpen ? closeChat() : openChat());

  return (
    <ChatContext.Provider
      value={{ isOpen, openChat, closeChat, toggleChat, unreadCount, setUnreadCount, pendingChatUser, setPendingChatUser, refreshUnread }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
