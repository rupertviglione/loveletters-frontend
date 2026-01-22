import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/products/${id}`);
        setProduct(response.data);
        
        if (response.data.variants?.sizes) {
          setSelectedSize(response.data.variants.sizes[0]);
        }
        if (response.data.variants?.colors) {
          setSelectedColor(response.data.variants.colors[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    const variant = {};
    if (selectedSize) variant.size = selectedSize;
    if (selectedColor) variant.color = selectedColor;
    
    addItem(product, Object.keys(variant).length > 0 ? variant : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 md:pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center px-4">
        <p className="font-fraunces text-xl text-muted-foreground italic mb-6">
          {t('Produto não encontrado.', 'Product not found.')}
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-4 bg-primary text-primary-foreground border border-primary hover:bg-accent hover:border-accent hover:text-accent-foreground transition-all duration-300 uppercase tracking-widest text-sm font-bold"
        >
          {t('Voltar à loja', 'Back to shop')}
        </button>
      </div>
    );
  }

  const title = language === 'pt' ? product.title_pt : product.title_en;
  const description = language === 'pt' ? product.description_pt : product.description_en;

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="product-detail-page">
      <div className="px-4 md:px-8 lg:px-12 py-6">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold hover:text-accent transition-colors mb-8"
          data-testid="back-button"
        >
          <ArrowLeft size={16} />
          {t('Voltar', 'Back')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-border">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-square md:h-[calc(100vh-10rem)] overflow-hidden bg-muted border-b md:border-b-0 md:border-r border-border"
        >
          <img
            src={product.images[0]}
            alt={title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-between p-6 md:p-12"
        >
          <div className="space-y-6">
            <div>
              <h1 className="font-archivo font-bold text-3xl md:text-4xl tracking-tight leading-tight mb-4">
                {title}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                {product.original_price && (
                  <span className="font-mono text-xl line-through text-muted-foreground">
                    {product.original_price.toFixed(2)}€
                  </span>
                )}
                <span className="font-mono text-3xl font-bold text-accent" data-testid="product-price">
                  {product.price.toFixed(2)}€
                </span>
              </div>

              {product.is_bundle && (
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider mb-6">
                  {t('Conjunto - Poupa', 'Bundle - Save')} {(product.original_price - product.price).toFixed(2)}€
                </span>
              )}
            </div>

            <p className="font-fraunces text-base md:text-lg leading-relaxed">
              {description}
            </p>

            {product.bundle_items && product.bundle_items.length > 0 && (
              <div className="border border-border p-4">
                <p className="font-archivo font-bold text-sm uppercase tracking-wider mb-3">
                  {t('Inclui:', 'Includes:')}
                </p>
                <ul className="space-y-2">
                  {product.bundle_items.map((item, index) => (
                    <li key={index} className="font-fraunces text-sm flex items-center gap-2">
                      <span className="w-1 h-1 bg-accent rounded-full"></span>
                      {language === 'pt' ? item.title_pt : item.title_en}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.variants?.sizes && (
              <div>
                <label className="font-archivo font-bold text-sm uppercase tracking-wider block mb-3">
                  {t('Tamanho:', 'Size:')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border uppercase tracking-widest text-xs font-bold transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-transparent border-border hover:border-accent'
                      }`}
                      data-testid={`size-option-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.variants?.colors && (
              <div>
                <label className="font-archivo font-bold text-sm uppercase tracking-wider block mb-3">
                  {t('Cor:', 'Color:')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border uppercase tracking-widest text-xs font-bold transition-all duration-300 ${
                        selectedColor === color
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-transparent border-border hover:border-accent'
                      }`}
                      data-testid={`color-option-${color}`}
                    >
                      {t(
                        color === 'white' ? 'Branco' : color === 'black' ? 'Preto' : color === 'red' ? 'Vermelho' : color === 'beige' ? 'Cru' : color,
                        color.charAt(0).toUpperCase() + color.slice(1)
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full mt-8 px-8 py-4 bg-accent text-accent-foreground border border-accent hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-sm font-bold"
            data-testid="add-to-cart-button"
          >
            {t('Adicionar ao carrinho', 'Add to cart')}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;