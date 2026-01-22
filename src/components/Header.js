import React from 'react';
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

  return (
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border" data-testid="header">
      <div className="px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="hover:opacity-70 transition-opacity font-courier font-bold tracking-tight text-lg"
          data-testid="logo-link"
        >
          love letters.
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`font-courier font-bold uppercase text-sm tracking-wider hover:opacity-60 transition-opacity ${
              isActive('/') ? 'opacity-60' : ''
            }`}
            data-testid="nav-home"
          >
            {t('Início', 'Home')}
          </Link>
          <Link
            to="/shop"
            className={`font-courier font-bold uppercase text-sm tracking-wider hover:opacity-60 transition-opacity ${
              isActive('/shop') ? 'opacity-60' : ''
            }`}
            data-testid="nav-shop"
          >
            {t('Loja', 'Shop')}
          </Link>
          <Link
            to="/about"
            className={`font-courier font-bold uppercase text-sm tracking-wider hover:opacity-60 transition-opacity ${
              isActive('/about') ? 'opacity-60' : ''
            }`}
            data-testid="nav-about"
          >
            {t('Sobre', 'About')}
          </Link>
          <Link
            to="/contact"
            className={`font-courier font-bold uppercase text-sm tracking-wider hover:opacity-60 transition-opacity ${
              isActive('/contact') ? 'opacity-60' : ''
            }`}
            data-testid="nav-contact"
          >
            {t('Contacto', 'Contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:opacity-60 transition-opacity"
            aria-label={t('Alternar tema', 'Toggle theme')}
            data-testid="theme-toggle"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={toggleLanguage}
            className="font-mono font-bold text-xs uppercase tracking-widest hover:opacity-60 transition-opacity"
            data-testid="language-toggle"
          >
            {language.toUpperCase()}
          </button>

          <Link
            to="/cart"
            className="relative p-2 hover:opacity-60 transition-opacity"
            data-testid="cart-link"
          >
            <ShoppingCart size={18} />
            {getItemCount() > 0 && (
              <span 
                className="absolute -top-1 -right-1 bg-foreground text-background text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono"
                data-testid="cart-count"
              >
                {getItemCount()}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="md:hidden border-t border-border px-4 py-3 flex justify-around">
        <Link
          to="/"
          className={`font-courier font-bold uppercase text-xs tracking-wider hover:opacity-60 transition-opacity ${
            isActive('/') ? 'opacity-60' : ''
          }`}
        >
          {t('Início', 'Home')}
        </Link>
        <Link
          to="/shop"
          className={`font-courier font-bold uppercase text-xs tracking-wider hover:opacity-60 transition-opacity ${
            isActive('/shop') ? 'opacity-60' : ''
          }`}
        >
          {t('Loja', 'Shop')}
        </Link>
        <Link
          to="/about"
          className={`font-courier font-bold uppercase text-xs tracking-wider hover:opacity-60 transition-opacity ${
            isActive('/about') ? 'opacity-60' : ''
          }`}
        >
          {t('Sobre', 'About')}
        </Link>
        <Link
          to="/contact"
          className={`font-courier font-bold uppercase text-xs tracking-wider hover:opacity-60 transition-opacity ${
            isActive('/contact') ? 'opacity-60' : ''
          }`}
        >
          {t('Contacto', 'Contact')}
        </Link>
      </nav>
    </header>
  );
};

export default Header;