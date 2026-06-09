// Single fetch-based HTTP layer for the Love Letters frontend.
//
// All public + admin calls go through `apiFetch`. We do not use axios anymore —
// keeping a single network stack means a single 401 handler, a single error log
// pipeline, and predictable behaviour for multipart uploads (browser-managed
// boundary).

export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : "/api";

const isDevelopment = process.env.NODE_ENV !== "production";

const safeParseJson = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return response.text();
  }
  return response.json();
};

const normalizeHeaders = (headers = {}) => {
  const normalized =
    headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : { ...headers };

  return Object.fromEntries(
    Object.entries(normalized).map(([key, value]) => [
      key,
      ["authorization", "cookie"].includes(key.toLowerCase())
        ? "[redacted]"
        : value,
    ]),
  );
};

const getErrorKind = (error, status) => {
  if (status >= 500) return "server_error";
  if (status >= 400) return "client_error";
  if (error?.message?.toLowerCase().includes("cors")) return "cors_error";
  if (
    error?.name === "TypeError" &&
    error?.message?.toLowerCase().includes("fetch")
  )
    return "network_or_cors_error";
  if (error?.code === "ERR_NETWORK") return "network_or_cors_error";
  return "network_error";
};

export const logApiRequest = ({ method, url, data, headers }) => {
  if (!isDevelopment) return;
  console.debug("[API request]", {
    method: method?.toUpperCase?.() || "GET",
    url,
    data,
    headers: normalizeHeaders(headers),
  });
};

export const logApiResponse = ({ method, url, status, data, durationMs }) => {
  if (!isDevelopment) return;
  console.debug("[API response]", {
    method: method?.toUpperCase?.() || "GET",
    url,
    status,
    durationMs,
    data,
  });
};

export const logApiError = ({
  method,
  url,
  status,
  data,
  error,
  durationMs,
}) => {
  if (!isDevelopment) return;
  console.error("[API error]", {
    method: method?.toUpperCase?.() || "GET",
    url,
    status,
    durationMs,
    kind: getErrorKind(error, status),
    data,
    message: error?.message,
    error,
  });
};

export class ApiRequestError extends Error {
  constructor(message, { status, data, response } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.data = data;
    this.response = response;
  }
}

/**
 * Best-effort extractor for FastAPI error responses. Handles:
 *  - 422 with `detail: [ {loc, msg, type}, ... ]`  (validation)
 *  - 4xx/5xx with `detail: "string"`
 *  - 4xx with `detail: { message: "..." }`
 *  - anything else → fallback string.
 */
export const formatApiError = (err, fallback = "Erro inesperado.") => {
  const detail = err?.data?.detail;
  if (Array.isArray(detail)) {
    // FastAPI 422 — render first 2 field errors compactly.
    return detail
      .slice(0, 2)
      .map((d) => {
        const field =
          Array.isArray(d?.loc) && d.loc.length > 1
            ? d.loc.slice(1).join(".")
            : d?.loc?.[0] || "campo";
        return `${field}: ${d?.msg || "inválido"}`;
      })
      .join(" · ");
  }
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    return detail.message || detail.error || JSON.stringify(detail);
  }
  return err?.message || fallback;
};

// ---------------------------------------------------------------------------
// 401 handling (token expiry on admin routes)
// ---------------------------------------------------------------------------

const isAdminPath = (url = "") => {
  try {
    const path = url.replace(API_BASE_URL, "");
    return path.startsWith("/admin/") && !path.startsWith("/admin/login");
  } catch {
    return false;
  }
};

const handleAdminUnauthorized = (url) => {
  if (typeof window === "undefined") return;
  if (!isAdminPath(url)) return;
  if (window.location.pathname.startsWith("/admin/login")) return;
  try {
    localStorage.removeItem("admin_token");
  } catch {
    /* ignore */
  }
  window.location.replace("/admin/login?expired=1");
};

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

const buildQueryString = (params) => {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  const usp = new URLSearchParams();
  entries.forEach(([k, v]) => usp.append(k, String(v)));
  return `?${usp.toString()}`;
};

/**
 * apiFetch — the single entrypoint for all HTTP traffic.
 *
 * @param {string} path                   relative path (e.g. "/admin/orders") or full URL
 * @param {object} options
 * @param {string} [options.method]
 * @param {object} [options.headers]
 * @param {object|string|FormData} [options.body]   body OR options.json for auto JSON
 * @param {object} [options.json]         object → serialized as JSON
 * @param {object} [options.params]       URL query parameters
 */
