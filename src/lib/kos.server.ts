import { createServerFn } from "@tanstack/react-start";
import { useAppSession } from "./session";
import { supabase } from "./supabase";

export type CreateKosInput = {
  nama: string;
  jenis: string;
  daerah_slug: string;
  alamat: string;
  harga_per_bulan: number;
  deskripsi?: string;
  kampus_slugs: string[];
  fasilitas_names: string[];
  gambar_urls: string[]; // URLs from storage upload (already uploaded client-side)
};

export const createKosFn = createServerFn({ method: "POST" })
  .inputValidator((data: CreateKosInput) => data)
  .handler(async ({ data }) => {
    // Get current user from session
    const session = await useAppSession();
    const user = session.data.user;

    if (!user) {
      return { error: "Tidak terautentikasi." };
    }

    // 1. Resolve daerah_uuid from slug
    const { data: daerah, error: daerahErr } = await supabase
      .from("daerah")
      .select("uuid")
      .eq("slug", data.daerah_slug)
      .single();

    if (daerahErr || !daerah) {
      return { error: "Daerah tidak ditemukan." };
    }

    // 2. Insert kos
    const { data: kos, error: kosErr } = await supabase
      .from("kos")
      .insert({
        mitra_uuid: user.uuid,
        nama: data.nama,
        jenis: data.jenis,
        daerah_uuid: daerah.uuid,
        alamat: data.alamat,
        harga_per_bulan: data.harga_per_bulan,
        deskripsi: data.deskripsi || null,
        gambar: data.gambar_urls[0] || null,
        tersedia: true,
      })
      .select("uuid")
      .single();

    if (kosErr || !kos) {
      return { error: `Gagal menyimpan kos: ${kosErr?.message}` };
    }

    const kosUuid = kos.uuid;

    // 3. Link kampus terdekat
    if (data.kampus_slugs.length > 0) {
      const { data: kampusList } = await supabase
        .from("kampus")
        .select("uuid, slug")
        .in("slug", data.kampus_slugs);

      if (kampusList && kampusList.length > 0) {
        const links = kampusList.map((k) => ({
          kos_uuid: kosUuid,
          kampus_uuid: k.uuid,
        }));

        await supabase.from("kos_kampus_terdekat").insert(links);
      }
    }

    // 4. Link fasilitas
    if (data.fasilitas_names.length > 0) {
      const { data: fasilitasList } = await supabase
        .from("fasilitas")
        .select("uuid, nama")
        .in("nama", data.fasilitas_names);

      if (fasilitasList && fasilitasList.length > 0) {
        const links = fasilitasList.map((f) => ({
          kos_uuid: kosUuid,
          fasilitas_uuid: f.uuid,
        }));

        await supabase.from("kos_fasilitas").insert(links);
      }
    }

    // 5. Insert galeri
    if (data.gambar_urls.length > 0) {
      const galeriRows = data.gambar_urls.map((url, i) => ({
        kos_uuid: kosUuid,
        url,
        urutan: i,
      }));

      await supabase.from("kos_galeri").insert(galeriRows);
    }

    return { success: true, kos_uuid: kosUuid };
  });

// ============================================================
// GET KOS LIST FOR CURRENT MITRA
// ============================================================

export type MitraKos = {
  uuid: string;
  nama: string;
  jenis: string;
  alamat: string;
  harga_per_bulan: number;
  rating: number;
  gambar: string | null;
  deskripsi: string | null;
  tersedia: boolean;
  daerah: { slug: string; nama: string } | { slug: string; nama: string }[] | null;
  kos_kampus_terdekat: { kampus: { slug: string; nama: string } | { slug: string; nama: string }[] | null }[];
  kos_fasilitas: { fasilitas: { nama: string } | { nama: string }[] | null }[];
  kos_galeri: { url: string; urutan: number }[];
};

export const getMitraKosFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession();
  const user = session.data.user;

  if (!user) {
    return { error: "Tidak terautentikasi.", data: [] as MitraKos[] };
  }

  const { data, error } = await supabase
    .from("kos")
    .select(`
      uuid,
      nama,
      jenis,
      alamat,
      harga_per_bulan,
      rating,
      gambar,
      deskripsi,
      tersedia,
      daerah ( slug, nama ),
      kos_kampus_terdekat ( kampus ( slug, nama ) ),
      kos_fasilitas ( fasilitas ( nama ) ),
      kos_galeri ( url, urutan )
    `)
    .eq("mitra_uuid", user.uuid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch mitra kos:", error.message);
    return { error: error.message, data: [] as MitraKos[] };
  }

  return { data: (data ?? []) as unknown as MitraKos[] };
});

// ============================================================
// DELETE KOS
// ============================================================

export const deleteKosFn = createServerFn({ method: "POST" })
  .inputValidator((data: { kos_uuid: string }) => data)
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = session.data.user;

    if (!user) {
      return { error: "Tidak terautentikasi." };
    }

    // Verify ownership
    const { data: kos } = await supabase
      .from("kos")
      .select("uuid, mitra_uuid")
      .eq("uuid", data.kos_uuid)
      .single();

    if (!kos || kos.mitra_uuid !== user.uuid) {
      return { error: "Kos tidak ditemukan atau bukan milik Anda." };
    }

    // Delete (cascade will handle junction tables and galeri)
    const { error } = await supabase.from("kos").delete().eq("uuid", data.kos_uuid);

    if (error) {
      return { error: `Gagal menghapus: ${error.message}` };
    }

    return { success: true };
  });

// ============================================================
// TOGGLE KETERSEDIAAN KOS
// ============================================================

