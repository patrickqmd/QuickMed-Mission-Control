"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function stringValue(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalValue(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  return value.length > 0 ? value : null;
}

function optionalDate(formData: FormData, key: string) {
  const value = optionalValue(formData, key);
  return value ? new Date(`${value}T12:00:00`) : null;
}

export async function createTask(formData: FormData) {
  const status = stringValue(formData, "status", "Not Started");
  const count = await prisma.task.count({ where: { status, archived: false } });
  const blocked = formData.get("blocked") === "on" || status === "Blocked";

  await prisma.task.create({
    data: {
      title: stringValue(formData, "title", "Untitled task"),
      description: stringValue(formData, "description"),
      status,
      priority: stringValue(formData, "priority", "Normal"),
      dueDate: optionalDate(formData, "dueDate"),
      tags: stringValue(formData, "tags"),
      sortOrder: count + 1,
      blocked,
      blockedReason: stringValue(formData, "blockedReason"),
      workstreamId: stringValue(formData, "workstreamId"),
      matterId: optionalValue(formData, "matterId")
    }
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function updateTask(formData: FormData) {
  const id = stringValue(formData, "id");
  const status = stringValue(formData, "status", "Not Started");
  const blocked = formData.get("blocked") === "on" || status === "Blocked";

  await prisma.task.update({
    where: { id },
    data: {
      title: stringValue(formData, "title", "Untitled task"),
      description: stringValue(formData, "description"),
      status,
      priority: stringValue(formData, "priority", "Normal"),
      dueDate: optionalDate(formData, "dueDate"),
      tags: stringValue(formData, "tags"),
      blocked,
      blockedReason: stringValue(formData, "blockedReason"),
      workstreamId: stringValue(formData, "workstreamId"),
      matterId: optionalValue(formData, "matterId")
    }
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/matters");
}

export async function archiveTask(formData: FormData) {
  await prisma.task.update({
    where: { id: stringValue(formData, "id") },
    data: { archived: true }
  });
  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function createMatter(formData: FormData) {
  const matter = await prisma.matter.create({
    data: {
      name: stringValue(formData, "name", "Untitled matter"),
      type: stringValue(formData, "type", "operations"),
      entity: stringValue(formData, "entity", "Other"),
      status: stringValue(formData, "status", "Active"),
      priority: stringValue(formData, "priority", "Normal"),
      owner: stringValue(formData, "owner", "Patrick"),
      summary: stringValue(formData, "summary"),
      nextAction: stringValue(formData, "nextAction"),
      blockedReason: stringValue(formData, "blockedReason"),
      workstreamId: stringValue(formData, "workstreamId")
    }
  });

  revalidatePath("/");
  revalidatePath("/matters");
  redirect(`/matters/${matter.id}`);
}

export async function updateMatter(formData: FormData) {
  const id = stringValue(formData, "id");
  await prisma.matter.update({
    where: { id },
    data: {
      name: stringValue(formData, "name", "Untitled matter"),
      type: stringValue(formData, "type", "operations"),
      entity: stringValue(formData, "entity", "Other"),
      status: stringValue(formData, "status", "Active"),
      priority: stringValue(formData, "priority", "Normal"),
      owner: stringValue(formData, "owner", "Patrick"),
      summary: stringValue(formData, "summary"),
      nextAction: stringValue(formData, "nextAction"),
      blockedReason: stringValue(formData, "blockedReason"),
      workstreamId: stringValue(formData, "workstreamId")
    }
  });

  revalidatePath("/");
  revalidatePath("/matters");
  revalidatePath(`/matters/${id}`);
}

export async function createNote(formData: FormData) {
  await prisma.note.create({
    data: {
      title: stringValue(formData, "title", "Untitled note"),
      body: stringValue(formData, "body"),
      tags: stringValue(formData, "tags"),
      matterId: optionalValue(formData, "matterId"),
      taskId: optionalValue(formData, "taskId")
    }
  });

  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/matters");
}

export async function createEvidenceGap(formData: FormData) {
  const matterId = stringValue(formData, "matterId");
  await prisma.evidenceGap.create({
    data: {
      label: stringValue(formData, "label", "Untitled evidence gap"),
      description: stringValue(formData, "description"),
      status: stringValue(formData, "status", "Missing"),
      source: stringValue(formData, "source"),
      nextAction: stringValue(formData, "nextAction"),
      matterId
    }
  });

  revalidatePath("/");
  revalidatePath(`/matters/${matterId}`);
}

export async function updateEvidenceGapStatus(formData: FormData) {
  const matterId = stringValue(formData, "matterId");
  await prisma.evidenceGap.update({
    where: { id: stringValue(formData, "id") },
    data: { status: stringValue(formData, "status", "Missing") }
  });

  revalidatePath("/");
  revalidatePath(`/matters/${matterId}`);
}

export async function createDraft(formData: FormData) {
  await prisma.draft.create({
    data: {
      title: stringValue(formData, "title", "Untitled draft"),
      type: stringValue(formData, "type", "prompt/playbook"),
      body: stringValue(formData, "body"),
      tags: stringValue(formData, "tags"),
      matterId: optionalValue(formData, "matterId"),
      workstreamId: optionalValue(formData, "workstreamId")
    }
  });

  revalidatePath("/");
  revalidatePath("/drafts");
}
