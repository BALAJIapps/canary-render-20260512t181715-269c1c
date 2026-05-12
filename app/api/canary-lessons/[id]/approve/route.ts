import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { canaryLesson } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { review_note, status } = body as { review_note?: string; status?: string };

    const newStatus = status === "rejected" ? "rejected" : "approved";

    const [updated] = await db
      .update(canaryLesson)
      .set({
        status: newStatus,
        reviewedAt: new Date(),
        reviewNote: review_note ? String(review_note) : null,
        updatedAt: new Date(),
      })
      .where(eq(canaryLesson.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Lesson not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, lesson: updated });
  } catch (err) {
    console.error("[canary-lessons approve PATCH]", err);
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_ERROR", message: "Failed to approve lesson" } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}
