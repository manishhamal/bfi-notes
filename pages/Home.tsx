import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import SEO from '../components/SEO';
import { Category } from '../types';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const categories = Object.values(Category).filter(cat => cat !== Category.All);
  const { t } = useTranslation();
  
  const [latestArticles, setLatestArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase
        .from('articles')
        .select(`id, title, title_ne, category, excerpt, excerpt_ne, date, read_time, author_name`)
        .order('date', { ascending: false })
        .limit(5);
      
      if (data) {
        setLatestArticles(data.map(a => ({
          ...a,
          authorName: a.author_name || 'Admin'
        })));
      }
      setLoading(false);
    };
    fetchLatest();
  }, []);

  const memoizedArticles = useMemo(() => latestArticles, [latestArticles]);
  const { i18n } = useTranslation();

  return (
    <div className="pb-24">
      <SEO 
        title={t('Home')} 
        description={`BFI Notes: ${t('BY Students, For Students.')} High-quality study materials for Banking and Finance exams in Nepal.`} 
      />
      
      <FadeIn>
        <div className="text-left space-y-6 mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('BFI Notes')}: <span className="text-primary-600 dark:text-primary-400">{t('BY Students, For Students.')}</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            {t('Home Subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link 
              to="/materials" 
              className="px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-3 shadow-xl shadow-primary-500/10 active:scale-95"
            >
              {t('All Materials')} <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <section className="space-y-8 mb-20">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              {t('Subject Categories')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link 
                key={cat}
                to={`/articles?category=${encodeURIComponent(cat)}&view=collection`}
                className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {t(cat)}
                  </h3>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-all group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={400}>
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              {t('Latest Study Materials')}
            </h2>
            <Link to="/articles" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline">
              {t('View All')}
            </Link>
          </div>
          
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
               <div className="py-4 text-slate-500 animate-pulse">{t('Loading latest notes')}</div>
            ) : memoizedArticles.length === 0 ? (
               <div className="py-4 text-slate-500">{t('No notes found.')}</div>
            ) : null}
            {memoizedArticles.map((article) => {
              const displayTitle = (i18n.language === 'np' && article.title_ne) ? article.title_ne : article.title;
              const displayExcerpt = (i18n.language === 'np' && article.excerpt_ne) ? article.excerpt_ne : article.excerpt;
              return (
                <li key={article.id} className="group">
                  <Link to={`/articles/${article.id}`} className="py-6 block">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                          {t(article.category)}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {displayTitle}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1">
                          {displayExcerpt}
                        </p>
                      </div>
                      <div className="text-xs font-mono text-slate-400 whitespace-nowrap text-right">
                        {new Date(article.date).toLocaleDateString()} • {article.read_time || '5 min read'}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </FadeIn>

    </div>
  );
};

export default Home;
