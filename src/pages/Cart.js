import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const Cart = () => {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center px-4" data-testid="empty-cart">
        <h1 className="font-archivo font-black text-4xl md:text-6xl tracking-tighter uppercase mb-6">
          {t('Carrinho', 'Cart')}
        </h1>
        <p className="font-fraunces text-xl text-muted-foreground italic mb-8">
          {t('O seu carrinho está vazio.', 'Your cart is empty.')}
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-4 bg-accent text-accent-foreground border border-accent hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-sm font-bold"
          data-testid="shop-button"
        >
          {t('Ir às compras', 'Go shopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="cart-page">
      <div className="border-b border-border py-8 md:py-12 px-4 md:px-8 lg:px-12">
        <h1 className="font-archivo font-black text-4xl md:text-6xl tracking-tighter uppercase">
          {t('Carrinho', 'Cart')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border border-t border-border">
        <div className="lg:col-span-2 bg-background">
          {items.map((item, index) => (
            <motion.div
              key={item.itemId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border-b border-border p-6 flex gap-6"
              data-testid={`cart-item-${item.itemId}`}
            >
              <div className="w-24 h-24 flex-shrink-0 bg-muted overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-archivo font-bold text-lg mb-2">{item.title}</h3>
                
                {item.variant && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.variant.size && `${t('Tamanho', 'Size')}: ${item.variant.size}`}
                    {item.variant.size && item.variant.color && ' | '}
                    {item.variant.color && `${t('Cor', 'Color')}: ${item.variant.color}`}
                  </p>
                )}

                <p className="font-mono font-bold text-accent">{item.price.toFixed(2)}€</p>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                      className="p-2 hover:bg-secondary transition-colors"
                      data-testid={`decrease-qty-${item.itemId}`}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-mono font-bold" data-testid={`quantity-${item.itemId}`}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                      className="p-2 hover:bg-secondary transition-colors"
                      data-testid={`increase-qty-${item.itemId}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.itemId)}
                    className="p-2 text-destructive hover:bg-destructive/10 transition-colors"
                    data-testid={`remove-item-${item.itemId}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono font-bold text-lg">
                  {(item.price * item.quantity).toFixed(2)}€
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-background p-6 lg:p-8 border-l border-border">
          <div className="sticky top-32">
            <h2 className="font-archivo font-bold text-2xl uppercase tracking-tighter mb-6">
              {t('Resumo', 'Summary')}
            </h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between">
                <span className="font-mono text-sm uppercase tracking-wider">
                  {t('Subtotal', 'Subtotal')}
                </span>
                <span className="font-mono font-bold" data-testid="subtotal">
                  {getTotal().toFixed(2)}€
                </span>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('Envio', 'Shipping')}</span>
                <span>{t('Calculado no checkout', 'Calculated at checkout')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-archivo font-bold text-xl uppercase tracking-tighter">
                Total
              </span>
              <span className="font-mono font-bold text-2xl text-accent" data-testid="total">
                {getTotal().toFixed(2)}€
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full px-8 py-4 bg-accent text-accent-foreground border border-accent hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-sm font-bold"
              data-testid="checkout-button"
            >
              {t('Finalizar compra', 'Checkout')}
            </button>

            <button
              onClick={() => navigate('/shop')}
              className="w-full mt-4 px-8 py-4 bg-transparent border border-border hover:border-accent hover:text-accent transition-all duration-300 uppercase tracking-widest text-sm font-bold"
            >
              {t('Continuar a comprar', 'Continue shopping')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;