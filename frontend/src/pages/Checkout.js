import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCheckoutSession, logApiError } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CONTACT_EMAIL = "hello@weloveloveletters.com";
const SHIPPING_NOTE =
  "Envio gratuito para Portugal. Envio para países da CEE: 5€. Compras fora da Europa, contactar hello@weloveloveletters.com.";
const SHIPPING_NOTE_PREFIX =
  "Envio gratuito para Portugal. Envio para países da CEE: 5€. Compras fora da Europa, contactar ";

const SHIPPING_COUNTRIES = [
  { code: "PT", label: "Portugal", shipping: 0 },
  { code: "AT", label: "Áustria", shipping: 5 },
  { code: "BE", label: "Bélgica", shipping: 5 },
  { code: "BG", label: "Bulgária", shipping: 5 },
  { code: "HR", label: "Croácia", shipping: 5 },
  { code: "CY", label: "Chipre", shipping: 5 },
  { code: "CZ", label: "Chéquia", shipping: 5 },
  { code: "DK", label: "Dinamarca", shipping: 5 },
  { code: "EE", label: "Estónia", shipping: 5 },
  { code: "FI", label: "Finlândia", shipping: 5 },
  { code: "FR", label: "França", shipping: 5 },
  { code: "DE", label: "Alemanha", shipping: 5 },
  { code: "GR", label: "Grécia", shipping: 5 },
  { code: "HU", label: "Hungria", shipping: 5 },
  { code: "IE", label: "Irlanda", shipping: 5 },
  { code: "IT", label: "Itália", shipping: 5 },
  { code: "LV", label: "Letónia", shipping: 5 },
  { code: "LT", label: "Lituânia", shipping: 5 },
  { code: "LU", label: "Luxemburgo", shipping: 5 },
  { code: "MT", label: "Malta", shipping: 5 },
  { code: "NL", label: "Países Baixos", shipping: 5 },
  { code: "PL", label: "Polónia", shipping: 5 },
  { code: "RO", label: "Roménia", shipping: 5 },
  { code: "SK", label: "Eslováquia", shipping: 5 },
  { code: "SI", label: "Eslovénia", shipping: 5 },
  { code: "ES", label: "Espanha", shipping: 5 },
  { code: "SE", label: "Suécia", shipping: 5 },
];

