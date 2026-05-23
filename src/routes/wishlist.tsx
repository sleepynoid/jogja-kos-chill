import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Star, ArrowRight, Trash2, Search } from "lucide-react";
import { BatikPattern } from "@/components/site/Ornaments";
import { useKosStore } from "@/lib/kos-store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist Kost Impian Anda — Keep Kost" },
      {
        name: "description",
        content: "Koleksi hunian eksklusif yang menarik perhatian Anda di Yogyakarta.",
      },
    ],
  }),
  component: Wishlist,
});

const STORAGE_KEY = "knsleep:wishlist:v1";

function Wishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const kosList = useKosStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      } else {
        // Default seed wishlisted items (k1: Griya Sogan Bulaksumur, k3: Omah Malioboro Heritage)
        const defaults = ["k1", "k3"];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        setWishlistIds(defaults);
      }
    } catch (e) {
      console.error("Failed to load wishlist", e);
    }
    setIsLoaded(true);
  }, []);

  const handleRemove = (id: string) => {
    const updated = wishlistIds.filter((item) => item !== id);
    setWishlistIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Get matching real Kos objects from catalog
  const wishlistItems = kosList.filter((item) => wishlistIds.includes(item.id));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-brand-bg relative flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden">
      <BatikPattern variant="parang" className="opacity-[0.16]" />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <header className="mb-20 space-y-4">
          <div className="flex items-center gap-3 text-brand-accent">
            <Heart size={20} className="fill-brand-accent" />
            <span className="font-bold text-[10px] uppercase tracking-[0.3em]">
              Curated Collection
            </span>
          </div>
          <h1 className="text-6xl font-display font-bold tracking-tighter text-brand-primary dark:text-white">
            Kost <span className="italic font-light text-brand-accent">Impianmu.</span>
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-xl font-light">
            Koleksi hunian eksklusif yang menarik perhatianmu.
          </p>
        </header>

        <AnimatePresence mode="popLayout">
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {wishlistItems.map((item) => {
                const areaName = item.daerah.charAt(0).toUpperCase() + item.daerah.slice(1);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.3 }}
                    key={item.id}
                    className="group bg-white dark:bg-zinc-900 rounded-[4rem] overflow-hidden border border-gray-50 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:shadow-brand-accent/5 transition-all flex flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.gambar}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        alt={item.nama}
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="absolute top-8 right-8 w-14 h-14 bg-white/20 dark:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 dark:border-white/5 shadow-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Hapus dari Wishlist"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>

                    <div className="p-10 space-y-8 flex-1 flex flex-col justify-between">
                      <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <Link to="/kos/$id" params={{ id: item.id }}>
                            <h3 className="font-display font-bold text-2xl text-brand-primary dark:text-white group-hover:text-brand-accent transition-colors leading-tight">
                              {item.nama}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-850 px-3 py-1.5 rounded-xl text-brand-accent font-bold text-xs shrink-0">
                            <Star size={14} className="fill-brand-accent" /> {item.rating}
                          </div>
                        </div>
                        <p className="text-brand-primary/40 dark:text-white/40 text-sm flex items-center gap-2 font-medium italic">
                          <MapPin size={16} className="text-brand-accent" /> {areaName}, Yogyakarta
                        </p>
                      </div>

                      <div className="pt-8 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Harga Sewa
                          </p>
                          <p className="text-2xl font-display font-bold text-brand-primary dark:text-white">
                            Rp {formatPrice(item.hargaPerBulan)}
                            <span className="text-xs font-normal text-gray-400 ml-1 italic">
                              / bln
                            </span>
                          </p>
                        </div>
                        <Link
                          to="/kos/$id"
                          params={{ id: item.id }}
                          className="w-14 h-14 bg-gray-50 dark:bg-zinc-850 rounded-[1.5rem] flex items-center justify-center text-brand-primary dark:text-white hover:bg-brand-primary hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all shadow-sm cursor-pointer"
                        >
                          <ArrowRight size={24} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-40 space-y-10 bg-white dark:bg-zinc-900 rounded-[4rem] border border-dashed border-gray-200 dark:border-zinc-800"
            >
              <div className="w-32 h-32 bg-gray-50 dark:bg-zinc-850 rounded-full flex items-center justify-center mx-auto text-gray-200 dark:text-zinc-700 ring-8 ring-gray-50/50 dark:ring-zinc-850/50">
                <Heart size={48} className="animate-pulse text-brand-accent fill-brand-accent/20" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-display font-bold tracking-tight text-brand-primary dark:text-white">
                  Wishlist Anda Kosong
                </h3>
                <p className="text-gray-400 text-lg font-light">
                  Hunian impian Anda sedang menunggu untuk ditemukan.
                </p>
              </div>
              <Link
                to="/katalog"
                className="inline-flex items-center gap-4 bg-brand-primary dark:bg-white text-white dark:text-zinc-950 px-10 py-5 rounded-[2rem] font-bold hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-primary/20 transition-all uppercase tracking-widest text-xs cursor-pointer border border-transparent dark:border-white/10"
              >
                Mulai Eksplorasi <Search size={20} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
