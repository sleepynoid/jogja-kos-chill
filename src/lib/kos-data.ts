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

export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
