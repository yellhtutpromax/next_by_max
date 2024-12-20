import { NextResponse } from 'next/server'
import {decrypt, refreshAccessToken} from '@/app/lib/session'
import { cookies } from 'next/headers'

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard','/members']
const publicRoutes = ['/auth/login', '/signup', '/']

export default async function middleware(request) {
  // 2. Check if the current route is protected or public
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('rats')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  let session;

  if (accessToken) {
    session = await decrypt(accessToken);
  }

  // console.log("Is Protected Route:", isProtectedRoute)
  // console.log("Is Public Route:", isPublicRoute)
  // console.log("Cookie Value:", cookie)
  // console.log("Session Value:", session)
  // console.log("Middleware is running ....")
  // console.log("Path", path)

  // If access token is expired, attempt to refresh using refresh token
  if (!session?.id && refreshToken) {
    const newAccessToken = await refreshAccessToken(refreshToken);
    // console.log('Access token refreshed ...');
    // console.log('----------------------------------------------------')
  }


  // Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL('/auth/login', request.nextUrl))
  }

  // Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.id &&
    !request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    request.user = session; // add decrypt data to request
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)'
  ],
}
