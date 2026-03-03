import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
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

      {/* THIS IS A LOVE POEM Section - SEM fundo branco */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="p-12 md:p-16 flex items-center justify-center aspect-square">
            <h2 className="font-syne font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase leading-none tracking-tighter text-accent text-center">
              THIS IS<br />
              A LOVE<br />
              POEM.
            </h2>
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

      {/* Banner - ESPAÇO REDUZIDO */}
      <div className="my-16">
        <Link to="/shop" className="block">
          <div className="bg-accent overflow-hidden py-4">
            <div className="banner-scroll flex items-center">
              <span className="inline-block whitespace-nowrap font-courier font-black text-xl md:text-2xl tracking-widest text-white uppercase">
                WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span className="inline-block whitespace-nowrap font-courier font-black text-xl md:text-2xl tracking-widest text-white uppercase">
                WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>
        </Link>
      </div>

      <style jsx>{`
        @keyframes banner-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .banner-scroll {
          animation: banner-scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;