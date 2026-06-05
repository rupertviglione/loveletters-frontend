import axios from "axios";

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

export const apiFetch = async (path, options = {}) => {
  const method = options.method || "GET";
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const startedAt = Date.now();

  logApiRequest({
    method,
    url,
    data: options.body,
    headers: options.headers,
  });

  try {
    const response = await fetch(url, options);
    const data = await safeParseJson(response.clone()).catch(() => null);
    const durationMs = Date.now() - startedAt;

    if (!response.ok) {
      const error = new ApiRequestError(
        `API request failed with status ${response.status}`,
        {
          status: response.status,
          data,
          response,
        },
      );
      logApiError({
        method,
        url,
        status: response.status,
        data,
        error,
        durationMs,
      });
      throw error;
    }

    logApiResponse({ method, url, status: response.status, data, durationMs });
    return data;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

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

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  config.metadata = { startedAt: Date.now() };
  logApiRequest({
    method: config.method,
    url: `${config.baseURL || ""}${config.url || ""}`,
    data: config.data || config.params,
    headers: config.headers,
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    logApiResponse({
      method: response.config.method,
      url: `${response.config.baseURL || ""}${response.config.url || ""}`,
      status: response.status,
      data: response.data,
      durationMs:
        Date.now() - (response.config.metadata?.startedAt || Date.now()),
    });
    return response;
  },
  (error) => {
    logApiError({
      method: error.config?.method,
      url: `${error.config?.baseURL || ""}${error.config?.url || ""}`,
      status: error.response?.status,
      data: error.response?.data,
      error,
      durationMs:
        Date.now() - (error.config?.metadata?.startedAt || Date.now()),
    });
    return Promise.reject(error);
  },
);

// Products
export const getProducts = (category) =>
  api
    .get("/products", {
      params: category && category !== "all" ? { category } : {},
    })
    .then((r) => r.data);

export const getProduct = (id) =>
  api.get(`/products/${id}`).then((r) => r.data);

// Checkout
export const createCheckoutSession = (data) =>
  api.post("/checkout/session", data).then((r) => r.data);

export const getCheckoutStatus = (sessionId) =>
  api.get(`/checkout/status/${sessionId}`).then((r) => r.data);

// Contact
export const submitContact = (data) =>
  api.post("/contact", data).then((r) => r.data);

export default api;
