import React, { useState, useEffect } from 'react';
import { Copy, X, Languages, Info, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TranslationHelper() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('translate_content');
    if (saved) {
      setContent(saved);
    }
  }, []);

  const handleCopy = async () => {
    try {
      const contentArea = document.getElementById('translated-content-area');
      if (contentArea) {
        const html = contentArea.innerHTML;
        // Copy as rich text (text/html) so TipTap can parse it properly on paste
        const blob = new Blob([html], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({ 'text/html': blob });
        await navigator.clipboard.write([clipboardItem]);
        toast.success('Translated content copied! Paste it into the Nepali editor.');
      }
    } catch (err) {
      // Fallback: save to localStorage for the editor to pick up
      const contentArea = document.getElementById('translated-content-area');
      if (contentArea) {
        localStorage.setItem('translated_result', contentArea.innerHTML);
        toast.success('Content saved! Go back to editor and click "Paste Translation".');
      }
    }
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header/Instructions Box */}
        <div className="bg-white dark:bg-slate-900 border border-primary-100 dark:border-primary-900/30 rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
          <div className="bg-primary-500/5 p-8 border-b border-primary-100 dark:border-primary-900/20">
            <h1 className="text-2xl font-bold text-primary-950 dark:text-white flex items-center gap-3">
               <Languages className="text-primary-500" />
               Translation Helper Tool
            </h1>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <ol className="space-y-3 text-slate-600 dark:text-slate-400 font-medium">
                  <li className="flex gap-3 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">1</span> Right-click anywhere on this white page.</li>
                  <li className="flex gap-3 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">2</span> Select <strong className="text-slate-900 dark:text-white">"Translate to Nepali"</strong> (or your target language).</li>
                  <li className="flex gap-3 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">3</span> Wait for the text below to change language.</li>
                  <li className="flex gap-3 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">4</span> <strong className="text-slate-900 dark:text-white">Select and Copy</strong> the translated text below OR use the button.</li>
                  <li className="flex gap-3 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">5</span> Close this tab and <strong className="text-slate-900 dark:text-white">Paste</strong> result into your Admin Dashboard.</li>
                </ol>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3 mt-4">
                  <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-medium">* If translation option doesn't appear, look for the Translate icon in your browser's address bar.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
                 >
                   <Copy size={20} />
                   Copy Translated Content
                 </button>
                 <button 
                  onClick={handleClose}
                  className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors py-2 font-medium"
                 >
                   <ArrowLeft size={18} />
                   Close Helper
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview Area (Whitelisted for Translation) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-10 min-h-[500px]">
           <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-widest font-bold mb-8 text-center border-b pb-4 border-slate-100 dark:border-slate-800">
             English Content loaded from editor
           </p>
           <div 
            id="translated-content-area"
            className="prose prose-lg dark:prose-invert professional-doc max-w-none transition-all duration-300"
            dangerouslySetInnerHTML={{ __html: content }}
           />
        </div>
      </div>
    </div>
  );
}
