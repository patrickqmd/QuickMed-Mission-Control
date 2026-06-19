# QuickMed Mission Control

## Vision

QuickMed Mission Control is a local Node.js operating system for Patrick to run high-leverage business, recovery, litigation, and AI software-building work from one place.

The first version should be useful immediately: a calm, fast dashboard for seeing what matters, what is blocked, what needs follow-up, and what should be built next.

This is not a generic productivity app. It should be shaped around Patrick's actual operating world:

- QuickMed Diagnostics recovery and AOB matters
- insurer reimbursement and claims-data work
- counsel/litigation follow-up
- evidence packet organization
- AI-assisted drafting
- software ideas, Codex-ready build specs, and local app backlog
- CRM-like relationship tracking later, once the core operating surface works

The long-term goal is a local-first mission control center that can gradually become the internal operating layer for QuickMed-related work and Patrick's AI software projects.

## Product Principle

V1 should be small, real, and extensible.

Do not build a broad unfinished platform. Build a working local app with a dashboard, Kanban board, basic matters, notes, and enough structure that later modules can be added without reworking the foundation.

The app should help answer:

- What needs Patrick's attention today?
- What is actively moving?
- What is blocked?
- What evidence or information is missing?
- What has shipped or been completed?
- What should Codex build next?
- Which matters need counsel, patient, insurer, or internal follow-up?

## Local Node.js Direction

Start as a local web app that runs in the browser from a Node.js project. Keep the foundation simple, clean, and easy to expand.

Recommended first stack:

- Next.js
- TypeScript
- Prisma
- SQLite
- Tailwind CSS
- shadcn/ui or a similarly practical component system
- Drag-and-drop library for the Kanban board
- Lucide icons

This gives the project a real app structure without requiring cloud setup, authentication, or deployment on day one.

## V1 Scope

V1 should include:

- Dashboard home screen
- Kanban task board
- Basic matter/workstream tracking
- Notes attached to tasks or matters
- Simple evidence-gap tracking
- AI drafting/build-spec library as a lightweight module
- Local SQLite persistence

V1 should not include:

- full CRM
- cloud deployment
- multi-user auth
- billing
- document upload automation
- email/calendar sync
- external API integrations
- complex role permissions

## Core Concepts

### Workstreams

Workstreams are the top-level operating buckets. They keep the app aligned to real business priorities instead of becoming a generic task list.

Suggested default workstreams:

- QuickMed AOB recoveries
- Insurer reimbursement
- Counsel / litigation
- Signal / Flow Health
- Software build
- Admin / operations
- Business development

Each workstream should support:

- name
- description
- status
- priority
- color or icon
- related tasks
- related matters

### Matters

Matters are lightweight case/project records. They are not a full CRM yet, but they give tasks and notes a business object to attach to.

Matter examples:

- patient AOB recovery file
- insurer reimbursement dispute
- litigation follow-up
- software product idea
- counsel request
- business development opportunity

Matter fields:

- name
- type
- entity
- status
- priority
- workstream
- owner
- summary
- next action
- blocked reason
- created and updated timestamps

Suggested matter types:

- AOB recovery
- insurer reimbursement
- litigation
- software build
- counsel request
- operations
- business development

Important entity options:

- QuickMed Diagnostics
- Praesidium Diagnostics
- Sameday Health
- Sameday Testing
- Sameday Technologies
- Signal Diagnostics
- Flow Health
- Other

Entity precision matters. Do not collapse these entities into one generic Sameday/QuickMed bucket.

### Tasks

Tasks are the daily execution layer.

Task fields:

- title
- description or notes
- status
- priority
- due date
- tags
- workstream
- related matter
- sort order within each status column
- blocked flag
- blocked reason
- created and updated timestamps

Statuses:

- Not Started
- In Progress
- Blocked
- Complete

Priorities:

- Urgent
- High
- Normal
- Low

Core interactions:

- create task
- edit task
- move task between columns
- reorder tasks within a column
- mark task blocked
- mark task complete
- delete or archive task
- filter by workstream, matter, priority, due date, and blocked status

### Notes

Notes should be simple, fast, and attached to either a matter or task.

Note fields:

- title
- body
- related matter
- related task
- tags
- created and updated timestamps

Use cases:

- counsel call notes
- factual summaries
- next-action notes
- strategy notes
- patient/file notes
- Codex build notes

### Evidence Gaps

V1 should include a lightweight evidence-gap tracker, not a full document management system.

Evidence gap fields:

- matter
- label
- description
- status
- source
- next action
- created and updated timestamps

Suggested statuses:

- Missing
- Requested
- Received
- Reviewed
- Not Available

For QuickMed AOB matters, common evidence items include:

- patient name
- test date
- entity/lab
- insurer
- claim number
- check number
- check amount
- check issue date
- check status
- cashing/deposit date if known
- AOB/intake proof and timestamp
- EOB or portal screenshot
- outreach history
- arbitration/class-waiver notes
- limitations-related dates

For limitations analysis, keep dates separate:

- service date
- billing/rebilling date
- check issue date
- check receipt date
- check cashing/deposit date
- discovery date
- outreach date
- filing date

Do not imply that the patient owes ordinary medical debt. For QuickMed AOB matters, the core framing is that the patient balance remains $0; the dispute concerns insurer-paid funds allegedly issued to and retained by the patient despite assignment-of-benefits language.

### Drafting Library

