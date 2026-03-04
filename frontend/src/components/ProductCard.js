import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);

  const title = language === 'pt' ? product.title_pt : product.title_en;
  const hasVariants = product.variants && (product.variants.sizes || product.variants.colors);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!hasVariants) {
      addItem(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-background hover:bg-secondary/30 transition-all duration-300"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/shop/${product.id}`} className="block">
        {/* Image container with more padding */}
        <div className="aspect-square overflow-hidden bg-muted p-6 md:p-8">
          {/* Placeholder while loading */}
          {!imageLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse">
              <div className="w-12 h-12 rounded-full border-2 border-muted-foreground/30"></div>
            </div>
          )}
          <img
            src={product.images[0]}
            alt={title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Product info with improved spacing */}
        <div className="p-5 md:p-6 pt-5 md:pt-6 space-y-2">
          {/* Product title - serif for elegance, larger size */}
          <h3 className="font-serif text-lg md:text-xl leading-tight tracking-tight">
            {title}
          </h3>

          {/* Price section with proper spacing */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              {product.original_price && (
                <span className="font-mono text-sm line-through text-muted-foreground">
                  {product.original_price.toFixed(2)}€
                </span>
              )}
              <span className="font-mono text-base font-medium opacity-80">
                {product.price.toFixed(2)}€
              </span>
            </div>

            {product.is_bundle && (
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t('Conjunto', 'Bundle')}
              </span>
            )}
          </div>
        </div>
      </Link>

      {!hasVariants && (
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-6 right-6 w-9 h-9 bg-foreground text-background hover:bg-accent transition-colors flex items-center justify-center font-bold text-lg opacity-0 group-hover:opacity-100"
          data-testid={`quick-add-${product.id}`}
          title={t('Adicionar', 'Add')}
        >
          +
        </button>
      )}
    </motion.div>
  );
};

export default ProductCard;
