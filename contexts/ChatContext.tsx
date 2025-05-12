// contexts/ChatContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createMessageSignature, isMessageProcessed } from '@/lib/messageUtils';

// Интерфейсы для типизации
interface Attachment {
  id: string;
  messageId: string;
  name: string;
  contentType: string;
  url: string;
  size: number;
  createdAt: string;
}

interface Message {
  id: string;
  chatId: string;
  role: string;
  content: string;
  rawJson?: any;
  createdAt: string;
  attachments: Attachment[];
}

interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentChatMessages: Message[];
  loadingChats: boolean;
  loadingCurrentChat: boolean;
  errorMessage: string | null;
  loadChats: () => Promise<void>;
  loadChat: (chatId: string) => Promise<Chat | null>;
  createNewChat: (title?: string) => Promise<string | null>;
  updateChatTitle: (chatId: string, title: string) => Promise<boolean>;
  deleteChat: (chatId: string) => Promise<boolean>;
  saveMessage: (chatId: string, message: any) => Promise<boolean>;
  clearCurrentChat: () => void;
  isDuplicateMessage: (message: any) => boolean;
}

// Создаем контекст
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider для контекста
export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChatMessages, setCurrentChatMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const [loadingCurrentChat, setLoadingCurrentChat] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Загрузка списка чатов
  const loadChats = async () => {
    if (!user) return;
    
    setLoadingChats(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/chats');
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки чатов: ${response.status}`);
      }
      
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      setErrorMessage('Не удалось загрузить список чатов');
      toast.error('Не удалось загрузить чаты');
    } finally {
      setLoadingChats(false);
    }
  };
  
  // Загрузка конкретного чата
  const loadChat = async (chatId: string): Promise<Chat | null> => {
    if (!user) return null;
    
    setLoadingCurrentChat(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      
      if (response.status === 404) {
        setCurrentChatId(null);
        setCurrentChatMessages([]);
        router.push('/');
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки чата: ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentChatId(data.chat.id);
      setCurrentChatMessages(data.chat.messages);
      
      // Обновляем список чатов, если чат уже был в списке
      setChats(prevChats => {
        const chatIndex = prevChats.findIndex(c => c.id === data.chat.id);
        if (chatIndex >= 0) {
          const updatedChats = [...prevChats];
          updatedChats[chatIndex] = data.chat;
          return updatedChats;
        }
        // Если чата не было в списке, добавляем его
        return [data.chat, ...prevChats];
      });
      
      return data.chat;
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
      setErrorMessage('Не удалось загрузить чат');
      toast.error('Не удалось загрузить чат');
      return null;
    } finally {
      setLoadingCurrentChat(false);
    }
  };
  
  // Создание нового чата
  const createNewChat = async (title?: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title || 'Новый чат' }),
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка создания чата: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Добавляем новый чат в список чатов
      setChats(prevChats => [data.chat, ...prevChats]);
      setCurrentChatId(data.chat.id);
      setCurrentChatMessages([]);
      
      return data.chat.id;
    } catch (error) {
      console.error('Ошибка создания чата:', error);
      toast.error('Не удалось создать новый чат');
      return null;
    }
  };
  
  // Обновление названия чата
  const updateChatTitle = async (chatId: string, title: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка обновления чата: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Обновляем список чатов
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId ? { ...chat, title } : chat
        )
      );
      
      return true;
    } catch (error) {
      console.error('Ошибка обновления чата:', error);
      toast.error('Не удалось обновить название чата');
      return false;
    }
  };
  
  // Удаление чата
  const deleteChat = async (chatId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка удаления чата: ${response.status}`);
      }
      
      // Удаляем чат из списка
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      // Если удаляли текущий чат, сбрасываем состояние
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setCurrentChatMessages([]);
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка удаления чата:', error);
      toast.error('Не удалось удалить чат');
      return false;
    }
  };
  
  // Проверка на дубликат сообщения
  const isDuplicateMessage = (message: any): boolean => {
    // Проверяем, есть ли уже сообщение с таким ID
    if (message.messageId && currentChatMessages.some(m => m.id === message.messageId)) {
      return true;
    }
    
    // Генерируем и проверяем сигнатуру
    const signature = createMessageSignature(message);
    return currentChatMessages.some(m => createMessageSignature(m) === signature);
  };
  
  // Сохранение сообщения
  const saveMessage = async (chatId: string, message: any): Promise<boolean> => {
    if (!user || !chatId) return false;
    
    // Если сообщение уже есть в чате, не добавляем его
    if (isDuplicateMessage(message)) {
      console.log('Дубликат сообщения, пропускаем');
      return true;
    }
    
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          rawJson: message.rawJson || message.parts || null,
          attachments: message.attachments || message.experimental_attachments || [],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка сохранения сообщения: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Добавляем сообщение в текущий чат
      if (currentChatId === chatId) {
        setCurrentChatMessages(prev => [...prev, data.message]);
      }
      
      // Обновляем список чатов
      setChats(prevChats => {
        const chatIndex = prevChats.findIndex(c => c.id === chatId);
        if (chatIndex >= 0) {
          const updatedChats = [...prevChats];
          const chat = { ...updatedChats[chatIndex] };
          
          // Обновляем последнее сообщение и время обновления
          chat.updatedAt = new Date().toISOString();
          
          // Если это первое сообщение, добавляем его
          if (!chat.messages || chat.messages.length === 0) {
            chat.messages = [data.message];
          } else {
            // Иначе обновляем последнее сообщение
            chat.messages = [data.message];
          }
          
          updatedChats[chatIndex] = chat;
          return updatedChats;
        }
        return prevChats;
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка сохранения сообщения:', error);
      return false;
    }
  };
  
  // Очистка текущего чата
  const clearCurrentChat = () => {
    setCurrentChatId(null);
    setCurrentChatMessages([]);
  };
  
  // Загружаем список чатов при авторизации
  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      setChats([]);
      setCurrentChatId(null);
      setCurrentChatMessages([]);
    }
  }, [user]);
  
  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        currentChatMessages,
        loadingChats,
        loadingCurrentChat,
        errorMessage,
        loadChats,
        loadChat,
        createNewChat,
        updateChatTitle,
        deleteChat,
        saveMessage,
        clearCurrentChat,
        isDuplicateMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Хук для использования контекста
export function useChatContext() {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  
  return context;
}