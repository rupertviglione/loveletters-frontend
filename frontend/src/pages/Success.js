import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCheckoutStatus, logApiError } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle, Loader, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CONTACT_EMAIL = "hello@weloveloveletters.com";

const Success = () => {
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [orderData, setOrderData] = useState(null);
  const [emailWarning, setEmailWarning] = useState(false);
  const sessionId = searchParams.get("session_id");
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      navigate("/cart");
      return;
    }

    let attempts = 0;
    const maxAttempts = 8;
    let timeoutId;

    const checkPaymentStatus = async () => {
      try {
        const checkoutStatus = await getCheckoutStatus(sessionId);

        if (checkoutStatus?.payment_status === "paid") {
          if (
            checkoutStatus?.email_error ||
            checkoutStatus?.email_sent === false
          ) {
            setEmailWarning(true);
            logApiError({
              method: "GET",
              url: `${API}/checkout/status/${sessionId}`,
              data: checkoutStatus,
              error: new Error(
                "Payment confirmed, but backend reported an email delivery problem",
              ),
            });
          }
          setStatus("success");
          setOrderData(checkoutStatus);
          if (!clearedRef.current) {
            clearCart();
            clearedRef.current = true;
          }
        } else if (checkoutStatus?.status === "expired") {
          setStatus("error");
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            timeoutId = setTimeout(checkPaymentStatus, 2000);
          } else {
            setStatus("timeout");
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        attempts++;
        if (attempts < maxAttempts) {
          timeoutId = setTimeout(checkPaymentStatus, 2000);
        } else {
          setStatus("error");
        }
      }
    };

    checkPaymentStatus();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionId, navigate, clearCart]);

  if (status === "checking") {
    return (
      <div
        className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center px-4"
        data-testid="success-checking"
      >
        <Loader className="animate-spin text-accent mb-6" size={48} />
        <p className="font-serif text-xl text-muted-foreground italic">
          {t("A verificar pagamento...", "Checking payment...")}
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
          {t("Pagamento pendente", "Payment pending")}
        </h1>
        <p className="font-serif text-lg text-muted-foreground mb-8 text-center max-w-2xl">
          {t(
            "O pagamento esta a ser processado. Recebera um email de confirmacao quando estiver concluido. Se tiver duvidas, contacte-nos.",
            "Payment is being processed. You will receive a confirmation email when complete. If you have questions, contact us.",
          )}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              window.location.href = `mailto:${CONTACT_EMAIL}`;
            }}
            className="px-8 py-4 bg-accent text-accent-foreground hover:bg-foreground hover:text-background transition-all duration-300 uppercase tracking-widest text-xs font-bold"
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
            "Ocorreu um erro ao verificar o pagamento. Por favor, contacte-nos se o problema persistir.",
            "An error occurred while verifying payment. Please contact us if the problem persists.",
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

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="success-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-4 py-12 md:py-24 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <CheckCircle className="mx-auto text-accent" size={72} />
        </motion.div>

        <h1 className="font-syne font-extrabold text-3xl md:text-5xl tracking-tight uppercase mb-6">
          {t("Obrigado!", "Thank you!")}
        </h1>

        <p className="font-serif text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
          {emailWarning
            ? t(
                "O seu pedido foi confirmado com sucesso. Não conseguimos confirmar o envio do email, mas a encomenda ficou registada. Se precisar, contacte-nos.",
                "Your order has been confirmed successfully. We could not confirm email delivery, but the order is registered. Contact us if needed.",
              )
            : t(
                "O seu pedido foi confirmado com sucesso. Receberá um email de confirmação em breve.",
                "Your order has been confirmed successfully. You will receive a confirmation email shortly.",
              )}
        </p>

        {orderData?.metadata && (
          <div className="border border-border p-6 md:p-8 mb-8 text-left max-w-md mx-auto">
            <h2 className="font-courier font-bold text-base uppercase tracking-tight mb-4">
              {t("Detalhes do pedido", "Order details")}
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <p>
                <span className="text-muted-foreground">
                  {t("Nome:", "Name:")}
                </span>{" "}
                <span className="font-bold">
                  {orderData.metadata.customer_name}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-bold">
                  {orderData.metadata.customer_email}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t("Total:", "Total:")}
                </span>{" "}
                <span className="font-bold text-accent">
                  {(orderData.amount_total / 100).toFixed(2)}€
                </span>
              </p>
            </div>
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
