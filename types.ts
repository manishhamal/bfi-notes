export enum Category {
  Banking = 'Banking',
  Management = 'Management',
  Account = 'Account',
  Economic = 'Economic',
  Maths = 'Maths',
  Computer = 'Computer',
  All = 'All'
}

export const BANKS = ['NRB', 'RBB', 'NBL', 'ADBL'] as const;
export type Bank = typeof BANKS[number];

export const LEVELS = ['4th Level', '5th Level', '6th Level'] as const;
export type Level = typeof LEVELS[number];

export interface Author {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  socials: {
    twitter: string;
    linkedin: string;
    github: string;
  };
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML string
  date: string;
  category: Category;
  readTime: string;
  tags: string[]; 
  featuredImage?: string;
  views?: number;
  syllabus?: string;
  topicName?: string;
  authorName?: string;
  authorAvatar?: string;
  authorBio?: string;
  title_ne?: string;
  excerpt_ne?: string;
  content_ne?: string;
  tags_ne?: string[];
}

export interface OldQuestion {
  id: string;
  bank: Bank;
  level: Level;
  year: string;
  pdf_url?: string;
  content?: string;
  content_ne?: string;
  updated_at: string;
}
