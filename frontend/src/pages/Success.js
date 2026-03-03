import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Success = () => {
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [orderData, setOrderData] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      navigate('/cart');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;

    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(`${API}/checkout/status/${sessionId}`);
        
        if (response.data.payment_status === 'paid') {
          setStatus('success');
          setOrderData(response.data);
          clearCart();
        } else if (response.data.status === 'expired') {
          setStatus('error');
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkPaymentStatus, 2000);
          } else {
            setStatus('timeout');
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkPaymentStatus, 2000);
        } else {
          setStatus('error');
        }
      }
    };

    checkPaymentStatus();
  }, [sessionId, navigate, clearCart]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center px-4">
        <Loader className="animate-spin text-accent mb-6" size={48} />
        <p className="font-fraunces text-xl text-muted-foreground italic">
          {t('A verificar pagamento...', 'Checking payment...')}
        </p>
      </div>
    );
  }

  if (status === 'error' || status === 'timeout') {
    return (
      <div className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center px-4">
        <h1 className="font-archivo font-black text-4xl md:text-6xl tracking-tighter uppercase mb-6 text-destructive">
          {t('Erro', 'Error')}
        </h1>
        <p className="font-fraunces text-xl text-muted-foreground italic mb-8 text-center max-w-2xl">
          {t(
            'Ocorreu um erro ao verificar o pagamento. Por favor, contacte-nos se o problema persistir.',
            'An error occurred while verifying payment. Please contact us if the problem persists.'
          )}
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-4 bg-accent text-accent-foreground border border-accent hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-sm font-bold"
        >
          {t('Voltar à loja', 'Back to shop')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="success-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-4 py-12 md:py-24 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <CheckCircle className="mx-auto text-accent" size={80} />
        </motion.div>

        <h1 className="font-archivo font-black text-4xl md:text-6xl tracking-tighter uppercase mb-6">
          {t('Obrigado!', 'Thank you!')}
        </h1>

        <p className="font-fraunces text-xl md:text-2xl leading-relaxed mb-8">
          {t(
            'O seu pedido foi confirmado com sucesso. Receberá um email de confirmação em breve.',
            'Your order has been confirmed successfully. You will receive a confirmation email shortly.'
          )}
        </p>

        {orderData?.metadata && (
          <div className="border border-border p-6 md:p-8 mb-8 text-left max-w-2xl mx-auto">
            <h2 className="font-archivo font-bold text-xl uppercase tracking-tighter mb-4">
              {t('Detalhes do pedido', 'Order details')}
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <p>
                <span className="text-muted-foreground">{t('Nome:', 'Name:')}</span>{' '}
                <span className="font-bold">{orderData.metadata.customer_name}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span>{' '}
                <span className="font-bold">{orderData.metadata.customer_email}</span>
              </p>
              <p>
                <span className="text-muted-foreground">{t('Total:', 'Total:')}</span>{' '}
                <span className="font-bold text-accent">
                  {(orderData.amount_total / 100).toFixed(2)}€
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-4 bg-accent text-accent-foreground border border-accent hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-sm font-bold"
            data-testid="continue-shopping-button"
          >
            {t('Continuar a comprar', 'Continue shopping')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-transparent border border-border hover:border-accent hover:text-accent transition-all duration-300 uppercase tracking-widest text-sm font-bold"
          >
            {t('Voltar ao início', 'Back to home')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;