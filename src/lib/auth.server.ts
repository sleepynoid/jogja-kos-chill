import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { useAppSession, type SessionUser } from "./session";
import { supabase } from "./supabase";

// ============================================================
// GET CURRENT USER (from session)
// ============================================================

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession();
    return session.data.user ?? null;
  },
);

// ============================================================
// LOGIN
// ============================================================

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { email, password } = data;

    // Fetch mitra by email from Supabase
    const { data: mitra, error } = await supabase
      .from("mitra")
      .select("uuid, nama, email, password, is_premium")
      .eq("email", email)
      .single();

    if (error || !mitra) {
      return { error: "Email atau password salah." };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, mitra.password);
    if (!isValid) {
      return { error: "Email atau password salah." };
    }

    // Create session
    const session = await useAppSession();
    const user: SessionUser = {
      uuid: mitra.uuid,
      nama: mitra.nama,
      email: mitra.email,
      is_premium: mitra.is_premium,
    };

    await session.update({ user });

    return { success: true, user };
  });

// ============================================================
// REGISTER (Sign Up)
// ============================================================

export const registerFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { nama: string; email: string; password_raw: string; telepon?: string }) => data,
  )
  .handler(async ({ data }) => {
    const { nama, email, password_raw, telepon } = data;

    // Check if email already exists
    const { data: existing } = await supabase
      .from("mitra")
      .select("uuid")
      .eq("email", email)
      .single();

    if (existing) {
      return { error: "Email sudah terdaftar." };
    }

    // Hash password
    const password = await bcrypt.hash(password_raw, 12);

    // Insert new mitra
    const { data: newMitra, error } = await supabase
      .from("mitra")
      .insert({ nama, email, password, telepon: telepon || null })
      .select("uuid, nama, email, is_premium")
      .single();

    if (error || !newMitra) {
      return { error: "Gagal mendaftar. Coba lagi." };
    }

    // Create session
    const session = await useAppSession();
    const user: SessionUser = {
      uuid: newMitra.uuid,
      nama: newMitra.nama,
      email: newMitra.email,
      is_premium: newMitra.is_premium,
    };

    await session.update({ user });

    return { success: true, user };
  });

// ============================================================
// LOGOUT
// ============================================================

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession();
  await session.clear();
  throw redirect({ to: "/" });
});
