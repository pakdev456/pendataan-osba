import React, { useState, useEffect } from 'react';
import { Transaction, getTransactions } from '../lib/api';
import { formatCurrency } from '../utils/format';

interface CategoryStat {
  name: string;
  total: number;
  count: number;
  type: string;
}

const COLORS = [
  'bg-green-500', 'bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500', 'bg-lime-500',
];

export function Statistik() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryStats: CategoryStat[] = React.useMemo(() => {
    const stats: Record<string, CategoryStat> = {};

    transactions.forEach((t) => {
      const key = `${t.category}-${t.type}`;
      if (!stats[key]) {
        stats[key] = {
          name: t.category,
          type: t.type,
          total: 0,
          count: 0,
        };
      }
      stats[key].total += t.amount;
      stats[key].count += 1;
    });

    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [transactions]);

  const debitStats = categoryStats.filter((s) => s.type === 'debit');
  const creditStats = categoryStats.filter((s) => s.type === 'credit');

  const maxDebit = Math.max(...debitStats.map(s => s.total), 1);
  const maxCredit = Math.max(...creditStats.map(s => s.total), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Statistik</h1>
        <p className="text-gray-500">Analisis transaksi berdasarkan kategori</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pemasukan Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-green-600 mb-4">Pemasukan per Kategori</h3>

          {debitStats.length > 0 ? (
            <div className="space-y-4">
              {debitStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">{stat.name}</span>
                    <span className="font-semibold text-green-600">{formatCurrency(stat.total)}</span>
                  </div>
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`${COLORS[index % COLORS.length]} h-full rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${(stat.total / maxDebit) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{stat.count} transaksi</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex items-center justify-center text-gray-400">
              Belum ada data pemasukan
            </div>
          )}
        </div>

        {/* Pengeluaran Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Pengeluaran per Kategori</h3>

          {creditStats.length > 0 ? (
            <div className="space-y-4">
              {creditStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">{stat.name}</span>
                    <span className="font-semibold text-red-600">{formatCurrency(stat.total)}</span>
                  </div>
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`${COLORS[index % COLORS.length]} h-full rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${(stat.total / maxCredit) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{stat.count} transaksi</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex items-center justify-center text-gray-400">
              Belum ada data pengeluaran
            </div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">Ringkasan Kategori</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Jenis</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Jumlah Transaksi</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((stat, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium capitalize">{stat.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stat.type === 'debit'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.type === 'debit' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">{stat.count}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    stat.type === 'debit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(stat.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
