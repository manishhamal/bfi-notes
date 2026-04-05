import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus, Eye, X, ArrowLeft, BookOpen, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { Category } from '../../types';
import SyllabusManager from '../../components/admin/SyllabusManager';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSyllabusManager, setShowSyllabusManager] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (user) fetchArticles();
  }, [user]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, category, date, views')
      .eq('author_id', user!.id)
      .order('date', { ascending: false });
    
    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  const deleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete note.');
    } else {
      toast.success('Note deleted successfully!');
      setArticles(prev => prev.filter(a => a.id !== id));
    }
  };

  const categoryCounts = articles.reduce((acc: any, article: any) => {
    acc[article.category] = (acc[article.category] || 0) + 1;
    return acc;
  }, {});

  const filteredArticles = selectedCategory 
    ? articles.filter(a => a.category === selectedCategory)
    : articles;

  const handleNewNote = () => {
    if (selectedCategory) {
      navigate(`/admin/editor?category=${selectedCategory}`);
    } else {
      setShowCategoryModal(true);
    }
  };

  if (loading) return <div>Loading notes...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
             {selectedCategory && (
               <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                 <ArrowLeft size={20} />
               </button>
             )}
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
               {selectedCategory ? `${selectedCategory} Notes` : 'Your Notes'}
             </h1>
          </div>
          <p className="text-slate-500 mt-1">
             {selectedCategory ? `Viewing all items published in ${selectedCategory}.` : 'Manage and organize all your published contents.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSyllabusManager(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl transition-colors font-bold shadow-sm cursor-pointer"
          >
            <FileText size={20} className="text-primary-600 dark:text-primary-400" />
            Manage Syllabi
          </button>
          <button 
            onClick={handleNewNote}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl transition-colors font-bold cursor-pointer shadow-lg active:scale-95 shadow-primary-500/20"
          >
            <Plus size={20} />
            New Note
          </button>
        </div>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
           {Object.values(Category).filter(c => c !== Category.All).map(cat => {
             const count = categoryCounts[cat] || 0;
             return (
               <button 
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/5 transition-all text-left group"
               >
                 <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                   <BookOpen size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-1">{cat}</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">{count} {count === 1 ? 'Note' : 'Notes'}</p>
               </button>
             );
           })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <BookOpen size={32} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No notes found in {selectedCategory}.</p>
              <button onClick={handleNewNote} className="mt-4 text-primary-600 font-bold hover:underline">Create your first {selectedCategory} note</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Title</th>
                    <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Category</th>
                    <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Date</th>
                    <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Views</th>
                    <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{article.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                        {new Date(article.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                        <div className="flex items-center gap-1.5 opacity-80">
                          <Eye size={16} className="text-slate-400" />
                          <span className="font-medium tracking-tight">{article.views || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link to={`/admin/editor?id=${article.id}`} className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            <Pencil size={18} />
                          </Link>
                          <button onClick={() => deleteArticle(article.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select Category</h2>
              <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 mb-8">What kind of study material are you publishing today?</p>
            
            <div className="grid grid-cols-2 gap-4">
               {Object.values(Category).filter(c => c !== Category.All).map(cat => (
                 <button 
                    key={cat}
                    onClick={() => navigate(`/admin/editor?category=${cat}`)}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-center transition-all group"
                 >
                   <span className="block font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 uppercase tracking-wider text-xs">
                     {cat}
                   </span>
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}
      
      {showSyllabusManager && (
         <SyllabusManager onClose={() => setShowSyllabusManager(false)} />
      )}
    </div>
  );
}
