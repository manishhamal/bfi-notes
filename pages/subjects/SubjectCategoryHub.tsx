import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';

type SubjectKind = 'syllabus' | 'old-questions' | 'notes' | 'old-solutions';

const SUBJECT_KINDS: Array<{ kind: Exclude<SubjectKind, 'syllabus'>; title: string; subtitle: string }> = [
  { kind: 'old-questions', title: 'Old Question Collections', subtitle: 'Topic-wise collections' },
  { kind: 'notes', title: 'Notes', subtitle: 'Quick study material' },
  { kind: 'old-solutions', title: 'Old Question Solutions', subtitle: 'Solved answers' },
];

function isValidCategory(category: string | undefined): category is Category {
  return category ? (Object.values(Category) as string[]).includes(category) && category !== Category.All : false;
}



export default function SubjectCategoryHub() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const normalizedCategory = useMemo(() => (category ? category : ''), [category]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsValid(isValidCategory(normalizedCategory));
  }, [normalizedCategory]);



  if (!isValid) {
    return (
      <div className="min-h-screen px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Subject not found</h1>
          <p className="text-slate-600 dark:text-slate-300">Choose a valid subject from the home page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto pt-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-primary-500 mb-1">
              Subject
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {normalizedCategory}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <button
            type="button"
            onClick={() => navigate(`/syllabus`)}
            className="group text-left rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-primary-500/60 dark:hover:border-primary-400/60 transition-all p-8 shadow-sm hover:shadow-xl hover:shadow-primary-500/5"
          >
            <div className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-3">
              Section 01
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Syllabus PDF
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Official banking levels syllabus (4th, 5th, 6th) for RBB, NRB, NBL, and ADBL.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/articles?category=${encodeURIComponent(normalizedCategory)}`)}
            className="group text-left rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-primary-500/60 dark:hover:border-primary-400/60 transition-all p-8 shadow-sm hover:shadow-xl hover:shadow-primary-500/5"
          >
            <div className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-3">
              Section 02
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Study Notes
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              In-depth study material and articles specifically for {normalizedCategory}.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/old-questions`)}
            className="group text-left rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-primary-500/60 dark:hover:border-primary-400/60 transition-all p-8 shadow-sm hover:shadow-xl hover:shadow-primary-500/5"
          >
            <div className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-3">
              Section 03
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Old Question Collections
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Browse previous years' questions organized by bank and level.
            </p>
          </button>
          
          <button
            type="button"
            onClick={() => navigate(`/solutions`)}
            className="group text-left rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-primary-500/60 dark:hover:border-primary-400/60 transition-all p-8 shadow-sm hover:shadow-xl hover:shadow-primary-500/5"
          >
            <div className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-3">
              Section 04
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Old Question Solutions
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Expert solutions for previous exam questions from various banks.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

