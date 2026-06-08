import React, { useState } from "react";
import { X, ChevronDown, ChevronUp, Check, AlertTriangle, MinusCircle, Clock } from "lucide-react";

// Tailwind classes for the per-step badge ("ok" | "fail" | "timeout" | "error" | "skipped").
const stepBadge = (value) => {
  switch (value) {
    case "ok":
      return { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Check };
    case "skipped":
      return { cls: "bg-gray-100 text-gray-600 border-gray-200", icon: MinusCircle };
    case "timeout":
      return { cls: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock };
    case "fail":
    case "error":
    default:
      return { cls: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle };
  }
};

const StepPill = ({ label, value }) => {
  const { cls, icon: Icon } = stepBadge(value);
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 border rounded ${cls}`}
      data-testid={`outbox-diag-step-${label.toLowerCase()}`}
    >
      <Icon size={16} className="shrink-0" />
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wider font-bold opacity-70">
          {label}
        </div>
        <div className="text-xs font-bold">
          {value || "—"}
        </div>
      </div>
    </div>
  );
};

const KeyVal = ({ k, v }) => (
  <div className="flex flex-wrap items-baseline gap-1 text-xs">
    <span className="text-gray-500 font-mono">{k}:</span>
    <span className="font-mono break-all">{v ?? "—"}</span>
  </div>
);

/**
 * Renders the structured /api/admin/email/diagnose payload.
 * Falls back to a raw JSON dump if the shape doesn't match.
 */
const DiagnoseResult = ({ result, onClose }) => {
  const [showRaw, setShowRaw] = useState(false);
  if (!result) return null;

  const ok = result.ok === true;
  const duration = result.duration_ms;
  const error = result.error;
  const errorType = result.error_type;

  // Best-effort shape detection: if connection field is missing, treat as raw.
  const hasShape = "connection" in result || "send" in result || "auth" in result;

  return (
    <div className="mb-4 border border-gray-200 rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
            data-testid="outbox-diag-overall"
          >
            {ok ? <Check size={12} /> : <AlertTriangle size={12} />}
            {ok ? "Sonda OK" : "Sonda falhou"}
          </span>
          {typeof duration === "number" && (
            <span className="text-xs text-gray-600 font-mono">
              {duration}ms
            </span>
          )}
          {result.transport && (
            <span className="text-xs text-gray-500">
              · {result.transport}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900"
          aria-label="Fechar diagnóstico"
          data-testid="outbox-diag-close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-3 space-y-3 bg-white" data-testid="outbox-diagnose-output">
        {hasShape && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <StepPill label="Connect" value={result.connection} />
              <StepPill label="Auth" value={result.auth} />
              <StepPill label="Send" value={result.send} />
            </div>

            {!ok && (error || errorType) && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-mono">
                <span className="font-bold">{errorType || "Erro"}:</span>{" "}
                {error || "sem detalhes"}
              </div>
            )}

            {(result.smtp_host || result.auth_user) && (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                  Configuração SMTP
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                  <KeyVal
                    k="host:port"
                    v={`${result.smtp_host || "?"}:${result.smtp_port ?? "?"}`}
                  />
                  <KeyVal
                    k="use_tls"
                    v={String(result.smtp_use_tls ?? "—")}
                  />
                  <KeyVal k="auth_user" v={result.auth_user} />
                  <KeyVal k="from_email" v={result.from_email} />
                  {result.password_present !== undefined && (
                    <KeyVal
                      k="password"
                      v={`${result.password_present ? "set" : "missing"} (len=${result.password_length ?? 0})`}
                    />
                  )}
                  {result.server_greeting && (
                    <div className="sm:col-span-2">
                      <KeyVal k="greeting" v={result.server_greeting} />
                    </div>
                  )}
                  {Array.isArray(result.auth_methods) &&
                    result.auth_methods.length > 0 && (
                      <div className="sm:col-span-2">
                        <KeyVal
                          k="auth_methods"
                          v={result.auth_methods.join(", ")}
                        />
                      </div>
                    )}
                </div>
              </div>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
          data-testid="outbox-diag-toggle-raw"
        >
          {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showRaw ? "Esconder JSON" : "Mostrar JSON completo"}
        </button>
        {showRaw && (
          <pre className="text-xs bg-gray-900 text-emerald-200 p-3 rounded overflow-auto max-h-72 font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default DiagnoseResult;
