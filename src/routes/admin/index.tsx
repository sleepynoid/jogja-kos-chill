import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle,
  Clock,
  ShieldCheck,
  XCircle,
  Users,
  AlertCircle,
  FileText,
} from "lucide-react";
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
import { adminGetAllMitraFn, adminVerifyMitraFn } from "@/lib/mitra.server";
import { toast } from "sonner";

export interface AdminMitra {
  uuid: string;
  nama: string;
  email: string;
  is_verified: boolean;
  ktp_pemilik: string | null;
  nib: string | null;
  created_at: string;
  jumlah_kos: number;
}

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [kosResult, mitraResult] = await Promise.all([adminGetAllKosFn(), adminGetAllMitraFn()]);
    return {
      kosList: kosResult.data ?? [],
      mitraList: (mitraResult as unknown as AdminMitra[]) ?? [],
    };
  },
  head: () => ({
    meta: [{ title: "Admin Panel — Keep n Sleep" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminIndexPage,
});

function AdminIndexPage() {
  const { kosList, mitraList } = Route.useLoaderData();
  return <AdminDashboard kosList={kosList} mitraList={mitraList} />;
}

/* ---------------- Dashboard ---------------- */

function AdminDashboard({ kosList, mitraList }: { kosList: AdminKos[]; mitraList: AdminMitra[] }) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<"kos" | "mitra">("kos");

  // Kos states
  const [confirmAction, setConfirmAction] = useState<{
    kos: AdminKos;
    approved: boolean;
  } | null>(null);

  // Mitra states
  const [confirmMitraAction, setConfirmMitraAction] = useState<{
    mitra: AdminMitra;
    verified: boolean;
  } | null>(null);

  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [mitraPage, setMitraPage] = useState(1);
  const perPage = 10;

  // Kos filter
  const pending = kosList.filter((k) => k.is_approved === null);
  const approved = kosList.filter((k) => k.is_approved === true);
  const rejected = kosList.filter((k) => k.is_approved === false);

  const totalPages = Math.ceil(kosList.length / perPage);
  const paginatedList = kosList.slice((page - 1) * perPage, page * perPage);

  // Mitra filter & pagination
  const pendingMitra = mitraList.filter((m) => !m.is_verified && m.ktp_pemilik && m.nib);
  const totalMitraPages = Math.ceil(mitraList.length / perPage);
  const paginatedMitraList = mitraList.slice((mitraPage - 1) * perPage, mitraPage * perPage);

  const handleApprove = async (kos: AdminKos, approved: boolean) => {
    setConfirmAction({ kos, approved });
  };

  const handleVerifyMitra = async (mitra: AdminMitra, verified: boolean) => {
    setConfirmMitraAction({ mitra, verified });
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

  const confirmVerifyMitra = async () => {
    if (!confirmMitraAction) return;
    setProcessing(true);
    try {
      const result = await adminVerifyMitraFn({
        data: {
          mitra_uuid: confirmMitraAction.mitra.uuid,
          verified: confirmMitraAction.verified,
        },
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          confirmMitraAction.verified
            ? `Mitra "${confirmMitraAction.mitra.nama}" berhasil diverifikasi.`
            : `Verifikasi mitra "${confirmMitraAction.mitra.nama}" dibatalkan.`,
        );
        router.invalidate();
      }
    } catch {
      toast.error("Gagal memproses verifikasi.");
    } finally {
      setProcessing(false);
      setConfirmMitraAction(null);
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
            Verifikasi dan kelola listing kos serta kemitraan pemilik kos.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-4">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Kos Menunggu"
          value={String(pending.length)}
          sub="Kos perlu ditinjau"
          colorClass="text-amber-500 bg-amber-500/10"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Mitra Menunggu"
          value={String(pendingMitra.length)}
          sub="Mitra butuh verifikasi"
          colorClass="text-indigo-500 bg-indigo-500/10"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Total Kos Aktif"
          value={String(approved.length)}
          sub="Kos aktif di katalog"
          colorClass="text-emerald-600 bg-emerald-500/10"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Mitra"
          value={String(mitraList.length)}
          sub="Mitra terdaftar"
          colorClass="text-blue-600 bg-blue-500/10"
        />
      </div>

      {/* Tab Navigation */}
      <div className="mt-8 flex gap-6 border-b border-border pb-px">
        <button
          onClick={() => setCurrentTab("kos")}
          className={`pb-3 text-sm font-medium transition-all relative ${
            currentTab === "kos"
              ? "text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Persetujuan Kos ({pending.length > 0 ? `${pending.length} baru` : "Semua"})
          {currentTab === "kos" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setCurrentTab("mitra")}
          className={`pb-3 text-sm font-medium transition-all relative ${
            currentTab === "mitra"
              ? "text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Kemitraan & Verifikasi (
          {pendingMitra.length > 0 ? `${pendingMitra.length} pending` : "Semua"})
          {currentTab === "mitra" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {currentTab === "kos" ? (
        <>
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
        </>
      ) : (
        <>
          {/* Mitra List */}
          <div className="mt-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between p-5">
              <div>
                <h2 className="font-serif text-lg font-bold">Verifikasi & Status Mitra</h2>
                <p className="text-xs text-muted-foreground">
                  {pendingMitra.length} mitra menunggu verifikasi identitas
                </p>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Nama Mitra</TableHead>
                    <TableHead className="text-left">Kontak & Email</TableHead>
                    <TableHead className="text-center">KTP Pemilik</TableHead>
                    <TableHead className="text-center">NIB</TableHead>
                    <TableHead className="text-center">Jumlah Kos</TableHead>
                    <TableHead className="text-center">Tanggal Daftar</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMitraList.map((m) => (
                    <MitraRow key={m.uuid} mitra={m} onVerify={handleVerifyMitra} />
                  ))}
                  {mitraList.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Belum ada mitra terdaftar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalMitraPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <p className="text-xs text-muted-foreground">
                  Halaman {mitraPage} dari {totalMitraPages}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMitraPage((p) => Math.max(1, p - 1))}
                    disabled={mitraPage === 1}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: totalMitraPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setMitraPage(p)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        p === mitraPage
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-secondary"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setMitraPage((p) => Math.min(totalMitraPages, p + 1))}
                    disabled={mitraPage === totalMitraPages}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}

            {/* Mobile View */}
            <div className="grid gap-4 p-5 md:hidden">
              {paginatedMitraList.map((m) => (
                <MitraMobileCard key={m.uuid} mitra={m} onVerify={handleVerifyMitra} />
              ))}
              {mitraList.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada mitra terdaftar.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Confirm dialog Kos */}
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

      {/* Confirm dialog Mitra */}
      <Dialog open={!!confirmMitraAction} onOpenChange={(o) => !o && setConfirmMitraAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmMitraAction?.verified ? "Verifikasi Mitra?" : "Batalkan Verifikasi?"}
            </DialogTitle>
            <DialogDescription>
              {confirmMitraAction?.verified
                ? `Mitra "${confirmMitraAction?.mitra.nama}" akan terverifikasi dan dapat mempublikasikan kos.`
                : `Batalkan verifikasi untuk "${confirmMitraAction?.mitra.nama}". Mitra tidak dapat mempublikasikan kos baru sebelum diverifikasi kembali.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmMitraAction(null)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Batal
            </button>
            <button
              onClick={confirmVerifyMitra}
              disabled={processing}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                confirmMitraAction?.verified
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-destructive hover:bg-destructive/90"
              }`}
            >
              {processing
                ? "Memproses..."
                : confirmMitraAction?.verified
                  ? "Ya, Verifikasi"
                  : "Ya, Batalkan"}
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
            <img
              src={kos.gambar}
              alt={kos.nama}
              className="h-10 w-14 shrink-0 rounded-md object-cover"
            />
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
      {/* PII Masking: Masked KTP shown in UI */}
      <TableCell className="text-center font-mono text-xs">
        {kos.ktp_pemilik
          ? `${kos.ktp_pemilik.slice(0, 4)}**********${kos.ktp_pemilik.slice(-2)}`
          : "-"}
      </TableCell>
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

/* ---------------- Mitra Row ---------------- */

function MitraRow({
  mitra,
  onVerify,
}: {
  mitra: AdminMitra;
  onVerify: (mitra: AdminMitra, verified: boolean) => void;
}) {
  const tanggal = new Date(mitra.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TableRow>
      <TableCell className="font-semibold">{mitra.nama}</TableCell>
      <TableCell>
        <span className="text-sm block">{mitra.email}</span>
      </TableCell>
      {/* PII Masking: Masked KTP shown in UI */}
      <TableCell className="text-center font-mono text-xs">
        {mitra.ktp_pemilik
          ? `${mitra.ktp_pemilik.slice(0, 4)}**********${mitra.ktp_pemilik.slice(-2)}`
          : "—"}
      </TableCell>
      <TableCell className="text-center font-mono text-xs">{mitra.nib ?? "—"}</TableCell>
      <TableCell className="text-center font-semibold text-sm">{mitra.jumlah_kos} kos</TableCell>
      <TableCell className="text-center text-sm text-muted-foreground">{tanggal}</TableCell>
      <TableCell className="text-center">
        <MitraStatusBadge
          isVerified={mitra.is_verified}
          hasSubmitted={!!(mitra.ktp_pemilik && mitra.nib)}
        />
      </TableCell>
      <TableCell className="text-center">
        <div className="inline-flex items-center gap-2">
          {!mitra.is_verified ? (
            <button
              onClick={() => onVerify(mitra, true)}
              disabled={!(mitra.ktp_pemilik && mitra.nib)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Verifikasi
            </button>
          ) : (
            <button
              onClick={() => onVerify(mitra, false)}
              className="rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Batalkan
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ---------------- Mitra Status Badge ---------------- */

function MitraStatusBadge({
  isVerified,
  hasSubmitted,
}: {
  isVerified: boolean;
  hasSubmitted: boolean;
}) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
        ✅ Verified
      </span>
    );
  }
  if (hasSubmitted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 animate-pulse">
        ⏳ Menunggu
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
      🔒 Belum Submit
    </span>
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

      <div className="flex justify-between items-center border-t border-border/60 pt-2.5 text-xs">
        <div>
          <span className="text-muted-foreground">KTP: </span>
          <span className="font-mono text-[11px] font-semibold text-foreground">
            {kos.ktp_pemilik
              ? `${kos.ktp_pemilik.slice(0, 4)}**********${kos.ktp_pemilik.slice(-2)}`
              : "-"}
          </span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground">NIB: </span>
          <span className="font-mono text-[11px] font-semibold text-foreground">
            {kos.nib ?? "-"}
          </span>
        </div>
      </div>

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

/* ---------------- Mitra Mobile Card ---------------- */

function MitraMobileCard({
  mitra,
  onVerify,
}: {
  mitra: AdminMitra;
  onVerify: (mitra: AdminMitra, verified: boolean) => void;
}) {
  const tanggal = new Date(mitra.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-base">{mitra.nama}</div>
          <div className="text-xs text-muted-foreground">{mitra.email}</div>
        </div>
        <MitraStatusBadge
          isVerified={mitra.is_verified}
          hasSubmitted={!!(mitra.ktp_pemilik && mitra.nib)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2.5 text-xs">
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase">KTP Pemilik</span>
          <span className="font-mono font-semibold text-foreground">
            {mitra.ktp_pemilik
              ? `${mitra.ktp_pemilik.slice(0, 4)}**********${mitra.ktp_pemilik.slice(-2)}`
              : "—"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase">NIB</span>
          <span className="font-mono font-semibold text-foreground">{mitra.nib ?? "—"}</span>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-border/60 pt-2.5 text-xs">
        <div>
          <span className="text-muted-foreground">Jumlah Kos: </span>
          <span className="font-bold text-foreground">{mitra.jumlah_kos}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Daftar: </span>
          <span className="font-medium text-foreground">{tanggal}</span>
        </div>
      </div>

      <div className="flex justify-end border-t border-border/60 pt-2.5 gap-2">
        {!mitra.is_verified ? (
          <button
            onClick={() => onVerify(mitra, true)}
            disabled={!(mitra.ktp_pemilik && mitra.nib)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            Verifikasi
          </button>
        ) : (
          <button
            onClick={() => onVerify(mitra, false)}
            className="rounded-lg border border-destructive px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground active:scale-95 transition-all"
          >
            Batalkan Verifikasi
          </button>
        )}
      </div>
    </div>
  );
}
