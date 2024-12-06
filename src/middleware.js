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

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('rats')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value

  let session

  if (accessToken) {
    session = await decrypt(accessToken)
  }

  // If access token is expired, attempt to refresh
  if (!session?.id && refreshToken) {
    await refreshAccessToken(refreshToken)
  }

  console.log(session)
  console.log('Middleware is running at'+ path)
  console.log('*********************************************')

  // Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.id && !refreshToken) {
    cookieStore.delete('rats')
    cookieStore.delete('refresh_token')
    return NextResponse.redirect(new URL('/auth/login', request.nextUrl))
  }

  // Redirect to specific route ( After user is authenticated )
  if (
    isPublicRoute &&
    session?.id &&
    !request.nextUrl.pathname.startsWith(`/${session.redirect_route}`)
  ) {
    request.user = session // add decrypt data to request
    return NextResponse.redirect(new URL(`/${session.redirect_route}`, request.nextUrl))
  }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)'
  ],
}
