import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: any[];
}

export function useChatManager() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Получаем ID чата из URL-параметра
  useEffect(() => {
    const chatId = searchParams.get('id');
    if (chatId) {
      setCurrentChatId(chatId);
    }
  }, [searchParams]);

  // Загружаем список чатов при авторизации
  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  // Загружаем данные текущего чата при изменении его ID
  useEffect(() => {
    if (currentChatId) {
      loadCurrentChat();
    }
  }, [currentChatId]);

  // Загрузка списка чатов
  const loadChats = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) throw new Error('Не удалось загрузить чаты');
      
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      toast.error('Не удалось загрузить список чатов');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Загрузка текущего чата
  const loadCurrentChat = useCallback(async () => {
    if (!user || !currentChatId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chats/${currentChatId}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Если чат не найден, перенаправляем на главную
          router.push('/');
          return;
        }
        throw new Error('Не удалось загрузить чат');
      }
      
      const data = await response.json();
      // Обновляем список чатов, добавляя/обновляя текущий
      setChats(prevChats => {
        const chatIndex = prevChats.findIndex(c => c.id === data.chat.id);
        if (chatIndex >= 0) {
          prevChats[chatIndex] = data.chat;
          return [...prevChats];
        } else {
          return [data.chat, ...prevChats];
        }
      });
      
      return data.chat;
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
      toast.error('Не удалось загрузить чат');
    } finally {
      setIsLoading(false);
    }
  }, [user, currentChatId, router]);

  // Создание нового чата
  const createChat = useCallback(async (title?: string) => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'Новый чат' }),
      });
      
      if (!response.ok) throw new Error('Не удалось создать чат');
      
      const data = await response.json();
      setChats(prevChats => [data.chat, ...prevChats]);
      
      // Перенаправляем на страницу нового чата
      router.push(`/search?id=${data.chat.id}`);
      
      return data.chat;
    } catch (error) {
      console.error('Ошибка создания чата:', error);
      toast.error('Не удалось создать новый чат');
      return null;
    }
  }, [user, router]);

  // Обновление заголовка чата
  const updateChatTitle = useCallback(async (chatId: string, title: string) => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) throw new Error('Не удалось обновить чат');
      
      // Обновляем локальный список чатов
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, title } 
            : chat
        )
      );
      
      return true;
    } catch (error) {
      console.error('Ошибка обновления чата:', error);
      toast.error('Не удалось обновить заголовок чата');
      return false;
    }
  }, [user]);

  // Удаление чата
  const deleteChat = useCallback(async (chatId: string) => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Не удалось удалить чат');
      
      // Удаляем чат из локального списка
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      // Если удалили текущий чат, перенаправляем на главную
      if (currentChatId === chatId) {
        router.push('/');
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка удаления чата:', error);
      toast.error('Не удалось удалить чат');
      return false;
    }
  }, [user, currentChatId, router]);

  // Обрабатываем аннотацию с ID чата
  // hooks/use-chat-manager.ts
// В функции handleChatIdAnnotation
const handleChatIdAnnotation = useCallback((chatId: string) => {
    if (!chatId) {
      console.error('Получена пустая аннотация с ID чата');
      return;
    }
  
    console.log('Обработка аннотации с ID чата:', chatId);
    setCurrentChatId(chatId);
    
    // Немедленно перенаправляем на страницу чата с новым ID
    const currentQuery = searchParams.get('id');
    
    if (currentQuery !== chatId) {
      console.log('Перенаправление на чат:', chatId, 'текущий query:', currentQuery);
      // Используем replace вместо push для плавного перехода без добавления в историю
      router.replace(`/search?id=${chatId}`, { scroll: false });
    }
  }, [router, searchParams]);
  

  return {
    chats,
    currentChatId,
    isLoading,
    loadChats,
    loadCurrentChat,
    createChat,
    updateChatTitle,
    deleteChat,
    handleChatIdAnnotation
  };
}