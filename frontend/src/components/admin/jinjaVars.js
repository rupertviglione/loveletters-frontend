// Friendly names for Jinja variables — shown inside the WYSIWYG pills so the
// non-technical author doesn't see raw `{{ … }}` tokens. Falls back to the
// variable key in title case if not in the dictionary.

export const VAR_FRIENDLY_NAMES = {
  order_number: "Número da encomenda",
  customer_name: "Nome do cliente",
  customer_email: "Email do cliente",
  status_label: "Estado da encomenda",
  total_formatted: "Total",
  subtotal_formatted: "Subtotal",
  shipping_formatted: "Portes",
  currency: "Moeda",
  items: "Lista de produtos",
  shipping_address_text: "Endereço de envio",
  tracking_number: "Número de tracking",
  tracking_url: "Link de tracking",
  contact_email: "Email de contacto",
  webmail_url: "Link do webmail",
  message: "Mensagem do cliente",
};

const titleCase = (s) =>
  String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const friendlyName = (token) =>
  VAR_FRIENDLY_NAMES[token] || titleCase(token);

// Match a single `{{ … }}` placeholder. The inner expression may be a plain
// identifier (`order_number`), an attribute access (`item.title`), or a Jinja
// expression with defaults (`customer_name or ""`). We capture the WHOLE inner
// expression so we can re-serialise it intact on save.
export const VAR_REGEX = /\{\{\s*([\s\S]+?)\s*\}\}/g;

// Extract the leading identifier from a Jinja expression. Used to look up the
// friendly Portuguese name shown inside the pill.
export const leadingIdentifier = (expr) => {
  const m = String(expr || "").match(/^([a-zA-Z_][a-zA-Z0-9_.]*)/);
  return m ? m[1] : "";
};

// Match a Jinja control block `{% ... %}` (greedy but excludes the literal `%}`).
export const BLOCK_REGEX = /\{%[^%]*?%\}/g;

/**
 * Convert raw HTML containing `{{ … }}` placeholders into HTML with
 * `<span data-jinja-var="…">…</span>` markers, and `{% ... %}` control
 * blocks into `<span data-jinja-block="...">...</span>` markers. Both markers
 * are picked up by the matching Tiptap node and rendered as pills.
 *
 * This is text-only substitution: it does NOT touch text inside <style>, <script>
 * or HTML attributes (it only walks the islands of text between `>` and `<`).
 */
export const htmlWithPills = (html) => {
  if (!html) return "";
  return html.replace(
    /(>)([^<]*)(?=<)|^([^<]*)(?=<)/g,
    (full, gt, mid, head) => {
      const text = gt !== undefined ? mid : head;
      const prefix = gt || "";
      if (!text) return full;
      let out = text;
      if (out.includes("{%")) {
        out = out.replace(
          BLOCK_REGEX,
          (raw) =>
            `<span data-jinja-block="${escapeAttr(raw)}" contenteditable="false">${friendlyBlockText(raw)}</span>`,
        );
      }
      if (out.includes("{{")) {
        out = out.replace(VAR_REGEX, (_m, expr) => {
          const trimmed = String(expr || "").trim();
          const ident = leadingIdentifier(trimmed);
          return `<span data-jinja-var="${escapeAttr(trimmed)}" contenteditable="false">${ident || trimmed}</span>`;
        });
      }
      return `${prefix}${out}`;
    },
  );
};

const friendlyBlockText = (raw) => raw; // pill labels come from JinjaBlock node

const escapeAttr = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const unescapeAttr = (s) =>
  String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

/**
 * Reverse the work of htmlWithPills: take the HTML output from Tiptap and
 * unwrap the marker spans back into plain `{{ … }}` / `{% … %}` text.
 *
 * Tiptap's serialiser keeps the wrapper spans because our custom nodes are
 * atoms — we have to strip them at save time so the backend Jinja parser
 * sees the canonical template.
 */
export const cleanHtmlForSave = (html) => {
  if (!html) return "";
  let out = html;
  // `<span data-jinja-var="EXPR">…</span>` → `{{ EXPR }}`
  out = out.replace(
    /<span\s+data-jinja-var="([^"]+)"[^>]*>[^<]*<\/span>/g,
    (_m, attr) => `{{ ${unescapeAttr(attr)} }}`,
  );
  // `<span data-jinja-block="RAW">…</span>` → the original `{% … %}`
  out = out.replace(
    /<span\s+data-jinja-block="([^"]+)"[^>]*>[^<]*<\/span>/g,
    (_m, attr) => unescapeAttr(attr),
  );
  return out;
};
