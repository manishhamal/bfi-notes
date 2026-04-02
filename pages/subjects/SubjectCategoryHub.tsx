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

async function findSyllabusArticleId(category: string): Promise<string | null> {
  const { data } = await supabase
    .from('articles')
    .select('id,tags,content')
    .eq('category', category)
    .order('date', { ascending: false });

  const rows: any[] = data || [];
  if (rows.length === 0) return null;

  const isPdfLike = (text: string) => {
    const t = (text || '').toLowerCase();
    return t.includes('.pdf') || t.includes('application/pdf') || t.includes('<iframe') || t.includes('pdf') || t.includes('embed');
  };

  const byTags = rows.find((r) => {
    const tags: string[] = Array.isArray(r.tags) ? r.tags : [];
    return tags.some((t) => (t || '').toLowerCase().includes('syllabus'));
  });
  if (byTags?.id) return byTags.id;

  const byContent = rows.find((r) => isPdfLike(r.content));
  if (byContent?.id) return byContent.id;

  return rows[0]?.id || null;
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

  const onOpenSyllabus = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const id = await findSyllabusArticleId(normalizedCategory);
      if (!id) {
        setLoading(false);
        return;
      }
      navigate(`/articles/${id}`);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onOpenSyllabus}
            disabled={loading}
            className="group text-left rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-primary-500/60 dark:hover:border-primary-400/60 transition-colors p-6"
          >
            <div className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-2">
              Syllabus
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Syllabus PDF
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Open the syllabus using the reader experience.
            </div>
          </button>

          {SUBJECT_KINDS.map((item) => (
            <button
              key={item.kind}
              type="button"
              onClick={() =>
                item.kind === 'notes'
                  ? navigate(`/articles?category=${encodeURIComponent(normalizedCategory)}`)
                  : navigate(`/subjects/${encodeURIComponent(normalizedCategory)}/${item.kind}`)
              }
              className="group text-left rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-primary-500/60 dark:hover:border-primary-400/60 transition-colors p-6"
            >
              <div className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-2">
                {item.kind === 'old-questions' ? 'Old Questions' : item.kind === 'notes' ? 'Notes' : 'Solutions'}
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">{item.title}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.subtitle}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

