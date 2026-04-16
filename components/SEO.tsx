import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const baseTitle = t('BFI Notes');
    document.title = title ? `${title} | ${baseTitle}` : `${baseTitle} | ${t('BY Students, For Students.')}`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || t('Home Subtitle'));
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords || 'BFI Notes, Nepal Banking Notes, NRB, RBB, NBL, ADBL, Study Materials');
    } else if (keywords) {
        const newKeywords = document.createElement('meta');
        newKeywords.name = 'keywords';
        newKeywords.content = keywords;
        document.head.appendChild(newKeywords);
    }
  }, [title, description, keywords, t]);

  return null;
};

export default SEO;
