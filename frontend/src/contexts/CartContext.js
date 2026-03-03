import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useLanguage } from './LanguageContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { t } = useLanguage();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('ll-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ll-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, variant = null) => {
    const itemId = `${product.id}-${variant?.size || ''}-${variant?.color || ''}`;
    
    setItems(prev => {
      const existing = prev.find(item => item.itemId === itemId);
      
      if (existing) {
        return prev.map(item =>
          item.itemId === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, {
        itemId,
        product_id: product.id,
        title: product.title_pt,
        price: product.price,
        quantity: 1,
        variant,
        image: product.images[0]
      }];
    });
    
    toast.success(t('Adicionado ao carrinho!', 'Added to cart!'));
  };

  const removeItem = (itemId) => {
    setItems(prev => prev.filter(item => item.itemId !== itemId));
    toast.success(t('Removido do carrinho', 'Removed from cart'));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};