// components/ui/ChatsList.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, MoreVertical, MessageSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useChatContext } from '@/contexts/ChatContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function ChatsList() {
  const router = useRouter();
  const { chats, currentChat, updateChatTitle, deleteChat } = useChatContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const handleEditClick = (chatId: string, currentTitle: string) => {
    setSelectedChatId(chatId);
    setNewTitle(currentTitle);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveTitle = async () => {
    if (selectedChatId && newTitle.trim()) {
      const success = await updateChatTitle(selectedChatId, newTitle.trim());
      if (success) {
        toast.success('Заголовок чата обновлен');
      }
      setIsEditDialogOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedChatId) {
      const success = await deleteChat(selectedChatId);
      if (success) {
        toast.success('Чат удален');
      }
      setIsDeleteDialogOpen(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/search?id=${chatId}`);
  };

  return (
    <>
      <div className="space-y-1 max-h-[60vh] overflow-y-auto p-1">
        {chats.length === 0 ? (
          <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
            У вас пока нет чатов
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`
                flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer
                ${currentChat?.id === chat.id ? 'bg-neutral-100 dark:bg-neutral-800' : ''}
              `}
              onClick={() => handleChatClick(chat.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MessageSquare className="h-5 w-5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {chat.title || 'Новый чат'}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(chat.id, chat.title || 'Новый чат');
                  }}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Переименовать
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(chat.id);
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Переименовать чат</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Введите новое название"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveTitle}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить чат</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-neutral-600 dark:text-neutral-300">
              Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}