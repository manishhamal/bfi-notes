import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords }) => {
  useEffect(() => {
    const baseTitle = 'BFI Notes';
    document.title = title ? `${title} | ${baseTitle}` : `${baseTitle} | By Students, For Students`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'A clean, minimalist platform for Bank and Financial Institution study materials in Nepal.');
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
  }, [title, description, keywords]);

  return null;
};

export default SEO;
