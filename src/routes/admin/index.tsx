import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle, Clock, ShieldCheck, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRupiah } from "@/lib/kos-data";
import { adminGetAllKosFn, adminApproveKosFn, type AdminKos } from "@/lib/kos.server";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const result = await adminGetAllKosFn();
    return { kosList: result.data ?? [] };
  },
  head: () => ({
    meta: [{ title: "Admin Panel — Keep n Sleep" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminIndexPage,
});

function AdminIndexPage() {
  const { kosList } = Route.useLoaderData();
  return <AdminDashboard kosList={kosList} />;
}

/* ---------------- Dashboard ---------------- */

function AdminDashboard({ kosList }: { kosList: AdminKos[] }) {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<{
    kos: AdminKos;
    approved: boolean;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const pending = kosList.filter((k) => k.is_approved === null);
  const approved = kosList.filter((k) => k.is_approved === true);
  const rejected = kosList.filter((k) => k.is_approved === false);

  const totalPages = Math.ceil(kosList.length / perPage);
  const paginatedList = kosList.slice((page - 1) * perPage, page * perPage);

  const handleApprove = async (kos: AdminKos, approved: boolean) => {
    setConfirmAction({ kos, approved });
  };

  const confirmApprove = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    try {
      const result = await adminApproveKosFn({
        data: { kos_uuid: confirmAction.kos.uuid, approved: confirmAction.approved },
      });
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          confirmAction.approved
            ? `${confirmAction.kos.nama} berhasil disetujui.`
            : `${confirmAction.kos.nama} berhasil ditolak.`,
        );
        router.invalidate();
      }
    } catch {
      toast.error("Gagal memproses.");
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin Panel</p>
          <h1 className="font-serif text-3xl font-bold">Admin Panel 🛡️</h1>
          <p className="text-sm text-muted-foreground">
            Verifikasi dan kelola listing kos yang masuk.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Menunggu"
          value={String(pending.length)}
          sub="Menunggu verifikasi"
          colorClass="text-amber-500 bg-amber-500/10"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Disetujui"
          value={String(approved.length)}
          sub="Kos aktif di katalog"
          colorClass="text-emerald-600 bg-emerald-500/10"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Ditolak"
          value={String(rejected.length)}
          sub="Listing ditolak"
          colorClass="text-rose-600 bg-rose-500/10"
        />
      </div>

      {/* Pending list */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="font-serif text-lg font-bold">Kos Menunggu Verifikasi</h2>
            <p className="text-xs text-muted-foreground">{pending.length} kos perlu ditinjau</p>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Kos</TableHead>
                <TableHead className="text-left">Mitra</TableHead>
                <TableHead className="text-left">Daerah</TableHead>
                <TableHead className="text-center">KTP Pemilik</TableHead>
                <TableHead className="text-center">NIB</TableHead>
                <TableHead className="text-center">Harga / bln</TableHead>
                <TableHead className="text-center">Tanggal Submit</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((k) => (
                <KosRow key={k.uuid} kos={k} onApprove={handleApprove} />
              ))}
              {pending.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck className="h-8 w-8 text-emerald-500" />
                      <span>Tidak ada kos yang menunggu verifikasi.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="grid gap-4 p-5 md:hidden">
          {pending.map((k) => (
            <KosMobileCard key={k.uuid} kos={k} onApprove={handleApprove} />
          ))}
          {pending.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
              <span>Tidak ada kos yang menunggu verifikasi.</span>
            </div>
          )}
        </div>
      </div>

      {/* All kos list */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="p-5">
          <h2 className="font-serif text-lg font-bold">Semua Listing</h2>
          <p className="text-xs text-muted-foreground">{kosList.length} total kos</p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Kos</TableHead>
                <TableHead className="text-left">Mitra</TableHead>
                <TableHead className="text-left">Daerah</TableHead>
                <TableHead className="text-center">KTP Pemilik</TableHead>
                <TableHead className="text-center">NIB</TableHead>
                <TableHead className="text-center">Harga / bln</TableHead>
                <TableHead className="text-center">Tanggal Submit</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedList.map((k) => (
                <KosRow key={k.uuid} kos={k} onApprove={handleApprove} showStatus />
              ))}
              {kosList.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Belum ada kos terdaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}

        {/* Mobile View */}
        <div className="grid gap-4 p-5 md:hidden">
          {paginatedList.map((k) => (
            <KosMobileCard key={k.uuid} kos={k} onApprove={handleApprove} showStatus />
          ))}
          {kosList.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Belum ada kos terdaftar.
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.approved ? "Setujui kos?" : "Tolak kos?"}</DialogTitle>
            <DialogDescription>
              {confirmAction?.approved
                ? `Kos "${confirmAction?.kos.nama}" akan tampil di katalog publik.`
                : `Kos "${confirmAction?.kos.nama}" tidak akan tampil di katalog.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmAction(null)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Batal
            </button>
            <button
              onClick={confirmApprove}
              disabled={processing}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                confirmAction?.approved
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-destructive hover:bg-destructive/90"
              }`}
            >
              {processing ? "Memproses..." : confirmAction?.approved ? "Ya, Setujui" : "Ya, Tolak"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Kos Row ---------------- */

function KosRow({
  kos,
  onApprove,
  showStatus = false,
}: {
  kos: AdminKos;
  onApprove: (kos: AdminKos, approved: boolean) => void;
  showStatus?: boolean;
}) {
  const daerahObj = Array.isArray(kos.daerah) ? kos.daerah[0] : kos.daerah;
  const mitraObj = Array.isArray(kos.mitra) ? kos.mitra[0] : kos.mitra;
  const tanggal = new Date(kos.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3 max-w-[220px]">
          {kos.gambar && (
            <img src={kos.gambar} alt={kos.nama} className="h-10 w-14 shrink-0 rounded-md object-cover" />
          )}
          <div className="leading-tight min-w-0">
            <div className="font-medium break-words">{kos.nama}</div>
            <div className="text-xs text-muted-foreground break-words">{kos.alamat}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{mitraObj?.nama ?? "-"}</div>
        <div className="text-xs text-muted-foreground">{mitraObj?.email ?? ""}</div>
      </TableCell>
      <TableCell>{daerahObj?.nama ?? "-"}</TableCell>
      <TableCell className="text-center font-mono text-xs">{kos.ktp_pemilik ?? "-"}</TableCell>
      <TableCell className="text-center font-mono text-xs">{kos.nib ?? "-"}</TableCell>
      <TableCell className="text-center font-medium">{formatRupiah(kos.harga_per_bulan)}</TableCell>
      <TableCell className="text-center text-sm text-muted-foreground">{tanggal}</TableCell>
      {showStatus && (
        <TableCell className="text-center">
          <ApprovalBadge status={kos.is_approved} />
        </TableCell>
      )}
      <TableCell className="text-center">
        <div className="inline-flex items-center gap-2">
          {kos.is_approved !== true && (
            <button
              onClick={() => onApprove(kos, true)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Setujui
            </button>
          )}
          {kos.is_approved !== false && (
            <button
              onClick={() => onApprove(kos, false)}
              className="rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Tolak
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ---------------- Approval Badge ---------------- */

function ApprovalBadge({ status }: { status: boolean | null }) {
  if (status === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
        Menunggu
      </span>
    );
  }
  if (status === true) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
        Disetujui
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
      Ditolak
    </span>
  );
}

/* ---------------- Stat Card ---------------- */

function StatCard({
  icon,
  label,
  value,
  sub,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
          {icon}
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

/* ---------------- Kos Mobile Card ---------------- */

function KosMobileCard({
  kos,
  onApprove,
  showStatus = false,
}: {
  kos: AdminKos;
  onApprove: (kos: AdminKos, approved: boolean) => void;
  showStatus?: boolean;
}) {
  const daerahObj = Array.isArray(kos.daerah) ? kos.daerah[0] : kos.daerah;
  const mitraObj = Array.isArray(kos.mitra) ? kos.mitra[0] : kos.mitra;
  const tanggal = new Date(kos.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
      {/* Top section: image + details */}
      <div className="flex gap-3">
        {kos.gambar && (
          <img
            src={kos.gambar}
            alt={kos.nama}
            className="h-16 w-20 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-base line-clamp-1">{kos.nama}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{kos.alamat}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-primary font-medium">
            <span>{daerahObj?.nama ?? "-"}</span>
            <span className="text-muted-foreground">•</span>
            <span>{formatRupiah(kos.harga_per_bulan)}/bln</span>
          </div>
        </div>
      </div>

      {/* Middle section: Mitra & Date */}
      <div className="flex justify-between items-center border-t border-border/60 pt-2.5 text-xs">
        <div>
          <div className="font-medium text-foreground">{mitraObj?.nama ?? "-"}</div>
          <div className="text-muted-foreground text-[10px]">{mitraObj?.email ?? ""}</div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground">Submit:</div>
          <div className="font-medium text-foreground">{tanggal}</div>
        </div>
      </div>

      {/* Bottom section: Actions & Status */}
      {(showStatus || kos.is_approved === null) && (
        <div className="flex items-center justify-between border-t border-border/60 pt-2.5 gap-2">
          {showStatus && <ApprovalBadge status={kos.is_approved} />}

          <div className="flex gap-2 ml-auto">
            {kos.is_approved !== true && (
              <button
                onClick={() => onApprove(kos, true)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Setujui
              </button>
            )}
            {kos.is_approved !== false && (
              <button
                onClick={() => onApprove(kos, false)}
                className="rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground active:scale-95 transition-all"
              >
                Tolak
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
