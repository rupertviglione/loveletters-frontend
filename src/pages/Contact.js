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
