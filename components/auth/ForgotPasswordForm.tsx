// components/auth/ForgotPasswordForm.tsx
'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft } from 'lucide-react';

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [step, setStep] = useState<'email' | 'code' | 'newPassword'>('email');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');

    const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
        // Автоматический фокус на первом поле при загрузке
        if (step === 'code' && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [step]);

    useEffect(() => {
        setCode(codeDigits.join(''));
    }, [codeDigits]);

    const handleCodeSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (code.length !== 6) return;

        setStatus('submitting');
        setMessage('');

        try {
            const response = await fetch('/api/auth/verify-reset-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setStatus('success');
                setMessage('Код верифицирован. Установите новый пароль.');
                setStep('newPassword');
            } else {
                setStatus('error');
                setMessage(data.message || 'Неверный код. Пожалуйста, попробуйте снова.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Не удалось проверить код. Проверьте подключение к интернету.');
        }
    };

    const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;

        setStatus('submitting');
        setMessage('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                setStep('code');
            } else {
                setStatus('error');
                setMessage(data.error || 'Произошла ошибка. Пожалуйста, попробуйте снова.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Не удалось отправить запрос. Проверьте подключение к интернету.');
        }
    };

    const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Валидация паролей
        if (newPassword !== confirmPassword) {
            setPasswordError('Пароли не совпадают');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Пароль должен содержать минимум 6 символов');
            return;
        }

        setPasswordError('');
        setStatus('submitting');
        setMessage('');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Пароль успешно обновлен! Перенаправление на страницу входа...');
                // Перенаправление через 2 секунды
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Произошла ошибка при обновлении пароля.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Не удалось обновить пароль. Проверьте подключение к интернету.');
        }
    };

    return (
        <div className="flex min-h-[100vh] flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                    {step === 'email' && 'Восстановление пароля'}
                    {step === 'code' && 'Проверка доступа'}
                    {step === 'newPassword' && 'Новый пароль'}
                </h2>
            </div>

            <div className="mt-6 mx-auto sm:w-full sm:max-w-sm px-6">
                {status === 'error' && (
                    <div className="mb-4 p-3 px-5 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                        {message}
                    </div>
                )}

                {/* {status === 'success' && step !== 'newPassword' && (
                    <div className="w-[90%] mx-auto mb-4 p-4 rounded-2xl bg-green-50/90 border border-green-200 dark:bg-green-900/20 text-green-600 dark:text-green-300 text-center">
                        {message}
                    </div>
                )} */}

                {step === 'email' && (
                    <form className="space-y-6" onSubmit={handleEmailSubmit}>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                        <div className="flex items-center gap-3 w-3/4 mx-auto">
                            <Link
                                href="/login"
                                className="border p-2.5 rounded-2xl border-neutral-100 bg-neutral-100 hover:bg-neutral-200/90 hover:border-neutral-300 font-medium text-neutral-800 hover:text-neutral-600 transition-all duration-300"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Link>
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="group relative flex w-full justify-center rounded-2xl bg-neutral-700 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
                            >
                                {status === 'submitting' ? 'Отправка...' : 'Отправить код'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'code' && (
                    // <form className="flex flex-col gap-2" onSubmit={handleCodeSubmit}>
                    //     <div className="relative">
                    //         <input
                    //             id="code"
                    //             name="code"
                    //             type="text"
                    //             required
                    //             maxLength={6}
                    //             minLength={6}
                    //             value={code}
                    //             onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    //             placeholder=" "
                    //             className="peer block w-full rounded-2xl border py-3 px-4 text-neutral-900 focus:border-blue-500 dark:text-white shadow-sm outline-none border-neutral-200 dark-border-neutral-800 sm:text-sm sm:leading-6 transition-all"
                    //         />
                    //         <label
                    //             htmlFor="code"
                    //             className={`absolute left-3.5 text-sm top-1/2 -translate-y-1/2 text-neutral-500 bg-white dark:bg-neutral-800 rounded-lg transition-all duration-200 px-2
                    //                 peer-focus:text-[11px] peer-focus:text-neutral-800 dark:peer-focus:text-neutral-200 peer-focus:top-0 peer-focus:-translate-y-1/2
                    //                 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2`}
                    //         >
                    //             Код подтверждения
                    //         </label>
                    //     </div>

                    //     <p className="text-[12px] w-[90%] mx-auto text-neutral-400 text-center">
                    //         Введите 6-значный код из письма
                    //     </p>

                    //     <div className="pt-1 w-3/4 mx-auto mt-4">
                    //         <button
                    //             type="submit"
                    //             disabled={status === 'submitting' || code.length !== 6}
                    //             className="group relative flex w-full justify-center rounded-2xl bg-neutral-700 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
                    //         >
                    //             {status === 'submitting' ? 'Проверка...' : 'Проверить'}
                    //         </button>
                    //     </div>
                    // </form>
                    <form className="flex flex-col gap-2" onSubmit={handleCodeSubmit}>
                        <div className="relative">
                            <div className="flex justify-center gap-2 w-full">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        value={codeDigits[index]}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            if (value.length > 1) return;

                                            const newCodeDigits = [...codeDigits];
                                            newCodeDigits[index] = value;
                                            setCodeDigits(newCodeDigits);

                                            if (value !== '' && index < 5) {
                                                inputRefs.current[index + 1].focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && codeDigits[index] === '' && index > 0) {
                                                inputRefs.current[index - 1].focus();
                                            }
                                        }}
                                        onPaste={
                                            index === 0
                                                ? (e) => {
                                                      e.preventDefault();
                                                      const pastedData = e.clipboardData
                                                          .getData('text')
                                                          .replace(/[^0-9]/g, '')
                                                          .slice(0, 6);
                                                      if (!pastedData) return;

                                                      const newCodeDigits = [...codeDigits];
                                                      for (let i = 0; i < pastedData.length; i++) {
                                                          newCodeDigits[i] = pastedData[i];
                                                      }
                                                      setCodeDigits(newCodeDigits);

                                                      const nextEmptyIndex = Math.min(pastedData.length, 5);
                                                      if (inputRefs.current[nextEmptyIndex]) {
                                                          inputRefs.current[nextEmptyIndex].focus();
                                                      }
                                                  }
                                                : undefined
                                        }
                                        maxLength={1}
                                        className="w-10 h-10 text-center rounded-xl border py-3 text-base font-medium text-neutral-900 focus:border-blue-500 dark:text-white shadow-sm outline-none border-neutral-200 dark:border-neutral-800 sm:text-sm sm:leading-6 transition-all"
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="text-[12px] w-[65%] mx-auto text-neutral-400 text-center">
                            Введите 6-значный код из письма для подтверждения почты
                        </p>

                        <div className="pt-1 w-3/4 mx-auto mt-4">
                            <button
                                type="submit"
                                disabled={status === 'submitting' || code.length !== 6}
                                className="group relative flex w-full justify-center rounded-2xl bg-neutral-700 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
                            >
                                {status === 'submitting' ? 'Проверка...' : 'Проверить'}
                            </button>
                        </div>

                        {/* Скрытое поле для хранения полного кода */}
                        <input type="hidden" name="code" value={code} />
                    </form>
                )}

                {step === 'newPassword' && (
                    <form className="flex flex-col gap-2" onSubmit={handlePasswordSubmit}>
                        {passwordError && (
                            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                                {passwordError}
                            </div>
                        )}

                        <div className="relative">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="text"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder=" "
                                className="peer block w-full rounded-2xl border py-3 px-4 text-neutral-900 focus:border-blue-500 dark:text-white shadow-sm outline-none border-neutral-200 dark-border-neutral-800 sm:text-sm sm:leading-6 transition-all"
                            />
                            <label
                                htmlFor="newPassword"
                                className={`absolute left-3.5 text-sm top-1/2 -translate-y-1/2 text-neutral-500 bg-white dark:bg-neutral-800 rounded-lg transition-all duration-200 px-2
                                    peer-focus:text-[11px] peer-focus:text-neutral-800 dark:peer-focus:text-neutral-200 peer-focus:top-0 peer-focus:-translate-y-1/2
                                    peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2`}
                            >
                                Новый пароль
                            </label>
                        </div>

                        <div className="relative mt-2">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="text"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder=" "
                                className="peer block w-full rounded-2xl border py-3 px-4 text-neutral-900 focus:border-blue-500 dark:text-white shadow-sm outline-none border-neutral-200 dark-border-neutral-800 sm:text-sm sm:leading-6 transition-all"
                            />
                            <label
                                htmlFor="confirmPassword"
                                className={`absolute left-3.5 text-sm top-1/2 -translate-y-1/2 text-neutral-500 bg-white dark:bg-neutral-800 rounded-lg transition-all duration-200 px-2
                                    peer-focus:text-[11px] peer-focus:text-neutral-800 dark:peer-focus:text-neutral-200 peer-focus:top-0 peer-focus:-translate-y-1/2
                                    peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2`}
                            >
                                Подтвердите пароль
                            </label>
                        </div>

                        <div className="pt-1 w-3/4 mx-auto mt-4">
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="group relative flex w-full justify-center rounded-2xl bg-neutral-700 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
                            >
                                {status === 'submitting' ? 'Обновление...' : 'Обновить'}
                            </button>
                        </div>
                    </form>
                )}

                {/* <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">или</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                            Вернуться к входу
                        </Link>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
