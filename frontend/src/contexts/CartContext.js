import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  // Last "add to cart" event — drives the discrete bottom-right toast. We keep
  // a counter (`seq`) so that adding the SAME product again re-triggers the
  // toast (since the product object is otherwise identical).
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    localStorage.setItem('ll-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, variant = null) => {
    const itemId = `${product.id}-${variant?.size || ''}-${variant?.color || ''}`;
    let nextCount = 0;

    setItems(prev => {
      const existing = prev.find(item => item.itemId === itemId);

      const next = existing
        ? prev.map(item =>
            item.itemId === itemId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [
            ...prev,
            {
              itemId,
              product_id: product.id,
              title: product.title_pt,
              price: product.price,
              quantity: 1,
              variant,
              image: product.images[0],
            },
          ];
      nextCount = next.reduce((sum, it) => sum + it.quantity, 0);
      return next;
    });

    // Fire the toast — using a fresh `seq` so consecutive adds replace each
    // other (the toast component reads `seq` as its React key).
    setLastAdded({
      seq: Date.now(),
      title: product.title_pt || product.title || product.name,
      image: product.images?.[0],
      variant,
      // We can't read state synchronously yet; defer count by 1 tick.
      itemCount: nextCount,
    });
  };

  const removeItem = (itemId) => {
    setItems(prev => prev.filter(item => item.itemId !== itemId));
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

  const dismissLastAdded = useCallback(() => setLastAdded(null), []);

  // `t` kept in the closure so future i18n strings can read it.
  void t;

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
      lastAdded,
      dismissLastAdded,
    }}>
      {children}
    </CartContext.Provider>
  );
};