export const KAMPUS_LIST = [
  { value: "ugm", label: "Universitas Gadjah Mada (UGM)" },
  { value: "uny", label: "Universitas Negeri Yogyakarta (UNY)" },
  { value: "uin", label: "UIN Sunan Kalijaga" },
  { value: "upn", label: 'UPN "Veteran" Yogyakarta' },
  { value: "isi", label: "Institut Seni Indonesia (ISI) Yogyakarta" },
  { value: "uii", label: "Universitas Islam Indonesia (UII)" },
  { value: "umy", label: "Universitas Muhammadiyah Yogyakarta (UMY)" },
  { value: "ukdw", label: "Universitas Kristen Duta Wacana (UKDW)" },
] as const;

export const DAERAH_LIST = [
  { value: "malioboro", label: "Malioboro" },
  { value: "kotagede", label: "Kotagede" },
  { value: "depok", label: "Depok, Sleman" },
  { value: "kasihan", label: "Kasihan, Bantul" },
  { value: "umbulharjo", label: "Umbulharjo" },
  { value: "jetis", label: "Jetis" },
] as const;

export const JENIS_KOS = [
  { value: "putra", label: "Kos Putra" },
  { value: "putri", label: "Kos Putri" },
  { value: "campuran", label: "Kos Campuran" },
  { value: "exclusive", label: "Kos Exclusive" },
] as const;

export type JenisKos = (typeof JENIS_KOS)[number]["value"];

