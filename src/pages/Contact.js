import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const API = process.env.REACT_APP_BACKEND_URL 
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : '/api';

const Contact = () => {
  const { t } = useLanguage();
  const audioContextRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [pressedKey, setPressedKey] = useState(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playTypewriterSound = (type = 'key') => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    
    const frequencies = {
      key: 280,
      backspace: 190,
      enter: 380
    };
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequencies[type] || frequencies.key, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.09);
  };

  const handleKeyDown = (e) => {
    const key = e.key;
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);
    
    if (key === 'Enter') {
      playTypewriterSound('enter');
    } else if (key === 'Backspace') {
      playTypewriterSound('backspace');
    } else if (key.length === 1) {
      playTypewriterSound('key');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await axios.post(`${API}/contact`, formData);
      
      toast.success(
        t(
          'Mensagem enviada!',
          'Message sent!'
        )
      );
      
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(
        t(
          'Erro ao enviar.',
          'Error sending.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 bg-background" data-testid="contact-page">
      <div className="px-4 md:px-8 mb-2">
        <h1 className="font-syne font-extrabold text-5xl md:text-7xl uppercase tracking-tight leading-none">
          {t('CONTACTO', 'CONTACT')}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full mt-2"
      >
        <div className="relative w-full max-w-4xl mx-auto px-4">
          <div className="relative" style={{ aspectRatio: '1/1', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))' }}>
            <img
              src="/img/maquina-nova.png"
              alt="Typewriter"
              className="w-full h-full object-contain"
              style={{ filter: 'brightness(1.02) contrast(0.98)' }}
            />
            
            <form
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="absolute flex flex-col"
              style={{
                top: '12%',
                left: '28%',
                right: '28%',
                gap: 'clamp(6px, 1.2vw, 12px)'
              }}
              data-testid="contact-form"
            >
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-transparent border-0 border-b border-black/15 focus:border-black/30 focus:outline-none font-mono text-black placeholder:text-black/30"
                style={{ 
                  fontSize: 'clamp(10px, 1.3vw, 15px)', 
                  padding: 'clamp(3px, 0.5vw, 6px) 0',
                  lineHeight: '1.4'
                }}
                placeholder={t('Nome', 'Name')}
                data-testid="contact-name"
              />

              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-transparent border-0 border-b border-black/15 focus:border-black/30 focus:outline-none font-mono text-black placeholder:text-black/30"
                style={{ 
                  fontSize: 'clamp(10px, 1.3vw, 15px)', 
                  padding: 'clamp(3px, 0.5vw, 6px) 0',
                  lineHeight: '1.4'
                }}
                placeholder="Email"
                data-testid="contact-email"
              />

              <textarea
                required
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={5}
                className="w-full bg-transparent border-0 focus:outline-none font-mono text-black placeholder:text-black/30 resize-none"
                style={{ 
                  fontSize: 'clamp(10px, 1.3vw, 15px)', 
                  padding: 'clamp(3px, 0.5vw, 6px) 0',
                  lineHeight: '1.6'
                }}
                placeholder={t('Mensagem', 'Message')}
                data-testid="contact-message"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full font-mono text-black/60 hover:text-accent transition-colors disabled:opacity-30 text-left"
                style={{ 
                  fontSize: 'clamp(9px, 1.1vw, 13px)',
                  marginTop: 'clamp(4px, 0.8vw, 10px)'
                }}
                data-testid="contact-submit"
              >
                {loading ? '...' : `[${t('enviar', 'send')}]`}
              </button>
            </form>
          </div>
        </div>

        <AnimatePresence>
          {pressedKey && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed bottom-32 right-8 bg-accent text-white px-6 py-3 rounded-full font-courier font-bold text-lg shadow-2xl z-50"
            >
              {pressedKey === ' ' ? '␣' : pressedKey.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center font-serif text-sm md:text-base italic text-muted-foreground mt-8 px-4">
          {t(
            'Escreva-nos. As suas palavras são importantes.',
            'Write to us. Your words matter.'
          )}
        </p>
      </motion.div>

      {/* Banner - MUITO ESPAÇO */}
      <div className="my-16">
        <Link to="/shop" className="block">
          <div className="bg-accent overflow-hidden py-4">
            <div className="banner-scroll flex items-center">
              <span className="inline-block whitespace-nowrap font-courier font-black text-xl md:text-2xl tracking-widest text-white uppercase">
                WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span className="inline-block whitespace-nowrap font-courier font-black text-xl md:text-2xl tracking-widest text-white uppercase">
                WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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

export default Contact;