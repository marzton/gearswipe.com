import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

const DEFAULT_ADMIN_EMAIL =
  process.env.GEARSWIPE_ADMIN_EMAIL?.trim() || "admin@gearswipe.com";
const DEFAULT_ADMIN_PASSWORD =
  process.env.GEARSWIPE_ADMIN_PASSWORD?.trim() || "gearswipe-admin";
const AUTH_SECRET =
  process.env.AUTH_SECRET?.trim() ||
  process.env.NEXTAUTH_SECRET?.trim() ||
  "gearswipe-local-auth-secret";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;
        if (email !== DEFAULT_ADMIN_EMAIL.toLowerCase() || password !== DEFAULT_ADMIN_PASSWORD) {
          return null;
        }

        return {
          id: email,
          name: email,
          email,
          role: "admin",
        } satisfies User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.role = "admin";
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

export const adminLoginHint = {
  email: DEFAULT_ADMIN_EMAIL,
  password: DEFAULT_ADMIN_PASSWORD,
};
