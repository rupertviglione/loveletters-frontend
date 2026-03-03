import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Moon, Sun } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { getItemCount } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <header 
      className="fixed top-0 w-full z-50 transition-all duration-300 bg-background/40 backdrop-blur-sm border-b border-border/30"
      data-testid="header"
      style={{ padding: '8px 0' }}
    >
      <div className="px-3 md:px-8 lg:px-12 flex items-center justify-between" style={{ minHeight: 'auto' }}>
        <Link 
          to="/" 
          className="hover:opacity-70 transition-opacity flex items-center flex-shrink-0"
          data-testid="logo-link"
        >
          {/* Mobile: smaller logo, Desktop: normal size */}
          <img 
            src="/logo-v2.svg" 
            alt="Love Letters" 
            className="h-5 md:h-[30px] w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`font-courier font-bold uppercase text-sm tracking-wider transition-all duration-300 ${
              isActive('/') ? 'text-accent' : 'hover:text-accent'
            }`}
            data-testid="nav-sobre"
          >
            {t('Sobre', 'About')}
          </Link>
          <Link
            to="/shop"
            className={`font-courier font-bold uppercase text-sm tracking-wider transition-all duration-300 ${
              isActive('/shop') ? 'text-accent' : 'hover:text-accent'
            }`}
            data-testid="nav-shop"
          >
            {t('Loja', 'Shop')}
          </Link>
          <Link
            to="/contact"
            className={`font-courier font-bold uppercase text-sm tracking-wider transition-all duration-300 ${
              isActive('/contact') ? 'text-accent' : 'hover:text-accent'
            }`}
            data-testid="nav-contact"
          >
            {t('Contacto', 'Contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="p-1.5 md:p-2 hover:text-accent transition-all duration-300"
            aria-label={t('Alternar tema', 'Toggle theme')}
            data-testid="theme-toggle"
          >
            {theme === 'light' ? <Moon size={16} className="md:w-[18px] md:h-[18px]" /> : <Sun size={16} className="md:w-[18px] md:h-[18px]" />}
          </button>

          <button
            onClick={toggleLanguage}
            className="font-mono font-bold text-[10px] md:text-xs uppercase tracking-wider md:tracking-widest hover:text-accent transition-all duration-300"
            data-testid="language-toggle"
          >
            {language.toUpperCase()}
          </button>

          <Link
            to="/cart"
            className="relative p-1.5 md:p-2 hover:text-accent transition-all duration-300"
            data-testid="cart-link"
          >
            <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
            {getItemCount() > 0 && (
              <span 
                className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-accent text-white text-[10px] md:text-xs font-bold rounded-full w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center font-mono"
                data-testid="cart-count"
              >
                {getItemCount()}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile navigation - compact and centered */}
      <nav className="md:hidden border-t border-border/30 flex justify-center gap-6 bg-background/40 py-1.5 px-2">
        <Link
          to="/"
          className={`font-courier font-bold uppercase text-[10px] tracking-wide transition-all duration-300 ${
            isActive('/') ? 'text-accent' : 'hover:text-accent'
          }`}
        >
          {t('Sobre', 'About')}
        </Link>
        <Link
          to="/shop"
          className={`font-courier font-bold uppercase text-[10px] tracking-wide transition-all duration-300 ${
            isActive('/shop') ? 'text-accent' : 'hover:text-accent'
          }`}
        >
          {t('Loja', 'Shop')}
        </Link>
        <Link
          to="/contact"
          className={`font-courier font-bold uppercase text-[10px] tracking-wide transition-all duration-300 ${
            isActive('/contact') ? 'text-accent' : 'hover:text-accent'
          }`}
        >
          {t('Contacto', 'Contact')}
        </Link>
      </nav>
    </header>
  );
};

export default Header;