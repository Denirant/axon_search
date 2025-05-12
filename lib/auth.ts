// lib/auth.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface UserData {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: UserData): string {
  return jwt.sign({ 
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image
  }, JWT_SECRET, { expiresIn: '7d' });
}

const tokenCache = new Map<string, { userData: UserData | null, timestamp: number }>();
const TOKEN_CACHE_DURATION = 60 * 1000; // 1 минута

export function verifyToken(token: string): UserData | null {
  // Проверяем кэш
  const now = Date.now();
  if (tokenCache.has(token)) {
    const cached = tokenCache.get(token)!;
    if (now - cached.timestamp < TOKEN_CACHE_DURATION) {
      return cached.userData;
    }
  }

  try {
    // Проверяем токен
    const userData = jwt.verify(token, JWT_SECRET) as UserData;
    
    // Сохраняем результат в кэш
    tokenCache.set(token, {
      userData,
      timestamp: now
    });
    
    return userData;
  } catch (error) {
    // Кэшируем отрицательный результат
    tokenCache.set(token, {
      userData: null,
      timestamp: now
    });
    
    return null;
  }
}


export async function getUserFromToken(token: string): Promise<UserData | null> {
  const payload = verifyToken(token);
  if (!payload) return null;
  
  const user = await prisma.User.findUnique({ where: { id: payload.id } });
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image
  };
}

export async function getCurrentUser(req?: NextRequest): Promise<UserData | null> {
  // Для использования в API маршрутах с NextRequest
  if (req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    return await getUserFromToken(token);
  }
  
  // Для использования в серверных компонентах
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return await getUserFromToken(token);
}

// lib/auth.ts - функция setAuthCookie
export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: 'token',
    value: token,
    httpOnly: false, // JavaScript сможет читать куки
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  });
}


export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}