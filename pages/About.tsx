import React from 'react';
import { AUTHOR } from '../constants';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 pb-24">
      <SEO 
        title={t('About')} 
        description="Learn more about BFI Notes, our mission to provide quality banking study materials in Nepal, and the team behind the platform."
      />
      {/* Intro */}
      <FadeIn>
        <div className="flex flex-col md:flex-row gap-10 items-start text-left">
          <img 
            src={AUTHOR.avatar} 
            alt={AUTHOR.name} 
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover grayscale hover:grayscale-0 transition-all duration-500"
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('About Title')}
            </h1>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-tight">
              {AUTHOR.bio}
            </p>
            <div className="flex gap-6">
                 <a href={AUTHOR.socials.twitter} className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
                 <a href={AUTHOR.socials.github} className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</a>
                 <a href={AUTHOR.socials.linkedin} className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </FadeIn>

      {/* Manifesto */}
      <FadeIn delay={200}>
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            {t('Mission Title')}
          </h2>
          <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              {t('Mission Intro')}
            </p>
            <p>
              {t('Platform Dedicated')}
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="font-bold text-primary-600 dark:text-primary-400">•</span>
                <span><span className="font-bold text-slate-900 dark:text-white">{t('Specialized Notes Label')}:</span> {t('Specialized Notes Desc')}</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-primary-600 dark:text-primary-400">•</span>
                <span><span className="font-bold text-slate-900 dark:text-white">{t('Mgmt Econ Label')}:</span> {t('Mgmt Econ Desc')}</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-primary-600 dark:text-primary-400">•</span>
                <span><span className="font-bold text-slate-900 dark:text-white">{t('BFI Content Label')}:</span> {t('BFI Content Desc')}</span>
              </li>
            </ul>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            {t('Get In Touch')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('Touch Subtitle')}
          </p>
          <div className="flex items-center gap-4">
            <Mail size={20} className="text-slate-400" />
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400 underline decoration-slate-200 dark:decoration-slate-800 underline-offset-4">support@bfinotes.com</span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default About;