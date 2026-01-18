import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    // Protect admin routes
    if (pathname.startsWith('/admin') && !token) {
        const response = NextResponse.redirect(new URL('/', request.url));
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    // Prevent logged-in users from seeing login page
    if (pathname === '/' && token) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    const response = NextResponse.next();

    // Add anti-caching headers to all admin routes to prevent back-button issues
    if (pathname.startsWith('/admin')) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
}

export const config = {
    matcher: ['/', '/admin/:path*'],
};
