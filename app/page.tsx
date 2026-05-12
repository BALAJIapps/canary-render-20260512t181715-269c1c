import Link from "next/link";
import {
  BookOpen,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { canaryLesson, canarySubscription } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";

async function getMarketplaceData() {
  try {
    const [lessons, approvedLessons, pendingLessons, totalSubs] = await Promise.all([
      db.select().from(canaryLesson).orderBy(desc(canaryLesson.createdAt)).limit(9),
      db.select({ count: count() }).from(canaryLesson).where(eq(canaryLesson.status, "approved")),
      db.select({ count: count() }).from(canaryLesson).where(eq(canaryLesson.status, "pending")),
      db.select({ count: count() }).from(canarySubscription),
    ]);
    return {
      lessons,
      approvedCount: approvedLessons[0]?.count ?? 0,
      pendingCount: pendingLessons[0]?.count ?? 0,
      totalSubs: totalSubs[0]?.count ?? 0,
    };
  } catch {
    return { lessons: [], approvedCount: 0, pendingCount: 0, totalSubs: 0 };
  }
}

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
};

const CATEGORY_COLORS: Record<string, string> = {
  programming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  design: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  business: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  science: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  general: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function Home() {
  const { lessons, approvedCount, pendingCount, totalSubs } = await getMarketplaceData();

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#08090a",
        color: "#f7f8f8",
        fontFamily: "'Inter Variable', Inter, -apple-system, system-ui, sans-serif",
        fontFeatureSettings: "'cv01', 'ss03'",
      }}
    >
      {/* Nav */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(15,16,17,0.92)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap size={20} style={{ color: "#7170ff" }} />
            <span style={{ fontWeight: 590, fontSize: 15, letterSpacing: "-0.165px", color: "#f7f8f8" }}>
              CourseForge
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/sign-in">
              <button
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6,
                  color: "#d0d6e0",
                  padding: "5px 12px",
                  fontSize: 13,
                  fontWeight: 510,
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
            </Link>
            <Link href="/sign-up">
              <button
                style={{
                  background: "#5e6ad2",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  padding: "5px 12px",
                  fontSize: 13,
                  fontWeight: 510,
                  cursor: "pointer",
                  marginLeft: 4,
                }}
              >
                Start teaching
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(113,112,255,0.08)",
              border: "1px solid rgba(113,112,255,0.2)",
              borderRadius: 9999,
              padding: "3px 10px 3px 6px",
              marginBottom: 24,
            }}
          >
            <Sparkles size={12} style={{ color: "#7170ff" }} />
            <span style={{ fontSize: 12, fontWeight: 510, color: "#7170ff", letterSpacing: "0.01em" }}>
              AI-powered summaries on every lesson
            </span>
          </div>
          <h1
            style={{
              fontSize: 52,
              fontWeight: 510,
              lineHeight: 1.02,
              letterSpacing: "-1.2px",
              color: "#f7f8f8",
              marginBottom: 20,
            }}
          >
            The marketplace where knowledge finds its audience
          </h1>
          <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.6, color: "#8a8f98", marginBottom: 32, letterSpacing: "-0.165px" }}>
            Teachers upload lessons. AI generates instant summaries. Students discover, subscribe, and learn. Admins keep quality high.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/sign-up">
              <button
                style={{
                  background: "#5e6ad2",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  padding: "9px 20px",
                  fontSize: 14,
                  fontWeight: 510,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Browse lessons
                <ArrowRight size={14} />
              </button>
            </Link>
            <Link href="/sign-up">
              <button
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6,
                  color: "#d0d6e0",
                  padding: "9px 20px",
                  fontSize: 14,
                  fontWeight: 510,
                  cursor: "pointer",
                }}
              >
                Upload a lesson
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics strip */}
      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, label: "Total Lessons", value: String(lessons.length) },
            { icon: CheckCircle, label: "Approved", value: String(approvedCount) },
            { icon: Clock, label: "Pending Review", value: String(pendingCount) },
            { icon: TrendingUp, label: "Subscriptions", value: String(totalSubs) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                style={{
                  background: "rgba(113,112,255,0.08)",
                  border: "1px solid rgba(113,112,255,0.15)",
                  borderRadius: 8,
                  padding: 8,
                  flexShrink: 0,
                }}
              >
                <Icon size={16} style={{ color: "#7170ff" }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 590, color: "#f7f8f8", letterSpacing: "-0.3px" }}>{value}</div>
                <div style={{ fontSize: 12, color: "#62666d", fontWeight: 510 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lesson marketplace grid */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 510, letterSpacing: "-0.288px", color: "#f7f8f8", marginBottom: 4 }}>
              Browse Lessons
            </h2>
            <p style={{ fontSize: 14, color: "#8a8f98" }}>
              {lessons.length > 0 ? `${lessons.length} lessons in the marketplace` : "No lessons yet — be the first to upload"}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 6,
              padding: "6px 12px",
            }}
          >
            <Search size={14} style={{ color: "#62666d" }} />
            <span style={{ fontSize: 13, color: "#62666d" }}>Search via API</span>
          </div>
        </div>

        {lessons.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 0",
              border: "1px dashed rgba(255,255,255,0.07)",
              borderRadius: 12,
            }}
          >
            <BookOpen size={40} style={{ color: "#3e3e44", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 16, color: "#62666d", marginBottom: 8 }}>No lessons in the marketplace yet</p>
            <p style={{ fontSize: 13, color: "#3e3e44" }}>POST to /api/canary-lessons to add the first one</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: "18px 20px",
                  transition: "border-color 0.15s",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 510,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: "1px solid",
                    }}
                    className={CATEGORY_COLORS[lesson.category?.toLowerCase()] ?? CATEGORY_COLORS.general}
                  >
                    {lesson.category}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 510,
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: "1px solid",
                    }}
                    className={STATUS_COLORS[lesson.status] ?? STATUS_COLORS.pending}
                  >
                    {lesson.status}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 590,
                    color: "#f7f8f8",
                    marginBottom: 6,
                    letterSpacing: "-0.165px",
                    lineHeight: 1.4,
                  }}
                >
                  {lesson.title}
                </h3>
                {lesson.aiSummary && (
                  <p style={{ fontSize: 13, color: "#8a8f98", lineHeight: 1.6, marginBottom: 10 }}>
                    {lesson.aiSummary.slice(0, 120)}{lesson.aiSummary.length > 120 ? "…" : ""}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 12, color: "#62666d" }}>{lesson.teacherEmail}</span>
                  <span style={{ fontSize: 14, fontWeight: 590, color: lesson.priceCents === 0 ? "#10b981" : "#f7f8f8" }}>
                    {formatPrice(lesson.priceCents)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature columns — asymmetric layout */}
      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 py-16 grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 510, letterSpacing: "-0.5px", color: "#f7f8f8", marginBottom: 12 }}>
              Built for the full teaching lifecycle
            </h2>
            <p style={{ fontSize: 15, color: "#8a8f98", lineHeight: 1.6, marginBottom: 28, maxWidth: 480 }}>
              From upload to approval to student subscription — every step is tracked, AI-assisted, and payment-ready.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Upload, title: "Teacher upload flow", desc: "Submit lessons with metadata, assets, and pricing. AI generates a summary instantly." },
                { icon: ShieldCheck, title: "Admin approval queue", desc: "Pending lessons route to the admin queue. Approve or reject with a review note." },
                { icon: Search, title: "Searchable marketplace", desc: "Students filter by category, search by title or teacher, and browse approved content." },
                { icon: TrendingUp, title: "Subscription checkout", desc: "Payment-ready checkout with Stripe integration. Free lessons available immediately." },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    padding: "16px",
                  }}
                >
                  <Icon size={16} style={{ color: "#7170ff", marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 590, color: "#f7f8f8", marginBottom: 5 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#8a8f98", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* API quick-ref panel — admin/developer surface, not marketing copy */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: "20px",
              alignSelf: "start",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 510, color: "#62666d", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
              Canary API surface
            </div>
            {[
              { method: "POST", path: "/api/canary-lessons", note: "Create lesson" },
              { method: "GET", path: "/api/canary-lessons", note: "List / search" },
              { method: "PATCH", path: "/api/canary-lessons/:id/approve", note: "Approve" },
              { method: "POST", path: "/api/canary-ai-summary", note: "AI summary" },
              { method: "POST", path: "/api/canary-subscriptions", note: "Subscribe" },
            ].map(({ method, path, note }) => (
              <div
                key={path + method}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 590,
                    fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
                    padding: "1px 5px",
                    borderRadius: 3,
                    background: method === "POST" ? "rgba(16,185,129,0.12)" : method === "GET" ? "rgba(113,112,255,0.12)" : "rgba(245,158,11,0.12)",
                    color: method === "POST" ? "#10b981" : method === "GET" ? "#7170ff" : "#f59e0b",
                    minWidth: 40,
                    textAlign: "center" as const,
                  }}
                >
                  {method}
                </span>
                <span style={{ fontSize: 11, fontFamily: "ui-monospace, SF Mono, Menlo, monospace", color: "#d0d6e0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                  {path}
                </span>
                <span style={{ fontSize: 11, color: "#62666d", flexShrink: 0 }}>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin queue section */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: "24px 28px",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} style={{ color: "#7170ff" }} />
              <h3 style={{ fontSize: 16, fontWeight: 590, color: "#f7f8f8", letterSpacing: "-0.2px" }}>Admin Approval Queue</h3>
              {Number(pendingCount) > 0 && (
                <span
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 590,
                    padding: "1px 8px",
                  }}
                >
                  {String(pendingCount)} pending
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: "#62666d" }}>PATCH /api/canary-lessons/:id/approve</span>
          </div>
          <div style={{ fontSize: 13, color: "#8a8f98", lineHeight: 1.6 }}>
            Approve or reject submitted lessons via the API. Approved lessons appear in the marketplace immediately.
            Set <code style={{ background: "rgba(255,255,255,0.06)", borderRadius: 3, padding: "1px 5px", fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#d0d6e0" }}>status: &quot;rejected&quot;</code> in the request body to reject.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "24px 0",
          marginTop: 16,
        }}
      >
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={14} style={{ color: "#3e3e44" }} />
            <span style={{ fontSize: 12, color: "#62666d" }}>CourseForge — AI Course Marketplace</span>
          </div>
          <span style={{ fontSize: 12, color: "#3e3e44" }}>Powered by Baljia · Next.js · Neon · Stripe</span>
        </div>
      </footer>
    </main>
  );
}
