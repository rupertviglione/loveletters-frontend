import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Save,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader,
} from "lucide-react";
import {
  adminGetOrders,
  adminGetArchivedOrders,
  adminPatchOrder,
  adminArchiveOrder,
  adminUnarchiveOrder,
  adminDeleteOrder,
  adminMarkOrderRead,
} from "@/services/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  ORDER_STATUSES,
  getRecordId,
  isUnread,
  getOrderTotal,
  formatAddress,
} from "./constants";

const buildDrafts = (orders) =>
  orders.reduce((acc, order) => {
    const id = getRecordId(order);
    if (!id) return acc;
    acc[id] = {
      status: order.status || order.payment_status || "pending",
      tracking_number: order.tracking_number || "",
      tracking_url: order.tracking_url || "",
    };
    return acc;
  }, {});

const OrdersTab = ({ token, onCountsChange }) => {
  const [view, setView] = useState("active"); // active | archived
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        view === "archived"
          ? await adminGetArchivedOrders(token)
          : await adminGetOrders(token);
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : [];
      setOrders(list);
      setDrafts(buildDrafts(list));
    } catch (err) {
      toast.error("Erro a carregar encomendas");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token, view]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateDraft = (orderId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), [field]: value },
    }));
  };

  const handleSave = async (orderId) => {
    const draft = drafts[orderId];
    if (!draft) return;
    setSavingId(orderId);
    try {
      const updated = await adminPatchOrder(token, orderId, {
        status: draft.status,
        tracking_number: draft.tracking_number || "",
        tracking_url: draft.tracking_url || "",
        notify_customer: true,
        mark_read: true,
      });
      setOrders((prev) =>
        prev.map((order) =>
          getRecordId(order) === orderId
            ? {
                ...order,
                ...(updated || {}),
                status: draft.status,
                tracking_number: draft.tracking_number || "",
                tracking_url: draft.tracking_url || "",
                seen_by_admin: true,
                read: true,
              }
            : order,
        ),
      );
      onCountsChange?.();
      toast.success("Alterações guardadas. Cliente notificado por email.");
    } catch (err) {
      toast.error("Erro ao guardar alterações da encomenda");
    } finally {
      setSavingId(null);
    }
  };

  const handleArchive = async (orderId) => {
    try {
      await adminArchiveOrder(token, orderId);
      setOrders((prev) => prev.filter((o) => getRecordId(o) !== orderId));
      onCountsChange?.();
      toast.success("Encomenda arquivada.");
    } catch (err) {
      toast.error("Erro ao arquivar encomenda");
    }
  };

  const handleUnarchive = async (orderId) => {
    try {
      await adminUnarchiveOrder(token, orderId);
      setOrders((prev) => prev.filter((o) => getRecordId(o) !== orderId));
      onCountsChange?.();
      toast.success("Encomenda desarquivada.");
    } catch (err) {
      toast.error("Erro ao desarquivar encomenda");
    }
  };

  const confirmDelete = async () => {
    const id = pendingDelete?.id;
    setPendingDelete(null);
    if (!id) return;
    try {
      await adminDeleteOrder(token, id);
      setOrders((prev) => prev.filter((o) => getRecordId(o) !== id));
      onCountsChange?.();
      toast.success("Encomenda apagada.");
    } catch (err) {
      toast.error("Erro ao apagar encomenda");
    }
  };

  const handleClick = async (order) => {
    const orderId = getRecordId(order);
    if (!isUnread(order) || !orderId) return;
    try {
      await adminMarkOrderRead(token, orderId);
      setOrders((prev) =>
        prev.map((o) =>
          getRecordId(o) === orderId
            ? { ...o, seen_by_admin: true, read: true }
            : o,
        ),
      );
      onCountsChange?.();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("mark-order-read failed (non-blocking):", err);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-syne font-bold">
          Encomendas ({orders.length})
        </h2>
        <div
          className="inline-flex border border-gray-200 rounded-md overflow-hidden self-start"
          data-testid="orders-view-switcher"
        >
          <button
            type="button"
            onClick={() => setView("active")}
            className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-colors ${
              view === "active"
                ? "bg-accent text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            data-testid="orders-tab-active"
          >
            Activas
          </button>
          <button
            type="button"
            onClick={() => setView("archived")}
            className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold border-l border-gray-200 transition-colors ${
              view === "archived"
                ? "bg-accent text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            data-testid="orders-tab-archived"
          >
            Arquivadas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600">A carregar...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderId = getRecordId(order);
            const draft = drafts[orderId] || {
              status: order.status || order.payment_status || "pending",
              tracking_number: order.tracking_number || "",
              tracking_url: order.tracking_url || "",
            };
            const shippingAddress =
              order.shipping_address || order.shippingAddress || {};
            const shippingMethod =
              order.shipping_method || order.shippingMethod || {};
            const paid =
              order.payment_status === "paid" || order.status === "paid";

            return (
              <div
                key={orderId || order.order_number}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${isUnread(order) ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
                onClick={() => handleClick(order)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-bold flex items-center gap-2">
                      <span className="truncate">
                        {order.order_number || orderId || "Encomenda"}
                      </span>
                      {isUnread(order) && (
                        <span className="text-[10px] uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded shrink-0">
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
                  <div className="text-left sm:text-right shrink-0">
                    <p className="font-bold text-accent">
                      €{getOrderTotal(order).toFixed(2)}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded ${
                        paid
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {paid ? "PAGO" : "PENDENTE"}
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
                          updateDraft(orderId, "status", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        disabled={!orderId || savingId === orderId}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
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
                          updateDraft(
                            orderId,
                            "tracking_number",
                            e.target.value,
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        disabled={!orderId || savingId === orderId}
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
                          updateDraft(orderId, "tracking_url", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        disabled={!orderId || savingId === orderId}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(orderId);
                      }}
                      disabled={!orderId || savingId === orderId}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid={`order-save-${orderId || ""}`}
                    >
                      {savingId === orderId ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {savingId === orderId
                        ? "A guardar..."
                        : "Guardar alterações"}
                    </button>
                    {view === "active" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(orderId);
                        }}
                        disabled={!orderId}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        data-testid={`order-archive-${orderId || ""}`}
                      >
                        <Archive size={14} /> Arquivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchive(orderId);
                        }}
                        disabled={!orderId}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        data-testid={`order-unarchive-${orderId || ""}`}
                      >
                        <ArchiveRestore size={14} /> Desarquivar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete({
                          id: orderId,
                          name: order.order_number || orderId,
                        });
                      }}
                      disabled={!orderId}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={14} /> Apagar
                    </button>
                  </div>

                  <p className="text-sm font-medium mb-2">Produtos:</p>
                  {(order.items || []).length > 0 ? (
                    (order.items || []).map((item, idx) => (
                      <p
                        key={
                          item.id ||
                          item.product_id ||
                          `${item.product_id || item.title || item.name || "item"}-${idx}`
                        }
                        className="text-sm text-gray-600"
                      >
                        {item.quantity || 1}x{" "}
                        {item.title_pt ||
                          item.title ||
                          item.title_en ||
                          item.product_title ||
                          item.name ||
                          item.product_name ||
                          "Produto"}
                        {item.selected_options
                          ? ` (${Object.entries(item.selected_options)
                              .filter(([, v]) => v)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")})`
                          : ""}{" "}
                        - €
                        {Number(
                          item.line_total ||
                            item.total ||
                            item.price ||
                            item.unit_price ||
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
              {view === "archived"
                ? "Sem encomendas arquivadas."
                : "Sem encomendas para mostrar."}
            </p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Apagar encomenda"
        message={`Tens a certeza que queres APAGAR a encomenda ${pendingDelete?.name || ""}? Esta acção é definitiva — usa "Arquivar" se só queres tirá-la da lista activa.`}
        confirmLabel="Apagar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default OrdersTab;
