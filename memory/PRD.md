# PRD — Love Letters Backoffice

## Problem statement
Online store backoffice for Love Letters (frontend Netlify: https://weloveloveletters.netlify.app, backend Render: https://loveletters-backend.onrender.com). The backend received 3 new feature groups behind the existing Bearer JWT admin auth. This sprint implements the matching frontend in the existing React backoffice + a follow-up refactor of the email template editor for non-technical authors.

## Architecture
- Frontend: React 19 + CRA/craco + Tailwind + Radix UI + react-router-dom + Tiptap (WYSIWYG with custom Jinja nodes)
- Auth: existing JWT (POST /api/admin/login) — token in localStorage as `admin_token`
- Backend: FastAPI on Render. APP_BUILD: `2026-06-templates-trash-resend-confirmation`.
- Frontend talks to Render via `REACT_APP_BACKEND_URL` (set in `frontend/.env` for local dev and `netlify.toml` for production).

## User personas
- **Margarida (loja)** — autora/operadora; precisa de gerir encomendas, mensagens, outbox de email, e personalizar emails. Não percebe HTML/Jinja, não vai mexer em código.

## Core requirements (static)
1. Outbox: lixeira com soft-delete + bulk actions + tabs por status + esvaziar lixeira.
2. Email templates: editor "what-you-see-is-what-you-get" sem código exposto. Variáveis Jinja como pílulas amigáveis. Preview live. Apenas escape hatch via botão `</>` para utilizadores avançados.
3. Orders: kebab menu com Reenviar email de confirmação + Re-executar fulfillment (Stripe).

## Implemented in this sprint
### Outbox (2026-06-09 v1)
- 6 sub-tabs (Todos / Por enviar / Enviados / Falhados / Cancelados / Lixeira) com badge counters
- Checkboxes per-row + select-all-visible + sticky bulk toolbar (top)
- Mover/Restaurar/Eliminar definitivamente · Esvaziar lixeira (só na Lixeira)
- Endpoints singulares para 1 item, bulk-* para N

### Email Template Editor (2026-06-09 v1 + v2 refactor)
- **Listing** (`/admin/dashboard` tab EMAILS): 3 cards grandes com thumbnails iframe ao vivo escalados a 50% (sem html2canvas — solução mais leve e dinâmica), pílulas "Personalizado"/"Original" no canto superior direito de cada card.
- **Editor** (`/admin/emails/:key`): 2 colunas (editor à esquerda + preview à direita com debounce 500ms).
  - Subject como input grande sem label, com placeholder "Assunto do email".
  - **Tiptap WYSIWYG** com extensions StarterKit (sem headings/code/blockquote), Link, Image (base64), Placeholder.
  - **Custom Tiptap nodes**: `JinjaVariable` (`{{ … }}` → pílula azul com nome amigável PT) e `JinjaBlock` (`{% … %}` → pílula cinzenta tracejada com label PT tipo "se Total", "para cada item em items", "fim ciclo").
  - **Round-trip**: `htmlWithPills()` converte raw HTML → markers `<span data-jinja-…>`; `cleanHtmlForSave()` reverte para `{{ … }}` / `{% … %}` na gravação. Suporta expressões complexas como `{{ customer_name or "" }}`.
  - Toolbar minimal: B / I / lista / lista numerada / link / imagem (com drag-&-drop + warning > 200KB, hard limit 1MB).
  - **Variables sidebar**: 14 pílulas clicáveis com nomes amigáveis ("Número da encomenda", "Lista de produtos", etc.) — clicar insere `{{ var }}` no cursor como pílula.
  - **Preview iframe** sandbox (sem permissões — isolamento) com fundo `#faf7f2`, max-width emulando cliente de email; mostra Assunto + From/To. Atualiza automaticamente a cada 500ms após edição (chama POST `/preview`).
  - **Erro Jinja**: preview pane mostra a mensagem do backend (FastAPI 422 detail) em vermelho; o botão Guardar fica disabled enquanto houver erro.
  - **Code drawer** escondido por defeito (botão `</>` no canto superior direito). Quando aberto, bottom drawer com aviso amarelo + 2 textareas (HTML + Texto simples) — editar aqui sobrepõe-se ao WYSIWYG; ao fechar, o Tiptap re-renderiza.
  - **Footer**: "Repor texto original" (link discreto à esquerda, só se has_custom) + "Enviar teste para hello@…" (secundário) + "Guardar alterações" (primário vermelho `#7a2e2e`). Dirty indicator inline.
  - **Toaster global** (movido para fora do layout público para os toasts aparecerem em todas as páginas admin).

### Orders kebab menu
- `MoreVertical` icon em cada linha → dropdown com "Reenviar email de confirmação" + "Re-executar fulfillment (Stripe)" (condicional a `stripe_session_id`).
- Fecha em outside-click + Escape.

## Testing status
- Testing agent iteration 8: ~95% pass rate end-to-end contra Render real.
- Self-test pós-refactor (2026-06-09 12:00): ciclo completo Save → Personalizado → Repor original → Original, 0 erros de console, dirty tracking funciona, preview live a 500ms, pillification de `{{ customer_name or "" }}` confirmada.

## Backlog / Future
- P2: thumbnails dos cards listing via html2canvas (PNG estático) em vez de iframes vivos — performance em listings grandes.
- P2: imagens inline base64 → upload para storage externo (CID/S3) para evitar Outlook desktop truncar emails > 1MB.
- P2: extrair sub-componentes de `OutboxTab.jsx` (file ~830 linhas).
- P2: drag-and-drop reordenamento de blocos `{% if %}` / `{% for %}` no editor.

## Next action items
- Deploy do frontend para Netlify para a Margarida ver.
- Aguardar fix no backend dos 2 issues reportados pelo utilizador:
  - **Bug**: confirmação de encomenda não dispara (webhook do Stripe a saltar o enqueue).
  - **Bug Stripe Checkout**: telemóvel não pré-preenchido + branding "Área Restrita" → "Love Letters" (config Stripe Dashboard).
