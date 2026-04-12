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
      className="group relative bg-background border border-transparent hover:border-border transition-all duration-300"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/shop/${product.id}`} className="block">
        {/* Image container - tighter padding */}
        <div className="aspect-square overflow-hidden bg-muted p-3 md:p-4">
          {!imageLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30"></div>
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

        {/* Product info - compact */}
        <div className="p-3 md:p-4 space-y-1">
          <h3 className="font-serif text-sm md:text-base leading-tight tracking-tight line-clamp-2">
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.original_price && (
                <span className="font-mono text-xs line-through text-muted-foreground">
                  {product.original_price.toFixed(2)}€
                </span>
              )}
              <span className="font-mono text-sm font-medium">
                {product.price.toFixed(2)}€
              </span>
            </div>

            {product.is_bundle && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                {t('Conjunto', 'Bundle')}
              </span>
            )}
          </div>
        </div>
      </Link>

      {!hasVariants && (
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-4 right-4 w-7 h-7 bg-foreground text-background hover:bg-accent active:scale-90 transition-all duration-200 flex items-center justify-center font-bold text-sm opacity-0 group-hover:opacity-100"
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
