import { NextResponse } from 'next/server';
import { fetchFromBaasAPI } from '@/lib/server/api';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
  }

  try {
    const response = await fetchFromBaasAPI('/api/v1/auth/refresh', {
      method: 'POST',
      body: {
        data: {
          type: 'token',
          attributes: {
            refresh_token: refreshToken,
          },
        },
      },
    });

    const { access_token, refresh_token, expires_in } = response.data.attributes;

    const res = NextResponse.json({ message: 'Token refreshed' });

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
