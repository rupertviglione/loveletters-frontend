import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Products
export const getProducts = (category) =>
  api.get('/products', { params: category && category !== 'all' ? { category } : {} })
    .then(r => r.data);

export const getProduct = (id) =>
  api.get(`/products/${id}`).then(r => r.data);

// Orders  
export const createOrder = (data) =>
  api.post('/orders', data).then(r => r.data);

// Checkout
export const createCheckoutSession = (data) =>
  api.post('/checkout/session', data).then(r => r.data);

export const getCheckoutStatus = (sessionId) =>
  api.get(`/checkout/status/${sessionId}`).then(r => r.data);

// Contact
export const submitContact = (data) =>
  api.post('/contact', data).then(r => r.data);

// Health
export const getHealth = () =>
  api.get('/health').then(r => r.data);

export default api;
