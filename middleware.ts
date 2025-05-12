// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Страницы для неавторизованных пользователей
const authRoutes = ['/login', '/register'];

// API-маршруты, требующие авторизации
const protectedApiRoutes = ['/api/chats', '/api/user'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;
  
  // Для маршрута /docs и его подпутей выключаем middleware полностью
  if (path === '/docs' || path.startsWith('/docs/')) {
    return NextResponse.next();
  }
  
  // Проверяем валидность токена
  const isTokenValid = token ? verifyToken(token) !== null : false;
  
  // Обработка API-маршрутов
  if (protectedApiRoutes.some(route => path.startsWith(route)) && !isTokenValid) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  
  // Обработка страниц авторизации
  if (authRoutes.includes(path) && isTokenValid) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};