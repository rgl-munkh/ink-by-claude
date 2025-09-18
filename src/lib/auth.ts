import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
);

export interface TattooistUser {
  id: string;
  username: string;
  role: 'tattooist';
}

export async function createSession(user: TattooistUser) {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string): Promise<TattooistUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.user as TattooistUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TattooistUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  return verifySession(token);
}

export async function getSessionFromRequest(request: NextRequest): Promise<TattooistUser | null> {
  const token = request.cookies.get('session')?.value;

  if (!token) return null;

  return verifySession(token);
}

export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.TATTOOIST_USERNAME || 'admin';
  const validPassword = process.env.TATTOOIST_PASSWORD || 'admin123';

  return username === validUsername && password === validPassword;
}