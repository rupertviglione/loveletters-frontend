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
  const carriageX = Math.min(columnIndex / charPerLine, 1) * 28;
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
        {/* Typewriter container - show more of the machine on desktop */}
        <div className="relative w-full overflow-hidden">
          <div className="relative mx-auto w-full max-w-6xl px-4 md:px-8">
            <div
              className="relative"
              style={{
                marginTop: 'clamp(-12%, -6vw, -6%)',
                marginBottom: 'clamp(-20%, -10vw, -12%)',
                marginLeft: 'clamp(-6%, -3vw, -3%)',
                marginRight: 'clamp(-6%, -3vw, -3%)'
              }}
            >
              <img
                src="/img/contacto.png"
                alt="Typewriter"
                className="w-full h-auto block"
              />

              {/* Form positioned exactly on the paper */}
              <form
                onSubmit={handleSubmit}
                className="absolute flex flex-col"
                style={{
                  top: '23%',
                  bottom: '50%',
                  left: '30%',
                  right: '30%',
                  padding: '1.5%'
                }}
                data-testid="contact-form"
              >
  <input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="w-full bg-transparent border-0 border-b border-black/30 focus:border-black/60 focus:outline-none font-mono placeholder:text-black/50 text-black"
    style={{ fontSize: 'clamp(11px, 2.5vw, 16px)', padding: 'clamp(3px, 0.8vw, 8px) 0' }}
    placeholder={t('Nome', 'Name')}
    data-testid="contact-name"
  />
  
  <input
    type="email"
    required
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    className="w-full bg-transparent border-0 border-b border-black/30 focus:border-black/60 focus:outline-none font-mono placeholder:text-black/50 text-black"
    style={{ fontSize: 'clamp(11px, 2.5vw, 16px)', padding: 'clamp(3px, 0.8vw, 8px) 0' }}
    placeholder="Email"
    data-testid="contact-email"
  />
  
  <textarea
    required
    value={formData.message}
    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
    className="w-full bg-transparent border-0 focus:outline-none font-mono placeholder:text-black/50 text-black resize-none overflow-hidden"
    style={{ fontSize: 'clamp(11px, 2.5vw, 16px)', padding: 'clamp(3px, 0.8vw, 8px) 0', lineHeight: '1.4', height: 'clamp(40px, 8vw, 80px)' }}
    placeholder={t('Mensagem', 'Message')}
    data-testid="contact-message"
  />

  <button
    type="submit"
    disabled={loading}
    className="font-mono text-black/70 hover:text-black transition-colors disabled:opacity-30 text-center mt-1"
    style={{ fontSize: 'clamp(11px, 2.5vw, 16px)' }}
    data-testid="contact-submit"
  >
    {loading ? '...' : `[${t('enviar', 'send')}]`}
  </button>
</form>
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
