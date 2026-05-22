import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  MapPin,
  Check,
  Star,
  Zap,
  ArrowRight,
  Clock,
  FileText,
  Sparkles,
  Navigation,
  CheckCircle2,
  X,
} from "lucide-react";
import { BatikPattern, Gunungan } from "@/components/site/Ornaments";

// University Targets in Yogyakarta
const UNIVERSITIES = [
  { id: "ugm", name: "Univ. Gadjah Mada (UGM)", lat: -7.7702, lng: 110.3778, short: "UGM" },
  { id: "uny", name: "Univ. Negeri Yogyakarta (UNY)", lat: -7.7738, lng: 110.3865, short: "UNY" },
  { id: "umy", name: "Univ. Muhammadiyah Yk (UMY)", lat: -7.8115, lng: 110.3223, short: "UMY" },
  { id: "uin", name: "UIN Sunan Kalijaga", lat: -7.7844, lng: 110.3957, short: "UIN" },
  { id: "uajy", name: "Univ. Atma Jaya Yk (UAJY)", lat: -7.7826, lng: 110.4071, short: "UAJY" },
];

// Sample Kost destinations with distance matrices from Universities
const SURVEY_KOST_CATALOG = [
  {
    id: 1,
    name: "Urban Sapphire Elite",
    area: "Depok, Sleman",
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
    type: "Putri",
    rating: 4.9,
    distances: { ugm: 1.2, uny: 0.9, umy: 8.5, uin: 3.2, uajy: 2.8 }, // in km
    address: "Jl. Gejayan No. 12, Condongcatur, Sleman",
  },
  {
    id: 2,
    name: "Gondomanan Heritage",
    area: "Gondomanan, Kota Jogja",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
    type: "Campur",
    rating: 4.8,
    distances: { ugm: 3.5, uny: 3.8, umy: 5.2, uin: 4.0, uajy: 4.5 },
    address: "Jl. Brigjen Katamso No. 45, Gondomanan, Yogyakarta",
  },
  {
    id: 3,
    name: "Modern Nordic Living",
    area: "Mlati, Sleman",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
    type: "Putra",
    rating: 4.7,
    distances: { ugm: 1.8, uny: 2.5, umy: 9.0, uin: 4.8, uajy: 4.2 },
    address: "Jl. Kaliurang KM 5.5, Pogung Baru, Sleman",
  },
  {
    id: 4,
    name: "Serene Garden Bantul",
    area: "Kasihan, Bantul",
    image:
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800",
    type: "Campur",
    rating: 4.6,
    distances: { ugm: 7.8, uny: 8.2, umy: 1.5, uin: 9.5, uajy: 10.2 },
    address: "Jl. Ringroad Selatan, Tamantirto, Kasihan, Bantul",
  },
  {
    id: 5,
    name: "Seturan Luxury Oasis",
    area: "Seturan, Depok, Sleman",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
    type: "Putri",
    rating: 4.9,
    distances: { ugm: 2.9, uny: 2.2, umy: 11.2, uin: 1.8, uajy: 1.1 },
    address: "Jl. Seturan Raya No. 99, Caturtunggal, Sleman",
  },
  {
    id: 6,
    name: "Prawirotaman Boho Studio",
    area: "Mergangsan, Kota Jogja",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
    type: "Campur",
    rating: 4.5,
    distances: { ugm: 5.5, uny: 5.2, umy: 4.8, uin: 5.9, uajy: 6.2 },
    address: "Jl. Prawirotaman I No. 24, Mergangsan, Yogyakarta",
  },
];

export const Route = createFileRoute("/survey")({
  head: () => ({
    meta: [
      { title: "Jasa Survey Kost Eksklusif — Keep Kost" },
      {
        name: "description",
        content:
          "Mager di luar kota tapi butuh nyari kost di Jogja? Biarkan surveyor profesional kami yang datang langsung ke lokasi.",
      },
    ],
  }),
  component: Survey,
});

