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
export async function login(username: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${supabaseUrl}/functions/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  return response.json();
}

export async function logout(token: string): Promise<void> {
  await fetch(`${supabaseUrl}/functions/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
