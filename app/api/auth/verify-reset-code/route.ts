// app/api/auth/verify-reset-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyResetCode } from '@/lib/resetPassword';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email и код подтверждения обязательны' },
        { status: 400 }
      );
    }

    // Проверка кода восстановления
    const result = await verifyResetCode(email, code);

    return NextResponse.json(
      { valid: result.valid, message: result.message },
      { status: result.valid ? 200 : 400 }
    );

  } catch (error) {
    console.error('Ошибка проверки кода сброса пароля:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}