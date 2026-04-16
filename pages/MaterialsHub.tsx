import React from 'react';
import { useNavigate } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import { BookOpen, FileText, ClipboardList, PenTool, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const MaterialsHub: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    {
      id: 'syllabus',
      title: t('Syllabus Title'),
      description: t('Syllabus Desc'),
      icon: <BookOpen size={24} />,
      path: '/syllabus',
      color: 'primary'
    },
    {
      id: 'notes',
      title: t('Notes Title'),
      description: t('Notes Desc'),
      icon: <FileText size={24} />,
      path: '/articles',
      color: 'slate'
    },
    {
      id: 'questions',
      title: t('Old Questions Title'),
      description: t('Old Questions Desc'),
      icon: <ClipboardList size={24} />,
      path: '/old-questions',
      color: 'primary'
    },
    {
      id: 'solutions',
      title: t('Solutions Title'),
      description: t('Solutions Desc'),
      icon: <PenTool size={24} />,
      path: '/solutions',
      color: 'slate'
    }
  ];

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6">
      <SEO 
        title={t('All Materials Hub')} 
        description={t('Materials Subtitle')}
      />
      <div className="max-w-4xl mx-auto w-full">
        <FadeIn>
          <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
              {t('All Materials Hub')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
              {t('Materials Subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => navigate(section.path)}
                className="group relative flex flex-col text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 transition-all hover:border-primary-500 hover:shadow-lg dark:hover:bg-slate-800/50 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all">
                    {section.icon}
                  </div>
                  <div className="text-slate-300 dark:text-slate-700 group-hover:text-primary-500 transition-all">
                    <ArrowRight size={20} />
                  </div>
                </div>

                <div className="relative">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {section.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
             <p className="text-sm text-slate-500 font-medium">
               {t('Select Section')}
             </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default MaterialsHub;
