import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const PoemLine = ({ line, delay = 0 }) => {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-200px" }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      className="leading-relaxed"
    >
      {line}
    </motion.p>
  );
};

const Home = () => {
  const { t } = useLanguage();

  const poemPT1 = [
    "Se as árvores e os rios te esquecem",
    "Que voz se erguerá para cantar?"
  ];

  const poemEN1 = [
    "If trees and rivers forget you",
    "What voice will rise to sing?"
  ];

  const poemPT2 = [
    "Íntimo. Livre. Doce.",
    "",
    "Vive o amor invadindo o tempo.",
    "Força crua e refulgente, eclodindo nos gestos mais dentro.",
    "",
    "És o meu espaço.",
    "Conheço-o e percorro-o.",
    "",
    "E cumpro-me no interior conquistado",
    "do teu abraço."
  ];

  const poemEN2 = [
    "Intimate. Free. Sweet.",
    "",
    "Love lives invading time.",
    "Raw and resplendent force, bursting in the deepest gestures.",
    "",
    "You are my space.",
    "I know it and I traverse it.",
    "",
    "And I fulfill myself in the conquered interior",
    "of your embrace."
  ];

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="home-page">
      {/* Hero Section with Red Letter Background */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/img/love-letter-red.jpg"
            alt="Love letter background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background"></div>
        </div>

        <div className="relative w-full px-4 md:px-8 lg:px-16 py-12 z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-12"
            >
              <h1 className="font-courier font-bold text-5xl md:text-7xl lg:text-8xl uppercase leading-none tracking-tight mb-6">
                We <span className="text-accent">love</span><br />
                Love Letters.
              </h1>
              
              <p className="font-serif text-xl md:text-2xl italic text-muted-foreground max-w-3xl">
                {t(
                  'Sim, adoramos cartas de amor.',
                  'Yes, we love love letters.'
                )}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mb-8"
            >
              <Link
                to="/shop"
                className="inline-block px-8 py-4 bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground transition-all duration-300 font-courier font-bold uppercase text-sm tracking-widest"
                data-testid="hero-cta"
              >
                {t('Entrar na loja', 'Enter the shop')}
              </Link>
            </motion.div>
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
          className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 bg-secondary/20"
        >
          <p className="font-serif text-base md:text-lg leading-relaxed">
            {t(
              'A Love Letters nasce do desejo de recuperar e renovar a magia de escrever — e receber — cartas de amor. As nossas cartas têm uma forma diferente. São para usar junto ao peito, coladas à pele, são para beijar o ombro, para vestir paredes.',
              'Love Letters was born from the desire to recover and renew the magic of writing — and receiving — love letters. Our letters have a different form. They are meant to be worn close to the heart, against the skin, to kiss the shoulder, to dress walls.'
            )}
          </p>
        </motion.div>
      </section>

      {/* Poem Section 1 with Photo */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 order-2 md:order-1"
        >
          <div className="font-serif text-lg md:text-xl space-y-3">
            {t(poemPT1, poemEN1).map((line, index) => (
              <PoemLine key={index} line={line} delay={index * 0.5} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-square md:min-h-[500px] overflow-hidden order-1 md:order-2"
        >
          <img
            src="/img/poster-se-as-arvores-e-os-rios-te-esquecem-fotografia.webp"
            alt="If trees and rivers forget you"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>

      {/* Intimate Poem with Grayscale Image */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square md:min-h-[500px] overflow-hidden group"
        >
          <img
            src="/img/poster-intimo-fotografia.jpg"
            alt="Intimate poem"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 bg-secondary/20"
        >
          <div className="font-serif text-base md:text-lg space-y-2">
            {t(poemPT2, poemEN2).map((line, index) => (
              <PoemLine key={index} line={line} delay={index * 0.2} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 text-center">
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
            className="font-courier text-2xl md:text-3xl font-bold uppercase tracking-tight"
          >
            So, write that love letter.
          </motion.p>
        </div>
      </section>
    </div>
  );
};

export default Home;