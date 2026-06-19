"use client";

import { useMemo, useState, useTransition } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { archiveTask, updateTask } from "@/lib/actions";
import { PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { cn, dateInput, formatDate, isOverdue, splitTags } from "@/lib/utils";
import { BlockedBadge, PriorityBadge, StatusBadge } from "@/components/Badges";

export type BoardTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  tags: string;
  sortOrder: number;
  blocked: boolean;
  blockedReason: string;
  workstreamId: string;
  workstream: { id: string; name: string; color: string };
  matterId: string | null;
  matter: { id: string; name: string; entity: string } | null;
};

type Option = { id: string; name: string };

function groupTasks(tasks: BoardTask[]) {
  return TASK_STATUSES.reduce<Record<string, BoardTask[]>>((acc, status) => {
    acc[status] = tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    return acc;
  }, {});
}

function findContainer(columns: Record<string, BoardTask[]>, id: string) {
  if (id in columns) return id;
  return Object.keys(columns).find((status) => columns[status].some((task) => task.id === id));
}

export function TaskBoard({
  tasks,
  workstreams,
  matters
}: {
  tasks: BoardTask[];
  workstreams: Option[];
  matters: Option[];
}) {
  const [columns, setColumns] = useState(groupTasks(tasks));
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const counts = useMemo(
    () => TASK_STATUSES.map((status) => ({ status, count: columns[status]?.length ?? 0 })),
    [columns]
  );

  async function persist(nextColumns: Record<string, BoardTask[]>) {
    await fetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        columns: Object.fromEntries(Object.entries(nextColumns).map(([status, items]) => [status, items.map((item) => item.id)]))
      })
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(columns, String(active.id));
    const overContainer = findContainer(columns, String(over.id));
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setColumns((current) => {
      const activeItems = current[activeContainer];
      const overItems = current[overContainer];
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      const overIndex = overItems.findIndex((item) => item.id === over.id);
      const task = activeItems[activeIndex];
      const insertAt = overIndex >= 0 ? overIndex : overItems.length;

      return {
        ...current,
        [activeContainer]: activeItems.filter((item) => item.id !== active.id),
        [overContainer]: [
          ...overItems.slice(0, insertAt),
          { ...task, status: overContainer, blocked: overContainer === "Blocked" ? true : task.blocked },
          ...overItems.slice(insertAt)
        ]
      };
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(columns, String(active.id));
    const overContainer = findContainer(columns, String(over.id));
    if (!activeContainer || !overContainer) return;

    const next = { ...columns };
    if (activeContainer === overContainer) {
      const activeIndex = columns[activeContainer].findIndex((item) => item.id === active.id);
      const overIndex = columns[overContainer].findIndex((item) => item.id === over.id);
      next[activeContainer] = arrayMove(columns[activeContainer], activeIndex, overIndex);
    }

    setColumns(next);
    startTransition(() => {
      void persist(next);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {counts.map((item) => (
          <span key={item.status} className="badge">
            {item.status}: {item.count}
          </span>
        ))}
        {isPending ? <span className="badge border-brand/25 bg-brand/10 text-brand">Saving order</span> : null}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4">
          {TASK_STATUSES.map((status) => (
            <TaskColumn key={status} status={status} tasks={columns[status] ?? []} workstreams={workstreams} matters={matters} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function TaskColumn({
  status,
  tasks,
  workstreams,
  matters
}: {
  status: string;
  tasks: BoardTask[];
  workstreams: Option[];
  matters: Option[];
}) {
  const { setNodeRef } = useDroppable({ id: status });
  return (
    <section ref={setNodeRef} className="min-h-[280px] rounded-md border border-line bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <StatusBadge status={status} />
        <span className="text-xs font-bold text-ink/45">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} workstreams={workstreams} matters={matters} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}

function TaskCard({ task, workstreams, matters }: { task: BoardTask; workstreams: Option[]; matters: Option[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn("rounded-md border border-line bg-field p-3 shadow-sm", isDragging && "opacity-70")}
    >
      <div className="flex items-start gap-2">
        <button className="mt-0.5 text-ink/35 hover:text-ink" type="button" aria-label="Drag task" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {task.blocked ? <BlockedBadge reason={task.blockedReason} /> : null}
          </div>
          <h3 className="mt-2 text-sm font-bold leading-snug text-ink">{task.title}</h3>
          {task.description ? <p className="mt-1 line-clamp-3 text-xs leading-5 text-ink/65">{task.description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="badge" style={{ borderColor: `${task.workstream.color}55`, background: `${task.workstream.color}12` }}>
              {task.workstream.name}
            </span>
            {task.matter ? <span className="badge">{task.matter.name}</span> : null}
            <span className={cn("badge", isOverdue(task.dueDate) && "border-urgent/25 bg-urgent/10 text-urgent")}>
              {formatDate(task.dueDate)}
            </span>
          </div>
          {splitTags(task.tags).length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {splitTags(task.tags).map((tag) => (
                <span key={tag} className="text-[11px] font-semibold text-ink/45">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          {task.blockedReason ? <p className="mt-2 rounded-md bg-warn/10 p-2 text-xs text-warn">{task.blockedReason}</p> : null}
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-bold text-brand">Edit</summary>
            <form action={updateTask} className="mt-3 grid gap-2">
              <input type="hidden" name="id" value={task.id} />
              <input className="field" name="title" defaultValue={task.title} />
              <textarea className="field" name="description" defaultValue={task.description} />
              <div className="grid gap-2 sm:grid-cols-2">
                <select className="field" name="status" defaultValue={task.status}>
                  {TASK_STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <select className="field" name="priority" defaultValue={task.priority}>
                  {PRIORITIES.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <select className="field" name="workstreamId" defaultValue={task.workstreamId}>
                {workstreams.map((workstream) => (
                  <option key={workstream.id} value={workstream.id}>
                    {workstream.name}
                  </option>
                ))}
              </select>
              <select className="field" name="matterId" defaultValue={task.matterId ?? ""}>
                <option value="">No matter</option>
                {matters.map((matter) => (
                  <option key={matter.id} value={matter.id}>
                    {matter.name}
                  </option>
                ))}
              </select>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className="field" type="date" name="dueDate" defaultValue={dateInput(task.dueDate)} />
                <input className="field" name="tags" defaultValue={task.tags} />
              </div>
              <input className="field" name="blockedReason" defaultValue={task.blockedReason} placeholder="Blocked reason" />
              <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
                <input type="checkbox" name="blocked" defaultChecked={task.blocked} />
                Mark blocked
              </label>
              <div className="flex gap-2">
                <button className="btn-primary flex-1" type="submit">
                  Save
                </button>
              </div>
            </form>
            <form action={archiveTask} className="mt-2">
              <input type="hidden" name="id" value={task.id} />
              <button className="btn-secondary w-full text-urgent" type="submit">
                <Trash2 size={14} />
                Archive
              </button>
            </form>
          </details>
        </div>
      </div>
    </article>
  );
}
