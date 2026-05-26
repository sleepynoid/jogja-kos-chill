import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Sun, Moon, Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, logoutFn, type SessionUser } from "@/lib/auth";
import { toast } from "sonner";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch current user on mount and on route change
  useEffect(() => {
    getCurrentUser().then((u) => setUser(u));
  }, [location.pathname]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const handleLogout = async () => {
    try {
      await logoutFn();
    } catch {
      // redirect throws, which is expected
    }
    setUser(null);
    toast.success("Berhasil keluar.");
    navigate({ to: "/" });
  };

  const transparent = isHome && !isScrolled;

  // Build nav links based on auth state
  const navLinks = [
    { to: "/", label: "Beranda" },
    { to: "/katalog", label: "Cari Kost" },
    { to: "/survey", label: "Jasa Survey" },
    { to: "/wishlist", label: "Wishlist" },
    ...(user?.role === "mitra"
      ? [{ to: "/dashboard", label: "Dashboard" }]
      : !user
        ? [{ to: "/mitra", label: "Mitra" }]
        : []),
  ] as const;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${transparent ? "bg-transparent shadow-none border-b border-transparent" : "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-[#FCF1E2] rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/5 border border-brand-accent/20 overflow-hidden relative p-1"
          >
            <img
              src="/logo.svg"
              alt="Keep Kost Logo"
              className="w-full h-full object-contain rounded-xl"
            />
            <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <div className="flex flex-col">
            <span
              className={`font-display font-bold text-xl tracking-tighter leading-none ${transparent ? "text-white" : "text-brand-primary dark:text-white"}`}
            >
              Keep<span className="text-brand-accent italic font-light">Kost</span>
            </span>
            <span
              className={`font-display font-medium text-[9px] tracking-[0.15em] uppercase leading-none mt-1 ${transparent ? "text-white/60" : "text-brand-primary/40 dark:text-white/40"}`}
            >
              and Next Sleep
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div
          className={`hidden md:flex items-center gap-8 ${transparent ? "text-white/90" : "text-brand-primary/85 dark:text-white/90"}`}
        >
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{
                className: "text-brand-accent font-semibold border-b-2 border-brand-accent",
              }}
              className="hover:text-brand-accent transition-all font-medium text-sm border-b-2 border-transparent pb-1"
            >
              {l.label}
            </Link>
          ))}

          {!user && (
            <Link
              to="/masuk"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Masuk
            </Link>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-90 ${transparent ? "border-white/20 bg-white/10 hover:bg-white/25 text-white" : "border-border bg-background hover:bg-secondary text-foreground dark:text-white dark:hover:bg-zinc-800"}`}
              aria-label="Logout"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          <div className="h-6 w-px bg-current/20 mx-2" />

          <button
            onClick={toggleTheme}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-90 ${transparent ? "border-white/20 bg-white/10 hover:bg-white/25 text-white" : "border-border bg-background hover:bg-secondary text-foreground dark:text-white dark:hover:bg-zinc-800"}`}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-90 ${transparent ? "border-white/20 bg-white/10 text-white" : "border-border bg-background text-foreground dark:text-white dark:hover:bg-zinc-800"}`}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className={transparent ? "text-white" : "text-brand-primary dark:text-white"} />
            ) : (
              <Menu className={transparent ? "text-white" : "text-brand-primary dark:text-white"} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-background border-b border-border p-6 flex flex-col gap-4 shadow-xl"
          >
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setIsOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-brand-accent font-bold" }}
                className="font-medium text-lg hover:text-brand-accent transition-colors"
              >
                {l.label}
              </Link>
            ))}

            {!user && (
              <Link
                to="/masuk"
                onClick={() => setIsOpen(false)}
                className="font-medium text-lg hover:text-brand-accent transition-colors"
              >
                Masuk
              </Link>
            )}

            {user && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="font-medium text-lg text-left hover:text-brand-accent transition-colors text-destructive"
              >
                Keluar
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
