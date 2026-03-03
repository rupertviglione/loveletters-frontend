import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section with background image */}
      <section className="relative min-h-screen flex items-center pt-32">
        <div className="absolute inset-0">
          <img
            src="/img/hero-bg.png"
            alt="Love letter background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <div className="relative w-full px-4 md:px-8 lg:px-12 py-16 z-10">
          <div className="max-w-7xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="font-serif text-xs md:text-sm uppercase tracking-widest text-muted-foreground mb-12"
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/img/tote-o-poema-3.webp"
              alt="Love Letters"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="space-y-6 font-serif text-base md:text-lg leading-relaxed">
            <p>
              {t(
                'A Love Letters nasceu pelo desejo de recuperar e renovar a magia de escrever — e receber — cartas de amor.',
                'Love Letters was born from the desire to recover and renew the magic of writing — and receiving — love letters.'
              )}
            </p>
            <p>
              {t(
                'E, sim, as nossas cartas têm uma forma diferente. São para usar junto ao peito, coladas à pele, são para beijar o ombro, para vestir paredes.',
                'And yes, our letters have a different form. They are meant to be worn close to the heart, against the skin, to kiss the shoulder, to dress walls.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Text Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/20 border-t border-border">
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

      {/* Banner at bottom - NOT fixed, with margin */}
      <div className="my-16">
        <Link to="/shop" className="block">
          <div className="bg-accent overflow-hidden py-6">
            <div className="scrolling-banner-content flex items-center">
              <span className="inline-block whitespace-nowrap font-courier font-black text-2xl md:text-3xl tracking-widest text-white uppercase">
                WE LOVE LOVE LETTERS                                 VER COLECÇÃO                             WE LOVE LOVE LETTERS                                 VER COLECÇÃO                             WE LOVE LOVE LETTERS                                 VER COLECÇÃO                             
              </span>
              <span className="inline-block whitespace-nowrap font-courier font-black text-2xl md:text-3xl tracking-widest text-white uppercase">
                WE LOVE LOVE LETTERS                                 VER COLECÇÃO                             WE LOVE LOVE LETTERS                                 VER COLECÇÃO                             WE LOVE LOVE LETTERS                                 VER COLECÇÃO                             
              </span>
            </div>
          </div>
        </Link>
      </div>

      <style jsx>{`
        @keyframes scroll-banner {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrolling-banner-content {
          animation: scroll-banner 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;