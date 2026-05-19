import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { KOS_LIST, KAMPUS_LIST, DAERAH_LIST, JENIS_KOS } from "@/lib/kos-data";
import { KosCard } from "@/components/site/KosCard";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";

type Search = {
  kampus?: string;
  daerah?: string;
  jenis?: string;
  q?: string;
  sort?: "rating" | "termurah" | "termahal";
};

export const Route = createFileRoute("/katalog")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    kampus: typeof s.kampus === "string" ? s.kampus : undefined,
    daerah: typeof s.daerah === "string" ? s.daerah : undefined,
    jenis: typeof s.jenis === "string" ? s.jenis : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    sort:
      s.sort === "rating" || s.sort === "termurah" || s.sort === "termahal"
        ? s.sort
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Katalog Kos — Keep n Sleep" },
      { name: "description", content: "Jelajahi katalog kos di Yogyakarta. Filter berdasarkan kampus, daerah, dan jenis kos." },
    ],
  }),
  component: KatalogPage,
});

function KatalogPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/katalog" });

  const filtered = useMemo(() => {
    const q = (search.q ?? "").trim().toLowerCase();
    const list = KOS_LIST.filter((k) => {
      if (search.kampus && !k.kampusTerdekat.includes(search.kampus)) return false;
      if (search.daerah && k.daerah !== search.daerah) return false;
      if (search.jenis && k.jenis !== search.jenis) return false;
      if (q && !(k.nama.toLowerCase().includes(q) || k.alamat.toLowerCase().includes(q) || k.deskripsi.toLowerCase().includes(q))) return false;
      return true;
    });
    const sorted = [...list];
    if (search.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (search.sort === "termurah") sorted.sort((a, b) => a.hargaPerBulan - b.hargaPerBulan);
    else if (search.sort === "termahal") sorted.sort((a, b) => b.hargaPerBulan - a.hargaPerBulan);
    return sorted;
  }, [search]);

  const update = (key: keyof Search, value: string) => {
    navigate({
      search: (prev: Search) => ({ ...prev, [key]: value || undefined }),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Katalog Kos di Jogja</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} kos tersedia sesuai pilihanmu.
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search.q ?? ""}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Cari nama kos, alamat, atau kata kunci…"
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={search.sort ?? ""}
            onChange={(e) => update("sort", e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Urutkan: Default</option>
            <option value="rating">Rating tertinggi</option>
            <option value="termurah">Harga termurah</option>
            <option value="termahal">Harga termahal</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar Filter */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 font-serif text-lg font-semibold">Filter</div>
          <FilterGroup
            label="Kampus Terdekat"
            value={search.kampus ?? ""}
            options={[{ value: "", label: "Semua kampus" }, ...KAMPUS_LIST]}
            onChange={(v) => update("kampus", v)}
          />
          <FilterGroup
            label="Daerah"
            value={search.daerah ?? ""}
            options={[{ value: "", label: "Semua daerah" }, ...DAERAH_LIST]}
            onChange={(v) => update("daerah", v)}
          />
          <FilterGroup
            label="Jenis Kos"
            value={search.jenis ?? ""}
            options={[{ value: "", label: "Semua jenis" }, ...JENIS_KOS]}
            onChange={(v) => update("jenis", v)}
          />
          <button
            onClick={() => navigate({ search: {} })}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-secondary"
          >
            Reset filter
          </button>
        </aside>

        {/* Grid */}
        <div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="font-serif text-xl font-semibold">Belum ada kos cocok</div>
              <p className="mt-1 text-sm text-muted-foreground">Coba longgarkan filtermu.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((k) => (
                <KosCard key={k.id} kos={k} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}