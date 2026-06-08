import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  RefreshCw,
  Stethoscope,
  Mail,
  RotateCcw,
  Ban,
  Search,
  X,
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
} from "@/services/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import OutboxDetailModal from "./OutboxDetailModal";
import DiagnoseResult from "./DiagnoseResult";
import {
  STATUS_LABEL_PT,
  STATUS_COLOR,
  STATUS_PILL_COLOR,
  KIND_LABEL_PT,
  STATUS_OPTIONS,
  KIND_OPTIONS,
  formatDateTime,
  truncate,
  isRetryable,
  isCancellable,
} from "./outboxHelpers";

const POLL_MS = 30000;

const StatPill = ({ status, count }) => (
  <div
    className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white shadow-sm"
    data-testid={`outbox-stat-${status}`}
  >
    <span
      className={`inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold ${STATUS_PILL_COLOR[status] || "bg-gray-500 text-white"}`}
    >
      {count}
    </span>
    <span className="text-xs uppercase tracking-wider font-bold text-gray-700">
      {STATUS_LABEL_PT[status] || status}
    </span>
  </div>
);

const OutboxTab = ({ token }) => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ by_status: {}, total: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [search, setSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyAction, setBusyAction] = useState(null);

  const [confirmRetryAll, setConfirmRetryAll] = useState(false);
  const [diagOutput, setDiagOutput] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const pollRef = useRef(null);

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const params = { limit: 200 };
        if (statusFilter) params.status = statusFilter;
        if (kindFilter) params.kind = kindFilter;
        const [list, stat] = await Promise.all([
          adminGetOutbox(token, params),
          adminGetOutboxStats(token),
        ]);
        setItems(Array.isArray(list) ? list : []);
        setStats(stat || { by_status: {}, total: 0 });
      } catch (err) {
        if (!silent) toast.error("Erro a carregar outbox");
      } finally {
        if (!silent) setLoading(false);
        setRefreshing(false);
      }
    },
    [token, statusFilter, kindFilter],
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
    setSelectedItem({ id }); // open modal in loading state
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
    // Backend now guarantees a response in ≤15s (build 2026-06-hardening),
    // so 20s is a generous ceiling.
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

  // Client-side filter by recipient (server already filters by status/kind).
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

  const byStatus = stats?.by_status || {};

  return (
    <div data-testid="outbox-tab">
      {/* Stats pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {["sent", "pending", "failed", "cancelled"].map((s) => (
          <StatPill key={s} status={s} count={byStatus[s] || 0} />
        ))}
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

      {/* Actions row */}
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
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded bg-white"
          data-testid="outbox-filter-status"
        >
          <option value="">Estado: todos</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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

      {/* Diagnostic output (structured + raw fallback) */}
      {diagOutput && (
        <DiagnoseResult
          result={diagOutput}
          onClose={() => setDiagOutput(null)}
        />
      )}

      {/* Table */}
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
              {filteredItems.map((it) => (
                <tr
                  key={it.id}
                  onClick={() => openDetail(it.id)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  data-testid={`outbox-row-${it.id}`}
                >
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
                      {isRetryable(it.status) && (
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
                      {isCancellable(it.status) && (
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
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-gray-500 italic"
                  >
                    Sem emails para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
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
    </div>
  );
};

export default OutboxTab;
