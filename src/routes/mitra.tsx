import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { KAMPUS_LIST, DAERAH_LIST, JENIS_KOS } from "@/lib/kos-data";
import { CheckCircle2, Building2, Users, TrendingUp, ImagePlus, X } from "lucide-react";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/mitra")({
  head: () => ({
    meta: [
      { title: "Daftar Mitra — Keep n Sleep" },
      { name: "description", content: "Daftarkan kosmu di Keep n Sleep dan jangkau ribuan mahasiswa Yogyakarta." },
    ],
  }),
  component: MitraPage,
});

const FASILITAS_OPTIONS = [
  "WiFi", "AC", "Kipas Angin", "Kamar Mandi Dalam", "Air Panas",
  "Laundry", "Dapur Bersama", "Parkir Motor", "Parkir Mobil",
  "CCTV", "Cleaning Service", "Smart TV", "Kulkas", "Mushola",
];

function MitraPage() {
  const [submitted, setSubmitted] = useState(false);
  const [gambar, setGambar] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState<string | null>(null);

  const MAX_FILES = 5;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

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
    setGambar((prev) => [...prev, ...next].slice(0, MAX_FILES));
  };

  const removeGambar = (idx: number) => {
    setGambar((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const [form, setForm] = useState({
    namaKos: "",
    namaPemilik: "",
    email: "",
    telepon: "",
    jenis: "",
    kampus: "",
    daerah: "",
    alamat: "",
    harga: "",
    deskripsi: "",
    fasilitas: [] as string[],
  });

  const toggleFasilitas = (f: string) => {
    setForm((s) => ({
      ...s,
      fasilitas: s.fasilitas.includes(f)
        ? s.fasilitas.filter((x) => x !== f)
        : [...s.fasilitas, f],
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gambar.length === 0) {
      setImgError("Unggah minimal 1 foto kos.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold">Pendaftaran Terkirim</h1>
        <p className="mt-2 text-muted-foreground">
          Terima kasih, <strong>{form.namaPemilik || "Mitra"}</strong>! Tim Keep n Sleep
          akan menghubungi Anda dalam 1×24 jam untuk proses verifikasi {form.namaKos}.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ ...form, namaKos: "" }); }}
          className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Daftarkan kos lain
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "var(--batik-pattern)" }} aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-primary-foreground md:py-20">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Jadi Mitra Keep n Sleep</h1>
          <p className="mt-3 max-w-2xl text-primary-foreground/90">
            Daftarkan kos Anda dan jangkau ribuan mahasiswa dari kampus-kampus terbaik di Yogyakarta.
          </p>
          <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              { icon: Users, value: "10.000+", label: "Calon penghuni aktif" },
              { icon: Building2, value: "500+", label: "Mitra terpercaya" },
              { icon: TrendingUp, value: "95%", label: "Tingkat hunian" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/15 p-4 backdrop-blur">
                <s.icon className="h-5 w-5" />
                <div className="mt-2 font-serif text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-primary-foreground/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-serif text-2xl font-bold">Daftarkan Kos Anda</h2>
          <p className="mt-1 text-sm text-muted-foreground">Lengkapi data di bawah ini. Tim kami akan menghubungi Anda.</p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Input label="Nama Kos" required value={form.namaKos} onChange={(v) => setForm({ ...form, namaKos: v })} />
            <Input label="Nama Pemilik" required value={form.namaPemilik} onChange={(v) => setForm({ ...form, namaPemilik: v })} />
            <Input label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Input label="No. Telepon / WA" required value={form.telepon} onChange={(v) => setForm({ ...form, telepon: v })} />

            <Select label="Jenis Kos" required value={form.jenis} onChange={(v) => setForm({ ...form, jenis: v })}
              placeholder="Pilih jenis kos" options={JENIS_KOS} />
            <Select label="Kampus Terdekat" value={form.kampus} onChange={(v) => setForm({ ...form, kampus: v })}
              placeholder="Pilih kampus" options={KAMPUS_LIST} />
            <Select label="Daerah" value={form.daerah} onChange={(v) => setForm({ ...form, daerah: v })}
              placeholder="Pilih daerah" options={DAERAH_LIST} />
            <Input label="Harga / Bulan (Rp)" type="number" required value={form.harga} onChange={(v) => setForm({ ...form, harga: v })} />

            <div className="md:col-span-2">
              <Input label="Alamat Lengkap" required value={form.alamat} onChange={(v) => setForm({ ...form, alamat: v })} />
            </div>
            <div className="md:col-span-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Deskripsi Kos</span>
                <textarea
                  rows={4}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ceritakan keunggulan kos Anda..."
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Fasilitas Tersedia</div>
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
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Daftarkan Kos Saya
          </button>
        </form>
      </section>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function Select({
  label, value, onChange, options, required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; options: readonly { value: string; label: string }[]; required?: boolean; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      <UiSelect
        value={value || undefined}
        onValueChange={onChange}
        required={required}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder={placeholder ?? "Pilih…"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </UiSelect>
    </label>
  );
}