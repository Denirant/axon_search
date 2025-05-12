// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Валидация входных данных
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Проверка на существование пользователя
    const existingUser = await prisma.User.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await hashPassword(password);

    // Создание пользователя
    const user = await prisma.User.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      }
    });

    // Создаем токен для авто-авторизации после регистрации
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image
    });

    // Создаем и возвращаем ответ
    const response = NextResponse.json(
      { 
        message: 'Регистрация успешна',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      },
      { status: 201 }
    );

    // Устанавливаем cookie с JWT
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return NextResponse.json(
      { error: 'Ошибка при регистрации пользователя' },
      { status: 500 }
    );
  }
}