import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { KAMPUS_LIST, DAERAH_LIST, JENIS_KOS } from "@/lib/kos-data";
import { AppSelect } from "@/components/site/AppSelect";

export function SearchBar({ variant = "hero" }: { variant?: "hero" | "compact" }) {
  const navigate = useNavigate();
  const [kampus, setKampus] = useState("");
  const [daerah, setDaerah] = useState("");
  const [jenis, setJenis] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const search: Record<string, string> = {};
    if (kampus) search.kampus = kampus;
    if (daerah) search.daerah = daerah;
    if (jenis) search.jenis = jenis;
    navigate({ to: "/katalog", search });
  };

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={submit}
      className={`grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg md:grid-cols-4 ${
        isHero ? "md:p-5" : ""
      }`}
    >
      <Field label="Kampus terdekat">
        <AppSelect
          value={kampus}
          onChange={setKampus}
          options={KAMPUS_LIST}
          allLabel="Semua kampus"
          placeholder="Semua kampus"
        />
      </Field>
      <Field label="Daerah">
        <AppSelect
          value={daerah}
          onChange={setDaerah}
          options={DAERAH_LIST}
          allLabel="Semua daerah"
          placeholder="Semua daerah"
        />
      </Field>
      <Field label="Jenis kos">
        <AppSelect
          value={jenis}
          onChange={setJenis}
          options={JENIS_KOS}
          allLabel="Semua jenis"
          placeholder="Semua jenis"
        />
      </Field>
      <div className="flex items-end">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Search className="h-4 w-4" /> Cari Kos
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}