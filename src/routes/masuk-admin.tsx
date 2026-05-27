import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { adminLoginFn, getCurrentUser } from "@/lib/auth";
import { BatikPattern } from "@/components/site/Ornaments";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/masuk-admin")({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (user?.is_admin) {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin Login — Keep n Sleep" },
      {
        name: "description",
        content: "Masuk ke panel admin Keep n Sleep.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MasukAdminPage,
});

function MasukAdminPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adminLoginFn({ data: { email, password } });

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Selamat datang, Admin!");
        navigate({ to: "/admin" });
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
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Masuk dengan akun admin untuk mengelola platform.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Email Admin
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@keepnsleep.id"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
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
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Masuk sebagai Admin"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Bukan admin?{" "}
                <Link to="/masuk" className="font-medium text-primary hover:underline">
                  Masuk sebagai User
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
