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
  ktp_pemilik: string;
  nib: string;
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

    // 2. Insert kos (is_approved = null → pending review by admin)
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
        ktp_pemilik: data.ktp_pemilik,
        nib: data.nib,
        gambar: data.gambar_urls[0] || null,
        tersedia: true,
        is_approved: null,
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
  is_approved: boolean | null;
  created_at: string;
  daerah: { slug: string; nama: string } | { slug: string; nama: string }[] | null;
  kos_kampus_terdekat: {
    kampus: { slug: string; nama: string } | { slug: string; nama: string }[] | null;
  }[];
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
    .select(
      `
      uuid,
      nama,
      jenis,
      alamat,
      harga_per_bulan,
      rating,
      gambar,
      deskripsi,
      tersedia,
      is_approved,
      created_at,
      daerah ( slug, nama ),
      kos_kampus_terdekat ( kampus ( slug, nama ) ),
      kos_fasilitas ( fasilitas ( nama ) ),
      kos_galeri ( url, urutan )
    `,
    )
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

type RawGaleri = { url: string; urutan: number };
type RawNamable = { nama: string } | { nama: string }[] | null;
type RawSlugNamable = { slug: string; nama: string } | { slug: string; nama: string }[] | null;
type RawKosRow = {
  uuid: string;
  nama: string;
  jenis: string;
  alamat: string;
  harga_per_bulan: number;
  rating: number | string;
  gambar: string | null;
  deskripsi: string | null;
  tersedia: boolean;
  daerah: RawSlugNamable;
  kos_kampus_terdekat: { kampus: RawSlugNamable }[];
  kos_fasilitas: { fasilitas: RawNamable }[];
  kos_galeri: RawGaleri[];
};

function mapRawKosToPublic(k: RawKosRow): PublicKos {
  const daerahObj = Array.isArray(k.daerah) ? k.daerah[0] : k.daerah;
  const galeriSorted = (k.kos_galeri ?? []).sort((a, b) => a.urutan - b.urutan).map((g) => g.url);
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
    fasilitas: (k.kos_fasilitas ?? [])
      .map((f) => {
        const fas = Array.isArray(f.fasilitas) ? f.fasilitas[0] : f.fasilitas;
        return fas?.nama ?? "";
      })
      .filter(Boolean),
    kampusTerdekat: (k.kos_kampus_terdekat ?? [])
      .map((kt) => {
        const kmp = Array.isArray(kt.kampus) ? kt.kampus[0] : kt.kampus;
        return kmp?.slug ?? "";
      })
      .filter(Boolean),
  };
}

export const getPublicKosListFn = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("kos")
    .select(
      `
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
    `,
    )
    .eq("tersedia", true)
    .eq("is_approved", true)
    .order("rating", { ascending: false });

  if (error) {
    console.error("Failed to fetch public kos:", error.message);
    return [];
  }

  return (data ?? []).map((k) => mapRawKosToPublic(k as unknown as RawKosRow));
});

// ============================================================
// GET SINGLE KOS BY UUID (for detail page)
// ============================================================

export const getKosByUuidFn = createServerFn({ method: "GET" })
  .inputValidator((data: { uuid: string }) => data)
  .handler(async ({ data }) => {
    const { data: k, error } = await supabase
      .from("kos")
      .select(
        `
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
      `,
      )
      .eq("uuid", data.uuid)
      .eq("is_approved", true)
      .single();

    if (error || !k) {
      return null;
    }

    type RawWithMitra = RawKosRow & {
      mitra: { telepon: string | null } | { telepon: string | null }[] | null;
    };
    const raw = k as unknown as RawWithMitra;
    const mitraObj = Array.isArray(raw.mitra) ? raw.mitra[0] : raw.mitra;

    const result: PublicKos = {
      ...mapRawKosToPublic(raw),
      mitraTelepon: mitraObj?.telepon ?? undefined,
    };

    return result;
  });

