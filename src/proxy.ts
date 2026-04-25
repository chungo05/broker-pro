import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  if (path === '/admin/login' || path.startsWith('/admin/login/')) {
    return NextResponse.next()
  }
  if (path.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const signIn = new URL('/admin/login', req.url)
      signIn.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(signIn)
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
