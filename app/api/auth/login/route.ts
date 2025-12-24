import { NextResponse } from 'next/server';
import { fetchFromBaasAPI } from '@/lib/server/api';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const response = await fetchFromBaasAPI('/api/v1/auth/login', {
      method: 'POST',
      body: {
        data: {
          type: 'token',
          attributes: {
            email,
            password,
          },
        },
      },
    });

    const { access_token, refresh_token, expires_in } = response.data.attributes;

    const res = NextResponse.json({ message: 'Login successful' });

    res.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in,
      sameSite: 'lax',
      path: '/',
    });

    res.cookies.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

