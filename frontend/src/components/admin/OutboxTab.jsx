import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  RefreshCw,
  Stethoscope,
  Mail,
  RotateCcw,
  Ban,
  Search,
  X,
  Trash2,
  Undo2,
  AlertTriangle,
} from "lucide-react";
import {
  adminGetOutbox,
  adminGetOutboxItem,
  adminGetOutboxStats,
  adminRetryOutbox,
  adminCancelOutbox,
  adminRetryAllOutbox,
  adminEmailDiagnose,
  adminEmailTest,
  adminBulkTrashOutbox,
  adminBulkRestoreOutbox,
  adminBulkDeleteOutbox,
  adminEmptyOutboxTrash,
  adminTrashOutbox,
  adminRestoreOutbox,
  adminDeleteOutbox,
  formatApiError,
} from "@/services/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import OutboxDetailModal from "./OutboxDetailModal";
import DiagnoseResult from "./DiagnoseResult";
import {
  STATUS_LABEL_PT,
  STATUS_COLOR,
  KIND_LABEL_PT,
  KIND_OPTIONS,
  formatDateTime,
  truncate,
  isRetryable,
  isCancellable,
} from "./outboxHelpers";

const POLL_MS = 30000;

// Tab definitions — order matters (display + ?status= mapping).
const TABS = [
  { key: "all", label: "Todos", status: null, trashed: false },
  { key: "pending", label: "Por enviar", status: "pending", trashed: false },
  { key: "sent", label: "Enviados", status: "sent", trashed: false },
  { key: "failed", label: "Falhados", status: "failed", trashed: false },
  { key: "cancelled", label: "Cancelados", status: "cancelled", trashed: false },
  { key: "trashed", label: "Lixeira", status: "trashed", trashed: true },
];

