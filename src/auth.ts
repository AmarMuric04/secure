import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db/mongodb-client";
import { connectDB } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models";
import { verifyAuthHash } from "@/lib/crypto/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        authHash: { label: "Auth Hash", type: "password" },
      },
      async authorize(credentials) {
        console.log("[NextAuth Credentials] Authorize called");

        if (!credentials?.email || !credentials?.authHash) {
          console.log("[NextAuth Credentials] Missing credentials");
          return null;
        }

        await connectDB();

        console.log(
          "[NextAuth Credentials] Looking for user:",
          (credentials.email as string).toLowerCase(),
        );

        const user = await UserModel.findOne({
          email: (credentials.email as string).toLowerCase(),
          status: "active",
        }).select("+authHash +authSalt");

        if (!user) {
          console.log("[NextAuth Credentials] User not found");
          return null;
        }

        console.log(
          "[NextAuth Credentials] User found, hasAuthHash:",
          !!user.authHash,
        );

        // OAuth users don't have authHash - they should use Google sign-in
        if (!user.authHash) {
          console.log(
            "[NextAuth Credentials] User has no authHash (OAuth user)",
          );
          return null;
        }

        console.log(
          "[NextAuth Credentials] Verifying authHash, lengths:",
          (credentials.authHash as string).length,
          user.authHash.length,
        );

        const isValid = await verifyAuthHash(
          credentials.authHash as string,
          user.authHash,
        );

        console.log("[NextAuth Credentials] Verification result:", isValid);

        if (!isValid) {
          return null;
        }

        // Check if MFA is required
        if (user.mfaEnabled) {
          // Return a special response indicating MFA is needed
          // This will be handled in the signIn callback
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatarUrl,
            mfaRequired: true,
          };
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/vault",
  },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, create/update user in our system
      if (account?.provider === "google") {
        await connectDB();

        const existingUser = await UserModel.findOne({
          email: user.email?.toLowerCase(),
        });

        if (!existingUser) {
          // Create new user for OAuth
          await UserModel.create({
            email: user.email?.toLowerCase(),
            name: user.name || undefined,
            avatarUrl: user.image || undefined,
            emailVerified: true,
            emailVerifiedAt: new Date(),
            authProvider: "google",
            mfaEnabled: false,
            settings: {
              theme: "dark",
              language: "en",
              timezone: "UTC",
              autoLockMinutes: 15,
              clearClipboardSeconds: 30,
              showPasswordStrength: true,
              emailOnNewLogin: true,
              emailOnPasswordChange: true,
              emailSecurityAlerts: true,
              defaultView: "grid",
              defaultSort: "name",
              showFavicons: true,
            },
            status: "active",
          });
        } else {
          // Update existing user's OAuth info
          await UserModel.updateOne(
            { _id: existingUser._id },
            {
              $set: {
                name: existingUser.name || user.name || undefined,
                avatarUrl: existingUser.avatarUrl || user.image || undefined,
                lastLoginAt: new Date(),
              },
            },
          );
        }
      }

      // Handle MFA requirement for credentials login
      if (
        account?.provider === "credentials" &&
        (user as { mfaRequired?: boolean }).mfaRequired
      ) {
        // Store MFA state - will be checked in JWT callback
        return `/login?mfa=required&userId=${user.id}`;
      }

      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }

      // Refresh user data on token refresh
      if (trigger === "update") {
        await connectDB();
        const dbUser = await UserModel.findById(token.id);
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.avatarUrl;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Log successful sign-in
      await connectDB();
      await UserModel.updateOne(
        { email: user.email?.toLowerCase() },
        { $set: { lastLoginAt: new Date() } },
      );
    },
  },
  debug: process.env.NODE_ENV === "development",
});

// Type augmentation for NextAuth
declare module "next-auth" {
  interface User {
    mfaRequired?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      provider?: string;
    };
  }
}
