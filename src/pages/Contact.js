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
    <div className="min-h-screen pt-20 md:pt-28 bg-background" data-testid="contact-page">
      <div className="py-4 md:py-8 px-4 md:px-8 lg:px-12">
        <h1 className="font-courier font-bold text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight leading-none">
          {t('Contacto', 'Contact')}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full"
      >
        {/* Typewriter with form overlay */}
        <div className="relative w-full max-w-3xl mx-auto">
          <img
            src="/img/contacto.png"
            alt="Typewriter"
            className="w-full h-auto block"
          />
          
          {/* Form positioned over the paper - uses percentage of image */}
          <form 
            onSubmit={handleSubmit} 
            className="absolute flex flex-col"
            style={{
              top: '11%',
              left: '27%',
              right: '27%',
              height: '26%'
            }}
            data-testid="contact-form"
          >
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-black/20 focus:border-black/40 focus:outline-none font-mono placeholder:text-black/40 text-black"
              style={{ fontSize: 'min(3vw, 14px)', padding: 'min(1vw, 6px) 0' }}
              placeholder={t('Nome', 'Name')}
              data-testid="contact-name"
            />
            
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-black/20 focus:border-black/40 focus:outline-none font-mono placeholder:text-black/40 text-black"
              style={{ fontSize: 'min(3vw, 14px)', padding: 'min(1vw, 6px) 0' }}
              placeholder="Email"
              data-testid="contact-email"
            />
            
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full flex-1 bg-transparent border-0 focus:outline-none font-mono placeholder:text-black/40 text-black resize-none overflow-hidden"
              style={{ fontSize: 'min(3vw, 14px)', padding: 'min(1vw, 6px) 0', lineHeight: '1.4' }}
              placeholder={t('Mensagem', 'Message')}
              data-testid="contact-message"
            />

            <button
              type="submit"
              disabled={loading}
              className="font-mono text-black/60 hover:text-black transition-colors disabled:opacity-30 text-center"
              style={{ fontSize: 'min(3vw, 14px)', padding: 'min(0.5vw, 4px) 0' }}
              data-testid="contact-submit"
            >
              {loading ? '...' : `[${t('enviar', 'send')}]`}
            </button>
          </form>
        </div>

        <p className="text-center font-serif text-sm md:text-base italic text-muted-foreground mt-6 md:mt-8 px-4 pb-8">
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
