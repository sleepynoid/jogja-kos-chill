import { useSyncExternalStore } from "react";
import { KOS_LIST, type Kos } from "./kos-data";

const STORAGE_KEY = "knsleep:kos-store:v1";
const SESSION_KEY = "knsleep:mitra-session:v1";

type Listener = () => void;
const listeners = new Set<Listener>();
let kosState: Kos[] = loadInitial();

function loadInitial(): Kos[] {
  if (typeof window === "undefined") return [...KOS_LIST];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Kos[];
  } catch {
    /* ignore */
  }
  return [...KOS_LIST];
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

export function addKos(input: Omit<Kos, "id" | "rating" | "galeri">) {
  const id = `k-${Date.now().toString(36)}`;
  const kos: Kos = {
    ...input,
    id,
    rating: 4.5,
    galeri: [input.gambar],
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

export function resetKosStore() {
  kosState = [...KOS_LIST];
  persist();
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