// app/register/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import LoadingFallback from '@/components/LoadingFallback';

export default function RegisterPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  // Эффект для быстрой проверки токена
  useEffect(() => {
    // Проверяем, есть ли токен в куки
    const hasToken = document.cookie.includes('token=');
    
    if (hasToken) {
      // Если токен найден, перенаправляем на главную
      router.replace('/');
    } else {
      // Если токена нет, показываем форму регистрации
      setIsRedirecting(false);
    }
  }, [router]);
  
  // Отображаем загрузку, пока проверяем токен
  if (isRedirecting) {
    return <LoadingFallback />;
  }
  
  // Если пользователь не авторизован, показываем форму регистрации
  return <RegisterForm />;
}