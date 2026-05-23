import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { KOS_LIST, KAMPUS_LIST, JENIS_KOS, formatRupiah, type Kos } from "@/lib/kos-data";
import { useKosStore, addInquiry } from "@/lib/kos-store";
import { InteractiveMap } from "@/components/site/InteractiveMap";
import { toast } from "sonner";
import { BatikPattern, TumpalDivider, PatraCorner } from "@/components/site/Ornaments";
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
  Heart,
} from "lucide-react";
import { KosCard } from "@/components/site/KosCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  AC: Snowflake,
  "Kamar Mandi Dalam": Bath,
  Laundry: Shirt,
  "Parkir Mobil": Car,
  "Parkir Motor": Car,
  "Smart TV": Tv,
};

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M19.11 17.27c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.02-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.64 1.11 2.82.14.18 1.92 2.93 4.65 4.11.65.28 1.16.45 1.55.58.65.21 1.24.18 1.71.11.52-.08 1.61-.66 1.84-1.29.23-.64.23-1.18.16-1.29-.07-.11-.25-.18-.52-.32zM16 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.27.6 4.39 1.65 6.23L3.2 28.8l6.74-1.62A12.74 12.74 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2zm0 23.36a10.5 10.5 0 0 1-5.36-1.46l-.38-.23-3.99.96 1.07-3.89-.25-.4A10.55 10.55 0 1 1 16 26.56z" />
    </svg>
  );
}

const WA_NUMBER = "6281234567890";

