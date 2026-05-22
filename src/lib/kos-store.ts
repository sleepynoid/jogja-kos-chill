import { useSyncExternalStore } from "react";
import { KOS_LIST, type Kos } from "./kos-data";

const STORAGE_KEY = "knsleep:kos-store:v1";
const SESSION_KEY = "knsleep:mitra-session:v1";

type Listener = () => void;
const listeners = new Set<Listener>();
let kosState: Kos[] = loadInitial();

function loadInitial(): Kos[] {
  if (typeof window === "undefined")
    return [...KOS_LIST].map((k) => ({ ...k, tersedia: k.tersedia ?? true }));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Kos[];
      return parsed.map((k) => ({ ...k, tersedia: k.tersedia ?? true }));
    }
  } catch {
    /* ignore */
  }
  return [...KOS_LIST].map((k) => ({ ...k, tersedia: k.tersedia ?? true }));
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kosState));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useKosStore(): Kos[] {
  return useSyncExternalStore(
    subscribe,
    () => kosState,
    () => kosState,
  );
}

export function addKos(input: Omit<Kos, "id" | "rating" | "galeri" | "tersedia">) {
  const id = `k-${Date.now().toString(36)}`;
  const kos: Kos = {
    ...input,
    id,
    rating: 4.5,
    galeri: [input.gambar],
    tersedia: true,
  };
  kosState = [kos, ...kosState];
  persist();
  emit();
  return kos;
}

export function updateKos(id: string, patch: Partial<Kos>) {
  kosState = kosState.map((k) => (k.id === id ? { ...k, ...patch } : k));
  persist();
  emit();
}

export function removeKos(id: string) {
  kosState = kosState.filter((k) => k.id !== id);
  persist();
  emit();
}

export function toggleKetersediaanKos(id: string) {
  kosState = kosState.map((k) => (k.id === id ? { ...k, tersedia: !(k.tersedia ?? true) } : k));
  persist();
  emit();
}

export function resetKosStore() {
  kosState = [...KOS_LIST].map((k) => ({ ...k, tersedia: true }));
  persist();
  emit();
}

// ---------- Simulated leads inquiries store ----------

export type KosInquiry = {
  id: string;
  kosId: string;
  namaKos: string;
  namaCalon: string;
  telepon: string;
  pesan: string;
  tanggal: string;
  status: "pending" | "dihubungi";
};

const INQUIRIES_KEY = "knsleep:inquiries-store:v1";
let inquiriesState: KosInquiry[] = loadInitialInquiries();

function loadInitialInquiries(): KosInquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INQUIRIES_KEY);
    if (raw) return JSON.parse(raw) as KosInquiry[];
  } catch {
    /* ignore */
  }

  return [
    {
      id: "inq-1",
      kosId: "k1",
      namaKos: "Griya Sogan Bulaksumur",
      namaCalon: "Budi Santoso",
      telepon: "6281234567890",
      pesan:
        "Halo, kamar tipe AC apakah masih ada yang kosong untuk bulan depan? Saya mahasiswa baru UGM.",
      tanggal: "19 Mei 2026",
      status: "pending",
    },
    {
      id: "inq-2",
      kosId: "k3",
      namaKos: "Omah Malioboro Heritage",
      namaCalon: "Siti Rahma",
      telepon: "6289876543210",
      pesan:
        "Siang, saya mau tanya apakah parkir mobilnya gratis dan ada cleaning service setiap hari?",
      tanggal: "18 Mei 2026",
      status: "dihubungi",
    },
    {
      id: "inq-3",
      kosId: "k1",
      namaKos: "Griya Sogan Bulaksumur",
      namaCalon: "Ahmad Fauzi",
      telepon: "628111222333",
      pesan: "Apakah bisa survei lokasi besok jam 2 siang kak? Terima kasih.",
      tanggal: "17 Mei 2026",
      status: "pending",
    },
  ];
}

function persistInquiries() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiriesState));
  } catch {
    /* ignore */
  }
}

export function useInquiriesStore(): KosInquiry[] {
  return useSyncExternalStore(
    subscribe,
    () => inquiriesState,
    () => inquiriesState,
  );
}

export function addInquiry(inquiry: Omit<KosInquiry, "id" | "tanggal" | "status">) {
  const newInq: KosInquiry = {
    ...inquiry,
    id: `inq-${Date.now().toString(36)}`,
    tanggal: new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status: "pending",
  };
  inquiriesState = [newInq, ...inquiriesState];
  persistInquiries();
  emit();
  return newInq;
}

export function updateInquiryStatus(id: string, status: "pending" | "dihubungi") {
  inquiriesState = inquiriesState.map((inq) => (inq.id === id ? { ...inq, status } : inq));
  persistInquiries();
  emit();
}

// ---------- Mitra session (demo only, client-side gate) ----------

export type MitraSession = { nama: string; email: string } | null;

export function getMitraSession(): MitraSession {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as MitraSession) : null;
  } catch {
    return null;
  }
}

export function setMitraSession(s: MitraSession) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
  emit();
}

export function useMitraSession(): MitraSession {
  return useSyncExternalStore(
    subscribe,
    () => getMitraSession(),
    () => null,
  );
}

// ---------- Dummy visitor stats (deterministic per kos id) ----------

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function getVisitorTrend(kosId: string, days = 14) {
  const seed = hashStr(kosId);
  const out: { tanggal: string; pengunjung: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const base = 30 + ((seed >> (i % 8)) % 70);
    const wave = Math.round(15 * Math.sin((i + (seed % 7)) / 1.8));
    out.push({
      tanggal: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      pengunjung: Math.max(5, base + wave),
    });
  }
  return out;
}

export function getKosVisitorStats(kosId: string) {
  const seed = hashStr(kosId);
  const total = 300 + (seed % 1500);
  const minggu = 40 + (seed % 180);
  const kontak = 5 + (seed % 30);
  const favorit = 10 + (seed % 60);
  return { total, minggu, kontak, favorit };
}
