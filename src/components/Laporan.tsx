import React, { useState, useEffect } from 'react';
import {
  Transaction,
  getTransactions,
  calculateBalance,
  calculateTotalDebit,
  calculateTotalCredit,
} from '../lib/api';
import { formatCurrency, formatDate, formatDateLong } from '../utils/format';
import {
  Printer,
  Download,
  Calendar,
  RefreshCw,
  Building2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Laporan() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });

  // Sort by date ascending for report
  const sortedTransactions = [...filteredTransactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const balance = calculateBalance(filteredTransactions);
  const totalDebit = calculateTotalDebit(filteredTransactions);
  const totalCredit = calculateTotalCredit(filteredTransactions);

  // Running balance calculation
  let runningBalance = 0;
  const transactionsWithBalance = sortedTransactions.map((t) => {
    if (t.type === 'debit') {
      runningBalance += t.amount;
    } else {
      runningBalance -= t.amount;
    }
    return { ...t, runningBalance };
  });

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF('landscape');

      // Header - Organization Info
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('LAPORAN KEUANGAN KAS', 148, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text('OSBA - ORGANISASI SISWA', 148, 28, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dateRange = dateFrom || dateTo
        ? `Periode: ${dateFrom ? formatDateLong(dateFrom) : 'Awal'} s.d. ${dateTo ? formatDateLong(dateTo) : 'Sekarang'}`
        : `Periode: Semua Transaksi`;
      doc.text(dateRange, 148, 36, { align: 'center' });
      doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 148, 42, { align: 'center' });

      // Summary Box with colors
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(14, 50, 270, 24, 3, 3, 'F');

      // Three columns for summary
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text('TOTAL PEMASUKAN', 50, 58, { align: 'center' });
      doc.text('TOTAL PENGELUARAN', 148, 58, { align: 'center' });
      doc.text('SALDO AKHIR', 246, 58, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(22, 163, 74); // green-600
      doc.text(formatCurrency(totalDebit), 50, 67, { align: 'center' });
      doc.setTextColor(220, 38, 38); // red-600
      doc.text(formatCurrency(totalCredit), 148, 67, { align: 'center' });
      doc.setTextColor(55, 65, 81); // gray-700
      doc.text(formatCurrency(balance), 246, 67, { align: 'center' });

      // Table
      const tableData = transactionsWithBalance.map((t, index) => [
        (index + 1).toString(),
        formatDate(t.date),
        t.description,
        t.category,
        t.type === 'debit' ? formatCurrency(t.amount) : '-',
        t.type === 'credit' ? formatCurrency(t.amount) : '-',
        formatCurrency(t.runningBalance),
      ]);

      autoTable(doc, {
        startY: 80,
        head: [['NO', 'TANGGAL', 'KETERANGAN', 'KATEGORI', 'DEBIT', 'KREDIT', 'SALDO']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [31, 41, 55], // gray-800
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 3,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'center', cellWidth: 30 },
          2: { halign: 'left', cellWidth: 60 },
          3: { halign: 'center', cellWidth: 35 },
          4: { halign: 'right', cellWidth: 35, textColor: [22, 163, 74] },
          5: { halign: 'right', cellWidth: 35, textColor: [220, 38, 38] },
          6: { halign: 'right', cellWidth: 40 },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // gray-50
        },
        footStyles: {
          fillColor: [31, 41, 55],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        foot: [
          [
            '',
            '',
            'T O T A L',
            '',
            formatCurrency(totalDebit),
            formatCurrency(totalCredit),
            formatCurrency(balance),
          ],
        ],
        margin: { left: 14, right: 14 },
        didDrawCell: (data) => {
          // Color the debit column green and credit column red
          if (data.section === 'body') {
            if (data.column.index === 4 && data.cell.raw !== '-') {
              data.cell.styles.textColor = [22, 163, 74];
            }
            if (data.column.index === 5 && data.cell.raw !== '-') {
              data.cell.styles.textColor = [220, 38, 38];
            }
          }
        },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);

        // Signature area on last page
        if (i === pageCount) {
          const finalY = (doc as any).lastAutoTable.finalY + 20;
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text('Mengetahui,', 230, finalY, { align: 'center' });
          doc.text('Bendahara', 230, finalY + 25, { align: 'center' });
          doc.text('Ketua OSBA', 100, finalY + 25, { align: 'center' });
        }

        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          148,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save('laporan-kas-osba.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Non-print */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-black">Laporan Keuangan</h1>
          <p className="text-gray-500">Cetak dan ekspor laporan keuangan kas</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filter - Non-print */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm print:hidden">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Periode:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black transition-all duration-300"
              />
              <span className="text-gray-400">s.d.</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <button
              onClick={handlePrint}
              disabled={printing}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-black text-black font-medium py-2 px-5 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <Printer className="w-5 h-5" />
              Cetak
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-black text-white font-medium py-2 px-5 rounded-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
            >
              {exporting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ekspor...
                </span>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Ekspor PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Print Content - Formal Report */}
      <div id="print-content" className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Report Header */}
        <div className="bg-gray-800 text-white p-6 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                <Building2 className="w-10 h-10 text-gray-800" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">LAPORAN KEUANGAN KAS</h2>
                <p className="text-gray-300 text-lg">OSBA - ORGANISASI SISWA</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-300">Periode</p>
              <p className="font-medium">
                {dateFrom ? formatDateLong(dateFrom) : 'Awal'}
              </p>
              <p className="text-gray-400">s.d.</p>
              <p className="font-medium">
                {dateTo ? formatDateLong(dateTo) : 'Sekarang'}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b-2 border-gray-200">
          <div className="p-6 print:p-4 border-r border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Pemasukan (Debit)</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalDebit)}</p>
          </div>
          <div className="p-6 print:p-4 border-r border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Pengeluaran (Kredit)</p>
            </div>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalCredit)}</p>
          </div>
          <div className="p-6 print:p-4 bg-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Saldo Akhir</p>
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Transaction Table - Excel Style */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="py-3 px-4 text-center font-bold w-16 border-r border-gray-600">NO</th>
                <th className="py-3 px-4 text-center font-bold w-28 border-r border-gray-600">TANGGAL</th>
                <th className="py-3 px-4 text-left font-bold border-r border-gray-600">KETERANGAN</th>
                <th className="py-3 px-4 text-center font-bold w-36 border-r border-gray-600">KATEGORI</th>
                <th className="py-3 px-4 text-right font-bold w-36 border-r border-gray-600 bg-green-700">DEBIT</th>
                <th className="py-3 px-4 text-right font-bold w-36 border-r border-gray-600 bg-red-700">KREDIT</th>
                <th className="py-3 px-4 text-right font-bold w-36 bg-gray-600">SALDO</th>
              </tr>
            </thead>
            <tbody>
              {transactionsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Tidak ada data transaksi untuk periode ini
                  </td>
                </tr>
              ) : (
                transactionsWithBalance.map((t, index) => (
                  <tr
                    key={t.id}
                    className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-3 px-4 text-center text-gray-500 border-r border-gray-200 font-medium">{index + 1}</td>
                    <td className="py-3 px-4 text-center border-r border-gray-200">{formatDate(t.date)}</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-medium">{t.description}</td>
                    <td className="py-3 px-4 text-center border-r border-gray-200">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">{t.category}</span>
                    </td>
                    <td className="py-3 px-4 text-right border-r border-gray-200 font-semibold">
                      {t.type === 'debit' ? (
                        <span className="text-green-600">{formatCurrency(t.amount)}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right border-r border-gray-200 font-semibold">
                      {t.type === 'credit' ? (
                        <span className="text-red-600">{formatCurrency(t.amount)}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${t.runningBalance >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                      {formatCurrency(t.runningBalance)}
                    </td>
                  </tr>
                ))
              )}
              {/* Total Row */}
              <tr className="bg-gray-700 text-white font-bold">
                <td colSpan={4} className="py-4 px-4 text-right text-lg border-r border-gray-600">
                  T O T A L
                </td>
                <td className="py-4 px-4 text-right text-lg border-r border-gray-600 bg-green-700">
                  {formatCurrency(totalDebit)}
                </td>
                <td className="py-4 px-4 text-right text-lg border-r border-gray-600 bg-red-700">
                  {formatCurrency(totalCredit)}
                </td>
                <td className={`py-4 px-4 text-right text-lg bg-gray-800 ${balance >= 0 ? '' : 'text-red-300'}`}>
                  {formatCurrency(balance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature Section */}
        <div className="p-8 print:p-6 border-t-2 border-gray-200 bg-gray-50 print:bg-white">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-semibold text-gray-700 mb-16">Mengetahui,</p>
              <p className="border-t-2 border-gray-400 pt-2 font-semibold text-black">Ketua OSBA</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-16">Bendahara,</p>
              <p className="border-t-2 border-gray-400 pt-2 font-semibold text-black">Bendahara</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-16">Pembina,</p>
              <p className="border-t-2 border-gray-400 pt-2 font-semibold text-black">Pembina OSBA</p>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-gray-400">
            Dicetak pada: {new Date().toLocaleString('id-ID')}
          </div>
        </div>
      </div>
    </div>
  );
}
