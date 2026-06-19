import { PageHeader } from "@/components/PageHeader";
import { TaskForm } from "@/components/Forms";
import { TaskBoard } from "@/components/TaskBoard";
import { prisma } from "@/lib/prisma";

export default async function TasksPage({
  searchParams
}: {
  searchParams?: { workstream?: string; priority?: string; blocked?: string; due?: string };
}) {
  const [workstreams, matters] = await Promise.all([
    prisma.workstream.findMany({ orderBy: { name: "asc" } }),
    prisma.matter.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);

  const where = {
    archived: false,
    ...(searchParams?.workstream ? { workstreamId: searchParams.workstream } : {}),
    ...(searchParams?.priority ? { priority: searchParams.priority } : {}),
    ...(searchParams?.blocked === "true" ? { blocked: true } : {}),
    ...(searchParams?.due === "overdue" ? { dueDate: { lt: new Date() }, status: { not: "Complete" } } : {})
  };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      workstream: { select: { id: true, name: true, color: true } },
      matter: { select: { id: true, name: true, entity: true } }
    },
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }]
  });

  const boardTasks = tasks.map((task) => ({
    ...task,
    dueDate: task.dueDate?.toISOString() ?? null
  }));

  return (
    <>
      <PageHeader title="Task Board" eyebrow="Execution">
        <form className="flex flex-wrap gap-2">
          <select className="field w-auto min-w-44" name="workstream" defaultValue={searchParams?.workstream ?? ""}>
            <option value="">All workstreams</option>
            {workstreams.map((workstream) => (
              <option key={workstream.id} value={workstream.id}>
                {workstream.name}
              </option>
            ))}
          </select>
          <select className="field w-auto" name="priority" defaultValue={searchParams?.priority ?? ""}>
            <option value="">All priorities</option>
            {["Urgent", "High", "Normal", "Low"].map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
          <select className="field w-auto" name="blocked" defaultValue={searchParams?.blocked ?? ""}>
            <option value="">Any block state</option>
            <option value="true">Blocked only</option>
          </select>
          <select className="field w-auto" name="due" defaultValue={searchParams?.due ?? ""}>
            <option value="">Any due date</option>
            <option value="overdue">Overdue</option>
          </select>
          <button className="btn-secondary" type="submit">
            Filter
          </button>
        </form>
      </PageHeader>

      <details className="panel mb-4 rounded-md p-4">
        <summary className="cursor-pointer text-sm font-bold text-brand">Create task</summary>
        <div className="mt-4 max-w-3xl">
          <TaskForm workstreams={workstreams} matters={matters} />
        </div>
      </details>

      <TaskBoard tasks={boardTasks} workstreams={workstreams} matters={matters} />
    </>
  );
}
