import { MapPin, Star, Wifi, Snowflake, Bath, Shirt, Car, Tv, GitCompare } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Kos } from "@/lib/kos-data";
import { formatRupiah, JENIS_KOS, KAMPUS_LIST } from "@/lib/kos-data";
import { Badge } from "@/components/ui/badge";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  AC: Snowflake,
  "Kamar Mandi Dalam": Bath,
  Laundry: Shirt,
  "Parkir Mobil": Car,
  "Parkir Motor": Car,
  "Smart TV": Tv,
};

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
  const jenisLabel = JENIS_KOS.find((j) => j.value === kos.jenis)?.label;
  const kampusLabels = kos.kampusTerdekat
    .map((k) => KAMPUS_LIST.find((c) => c.value === k)?.label.replace(/\s*\(.*\)/, ""))
    .filter(Boolean);

  return (
    <article className="group animate-fade-up overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-2xl hover:shadow-primary/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={kos.gambar}
          alt={kos.nama}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1">
          <Badge className="bg-primary text-primary-foreground">{jenisLabel}</Badge>
          {!(kos.tersedia ?? true) && (
            <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
              Penuh
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 text-xs font-semibold text-foreground">
          <Star className="h-3 w-3 fill-accent text-accent" />
          {kos.rating}
        </div>

        {showCompare && onCompareToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompareToggle();
            }}
            className={`absolute left-3 bottom-3 flex h-8 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-md backdrop-blur-md transition-all cursor-pointer active:scale-95 ${
              isCompared
                ? "bg-primary border-primary text-primary-foreground scale-105"
                : "bg-background/95 border-border text-foreground hover:bg-background"
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            {isCompared ? "Dibanding" : "Bandingkan"}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">{kos.nama}</h3>
        <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{kos.alamat}</span>
        </div>
        {kampusLabels.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Dekat: <span className="text-foreground">{kampusLabels.join(", ")}</span>
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {kos.fasilitas.slice(0, 4).map((f) => {
            const Icon = ICONS[f] ?? Wifi;
            return (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
              >
                <Icon className="h-3 w-3" /> {f}
              </span>
            );
          })}
          {kos.fasilitas.length > 4 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              +{kos.fasilitas.length - 4} lainnya
            </span>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <div>
            <div className="text-lg font-bold text-primary">{formatRupiah(kos.hargaPerBulan)}</div>
            <div className="text-[10px] text-muted-foreground">per bulan</div>
          </div>
          <Link
            to="/kos/$id"
            params={{ id: kos.id }}
            className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-md active:scale-95"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </article>
  );
}