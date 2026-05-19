import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SearchBar } from "@/components/site/SearchBar";
import { KosCard } from "@/components/site/KosCard";
import { KOS_LIST } from "@/lib/kos-data";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Keep n Sleep — Cari Kos Jogja dengan Mudah" },
      { name: "description", content: "Cari kos di sekitar UGM, UNY, UIN, UPN, ISI, UII, UMY, UKDW. Filter berdasarkan kampus, daerah, dan jenis kos." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = KOS_LIST.slice(0, 6);
  return (
    <div>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "var(--batik-pattern)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center text-primary-foreground">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> Jogja Istimewa, Kos Sebening Embun
            </div>
            <h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl">
              Mau cari kos di dekat <span className="italic text-accent-foreground/95">kampus</span> mana?
            </h1>
            <p className="mt-4 text-base text-primary-foreground/90 md:text-lg">
              Pilih kampus atau daerahmu, dan biarkan kami menemukan rumah keduamu di Yogyakarta.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* USP */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, title: "Cari Cepat", desc: "Filter cerdas berdasarkan kampus, daerah, dan jenis kos." },
            { icon: ShieldCheck, title: "Terverifikasi", desc: "Semua mitra dan kos diverifikasi tim Keep n Sleep." },
            { icon: Sparkles, title: "Sentuhan Jogja", desc: "Setiap kos punya cerita dan kehangatan khas Yogyakarta." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 font-serif text-lg font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold md:text-3xl">Kos Pilihan</h2>
            <p className="text-sm text-muted-foreground">Rekomendasi terbaik minggu ini.</p>
          </div>
          <Link to="/katalog" className="text-sm font-semibold text-primary hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((k) => (
            <KosCard key={k.id} kos={k} />
          ))}
        </div>
      </section>

      {/* CTA Mitra */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div
          className="relative overflow-hidden rounded-3xl border border-border bg-secondary p-8 md:p-12"
        >
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--batik-pattern)" }} aria-hidden />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="font-serif text-2xl font-bold md:text-3xl">Punya kos di Jogja?</h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                Daftarkan kosmu di Keep n Sleep dan jangkau ribuan calon penghuni dari seluruh kampus di Yogyakarta.
              </p>
            </div>
            <Link
              to="/mitra"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Daftar Mitra
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
