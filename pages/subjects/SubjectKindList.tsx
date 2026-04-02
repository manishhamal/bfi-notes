import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ArticleCard from '../../components/ArticleCard';
import { Category } from '../../types';

type SubjectKind = 'old-questions' | 'notes' | 'old-solutions';

const KIND_TITLES: Record<SubjectKind, string> = {
  'old-questions': 'Old Question Collections',
  notes: 'Notes',
  'old-solutions': 'Old Question Solutions',
};

function tagsToText(tags: any): string {
  if (!Array.isArray(tags)) return '';
  return tags
    .map((t) => (typeof t === 'string' ? t : String(t)))
    .join(' ')
    .toLowerCase();
}

function matchesKind(row: any, kind: SubjectKind): boolean {
  const tagsText = tagsToText(row?.tags);
  const contentText = String(row?.content || '').toLowerCase();

  if (kind === 'old-questions') {
    return (
      tagsText.includes('old') ||
      tagsText.includes('question') ||
      tagsText.includes('questions') ||
      tagsText.includes('collection') ||
      contentText.includes('old question') ||
      contentText.includes('question paper') ||
      contentText.includes('model question')
    );
  }

  if (kind === 'old-solutions') {
    return (
      tagsText.includes('solution') ||
      tagsText.includes('solutions') ||
      tagsText.includes('answer') ||
      tagsText.includes('answers') ||
      contentText.includes('solution')
    );
  }

  // notes: anything else; keep it permissive
  const isProbablyOld = tagsText.includes('old') || tagsText.includes('question') || tagsText.includes('solution');
  return !isProbablyOld || contentText.includes('note') || tagsText.includes('note');
}

export default function SubjectKindList() {
  const { category, kind, topic } = useParams<{
    category: string;
    kind: SubjectKind;
    topic: string;
  }>();

  const navigate = useNavigate();

  const normalizedCategory = category ?? '';
  const normalizedKind = kind ?? 'notes';
  const decodedTopic = useMemo(() => {
    try {
      return decodeURIComponent(topic ?? '');
    } catch {
      return topic ?? '';
    }
  }, [topic]);

  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (!normalizedCategory) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from('articles')
          .select('*')
          .eq('category', normalizedCategory)
          .order('date', { ascending: false });

        const rows: any[] = data || [];

        const topicFiltered = rows.filter((r) => {
          const t1 = r.topic_name ?? '';
          const t2 = r.topicName ?? '';
          return t1 === decodedTopic || t2 === decodedTopic;
        });

        const kindFiltered = topicFiltered.filter((r) => matchesKind(r, normalizedKind));

        // If kind filtering is too strict for existing data, fall back to topic-only.
        setArticles(kindFiltered.length > 0 ? kindFiltered : topicFiltered);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [normalizedCategory, decodedTopic, normalizedKind]);

  const title = KIND_TITLES[normalizedKind];

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto pt-10">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/subjects/${encodeURIComponent(normalizedCategory)}`)}
            className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Back to subject
          </button>
          <div className="mt-2 text-[10px] uppercase tracking-widest font-bold text-primary-500 mb-2">
            {normalizedCategory}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Topic: {decodedTopic}</div>
        </div>

        {loading ? (
          <div className="text-slate-600 dark:text-slate-300">Loading notes...</div>
        ) : articles.length === 0 ? (
          <div className="text-slate-600 dark:text-slate-300">No items found for this topic.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.map((a) => {
              const mapped = {
                id: a.id,
                title: a.title || a.title_ne || '',
                excerpt: a.excerpt || a.excerpt_ne || '',
                category: a.category as Category,
                readTime: a.read_time || a.readTime || '',
                date: a.date,
                tags: Array.isArray(a.tags) ? a.tags : [],
                authorName: a.author_name || 'Admin',
                authorAvatar: a.author_avatar || null,
              };

              return <ArticleCard key={a.id} article={mapped as any} compact />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

