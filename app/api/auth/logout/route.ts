import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const res = NextResponse.json({ message: 'Logout successful' });

  res.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    sameSite: 'lax',
    path: '/',
  });

  res.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    sameSite: 'lax',
    path: '/',
  });

  return res;
}
