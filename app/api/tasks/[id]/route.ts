import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json()) as {
    status?: string;
    sortOrder?: number;
    blocked?: boolean;
    blockedReason?: string;
  };

  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      status: body.status,
      sortOrder: body.sortOrder,
      blocked: body.blocked,
      blockedReason: body.blockedReason
    }
  });

  return NextResponse.json(task);
}
