import React, { useState, useEffect } from 'react';
import {
  Transaction,
  getTransactions,
  deleteTransaction,
  deleteAllTransactions,
  updateTransaction,
} from '../lib/api';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/format';
import {
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Edit2,
  Search,
  Filter,
  X,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export function Riwayat() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ amount: '', description: '', category: '', date: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const itemsPerPage = 10;

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

  useEffect(() => {
    let result = transactions;

    if (search) {
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType);
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [transactions, search, filterType]);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;

    try {
      await deleteTransaction(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      await deleteAllTransactions();
      await fetchData();
      setShowDeleteAllModal(false);
    } catch (error) {
      console.error('Error deleting all transactions:', error);
      alert('Gagal menghapus semua transaksi');
    } finally {
      setDeletingAll(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      date: formatDateForInput(transaction.date),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateTransaction(editingId, {
        amount: parseFloat(editData.amount),
        description: editData.description,
        category: editData.category,
        date: editData.date,
      });
      setEditingId(null);
      await fetchData();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ amount: '', description: '', category: '', date: '' });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Riwayat Transaksi</h1>
          <p className="text-gray-500">Semua catatan keuangan ({filtered.length} transaksi)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari transaksi..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-black transition-all duration-300"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'debit' | 'credit')}
                className="bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-black transition-all duration-300"
              >
                <option value="all">Semua</option>
                <option value="debit">Debit (Masuk)</option>
                <option value="credit">Kredit (Keluar)</option>
              </select>
            </div>
          </div>

          {/* Delete All Button */}
          {transactions.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-all duration-300 font-medium"
            >
              <Trash2 className="w-5 h-5" />
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">Hapus Semua Transaksi?</h3>
                <p className="text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Anda akan menghapus <span className="font-bold text-black">{transactions.length} transaksi</span> secara permanen. Data yang sudah dihapus tidak dapat dikembalikan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deletingAll}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deletingAll}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingAll ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Ya, Hapus Semua
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Tanggal</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Deskripsi</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Kategori</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600">Jumlah</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p>Tidak ada data transaksi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((t, index) => (
                  <tr
                    key={t.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      editingId === t.id ? 'bg-yellow-50' : ''
                    }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="py-4 px-6">
                      {editingId === t.id ? (
                        <input
                          type="date"
                          value={editData.date}
                          onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                          className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">{formatDate(t.date)}</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            t.type === 'debit' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {t.type === 'debit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        {editingId === t.id ? (
                          <input
                            type="text"
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black w-full"
                          />
                        ) : (
                          <span className="font-medium text-black">{t.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {editingId === t.id ? (
                        <input
                          type="text"
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black"
                        />
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                          {t.category}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingId === t.id ? (
                        <input
                          type="number"
                          value={editData.amount}
                          onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                          className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm w-32 text-right focus:outline-none focus:border-black"
                        />
                      ) : (
                        <span
                          className={`font-semibold ${
                            t.type === 'debit' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {t.type === 'debit' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === t.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(t)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} transaksi
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
