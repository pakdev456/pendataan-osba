import React, { useEffect, useState } from 'react';
import { Pelanggaran } from '../lib/api';
import { QismConfig } from './config';
import { Plus, Search, Trash2, AlertTriangle, X, Check } from 'lucide-react';
import { formatDate } from '../utils/format';

const KELAS_LIST = ['Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11'];

interface Props {
  config: QismConfig;
}

export function QismPendataan({ config }: Props) {
  const [data, setData] = useState<Pelanggaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('Kelas 9');
  const [jenisUtama, setJenisUtama] = useState(config.jenisUtama[0]);
  const [subJenis, setSubJenis] = useState('');
  const [catatan, setCatatan] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    try { setData(await config.api.get()); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [config]);

  const filtered = data.filter(m => {
    const matchSearch = !search || m.nama.toLowerCase().includes(search.toLowerCase()) || m.jenis.toLowerCase().includes(search.toLowerCase());
    const matchKelas = !filterKelas || m.kelas === filterKelas;
    return matchSearch && matchKelas;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const jenis = subJenis ? `${jenisUtama} – ${subJenis}` : jenisUtama;
    try {
      await config.api.add({ nama, kelas, jenis, catatan, date });
      setSaved(true);
      await loadData();
      setTimeout(() => { setSaved(false); setShowForm(false); resetForm(); }, 1500);
    } finally { setSaving(false); }
  };

  const resetForm = () => {
    setNama('');
    setKelas('Kelas 9');
    setJenisUtama(config.jenisUtama[0]);
    setSubJenis('');
    setCatatan('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data ini?')) return;
    await config.api.delete(id);
    await loadData();
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try { await config.api.deleteAll(); await loadData(); setShowDeleteAll(false); } finally { setDeletingAll(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-black">Pendataan</h1>
          <p className="text-sm text-gray-400">{config.pendataanSubtitle}</p>
        </div>
        <div className="flex gap-2">
          {data.length > 0 && (
            <button
              onClick={() => setShowDeleteAll(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              <Trash2 className="w-4 h-4" /> Hapus Semua Data
            </button>
          )}
          <button
            onClick={() => { setShowForm(true); resetForm(); setSaved(false); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah {config.entityLabel}
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama pelanggar..."
            className="w-full border border-gray-200 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-black transition-colors bg-white"
          />
        </div>
        <select
          value={filterKelas}
          onChange={e => setFilterKelas(e.target.value)}
          className="border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-black bg-white"
        >
          <option value="">Semua Kelas</option>
          {KELAS_LIST.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Belum ada data</p>
            <p className="text-xs mt-1">Tambah pelanggar baru untuk memulai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">No</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Jenis</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Catatan</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-400">{i + 1}</td>
                    <td className="py-3 px-4 text-sm">{formatDate(m.date)}</td>
                    <td className="py-3 px-4 text-sm font-medium text-black">{m.nama}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{m.kelas}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{m.jenis}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{m.catatan || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-black">Tambah {config.entityLabel}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-black mb-1.5 block">Nama Siswa</label>
                <input
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:border-black transition-colors"
                  placeholder="Nama lengkap siswa"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-black mb-1.5 block">Kelas</label>
                <div className="flex gap-2 flex-wrap">
                  {KELAS_LIST.map(k => (
                    <button type="button" key={k} onClick={() => setKelas(k)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${kelas === k ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-black mb-1.5 block">Jenis Pelanggaran</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {config.jenisUtama.map(j => (
                    <button type="button" key={j}
                      onClick={() => { setJenisUtama(j); setSubJenis(''); }}
                      className={`flex-1 min-w-[100px] py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${jenisUtama === j ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {j}
                    </button>
                  ))}
                </div>
                {jenisUtama === 'Lainnya' && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {config.subLainnya.map(s => (
                      <button type="button" key={s}
                        onClick={() => setSubJenis(subJenis === s ? '' : s)}
                        className={`px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-all ${subJenis === s ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-black mb-1.5 block">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-black mb-1.5 block">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
                <textarea
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  rows={2}
                  className="w-full border-2 border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="Catatan tambahan..."
                />
              </div>

              {saved && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm animate-fadeIn">
                  <Check className="w-4 h-4" /> Data pelanggar ditambahkan
                </div>
              )}

              <button
                type="submit"
                disabled={saving || saved}
                className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : saved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteAll && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-black">Hapus Semua Data?</h3>
                <p className="text-sm text-gray-400">Tidak dapat dikembalikan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Anda akan menghapus <strong>{data.length} data</strong> secara permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteAll(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all">Batal</button>
              <button onClick={handleDeleteAll} disabled={deletingAll}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {deletingAll ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <Trash2 className="w-4 h-4" />}
                {deletingAll ? 'Menghapus...' : 'Hapus Semua'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
