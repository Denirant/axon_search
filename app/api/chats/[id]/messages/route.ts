// app/api/chats/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateMessageId } from '@/lib/messageUtils';

// Добавить сообщение в чат
export async function POST(
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
    const { role, content, rawJson, attachments = [] } = await req.json();
    
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
    
    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        chatId,
        role,
        content,
        rawJson: rawJson ? JSON.parse(JSON.stringify(rawJson)) : undefined,
      }
    });
    
    // Добавляем вложения, если они есть
    if (attachments.length > 0) {
      const attachmentPromises = attachments.map((attachment: any) => 
        prisma.attachment.create({
          data: {
            messageId: message.id,
            name: attachment.name || 'Attachment',
            contentType: attachment.contentType || 'application/octet-stream',
            url: attachment.url,
            size: attachment.size || 0
          }
        })
      );
      
      await Promise.all(attachmentPromises);
    }
    
    // Обновляем время последнего обновления чата
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });
    
    // Получаем полное сообщение с вложениями
    const fullMessage = await prisma.message.findUnique({
      where: { id: message.id },
      include: { attachments: true }
    });
    
    return NextResponse.json({ message: fullMessage }, { status: 201 });
  } catch (error) {
    console.error('Ошибка добавления сообщения:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}