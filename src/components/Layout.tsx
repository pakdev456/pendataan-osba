import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { TambahTransaksi } from './TambahTransaksi';
import { Riwayat } from './Riwayat';
import { Statistik } from './Statistik';
import { Laporan } from './Laporan';
import { MoonLoader } from './MoonLoader';

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  tambah: 'Tambah Transaksi',
  riwayat: 'Riwayat Transaksi',
  statistik: 'Statistik',
  laporan: 'Laporan',
};

export function Layout() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = (page: string) => {
    if (page === currentPage) return;
    setLoading(true);
    setSidebarOpen(false);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 700);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'tambah':    return <TambahTransaksi onAdd={() => navigate('riwayat')} />;
      case 'riwayat':   return <Riwayat />;
      case 'statistik': return <Statistik />;
      case 'laporan':   return <Laporan />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && <MoonLoader title="Sistem Pendataan OSBA" subtitle="Berpindah halaman" />}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={navigate}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-lg font-semibold text-black">
                {PAGE_LABELS[currentPage] || currentPage}
              </h2>
            </div>
            <div className="w-10 lg:hidden" />
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <div className="animate-fadeIn" key={currentPage}>
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
}
