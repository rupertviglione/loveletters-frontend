import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import './ScrollingBanner.css';

const ScrollingBanner = () => {
  const { t } = useLanguage();
  
  const text1 = t('WE LOVE LOVE LETTERS', 'WE LOVE LOVE LETTERS');
  const text2 = t('VER COLECÇÃO', 'VIEW COLLECTION');
  
  // More spacing and visual separator
  const repeatedText = `${text1}     •     ${text2}     •     ${text1}     •     ${text2}     •     ${text1}     •     ${text2}     •     `;

  return (
    <Link to="/shop" className="scrolling-banner-wrapper">
      <div className="scrolling-banner">
        <div className="scrolling-banner-content">
          <span>{repeatedText}</span>
          <span>{repeatedText}</span>
        </div>
      </div>
    </Link>
  );
};

export default ScrollingBanner;