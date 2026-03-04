import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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
  const [imageLoaded, setImageLoaded] = useState(false);

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
    <div className="min-h-screen bg-background" data-testid="contact-page" style={{ paddingTop: '80px', overflowX: 'hidden' }}>
      {/* Title */}
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
      >
        {/* Typewriter with form overlay */}
        <div className="relative w-full md:max-w-4xl md:mx-auto md:px-4 overflow-hidden">
          <div 
            className="relative flex justify-center" 
            style={{ 
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))'
            }}
          >
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              </div>
            )}
            
            {/* Typewriter image */}
            <img
              src="/img/maquina-nova.png"
              alt="Typewriter"
              className={`h-auto object-contain ${imageLoaded ? 'block' : 'hidden'}`}
              style={{ 
                filter: 'brightness(1.02) contrast(0.98)',
                width: '120%',
                maxWidth: '120%'
              }}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Form positioned on the paper */}
            {imageLoaded && (
              <form
                onSubmit={handleSubmit}
                className="absolute flex flex-col"
                style={{
                  top: '12%',
                  left: '27%',
                  right: '27%',
                  gap: 'clamp(4px, 1vw, 12px)'
                }}
                data-testid="contact-form"
              >
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-black/15 focus:border-black/30 focus:outline-none font-mono text-black placeholder:text-black/30"
                  style={{ 
                    fontSize: 'clamp(8px, 2.5vw, 15px)', 
                    padding: 'clamp(2px, 0.5vw, 6px) 0',
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
                  className="w-full bg-transparent border-0 border-b border-black/15 focus:border-black/30 focus:outline-none font-mono text-black placeholder:text-black/30"
                  style={{ 
                    fontSize: 'clamp(8px, 2.5vw, 15px)', 
                    padding: 'clamp(2px, 0.5vw, 6px) 0',
                    lineHeight: '1.3'
                  }}
                  placeholder="Email"
                  data-testid="contact-email"
                />

                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className="w-full bg-transparent border-0 focus:outline-none font-mono text-black placeholder:text-black/30 resize-none"
                  style={{ 
                    fontSize: 'clamp(8px, 2.5vw, 15px)', 
                    padding: 'clamp(2px, 0.5vw, 6px) 0',
                    lineHeight: '1.4'
                  }}
                  placeholder={t('Mensagem', 'Message')}
                  data-testid="contact-message"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-mono text-black/60 hover:text-accent transition-colors disabled:opacity-30 text-left"
                  style={{ 
                    fontSize: 'clamp(7px, 2vw, 13px)',
                    marginTop: 'clamp(2px, 0.5vw, 10px)'
                  }}
                  data-testid="contact-submit"
                >
                  {loading ? '...' : `[${t('enviar', 'send')}]`}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center font-serif text-sm md:text-base italic text-muted-foreground mt-6 md:mt-8 px-4">
          {t(
            'Escreva-nos. As suas palavras são importantes.',
            'Write to us. Your words matter.'
          )}
        </p>
      </motion.div>

      {/* Red scrolling banner */}
      <div className="mt-10 md:mt-16 mb-8">
        <Link to="/shop" className="block">
          <div className="bg-accent overflow-hidden py-3 md:py-4">
            <div className="banner-scroll flex items-center">
              <span className="inline-block whitespace-nowrap font-courier font-black text-base md:text-2xl tracking-widest text-white uppercase">
                WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span className="inline-block whitespace-nowrap font-courier font-black text-base md:text-2xl tracking-widest text-white uppercase">
                WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WE LOVE LOVE LETTERS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VER COLECÇÃO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>
        </Link>
      </div>

      <style jsx>{`
        @keyframes banner-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .banner-scroll {
          animation: banner-scroll 30s linear infinite;
        }
        @media (max-width: 768px) {
          .banner-scroll {
            animation: banner-scroll 8s linear infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;
