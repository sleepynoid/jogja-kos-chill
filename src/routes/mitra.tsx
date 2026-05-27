import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Users, TrendingUp, Eye, EyeOff, UserPlus } from "lucide-react";
import { registerFn, getCurrentUser } from "@/lib/auth";
import { BatikPattern, Gunungan } from "@/components/site/Ornaments";
import { toast } from "sonner";

export const Route = createFileRoute("/mitra")({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Daftar Mitra — Keep n Sleep" },
      {
        name: "description",
        content:
          "Daftarkan diri sebagai mitra Keep n Sleep dan jangkau ribuan mahasiswa Yogyakarta.",
      },
    ],
  }),
  component: MitraPage,
});

function MitraPage() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerFn({
        data: { nama, email, password_raw: password, telepon: telepon || undefined },
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Akun berhasil dibuat! Selamat datang.");
        navigate({ to: "/dashboard" });
      }
    } catch {
      toast.error("Gagal mendaftar. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#2F2F2F] pt-28 pb-16 md:py-24 text-white">
        <BatikPattern variant="parang" className="opacity-[0.18]" />

        <div className="absolute right-10 bottom-0 opacity-10 pointer-events-none hidden lg:block">
          <Gunungan className="w-64 h-96 text-brand-accent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <h1 className="font-serif text-4xl font-bold md:text-5xl tracking-tight">
            Jadi Mitra Keep n Sleep
          </h1>
          <p className="mt-3 max-w-2xl text-white/80 text-lg font-light leading-relaxed">
            Daftarkan diri Anda dan jangkau ribuan mahasiswa dari kampus-kampus terbaik di
            Yogyakarta.
          </p>
          <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              { icon: Users, value: "10.000+", label: "Calon penghuni aktif" },
              { icon: Building2, value: "500+", label: "Mitra terpercaya" },
              { icon: TrendingUp, value: "95%", label: "Tingkat hunian" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/10 p-5 backdrop-blur-md border border-white/10 shadow-lg"
              >
                <s.icon className="h-5 w-5 text-brand-accent" />
                <div className="mt-2 font-serif text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register Form */}
      <section className="mx-auto max-w-lg px-4 py-12">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <BatikPattern variant="kawung" className="opacity-[0.08]" />

          <div className="relative z-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Daftar Akun Mitra</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Buat akun untuk mulai mendaftarkan dan mengelola kos Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="nama"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Nama Lengkap <span className="text-destructive">*</span>
                </label>
                <input
                  id="nama"
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="telepon"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  No. Telepon / WA
                </label>
                <input
                  id="telepon"
                  type="tel"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="6281234567890"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Konfirmasi Password <span className="text-destructive">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
