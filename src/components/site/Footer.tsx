import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-xl font-bold text-foreground">Keep n Sleep</div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Platform sewa kos terpercaya di Yogyakarta. Temukan rumah keduamu
            dengan sentuhan budaya Jawa yang hangat.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
            ✺ Inspired by Jogja Istimewa
          </div>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Navigasi</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Beranda</Link></li>
            <li><Link to="/katalog" className="hover:text-foreground">Katalog Kos</Link></li>
            <li><Link to="/mitra" className="hover:text-foreground">Daftar Mitra</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Kontak</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Jl. Malioboro No.1</li>
            <li>Yogyakarta, Indonesia</li>
            <li>hello@keepnsleep.id</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Keep n Sleep — Nyaman seperti di rumah sendiri.
      </div>
    </footer>
  );
}