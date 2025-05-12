// app/api/user/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    // Получаем текущего авторизованного пользователя
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Получаем данные из запроса
    const { name, image } = await req.json();

    // Обновляем профиль в базе данных
    const updatedUser = await prisma.User.update({
      where: { id: currentUser.id },
      data: {
        // Обновляем только те поля, которые были переданы
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image })
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true
      }
    });

    return NextResponse.json({
      message: 'Профиль успешно обновлен',
      user: updatedUser
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при обновлении профиля' },
      { status: 500 }
    );
  }
}