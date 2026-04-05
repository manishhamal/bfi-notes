import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Type, 
  Minus, 
  Plus, 
  Moon, 
  Sun, 
  Languages, 
  Maximize2, 
  Minimize2,
  BookOpen,
  Settings,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-toastify';
import FadeIn from '../components/FadeIn';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { marked } from 'marked';

type ReaderTheme = 'light' | 'sepia' | 'dark';

const READER_FONT_SIZE_KEY = 'bfi-notes-reader-font-size';
const READER_FONT_MIN = 12;
const READER_FONT_MAX = 32;
const READER_FONT_DEFAULT = 14;

function readStoredReaderFontSize(): number {
  if (typeof window === 'undefined') return READER_FONT_DEFAULT;
  try {
    const raw = localStorage.getItem(READER_FONT_SIZE_KEY);
    if (raw == null) return READER_FONT_DEFAULT;
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= READER_FONT_MIN && n <= READER_FONT_MAX) return n;
  } catch {
    /* ignore */
  }
  return READER_FONT_DEFAULT;
}

const ArticleReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`id, title, title_ne, content, content_ne, category, read_time, author_name, author_avatar, author_bio, views`)
        .eq('id', id)
        .single();
      
      if (data && !error) {
        setArticle({
          ...data,
          readTime: data.read_time || '5 min read',
          authorName: data.author_name || 'Admin',
          authorAvatar: data.author_avatar || null,
          authorBio: data.author_bio || 'BFI Subject Matter Expert'
        });
      }
      setLoading(false);
      
      // Increment views only once per session
      if (data && !sessionStorage.getItem(`viewed_${data.id}`)) {
        supabase.from('articles').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then();
        sessionStorage.setItem(`viewed_${data.id}`, 'true');
      }
    };
    if (id) fetchArticle();
  }, [id]);
  
  const [fontSize, setFontSize] = useState(() => readStoredReaderFontSize());
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ne'>('en');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollYRef = useRef(0);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(READER_FONT_SIZE_KEY, String(fontSize));
    } catch {
      /* quota / private mode */
    }
  }, [fontSize]);

  // Sync body background with reader theme
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const themeBg = {
      light: '#ffffff',
      sepia: '#f4ecd8',
      dark: '#121212'
    }[theme];
    
    document.body.style.backgroundColor = themeBg;
    
    // Also sync the 'dark' class for any global styles
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const element = scrollContainerRef.current;
      if (!element) return;

      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      
      // Reading progress
      if (scrollHeight > 0) {
        setReadingProgress((scrollTop / scrollHeight) * 100);
      }

      // Header visibility logic
      const diff = scrollTop - lastScrollYRef.current;
      
      // If near top, always show
      if (scrollTop < 50) {
        setShowHeader(true);
      } 
      // Scrolling down: hide header (with threshold)
      else if (diff > 10 && scrollTop > 100 && !isMenuOpen) {
        setShowHeader(false);
      } 
      // Scrolling up: show header (with threshold)
      else if (diff < -15) {
        setShowHeader(true);
      }
      
      lastScrollYRef.current = scrollTop;
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMenuOpen]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center font-bold text-slate-500 animate-pulse">
          Loading Note...
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Note not found</h2>
          <button onClick={() => navigate('/articles')} className="text-primary-600 hover:underline">
            Back to notes
          </button>
        </div>
      </div>
    );
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'ne' : 'en');
    toast.info(`Switched to ${currentLanguage === 'en' ? 'Nepali' : 'English'}`);
  };

  const themeColors = {
    light: 'bg-white text-slate-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'bg-[#121212] text-[#e0e0e0]'
  };

  const proseTheme = {
    light: 'prose-slate',
    sepia: 'prose-stone',
    dark: 'prose-invert'
  };

  return (
    <div 
      ref={scrollContainerRef}
      className={`fixed inset-0 overflow-y-auto transition-colors duration-300 ${themeColors[theme]} selection:bg-primary-200 selection:text-primary-900 z-[100]`}
    >
      <SEO 
        title={currentLanguage === 'en' ? article.title : (article.title_ne || article.title)}
        description={article.excerpt || `Read this article on BFI Notes.`}
      />
      {/* Top Navigation Bar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: showHeader ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 w-full h-16 z-[110] flex items-center justify-between px-6 border-b transition-colors duration-300 ${
          theme === 'dark' 
            ? 'border-white/10 bg-[#121212]' 
            : theme === 'sepia' 
              ? 'border-[#e2d5b5] bg-[#f4ecd8]' 
              : 'border-black/5 bg-white'
        } backdrop-blur-md`}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/articles')}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Exit Reader"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-[400px]">
              {currentLanguage === 'en' ? article.title : (article.title_ne || article.title)}
            </h1>
            <p className="text-[10px] opacity-60 uppercase tracking-widest font-bold">
              {article.category} • {article.readTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleLanguage}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all ${currentLanguage === 'ne' ? 'bg-primary-500/10 text-primary-600' : ''}`}
            title="Switch Language"
          >
            <Languages size={20} />
            <span className="text-xs font-bold uppercase">{currentLanguage}</span>
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isMenuOpen ? 'bg-black/5 dark:bg-white/5' : ''}`}
            title="Reader Settings"
          >
            <Settings size={20} />
          </button>

          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black/5 dark:bg-white/5">
          <motion.div 
            className="h-full bg-primary-500"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </motion.nav>

      {/* Settings Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed top-20 right-4 md:right-8 z-[70] w-72 rounded-2xl shadow-2xl border p-6 ${theme === 'dark' ? 'bg-[#1e1e1e] border-white/10 text-white' : 'bg-white border-black/5 text-slate-900'}`}
            >
              <div className="space-y-8">
                {/* Font Size */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-4 block">Text Size</label>
                  <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 rounded-xl p-1">
                    <button 
                      onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                      className="p-3 hover:bg-white dark:hover:bg-black/20 rounded-lg transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-sm">{fontSize}px</span>
                    <button 
                      onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                      className="p-3 hover:bg-white dark:hover:bg-black/20 rounded-lg transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-4 block">Appearance</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'sepia', 'dark'] as ReaderTheme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center ${
                          t === 'light' ? 'bg-white border-slate-200' : 
                          t === 'sepia' ? 'bg-[#f4ecd8] border-[#e2d5b5]' : 
                          'bg-[#121212] border-white/10'
                        } ${theme === t ? 'ring-2 ring-primary-500 border-transparent' : 'opacity-60 hover:opacity-100'}`}
                      >
                        {t === 'light' && <Sun size={16} className="text-slate-400" />}
                        {t === 'sepia' && <BookOpen size={16} className="text-[#8c7355]" />}
                        {t === 'dark' && <Moon size={16} className="text-slate-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fullscreen Toggle */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-4 block">Screen Mode</label>
                  <button 
                    onClick={toggleFullscreen}
                    className="w-full flex items-center justify-between bg-black/5 dark:bg-white/5 rounded-xl p-4 font-bold text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto document-container">
          <FadeIn>
            <header className="mb-8 text-center">
              <div className="inline-block px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                {article.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                {currentLanguage === 'en' ? article.title : (article.title_ne || article.title)}
              </h1>
              {currentLanguage === 'ne' && !article.title_ne && (
                <p className="mt-2 text-xs text-amber-500 font-medium italic">Nepali version not available, showing English.</p>
              )}
            </header>
          </FadeIn>

          <FadeIn delay={200}>
            <div
              className={[
                'document-paper mb-12',
                theme === 'sepia' ? 'document-paper-sepia' : '',
                'professional-doc',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div 
                ref={contentRef}
                lang={currentLanguage === 'ne' ? 'ne' : 'en'}
                className={`prose prose-lg max-w-none transition-all duration-300 ${proseTheme[theme]}
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-p:leading-normal
                  prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-6 prose-blockquote:italic
                  prose-li:mb-2
                  [&_mark]:px-1 [&_mark]:rounded-sm`}
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ 
                  __html: (() => {
                    let html = currentLanguage === 'en' ? article.content : (article.content_ne || article.content);
                    if (!html) return '';
                    
                    // If content has literal markdown syntax hanging around, parse it
                    if (html.includes('### ') || html.includes('**')) {
                      let unescaped = html;
                      // Remove Tiptap or copy/paste wrappers that break markdown block parsing
                      unescaped = unescaped.replace(/<pre[^>]*>/gi, '\n\n').replace(/<\/pre>/gi, '\n\n');
                      unescaped = unescaped.replace(/<code[^>]*>/gi, '').replace(/<\/code>/gi, '');
                      unescaped = unescaped.replace(/<p[^>]*>/gi, '\n\n').replace(/<\/p>/gi, '\n\n');
                      unescaped = unescaped.replace(/<br\s*\/?>/gi, '\n');
                      unescaped = unescaped.replace(/&nbsp;/g, ' ');
                      // Unescape HTML entities that tiptap might have encoded
                      unescaped = unescaped.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                      return marked.parse(unescaped) as string;
                    }
                    
                    return html;
                  })() as string
                }}
              />
            </div>
          </FadeIn>

          {/* Author Section */}
          <FadeIn delay={400}>
            <div className={`mt-12 pt-8 border-t flex items-center justify-end gap-6 ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest font-bold text-primary-500 mb-1">About the Author</p>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{article.authorName}</h3>
                <p className="text-sm opacity-60 font-medium mt-1 leading-relaxed max-w-[250px] ml-auto text-slate-600 dark:text-slate-400">
                  {article.authorBio || 'BFI Subject Matter Expert'}
                </p>
              </div>
              <Link 
                to={`/authors?name=${encodeURIComponent(article.authorName)}`}
                className="relative group block"
                title={`View ${article.authorName}'s profile`}
              >
                <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={article.authorAvatar || `https://ui-avatars.com/api/?name=${article.authorName}&background=random`} 
                  alt={article.authorName}
                  loading="lazy"
                  className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-xl grayscale group-hover:grayscale-0 transition-all duration-500 ring-4 ring-transparent group-hover:ring-primary-500/10 cursor-pointer"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                  <ChevronRight size={14} />
                </div>
              </Link>
            </div>
          </FadeIn>
        </div>
      </main>

      {/* Bottom Floating Navigation (Mobile) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 sm:hidden">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl border backdrop-blur-xl transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/10 border-white/10 text-white' : 'bg-black/5 border-black/5 text-slate-900'}`}
        >
          <Type size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Appearance</span>
        </button>
      </div>
    </div>
  );
};

export default ArticleReader;
