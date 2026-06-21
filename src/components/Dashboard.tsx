import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import {
  Transaction,
  getTransactions,
  calculateBalance,
  calculateTotalDebit,
  calculateTotalCredit,
} from '../lib/api';
import { formatCurrency, formatDate } from '../utils/format';

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const balance = calculateBalance(transactions);
  const totalDebit = calculateTotalDebit(transactions);
  const totalCredit = calculateTotalCredit(transactions);
  const recentTransactions = transactions.slice(0, 5);

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
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <p className="text-gray-500">Ringkasan keuangan OSBA</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Saldo Saat Ini</p>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(balance)}</p>
        </div>

        {/* Debit Card */}
        <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Masuk
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Pemasukan</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalDebit)}</p>
        </div>

        {/* Credit Card */}
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              Keluar
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Pengeluaran</p>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalCredit)}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-black">Transaksi Terbaru</h2>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction.type === 'debit'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'debit' ? (
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-black">{transaction.description}</p>
                    <p className="text-sm text-gray-400">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    transaction.type === 'debit' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'debit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
