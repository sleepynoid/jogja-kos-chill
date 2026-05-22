import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { KAMPUS_LIST, DAERAH_LIST, JENIS_KOS, type Kos } from "@/lib/kos-data";
import { useKosStore } from "@/lib/kos-store";
import { KosCard } from "@/components/site/KosCard";
import { BatikPattern } from "@/components/site/Ornaments";
import { CompareBar } from "@/components/site/CompareBar";
import { toast } from "sonner";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { AppSelect } from "@/components/site/AppSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Search = {
  kampus?: string;
  daerah?: string;
  jenis?: string;
  q?: string;
  sort?: "rating" | "termurah" | "termahal";
  minHarga?: number;
  maxHarga?: number;
  fasilitas?: string;
};

export const Route = createFileRoute("/katalog")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    kampus: typeof s.kampus === "string" ? s.kampus : undefined,
    daerah: typeof s.daerah === "string" ? s.daerah : undefined,
    jenis: typeof s.jenis === "string" ? s.jenis : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    sort:
      s.sort === "rating" || s.sort === "termurah" || s.sort === "termahal" ? s.sort : undefined,
    minHarga: s.minHarga ? Number(s.minHarga) : undefined,
    maxHarga: s.maxHarga ? Number(s.maxHarga) : undefined,
    fasilitas: typeof s.fasilitas === "string" ? s.fasilitas : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Katalog Kos — Keep n Sleep" },
      {
        name: "description",
        content:
          "Jelajahi katalog kos di Yogyakarta. Filter berdasarkan kampus, daerah, dan jenis kos.",
      },
    ],
  }),
  component: KatalogPage,
});

function KatalogPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/katalog" });
  const kosList = useKosStore();

  const [comparedItems, setComparedItems] = useState<Kos[]>([]);

  const handleCompareToggle = (kos: Kos) => {
    setComparedItems((prev) => {
      const exists = prev.find((x) => x.id === kos.id);
      if (exists) {
        return prev.filter((x) => x.id !== kos.id);
      }
      if (prev.length >= 3) {
        toast.warning("Maksimal bandingkan 3 kos sekaligus!");
        return prev;
      }
      return [...prev, kos];
    });
  };

  const filtered = useMemo(() => {
    const q = (search.q ?? "").trim().toLowerCase();
    const activeFasilitas = search.fasilitas ? search.fasilitas.split(",").filter(Boolean) : [];

    const list = kosList.filter((k) => {
      if (search.kampus && !k.kampusTerdekat.includes(search.kampus)) return false;
      if (search.daerah && k.daerah !== search.daerah) return false;
      if (search.jenis && k.jenis !== search.jenis) return false;
      if (search.minHarga && k.hargaPerBulan < search.minHarga) return false;
      if (search.maxHarga && k.hargaPerBulan > search.maxHarga) return false;
      if (activeFasilitas.length > 0 && !activeFasilitas.every((f) => k.fasilitas.includes(f)))
        return false;
      if (
        q &&
        !(
          k.nama.toLowerCase().includes(q) ||
          k.alamat.toLowerCase().includes(q) ||
          k.deskripsi.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
    const sorted = [...list];
    if (search.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (search.sort === "termurah") sorted.sort((a, b) => a.hargaPerBulan - b.hargaPerBulan);
    else if (search.sort === "termahal") sorted.sort((a, b) => b.hargaPerBulan - a.hargaPerBulan);
    return sorted;
  }, [search, kosList]);

  const update = (key: keyof Search, value: string) => {
    navigate({
      search: (prev: Search) => ({ ...prev, [key]: value || undefined }),
      resetScroll: false,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 animate-fade-up relative overflow-hidden rounded-3xl bg-secondary/30 dark:bg-zinc-900/50 p-6 md:p-8 border border-border">
        <BatikPattern variant="kawung" className="opacity-[0.18]" />
        <div className="relative z-10">
          <h1 className="font-serif text-3xl font-bold md:text-4xl text-gradient">
            Katalog Kos di Jogja
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered.length} kos tersedia sesuai pilihanmu.
          </p>
        </div>
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
          <Select
            value={search.sort ?? "default"}
            onValueChange={(v) => update("sort", v === "default" ? "" : v)}
          >
            <SelectTrigger className="h-10 w-[200px] rounded-xl">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Urutkan: Default</SelectItem>
              <SelectItem value="rating">Rating tertinggi</SelectItem>
              <SelectItem value="termurah">Harga termurah</SelectItem>
              <SelectItem value="termahal">Harga termahal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar Filter */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 font-serif text-lg font-semibold">Filter</div>
          <FilterGroup
            label="Kampus Terdekat"
            value={search.kampus ?? ""}
            options={KAMPUS_LIST}
            allLabel="Semua kampus"
            onChange={(v) => update("kampus", v)}
          />
          <FilterGroup
            label="Daerah"
            value={search.daerah ?? ""}
            options={DAERAH_LIST}
            allLabel="Semua daerah"
            onChange={(v) => update("daerah", v)}
          />
          <FilterGroup
            label="Jenis Kos"
            value={search.jenis ?? ""}
            options={JENIS_KOS}
            allLabel="Semua jenis"
            onChange={(v) => update("jenis", v)}
          />

          {/* Advanced Price Slider Inputs */}
          <div className="mb-4 border-t border-border pt-4">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">
              Rentang Harga (Rp)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={search.minHarga ?? ""}
                onChange={(e) => {
                  navigate({
                    search: (prev: Search) => ({
                      ...prev,
                      minHarga: Number(e.target.value) || undefined,
                    }),
                    resetScroll: false,
                  });
                }}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring text-foreground"
              />
              <input
                type="number"
                placeholder="Max"
                value={search.maxHarga ?? ""}
                onChange={(e) => {
                  navigate({
                    search: (prev: Search) => ({
                      ...prev,
                      maxHarga: Number(e.target.value) || undefined,
                    }),
                    resetScroll: false,
                  });
                }}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring text-foreground"
              />
            </div>
          </div>

          {/* Advanced Facilities Checkbox */}
          <div className="mb-4 border-t border-border pt-4">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">Fasilitas</div>
            <div className="space-y-2">
              {["WiFi", "AC", "Kamar Mandi Dalam", "Laundry", "Parkir Mobil", "Smart TV"].map(
                (f) => {
                  const activeFasilitas = search.fasilitas
                    ? search.fasilitas.split(",").filter(Boolean)
                    : [];
                  const checked = activeFasilitas.includes(f);
                  return (
                    <label
                      key={f}
                      className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? activeFasilitas.filter((x) => x !== f)
                            : [...activeFasilitas, f];
                          update("fasilitas", next.join(","));
                        }}
                        className="rounded border-input text-primary focus:ring-ring h-3.5 w-3.5"
                      />
                      {f}
                    </label>
                  );
                },
              )}
            </div>
          </div>

          <button
            onClick={() => {
              navigate({ search: {}, resetScroll: false });
              setComparedItems([]);
            }}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-secondary text-foreground transition-all cursor-pointer"
          >
            Reset filter & bandingkan
          </button>
        </aside>

        {/* Grid */}
        <div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="font-serif text-xl font-semibold text-foreground">
                Belum ada kos cocok
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Coba longgarkan filtermu.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((k) => (
                <KosCard
                  key={k.id}
                  kos={k}
                  showCompare
                  isCompared={!!comparedItems.find((x) => x.id === k.id)}
                  onCompareToggle={() => handleCompareToggle(k)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Bar */}
      <CompareBar
        selectedItems={comparedItems}
        onRemove={(id) => setComparedItems((prev) => prev.filter((x) => x.id !== id))}
        onClear={() => setComparedItems([])}
      />
    </div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
  allLabel,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
  allLabel?: string;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      <AppSelect
        value={value}
        onChange={onChange}
        options={options}
        allLabel={allLabel}
        placeholder={allLabel}
      />
    </div>
  );
}
