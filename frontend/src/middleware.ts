import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userRole = request.cookies.get('userRole')?.value;
    const pathname = request.nextUrl.pathname;

    // Protect dashboard and users routes
    if ((pathname.startsWith('/users') || pathname.startsWith('/dashboard')) && !token) {
        const response = NextResponse.redirect(new URL('/', request.url));
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    // Role-based protection for /users (Admin only)
    if (pathname.startsWith('/users') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }

    // Prevent logged-in users from seeing login page
    if (pathname === '/' && token) {
        if (userRole === 'admin') {
            return NextResponse.redirect(new URL('/users', request.url));
        } else {
            return NextResponse.redirect(new URL('/dashboard/student', request.url));
        }
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
