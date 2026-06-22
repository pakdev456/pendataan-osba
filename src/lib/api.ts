import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required. Add it to .env and restart Vite.');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required. Add it to .env and restart Vite.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Auth API
const functionHeaders = {
  'Content-Type': 'application/json',
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
};

export async function login(username: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${supabaseUrl}/functions/v1/auth/login`, {
    method: 'POST',
    headers: functionHeaders,
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login gagal');
  }

  return response.json();
}

export async function verifySession(token: string): Promise<{ valid: boolean; user?: User }> {
  const response = await fetch(`${supabaseUrl}/functions/v1/auth/verify`, {
    method: 'POST',
    headers: functionHeaders,
    body: JSON.stringify({ token }),
  });

  return response.json();
}

export async function logout(token: string): Promise<void> {
  await fetch(`${supabaseUrl}/functions/v1/auth/logout`, {
    method: 'POST',
    headers: functionHeaders,
    body: JSON.stringify({ token }),
  });
}

// Transactions API
export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({ ...transaction, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAllTransactions(): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all by using a condition that's always true

  if (error) throw error;
}

// Mukholif API (Qism Ibadah)
export interface Mukholif {
  id: string;
  nama: string;
  kelas: string;
  jenis: string;
  catatan: string;
  date: string;
  created_at: string;
}

export async function getMukholif(): Promise<Mukholif[]> {
  const { data, error } = await supabase
    .from('mukholif')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addMukholif(m: Omit<Mukholif, 'id' | 'created_at'>): Promise<Mukholif> {
  const { data, error } = await supabase
    .from('mukholif')
    .insert([m])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMukholif(id: string): Promise<void> {
  const { error } = await supabase.from('mukholif').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteAllMukholif(): Promise<void> {
  const { error } = await supabase
    .from('mukholif')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

// Pelanggaran API (Qism Kebersihan, Bahasa, Keamanan)
export interface Pelanggaran {
  id: string;
  nama: string;
  kelas: string;
  jenis: string;
  catatan: string;
  date: string;
  created_at: string;
}

type PelanggaranTable = 'pelanggaran_kebersihan' | 'pelanggaran_bahasa' | 'pelanggaran_keamanan';

async function getPelanggaran(table: PelanggaranTable): Promise<Pelanggaran[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function addPelanggaran(
  table: PelanggaranTable,
  m: Omit<Pelanggaran, 'id' | 'created_at'>,
): Promise<Pelanggaran> {
  const { data, error } = await supabase
    .from(table)
    .insert([m])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deletePelanggaran(table: PelanggaranTable, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

async function deleteAllPelanggaran(table: PelanggaranTable): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

export const getPelanggaranKebersihan = () => getPelanggaran('pelanggaran_kebersihan');
export const addPelanggaranKebersihan = (m: Omit<Pelanggaran, 'id' | 'created_at'>) =>
  addPelanggaran('pelanggaran_kebersihan', m);
export const deletePelanggaranKebersihan = (id: string) =>
  deletePelanggaran('pelanggaran_kebersihan', id);
export const deleteAllPelanggaranKebersihan = () =>
  deleteAllPelanggaran('pelanggaran_kebersihan');

export const getPelanggaranBahasa = () => getPelanggaran('pelanggaran_bahasa');
export const addPelanggaranBahasa = (m: Omit<Pelanggaran, 'id' | 'created_at'>) =>
  addPelanggaran('pelanggaran_bahasa', m);
export const deletePelanggaranBahasa = (id: string) =>
  deletePelanggaran('pelanggaran_bahasa', id);
export const deleteAllPelanggaranBahasa = () =>
  deleteAllPelanggaran('pelanggaran_bahasa');

export const getPelanggaranKeamanan = () => getPelanggaran('pelanggaran_keamanan');
export const addPelanggaranKeamanan = (m: Omit<Pelanggaran, 'id' | 'created_at'>) =>
  addPelanggaran('pelanggaran_keamanan', m);
export const deletePelanggaranKeamanan = (id: string) =>
  deletePelanggaran('pelanggaran_keamanan', id);
export const deleteAllPelanggaranKeamanan = () =>
  deleteAllPelanggaran('pelanggaran_keamanan');

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => {
    if (t.type === 'debit') {
      return acc + t.amount;
    } else {
      return acc - t.amount;
    }
  }, 0);
}

export function calculateTotalDebit(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, t) => acc + t.amount, 0);
}

export function calculateTotalCredit(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'credit')
    .reduce((acc, t) => acc + t.amount, 0);
}
