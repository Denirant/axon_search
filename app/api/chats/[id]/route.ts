// app/api/chats/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Получить информацию о конкретном чате
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    const chatId = params.id;
    
    // Проверяем, что чат существует и принадлежит пользователю
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            attachments: true
          }
        }
      }
    });
    
    if (!chat) {
      return NextResponse.json(
        { error: 'Чат не найден' },
        { status: 404 }
      );
    }
    
    if (chat.userId !== user.id) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }
    
    // Обновляем время последнего просмотра
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });
    
    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Ошибка получения чата:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Обновить информацию о чате
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    const chatId = params.id;
    const { title } = await req.json();
    
    // Проверяем, что чат существует и принадлежит пользователю
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });
    
    if (!chat) {
      return NextResponse.json(
        { error: 'Чат не найден' },
        { status: 404 }
      );
    }
    
    if (chat.userId !== user.id) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }
    
    // Обновляем название чата
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { title }
    });
    
    return NextResponse.json({ chat: updatedChat });
  } catch (error) {
    console.error('Ошибка обновления чата:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Удалить чат
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    const chatId = params.id;
    
    // Проверяем, что чат существует и принадлежит пользователю
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });
    
    if (!chat) {
      return NextResponse.json(
        { error: 'Чат не найден' },
        { status: 404 }
      );
    }
    
    if (chat.userId !== user.id) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }
    
    // Удаляем чат (каскадно удалятся и все его сообщения благодаря Prisma)
    await prisma.chat.delete({
      where: { id: chatId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления чата:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}