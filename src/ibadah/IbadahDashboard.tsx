import React, { useEffect, useState } from 'react';
import { getMukholif, Mukholif } from '../lib/api';
import { Users, Clock, UserCheck, UserX } from 'lucide-react';
import { formatDate } from '../utils/format';

const KELAS_LIST = ['Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11'];

export function IbadahDashboard() {
  const [data, setData] = useState<Mukholif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMukholif().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
    </div>
  );

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const total = data.length;
  const last7 = data.filter(m => new Date(m.date) >= sevenDaysAgo).length;

  // Most frequent offender
  const nameCounts: Record<string, number> = {};
  data.forEach(m => { nameCounts[m.nama] = (nameCounts[m.nama] || 0) + 1; });
  const topName = Object.entries(nameCounts).sort((a, b) => b[1] - a[1])[0];

  // Most recent
  const latest = data[0];

  // Last 14 days trend
  const days14: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    days14.push({ label, count: data.filter(m => m.date === key).length });
  }
  const max14 = Math.max(...days14.map(d => d.count), 1);

  // Per jenis distribution
  const jenisCounts: Record<string, number> = {};
  data.forEach(m => { jenisCounts[m.jenis] = (jenisCounts[m.jenis] || 0) + 1; });
  const jenisEntries = Object.entries(jenisCounts).sort((a, b) => b[1] - a[1]);

  // Per kelas
  const kelasCounts: Record<string, number> = {};
  data.forEach(m => { kelasCounts[m.kelas] = (kelasCounts[m.kelas] || 0) + 1; });
  const maxKelas = Math.max(...KELAS_LIST.map(k => kelasCounts[k] || 0), 1);

  // Top 5 offenders
  const top5 = Object.entries(nameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nama, count]) => ({ nama, count, kelas: data.find(m => m.nama === nama)?.kelas || '' }));

  const stats = [
    { label: 'TOTAL MUKHOLIF', value: total,         Icon: Users },
    { label: '7 HARI TERAKHIR', value: last7,        Icon: Clock },
    { label: 'MUKHOLIF TERBANYAK', value: topName ? topName[0] : '—', Icon: UserX },
    { label: 'MUKHOLIF TERAKHIR',  value: latest ? latest.nama : '—', Icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <p className="text-sm text-gray-400">Ringkasan statistik mukholif</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-2xl font-bold text-black truncate max-w-[140px]">{value}</p>
            </div>
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 14-day trend */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">Tren 14 Hari Terakhir</p>
          <div className="flex items-end gap-1.5 h-32">
            {days14.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-black rounded-t transition-all duration-500"
                  style={{ height: `${(d.count / max14) * 100}%`, minHeight: d.count > 0 ? '4px' : '1px', opacity: d.count > 0 ? 1 : 0.1 }}
                />
                <span className="text-[8px] text-gray-400 rotate-45 origin-left w-8 truncate">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribusi jenis */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">Distribusi Per Jenis</p>
          {jenisEntries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-8">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {jenisEntries.map(([jenis, count]) => (
                <div key={jenis}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 truncate">{jenis}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Per kelas + top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Per kelas bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">Per Kelas</p>
          <div className="flex items-end gap-4 h-28">
            {KELAS_LIST.map(k => {
              const count = kelasCounts[k] || 0;
              return (
                <div key={k} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-black">{count || ''}</span>
                  <div
                    className="w-full bg-gray-800 rounded-t transition-all duration-500"
                    style={{ height: `${(count / maxKelas) * 80}%`, minHeight: count > 0 ? '4px' : '2px', opacity: count > 0 ? 1 : 0.1 }}
                  />
                  <span className="text-[9px] text-gray-500">{k.replace('Kelas ', '')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">5 Mukholif Terbanyak</p>
          {top5.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-8">Belum ada data</p>
          ) : (
            <div className="space-y-2">
              {top5.map(({ nama, count, kelas }, i) => (
                <div key={nama} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-black">{nama}</p>
                      <p className="text-xs text-gray-400">{kelas}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">{count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
