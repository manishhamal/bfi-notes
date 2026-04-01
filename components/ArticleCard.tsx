import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { User, ChevronRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'featured' | 'minimal';
  compact?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'standard', compact = false }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/articles/${article.id}`)}
      className={`group block w-full rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 dark:hover:border-primary-400/50 hover:bg-slate-50/50 dark:hover:bg-primary-900/5 transition-all cursor-pointer relative overflow-hidden ${compact ? 'p-4 md:p-5' : 'p-6'}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={18} className="text-primary-500" />
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-md">
              {article.category}
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2 leading-tight">
            {article.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4 font-medium">
            {article.excerpt}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between pt-2">
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                #{tag}
              </span>
            ))}
          </div>
          
          {!compact && article.authorName && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/authors?name=${encodeURIComponent(article.authorName!)}`);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-primary-500/10 hover:text-primary-600 transition-all group/author border border-transparent hover:border-primary-500/20"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <img 
                  src={article.authorAvatar || `https://ui-avatars.com/api/?name=${article.authorName}&background=random`} 
                  alt={article.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-bold italic text-slate-500 dark:text-slate-400 group-hover/author:text-primary-600">
                {article.authorName}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;