import { AlertTriangle, CheckCircle2, Circle, Clock3, Flame, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Urgent: "border-urgent/25 bg-urgent/10 text-urgent",
    High: "border-warn/25 bg-warn/10 text-warn",
    Normal: "border-brand/20 bg-brand/10 text-brand",
    Low: "border-ink/15 bg-field text-ink/60"
  };
  return <span className={cn("badge", styles[priority])}>{priority}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const Icon =
    status === "Complete" ? CheckCircle2 : status === "Blocked" ? AlertTriangle : status === "In Progress" ? Clock3 : Circle;
  return (
    <span className="badge">
      <Icon size={13} />
      {status}
    </span>
  );
}

export function BlockedBadge({ reason }: { reason?: string }) {
  return (
    <span className="badge border-warn/30 bg-warn/10 text-warn" title={reason}>
      <MinusCircle size={13} />
      Blocked
    </span>
  );
}

export function HotBadge({ label }: { label: string }) {
  return (
    <span className="badge border-urgent/25 bg-urgent/10 text-urgent">
      <Flame size={13} />
      {label}
    </span>
  );
}
