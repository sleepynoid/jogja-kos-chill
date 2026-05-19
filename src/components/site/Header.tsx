import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
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
        <nav className="flex items-center gap-1 text-sm">
          {[
            { to: "/", label: "Beranda" },
            { to: "/katalog", label: "Katalog" },
            { to: "/mitra", label: "Mitra" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="rounded-md px-3 py-2 font-medium text-foreground/80 transition-colors hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}