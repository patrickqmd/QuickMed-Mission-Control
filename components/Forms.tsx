import { DRAFT_TYPES, ENTITIES, EVIDENCE_STATUSES, MATTER_TYPES, PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { createDraft, createEvidenceGap, createMatter, createNote, createTask } from "@/lib/actions";

type Option = { id: string; name: string };

export function TaskForm({
  workstreams,
  matters,
  defaultStatus = "Not Started",
  defaultMatterId = "",
  compact = false
}: {
  workstreams: Option[];
  matters: Option[];
  defaultStatus?: string;
  defaultMatterId?: string;
  compact?: boolean;
}) {
  return (
    <form action={createTask} className="grid gap-3">
      <input className="field" name="title" placeholder="Task title" required />
      {!compact ? <textarea className="field" name="description" placeholder="Notes or description" /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="field" name="status" defaultValue={defaultStatus}>
          {TASK_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select className="field" name="priority" defaultValue="Normal">
          {PRIORITIES.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="field" name="workstreamId" required defaultValue={workstreams[0]?.id}>
          {workstreams.map((workstream) => (
            <option key={workstream.id} value={workstream.id}>
              {workstream.name}
            </option>
          ))}
        </select>
        <select className="field" name="matterId" defaultValue={defaultMatterId}>
          <option value="">No matter</option>
          {matters.map((matter) => (
            <option key={matter.id} value={matter.id}>
              {matter.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="field" type="date" name="dueDate" />
        <input className="field" name="tags" placeholder="tags, comma separated" />
      </div>
      <input className="field" name="blockedReason" placeholder="Blocked reason, if any" />
      <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
        <input type="checkbox" name="blocked" />
        Mark blocked
      </label>
      <button className="btn-primary" type="submit">
        Create Task
      </button>
    </form>
  );
}

export function MatterForm({ workstreams }: { workstreams: Option[] }) {
  return (
    <form action={createMatter} className="grid gap-3">
      <input className="field" name="name" placeholder="Matter name" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="field" name="type" defaultValue="AOB recovery">
          {MATTER_TYPES.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <select className="field" name="entity" defaultValue="QuickMed Diagnostics">
          {ENTITIES.map((entity) => (
            <option key={entity}>{entity}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <select className="field" name="status" defaultValue="Active">
          {["Active", "Waiting", "Blocked", "Complete", "Archived"].map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select className="field" name="priority" defaultValue="Normal">
          {PRIORITIES.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
        <input className="field" name="owner" defaultValue="Patrick" />
      </div>
      <select className="field" name="workstreamId" required defaultValue={workstreams[0]?.id}>
        {workstreams.map((workstream) => (
          <option key={workstream.id} value={workstream.id}>
            {workstream.name}
          </option>
        ))}
      </select>
      <textarea className="field" name="summary" placeholder="Summary" />
      <input className="field" name="nextAction" placeholder="Next action" />
      <input className="field" name="blockedReason" placeholder="Blocked reason" />
      <button className="btn-primary" type="submit">
        Create Matter
      </button>
    </form>
  );
}

export function NoteForm({ matters, tasks, matterId }: { matters: Option[]; tasks: Option[]; matterId?: string }) {
  return (
    <form action={createNote} className="grid gap-3">
      <input className="field" name="title" placeholder="Note title" required />
      <textarea className="field" name="body" placeholder="Note body" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="field" name="matterId" defaultValue={matterId ?? ""}>
          <option value="">No matter</option>
          {matters.map((matter) => (
            <option key={matter.id} value={matter.id}>
              {matter.name}
            </option>
          ))}
        </select>
        <select className="field" name="taskId" defaultValue="">
          <option value="">No task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name}
            </option>
          ))}
        </select>
      </div>
      <input className="field" name="tags" placeholder="tags, comma separated" />
      <button className="btn-primary" type="submit">
        Add Note
      </button>
    </form>
  );
}

export function EvidenceGapForm({ matterId }: { matterId: string }) {
  return (
    <form action={createEvidenceGap} className="grid gap-3">
      <input type="hidden" name="matterId" value={matterId} />
      <input className="field" name="label" placeholder="Evidence item" required />
      <textarea className="field" name="description" placeholder="Description" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="field" name="status" defaultValue="Missing">
          {EVIDENCE_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <input className="field" name="source" placeholder="Source" />
      </div>
      <input className="field" name="nextAction" placeholder="Next action" />
      <button className="btn-primary" type="submit">
        Add Evidence Gap
      </button>
    </form>
  );
}

export function DraftForm({ workstreams, matters }: { workstreams: Option[]; matters: Option[] }) {
  return (
    <form action={createDraft} className="grid gap-3">
      <input className="field" name="title" placeholder="Draft or build-spec title" required />
      <select className="field" name="type" defaultValue="Codex build brief">
        {DRAFT_TYPES.map((type) => (
          <option key={type}>{type}</option>
        ))}
      </select>
      <textarea className="field min-h-[180px]" name="body" placeholder="Plain text or Markdown" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="field" name="workstreamId" defaultValue="">
          <option value="">No workstream</option>
          {workstreams.map((workstream) => (
            <option key={workstream.id} value={workstream.id}>
              {workstream.name}
            </option>
          ))}
        </select>
        <select className="field" name="matterId" defaultValue="">
          <option value="">No matter</option>
          {matters.map((matter) => (
            <option key={matter.id} value={matter.id}>
              {matter.name}
            </option>
          ))}
        </select>
      </div>
      <input className="field" name="tags" placeholder="tags, comma separated" />
      <button className="btn-primary" type="submit">
        Save Draft
      </button>
    </form>
  );
}
