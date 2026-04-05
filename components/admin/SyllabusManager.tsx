import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BANKS, LEVELS, Bank, Level } from '../../types';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SyllabusManager({ onClose }: { onClose: () => void }) {
  // Map of `${bank}-${level}` -> pdf_url
  const [syllabuses, setSyllabuses] = useState<Record<string, { id: string; pdf_url: string }>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchSyllabuses();
  }, []);

  const fetchSyllabuses = async () => {
    const { data, error } = await supabase.from('syllabuses').select('*');
    if (!error && data) {
      const map: Record<string, { id: string; pdf_url: string }> = {};
      data.forEach(s => {
        map[`${s.bank}-${s.level}`] = { id: s.id, pdf_url: s.pdf_url };
      });
      setSyllabuses(map);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bank: Bank, level: Level) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    const key = `${bank}-${level}`;
    setUploading(key);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${key.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('syllabuses')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('syllabuses').getPublicUrl(filePath);

      // Check if updating or inserting
      const existing = syllabuses[key];
      let dbError;
      
      if (existing) {
        const { error } = await supabase.from('syllabuses').update({ pdf_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', existing.id);
        dbError = error;
      } else {
        const { error } = await supabase.from('syllabuses').insert([{ bank, level, pdf_url: publicUrl }]);
        dbError = error;
      }

      if (dbError) {
        if (dbError.message.includes('relation "public.syllabuses" does not exist')) {
          toast.error('SQL Schema not updated! Please run the latest SQL commands in Supabase.');
        } else {
          toast.error('Failed to update database.');
        }
        throw dbError;
      }

      toast.success(`${bank} ${level} syllabus uploaded!`);
      fetchSyllabuses(); // Refresh to get the actual ID if it was an insert
    } catch (err: any) {
      console.error('Error uploading:', err);
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (bank: Bank, level: Level) => {
    if (!confirm(`Remove syllabus for ${bank} ${level}?`)) return;
    
    const key = `${bank}-${level}`;
    const existing = syllabuses[key];
    if (!existing) return;

    setUploading(key);
    const { error } = await supabase.from('syllabuses').delete().eq('id', existing.id);
    setUploading(null);
    
    if (error) {
      toast.error(`Failed to remove: ${error.message}`);
    } else {
      setSyllabuses(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success('Removed successfully.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-8 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Syllabi</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload and manage PDF syllabi for every Bank and Level.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2 pb-4 flex-1 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
               <Loader2 className="animate-spin mb-4" size={32} />
               <p>Loading database configurations...</p>
            </div>
          ) : (
            BANKS.map(bank => (
              <div key={bank} className="space-y-4">
                <h3 className="text-lg font-bold text-primary-600 dark:text-primary-400 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wide">
                  {bank}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {LEVELS.map(level => {
                    const key = `${bank}-${level}`;
                    const data = syllabuses[key];
                    const isUploading = uploading === key;

                    return (
                      <div key={key} className="flex flex-col gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-primary-500/30 transition-colors shadow-sm relative overflow-hidden group">
                        {data && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-150" />}
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${data ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            {data ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{level}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {data ? 'PDF Available' : 'Missing'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/50">
                          {data && (
                            <button 
                              onClick={() => handleDelete(bank, level)}
                              disabled={isUploading}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          <label className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${data ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50'}`}>
                            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                            <span>{data ? 'Replace' : 'Upload'}</span>
                            <input 
                              type="file" 
                              accept="application/pdf"
                              onChange={(e) => handleFileUpload(e, bank, level)}
                              disabled={isUploading}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
