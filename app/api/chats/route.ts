// app/api/chats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateChatId } from '@/lib/utils';

// Получить список чатов пользователя
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    // Получаем чаты пользователя
    const chats = await prisma.chat.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Ошибка получения чатов:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Создать новый чат
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    const { title } = await req.json();
    
    // Создаем новый чат
    const chat = await prisma.chat.create({
      data: {
        id: generateChatId(), // Используем функцию из utils для создания уникального ID
        title: title || 'Новый чат',
        userId: user.id
      }
    });
    
    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания чата:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}