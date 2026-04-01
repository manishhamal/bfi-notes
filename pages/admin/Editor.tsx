import React, { useState, useEffect } from 'react';
import TiptapEditor from '../../components/admin/TiptapEditor';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, UploadCloud, Languages, Copy } from 'lucide-react';

export default function Editor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    title_ne: '',
    category: searchParams.get('category') || 'Banking',
    read_time: '10 min read',
    tags: '',
    excerpt: '',
    excerpt_ne: '',
    content: '',
    content_ne: '',
    featured_image: '',
    author_name: '',
    author_bio: '',
    author_avatar: ''
  });

  useEffect(() => {
    if (id) fetchArticle(id);
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    const { data, error } = await supabase.from('articles').select('*').eq('id', articleId).single();
    if (data && !error) {
      setFormData({
        title: data.title || '',
        title_ne: data.title_ne || '',
        category: data.category || 'Banking',
        read_time: data.read_time || '',
        tags: (data.tags || []).join(', '),
        excerpt: data.excerpt || '',
        excerpt_ne: data.excerpt_ne || '',
        content: data.content || '',
        content_ne: data.content_ne || '',
        featured_image: data.featured_image || '',
        author_name: data.author_name || '',
        author_bio: data.author_bio || '',
        author_avatar: data.author_avatar || ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, bucket: 'avatars' | 'article-images', fieldName: string, setUploadingState: (v: boolean) => void) => {
    try {
      setUploadingState(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, [fieldName]: data.publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingState(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error('English Title and Content are required!');
      return;
    }
    setLoading(true);
    
    // Parse tags safely
    const parsedTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const payload = {
      author_id: user!.id,
      title: formData.title,
      title_ne: formData.title_ne,
      category: formData.category,
      read_time: formData.read_time,
      tags: parsedTags,
      excerpt: formData.excerpt,
      excerpt_ne: formData.excerpt_ne,
      content: formData.content,
      content_ne: formData.content_ne,
      author_name: formData.author_name || null,
      author_bio: formData.author_bio || null,
      author_avatar: formData.author_avatar || null,
      date: new Date().toISOString()
    };

    let error;
    if (id) {
      const res = await supabase.from('articles').update(payload).eq('id', id);
      error = res.error;
    } else {
      const res = await supabase.from('articles').insert([payload]);
      error = res.error;
    }

    setLoading(false);
    if (error) {
      toast.error('Failed to save article.');
      console.error(error);
    } else {
      toast.success(id ? 'Article updated!' : 'Article published!');
      navigate('/admin');
    }
  };

  const openTranslationHelper = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.content) {
      toast.warning('Please add English content first.');
      return;
    }
    localStorage.setItem('translate_content', formData.content);
    window.open('/#/admin/translation-helper', '_blank');
  };

  const copyFromEnglish = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.content) {
      toast.warning('English content is empty.');
      return;
    }
    setFormData(prev => ({ ...prev, content_ne: prev.content }));
    toast.info('Copied English content to Nepali field.');
  };

  // Minimal theme detection
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  return (
    <div className="max-w-7xl mx-auto document-container pb-20 px-4">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
          <Save size={20} />
          {loading ? 'Saving...' : 'Publish Note'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">English Title *</label>
               <input name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Note Title..." />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nepali Title</label>
               <input name="title_ne" value={formData.title_ne} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="नोटको शीर्षक..." />
            </div>
          </div>
          
          <div className="col-span-1 space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category *</label>
               <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                 <option value="Banking">Banking</option>
                 <option value="Management">Management</option>
                 <option value="Account">Account</option>
                 <option value="Economic">Economic</option>
                 <option value="Maths">Maths</option>
               </select>
            </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags (comma separated)</label>
               <input name="tags" value={formData.tags} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="NepalRastraBank, Act2058" />
            </div>
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Detailed Excerpt (Optional short summary)</label>
           <input name="excerpt" value={formData.excerpt} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Summary of the note..." />
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Author Information (For this specific note)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Author Name</label>
              <input name="author_name" value={formData.author_name || ''} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Mr. Ramesh Sharma" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Author Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center relative group shadow-sm transition-all hover:border-primary-500">
                  {formData.author_avatar ? (
                    <img src={formData.author_avatar} alt="Author" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 font-bold text-2xl">{formData.author_name ? formData.author_name.charAt(0).toUpperCase() : '?'}</span>
                  )}
                  <label className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all">
                    {uploadingAvatar ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <UploadCloud size={22} className="text-white" />}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatars', 'author_avatar', setUploadingAvatar)} disabled={uploadingAvatar} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 leading-relaxed">Click the circle avatar to upload a photo. Recommended 1:1 aspect ratio.</p>
                  {formData.author_avatar && (
                     <button type="button" onClick={() => setFormData(prev => ({...prev, author_avatar: ''}))} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">Remove photo</button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Author Bio / Role</label>
            <input name="author_bio" value={formData.author_bio || ''} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Senior Officer at NRB..." />
          </div>
        </div>

        <div className="pt-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-4 text-xl">English Content *</label>
          <TiptapEditor 
            content={formData.content} 
            onChange={(html) => setFormData({ ...formData, content: html })} 
            placeholder="Write your beautiful article here..."
          />
        </div>
        
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-bold text-slate-900 dark:text-white text-xl">Nepali Content</label>
            <div className="flex items-center gap-4">
              <button 
                onClick={openTranslationHelper}
                className="text-xs font-bold text-primary-600 hover:text-primary-500 flex items-center gap-1.5 transition-colors"
                title="Open helper tool in new tab"
              >
                <Languages size={14} />
                Translation Helper
              </button>
              <button 
                onClick={copyFromEnglish}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                title="Copy English content as base"
              >
                <Copy size={13} />
                Copy from English
              </button>
            </div>
          </div>
          <TiptapEditor 
            content={formData.content_ne} 
            onChange={(html) => setFormData({ ...formData, content_ne: html })} 
            placeholder="नेपालीमा लेख्नुहोस्..."
          />
        </div>

      </div>
    </div>
  );
}
