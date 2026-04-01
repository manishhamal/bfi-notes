import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ArticleCard from '../components/ArticleCard';
import FadeIn from '../components/FadeIn';
import { Category } from '../types';
import { supabase } from '../lib/supabase';

const Articles: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || Category.All);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`id, title, title_ne, category, excerpt, excerpt_ne, tags, date, read_time, author_name, author_avatar, views`)
        .order('date', { ascending: false });

      if (!error && data) {
        setArticles(data.map(a => ({
          ...a,
          authorName: a.author_name || 'Admin',
          tags: a.tags || []
        })));
      }
      setLoading(false);
    };
    fetchArticles();
  }, []);

  // Sync state with URL param if it changes externally
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory(Category.All);
    }
  }, [categoryParam]);

  // Focus input when search opens on mobile
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory = activeCategory === Category.All || article.category === activeCategory;
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        article.title?.toLowerCase().includes(searchLower) || 
        article.excerpt?.toLowerCase().includes(searchLower) ||
        article.content?.toLowerCase().includes(searchLower) ||
        (article.authorName?.toLowerCase().includes(searchLower)) ||
        (article.tags || []).some((tag: string) => tag.toLowerCase().includes(searchLower));
        
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, articles]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === Category.All) {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      // 1. Check for Category match
      const matchedCategory = Object.values(Category).find(cat => cat.toLowerCase() === query);
      if (matchedCategory) {
        handleCategoryChange(matchedCategory);
        setSearchQuery('');
        return;
      }

      // 2. Check for Author match
      const authors = Array.from(new Set(articles.map(a => a.authorName).filter(Boolean))) as string[];
      const matchedAuthor = authors.find(name => name.toLowerCase() === query);
      if (matchedAuthor) {
        navigate(`/authors?name=${encodeURIComponent(matchedAuthor)}`);
        setSearchQuery('');
        return;
      }

      // 3. Fallback: Navigate to the first filtered article
      if (filteredArticles.length > 0) {
        navigate(`/articles/${filteredArticles[0].id}`);
        setSearchQuery('');
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    
    if (Math.abs(x - startX) > 5) {
      setHasMoved(true);
      e.preventDefault();
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div className="pb-24">
      <FadeIn>
        <div className="mb-12">
          <div className="relative bg-slate-100 dark:bg-slate-900/50 flex items-center h-12 text-[10px] md:text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {/* BFI Notes Logo - Always Visible */}
            <button 
              onClick={() => handleCategoryChange(Category.All)}
              className={`flex-shrink-0 h-full px-4 md:px-8 flex items-center transition-colors border-r border-slate-200 dark:border-slate-800 whitespace-nowrap z-20 ${
                activeCategory === Category.All 
                  ? 'bg-slate-200 dark:bg-slate-800 text-primary-600 dark:text-primary-400' 
                  : 'text-slate-900 dark:text-white hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
              }`}
            >
              BFI Notes
            </button>

            {/* Category Tabs - Hidden on mobile when search is open */}
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex-1 min-w-0 flex items-center h-full overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain cursor-grab active:cursor-grabbing select-none transition-opacity duration-200 ${isDragging ? 'scroll-auto' : 'scroll-smooth'} ${isSearchOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}
            >
              {Object.values(Category).filter(cat => cat !== Category.All).map((cat) => {
                // Smart Search Highlight for Categories
                const isMatchedBySearch = searchQuery.trim() && cat.toLowerCase().includes(searchQuery.toLowerCase().trim());
                
                return (
                  <button
                    key={cat}
                    onClick={() => !hasMoved && handleCategoryChange(cat)}
                    className={`flex-shrink-0 h-full px-4 md:px-8 whitespace-nowrap transition-all border-r border-slate-200 dark:border-slate-800 last:border-r-0 active:scale-95 flex items-center gap-2 ${
                      activeCategory === cat
                        ? 'bg-slate-200 dark:bg-slate-800 text-primary-600 dark:text-primary-400'
                        : isMatchedBySearch
                          ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                          : 'text-slate-500 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                    {isMatchedBySearch && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />}
                  </button>
                );
              })}
            </div>

            {/* Search Section */}
            <div className="flex-shrink-0 h-full flex items-center z-30">
              {/* Desktop Search - Always Visible */}
              <div className="hidden md:flex items-center px-6 border-l border-slate-200 dark:border-slate-800 gap-3 h-full bg-white/50 dark:bg-black/20">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onKeyDown={handleSearchKeyDown}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-xs w-40 placeholder:text-slate-400 font-medium normal-case tracking-normal"
                />
              </div>

              {/* Mobile Search Toggle */}
              <div className="md:hidden flex items-center h-full">
                <AnimatePresence mode="wait">
                  {!isSearchOpen ? (
                    <motion.button
                      key="search-icon"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setIsSearchOpen(true)}
                      className="h-full px-5 flex items-center border-l border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Search size={16} />
                    </motion.button>
                  ) : (
                    <motion.div
                      key="search-expanded"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="absolute inset-y-0 right-0 left-[100px] bg-slate-100 dark:bg-slate-900 flex items-center px-4 gap-3 z-40 border-l border-slate-200 dark:border-slate-800"
                    >
                      <Search size={14} className="text-slate-400 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search everything..."
                        value={searchQuery}
                        onKeyDown={handleSearchKeyDown}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none text-[10px] placeholder:text-slate-400 font-medium normal-case tracking-normal"
                      />
                      <button 
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        {loading && (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-6 items-start">
                <div className="flex-1 space-y-3">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-full" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>

      {!loading && filteredArticles.length > 0 ? (
        <div className="space-y-12">
          {filteredArticles.map((article, index) => (
            <FadeIn key={article.id} delay={index * 50}>
              <ArticleCard article={article} />
            </FadeIn>
          ))}
        </div>
      ) : !loading ? (
        <div className="py-20 text-center text-slate-500 font-mono text-sm">
          <p>No entries found.</p>
          <button 
            onClick={() => {setSearchQuery(''); setActiveCategory(Category.All)}}
            className="mt-4 text-slate-900 dark:text-slate-100 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Articles;