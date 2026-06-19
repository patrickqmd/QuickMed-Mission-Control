import { PageHeader } from "@/components/PageHeader";
import { DraftForm } from "@/components/Forms";
import { prisma } from "@/lib/prisma";
import { formatDate, splitTags } from "@/lib/utils";

export default async function DraftsPage({ searchParams }: { searchParams?: { type?: string } }) {
  const [drafts, workstreams, matters] = await Promise.all([
    prisma.draft.findMany({
      where: searchParams?.type ? { type: searchParams.type } : undefined,
      include: { workstream: true, matter: true },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.workstream.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.matter.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);

  const types = Array.from(new Set(drafts.map((draft) => draft.type))).sort();

  return (
    <>
      <PageHeader title="Drafts and Build Specs" eyebrow="Plain text library">
        <form className="flex gap-2">
          <select className="field w-auto min-w-48" name="type" defaultValue={searchParams?.type ?? ""}>
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <button className="btn-secondary" type="submit">
            Filter
          </button>
        </form>
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="space-y-3">
          {drafts.map((draft) => (
            <article key={draft.id} className="panel rounded-md p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge">{draft.type}</span>
                    {draft.workstream ? <span className="badge">{draft.workstream.name}</span> : null}
                    {draft.matter ? <span className="badge">{draft.matter.name}</span> : null}
                  </div>
                  <h2 className="mt-2 text-base font-bold">{draft.title}</h2>
                </div>
                <div className="text-xs font-semibold text-ink/50">{formatDate(draft.updatedAt)}</div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-md bg-field p-3 text-sm leading-6 text-ink/75">{draft.body}</pre>
              <div className="mt-3 flex flex-wrap gap-1">
                {splitTags(draft.tags).map((tag) => (
                  <span key={tag} className="text-xs font-semibold text-ink/45">
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
        <aside className="panel h-fit rounded-md p-4">
          <h2 className="mb-3 text-base font-bold">Save Draft or Spec</h2>
          <DraftForm workstreams={workstreams} matters={matters} />
        </aside>
      </div>
    </>
  );
}
