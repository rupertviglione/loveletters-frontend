import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Package, ShoppingBag, Mail, Send, Clock } from "lucide-react";
import { adminVerify, adminGetNotifications } from "@/services/api";
import ProductsTab from "@/components/admin/ProductsTab";
import OrdersTab from "@/components/admin/OrdersTab";
import ContactsTab from "@/components/admin/ContactsTab";
import OutboxTab from "@/components/admin/OutboxTab";

const NOTIFY_POLL_MS = 30000;
// Threshold (in minutes) below which we surface a "session expires soon" hint.
const EXPIRY_WARN_THRESHOLD_MIN = 30;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [unseenOrders, setUnseenOrders] = useState(0);
  const [unseenContacts, setUnseenContacts] = useState(0);
  const [expiresInMin, setExpiresInMin] = useState(null);
  const autoLogoutRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  const verifyAuth = useCallback(async () => {
    try {
      const data = await adminVerify(token);
      const mins = Number(data?.token_expires_in_minutes);
      if (Number.isFinite(mins) && mins >= 0) {
        setExpiresInMin(Math.floor(mins));
      }
    } catch (err) {
      // 401 is handled globally in api.js (hard redirect with ?expired=1).
      // For other errors (transient network), keep the user where they are.
      if (err?.status === 401) {
        localStorage.removeItem("admin_token");
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/admin/login")
        ) {
          window.location.replace("/admin/login?expired=1");
        }
      }
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminGetNotifications(token);
      setUnseenOrders(Number(data?.orders || 0));
      setUnseenContacts(Number(data?.messages ?? data?.contacts ?? 0));
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error fetching admin notifications:", err);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    verifyAuth();
  }, [token, navigate, verifyAuth]);

  useEffect(() => {
    if (!token) return undefined;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, NOTIFY_POLL_MS);
    const onFocus = fetchNotifications;
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [token, fetchNotifications]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  // Auto-logout exactly when the token expires (server-reported), so the
  // operator isn't surprised by a stale 401 mid-action.
  useEffect(() => {
    if (autoLogoutRef.current) {
      clearTimeout(autoLogoutRef.current);
      autoLogoutRef.current = null;
    }
    if (expiresInMin == null || expiresInMin < 0) return undefined;
    const ms = Math.max(1000, expiresInMin * 60 * 1000);
    autoLogoutRef.current = setTimeout(() => {
      localStorage.removeItem("admin_token");
      window.location.replace("/admin/login?expired=1");
    }, ms);
    return () => {
      if (autoLogoutRef.current) clearTimeout(autoLogoutRef.current);
    };
  }, [expiresInMin]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 gap-3">
            <h1 className="text-2xl font-syne font-bold">BACKOFFICE</h1>
            <div className="flex items-center gap-3">
              {expiresInMin != null &&
                expiresInMin >= 0 &&
                expiresInMin <= EXPIRY_WARN_THRESHOLD_MIN && (
                  <span
                    className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium"
                    data-testid="admin-session-expiry"
                    title={`Sessão expira em ${expiresInMin} min`}
                  >
                    <Clock size={12} />
                    Sessão expira em {expiresInMin} min
                  </span>
                )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-accent transition-colors"
                data-testid="admin-logout"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <TabButton
              active={activeTab === "products"}
              onClick={() => setActiveTab("products")}
              icon={<Package size={20} />}
              label="PRODUTOS"
              testId="admin-tab-products"
            />
            <TabButton
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              icon={<ShoppingBag size={20} />}
              label="ENCOMENDAS"
              badge={unseenOrders}
              testId="admin-tab-orders"
            />
            <TabButton
              active={activeTab === "contacts"}
              onClick={() => setActiveTab("contacts")}
              icon={<Mail size={20} />}
              label="MENSAGENS"
              badge={unseenContacts}
              testId="admin-tab-contacts"
            />
            <TabButton
              active={activeTab === "outbox"}
              onClick={() => setActiveTab("outbox")}
              icon={<Send size={20} />}
              label="OUTBOX"
              testId="admin-tab-outbox"
            />
          </div>

          <div className="p-4 sm:p-6">
            {(unseenOrders > 0 || unseenContacts > 0) && (
              <div
                className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
                data-testid="admin-unseen-banner"
              >
                {unseenOrders > 0 && (
                  <span>{unseenOrders} nova(s) encomenda(s) por ver.</span>
                )}
                {unseenOrders > 0 && unseenContacts > 0 && <span> · </span>}
                {unseenContacts > 0 && (
                  <span>{unseenContacts} nova(s) mensagem(ns) por ver.</span>
                )}
              </div>
            )}

            {activeTab === "products" && <ProductsTab token={token} />}
            {activeTab === "orders" && (
              <OrdersTab token={token} onCountsChange={fetchNotifications} />
            )}
            {activeTab === "contacts" && (
              <ContactsTab token={token} onCountsChange={fetchNotifications} />
            )}
            {activeTab === "outbox" && <OutboxTab token={token} />}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, badge, testId }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
      active
        ? "text-accent border-b-2 border-accent"
        : "text-gray-600 hover:text-gray-900"
    }`}
    data-testid={testId}
  >
    {icon}
    <span>{label}</span>
    {badge > 0 && (
      <span className="ml-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center font-bold">
        {badge}
      </span>
    )}
  </button>
);

export default AdminDashboard;
