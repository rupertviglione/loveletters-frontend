# PRD — Love Letters Backoffice

## Problem statement
Online store backoffice for Love Letters (frontend Netlify: https://weloveloveletters.netlify.app, backend Render: https://loveletters-backend.onrender.com). The backend received 3 new feature groups behind the existing Bearer JWT admin auth. This sprint implements the matching frontend in the existing React backoffice.

## Architecture
- Frontend: React 19 + CRA/craco + Tailwind + Radix UI + react-router-dom + Tiptap (WYSIWYG)
- Auth: existing JWT (POST /api/admin/login) — token in localStorage as `admin_token`
- Backend: FastAPI on Render (separate codebase). APP_BUILD: `2026-06-templates-trash-resend-confirmation`.
- Frontend talks to Render via `REACT_APP_BACKEND_URL` (set in `frontend/.env` for local dev and `netlify.toml` for production).

## User personas
- **Margarida (loja)** — autora/operadora; precisa de gerir encomendas, mensagens, outbox de email, e personalizar os emails automáticos enviados aos clientes.

## Core requirements (static)
1. Outbox: lixeira com soft-delete + bulk actions + tabs por status + esvaziar lixeira.
2. Email templates: editor WYSIWYG (HTML+Source) + texto+subject + placeholders Jinja2 + preview com dados sample + send-test + repor default.
3. Orders: kebab menu com Reenviar email de confirmação + Re-executar fulfillment (Stripe).
4. Toda a UI em PT-PT, mantendo aspecto do backoffice existente.

## Implemented in this sprint (2026-06-09)
- **API layer** (`/app/frontend/src/services/api.js`):
  - Outbox trash: `adminTrashOutbox`, `adminRestoreOutbox`, `adminBulkTrashOutbox`, `adminBulkRestoreOutbox`, `adminBulkDeleteOutbox`, `adminEmptyOutboxTrash`, `adminDeleteOutbox`.
  - Email templates: `adminListEmailTemplates`, `adminGetEmailTemplate`, `adminSaveEmailTemplate`, `adminResetEmailTemplate`, `adminPreviewEmailTemplate`, `adminSendTestEmailTemplate`.
  - Orders: `adminResendOrderConfirmation`, `adminFulfillOrderFromStripe`.
- **OutboxTab** (`/app/frontend/src/components/admin/OutboxTab.jsx`): redesenhada com 6 sub-tabs (Todos/Por enviar/Enviados/Falhados/Cancelados/Lixeira) + badge counters via `/api/admin/mail-outbox/stats` (`by_status` + `trashed`); checkboxes per-row + header (select all visible); sticky bulk toolbar (top) com Mover/Restaurar/Eliminar; Esvaziar lixeira só na tab Lixeira; per-row actions usam endpoints singulares quando há apenas 1 item.
- **EmailsTab** (`/app/frontend/src/components/admin/EmailsTab.jsx`): nova tab no dashboard com cards dos 3 templates (pílula Default/Personalizado, subject preview, placeholders preview).
- **EmailTemplateEditor** (`/app/frontend/src/pages/EmailTemplateEditor.js`) em `/admin/emails/:key`: 3 inner-tabs (Assunto/HTML/Texto simples) + Tiptap WYSIWYG com Source HTML toggle, sidebar de placeholders (clique = insere no cursor, copy também), preview iframe sandbox (HTML/Texto) via POST `/preview`, footer sticky com Guardar/Send-test/Repor default + dirty indicator.
- **RichTextEditor** (`/app/frontend/src/components/admin/RichTextEditor.jsx`): Tiptap com StarterKit (sem o link interno duplicado) + Link configurado + Image (base64) com aviso > 200KB.
- **OrdersTab** (`/app/frontend/src/components/admin/OrdersTab.jsx`): adicionado kebab menu por encomenda (`MoreVertical` icon) com "Reenviar email de confirmação" (sempre) e "Re-executar fulfillment (Stripe)" (condicional a `stripe_session_id`); fecha em outside-click + Escape.
- **AdminDashboard** (`/app/frontend/src/pages/AdminDashboard.js`): nova tab "EMAILS" (5ª).
- **App.js**: nova rota `/admin/emails/:key`. Toaster movido para fora do layout público (para os toasts aparecerem em todas as páginas admin).
- **.env**: criado `REACT_APP_BACKEND_URL` apontando para Render (para dev local).

## Testing status
- Testing agent run (iteration 8): ~95% pass rate end-to-end contra backend Render real. Login + 5 tabs + 6 sub-tabs do Outbox + badges + trash/restore cycle (`mail_d96940bbafe444` exercised e restaurado) + Email templates list + editor + preview iframe (sample "Maria Silva" / "LL-20260608-ABC123") + Source toggle + placeholder insertion — todos verificados.
- Self-test pós-correcções: Save → pílula "Personalizado" → Repor default → pílula "Default" → subject volta ao original — tudo OK. 0 warnings Tiptap, 0 warnings WS.
- Orders kebab: implementação visível e testid configurados, mas não exercitado end-to-end porque a loja não tem encomendas activas em produção (data-blocked, esperado).

## Backlog / Future
- P1: extrair sub-componentes do `OutboxTab.jsx` (file is ~830 linhas).
- P2: migrar imagens inline base64 do editor para CID ou upload externo (warning já presente para a autora).
- P2: bulk-delete forever da Outbox poderia ter um indicador de progresso para lotes muito grandes.
- P2: melhorar UX do editor (eventualmente um diff side-by-side com a versão default).

## Next action items
- (Optional) Refatorar `OutboxTab.jsx` em sub-componentes.
- (Optional) Persistir a tab activa do Outbox em URL query param.
