// components/chatSidebar.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash, Edit, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatSidebar() {
  const { chats, isLoadingChats, createChat, deleteChat, updateChatTitle, loadChats } = useChatContext();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const router = useRouter();

  const handleNewChat = async () => {
    setIsCreatingChat(true);
    try {
      const chatId = await createChat();
      router.push(`/s?id=${chatId}`);
    } catch (error) {
      toast.error('Не удалось создать чат');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/s?id=${chatId}`);
  };

  const handleEditStart = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleEditSave = async (chatId: string) => {
    const success = await updateChatTitle(chatId, editTitle);
    if (success) {
      setEditingChatId(null);
    } else {
      toast.error('Не удалось обновить название чата');
    }
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleDelete = async (chatId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот чат?')) {
      const success = await deleteChat(chatId);
      if (success) {
        toast.success('Чат удален');
        if (window.location.pathname.includes('/s') && window.location.search.includes(chatId)) {
          router.push('/new');
        }
      } else {
        toast.error('Не удалось удалить чат');
      }
    }
  };

  if (isLoadingChats) {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      <Button
        onClick={handleNewChat}
        className="flex items-center gap-2 mb-4"
        disabled={isCreatingChat}
      >
        {isCreatingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Новый чат
      </Button>

      <div className="space-y-2 flex-1 overflow-y-auto pr-2">
        {chats.length === 0 ? (
          <div className="text-center text-neutral-500 dark:text-neutral-400 mt-8">
            У вас пока нет чатов
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center justify-between rounded-lg p-3 text-sm",
                "transition-colors cursor-pointer group",
                chat.status === 'processing' 
                  ? "bg-blue-100/70 dark:bg-blue-900/20" 
                  : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              )}
              onClick={() => !editingChatId && handleChatClick(chat.id)}
            >
              <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <MessageSquare className={cn(
                  "h-4 w-4 shrink-0",
                  chat.status === 'processing' 
                    ? "text-blue-500 dark:text-blue-400" 
                    : "text-neutral-500 dark:text-neutral-400"
                )} />

                {editingChatId === chat.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="flex-1 bg-white dark:bg-neutral-900 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <span className="truncate flex-1">{chat.title || 'Новый чат'}</span>
                )}

                {chat.status === 'processing' && (
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-xs text-blue-600 dark:text-blue-400 animate-pulse font-medium">Обработка...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                {editingChatId === chat.id ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSave(chat.id);
                      }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCancel();
                      }}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                ) : (
                  <div className="invisible group-hover:visible flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(chat.id, chat.title || '');
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(chat.id);
                      }}
                    >
                      <Trash className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}