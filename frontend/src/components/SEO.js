import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  image = '/img/og-image.jpg',
  url,
  type = 'website'
}) => {
  const siteTitle = 'Love Letters';
  const fullTitle = title ? `${title} — ${siteTitle}` : `${siteTitle} — We love Love Letters`;
  const defaultDescription = 'Love Letters transforma cartas de amor em objectos que podes vestir. Merchandising poético independente inspirado na arte de escrever cartas.';
  const finalDescription = description || defaultDescription;
  const baseUrl = 'https://weloveloveletters.netlify.app';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
};

export default SEO;
