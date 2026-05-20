import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Star } from "lucide-react";
import { KOS_LIST } from "@/lib/kos-data";
import { KosCard } from "@/components/site/KosCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KeepKost & Next Sleep — Cari Kos Jogja Premium" },
      { name: "description", content: "Temukan hunian eksklusif dengan fasilitas premium yang dirancang khusus untuk kenyamanan produktivitas Anda di Yogyakarta." },
    ],
  }),
  component: Index,
});

function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const featured = KOS_LIST.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/katalog", search: { search: searchQuery } });
    } else {
      navigate({ to: "/katalog" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section — -mt-20 negates root pt-20, allows full-bleed behind transparent navbar */}
      <section className="relative h-screen -mt-20 flex items-center justify-center overflow-hidden bg-brand-primary">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            alt="Interior premium"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/60 via-transparent to-brand-primary/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="font-display font-bold text-6xl md:text-8xl tracking-tight leading-[0.95] text-white">
              Istirahat Nyaman <br /> 
              Di <span className="text-brand-accent italic font-light">Elegansi</span> Kost.
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-white/70 font-light leading-relaxed">
              Temukan hunian eksklusif dengan fasilitas premium yang dirancang khusus untuk kenyamanan produktivitas Anda.
            </p>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-2xl md:rounded-full flex flex-col md:flex-row gap-2 border border-white/20 shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-6 py-3">
                <Search className="text-brand-accent" size={24} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari lokasi, universitas, atau area..."
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-white/50 w-full text-lg"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-brand-accent text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-brand-accent/20 transition-all border border-brand-accent/50 cursor-pointer"
              >
                Cari Sekarang
              </motion.button>
            </form>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest font-medium">Scroll Down</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-secondary/30 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Kost Premium", value: "150+" },
            { label: "Mahasiswa Puas", value: "2k+" },
            { label: "Area Yogyakarta", value: "12" },
            { label: "Rating Layanan", value: "4.9/5" }
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="space-y-1"
            >
              <div className="font-display font-bold text-4xl text-brand-primary dark:text-white tracking-tight">{stat.value}</div>
              <div className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4 max-w-2xl">
              <h2 className="font-display font-bold text-5xl tracking-tight text-foreground">Koleksi Kost Pilihan.</h2>
              <p className="text-muted-foreground text-lg">Kost dengan desain modern dan fasilitas terlengkap untuk gaya hidup aktif Anda.</p>
            </div>
            <motion.div 
              whileHover={{ x: 10 }}
              className="flex"
            >
              <Link to="/katalog" className="flex items-center gap-2 font-bold text-brand-primary dark:text-white hover:text-brand-accent transition-colors group">
                Lihat Semua Kost <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-brand-accent" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((kost) => (
              <KosCard key={kost.id} kos={kost} />
            ))}
          </div>
        </div>
      </section>

      {/* Mitra CTA Section */}
      <section className="py-32 bg-secondary/50 dark:bg-zinc-900/30 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10 relative z-10">
            <div className="flex items-center gap-3 text-brand-accent">
               <div className="w-10 h-10 bg-brand-accent/20 rounded-xl flex items-center justify-center font-bold">M</div>
               <span className="font-bold text-[10px] uppercase tracking-[0.3em]">Portal Mitra</span>
            </div>
            <h2 className="text-6xl font-display font-bold text-brand-primary dark:text-white leading-[0.95] tracking-tighter">
               Punya Kost di <br /> 
               <span className="italic font-light text-brand-accent">Yogyakarta?</span>
            </h2>
            <p className="text-muted-foreground text-xl font-light max-w-lg leading-relaxed">
              Bergabunglah sebagai mitra kami dan kelola properti Anda dengan sistem manajemen tercanggih dan laporan bisnis real-time.
            </p>
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/mitra" className="bg-brand-primary dark:bg-white dark:text-zinc-900 text-white px-10 py-5 rounded-[2.5rem] font-bold shadow-2xl shadow-brand-primary/20 transition-all text-sm uppercase tracking-widest flex items-center gap-3 border border-white/10">
                  Daftar Jadi Mitra <ArrowRight size={20} className="text-brand-accent" />
                </Link>
              </motion.div>
            </div>
          </div>
          <div className="relative">
             <div className="grid grid-cols-2 gap-6 scale-110 -rotate-6">
                {[
                  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400"
                ].map((img, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800"
                  >
                    <img src={img} className="w-full h-full object-cover" alt="Interior" />
                  </motion.div>
                ))}
             </div>
             {/* Abstract Shapes */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/20 rounded-full blur-[100px]" />
             <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-brand-primary/5 rounded-full blur-[100px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
