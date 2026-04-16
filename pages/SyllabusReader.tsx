import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Maximize2, 
  Minimize2,
  BookOpen,
  Settings,
  ChevronRight,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FadeIn from '../components/FadeIn';
import { supabase } from '../lib/supabase';
import Watermark from '../components/Watermark';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTranslation } from 'react-i18next';
import { downloadFile } from '../lib/utils';
import { toast } from 'react-toastify';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type ReaderTheme = 'light' | 'sepia' | 'dark';

export default function SyllabusReader() {
  const { bank, level } = useParams<{ bank: string; level: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const fetchSyllabus = async () => {
      if (!bank || !level) return;
      
      const decodedBank = decodeURIComponent(bank);
      const decodedLevel = decodeURIComponent(level);

      const { data, error } = await supabase
        .from('syllabuses')
        .select('pdf_url')
        .eq('bank', decodedBank)
        .eq('level', decodedLevel)
        .single();
      
      if (data && !error && data.pdf_url) {
        setPdfUrl(data.pdf_url);
      }
      setLoading(false);
    };
    fetchSyllabus();
  }, [bank, level]);
  
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const lastScrollYRef = useRef(0);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!pdfUrl) return;
    setIsDownloading(true);
    const filename = `Syllabus_${t(bank || '')}_${t(level || '')}.pdf`.replace(/\s+/g, '_');
    const success = await downloadFile(pdfUrl, filename);
    if (!success) {
      toast.error(t('Failed to load PDF'));
    }
    setIsDownloading(false);
  };

  // Sync body background with reader theme
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = theme === 'dark' ? '#020617' : theme === 'sepia' ? '#faf4e8' : '#f8fafc';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, [theme]);

  // Track container width for responsive PDF rendering
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Set initial width
    setContainerWidth(contentRef.current.clientWidth);
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [pdfUrl, isFullscreen]);

  // Handle intersection observer for hiding header
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const currentScrollY = scrollContainerRef.current.scrollTop;
      
      if (currentScrollY > lastScrollYRef.current + 10 && currentScrollY > 100) {
        setShowHeader(false); // scrolling down
      } else if (currentScrollY < lastScrollYRef.current - 10) {
        setShowHeader(true); // scrolling up
      }
      
      lastScrollYRef.current = currentScrollY;
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
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
           <BookOpen size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('Syllabus Not Found')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
          {t('No papers desc')}
        </p>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg"
        >
          <ArrowLeft size={20} />
          {t('Go Back')}
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`h-screen flex flex-col overflow-hidden transition-colors duration-500 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-200' : 
        theme === 'sepia' ? 'bg-[#faf4e8] text-[#5c4b37]' : 
        'bg-slate-50 text-slate-800'
      }`}
    >
      <Watermark />
      {/* Top Navigation Bar */}
      <motion.header 
        className={`shrink-0 z-40 transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 
          theme === 'sepia' ? 'bg-[#f4ebd8]/80 border-[#dccdaz]' : 
          'bg-white/80 border-slate-200'
        } backdrop-blur-md border-b`}
        initial={{ y: 0 }}
        animate={{ y: showHeader ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/syllabus/${encodeURIComponent(bank!)}`)}>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                <ArrowLeft size={16} />
                <span>{t('Go Back')}</span>
              </div>
              <div className="hidden sm:flex flex-col border-l border-slate-200 dark:border-slate-700 pl-4">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                   {t('Banking')}
                 </span>
                 <span className="font-bold tracking-tight leading-none">
                   {t(bank || '')} {t(level || '')}
                 </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`p-2 rounded-full transition-colors flex items-center gap-2 ${
                  theme === 'dark' ? 'hover:bg-slate-800' : 
                  theme === 'sepia' ? 'hover:bg-[#e8dec7]' : 
                  'hover:bg-slate-100'
                } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={t('Download')}
              >
                <Download size={20} className={isDownloading ? 'animate-bounce' : ''} />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 rounded-full transition-colors flex items-center gap-2 ${
                    theme === 'dark' ? 'hover:bg-slate-800' : 
                    theme === 'sepia' ? 'hover:bg-[#e8dec7]' : 
                    'hover:bg-slate-100'
                  } ${isMenuOpen ? (theme === 'dark' ? 'bg-slate-800' : theme === 'sepia' ? 'bg-[#e8dec7]' : 'bg-slate-100') : ''}`}
                  title={t('Reader Settings')}
                >
                  <Settings size={20} />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl border p-4 ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 shadow-black/50' : 
                        theme === 'sepia' ? 'bg-[#f4ebd8] border-[#e8dec7] shadow-[#5c4b37]/10' : 
                        'bg-white border-slate-200 shadow-slate-200/50'
                      }`}
                    >
                      <div className="space-y-6">
                        {/* Theme */}
                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                             theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}>{t('Appearance')}</div>
                          <div className="grid grid-cols-3 gap-2">
                            <button 
                              onClick={() => setTheme('light')}
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                theme === 'light' ? 'border-primary-500 bg-primary-50 text-primary-700' : 
                                theme === 'dark' ? 'border-slate-700 hover:border-slate-600' : 
                                'border-slate-200 hover:border-slate-300'
                              } bg-white text-slate-900`}
                            >
                              <Sun size={20} />
                              <span className="text-xs font-bold">{t('Light')}</span>
                            </button>
                            <button 
                              onClick={() => setTheme('sepia')}
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                theme === 'sepia' ? 'border-[#8c7454] bg-[#e8dec7] text-[#5c4b37]' : 
                                theme === 'dark' ? 'border-slate-700 hover:border-slate-600' : 
                                'border-[#e8dec7] hover:border-[#dccdaz]'
                              } bg-[#faf4e8] text-[#5c4b37]`}
                            >
                              <BookOpen size={20} />
                              <span className="text-xs font-bold">{t('Sepia')}</span>
                            </button>
                            <button 
                              onClick={() => setTheme('dark')}
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                theme === 'dark' ? 'border-primary-500 bg-slate-900 text-white' : 
                                theme === 'sepia' ? 'border-[#e8dec7] hover:border-[#dccdaz]' : 
                                'border-slate-200 hover:border-slate-300'
                              } bg-slate-950 text-slate-300`}
                            >
                              <Moon size={20} />
                              <span className="text-xs font-bold">{t('Dark')}</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-slate-700' : theme === 'sepia' ? 'bg-[#dccdaz]' : 'bg-slate-200'}`}></div>

              <button 
                onClick={toggleFullscreen}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' ? 'hover:bg-slate-800' : 
                  theme === 'sepia' ? 'hover:bg-[#e8dec7]' : 
                  'hover:bg-slate-100'
                }`}
                title={isFullscreen ? t("Exit Fullscreen") : t("Enter Fullscreen")}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
      >
        <div className="min-h-full py-8 md:py-16 px-4 sm:px-6 flex justify-center">
          <FadeIn className="w-full max-w-4xl mx-auto">
            
            {/* Context Breadcrumb */}
            <div className="flex items-center gap-2 mb-8 justify-center">
               <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
                 {t(bank || '')} {t(level || '')}
               </span>
               <ChevronRight size={14} className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'} />
               <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                 {t('Syllabus Title')}
               </span>
            </div>
            
            {/* Header Content */}
            <header className="mb-12 text-center">
              <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-serif`}>
                {t('Syllabus Title')}
              </h1>
            </header>

            {/* Document Paper containing the react-pdf Document */}
            <div
              ref={contentRef}
              className={[
                'document-paper mb-12',
                theme === 'sepia' ? 'document-paper-sepia' : '',
                'professional-doc',
                'p-0 overflow-hidden flex flex-col items-center' // Centered pages without built-in padding
              ].filter(Boolean).join(' ')}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                    <p className="font-medium animate-pulse">{t('Processing PDF')}</p>
                  </div>
                }
                error={
                  <div className="p-10 text-center text-red-500">
                    <p className="font-bold">{t('Failed to load PDF')}</p>
                    <p className="text-sm">The syllabus file might be corrupted or missing.</p>
                  </div>
                }
                className="flex flex-col items-center w-full"
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="mb-4 shadow-sm border border-slate-200/50 w-full overflow-hidden flex justify-center bg-white">
                    <Page 
                      pageNumber={index + 1} 
                      width={containerWidth ? containerWidth : undefined}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={<div className="h-[800px] w-full bg-slate-50 animate-pulse flex items-center justify-center text-slate-300">{t('Rendering')}</div>}
                    />
                  </div>
                ))}
              </Document>
            </div>
            
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
