// Shared helpers and constants for the admin Outbox tab.

export const STATUS_LABEL_PT = {
  pending: "Pendente",
  processing: "Em processamento",
  sent: "Enviado",
  failed: "Falhou",
  cancelled: "Cancelado",
  trashed: "Na lixeira",
};

// Tailwind colour classes per status — kept centralised so chips look the
// same in the table and in the detail modal.
export const STATUS_COLOR = {
  sent: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  processing: "bg-sky-100 text-sky-700 border border-sky-200",
  failed: "bg-red-100 text-red-700 border border-red-200",
  cancelled: "bg-gray-200 text-gray-700 border border-gray-300",
  trashed: "bg-zinc-200 text-zinc-700 border border-zinc-300",
};

export const STATUS_PILL_COLOR = {
  sent: "bg-emerald-600 text-white",
  pending: "bg-amber-500 text-white",
  failed: "bg-red-600 text-white",
  cancelled: "bg-gray-600 text-white",
  trashed: "bg-zinc-700 text-white",
};

export const KIND_LABEL_PT = {
  order_customer_notification: "Encomenda → cliente",
  order_admin_notification: "Encomenda → loja",
  contact_admin_notification: "Contacto novo → loja",
  contact_customer_ack: "Contacto recebido → cliente",
  contact_reply_customer: "Resposta da loja → cliente",
  contact_reply_admin_copy: "Cópia da resposta → loja",
  admin_email_test: "Teste SMTP",
};

export const KIND_OPTIONS = Object.entries(KIND_LABEL_PT).map(
  ([value, label]) => ({ value, label }),
);

export const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "processing", label: "Em processamento" },
  { value: "sent", label: "Enviado" },
  { value: "failed", label: "Falhou" },
  { value: "cancelled", label: "Cancelado" },
];

export const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
};

export const truncate = (str, max = 60) => {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max)}…` : str;
};

export const isRetryable = (status) =>
  status === "failed" || status === "pending";
export const isCancellable = (status) =>
  status === "failed" || status === "pending";
