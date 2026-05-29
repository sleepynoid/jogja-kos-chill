import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Heart, Pencil, Plus, Star, Trash2, TrendingUp, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/kos-data";
import { getMitraKosFn, deleteKosFn, toggleKosTersediaFn, type MitraKos } from "@/lib/kos.server";
import { getMitraProfileFn } from "@/lib/mitra.server";
import { toast } from "sonner";

export interface MitraProfile {
  uuid: string;
  nama: string;
  email: string;
  is_verified: boolean;
  ktp_pemilik: string | null;
  nib: string | null;
  is_premium: boolean;
}

export const Route = createFileRoute("/dashboard/")({
  loader: async () => {
    const [kosResult, profileResult] = await Promise.all([getMitraKosFn(), getMitraProfileFn()]);
    return {
      kosList: kosResult.data ?? [],
      profile: profileResult as unknown as MitraProfile,
    };
  },
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
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const { kosList, profile } = Route.useLoaderData();
  return <Dashboard kosList={kosList} profile={profile} />;
}

/* ---------------- Dashboard ---------------- */

function Dashboard({ kosList, profile }: { kosList: MitraKos[]; profile: MitraProfile }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState<MitraKos | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const result = await deleteKosFn({ data: { kos_uuid: confirmDelete.uuid } });
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${confirmDelete.nama} berhasil dihapus.`);
        router.invalidate();
      }
    } catch {
      toast.error("Gagal menghapus kos.");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleToggleTersedia = async (kos: MitraKos) => {
    try {
      const result = await toggleKosTersediaFn({ data: { kos_uuid: kos.uuid } });
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status ${kos.nama} berhasil diubah!`);
        router.invalidate();
      }
    } catch {
      toast.error("Gagal mengubah status.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Dashboard Mitra
            </p>
            {profile.is_verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> Terverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                🔒 Belum Verifikasi
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl font-bold flex items-center gap-2 mt-1">
            Dashboard Mitra 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Pantau performa dan kelola kos Anda di sini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {profile.is_verified ? (
            <Link
              to="/dashboard/tambah-kos"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Tambah Kos
            </Link>
          ) : (
            <button
              disabled
              title="Akun harus terverifikasi untuk menambah kos."
              className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground cursor-not-allowed opacity-60"
            >
              <Plus className="h-4 w-4" /> Tambah Kos
            </button>
          )}
        </div>
      </div>

      {/* Verification conditional banners */}
      {!profile.is_verified && (!profile.ktp_pemilik || !profile.nib) && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/30 dark:bg-amber-950/15">
          <div className="flex gap-3">
            <span className="text-2xl mt-0.5">🔒</span>
            <div>
              <h3 className="font-serif text-base font-bold text-amber-900 dark:text-amber-300">
                Lengkapi Verifikasi Akun
              </h3>
              <p className="text-xs text-amber-800/85 dark:text-amber-400/80 mt-0.5">
                Anda belum melengkapi KTP & NIB. Verifikasi akun diperlukan sebelum Anda dapat
                menambah listing kos baru untuk mencegah penyalahgunaan sistem.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/verifikasi"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors shadow-sm active:scale-95"
          >
            Ajukan Verifikasi Sekarang →
          </Link>
        </div>
      )}

      {!profile.is_verified && profile.ktp_pemilik && profile.nib && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900/30 dark:bg-indigo-950/15">
          <span className="text-2xl mt-0.5">⏳</span>
          <div>
            <h3 className="font-serif text-base font-bold text-indigo-950 dark:text-indigo-300">
              Verifikasi Sedang Diproses
            </h3>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-400/80 mt-0.5">
              Data KTP & NIB Anda sudah dikirim dan sedang dalam proses peninjauan oleh tim admin.
              Kami akan segera memperbarui status akun Anda.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Total Kos"
          value={String(kosList.length)}
          sub="Listing aktif Anda"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Tersedia"
          value={String(kosList.filter((k) => k.tersedia).length)}
          sub="Kos yang masih tersedia"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Penuh"
          value={String(kosList.filter((k) => !k.tersedia).length)}
          sub="Kos yang sudah penuh"
        />
      </div>

      {/* CRUD Table */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="font-serif text-lg font-bold">Daftar Kos Anda</h2>
            <p className="text-xs text-muted-foreground">{kosList.length} kos terdaftar</p>
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
                <TableHead className="text-right">Fasilitas</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Ketersediaan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kosList.map((k) => (
                <TableRow key={k.uuid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {k.gambar && (
                        <img
                          src={k.gambar}
                          alt={k.nama}
                          className="h-10 w-14 rounded-md object-cover"
                        />
                      )}
                      <div className="leading-tight">
                        <div className="font-medium">{k.nama}</div>
                        <div className="text-xs text-muted-foreground">{k.alamat}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{k.jenis}</TableCell>
                  <TableCell>
                    {Array.isArray(k.daerah) ? k.daerah[0]?.nama : (k.daerah?.nama ?? "-")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatRupiah(k.harga_per_bulan)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {Number(k.rating).toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {k.kos_fasilitas?.length ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <ApprovalBadge
                      status={(k as unknown as { is_approved: boolean | null }).is_approved}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleToggleTersedia(k)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer ${
                        k.tersedia
                          ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                          : "bg-destructive/15 text-destructive hover:bg-destructive/25"
                      }`}
                    >
                      {k.tersedia ? "Tersedia" : "Penuh"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to="/dashboard/edit/$uuid"
                        params={{ uuid: k.uuid }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-secondary"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
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
              ))}
              {kosList.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Belum ada kos. Klik "Tambah Kos" untuk mulai.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus kos?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus <strong>{confirmDelete?.nama}</strong> dari listing Anda
              dan tidak bisa dibatalkan.
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
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

/* ---------------- Approval Badge ---------------- */

function ApprovalBadge({ status }: { status: boolean | null | undefined }) {
  if (status === null || status === undefined) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
        Menunggu
      </span>
    );
  }
  if (status === true) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
        Disetujui
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
      Ditolak
    </span>
  );
}
