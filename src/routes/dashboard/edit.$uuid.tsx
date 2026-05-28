import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { KAMPUS_LIST, DAERAH_LIST, JENIS_KOS } from "@/lib/kos-data";
import { BatikPattern } from "@/components/site/Ornaments";
import { uploadKosImages, deleteKosImage } from "@/lib/storage";
import { getKosForEditFn, updateKosFn } from "@/lib/kos.server";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/edit/$uuid")({
  loader: async ({ params }) => {
    const result = await getKosForEditFn({ data: { uuid: params.uuid } });
    if (result.error || !result.data) {
      throw new Error(result.error ?? "Kos tidak ditemukan.");
    }
    return { kos: result.data };
  },
  head: () => ({
    meta: [
      { title: "Edit Kos — Keep n Sleep" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditKosPage,
});

const FASILITAS_OPTIONS = [
  "WiFi",
  "WiFi 100Mbps",
  "WiFi 150Mbps",
  "WiFi 200Mbps",
  "AC",
  "Kipas Angin",
  "Kamar Mandi Dalam",
  "Air Panas",
  "Laundry",
  "Dapur Bersama",
  "Parkir Motor",
  "Parkir Mobil",
  "CCTV",
  "Smart TV",
  "Kulkas",
  "Cleaning Service",
  "Gym",
  "Rooftop",
  "Mushola",
  "Taman",
];

function EditKosPage() {
  const navigate = useNavigate();
  const { kos } = Route.useLoaderData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  // Existing gallery images (already uploaded)
  const [existingImages, setExistingImages] = useState<string[]>(kos.galeri_urls);
  // Track removed URLs to delete from storage on submit
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  // New images to upload
  const [newImages, setNewImages] = useState<{ file: File; url: string }[]>([]);
  const [imgError, setImgError] = useState<string | null>(null);

  const MAX_FILES = 5;
  const MAX_SIZE = 5 * 1024 * 1024;

  const totalImages = existingImages.length + newImages.length;

  const [form, setForm] = useState({
    nama: kos.nama,
    jenis: kos.jenis,
    daerah: kos.daerah_slug,
    alamat: kos.alamat,
    hargaPerBulan: String(kos.harga_per_bulan),
    deskripsi: kos.deskripsi,
    ktpPemilik: kos.ktp_pemilik,
    nib: kos.nib,
    kampusTerdekat: kos.kampus_slugs,
    fasilitas: kos.fasilitas_names,
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setImgError(null);
    const next: { file: File; url: string }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setImgError("Hanya file gambar yang diperbolehkan.");
        continue;
      }
      if (file.size > MAX_SIZE) {
        setImgError("Ukuran maksimum tiap gambar 5MB.");
        continue;
      }
      next.push({ file, url: URL.createObjectURL(file) });
    }
    const available = MAX_FILES - existingImages.length - newImages.length;
    setNewImages((prev) => [...prev, ...next].slice(0, prev.length + available));
  };

  const removeExisting = (idx: number) => {
    const url = existingImages[idx];
    if (url) setRemovedUrls((prev) => [...prev, url]);
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNew = (idx: number) => {
    setNewImages((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const toggleKampus = (slug: string) => {
    setForm((s) => ({
      ...s,
      kampusTerdekat: s.kampusTerdekat.includes(slug)
        ? s.kampusTerdekat.filter((x) => x !== slug)
        : [...s.kampusTerdekat, slug],
    }));
  };

  const toggleFasilitas = (f: string) => {
    setForm((s) => ({
      ...s,
      fasilitas: s.fasilitas.includes(f)
        ? s.fasilitas.filter((x) => x !== f)
        : [...s.fasilitas, f],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalImages === 0) {
      setImgError("Minimal 1 foto kos.");
      return;
    }

    setLoading(true);

    try {
      // Upload new images
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        const user = await getCurrentUser();
        if (!user) {
          toast.error("Sesi habis. Silakan login ulang.");
          navigate({ to: "/login" });
          return;
        }
        toast.info("Mengupload foto baru...");
        uploadedUrls = await uploadKosImages(
          newImages.map((g) => g.file),
          user.uuid,
        );
      }

      // Combine existing + new URLs
      const allUrls = [...existingImages, ...uploadedUrls];

      toast.info("Menyimpan perubahan...");
      const result = await updateKosFn({
        data: {
          uuid: kos.uuid,
          nama: form.nama,
          jenis: form.jenis,
          daerah_slug: form.daerah,
          alamat: form.alamat,
          harga_per_bulan: Number(form.hargaPerBulan),
          deskripsi: form.deskripsi || undefined,
          ktp_pemilik: form.ktpPemilik,
          nib: form.nib,
          kampus_slugs: form.kampusTerdekat,
          fasilitas_names: form.fasilitas,
          gambar_urls: allUrls,
        },
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        // Delete removed images from storage
        if (removedUrls.length > 0) {
          await Promise.all(removedUrls.map((url) => deleteKosImage(url)));
        }
        toast.success("Kos berhasil diperbarui!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan perubahan.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.nama && form.jenis && form.daerah && form.alamat && form.hargaPerBulan && form.ktpPemilik && form.nib && totalImages > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>
        <div className="relative overflow-hidden rounded-2xl bg-secondary/30 p-6 border border-border">
          <BatikPattern variant="kawung" className="opacity-[0.12]" />
          <div className="relative z-10">
            <h1 className="font-serif text-2xl font-bold md:text-3xl text-foreground">
              Edit Kos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Perbarui informasi kos "{kos.nama}".
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-8"
      >
        {/* Informasi Dasar */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Informasi Dasar</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Nama Kos <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Jenis Kos <span className="text-destructive">*</span>
              </label>
              <UiSelect value={form.jenis || undefined} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Pilih jenis kos" />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_KOS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </UiSelect>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Daerah <span className="text-destructive">*</span>
              </label>
              <UiSelect value={form.daerah || undefined} onValueChange={(v) => setForm({ ...form, daerah: v })}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Pilih daerah" />
                </SelectTrigger>
                <SelectContent>
                  {DAERAH_LIST.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </UiSelect>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Alamat Lengkap <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Harga per Bulan (Rp) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={form.hargaPerBulan ? Number(form.hargaPerBulan).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, hargaPerBulan: raw });
                }}
                placeholder="1.250.000"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Deskripsi
              </label>
              <textarea
                rows={4}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                No. KTP Pemilik <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={form.ktpPemilik}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setForm({ ...form, ktpPemilik: raw });
                }}
                maxLength={16}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                NIB (Nomor Induk Berusaha) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nib}
                onChange={(e) => setForm({ ...form, nib: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </section>

        {/* Kampus Terdekat */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-2">Kampus Terdekat</h2>
          <div className="flex flex-wrap gap-2">
            {KAMPUS_LIST.map((k) => {
              const active = form.kampusTerdekat.includes(k.value);
              return (
                <button
                  type="button"
                  key={k.value}
                  onClick={() => toggleKampus(k.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  {active ? "✓ " : ""}{k.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Fasilitas */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-2">Fasilitas</h2>
          <div className="flex flex-wrap gap-2">
            {FASILITAS_OPTIONS.map((f) => {
              const active = form.fasilitas.includes(f);
              return (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggleFasilitas(f)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  {active ? "✓ " : ""}{f}
                </button>
              );
            })}
          </div>
        </section>

        {/* Foto / Galeri */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-2">
            Foto Kos <span className="text-destructive">*</span>
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Maks {MAX_FILES} foto. Foto pertama jadi cover. Klik × untuk hapus.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {/* Existing images */}
            {existingImages.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && existingImages.length > 0 && newImages.length === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeExisting(i)}
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-all hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Hapus foto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* New images */}
            {newImages.map((g, i) => (
              <div key={g.url} className="group relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-primary/40 bg-muted">
                <img src={g.url} alt={`Foto baru ${i + 1}`} className="h-full w-full object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                  Baru
                </span>
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-all hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Hapus foto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {totalImages < MAX_FILES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-secondary hover:text-foreground"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-medium">Tambah foto</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {imgError && <p className="mt-2 text-xs text-destructive">{imgError}</p>}
        </section>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link
            to="/dashboard"
            className="rounded-xl border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