export type Kos = {
  id: string;
  nama: string;
  jenis: JenisKos;
  kampusTerdekat: string[]; // kampus values
  daerah: string;
  alamat: string;
  hargaPerBulan: number;
  rating: number;
  fasilitas: string[];
  gambar: string;
  galeri?: string[];
  deskripsi: string;
};

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=70`;

// Reusable extra interior shots for galeri kos.
const EXTRA_INTERIORS = [
  "1522708323590-d24dbb6b0267",
  "1505691938895-1758d7feb511",
  "1560448204-e02f11c3d0e2",
  "1493809842364-78817add7ffb",
  "1556909114-f6e7ad7d3136",
  "1554995207-c18c203602cb",
  "1540518614846-7eded433c457",
  "1522444195799-478538b28823",
  "1502672260266-1c1ef2d93688",
];

export const KOS_LIST: Kos[] = [
  {
    id: "k1",
    nama: "Griya Sogan Bulaksumur",
    jenis: "putri",
    kampusTerdekat: ["ugm", "uny"],
    daerah: "depok",
    alamat: "Jl. Kaliurang KM 4.5, Sleman",
    hargaPerBulan: 1250000,
    rating: 4.8,
    fasilitas: ["WiFi 100Mbps", "AC", "Kamar Mandi Dalam", "Laundry", "Dapur Bersama", "CCTV"],
    gambar: img("1505691938895-1758d7feb511"),
    deskripsi: "Kos putri nyaman 5 menit dari kampus UGM, lingkungan asri dengan sentuhan batik sogan.",
  },
  {
    id: "k2",
    nama: "Wisma Parangtritis",
    jenis: "putra",
    kampusTerdekat: ["isi", "umy"],
    daerah: "kasihan",
    alamat: "Jl. Parangtritis KM 6, Bantul",
    hargaPerBulan: 850000,
    rating: 4.5,
    fasilitas: ["WiFi", "Kipas Angin", "Parkir Motor", "Air Panas", "Dapur Bersama"],
    gambar: img("1522708323590-d24dbb6b0267"),
    deskripsi: "Kos putra strategis dekat ISI Yogyakarta dengan harga ramah mahasiswa.",
  },
  {
    id: "k3",
    nama: "Omah Malioboro Heritage",
    jenis: "exclusive",
    kampusTerdekat: ["ugm", "uin"],
    daerah: "malioboro",
    alamat: "Jl. Sosrowijayan, Yogyakarta",
    hargaPerBulan: 2500000,
    rating: 4.9,
    fasilitas: ["WiFi 200Mbps", "AC", "Kamar Mandi Dalam", "Smart TV", "Cleaning Service", "Gym", "Rooftop"],
    gambar: img("1560448204-e02f11c3d0e2"),
    deskripsi: "Kos eksklusif bernuansa Jawa modern, jantung kota Yogyakarta.",
  },
  {
    id: "k4",
    nama: "Kos Wijaya Kusuma",
    jenis: "campuran",
    kampusTerdekat: ["uny", "ugm"],
    daerah: "depok",
    alamat: "Jl. Colombo, Karangmalang",
    hargaPerBulan: 1050000,
    rating: 4.3,
    fasilitas: ["WiFi", "AC", "Parkir Mobil", "Dapur Bersama", "Laundry"],
    gambar: img("1493809842364-78817add7ffb"),
    deskripsi: "Kos campuran modern dekat UNY, cocok untuk mahasiswa dan pekerja muda.",
  },
  {
    id: "k5",
    nama: "Pondok Gadjah Mada",
    jenis: "putra",
    kampusTerdekat: ["ugm"],
    daerah: "depok",
    alamat: "Jl. Pogung Baru, Sleman",
    hargaPerBulan: 950000,
    rating: 4.4,
    fasilitas: ["WiFi", "Kamar Mandi Dalam", "Parkir Motor", "Dapur Bersama", "CCTV"],
    gambar: img("1502672260266-1c1ef2d93688"),
    deskripsi: "Kos putra favorit mahasiswa UGM, 3 menit ke gerbang utara.",
  },
  {
    id: "k6",
    nama: "Rumah Kalijaga Asri",
    jenis: "putri",
    kampusTerdekat: ["uin"],
    daerah: "umbulharjo",
    alamat: "Jl. Timoho, Umbulharjo",
    hargaPerBulan: 900000,
    rating: 4.6,
    fasilitas: ["WiFi", "AC", "Kamar Mandi Dalam", "Mushola", "Laundry"],
    gambar: img("1556909114-f6e7ad7d3136"),
    deskripsi: "Kos putri islami dekat UIN Sunan Kalijaga, nyaman dan aman.",
  },
  {
    id: "k7",
    nama: "Kos Veteran Residence",
    jenis: "exclusive",
    kampusTerdekat: ["upn"],
    daerah: "depok",
    alamat: "Jl. Babarsari, Sleman",
    hargaPerBulan: 2100000,
    rating: 4.7,
    fasilitas: ["WiFi 150Mbps", "AC", "Smart TV", "Kulkas", "Cleaning Service", "Parkir Mobil"],
    gambar: img("1554995207-c18c203602cb"),
    deskripsi: "Kos eksklusif dekat UPN dengan fasilitas hotel berbintang.",
  },
  {
    id: "k8",
    nama: "Wisma Kauman",
    jenis: "campuran",
    kampusTerdekat: ["uii", "umy"],
    daerah: "jetis",
    alamat: "Jl. Kauman, Yogyakarta",
    hargaPerBulan: 1150000,
    rating: 4.2,
    fasilitas: ["WiFi", "AC", "Dapur Bersama", "Laundry", "Parkir Motor"],
    gambar: img("1540518614846-7eded433c457"),
    deskripsi: "Kos campuran tengah kota, akses mudah ke berbagai kampus.",
  },
  {
    id: "k9",
    nama: "Kos Duta Wacana Garden",
    jenis: "putri",
    kampusTerdekat: ["ukdw"],
    daerah: "umbulharjo",
    alamat: "Jl. Dr. Wahidin, Yogyakarta",
    hargaPerBulan: 1000000,
    rating: 4.5,
    fasilitas: ["WiFi", "AC", "Kamar Mandi Dalam", "Taman", "Laundry"],
    gambar: img("1522444195799-478538b28823"),
    deskripsi: "Kos putri asri dengan taman bunga, dekat UKDW.",
  },
];

export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);