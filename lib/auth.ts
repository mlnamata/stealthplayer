import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

export const authOptions: NextAuthOptions = {
  providers: DEMO_MODE
    ? [
        // Demo mode - pro testování bez Google OAuth
        CredentialsProvider({
          name: 'Demo Account',
          credentials: {
            email: { label: 'Email', type: 'email', value: 'demo@example.com' },
            password: { label: 'Password', type: 'password' },
          },
          async authorize(credentials) {
            // V demo módu se přijímá jakékoliv heslo
            if (credentials?.email) {
              return {
                id: 'demo-user',
                name: 'Demo User',
                email: credentials.email,
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser',
              };
            }
            return null;
          },
        }),
      ]
    : [
        // Production mode - Google OAuth
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
      ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production',
};
