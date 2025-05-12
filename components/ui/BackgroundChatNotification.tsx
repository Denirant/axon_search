// components/ui/BackgroundChatNotification.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackgroundChatNotification() {
  const [notifications, setNotifications] = useState<{id: string, chatId: string}[]>([]);

  // Слушаем события сообщения для уведомлений о завершении фоновых чатов
  useEffect(() => {
    const handleBackgroundCompletion = (event: MessageEvent) => {
      // Проверяем, что сообщение от нашего источника и имеет нужный тип
      if (event.origin === window.location.origin && event.data?.type === 'backgroundChatComplete') {
        const { chatId } = event.data;
        
        // Добавляем новое уведомление
        const notificationId = `chat-${chatId}-${Date.now()}`;
        setNotifications(prev => [...prev, { id: notificationId, chatId }]);
        
        // Показываем тост-уведомление
        toast.custom(
          (id) => (
            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Чат завершен в фоновом режиме
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Ответ от ассистента готов
                </p>
              </div>
              <Link href={`/s?id=${chatId}`} className="text-xs text-primary hover:underline">
                Перейти к чату
              </Link>
              <button onClick={() => toast.dismiss(id)}>
                <X className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
          ),
          { duration: 10000 }
        );
      }
    };

    window.addEventListener('message', handleBackgroundCompletion);
    return () => {
      window.removeEventListener('message', handleBackgroundCompletion);
    };
  }, []);

  // Удаление уведомления через 15 секунд
  useEffect(() => {
    if (notifications.length === 0) return;
    
    const timeouts = notifications.map(notification => {
      return setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 15000);
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [notifications]);

  return (
    <AnimatePresence>
      {notifications.length > 0 && (
        <div className="fixed bottom-24 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-3 max-w-xs"
            >
              <div className="flex items-start">
                <MessageCircle className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Чат завершен в фоновом режиме
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Ответ от ассистента готов
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <Link 
                      href={`/s?id=${notification.chatId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Перейти к чату
                    </Link>
                    <button 
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full"
                    >
                      <X className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}