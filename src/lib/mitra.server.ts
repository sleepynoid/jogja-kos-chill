import { createServerFn } from "@tanstack/react-start";
import { useAppSession } from "./session";
import { supabase } from "./supabase";

// 1. Fetch profil mitra sendiri (termasuk is_verified, ktp, nib)
export const getMitraProfileFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession();
  const user = session.data.user;

  if (!user || user.role !== "mitra") {
    throw new Error("Tidak terautentikasi atau bukan Mitra.");
  }

  const { data: profile, error } = await supabase
    .from("mitra")
    .select("uuid, nama, email, is_verified, ktp_pemilik, nib, is_premium")
    .eq("uuid", user.uuid)
    .single();

  if (error || !profile) {
    throw new Error("Profil mitra tidak ditemukan.");
  }

  return profile;
});

// 2. Mitra submit KTP+NIB untuk minta verifikasi
export const submitVerificationFn = createServerFn({ method: "POST" })
  .inputValidator((data: { ktp_pemilik: string; nib: string }) => {
    if (typeof data.ktp_pemilik !== "string" || typeof data.nib !== "string") {
      throw new Error("Input tidak valid.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = session.data.user;

    if (!user || user.role !== "mitra") {
      return { error: "Tidak terautentikasi." };
    }

    const { ktp_pemilik, nib } = data;

    if (!ktp_pemilik.trim() || !nib.trim()) {
      return { error: "KTP dan NIB wajib diisi." };
    }

    // KTP must be exactly 16 numeric digits
    if (!/^\d{16}$/.test(ktp_pemilik)) {
      return { error: "Nomor KTP harus berupa 16 digit angka." };
    }

    const { error } = await supabase
      .from("mitra")
      .update({
        ktp_pemilik: ktp_pemilik.trim(),
        nib: nib.trim(),
      })
      .eq("uuid", user.uuid);

    if (error) {
      return { error: "Gagal menyimpan data verifikasi." };
    }

    return { success: true };
  });

// 3. Admin: fetch semua mitra + status verifikasi + jumlah_kos
export const adminGetAllMitraFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession();
  const user = session.data.user;

  if (!user || user.role !== "admin") {
    throw new Error("Tidak terautentikasi.");
  }

  // Fetch all mitra
  const { data: mitras, error: mError } = await supabase
    .from("mitra")
    .select("uuid, nama, email, is_verified, ktp_pemilik, nib, created_at")
    .order("created_at", { ascending: false });

  if (mError || !mitras) {
    throw new Error("Gagal mengambil data mitra.");
  }

  // Fetch kos counts per mitra to prevent complex DB joins
  const { data: kosCounts, error: kError } = await supabase.from("kos").select("mitra_uuid");

  if (kError) {
    throw new Error("Gagal mengambil data kos.");
  }

  const countMap: Record<string, number> = {};
  for (const k of kosCounts || []) {
    if (k.mitra_uuid) {
      countMap[k.mitra_uuid] = (countMap[k.mitra_uuid] || 0) + 1;
    }
  }

  return mitras.map((m) => ({
    uuid: m.uuid,
    nama: m.nama,
    email: m.email,
    is_verified: m.is_verified,
    ktp_pemilik: m.ktp_pemilik,
    nib: m.nib,
    created_at: m.created_at,
    jumlah_kos: countMap[m.uuid] || 0,
  }));
});

// 4. Admin: toggle verified mitra
export const adminVerifyMitraFn = createServerFn({ method: "POST" })
  .inputValidator((data: { mitra_uuid: string; verified: boolean }) => {
    if (typeof data.mitra_uuid !== "string" || typeof data.verified !== "boolean") {
      throw new Error("Input tidak valid.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = session.data.user;

    if (!user || user.role !== "admin") {
      return { error: "Tidak terautentikasi." };
    }

    const { error } = await supabase
      .from("mitra")
      .update({ is_verified: data.verified })
      .eq("uuid", data.mitra_uuid);

    if (error) {
      return { error: "Gagal memproses verifikasi." };
    }

    return { success: true };
  });
