import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border py-8 px-4 md:px-8 lg:px-12" data-testid="footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          © {new Date().getFullYear()} Love Letters
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-xs text-muted-foreground font-mono">
          <a
            href="https://www.instagram.com/loveletters/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-60 transition-opacity underline"
          >
            Instagram
          </a>
          <span className="hidden md:inline text-muted-foreground/40">•</span>
          <a
            href="/shipping-returns"
            className="hover:opacity-60 transition-opacity underline"
          >
            {t('Envios & Devoluções', 'Shipping & Returns')}
          </a>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          {t('Design do site por', 'Website design by')}{' '}
          <a
            href="https://clarastudio.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-60 transition-opacity underline"
          >
            - clara.
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
