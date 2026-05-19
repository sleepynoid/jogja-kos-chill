import { useState } from "react";
import { X, Check, ArrowRight, GitCompare, Star } from "lucide-react";
import { type Kos, formatRupiah, JENIS_KOS, KAMPUS_LIST, DAERAH_LIST } from "@/lib/kos-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CompareBarProps = {
  selectedItems: Kos[];
  onRemove: (id: string) => void;
  onClear: () => void;
};

export function CompareBar({ selectedItems, onRemove, onClear }: CompareBarProps) {
  const [open, setOpen] = useState(false);

  if (selectedItems.length === 0) return null;

  const allFasilitas = Array.from(
    new Set(selectedItems.flatMap((item) => item.fasilitas))
  );

  const getJenisLabel = (value: string) => {
    return JENIS_KOS.find((j) => j.value === value)?.label ?? value;
  };

  const getKampusLabel = (value: string) => {
    return KAMPUS_LIST.find((c) => c.value === value)?.label ?? value;
  };

  const getDaerahLabel = (value: string) => {
    return DAERAH_LIST.find((d) => d.value === value)?.label ?? value;
  };

  return (
    <>
      {/* Floating Bar at bottom of screen */}
      <div className="fixed bottom-6 left-1/2 z-40 w-full max-w-2xl -translate-x-1/2 px-4 animate-float-slow">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur-md transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GitCompare className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Bandingkan Kos ({selectedItems.length}/3)
              </div>
              <div className="text-[10px] text-muted-foreground">
                Pilih hingga 3 kos untuk dibandingkan side-by-side.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="relative group">
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    className="h-9 w-9 rounded-full border-2 border-background object-cover shadow-sm transition-transform group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow hover:scale-110 active:scale-90 transition-all cursor-pointer"
                    aria-label="Remove"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={selectedItems.length < 2}
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none active:scale-95 cursor-pointer"
            >
              Bandingkan <ArrowRight className="h-3 w-3" />
            </button>
            
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] w-full max-w-5xl overflow-y-auto p-6 transition-colors">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif text-2xl font-bold flex items-center gap-2 text-foreground">
              <GitCompare className="h-6 w-6 text-primary" /> Perbandingan Kos Keep n Sleep
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/80">
                  <th className="w-1/4 pb-4 text-left font-serif text-lg font-semibold text-muted-foreground">Kriteria</th>
                  {selectedItems.map((item) => (
                    <th key={item.id} className="w-1/4 pb-4 px-4 text-left">
                      <div className="relative overflow-hidden rounded-xl bg-secondary/40 p-2">
                        <img
                          src={item.gambar}
                          alt={item.nama}
                          className="h-28 w-full rounded-lg object-cover"
                        />
                        <div className="mt-2 font-serif text-base font-bold text-foreground leading-tight line-clamp-1">{item.nama}</div>
                        <span className="mt-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary capitalize">
                          {getJenisLabel(item.jenis)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {/* Price */}
                <tr>
                  <td className="py-4 font-semibold">Harga Sewa</td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="py-4 px-4 font-bold text-primary text-base">
                      {formatRupiah(item.hargaPerBulan)}
                      <span className="text-xs font-normal text-muted-foreground">/ bln</span>
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr>
                  <td className="py-4 font-semibold">Rating</td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="py-4 px-4">
                      <div className="flex items-center gap-1 font-semibold">
                        <Star className="h-4 w-4 fill-accent text-accent" /> {item.rating}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Daerah / Lokasi */}
                <tr>
                  <td className="py-4 font-semibold">Lokasi / Daerah</td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="py-4 px-4 leading-normal text-muted-foreground">
                      <div className="font-semibold text-foreground">{getDaerahLabel(item.daerah)}</div>
                      <div className="text-xs">{item.alamat}</div>
                    </td>
                  ))}
                </tr>

                {/* Kampus Terdekat */}
                <tr>
                  <td className="py-4 font-semibold">Kampus Terdekat</td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="py-4 px-4 text-xs space-y-1">
                      {item.kampusTerdekat.map((kampus) => (
                        <div key={kampus} className="inline-block rounded bg-secondary/80 px-2 py-0.5 font-medium text-foreground mr-1">
                          {getKampusLabel(kampus)}
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>

                {/* Ketersediaan */}
                <tr>
                  <td className="py-4 font-semibold">Status Ketersediaan</td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="py-4 px-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        (item.tersedia ?? true)
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {(item.tersedia ?? true) ? "Tersedia" : "Penuh (Waiting List)"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Fasilitas Check Grid */}
                {allFasilitas.map((fasilitas) => (
                  <tr key={fasilitas}>
                    <td className="py-3 text-muted-foreground">{fasilitas}</td>
                    {selectedItems.map((item) => {
                      const hasFasilitas = item.fasilitas.includes(fasilitas);
                      return (
                        <td key={item.id} className="py-3 px-4">
                          {hasFasilitas ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                              <Check className="h-3 w-3" />
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30 dark:text-muted-foreground/20">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Deskripsi */}
                <tr>
                  <td className="py-4 font-semibold">Deskripsi</td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="py-4 px-4 text-xs leading-relaxed text-muted-foreground">
                      <p className="line-clamp-3">{item.deskripsi}</p>
                    </td>
                  ))}
                </tr>

                {/* Action CTA */}
                <tr>
                  <td className="py-4"></td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="py-4 px-4">
                      <a
                        href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                          (item.tersedia ?? true)
                            ? `Halo, saya tertarik dengan kos "${item.nama}". Apakah masih tersedia?`
                            : `Halo, saya ingin masuk ke waiting list untuk kos "${item.nama}".`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex w-full items-center justify-center rounded-xl py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 ${
                          (item.tersedia ?? true)
                            ? "bg-[#25D366] hover:bg-[#1ebe5d]"
                            : "bg-amber-600 hover:bg-amber-700"
                        }`}
                      >
                        {(item.tersedia ?? true) ? "Hubungi Pemilik" : "Hubungi Waiting List"}
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
