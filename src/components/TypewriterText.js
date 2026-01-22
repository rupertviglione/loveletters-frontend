import React from 'react';
import { motion } from 'framer-motion';

const TypewriterText = ({ text, className = '', delay = 0 }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay }
    })
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'tween',
        ease: 'easeOut'
      }
    },
    hidden: {
      opacity: 0,
      y: 5
    }
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {text.split('').map((char, index) => (
        <motion.span key={index} variants={child}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default TypewriterText;