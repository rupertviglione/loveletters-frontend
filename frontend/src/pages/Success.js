import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getCheckoutStatus,
  getOrderBySession,
  logApiError,
} from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle, Loader, AlertCircle, Clock, Mail } from "lucide-react";
import { motion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CONTACT_EMAIL = "hello@weloveloveletters.com";
const MAX_ATTEMPTS = 15; // ~30s of polling at 2s interval
const POLL_INTERVAL_MS = 2000;

const formatAddress = (address = {}) =>
  [
    address.name,
    address.line1 || address.address_line1,
    address.line2 || address.address_line2,
    [address.postal_code, address.city].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

const Success = () => {
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("checking"); // checking | success | timeout | error
  const [order, setOrder] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [pollKey, setPollKey] = useState(0); // increment to restart polling

  const clearedRef = useRef(false);
  const attemptsRef = useRef(0);
  const timerRef = useRef(null);
  const cancelledRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      navigate("/cart");
      return undefined;
    }

    cancelledRef.current = false;
    attemptsRef.current = 0;
    setStatus("checking");

    const tryFallbackOrder = async () => {
      try {
        const fallback = await getOrderBySession(sessionId);
        if (fallback && (fallback.status === "paid" || fallback.paid)) {
          return fallback;
        }
      } catch (e) {
        // ignore fallback errors
      }
      return null;
    };

    const onPaid = (resp, fallbackOrder) => {
      const finalOrder = resp?.order || fallbackOrder || resp || null;
      setOrder(finalOrder);
      setCustomerEmail(
        resp?.order?.customer?.email ||
          resp?.order?.customer_email ||
          fallbackOrder?.customer_email ||
          fallbackOrder?.customer?.email ||
          "",
      );
      setStatus("success");
      if (!clearedRef.current) {
        clearCart();
        clearedRef.current = true;
      }
    };

    const poll = async () => {
      if (cancelledRef.current) return;
      attemptsRef.current += 1;

      let statusResp = null;
      let statusError = null;
      try {
        statusResp = await getCheckoutStatus(sessionId);
      } catch (err) {
        statusError = err;
      }

      if (cancelledRef.current) return;

      const isPaid =
        statusResp?.paid === true ||
        statusResp?.payment_status === "paid" ||
        statusResp?.status === "paid";

      if (isPaid) {
        onPaid(statusResp, null);
        return;
      }

      // If status endpoint blew up (e.g. 500 on archived sessions), try fallback
      if (statusError || !statusResp) {
        const fb = await tryFallbackOrder();
        if (cancelledRef.current) return;
        if (fb) {
          onPaid({ order: fb, paid: true }, fb);
          return;
        }
        if (statusError) {
          logApiError({
            method: "GET",
            url: `${API}/checkout/status/${sessionId}`,
            error: statusError,
          });
        }
      }

      // Not yet paid -> keep polling
      if (attemptsRef.current < MAX_ATTEMPTS) {
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } else {
        // Final fallback before giving up
        const fb = await tryFallbackOrder();
        if (cancelledRef.current) return;
        if (fb) {
          onPaid({ order: fb, paid: true }, fb);
        } else {
          setStatus("timeout");
        }
      }
    };

    poll();

    return () => {
      cancelledRef.current = true;
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, pollKey]);

  const retryPolling = () => {
    setPollKey((k) => k + 1);
  };

  if (status === "checking") {
    return (
      <div
        className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center px-4"
        data-testid="success-checking"
      >
        <Loader className="animate-spin text-accent mb-6" size={48} />
        <p className="font-serif text-xl text-muted-foreground italic">
          {t("A confirmar pagamento...", "Confirming payment...")}
        </p>
        <p className="font-serif text-sm text-muted-foreground/70 mt-2">
          {t(
            "Pode demorar alguns segundos.",
            "This can take a few seconds.",
          )}
        </p>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div
        className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center px-4"
        data-testid="success-timeout"
      >
        <Clock className="text-muted-foreground mb-6" size={48} />
        <h1 className="font-syne font-extrabold text-3xl md:text-5xl tracking-tight uppercase mb-4">
          {t("Pagamento a processar", "Payment processing")}
        </h1>
        <p className="font-serif text-lg text-muted-foreground mb-8 text-center max-w-2xl">
          {t(
            "O teu pagamento está a ser processado. Vais receber um email de confirmação assim que estiver concluído.",
            "Your payment is being processed. You will receive a confirmation email as soon as it is complete.",
          )}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={retryPolling}
            className="px-8 py-4 bg-accent text-accent-foreground hover:bg-foreground hover:text-background transition-all duration-300 uppercase tracking-widest text-xs font-bold"
            data-testid="success-retry-button"
          >
            {t("Tentar de novo", "Try again")}
          </button>
          <button
            onClick={() => {
              window.location.href = `mailto:${CONTACT_EMAIL}`;
            }}
            className="px-8 py-4 border border-border hover:border-accent hover:text-accent transition-all duration-300 uppercase tracking-widest text-xs font-bold"
          >
            {t("Contactar", "Contact us")}
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 border border-border hover:border-accent hover:text-accent transition-all duration-300 uppercase tracking-widest text-xs font-bold"
          >
            {t("Inicio", "Home")}
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center px-4"
        data-testid="success-error"
      >
        <AlertCircle className="text-destructive mb-6" size={48} />
        <h1 className="font-syne font-extrabold text-3xl md:text-5xl tracking-tight uppercase mb-4 text-destructive">
          {t("Erro", "Error")}
        </h1>
        <p className="font-serif text-lg text-muted-foreground mb-8 text-center max-w-2xl">
          {t(
            "Ocorreu um erro ao verificar o pagamento. Se já tens débito no Stripe, contacta-nos com este link e nós resolvemos.",
            "An error occurred while verifying payment. If your card was charged, contact us and we will sort it out.",
          )}
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="px-8 py-4 bg-accent text-accent-foreground hover:bg-foreground hover:text-background transition-all duration-300 uppercase tracking-widest text-xs font-bold"
        >
          {t("Voltar a loja", "Back to shop")}
        </button>
      </div>
    );
  }

  // status === "success"
  const items = order?.items || [];
  const total = Number(
    order?.total ?? order?.amount_total ?? order?.total_amount ?? 0,
  );
  const orderNumber = order?.order_number || order?.id || "";
  const shippingAddress =
    order?.shipping_address || order?.customer?.shipping_address || {};

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-16" data-testid="success-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto px-4 py-12 md:py-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 text-center"
        >
          <CheckCircle className="mx-auto text-accent" size={72} />
        </motion.div>

        <h1 className="font-syne font-extrabold text-3xl md:text-5xl tracking-tight uppercase mb-4 text-center">
          {t("Obrigado!", "Thank you!")}
        </h1>

        {orderNumber && (
          <p
            className="text-center font-mono text-sm md:text-base text-muted-foreground mb-6"
            data-testid="success-order-number"
          >
            {t("Encomenda", "Order")}{" "}
            <span className="font-bold text-foreground">#{orderNumber}</span>
          </p>
        )}

        <div className="border border-border p-3 md:p-4 mb-8 mx-auto max-w-xl flex items-start gap-3">
          <Mail className="text-accent shrink-0 mt-0.5" size={20} />
          <p className="font-serif text-sm md:text-base leading-relaxed" data-testid="success-email-message">
            {customerEmail
              ? t(
                  `O teu pedido foi confirmado. Enviámos a confirmação para ${customerEmail}.`,
                  `Your order is confirmed. We sent the confirmation to ${customerEmail}.`,
                )
              : t(
                  "O teu pedido foi confirmado. Enviámos a confirmação por email.",
                  "Your order is confirmed. We sent the confirmation by email.",
                )}
          </p>
        </div>

        {items.length > 0 && (
          <div
            className="border border-border p-6 md:p-8 mb-6"
            data-testid="success-order-items"
          >
            <h2 className="font-courier font-bold text-base uppercase tracking-tight mb-4">
              {t("Resumo da encomenda", "Order summary")}
            </h2>
            <div className="divide-y divide-border">
              {items.map((item, idx) => {
                const title =
                  item.title_pt ||
                  item.title ||
                  item.title_en ||
                  item.name ||
                  item.product_title ||
                  "Produto";
                const qty = item.quantity || 1;
                const lineTotal = Number(
                  item.line_total ?? item.total ?? item.unit_price * qty ?? 0,
                );
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-start py-3 font-mono text-sm gap-4"
                  >
                    <div>
                      <p className="font-bold">
                        {qty}× {title}
                      </p>
                      {item.selected_options && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.entries(item.selected_options)
                            .filter(([, v]) => v)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="font-bold whitespace-nowrap">
                      €{lineTotal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border mt-4 pt-4 flex justify-between font-mono text-base">
              <span className="font-bold uppercase tracking-wide">
                {t("Total", "Total")}
              </span>
              <span
                className="font-bold text-accent"
                data-testid="success-order-total"
              >
                €{total.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {formatAddress(shippingAddress) && (
          <div className="border border-border p-6 md:p-8 mb-8">
            <h2 className="font-courier font-bold text-base uppercase tracking-tight mb-3">
              {t("Morada de envio", "Shipping address")}
            </h2>
            <p className="font-mono text-sm leading-relaxed whitespace-pre-line">
              {formatAddress(shippingAddress)}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-4 bg-accent text-accent-foreground hover:bg-foreground hover:text-background transition-all duration-300 uppercase tracking-widest text-xs font-bold"
            data-testid="continue-shopping-button"
          >
            {t("Continuar a comprar", "Continue shopping")}
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 border border-border hover:border-accent hover:text-accent transition-all duration-300 uppercase tracking-widest text-xs font-bold"
          >
            {t("Voltar ao inicio", "Back to home")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;
