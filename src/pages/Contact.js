import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ScrollingBanner from '@/components/ScrollingBanner';

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
    <div className="min-h-screen pt-16 md:pt-20 bg-background pb-24" data-testid="contact-page">
      <div className="py-4 md:py-6 px-4 md:px-8 mb-6">
        <h1 className="font-syne font-bold text-3xl md:text-5xl uppercase tracking-tight leading-none">
          {t('Contacto', 'Contact')}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full"
      >
        <div className="relative w-full max-w-5xl mx-auto px-4">
          <div className="relative">
            <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16/10' }}>
              <img
                src="/img/contacto.png"
                alt="Typewriter"
                className="w-full h-full object-cover"
                style={{ 
                  objectPosition: '50% 32%',
                  transform: 'scale(1.4)'
                }}
              />
              
              <form
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                className="absolute flex flex-col"
                style={{
                  top: '20%',
                  left: '33%',
                  right: '33%',
                  gap: 'clamp(5px, 1vw, 10px)'
                }}
                data-testid="contact-form"
              >
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-black/10 focus:border-black/20 focus:outline-none font-mono text-black/90 placeholder:text-black/25"
                  style={{ 
                    fontSize: 'clamp(9px, 1.1vw, 13px)', 
                    padding: 'clamp(2px, 0.4vw, 5px) 0',
                    lineHeight: '1.3'
                  }}
                  placeholder={t('Nome', 'Name')}
                  data-testid="contact-name"
                />

                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-black/10 focus:border-black/20 focus:outline-none font-mono text-black/90 placeholder:text-black/25"
                  style={{ 
                    fontSize: 'clamp(9px, 1.1vw, 13px)', 
                    padding: 'clamp(2px, 0.4vw, 5px) 0',
                    lineHeight: '1.3'
                  }}
                  placeholder="Email"
                  data-testid="contact-email"
                />

                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={5}
                  className="w-full bg-transparent border-0 focus:outline-none font-mono text-black/90 placeholder:text-black/25 resize-none"
                  style={{ 
                    fontSize: 'clamp(9px, 1.1vw, 13px)', 
                    padding: 'clamp(2px, 0.4vw, 5px) 0',
                    lineHeight: '1.5'
                  }}
                  placeholder={t('Mensagem', 'Message')}
                  data-testid="contact-message"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-mono text-black/50 hover:text-accent transition-colors disabled:opacity-30 text-left"
                  style={{ 
                    fontSize: 'clamp(8px, 1vw, 12px)',
                    marginTop: 'clamp(3px, 0.6vw, 8px)'
                  }}
                  data-testid="contact-submit"
                >
                  {loading ? '...' : `[${t('enviar', 'send')}]`}
                </button>
              </form>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {pressedKey && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed bottom-24 right-8 bg-accent text-white px-6 py-3 rounded-full font-courier font-bold text-lg shadow-2xl z-50"
            >
              {pressedKey === ' ' ? '␣' : pressedKey.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center font-serif text-xs md:text-sm italic text-muted-foreground mt-8 px-4">
          {t(
            'Escreva-nos. As suas palavras são importantes.',
            'Write to us. Your words matter.'
          )}
        </p>
      </motion.div>

      <ScrollingBanner />
    </div>
  );
};

export default Contact;
