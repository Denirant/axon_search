// components/auth/OAuthErrorHandler.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface OAuthErrorHandlerProps {
  setError: (error: string) => void;
}

export default function OAuthErrorHandler({ setError }: OAuthErrorHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Получаем параметр ошибки из URL
    const errorParam = searchParams.get('error');
    
    if (errorParam) {
      let errorMessage = 'Произошла ошибка при авторизации';
      
      // Обрабатываем различные типы ошибок
      switch (errorParam) {
        case 'vk_requires_https':
          errorMessage = 'ВКонтакте требует HTTPS. Пожалуйста, используйте другой метод авторизации или настройте HTTPS для локальной разработки.';
          break;
        case 'user_not_found':
          errorMessage = 'Пользователь не найден. Пожалуйста, зарегистрируйтесь.';
          break;
        case 'email_not_provided':
          errorMessage = 'Email не предоставлен. Пожалуйста, разрешите доступ к email в настройках социальной сети.';
          break;
        case 'invalid_state':
          errorMessage = 'Недействительный запрос авторизации. Пожалуйста, попробуйте снова.';
          break;
        case 'token_error':
          errorMessage = 'Ошибка получения токена доступа. Пожалуйста, попробуйте снова.';
          break;
        case 'userinfo_error':
          errorMessage = 'Ошибка получения данных пользователя. Пожалуйста, попробуйте снова.';
          break;
        case 'oauth_callback_error':
          errorMessage = 'Ошибка при обработке ответа от сервиса авторизации. Пожалуйста, попробуйте снова.';
          break;
        case 'oauth_error':
          errorMessage = 'Ошибка при инициализации авторизации. Пожалуйста, попробуйте снова.';
          break;
      }
      
      // Устанавливаем сообщение об ошибке
      setError(errorMessage);
      
      // Очищаем URL от параметра ошибки
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('error');
      
      // Заменяем текущий URL без перезагрузки страницы
      const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, setError, router]);

  // Возвращаем null, так как это утилитарный компонент
  return null;
}