import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which roles can access which paths
const rolePathMap: Record<string, string[]> = {
  admin: ['/admin'],
  dean: ['/dean'],
  activity_head: ['/activity-head'],
  club: ['/club'],
  student: ['/student'],
};

// Public paths that don't require authentication
const publicPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow root path (handles redirect logic in page.tsx)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for user cookie/token
  // Note: We read from cookies since localStorage isn't available in middleware.
  // The actual auth state is managed by AuthContext on the client side.
  // This middleware provides a first-pass protection layer.
  const userCookie = request.cookies.get('user');
  let userRole: string | null = null;

  if (userCookie?.value) {
    try {
      const user = JSON.parse(userCookie.value);
      userRole = user.role;
    } catch {
      // Invalid cookie
    }
  }

  // If no cookie, check if the path requires auth
  // We allow client-side AuthContext to handle the full redirect,
  // but we can block obviously wrong role-path combinations
  if (userRole) {
    const allowedPaths = rolePathMap[userRole] || [];
    const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));

    if (!isAllowed) {
      // Redirect to their correct dashboard
      const redirectPath = allowedPaths[0]
        ? `${allowedPaths[0]}/dashboard`
        : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
