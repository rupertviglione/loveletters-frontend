import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const title = language === 'pt' ? product.title_pt : product.title_en;
  const hasVariants = product.variants && (product.variants.sizes || product.variants.colors);
  const images = product.images && product.images.length > 0 ? product.images : [];
  const hasMultipleImages = images.length > 1;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!hasVariants) {
      addItem(product);
    }
  };

  const goToPreviousImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageLoaded(false);
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageLoaded(false);
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
        <div className="aspect-square overflow-hidden bg-muted p-3 md:p-4 relative">
          {!imageLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30"></div>
            </div>
          )}
          {images[activeImageIndex] && (
            <img
              src={images[activeImageIndex]}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={goToPreviousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t('Imagem anterior', 'Previous image')}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goToNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t('Próxima imagem', 'Next image')}
              >
                ›
              </button>
            </>
          )}
        </div>

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