const Checkout = () => {
  const { t } = useLanguage();
  const { items, getTotal } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    city: "",
    shipping_country: "PT",
    phone: "",
  });

  const selectedCountry = useMemo(
    () =>
      SHIPPING_COUNTRIES.find(
        (country) => country.code === formData.shipping_country,
      ) || SHIPPING_COUNTRIES[0],
    [formData.shipping_country],
  );
  const shippingCost = selectedCountry.shipping;
  const totalWithShipping = getTotal() + shippingCost;

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submittingRef.current || loading) return;
    submittingRef.current = true;
    setError("");

    try {
      setLoading(true);

      const checkoutItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        selected_options: item.variant || {},
      }));

      const originUrl = window.location.origin;
      const checkoutData = await createCheckoutSession({
        items: checkoutItems,
        customer_email: formData.email,
        customer_name: formData.name,
        customer_phone: formData.phone,
        shipping_country: formData.shipping_country,
        shippingCountry: formData.shipping_country,
        shipping_address: {
          line1: formData.address_line1,
          line2: formData.address_line2,
          postal_code: formData.postal_code,
          city: formData.city,
          country: formData.shipping_country,
        },
        success_url: `${originUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${originUrl}/checkout`,
      });

      if (checkoutData?.email_error || checkoutData?.email_sent === false) {
        logApiError({
          method: "POST",
          url: `${API}/checkout/session`,
          data: checkoutData,
          error: new Error(
            "Checkout created, but backend reported an email delivery problem",
          ),
        });
      }

      const redirectUrl = checkoutData?.url || checkoutData?.checkout_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      throw new Error("Checkout response missing redirect URL");
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError(
        t(
          "Erro ao processar pagamento. Tente novamente.",
          "Error processing payment. Please try again.",
        ),
      );
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32" data-testid="checkout-page">
      <div className="border-b border-border py-6 md:py-10 px-4 md:px-8 lg:px-12">
        <h1 className="font-syne font-extrabold text-3xl md:text-5xl tracking-tight uppercase">
          {t("Finalizar compra", "Checkout")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border border-t border-border">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-background p-6 md:p-12"
        >
          <h2 className="font-courier font-bold text-xl uppercase tracking-tight mb-8">
            {t("Contacto e morada de envio", "Contact and shipping address")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-courier font-bold text-xs uppercase tracking-wider block mb-2">
                {t("Nome completo", "Full name")}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                disabled={loading}
                data-testid="checkout-name"
              />
            </div>

            <div>
              <label className="font-courier font-bold text-xs uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                disabled={loading}
                data-testid="checkout-email"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-courier font-bold text-sm uppercase tracking-tight mb-4">
                {t("Morada de envio", "Shipping address")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 font-serif">
                {t(
                  SHIPPING_NOTE_PREFIX,
                  "Free shipping to Portugal. Shipping to EEC/EU countries: €5. Purchases outside Europe, contact ",
                )}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-accent underline"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
              <div className="space-y-6">
                <div>
                  <label className="font-courier font-bold text-xs uppercase tracking-wider block mb-2">
                    {t("Morada", "Address")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address_line1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address_line1: e.target.value,
                      })
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                    disabled={loading}
                    data-testid="checkout-address-line1"
                  />
                </div>

                <div>
                  <label className="font-courier font-bold text-xs uppercase tracking-wider block mb-2">
                    {t(
                      "Apartamento, porta, etc. (opcional)",
                      "Apartment, door, etc. (optional)",
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address_line2: e.target.value,
                      })
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                    disabled={loading}
                    data-testid="checkout-address-line2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-courier font-bold text-xs uppercase tracking-wider block mb-2">
                      {t("Código postal", "Postal code")}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postal_code: e.target.value,
                        })
                      }
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                      disabled={loading}
                      data-testid="checkout-postal-code"
                    />
                  </div>

                  <div>
                    <label className="font-courier font-bold text-xs uppercase tracking-wider block mb-2">
                      {t("Cidade", "City")}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                      disabled={loading}
                      data-testid="checkout-city"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-courier font-bold text-xs uppercase tracking-wider block mb-2">
                      {t("País de envio", "Shipping country")}
                    </label>
                    <select
                      required
                      value={formData.shipping_country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping_country: e.target.value,
                        })
                      }
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                      disabled={loading}
                      data-testid="checkout-shipping-country"
                    >
                      {SHIPPING_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-courier font-bold text-xs uppercase tracking-wider block mb-2">
                      {t("Telefone (opcional)", "Phone (optional)")}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-input focus:border-accent focus:outline-none font-mono transition-colors"
                      disabled={loading}
                      data-testid="checkout-phone"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div
                className="p-4 border border-destructive/50 bg-destructive/5 text-destructive text-sm font-mono"
                data-testid="checkout-error"
              >
                {error}
              </div>
            )}

            <div className="pt-6">
              <p className="text-sm text-muted-foreground mb-4 font-serif">
                {t(
                  "Será redirecionado para o Stripe para finalizar o pagamento de forma segura.",
                  "You will be redirected to Stripe to securely complete your payment.",
                )}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-accent text-accent-foreground border border-accent hover:bg-foreground hover:border-foreground hover:text-background transition-all duration-300 uppercase tracking-widest text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:border-accent disabled:hover:text-accent-foreground flex items-center justify-center gap-3"
                data-testid="proceed-payment-button"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                {loading
                  ? t("A processar...", "Processing...")
                  : t("Prosseguir para pagamento", "Proceed to payment")}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-background p-6 md:p-12 border-l border-border"
        >
          <h2 className="font-courier font-bold text-xl uppercase tracking-tight mb-8">
            {t("Resumo do pedido", "Order summary")}
          </h2>

          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <div
                key={item.itemId}
                className="flex gap-4 pb-4 border-b border-border"
              >
                <div className="w-16 h-16 flex-shrink-0 bg-muted overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-serif font-bold text-sm">{item.title}</p>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground">
                      {item.variant.size && item.variant.size}
                      {item.variant.size && item.variant.color && " | "}
                      {item.variant.color && item.variant.color}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("Qtd", "Qty")}: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm">
                    {(item.price * item.quantity).toFixed(2)}€
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-border">
            <div className="flex justify-between">
              <span className="font-mono text-sm uppercase tracking-wider">
                {t("Subtotal", "Subtotal")}
              </span>
              <span className="font-mono font-bold">
                {getTotal().toFixed(2)}€
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span className="font-mono text-sm uppercase tracking-wider">
                {t("Envio", "Shipping")} ({selectedCountry.label})
              </span>
              <span className="font-mono font-bold">
                {shippingCost === 0
                  ? t("Grátis", "Free")
                  : `${shippingCost.toFixed(2)}€`}
              </span>
            </div>

            <p className="text-xs text-muted-foreground font-serif leading-relaxed">
              {t(
                SHIPPING_NOTE,
                "Free shipping to Portugal. Shipping to EEC/EU countries: €5. Purchases outside Europe, contact hello@weloveloveletters.com.",
              )}
            </p>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-courier font-bold text-xl uppercase tracking-tight">
                Total
              </span>
              <span className="font-mono font-bold text-2xl text-accent">
                {totalWithShipping.toFixed(2)}€
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
