import React from 'react';
import { useNavigate } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import { BookOpen, FileText, ClipboardList, PenTool, ArrowRight } from 'lucide-react';

const MaterialsHub: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'syllabus',
      title: 'Syllabus PDF',
      description: 'Official banking levels syllabus (4th, 5th, 6th) for RBB, NRB, NBL, and ADBL.',
      icon: <BookOpen size={24} />,
      path: '/syllabus',
      color: 'primary'
    },
    {
      id: 'notes',
      title: 'Study Notes',
      description: 'Full collection of in-depth study material and articles for comprehensive preparation.',
      icon: <FileText size={24} />,
      path: '/articles',
      color: 'slate'
    },
    {
      id: 'questions',
      title: 'Old Question Collections',
      description: 'Extensive archive of previous years\' exam papers organized by bank and level.',
      icon: <ClipboardList size={24} />,
      path: '/old-questions',
      color: 'primary'
    },
    {
      id: 'solutions',
      title: 'Old Question Solutions',
      description: 'Curated expert solutions for past exam questions to guide your writing style.',
      icon: <PenTool size={24} />,
      path: '/solutions',
      color: 'slate'
    }
  ];

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto w-full">
        <FadeIn>
          <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
              All Materials
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
              Everything you need for your banking career preparation in one central hub.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => navigate(section.path)}
                className="group relative flex flex-col text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 transition-all hover:border-primary-500 hover:ring-4 hover:ring-primary-500/10 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 overflow-hidden"
              >
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-[100%] -translate-y-8 translate-x-8 transition-transform group-hover:scale-150" />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/40 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all">
                    {section.icon}
                  </div>
                  <div className="text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                    <ArrowRight size={24} />
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
               Select a section to begin exploring your materials.
             </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default MaterialsHub;
