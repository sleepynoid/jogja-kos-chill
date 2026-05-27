import { useSession } from "@tanstack/react-start/server";

const SESSION_SECRET = process.env.SESSION_SECRET || "jogja-kos-chill-secret-key-min-32-chars!!";

export type SessionUser = {
  uuid: string;
  nama: string;
  email: string;
  role: "mitra" | "user";
  is_premium?: boolean; // only for mitra
  is_admin?: boolean; // only for admin users
};

export type SessionData = {
  user?: SessionUser;
};

export function useAppSession() {
  return useSession<SessionData>({
    name: "knsleep-session",
    password: SESSION_SECRET,
    cookie: {
      sameSite: "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  });
}
