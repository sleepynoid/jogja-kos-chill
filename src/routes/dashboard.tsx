import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Eye,
  Heart,
  MessageSquare,
  Pencil,
  Plus,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DAERAH_LIST,
  JENIS_KOS,
  KAMPUS_LIST,
  formatRupiah,
  type Kos,
} from "@/lib/kos-data";
import {
  addKos,
  getKosVisitorStats,
  getVisitorTrend,
  removeKos,
  updateKos,
  useKosStore,
  toggleKetersediaanKos,
  useInquiriesStore,
  updateInquiryStatus,
} from "@/lib/kos-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Mitra — Keep n Sleep" },
      {
        name: "description",
        content: "Pantau statistik pengunjung kos dan kelola listing kos Anda.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const kosList = useKosStore();
  return <Dashboard kosList={kosList} />;
}

/* ---------------- Dashboard ---------------- */

function Dashboard({ kosList }: { kosList: Kos[] }) {
  const [selectedId, setSelectedId] = useState<string>(kosList[0]?.id ?? "");
  const [editing, setEditing] = useState<Kos | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Kos | null>(null);
  const inquiries = useInquiriesStore();

  const selected =
    kosList.find((k) => k.id === selectedId) ?? kosList[0] ?? null;

  const aggregate = useMemo(() => {
    let total = 0;
    let minggu = 0;
    let kontak = 0;
    let favorit = 0;
    for (const k of kosList) {
      const s = getKosVisitorStats(k.id);
      total += s.total;
      minggu += s.minggu;
      kontak += s.kontak;
      favorit += s.favorit;
    }
    return { total, minggu, kontak, favorit };
  }, [kosList]);

  const trend = useMemo(
    () => (selected ? getVisitorTrend(selected.id) : []),
    [selected],
  );

  const perKos = useMemo(
    () =>
      kosList.map((k) => ({
        nama: k.nama.length > 14 ? k.nama.slice(0, 13) + "…" : k.nama,
        pengunjung: getKosVisitorStats(k.id).minggu,
      })),
    [kosList],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Dashboard Mitra
          </p>
          <h1 className="font-serif text-3xl font-bold">
            Dashboard Mitra 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Pantau performa dan kelola kos Anda di sini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Tambah Kos
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Total Pengunjung"
          value={aggregate.total.toLocaleString("id-ID")}
          sub="Sejak listing aktif"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Minggu Ini"
          value={aggregate.minggu.toLocaleString("id-ID")}
          sub="+12% vs minggu lalu"
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Kontak Masuk"
          value={aggregate.kontak.toLocaleString("id-ID")}
          sub="Chat & telepon WA"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Favorit"
          value={aggregate.favorit.toLocaleString("id-ID")}
          sub="Disimpan oleh calon penghuni"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg font-bold">Tren Pengunjung</h2>
              <p className="text-xs text-muted-foreground">14 hari terakhir</p>
            </div>
            <div className="w-56">
              <UiSelect
                value={selected?.id ?? ""}
                onValueChange={(v) => setSelectedId(v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Pilih kos" />
                </SelectTrigger>
                <SelectContent>
                  {kosList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </UiSelect>
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="color-mix(in oklab, var(--primary) 50%, transparent)" />
                    <stop offset="100%" stopColor="color-mix(in oklab, var(--primary) 0%, transparent)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pengunjung"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-serif text-lg font-bold">Pengunjung per Kos</h2>
          <p className="text-xs text-muted-foreground">Minggu ini</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perKos} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="nama" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="pengunjung" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CRUD Table */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="font-serif text-lg font-bold">Daftar Kos Anda</h2>
            <p className="text-xs text-muted-foreground">
              {kosList.length} kos terdaftar
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kos</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Daerah</TableHead>
                <TableHead className="text-right">Harga / bln</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Pengunjung</TableHead>
                <TableHead className="text-right">Ketersediaan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kosList.map((k) => {
                const s = getKosVisitorStats(k.id);
                return (
                  <TableRow key={k.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={k.gambar}
                          alt={k.nama}
                          className="h-10 w-14 rounded-md object-cover"
                        />
                        <div className="leading-tight">
                          <div className="font-medium">{k.nama}</div>
                          <div className="text-xs text-muted-foreground">
                            {k.alamat}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{k.jenis}</TableCell>
                    <TableCell>
                      {DAERAH_LIST.find((d) => d.value === k.daerah)?.label ??
                        k.daerah}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRupiah(k.hargaPerBulan)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {k.rating.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.minggu}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => {
                          toggleKetersediaanKos(k.id);
                          toast.success(`Status ${k.nama} berhasil diubah!`);
                        }}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer ${
                          k.tersedia ?? true
                            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                            : "bg-destructive/15 text-destructive hover:bg-destructive/25"
                        }`}
                      >
                        {k.tersedia ?? true ? "Tersedia" : "Penuh"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditing(k)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-secondary"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(k)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {kosList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    Belum ada kos. Klik “Tambah Kos” untuk mulai.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit dialog */}
      <KosFormDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      {/* Delete confirm */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus kos?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus <strong>{confirmDelete?.nama}</strong>{" "}
              dari listing Anda dan tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmDelete(null)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Batal
            </button>
            <button
              onClick={() => {
                if (confirmDelete) removeKos(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inbox Inquiries Section */}
      {/* <div className="mt-8 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-foreground">
              <MessageSquare className="h-5 w-5 text-primary" /> Pertanyaan Masuk ({inquiries.filter((i) => i.status === "pending").length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Simulasi pesan dari calon penghuni melalui WhatsApp / WA Waiting List
            </p>
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {inquiries.map((inq) => (
            <div key={inq.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors hover:bg-secondary/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-foreground">
                  <span className="font-semibold text-sm">{inq.namaCalon}</span>
                  <span className="text-[10px] text-muted-foreground">• {inq.tanggal}</span>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {inq.namaKos}
                  </span>
                  {inq.status === "pending" ? (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                      Menunggu
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      Sudah Dihubungi
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground leading-normal max-w-2xl bg-secondary/30 rounded-xl p-3 border border-border/40">
                  "{inq.pesan}"
                </div>
                <div className="text-[10px] text-muted-foreground">
                  No. Telepon: <span className="font-medium text-foreground">+{inq.telepon}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {inq.status === "pending" && (
                  <button
                    onClick={() => {
                      updateInquiryStatus(inq.id, "dihubungi");
                      toast.success("Status lead diperbarui!");
                    }}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary transition-all cursor-pointer text-foreground"
                  >
                    Tandai Dihubungi
                  </button>
                )}
                <a
                  href={`https://wa.me/${inq.telepon}?text=${encodeURIComponent("Halo " + inq.namaCalon + ", terima kasih telah menghubungi kami mengenai kos " + inq.namaKos + ".")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#25D366] text-white px-3 py-1.5 text-xs font-semibold hover:bg-[#1ebe5d] transition-all flex items-center gap-1 active:scale-95"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Balas WA
                </a>
              </div>
            </div>
          ))}

          {inquiries.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Belum ada pertanyaan masuk dari calon penghuni.
            </div>
          )}
        </div>
      </div>*/}
    </div>
  );
}

