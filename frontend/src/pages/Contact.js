import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
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
    <div className="min-h-screen bg-background overflow-x-hidden" data-testid="contact-page" style={{ paddingTop: '80px' }}>
      {/* Title - constrained to viewport */}
      <div className="px-4 md:px-8 mb-0">
        <h1 className="font-syne font-extrabold text-3xl md:text-7xl uppercase tracking-tight leading-none">
          {t('CONTACTO', 'CONTACT')}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full"
        style={{ marginTop: '-5px' }}
      >
        {/* Desktop: original layout with form on image */}
        <div className="hidden md:block relative w-full max-w-4xl mx-auto px-4">
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
              data-testid="contact-form-desktop"
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
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full font-mono text-black/60 hover:text-accent transition-colors disabled:opacity-30 text-left"
                style={{ 
                  fontSize: 'clamp(9px, 1.1vw, 13px)',
                  marginTop: 'clamp(4px, 0.8vw, 10px)'
                }}
              >
                {loading ? '...' : `[${t('enviar', 'send')}]`}
              </button>
            </form>
          </div>
        </div>

        {/* Mobile: Image first (full width), then form below */}
        <div className="md:hidden px-2">
          {/* Typewriter image - full width on mobile */}
          <div className="relative w-full" style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))' }}>
            <img
              src="/img/maquina-nova.png"
              alt="Typewriter"
              className="w-full h-auto object-contain"
              style={{ filter: 'brightness(1.02) contrast(0.98)' }}
            />
          </div>

          {/* Mobile form - below the image, within viewport */}
          <form
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            className="flex flex-col gap-4 px-4 py-6 bg-background"
            data-testid="contact-form"
          >
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-transparent border-0 border-b border-foreground/20 focus:border-foreground/40 focus:outline-none font-mono text-foreground placeholder:text-foreground/40 text-sm py-3"
              placeholder={t('Nome', 'Name')}
              data-testid="contact-name"
            />

            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full bg-transparent border-0 border-b border-foreground/20 focus:border-foreground/40 focus:outline-none font-mono text-foreground placeholder:text-foreground/40 text-sm py-3"
              placeholder="Email"
              data-testid="contact-email"
            />

            <textarea
              required
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              className="w-full bg-transparent border border-foreground/20 focus:border-foreground/40 focus:outline-none font-mono text-foreground placeholder:text-foreground/40 resize-none text-sm p-3"
              placeholder={t('Mensagem', 'Message')}
              data-testid="contact-message"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full font-mono text-sm py-3 px-6 bg-foreground text-background hover:bg-accent transition-colors disabled:opacity-30 uppercase tracking-wider font-bold"
              data-testid="contact-submit"
            >
              {loading ? '...' : t('Enviar', 'Send')}
            </button>
          </form>
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

        <p className="text-center font-serif text-sm md:text-base italic text-muted-foreground mt-6 md:mt-8 px-4 pb-8">
          {t(
            'Escreva-nos. As suas palavras são importantes.',
            'Write to us. Your words matter.'
          )}
        </p>
      </motion.div>

      {/* NO BANNER on contact page for cleaner mobile experience */}
    </div>
  );
};

export default Contact;
