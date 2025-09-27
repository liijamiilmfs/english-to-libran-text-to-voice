import NextAuth from 'next-auth'
import { NextRequest } from 'next/server'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { log, generateCorrelationId } from '@/lib/logger'

const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      const requestId = generateCorrelationId()
      
      log.info('User sign in attempt', {
        event: 'AUTH_SIGN_IN',
        corr_id: requestId,
        ctx: {
          provider: account?.provider,
          userId: user.id,
          userEmail: user.email,
          userName: user.name
        }
      })

      return true
    },
    async jwt({ token, user, account, profile }: any) {
      const requestId = generateCorrelationId()
      
      if (account && user) {
        token.accessToken = account.access_token
        token.githubId = user.id
        token.githubUsername = profile?.login
        token.githubAvatar = profile?.avatar_url
        
        log.info('JWT token created', {
          event: 'AUTH_JWT_CREATED',
          corr_id: requestId,
          ctx: {
            userId: user.id,
            userEmail: user.email,
            provider: account.provider
          }
        })
      }
      
      return token
    },
    async session({ session, token }: any) {
      const requestId = generateCorrelationId()
      
      if (token) {
        session.accessToken = token.accessToken
        session.user.id = token.githubId as string
        session.user.githubUsername = token.githubUsername as string
        session.user.githubAvatar = token.githubAvatar as string
      }
      
      log.info('Session created', {
        event: 'AUTH_SESSION_CREATED',
        corr_id: requestId,
        ctx: {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name
        }
      })
      
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

export const GET = handlers.GET
export const POST = handlers.POST
