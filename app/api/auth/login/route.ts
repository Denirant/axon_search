// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePasswords, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Валидация входных данных
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Поиск пользователя
    const user = await prisma.User.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверка пароля
    const passwordValid = await comparePasswords(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Создаем JWT токен
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image
    });

    // Создаем и возвращаем ответ
    const response = NextResponse.json(
      { 
        message: 'Авторизация успешна',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      },
      { status: 200 }
    );

    // Устанавливаем cookie с JWT
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return NextResponse.json(
      { error: 'Ошибка при авторизации' },
      { status: 500 }
    );
  }
}