declare module 'next-auth' {
  const NextAuth: any
  export default NextAuth
  export type NextAuthOptions = any
}

declare module 'next-auth/providers/github' {
  const GitHubProvider: any
  export default GitHubProvider
}

declare module 'next-auth/providers/google' {
  const GoogleProvider: any
  export default GoogleProvider
}

declare module 'next-auth/jwt' {
  export function getToken(options: any): Promise<any>
}

declare module 'next-auth/react' {
  export const signIn: any
  export const signOut: any
  export const useSession: any
  export const getSession: any
  export const SessionProvider: any
}

declare module '@testing-library/react' {
  export const render: any
  export const screen: any
  export const fireEvent: any
  export const waitFor: any
  export const cleanup: any
}

declare module '@testing-library/jest-dom' {
  const jestDom: any
  export default jestDom
}

declare module '@vercel/analytics/react' {
  export const Analytics: any
}

declare module 'framer-motion' {
  export const motion: any
  export const AnimatePresence: any
}
