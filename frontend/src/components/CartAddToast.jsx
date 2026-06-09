import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

const VISIBLE_MS = 4500;

/**
 * Discrete "added to cart" feedback toast.
 *  - Desktop: anchored top-right.
 *  - Mobile: bottom-sheet (full-width), swipe-down to dismiss.
 *  - Auto-dismisses after VISIBLE_MS. If a new product is added while still
 *    visible, content is REPLACED (not stacked) — we re-key on `lastAdded.seq`.
 *  - role="status" so AT announces the addition; focus is NOT moved here.
 *  - Slide-in 200ms, fade-out 300ms (per spec).
 */
const CartAddToast = () => {
  const { lastAdded, dismissLastAdded, getItemCount } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!lastAdded) return undefined;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dismissLastAdded();
    }, VISIBLE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastAdded, dismissLastAdded]);

  const onGoToCart = () => {
    dismissLastAdded();
    navigate("/cart");
  };

  const itemCount = getItemCount();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto sm:justify-end"
      aria-live="polite"
      aria-atomic="true"
      data-testid="cart-toast-region"
    >
      <AnimatePresence>
        {lastAdded && (
          <motion.div
            key={lastAdded.seq}
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 200 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 500) {
                dismissLastAdded();
              }
            }}
            className="pointer-events-auto w-full sm:max-w-[380px] sm:rounded-md sm:shadow-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.10)] bg-white border-t sm:border border-[#ece6dc] sm:border-[#d6d4cf] overflow-hidden font-mono"
            data-testid="cart-toast"
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-1.5 pb-0.5">
              <span className="block w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="flex items-start gap-3 p-3 sm:p-4">
              {/* Thumbnail */}
              {lastAdded.image ? (
                <img
                  src={lastAdded.image}
                  alt=""
                  className="w-10 h-10 rounded object-cover shrink-0 bg-[#faf7f2]"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-[#faf7f2] shrink-0" />
              )}

              {/* Lines */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-serif font-bold text-[13px] leading-tight text-[#2b2b2b] truncate"
                  title={lastAdded.title}
                  data-testid="cart-toast-title"
                >
                  {lastAdded.title}
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1">
                  <Check size={11} className="text-emerald-600 shrink-0" />
                  {t("Adicionado ao carrinho", "Added to cart")}
                  <span className="text-gray-400">·</span>
                  <span data-testid="cart-toast-count">
                    {itemCount} {itemCount === 1 ? t("item", "item") : t("items", "items")}
                  </span>
                </p>
                {lastAdded.variant && (lastAdded.variant.size || lastAdded.variant.color) && (
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                    {[lastAdded.variant.size, lastAdded.variant.color]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              {/* Close (desktop only — mobile uses swipe-down) */}
              <button
                type="button"
                onClick={dismissLastAdded}
                className="hidden sm:inline-flex shrink-0 -mr-1 -mt-1 p-1 text-gray-400 hover:text-gray-700 rounded"
                aria-label={t("Dispensar", "Dismiss")}
                data-testid="cart-toast-dismiss"
              >
                <X size={14} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex border-t border-[#ece6dc]">
              <button
                type="button"
                onClick={dismissLastAdded}
                className="flex-1 px-3 py-2.5 text-[11px] uppercase tracking-wider text-gray-700 hover:bg-gray-50 font-bold"
                data-testid="cart-toast-continue"
              >
                {t("Continuar a comprar", "Continue shopping")}
              </button>
              <button
                type="button"
                onClick={onGoToCart}
                className="flex-1 px-3 py-2.5 text-[11px] uppercase tracking-wider bg-[#7a2e2e] text-white hover:bg-[#5e2222] font-bold"
                data-testid="cart-toast-go"
              >
                {t("Ir para o carrinho", "Go to cart")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartAddToast;
