// Shared helpers and constants for the admin backoffice.

export const COLLECTION_SUBCATEGORIES = [
  { id: "o-poema-e-tu", label: "O poema e tu" },
  { id: "era-uma-vez", label: "Era uma vez" },
  { id: "write-that-love-letter", label: "Write that love letter" },
  { id: "dare-to", label: "Dare to" },
];

export const ORDER_STATUSES = [
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

export const getRecordId = (record) => record?.id || record?._id;

export const isUnread = (record) =>
  record?.seen_by_admin === false ||
  record?.read === false ||
  record?.mark_read === false;

export const getOrderTotal = (order) =>
  Number(order?.total ?? order?.amount_total ?? order?.total_amount ?? 0);

export const formatAddress = (address = {}) =>
  [
    address.line1 || address.address_line1,
    address.line2 || address.address_line2,
    address.postal_code,
    address.city,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