function Survey() {
  const [selectedUni, setSelectedUni] = useState("ugm");
  const [activeDistanceTier, setActiveDistanceTier] = useState<
    "semua" | "dekat" | "sedang" | "jauh"
  >("semua");
  const [selectedServiceTier, setSelectedServiceTier] = useState<"biasa" | "premium">("premium");

  // Selection states for booking
  const [selectedKost, setSelectedKost] = useState<(typeof SURVEY_KOST_CATALOG)[0] | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Form, 2: Success
  const [customKostName, setCustomKostName] = useState("");
  const [customKostAddress, setCustomKostAddress] = useState("");
  const [isCustomKost, setIsCustomKost] = useState(false);

  // Booking Form Info
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [surveyNotes, setSurveyNotes] = useState("");
  const [surveyDate, setSurveyDate] = useState("");

  // Get active university details
  const currentUni = UNIVERSITIES.find((u) => u.id === selectedUni) || UNIVERSITIES[0];

  // Map categorisation by distance to selected Uni
  const getDistanceTier = (distance: number) => {
    if (distance <= 2.0) return "dekat";
    if (distance <= 5.0) return "sedang";
    return "jauh";
  };

  const filteredKost = SURVEY_KOST_CATALOG.filter((kost) => {
    const dist = kost.distances[selectedUni as keyof typeof kost.distances];
    const tier = getDistanceTier(dist);
    if (activeDistanceTier === "semua") return true;
    return tier === activeDistanceTier;
  });

  const handleOpenBookingModal = (
    kost: (typeof SURVEY_KOST_CATALOG)[0] | null,
    checkCustom: boolean = false,
  ) => {
    setIsCustomKost(checkCustom);
    if (!checkCustom && kost) {
      setSelectedKost(kost);
    } else {
      setSelectedKost(null);
    }
    setBookingStep(1);
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !whatsapp || !surveyDate) {
      alert("Mohon lengkapi semua field wajib.");
      return;
    }
    // Simulate API reservation logic
    setBookingStep(2);
  };

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden">
      <BatikPattern variant="parang" className="opacity-[0.24]" />

      {/* Decorative Traditional Header */}
      <div className="pt-32 pb-16 bg-gradient-to-b from-brand-primary/10 via-transparent to-transparent relative">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-brand-accent/10 px-4 py-2 rounded-full border border-brand-accent/20"
          >
            <Sparkles size={14} className="text-brand-accent animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">
              Keep Kost Concierge Service
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-display font-bold text-brand-primary tracking-tight leading-none dark:text-white"
          >
            Jasa Survey Kost <span className="text-brand-accent italic font-light">Eksklusif.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed dark:text-gray-400"
          >
            Mager di luar kota tapi butuh nyari kost di Jogja? Biarkan surveyor profesional kami
            yang datang langsung ke lokasi, memverifikasi kamar pilihan Anda secara objektif.
          </motion.p>
        </div>

        <Gunungan className="absolute right-4 md:right-16 bottom-0 w-24 md:w-36 opacity-10 pointer-events-none text-brand-primary dark:text-white" />
        <Gunungan className="absolute left-4 md:left-16 bottom-0 w-24 md:w-36 opacity-10 pointer-events-none text-brand-accent" />
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-24 space-y-24">
        {/* LAYANAN DETAIL: Premium vs Biasa Panel */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-brand-primary dark:text-white">
              Dua Opsi Kelas <span className="text-brand-accent italic font-light">Layanan</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Sesuaikan dengan kebutuhan verifikasi detail hunian idaman Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* JASA SURVEY BIASA */}
            <motion.div
              whileHover={{ y: -8 }}
              className={`bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border transition-all relative flex flex-col justify-between ${selectedServiceTier === "biasa" ? "border-gray-300 dark:border-zinc-700 shadow-xl" : "border-gray-100 dark:border-zinc-800 shadow-sm opacity-90"}`}
              id="layanan-biasa-card"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800 px-3 py-1 rounded-full border border-gray-100 dark:border-zinc-700 uppercase">
                      Standar Paket
                    </span>
                    <h3 className="text-2xl font-display font-bold text-brand-primary dark:text-white">
                      Surveyor Biasa
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      Biaya Jasa
                    </p>
                    <p className="text-3xl font-display font-bold text-brand-primary dark:text-white">
                      Rp 35<span className="text-brand-accent">.000</span>
                    </p>
                  </div>
                </div>

                <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed font-light">
                  Layanan inspeksi dasar yang andal untuk memastikan spesifikasi utama kost sesuai
                  dengan deskripsi yang dipasang pemilik.
                </p>

                <hr className="border-gray-100 dark:border-zinc-800" />

                <ul className="space-y-4">
                  {[
                    "5 Foto Kondisi Real-time (Kamar & KM)",
                    "Verifikasi kebersihan & fasilitas utama",
                    "Konfirmasi ulang ketersediaan kamar",
                    "Estimasi kebenaran alamat lokasi",
                    "Laporan digital dikirim dalam 48 Jam via WA",
                  ].map((feat, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm font-medium text-brand-primary/80 dark:text-white/80"
                    >
                      <div className="w-5 h-5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100 dark:border-emerald-900/50">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                  {[
                    "Video Tour Kamera HD",
                    "Live Video Call di Lokasi",
                    "Pengecekan mendalam (Air, Sinyal, Kasur)",
                    "Garansi Prioritas 24 jam",
                  ].map((feat, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm font-medium text-gray-300 dark:text-zinc-700"
                    >
                      <div className="w-5 h-5 bg-gray-50 dark:bg-zinc-850 text-gray-300 dark:text-zinc-700 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-gray-100 dark:border-zinc-800">
                        <X size={10} strokeWidth={3} />
                      </div>
                      <span className="line-through">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-10">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedServiceTier("biasa");
                    handleOpenBookingModal(null, true);
                  }}
                  className={`w-full py-4 rounded-[2rem] font-bold text-sm uppercase tracking-widest border transition-all ${selectedServiceTier === "biasa" ? "bg-brand-primary dark:bg-white text-white dark:text-zinc-900 border-brand-primary dark:border-white shadow-xl shadow-brand-primary/10" : "bg-white dark:bg-zinc-850 text-gray-500 border-gray-200 dark:border-zinc-800 hover:text-brand-primary dark:hover:text-white hover:border-brand-primary dark:hover:border-white"}`}
                >
                  Pilih Surveyor Biasa
                </motion.button>
              </div>
            </motion.div>

            {/* JASA SURVEY PREMIUM */}
            <motion.div
              whileHover={{ y: -8 }}
              className={`bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border transition-all relative flex flex-col justify-between overflow-hidden ${selectedServiceTier === "premium" ? "border-brand-accent shadow-2xl shadow-brand-accent/5" : "border-gray-100 dark:border-zinc-800 shadow-sm opacity-90"}`}
              id="layanan-premium-card"
            >
              {/* Premium Badge Glow */}
              <div className="absolute top-0 right-0 bg-brand-accent text-white font-bold text-[9px] uppercase tracking-widest px-8 py-2.5 rotate-45 translate-x-8 translate-y-3 shadow-md z-15">
                Best Choice
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/20 uppercase">
                      <Sparkles size={10} className="fill-brand-accent" /> Premium Paket
                    </span>
                    <h3 className="text-2xl font-display font-bold text-brand-primary dark:text-white flex items-center gap-2">
                      Surveyor Premium
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-brand-accent font-bold uppercase tracking-widest">
                      Biaya Jasa
                    </p>
                    <p className="text-3xl font-display font-bold text-brand-primary dark:text-white">
                      Rp 85<span className="text-brand-accent">.000</span>
                    </p>
                  </div>
                </div>

                <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed font-light">
                  Layanan VIP terlengkap dengan verifikasi langsung multi-sensor luar dalam secara
                  detail, layaknya Anda sendiri yang pergi ke lokasi!
                </p>

                <hr className="border-gray-100 dark:border-zinc-800" />

                <ul className="space-y-4">
                  {[
                    "Video Tour Kamar HD (Durasi 2-3 Menit)",
                    "Live Call via WhatsApp / GMeet dari Lokasi (10 Menit)",
                    "Inspeksi mendalam: Tekanan air, kekuatan sinyal HP, kenyamanan kasur, & bau kamar",
                    "Pengecekan fasilitas dapur bersama & keamanan parkir",
                    "Analisis detail rute terbaik menuju Kampus target",
                    "Laporan digital PDF resmi + Bukti Video HD dalam 24 Jam!",
                    "Garansi refund 100% jika kamar telah tersewa sebelum dicek",
                  ].map((feat, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm font-semibold text-brand-primary dark:text-white"
                    >
                      <div className="w-5 h-5 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-brand-accent/25">
                        <Check size={12} strokeWidth={3.5} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-10">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedServiceTier("premium");
                    handleOpenBookingModal(null, true);
                  }}
                  className={`w-full py-4 rounded-[2rem] font-bold text-sm uppercase tracking-widest border transition-all ${selectedServiceTier === "premium" ? "bg-brand-accent text-white border-brand-accent shadow-xl shadow-brand-accent/20" : "bg-white dark:bg-zinc-850 text-gray-500 border-gray-200 dark:border-zinc-800 hover:text-brand-accent"}`}
                >
                  Pilih Surveyor Premium
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LOKASI KOST TERDEKAT (RADIUS SELECTOR SECTIONS) */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-display font-bold text-brand-primary dark:text-white">
              Cakupan Lokasi &{" "}
              <span className="text-brand-accent italic font-light">Radius Jarak</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Pilih universitas target Anda di Yogyakarta, lalu lihat pembagian zona jarak kami
              untuk mengestimasi biaya surveyor.
            </p>
          </div>

          {/* Selector Universitas Target */}
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {UNIVERSITIES.map((uni) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={uni.id}
                onClick={() => setSelectedUni(uni.id)}
                className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border ${selectedUni === uni.id ? "bg-brand-primary dark:bg-white border-brand-primary dark:border-white text-white dark:text-zinc-900 shadow-lg" : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-850 text-gray-500 hover:border-brand-accent hover:text-brand-accent"}`}
              >
                {uni.short}
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Interactive Radius Visual / Map Simulator (Tailwind + SVG Beautiful Illustration) */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-gray-100 dark:border-zinc-800 p-10 flex flex-col justify-between pointer-events-auto relative shadow-sm overflow-hidden min-h-[420px]">
              <div className="space-y-1 z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">
                  Interactive Visualizer
                </span>
                <h4 className="text-xl font-display font-bold text-brand-primary dark:text-white">
                  Peta Jarak Radius {currentUni.short}
                </h4>
                <p className="text-xs text-gray-400">
                  Tekan tombol zona di bawah untuk memfilter daftar Kost di sebelah kanan.
                </p>
              </div>

              {/* Radials Map Simulation */}
              <div className="relative w-full h-64 flex items-center justify-center my-6">
                {/* Outer Ring: Jauh (Far) > 5.0km */}
                <motion.div
                  animate={{ scale: activeDistanceTier === "jauh" ? [1, 1.04, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`absolute rounded-full border-2 border-dashed flex items-center justify-center transition-all ${activeDistanceTier === "jauh" ? "w-64 h-64 border-brand-accent/40 bg-brand-accent/5" : "w-56 h-56 border-gray-100 dark:border-zinc-800"}`}
                >
                  <span className="absolute bottom-1 right-2 text-[8px] font-mono font-bold text-gray-300 dark:text-zinc-700 uppercase tracking-widest">
                    Zona 3: Jauh (&gt; 5 KM)
                  </span>
                </motion.div>

                {/* Medium Ring: Sedang 2-5km */}
                <motion.div
                  animate={{ scale: activeDistanceTier === "sedang" ? [1, 1.06, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`absolute rounded-full border flex items-center justify-center transition-all ${activeDistanceTier === "sedang" ? "w-44 h-44 border-brand-primary/30 bg-brand-primary/5" : "w-36 h-36 border-gray-100 dark:border-zinc-800"}`}
                >
                  <span className="absolute top-2 left-1 text-[8px] font-mono font-bold text-brand-primary/30 dark:text-white/20 uppercase tracking-widest">
                    Zona 2: Sedang (2-5 KM)
                  </span>
                </motion.div>

                {/* Inner Ring: Terdekat < 2km */}
                <motion.div
                  animate={{ scale: activeDistanceTier === "dekat" ? [1, 1.08, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`absolute rounded-full border flex items-center justify-center transition-all ${activeDistanceTier === "dekat" ? "w-24 h-24 border-brand-accent/50 bg-brand-accent/10 shadow-inner" : "w-20 h-20 border-gray-100 dark:border-zinc-800"}`}
                >
                  <span className="absolute text-[8px] font-mono font-bold text-brand-accent/60 uppercase tracking-widest mt-10">
                    Zona 1: Dekat (&lt; 2 KM)
                  </span>
                </motion.div>

                {/* Center Node: Selected University Landmark */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute w-12 h-12 bg-brand-primary dark:bg-white rounded-full flex items-center justify-center text-white dark:text-zinc-900 z-20 shadow-xl border-4 border-white dark:border-zinc-900"
                >
                  <Navigation size={18} className="rotate-45 animate-pulse text-brand-accent" />
                </motion.div>

                {/* Animated Pulsing Wave */}
                <div className="absolute w-12 h-12 rounded-full border border-brand-accent/40 animate-ping opacity-60 z-10" />

                {/* Interactive labels pointer float cards */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-brand-primary dark:bg-white text-white dark:text-zinc-900 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-md border border-white/5">
                  <MapPin size={10} className="text-brand-accent" />
                  <span>Kampus {currentUni.short}</span>
                </div>
              </div>

              {/* Three Zones Category Toggles */}
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800 z-10">
                <button
                  onClick={() => setActiveDistanceTier("semua")}
                  className={`py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${activeDistanceTier === "semua" ? "bg-brand-primary dark:bg-white border-brand-primary dark:border-white text-white dark:text-zinc-900 shadow-md" : "bg-gray-50 dark:bg-zinc-850 border-gray-50 dark:border-zinc-850 text-gray-400 hover:border-gray-200 dark:hover:border-zinc-700"}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveDistanceTier("dekat")}
                  className={`py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${activeDistanceTier === "dekat" ? "bg-brand-accent border-brand-accent text-white shadow-md" : "bg-gray-50 dark:bg-zinc-850 border-gray-50 dark:border-zinc-850 text-gray-400 hover:border-brand-accent/50 hover:text-brand-accent"}`}
                >
                  Terdekat
                </button>
                <button
                  onClick={() => setActiveDistanceTier("sedang")}
                  className={`py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${activeDistanceTier === "sedang" ? "bg-brand-accent border-brand-accent text-white shadow-md" : "bg-gray-50 dark:bg-zinc-850 border-gray-50 dark:border-zinc-850 text-gray-400 hover:border-brand-accent/50 hover:text-brand-accent"}`}
                >
                  Tengah²
                </button>
                <button
                  onClick={() => setActiveDistanceTier("jauh")}
                  className={`py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${activeDistanceTier === "jauh" ? "bg-brand-accent border-brand-accent text-white shadow-md" : "bg-gray-50 dark:bg-zinc-850 border-gray-50 dark:border-zinc-850 text-gray-400 hover:border-brand-accent/50 hover:text-brand-accent"}`}
                >
                  Jauh
                </button>
              </div>
            </div>

            {/* List Kost Terdekat Catalog */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-center px-2">
                <span className="font-bold text-sm text-brand-primary dark:text-white">
                  Hasil Pencarian Untuk Radius {currentUni.short}:
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 px-3 py-1 rounded-full">
                  {filteredKost.length} Kost Cocok
                </span>
              </div>

              {/* Grid or flex row container for cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[460px] pr-2 scrollbar-thin">
                {filteredKost.map((kost) => {
                  const dist = kost.distances[selectedUni as keyof typeof kost.distances];
                  const tier = getDistanceTier(dist);
                  const parsedTierText =
                    tier === "dekat" ? "Terdekat" : tier === "sedang" ? "Tengah-tengah" : "Jauh";
                  const parsedTierColor =
                    tier === "dekat"
                      ? "text-emerald-500 bg-emerald-50 border-emerald-100"
                      : tier === "sedang"
                        ? "text-blue-500 bg-blue-50 border-blue-100"
                        : "text-amber-500 bg-amber-50 border-amber-100";

                  return (
                    <motion.div
                      layout
                      whileHover={{ y: -5 }}
                      key={kost.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-brand-accent/5 transition-all"
                    >
                      <div className="space-y-4">
                        <div className="relative aspect-[16/10] bg-gray-50 dark:bg-zinc-850 rounded-2xl overflow-hidden">
                          <img
                            src={kost.image}
                            alt={kost.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                            <span className="bg-brand-primary/95 dark:bg-zinc-900/95 text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg">
                              {kost.type}
                            </span>
                          </div>

                          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 dark:border-zinc-800/10">
                            <Star size={10} className="fill-brand-accent text-brand-accent" />
                            <span className="text-[10px] font-bold text-brand-primary dark:text-white">
                              {kost.rating}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-display font-bold text-lg text-brand-primary dark:text-white leading-snug line-clamp-1 group-hover:text-brand-accent transition-colors">
                            {kost.name}
                          </h5>
                          <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                            <MapPin size={11} className="text-brand-accent" />
                            <span className="truncate">{kost.address}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-50 dark:border-zinc-850 flex items-center justify-between mt-4">
                        {/* Status Jangkauan / Jarak */}
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                            Jarak Dari Kampus
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-brand-primary dark:text-white">
                              {dist} KM
                            </span>
                            <span
                              className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${parsedTierColor}`}
                            >
                              {parsedTierText}
                            </span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleOpenBookingModal(kost, false)}
                          className="px-4 py-2 bg-brand-primary dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-accent hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                        >
                          Pesan Survey <ArrowRight size={10} />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Custom Order Box Option */}
              <div className="bg-brand-primary/5 dark:bg-zinc-850/30 rounded-[2.5rem] border border-brand-accent/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <BatikPattern variant="parang" className="opacity-[0.35]" />
                <div className="space-y-1.5 z-10 text-center md:text-left">
                  <h4 className="font-display font-bold text-lg text-brand-primary dark:text-white flex items-center justify-center md:justify-start gap-2">
                    <Compass size={18} className="text-brand-accent" /> Kost target tidak ada di
                    atas?
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                    Anda bisa memasukkan nama dan alamat kost pilihan sendiri untuk disurvey oleh
                    tim kami.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenBookingModal(null, true)}
                  className="bg-brand-accent text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest shrink-0 shadow-lg shadow-brand-accent/20 border border-brand-accent/20 z-10"
                >
                  Isi Alamat Custom
                </motion.button>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BADGES / HOW IT WORKS */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[4rem] p-12 md:p-20 shadow-sm relative overflow-hidden">
          <BatikPattern variant="kawung" className="opacity-[0.24]" />
          <div className="text-center space-y-2 mb-8 relative z-10 animate-fade-in">
            <h3 className="text-3xl font-display font-semibold text-brand-primary dark:text-white">
              Bagaimana Cara{" "}
              <span className="text-brand-accent italic font-light">Kerja Jasa Survey?</span>
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Hanya 3 langkah mudah sampai hasil laporan survey tiba di HP Anda.
            </p>
          </div>

          {/* Step-by-Step Progress Bar */}
          <div className="relative max-w-3xl mx-auto my-12 z-10 hidden md:block">
            <div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-100 dark:bg-zinc-800 rounded-full -translate-y-1/2 overflow-hidden border border-gray-200/50 dark:border-zinc-700/50">
              <div className="absolute inset-0 bg-brand-accent/10" />
              <BatikPattern variant="parang" className="opacity-30" />
            </div>

            <div className="absolute top-1/2 left-0 w-2/3 h-1.5 bg-brand-accent rounded-full -translate-y-1/2 overflow-hidden shadow-sm">
              <BatikPattern variant="parang" className="opacity-75" />
            </div>

            {/* Step Milestones */}
            <div className="relative flex justify-between items-center">
              {[
                { label: "01. Jadwalkan", icon: Clock },
                { label: "02. Verifikasi", icon: Compass },
                { label: "03. Hasil", icon: FileText },
              ].map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx <= 1;
                return (
                  <div key={idx} className="flex flex-col items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-md relative z-10 ${isActive ? "bg-brand-accent text-white border-brand-accent" : "bg-white dark:bg-zinc-900 text-gray-400 border-gray-100 dark:border-zinc-800"}`}
                    >
                      <Icon size={18} />
                    </motion.div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white dark:bg-zinc-900 rounded-full border shadow-sm ${isActive ? "border-brand-accent/20 text-brand-primary dark:text-white" : "border-gray-100 dark:border-zinc-800 text-gray-400"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {[
              {
                step: "01",
                title: "Pilih & Kirim Form",
                desc: "Pilih salah satu kost catalog di atas atau isi alamat custom, pilih paket survey lalu submit info kontak Anda.",
              },
              {
                step: "02",
                title: "Surveyor ke Lokasi",
                desc: "Surveyor profesional Keep Kost akan mendatangi lokasi di Jogja sesuai tanggal yang Anda jadwalkan.",
              },
              {
                step: "03",
                title: "Terima Laporan",
                desc: "Terima hasil analisis tertulis objektif, foto real-time, atau video HD langsung via chat WhatsApp pribadi.",
              },
            ].map((st, i) => (
              <div key={i} className="space-y-6 text-center md:text-left relative group">
                <span className="font-display font-extrabold text-7xl text-brand-primary/10 dark:text-white/10 opacity-50 block md:hidden lg:block select-none leading-none tracking-tight transform group-hover:translate-x-1 transition-transform">
                  {st.step}
                </span>
                <div className="space-y-3">
                  <h4 className="text-xl font-display font-semibold text-brand-primary dark:text-white">
                    {st.title}
                  </h4>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* SURVEY BOOKING MODAL */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute inset-0 bg-brand-primary/40 dark:bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[3.5rem] shadow-2xl relative w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 z-10 p-10 md:p-14"
            >
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="absolute top-8 right-8 text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <X size={20} />
              </button>

              {bookingStep === 1 ? (
                <form onSubmit={handleSubmitBooking} className="space-y-8">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/25 text-brand-accent text-[9px] font-bold uppercase tracking-widest">
                      <Zap size={10} className="fill-brand-accent" /> Booking Jasa Survey
                    </div>
                    <h3 className="text-3xl font-display font-semibold text-brand-primary dark:text-white">
                      Formulir Pemesanan
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Tim verifikator profesional kami siap berangkat langsung ke lokasi tujuan di
                      Yogyakarta.
                    </p>
                  </div>

                  {/* Selected service metadata preview card */}
                  <div className="bg-gray-50 dark:bg-zinc-850 rounded-3xl p-5 border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">
                        Layanan Paket Terpilih
                      </p>
                      <h4 className="font-display font-bold text-lg text-brand-primary dark:text-white uppercase">
                        Surveyor {selectedServiceTier === "premium" ? "👑 Premium" : "⭐ Biasa"}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[9.5px] font-bold uppercase text-brand-accent tracking-widest">
                        Biaya Paket
                      </p>
                      <p className="text-xl font-display font-bold text-brand-primary dark:text-white">
                        {selectedServiceTier === "premium" ? "Rp 85.000" : "Rp 35.000"}
                      </p>
                    </div>
                  </div>

                  {/* Selected target Kost (Custom vs Preset) */}
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">
                      Detail Lokasi Survey
                    </p>
                    {isCustomKost ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Nama Kost Pilihan
                          </label>
                          <input
                            required
                            type="text"
                            value={customKostName}
                            onChange={(e) => setCustomKostName(e.target.value)}
                            placeholder="Contoh: Kost Griya Putri Asri"
                            className="bg-gray-50 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm text-brand-primary dark:text-white font-bold focus:ring-1 focus:ring-brand-accent w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Alamat Lengkap / Link Maps
                          </label>
                          <input
                            required
                            type="text"
                            value={customKostAddress}
                            onChange={(e) => setCustomKostAddress(e.target.value)}
                            placeholder="Contoh: Jl. Kaliurang KM 8, Gg. Damai No 5"
                            className="bg-gray-50 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm text-brand-primary dark:text-white font-bold focus:ring-1 focus:ring-brand-accent w-full"
                          />
                        </div>
                      </div>
                    ) : selectedKost ? (
                      <div className="flex items-center gap-4 bg-brand-primary/5 dark:bg-zinc-800/20 rounded-2xl p-4 border border-brand-primary/10 dark:border-zinc-800/10">
                        <img
                          src={selectedKost.image}
                          alt={selectedKost.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                            Target Kost
                          </p>
                          <h5 className="font-bold text-brand-primary dark:text-white text-base leading-snug">
                            {selectedKost.name}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {selectedKost.address}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500 select-none">
                        Belum memilih kost target survey.
                      </p>
                    )}
                  </div>

                  {/* Personal Contacts & Schedule details */}
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">
                      Informasi Koresponden
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          Nama Lengkap Anda *
                        </label>
                        <input
                          required
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ketik nama lengkap..."
                          className="bg-gray-50 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm text-brand-primary dark:text-white font-bold focus:ring-1 focus:ring-brand-accent w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          No. WhatsApp Aktif *
                        </label>
                        <input
                          required
                          type="text"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="Contoh: 08123456789"
                          className="bg-gray-50 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm text-brand-primary dark:text-white font-bold focus:ring-1 focus:ring-brand-accent w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          Rencana Tanggal Survey *
                        </label>
                        <input
                          required
                          type="date"
                          value={surveyDate}
                          onChange={(e) => setSurveyDate(e.target.value)}
                          className="bg-gray-50 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm text-brand-primary dark:text-white font-bold focus:ring-1 focus:ring-brand-accent w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          Catatan Tambahan untuk Surveyor
                        </label>
                        <input
                          type="text"
                          value={surveyNotes}
                          onChange={(e) => setSurveyNotes(e.target.value)}
                          placeholder="Contoh: Tolong cek meteran listrik & sinyal Tri"
                          className="bg-gray-50 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm text-brand-primary dark:text-white font-bold focus:ring-1 focus:ring-brand-accent w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all text-center sm:w-1/3"
                    >
                      Batal
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="bg-brand-accent hover:bg-brand-primary text-white hover:text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest text-center shadow-lg shadow-brand-accent/20 transition-all flex-1 relative overflow-hidden"
                    >
                      <BatikPattern variant="parang" className="opacity-30" />
                      <span className="relative z-10">Kirim Pemesanan Survey</span>
                    </motion.button>
                  </div>
                </form>
              ) : (
                /* Success screen inside the Modal */
                <div className="text-center py-10 space-y-8 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    <CheckCircle2 size={44} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-3xl font-display font-semibold text-brand-primary dark:text-white">
                      Pemesanan Berhasil Dikirim!
                    </h4>
                    <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                      Terima kasih{" "}
                      <span className="font-bold text-brand-primary dark:text-white">
                        {fullName}
                      </span>
                      , pemesanan surveyor{" "}
                      <span className="font-bold text-brand-primary dark:text-white">
                        {selectedServiceTier === "premium" ? "Premium 👑" : "Biasa ⭐"}
                      </span>{" "}
                      Anda telah tercatat dalam sistem kami.
                    </p>
                  </div>

                  <div className="p-6 bg-brand-primary/5 dark:bg-zinc-800 border border-brand-primary/15 dark:border-zinc-700 rounded-3xl text-left text-xs text-brand-primary/85 dark:text-white/80 max-w-md space-y-2">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-brand-accent">
                      Informasi Lanjutan:
                    </p>
                    <p>
                      ● Tim Admin akan menghubungi nomor WhatsApp{" "}
                      <span className="font-bold">{whatsapp}</span> dalam 15-30 menit ke depan untuk
                      instruksi pembayaran jasa.
                    </p>
                    <p>
                      ● Surveyor kami akan mengunduh tiket tugas untuk meluncur ke lokasi kost pada
                      tanggal <span className="font-bold">{surveyDate}</span>.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsBookingModalOpen(false)}
                    className="bg-brand-primary dark:bg-white text-white dark:text-zinc-900 border border-brand-primary/10 dark:border-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest"
                  >
                    Tutup Halaman
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
