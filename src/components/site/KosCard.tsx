import { MapPin, Star, ArrowRight, GitCompare } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Kos } from "@/lib/kos-data";
import { formatRupiah, JENIS_KOS } from "@/lib/kos-data";
import { motion } from "framer-motion";

export function KosCard({
  kos,
  isCompared = false,
  onCompareToggle,
  showCompare = false,
}: {
  kos: Kos;
  isCompared?: boolean;
  onCompareToggle?: () => void;
  showCompare?: boolean;
}) {
  const jenisLabel = JENIS_KOS.find((j) => j.value === kos.jenis)?.label || "Kos";
  const formattedPrice = formatRupiah(kos.hargaPerBulan);

  // Format price into "Rp X.XXX" and ".XXX" accent parts
  const priceParts = formattedPrice.replace("/bulan", "").trim().split(",");
  const priceMain = priceParts[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group bg-card rounded-3xl md:rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-accent/5 transition-all flex flex-col border border-border/50"
    >
      {/* Media Area */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={kos.gambar}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          alt={kos.nama}
          loading="lazy"
        />

        {/* Gender & Rating Badges */}
        <div className="absolute top-6 left-6 flex gap-2">
          <span className="bg-brand-primary/90 dark:bg-primary/90 backdrop-blur-md text-white px-5 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/10">
            {jenisLabel.replace("Kos ", "")}
          </span>
          <span className="bg-white/90 dark:bg-card/90 backdrop-blur-md text-brand-primary dark:text-foreground px-3 py-2 rounded-2xl text-[10px] font-bold flex items-center gap-1 border border-border/10">
            <Star size={10} className="fill-brand-accent text-brand-accent" /> {kos.rating}
          </span>
          {!(kos.tersedia ?? true) && (
            <span className="bg-red-500 text-white px-5 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/10">
              Penuh
            </span>
          )}
        </div>

        {/* Comparison Button */}
        {showCompare && onCompareToggle && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompareToggle();
            }}
            className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center border transition-all z-10 cursor-pointer shadow-md ${
              isCompared
                ? "bg-brand-accent border-brand-accent text-white"
                : "bg-white/20 dark:bg-card/20 backdrop-blur-md text-white border-white/20 hover:bg-white dark:hover:bg-foreground hover:text-brand-primary dark:hover:text-primary-foreground"
            }`}
            title="Bandingkan Kos"
          >
            <GitCompare size={20} />
          </motion.button>
        )}

        {/* Location & Rating Overlay */}
        <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-brand-accent" />
            <span className="text-sm font-medium tracking-tight truncate max-w-[150px]">
              {kos.daerah.charAt(0).toUpperCase() + kos.daerah.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-brand-accent text-brand-accent" />
            <span className="text-sm font-bold">{kos.rating}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 space-y-8 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <Link to="/kos/$id" params={{ id: kos.id }} className="block">
            <h4 className="font-display font-bold text-2xl text-foreground leading-tight group-hover:text-brand-accent transition-colors">
              {kos.nama}
            </h4>
          </Link>
          <div className="flex flex-wrap gap-2">
            {kos.fasilitas.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border/50"
              >
                {tag}
              </span>
            ))}
            {kos.fasilitas.length > 3 && (
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground bg-secondary/60 px-2 py-1.5 rounded-lg border border-border/30">
                +{kos.fasilitas.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Link */}
        <div className="pt-6 border-t border-border flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Mulai Harga
            </p>
            <p className="text-2xl font-display font-bold text-foreground leading-none">
              {priceMain}
              <span className="text-xs font-normal text-muted-foreground ml-1 italic">/ bln</span>
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
            <Link
              to="/kos/$id"
              params={{ id: kos.id }}
              className="w-14 h-14 bg-secondary rounded-[1.75rem] flex items-center justify-center text-foreground hover:bg-brand-accent hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <ArrowRight size={24} />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
