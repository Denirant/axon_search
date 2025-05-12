// app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyResetCode, updatePassword } from '@/lib/resetPassword';

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, код и новый пароль обязательны' },
        { status: 400 }
      );
    }

    // Проверяем код еще раз для безопасности
    const verifyResult = await verifyResetCode(email, code);
    if (!verifyResult.valid) {
      return NextResponse.json(
        { error: verifyResult.message },
        { status: 400 }
      );
    }

    // Обновляем пароль
    const updateResult = await updatePassword(email, newPassword);

    return NextResponse.json(
      { message: updateResult.message },
      { status: updateResult.success ? 200 : 400 }
    );

  } catch (error) {
    console.error('Ошибка сброса пароля:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}