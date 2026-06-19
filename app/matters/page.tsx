import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MatterForm } from "@/components/Forms";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { prisma } from "@/lib/prisma";

export default async function MattersPage() {
  const [workstreams, matters] = await Promise.all([
    prisma.workstream.findMany({ orderBy: { name: "asc" } }),
    prisma.matter.findMany({
      include: {
        workstream: true,
        _count: { select: { tasks: true, notes: true, evidenceGaps: true } }
      },
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }]
    })
  ]);

  return (
    <>
      <PageHeader title="Matters" eyebrow="Workstreams and files" />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <section className="panel rounded-md">
          <div className="grid gap-px overflow-hidden rounded-md bg-line">
            {matters.map((matter) => (
              <Link key={matter.id} href={`/matters/${matter.id}`} className="bg-white p-4 hover:bg-field">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={matter.priority} />
                      <StatusBadge status={matter.status} />
                      <span className="badge">{matter.entity}</span>
                    </div>
                    <h2 className="mt-2 text-base font-bold">{matter.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/60">{matter.summary || matter.nextAction}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm font-semibold text-ink/55">
                    <span>{matter._count.tasks} tasks</span>
                    <span>{matter._count.evidenceGaps} gaps</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-ink/55">
                  <span>{matter.type}</span>
                  <span>/</span>
                  <span>{matter.workstream.name}</span>
                  {matter.nextAction ? (
                    <>
                      <span>/</span>
                      <span>{matter.nextAction}</span>
                    </>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
        <aside className="panel rounded-md p-4">
          <h2 className="mb-3 text-base font-bold">Create Matter</h2>
          <MatterForm workstreams={workstreams} />
        </aside>
      </div>
    </>
  );
}
