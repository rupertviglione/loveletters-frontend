import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section - Clean beige background like reference */}
      <section className="relative min-h-screen flex items-center bg-background pt-24">
        <div className="w-full px-4 md:px-8 lg:px-12 py-16">
          <div className="max-w-7xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="font-serif text-sm md:text-base uppercase tracking-widest text-muted-foreground mb-12"
            >
              {t('Poesia que se veste', 'Poetry you can wear')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-syne font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none tracking-tighter mb-16"
            >
              WE <span className="text-accent">LOVE</span><br />
              LOVE<br />
              LETTERS<span className="text-accent">.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="font-serif text-xl md:text-2xl italic text-foreground/80 mb-12 max-w-xl"
            >
              {t('Sim, adoramos cartas de amor.', 'Yes, we love love letters.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-10 py-5 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 font-courier font-bold uppercase text-sm tracking-wider"
                data-testid="hero-cta"
              >
                {t('Entrar na loja', 'Enter the shop')}
                <span>→</span>
              </Link>
              
              <Link
                to="/about"
                className="inline-block px-10 py-5 bg-transparent text-foreground border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-300 font-courier font-bold uppercase text-sm tracking-wider"
              >
                {t('Conhecer', 'Learn more')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Text Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-background border-t border-border">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-serif text-xl md:text-2xl lg:text-3xl leading-relaxed italic text-foreground/70 mb-16">
            {t(
              'E quando as palavras não parecem ser suficientes, ou em silêncio se diz tudo o que é verdadeiramente necessário, para cada uma destas nossas cartas — que esperamos que façam vossas —, escolhemos uma imagem que representa o ambiente que a inspirou.',
              'And when words don\'t seem to be enough, or in silence everything that is truly necessary is said, for each of these letters — which we hope will become yours — we choose an image that represents the environment that inspired it.'
            )}
          </p>

          <h2 className="font-syne text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight">
            SO, WRITE THAT <span className="text-accent">LOVE<br/>LETTER.</span>
          </h2>
        </div>
      </section>

      {/* Fixed Banner at Bottom - before footer */}
      <div className="h-24"></div>
      
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-accent overflow-hidden" style={{ height: '80px' }}>
        <div className="scrolling-banner-content h-full flex items-center">
          <span className="inline-block whitespace-nowrap font-courier font-black text-2xl md:text-3xl tracking-widest text-white uppercase">
            WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     
          </span>
          <span className="inline-block whitespace-nowrap font-courier font-black text-2xl md:text-3xl tracking-widest text-white uppercase">
            WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     WRITE THAT LOVE LETTER     
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-banner {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrolling-banner-content {
          animation: scroll-banner 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;