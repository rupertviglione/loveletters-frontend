import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="about-page">
      <div className="py-8 md:py-12 px-4 md:px-8 lg:px-12">
        <h1 className="font-courier font-bold text-4xl md:text-6xl uppercase tracking-tight leading-none">
          {t('Sobre', 'About')}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square md:h-[70vh] overflow-hidden bg-muted"
        >
          <img
            src="/img/tote-o-poema-3.webp"
            alt="Love Letters"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-6 md:p-12 lg:p-16 flex flex-col justify-center bg-secondary/20"
        >
          <div className="space-y-6 font-serif text-base md:text-lg leading-relaxed">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t(
                'A Love Letters nasceu pelo desejo de recuperar e renovar a magia de escrever — e receber — cartas de amor.',
                'Love Letters was born from the desire to recover and renew the magic of writing — and receiving — love letters.'
              )}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {t(
                'E, sim, as nossas cartas têm uma forma diferente. São para usar junto ao peito, coladas à pele, são para beijar o ombro, para vestir paredes.',
                'And yes, our letters have a different form. They are meant to be worn close to the heart, against the skin, to kiss the shoulder, to dress walls.'
              )}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {t(
                'E quando as palavras não parecem ser suficientes, ou em silêncio se diz tudo o que é verdadeiramente necessário, para cada uma destas nossas cartas — que esperamos que façam vossas —, escolhemos uma imagem que representa o ambiente que a inspirou.',
                'And when words don\'t seem to be enough, or in silence everything that is truly necessary is said, for each of these letters — which we hope will become yours — we choose an image that represents the environment that inspired it.'
              )}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="font-courier font-bold text-2xl md:text-3xl uppercase tracking-tight pt-6"
            >
              So, write that love letter.
            </motion.p>
          </div>
        </motion.div>
      </div>

      <div className="py-16 md:py-24 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-serif text-lg md:text-xl leading-relaxed text-center italic text-muted-foreground"
          >
            {t(
              'Cada peça é pensada com carinho, para que possas carregar contigo uma mensagem de amor, onde quer que vás.',
              'Each piece is thoughtfully designed so you can carry a message of love with you, wherever you go.'
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;