import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';


interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'featured' | 'minimal';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'standard' }) => {
  
  return (
    <Link to={`/articles/${article.id}`} className="group block w-full p-6 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">
              {article.category}
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
            {article.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
            {article.excerpt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
                #{tag}
              </span>
            ))}
          </div>
          {article.authorName && (
            <span className="text-[10px] text-slate-400 italic">
              By {article.authorName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;