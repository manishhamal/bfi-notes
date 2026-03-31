import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { toast } from 'react-toastify';
import { Save, Upload } from 'lucide-react';

export default function Profile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        role: profile.role || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setFormData({ ...formData, avatar_url: data.publicUrl });
      toast.success('Avatar uploaded! Click Save Profile to apply.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user!.id,
      full_name: formData.full_name,
      role: formData.role,
      avatar_url: formData.avatar_url
    });

    setLoading(false);
    if (error) {
      toast.error('Failed to update profile.');
    } else {
      toast.success('Profile updated successfully! Refreshing...');
      window.location.reload(); // Quick way to force context refresh
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Author Profile</h1>
        <p className="text-slate-500 mt-1">Manage your public author details and picture.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 space-y-8">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-sm overflow-hidden flex-shrink-0 relative group">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
               <Upload className="text-white" size={24} />
               <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
            </label>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Profile Picture</h3>
            <p className="text-sm text-slate-500 mb-3">Click on the image to upload a new one. Recommended size: 256x256px.</p>
            {uploading && <span className="text-sm text-primary-600 font-medium">Uploading...</span>}
          </div>
        </div>

        <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
             <input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="John Doe" />
          </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Author Title / Role</label>
             <input name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Senior Section Officer..." />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
           <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
             <Save size={20} />
             {loading ? 'Saving...' : 'Save Profile'}
           </button>
        </div>
      </div>
    </div>
  );
}
