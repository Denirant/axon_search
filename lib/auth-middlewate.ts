import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export async function authenticateApiRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return { 
      isAuthenticated: false,
      response: NextResponse.json({ error: 'Не авторизован' }, { status: 401 }) 
    };
  }
  
  const userData = verifyToken(token);
  if (!userData) {
    return { 
      isAuthenticated: false,
      response: NextResponse.json({ error: 'Недействительный токен' }, { status: 401 }) 
    };
  }
  
  return {
    isAuthenticated: true,
    userData,
    response: null
  };
}