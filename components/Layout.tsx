import React, { useState, useEffect, Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Languages } from 'lucide-react';
import { BLOG_NAME } from '../constants';
import { useTranslation } from 'react-i18next';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const { pathname, hash } = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'np' : 'en';
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    // Handle scrolling on route or hash change
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    
    setIsMenuOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setIsDark(newIsDark);
    
    // If manual toggle matches system preference, clear override to follow system again
    if (newIsDark === systemPrefersDark) {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    }
  };

  const navLinks = [
    { name: t('Home'), path: '/' },
    { name: t('Study Notes'), path: '/articles' },
    { name: t('Authors'), path: '/authors' },
    { name: t('About PSC Prep'), path: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
      
      {/* Modern Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `text-sm font-medium transition-colors ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {t('BFI Notes')}
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 p-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Toggle language"
              >
                <Languages size={18} />
                <span className="text-xs font-bold uppercase">{i18n.language || 'EN'}</span>
              </button>

              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label={t('Theme Toggle')}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 p-2 text-slate-600 dark:text-slate-400"
              aria-label="Toggle language"
            >
              <Languages size={20} />
              <span className="text-[10px] font-bold uppercase">{i18n.language || 'EN'}</span>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400"
              aria-label={t('Theme Toggle')}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-900 dark:text-white"
              aria-label={t('Menu Toggle')}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white dark:bg-slate-950 animate-slide-in-right border-t border-slate-100 dark:border-slate-800 md:hidden overflow-y-auto">
          <div className="p-6 flex flex-col space-y-6 mt-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-2xl font-sans font-bold tracking-tight ${
                  isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-6 pt-28 pb-16 flex flex-col justify-content-start">
        <Suspense fallback={
          <div className="flex-grow w-full flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 dark:border-slate-900 mt-auto bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
          <div className="mb-4 md:mb-0 font-medium">
             &copy; {new Date().getFullYear()} {t('BFI Notes')}.
          </div>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">RSS</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;