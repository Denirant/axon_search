// ChatContentWrapper.tsx - обновленная версия
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import HomeContent from './HomeContent';
import LoadingFallback from '@/components/LoadingFallback';

export default function ChatContentWrapper() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const {
        currentChatId,
        loadChat,
        saveMessage,
        createNewChat,
        currentChatMessages,
        loadingCurrentChat,
        clearCurrentChat,
        isDuplicateMessage,
    } = useChatContext();

    const [pendingMessage, setPendingMessage] = useState<string>('');
    const [processingResult, setProcessingResult] = useState<{ success: boolean; message: any } | null>(null);
    const processingRef = useRef(false);
    const pendingMessageProcessedRef = useRef(false);
    const processingChatIdRef = useRef<string | null>(null);

    // Очищаем текущее состояние чата при переходе на новый чат
    useEffect(() => {
        const id = searchParams.get('id');
        if (id === null && currentChatId !== null) {
            clearCurrentChat();
        }
    }, [searchParams, clearCurrentChat, currentChatId]);

    // Загрузка чата из URL с защитой от дублирования запросов
    useEffect(() => {
        const id = searchParams.get('id');

        // Если нет ID в URL, ничего не делаем
        if (!id) return;

        // Если ID совпадает с текущим, ничего не делаем
        if (id === currentChatId) return;

        // Если ID совпадает с тем, который уже обрабатывается, ничего не делаем
        if (id === processingChatIdRef.current) return;

        // Если есть ID в URL, загружаем чат
        if (!processingRef.current) {
            processingRef.current = true;
            processingChatIdRef.current = id;

            console.log(`Загружаем чат из URL: ${id}`);

            loadChat(id).finally(() => {
                processingRef.current = false;
                processingChatIdRef.current = null;
            });
        }
    }, [searchParams, currentChatId, loadChat]);

    // Улучшенная обработка отложенного сообщения
    const processStoredMessage = useCallback(async () => {
        // Проверяем флаг, указывающий на то, что сообщение уже обрабатывается
        if (pendingMessageProcessedRef.current) {
            console.log('pendingMessage уже обработан, пропускаем');
            return false;
        }

        // Проверяем условия для обработки сообщения
        if (!currentChatId || !user || loadingCurrentChat) {
            console.log('Не все условия выполнены для обработки сообщения');
            return false;
        }

        const storedMessage = sessionStorage.getItem('pendingMessage');
        const isBeingProcessed = sessionStorage.getItem('pendingMessageProcessing');

        // Если сообщение уже обрабатывается или его нет, выходим
        if (isBeingProcessed === 'true' || !storedMessage) {
            console.log('Сообщение уже обрабатывается или его нет:', {
                isBeingProcessed,
                hasStoredMessage: !!storedMessage,
            });
            return false;
        }

        try {
            // Устанавливаем флаг обработки
            sessionStorage.setItem('pendingMessageProcessing', 'true');
            pendingMessageProcessedRef.current = true;

            console.log('Обработка отложенного сообщения для чата:', currentChatId);

            // Парсим сообщение
            let messageContent = '';
            let messageAttachments = [];

            try {
                const pendingData = JSON.parse(storedMessage);
                messageContent = pendingData.content || '';
                messageAttachments = pendingData.attachments || [];
            } catch (e) {
                // Если не JSON, используем как строку
                messageContent = storedMessage;
            }

            if (!messageContent) {
                // Если контента нет, просто очищаем и выходим
                sessionStorage.removeItem('pendingMessage');
                sessionStorage.removeItem('pendingMessageProcessing');
                console.log('Нет контента в отложенном сообщении, очищаем');
                return false;
            }

            // Создаем временную метку
            const createdAt = new Date().toISOString();
            const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            // Подготавливаем сообщение пользователя
            const userMessage = {
                role: 'user',
                content: messageContent,
                experimental_attachments: messageAttachments,
                createdAt: createdAt,
                messageId: messageId,
            };

            // Проверяем, не является ли это сообщение дубликатом
            if (isDuplicateMessage(userMessage)) {
                console.log('Обнаружен дубликат отложенного сообщения, пропускаем');
                sessionStorage.removeItem('pendingMessage');
                sessionStorage.removeItem('pendingMessageProcessing');
                return false;
            }

            // Сначала сохраняем в базу данных
            const saveResult = await saveMessage(currentChatId, userMessage);

            if (!saveResult) {
                console.log('Не удалось сохранить отложенное сообщение в БД');
                sessionStorage.removeItem('pendingMessageProcessing');
                return false;
            }

            // Затем обновляем UI
            setPendingMessage(''); // Очищаем локальное состояние

            // Очищаем sessionStorage
            sessionStorage.removeItem('pendingMessage');
            sessionStorage.removeItem('pendingMessageProcessing');

            console.log('Отложенное сообщение успешно обработано');

            // Даем сигнал для HomeContent обновить интерфейс с новым сообщением
            return {
                success: true,
                message: userMessage,
            };
        } catch (error) {
            console.error('Ошибка при обработке отложенного сообщения:', error);
            // В случае ошибки снимаем флаг обработки
            sessionStorage.removeItem('pendingMessageProcessing');
            pendingMessageProcessedRef.current = false;
            return false;
        }
    }, [currentChatId, user, loadingCurrentChat, saveMessage, setPendingMessage, isDuplicateMessage]);

    // Проверяем наличие отложенного сообщения при загрузке чата
    useEffect(() => {
        if (currentChatId && !loadingCurrentChat && user) {
            // Используем setTimeout для гарантии правильного порядка операций
            const timer = setTimeout(() => {
                processStoredMessage().then((result) => {
                    if (result) {
                        setProcessingResult(result as { success: boolean; message: any });
                    }
                }).catch((err) => {
                    console.error('Ошибка при обработке отложенного сообщения:', err);
                });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentChatId, loadingCurrentChat, processStoredMessage, user]);

    // Создание нового чата с предотвращением повторов
    const handleCreateNewChat = useCallback(async () => {
        if (processingRef.current) {
            console.log('Уже идет создание чата, пропускаем дублирующий запрос');
            return null;
        }

        processingRef.current = true;
        let retryCount = 0;
        const maxRetries = 2;

        try {
            // Реализуем стратегию повторных попыток
            while (retryCount <= maxRetries) {
                try {
                    console.log(`Попытка создания чата ${retryCount + 1}/${maxRetries + 1}`);
                    const newChatId = await createNewChat();

                    if (newChatId) {
                        // Очищаем чат ТОЛЬКО после успешного создания
                        clearCurrentChat();
                        return newChatId;
                    }

                    // Увеличиваем счетчик попыток, если не получилось создать чат
                    retryCount++;

                    // Если это была последняя попытка, выходим из цикла
                    if (retryCount > maxRetries) break;

                    // Иначе делаем паузу перед следующей попыткой
                    console.log(`Ожидание перед повторной попыткой (${retryCount}/${maxRetries})...`);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                } catch (innerError) {
                    console.error(`Ошибка при попытке ${retryCount + 1}:`, innerError);

                    // Увеличиваем счетчик попыток
                    retryCount++;

                    // Если это была последняя попытка, выбрасываем ошибку
                    if (retryCount > maxRetries) throw innerError;

                    // Иначе делаем паузу перед следующей попыткой
                    console.log(`Ожидание перед повторной попыткой (${retryCount}/${maxRetries})...`);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }

            // Если мы здесь, значит все попытки не удались, но не было исключения
            console.error('Все попытки создания чата не удались');
            toast.error('Не удалось создать новый чат после нескольких попыток');
            return null;
        } catch (error) {
            console.error('Критическая ошибка создания чата:', error);
            toast.error(
                'Не удалось создать новый чат: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'),
            );
            return null;
        } finally {
            // Сбрасываем флаг обработки с небольшой задержкой
            setTimeout(() => {
                processingRef.current = false;
            }, 500);
        }
    }, [createNewChat, clearCurrentChat]);

    const handleSaveMessage = useCallback(
        async (chatId: string, message: any) => {
            if (!chatId) return false;

            // Создаем ID сообщения для отслеживания дублей, если его еще нет
            const messageId = message.messageId || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const messageWithId = {
                ...message,
                messageId: messageId,
            };

            console.log('handleSaveMessage:', messageWithId.role, 'id:', messageId);

            // Проверяем, не является ли сообщение дубликатом по ID или содержимому
            if (isDuplicateMessage(messageWithId)) {
                console.log(`Предотвращено сохранение дубликата сообщения ${messageId}`);
                return true; // Возвращаем true, чтобы не прерывать поток выполнения
            }

            try {
                // Добавляем метаданные для предотвращения дублей на сервере
                const saveResult = await saveMessage(chatId, {
                    ...messageWithId,
                    clientId: messageId, // Дополнительный идентификатор со стороны клиента
                });

                return saveResult;
            } catch (error) {
                console.error('Ошибка при сохранении сообщения:', error);
                return false;
            }
        },
        [saveMessage, isDuplicateMessage],
    );

    // Навигация между страницами с проверкой
    const handleNavigate = useCallback(
        (url: string) => {
            const currentUrl = window.location.pathname + window.location.search;
            if (currentUrl === url) {
                console.log('Предотвращена навигация на текущий URL:', url);
                return;
            }

            console.log('Навигация на:', url);
            router.push(url);
        },
        [router],
    );

    // Обновление pendingMessage с улучшенной обработкой
    const handleSetPendingMessage = useCallback((content: string) => {
        setPendingMessage(content);

        if (content) {
            // Если мы устанавливаем новое сообщение, сбрасываем флаг обработки
            pendingMessageProcessedRef.current = false;
            sessionStorage.removeItem('pendingMessageProcessing');

            // Сохраняем в формате JSON для единообразия
            const pendingData = { content, attachments: [] };
            sessionStorage.setItem('pendingMessage', JSON.stringify(pendingData));
            console.log('Сохранено отложенное сообщение:', content.substring(0, 30));
        } else {
            sessionStorage.removeItem('pendingMessage');
            sessionStorage.removeItem('pendingMessageProcessing');
            console.log('Удалено отложенное сообщение');
        }
    }, []);

    // Отображение загрузки
    if (authLoading) {
        return <LoadingFallback />;
    }

    // Перенаправление неавторизованного пользователя
    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <HomeContent
            chatId={currentChatId}
            initialMessages={currentChatMessages}
            createNewChat={handleCreateNewChat}
            saveMessage={handleSaveMessage}
            onNavigate={handleNavigate}
            loading={loadingCurrentChat}
            pendingMessage={pendingMessage}
            setPendingMessage={handleSetPendingMessage}
            processStoredMessage={processStoredMessage}
            processingResult={processingResult}
        />
    );
}