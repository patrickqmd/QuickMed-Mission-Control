import { PageHeader } from "@/components/PageHeader";
import { NoteForm } from "@/components/Forms";
import { prisma } from "@/lib/prisma";
import { formatDate, splitTags } from "@/lib/utils";

export default async function NotesPage() {
  const [notes, matters, tasks] = await Promise.all([
    prisma.note.findMany({
      include: { matter: true, task: true },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.matter.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.task.findMany({ where: { archived: false }, orderBy: { title: "asc" }, select: { id: true, title: true } })
  ]);

  return (
    <>
      <PageHeader title="Notes" eyebrow="Calls, summaries, strategy" />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <article key={note.id} className="panel rounded-md p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold">{note.title}</h2>
                  <div className="mt-1 text-xs font-semibold text-ink/50">{formatDate(note.updatedAt)}</div>
                </div>
                {note.matter ? <span className="badge">{note.matter.name}</span> : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/70">{note.body}</p>
              {note.task ? <div className="mt-3 badge">Task: {note.task.title}</div> : null}
              <div className="mt-3 flex flex-wrap gap-1">
                {splitTags(note.tags).map((tag) => (
                  <span key={tag} className="text-xs font-semibold text-ink/45">
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
        <aside className="panel h-fit rounded-md p-4">
          <h2 className="mb-3 text-base font-bold">Add Note</h2>
          <NoteForm matters={matters} tasks={tasks.map((task) => ({ id: task.id, name: task.title }))} />
        </aside>
      </div>
    </>
  );
}
