import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { RotateCcw, Loader, Mail, ArrowRight } from "lucide-react";
import {
  adminListEmailTemplates,
  adminPreviewEmailTemplate,
  formatApiError,
} from "@/services/api";

const formatDateTime = (iso) => {
  if (!iso) return null;
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

/**
 * EmailsTab — landing for the 3 email templates. Each card shows:
 *  - friendly name + description
 *  - "Personalizado" / "Original" pill
 *  - live thumbnail of the rendered email (small iframe scaled with CSS)
 *  - last edit timestamp if customised
 */
const EmailsTab = ({ token }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState({}); // key -> html
  const [thumbErrors, setThumbErrors] = useState({}); // key -> bool

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListEmailTemplates(token);
      const list = Array.isArray(data) ? data : data?.templates || [];
      setTemplates(list);
      // Trigger thumbnail rendering for each (in parallel, non-blocking).
      list.forEach(async (t) => {
        try {
          const res = await adminPreviewEmailTemplate(token, t.key, {
            subject: t.subject,
            html_body: t.html_body,
            text_body: t.text_body,
          });
          setThumbnails((prev) => ({ ...prev, [t.key]: res?.html_body || "" }));
        } catch {
          setThumbErrors((prev) => ({ ...prev, [t.key]: true }));
        }
      });
    } catch (err) {
      toast.error(formatApiError(err, "Erro a carregar templates."));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div data-testid="emails-tab">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h2 className="text-xl font-syne font-bold text-[#2b2b2b]">
            Emails automáticos
          </h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Personaliza o texto e o aspecto dos emails que a loja envia
            automaticamente aos clientes. Clica num cartão para editar.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAll}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
          data-testid="emails-refresh"
        >
          <RotateCcw size={14} /> Refrescar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader className="inline-block animate-spin text-[#7a2e2e]" size={28} />
          <p className="mt-4 text-gray-600">A carregar templates…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {templates.map((tpl) => {
            const html = thumbnails[tpl.key];
            const errored = thumbErrors[tpl.key];
            return (
              <button
                type="button"
                key={tpl.key}
                onClick={() => navigate(`/admin/emails/${tpl.key}`)}
                className="group text-left bg-white border border-[#ece6dc] rounded-lg overflow-hidden hover:border-[#7a2e2e] hover:shadow-md transition-all flex flex-col"
                data-testid={`email-template-card-${tpl.key}`}
              >
                {/* Thumbnail */}
                <div className="relative bg-[#faf7f2] border-b border-[#ece6dc] h-52 overflow-hidden">
                  {errored ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 italic">
                      Pré-visualização indisponível
                    </div>
                  ) : html ? (
                    <iframe
                      title={`thumb-${tpl.key}`}
                      sandbox=""
                      srcDoc={html}
                      style={{
                        width: "200%",
                        height: "200%",
                        border: 0,
                        transform: "scale(0.5)",
                        transformOrigin: "top left",
                        pointerEvents: "none",
                      }}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader className="animate-spin text-gray-300" size={20} />
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                      tpl.has_custom
                        ? "bg-[#7a2e2e] text-white"
                        : "bg-white text-gray-700 border border-gray-300"
                    }`}
                    data-testid={
                      tpl.has_custom
                        ? `email-template-pill-custom-${tpl.key}`
                        : `email-template-pill-default-${tpl.key}`
                    }
                  >
                    {tpl.has_custom ? "Personalizado" : "Original"}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start gap-2 mb-1">
                    <Mail className="text-[#7a2e2e] mt-0.5 shrink-0" size={16} />
                    <h3 className="font-syne font-bold text-base leading-tight">
                      {tpl.name}
                    </h3>
                  </div>
                  {tpl.description && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {tpl.description}
                    </p>
                  )}
                  <div className="mt-auto pt-3 border-t border-[#ece6dc] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 truncate">
                      {tpl.has_custom && tpl.updated_at
                        ? `Editado em ${formatDateTime(tpl.updated_at)}`
                        : "Texto original"}
                    </span>
                    <span className="text-[11px] font-semibold text-[#7a2e2e] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Editar
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {templates.length === 0 && (
            <p className="text-gray-500 italic col-span-full">
              Sem templates disponíveis.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailsTab;
