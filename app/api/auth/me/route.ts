// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        }
      );
    }
    
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        }
      );
    }

    // Добавляем timestamp к ответу для гарантии уникальности
    const timestamp = new Date().toISOString();

    return NextResponse.json(
      { 
        user,
        timestamp
      }, 
      { 
        status: 200,
        headers: {
          // Настройки для обхода кэширования
          'Cache-Control': 'no-store, max-age=0',
          'X-Response-Time': timestamp,
          'Vary': '*'
        }
      }
    );
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}