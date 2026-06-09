import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Pencil, RotateCcw, FileText, Loader } from "lucide-react";
import { adminListEmailTemplates, formatApiError } from "@/services/api";

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

const Pill = ({ custom }) => (
  <span
    className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
      custom
        ? "bg-amber-100 text-amber-800 border border-amber-200"
        : "bg-gray-100 text-gray-700 border border-gray-200"
    }`}
    data-testid={custom ? "email-template-pill-custom" : "email-template-pill-default"}
  >
    {custom ? "Personalizado" : "Default"}
  </span>
);

const EmailsTab = ({ token }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListEmailTemplates(token);
      const list = Array.isArray(data) ? data : data?.templates || [];
      setTemplates(list);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-syne font-bold">Emails automáticos</h2>
          <p className="text-sm text-gray-600 mt-1">
            Personaliza o conteúdo dos emails que a loja envia automaticamente.
            Suporta variáveis Jinja2 (ex: <code className="text-xs">{"{{ order_number }}"}</code>).
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
        <div className="text-center py-12">
          <Loader className="inline-block animate-spin text-accent" size={24} />
          <p className="mt-4 text-gray-600">A carregar templates…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.key}
              className="border border-gray-200 rounded-lg p-5 bg-white hover:border-accent transition-colors flex flex-col"
              data-testid={`email-template-card-${tpl.key}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="text-accent" size={18} />
                  <h3 className="font-syne font-bold text-base">{tpl.name}</h3>
                </div>
                <Pill custom={tpl.has_custom} />
              </div>
              {tpl.description && (
                <p className="text-sm text-gray-600 mb-3">{tpl.description}</p>
              )}
              <div className="text-xs text-gray-500 mb-3">
                <span className="font-semibold uppercase tracking-wider">
                  Assunto actual:
                </span>{" "}
                <span className="text-gray-800">{tpl.subject || "—"}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {(tpl.variables || []).slice(0, 6).map((v) => (
                  <code
                    key={v}
                    className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 border border-gray-200"
                  >
                    {`{{ ${v} }}`}
                  </code>
                ))}
                {(tpl.variables || []).length > 6 && (
                  <span className="text-[10px] text-gray-500 self-center">
                    +{(tpl.variables || []).length - 6} mais
                  </span>
                )}
              </div>
              <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  {tpl.has_custom && tpl.updated_at
                    ? `Editado em ${formatDateTime(tpl.updated_at)}`
                    : "A usar versão padrão"}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/emails/${tpl.key}`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-white rounded hover:bg-red-700"
                  data-testid={`email-template-edit-${tpl.key}`}
                >
                  <Pencil size={12} /> Editar
                </button>
              </div>
            </div>
          ))}
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
