import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type SubjectKind = 'old-questions' | 'notes' | 'old-solutions';

const KIND_TITLES: Record<SubjectKind, string> = {
  'old-questions': 'Old Question Collections',
  notes: 'Notes',
  'old-solutions': 'Old Question Solutions',
};

function uniqStable(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = (v || '').trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export default function SubjectKindTopics() {
  const { category, kind } = useParams<{ category: string; kind: SubjectKind }>();
  const navigate = useNavigate();

  const normalizedCategory = useMemo(() => category ?? '', [category]);
  const normalizedKind = useMemo(() => kind ?? 'notes', [kind]);

  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!normalizedCategory) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from('articles')
          .select('*')
          .eq('category', normalizedCategory)
          .order('date', { ascending: false });

        const rows: any[] = data || [];
        const rawTopics = rows.map((r) => r.topic_name ?? r.topicName ?? '').filter(Boolean) as string[];
        setTopics(uniqStable(rawTopics));
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [normalizedCategory]);

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto pt-10">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-widest font-bold text-primary-500 mb-2">Subject</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {normalizedCategory}
          </h1>
          <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">
            {KIND_TITLES[normalizedKind as SubjectKind]}
          </p>
        </div>

        {loading ? (
          <div className="text-slate-600 dark:text-slate-300">Loading topics...</div>
        ) : topics.length === 0 ? (
          <div className="text-slate-600 dark:text-slate-300">No topics found yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() =>
                  navigate(
                    `/subjects/${encodeURIComponent(normalizedCategory)}/${encodeURIComponent(
                      normalizedKind
                    )}/${encodeURIComponent(t)}`
                  )
                }
                className="text-left rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-primary-500/60 dark:hover:border-primary-400/60 transition-colors p-5"
              >
                <div className="text-sm font-bold text-slate-900 dark:text-white">{t}</div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">Tap to view</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

