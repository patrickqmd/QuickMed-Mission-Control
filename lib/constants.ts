export const TASK_STATUSES = ["Not Started", "In Progress", "Blocked", "Complete"] as const;
export const PRIORITIES = ["Urgent", "High", "Normal", "Low"] as const;

export const MATTER_TYPES = [
  "AOB recovery",
  "insurer reimbursement",
  "litigation",
  "software build",
  "counsel request",
  "operations",
  "business development"
] as const;

export const ENTITIES = [
  "QuickMed Diagnostics",
  "Praesidium Diagnostics",
  "Sameday Health",
  "Sameday Testing",
  "Sameday Technologies",
  "Signal Diagnostics",
  "Flow Health",
  "Other"
] as const;

export const EVIDENCE_STATUSES = ["Missing", "Requested", "Received", "Reviewed", "Not Available"] as const;

export const DRAFT_TYPES = [
  "counsel email",
  "patient outreach",
  "insurer follow-up",
  "settlement summary",
  "timeline",
  "issue list",
  "evidence packet summary",
  "Codex build brief",
  "product idea",
  "prompt/playbook"
] as const;
