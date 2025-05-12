// app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { saveResetCode } from '@/lib/resetPassword';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400 }
      );
    }

    const result = await saveResetCode(email);
    
    return NextResponse.json(
      { message: result.message },
      { status: result.success ? 200 : 400 }
    );

  } catch (error) {
    console.error('Ошибка запроса сброса пароля:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}