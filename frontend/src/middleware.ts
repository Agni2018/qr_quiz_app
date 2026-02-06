import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    // Protect dashboard and users routes
    if ((pathname.startsWith('/users') || pathname.startsWith('/dashboard')) && !token) {
        const response = NextResponse.redirect(new URL('/', request.url));
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    // Prevent logged-in users from seeing login page
    if (pathname === '/' && token) {
        return NextResponse.redirect(new URL('/users', request.url));
    }

    const response = NextResponse.next();

    // Set headers to prevent caching for all matched routes
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
}

export const config = {
    matcher: ['/', '/users/:path*', '/dashboard/:path*'],
};
