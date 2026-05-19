import { Link } from "@tanstack/react-router";
import { Home, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg font-bold text-foreground">Keep n Sleep</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Kos Jogja</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 text-sm">
            {[
              { to: "/", label: "Beranda" },
              { to: "/katalog", label: "Katalog" },
              { to: "/mitra", label: "Mitra" },
              { to: "/dashboard", label: "Dashboard" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-secondary text-secondary-foreground font-semibold" }}
                className="rounded-md px-3 py-2 font-medium text-foreground/80 transition-colors hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary text-foreground transition-all active:scale-90"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}