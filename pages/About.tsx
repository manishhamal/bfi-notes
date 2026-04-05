import React from 'react';
import { AUTHOR } from '../constants';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import SEO from '../components/SEO';

const About: React.FC = () => {
  return (
    <div className="space-y-16 pb-24">
      <SEO 
        title="About" 
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
              About BFI Notes
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
            Our Mission
          </h2>
          <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Preparing for Nepal's government banking exams (NRB, RBB, NBL, ADBL) requires a deep understanding of banking laws, management principles, and the economic landscape of Nepal.
            </p>
            <p>
              Our platform is dedicated to providing:
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="font-bold text-primary-600 dark:text-primary-400">•</span>
                <span><span className="font-bold text-slate-900 dark:text-white">Specialized Banking Notes:</span> In-depth coverage of NRB Directives, BAFIA, and the NRB Act.</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-primary-600 dark:text-primary-400">•</span>
                <span><span className="font-bold text-slate-900 dark:text-white">Management & Economics:</span> Core concepts tailored for banking competitive exams.</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-primary-600 dark:text-primary-400">•</span>
                <span><span className="font-bold text-slate-900 dark:text-white">BFI Specific Content:</span> Resources specifically designed for the requirements of different banks.</span>
              </li>
            </ul>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Get in Touch
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Have questions or need specific study materials? We're here to help. Reach out to our team:
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