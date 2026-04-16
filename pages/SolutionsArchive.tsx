import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import FadeIn from '../components/FadeIn';
import { FileText, ArrowLeft, Loader2, Calendar, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SolutionsArchive() {
  const { bank, level } = useParams<{ bank: string; level: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSolutions = async () => {
      if (!bank || !level) return;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('bank', decodeURIComponent(bank))
        .eq('level', decodeURIComponent(level))
        .order('year', { ascending: false });

      if (!error && data) {
        setSolutions(data);
      }
      setLoading(false);
    };

    fetchSolutions();
  }, [bank, level]);

  const filteredSolutions = solutions.filter(s => 
    (s.year || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.title_ne || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const decodedBank = decodeURIComponent(bank || '');
  const decodedLevel = decodeURIComponent(level || '');

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="mb-8">
            <button
              onClick={() => navigate(`/solutions/${encodeURIComponent(bank!)}`)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full w-fit"
            >
              <ArrowLeft size={16} />
              {t('Go Back')}
            </button>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest text-xs mb-2">
              <span className="bg-primary-100 dark:bg-primary-900/30 px-2.5 py-1 rounded-md">{t(decodedBank)}</span>
              <span>•</span>
              <span className="bg-primary-100 dark:bg-primary-900/30 px-2.5 py-1 rounded-md">{t(decodedLevel)}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              {t('Solutions Archive Title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {t('Solutions Subtitle')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            {!loading && solutions.length > 0 && (
              <div className="mb-8 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t('Search year or topic')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : solutions.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium text-lg text-slate-900 dark:text-white mb-1">{t('No solutions found')}</p>
                <p>{t('No solutions desc')}</p>
              </div>
            ) : filteredSolutions.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                <p className="font-medium text-lg text-slate-900 dark:text-white mb-1">{t('No matches')}</p>
                <p>{t('Try different search')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSolutions.map((s, idx) => {
                  const displayTitle = (i18n.language === 'np' && s.title_ne) ? s.title_ne : s.title;
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/articles/${s.id}`)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:ring-4 hover:ring-primary-500/10 transition-all text-left group bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Calendar size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-0.5 truncate">
                          {s.year || t('Solution')}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {displayTitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