/* ---------------- Stat card ---------------- */

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      </div>
      <div className="mt-3 font-serif text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

/* ---------------- Form dialog ---------------- */

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=70";

function KosFormDialog({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial: Kos | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState(() => fromKos(initial));

  // Reset form when dialog opens with a different target.
  useMemoReset(open, initial, () => setForm(fromKos(initial)));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nama: form.nama.trim(),
      jenis: form.jenis as Kos["jenis"],
      kampusTerdekat: form.kampus ? [form.kampus] : [],
      daerah: form.daerah,
      alamat: form.alamat.trim(),
      hargaPerBulan: Number(form.harga) || 0,
      fasilitas: form.fasilitas
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      gambar: form.gambar.trim() || DEFAULT_IMG,
      deskripsi: form.deskripsi.trim(),
    };
    if (initial) {
      updateKos(initial.id, payload);
    } else {
      addKos(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Kos" : "Tambah Kos Baru"}</DialogTitle>
          <DialogDescription>
            Lengkapi informasi kos. Data tersimpan di perangkat ini (demo).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <DialogField label="Nama Kos" full>
            <input
              required
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className={inputCls}
            />
          </DialogField>
          <DialogField label="Jenis Kos">
            <UiSelect
              value={form.jenis || undefined}
              onValueChange={(v) => setForm({ ...form, jenis: v })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Pilih jenis" />
              </SelectTrigger>
              <SelectContent>
                {JENIS_KOS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </DialogField>
          <DialogField label="Daerah">
            <UiSelect
              value={form.daerah || undefined}
              onValueChange={(v) => setForm({ ...form, daerah: v })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Pilih daerah" />
              </SelectTrigger>
              <SelectContent>
                {DAERAH_LIST.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </DialogField>
          <DialogField label="Kampus Terdekat">
            <UiSelect
              value={form.kampus || undefined}
              onValueChange={(v) => setForm({ ...form, kampus: v })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Pilih kampus" />
              </SelectTrigger>
              <SelectContent>
                {KAMPUS_LIST.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </DialogField>
          <DialogField label="Harga / Bulan (Rp)">
            <input
              type="number"
              required
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: e.target.value })}
              className={inputCls}
            />
          </DialogField>
          <DialogField label="Alamat" full>
            <input
              required
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className={inputCls}
            />
          </DialogField>
          <DialogField label="URL Gambar Utama" full>
            <input
              value={form.gambar}
              onChange={(e) => setForm({ ...form, gambar: e.target.value })}
              placeholder={DEFAULT_IMG}
              className={inputCls}
            />
          </DialogField>
          <DialogField label="Fasilitas (pisahkan dengan koma)" full>
            <input
              value={form.fasilitas}
              onChange={(e) => setForm({ ...form, fasilitas: e.target.value })}
              placeholder="WiFi, AC, Kamar Mandi Dalam"
              className={inputCls}
            />
          </DialogField>
          <DialogField label="Deskripsi" full>
            <textarea
              rows={3}
              value={form.deskripsi}
              onChange={(e) =>
                setForm({ ...form, deskripsi: e.target.value })
              }
              className={inputCls}
            />
          </DialogField>

          <DialogFooter className="md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {initial ? "Simpan Perubahan" : "Tambah Kos"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function DialogField({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function fromKos(k: Kos | null) {
  return {
    nama: k?.nama ?? "",
    jenis: k?.jenis ?? "",
    kampus: k?.kampusTerdekat?.[0] ?? "",
    daerah: k?.daerah ?? "",
    alamat: k?.alamat ?? "",
    harga: k ? String(k.hargaPerBulan) : "",
    fasilitas: (k?.fasilitas ?? []).join(", "),
    gambar: k?.gambar ?? "",
    deskripsi: k?.deskripsi ?? "",
  };
}

// Re-runs `fn` whenever `open` flips true OR `initial` identity changes.
function useMemoReset(open: boolean, initial: Kos | null, fn: () => void) {
  const key = `${open ? "1" : "0"}::${initial?.id ?? "new"}`;
  useMemo(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}