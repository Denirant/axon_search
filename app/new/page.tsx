// app/docs/page.tsx (или любой другой защищенный маршрут)
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingFallback from '@/components/LoadingFallback';

export default function NewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      // Если загрузка завершена и пользователь не авторизован
      if (user) {
        router.push('/');
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [user, loading, router]);
  
  // Показываем загрузку во время проверки авторизации
  if (loading || isCheckingAuth) {
    return <LoadingFallback />;
  }
  
  // Показываем содержимое только для авторизованных пользователей
  return (
    <div>
      <h1>New</h1>
      {/* Содержимое страницы */}
    </div>
  );
}