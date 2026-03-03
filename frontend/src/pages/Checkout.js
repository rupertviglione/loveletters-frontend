import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Checkout = () => {
  const { t } = useLanguage();
  const { items, getTotal } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant
      }));
      
      const orderResponse = await axios.post(`${API}/orders`, {
        customer_email: formData.email,
        customer_name: formData.name,
        items: orderItems
      });
      
      const order = orderResponse.data;
      
      const originUrl = window.location.origin;
      
      const checkoutResponse = await axios.post(`${API}/checkout/session`, {
        order_id: order.id,
        origin_url: originUrl
      });
      
      if (checkoutResponse.data.url) {
        window.location.href = checkoutResponse.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(t('Erro ao processar pagamento. Tente novamente.', 'Error processing payment. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="checkout-page">
      <div className="border-b border-border py-8 md:py-12 px-4 md:px-8 lg:px-12">
        <h1 className="font-archivo font-black text-4xl md:text-6xl tracking-tighter uppercase">
          {t('Finalizar compra', 'Checkout')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border border-t border-border">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-background p-6 md:p-12"
        >
          <h2 className="font-archivo font-bold text-2xl uppercase tracking-tighter mb-8">
            {t('Informações de contacto', 'Contact information')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-archivo font-bold text-sm uppercase tracking-wider block mb-2">
                {t('Nome completo', 'Full name')}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                data-testid="checkout-name"
              />
            </div>

            <div>
              <label className="font-archivo font-bold text-sm uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                data-testid="checkout-email"
              />
            </div>

            <div className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                {t(
                  'Será redirecionado para o Stripe para finalizar o pagamento de forma segura.',
                  'You will be redirected to Stripe to securely complete your payment.'
                )}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-accent text-accent-foreground border border-accent hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="proceed-payment-button"
              >
                {loading
                  ? t('A processar...', 'Processing...')
                  : t('Prosseguir para pagamento', 'Proceed to payment')}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-background p-6 md:p-12 border-l border-border"
        >
          <h2 className="font-archivo font-bold text-2xl uppercase tracking-tighter mb-8">
            {t('Resumo do pedido', 'Order summary')}
          </h2>

          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <div key={item.itemId} className="flex gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 flex-shrink-0 bg-muted overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-archivo font-bold text-sm">{item.title}</p>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground">
                      {item.variant.size && item.variant.size}
                      {item.variant.size && item.variant.color && ' | '}
                      {item.variant.color && item.variant.color}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('Qtd', 'Qty')}: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm">
                    {(item.price * item.quantity).toFixed(2)}€
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-border">
            <div className="flex justify-between">
              <span className="font-mono text-sm uppercase tracking-wider">
                {t('Subtotal', 'Subtotal')}
              </span>
              <span className="font-mono font-bold">
                {getTotal().toFixed(2)}€
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-archivo font-bold text-xl uppercase tracking-tighter">
                Total
              </span>
              <span className="font-mono font-bold text-2xl text-accent">
                {getTotal().toFixed(2)}€
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;