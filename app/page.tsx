import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileWarning, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlockedBadge, HotBadge, PriorityBadge, StatusBadge } from "@/components/Badges";
import { TaskForm } from "@/components/Forms";
import { prisma } from "@/lib/prisma";
import { formatDate, isOverdue } from "@/lib/utils";

export default async function DashboardPage() {
  const [workstreams, matters, tasks, blockedMatters, evidenceGaps, notes, drafts] = await Promise.all([
    prisma.workstream.findMany({ orderBy: [{ priority: "asc" }, { name: "asc" }] }),
    prisma.matter.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, name: true } }),
    prisma.task.findMany({
      where: { archived: false, status: { not: "Complete" } },
      include: { workstream: true, matter: true },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }, { updatedAt: "desc" }],
      take: 8
    }),
    prisma.matter.findMany({
      where: { OR: [{ status: "Blocked" }, { blockedReason: { not: "" } }] },
      include: { workstream: true },
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
      take: 6
    }),
    prisma.evidenceGap.findMany({
      where: { status: { in: ["Missing", "Requested"] } },
      include: { matter: true },
      orderBy: { updatedAt: "desc" },
      take: 6
    }),
    prisma.note.findMany({ include: { matter: true, task: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.draft.findMany({ include: { workstream: true, matter: true }, orderBy: { updatedAt: "desc" }, take: 5 })
  ]);

  const statusCounts = await Promise.all(
    ["Not Started", "In Progress", "Blocked", "Complete"].map(async (status) => ({
      status,
      count: await prisma.task.count({ where: { status, archived: false } })
    }))
  );

  const overdueTasks = tasks.filter((task) => isOverdue(task.dueDate));

  return (
    <>
      <PageHeader title="Mission Control" eyebrow="Today">
        <Link href="/tasks" className="btn-secondary">
          Board <ArrowRight size={16} />
        </Link>
        <Link href="/matters" className="btn-primary">
          <Plus size={16} />
          Matter
        </Link>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="panel rounded-md p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">Priority Tasks</h2>
            {overdueTasks.length > 0 ? <HotBadge label={`${overdueTasks.length} overdue`} /> : null}
          </div>
          <div className="divide-y divide-line">
            {tasks.map((task) => (
              <Link key={task.id} href="/tasks" className="block py-3 hover:bg-field/70">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                  {task.blocked ? <BlockedBadge reason={task.blockedReason} /> : null}
                  <span className="badge">{formatDate(task.dueDate)}</span>
                </div>
                <div className="mt-2 font-bold">{task.title}</div>
                <div className="mt-1 text-sm text-ink/60">
                  {task.workstream.name}
                  {task.matter ? ` / ${task.matter.name}` : ""}
                </div>
              </Link>
            ))}
            {tasks.length === 0 ? <p className="py-6 text-sm text-ink/55">No active tasks. The board is clear.</p> : null}
          </div>
        </section>

        <section className="panel rounded-md p-4">
          <h2 className="mb-3 text-base font-bold">Quick Create Task</h2>
          <TaskForm workstreams={workstreams} matters={matters} compact />
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-4">
        <section className="panel rounded-md p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
            <Clock3 size={17} /> Status Counts
          </h2>
          <div className="space-y-2">
            {statusCounts.map((count) => (
              <div key={count.status} className="flex items-center justify-between rounded-md bg-field px-3 py-2 text-sm">
                <span>{count.status}</span>
                <strong>{count.count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel rounded-md p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
            <AlertTriangle size={17} /> Blocked Matters
          </h2>
          <div className="space-y-3">
            {blockedMatters.map((matter) => (
              <Link key={matter.id} href={`/matters/${matter.id}`} className="block rounded-md bg-field p-3 hover:bg-line/40">
                <div className="font-bold">{matter.name}</div>
                <div className="mt-1 text-xs text-ink/60">{matter.blockedReason || matter.status}</div>
              </Link>
            ))}
            {blockedMatters.length === 0 ? <p className="text-sm text-ink/55">No blocked matters.</p> : null}
          </div>
        </section>

        <section className="panel rounded-md p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
            <FileWarning size={17} /> Evidence Gaps
          </h2>
          <div className="space-y-3">
            {evidenceGaps.map((gap) => (
              <Link key={gap.id} href={`/matters/${gap.matterId}`} className="block rounded-md bg-field p-3 hover:bg-line/40">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold">{gap.label}</div>
                  <span className="badge">{gap.status}</span>
                </div>
                <div className="mt-1 text-xs text-ink/60">{gap.matter.name}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel rounded-md p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
            <CheckCircle2 size={17} /> Codex Queue
          </h2>
          <div className="space-y-3">
            {drafts.map((draft) => (
              <Link key={draft.id} href="/drafts" className="block rounded-md bg-field p-3 hover:bg-line/40">
                <div className="font-bold">{draft.title}</div>
                <div className="mt-1 text-xs text-ink/60">{draft.type}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="panel mt-4 rounded-md p-4">
        <h2 className="mb-3 text-base font-bold">Recently Updated Notes</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {notes.map((note) => (
            <Link key={note.id} href="/notes" className="rounded-md bg-field p-3 hover:bg-line/40">
              <div className="font-bold">{note.title}</div>
              <p className="mt-1 line-clamp-3 text-sm text-ink/60">{note.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
