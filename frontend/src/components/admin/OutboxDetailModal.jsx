import React from "react";
import { X, Loader, RotateCcw, Ban } from "lucide-react";
import {
  STATUS_LABEL_PT,
  STATUS_COLOR,
  KIND_LABEL_PT,
  formatDateTime,
  isRetryable,
  isCancellable,
} from "./outboxHelpers";

const Row = ({ label, children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 py-2 border-b border-gray-100 last:border-0">
    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
      {label}
    </span>
    <div className="text-sm text-gray-800 break-words">{children}</div>
  </div>
);

const OutboxDetailModal = ({
  item,
  loading,
  onClose,
  onRetry,
  onCancel,
  busyAction,
}) => {
  if (!item && !loading) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      data-testid="outbox-detail-modal"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-syne font-bold text-base">Detalhe do email</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-900"
            aria-label="Fechar"
            data-testid="outbox-detail-close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1">
          {loading || !item ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader className="animate-spin mr-2" size={18} /> A carregar…
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <Row label="ID">
                <code className="text-xs">{item.id}</code>
              </Row>
              <Row label="Estado">
                <span
                  className={`inline-block text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${STATUS_COLOR[item.status] || "bg-gray-200 text-gray-700"}`}
                >
                  {STATUS_LABEL_PT[item.status] || item.status}
                </span>
              </Row>
              <Row label="Tipo">
                {KIND_LABEL_PT[item?.context?.kind] ||
                  item?.context?.kind ||
                  "—"}
              </Row>
              <Row label="Para">
                {(item.to || []).join(", ") || "—"}
              </Row>
              {item.cc && item.cc.length > 0 && (
                <Row label="CC">{item.cc.join(", ")}</Row>
              )}
              {item.bcc && item.bcc.length > 0 && (
                <Row label="BCC">{item.bcc.join(", ")}</Row>
              )}
              {item.reply_to && <Row label="Reply-to">{item.reply_to}</Row>}
              <Row label="Assunto">{item.subject || "—"}</Row>
              <Row label="Tentativas">
                {item.attempts} / {item.max_attempts}
              </Row>
              <Row label="Criado">{formatDateTime(item.created_at)}</Row>
              {item.sent_at && (
                <Row label="Enviado">{formatDateTime(item.sent_at)}</Row>
              )}
              {item.next_attempt_at && item.status !== "sent" && (
                <Row label="Próx. tentativa">
                  {formatDateTime(item.next_attempt_at)}
                </Row>
              )}
              {item.last_error && (
                <Row label="Último erro">
                  <pre className="whitespace-pre-wrap text-xs bg-red-50 border border-red-200 text-red-700 rounded p-2 max-h-40 overflow-auto">
                    {item.last_error}
                  </pre>
                </Row>
              )}
              {Array.isArray(item.attachments) &&
                item.attachments.length > 0 && (
                  <Row label={`Anexos (${item.attachments.length})`}>
                    <ul className="space-y-1">
                      {item.attachments.map((a, i) => (
                        <li
                          key={`${a.filename || "attach"}-${a.size ?? i}`}
                          className="text-xs flex flex-wrap gap-2 items-baseline"
                        >
                          <span className="font-mono">{a.filename}</span>
                          <span className="text-gray-500">
                            ({a.content_type || "—"} ·{" "}
                            {a.size ? `${Math.round(a.size / 1024)} KB` : "?"})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Row>
                )}
              {item.body && (
                <Row label="Corpo">
                  <pre className="whitespace-pre-wrap text-xs bg-gray-50 border border-gray-200 rounded p-2 max-h-60 overflow-auto font-mono">
                    {item.body}
                  </pre>
                </Row>
              )}
              {item.context && (
                <Row label="Context">
                  <pre className="whitespace-pre-wrap text-xs bg-gray-50 border border-gray-200 rounded p-2 max-h-40 overflow-auto font-mono">
                    {JSON.stringify(item.context, null, 2)}
                  </pre>
                </Row>
              )}
            </div>
          )}
        </div>

        {item && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200">
            {isRetryable(item.status) && (
              <button
                type="button"
                onClick={() => onRetry?.(item.id)}
                disabled={busyAction === item.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                data-testid="outbox-detail-retry"
              >
                <RotateCcw size={14} /> Retentar
              </button>
            )}
            {isCancellable(item.status) && (
              <button
                type="button"
                onClick={() => onCancel?.(item.id)}
                disabled={busyAction === item.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-white transition-colors disabled:opacity-50"
                data-testid="outbox-detail-cancel"
              >
                <Ban size={14} /> Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-white"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutboxDetailModal;
