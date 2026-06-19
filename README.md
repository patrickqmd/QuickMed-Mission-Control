# QuickMed Mission Control

Local-first operating dashboard for QuickMed workstreams, matters, tasks, notes, evidence gaps, and Codex-ready drafts.

## Run Locally

Immediate no-install version:

Open `quickmed-mission-control.html` in a browser. It persists data in browser local storage and includes the V1 dashboard, task board, matters, notes, evidence gaps, drafts, and settings.

Full Next.js/Prisma version:

```bash
npm install
npm run setup
npm run dev
```

Then open `http://localhost:3000`.

## What V1 Includes

- Dashboard with priority tasks, blocked matters, evidence gaps, recent notes, and Codex build queue
- Kanban task board with drag-and-drop reorder, filters, inline edit, archive, blocked, complete, priority, due date, tags, workstream, and matter links
- Matters with entity precision, next action, blocked reason, attached tasks, notes, drafts, and evidence gaps
- Notes attached to matters or tasks
- Evidence-gap tracking with Missing, Requested, Received, Reviewed, and Not Available states
- Draft/build-spec library for counsel emails, patient outreach, insurer follow-up, Codex briefs, product ideas, and prompt/playbooks
- SQLite persistence through Prisma

## Local Database

The app uses SQLite at `prisma/dev.db`. Defaults and sample records are loaded by:

```bash
npm run setup
```

## Guardrail

QuickMed AOB matters are not ordinary patient medical debt. The patient balance remains `$0`; the dispute concerns insurer-paid funds allegedly issued to and retained by the patient despite assignment-of-benefits language.
