import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const ShippingReturns = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="shipping-returns-page">
      <div className="py-8 md:py-12 px-4 md:px-8 lg:px-12">
        <h1 className="font-courier font-bold text-4xl md:text-6xl uppercase tracking-tight leading-none">
          {t('Envios e devoluções', 'Shipping & returns')}
        </h1>
        <p className="font-fraunces text-lg text-muted-foreground italic max-w-2xl mt-4">
          {t(
            'Informação essencial para receberes e devolveres as tuas cartas de amor.',
            'Essential information to receive and return your love letters.'
          )}
        </p>
      </div>

      <div className="px-4 md:px-8 lg:px-12 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="font-archivo font-bold text-2xl uppercase tracking-wider">
              {t('Envios', 'Shipping')}
            </h2>
            <p className="font-fraunces text-base md:text-lg leading-relaxed">
              {t(
                'Processamos as encomendas em 2 a 4 dias úteis. Os custos de envio aparecem no checkout e variam conforme o destino.',
                'We process orders within 2 to 4 business days. Shipping costs are shown at checkout and vary by destination.'
              )}
            </p>
            <p className="font-fraunces text-base md:text-lg leading-relaxed">
              {t(
                'Assim que a tua encomenda for enviada, receberás confirmação por email.',
                'Once your order ships, you will receive an email confirmation.'
              )}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="font-archivo font-bold text-2xl uppercase tracking-wider">
              {t('Devoluções', 'Returns')}
            </h2>
            <p className="font-fraunces text-base md:text-lg leading-relaxed">
              {t(
                'Se precisares de devolver um artigo, escreve-nos dentro de 14 dias após a entrega para combinarmos o envio.',
                'If you need to return an item, write to us within 14 days of delivery so we can arrange the return.'
              )}
            </p>
            <p className="font-fraunces text-base md:text-lg leading-relaxed">
              {t(
                'As peças devem estar sem uso e em perfeito estado.',
                'Items must be unworn and in perfect condition.'
              )}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 text-muted-foreground"
          >
            <p className="font-fraunces text-base md:text-lg leading-relaxed">
              {t(
                'Para qualquer dúvida, usa a página de contacto.',
                'For any questions, use the contact page.'
              )}
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default ShippingReturns;
