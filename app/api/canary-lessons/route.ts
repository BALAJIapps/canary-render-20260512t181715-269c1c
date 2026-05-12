import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { canaryLesson } from "@/db/schema";
import { desc, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const category = searchParams.get("category") ?? "";

    let lessons;
    if (q) {
      lessons = await db
        .select()
        .from(canaryLesson)
        .where(
          or(
            ilike(canaryLesson.title, `%${q}%`),
            ilike(canaryLesson.category, `%${q}%`),
            ilike(canaryLesson.teacherEmail, `%${q}%`)
          )
        )
        .orderBy(desc(canaryLesson.createdAt))
        .limit(50);
    } else if (category) {
      lessons = await db
        .select()
        .from(canaryLesson)
        .where(ilike(canaryLesson.category, `%${category}%`))
        .orderBy(desc(canaryLesson.createdAt))
        .limit(50);
    } else {
      lessons = await db
        .select()
        .from(canaryLesson)
        .orderBy(desc(canaryLesson.createdAt))
        .limit(50);
    }

    return NextResponse.json({ ok: true, lessons });
  } catch (err) {
    console.error("[canary-lessons GET]", err);
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_ERROR", message: "Failed to fetch lessons" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      teacher_email,
      title,
      category,
      lesson_text,
      asset_name,
      asset_url,
      price_cents,
      ai_summary,
    } = body;

    if (!teacher_email || !title || !lesson_text) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "teacher_email, title, and lesson_text are required" } },
        { status: 400 }
      );
    }

    const [lesson] = await db
      .insert(canaryLesson)
      .values({
        teacherEmail: String(teacher_email),
        title: String(title),
        category: String(category ?? "general"),
        lessonText: String(lesson_text),
        assetName: asset_name ? String(asset_name) : null,
        assetUrl: asset_url ? String(asset_url) : null,
        priceCents: Number(price_cents ?? 0),
        aiSummary: ai_summary ? String(ai_summary) : null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ ok: true, lesson }, { status: 201 });
  } catch (err) {
    console.error("[canary-lessons POST]", err);
    return NextResponse.json(
      { ok: false, error: { code: "INSERT_ERROR", message: "Failed to create lesson" } },
      { status: 500 }
    );
  }
}
