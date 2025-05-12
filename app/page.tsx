// // app/page.tsx - упрощенная версия
// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import Landing from '@/components/Landing';
// import LoadingFallback from '@/components/LoadingFallback';
// import Home from '@/components/chat/HomeContent';

// export default function HomePage() {
//   const { user, loading } = useAuth();
//   // Состояние для обнаружения токена через JS
//   const [isTokenValid, setIsTokenValid] = useState(false);

//   // Проверка наличия токена через cookie API
//   useEffect(() => {
//     // Использование обычного document.cookie
//     const hasToken = document.cookie.split(';').some(c => c.trim().startsWith('token='));
//     // Установка состояния
//     setIsTokenValid(hasToken);
//   }, []);

//   // Отображаем загрузку, пока проверяем авторизацию
//   if (loading) {
//     return <LoadingFallback />;
//   }

//   // Если пользователь авторизован или есть токен, показываем Home
//   if (user || (!loading && isTokenValid)) {
//     return <Home />;
//   }

//   // В противном случае показываем Landing
//   return <Landing />;
// }

/* eslint-disable @next/next/no-img-element */
'use client';
import 'katex/dist/katex.min.css';

import { AnimatePresence, motion } from 'framer-motion';
import { useChat, UseChatOptions } from '@ai-sdk/react';
import { CalendarBlank, Clock as PhosphorClock, Info } from '@phosphor-icons/react';
import { parseAsString, useQueryState } from 'nuqs';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Moon, Plus, Sun } from 'lucide-react';
import Link from 'next/link';
import React, { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import FormComponent from '@/components/ui/form-component';
import { InstallPrompt } from '@/components/InstallPrompt';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn, getUserId, SearchGroupId } from '@/lib/utils';
import { suggestQuestions } from './actions';
import Messages from '@/components/messages';
import Navbar from '@/components/ui/navbar';
import HelpDropdown from '@/components/helpDropdown';
import HistoryOverflow from '@/components/ui/history/history_overlay';
import { useAuth } from '@/contexts/AuthContext';
import Landing from '@/components/Landing';

interface Attachment {
    name: string;
    contentType: string;
    url: string;
    size: number;
}


