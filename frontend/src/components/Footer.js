import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const CONTACT_EMAIL = 'hello@weloveloveletters.com';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border py-6 px-4 md:px-8 lg:px-12" data-testid="footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
          © {new Date().getFullYear()} Love Letters
        </p>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
          <a
            href="https://www.instagram.com/loveletters/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            Instagram
          </a>
          <span className="text-muted-foreground/30">·</span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="hover:text-accent transition-colors"
          >
            {CONTACT_EMAIL}
          </a>
          <span className="text-muted-foreground/30">·</span>
          <a
            href="/shipping-returns"
            className="hover:text-accent transition-colors"
          >
            {t('Envios & Devoluções', 'Shipping & Returns')}
          </a>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono">
          <a
            href="https://clarastudio.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            - clara.
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
