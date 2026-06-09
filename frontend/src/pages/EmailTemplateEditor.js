import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  Eye,
  Loader,
  Copy,
  Code as CodeIcon,
  FileText as FileTextIcon,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  adminGetEmailTemplate,
  adminSaveEmailTemplate,
  adminResetEmailTemplate,
  adminPreviewEmailTemplate,
  adminSendTestEmailTemplate,
  formatApiError,
} from "@/services/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import RichTextEditor from "@/components/admin/RichTextEditor";

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

const TabBtn = ({ active, onClick, icon, label, testId }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold border-b-2 -mb-px transition-colors ${
      active
        ? "text-accent border-accent"
        : "text-gray-500 border-transparent hover:text-gray-800"
    }`}
    data-testid={testId}
  >
    {icon}
    {label}
  </button>
);

const EmailTemplateEditor = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null); // 'preview' | 'send-test' | 'reset'
  const [template, setTemplate] = useState(null);

  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [textBody, setTextBody] = useState("");
  const [editorTab, setEditorTab] = useState("html"); // 'subject' | 'html' | 'text'
  const [sourceMode, setSourceMode] = useState(false);
  const [previewTab, setPreviewTab] = useState("html"); // 'html' | 'text'
  const [previewData, setPreviewData] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [dirty, setDirty] = useState(false);

  const editorRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
    }
  }, [token, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetEmailTemplate(token, key);
      setTemplate(data);
      setSubject(data?.subject || "");
      setHtmlBody(data?.html_body || "");
      setTextBody(data?.text_body || "");
      setDirty(false);
    } catch (err) {
      toast.error(formatApiError(err, "Erro a carregar template."));
    } finally {
      setLoading(false);
    }
  }, [token, key]);

  useEffect(() => {
    load();
  }, [load]);

  const markDirty = () => {
    if (!dirty) setDirty(true);
  };

  const onSubjectChange = (v) => {
    setSubject(v);
    markDirty();
  };
  const onHtmlChange = (v) => {
    setHtmlBody(v);
    markDirty();
  };
  const onTextChange = (v) => {
    setTextBody(v);
    markDirty();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminSaveEmailTemplate(token, key, {
        subject,
        html_body: htmlBody,
        text_body: textBody,
      });
      setTemplate((prev) => ({ ...(prev || {}), ...(res || {}), has_custom: true }));
      setDirty(false);
      toast.success("Template guardado.");
    } catch (err) {
      toast.error(formatApiError(err, "Erro ao guardar template (verifica a sintaxe Jinja2)."));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setBusy("preview");
    try {
      const res = await adminPreviewEmailTemplate(token, key, {
        subject,
        html_body: htmlBody,
        text_body: textBody,
      });
      setPreviewData(res);
      toast.success("Pré-visualização actualizada.");
    } catch (err) {
      toast.error(formatApiError(err, "Erro a gerar pré-visualização."));
    } finally {
      setBusy(null);
    }
  };

  const handleSendTest = async () => {
    setBusy("send-test");
    try {
      const res = await adminSendTestEmailTemplate(token, key, {
        subject,
        html_body: htmlBody,
        text_body: textBody,
      });
      toast.success(
        res?.outbox_id
          ? `Email de teste em fila (${res.outbox_id}).`
          : "Email de teste em fila.",
      );
    } catch (err) {
      toast.error(formatApiError(err, "Erro a enviar email de teste."));
    } finally {
      setBusy(null);
    }
  };

  const handleReset = async () => {
    setConfirmReset(false);
    setBusy("reset");
    try {
      await adminResetEmailTemplate(token, key);
      toast.success("Template repôs o conteúdo padrão.");
      await load();
    } catch (err) {
      toast.error(formatApiError(err, "Erro ao repor default."));
    } finally {
      setBusy(null);
    }
  };

  const insertPlaceholder = (placeholder) => {
    if (editorTab === "subject") {
      const el = document.querySelector('[data-testid="emails-editor-subject"]');
      if (el && document.activeElement === el) {
        const start = el.selectionStart ?? subject.length;
        const end = el.selectionEnd ?? subject.length;
        const next = subject.slice(0, start) + placeholder + subject.slice(end);
        onSubjectChange(next);
        requestAnimationFrame(() => {
          el.focus();
          const pos = start + placeholder.length;
          el.setSelectionRange(pos, pos);
        });
      } else {
        onSubjectChange((subject || "") + placeholder);
      }
    } else if (editorTab === "text") {
      const el = document.querySelector('[data-testid="emails-editor-text"]');
      if (el && document.activeElement === el) {
        const start = el.selectionStart ?? textBody.length;
        const end = el.selectionEnd ?? textBody.length;
        const next = textBody.slice(0, start) + placeholder + textBody.slice(end);
        onTextChange(next);
        requestAnimationFrame(() => {
          el.focus();
          const pos = start + placeholder.length;
          el.setSelectionRange(pos, pos);
        });
      } else {
        onTextChange((textBody || "") + placeholder);
      }
    } else {
      editorRef.current?.insertText(placeholder);
      markDirty();
    }
  };

  const copyPlaceholder = async (placeholder) => {
    try {
      await navigator.clipboard.writeText(placeholder);
      toast.success(`Copiado: ${placeholder}`);
    } catch {
      // fallback — just try to insert
      insertPlaceholder(placeholder);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-accent"
              data-testid="emails-editor-back"
            >
              <ArrowLeft size={16} /> Voltar ao backoffice
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg sm:text-xl font-syne font-bold truncate">
              {template?.name || `Template: ${key}`}
            </h1>
            {template?.has_custom ? (
              <span
                className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200"
                data-testid="emails-editor-status-custom"
              >
                Personalizado
              </span>
            ) : (
              <span
                className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200"
                data-testid="emails-editor-status-default"
              >
                Default
              </span>
            )}
            <div className="ml-auto text-xs text-gray-500">
              {template?.has_custom && template?.updated_at
                ? `Editado em ${formatDateTime(template.updated_at)}`
                : null}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-16">
            <Loader className="inline-block animate-spin text-accent" size={28} />
            <p className="mt-4 text-gray-600">A carregar template…</p>
          </div>
        ) : template ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div>
              {template?.description && (
                <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <span>{template.description}</span>
                </div>
              )}

              {/* Editor card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  <TabBtn
                    active={editorTab === "subject"}
                    onClick={() => setEditorTab("subject")}
                    icon={<FileTextIcon size={14} />}
                    label="Assunto"
                    testId="emails-editor-tab-subject"
                  />
                  <TabBtn
                    active={editorTab === "html"}
                    onClick={() => setEditorTab("html")}
                    icon={<CodeIcon size={14} />}
                    label="HTML"
                    testId="emails-editor-tab-html"
                  />
                  <TabBtn
                    active={editorTab === "text"}
                    onClick={() => setEditorTab("text")}
                    icon={<FileTextIcon size={14} />}
                    label="Texto simples"
                    testId="emails-editor-tab-text"
                  />
                </div>
                <div className="p-4">
                  {editorTab === "subject" && (
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 mb-2">
                        Assunto do email
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => onSubjectChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        placeholder="Ex: Confirmação da encomenda {{ order_number }}"
                        data-testid="emails-editor-subject"
                      />
                      <p className="text-[11px] text-gray-500 mt-2">
                        Suporta Jinja2: <code>{"{{ order_number }}"}</code>,{" "}
                        <code>{"{{ customer_name }}"}</code>, etc.
                      </p>
                    </div>
                  )}
                  {editorTab === "html" && (
                    <RichTextEditor
                      ref={editorRef}
                      value={htmlBody}
                      onChange={onHtmlChange}
                      sourceMode={sourceMode}
                      onToggleSource={() => setSourceMode((s) => !s)}
                      onWarning={(msg) => toast(msg, { icon: "⚠️" })}
                    />
                  )}
                  {editorTab === "text" && (
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 mb-2">
                        Versão em texto simples (fallback)
                      </label>
                      <textarea
                        value={textBody}
                        onChange={(e) => onTextChange(e.target.value)}
                        spellCheck
                        rows={14}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                        placeholder="Versão texto-puro (usada por clientes que não renderizam HTML)."
                        data-testid="emails-editor-text"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Preview card */}
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center border-b border-gray-200 px-3 py-2 gap-2 flex-wrap">
                  <Eye size={14} className="text-gray-500" />
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-600">
                    Pré-visualização
                  </span>
                  <div className="inline-flex border border-gray-200 rounded overflow-hidden ml-2">
                    <button
                      type="button"
                      onClick={() => setPreviewTab("html")}
                      className={`px-2 py-1 text-[11px] uppercase ${
                        previewTab === "html"
                          ? "bg-accent text-white"
                          : "bg-white text-gray-600"
                      }`}
                      data-testid="emails-preview-tab-html"
                    >
                      HTML
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("text")}
                      className={`px-2 py-1 text-[11px] uppercase border-l border-gray-200 ${
                        previewTab === "text"
                          ? "bg-accent text-white"
                          : "bg-white text-gray-600"
                      }`}
                      data-testid="emails-preview-tab-text"
                    >
                      Texto
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={busy === "preview"}
                    className="ml-auto inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
                    data-testid="emails-preview-refresh"
                  >
                    {busy === "preview" ? (
                      <Loader size={12} className="animate-spin" />
                    ) : (
                      <RotateCcw size={12} />
                    )}{" "}
                    Atualizar preview
                  </button>
                </div>
                <div className="p-3">
                  {previewData ? (
                    <>
                      <div className="mb-2 text-xs text-gray-600">
                        <span className="font-bold">Assunto:</span>{" "}
                        {previewData?.subject || "—"}
                      </div>
                      {previewTab === "html" ? (
                        <iframe
                          title="email-preview"
                          sandbox=""
                          srcDoc={previewData?.html_body || "<p>(vazio)</p>"}
                          className="w-full min-h-[400px] border border-gray-200 rounded bg-white"
                          data-testid="emails-preview-iframe"
                        />
                      ) : (
                        <pre
                          className="w-full min-h-[200px] p-3 border border-gray-200 rounded bg-gray-50 text-xs font-mono whitespace-pre-wrap text-gray-800"
                          data-testid="emails-preview-text"
                        >
                          {previewData?.text_body || "(vazio)"}
                        </pre>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic px-2 py-6 text-center">
                      Clica em <b>Atualizar preview</b> para ver o resultado renderizado com dados de exemplo.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 px-3 py-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>
                  Imagens inline base64 podem aumentar o tamanho do email e
                  alguns clientes (ex: Outlook Desktop) podem não as mostrar
                  inline. Recomendamos imagens &lt; 200KB.
                </span>
              </div>
            </div>

            {/* Sidebar: placeholders */}
            <aside className="lg:sticky lg:top-4 lg:self-start">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-3 py-2 border-b border-gray-200">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-600">
                    Placeholders disponíveis
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Clica para inserir no cursor.
                  </p>
                </div>
                <ul className="p-2 max-h-[500px] overflow-y-auto space-y-1">
                  {(template?.variables || []).map((v) => {
                    const ph = `{{ ${v} }}`;
                    return (
                      <li
                        key={v}
                        className="flex items-center justify-between gap-1 hover:bg-gray-50 rounded p-1.5"
                      >
                        <button
                          type="button"
                          onClick={() => insertPlaceholder(ph)}
                          className="flex-1 text-left text-xs font-mono text-gray-800 truncate hover:text-accent"
                          title={`Inserir ${ph}`}
                          data-testid={`emails-placeholder-${v}`}
                        >
                          {ph}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyPlaceholder(ph)}
                          className="p-1 text-gray-400 hover:text-gray-900"
                          title="Copiar"
                          aria-label="Copiar"
                        >
                          <Copy size={12} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-gray-100 px-3 py-2 text-[11px] text-gray-600 bg-gray-50">
                  <p className="font-semibold mb-1">Jinja2:</p>
                  <code className="block">{"{% for item in items %}"}</code>
                  <code className="block">- {"{{ item.title }}"}</code>
                  <code className="block">{"{% endfor %}"}</code>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic py-12">
            Template não encontrado.
          </p>
        )}

        {/* Footer actions */}
        {template && (
          <div
            className="sticky bottom-0 mt-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
            data-testid="emails-editor-footer"
          >
            <div className="flex flex-wrap items-center gap-2 max-w-7xl mx-auto">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-accent text-white rounded hover:bg-red-700 disabled:opacity-50"
                data-testid="emails-editor-save"
              >
                {saving ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Guardar
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                disabled={busy === "send-test"}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                data-testid="emails-editor-send-test"
              >
                {busy === "send-test" ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Enviar teste para hello@…
              </button>
              <span className="ml-auto" />
              {template.has_custom && (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  disabled={busy === "reset"}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                  data-testid="emails-editor-reset"
                >
                  <RotateCcw size={14} /> Repor default
                </button>
              )}
              {dirty && (
                <span
                  className="text-xs text-amber-700 self-center"
                  data-testid="emails-editor-dirty"
                >
                  • Alterações por guardar
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Repor template padrão"
        message="Vais descartar a versão personalizada deste template e voltar ao texto padrão da loja. Esta acção não pode ser desfeita."
        confirmLabel="Repor default"
        destructive
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};

export default EmailTemplateEditor;
