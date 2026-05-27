import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { useAppSession, type SessionUser } from "./session";
import { supabase } from "./supabase";

// ============================================================
// GET CURRENT USER (from session)
// ============================================================

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession();
  return session.data.user ?? null;
});

// ============================================================
// MITRA LOGIN
// ============================================================

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { email, password } = data;

    const { data: mitra, error } = await supabase
      .from("mitra")
      .select("uuid, nama, email, password, is_premium")
      .eq("email", email)
      .single();

    if (error || !mitra) {
      return { error: "Email atau password salah." };
    }

    const isValid = await bcrypt.compare(password, mitra.password);
    if (!isValid) {
      return { error: "Email atau password salah." };
    }

    const session = await useAppSession();
    const user: SessionUser = {
      uuid: mitra.uuid,
      nama: mitra.nama,
      email: mitra.email,
      role: "mitra",
      is_premium: mitra.is_premium,
    };

    await session.update({ user });

    return { success: true, user };
  });

// ============================================================
// MITRA REGISTER
// ============================================================

export const registerFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { nama: string; email: string; password_raw: string; telepon?: string }) => data,
  )
  .handler(async ({ data }) => {
    const { nama, email, password_raw, telepon } = data;

    const { data: existing } = await supabase
      .from("mitra")
      .select("uuid")
      .eq("email", email)
      .single();

    if (existing) {
      return { error: "Email sudah terdaftar." };
    }

    const password = await bcrypt.hash(password_raw, 12);

    const { data: newMitra, error } = await supabase
      .from("mitra")
      .insert({ nama, email, password, telepon: telepon || null })
      .select("uuid, nama, email, is_premium")
      .single();

    if (error || !newMitra) {
      return { error: "Gagal mendaftar. Coba lagi." };
    }

    const session = await useAppSession();
    const user: SessionUser = {
      uuid: newMitra.uuid,
      nama: newMitra.nama,
      email: newMitra.email,
      role: "mitra",
      is_premium: newMitra.is_premium,
    };

    await session.update({ user });

    return { success: true, user };
  });

// ============================================================
// USER LOGIN (pencari kos)
// ============================================================

export const userLoginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { email, password } = data;

    const { data: user, error } = await supabase
      .from("users")
      .select("uuid, nama, email, password, is_admin")
      .eq("email", email)
      .single();

    if (error || !user) {
      return { error: "Email atau password salah." };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: "Email atau password salah." };
    }

    const session = await useAppSession();
    const sessionUser: SessionUser = {
      uuid: user.uuid,
      nama: user.nama,
      email: user.email,
      role: "user",
      is_admin: user.is_admin ?? false,
    };

    await session.update({ user: sessionUser });

    return { success: true, user: sessionUser };
  });

// ============================================================
// USER REGISTER (pencari kos)
// ============================================================

export const userRegisterFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { nama: string; email: string; password_raw: string; telepon?: string }) => data,
  )
  .handler(async ({ data }) => {
    const { nama, email, password_raw, telepon } = data;

    const { data: existing } = await supabase
      .from("users")
      .select("uuid")
      .eq("email", email)
      .single();

    if (existing) {
      return { error: "Email sudah terdaftar." };
    }

    const password = await bcrypt.hash(password_raw, 12);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({ nama, email, password, telepon: telepon || null })
      .select("uuid, nama, email")
      .single();

    if (error || !newUser) {
      return { error: "Gagal mendaftar. Coba lagi." };
    }

    const session = await useAppSession();
    const sessionUser: SessionUser = {
      uuid: newUser.uuid,
      nama: newUser.nama,
      email: newUser.email,
      role: "user",
    };

    await session.update({ user: sessionUser });

    return { success: true, user: sessionUser };
  });

// ============================================================
// LOGOUT (shared for both mitra and user)
// ============================================================

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession();
  await session.clear();
  throw redirect({ to: "/" });
});

// ============================================================
// ADMIN LOGIN
// ============================================================

export const adminLoginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { email, password } = data;

    const { data: user, error } = await supabase
      .from("users")
      .select("uuid, nama, email, password, is_admin")
      .eq("email", email)
      .eq("is_admin", true)
      .single();

    if (error || !user) {
      return { error: "Akun admin tidak ditemukan." };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: "Akun admin tidak ditemukan." };
    }

    const session = await useAppSession();
    const sessionUser: SessionUser = {
      uuid: user.uuid,
      nama: user.nama,
      email: user.email,
      role: "user",
      is_admin: true,
    };

    await session.update({ user: sessionUser });

    return { success: true, user: sessionUser };
  });