export const toggleKosTersediaFn = createServerFn({ method: "POST" })
  .inputValidator((data: { kos_uuid: string }) => data)
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = session.data.user;

    if (!user) {
      return { error: "Tidak terautentikasi." };
    }

    // Get current state
    const { data: kos } = await supabase
      .from("kos")
      .select("uuid, mitra_uuid, tersedia")
      .eq("uuid", data.kos_uuid)
      .single();

    if (!kos || kos.mitra_uuid !== user.uuid) {
      return { error: "Kos tidak ditemukan atau bukan milik Anda." };
    }

    const { error } = await supabase
      .from("kos")
      .update({ tersedia: !kos.tersedia })
      .eq("uuid", data.kos_uuid);

    if (error) {
      return { error: `Gagal mengubah status: ${error.message}` };
    }

    return { success: true, tersedia: !kos.tersedia };
  });

// ============================================================
// GET ALL PUBLIC KOS (for katalog & beranda)
// ============================================================

export type PublicKos = {
  id: string; // uuid mapped to id for KosCard compatibility
  nama: string;
  jenis: string;
  daerah: string; // daerah slug
  alamat: string;
  hargaPerBulan: number;
  rating: number;
  gambar: string;
  galeri: string[];
  deskripsi: string;
  tersedia: boolean;
  fasilitas: string[];
  kampusTerdekat: string[]; // kampus slugs
  mitraTelepon?: string; // nomor WA mitra (only on detail)
};

export const getPublicKosListFn = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("kos")
    .select(`
      uuid,
      nama,
      jenis,
      alamat,
      harga_per_bulan,
      rating,
      gambar,
      deskripsi,
      tersedia,
      daerah ( slug, nama ),
      kos_kampus_terdekat ( kampus ( slug, nama ) ),
      kos_fasilitas ( fasilitas ( nama ) ),
      kos_galeri ( url, urutan )
    `)
    .eq("tersedia", true)
    .order("rating", { ascending: false });

  if (error) {
    console.error("Failed to fetch public kos:", error.message);
    return [];
  }

  // Map to PublicKos shape (compatible with existing KosCard component)
  const mapped: PublicKos[] = (data ?? []).map((k: any) => {
    const daerahObj = Array.isArray(k.daerah) ? k.daerah[0] : k.daerah;
    const galeriSorted = (k.kos_galeri ?? [])
      .sort((a: any, b: any) => a.urutan - b.urutan)
      .map((g: any) => g.url);

    return {
      id: k.uuid,
      nama: k.nama,
      jenis: k.jenis,
      daerah: daerahObj?.slug ?? "",
      alamat: k.alamat,
      hargaPerBulan: k.harga_per_bulan,
      rating: Number(k.rating),
      gambar: k.gambar ?? galeriSorted[0] ?? "",
      galeri: galeriSorted,
      deskripsi: k.deskripsi ?? "",
      tersedia: k.tersedia,
      fasilitas: (k.kos_fasilitas ?? []).map((f: any) => {
        const fas = Array.isArray(f.fasilitas) ? f.fasilitas[0] : f.fasilitas;
        return fas?.nama ?? "";
      }).filter(Boolean),
      kampusTerdekat: (k.kos_kampus_terdekat ?? []).map((kt: any) => {
        const kmp = Array.isArray(kt.kampus) ? kt.kampus[0] : kt.kampus;
        return kmp?.slug ?? "";
      }).filter(Boolean),
    };
  });

  return mapped;
});

// ============================================================
// GET SINGLE KOS BY UUID (for detail page)
// ============================================================

export const getKosByUuidFn = createServerFn({ method: "GET" })
  .inputValidator((data: { uuid: string }) => data)
  .handler(async ({ data }) => {
    const { data: k, error } = await supabase
      .from("kos")
      .select(`
        uuid,
        nama,
        jenis,
        alamat,
        harga_per_bulan,
        rating,
        gambar,
        deskripsi,
        tersedia,
        mitra ( telepon ),
        daerah ( slug, nama ),
        kos_kampus_terdekat ( kampus ( slug, nama ) ),
        kos_fasilitas ( fasilitas ( nama ) ),
        kos_galeri ( url, urutan )
      `)
      .eq("uuid", data.uuid)
      .single();

    if (error || !k) {
      return null;
    }

    const daerahObj = Array.isArray(k.daerah) ? k.daerah[0] : k.daerah;
    const mitraObj = Array.isArray((k as any).mitra) ? (k as any).mitra[0] : (k as any).mitra;
    const galeriSorted = (k.kos_galeri ?? [])
      .sort((a: any, b: any) => a.urutan - b.urutan)
      .map((g: any) => g.url);

    const result: PublicKos = {
      id: k.uuid,
      nama: k.nama,
      jenis: k.jenis,
      daerah: daerahObj?.slug ?? "",
      alamat: k.alamat,
      hargaPerBulan: k.harga_per_bulan,
      rating: Number(k.rating),
      gambar: k.gambar ?? galeriSorted[0] ?? "",
      galeri: galeriSorted,
      deskripsi: k.deskripsi ?? "",
      tersedia: k.tersedia,
      mitraTelepon: mitraObj?.telepon ?? undefined,
      fasilitas: (k.kos_fasilitas ?? []).map((f: any) => {
        const fas = Array.isArray(f.fasilitas) ? f.fasilitas[0] : f.fasilitas;
        return fas?.nama ?? "";
      }).filter(Boolean),
      kampusTerdekat: (k.kos_kampus_terdekat ?? []).map((kt: any) => {
        const kmp = Array.isArray(kt.kampus) ? kt.kampus[0] : kt.kampus;
        return kmp?.slug ?? "";
      }).filter(Boolean),
    };

    return result;
  });
