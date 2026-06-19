import Link from "next/link";
import { notFound } from "next/navigation";
import { updateMatter, updateEvidenceGapStatus } from "@/lib/actions";
import { ENTITIES, EVIDENCE_STATUSES, MATTER_TYPES, PRIORITIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { BlockedBadge, PriorityBadge, StatusBadge } from "@/components/Badges";
import { EvidenceGapForm, NoteForm, TaskForm } from "@/components/Forms";
import { PageHeader } from "@/components/PageHeader";

export default async function MatterDetailPage({ params }: { params: { id: string } }) {
  const [matter, workstreams, matterOptions, taskOptions] = await Promise.all([
    prisma.matter.findUnique({
      where: { id: params.id },
      include: {
        workstream: true,
        tasks: { where: { archived: false }, include: { workstream: true }, orderBy: [{ status: "asc" }, { sortOrder: "asc" }] },
        notes: { orderBy: { updatedAt: "desc" } },
        evidenceGaps: { orderBy: [{ status: "asc" }, { updatedAt: "desc" }] },
        drafts: { orderBy: { updatedAt: "desc" } }
      }
    }),
    prisma.workstream.findMany({ orderBy: { name: "asc" } }),
    prisma.matter.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.task.findMany({ where: { archived: false }, orderBy: { title: "asc" }, select: { id: true, title: true } })
  ]);

  if (!matter) notFound();
  const taskSelect = taskOptions.map((task) => ({ id: task.id, name: task.title }));

  return (
    <>
      <PageHeader title={matter.name} eyebrow={`${matter.entity} / ${matter.type}`}>
        <Link href="/matters" className="btn-secondary">
          All Matters
        </Link>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <section className="panel rounded-md p-4">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={matter.priority} />
              <StatusBadge status={matter.status} />
              {matter.blockedReason ? <BlockedBadge reason={matter.blockedReason} /> : null}
              <span className="badge">{matter.workstream.name}</span>
              <span className="badge">Owner: {matter.owner}</span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink/75">{matter.summary || "No summary yet."}</p>
            {matter.nextAction ? (
              <div className="mt-4 rounded-md border border-brand/20 bg-brand/10 p-3">
                <div className="label">Next Action</div>
                <div className="mt-1 text-sm font-semibold text-brand">{matter.nextAction}</div>
              </div>
            ) : null}
          </section>

          <section className="panel rounded-md p-4">
            <h2 className="mb-3 text-base font-bold">Tasks</h2>
            <div className="space-y-3">
              {matter.tasks.map((task) => (
                <Link key={task.id} href="/tasks" className="block rounded-md bg-field p-3 hover:bg-line/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <span className="badge">{formatDate(task.dueDate)}</span>
                  </div>
                  <div className="mt-2 font-bold">{task.title}</div>
                  {task.description ? <p className="mt-1 line-clamp-2 text-sm text-ink/60">{task.description}</p> : null}
                </Link>
              ))}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-bold text-brand">Add task to this matter</summary>
              <div className="mt-3">
                <TaskForm workstreams={workstreams} matters={matterOptions} defaultMatterId={matter.id} />
              </div>
            </details>
          </section>

          <section className="panel rounded-md p-4">
            <h2 className="mb-3 text-base font-bold">Evidence Gaps</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {matter.evidenceGaps.map((gap) => (
                <article key={gap.id} className="rounded-md bg-field p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold">{gap.label}</div>
                      <div className="mt-1 text-xs font-semibold text-ink/50">{gap.source || "No source"}</div>
                    </div>
                    <span className="badge">{gap.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink/65">{gap.description}</p>
                  {gap.nextAction ? <p className="mt-2 rounded-md bg-white p-2 text-xs font-semibold">{gap.nextAction}</p> : null}
                  <form action={updateEvidenceGapStatus} className="mt-3 flex gap-2">
                    <input type="hidden" name="id" value={gap.id} />
                    <input type="hidden" name="matterId" value={matter.id} />
                    <select className="field" name="status" defaultValue={gap.status}>
                      {EVIDENCE_STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <button className="btn-secondary" type="submit">
                      Save
                    </button>
                  </form>
                </article>
              ))}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-bold text-brand">Add evidence gap</summary>
              <div className="mt-3">
                <EvidenceGapForm matterId={matter.id} />
              </div>
            </details>
          </section>

          <section className="panel rounded-md p-4">
            <h2 className="mb-3 text-base font-bold">Notes</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {matter.notes.map((note) => (
                <article key={note.id} className="rounded-md bg-field p-3">
                  <div className="font-bold">{note.title}</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/65">{note.body}</p>
                </article>
              ))}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-bold text-brand">Add note</summary>
              <div className="mt-3">
                <NoteForm matters={matterOptions} tasks={taskSelect} matterId={matter.id} />
              </div>
            </details>
          </section>
        </div>

        <aside className="panel h-fit rounded-md p-4">
          <h2 className="mb-3 text-base font-bold">Edit Matter</h2>
          <form action={updateMatter} className="grid gap-3">
            <input type="hidden" name="id" value={matter.id} />
            <input className="field" name="name" defaultValue={matter.name} />
            <div className="grid gap-3 sm:grid-cols-2">
              <select className="field" name="type" defaultValue={matter.type}>
                {MATTER_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <select className="field" name="entity" defaultValue={matter.entity}>
                {ENTITIES.map((entity) => (
                  <option key={entity}>{entity}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select className="field" name="status" defaultValue={matter.status}>
                {["Active", "Waiting", "Blocked", "Complete", "Archived"].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <select className="field" name="priority" defaultValue={matter.priority}>
                {PRIORITIES.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <input className="field" name="owner" defaultValue={matter.owner} />
            <select className="field" name="workstreamId" defaultValue={matter.workstreamId}>
              {workstreams.map((workstream) => (
                <option key={workstream.id} value={workstream.id}>
                  {workstream.name}
                </option>
              ))}
            </select>
            <textarea className="field" name="summary" defaultValue={matter.summary} />
            <input className="field" name="nextAction" defaultValue={matter.nextAction} />
            <input className="field" name="blockedReason" defaultValue={matter.blockedReason} />
            <button className="btn-primary" type="submit">
              Save Matter
            </button>
          </form>
        </aside>
      </div>
    </>
  );
}
