import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string;
      discordId?: string;
      isAdmin?: boolean;
      status?: string;
      tournamentName?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string;
    userId?: string;
    isAdmin?: boolean;
    status?: string;
    tournamentName?: string | null;
  }
}
