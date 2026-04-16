import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-primary-600 dark:text-primary-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('Login Title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to publish your notes</p>
        </div>
        
        {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/50">
              {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('Email')}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="author@bfinotes.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('Password')}</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
            {loading ? t('Logging in') : t('Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
