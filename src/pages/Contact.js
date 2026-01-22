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
    <div className="min-h-screen pt-24 md:pt-32 bg-background" data-testid="contact-page">
      <div className="py-6 md:py-10 px-4 md:px-8 lg:px-12">
        <h1 className="font-courier font-bold text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight leading-none">
          {t('Contacto', 'Contact')}
        </h1>
      </div>

      <div className="py-2 md:py-4 px-0 md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:max-w-5xl md:mx-auto"
        >
          {/* Mobile Version - Full width, no margins */}
          <div className="md:hidden relative w-full" style={{ paddingTop: '80%' }}>
            <img
              src="/img/contacto.png"
              alt="Typewriter"
              className="absolute top-0 left-0 w-full h-full object-contain"
            />
            
            {/* Mobile Form */}
            <div className="absolute" style={{
              top: '16%',
              left: '26%',
              right: '26%',
              height: '32%'
            }}>
              <form onSubmit={handleSubmit} className="h-full flex flex-col" data-testid="contact-form-mobile">
                <div className="space-y-1.5 flex-1 flex flex-col">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-0 py-0.5 bg-transparent border-0 border-b border-foreground/15 focus:border-foreground/40 focus:outline-none font-mono text-[11px] placeholder:text-foreground/30"
                    placeholder={t('Nome', 'Name')}
                    data-testid="contact-name-mobile"
                  />
                  
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-0 py-0.5 bg-transparent border-0 border-b border-foreground/15 focus:border-foreground/40 focus:outline-none font-mono text-[11px] placeholder:text-foreground/30"
                    placeholder="Email"
                    data-testid="contact-email-mobile"
                  />
                  
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full flex-1 px-0 py-0.5 bg-transparent border-0 focus:outline-none font-mono text-[11px] resize-none placeholder:text-foreground/30 overflow-hidden"
                    placeholder={t('Mensagem', 'Message')}
                    data-testid="contact-message-mobile"
                    style={{ lineHeight: '1.4' }}
                  />
                </div>
              </form>
            </div>
            
            {/* Mobile Button */}
            <div className="absolute flex justify-center" style={{
              top: '51%',
              left: '26%',
              right: '26%'
            }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="font-mono text-[11px] text-foreground/70 hover:text-foreground transition-colors disabled:opacity-30"
                data-testid="contact-submit-mobile"
              >
                {loading ? '...' : `[${t('enviar', 'send')}]`}
              </button>
            </div>
          </div>

          {/* Desktop Version */}
          <div className="hidden md:block relative w-full" style={{ paddingTop: '68%' }}>
            <img
              src="/img/contacto.png"
              alt="Typewriter"
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{ objectPosition: 'center 35%' }}
            />
            
            <div className="absolute" style={{
              top: '23%',
              left: '30%',
              right: '30%',
              bottom: '52%'
            }}>
              <form onSubmit={handleSubmit} className="h-full flex flex-col justify-start pt-1 px-1" data-testid="contact-form">
                <div className="space-y-2.5 md:space-y-3 flex-1 flex flex-col">
                  <div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-0 py-1 bg-transparent border-0 border-b border-foreground/15 focus:border-foreground/40 focus:outline-none font-mono text-xs placeholder:text-foreground/30 transition-colors"
                      placeholder={t('Nome', 'Name')}
                      data-testid="contact-name"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-0 py-1 bg-transparent border-0 border-b border-foreground/15 focus:border-foreground/40 focus:outline-none font-mono text-xs placeholder:text-foreground/30 transition-colors"
                      placeholder="Email"
                      data-testid="contact-email"
                    />
                  </div>

                  <div className="flex-1">
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full h-full px-0 py-1 bg-transparent border-0 focus:outline-none font-mono text-xs resize-none placeholder:text-foreground/30 transition-colors overflow-hidden"
                      placeholder={t('Mensagem', 'Message')}
                      data-testid="contact-message"
                      style={{ lineHeight: '1.5' }}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="font-mono text-xs text-foreground/70 hover:text-foreground transition-colors tracking-wide disabled:opacity-30 disabled:cursor-not-allowed"
                      data-testid="contact-submit"
                    >
                      {loading ? '...' : `[${t('enviar', 'send')}]`}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <p className="text-center font-serif text-xs md:text-sm lg:text-base italic text-muted-foreground mt-6 md:mt-8 px-4">
            {t(
              'Escreva-nos. As suas palavras são importantes.',
              'Write to us. Your words matter.'
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
