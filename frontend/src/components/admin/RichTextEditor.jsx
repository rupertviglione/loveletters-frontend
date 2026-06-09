import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Code,
  Pilcrow,
} from "lucide-react";

const MAX_IMAGE_BYTES = 200 * 1024; // soft limit warning

const Btn = ({ active, onClick, title, testId, children, disabled }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    data-testid={testId}
    className={`inline-flex items-center justify-center p-1.5 rounded text-xs border ${
      active
        ? "bg-accent text-white border-accent"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

/**
 * Lightweight WYSIWYG editor (Tiptap) with:
 *  - bold/italic/strike, headings, lists, links, inline images (base64)
 *  - "Source" toggle to edit raw HTML
 *  - imperative `insertText` via ref (used for placeholder insertion)
 */
const RichTextEditor = React.forwardRef(function RichTextEditor(
  { value, onChange, onWarning, sourceMode, onToggleSource },
  ref,
) {
  const fileInputRef = useRef(null);
  const sourceTextareaRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => {
      if (!sourceMode) onChange?.(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] focus:outline-none px-4 py-3",
      },
    },
  });

  // Sync external value (when switching templates / resetting to default).
  useEffect(() => {
    if (!editor) return;
    if (sourceMode) return; // user is editing raw HTML
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor, sourceMode]);

  // Expose imperative API for placeholder insertion.
  React.useImperativeHandle(
    ref,
    () => ({
      insertText: (text) => {
        if (sourceMode) {
          const ta = sourceTextareaRef.current;
          if (!ta) return;
          const start = ta.selectionStart ?? 0;
          const end = ta.selectionEnd ?? 0;
          const next = (value || "").slice(0, start) + text + (value || "").slice(end);
          onChange?.(next);
          requestAnimationFrame(() => {
            ta.focus();
            const pos = start + text.length;
            ta.setSelectionRange(pos, pos);
          });
        } else {
          editor?.chain().focus().insertContent(text).run();
        }
      },
    }),
    [editor, sourceMode, value, onChange],
  );

  const onLinkClick = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link")?.href || "";
    const url = window.prompt("URL do link:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const onImageClick = () => {
    fileInputRef.current?.click();
  };

  const onImageFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onWarning?.("Apenas imagens são permitidas.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onWarning?.(
        `Atenção: imagem com ${Math.round(file.size / 1024)}KB > 200KB. Alguns clientes (Outlook) podem não mostrar imagens base64 grandes.`,
      );
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") return;
      if (sourceMode) {
        const ta = sourceTextareaRef.current;
        const tag = `<img src="${dataUrl}" alt="" style="max-width:100%;" />`;
        if (!ta) {
          onChange?.((value || "") + tag);
          return;
        }
        const start = ta.selectionStart ?? 0;
        const end = ta.selectionEnd ?? 0;
        const next = (value || "").slice(0, start) + tag + (value || "").slice(end);
        onChange?.(next);
      } else {
        editor?.chain().focus().setImage({ src: dataUrl }).run();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!editor) return null;

  return (
    <div
      className="border border-gray-300 rounded-md bg-white overflow-hidden"
      data-testid="rich-text-editor"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-2 border-b border-gray-200 bg-gray-50">
        <Btn
          title="Negrito"
          testId="rte-bold"
          active={editor.isActive("bold")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} />
        </Btn>
        <Btn
          title="Itálico"
          testId="rte-italic"
          active={editor.isActive("italic")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} />
        </Btn>
        <Btn
          title="Riscado"
          testId="rte-strike"
          active={editor.isActive("strike")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={14} />
        </Btn>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <Btn
          title="Parágrafo"
          testId="rte-p"
          active={editor.isActive("paragraph")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow size={14} />
        </Btn>
        <Btn
          title="Heading 1"
          testId="rte-h1"
          active={editor.isActive("heading", { level: 1 })}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={14} />
        </Btn>
        <Btn
          title="Heading 2"
          testId="rte-h2"
          active={editor.isActive("heading", { level: 2 })}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={14} />
        </Btn>
        <Btn
          title="Heading 3"
          testId="rte-h3"
          active={editor.isActive("heading", { level: 3 })}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={14} />
        </Btn>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <Btn
          title="Lista"
          testId="rte-bullet"
          active={editor.isActive("bulletList")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14} />
        </Btn>
        <Btn
          title="Lista ordenada"
          testId="rte-ordered"
          active={editor.isActive("orderedList")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={14} />
        </Btn>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <Btn
          title="Link"
          testId="rte-link"
          active={editor.isActive("link")}
          disabled={sourceMode}
          onClick={onLinkClick}
        >
          <LinkIcon size={14} />
        </Btn>
        <Btn
          title="Imagem (inline base64)"
          testId="rte-image"
          onClick={onImageClick}
        >
          <ImageIcon size={14} />
        </Btn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageFile}
          className="hidden"
          data-testid="rte-image-input"
        />
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <Btn
          title="Desfazer"
          testId="rte-undo"
          disabled={sourceMode || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={14} />
        </Btn>
        <Btn
          title="Refazer"
          testId="rte-redo"
          disabled={sourceMode || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={14} />
        </Btn>
        <span className="ml-auto">
          <Btn
            title="Editar HTML fonte"
            testId="rte-source"
            active={sourceMode}
            onClick={onToggleSource}
          >
            <Code size={14} />
            <span className="ml-1 hidden sm:inline">Source</span>
          </Btn>
        </span>
      </div>

      {sourceMode ? (
        <textarea
          ref={sourceTextareaRef}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[300px] px-4 py-3 font-mono text-xs text-gray-800 focus:outline-none"
          data-testid="rte-source-textarea"
        />
      ) : (
        <EditorContent editor={editor} data-testid="rte-content" />
      )}
    </div>
  );
});

export default RichTextEditor;
