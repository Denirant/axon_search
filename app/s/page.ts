'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import LoadingFallback from '@/components/LoadingFallback';
import HomeContent from '@/components/chat/HomeContent';
import Landing from '@/components/Landing';
import { isValidChatId } from '@/lib/utils';
import { getPendingMessage, clearPendingMessage } from '@/lib/pendingMessageUtils';

export default function ChatPage() {
    const { user, loading: authLoading } = useAuth();
    const { loadChat, currentChatId, currentChatMessages, loadingCurrentChat, saveMessage } = useChatContext();
    const searchParams = useSearchParams();
    const [isProcessingPending, setIsProcessingPending] = useState(false);

    // Получаем ID чата из URL
    const chatId = searchParams.get('id');

    // Загружаем чат при первом рендеринге
    useEffect(() => {
        if (user && chatId && isValidChatId(chatId)) {
            loadChat(chatId);
        }
    }, [user, chatId, loadChat]);

    // Обрабатываем отложенные сообщения
    useEffect(() => {
        const processPendingMessage = async () => {
            if (!isProcessingPending && user && currentChatId && !loadingCurrentChat) {
                setIsProcessingPending(true);
                const pendingMessage = getPendingMessage();

                if (pendingMessage && !pendingMessage.processed) {
                    const userMessage = {
                        role: 'user',
                        content: pendingMessage.content,
                        attachments: pendingMessage.attachments,
                        createdAt: new Date().toISOString(),
                    };

                    await saveMessage(currentChatId, userMessage);
                    clearPendingMessage();
                }

                setIsProcessingPending(false);
            }
        };

        processPendingMessage();
    }, [user, currentChatId, loadingCurrentChat, saveMessage, isProcessingPending]);

    // Если загружаем пользователя, показываем индикатор загрузки
    if (authLoading) {
        return <LoadingFallback />;
    }

    // Если пользователь не авторизован, показываем лендинг
    if (!user) {
        return <Landing />;
    }

    // Если нет ID чата или ID некорректный, редиректим на главную
    if (!chatId || !isValidChatId(chatId)) {
        return <LoadingFallback />;
    }

    // Показываем содержимое чата
    return <HomeContent chatId={currentChatId} initialMessages={currentChatMessages} loading={loadingCurrentChat} />;
}
