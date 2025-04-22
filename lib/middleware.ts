import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/login', '/signup'];
  const path = req.nextUrl.pathname;

  if (
    protectedRoutes.some(route => path === route || path.startsWith(`${route}/`)) && 
    !session
  ) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (authRoutes.includes(path) && session) {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/signup'],
};