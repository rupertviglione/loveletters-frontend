import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, ShoppingBag, Mail, Plus, Edit, Trash2 } from 'lucide-react';

const COLLECTION_SUBCATEGORIES = [
  { id: 'o-poema-e-tu', label: 'O poema e tu' },
  { id: 'era-uma-vez', label: 'Era uma vez' },
  { id: 'write-that-love-letter', label: 'Write that love letter' },
  { id: 'dare-to', label: 'Dare to' }
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [unseenOrders, setUnseenOrders] = useState(0);
  const [unseenContacts, setUnseenContacts] = useState(0);
  const [lastNotifiedUnseen, setLastNotifiedUnseen] = useState(0);
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('admin_token');

  const verifyAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } catch (err) {
      navigate('/admin/login');
    }
  }, [API_URL, token, navigate]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const normalizedOrders = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : [];
      setOrders(normalizedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const normalizedContacts = Array.isArray(data)
        ? data
        : Array.isArray(data?.contacts)
          ? data.contacts
          : [];
      setContacts(normalizedContacts);
      setUnseenContacts(normalizedContacts.filter((contact) => contact.seen_by_admin === false).length);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  const fetchOrdersSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return;

      const data = await response.json();
      const unseen = Number(data?.unseen_orders || 0);
      setUnseenOrders(unseen);
      if (unseen > 0 && unseen > lastNotifiedUnseen) {
        setLastNotifiedUnseen(unseen);
      }
    } catch (err) {
      console.error('Error fetching orders summary:', err);
    }
  }, [API_URL, token, lastNotifiedUnseen]);

  const fetchContactsSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/contacts/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return;

      const data = await response.json();
      setUnseenContacts(Number(data?.unseen_contacts || data?.unseen_messages || 0));
    } catch (err) {
      console.error('Error fetching contacts summary:', err);
    }
  }, [API_URL, token]);

  const markContactAsSeen = useCallback(async (contactId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/contacts/${contactId}/seen`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return;

      setContacts((prev) => prev.map((contact) => (
        (contact.id === contactId || contact._id === contactId) ? { ...contact, seen_by_admin: true } : contact
      )));
      setUnseenContacts((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking contact as seen:', err);
    }
  }, [API_URL, token]);

  const markOrderAsSeen = useCallback(async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/seen`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return;

      setOrders((prev) => prev.map((order) => (
        (order.id === orderId || order._id === orderId) ? { ...order, seen_by_admin: true } : order
      )));
      setUnseenOrders((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking order as seen:', err);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    verifyAuth();
  }, [token, navigate, verifyAuth]);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'contacts') fetchContacts();
  }, [activeTab, fetchProducts, fetchOrders, fetchContacts]);

  useEffect(() => {
    if (!token) return;

    fetchOrdersSummary();
    fetchContactsSummary();
    const interval = setInterval(() => {
      fetchOrdersSummary();
      fetchContactsSummary();
    }, 30000);
    const onFocus = () => {
      fetchOrdersSummary();
      fetchContactsSummary();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [token, fetchOrdersSummary, fetchContactsSummary]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Tem a certeza que quer eliminar este produto?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Produto eliminado com sucesso!');
        fetchProducts();
      }
    } catch (err) {
      alert('Erro ao eliminar produto');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Tem a certeza que quer eliminar esta mensagem?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Mensagem eliminada com sucesso!');
        fetchContacts();
      }
    } catch (err) {
      alert('Erro ao eliminar mensagem');
    }
  };

  const handleOrderStatusChange = async (orderId, nextStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        alert('Não foi possível atualizar o estado da encomenda.');
        return;
      }

      setOrders((prev) => prev.map((order) => (
        (order.id === orderId || order._id === orderId) ? { ...order, status: nextStatus } : order
      )));
    } catch (err) {
      alert('Erro ao atualizar encomenda');
    }
  };

  const handleOrderTrackingChange = async (orderId, trackingNumber) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tracking_number: trackingNumber })
      });

      if (!response.ok) {
        alert('Não foi possível atualizar o tracking da encomenda.');
        return;
      }

      setOrders((prev) => prev.map((order) => (
        (order.id === orderId || order._id === orderId) ? { ...order, tracking_number: trackingNumber } : order
      )));
    } catch (err) {
      alert('Erro ao atualizar tracking');
    }
  };

  const handleArchiveOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/archive`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        alert('Não foi possível arquivar a encomenda.');
        return;
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId && order._id !== orderId));
    } catch (err) {
      alert('Erro ao arquivar encomenda');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Tem a certeza que quer apagar esta encomenda?')) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        alert('Não foi possível apagar a encomenda.');
        return;
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId && order._id !== orderId));
    } catch (err) {
      alert('Erro ao apagar encomenda');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-syne font-bold">BACKOFFICE</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-accent transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package size={20} />
              <span>PRODUTOS</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag size={20} />
              <span>ENCOMENDAS</span>
              {unseenOrders > 0 && (
                <span className="ml-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center font-bold">
                  {unseenOrders}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail size={20} />
              <span>MENSAGENS</span>
              {unseenContacts > 0 && (
                <span className="ml-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center font-bold">
                  {unseenContacts}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {(unseenOrders > 0 || unseenContacts > 0) && (
              <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {unseenOrders > 0 && <span>{unseenOrders} nova(s) encomenda(s) por ver.</span>}
                {unseenOrders > 0 && unseenContacts > 0 && <span> · </span>}
                {unseenContacts > 0 && <span>{unseenContacts} nova(s) mensagem(ns) por ver.</span>}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                <p className="mt-4 text-gray-600">A carregar...</p>
              </div>
            ) : (
              <>
                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-syne font-bold">Produtos ({products.length})</h2>
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setShowProductForm(true);
                        }}
                        className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        <Plus size={20} />
                        <span>ADICIONAR PRODUTO</span>
                      </button>
                    </div>

                    {showProductForm ? (
                      <ProductForm
                        product={editingProduct}
                        onSave={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                          fetchProducts();
                        }}
                        onCancel={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                        }}
                        token={token}
                        apiUrl={API_URL}
                      />
                    ) : (
                      <div className="grid gap-4">
                        {products.map(product => (
                          <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            {product.images && product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.title_pt}
                                className="w-20 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold">{product.title_pt}</h3>
                              <p className="text-sm text-gray-600">
                                {product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}
                              </p>
                              <p className="text-accent font-bold mt-1">€{product.price.toFixed(2)}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductForm(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar"
                              >
                                <Edit size={20} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-xl font-syne font-bold mb-6">Encomendas ({orders.length})</h2>
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div
                          key={order.id || order._id || order.order_number}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${order.seen_by_admin === false ? 'border-red-300 bg-red-50/40' : 'border-gray-200'}`}
                          onClick={() => {
                            if (order.seen_by_admin === false && order.id) {
                              markOrderAsSeen(order.id);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold flex items-center gap-2">
                                {order.order_number}
                                {order.seen_by_admin === false && (
                                  <span className="text-[10px] uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">novo</span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">{order.customer_name} ({order.customer_email})</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-accent">€{Number(order.total || 0).toFixed(2)}</p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.payment_status === 'paid' ? 'PAGO' : 'PENDENTE'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Estado:</label>
                                <select
                                  value={order.status || 'pending'}
                                  onChange={(e) => handleOrderStatusChange(order.id || order._id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="pending">Pendente</option>
                                  <option value="processing">Em processamento</option>
                                  <option value="shipping">Em envio</option>
                                  <option value="completed">Terminado</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveOrder(order.id || order._id);
                                  }}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  Arquivar
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrder(order.id || order._id);
                                  }}
                                  className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50"
                                >
                                  Apagar
                                </button>
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">Tracking number:</label>
                              <input
                                type="text"
                                defaultValue={order.tracking_number || ''}
                                placeholder="Adicionar tracking number"
                                onClick={(e) => e.stopPropagation()}
                                onBlur={(e) => {
                                  const nextTracking = e.target.value.trim();
                                  if (nextTracking !== (order.tracking_number || '')) {
                                    handleOrderTrackingChange(order.id || order._id, nextTracking);
                                  }
                                }}
                                className="w-full md:max-w-md px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                            </div>

                            <p className="text-sm font-medium mb-2">Produtos:</p>
                            {(order.items || []).length > 0 ? (
                              (order.items || []).map((item, idx) => (
                                <p key={idx} className="text-sm text-gray-600">
                                  {item.quantity || 1}x {item.title || item.product_title || item.name || 'Produto'} - €{Number(item.price || item.unit_price || 0).toFixed(2)}
                                </p>
                              ))
                            ) : (
                              <p className="text-sm text-gray-400 italic">Sem produtos associados a esta encomenda.</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <p className="text-gray-500 italic">Sem encomendas para mostrar.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                  <div>
                    <h2 className="text-xl font-syne font-bold mb-6">Mensagens ({contacts.length})</h2>
                    <div className="space-y-4">
                      {contacts.map(contact => (
                        <div
                          key={contact.id || contact._id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${contact.seen_by_admin === false ? 'border-red-300 bg-red-50/40' : 'border-gray-200'}`}
                          onClick={() => {
                            if (contact.seen_by_admin === false && (contact.id || contact._id)) {
                              markContactAsSeen(contact.id || contact._id);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-bold flex items-center gap-2">
                                {contact.name}
                                {contact.seen_by_admin === false && (
                                  <span className="text-[10px] uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">novo</span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">{contact.email}</p>
                              <p className="mt-3 text-gray-700">{contact.message}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {contact.created_at ? new Date(contact.created_at).toLocaleString('pt-PT') : 'Sem data'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteContact(contact.id || contact._id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ml-4"
                              title="Eliminar"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {contacts.length === 0 && (
                        <p className="text-gray-500 italic">Sem mensagens para mostrar.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Form Component
const ProductForm = ({ product, onSave, onCancel, token, apiUrl }) => {
  const [formData, setFormData] = useState(product || {
    title_pt: '',
    title_en: '',
    description_pt: '',
    description_en: '',
    category: 'tshirts',
    price: 0,
    original_price: null,
    images: [],
    variants: null,
    is_bundle: false,
    bundle_items: null,
    subcategory: ''
  });
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = product
        ? `${apiUrl}/api/admin/products/${product.id}`
        : `${apiUrl}/api/products`;
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(product ? 'Produto atualizado!' : 'Produto criado!');
        onSave();
      } else {
        alert('Erro ao guardar produto');
      }
    } catch (err) {
      alert('Erro ao guardar produto');
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageUrl.trim()]
      });
      setImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-bold mb-4">{product ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título (PT)</label>
          <input
            type="text"
            value={formData.title_pt}
            onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Título (EN)</label>
          <input
            type="text"
            value={formData.title_en}
            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Descrição (PT)</label>
          <textarea
            value={formData.description_pt}
            onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
            required
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Descrição (EN)</label>
          <textarea
            value={formData.description_en}
            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            required
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Categoria</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({
              ...formData,
              category: e.target.value,
              subcategory: ['tshirts', 'totebags'].includes(e.target.value) ? formData.subcategory || '' : ''
            })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="tshirts">T-shirts</option>
            <option value="totebags">Tote Bags</option>
            <option value="posters">Posters</option>
            <option value="complementos">Complementos</option>
            <option value="bundles">Conjuntos</option>
            <option value="rascunhos">Rascunhos</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Subcategoria (T-shirts / Tote Bags)</label>
          <select
            value={formData.subcategory || ''}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            disabled={!['tshirts', 'totebags'].includes(formData.category)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Sem subcategoria</option>
            {COLLECTION_SUBCATEGORIES.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Preço (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Preço Original (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.original_price || ''}
            onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Imagens</label>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL da imagem"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Adicionar
          </button>
        </div>
        {formData.images && formData.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt="" className="w-20 h-20 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-accent text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'A GUARDAR...' : 'GUARDAR'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          CANCELAR
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;
