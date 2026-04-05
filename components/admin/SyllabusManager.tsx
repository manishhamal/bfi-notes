import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import { Plus, X, UploadCloud, FileText, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SyllabusManager({ onClose }: { onClose: () => void }) {
  const [syllabuses, setSyllabuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchSyllabuses();
  }, []);

  const fetchSyllabuses = async () => {
    const { data, error } = await supabase.from('syllabuses').select('*');
    if (!error && data) {
      const map: Record<string, string> = {};
      data.forEach(s => {
        map[s.category] = s.pdf_url;
      });
      setSyllabuses(map);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    setUploading(category);
    try {
      // Create a unique filepath
      const fileExt = file.name.split('.').pop();
      const fileName = `${category.toLowerCase()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('syllabuses')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('syllabuses').getPublicUrl(filePath);

      // Upsert into syllabuses table
      const { error: dbError } = await supabase
        .from('syllabuses')
        .upsert({ category, pdf_url: publicUrl, updated_at: new Date().toISOString() });

      if (dbError) {
        // Fallback: the table might not exist yet if the user hasn't run the SQL schema!
        if (dbError.message.includes('relation "public.syllabuses" does not exist')) {
          toast.error('SQL Schema not updated! Please run the latest SQL commands in Supabase.');
        } else {
          toast.error('Failed to update database.');
        }
        throw dbError;
      }

      setSyllabuses(prev => ({ ...prev, [category]: publicUrl }));
      toast.success(`${category} syllabus uploaded perfectly!`);
    } catch (err: any) {
      console.error('Error uploading:', err);
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (category: string) => {
    if (!confirm(`Remove syllabus for ${category}?`)) return;
    
    // We don't necessarily need to delete the storage object, but it's good practice. 
    // Here we'll just delete the DB record.
    setUploading(category);
    const { error } = await supabase.from('syllabuses').delete().eq('category', category);
    setUploading(null);
    
    if (error) {
      toast.error(`Failed to remove: ${error.message}`);
    } else {
      setSyllabuses(prev => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
      toast.success('Removed successfully.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Syllabi</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload and manage PDF syllabi for each subject category.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2 pb-4 flex-1 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
               <Loader2 className="animate-spin mb-4" size={32} />
               <p>Loading database configurations...</p>
            </div>
          ) : (
            Object.values(Category).filter(c => c !== Category.All).map(cat => {
              const fileUrl = syllabuses[cat];
              const isUploading = uploading === cat;

              return (
                <div key={cat} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-primary-500/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${fileUrl ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'}`}>
                      {fileUrl ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{cat}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {fileUrl ? 'Syllabus PDF Active' : 'No syllabus uploaded'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {fileUrl && (
                      <button 
                        onClick={() => handleDelete(cat)}
                        disabled={isUploading}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove Syllabus"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <label className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${fileUrl ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/20'}`}>
                      {isUploading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <UploadCloud size={16} />
                      )}
                      <span>{fileUrl ? 'Replace PDF' : 'Upload PDF'}</span>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={(e) => handleFileUpload(e, cat)}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
