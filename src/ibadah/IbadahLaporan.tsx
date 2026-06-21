import React, { useEffect, useState } from 'react';
import { getMukholif, Mukholif } from '../lib/api';
import { formatDate, formatDateLong } from '../utils/format';
import { Printer, Download, Calendar, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const KELAS_LIST = ['', 'Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11'];

export function IbadahLaporan() {
  const [data, setData]         = useState<Mukholif[]>([]);
  const [loading, setLoading]   = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [exporting, setExporting]     = useState(false);

  const loadData = async () => {
    setLoading(true);
    try { setData(await getMukholif()); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = [...data]
    .filter(m => {
      if (dateFrom && m.date < dateFrom) return false;
      if (dateTo   && m.date > dateTo)   return false;
      if (filterKelas && m.kelas !== filterKelas) return false;
      return true;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Summaries
  const jenisSummary: Record<string, number> = {};
  const kelasSummary: Record<string, number> = {};
  filtered.forEach(m => {
    const mainJenis = m.jenis.split(' – ')[0];
    jenisSummary[mainJenis] = (jenisSummary[mainJenis] || 0) + 1;
    kelasSummary[m.kelas]   = (kelasSummary[m.kelas] || 0) + 1;
  });

  const periodStr = dateFrom || dateTo
    ? `${dateFrom ? formatDateLong(dateFrom) : 'Awal'} – ${dateTo ? formatDateLong(dateTo) : 'Sekarang'}${filterKelas ? ` · ${filterKelas}` : ' · Semua Kelas'}`
    : `Semua Periode${filterKelas ? ` · ${filterKelas}` : ' · Semua Kelas'}`;

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('LAPORAN MUKHOLIF', 105, 18, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Qism Ibadah OSBA', 105, 25, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Periode: ${periodStr}`, 105, 31, { align: 'center' });

      // Summary tables side by side
      autoTable(doc, {
        startY: 40,
        head: [['Jenis', 'Jumlah']],
        body: Object.entries(jenisSummary).map(([k, v]) => [k, v]),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        tableWidth: 80,
        margin: { left: 14 },
        styles: { fontSize: 9 },
        didDrawPage: () => {},
      });

      autoTable(doc, {
        startY: 40,
        head: [['Kelas', 'Jumlah']],
        body: Object.entries(kelasSummary).map(([k, v]) => [k, v]),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        tableWidth: 80,
        margin: { left: 115 },
        styles: { fontSize: 9 },
      });

      const afterSummary = Math.max((doc as any).lastAutoTable.finalY + 8, 85);

      // Main table
      autoTable(doc, {
        startY: afterSummary,
        head: [['No', 'Tanggal', 'Nama', 'Kelas', 'Jenis', 'Catatan']],
        body: filtered.map((m, i) => [i + 1, formatDate(m.date), m.nama, m.kelas, m.jenis, m.catatan || '']),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          1: { cellWidth: 28 },
          5: { textColor: [100, 100, 100] },
        },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });

      // Signature
      const finalY = (doc as any).lastAutoTable.finalY + 14;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, finalY);
      doc.setTextColor(0, 100, 180);
      doc.text('Mengetahui,', 160, finalY);
      doc.text('Pengawas Qism Ibadah', 150, finalY + 6);
      doc.setTextColor(0, 0, 0);
      doc.text('( ........................... )', 148, finalY + 22);

      // Page numbers
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${i}/${pages}`, 200, doc.internal.pageSize.height - 8, { align: 'right' });
        doc.text(window.location.href, 14, doc.internal.pageSize.height - 8);
      }

      doc.save('laporan-mukholif-osba.pdf');
    } finally { setExporting(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-black">Laporan</h1>
          <p className="text-sm text-gray-400">Cetak laporan mukholif untuk pengawas</p>
        </div>
        <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm print:hidden">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black" />
            <span className="text-gray-400 text-sm">–</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black" />
            <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)}
              className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black bg-white">
              {KELAS_LIST.map(k => <option key={k} value={k}>{k || 'Semua Kelas'}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-300 hover:border-black rounded-lg text-sm font-medium transition-all">
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <button onClick={handleExportPDF} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
              {exporting ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <Download className="w-4 h-4" />}
              Ekspor PDF
            </button>
          </div>
        </div>
      </div>

      {/* Print Area */}
      <div id="print-content" className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 print:shadow-none print:border-none print:rounded-none">
        {/* Print header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">LAPORAN MUKHOLIF</h2>
          <p className="text-sm text-gray-600">Qism Ibadah OSBA</p>
          <p className="text-sm text-blue-600 mt-1">Periode: {periodStr}</p>
        </div>

        {/* Summary tables */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Ringkasan per Jenis</p>
            <table className="w-full border-collapse">
              <thead><tr className="bg-black text-white"><th className="text-left py-1.5 px-3 text-xs">Jenis</th><th className="text-right py-1.5 px-3 text-xs">Jumlah</th></tr></thead>
              <tbody>
                {Object.entries(jenisSummary).map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-100">
                    <td className="py-1.5 px-3 text-sm text-blue-600">{k}</td>
                    <td className="py-1.5 px-3 text-sm text-right font-medium">{v}</td>
                  </tr>
                ))}
                {Object.keys(jenisSummary).length === 0 && <tr><td colSpan={2} className="py-2 px-3 text-sm text-gray-400 text-center">-</td></tr>}
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Ringkasan per Kelas</p>
            <table className="w-full border-collapse">
              <thead><tr className="bg-black text-white"><th className="text-left py-1.5 px-3 text-xs">Kelas</th><th className="text-right py-1.5 px-3 text-xs">Jumlah</th></tr></thead>
              <tbody>
                {Object.entries(kelasSummary).map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-100">
                    <td className="py-1.5 px-3 text-sm text-blue-600">{k}</td>
                    <td className="py-1.5 px-3 text-sm text-right font-medium">{v}</td>
                  </tr>
                ))}
                {Object.keys(kelasSummary).length === 0 && <tr><td colSpan={2} className="py-2 px-3 text-sm text-gray-400 text-center">-</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Main table */}
        <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Daftar Pelanggar</p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="text-left py-2 px-3 text-xs">No</th>
              <th className="text-left py-2 px-3 text-xs">Tanggal</th>
              <th className="text-left py-2 px-3 text-xs">Nama</th>
              <th className="text-left py-2 px-3 text-xs">Kelas</th>
              <th className="text-left py-2 px-3 text-xs">Jenis</th>
              <th className="text-left py-2 px-3 text-xs">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Tidak ada data untuk periode ini</td></tr>
            ) : (
              filtered.map((m, i) => (
                <tr key={m.id} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                  <td className="py-2 px-3 text-sm text-blue-600">{i + 1}</td>
                  <td className="py-2 px-3 text-sm">{new Date(m.date).toLocaleDateString('id-ID')}</td>
                  <td className="py-2 px-3 text-sm font-medium">{m.nama}</td>
                  <td className="py-2 px-3 text-sm">{m.kelas.replace('Kelas ', '')}</td>
                  <td className="py-2 px-3 text-sm text-blue-600">{m.jenis.split(' – ')[0]}</td>
                  <td className="py-2 px-3 text-sm text-gray-500">{m.catatan || ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 flex items-end justify-between text-xs text-gray-400">
          <span>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          <div className="text-right">
            <p className="text-blue-600 font-medium">Mengetahui,</p>
            <p className="text-blue-600 font-medium">Pengawas Qism Ibadah</p>
            <p className="mt-6 text-gray-500">( ........................... )</p>
          </div>
        </div>
      </div>
    </div>
  );
}
