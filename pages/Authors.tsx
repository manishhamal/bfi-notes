import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, User, BookOpen, ArrowRight, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import FadeIn from '../components/FadeIn';
import ArticleCard from '../components/ArticleCard';

interface AuthorProfile {
  name: string;
  avatar: string;
  bio: string;
  noteCount: number;
  topics: string[];
}

const Authors: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAuthorParam = searchParams.get('name');
  
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
        setAllArticles(data);
        
        // Derive unique authors
        const authorMap = new Map<string, AuthorProfile>();
        
        data.forEach(article => {
          const name = article.author_name || 'Admin';
          if (!authorMap.has(name)) {
            authorMap.set(name, {
              name,
              avatar: article.author_avatar || `https://ui-avatars.com/api/?name=${name}&background=random`,
              bio: article.author_bio || 'BFI Subject Matter Expert',
              noteCount: 0,
              topics: []
            });
          }
          
          const profile = authorMap.get(name)!;
          profile.noteCount += 1;
          if (article.category && !profile.topics.includes(article.category)) {
            profile.topics.push(article.category);
          }
        });
        
        setAuthors(Array.from(authorMap.values()));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredAuthors = useMemo(() => {
    if (!searchQuery) return authors;
    const lowerQuery = searchQuery.toLowerCase();
    return authors.filter(a => 
      a.name.toLowerCase().includes(lowerQuery) || 
      a.topics.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [authors, searchQuery]);

  const selectedAuthor = useMemo(() => {
    if (!selectedAuthorParam) return null;
    return authors.find(a => a.name === selectedAuthorParam) || null;
  }, [authors, selectedAuthorParam]);

  const selectedAuthorArticles = useMemo(() => {
    if (!selectedAuthorParam) return [];
    return allArticles.filter(a => (a.author_name || 'Admin') === selectedAuthorParam);
  }, [allArticles, selectedAuthorParam]);

  const handleSelectAuthor = (name: string | null) => {
    if (name) {
      setSearchParams({ name });
    } else {
      searchParams.delete('name');
      setSearchParams(searchParams);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading Authors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header Section */}
      <header className="mb-10">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5 px-0.5">
                Authors
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg">
                A collection of notes and Materials from fellow students and mentors walking the same path.
              </p>
            </div>
            
            {/* Slimmer Search Bar */}
            <div className="relative group w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search authors or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500/10 transition-all font-medium text-xs placeholder:text-slate-400/80"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Selected Author Detail View (Refined) */}
        <AnimatePresence mode="wait">
          {selectedAuthor && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none mb-12 relative"
            >
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={() => handleSelectAuthor(null)}
                  className="px-3 py-1.5 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  <ArrowRight size={14} className="rotate-180" /> Back to Authors
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border-2 border-white dark:border-slate-800">
                  <img 
                    src={selectedAuthor.avatar} 
                    alt={selectedAuthor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2.5">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedAuthor.name}</h2>
                    <span className="px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-md">
                      {selectedAuthor.noteCount} Notes
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-5 font-medium max-w-2xl">
                    {selectedAuthor.bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAuthor.topics.map(topic => (
                      <span key={topic} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-md border border-slate-200/50 dark:border-slate-700/50 uppercase tracking-wider">
                        #{topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Author's Notes List */}
              <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-slate-900 dark:text-white">
                  <BookOpen size={18} className="text-primary-500" />
                  Notes by {selectedAuthor.name}
                </h3>
                <div className="space-y-8">
                  {selectedAuthorArticles.map((article, idx) => (
                    <FadeIn key={article.id} delay={idx * 50}>
                      <ArticleCard article={{
                        ...article,
                        authorName: article.author_name || 'Admin',
                        tags: article.tags || []
                      }} />
                    </FadeIn>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modern Compact Authors Grid */}
      {!selectedAuthor && (
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAuthors.map((author, index) => (
              <motion.div
                key={author.name}
                whileHover={{ y: -3, shadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" }}
                className="group bg-white dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800 hover:border-primary-500/20 dark:hover:border-primary-400/20 transition-all cursor-pointer"
                onClick={() => handleSelectAuthor(author.name)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-slate-50 dark:ring-slate-800 group-hover:ring-primary-500/10 transition-all">
                    <img 
                      src={author.avatar} 
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors text-sm">
                      {author.name}
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                      {author.noteCount} Notes
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-5 leading-normal font-medium">
                  {author.bio}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex flex-wrap gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    {author.topics.slice(0, 2).map((topic, i) => (
                      <span key={topic} className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">
                        {topic}
                      </span>
                    ))}
                    {author.topics.length > 2 && (
                      <span className="text-[9px] font-bold text-primary-500 px-1.5 py-0.5 rounded">
                        +{author.topics.length - 2}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredAuthors.length === 0 && (
            <div className="py-20 text-center text-slate-500 font-mono text-sm border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
              <p>No authors found matching your search.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-xs font-extrabold uppercase tracking-widest text-primary-600 hover:text-primary-500 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </FadeIn>
      )}
    </div>
  );
};

export default Authors;
