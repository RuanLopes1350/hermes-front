import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Better Auth utiliza cookies para gerenciar a sessão.
  // Em desenvolvimento, o nome padrão é 'better-auth.session_token'
  // Em produção (com HTTPS), pode ser '__Secure-better-auth.session_token'
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const { pathname } = request.nextUrl;

  // 1. Proteger rotas do sistema
  if (pathname.startsWith("/system")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
  }

  // 2. Redirecionar usuários logados que tentam acessar páginas de login/cadastro
  if (pathname.startsWith("/auth") && sessionCookie) {
    // Redireciona para o dashboard ou página inicial do sistema
    return NextResponse.redirect(new URL("/system/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // api (API routes)
    // _next/static (static files)
    // _next/image (image optimization files)
    // favicon.ico (favicon file)
    "/system/:path*",
    "/auth/:path*",
  ],
};
