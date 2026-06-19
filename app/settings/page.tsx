import { PageHeader } from "@/components/PageHeader";
import { ENTITIES, EVIDENCE_STATUSES, MATTER_TYPES, PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const workstreams = await prisma.workstream.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <PageHeader title="Settings" eyebrow="Local defaults" />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel rounded-md p-4">
          <h2 className="mb-3 text-base font-bold">Workstreams</h2>
          <div className="space-y-3">
            {workstreams.map((workstream) => (
              <div key={workstream.id} className="rounded-md bg-field p-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: workstream.color }} />
                  <div className="font-bold">{workstream.name}</div>
                  <span className="badge">{workstream.priority}</span>
                </div>
                <p className="mt-2 text-sm text-ink/60">{workstream.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <Defaults title="Entities" items={ENTITIES} />
          <Defaults title="Matter Types" items={MATTER_TYPES} />
          <Defaults title="Task Statuses" items={TASK_STATUSES} />
          <Defaults title="Priorities" items={PRIORITIES} />
          <Defaults title="Evidence Statuses" items={EVIDENCE_STATUSES} />
        </section>
      </div>
      <section className="panel mt-4 rounded-md p-4">
        <h2 className="text-base font-bold">AOB Matter Guardrail</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-ink/70">
          QuickMed AOB matters should not be framed as ordinary patient medical debt. The patient balance remains $0; the
          dispute concerns insurer-paid funds allegedly issued to and retained by the patient despite assignment-of-benefits
          language.
        </p>
      </section>
    </>
  );
}

function Defaults({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="panel rounded-md p-4">
      <h2 className="mb-3 text-base font-bold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="badge">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
