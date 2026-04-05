import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BANKS, LEVELS, Bank, Level } from '../../types';
import { X, UploadCloud, FileText, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface OldQuestion {
  id: string;
  bank: Bank;
  level: Level;
  year: string;
  pdf_url: string;
  updated_at: string;
}

export default function OldQuestionsManager({ onClose }: { onClose: () => void }) {
  const [questions, setQuestions] = useState<OldQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formBank, setFormBank] = useState<Bank>(BANKS[0]);
  const [formLevel, setFormLevel] = useState<Level>(LEVELS[0]);
  const [formYear, setFormYear] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data, error } = await supabase.from('old_questions').select('*').order('updated_at', { ascending: false });
    if (!error && data) {
      setQuestions(data as OldQuestion[]);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formYear.trim()) {
      toast.warning('Please enter a Year / Description first.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `oq-${formBank.toLowerCase()}-${formLevel.replace(/\s+/g, '')}-${formYear.replace(/\s+/g, '')}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('old-questions')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('old-questions').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('old_questions').insert([{ 
        bank: formBank, 
        level: formLevel, 
        year: formYear,
        pdf_url: publicUrl 
      }]);

      if (dbError) {
        if (dbError.message.includes('relation "public.old_questions" does not exist')) {
          toast.error('SQL Schema not updated! Please run the latest SQL commands in Supabase.');
        } else {
          toast.error('Failed to update database.');
        }
        throw dbError;
      }

      toast.success(`${formBank} ${formLevel} - ${formYear} uploaded perfectly!`);
      setFormYear(''); // reset form
      fetchQuestions();
    } catch (err: any) {
      console.error('Error uploading:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Remove old question mapping for ${label}?`)) return;
    
    setUploading(true);
    const { error } = await supabase.from('old_questions').delete().eq('id', id);
    setUploading(false);
    
    if (error) {
      toast.error(`Failed to remove: ${error.message}`);
    } else {
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Removed successfully.');
    }
  };

  // Group by Bank and Level for display
  const groupedLayout = BANKS.map(bank => {
    const bankQs = questions.filter(q => q.bank === bank);
    if (bankQs.length === 0) return null;

    return (
      <div key={bank} className="mb-6 space-y-3">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-xs">{bank}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           {bankQs.map(q => (
             <div key={q.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{q.level}</h4>
                    <span className="text-xs text-slate-500 font-medium">Year: {q.year}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(q.id, `${q.bank} ${q.level} (${q.year})`)}
                  disabled={uploading}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
             </div>
           ))}
        </div>
      </div>
    );
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-8 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Old Questions Vault</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload and organize past papers by Bank, Level, and Year.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2 pb-4 flex-1">
          {/* Uploader Form */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
             <h3 className="font-bold text-slate-900 dark:text-white mb-4">Add New Question Paper</h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bank</label>
                  <select 
                    value={formBank} 
                    onChange={e => setFormBank(e.target.value as Bank)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 font-medium"
                  >
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Level</label>
                  <select 
                    value={formLevel} 
                    onChange={e => setFormLevel(e.target.value as Level)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 font-medium"
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Year / Info</label>
                  <input 
                    type="text"
                    value={formYear}
                    onChange={e => setFormYear(e.target.value)}
                    placeholder="e.g. 2078 BS"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 font-medium"
                  />
                </div>
             </div>
             
             <label className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                uploading ? 'bg-primary-500 opacity-50 text-white' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20'
             }`}>
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                <span>{uploading ? 'Processing & Uploading...' : 'Select PDF to Upload'}</span>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
             </label>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No question papers uploaded yet.</div>
            ) : (
              groupedLayout
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
