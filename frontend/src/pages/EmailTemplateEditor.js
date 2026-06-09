import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  Loader,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List as ListIcon,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  X as XIcon,
  AlertTriangle,
  Plus,
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
import JinjaVariable from "@/components/admin/JinjaVariable";
import JinjaBlock from "@/components/admin/JinjaBlock";
import { friendlyName, htmlWithPills, cleanHtmlForSave } from "@/components/admin/jinjaVars";

const IMG_WARN_BYTES = 200 * 1024;
const IMG_HARD_LIMIT = 1024 * 1024;
const PREVIEW_DEBOUNCE_MS = 500;

const ToolbarBtn = ({ active, onClick, title, testId, children, disabled }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    data-testid={testId}
    className={`inline-flex items-center justify-center w-8 h-8 rounded transition-colors ${
      active
        ? "bg-[#7a2e2e] text-white"
        : "text-gray-700 hover:bg-gray-100"
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const EmailTemplateEditor = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null); // 'send-test' | 'reset'
  const [template, setTemplate] = useState(null);

  const [subject, setSubject] = useState("");
  const [textBody, setTextBody] = useState("");
  // The raw HTML (canonical, with `{{ }}` / `{% %}`) — this is what we save.
  const [htmlBody, setHtmlBody] = useState("");
  // Holds preview output from /preview endpoint.
  const [previewResult, setPreviewResult] = useState({
    subject: "",
    html_body: "",
    text_body: "",
  });
  const [previewError, setPreviewError] = useState(null);
  const [previewing, setPreviewing] = useState(false);

  const [codeOpen, setCodeOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const fileInputRef = useRef(null);
  const previewTimerRef = useRef(null);
  // Snapshot of the originally-loaded values — used to compute the dirty flag.
  const loadedRef = useRef({ subject: "", html_body: "", text_body: "" });

  // Dirty = any field diverges from what was last loaded/saved.
  const dirty =
    subject !== loadedRef.current.subject ||
    htmlBody !== loadedRef.current.html_body ||
    textBody !== loadedRef.current.text_body;

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  // -------------------------------------------------------------------------
  // Tiptap editor with custom Jinja nodes
  // -------------------------------------------------------------------------
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        code: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({
        placeholder: "Escreve aqui o conteúdo do email…",
      }),
      JinjaVariable,
      JinjaBlock,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "email-editor-surface",
        "data-testid": "email-editor-surface",
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length && files[0].type.startsWith("image/")) {
          event.preventDefault();
          handleImageFile(files[0]);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      const raw = cleanHtmlForSave(e.getHTML());
      setHtmlBody(raw);
    },
  });

  // -------------------------------------------------------------------------
  // Initial load
  // -------------------------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetEmailTemplate(token, key);
      setTemplate(data);
      const nextSubject = data?.subject || "";
      const nextText = data?.text_body || "";
      const nextHtml = data?.html_body || "";
      setSubject(nextSubject);
      setTextBody(nextText);
      setHtmlBody(nextHtml);
      loadedRef.current = {
        subject: nextSubject,
        html_body: nextHtml,
        text_body: nextText,
      };
      if (editor) {
        editor.commands.setContent(htmlWithPills(nextHtml), false);
      }
    } catch (err) {
      toast.error(formatApiError(err, "Erro a carregar template."));
    } finally {
      setLoading(false);
    }
  }, [token, key, editor]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, key]);

  // -------------------------------------------------------------------------
  // Live preview (debounced)
  // -------------------------------------------------------------------------
  const refreshPreview = useCallback(async () => {
    setPreviewing(true);
    setPreviewError(null);
    try {
      const res = await adminPreviewEmailTemplate(token, key, {
        subject,
        html_body: htmlBody,
        text_body: textBody,
      });
      setPreviewResult({
        subject: res?.subject || "",
        html_body: res?.html_body || "",
        text_body: res?.text_body || "",
      });
    } catch (err) {
      const apiDetail = err?.data?.detail;
      setPreviewError(
        (typeof apiDetail === "string" && apiDetail) ||
          formatApiError(err, "Erro a renderizar pré-visualização."),
      );
    } finally {
      setPreviewing(false);
    }
  }, [token, key, subject, htmlBody, textBody]);

  useEffect(() => {
    if (!template) return undefined;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      refreshPreview();
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [subject, htmlBody, textBody, template, refreshPreview]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    if (previewError) {
      toast.error("Corrige os erros indicados na pré-visualização antes de guardar.");
      return;
    }
    setSaving(true);
    try {
      const res = await adminSaveEmailTemplate(token, key, {
        subject,
        html_body: htmlBody,
        text_body: textBody,
      });
      setTemplate((prev) => ({ ...(prev || {}), ...(res || {}), has_custom: true }));
      // Update the snapshot so the dirty indicator clears.
      loadedRef.current = {
        subject,
        html_body: htmlBody,
        text_body: textBody,
      };
      toast.success("Alterações guardadas.");
    } catch (err) {
      const apiDetail = err?.data?.detail;
      const message =
        (typeof apiDetail === "string" && apiDetail) ||
        formatApiError(err, "Erro ao guardar template.");
      toast.error(message, { duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setBusy("send-test");
    try {
      await adminSendTestEmailTemplate(token, key, {
        subject,
        html_body: htmlBody,
        text_body: textBody,
      });
      toast.success(
        "Teste enviado para hello@weloveloveletters.com — verifica a tua caixa de entrada.",
        { duration: 5000 },
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
      toast.success("Texto original reposto.");
      await load();
    } catch (err) {
      toast.error(formatApiError(err, "Erro a repor texto original."));
    } finally {
      setBusy(null);
    }
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  // -------------------------------------------------------------------------
  // Toolbar handlers
  // -------------------------------------------------------------------------
  const onBold = () => editor?.chain().focus().toggleBold().run();
  const onItalic = () => editor?.chain().focus().toggleItalic().run();
  const onBullet = () => editor?.chain().focus().toggleBulletList().run();
  const onOrdered = () => editor?.chain().focus().toggleOrderedList().run();

  const onLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link")?.href || "";
    // eslint-disable-next-line no-alert
    const url = window.prompt("URL do link:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const onImageClick = () => fileInputRef.current?.click();

  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas.");
      return;
    }
    if (file.size > IMG_HARD_LIMIT) {
      toast.error(`Imagem demasiado grande (${Math.round(file.size / 1024)} KB). Máximo 1 MB.`);
      return;
    }
    if (file.size > IMG_WARN_BYTES) {
      toast(
        `Esta imagem é grande (${Math.round(file.size / 1024)} KB). Emails > 1MB podem ser truncados por alguns serviços. Considera reduzir o tamanho.`,
        { icon: "⚠️", duration: 6000 },
      );
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") return;
      editor?.chain().focus().setImage({ src: dataUrl }).run();
    };
    reader.readAsDataURL(file);
  };

  const onImageFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    handleImageFile(file);
  };

  // -------------------------------------------------------------------------
  // Insert variable pill from sidebar
  // -------------------------------------------------------------------------
  const insertVariable = (varName) => {
    editor?.chain().focus().insertJinjaVariable(varName).run();
  };

  // -------------------------------------------------------------------------
  // Code drawer — keep textareas in sync with WYSIWYG
  // -------------------------------------------------------------------------
  const onCodeHtmlChange = (e) => {
    setHtmlBody(e.target.value);
  };
  const onCodeHtmlBlur = () => {
    // When user closes/blurs the code editor, push the raw HTML back into Tiptap
    // so the WYSIWYG re-renders the new pills/blocks.
    if (editor) {
      editor.commands.setContent(htmlWithPills(htmlBody), false);
    }
  };

  const onCodeTextChange = (e) => {
    setTextBody(e.target.value);
  };

  const closeCodeDrawer = () => {
    onCodeHtmlBlur();
    setCodeOpen(false);
  };

  const variables = useMemo(() => template?.variables || [], [template]);

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <div className="bg-white border-b border-[#ece6dc]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#7a2e2e]"
              data-testid="emails-editor-back"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-base sm:text-lg font-syne font-bold truncate text-[#2b2b2b]">
              {template?.name || "Template de email"}
            </h1>
            {template?.has_custom ? (
              <span
                className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#7a2e2e] text-white"
                data-testid="emails-editor-status-custom"
              >
                Personalizado
              </span>
            ) : (
              <span
                className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200"
                data-testid="emails-editor-status-default"
              >
                Original
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCodeOpen((s) => !s)}
                className={`inline-flex items-center justify-center w-9 h-9 rounded border transition-colors ${
                  codeOpen
                    ? "bg-[#7a2e2e] text-white border-[#7a2e2e]"
                    : "bg-white text-gray-500 border-gray-300 hover:text-[#7a2e2e]"
                }`}
                title="Editar código HTML (avançado)"
                aria-label="Editar código HTML (avançado)"
                data-testid="emails-editor-toggle-code"
              >
                <CodeIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-16">
            <Loader className="inline-block animate-spin text-[#7a2e2e]" size={28} />
            <p className="mt-4 text-gray-600">A carregar template…</p>
          </div>
        ) : template ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-6">
            {/* ---------------- LEFT: editor + variables ---------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
              <div>
                {/* Subject */}
                <input
                  type="text"
                  value={subject}
                  onChange={handleSubjectChange}
                  placeholder="Assunto do email"
                  className="w-full text-xl sm:text-2xl font-syne font-bold bg-transparent border-0 border-b border-[#ece6dc] focus:outline-none focus:border-[#7a2e2e] py-2 mb-3 placeholder:text-gray-400"
                  data-testid="emails-editor-subject"
                />

                {/* Toolbar */}
                <div className="flex items-center gap-1 bg-white border border-[#ece6dc] border-b-0 rounded-t-md px-2 py-1.5">
                  <ToolbarBtn
                    title="Negrito"
                    testId="emails-toolbar-bold"
                    active={editor?.isActive("bold")}
                    onClick={onBold}
                    disabled={!editor}
                  >
                    <BoldIcon size={16} />
                  </ToolbarBtn>
                  <ToolbarBtn
                    title="Itálico"
                    testId="emails-toolbar-italic"
                    active={editor?.isActive("italic")}
                    onClick={onItalic}
                    disabled={!editor}
                  >
                    <ItalicIcon size={16} />
                  </ToolbarBtn>
                  <span className="w-px h-5 bg-gray-200 mx-1" />
                  <ToolbarBtn
                    title="Lista"
                    testId="emails-toolbar-bullet"
                    active={editor?.isActive("bulletList")}
                    onClick={onBullet}
                    disabled={!editor}
                  >
                    <ListIcon size={16} />
                  </ToolbarBtn>
                  <ToolbarBtn
                    title="Lista numerada"
                    testId="emails-toolbar-ordered"
                    active={editor?.isActive("orderedList")}
                    onClick={onOrdered}
                    disabled={!editor}
                  >
                    <ListOrdered size={16} />
                  </ToolbarBtn>
                  <span className="w-px h-5 bg-gray-200 mx-1" />
                  <ToolbarBtn
                    title="Inserir link"
                    testId="emails-toolbar-link"
                    active={editor?.isActive("link")}
                    onClick={onLink}
                    disabled={!editor}
                  >
                    <LinkIcon size={16} />
                  </ToolbarBtn>
                  <ToolbarBtn
                    title="Inserir imagem"
                    testId="emails-toolbar-image"
                    onClick={onImageClick}
                    disabled={!editor}
                  >
                    <ImageIcon size={16} />
                  </ToolbarBtn>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onImageFile}
                    className="hidden"
                  />
                </div>

                {/* Editor surface */}
                <div className="bg-white border border-[#ece6dc] rounded-b-md p-1">
                  <EditorContent editor={editor} />
                </div>
              </div>

              {/* Variables sidebar */}
              <aside className="lg:sticky lg:top-4 lg:self-start">
                <div className="bg-white rounded-md border border-[#ece6dc] p-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Plus size={14} /> Variáveis
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                    Clica para inserir no cursor. São substituídas pelos valores reais quando o email é enviado.
                  </p>
                  <ul className="space-y-1.5">
                    {variables.map((v) => (
                      <li key={v}>
                        <button
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="w-full text-left inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#e7efff] text-[#1d4ed8] border border-[#c7d7fa] text-xs font-semibold hover:bg-[#d8e4fd] transition-colors"
                          data-testid={`emails-variable-${v}`}
                        >
                          <Plus size={11} />
                          {friendlyName(v)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>

            {/* ---------------- RIGHT: live preview ---------------- */}
            <div className="xl:sticky xl:top-4 xl:self-start">
              <div className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2">
                <span>Pré-visualização com dados de exemplo</span>
                {previewing && (
                  <Loader size={12} className="animate-spin text-gray-400" />
                )}
              </div>
              {previewError ? (
                <div
                  className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-2"
                  data-testid="emails-preview-error"
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Erro a renderizar</p>
                    <p className="text-xs leading-relaxed break-words">{previewError}</p>
                    <p className="text-[11px] mt-2 text-red-700">
                      Corrige a variável errada e a pré-visualização actualiza automaticamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-[#ece6dc] bg-white overflow-hidden shadow-sm">
                  <div className="bg-[#f4ecdf] border-b border-[#ece6dc] px-4 py-2 text-xs text-[#5b4b3b]">
                    <div className="font-semibold truncate">
                      Assunto: {previewResult.subject || "—"}
                    </div>
                    <div className="text-[11px] opacity-70">
                      Para: cliente@exemplo.com · De: hello@weloveloveletters.com
                    </div>
                  </div>
                  <iframe
                    title="email-preview"
                    sandbox=""
                    srcDoc={previewResult.html_body || "<p style=\"padding:24px;color:#999;font-family:Georgia,serif;\">(vazio)</p>"}
                    className="w-full bg-[#faf7f2]"
                    style={{ minHeight: 600, border: 0 }}
                    data-testid="emails-preview-iframe"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic py-12">
            Template não encontrado.
          </p>
        )}
      </div>

      {/* ---------------- Code drawer (advanced) ---------------- */}
      {codeOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-white border-t-2 border-[#7a2e2e] shadow-2xl max-h-[60vh] overflow-hidden flex flex-col" data-testid="emails-editor-code-drawer">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-[#faf7f2]">
            <CodeIcon size={16} className="text-[#7a2e2e]" />
            <span className="text-sm font-bold font-syne text-[#2b2b2b]">Editar código HTML (avançado)</span>
            <span className="text-xs text-gray-600 italic">
              Esta zona é para utilizadores avançados. Se não tens a certeza do que estás a fazer, fecha-a e edita acima.
            </span>
            <button
              type="button"
              onClick={closeCodeDrawer}
              className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 text-gray-600"
              aria-label="Fechar"
              data-testid="emails-editor-code-close"
            >
              <XIcon size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col min-h-0 border-r border-gray-200">
              <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 px-3 py-1.5 bg-gray-50 border-b border-gray-200">
                HTML
              </div>
              <textarea
                value={htmlBody}
                onChange={onCodeHtmlChange}
                onBlur={onCodeHtmlBlur}
                spellCheck={false}
                className="flex-1 p-3 font-mono text-xs text-gray-800 focus:outline-none resize-none"
                data-testid="emails-editor-code-html"
              />
            </div>
            <div className="flex flex-col min-h-0">
              <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 px-3 py-1.5 bg-gray-50 border-b border-gray-200">
                Texto simples (fallback)
              </div>
              <textarea
                value={textBody}
                onChange={onCodeTextChange}
                spellCheck
                className="flex-1 p-3 font-mono text-xs text-gray-800 focus:outline-none resize-none"
                data-testid="emails-editor-code-text"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Footer ---------------- */}
      {template && (
        <div
          className="sticky bottom-0 z-20 bg-white border-t border-[#ece6dc] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
          data-testid="emails-editor-footer"
          style={codeOpen ? { display: "none" } : {}}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
            {template.has_custom && (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                disabled={busy === "reset"}
                className="text-xs text-gray-500 underline hover:text-[#7a2e2e] disabled:opacity-50"
                data-testid="emails-editor-reset"
              >
                <RotateCcw size={12} className="inline-block mr-1" />
                Repor texto original
              </button>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {dirty && (
                <span
                  className="text-xs text-amber-700"
                  data-testid="emails-editor-dirty"
                >
                  • Alterações por guardar
                </span>
              )}
              <button
                type="button"
                onClick={handleSendTest}
                disabled={busy === "send-test" || saving}
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
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty || !!previewError}
                title={previewError ? "Corrige o erro de pré-visualização primeiro" : undefined}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-[#7a2e2e] text-white rounded hover:bg-[#5e2222] disabled:opacity-50"
                data-testid="emails-editor-save"
              >
                {saving ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Guardar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Repor texto original"
        message="Tem a certeza? Vai apagar todas as alterações guardadas para este template e voltar ao texto original da loja."
        confirmLabel="Repor original"
        destructive
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};

export default EmailTemplateEditor;
