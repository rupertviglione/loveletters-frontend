import React from "react";
import { useLocation } from "react-router-dom";
import { Truck } from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Routes where we *don't* want the free-shipping banner:
//   - /contact  (contact page is informational, not shopping)
//   - /shipping-returns (FAQ-ish, already mentions shipping)
//   - /admin/* (backoffice)
const HIDDEN_PATH_PREFIXES = ["/contact", "/shipping-returns", "/admin"];

export const isFreeShippingBannerVisible = (pathname = "") =>
  !HIDDEN_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

const FreeShippingBanner = () => {
  const { pathname } = useLocation();
  const { config } = useSiteConfig();
  const { language } = useLanguage();

  if (!isFreeShippingBannerVisible(pathname)) return null;

  const threshold = Number(config?.free_shipping_threshold) || 50;
  const ptMessage =
    config?.free_shipping_banner ||
    `Envio gratuito na Europa em compras acima de ${threshold}€`;
  const enMessage = `Free shipping in Europe on orders over €${threshold}`;
  const message = language === "pt" ? ptMessage : enMessage;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] bg-accent text-white"
      data-testid="free-shipping-banner"
    >
      <div className="flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] md:text-xs font-courier font-bold uppercase tracking-widest text-center">
        <Truck size={12} className="shrink-0 hidden sm:inline" aria-hidden />
        <span className="truncate">{message}</span>
      </div>
    </div>
  );
};

export default FreeShippingBanner;
