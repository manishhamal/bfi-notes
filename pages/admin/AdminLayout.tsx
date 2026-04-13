import React, { Suspense } from 'react';
import { Outlet, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, PenTool, LogOut, Settings, Newspaper } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  
  // Strict RBAC check: Must be logged in AND have a valid role in the profiles table
  const isAuthorized = user && (profile?.role === 'admin' || profile?.role === 'author');
  
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Write Note', path: '/admin/editor', icon: <PenTool size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10 text-primary-600 dark:text-primary-400 font-bold text-xl">
            <Newspaper size={28} />
            <span>Admin Panel</span>
          </div>
          <nav className="space-y-2">
            {menu.map((item) => (
              <NavLink end={item.path === '/admin'} key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}>
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-3 px-4 mb-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate w-32">Site Admin</span>
                <span className="text-xs text-slate-500 truncate w-32">{user.email}</span>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium">
             <LogOut size={20} />
             Sign Out
           </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
         <Suspense fallback={
           <div className="flex-grow flex items-center justify-center py-20">
             <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin" />
           </div>
         }>
           <Outlet />
         </Suspense>
      </main>

      <ToastContainer position="bottom-right" theme="colored" autoClose={1500} hideProgressBar aria-label="Toast Container" />
    </div>
  );
};
export default AdminLayout;