const OutboxTab = ({ token }) => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ by_status: {}, total: 0, trashed: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTabKey, setActiveTabKey] = useState("all");
  const [kindFilter, setKindFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [selectedItem, setSelectedItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyAction, setBusyAction] = useState(null);

  const [confirmRetryAll, setConfirmRetryAll] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { kind, ids?, message, label, destructive }
  const [diagOutput, setDiagOutput] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const pollRef = useRef(null);
  const activeTab = useMemo(
    () => TABS.find((t) => t.key === activeTabKey) || TABS[0],
    [activeTabKey],
  );
  const isTrashView = activeTab.trashed;

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const params = { limit: 200 };
        if (activeTab.status) params.status = activeTab.status;
        // For non-trash tabs, default hides trashed already (include_trashed=false).
        if (!activeTab.trashed) params.include_trashed = false;
        if (kindFilter) params.kind = kindFilter;
        const [list, stat] = await Promise.all([
          adminGetOutbox(token, params),
          adminGetOutboxStats(token),
        ]);
        setItems(Array.isArray(list) ? list : []);
        setStats(stat || { by_status: {}, total: 0, trashed: 0 });
        setSelectedIds(new Set());
      } catch (err) {
        if (!silent) toast.error("Erro a carregar outbox");
      } finally {
        if (!silent) setLoading(false);
        setRefreshing(false);
      }
    },
    [token, activeTab.status, activeTab.trashed, kindFilter],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh every 30s while tab is visible.
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchAll(true);
      }
    }, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [fetchAll]);

  const openDetail = async (id) => {
    setSelectedItem({ id });
    setDetailLoading(true);
    try {
      const full = await adminGetOutboxItem(token, id);
      setSelectedItem(full);
    } catch (err) {
      toast.error("Erro a obter detalhe");
      setSelectedItem(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRetry = async (id) => {
    setBusyAction(id);
    try {
      await adminRetryOutbox(token, id);
      toast.success("Email recolocado em fila.");
      await fetchAll(true);
      if (selectedItem?.id === id) {
        const full = await adminGetOutboxItem(token, id).catch(() => null);
        if (full) setSelectedItem(full);
      }
    } catch (err) {
      toast.error("Erro ao retentar");
    } finally {
      setBusyAction(null);
    }
  };

  const handleCancel = async (id) => {
    setBusyAction(id);
    try {
      await adminCancelOutbox(token, id);
      toast.success("Email cancelado.");
      await fetchAll(true);
      if (selectedItem?.id === id) {
        const full = await adminGetOutboxItem(token, id).catch(() => null);
        if (full) setSelectedItem(full);
      }
    } catch (err) {
      toast.error("Erro ao cancelar");
    } finally {
      setBusyAction(null);
    }
  };

  const handleRetryAll = async () => {
    setConfirmRetryAll(false);
    setBusyAction("retry-all");
    try {
      const res = await adminRetryAllOutbox(token);
      toast.success(`${res?.requeued ?? 0} email(s) re-filados.`);
      await fetchAll(true);
    } catch (err) {
      toast.error("Erro ao re-tentar todos");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDiagnose = async () => {
    setDiagLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await adminEmailDiagnose(token, { signal: controller.signal });
      setDiagOutput(res);
    } catch (err) {
      const aborted = err?.name === "AbortError";
      toast.error(
        aborted
          ? "Diagnóstico SMTP excedeu 20s — o backend não respondeu."
          : "Erro ao diagnosticar SMTP",
      );
      setDiagOutput({
        ok: false,
        connection: aborted ? "timeout" : "error",
        auth: "skipped",
        send: "skipped",
        error: aborted
          ? "Timeout (20s) — backend não respondeu"
          : err?.message || "erro",
        error_type: aborted ? "TimeoutError" : err?.name || "Error",
      });
    } finally {
      clearTimeout(timeout);
      setDiagLoading(false);
    }
  };

  const handleSendTest = async () => {
    setBusyAction("test-send");
    try {
      const res = await adminEmailTest(token);
      toast.success(
        res?.outbox_id
          ? `Email de teste em fila (${res.outbox_id}).`
          : "Email de teste em fila.",
      );
      await fetchAll(true);
    } catch (err) {
      toast.error("Erro ao enviar email de teste");
    } finally {
      setBusyAction(null);
    }
  };

  // Bulk handlers --------------------------------------------------------------
  const runBulk = async (op, ids) => {
    setBusyAction(`bulk-${op}`);
    try {
      let res;
      let verb = "";
      const singleId = Array.isArray(ids) && ids.length === 1 ? ids[0] : null;
      if (op === "trash") {
        res = singleId
          ? await adminTrashOutbox(token, singleId)
          : await adminBulkTrashOutbox(token, ids);
        verb = "movido(s) para a lixeira";
      } else if (op === "restore") {
        res = singleId
          ? await adminRestoreOutbox(token, singleId)
          : await adminBulkRestoreOutbox(token, ids);
        verb = "restaurado(s)";
      } else if (op === "delete") {
        res = singleId
          ? await adminDeleteOutbox(token, singleId)
          : await adminBulkDeleteOutbox(token, ids);
        verb = "eliminado(s) definitivamente";
      } else if (op === "empty") {
        res = await adminEmptyOutboxTrash(token);
        verb = "removido(s) da lixeira";
      }
      const n =
        res?.affected ??
        res?.modified ??
        res?.deleted ??
        res?.count ??
        (singleId ? 1 : ids?.length) ??
        0;
      toast.success(`${n} email(s) ${verb}.`);
      await fetchAll(true);
    } catch (err) {
      toast.error(formatApiError(err, "Erro a executar acção em massa"));
    } finally {
      setBusyAction(null);
      setConfirmAction(null);
    }
  };

  // Client-side filter by recipient + search.
  const filteredItems = items.filter((it) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const haystack = [
      ...(it.to || []),
      ...(it.cc || []),
      ...(it.bcc || []),
      it.subject || "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const visibleIds = filteredItems.map((it) => it.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;
  const selectedCount = selectedIds.size;

  const toggleAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const byStatus = stats?.by_status || {};
  const trashedCount = Number(stats?.trashed || 0);
  const tabCount = (tab) => {
    if (tab.key === "all") {
      // total excludes trashed
      return Number(
        (stats?.total || 0) -
          (tab.trashed ? 0 : 0) /* total already excludes trashed in backend */,
      );
    }
    if (tab.trashed) return trashedCount;
    return Number(byStatus[tab.status] || 0);
  };

  return (
    <div data-testid="outbox-tab">
      {/* Tabs --------------------------------------------------------------- */}
      <div
        className="flex flex-wrap items-center gap-1 mb-4 border-b border-gray-200 -mx-2 px-2"
        data-testid="outbox-tabs"
      >
        {TABS.map((tab) => {
          const count = tabCount(tab);
          const isActive = activeTabKey === tab.key;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTabKey(tab.key)}
              className={`relative px-3 py-2 text-xs uppercase tracking-wider font-bold transition-colors border-b-2 -mb-px ${
                isActive
                  ? "text-accent border-accent"
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
              data-testid={`outbox-tab-${tab.key}`}
            >
              <span className="inline-flex items-center gap-2">
                {tab.label}
                {count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-accent text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    data-testid={`outbox-tab-count-${tab.key}`}
                  >
                    {count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchAll(false)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
            data-testid="outbox-refresh"
            title="Refrescar"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />{" "}
            Refrescar
          </button>
        </div>
      </div>

      {/* Action row --------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={handleDiagnose}
          disabled={diagLoading}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          data-testid="outbox-diagnose"
        >
          <Stethoscope size={14} /> Diagnosticar SMTP
        </button>
        <button
          type="button"
          onClick={handleSendTest}
          disabled={busyAction === "test-send"}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          data-testid="outbox-send-test"
        >
          <Mail size={14} /> Enviar email de teste
        </button>
        <button
          type="button"
          onClick={() => setConfirmRetryAll(true)}
          disabled={busyAction === "retry-all"}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-white rounded hover:bg-red-700 disabled:opacity-50"
          data-testid="outbox-retry-all"
        >
          <RotateCcw size={14} /> Re-tentar todos os falhados
        </button>
        {isTrashView && trashedCount > 0 && (
          <button
            type="button"
            onClick={() =>
              setConfirmAction({
                kind: "empty",
                message: `Vais ESVAZIAR a lixeira por completo. ${trashedCount} email(s) serão eliminados definitivamente. Esta acção não pode ser desfeita.`,
                label: "Esvaziar lixeira",
                destructive: true,
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50"
            data-testid="outbox-empty-trash"
          >
            <AlertTriangle size={14} /> Esvaziar lixeira ({trashedCount})
          </button>
        )}
      </div>

      {/* Filters ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        <select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded bg-white"
          data-testid="outbox-filter-kind"
        >
          <option value="">Tipo: todos</option>
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar destinatário / assunto…"
            className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded bg-white"
            data-testid="outbox-search"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Limpar pesquisa"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Diagnostic output -------------------------------------------------- */}
      {diagOutput && (
        <DiagnoseResult
          result={diagOutput}
          onClose={() => setDiagOutput(null)}
        />
      )}

      {/* Bulk toolbar (sticky top) ----------------------------------------- */}
      {selectedCount > 0 && (
        <div
          className="sticky top-0 z-20 mb-3 flex flex-wrap items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-300 rounded-md shadow-sm"
          data-testid="outbox-bulk-toolbar"
        >
          <span className="text-xs font-bold text-amber-900">
            {selectedCount} selecionado(s)
          </span>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-gray-600 hover:text-gray-900 underline"
            data-testid="outbox-bulk-clear"
          >
            Limpar selecção
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {!isTrashView && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    kind: "trash",
                    ids: Array.from(selectedIds),
                    message: `Mover ${selectedCount} email(s) para a lixeira? Podes restaurar depois.`,
                    label: "Mover para a lixeira",
                    destructive: false,
                  })
                }
                disabled={busyAction != null}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-800 text-white rounded hover:bg-zinc-900 disabled:opacity-50"
                data-testid="outbox-bulk-trash"
              >
                <Trash2 size={14} /> Mover para a lixeira
              </button>
            )}
            {isTrashView && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      kind: "restore",
                      ids: Array.from(selectedIds),
                      message: `Restaurar ${selectedCount} email(s) para o estado anterior?`,
                      label: "Restaurar",
                      destructive: false,
                    })
                  }
                  disabled={busyAction != null}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                  data-testid="outbox-bulk-restore"
                >
                  <Undo2 size={14} /> Restaurar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      kind: "delete",
                      ids: Array.from(selectedIds),
                      message: `Eliminar DEFINITIVAMENTE ${selectedCount} email(s)? Esta acção não pode ser desfeita.`,
                      label: "Eliminar definitivamente",
                      destructive: true,
                    })
                  }
                  disabled={busyAction != null}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50"
                  data-testid="outbox-bulk-delete"
                >
                  <AlertTriangle size={14} /> Eliminar definitivamente
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table -------------------------------------------------------------- */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600">A carregar…</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-600">
                <th className="px-3 py-2 w-8">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someVisibleSelected;
                    }}
                    onChange={toggleAllVisible}
                    disabled={visibleIds.length === 0}
                    aria-label="Selecionar todos visíveis"
                    data-testid="outbox-select-all"
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2 font-semibold whitespace-nowrap">
                  Quando
                </th>
                <th className="px-3 py-2 font-semibold">Para</th>
                <th className="px-3 py-2 font-semibold">Assunto</th>
                <th className="px-3 py-2 font-semibold whitespace-nowrap">
                  Tipo
                </th>
                <th className="px-3 py-2 font-semibold whitespace-nowrap">
                  Estado
                </th>
                <th className="px-3 py-2 font-semibold whitespace-nowrap">
                  Tent.
                </th>
                <th className="px-3 py-2 font-semibold">Último erro</th>
                <th className="px-3 py-2 font-semibold whitespace-nowrap">
                  Acções
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((it) => {
                const isSelected = selectedIds.has(it.id);
                return (
                  <tr
                    key={it.id}
                    onClick={() => openDetail(it.id)}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      isSelected ? "bg-amber-50/50" : ""
                    }`}
                    data-testid={`outbox-row-${it.id}`}
                  >
                    <td
                      className="px-3 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(it.id)}
                        aria-label={`Selecionar ${it.id}`}
                        data-testid={`outbox-select-${it.id}`}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                      {formatDateTime(it.created_at)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {(it.to || []).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span title={it.subject}>{truncate(it.subject, 50)}</span>
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {KIND_LABEL_PT[it?.context?.kind] ||
                        it?.context?.kind ||
                        "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${STATUS_COLOR[it.status] || "bg-gray-200 text-gray-700"}`}
                      >
                        {STATUS_LABEL_PT[it.status] || it.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {it.attempts}/{it.max_attempts}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-red-600 max-w-[220px]"
                      title={it.last_error || ""}
                    >
                      {truncate(it.last_error || "", 60)}
                    </td>
                    <td
                      className="px-3 py-2 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1">
                        {!isTrashView && isRetryable(it.status) && (
                          <button
                            type="button"
                            onClick={() => handleRetry(it.id)}
                            disabled={busyAction === it.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-accent text-white rounded hover:bg-red-700 disabled:opacity-50"
                            title="Retentar"
                            data-testid={`outbox-retry-${it.id}`}
                          >
                            <RotateCcw size={12} />
                          </button>
                        )}
                        {!isTrashView && isCancellable(it.status) && (
                          <button
                            type="button"
                            onClick={() => handleCancel(it.id)}
                            disabled={busyAction === it.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            title="Cancelar"
                            data-testid={`outbox-cancel-${it.id}`}
                          >
                            <Ban size={12} />
                          </button>
                        )}
                        {!isTrashView && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                kind: "trash",
                                ids: [it.id],
                                message:
                                  "Mover este email para a lixeira? Podes restaurar depois.",
                                label: "Mover para a lixeira",
                                destructive: false,
                              })
                            }
                            disabled={busyAction != null}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
                            title="Mover para a lixeira"
                            data-testid={`outbox-trash-${it.id}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        {isTrashView && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({
                                  kind: "restore",
                                  ids: [it.id],
                                  message:
                                    "Restaurar este email para o estado anterior?",
                                  label: "Restaurar",
                                  destructive: false,
                                })
                              }
                              disabled={busyAction != null}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                              title="Restaurar"
                              data-testid={`outbox-restore-${it.id}`}
                            >
                              <Undo2 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({
                                  kind: "delete",
                                  ids: [it.id],
                                  message:
                                    "Eliminar este email DEFINITIVAMENTE? Esta acção não pode ser desfeita.",
                                  label: "Eliminar definitivamente",
                                  destructive: true,
                                })
                              }
                              disabled={busyAction != null}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50"
                              title="Eliminar definitivamente"
                              data-testid={`outbox-delete-${it.id}`}
                            >
                              <AlertTriangle size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-8 text-gray-500 italic"
                  >
                    {isTrashView
                      ? "A lixeira está vazia."
                      : "Sem emails para mostrar."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal ------------------------------------------------------- */}
      {selectedItem && (
        <OutboxDetailModal
          item={selectedItem.subject ? selectedItem : null}
          loading={detailLoading}
          onClose={() => setSelectedItem(null)}
          onRetry={handleRetry}
          onCancel={handleCancel}
          busyAction={busyAction}
        />
      )}

      <ConfirmDialog
        open={confirmRetryAll}
        title="Re-tentar todos os falhados"
        message={
          `Tem a certeza? Vai re-tentar enviar todos os emails ` +
          `em estado FAILED e PENDING. ` +
          `(${(byStatus.failed || 0) + (byStatus.pending || 0)} email(s) afectados.)`
        }
        confirmLabel="Re-tentar"
        destructive={false}
        onConfirm={handleRetryAll}
        onCancel={() => setConfirmRetryAll(false)}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.label || "Confirmar"}
        message={confirmAction?.message || ""}
        confirmLabel={confirmAction?.label || "Confirmar"}
        destructive={confirmAction?.destructive !== false}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.kind === "empty") {
            runBulk("empty");
          } else {
            runBulk(confirmAction.kind, confirmAction.ids || []);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default OutboxTab;
