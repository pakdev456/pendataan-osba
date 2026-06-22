import {
  getPelanggaranKebersihan,
  addPelanggaranKebersihan,
  deletePelanggaranKebersihan,
  deleteAllPelanggaranKebersihan,
  getPelanggaranBahasa,
  addPelanggaranBahasa,
  deletePelanggaranBahasa,
  deleteAllPelanggaranBahasa,
  getPelanggaranKeamanan,
  addPelanggaranKeamanan,
  deletePelanggaranKeamanan,
  deleteAllPelanggaranKeamanan,
  Pelanggaran,
} from '../lib/api';

export interface QismApi {
  get: () => Promise<Pelanggaran[]>;
  add: (m: Omit<Pelanggaran, 'id' | 'created_at'>) => Promise<Pelanggaran>;
  delete: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
}

export interface QismConfig {
  role: string;
  title: string;
  entityLabel: string;
  entityLabelPlural: string;
  pendataanSubtitle: string;
  laporanTitle: string;
  laporanSubtitle: string;
  pengawasLabel: string;
  pdfFilename: string;
  jenisUtama: string[];
  subLainnya: string[];
  api: QismApi;
}

export const QISM_CONFIGS: Record<string, QismConfig> = {
  kebersihan: {
    role: 'kebersihan',
    title: 'Qism Kebersihan',
    entityLabel: 'Pelanggar',
    entityLabelPlural: 'Pelanggar',
    pendataanSubtitle: 'Kelola data pelanggaran kebersihan',
    laporanTitle: 'LAPORAN PELANGGARAN KEBERSIHAN',
    laporanSubtitle: 'Cetak laporan pelanggaran kebersihan untuk pengawas',
    pengawasLabel: 'Pengawas Qism Kebersihan',
    pdfFilename: 'laporan-kebersihan-osba.pdf',
    jenisUtama: ['Kamar Kotor', 'Lingkungan Kotor', 'Lainnya'],
    subLainnya: [
      'Tidak Merapikan Kasur', 'Sampah Tidak Dibuang', 'Kamar Mandi Kotor',
      'Pakaian Berantakan', 'Tidak Ikut Piket', 'Makan di Kamar',
    ],
    api: {
      get: getPelanggaranKebersihan,
      add: addPelanggaranKebersihan,
      delete: deletePelanggaranKebersihan,
      deleteAll: deleteAllPelanggaranKebersihan,
    },
  },
  bahasa: {
    role: 'bahasa',
    title: 'Qism Bahasa',
    entityLabel: 'Pelanggar',
    entityLabelPlural: 'Pelanggar',
    pendataanSubtitle: 'Kelola data pelanggaran bahasa',
    laporanTitle: 'LAPORAN PELANGGARAN BAHASA',
    laporanSubtitle: 'Cetak laporan pelanggaran bahasa untuk pengawas',
    pengawasLabel: 'Pengawas Qism Bahasa',
    pdfFilename: 'laporan-bahasa-osba.pdf',
    jenisUtama: ['Tidak Pakai Bahasa Arab', 'Berbicara Non-Arab', 'Lainnya'],
    subLainnya: [
      'Berbicara Indonesia di Area Wajib Arab', 'Tidak Menjawab dengan Arab',
      'Menggunakan Bahasa Asing', 'Tidak Ikut Kegiatan Bahasa',
      'Menghina Teman Berbahasa Arab', 'Tidak Hafal Kosakata',
    ],
    api: {
      get: getPelanggaranBahasa,
      add: addPelanggaranBahasa,
      delete: deletePelanggaranBahasa,
      deleteAll: deleteAllPelanggaranBahasa,
    },
  },
  keamanan: {
    role: 'keamanan',
    title: 'Qism Keamanan',
    entityLabel: 'Pelanggar',
    entityLabelPlural: 'Pelanggar',
    pendataanSubtitle: 'Kelola data pelanggaran keamanan',
    laporanTitle: 'LAPORAN PELANGGARAN KEAMANAN',
    laporanSubtitle: 'Cetak laporan pelanggaran keamanan untuk pengawas',
    pengawasLabel: 'Pengawas Qism Keamanan',
    pdfFilename: 'laporan-keamanan-osba.pdf',
    jenisUtama: ['Keluar Tanpa Izin', 'Bertengkar', 'Lainnya'],
    subLainnya: [
      'Melawan Pengurus', 'Membawa Barang Terlarang', 'Merusak Fasilitas',
      'Tidak Ikut Apel', 'Bolos Kegiatan', 'Mengganggu Ketertiban',
    ],
    api: {
      get: getPelanggaranKeamanan,
      add: addPelanggaranKeamanan,
      delete: deletePelanggaranKeamanan,
      deleteAll: deleteAllPelanggaranKeamanan,
    },
  },
};

export function getQismConfig(role: string): QismConfig | null {
  return QISM_CONFIGS[role] ?? null;
}