// ============================================================
// GET ALL FASILITAS (for filter)
// ============================================================

export const getFasilitasListFn = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase.from("fasilitas").select("nama").order("nama");

  if (error) {
    console.error("Failed to fetch fasilitas:", error.message);
    return [];
  }

  return (data ?? []).map((f) => f.nama);
});

// ============================================================
// ADMIN: GET ALL KOS (pending + approved + rejected)
// ============================================================

export type AdminKos = {
  uuid: string;
  nama: string;
  jenis: string;
  alamat: string;
  harga_per_bulan: number;
  ktp_pemilik: string | null;
  nib: string | null;
  is_approved: boolean | null;
  created_at: string;
  gambar: string | null;
  daerah: { slug: string; nama: string } | { slug: string; nama: string }[] | null;
  mitra: { nama: string; email: string } | { nama: string; email: string }[] | null;
};

export const adminGetAllKosFn = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("kos")
    .select(
      `
      uuid,
      nama,
      jenis,
      alamat,
      harga_per_bulan,
      ktp_pemilik,
      nib,
      is_approved,
      created_at,
      gambar,
      daerah ( slug, nama ),
      mitra ( nama, email )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin kos:", error.message);
    return { error: error.message, data: [] as AdminKos[] };
  }

  return { data: (data ?? []) as unknown as AdminKos[] };
});

// ============================================================
// ADMIN: APPROVE / REJECT KOS
// ============================================================

export const adminApproveKosFn = createServerFn({ method: "POST" })
  .inputValidator((data: { kos_uuid: string; approved: boolean }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("kos")
      .update({ is_approved: data.approved })
      .eq("uuid", data.kos_uuid);

    if (error) {
      return { error: `Gagal mengubah status: ${error.message}` };
    }

    return { success: true };
  });

// ============================================================
// GET KOS FOR EDIT (fetch full data for mitra's own kos)
// ============================================================

export type KosEditData = {
  uuid: string;
  nama: string;
  jenis: string;
  daerah_slug: string;
  alamat: string;
  harga_per_bulan: number;
  deskripsi: string;
  ktp_pemilik: string;
  nib: string;
  gambar: string | null;
  kampus_slugs: string[];
  fasilitas_names: string[];
  galeri_urls: string[];
};

export const getKosForEditFn = createServerFn({ method: "GET" })
  .inputValidator((data: { uuid: string }) => data)
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = session.data.user;

    if (!user) {
      return { error: "Tidak terautentikasi.", data: null };
    }

    const { data: k, error } = await supabase
      .from("kos")
      .select(
        `
        uuid,
        mitra_uuid,
        nama,
        jenis,
        alamat,
        harga_per_bulan,
        deskripsi,
        ktp_pemilik,
        nib,
        gambar,
        daerah ( slug ),
        kos_kampus_terdekat ( kampus ( slug ) ),
        kos_fasilitas ( fasilitas ( nama ) ),
        kos_galeri ( url, urutan )
      `,
      )
      .eq("uuid", data.uuid)
      .single();

    if (error || !k) {
      return { error: "Kos tidak ditemukan.", data: null };
    }

    // Verify ownership
    if (k.mitra_uuid !== user.uuid) {
      return { error: "Kos ini bukan milik Anda.", data: null };
    }

    const daerahObj: any = Array.isArray(k.daerah) ? k.daerah[0] : k.daerah;
    const galeriSorted = ((k.kos_galeri as any[]) ?? [])
      .sort((a, b) => a.urutan - b.urutan)
      .map((g) => g.url);

    const result: KosEditData = {
      uuid: k.uuid,
      nama: k.nama,
      jenis: k.jenis,
      daerah_slug: daerahObj?.slug ?? "",
      alamat: k.alamat,
      harga_per_bulan: k.harga_per_bulan,
      deskripsi: k.deskripsi ?? "",
      ktp_pemilik: k.ktp_pemilik ?? "",
      nib: k.nib ?? "",
      gambar: k.gambar,
      kampus_slugs: ((k.kos_kampus_terdekat as any[]) ?? [])
        .map((kt) => {
          const kmp = Array.isArray(kt.kampus) ? kt.kampus[0] : kt.kampus;
          return kmp?.slug ?? "";
        })
        .filter(Boolean),
      fasilitas_names: ((k.kos_fasilitas as any[]) ?? [])
        .map((f) => {
          const fas = Array.isArray(f.fasilitas) ? f.fasilitas[0] : f.fasilitas;
          return fas?.nama ?? "";
        })
        .filter(Boolean),
      galeri_urls: galeriSorted,
    };

    return { data: result };
  });

// ============================================================
// UPDATE KOS
// ============================================================

export type UpdateKosInput = {
  uuid: string;
  nama: string;
  jenis: string;
  daerah_slug: string;
  alamat: string;
  harga_per_bulan: number;
  deskripsi?: string;
  ktp_pemilik: string;
  nib: string;
  kampus_slugs: string[];
  fasilitas_names: string[];
  gambar_urls: string[]; // all gallery URLs (existing + new)
};

export const updateKosFn = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateKosInput) => data)
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = session.data.user;

    if (!user) {
      return { error: "Tidak terautentikasi." };
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("kos")
      .select("uuid, mitra_uuid")
      .eq("uuid", data.uuid)
      .single();

    if (!existing || existing.mitra_uuid !== user.uuid) {
      return { error: "Kos tidak ditemukan atau bukan milik Anda." };
    }

    // 1. Resolve daerah_uuid
    const { data: daerah } = await supabase
      .from("daerah")
      .select("uuid")
      .eq("slug", data.daerah_slug)
      .single();

    if (!daerah) {
      return { error: "Daerah tidak ditemukan." };
    }

    // 2. Update kos
    const { error: updateErr } = await supabase
      .from("kos")
      .update({
        nama: data.nama,
        jenis: data.jenis,
        daerah_uuid: daerah.uuid,
        alamat: data.alamat,
        harga_per_bulan: data.harga_per_bulan,
        deskripsi: data.deskripsi || null,
        ktp_pemilik: data.ktp_pemilik,
        nib: data.nib,
        gambar: data.gambar_urls[0] || null,
      })
      .eq("uuid", data.uuid);

    if (updateErr) {
      return { error: `Gagal mengupdate: ${updateErr.message}` };
    }

    // 3. Replace kampus links
    await supabase.from("kos_kampus_terdekat").delete().eq("kos_uuid", data.uuid);
    if (data.kampus_slugs.length > 0) {
      const { data: kampusList } = await supabase
        .from("kampus")
        .select("uuid, slug")
        .in("slug", data.kampus_slugs);

      if (kampusList && kampusList.length > 0) {
        await supabase
          .from("kos_kampus_terdekat")
          .insert(kampusList.map((k) => ({ kos_uuid: data.uuid, kampus_uuid: k.uuid })));
      }
    }

    // 4. Replace fasilitas links
    await supabase.from("kos_fasilitas").delete().eq("kos_uuid", data.uuid);
    if (data.fasilitas_names.length > 0) {
      const { data: fasilitasList } = await supabase
        .from("fasilitas")
        .select("uuid, nama")
        .in("nama", data.fasilitas_names);

      if (fasilitasList && fasilitasList.length > 0) {
        await supabase
          .from("kos_fasilitas")
          .insert(fasilitasList.map((f) => ({ kos_uuid: data.uuid, fasilitas_uuid: f.uuid })));
      }
    }

    // 5. Replace galeri
    await supabase.from("kos_galeri").delete().eq("kos_uuid", data.uuid);
    if (data.gambar_urls.length > 0) {
      await supabase
        .from("kos_galeri")
        .insert(data.gambar_urls.map((url, i) => ({ kos_uuid: data.uuid, url, urutan: i })));
    }

    return { success: true };
  });
