import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Lightweight confirm dialog used instead of window.confirm() / alert().
 *
 * Usage:
 *   const [pending, setPending] = useState(null);
 *   <ConfirmDialog
 *     open={Boolean(pending)}
 *     title="Apagar produto"
 *     message="Tens a certeza?"
 *     onConfirm={() => { doIt(pending); setPending(null); }}
 *     onCancel={() => setPending(null)}
 *   />
 */
const ConfirmDialog = ({
  open,
  title = "Confirmar",
  message = "Tens a certeza?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
      data-testid="confirm-dialog"
    >
      <div
        className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 ${destructive ? "text-red-600" : "text-accent"}`}
            >
              <AlertTriangle size={20} />
            </span>
            <h3 className="font-syne font-bold text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-gray-500 hover:text-gray-900"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white"
            data-testid="confirm-cancel"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 text-sm rounded-md text-white ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-accent hover:bg-red-700"}`}
            data-testid="confirm-ok"
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
