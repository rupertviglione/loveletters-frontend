import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const API = process.env.REACT_APP_BACKEND_URL 
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : '/api';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen pt-16 md:pt-24 bg-background" data-testid="contact-page">
      <div className="py-3 md:py-6 px-4 md:px-8">
        <h1 className="font-courier font-bold text-2xl md:text-4xl lg:text-5xl uppercase tracking-tight leading-none">
          {t('Contacto', 'Contact')}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-2 md:px-4"
      >
        {/* Typewriter container - crops black space */}
        <div className="relative w-full max-w-4xl mx-auto overflow-hidden" style={{ maxHeight: '70vh' }}>
          {/* Image with negative margins to crop black space */}
          <div className="relative" style={{ marginTop: '-8%', marginBottom: '-20%' }}>
            <img
              src="/img/contacto.png"
              alt="Typewriter"
              className="w-full h-auto block"
            />
            
            {/* Form positioned exactly on the paper */}
            {/* Paper: top 25%, bottom 47%, left 30%, right 30% */}
            <form 
              onSubmit={handleSubmit} 
              className="absolute flex flex-col justify-between"
              style={{
                top: '27%',
                bottom: '55%',
                left: '32%',
                right: '32%',
                padding: '2%'
              }}
              data-testid="contact-form"
            >
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-0 border-b border-black/25 focus:border-black/50 focus:outline-none font-mono placeholder:text-black/40 text-black"
                style={{ fontSize: 'clamp(10px, 2vw, 14px)', padding: 'clamp(2px, 0.5vw, 6px) 0' }}
                placeholder={t('Nome', 'Name')}
                data-testid="contact-name"
              />
              
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-0 border-b border-black/25 focus:border-black/50 focus:outline-none font-mono placeholder:text-black/40 text-black"
                style={{ fontSize: 'clamp(10px, 2vw, 14px)', padding: 'clamp(2px, 0.5vw, 6px) 0' }}
                placeholder="Email"
                data-testid="contact-email"
              />
              
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full flex-1 bg-transparent border-0 focus:outline-none font-mono placeholder:text-black/40 text-black resize-none overflow-hidden"
                style={{ fontSize: 'clamp(10px, 2vw, 14px)', padding: 'clamp(2px, 0.5vw, 6px) 0', lineHeight: '1.3' }}
                placeholder={t('Mensagem', 'Message')}
                data-testid="contact-message"
              />

              <button
                type="submit"
                disabled={loading}
                className="font-mono text-black/60 hover:text-black transition-colors disabled:opacity-30 text-center mt-1"
                style={{ fontSize: 'clamp(10px, 2vw, 14px)' }}
                data-testid="contact-submit"
              >
                {loading ? '...' : `[${t('enviar', 'send')}]`}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center font-serif text-xs md:text-sm italic text-muted-foreground mt-4 px-4 pb-6">
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
