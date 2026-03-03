import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import ScrollingBanner from '@/components/ScrollingBanner';

const AnimatedText = ({ text, delay = 0, className }) => {
  return (
    <motion.p
      className={className}
      initial="hidden"
      animate="visible"
      variants={{}}
      aria-label={text}
    >
      {Array.from(text).map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className="inline-block"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + index * 0.03, duration: 0.4 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.p>
  );
};

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pb-20" data-testid="home-page">
      {/* Hero Section with Full Background Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/img/love-letter-red.jpg"
            alt="Love letter background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background"></div>
        </div>

        <div className="relative w-full px-4 md:px-8 lg:px-16 py-32 z-10">
          <div className="max-w-7xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-serif text-lg md:text-xl italic text-white/90 mb-8"
            >
              {t('Poesia que se veste', 'Poetry you can wear')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-12"
            >
              <h1 className="font-syne font-extrabold text-5xl md:text-7xl lg:text-8xl uppercase leading-none tracking-tight mb-6 text-white">
                We <span className="text-accent">love</span><br />
                Love Letters.
              </h1>
              
              <AnimatedText
                className="font-serif text-xl md:text-2xl italic text-white/80 max-w-3xl"
                text={t(
                  'Sim, adoramos cartas de amor.',
                  'Yes, we love love letters.'
                )}
                delay={0.4}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Link
                to="/shop"
                className="inline-block px-8 py-4 bg-accent text-white border-2 border-accent hover:bg-accent/90 transition-all duration-300 font-courier font-bold uppercase text-sm tracking-widest"
                data-testid="hero-cta"
              >
                {t('Entrar na loja', 'Enter the shop')}
              </Link>
              
              <Link
                to="/about"
                className="inline-block px-8 py-4 bg-transparent text-white border-2 border-white hover:bg-white hover:text-foreground transition-all duration-300 font-courier font-bold uppercase text-sm tracking-widest"
              >
                {t('Conhecer', 'Learn more')}
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-white/60 text-sm uppercase tracking-widest font-courier"
            >
              Scroll
            </motion.p>
          </div>
        </div>
      </section>

      {/* Manifesto with Image */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square md:min-h-[500px] overflow-hidden"
        >
          <img
            src="/img/this-is-a-love-poem._20250226_161636_0000-1.png"
            alt="This is a love poem"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 bg-secondary/30"
        >
          <h2 className="font-serif italic text-xl md:text-2xl mb-4 text-muted-foreground">
            {t('Este é um poema de amor', 'This is a love poem')}
          </h2>
          <h3 className="font-syne font-bold text-2xl md:text-3xl uppercase mb-6">
            {t('Manifesto', 'Manifesto')}
          </h3>
          <p className="font-serif text-base md:text-lg leading-relaxed">
            {t(
              'A Love Letters nasce do desejo de recuperar e renovar a magia de escrever — e receber — cartas de amor. As nossas cartas têm uma forma diferente. São para usar junto ao peito, coladas à pele, são para beijar o ombro, para vestir paredes.',
              'Love Letters was born from the desire to recover and renew the magic of writing — and receiving — love letters. Our letters have a different form. They are meant to be worn close to the heart, against the skin, to kiss the shoulder, to dress walls.'
            )}
          </p>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 text-center bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-serif text-xl md:text-2xl leading-relaxed italic mb-8"
          >
            {t(
              'E quando as palavras não parecem ser suficientes, ou em silêncio se diz tudo o que é verdadeiramente necessário, para cada uma destas nossas cartas — que esperamos que façam vossas —, escolhemos uma imagem que representa o ambiente que a inspirou.',
              'And when words don\'t seem to be enough, or in silence everything that is truly necessary is said, for each of these letters — which we hope will become yours — we choose an image that represents the environment that inspired it.'
            )}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-syne text-2xl md:text-3xl font-bold uppercase tracking-tight"
          >
            So, write that love letter.
          </motion.p>
        </div>
      </section>

      {/* Scrolling Banner at Bottom */}
      <ScrollingBanner />
    </div>
  );
};

export default Home;