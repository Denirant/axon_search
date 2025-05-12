// app/api/auth/check-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  
  // Добавим заголовки для предотвращения кэширования
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  
  if (!token) {
    return NextResponse.json(
      { hasToken: false, isValid: false },
      { status: 200, headers }
    );
  }
  
  const userData = verifyToken(token);
  
  return NextResponse.json(
    { hasToken: true, isValid: !!userData },
    { status: 200, headers }
  );
}