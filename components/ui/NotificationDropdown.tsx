import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ExternalLink, ListChecks, Trash } from 'lucide-react';

// Типы
interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  date?: string;
  read: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-4 pt-3 bg-gray-100/60 hover:bg-gray-200/60 rounded-2xl mb-2 relative group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
        <div className="flex-1">
          <h3 className="text-md font-medium text-gray-900 mb-1">{notification.title}</h3>
          <p className="text-sm text-gray-500">{notification.message}</p>
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1 justify-end">
            <span>{notification.time}</span>
            {notification.date && (
              <>
                <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{notification.date}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose(notification.id);
        }}
        className="absolute top-2 right-2 p-1.5 rounded-[10px] bg-gray-100/0 hover:bg-gray-300/60 opacity-100 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5 text-gray-800" />
      </button>
    </motion.div>
  );
};

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasNotifications, setHasNotifications] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([
  ]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Закрытие дропдауна при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleRemoveNotification = (id: number) => {
    setNotifications(prevNotifications => {
      const updatedNotifications = prevNotifications.filter(notification => notification.id !== id);
      
      // Если удалили все уведомления
      if (updatedNotifications.length === 0) {
        setHasNotifications(false);
      }
      
      // Обновление счетчика непрочитанных
      const newUnreadCount = updatedNotifications.filter(notification => !notification.read).length;
      setUnreadCount(newUnreadCount);
      
      return updatedNotifications;
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    setHasNotifications(false);
  };

  // Для демонстрации - переключение между состояниями с уведомлениями и пустым списком
  const handleToggleEmptyState = () => {
    setHasNotifications(!hasNotifications);
    if (!hasNotifications) {
      setNotifications([
        // {
        //     id: 1,
        //     title: 'Закона обработка Deep Researh',
        //     message: 'Ваш запрос по глубокому исследования был закончен, можно посмотреть ответ',
        //     time: '10:45',
        //     date: 'Вчера',
        //     read: false
        //   },
      ]);
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Только кнопка уведомлений с индикатором */}
      <button 
        onClick={toggleDropdown}
        className="group relative p-2.5 rounded-full border border-neutral-100/0 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 hover:border-neutral-300/50 dark:hover:border-neutral-800/50 transition-colors"
        aria-label="Уведомления"
      >
        <Bell className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-gray-800 dark:group-hover:text-neutral-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-[1px] -right-[1px] w-5 h-5 bg-blue-500 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute -right-2 mt-2 w-[24rem] bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-lg border overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h2 className="text-md font-semibold text-neutral-800 pl-1 dark:text-neutral-200">Уведомления</h2>
                {hasNotifications && notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                        className={`p-2 rounded-xl text-neutral-600 dark:text- bg-neutral-100/90 hover:bg-neutral-200`}
                    >
                        <Trash className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto p-3 pb-1 pt-0">
              {hasNotifications && notifications.length > 0 ? (
                notifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onClose={handleRemoveNotification} 
                  />
                ))
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center border rounded-2xl border-neutral-300/50 bg-neutral-100/80 dark:border-neutral-700/50 dark:bg-neutral-900/80 mb-2">
                  <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-neutral-800/80 flex items-center justify-center mb-2">
                    <Bell className="w-6 h-6 text-neutral-400 dark:text-neutral-200" />
                  </div>
                  <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-500 mt-1">Нет новых уведомлений</h3>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Только для демо-целей - кнопка переключения между состояниями */}
      <button 
        onClick={handleToggleEmptyState}
        className="hidden"
      >
        Переключить
      </button>
    </div>
  );
};

export default NotificationDropdown;