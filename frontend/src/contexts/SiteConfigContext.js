import React, { createContext, useContext, useEffect, useState } from "react";
import { getSiteConfig } from "@/services/api";

// Safe defaults match the live backend. If /api/config fails (network or
// backend cold-start), the UI keeps working with these values instead of
// flashing empty / breaking the layout.
const DEFAULT_CONFIG = {
  currency: "EUR",
  free_shipping_threshold: 50,
  free_shipping_banner: "Envio gratuito na Europa em compras acima de 50€",
  shipping_note: "",
  contact_email: "hello@weloveloveletters.com",
};

const SiteConfigContext = createContext({
  config: DEFAULT_CONFIG,
  loaded: false,
});

export const useSiteConfig = () => useContext(SiteConfigContext);

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSiteConfig()
      .then((data) => {
        if (cancelled || !data || typeof data !== "object") return;
        setConfig({
          ...DEFAULT_CONFIG,
          ...data,
          free_shipping_threshold:
            Number(data.free_shipping_threshold) ||
            DEFAULT_CONFIG.free_shipping_threshold,
        });
      })
      .catch(() => {
        /* keep defaults */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loaded }}>
      {children}
    </SiteConfigContext.Provider>
  );
};
