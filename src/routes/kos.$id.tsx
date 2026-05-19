import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { KOS_LIST, KAMPUS_LIST, JENIS_KOS, formatRupiah, type Kos } from "@/lib/kos-data";
import {
  MapPin,
  Star,
  ArrowLeft,
  Wifi,
  Snowflake,
  Bath,
  Shirt,
  Car,
  Tv,
  CheckCircle2,
  Phone,
  MessageCircle,
} from "lucide-react";
import { KosCard } from "@/components/site/KosCard";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  AC: Snowflake,
  "Kamar Mandi Dalam": Bath,
  Laundry: Shirt,
  "Parkir Mobil": Car,
  "Parkir Motor": Car,
  "Smart TV": Tv,
};

export const Route = createFileRoute("/kos/$id")({
  loader: ({ params }) => {
    const kos = KOS_LIST.find((k) => k.id === params.id);
    if (!kos) throw notFound();
    return { kos };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.kos.nama ?? "Detail Kos"} — Keep n Sleep` },
      {
        name: "description",
        content: loaderData?.kos.deskripsi ?? "Detail kos di Yogyakarta.",
      },
      { property: "og:title", content: loaderData?.kos.nama ?? "Detail Kos" },
      { property: "og:image", content: loaderData?.kos.gambar ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-serif text-3xl font-bold">Kos tidak ditemukan</h1>
      <p className="mt-2 text-muted-foreground">Mungkin sudah dihapus atau ID-nya salah.</p>
      <Link
        to="/katalog"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-serif text-2xl font-bold">Terjadi kesalahan</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-lg border px-4 py-2 text-sm">
        Coba lagi
      </button>
    </div>
  ),
  component: KosDetailPage,
});

function KosDetailPage() {
  const { kos } = Route.useLoaderData() as { kos: Kos };
  const jenisLabel = JENIS_KOS.find((j) => j.value === kos.jenis)?.label;
  const kampusLabels = kos.kampusTerdekat
    .map((k) => KAMPUS_LIST.find((c) => c.value === k)?.label)
    .filter(Boolean) as string[];

  const lainnya = KOS_LIST.filter(
    (k) => k.id !== kos.id && (k.daerah === kos.daerah || k.jenis === kos.jenis),
  ).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/katalog"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
      </Link>

      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        {/* Image */}
        <div className="animate-fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={kos.gambar}
              alt={kos.nama}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {jenisLabel}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="animate-fade-up space-y-5" style={{ animationDelay: "100ms" }}>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="inline-block h-1.5 w-8 rounded-full bg-accent" /> Kos Pilihan
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{kos.nama}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {kos.alamat}
              </span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="h-4 w-4 fill-accent text-accent" /> {kos.rating}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">Harga sewa</div>
            <div className="mt-1 font-serif text-3xl font-bold text-primary">
              {formatRupiah(kos.hargaPerBulan)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/ bulan</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95">
                <MessageCircle className="h-4 w-4" /> Chat Pemilik
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-all hover:bg-secondary active:scale-95">
                <Phone className="h-4 w-4" /> Hubungi
              </button>
            </div>
          </div>

          {kampusLabels.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold">Kampus Terdekat</div>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {kampusLabels.map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {k}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Deskripsi & Fasilitas */}
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="animate-fade-up rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-bold">Tentang Kos Ini</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{kos.deskripsi}</p>
        </section>
        <section className="animate-fade-up rounded-2xl border border-border bg-card p-6" style={{ animationDelay: "80ms" }}>
          <h2 className="font-serif text-xl font-bold">Fasilitas Lengkap</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {kos.fasilitas.map((f) => {
              const Icon = ICONS[f] ?? CheckCircle2;
              return (
                <li
                  key={f}
                  className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
                >
                  <Icon className="h-4 w-4 text-accent" /> {f}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Lainnya */}
      {lainnya.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-serif text-2xl font-bold">Kos Serupa</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lainnya.map((k) => (
              <KosCard key={k.id} kos={k} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}