import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { KAMPUS_LIST, JENIS_KOS, formatRupiah } from "@/lib/kos-data";
import { getKosByUuidFn, getPublicKosListFn } from "@/lib/kos.server";
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
  Share2,
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
import { motion, AnimatePresence } from "framer-motion";

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

const WA_NUMBER_FALLBACK = "6281234567890";

export const Route = createFileRoute("/kos/$uuid")({
  loader: async ({ params }) => {
    const kos = await getKosByUuidFn({ data: { uuid: params.uuid } });
    if (!kos) throw notFound();
    const allKos = await getPublicKosListFn();
    const similar = allKos
      .filter((k) => k.id !== kos.id && (k.daerah === kos.daerah || k.jenis === kos.jenis))
      .slice(0, 3);
    return { kos, similar };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.kos?.nama ?? "Detail Kos"} — Keep n Sleep` },
      { name: "description", content: loaderData?.kos?.deskripsi ?? "Detail kos di Yogyakarta." },
      { property: "og:title", content: loaderData?.kos?.nama ?? "Detail Kos" },
      { property: "og:image", content: loaderData?.kos?.gambar ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Kos tidak ditemukan</h1>
      <p className="mt-2 text-muted-foreground">Mungkin sudah dihapus atau ID-nya salah.</p>
      <Link
        to="/katalog"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent/90"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Terjadi kesalahan</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-2xl border px-4 py-2 text-sm font-bold">
        Coba lagi
      </button>
    </div>
  ),
  component: KosDetailPage,
});

function KosDetailPage() {
  const { kos, similar } = Route.useLoaderData();

  const jenisLabel = JENIS_KOS.find((j) => j.value === kos.jenis)?.label;
  const kampusLabels = kos.kampusTerdekat
    .map((k) => KAMPUS_LIST.find((c) => c.value === k)?.label)
    .filter(Boolean) as string[];

  const galeri = kos.galeri && kos.galeri.length > 0 ? kos.galeri : kos.gambar ? [kos.gambar] : [];
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState("deskripsi");
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

  const waNumber = kos.mitraTelepon || WA_NUMBER_FALLBACK;
  const bookingDetails = `di "${kos.nama}" (${kos.alamat}) untuk durasi ${duration} Bulan${checkIn ? ` mulai tanggal ${checkIn}` : ""}. Estimasi biaya: ${formatRupiah(totalPrice)}`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    kos.tersedia
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
    <div className="min-h-screen bg-background">
      {/* Gallery Hero Premium */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-12">
        <Link
          to="/katalog"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 aspect-video lg:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border">
          <div className="md:col-span-2 relative group cursor-pointer overflow-hidden">
            <img
              src={galeri[0] || ""}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              alt={kos.nama}
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
            <span className="absolute left-4 top-4 flex gap-1.5">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                {jenisLabel}
              </span>
              {!kos.tersedia && (
                <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-white">
                  Penuh
                </span>
              )}
            </span>
          </div>
          <div className="hidden md:grid gap-4 col-span-1">
            <div className="relative group cursor-pointer overflow-hidden rounded-[1.5rem]">
              <img
                src={galeri[1] || galeri[0] || ""}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                alt="Detail 1"
              />
            </div>
            <div className="relative group cursor-pointer overflow-hidden rounded-[1.5rem]">
              <img
                src={galeri[2] || galeri[0] || ""}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                alt="Detail 2"
              />
            </div>
          </div>
          <div className="hidden md:block relative group cursor-pointer overflow-hidden">
            <img
              src={galeri[3] || galeri[0] || ""}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              alt="More"
            />
            {galeri.length > 4 && (
              <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-xs">
                +{galeri.length - 4} Foto Lagi
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 pb-20">
        {/* Left Column — Main Info */}
        <div className="lg:col-span-8 space-y-12">
          {/* Header with badges */}
          <header className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                Kos Pilihan
              </span>
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                {jenisLabel}
              </span>
              {kos.tersedia && (
                <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-green-100">
                  Tersedia
                </span>
              )}
              <span className="bg-yellow-50 text-yellow-700 px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-yellow-200 flex items-center gap-1.5">
                <Star size={12} className="fill-yellow-500 stroke-yellow-500" />
                {kos.rating} ({totalUlasan} Review)
              </span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-border">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground leading-tight">
                  {kos.nama}
                </h1>
                <p className="flex items-center gap-2 text-muted-foreground text-base font-light italic">
                  <MapPin size={20} className="text-accent shrink-0" /> {kos.alamat}
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleWishlist}
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-sm ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-card border-border text-muted-foreground hover:text-accent hover:border-accent"
                  }`}
                >
                  <Heart size={22} className={isWishlisted ? "fill-red-500" : ""} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center transition-all shadow-sm text-muted-foreground hover:text-accent hover:border-accent"
                >
                  <Share2 size={22} />
                </motion.button>
              </div>
            </div>
          </header>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-card rounded-[2.5rem] border border-border shadow-sm">
            {[
              { label: "Rating", val: `${kos.rating}/5`, sub: `${totalUlasan} Review` },
              { label: "Harga", val: formatRupiah(kos.hargaPerBulan), sub: "Per Bulan" },
              { label: "Jenis", val: jenisLabel || "-", sub: "Tipe Kos" },
              {
                label: "Status",
                val: kos.tersedia ? "Ready" : "Penuh",
                sub: kos.tersedia ? "Tersedia" : "Waiting List",
              },
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground font-accent">
                  {item.label}
                </p>
                <p className="text-xl font-display font-bold text-foreground tracking-tight">
                  {item.val}
                </p>
                <p className="text-xs text-muted-foreground font-light">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs Section */}
          <div className="space-y-8">
            <div className="flex gap-8 border-b border-border overflow-x-auto">
              {["Deskripsi", "Fasilitas", "Ulasan", "Lokasi"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`relative pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                    activeTab === tab.toLowerCase()
                      ? "text-foreground"
                      : "text-muted-foreground/60 hover:text-accent"
                  }`}
                >
                  {tab}
                  {activeTab === tab.toLowerCase() && (
                    <motion.div
                      layoutId="detail-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "deskripsi" && (
                  <div className="space-y-5 text-muted-foreground leading-relaxed text-base font-light">
                    <p>{kos.deskripsi}</p>
                    {kampusLabels.length > 0 && (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {kampusLabels.map((k) => (
                          <li
                            key={k}
                            className="flex items-center gap-2 text-sm font-medium text-foreground/80"
                          >
                            <CheckCircle2 size={16} className="text-accent" /> Dekat {k}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === "fasilitas" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {kos.fasilitas.map((f, i) => {
                      const matchKey = Object.keys(ICONS).find(
                        (key) => key.toLowerCase() === f.trim().toLowerCase(),
                      );
                      const Icon = (matchKey ? ICONS[matchKey] : undefined) ?? CheckCircle2;
                      return (
                        <motion.div
                          whileHover={{ y: -3, borderColor: "var(--accent)" }}
                          key={i}
                          className="group flex items-center gap-4 bg-card p-5 rounded-[2rem] border border-border shadow-sm transition-all cursor-default"
                        >
                          <div className="w-11 h-11 bg-secondary/60 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-foreground text-sm tracking-tight group-hover:text-accent transition-colors">
                            {f}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {activeTab === "ulasan" && (
                  <div className="space-y-8">
                    {/* Rating Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-secondary/30 p-6 rounded-[2rem] border border-border">
                      <div className="md:col-span-4 text-center md:border-r border-border space-y-2">
                        <p className="text-5xl font-display font-bold text-foreground">
                          {kos.rating.toFixed(1)}
                        </p>
                        <div className="flex justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={`fill-accent text-accent ${s <= Math.round(kos.rating) ? "opacity-100" : "opacity-20"}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          Berdasarkan {totalUlasan} Ulasan
                        </p>
                      </div>
                      <div className="md:col-span-8 space-y-2">
                        {ratingBars.map((b) => (
                          <div key={b.star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-muted-foreground">{b.star}</span>
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${b.pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-muted-foreground">{b.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* User Reviews */}
                    <div className="space-y-4">
                      {reviews.map((r, i) => (
                        <div
                          key={i}
                          className="p-5 bg-card rounded-2xl border border-border space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-display font-bold text-accent">
                                {r.nama.charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-bold text-foreground text-sm">{r.nama}</h5>
                                <p className="text-xs text-muted-foreground">{r.kampus}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200/50">
                              <Star size={12} className="fill-yellow-500 text-yellow-500" />
                              <span className="text-xs font-bold text-yellow-700">{r.rating}</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed italic">
                            "{r.komentar}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "lokasi" && (
                  <div className="space-y-6">
                    <InteractiveMap
                      kosName={kos.nama}
                      lat={-7.77 - (kos.id.charCodeAt(1) % 5) * 0.008}
                      lng={110.37 + (kos.id.charCodeAt(1) % 5) * 0.008}
                      kampusList={kos.kampusTerdekat}
                    />
                    {kampusLabels.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {kampusLabels.map((k, i) => (
                          <div
                            key={i}
                            className="p-5 bg-secondary/30 rounded-2xl border border-border space-y-1.5"
                          >
                            <h5 className="font-bold text-accent text-sm">{k}</h5>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              Kampus Terdekat
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-4 sticky top-8 h-fit">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-8 rounded-[2.5rem] text-foreground shadow-2xl shadow-foreground/5 border border-border relative overflow-hidden"
          >
            <PatraCorner
              position="top-right"
              className="top-1 right-1 opacity-15 text-accent scale-75"
            />

            <div className="space-y-1.5 mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground font-accent">
                Investasi Kenyamanan
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-display font-bold tracking-tighter">
                  {formatRupiah(monthlyPrice)}
                </span>
                <span className="text-muted-foreground mb-1 font-light text-sm">/ bln</span>
              </div>
              {duration > 1 && (
                <span className="inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-[9px] font-bold text-accent uppercase tracking-wider">
                  Hemat {duration === 3 ? "5%" : duration === 6 ? "10%" : "15%"}
                </span>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-secondary/40 p-4 rounded-[1.5rem] border border-border flex flex-col gap-1.5 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  Pilih Plan Sewa
                </p>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="bg-transparent border-none focus:ring-0 text-foreground font-bold w-full p-0 cursor-pointer text-sm"
                >
                  <option value={1}>1 Bulan (Standar)</option>
                  <option value={3}>3 Bulan (Hemat 5%)</option>
                  <option value={6}>6 Bulan (Hemat 10%)</option>
                  <option value={12}>12 Bulan (Eksklusif -15%)</option>
                </select>
              </div>
              <div className="bg-secondary/40 p-4 rounded-[1.5rem] border border-border flex flex-col gap-1.5 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  Tanggal Check-in
                </p>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-foreground font-bold w-full p-0 cursor-pointer text-sm"
                />
              </div>
            </div>

            {/* Total */}
            {duration > 1 && (
              <div className="bg-secondary/30 rounded-xl p-3 border border-border/50 flex justify-between items-center text-xs mb-6">
                <span className="text-muted-foreground font-medium">Total ({duration} Bulan)</span>
                <span className="font-bold text-foreground text-sm">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <motion.a
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  toast.success(
                    kos.tersedia
                      ? "Lead reservasi terkirim ke Pemilik!"
                      : "Pendaftaran waiting list terkirim ke Pemilik!",
                  );
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold text-white shadow-lg transition-all ${
                  kos.tersedia
                    ? "bg-[#25D366] hover:bg-[#1ebe5d]"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                <WhatsappIcon className="h-5 w-5" />
                {kos.tersedia ? "Hubungi Pemilik" : "Hubungi Waiting List"}
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>

      <TumpalDivider className="opacity-45 max-w-7xl mx-auto px-6" />

      {/* Kos Serupa */}
      {similar.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16 relative overflow-hidden">
          <BatikPattern variant="nitik" className="opacity-[0.12]" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold mb-8">
              Kos <span className="italic font-light text-accent">Serupa.</span>
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((k) => (
                <KosCard key={k.id} kos={k} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
