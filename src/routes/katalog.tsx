import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { KOS_LIST, KAMPUS_LIST, DAERAH_LIST, JENIS_KOS } from "@/lib/kos-data";
import { KosCard } from "@/components/site/KosCard";

type Search = {
  kampus?: string;
  daerah?: string;
  jenis?: string;
};

export const Route = createFileRoute("/katalog")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    kampus: typeof s.kampus === "string" ? s.kampus : undefined,
    daerah: typeof s.daerah === "string" ? s.daerah : undefined,
    jenis: typeof s.jenis === "string" ? s.jenis : undefined,
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
    return KOS_LIST.filter((k) => {
      if (search.kampus && !k.kampusTerdekat.includes(search.kampus)) return false;
      if (search.daerah && k.daerah !== search.daerah) return false;
      if (search.jenis && k.jenis !== search.jenis) return false;
      return true;
    });
  }, [search]);

  const update = (key: keyof Search, value: string) => {
    navigate({
      search: (prev) => ({ ...prev, [key]: value || undefined }),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Katalog Kos di Jogja</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} kos tersedia sesuai pilihanmu.
        </p>
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