import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, AlertCircle } from 'lucide-react';
import { addTransaction, Transaction } from '../lib/api';
import { formatCurrency } from '../utils/format';

const categories = [
  'kas bulanan',
  'kas mendadak',
  'iuran kegiatan',
  'sumbangan',
  'belanja alat tulis',
  'belanja perlengkapan',
  'belanja konsumsi',
  'transportasi',
  'kegiatan osba',
  'lainnya',
];

export function TambahTransaksi({ onAdd }: { onAdd?: () => void }) {
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('lainnya');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Jumlah harus berupa angka positif');
      }

      await addTransaction({
        type,
        amount: amountNum,
        description,
        category,
        date,
      });

      setSuccess(true);
      setAmount('');
      setDescription('');
      setCategory('lainnya');
      setDate(new Date().toISOString().split('T')[0]);

      setTimeout(() => {
        setSuccess(false);
        onAdd?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-black mb-6">Tambah Transaksi</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600 block">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('debit')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                  type === 'debit'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  type === 'debit' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <ArrowDownRight className={`w-6 h-6 ${type === 'debit' ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${type === 'debit' ? 'text-green-600' : 'text-gray-600'}`}>
                    Debit
                  </p>
                  <p className="text-xs text-gray-400">Masuk saldo</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('credit')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                  type === 'credit'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  type === 'credit' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <ArrowUpRight className={`w-6 h-6 ${type === 'credit' ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${type === 'credit' ? 'text-red-600' : 'text-gray-600'}`}>
                    Kredit
                  </p>
                  <p className="text-xs text-gray-400">Keluar saldo</p>
                </div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 block">Jumlah (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setAmount(val);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-14 pr-4 text-xl font-semibold text-black focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-300"
                placeholder="0"
                required
              />
              {amount && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  = {formatCurrency(parseFloat(amount))}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 block">Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-black focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-300"
              placeholder="Keterangan transaksi..."
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 block">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-black focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-300"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 block">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-black focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-300"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-xl p-3 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Transaksi berhasil disimpan!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
              type === 'debit'
                ? 'bg-green-500 hover:bg-green-600 active:scale-[0.98]'
                : 'bg-red-500 hover:bg-red-600 active:scale-[0.98]'
            } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </span>
            ) : success ? (
              'Berhasil!'
            ) : (
              `Simpan Transaksi ${type === 'debit' ? '(Debit)' : '(Kredit)'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
