// middleware.jsimport { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;

  // Force HTTPS only in production
  if (process.env.NODE_ENV === 'production' && url.protocol === 'http:') {
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: '/:path*',
};
