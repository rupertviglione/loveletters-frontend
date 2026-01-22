import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();

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
      className="group relative border border-border bg-background hover:bg-secondary/30 transition-all duration-300"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/shop/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted border-b border-border">
          <img
            src={product.images[0]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-courier font-bold text-base tracking-tight leading-tight">
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              {product.original_price && (
                <span className="font-mono text-xs line-through text-muted-foreground mr-2">
                  {product.original_price.toFixed(2)}€
                </span>
              )}
              <span className="font-mono text-sm font-bold">
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
          className="absolute bottom-4 right-4 w-8 h-8 bg-foreground text-background hover:bg-muted-foreground transition-colors flex items-center justify-center font-bold text-lg opacity-0 group-hover:opacity-100"
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