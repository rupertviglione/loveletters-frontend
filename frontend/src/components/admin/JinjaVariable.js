import { Node, mergeAttributes } from "@tiptap/core";
import { friendlyName, leadingIdentifier } from "./jinjaVars";

/**
 * JinjaVariable — Tiptap inline atom node that renders a `{{ … }}` placeholder
 * as a non-editable pill inside the WYSIWYG editor.
 *
 * The attribute `expr` holds the FULL inner expression (e.g. `customer_name`
 * or `customer_name or ""`) so we can re-serialise it back identically when
 * the user clicks Save. The pill's friendly label is derived from the leading
 * identifier of the expression.
 */
export const JinjaVariable = Node.create({
  name: "jinjaVariable",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      // Full inner expression, e.g. `customer_name`, `customer_name or ""`,
      // `item.title`. Persisted on save as `{{ expr }}`.
      expr: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-jinja-var") || "",
        renderHTML: (attrs) => {
          if (!attrs.expr) return {};
          return { "data-jinja-var": attrs.expr };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-jinja-var]" }];
  },

  // Tiptap serialisation: include the data-jinja-var attribute AND the
  // identifier as fallback text. `cleanHtmlForSave()` re-wraps it back to the
  // canonical `{{ expr }}` syntax expected by the backend.
  renderHTML({ node }) {
    const expr = node.attrs.expr || "";
    const text = leadingIdentifier(expr) || expr;
    mergeAttributes({});
    return ["span", { "data-jinja-var": expr }, text];
  },

  // In-editor renderer (the pill UI).
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      const expr = node.attrs.expr || "";
      const ident = leadingIdentifier(expr) || expr;
      dom.className = "jinja-pill";
      dom.setAttribute("data-jinja-var", expr);
      dom.setAttribute("contenteditable", "false");
      dom.title = `{{ ${expr} }}`;
      dom.textContent = friendlyName(ident);
      return { dom };
    };
  },

  addCommands() {
    return {
      insertJinjaVariable:
        (expr) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: { expr },
            })
            .insertContent(" ")
            .run(),
    };
  },
});

export default JinjaVariable;
