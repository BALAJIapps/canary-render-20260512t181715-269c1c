import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { canarySubscription, canaryLesson } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_email, lesson_id } = body;

    if (!student_email || !lesson_id) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "student_email and lesson_id are required" } },
        { status: 400 }
      );
    }

    // Verify lesson exists
    const [lesson] = await db
      .select()
      .from(canaryLesson)
      .where(eq(canaryLesson.id, String(lesson_id)))
      .limit(1);

    if (!lesson) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Lesson not found" } },
        { status: 404 }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
    let stripeCheckoutUrl: string | null = null;
    let stripeSessionId: string | null = null;
    let paymentReady = false;

    if (stripeKey && lesson.priceCents > 0) {
      // Attempt Stripe checkout session creation
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(stripeKey);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://canary-render-20260512t181715.baljia.app";

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: lesson.priceCents,
                product_data: {
                  name: lesson.title,
                  description: lesson.aiSummary ?? lesson.lessonText.slice(0, 200),
                },
              },
              quantity: 1,
            },
          ],
          customer_email: String(student_email),
          success_url: `${appUrl}/?checkout=success`,
          cancel_url: `${appUrl}/?checkout=cancelled`,
          metadata: { lesson_id: lesson.id, student_email: String(student_email) },
        });

        stripeCheckoutUrl = session.url;
        stripeSessionId = session.id;
        paymentReady = true;
      } catch (stripeErr) {
        console.error("[canary-subscriptions] Stripe session creation failed", stripeErr);
        // Fall through to payment_ready=true without Stripe URL
        paymentReady = true;
      }
    } else {
      // No Stripe key or free lesson — mark payment_ready directly
      paymentReady = true;
      console.info("[canary-subscriptions] Stripe not configured or free lesson — setting payment_ready=true");
    }

    const [sub] = await db
      .insert(canarySubscription)
      .values({
        studentEmail: String(student_email),
        lessonId: lesson.id,
        paymentReady,
        stripeCheckoutUrl,
        stripeSessionId,
        status: paymentReady ? "payment_ready" : "pending",
      })
      .returning();

    return NextResponse.json(
      {
        ok: true,
        subscription: sub,
        stripe_checkout_url: stripeCheckoutUrl,
        payment_ready: paymentReady,
        message: stripeCheckoutUrl
          ? "Stripe checkout session created"
          : "Subscription recorded with payment_ready=true",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[canary-subscriptions POST]", err);
    return NextResponse.json(
      { ok: false, error: { code: "INSERT_ERROR", message: "Failed to create subscription" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subs = await db
      .select()
      .from(canarySubscription)
      .limit(50);
    return NextResponse.json({ ok: true, subscriptions: subs });
  } catch (err) {
    console.error("[canary-subscriptions GET]", err);
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_ERROR", message: "Failed to fetch subscriptions" } },
      { status: 500 }
    );
  }
}