export const apiFetch = async (path, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const query = buildQueryString(options.params);
  const url = path.startsWith("http")
    ? `${path}${query}`
    : `${API_BASE_URL}${path}${query}`;
  const startedAt = Date.now();

  // Build init: special-case `json` for convenience.
  const headers = { ...(options.headers || {}) };
  let body = options.body;
  if (options.json !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = JSON.stringify(options.json);
  }

  logApiRequest({
    method,
    url,
    data: options.json ?? options.body,
    headers,
  });

  try {
    const response = await fetch(url, { ...options, method, headers, body });
    const durationMs = Date.now() - startedAt;

    // Read body only once; do NOT use response.clone() (some fetch
    // instrumentation in preview environments consumes the body and makes
    // clone() throw).
    let data = null;
    try {
      data = await safeParseJson(response);
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = new ApiRequestError(
        `API request failed with status ${response.status}`,
        { status: response.status, data, response },
      );
      logApiError({
        method,
        url,
        status: response.status,
        data,
        error,
        durationMs,
      });
      if (response.status === 401) handleAdminUnauthorized(url);
      throw error;
    }

    logApiResponse({ method, url, status: response.status, data, durationMs });
    return data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    logApiError({
      method,
      url,
      status: error?.status,
      data: error?.data,
      error,
      durationMs: Date.now() - startedAt,
    });
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

export const getProducts = (category) =>
  apiFetch("/products", {
    params: category && category !== "all" ? { category } : undefined,
  });

export const getProduct = (id) => apiFetch(`/products/${id}`);

export const createCheckoutSession = (data) =>
  apiFetch("/checkout/session", { method: "POST", json: data });

export const getCheckoutStatus = (sessionId) =>
  apiFetch(`/checkout/status/${sessionId}`);

export const getOrderBySession = (sessionId) =>
  apiFetch(`/orders/by-session/${sessionId}`);

export const submitContact = (data) =>
  apiFetch("/contact", { method: "POST", json: data });

// Public site config: currency, free-shipping threshold and banner copy.
// Never throw on failure — callers fall back to safe defaults.
export const getSiteConfig = () => apiFetch("/config");

// ---------------------------------------------------------------------------
// Admin helpers
// ---------------------------------------------------------------------------

const auth = (token, extra = {}) => ({
  Authorization: `Bearer ${token}`,
  ...extra,
});

// Auth
export const adminVerify = (token) =>
  apiFetch("/admin/verify", { headers: auth(token) });

// Products
export const adminCreateProduct = (token, payload) =>
  apiFetch("/products", { method: "POST", headers: auth(token), json: payload });

export const adminUpdateProduct = (token, productId, payload) =>
  apiFetch(`/admin/products/${productId}`, {
    method: "PUT",
    headers: auth(token),
    json: payload,
  });

export const adminDeleteProduct = (token, productId) =>
  apiFetch(`/admin/products/${productId}`, {
    method: "DELETE",
    headers: auth(token),
  });

// Orders
export const adminGetOrders = (token) =>
  apiFetch("/admin/orders", { headers: auth(token) });

export const adminGetArchivedOrders = (token) =>
  apiFetch("/admin/orders/archived", { headers: auth(token) });

export const adminPatchOrder = (token, orderId, payload) =>
  apiFetch(`/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: auth(token),
    json: payload,
  });

export const adminArchiveOrder = (token, id) =>
  apiFetch(`/admin/orders/${id}/archive`, {
    method: "POST",
    headers: auth(token),
  });

export const adminUnarchiveOrder = (token, id) =>
  apiFetch(`/admin/orders/${id}/unarchive`, {
    method: "POST",
    headers: auth(token),
  });

export const adminDeleteOrder = (token, id) =>
  apiFetch(`/admin/orders/${id}`, { method: "DELETE", headers: auth(token) });

export const adminMarkOrderRead = (token, id) =>
  apiFetch(`/admin/orders/${id}/mark-read`, {
    method: "POST",
    headers: auth(token),
  });

// Contacts
export const adminGetContacts = (token) =>
  apiFetch("/admin/contacts", { headers: auth(token) });

export const adminGetArchivedContacts = (token) =>
  apiFetch("/admin/contacts/archived", { headers: auth(token) });

export const adminArchiveContact = (token, id) =>
  apiFetch(`/admin/contacts/${id}/archive`, {
    method: "POST",
    headers: auth(token),
  });

export const adminUnarchiveContact = (token, id) =>
  apiFetch(`/admin/contacts/${id}/unarchive`, {
    method: "POST",
    headers: auth(token),
  });

export const adminDeleteContact = (token, id) =>
  apiFetch(`/admin/contacts/${id}`, { method: "DELETE", headers: auth(token) });

export const adminMarkContactRead = (token, id) =>
  apiFetch(`/admin/contacts/${id}/mark-read`, {
    method: "POST",
    headers: auth(token),
  });

// Reply (multipart — DO NOT set Content-Type; the browser sets the boundary).
export const adminReplyContact = async (
  token,
  contactId,
  { subject, message, attachments = [] } = {},
) => {
  const formData = new FormData();
  if (subject) formData.append("subject", subject);
  formData.append("message", message);
  (attachments || []).forEach((file) => {
    if (file) formData.append("attachment", file, file.name);
  });
  return apiFetch(`/admin/contacts/${contactId}/reply`, {
    method: "POST",
    headers: auth(token),
    body: formData,
  });
};

// Notifications
export const adminGetNotifications = (token) =>
  apiFetch("/admin/notifications", { headers: auth(token) });

// Login (no token yet)
export const adminLogin = (username, password) =>
  apiFetch("/admin/login", {
    method: "POST",
    json: { username, password },
  });

// ---------------------------------------------------------------------------
// Admin · Mail outbox & SMTP diagnostics
// ---------------------------------------------------------------------------

export const adminGetOutbox = (token, params = {}) =>
  apiFetch("/admin/mail-outbox", { headers: auth(token), params });

export const adminGetOutboxItem = (token, id) =>
  apiFetch(`/admin/mail-outbox/${id}`, { headers: auth(token) });

export const adminGetOutboxStats = (token) =>
  apiFetch("/admin/mail-outbox/stats", { headers: auth(token) });

export const adminRetryOutbox = (token, id) =>
  apiFetch(`/admin/mail-outbox/${id}/retry`, {
    method: "POST",
    headers: auth(token),
  });

export const adminCancelOutbox = (token, id) =>
  apiFetch(`/admin/mail-outbox/${id}/cancel`, {
    method: "POST",
    headers: auth(token),
  });

export const adminRetryAllOutbox = (token) =>
  apiFetch("/admin/mail-outbox/retry-all", {
    method: "POST",
    headers: auth(token),
  });

export const adminEmailDiagnose = (token, { signal } = {}) =>
  apiFetch("/admin/email/diagnose", {
    method: "POST",
    headers: auth(token),
    signal,
  });

export const adminEmailTest = (token) =>
  apiFetch("/admin/email/test", {
    method: "POST",
    headers: auth(token),
  });

// ---------------------------------------------------------------------------
// Admin · Mail outbox · Trash (soft-delete)
// ---------------------------------------------------------------------------

export const adminTrashOutbox = (token, id) =>
  apiFetch(`/admin/mail-outbox/${id}/trash`, {
    method: "POST",
    headers: auth(token),
  });

export const adminRestoreOutbox = (token, id) =>
  apiFetch(`/admin/mail-outbox/${id}/restore`, {
    method: "POST",
    headers: auth(token),
  });

export const adminBulkTrashOutbox = (token, ids) =>
  apiFetch("/admin/mail-outbox/bulk-trash", {
    method: "POST",
    headers: auth(token),
    json: { ids },
  });

export const adminBulkRestoreOutbox = (token, ids) =>
  apiFetch("/admin/mail-outbox/bulk-restore", {
    method: "POST",
    headers: auth(token),
    json: { ids },
  });

export const adminBulkDeleteOutbox = (token, ids) =>
  apiFetch("/admin/mail-outbox/bulk-delete", {
    method: "POST",
    headers: auth(token),
    json: { ids },
  });

export const adminEmptyOutboxTrash = (token) =>
  apiFetch("/admin/mail-outbox/trash/empty", {
    method: "POST",
    headers: auth(token),
  });

export const adminDeleteOutbox = (token, id) =>
  apiFetch(`/admin/mail-outbox/${id}`, {
    method: "DELETE",
    headers: auth(token),
  });

// ---------------------------------------------------------------------------
// Admin · Email templates
// ---------------------------------------------------------------------------

export const adminListEmailTemplates = (token) =>
  apiFetch("/admin/email-templates", { headers: auth(token) });

export const adminGetEmailTemplate = (token, key) =>
  apiFetch(`/admin/email-templates/${key}`, { headers: auth(token) });

export const adminSaveEmailTemplate = (token, key, payload) =>
  apiFetch(`/admin/email-templates/${key}`, {
    method: "PUT",
    headers: auth(token),
    json: payload,
  });

export const adminResetEmailTemplate = (token, key) =>
  apiFetch(`/admin/email-templates/${key}`, {
    method: "DELETE",
    headers: auth(token),
  });

export const adminPreviewEmailTemplate = (token, key, payload) =>
  apiFetch(`/admin/email-templates/${key}/preview`, {
    method: "POST",
    headers: auth(token),
    json: payload,
  });

export const adminSendTestEmailTemplate = (token, key, payload) =>
  apiFetch(`/admin/email-templates/${key}/send-test`, {
    method: "POST",
    headers: auth(token),
    json: payload,
  });

// ---------------------------------------------------------------------------
// Admin · Orders · Resend confirmation + replay Stripe fulfillment
// ---------------------------------------------------------------------------

export const adminResendOrderConfirmation = (token, id) =>
  apiFetch(`/admin/orders/${id}/resend-confirmation`, {
    method: "POST",
    headers: auth(token),
  });

export const adminFulfillOrderFromStripe = (token, id) =>
  apiFetch(`/admin/orders/${id}/fulfill-from-stripe`, {
    method: "POST",
    headers: auth(token),
  });
