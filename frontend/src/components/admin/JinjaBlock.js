import { Node } from "@tiptap/core";

/**
 * JinjaBlock — atom inline node representing a Jinja CONTROL tag like
 * `{% if items %}`, `{% endfor %}`, `{% else %}`. Shown in the editor as a
 * small grey italic chip so the (non-technical) author can SEE that there is
 * a logic boundary, without being able to break it by typing inside it.
 *
 * On output (editor.getHTML()) the node serialises back to its original raw
 * text so the backend Jinja parser sees the same template.
 */
export const JinjaBlock = Node.create({
  name: "jinjaBlock",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      raw: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-jinja-block") || "",
        renderHTML: (attrs) => {
          if (!attrs.raw) return {};
          return { "data-jinja-block": attrs.raw };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-jinja-block]" }];
  },

  renderHTML({ node }) {
    const raw = node.attrs.raw || "";
    return ["span", { "data-jinja-block": raw }, raw];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      const raw = node.attrs.raw || "";
      dom.className = "jinja-block-pill";
      dom.setAttribute("data-jinja-block", raw);
      dom.setAttribute("contenteditable", "false");
      dom.title = "Bloco lógico do template — não apagues a menos que saibas o que estás a fazer";
      // Friendlier rendering of the inner code:  "{% if total_formatted %}" -> "se Total"
      const friendly = friendlyBlockLabel(raw);
      dom.textContent = friendly;
      return { dom };
    };
  },
});

const friendlyBlockLabel = (raw) => {
  if (!raw) return "{% %}";
  const m = raw.match(/^\{%\s*(\w+)\b\s*(.*?)\s*%\}$/);
  if (!m) return raw;
  const kw = m[1];
  const arg = m[2] || "";
  const map = {
    if: `se ${arg}`,
    elif: `senão se ${arg}`,
    else: "senão",
    endif: "fim se",
    for: `para cada ${arg.replace(/^(\w+)\s+in\s+/, "$1 em ")}`,
    endfor: "fim ciclo",
    set: `definir ${arg}`,
    block: `bloco ${arg}`,
    endblock: "fim bloco",
  };
  return map[kw] || raw;
};

export default JinjaBlock;
