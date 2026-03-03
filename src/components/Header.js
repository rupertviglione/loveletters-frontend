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
    >
      <div className="px-4 md:px-8 lg:px-12 py-1 flex items-center justify-between">
        <Link 
          to="/" 
          className="hover:opacity-70 transition-opacity flex items-center"
          data-testid="logo-link"
        >
          <img src="/logo.svg" alt="Love Letters" className="h-24 md:h-32 lg:h-40 w-auto" style={{ maxWidth: '500px' }} />
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

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:text-accent transition-all duration-300"
            aria-label={t('Alternar tema', 'Toggle theme')}
            data-testid="theme-toggle"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={toggleLanguage}
            className="font-mono font-bold text-xs uppercase tracking-widest hover:text-accent transition-all duration-300"
            data-testid="language-toggle"
          >
            {language.toUpperCase()}
          </button>

          <Link
            to="/cart"
            className="relative p-2 hover:text-accent transition-all duration-300"
            data-testid="cart-link"
          >
            <ShoppingCart size={18} />
            {getItemCount() > 0 && (
              <span 
                className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono"
                data-testid="cart-count"
              >
                {getItemCount()}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="md:hidden border-t border-border/30 px-4 py-1 flex justify-around bg-background/40">
        <Link
          to="/"
          className={`font-courier font-bold uppercase text-xs tracking-wider transition-all duration-300 ${
            isActive('/') ? 'text-accent' : 'hover:text-accent'
          }`}
        >
          {t('Sobre', 'About')}
        </Link>
        <Link
          to="/shop"
          className={`font-courier font-bold uppercase text-xs tracking-wider transition-all duration-300 ${
            isActive('/shop') ? 'text-accent' : 'hover:text-accent'
          }`}
        >
          {t('Loja', 'Shop')}
        </Link>
        <Link
          to="/contact"
          className={`font-courier font-bold uppercase text-xs tracking-wider transition-all duration-300 ${
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