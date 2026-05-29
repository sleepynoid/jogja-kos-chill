import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { BatikPattern } from "@/components/site/Ornaments";
import { getMitraProfileFn, submitVerificationFn } from "@/lib/mitra.server";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/verifikasi")({
  beforeLoad: async () => {
    try {
      const profile = await getMitraProfileFn();
      if (profile.is_verified) {
        throw redirect({ to: "/dashboard" });
      }
    } catch {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
    const profile = await getMitraProfileFn();
    return { profile };
  },
  head: () => ({
    meta: [
      { title: "Verifikasi Kemitraan — Keep n Sleep" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifikasiPage,
});

function VerifikasiPage() {
  const { profile } = Route.useLoaderData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    ktp_pemilik: profile?.ktp_pemilik ?? "",
    nib: profile?.nib ?? "",
  });

  const [ktpError, setKtpError] = useState<string | null>(null);

  const handleKtpChange = (val: string) => {
    const numericVal = val.replace(/\D/g, "").slice(0, 16);
    setForm((f) => ({ ...f, ktp_pemilik: numericVal }));

    if (numericVal.length > 0 && numericVal.length < 16) {
      setKtpError("Nomor KTP harus terdiri dari 16 digit angka.");
    } else {
      setKtpError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ktp_pemilik || !form.nib) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    if (form.ktp_pemilik.length !== 16) {
      setKtpError("Nomor KTP harus terdiri dari 16 digit angka.");
      toast.error("Nomor KTP tidak valid.");
      return;
    }

    setLoading(true);

    try {
      const result = await submitVerificationFn({
        data: {
          ktp_pemilik: form.ktp_pemilik,
          nib: form.nib,
        },
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Pengajuan verifikasi berhasil dikirim!");
        navigate({ to: "/dashboard" });
      }
    } catch {
      toast.error("Gagal mengirim verifikasi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
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
              Verifikasi Kemitraan 🛡️
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lengkapi data identitas Anda untuk mengaktifkan fitur penambahan kos.
            </p>
          </div>
        </div>
      </div>

      {/* Info Warning */}
      <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 text-xs text-indigo-900/90 dark:border-indigo-900/20 dark:bg-indigo-950/10 flex gap-2.5 items-start">
        <ShieldAlert className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Mengapa ini diperlukan?</span>
          Sebagai perlindungan dari penyalahgunaan dan penipuan listing kos, semua mitra wajib
          melampirkan nomor KTP pemilik yang sah dan NIB sebelum diizinkan menerbitkan listing kos
          di katalog Keep n Sleep. Data Anda dijamin kerahasiaannya.
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nomor KTP Pemilik <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={form.ktp_pemilik}
              onChange={(e) => handleKtpChange(e.target.value)}
              placeholder="3404XXXXXXXXXXXX"
              maxLength={16}
              className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring ${
                ktpError ? "border-destructive focus:ring-destructive/30" : "border-input"
              }`}
            />
            {ktpError && <p className="mt-1 text-[11px] text-destructive">{ktpError}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nomor Induk Berusaha (NIB) <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={form.nib}
              onChange={(e) => setForm({ ...form, nib: e.target.value })}
              placeholder="Masukkan nomor NIB badan usaha atau perorangan"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={loading || !form.ktp_pemilik || !form.nib || form.ktp_pemilik.length !== 16}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Mengirim..." : "Kirim Pengajuan Verifikasi"}
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
