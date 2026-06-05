import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Reply, Archive, ArchiveRestore } from "lucide-react";
import {
  adminGetContacts,
  adminGetArchivedContacts,
  adminArchiveContact,
  adminUnarchiveContact,
  adminDeleteContact,
  adminMarkContactRead,
} from "@/services/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import ReplyModal from "./ReplyModal";
import { getRecordId, isUnread } from "./constants";

const POLL_MS = 25000;

const ContactsTab = ({ token, onCountsChange }) => {
  const [view, setView] = useState("active");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const pollRef = useRef(null);

  const fetchContacts = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data =
          view === "archived"
            ? await adminGetArchivedContacts(token)
            : await adminGetContacts(token);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.contacts)
            ? data.contacts
            : [];
        setContacts(list);
      } catch (err) {
        if (!silent) {
          toast.error("Erro a carregar mensagens");
          setContacts([]);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, view],
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Auto-refresh while tab is visible
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchContacts(true);
      }
    }, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [fetchContacts]);

  const handleClick = async (contact) => {
    const contactId = getRecordId(contact);
    if (!isUnread(contact) || !contactId) return;
    try {
      await adminMarkContactRead(token, contactId);
      setContacts((prev) =>
        prev.map((c) =>
          getRecordId(c) === contactId
            ? { ...c, seen_by_admin: true, read: true }
            : c,
        ),
      );
      onCountsChange?.();
    } catch {
      /* ignore */
    }
  };

  const handleArchive = async (contactId) => {
    try {
      await adminArchiveContact(token, contactId);
      setContacts((prev) => prev.filter((c) => getRecordId(c) !== contactId));
      onCountsChange?.();
      toast.success("Mensagem arquivada.");
    } catch (err) {
      toast.error("Erro ao arquivar mensagem");
    }
  };

  const handleUnarchive = async (contactId) => {
    try {
      await adminUnarchiveContact(token, contactId);
      setContacts((prev) => prev.filter((c) => getRecordId(c) !== contactId));
      onCountsChange?.();
      toast.success("Mensagem desarquivada.");
    } catch (err) {
      toast.error("Erro ao desarquivar mensagem");
    }
  };

  const confirmDelete = async () => {
    const id = pendingDelete?.id;
    setPendingDelete(null);
    if (!id) return;
    try {
      await adminDeleteContact(token, id);
      setContacts((prev) => prev.filter((c) => getRecordId(c) !== id));
      onCountsChange?.();
      toast.success("Mensagem apagada.");
    } catch (err) {
      toast.error("Erro ao apagar mensagem");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-syne font-bold">
          Mensagens ({contacts.length})
        </h2>
        <div
          className="inline-flex border border-gray-200 rounded-md overflow-hidden self-start"
          data-testid="contacts-view-switcher"
        >
          <button
            type="button"
            onClick={() => setView("active")}
            className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-colors ${
              view === "active"
                ? "bg-accent text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            data-testid="contacts-tab-active"
          >
            Activas
          </button>
          <button
            type="button"
            onClick={() => setView("archived")}
            className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold border-l border-gray-200 transition-colors ${
              view === "archived"
                ? "bg-accent text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            data-testid="contacts-tab-archived"
          >
            Arquivadas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600">A carregar...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => {
            const contactId = getRecordId(contact);
            const replies = Array.isArray(contact.replies)
              ? contact.replies
              : [];
            return (
              <div
                key={contactId}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${isUnread(contact) ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
                onClick={() => handleClick(contact)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold flex items-center gap-2">
                      <span className="truncate">{contact.name}</span>
                      {isUnread(contact) && (
                        <span className="text-[10px] uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded shrink-0">
                          novo
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {contact.email}
                    </p>
                    <p className="mt-3 text-gray-700 whitespace-pre-line">
                      {contact.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {contact.created_at
                        ? new Date(contact.created_at).toLocaleString("pt-PT")
                        : "Sem data"}
                    </p>

                    {replies.length > 0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Respostas enviadas ({replies.length})
                        </p>
                        {replies.map((reply, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-gray-600 bg-gray-50 rounded p-2"
                          >
                            <p className="font-semibold">
                              {reply.subject || "Sem assunto"}
                            </p>
                            <p className="whitespace-pre-line mt-1">
                              {reply.message || reply.body}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {reply.sent_at || reply.created_at
                                ? new Date(
                                    reply.sent_at || reply.created_at,
                                  ).toLocaleString("pt-PT")
                                : ""}
                              {Array.isArray(reply.attachments) &&
                              reply.attachments.length > 0
                                ? ` · ${reply.attachments.length} anexo(s)`
                                : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 sm:ml-2 shrink-0 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyTarget(contact);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent text-white rounded hover:bg-red-700 transition-colors"
                      title="Responder por email"
                      data-testid={`contact-reply-${contactId || ""}`}
                    >
                      <Reply size={14} /> Responder
                    </button>
                    {view === "active" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(contactId);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        title="Arquivar"
                        data-testid={`contact-archive-${contactId || ""}`}
                      >
                        <Archive size={14} /> Arquivar
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchive(contactId);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        title="Desarquivar"
                        data-testid={`contact-unarchive-${contactId || ""}`}
                      >
                        <ArchiveRestore size={14} /> Desarquivar
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete({
                          id: contactId,
                          name: contact.name,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} /> Apagar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {contacts.length === 0 && (
            <p className="text-gray-500 italic">
              {view === "archived"
                ? "Sem mensagens arquivadas."
                : "Sem mensagens para mostrar."}
            </p>
          )}
        </div>
      )}

      {replyTarget && (
        <ReplyModal
          contact={replyTarget}
          token={token}
          onClose={() => setReplyTarget(null)}
          onSent={() => {
            setReplyTarget(null);
            fetchContacts(true);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Apagar mensagem"
        message={`Tens a certeza que queres APAGAR a mensagem de "${pendingDelete?.name || ""}"? Esta acção é definitiva.`}
        confirmLabel="Apagar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default ContactsTab;
