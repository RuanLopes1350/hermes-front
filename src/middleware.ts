import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const sessionCookie =
		request.cookies.get('better-auth.session_token') ||
		request.cookies.get('__Secure-better-auth.session_token');

	const { pathname } = request.nextUrl;

	if (pathname.startsWith('/system')) {
		if (!sessionCookie) {
			return NextResponse.redirect(new URL('/auth/sign-in', request.url));
		}
	}

	if (pathname.startsWith('/auth') && sessionCookie) {
		return NextResponse.redirect(new URL('/system/dashboard', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/system/:path*',
		'/auth/:path*',
	],
};
