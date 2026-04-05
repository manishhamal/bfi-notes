import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BANKS, LEVELS, Bank, Level } from '../types';
import FadeIn from './FadeIn';
import { Building2, Layers, ArrowRight, ArrowLeft } from 'lucide-react';

interface BankLevelSelectorProps {
  title: string;
  subtitle: string;
  baseRoute: string; // e.g. '/syllabus', '/old-questions'
  onSelect?: (bank: Bank, level: Level) => void;
}

export default function BankLevelSelector({ title, subtitle, baseRoute, onSelect }: BankLevelSelectorProps) {
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
  };

  const handleLevelSelect = (level: Level) => {
    if (!selectedBank) return;
    if (onSelect) {
      onSelect(selectedBank, level);
    } else {
      navigate(`${baseRoute}/${encodeURIComponent(selectedBank)}/${encodeURIComponent(level)}/view`);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="mb-8 md:mb-12 text-center md:text-left">
             <button
                onClick={() => selectedBank ? setSelectedBank(null) : navigate(-1)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 mx-auto md:mx-0 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full"
             >
                <ArrowLeft size={16} />
                {selectedBank ? 'Back to Banks' : 'Go Back'}
             </button>
             <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">{title}</h1>
             <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">{subtitle}</p>
          </div>

          {!selectedBank ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {BANKS.map((bank) => (
                 <button
                   key={bank}
                   onClick={() => handleBankSelect(bank)}
                   className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-center hover:border-primary-500 hover:ring-4 hover:ring-primary-500/10 transition-all active:scale-95 shadow-sm min-h-[160px]"
                 >
                   <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/40 text-slate-400 group-hover:text-primary-500 transition-all">
                     <Building2 size={24} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white">{bank}</h3>
                 </button>
               ))}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <div className="mb-8 flex items-center gap-3 justify-center md:justify-start">
                 <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl">
                   <Building2 size={24} />
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Selected Bank</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{selectedBank}</div>
                 </div>
               </div>

               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center md:text-left uppercase tracking-wider">Select Level</h2>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {LEVELS.map((level) => (
                   <button
                     key={level}
                     onClick={() => handleLevelSelect(level)}
                     className="group flex flex-col gap-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-primary-500 hover:ring-4 hover:ring-primary-500/10 transition-all shadow-sm"
                   >
                     <div className="flex items-center justify-between w-full">
                       <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-primary-500 transition-colors">
                         <Layers size={20} />
                       </div>
                       <ArrowRight size={20} className="text-slate-300 dark:text-slate-700 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                     </div>
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">{level}</h3>
                   </button>
                 ))}
               </div>
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
