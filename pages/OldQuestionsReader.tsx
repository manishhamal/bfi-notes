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
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FadeIn from '../components/FadeIn';
import { supabase } from '../lib/supabase';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type ReaderTheme = 'light' | 'sepia' | 'dark';

export default function OldQuestionsReader() {
  const { id, bank, level } = useParams<{ id: string; bank: string; level: string }>();
  const navigate = useNavigate();
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [yearLabel, setYearLabel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const fetchOQ = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('old_questions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data && !error && data.pdf_url) {
        setPdfUrl(data.pdf_url);
        setYearLabel(data.year);
      }
      setLoading(false);
    };
    fetchOQ();
  }, [id]);
  
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollYRef = useRef(0);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    document.body.style.backgroundColor = theme === 'dark' ? '#020617' : theme === 'sepia' ? '#faf4e8' : '#f8fafc';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, [theme]);

  useEffect(() => {
    if (!contentRef.current) return;
    setContainerWidth(contentRef.current.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [pdfUrl, isFullscreen]);

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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Past Paper Not Found</h1>
        <button onClick={() => navigate(-1)} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl transition-all font-bold">
          Go Back
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
      <motion.header 
        className={`shrink-0 z-40 transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 
          theme === 'sepia' ? 'bg-[#f4ebd8]/80 border-[#dccdaz]' : 
          'bg-white/80 border-slate-200'
        } backdrop-blur-md border-b`}
        initial={{ y: 0 }}
        animate={{ y: showHeader ? 0 : -100 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/old-questions/${encodeURIComponent(bank!)}/${encodeURIComponent(level!)}`)}>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                <ArrowLeft size={16} />
                <span>Go Back</span>
              </div>
              <div className="hidden sm:flex flex-col border-l border-slate-200 dark:border-slate-700 pl-4">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">Old Question</span>
                 <span className="font-bold tracking-tight leading-none truncate max-w-[150px]">{decodeURIComponent(bank || '')} {yearLabel}</span>
              </div>
            </div>
            
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full"><Settings size={20} /></button>
          </div>
        </div>
      </motion.header>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="min-h-full py-16 px-4 flex justify-center">
          <FadeIn className="w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8 justify-center">
               <span className="text-xs font-bold uppercase tracking-wider text-primary-600">{decodeURIComponent(bank || '')}</span>
               <ChevronRight size={14} />
               <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{yearLabel} Paper</span>
            </div>

            <div ref={contentRef} className="document-paper mb-12 flex flex-col items-center">
              <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="mb-4 shadow-sm w-full flex justify-center bg-white">
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
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
