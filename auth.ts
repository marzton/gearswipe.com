import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

// CF Access auth (production)
export function getCFAccessEmail(headers: Headers): string | null {
  return headers.get("CF-Access-Authenticated-User-Email");
}

export function getCFAccessUserId(headers: Headers): string | null {
  return headers.get("CF-Access-Authenticated-User-Id");
}

// NextAuth fallback (local dev)
const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET?.trim();
const LOCAL_ADMIN_EMAIL = process.env.GEARSWIPE_ADMIN_EMAIL?.trim();
const LOCAL_ADMIN_PASSWORD = process.env.GEARSWIPE_ADMIN_PASSWORD?.trim();

const adminEmails = new Set(
  (process.env.GEARSWIPE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const localCredentialsEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.GEARSWIPE_ENABLE_LOCAL_CREDENTIALS === "true" &&
  Boolean(LOCAL_ADMIN_EMAIL && LOCAL_ADMIN_PASSWORD);

export const isGoogleAuthConfigured = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && adminEmails.has(email.toLowerCase()));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(isGoogleAuthConfigured
      ? [Google({ clientId: GOOGLE_CLIENT_ID!, clientSecret: GOOGLE_CLIENT_SECRET! })]
      : []),
    ...(localCredentialsEnabled
      ? [Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;
        if (email !== LOCAL_ADMIN_EMAIL?.toLowerCase() || password !== LOCAL_ADMIN_PASSWORD) {
          return null;
        }

        return {
          id: email,
          name: email,
          email,
          role: "admin",
        } satisfies User;
      },
    })]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.role = isAdminEmail(user.email) ? "admin" : "user";
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.role = token.role === "admin" ? "admin" : "user";
      }
      return session;
    },
  },
});