export const Route = createFileRoute("/kos/$id")({
  loader: ({ params }) => {
    const kos = KOS_LIST.find((k) => k.id === params.id);
    if (kos) return { kos };

    // Return a client-side stub for custom listings added via dashboard
    return {
      kos: {
        id: params.id,
        nama: "Kos Baru",
        gambar: "",
        daerah: "sleman",
        alamat: "",
        hargaPerBulan: 0,
        rating: 4.5,
        jenis: "campur",
        fasilitas: [],
        kampusTerdekat: [],
        deskripsi: "",
        isStub: true,
      } as unknown as Kos,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.kos?.nama ?? "Detail Kos"} — Keep n Sleep` },
      {
        name: "description",
        content: loaderData?.kos?.deskripsi ?? "Detail kos di Yogyakarta.",
      },
      { property: "og:title", content: loaderData?.kos?.nama ?? "Detail Kos" },
      { property: "og:image", content: loaderData?.kos?.gambar ?? "" },
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
  const { kos: initialKos } = Route.useLoaderData() as { kos: Kos & { isStub?: boolean } };
  const kosList = useKosStore();

  // Try to find the item in our custom localstorage store.
  // Fallback to initialKos if it was a statically seeded item (not a stub).
  const kos =
    kosList.find((k) => k.id === initialKos.id) ?? (initialKos.isStub ? undefined : initialKos);

  if (!kos) {
    throw notFound();
  }
  const jenisLabel = JENIS_KOS.find((j) => j.value === kos.jenis)?.label;
  const kampusLabels = kos.kampusTerdekat
    .map((k) => KAMPUS_LIST.find((c) => c.value === k)?.label)
    .filter(Boolean) as string[];

  const galeri = (kos.galeri && kos.galeri.length > 0 ? kos.galeri : [kos.gambar]).slice(0, 5);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const [duration, setDuration] = useState<number>(1);
  const [checkIn, setCheckIn] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("knsleep:wishlist:v1");
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setIsWishlisted(ids.includes(kos.id));
      }
    } catch (e) {
      console.error("Failed to load wishlist state", e);
    }
  }, [kos.id]);

  const toggleWishlist = () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("knsleep:wishlist:v1") || "[]";
      let ids = JSON.parse(stored) as string[];
      if (ids.includes(kos.id)) {
        ids = ids.filter((id) => id !== kos.id);
        setIsWishlisted(false);
        toast.success("Dihapus dari wishlist!");
      } else {
        ids.push(kos.id);
        setIsWishlisted(true);
        toast.success("Ditambahkan ke wishlist!");
      }
      localStorage.setItem("knsleep:wishlist:v1", JSON.stringify(ids));
    } catch (e) {
      console.error("Failed to update wishlist state", e);
      toast.error("Gagal memperbarui wishlist");
    }
  };

  const discountFactor = duration === 3 ? 0.95 : duration === 6 ? 0.9 : duration === 12 ? 0.85 : 1;
  const monthlyPrice = Math.round(kos.hargaPerBulan * discountFactor);
  const totalPrice = monthlyPrice * duration;

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const lainnya = kosList
    .filter((k) => k.id !== kos.id && (k.daerah === kos.daerah || k.jenis === kos.jenis))
    .slice(0, 3);

  const bookingDetails = `di "${kos.nama}" (${kos.alamat}) untuk durasi ${duration} Bulan${checkIn ? ` mulai tanggal ${checkIn}` : ""}. Estimasi biaya: ${formatRupiah(totalPrice)}`;
  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    (kos.tersedia ?? true)
      ? `Halo, saya tertarik memesan kos ${bookingDetails}. Apakah masih tersedia?`
      : `Halo, saya ingin bergabung dengan waiting list untuk kos ${bookingDetails}.`,
  )}`;

  const reviews = [
    {
      nama: "Rani P.",
      kampus: "Mahasiswa UGM",
      rating: 5,
      komentar:
        "Kamarnya bersih, pemiliknya ramah, dan lokasinya sangat strategis. Wi-Fi kencang banget buat kuliah online.",
    },
    {
      nama: "Adit S.",
      kampus: "Mahasiswa UNY",
      rating: 4,
      komentar:
        "Fasilitas lengkap dan suasananya tenang. Cocok untuk yang butuh fokus belajar. Recommended!",
    },
    {
      nama: "Dewi K.",
      kampus: "Pekerja muda",
      rating: 5,
      komentar:
        "Sudah 6 bulan di sini, nyaman dan aman. Lingkungan sekitar juga banyak warung makan.",
    },
  ];
  const totalUlasan = 128;
  const ratingBars = [
    { star: 5, pct: 78 },
    { star: 4, pct: 16 },
    { star: 3, pct: 4 },
    { star: 2, pct: 1 },
    { star: 1, pct: 1 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/katalog"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
      </Link>

      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        {/* Galeri Foto */}
        <div className="animate-fade-up space-y-3">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <Carousel setApi={setApi} opts={{ loop: galeri.length > 1 }} className="relative">
              <CarouselContent>
                {galeri.map((src, i) => (
                  <CarouselItem key={src + i}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={src}
                        alt={`${kos.nama} foto ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 flex gap-1.5">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {jenisLabel}
                        </span>
                        {!(kos.tersedia ?? true) && (
                          <span className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
                            Penuh
                          </span>
                        )}
                      </span>
                      <span className="absolute right-4 top-4 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
                        {i + 1} / {galeri.length}
                      </span>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {galeri.length > 1 && (
                <>
                  <CarouselPrevious className="left-3 h-9 w-9 border-border bg-background/90 text-foreground shadow-md hover:bg-background" />
                  <CarouselNext className="right-3 h-9 w-9 border-border bg-background/90 text-foreground shadow-md hover:bg-background" />
                </>
              )}
            </Carousel>
          </div>

          {galeri.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galeri.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => api?.scrollTo(i)}
                  className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    current === i
                      ? "border-primary shadow-sm"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Lihat foto ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="animate-fade-up space-y-5" style={{ animationDelay: "100ms" }}>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="inline-block h-1.5 w-8 rounded-full bg-accent" /> Kos Pilihan
            </div>
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="font-serif text-3xl font-bold md:text-4xl leading-tight">
                {kos.nama}
              </h1>
              <button
                onClick={toggleWishlist}
                className={`group p-2.5 rounded-full border transition-all cursor-pointer ${
                  isWishlisted
                    ? "bg-red-50 border-red-200 text-red-500 shadow-sm"
                    : "bg-background border-border text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
                title={isWishlisted ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
              >
                <Heart
                  className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                    isWishlisted ? "fill-red-500" : ""
                  }`}
                />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {kos.alamat}
              </span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="h-4 w-4 fill-accent text-accent" /> {kos.rating}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden space-y-4">
            <PatraCorner
              position="top-right"
              className="top-1 right-1 opacity-20 text-brand-accent scale-75"
            />

            <div>
              <div className="text-xs text-muted-foreground relative z-10">Harga sewa</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-primary">
                  {formatRupiah(monthlyPrice)}
                </span>
                <span className="text-sm font-normal text-muted-foreground">/ bulan</span>
                {duration > 1 && (
                  <span className="ml-2 rounded-full bg-brand-accent/10 px-2 py-0.5 text-[9px] font-bold text-brand-accent uppercase tracking-wider">
                    Hemat {duration === 3 ? "5%" : duration === 6 ? "10%" : "15%"}
                  </span>
                )}
                {!(kos.tersedia ?? true) && (
                  <span className="ml-auto rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                    Penuh
                  </span>
                )}
              </div>
            </div>

            {/* Premium Duration Selector Buttons */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Pilih Durasi Sewa
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { val: 1, label: "1 Bln", desc: "Standar" },
                  { val: 3, label: "3 Bln", desc: "Hemat 5%" },
                  { val: 6, label: "6 Bln", desc: "Hemat 10%" },
                  { val: 12, label: "12 Bln", desc: "Hemat 15%" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setDuration(opt.val)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                      duration === opt.val
                        ? "bg-primary border-primary text-primary-foreground shadow-sm font-bold"
                        : "bg-secondary/40 border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    }`}
                  >
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <span className="text-[8px] font-medium opacity-85 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Check-in Date Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">
                Tanggal Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-secondary/40 border-transparent rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer"
              />
            </div>

            {/* Total Price summary */}
            {duration > 1 && (
              <div className="bg-secondary/30 rounded-xl p-3 border border-border/50 flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Total ({duration} Bulan)</span>
                <span className="font-bold text-foreground text-sm">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            )}

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                addInquiry({
                  kosId: kos.id,
                  namaKos: kos.nama,
                  namaCalon: "Pengunjung Baru",
                  telepon: "628" + Math.floor(100000000 + Math.random() * 900000000),
                  pesan: `Halo, saya tertarik memesan kos di "${kos.nama}" (${kos.alamat}) untuk durasi ${duration} Bulan${checkIn ? ` mulai tanggal ${checkIn}` : ""}. Estimasi biaya: ${formatRupiah(totalPrice)}`,
                });
                toast.success(
                  (kos.tersedia ?? true)
                    ? "Lead reservasi terkirim ke Pemilik!"
                    : "Pendaftaran waiting list terkirim ke Pemilik!",
                );
              }}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all active:scale-95 ${
                (kos.tersedia ?? true)
                  ? "bg-[#25D366] hover:bg-[#1ebe5d]"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              <WhatsappIcon className="h-5 w-5" />
              {(kos.tersedia ?? true) ? "Hubungi Pemilik" : "Hubungi Waiting List"}
            </a>
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

      <TumpalDivider className="mt-8 opacity-45" />

      {/* Deskripsi & Fasilitas */}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section className="animate-fade-up rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-bold">Tentang Kos Ini</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{kos.deskripsi}</p>
        </section>
        <section
          className="animate-fade-up rounded-2xl border border-border bg-card p-6"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="font-serif text-xl font-bold">Fasilitas Lengkap</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {kos.fasilitas.map((f) => {
              const matchKey = Object.keys(ICONS).find(
                (key) => key.toLowerCase() === f.trim().toLowerCase(),
              );
              const Icon = (matchKey ? ICONS[matchKey] : undefined) ?? CheckCircle2;
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

      {/* Interactive Map */}
      <div className="mt-8 animate-fade-up" style={{ animationDelay: "150ms" }}>
        <InteractiveMap
          kosName={kos.nama}
          lat={-7.77 - (kos.id.charCodeAt(1) % 5) * 0.008}
          lng={110.37 + (kos.id.charCodeAt(1) % 5) * 0.008}
          kampusList={kos.kampusTerdekat}
        />
      </div>

      {/* Lainnya */}
      {/* Rating & Ulasan */}
      <section className="animate-fade-up mt-12 rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold">Rating & Ulasan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Berdasarkan {totalUlasan} ulasan dari penghuni.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-[260px_1fr]">
          {/* Summary */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-secondary/40 p-6 text-center">
            <div className="font-serif text-5xl font-bold text-primary">
              {kos.rating.toFixed(1)}
            </div>
            <div className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(kos.rating)
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">dari {totalUlasan} ulasan</div>

            <div className="mt-5 w-full space-y-1.5">
              {ratingBars.map((b) => (
                <div key={b.star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{b.star}</span>
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <ul className="space-y-4">
            {reviews.map((r, i) => (
              <li
                key={i}
                className="rounded-xl border border-border bg-background/60 p-4 transition-colors hover:bg-background"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-serif font-bold text-primary">
                      {r.nama.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{r.nama}</div>
                      <div className="text-xs text-muted-foreground">{r.kampus}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-3.5 w-3.5 ${
                          j < r.rating ? "fill-accent text-accent" : "text-muted-foreground/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.komentar}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {lainnya.length > 0 && (
        <section className="mt-12 relative overflow-hidden rounded-3xl bg-secondary/30 dark:bg-zinc-900/50 p-6 md:p-8 border border-border">
          <BatikPattern variant="nitik" className="opacity-[0.18]" />
          <div className="relative z-10">
            <h2 className="mb-5 font-serif text-2xl font-bold">Kos Serupa</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lainnya.map((k) => (
                <KosCard key={k.id} kos={k} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