Add a lightweight drafting/build-spec library in V1 or V1.5. This should store reusable drafts, prompts, and Codex-ready specs.

Draft types:

- counsel email
- patient outreach
- insurer follow-up
- settlement summary
- timeline
- issue list
- evidence packet summary
- Codex build brief
- product idea
- prompt/playbook

Fields:

- title
- type
- body
- related matter
- related workstream
- tags
- created and updated timestamps

This should be plain text or Markdown at first. Do not overbuild rich text editing in V1.

## Dashboard Home Base

The dashboard should feel like an operating surface, not a marketing page.

Useful dashboard elements:

- today's priority tasks
- blocked matters
- overdue follow-ups
- high-priority tasks
- task counts by status
- matters by workstream
- evidence gaps needing action
- recently updated notes
- quick-create task action
- quick-create matter action
- Codex build queue
- area for next priorities

The dashboard should make the next move obvious.

## Kanban Board

Create a task board with four columns:

- Not Started
- In Progress
- Blocked
- Complete

The board should support:

- drag-and-drop between columns
- reorder within columns
- quick task creation
- edit task modal or side panel
- priority indicators
- due-date indicators
- workstream/matter badges
- blocked reason preview

The board should be dense, calm, and practical. Avoid a decorative startup landing-page style.

## Future CRM Direction

After the task/matter system is working, expand into a lightweight CRM.

Future modules:

- Contacts
- Companies
- Deals or pipeline
- Notes and activity history
- Follow-up reminders
- Client tasks
- Counsel and vendor tracking
- Communication tracking

The V1 data model should leave room for this but should not build the full CRM yet.

## Future AI Software Builder Direction

Mission Control should eventually become the place where Patrick turns ideas into shipped tools.

Future software-building modules:

- product idea inbox
- Codex-ready spec generator
- build queue
- repo tracker
- feature backlog
- prompt library
- reusable playbooks
- shipped tools log
- bug/issue tracker
- local dev command links

V1 should include only the build queue/drafting library foundation. Local repo integration can come later.

## Suggested Routes

- `/` dashboard
- `/tasks` Kanban board
- `/matters` matter list
- `/matters/[id]` matter detail
- `/notes` notes library
- `/drafts` drafting/build-spec library
- `/settings` local configuration and defaults

## Suggested Prisma Models

Use this as a starting point, not a rigid final schema.

- `Workstream`
- `Matter`
- `Task`
- `Note`
- `EvidenceGap`
- `Draft`

Important relationships:

- Workstream has many Matters
- Workstream has many Tasks
- Matter has many Tasks
- Matter has many Notes
- Matter has many EvidenceGaps
- Matter has many Drafts
- Task can have many Notes

## UX Direction

The interface should be:

- calm
- practical
- fast to scan
- dense but not cluttered
- built for repeated daily use
- optimized for action, not presentation

Design guidance:

- no marketing hero page
- no decorative landing page
- no oversized startup cards
- use a sidebar or compact top navigation
- use clear status badges
- use filters and quick actions
- make blocked items obvious
- make overdue items obvious
- keep cards compact
- use modals or side panels for editing

## Build Checklist

- Create the Next.js app foundation.
- Add TypeScript, Tailwind, Prisma, and SQLite.
- Add app layout and navigation.
- Add dashboard home screen.
- Add Workstream, Matter, Task, Note, EvidenceGap, and Draft models.
- Seed sensible default workstreams.
- Add Kanban board.
- Add task create, edit, move, reorder, blocked, complete, archive/delete flows.
- Persist task status and order.
- Add matter list and matter detail page.
- Add notes attached to matters/tasks.
- Add basic evidence-gap tracking on matter detail pages.
- Add draft/build-spec library.
- Add filters for workstream, matter, priority, blocked, and due date.
- Add basic responsive layout.
- Run type checks, linting, and a production build.

## Implementation Phases

### Phase 1: Foundation

- Next.js app
- SQLite/Prisma setup
- layout/navigation
- seed data
- basic dashboard shell

### Phase 2: Task Execution

- Kanban board
- CRUD tasks
- drag/drop status changes
- reorder tasks
- priority/due date/blocked fields

### Phase 3: Matters

- create/list/edit matters
- matter detail page
- attach tasks to matters
- show matter status, priority, next action, and blocked reason

### Phase 4: Notes and Evidence Gaps

- attach notes to matters/tasks
- add evidence-gap tracker
- show missing/requested/received/reviewed items

### Phase 5: Drafting and Build Specs

- draft library
- draft types
- Codex build brief storage
- prompt/playbook storage

## Constraints

- Keep the first version local and single-user.
- Do not add cloud services yet.
- Do not add authentication yet.
- Do not build the full CRM in V1.
- Do not build document upload automation in V1.
- Do not integrate email/calendar in V1.
- Do not overbuild rich text editing.
- Prioritize a working operating dashboard over a broad but unfinished system.
- Preserve entity precision.
- Preserve the QuickMed AOB distinction: this is not ordinary patient medical debt; the issue is insurer-paid funds allegedly retained despite assignment-of-benefits language.

## Definition of Done for V1

V1 is done when Patrick can open the local app and:

- see the day's highest-priority tasks
- see blocked matters
- create and manage tasks on a Kanban board
- create basic matters
- attach tasks and notes to matters
- track missing evidence items
- store Codex-ready build specs and drafts
- filter work by workstream, priority, blocked status, and due date
- use the app as the daily operating home base without needing cloud deployment
