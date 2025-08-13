// middleware.js
import { NextResponse } from 'next/server';

// Simple in-memory rate limit store
const rateLimit = {};

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimit[ip]) rateLimit[ip] = [];
  // Keep only requests from the last minute
  rateLimit[ip] = rateLimit[ip].filter(ts => now - ts < 60000);

  if (rateLimit[ip].length >= 10) {
    return false; // limit reached
  }

  rateLimit[ip].push(now);
  return true;
}

export function middleware(req) {
  const url = req.nextUrl;
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';

  //  Always enforce HTTPS
  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // Apply rate limit only for /auth/session
  if (url.pathname.startsWith('/auth/session')) {
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

// Match all routes so HTTPS enforcement works, but rate limit only applies to /auth/session
export const config = {
  matcher: ['/:path*'],
};
