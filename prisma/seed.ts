import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const workstreams = [
  {
    name: "QuickMed AOB recoveries",
    description: "Assignment-of-benefits recovery files, evidence packets, patient outreach, and insurer-paid funds follow-up.",
    priority: "Urgent",
    color: "#176b5b",
    icon: "ShieldCheck"
  },
  {
    name: "Insurer reimbursement",
    description: "Claims-data work, payment trails, reimbursement disputes, and payer follow-up.",
    priority: "High",
    color: "#2f6f9f",
    icon: "ReceiptText"
  },
  {
    name: "Counsel / litigation",
    description: "Counsel requests, litigation follow-up, limitations analysis, strategy notes, and issue lists.",
    priority: "High",
    color: "#6f4e9f",
    icon: "Scale"
  },
  {
    name: "Signal / Flow Health",
    description: "Signal Diagnostics and Flow Health matters requiring separate entity tracking and follow-up.",
    priority: "Normal",
    color: "#59714a",
    icon: "Activity"
  },
  {
    name: "Software build",
    description: "Codex-ready specs, build queue, product ideas, local tools, and shipped software notes.",
    priority: "High",
    color: "#9b5d22",
    icon: "Code2"
  },
  {
    name: "Admin / operations",
    description: "Internal operating tasks, process cleanup, records, and company administration.",
    priority: "Normal",
    color: "#686f76",
    icon: "ClipboardList"
  },
  {
    name: "Business development",
    description: "Opportunity tracking, partner follow-up, and relationship-building work.",
    priority: "Normal",
    color: "#ad6a5a",
    icon: "Handshake"
  }
];

async function main() {
  for (const workstream of workstreams) {
    await prisma.workstream.upsert({
      where: { name: workstream.name },
      update: workstream,
      create: workstream
    });
  }

  const aob = await prisma.workstream.findUniqueOrThrow({ where: { name: "QuickMed AOB recoveries" } });
  const counsel = await prisma.workstream.findUniqueOrThrow({ where: { name: "Counsel / litigation" } });
  const software = await prisma.workstream.findUniqueOrThrow({ where: { name: "Software build" } });

  const matterCount = await prisma.matter.count();
  if (matterCount === 0) {
    const recovery = await prisma.matter.create({
      data: {
        name: "AOB recovery file intake template",
        type: "AOB recovery",
        entity: "QuickMed Diagnostics",
        status: "Active",
        priority: "Urgent",
        owner: "Patrick",
        summary:
          "Template matter for tracking AOB recovery files. Patient balance remains $0; dispute concerns insurer-paid funds allegedly retained despite AOB language.",
        nextAction: "Fill evidence checklist for first active files.",
        blockedReason: "Waiting on initial claim/check data imports.",
        workstreamId: aob.id
      }
    });

    await prisma.evidenceGap.createMany({
      data: [
        {
          matterId: recovery.id,
          label: "AOB / intake proof and timestamp",
          description: "Attach intake proof showing assignment language and timing.",
          status: "Missing",
          source: "Intake records",
          nextAction: "Locate intake packet and timestamp export."
        },
        {
          matterId: recovery.id,
          label: "Check issue and cashing dates",
          description: "Keep check issue, receipt, and deposit/cashing dates separate for limitations analysis.",
          status: "Requested",
          source: "Claims/payment trail",
          nextAction: "Request payer ledger or portal screenshot."
        },
        {
          matterId: recovery.id,
          label: "Outreach history",
          description: "Calls, emails, letters, and any response history.",
          status: "Missing",
          source: "Internal notes",
          nextAction: "Collect prior outreach log."
        }
      ]
    });

    await prisma.task.createMany({
      data: [
        {
          title: "Build first active AOB evidence packet",
          description: "Use the evidence-gap list as the packet checklist. Keep patient balance language precise.",
          status: "In Progress",
          priority: "Urgent",
          dueDate: new Date(),
          tags: "evidence,AOB,packet",
          sortOrder: 1,
          blocked: false,
          workstreamId: aob.id,
          matterId: recovery.id
        },
        {
          title: "Confirm limitations date fields for recovery files",
          description: "Separate service, billing, check issue, receipt, cashing/deposit, discovery, outreach, and filing dates.",
          status: "Blocked",
          priority: "High",
          dueDate: new Date(Date.now() + 86400000),
          tags: "limitations,counsel",
          sortOrder: 1,
          blocked: true,
          blockedReason: "Need counsel review of preferred date taxonomy.",
          workstreamId: counsel.id,
          matterId: recovery.id
        }
      ]
    });

    await prisma.note.create({
      data: {
        title: "AOB framing guardrail",
        body:
          "For QuickMed AOB matters, do not imply ordinary patient medical debt. The working position is patient balance remains $0; the dispute concerns insurer-paid funds allegedly issued to and retained by the patient despite assignment-of-benefits language.",
        tags: "AOB,language,guardrail",
        matterId: recovery.id
      }
    });
  }

  const draftCount = await prisma.draft.count();
  if (draftCount === 0) {
    await prisma.draft.createMany({
      data: [
        {
          title: "Codex build brief: evidence packet generator",
          type: "Codex build brief",
          body:
            "Build a local tool that takes a matter, renders an evidence checklist, and exports a packet summary with missing/requested/received evidence grouped by source.",
          tags: "codex,software,evidence",
          workstreamId: software.id
        },
        {
          title: "Counsel email: limitations date taxonomy",
          type: "counsel email",
          body:
            "Draft request for counsel to confirm which dates should be captured and how to preserve issue-specific limitations analysis across QuickMed AOB recovery files.",
          tags: "counsel,limitations,AOB",
          workstreamId: counsel.id
        }
      ]
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
