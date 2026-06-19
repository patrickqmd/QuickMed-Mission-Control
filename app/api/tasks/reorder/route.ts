import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    columns: Record<string, string[]>;
  };

  await prisma.$transaction(
    Object.entries(body.columns).flatMap(([status, ids]) =>
      ids.map((id, index) =>
        prisma.task.update({
          where: { id },
          data: {
            status,
            sortOrder: index + 1,
            blocked: status === "Blocked" ? true : undefined
          }
        })
      )
    )
  );

  return NextResponse.json({ ok: true });
}
