import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Reply, X, Paperclip, Loader } from "lucide-react";
import { adminReplyContact, formatApiError } from "@/services/api";

/**
 * Modal for replying to a contact message via email + optional attachments.
 *
 * The request goes out as multipart/form-data with field name `attachment`
 * (multi). The browser sets the Content-Type boundary — we never set it
 * manually.
 */
const ReplyModal = ({ contact, token, onClose, onSent }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const contactId = contact?.id || contact?._id;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Escreve uma mensagem antes de enviar.");
      return;
    }
    setSending(true);
    const t0 = performance.now();
    try {
      const resp = await adminReplyContact(token, contactId, {
        subject: subject.trim(),
        message: message.trim(),
        attachments,
      });
      // Dev-only: log server-side timings (build 2026-06-hardening onwards).
      // Useful to distinguish backend slowness from upload overhead.
      if (process.env.NODE_ENV !== "production" && resp?.timing_ms) {
        const totalClient = Math.round(performance.now() - t0);
        const { total = "?", parse = "?", enqueue = "?" } = resp.timing_ms;
        // eslint-disable-next-line no-console
        console.debug(
          `[reply timing] server total=${total}ms (parse=${parse}, enqueue=${enqueue}) · client=${totalClient}ms`,
        );
      }
      const success =
        resp?.success !== false && resp?.sent !== false;
      if (!success) {
        toast.error(
          "Não foi possível enviar o email — a resposta ficou guardada no histórico.",
        );
      } else {
        const attachInfo =
          resp?.attachments_count > 0
            ? ` (${resp.attachments_count} anexo(s))`
            : "";
        toast.success(`Resposta enviada${attachInfo}.`);
      }
      onSent?.();
    } catch (err) {
      toast.error(`Erro ao enviar resposta. ${formatApiError(err, "")}`.trim());
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      data-testid="reply-modal"
    >
      <div
        className="bg-white w-full max-w-xl rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="min-w-0">
            <h3 className="font-syne font-bold text-lg truncate">
              Responder a {contact.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">{contact.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-900 shrink-0"
            data-testid="reply-modal-close"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 space-y-4 overflow-y-auto flex-1"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Assunto
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Re: A sua mensagem para Love Letters"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              data-testid="reply-subject"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Mensagem
            </label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Escreva a sua resposta..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              data-testid="reply-message"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Anexos
            </label>
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm">
              <Paperclip size={16} />
              Adicionar ficheiros
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                data-testid="reply-attachments"
              />
            </label>
            {attachments.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-gray-700">
                {attachments.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 rounded px-2 py-1"
                  >
                    <span className="truncate mr-2">
                      {file.name}{" "}
                      <span className="text-gray-400">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
              data-testid="reply-submit"
            >
              {sending ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Reply size={16} />
              )}
              {sending ? "A enviar..." : "Enviar resposta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyModal;
