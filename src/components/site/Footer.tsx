import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="bg-[#2F2F2F] text-white pt-20 pb-10 mt-20 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.2'%3E%3Ccircle cx='40' cy='40' r='28' /%3E%3Ccircle cx='0' cy='40' r='28' /%3E%3Ccircle cx='80' cy='40' r='28' /%3E%3Ccircle cx='40' cy='0' r='28' /%3E%3Ccircle cx='40' cy='80' r='28' /%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-16 relative z-10">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-[#FCF1E2] rounded-2xl flex items-center justify-center shadow-xl overflow-hidden border border-brand-accent/20 p-1"
            >
              <img
                src="/logo.svg"
                alt="Keep Kost Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tighter leading-none text-white">
                Keep<span className="text-brand-accent italic font-light">Kost</span>
              </span>
              <span className="font-display font-medium text-[9px] tracking-[0.15em] uppercase leading-none mt-1 text-white/40">
                and Next Sleep
              </span>
            </div>
          </Link>
          <p className="text-white/60 leading-relaxed text-sm font-light">
            Platform penyewaan kost premium eksklusif untuk wilayah Yogyakarta. Temukan hunian
            nyaman berkarakter dengan sentuhan budaya Jawa yang hangat.
          </p>
          <div className="flex gap-4">
            {[
              { Icon: Instagram, href: "https://www.instagram.com/keepnsleep?igsh=MWRyZWo4aDN5eWE4eQ==" },
              { Icon: Twitter, href: "#" },
              { Icon: Facebook, href: "#" },
            ].map(({ Icon, href }, i) => (
              <motion.a
                key={i}
                whileHover={{ scale: 1.1, backgroundColor: "#E76F51", borderColor: "#E76F51" }}
                whileTap={{ scale: 0.9 }}
                href={href}
                target={href !== "#" ? "_blank" : undefined}
                rel={href !== "#" ? "noopener noreferrer" : undefined}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-all bg-white/5 text-white"
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold text-lg mb-6">Navigasi</h4>
          <ul className="space-y-4 text-white/60 text-sm font-light">
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                Beranda
              </Link>
            </li>
            <li>
              <Link to="/katalog" className="hover:text-white transition-colors">
                Cari Kost
              </Link>
            </li>
            <li>
              <Link to="/mitra" className="hover:text-white transition-colors">
                Jadi Mitra
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Dashboard Mitra
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-lg mb-6">Area Terpopuler</h4>
          <ul className="space-y-4 text-white/60 text-sm font-light">
            <li>
              <Link to="/katalog" className="hover:text-brand-accent transition-colors italic">
                Sleman - Area UGM
              </Link>
            </li>
            <li>
              <Link to="/katalog" className="hover:text-brand-accent transition-colors italic">
                Kota Jogja - Malioboro
              </Link>
            </li>
            <li>
              <Link to="/katalog" className="hover:text-brand-accent transition-colors italic">
                Bantul - Kasihan
              </Link>
            </li>
            <li>
              <Link to="/katalog" className="hover:text-brand-accent transition-colors italic">
                Depok - Seturan
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-lg mb-6">Kontak Kami</h4>
          <ul className="space-y-4 text-white/60 text-sm font-light">
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-brand-accent" />
              <span>+62 81285522189</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-brand-accent" />
              <span>kosjogja@keepnsleep.site</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={18} className="text-brand-accent" />
              <span>Jalan Kaliurang KM 5,6, Pandega Duksina No. 2</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">
        <p>
          © {new Date().getFullYear()} Keep Kost and Next Sleep. Nyaman seperti di rumah sendiri.
        </p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white">
            Terms of Use
          </a>
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white">
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
