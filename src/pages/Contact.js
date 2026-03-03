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
  const [typingKey, setTypingKey] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleKeyDown = (e) => {
    setTypingKey(e.key.toUpperCase());
    setTimeout(() => setTypingKey(null), 150);
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
      <div className="py-4 md:py-6 px-4 md:px-8">
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
        {/* Typewriter Image Container - Better proportions */}
        <div className="relative w-full max-w-5xl mx-auto px-2 md:px-8">
          <div className="relative" style={{ marginTop: 'clamp(-8%, -4vw, -4%)', marginBottom: 'clamp(-15%, -8vw, -10%)' }}>
            <img
              src="/img/photo-3.jpg"
              alt="Typewriter"
              className="w-full h-auto block rounded-lg shadow-2xl"
              style={{ maxHeight: '70vh', objectFit: 'cover' }}
            />

            {/* Form Overlay on Paper */}
            <div className="absolute inset-0 flex items-center justify-center">
              <form
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md mx-4"
                data-testid="contact-form"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block font-courier text-sm font-bold mb-2 text-gray-700">
                      {t('Nome', 'Name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded focus:border-accent focus:outline-none font-mono text-gray-900 transition-all"
                      placeholder={t('O teu nome', 'Your name')}
                      data-testid="contact-name"
                    />
                  </div>

                  <div>
                    <label className="block font-courier text-sm font-bold mb-2 text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded focus:border-accent focus:outline-none font-mono text-gray-900 transition-all"
                      placeholder={t('teu@email.com', 'your@email.com')}
                      data-testid="contact-email"
                    />
                  </div>

                  <div>
                    <label className="block font-courier text-sm font-bold mb-2 text-gray-700">
                      {t('Mensagem', 'Message')}
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={5}
                      className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded focus:border-accent focus:outline-none font-mono text-gray-900 resize-none transition-all"
                      placeholder={t('Escreve aqui a tua mensagem...', 'Write your message here...')}
                      data-testid="contact-message"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-accent text-white font-courier font-bold uppercase tracking-wider rounded hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="contact-submit"
                  >
                    {loading ? t('A enviar...', 'Sending...') : t('Enviar', 'Send')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Typing Animation Indicator */}
        {typingKey && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-8 right-8 bg-accent text-white px-6 py-3 rounded-full font-courier font-bold text-lg shadow-2xl z-50"
          >
            {typingKey === ' ' ? '␣' : typingKey}
          </motion.div>
        )}

        <p className="text-center font-serif text-xs md:text-sm italic text-muted-foreground mt-8 px-4 pb-8">
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
