import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/services/api";
import {
  LogOut,
  Package,
  ShoppingBag,
  Mail,
  Plus,
  Edit,
  Trash2,
  Save,
} from "lucide-react";

const COLLECTION_SUBCATEGORIES = [
  { id: "o-poema-e-tu", label: "O poema e tu" },
  { id: "era-uma-vez", label: "Era uma vez" },
  { id: "write-that-love-letter", label: "Write that love letter" },
  { id: "dare-to", label: "Dare to" },
];

const ORDER_STATUSES = [
  { value: "created", label: "Criada" },
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Paga" },
  { value: "processing", label: "Em processamento" },
  { value: "shipped", label: "Em envio" },
  { value: "delivered", label: "Terminada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "refunded", label: "Reembolsada" },
  { value: "awaiting_stripe_config", label: "A aguardar Stripe" },
  { value: "expired", label: "Expirada" },
  { value: "payment_failed", label: "Pagamento falhou" },
];

const getRecordId = (record) => record?.id || record?._id;
const isUnread = (record) =>
  record?.seen_by_admin === false ||
  record?.read === false ||
  record?.mark_read === false;
const getOrderTotal = (order) =>
  Number(order?.total ?? order?.amount_total ?? order?.total_amount ?? 0);
const formatAddress = (address = {}) =>
  [
    address.line1 || address.address_line1,
    address.line2 || address.address_line2,
    address.postal_code,
    address.city,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [unseenOrders, setUnseenOrders] = useState(0);
  const [unseenContacts, setUnseenContacts] = useState(0);
  const [lastNotifiedUnseen, setLastNotifiedUnseen] = useState(0);
  const [orderDrafts, setOrderDrafts] = useState({});
  const [savingOrderId, setSavingOrderId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("admin_token");

  const verifyAuth = useCallback(async () => {
    try {
      await apiFetch("/admin/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      localStorage.removeItem("admin_token");
      navigate("/admin/login");
    }
  }, [token, navigate]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/products");
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalizedOrders = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : [];
      setOrders(normalizedOrders);
      setOrderDrafts(
        normalizedOrders.reduce((drafts, order) => {
          const orderId = getRecordId(order);
          if (!orderId) return drafts;
          drafts[orderId] = {
            status: order.status || order.payment_status || "pending",
            tracking_number: order.tracking_number || "",
            tracking_url: order.tracking_url || "",
          };
          return drafts;
        }, {}),
      );
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalizedContacts = Array.isArray(data)
        ? data
        : Array.isArray(data?.contacts)
          ? data.contacts
          : [];
      setContacts(normalizedContacts);
      setUnseenContacts(normalizedContacts.filter(isUnread).length);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiFetch("/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ordersCount = Number(data?.orders || 0);
      const messagesCount = Number(data?.messages ?? data?.contacts ?? 0);
      setUnseenOrders(ordersCount);
      setUnseenContacts(messagesCount);
      if (
        ordersCount + messagesCount > 0 &&
        ordersCount + messagesCount > lastNotifiedUnseen
      ) {
        setLastNotifiedUnseen(ordersCount + messagesCount);
      }
    } catch (err) {
      console.error("Error fetching admin notifications:", err);
    }
  }, [token, lastNotifiedUnseen]);

  const markContactAsSeen = useCallback(
    async (contactId) => {
      try {
        await apiFetch(`/admin/contacts/${contactId}/mark-read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        setContacts((prev) =>
          prev.map((contact) =>
            getRecordId(contact) === contactId
              ? { ...contact, seen_by_admin: true, read: true }
              : contact,
          ),
        );
        setUnseenContacts((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking contact as seen:", err);
      }
    },
    [token],
  );

  const markOrderAsSeen = useCallback(
    async (orderId) => {
      try {
        await apiFetch(`/admin/orders/${orderId}/mark-read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders((prev) =>
          prev.map((order) =>
            getRecordId(order) === orderId
              ? { ...order, seen_by_admin: true, read: true }
              : order,
          ),
        );
        setUnseenOrders((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking order as seen:", err);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    verifyAuth();
  }, [token, navigate, verifyAuth]);

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "contacts") fetchContacts();
  }, [activeTab, fetchProducts, fetchOrders, fetchContacts]);

  useEffect(() => {
    if (!token) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    const onFocus = fetchNotifications;
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [token, fetchNotifications]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Tem a certeza que quer eliminar este produto?"))
      return;

    try {
      await apiFetch(`/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Produto eliminado com sucesso!");
      fetchProducts();
    } catch (err) {
      alert("Erro ao eliminar produto");
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Tem a certeza que quer eliminar esta mensagem?"))
      return;

    try {
      await apiFetch(`/admin/contacts/${contactId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Mensagem eliminada com sucesso!");
      fetchContacts();
    } catch (err) {
      alert("Erro ao eliminar mensagem");
    }
  };

  const updateOrderDraft = (orderId, field, value) => {
    setOrderDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveOrderChanges = async (orderId) => {
    const draft = orderDrafts[orderId];
    if (!draft) return;

    setSavingOrderId(orderId);
    try {
      const updatedOrder = await apiFetch(`/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: draft.status,
          tracking_number: draft.tracking_number || "",
          tracking_url: draft.tracking_url || "",
          notify_customer: true,
          mark_read: true,
        }),
      });
      setOrders((prev) =>
        prev.map((order) =>
          getRecordId(order) === orderId
            ? {
                ...order,
                ...(updatedOrder || {}),
                status: draft.status,
                tracking_number: draft.tracking_number || "",
                tracking_url: draft.tracking_url || "",
                seen_by_admin: true,
                read: true,
              }
            : order,
        ),
      );
      setUnseenOrders((prev) => Math.max(0, prev - 1));
      fetchNotifications();
      alert("Alterações guardadas.");
    } catch (err) {
      alert("Erro ao guardar alterações da encomenda");
    } finally {
      setSavingOrderId(null);
    }
  };

  const handleArchiveOrder = async (orderId) => {
    try {
      await apiFetch(`/admin/orders/${orderId}/archive`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) =>
        prev.filter((order) => getRecordId(order) !== orderId),
      );
    } catch (err) {
      alert("Erro ao arquivar encomenda");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Tem a certeza que quer apagar esta encomenda?"))
      return;

    try {
      await apiFetch(`/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) =>
        prev.filter((order) => getRecordId(order) !== orderId),
      );
    } catch (err) {
      alert("Erro ao apagar encomenda");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
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
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "products"
                  ? "text-accent border-b-2 border-accent"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Package size={20} />
              <span>PRODUTOS</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "orders"
                  ? "text-accent border-b-2 border-accent"
                  : "text-gray-600 hover:text-gray-900"
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
              onClick={() => setActiveTab("contacts")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "contacts"
                  ? "text-accent border-b-2 border-accent"
                  : "text-gray-600 hover:text-gray-900"
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
                {unseenOrders > 0 && (
                  <span>{unseenOrders} nova(s) encomenda(s) por ver.</span>
                )}
                {unseenOrders > 0 && unseenContacts > 0 && <span> · </span>}
                {unseenContacts > 0 && (
                  <span>{unseenContacts} nova(s) mensagem(ns) por ver.</span>
                )}
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
                {activeTab === "products" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-syne font-bold">
                        Produtos ({products.length})
                      </h2>
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
                      />
                    ) : (
                      <div className="grid gap-4">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
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
                                {product.category}
                                {product.subcategory
                                  ? ` · ${product.subcategory}`
                                  : ""}
                              </p>
                              <p className="text-accent font-bold mt-1">
                                €{product.price.toFixed(2)}
                              </p>
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
                {activeTab === "orders" && (
                  <div>
                    <h2 className="text-xl font-syne font-bold mb-6">
                      Encomendas ({orders.length})
                    </h2>
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const orderId = getRecordId(order);
                        const draft = orderDrafts[orderId] || {
                          status:
                            order.status || order.payment_status || "pending",
                          tracking_number: order.tracking_number || "",
                          tracking_url: order.tracking_url || "",
                        };
                        const shippingAddress =
                          order.shipping_address || order.shippingAddress || {};
                        const shippingMethod =
                          order.shipping_method || order.shippingMethod || {};

                        return (
                          <div
                            key={orderId || order.order_number}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${isUnread(order) ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
                            onClick={() => {
                              if (isUnread(order) && orderId) {
                                markOrderAsSeen(orderId);
                              }
                            }}
                          >
                            <div className="flex justify-between items-start mb-2 gap-4">
                              <div>
                                <h3 className="font-bold flex items-center gap-2">
                                  {order.order_number || orderId || "Encomenda"}
                                  {isUnread(order) && (
                                    <span className="text-[10px] uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                                      novo
                                    </span>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {order.customer_name || "Sem nome"} (
                                  {order.customer_email || "Sem email"})
                                </p>
                                {order.customer_phone && (
                                  <p className="text-xs text-gray-500">
                                    Tel.: {order.customer_phone}
                                  </p>
                                )}
                                {formatAddress(shippingAddress) && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Morada: {formatAddress(shippingAddress)}
                                  </p>
                                )}
                                {(shippingMethod.label ||
                                  order.shipping_country ||
                                  shippingAddress.country) && (
                                  <p className="text-xs text-gray-500">
                                    Envio:{" "}
                                    {shippingMethod.label ||
                                      `País ${order.shipping_country || shippingAddress.country}`}
                                    {shippingMethod.amount
                                      ? ` · €${Number(shippingMethod.amount).toFixed(2)}`
                                      : ""}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-accent">
                                  €{getOrderTotal(order).toFixed(2)}
                                </p>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    order.payment_status === "paid" ||
                                    order.status === "paid"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {order.payment_status === "paid" ||
                                  order.status === "paid"
                                    ? "PAGO"
                                    : "PENDENTE"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <div>
                                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                                    Estado:
                                  </label>
                                  <select
                                    value={draft.status}
                                    onChange={(e) =>
                                      updateOrderDraft(
                                        orderId,
                                        "status",
                                        e.target.value,
                                      )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                    disabled={
                                      !orderId || savingOrderId === orderId
                                    }
                                  >
                                    {ORDER_STATUSES.map((status) => (
                                      <option
                                        key={status.value}
                                        value={status.value}
                                      >
                                        {status.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                                    Tracking number:
                                  </label>
                                  <input
                                    type="text"
                                    value={draft.tracking_number}
                                    placeholder="Adicionar tracking number"
                                    onChange={(e) =>
                                      updateOrderDraft(
                                        orderId,
                                        "tracking_number",
                                        e.target.value,
                                      )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                    disabled={
                                      !orderId || savingOrderId === orderId
                                    }
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                                    Tracking URL:
                                  </label>
                                  <input
                                    type="url"
                                    value={draft.tracking_url}
                                    placeholder="https://..."
                                    onChange={(e) =>
                                      updateOrderDraft(
                                        orderId,
                                        "tracking_url",
                                        e.target.value,
                                      )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                    disabled={
                                      !orderId || savingOrderId === orderId
                                    }
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mb-4">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveOrderChanges(orderId);
                                  }}
                                  disabled={
                                    !orderId || savingOrderId === orderId
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Save size={14} />
                                  {savingOrderId === orderId
                                    ? "A guardar..."
                                    : "Guardar alterações"}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveOrder(orderId);
                                  }}
                                  disabled={!orderId}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                >
                                  Arquivar
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrder(orderId);
                                  }}
                                  disabled={!orderId}
                                  className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                                >
                                  Apagar
                                </button>
                              </div>

                              <p className="text-sm font-medium mb-2">
                                Produtos:
                              </p>
                              {(order.items || []).length > 0 ? (
                                (order.items || []).map((item, idx) => (
                                  <p
                                    key={idx}
                                    className="text-sm text-gray-600"
                                  >
                                    {item.quantity || 1}x{" "}
                                    {item.title ||
                                      item.product_title ||
                                      item.name ||
                                      item.product_name ||
                                      "Produto"}{" "}
                                    - €
                                    {Number(
                                      item.price ||
                                        item.unit_price ||
                                        item.total ||
                                        0,
                                    ).toFixed(2)}
                                  </p>
                                ))
                              ) : (
                                <p className="text-sm text-gray-400 italic">
                                  Sem produtos associados a esta encomenda.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {orders.length === 0 && (
                        <p className="text-gray-500 italic">
                          Sem encomendas para mostrar.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Contacts Tab */}
                {activeTab === "contacts" && (
                  <div>
                    <h2 className="text-xl font-syne font-bold mb-6">
                      Mensagens ({contacts.length})
                    </h2>
                    <div className="space-y-4">
                      {contacts.map((contact) => (
                        <div
                          key={getRecordId(contact)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${isUnread(contact) ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
                          onClick={() => {
                            const contactId = getRecordId(contact);
                            if (isUnread(contact) && contactId) {
                              markContactAsSeen(contactId);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-bold flex items-center gap-2">
                                {contact.name}
                                {isUnread(contact) && (
                                  <span className="text-[10px] uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                                    novo
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {contact.email}
                              </p>
                              <p className="mt-3 text-gray-700">
                                {contact.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {contact.created_at
                                  ? new Date(contact.created_at).toLocaleString(
                                      "pt-PT",
                                    )
                                  : "Sem data"}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteContact(getRecordId(contact));
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
                        <p className="text-gray-500 italic">
                          Sem mensagens para mostrar.
                        </p>
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
const ProductForm = ({ product, onSave, onCancel, token }) => {
  const [formData, setFormData] = useState(
    product || {
      title_pt: "",
      title_en: "",
      description_pt: "",
      description_en: "",
      category: "tshirts",
      price: 0,
      original_price: null,
      images: [],
      variants: null,
      is_bundle: false,
      bundle_items: null,
      subcategory: "",
    },
  );
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const path = product ? `/admin/products/${product.id}` : "/products";
      const method = product ? "PUT" : "POST";

      await apiFetch(path, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      alert(product ? "Produto atualizado!" : "Produto criado!");
      onSave();
    } catch (err) {
      alert("Erro ao guardar produto");
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageUrl.trim()],
      });
      setImageUrl("");
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-bold mb-4">
        {product ? "EDITAR PRODUTO" : "NOVO PRODUTO"}
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título (PT)</label>
          <input
            type="text"
            value={formData.title_pt}
            onChange={(e) =>
              setFormData({ ...formData, title_pt: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Título (EN)</label>
          <input
            type="text"
            value={formData.title_en}
            onChange={(e) =>
              setFormData({ ...formData, title_en: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Descrição (PT)
          </label>
          <textarea
            value={formData.description_pt}
            onChange={(e) =>
              setFormData({ ...formData, description_pt: e.target.value })
            }
            required
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Descrição (EN)
          </label>
          <textarea
            value={formData.description_en}
            onChange={(e) =>
              setFormData({ ...formData, description_en: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value,
                subcategory: ["tshirts", "totebags"].includes(e.target.value)
                  ? formData.subcategory || ""
                  : "",
              })
            }
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
          <label className="block text-sm font-medium mb-2">
            Subcategoria (T-shirts / Tote Bags)
          </label>
          <select
            value={formData.subcategory || ""}
            onChange={(e) =>
              setFormData({ ...formData, subcategory: e.target.value })
            }
            disabled={!["tshirts", "totebags"].includes(formData.category)}
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
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Preço Original (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.original_price || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                original_price: e.target.value
                  ? parseFloat(e.target.value)
                  : null,
              })
            }
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
                <img
                  src={img}
                  alt=""
                  className="w-20 h-20 object-cover rounded"
                />
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
          {saving ? "A GUARDAR..." : "GUARDAR"}
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
