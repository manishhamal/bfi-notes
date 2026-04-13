import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Maximize2, 
  Minimize2,
  BookOpen,
  Settings,
  ChevronRight,
  Type,
  Minus,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FadeIn from '../components/FadeIn';
import { supabase } from '../lib/supabase';
import Watermark from '../components/Watermark';
import { Document, Page, pdfjs } from 'react-pdf';
import DOMPurify from 'dompurify';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type ReaderTheme = 'light' | 'sepia' | 'dark';

const READER_FONT_SIZE_KEY = 'bfi-notes-oq-font-size';
const READER_FONT_MIN = 12;
const READER_FONT_MAX = 32;
const READER_FONT_DEFAULT = 16;

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

export default function OldQuestionsReader() {
  const { id, bank, level } = useParams<{ id: string; bank: string; level: string }>();
  const navigate = useNavigate();
  
  const [oq, setOq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(() => readStoredReaderFontSize());
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const fetchOQ = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('old_questions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data && !error) {
        setOq(data);
      }
      setLoading(false);
    };
    fetchOQ();
  }, [id]);

  useEffect(() => {
    try {
      localStorage.setItem(READER_FONT_SIZE_KEY, String(fontSize));
    } catch {
      /* quota / private mode */
    }
  }, [fontSize]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const themeBg = {
      light: '#f8fafc',
      sepia: '#faf4e8',
      dark: '#020617'
    }[theme];
    
    document.body.style.backgroundColor = themeBg;
    
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
    if (!contentRef.current || !oq?.pdf_url) return;
    setContainerWidth(contentRef.current.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [oq, isFullscreen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!oq) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Past Paper Not Found</h1>
        <button onClick={() => navigate(-1)} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl transition-all font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const themeColors = {
    light: 'bg-slate-50 text-slate-800',
    sepia: 'bg-[#faf4e8] text-[#5c4b37]',
    dark: 'bg-slate-950 text-slate-200'
  };

  const navColors = {
    light: 'bg-white/80 border-slate-200',
    sepia: 'bg-[#f4ebd8]/80 border-[#dccdaz]',
    dark: 'bg-slate-900/80 border-slate-800'
  };

  const proseTheme = {
    light: 'prose-slate',
    sepia: 'prose-stone',
    dark: 'prose-invert'
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-500 ${themeColors[theme]}`}>
      <Watermark />
      <motion.header 
        className={`shrink-0 z-40 transition-all duration-300 ${navColors[theme]} backdrop-blur-md border-b`}
        initial={{ y: 0 }}
        animate={{ y: showHeader ? 0 : -100 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/old-questions/${encodeURIComponent(bank!)}/${encodeURIComponent(level!)}`)}>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full shadow-sm">
                <ArrowLeft size={16} />
                <span>Go Back</span>
              </div>
              <div className="hidden sm:flex flex-col border-l border-slate-200 dark:border-slate-700 pl-4">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">Old Question</span>
                 <span className="font-bold tracking-tight leading-none truncate max-w-[150px]">{decodeURIComponent(bank || '')} {oq.year}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               {oq.content && (
                 <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full p-1 mr-2">
                    <button onClick={() => setFontSize(Math.max(READER_FONT_MIN, fontSize - 2))} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors"><Minus size={14} /></button>
                    <span className="text-xs font-bold w-8 text-center">{fontSize}</span>
                    <button onClick={() => setFontSize(Math.min(READER_FONT_MAX, fontSize + 2))} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors"><Plus size={14} /></button>
                 </div>
               )}
               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isMenuOpen ? 'bg-black/5 dark:bg-white/5' : ''}`}><Settings size={20} /></button>
            </div>
          </div>
        </div>
      </motion.header>

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
                {oq.content && (
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-4 block">Text Size</label>
                    <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 rounded-xl p-1">
                      <button 
                        onClick={() => setFontSize(Math.max(READER_FONT_MIN, fontSize - 2))}
                        className="p-3 hover:bg-white dark:hover:bg-black/20 rounded-lg transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-sm">{fontSize}px</span>
                      <button 
                        onClick={() => setFontSize(Math.min(READER_FONT_MAX, fontSize + 2))}
                        className="p-3 hover:bg-white dark:hover:bg-black/20 rounded-lg transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}

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

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="min-h-full py-16 px-4 flex justify-center">
          <FadeIn className="w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8 justify-center">
               <span className="text-xs font-bold uppercase tracking-wider text-primary-600">{decodeURIComponent(bank || '')}</span>
               <ChevronRight size={14} />
               <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{oq.year} Paper</span>
            </div>

            <div ref={contentRef} className="w-full">
              {oq.content ? (() => {
                // Failsafe: Strip accidental <pre><code> wrapping if present
                let displayContent = oq.content;
                const codeMatch = displayContent.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/i);
                if (codeMatch) {
                  const temporalDiv = document.createElement("div");
                  temporalDiv.innerHTML = codeMatch[1];
                  displayContent = temporalDiv.textContent || temporalDiv.innerText || "";
                }

                return (
                  <div 
                    className={[
                      'document-paper mb-12',
                      theme === 'sepia' ? 'document-paper-sepia' : '',
                      'professional-doc',
                    ].filter(Boolean).join(' ')}
                  >
                    <div 
                      className={`prose prose-lg max-w-none transition-all duration-300 ${proseTheme[theme]}
                        prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:leading-normal
                        prose-li:mb-2`}
                      style={{ fontSize: `${fontSize}px` }}
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(displayContent, {
                          ADD_ATTR: ['colspan', 'rowspan', 'style', 'class', 'align', 'valign', 'bgcolor'],
                          ADD_TAGS: ['table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'div', 'span', 'br'],
                          FORCE_BODY: false,
                        }) 
                      }}
                    />
                  </div>
                );
              })() : oq.pdf_url ? (
                <div className="document-paper mb-12 flex flex-col items-center p-0 overflow-hidden bg-white shadow-xl">
                  <Document file={oq.pdf_url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                    {Array.from(new Array(numPages), (el, index) => (
                      <div key={`page_${index + 1}`} className="mb-4 shadow-sm w-full flex justify-center bg-white border-b border-slate-100 last:border-b-0">
                        <Page 
                          pageNumber={index + 1} 
                          width={containerWidth ? containerWidth : undefined}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </div>
                    ))}
                  </Document>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 italic">No content available for this paper.</div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
