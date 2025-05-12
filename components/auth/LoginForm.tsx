// components/auth/LoginForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';


export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loginWithGoogle, loginWithVK, loading, error, clearError, user } = useAuth();

    const router = useRouter();

    if(user) {
        router.push('/');
        return;
    }


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await login(email, password);
    };

    const handleGoogleLogin = async () => {
        await loginWithGoogle();
    };
    
    return (
        <div className="flex min-h-[100vh] flex-col justify-center px-6 py-12 lg:px-8">

            <div className='fixed top-0 left-0 w-full p-7'>
                <Link href="/">
                    <img className='select-none w-10 h-10 p-0.5 border-[3px] border-neutral-100 rounded-full' src="./axon.svg" alt="" />
                </Link>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                    Вход в аккаунт
                </h2>
            </div>

            <div className="mx-auto sm:w-full sm:max-w-sm mt-4">
                <div className=" px-6 py-2">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 flex items-start gap-3"
                            >
                                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-sm">Ошибка входа</h3>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="new-email"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    clearError();
                                }}
                                placeholder=" "
                                className="peer block w-full rounded-2xl border py-3 px-4 text-neutral-900 focus:border-blue-500 dark:text-white shadow-sm outline-none border-neutral-200 dark-border-neutral-800 sm:text-sm sm:leading-6 transition-all"
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-2 text-sm top-1/2 -translate-y-1/2 text-neutral-500 bg-white dark:bg-neutral-800 rounded-lg transition-all duration-200 peer-focus:scale-75 peer-focus:text-neutral-800 peer-focus:top-0 peer-focus:left-2 px-2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:top-0"
                            >
                                Почта
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    clearError();
                                }}
                                placeholder=" "
                                className="peer block w-full rounded-2xl border py-3 px-4 pr-12 text-neutral-900 focus:border-blue-500 dark:text-white shadow-sm outline-none border-neutral-200 dark-border-neutral-800 sm:text-sm sm:leading-6 transition-all"
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-2 text-sm top-1/2 -translate-y-1/2 text-neutral-500 bg-white dark:bg-neutral-800 rounded-lg transition-all duration-200 peer-focus:scale-75 peer-focus:text-neutral-800 peer-focus:top-0 peer-focus:left-2 px-2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:top-0"
                            >
                                Пароль
                            </label>

                            <div className="absolute inset-y-0 right-1 pr-3 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <span className="inline-block pl-4" style={{marginTop: '4px'}}>
                            <Link
                                href="/forgot-password"
                                className="inline-block text-xs text-right font-medium font-mono text-neutral-700/80 hover:text-neutral-800 transition-colors duration-150"
                            >
                                Забыли пароль?
                            </Link>
                        </span>

                        <div className="pt-1 w-3/4 mx-auto">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex w-full justify-center rounded-2xl bg-neutral-700 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
                            >
                                <span className="">{loading ? 'Выполняется вход...' : 'Войти'}</span>
                            </button>
                        </div>

                        <div className="mt-1 text-center">
                            <p className="text-sm font-medium font-mono text-neutral-400 dark:text-neutral-600">
                                Еще нет аккаунта?{' '}
                                <Link
                                    href="/register"
                                    className="pl-1 text-neutral-900 hover:text-neutral-900/60 transition-colors duration-100 underline underline-offset-4"
                                >
                                    Создать
                                </Link>
                            </p>
                        </div>
                    </form>

                    {/* Разделитель */}
                    <div className="relative mt-8 mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-4/5 mx-auto h-[1px] rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-5 text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400">или</span>
                        </div>
                    </div>

                    {/* Кнопки социальных сетей */}
                    <div className="flex gap-3 items-center justify-center">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="flex w-fit items-center justify-center gap-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3 text-sm font-medium border border-neutral-100 dark:border-gray-600 hover:bg-neutral-50 hover:border-neutral-200 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <img className='w-6 h-6' src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/300px-Google_%22G%22_logo.svg.png" alt="" />
                        </button>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="flex w-fit items-center justify-center gap-3 rounded-2xl bg-blue-200 dark:bg-neutral-800 p-3 text-sm font-medium border border-neutral-100 dark:border-gray-600 hover:bg-neutral-50 hover:border-neutral-200 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <img className='w-6 h-6' src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/VK_Compact_Logo_%282021-present%29.svg/80px-VK_Compact_Logo_%282021-present%29.svg.png" alt="" />
                        </button>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="flex w-fit items-center justify-center gap-3 rounded-2xl bg-red-200 dark:bg-neutral-800 p-2 text-sm font-medium border border-neutral-100 dark:border-gray-600 hover:bg-neutral-50 hover:border-neutral-200 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <img className='w-8 h-8' src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Yandex_icon.svg/48px-Yandex_icon.svg.png" alt="" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
