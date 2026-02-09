import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const API = process.env.REACT_APP_BACKEND_URL 
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : '/api';

const Contact = () => {
  const { t } = useLanguage();
  const audioContextRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lineJumpTimeoutRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState('name');
  const [pressedKey, setPressedKey] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lineJump, setLineJump] = useState(false);

  const keyRows = useMemo(
    () => [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
      ['Space', 'Enter']
    ],
    []
  );

  const normalizeKey = (key) => {
    if (key === ' ') return 'Space';
    if (key === 'Backspace') return 'Backspace';
    if (key === 'Enter') return 'Enter';
    if (key.length === 1) return key.toUpperCase();
    return key;
  };

  const playTypewriterSound = (tone = 'key') => {
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
    const frequencyMap = {
      key: 280,
      backspace: 190,
      bell: 920
    };

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequencyMap[tone] || frequencyMap.key, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.09);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (lineJumpTimeoutRef.current) {
        clearTimeout(lineJumpTimeoutRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleKeyDown = (event) => {
    const normalized = normalizeKey(event.key);
    setPressedKey(normalized);
    setIsTyping(true);
    if (event.key === 'Enter') {
      setLineJump(true);
      if (lineJumpTimeoutRef.current) {
        clearTimeout(lineJumpTimeoutRef.current);
      }
      lineJumpTimeoutRef.current = setTimeout(() => setLineJump(false), 180);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setPressedKey(null);
    }, 150);

    if (event.key === 'Enter') {
      playTypewriterSound('bell');
    } else if (event.key === 'Backspace') {
      playTypewriterSound('backspace');
    } else {
      playTypewriterSound('key');
    }
  };

  const scrollFieldIntoView = (field) => {
    const fieldMap = {
      name: nameRef,
      email: emailRef,
      message: messageRef
    };
    fieldMap[field]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const activeValue = formData[activeField] || '';
  const charPerLine = activeField === 'message' ? 26 : 22;
  const activeLines =
    activeField === 'message' ? activeValue.split('\n') : [activeValue];
  const lineIndex = Math.max(activeLines.length - 1, 0);
  const columnIndex =
    activeField === 'message'
      ? activeLines[activeLines.length - 1]?.length || 0
      : activeValue.length;
  const carriageX = Math.min(columnIndex / charPerLine, 1) * 140;
  const paperShift = activeField === 'message' ? Math.min(lineIndex, 3) * -6 : 0;
  const caretTopMap = {
    name: '6%',
    email: '38%',
    message: '70%'
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
    <div className="min-h-screen pt-16 md:pt-20 bg-background" data-testid="contact-page">
      <div className="py-2 md:py-4 px-4 md:px-8">
        <h1 className="font-courier font-bold text-2xl md:text-4xl uppercase tracking-tight leading-none">
          {t('Contacto', 'Contact')}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Typewriter container - aggressive crop of black space */}
        <div className="relative w-full overflow-hidden">
          {/* Negative margins to crop black space aggressively */}
          <div 
            className="relative"
            style={{ 
              marginTop: '-25%', 
              marginBottom: '-35%',
              marginLeft: '-15%',
              marginRight: '-15%'
            }}
          >
            <img
              src="/img/contacto.png"
              alt="Typewriter"
              className="w-full h-auto block"
            />
            
            {/* Form positioned exactly on the paper */}
            <motion.form 
              onSubmit={handleSubmit}
              className="absolute flex flex-col"
              style={{
                top: '23%',
                bottom: '50%',
                left: '30%',
                right: '30%',
                padding: '1.5%'
              }}
              animate={{
                x: carriageX,
                y: paperShift + (lineJump ? -2 : 0),
                rotate: isTyping ? -0.3 : 0
              }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
              data-testid="contact-form"
            >
              <div className="relative">
                <motion.div
                  className="absolute -top-6 left-0 right-0 h-1 rounded-full bg-black/20"
                  animate={{ x: carriageX }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                />
                <motion.div
                  className="absolute h-4 w-[2px] bg-black/70 animate-pulse"
                  style={{ top: caretTopMap[activeField], left: '0.25rem' }}
                  animate={{ x: carriageX }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                />
                <input
                  ref={nameRef}
                  type="text"
                  required
                  value={formData.name}
                  onFocus={() => {
                    setActiveField('name');
                    scrollFieldIntoView('name');
                  }}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-transparent border-0 border-b focus:outline-none font-mono placeholder:text-black/50 text-black ${
                    activeField === 'name'
                      ? 'border-black/70 bg-white/40'
                      : 'border-black/30'
                  }`}
                  style={{ fontSize: 'clamp(11px, 2.5vw, 16px)', padding: 'clamp(3px, 0.8vw, 8px) 0' }}
                  placeholder={t('Nome', 'Name')}
                  data-testid="contact-name"
                />
                
                <input
                  ref={emailRef}
                  type="email"
                  required
                  value={formData.email}
                  onFocus={() => {
                    setActiveField('email');
                    scrollFieldIntoView('email');
                  }}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-transparent border-0 border-b focus:outline-none font-mono placeholder:text-black/50 text-black ${
                    activeField === 'email'
                      ? 'border-black/70 bg-white/40'
                      : 'border-black/30'
                  }`}
                  style={{ fontSize: 'clamp(11px, 2.5vw, 16px)', padding: 'clamp(3px, 0.8vw, 8px) 0' }}
                  placeholder="Email"
                  data-testid="contact-email"
                />
                
                <textarea
                  ref={messageRef}
                  required
                  value={formData.message}
                  onFocus={() => {
                    setActiveField('message');
                    scrollFieldIntoView('message');
                  }}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full bg-transparent border-0 focus:outline-none font-mono placeholder:text-black/50 text-black resize-none overflow-hidden ${
                    activeField === 'message' ? 'bg-white/40' : ''
                  }`}
                  style={{ fontSize: 'clamp(11px, 2.5vw, 16px)', padding: 'clamp(3px, 0.8vw, 8px) 0', lineHeight: '1.4', height: 'clamp(40px, 8vw, 80px)' }}
                  placeholder={t('Mensagem', 'Message')}
                  data-testid="contact-message"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="font-mono text-black/70 hover:text-black transition-colors disabled:opacity-30 text-center mt-1"
                style={{ fontSize: 'clamp(11px, 2.5vw, 16px)' }}
                data-testid="contact-submit"
              >
                {loading ? '...' : `[${t('enviar', 'send')}]`}
              </button>
            </motion.form>

            <div className="absolute bottom-[6%] left-1/2 w-[70%] -translate-x-1/2">
              <div className="rounded-lg border border-black/10 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-black/60">
                  {t('Teclado da máquina', 'Typewriter keys')}
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  {keyRows.map((row) => (
                    <div key={row.join('-')} className="flex justify-center gap-1">
                      {row.map((key) => {
                        const isActive = pressedKey === key;
                        const widthClass =
                          key === 'Space'
                            ? 'w-32'
                            : key === 'Backspace'
                              ? 'w-16'
                              : key === 'Enter'
                                ? 'w-12'
                                : 'w-7';
                        return (
                          <motion.span
                            key={key}
                            className={`flex h-7 items-center justify-center rounded border text-[10px] font-mono uppercase transition-all ${widthClass} ${
                              isActive
                                ? 'border-black bg-black text-white shadow-inner'
                                : 'border-black/30 bg-white/70 text-black/70'
                            }`}
                            animate={{
                              y: isActive ? 2 : 0,
                              scale: isActive ? 0.96 : 1
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                          >
                            {key}
                          </motion.span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center font-serif text-xs md:text-sm italic text-muted-foreground mt-2 px-4 pb-4">
          {t(
            'Escreva-nos. As suas palavras são importantes.',
            'Write to us. Your words matter.'
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default Contact;
