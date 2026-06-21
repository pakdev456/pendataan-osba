import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { IbadahLayout } from './ibadah/IbadahLayout';
import { Toast, ToastData } from './components/Toast';
import { OsbaLogo } from './components/MoonLoader';

function AppContent() {
  const { user, loading } = useAuth();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const prevUserRef = useRef<typeof user>(null);

  const showToast = useCallback((t: Omit<ToastData, 'id'>) => {
    setToasts(prev => [...prev, { ...t, id: crypto.randomUUID() }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Welcome toast when user logs in
  useEffect(() => {
    if (!loading && user && !prevUserRef.current) {
      showToast({ type: 'success', message: `Selamat datang, ${user.name}!` });
    }
    prevUserRef.current = user ?? null;
  }, [user, loading, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full border-4 border-gray-200 border-t-gray-400 animate-spin" />
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center shadow-inner">
              <OsbaLogo size={44} />
            </div>
          </div>
          <div className="text-center mt-1">
            <p className="text-sm font-bold text-gray-800">Sistem Pendataan OSBA</p>
            <p className="text-xs text-gray-400 mt-0.5">Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast toasts={toasts} onDismiss={dismissToast} />
      {!user
        ? <Login onToast={showToast} />
        : user.role === 'ibadah'
        ? <IbadahLayout />
        : <Layout />
      }
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