const HomeContent = () => {
    const [query] = useQueryState('query', parseAsString.withDefault(''));
    const [q] = useQueryState('q', parseAsString.withDefault(''));

    const {user} = useAuth();

    // Use localStorage hook directly for model selection with a default
    const [selectedModel, setSelectedModel] = useLocalStorage('scira-selected-model', 'scira-default');

    const initialState = useMemo(
        () => ({
            query: query || q,
        }),
        [query, q],
    );

    const lastSubmittedQueryRef = useRef(initialState.query);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [isEditingMessage, setIsEditingMessage] = useState(false);
    const [editingMessageIndex, setEditingMessageIndex] = useState(-1);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const initializedRef = useRef(false);
    const [selectedGroup, setSelectedGroup] = useState<SearchGroupId>('web');
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const [hasManuallyScrolled, setHasManuallyScrolled] = useState(false);
    const isAutoScrollingRef = useRef(false);

    // Get stored user ID
    const userId = useMemo(() => getUserId(), []);

    const chatOptions: UseChatOptions = useMemo(
        () => ({
            api: '/api/search',
            experimental_throttle: 500,
            maxSteps: 5,
            body: {
                model: 'scira-default',
                group: selectedGroup,
                user_id: userId,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            onFinish: async (message, { finishReason }) => {
                console.log('[finish reason]:', finishReason);
                if (message.content && (finishReason === 'stop' || finishReason === 'length')) {
                    const newHistory = [
                        { role: 'user', content: lastSubmittedQueryRef.current },
                        { role: 'assistant', content: message.content },
                    ];
                    const { questions } = await suggestQuestions(newHistory);
                    setSuggestedQuestions(questions);
                }
            },
            onError: (error) => {
                // Записываем все доступные данные об ошибке
                console.error("Chat error details:", error);
                
                // Полная распечатка объекта ошибки
                if (error instanceof Error) {
                    console.error("Error stack:", error.stack);
                    console.error("Error cause:", error.cause);
                }
                
                // Вывод информации в пользовательский интерфейс
                toast.error("An error occurred.", {
                    description: `Oops! ${error.message || "Something went wrong. Please try again later."}`,
                });
            },
            
        }),
        [selectedModel, selectedGroup, userId],
    );

    const { input, messages, setInput, append, handleSubmit, setMessages, reload, stop, status, error } =
        useChat(chatOptions);

    useEffect(() => {
        if (!initializedRef.current && initialState.query && !messages.length) {
            initializedRef.current = true;
            console.log('[initial query]:', initialState.query);
            append({
                content: initialState.query,
                role: 'user',
            });
        }
    }, [initialState.query, append, setInput, messages.length]);

    const ThemeToggle: React.FC = () => {
        const { resolvedTheme, setTheme } = useTheme();

        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        );
    };

    const lastUserMessageIndex = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                return i;
            }
        }
        return -1;
    }, [messages]);

    useEffect(() => {
        // Reset manual scroll when streaming starts
        if (status === 'streaming') {
            setHasManuallyScrolled(false);
            // Initial scroll to bottom when streaming starts
            if (bottomRef.current) {
                isAutoScrollingRef.current = true;
                bottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [status]);

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            // Clear any pending timeout
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }

            // If we're not auto-scrolling and we're streaming, it must be a user scroll
            if (!isAutoScrollingRef.current && status === 'streaming') {
                const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
                if (!isAtBottom) {
                    setHasManuallyScrolled(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Auto-scroll on new content if we haven't manually scrolled
        if (status === 'streaming' && !hasManuallyScrolled && bottomRef.current) {
            scrollTimeout = setTimeout(() => {
                isAutoScrollingRef.current = true;
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                // Reset auto-scroll flag after animation
                setTimeout(() => {
                    isAutoScrollingRef.current = false;
                }, 100);
            }, 100);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        };
    }, [messages, suggestedQuestions, status, hasManuallyScrolled]);

    const AboutButton = () => {
        return (
            <Link href="/about">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-8 h-8 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                >
                    <Info className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </Button>
            </Link>
        );
    };

    // Define the model change handler
    const handleModelChange = useCallback(
        (model: string) => {
            setSelectedModel(model);
        },
        [setSelectedModel],
    );

    const resetSuggestedQuestions = useCallback(() => {
        setSuggestedQuestions([]);
    }, []);

    if(!user) {
        return (<Landing/>)
    }

    return (
        <div className="flex flex-col font-sans! items-center min-h-screen bg-background text-foreground transition-all duration-500">
            <Navbar />
            <HelpDropdown/>
            <HistoryOverflow/>

            <div
                className={`w-full p-2 sm:p-4 ${
                    status === 'ready' && messages.length === 0
                        ? 'min-h-screen flex flex-col items-center justify-center' // Center everything when no messages
                        : 'mt-20 sm:mt-16' // Add top margin when showing messages
                }`}
            >
                <div className={`w-full max-w-[26rem] sm:max-w-2xl space-y-6 p-0 mx-auto transition-all duration-300`}>
                    {status === 'ready' && messages.length === 0 && (
                        <div className="text-center">
                            <h1 className="text-2xl sm:text-4xl mb-4 sm:mb-6 text-neutral-800 dark:text-neutral-100 font-syne!">
                                What do you want to explore?
                            </h1>
                        </div>
                    )}
                    <AnimatePresence>
                        {messages.length === 0 && !hasSubmitted && (
                            <motion.div
                                initial={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 0 }}
                                transition={{ duration: 0 }}
                                className={cn('mt-4')}
                            >
                                <FormComponent
                                    input={input}
                                    setInput={setInput}
                                    attachments={attachments}
                                    setAttachments={setAttachments}
                                    handleSubmit={handleSubmit}
                                    fileInputRef={fileInputRef}
                                    inputRef={inputRef}
                                    stop={stop}
                                    messages={messages as any}
                                    append={append}
                                    selectedModel={selectedModel}
                                    setSelectedModel={handleModelChange}
                                    resetSuggestedQuestions={resetSuggestedQuestions}
                                    lastSubmittedQueryRef={lastSubmittedQueryRef}
                                    selectedGroup={selectedGroup}
                                    setSelectedGroup={setSelectedGroup}
                                    showExperimentalModels={true}
                                    status={status}
                                    setHasSubmitted={setHasSubmitted}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Use the Messages component */}
                    {messages.length > 0 && (
                        <Messages
                            messages={messages}
                            lastUserMessageIndex={lastUserMessageIndex}
                            isEditingMessage={isEditingMessage}
                            editingMessageIndex={editingMessageIndex}
                            input={input}
                            setInput={setInput}
                            setIsEditingMessage={setIsEditingMessage}
                            setEditingMessageIndex={setEditingMessageIndex}
                            setMessages={setMessages}
                            append={append}
                            reload={reload}
                            suggestedQuestions={suggestedQuestions}
                            setSuggestedQuestions={setSuggestedQuestions}
                            status={status}
                            error={error}
                        />
                    )}

                    <div ref={bottomRef} />
                </div>

                <AnimatePresence>
                    {(messages.length > 0 || hasSubmitted) && (
                        <motion.div
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0 }}
                            className="fixed bottom-6 sm:bottom-4 left-0 right-0 w-full max-w-[26rem] sm:max-w-2xl mx-auto z-20"
                        >
                            <FormComponent
                                input={input}
                                setInput={setInput}
                                attachments={attachments}
                                setAttachments={setAttachments}
                                handleSubmit={handleSubmit}
                                fileInputRef={fileInputRef}
                                inputRef={inputRef}
                                stop={stop}
                                messages={messages as any}
                                append={append}
                                selectedModel={selectedModel}
                                setSelectedModel={handleModelChange}
                                resetSuggestedQuestions={resetSuggestedQuestions}
                                lastSubmittedQueryRef={lastSubmittedQueryRef}
                                selectedGroup={selectedGroup}
                                setSelectedGroup={setSelectedGroup}
                                showExperimentalModels={false}
                                status={status}
                                setHasSubmitted={setHasSubmitted}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const Home = () => {
    return (
        <Suspense>
            <HomeContent />
            <InstallPrompt />
        </Suspense>
    );
};

export default Home;
