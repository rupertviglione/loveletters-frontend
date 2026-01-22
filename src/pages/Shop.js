import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = [
  { id: 'all', pt: 'Todos', en: 'All' },
  { id: 'tshirts', pt: 'T-shirts', en: 'T-shirts' },
  { id: 'totebags', pt: 'Tote Bags', en: 'Tote Bags' },
  { id: 'posters', pt: 'Posters', en: 'Posters' },
  { id: 'complementos', pt: 'Complementos', en: 'Accessories' },
  { id: 'bundles', pt: 'Conjuntos', en: 'Bundles' }
];

const Shop = () => {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/products`, {
          params: selectedCategory !== 'all' ? { category: selectedCategory } : {}
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="shop-page">
      <div className="border-b border-border py-8 md:py-12 px-4 md:px-8 lg:px-12">
        <h1 className="font-archivo font-black text-4xl md:text-6xl tracking-tighter uppercase leading-none mb-6">
          {t('Loja', 'Shop')}
        </h1>
        <p className="font-fraunces text-lg text-muted-foreground italic max-w-2xl">
          {t(
            'Cartas de amor para vestir, tocar e guardar.',
            'Love letters to wear, touch and keep.'
          )}
        </p>
      </div>

      <div className="border-b border-border py-4 px-4 md:px-8 lg:px-12 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 border uppercase tracking-widest text-xs font-bold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent border-border hover:border-accent hover:text-accent'
              }`}
              data-testid={`category-filter-${category.id}`}
            >
              {language === 'pt' ? category.pt : category.en}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-t border-border">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-24 px-4">
          <p className="font-fraunces text-xl text-muted-foreground italic">
            {t('Nenhum produto encontrado.', 'No products found.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Shop;