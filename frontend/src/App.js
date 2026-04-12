import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import '@/App.css';

// Lazy load non-critical routes
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Success = lazy(() => import('@/pages/Success'));
const Contact = lazy(() => import('@/pages/Contact'));
const ShippingReturns = lazy(() => import('@/pages/ShippingReturns'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <Routes>
                {/* Admin Routes (no header/footer) */}
                <Route path="/admin/login" element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminLogin />
                  </Suspense>
                } />
                <Route path="/admin/dashboard" element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                } />
                
                {/* Public Routes (with header/footer) */}
                <Route path="/*" element={
                  <div className="App min-h-screen bg-background text-foreground">
                    <Header />
                    <main>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/shop" element={<Shop />} />
                          <Route path="/shop/:id" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/success" element={<Success />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/shipping-returns" element={<ShippingReturns />} />
                        </Routes>
                      </Suspense>
                    </main>
                    <Footer />
                    <Toaster
                      position="bottom-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: 'hsl(var(--card))',
                          color: 'hsl(var(--card-foreground))',
                          border: '1px solid hsl(var(--border))',
                          fontFamily: 'Courier Prime, monospace'
                        }
                      }}
                    />
                  </div>
                } />
              </Routes>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
