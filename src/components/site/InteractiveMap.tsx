import { useState } from "react";
import { MapPin, GraduationCap, Utensils, Bus } from "lucide-react";

type Marker = {
  id: string;
  name: string;
  type: "kos" | "kampus" | "kuliner" | "transport";
  x: number; // percentage width
  y: number; // percentage height
  distance: string;
};

type InteractiveMapProps = {
  kosName: string;
  lat?: number;
  lng?: number;
  kampusList?: string[];
};

const MAP_TABS = [
  { id: "all", label: "Semua", icon: MapPin },
  { id: "kampus", label: "Kampus", icon: GraduationCap },
  { id: "kuliner", label: "Kuliner", icon: Utensils },
  { id: "transport", label: "Transportasi", icon: Bus },
] as const;

export function InteractiveMap({ kosName, lat, lng, kampusList = [] }: InteractiveMapProps) {
  const [activeTab, setActiveTab] = useState<"all" | "kampus" | "kuliner" | "transport">("all");

  // Mock markers around the kos based on lat/lng or standard offsets
  // Using percentages for high-fidelity representation on a stylized vector canvas
  const allMarkers: Marker[] = [
    {
      id: "kos-main",
      name: kosName,
      type: "kos",
      x: 50,
      y: 50,
      distance: "Lokasi Kos",
    },
    {
      id: "kampus-ugm",
      name: "Universitas Gadjah Mada (UGM)",
      type: "kampus",
      x: 35,
      y: 25,
      distance: "5 menit (1.2 km)",
    },
    {
      id: "kampus-uny",
      name: "Universitas Negeri Yogyakarta (UNY)",
      type: "kampus",
      x: 65,
      y: 30,
      distance: "8 menit (1.9 km)",
    },
    {
      id: "kuliner-1",
      name: "Gudeg Yu Djum",
      type: "kuliner",
      x: 48,
      y: 75,
      distance: "2 menit (400 m)",
    },
    {
      id: "kuliner-2",
      name: "Kopi Klotok Bulaksumur",
      type: "kuliner",
      x: 28,
      y: 52,
      distance: "4 menit (850 m)",
    },
    {
      id: "transport-1",
      name: "Halte Trans Jogja Colombo",
      type: "transport",
      x: 72,
      y: 55,
      distance: "3 menit (600 m)",
    },
    {
      id: "transport-2",
      name: "Stasiun Lempuyangan",
      type: "transport",
      x: 45,
      y: 85,
      distance: "12 menit (3.2 km)",
    },
  ];

  const filteredMarkers = allMarkers.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "kampus") return m.type === "kos" || m.type === "kampus";
    if (activeTab === "kuliner") return m.type === "kos" || m.type === "kuliner";
    if (activeTab === "transport") return m.type === "kos" || m.type === "transport";
    return true;
  });

  const getMarkerIcon = (type: Marker["type"]) => {
    switch (type) {
      case "kos":
        return <MapPin className="h-5 w-5 text-primary animate-bounce" />;
      case "kampus":
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case "kuliner":
        return <Utensils className="h-4 w-4 text-amber-500" />;
      case "transport":
        return <Bus className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMarkerColor = (type: Marker["type"]) => {
    switch (type) {
      case "kos":
        return "bg-primary/20 border-primary text-primary";
      case "kampus":
        return "bg-emerald-500/10 border-emerald-500 text-emerald-500";
      case "kuliner":
        return "bg-amber-500/10 border-amber-500 text-amber-500";
      case "transport":
        return "bg-blue-500/10 border-blue-500 text-blue-500";
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-serif text-lg font-bold">Peta & Sekitar Lokasi</h3>
          <p className="text-xs text-muted-foreground">
            Didesain Google-Maps-Ready (API Koordinat: {lat ?? -7.78}, {lng ?? 110.37})
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 rounded-lg bg-secondary/50 p-1 text-xs">
          {MAP_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
                  active
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Styled Vektor Map */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-secondary/30">
        {/* Mock Grid Lines & Batik Decorative Pattern Background */}
        <div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{ backgroundImage: "var(--batik-pattern)" }}
          aria-hidden
        />

        {/* Mock stylized streets */}
        <svg className="absolute inset-0 h-full w-full opacity-30 dark:opacity-50" aria-hidden>
          <path d="M 0,100 L 900,100" stroke="var(--border)" strokeWidth="8" fill="none" />
          <path d="M 0,250 L 900,250" stroke="var(--border)" strokeWidth="12" fill="none" />
          <path d="M 150,0 L 150,500" stroke="var(--border)" strokeWidth="10" fill="none" />
          <path d="M 450,0 L 450,500" stroke="var(--border)" strokeWidth="16" fill="none" />
          <path d="M 750,0 L 750,500" stroke="var(--border)" strokeWidth="8" fill="none" />
          <path
            d="M 0,400 C 300,400 600,450 900,400"
            stroke="var(--border)"
            strokeWidth="6"
            strokeDasharray="5,5"
            fill="none"
          />
        </svg>

        {/* Pulsing glow under main Kos Location */}
        <div
          className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 animate-ping"
          style={{ left: "50%", top: "50%", animationDuration: "3s" }}
        />

        {/* Pins Rendering */}
        {filteredMarkers.map((m) => (
          <div
            key={m.id}
            className="absolute group -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            {/* The marker pin circle */}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all ${
                m.type === "kos" ? "border-primary scale-110" : "border-border"
              }`}
            >
              {getMarkerIcon(m.type)}
            </div>

            {/* Hover Tooltip card */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 scale-90 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-10">
              <div className="rounded-xl border border-border bg-popover p-2.5 shadow-lg text-xs leading-normal">
                <div className="font-semibold text-foreground">{m.name}</div>
                <div className="mt-1 text-[10px] text-muted-foreground flex items-center justify-between">
                  <span className="capitalize">
                    {m.type === "transport" ? "Transportasi" : m.type}
                  </span>
                  <span className="font-medium text-primary">{m.distance}</span>
                </div>
              </div>
              {/* Arrow */}
              <div className="mx-auto h-2 w-2 rotate-45 border-r border-b border-border bg-popover -mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Markers Sidebar / List in visual layout */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {filteredMarkers
          .filter((m) => m.type !== "kos")
          .map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-background/50 p-2.5 text-xs hover:bg-secondary/60 transition-colors"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${getMarkerColor(m.type)}`}
              >
                {getMarkerIcon(m.type)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate text-foreground">{m.name}</div>
                <div className="text-[10px] text-muted-foreground">{m.distance}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
