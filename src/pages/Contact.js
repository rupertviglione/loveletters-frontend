import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ScrollingBanner from '@/components/ScrollingBanner';

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
    <div className="min-h-screen pt-16 md:pt-20 bg-background pb-20" data-testid="contact-page">
      <div className="py-4 md:py-6 px-4 md:px-8 mb-4">
        <h1 className="font-courier font-bold text-2xl md:text-4xl uppercase tracking-tight leading-none">
          {t('Contacto', 'Contact')}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full"
      >
        {/* Typewriter Image with Form Overlay */}
        <div className="relative w-full max-w-6xl mx-auto px-4">
          <div className="relative">
            {/* Cropped typewriter image focusing on the paper area */}
            <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16/10' }}>
              <img
                src="/img/contacto.png"
                alt="Typewriter"
                className="w-full h-full object-cover"
                style={{ 
                  objectPosition: '50% 30%',
                  transform: 'scale(2.2)'
                }}
              />
              
              {/* Almost invisible form positioned exactly on paper */}
              <form
                onSubmit={handleSubmit}
                className="absolute flex flex-col"
                style={{
                  top: '18%',
                  left: '32%',
                  right: '32%',
                  gap: 'clamp(4px, 0.8vw, 8px)'
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
                    fontSize: 'clamp(8px, 1vw, 12px)', 
                    padding: 'clamp(1px, 0.3vw, 4px) 0',
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
                    fontSize: 'clamp(8px, 1vw, 12px)', 
                    padding: 'clamp(1px, 0.3vw, 4px) 0',
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
                    fontSize: 'clamp(8px, 1vw, 12px)', 
                    padding: 'clamp(1px, 0.3vw, 4px) 0',
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
                    fontSize: 'clamp(8px, 0.9vw, 11px)',
                    marginTop: 'clamp(2px, 0.5vw, 6px)'
                  }}
                  data-testid="contact-submit"
                >
                  {loading ? '...' : `[${t('enviar', 'send')}]`}
                </button>
              </form>
            </div>
          </div>
        </div>

        <p className="text-center font-serif text-xs md:text-sm italic text-muted-foreground mt-8 px-4">
          {t(
            'Escreva-nos. As suas palavras são importantes.',
            'Write to us. Your words matter.'
          )}
        </p>
      </motion.div>

      {/* Scrolling Banner at Bottom */}
      <ScrollingBanner />
    </div>
  );
};

export default Contact;