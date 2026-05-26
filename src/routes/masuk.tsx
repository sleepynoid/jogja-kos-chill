import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { userLoginFn, getCurrentUser } from "@/lib/auth";
import { BatikPattern } from "@/components/site/Ornaments";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/masuk")({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (user) {
      throw redirect({ to: user.role === "mitra" ? "/dashboard" : "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Masuk — Keep n Sleep" },
      {
        name: "description",
        content: "Masuk ke akun Keep n Sleep untuk menyimpan wishlist dan menghubungi pemilik kos.",
      },
    ],
  }),
  component: MasukPage,
});

function MasukPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await userLoginFn({ data: { email, password } });

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Berhasil masuk!");
        navigate({ to: "/" });
      }
    } catch {
      toast.error("Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
          <BatikPattern variant="kawung" className="opacity-[0.08]" />

          <div className="relative z-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Masuk</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Masuk untuk menyimpan wishlist dan menghubungi pemilik kos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Email
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
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
              <p>
                Belum punya akun?{" "}
                <Link to="/daftar" className="font-medium text-primary hover:underline">
                  Daftar sekarang
                </Link>
              </p>
              <p>
                Pemilik kos?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Masuk sebagai Mitra
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
