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
  Zap,
} from "lucide-react";
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
      approvedCount: Number(approvedLessons[0]?.count ?? 0),
      pendingCount: Number(pendingLessons[0]?.count ?? 0),
      totalSubs: Number(totalSubs[0]?.count ?? 0),
    };
  } catch {
    return { lessons: [], approvedCount: 0, pendingCount: 0, totalSubs: 0 };
  }
}

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function Home() {
  const { lessons, approvedCount, pendingCount, totalSubs } = await getMarketplaceData();

  return (
    <main className="cf-page">
      {/* Nav */}
      <header className="cf-nav">
        <div className="cf-container cf-nav-inner">
          <Link href="/" className="cf-logo">
            <GraduationCap size={20} className="cf-accent-icon" />
            <span className="cf-logo-text">CourseForge</span>
          </Link>
          <nav className="cf-nav-links">
            <Link href="/sign-in"><button className="cf-btn-ghost">Sign in</button></Link>
            <Link href="/sign-up"><button className="cf-btn-primary">Start teaching</button></Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="cf-container cf-hero">
        <div className="cf-hero-badge">
          <Sparkles size={12} className="cf-accent-icon" />
          <span>AI-powered summaries on every lesson</span>
        </div>
        <h1 className="cf-display">The marketplace where knowledge finds its audience</h1>
        <p className="cf-hero-sub">
          Teachers upload lessons. AI generates instant summaries. Students discover, subscribe, and learn.
          Admins keep quality high.
        </p>
        <div className="cf-hero-cta">
          <Link href="/sign-up">
            <button className="cf-btn-primary cf-btn-lg">
              Browse lessons <ArrowRight size={14} />
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="cf-btn-ghost cf-btn-lg">Upload a lesson</button>
          </Link>
        </div>
      </section>

      {/* Metrics strip */}
      <section className="cf-metrics-strip">
        <div className="cf-container cf-metrics-grid">
          {([
            { icon: BookOpen,    label: "Total Lessons",    value: lessons.length },
            { icon: CheckCircle, label: "Approved",         value: approvedCount },
            { icon: Clock,       label: "Pending Review",   value: pendingCount },
            { icon: TrendingUp,  label: "Subscriptions",    value: totalSubs },
          ] as const).map(({ icon: Icon, label, value }) => (
            <div key={label} className="cf-metric-item">
              <div className="cf-metric-icon">
                <Icon size={16} className="cf-accent-icon" />
              </div>
              <div>
                <div className="cf-metric-value">{value}</div>
                <div className="cf-metric-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lesson marketplace grid */}
      <section className="cf-container cf-section">
        <div className="cf-section-header">
          <div>
            <h2 className="cf-heading">Browse Lessons</h2>
            <p className="cf-section-sub">
              {lessons.length > 0
                ? `${lessons.length} lessons in the marketplace`
                : "No lessons yet — be the first to upload"}
            </p>
          </div>
          <div className="cf-search-hint">
            <Search size={14} className="cf-muted-icon" />
            <span>Search by title or category</span>
          </div>
        </div>

        {lessons.length === 0 ? (
          <div className="cf-empty-state">
            <BookOpen size={40} className="cf-empty-icon" />
            <p className="cf-empty-title">No lessons in the marketplace yet</p>
            <p className="cf-empty-sub">Sign up as a teacher to add the first one</p>
          </div>
        ) : (
          <div className="cf-lesson-grid">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="cf-lesson-card">
                <div className="cf-card-badges">
                  <span className={`cf-badge cf-badge-category cf-cat-${lesson.category?.toLowerCase() ?? "general"}`}>
                    {lesson.category}
                  </span>
                  <span className={`cf-badge cf-badge-status cf-status-${lesson.status}`}>
                    {lesson.status}
                  </span>
                </div>
                <h3 className="cf-card-title">{lesson.title}</h3>
                {lesson.aiSummary && (
                  <p className="cf-card-summary">
                    {lesson.aiSummary.slice(0, 120)}{lesson.aiSummary.length > 120 ? "\u2026" : ""}
                  </p>
                )}
                <div className="cf-card-footer">
                  <span className="cf-card-teacher">{lesson.teacherEmail}</span>
                  <span className={`cf-card-price ${lesson.priceCents === 0 ? "cf-price-free" : ""}`}>
                    {formatPrice(lesson.priceCents)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature columns — asymmetric layout */}
      <section className="cf-features-section">
        <div className="cf-container cf-features-grid">
          <div>
            <h2 className="cf-features-heading">Built for the full teaching lifecycle</h2>
            <p className="cf-features-sub">
              From upload to approval to student subscription — every step is tracked,
              AI-assisted, and payment-ready.
            </p>
            <div className="cf-feature-cards">
              {([
                { icon: Upload,      title: "Teacher upload flow",    desc: "Submit lessons with metadata, assets, and pricing. AI generates a summary instantly." },
                { icon: ShieldCheck, title: "Admin approval queue",   desc: "Pending lessons route to the admin queue. Approve or reject with a review note." },
                { icon: Search,      title: "Searchable marketplace", desc: "Students filter by category, search by title or teacher, and browse approved content." },
                { icon: TrendingUp,  title: "Subscription checkout",  desc: "Payment-ready checkout with Stripe integration. Free lessons available immediately." },
              ] as const).map(({ icon: Icon, title, desc }) => (
                <div key={title} className="cf-feature-card">
                  <Icon size={16} className="cf-accent-icon" />
                  <div className="cf-feature-title">{title}</div>
                  <div className="cf-feature-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works — replaces API panel */}
          <div className="cf-how-panel">
            <div className="cf-how-label">How it works</div>
            {([
              { icon: Upload,      step: "1", title: "Teacher submits a lesson",    desc: "With title, category, assets, and pricing." },
              { icon: Zap,         step: "2", title: "AI generates a summary",      desc: "Instant 2–3 sentence overview for students." },
              { icon: ShieldCheck, step: "3", title: "Admin approves the lesson",   desc: "Review note attached, lesson goes live." },
              { icon: TrendingUp,  step: "4", title: "Student subscribes",          desc: "Payment-ready checkout, access granted." },
            ] as const).map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="cf-how-row">
                <div className="cf-how-step">{step}</div>
                <Icon size={14} className="cf-accent-icon" style={{ flexShrink: 0 }} />
                <div>
                  <div className="cf-how-title">{title}</div>
                  <div className="cf-how-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin queue */}
      <section className="cf-container cf-admin-section">
        <div className="cf-admin-card">
          <div className="cf-admin-header">
            <div className="cf-admin-title-row">
              <ShieldCheck size={18} className="cf-accent-icon" />
              <h3 className="cf-admin-title">Admin Approval Queue</h3>
              {pendingCount > 0 && (
                <span className="cf-pending-badge">{pendingCount} pending</span>
              )}
            </div>
          </div>
          <p className="cf-admin-desc">
            Approve or reject submitted lessons. Approved lessons appear in the marketplace immediately.
            Teachers are notified when their content goes live.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="cf-footer">
        <div className="cf-container cf-footer-inner">
          <div className="cf-footer-brand">
            <GraduationCap size={14} className="cf-subtle-icon" />
            <span>CourseForge — AI Course Marketplace</span>
          </div>
          <span className="cf-footer-credits">Powered by Baljia · Next.js · Neon · Stripe</span>
        </div>
      </footer>

      <style>{`
        .cf-page { min-height: 100vh; background: var(--cf-bg); color: var(--cf-text-primary); font-family: 'Inter Variable', Inter, -apple-system, system-ui, sans-serif; font-feature-settings: 'cv01','ss03'; }

        .cf-nav { border-bottom: 1px solid var(--cf-border-subtle); background: rgba(15,16,17,0.92); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50; }
        .cf-nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; }
        .cf-container { max-width: 1152px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
        .cf-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .cf-logo-text { font-weight: 590; font-size: 15px; letter-spacing: -0.165px; color: var(--cf-text-primary); }
        .cf-nav-links { display: flex; align-items: center; gap: 4px; }

        .cf-btn-ghost { background: rgba(255,255,255,0.04); border: 1px solid var(--cf-border); border-radius: 6px; color: var(--cf-text-secondary); padding: 5px 12px; font-size: 13px; font-weight: 510; cursor: pointer; }
        .cf-btn-primary { background: var(--cf-accent); border: none; border-radius: 6px; color: #fff; padding: 5px 12px; font-size: 13px; font-weight: 510; cursor: pointer; margin-left: 4px; display: inline-flex; align-items: center; gap: 6px; }
        .cf-btn-lg { padding: 9px 20px; font-size: 14px; }

        .cf-hero { padding: 80px 0 64px; max-width: 640px; }
        .cf-hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(113,112,255,0.08); border: 1px solid rgba(113,112,255,0.2); border-radius: 9999px; padding: 3px 10px 3px 6px; margin-bottom: 24px; font-size: 12px; font-weight: 510; color: var(--cf-accent-bright); letter-spacing: 0.01em; }
        .cf-display { font-size: clamp(36px, 5vw, 52px); font-weight: 510; line-height: 1.02; letter-spacing: -1.2px; color: var(--cf-text-primary); margin-bottom: 20px; }
        .cf-hero-sub { font-size: 18px; font-weight: 400; line-height: 1.6; color: var(--cf-text-muted); margin-bottom: 32px; letter-spacing: -0.165px; }
        .cf-hero-cta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        .cf-metrics-strip { border-top: 1px solid var(--cf-border-subtle); border-bottom: 1px solid var(--cf-border-subtle); background: rgba(255,255,255,0.015); }
        .cf-metrics-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; padding: 20px 24px; }
        @media(min-width:768px){ .cf-metrics-grid { grid-template-columns: repeat(4,1fr); } }
        .cf-metric-item { display: flex; align-items: center; gap: 12px; }
        .cf-metric-icon { background: rgba(113,112,255,0.08); border: 1px solid rgba(113,112,255,0.15); border-radius: 8px; padding: 8px; flex-shrink: 0; }
        .cf-metric-value { font-size: 20px; font-weight: 590; color: var(--cf-text-primary); letter-spacing: -0.3px; }
        .cf-metric-label { font-size: 12px; color: var(--cf-text-subtle); font-weight: 510; }

        .cf-section { padding: 64px 0; }
        .cf-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
        .cf-heading { font-size: 24px; font-weight: 510; letter-spacing: -0.288px; color: var(--cf-text-primary); margin-bottom: 4px; }
        .cf-section-sub { font-size: 14px; color: var(--cf-text-muted); }
        .cf-search-hint { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; padding: 6px 12px; font-size: 13px; color: var(--cf-text-subtle); }

        .cf-lesson-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
        @media(min-width:768px){ .cf-lesson-grid { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1024px){ .cf-lesson-grid { grid-template-columns: repeat(3,1fr); } }
        .cf-lesson-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 18px 20px; }
        .cf-card-badges { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
        .cf-badge { font-size: 11px; font-weight: 510; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 4px; border: 1px solid; }
        .cf-cat-programming { background: rgba(59,130,246,0.1); color: #60a5fa; border-color: rgba(59,130,246,0.2); }
        .cf-cat-design      { background: rgba(167,139,250,0.1); color: #a78bfa; border-color: rgba(167,139,250,0.2); }
        .cf-cat-business    { background: rgba(251,146,60,0.1);  color: #fb923c; border-color: rgba(251,146,60,0.2); }
        .cf-cat-science     { background: rgba(34,211,238,0.1);  color: #22d3ee; border-color: rgba(34,211,238,0.2); }
        .cf-cat-general     { background: rgba(148,163,184,0.1); color: #94a3b8; border-color: rgba(148,163,184,0.2); }
        .cf-status-approved { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.2); }
        .cf-status-pending  { background: rgba(245,158,11,0.15); color: #fbbf24; border-color: rgba(245,158,11,0.2); }
        .cf-status-rejected { background: rgba(239,68,68,0.15);  color: #f87171; border-color: rgba(239,68,68,0.2); }
        .cf-card-title { font-size: 15px; font-weight: 590; color: var(--cf-text-primary); margin-bottom: 6px; letter-spacing: -0.165px; line-height: 1.4; }
        .cf-card-summary { font-size: 13px; color: var(--cf-text-muted); line-height: 1.6; margin-bottom: 10px; }
        .cf-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--cf-border-subtle); }
        .cf-card-teacher { font-size: 12px; color: var(--cf-text-subtle); }
        .cf-card-price { font-size: 14px; font-weight: 590; color: var(--cf-text-primary); }
        .cf-price-free { color: var(--cf-success); }

        .cf-empty-state { text-align: center; padding: 64px 0; border: 1px dashed rgba(255,255,255,0.07); border-radius: 12px; }
        .cf-empty-icon { color: #3e3e44; margin: 0 auto 16px; display: block; }
        .cf-empty-title { font-size: 16px; color: var(--cf-text-subtle); margin-bottom: 8px; }
        .cf-empty-sub { font-size: 13px; color: #3e3e44; }

        .cf-features-section { border-top: 1px solid var(--cf-border-subtle); background: rgba(255,255,255,0.01); }
        .cf-features-grid { display: grid; gap: 32px; padding: 64px 24px; grid-template-columns: 1fr; }
        @media(min-width:768px){ .cf-features-grid { grid-template-columns: 2fr 1fr; } }
        .cf-features-heading { font-size: 28px; font-weight: 510; letter-spacing: -0.5px; color: var(--cf-text-primary); margin-bottom: 12px; }
        .cf-features-sub { font-size: 15px; color: var(--cf-text-muted); line-height: 1.6; margin-bottom: 28px; max-width: 480px; }
        .cf-feature-cards { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
        .cf-feature-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px; }
        .cf-feature-title { font-size: 13px; font-weight: 590; color: var(--cf-text-primary); margin: 8px 0 5px; }
        .cf-feature-desc { font-size: 12px; color: var(--cf-text-muted); line-height: 1.5; }

        .cf-how-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 20px; align-self: start; }
        .cf-how-label { font-size: 11px; font-weight: 510; color: var(--cf-text-subtle); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px; }
        .cf-how-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .cf-how-step { width: 18px; height: 18px; border-radius: 50%; background: rgba(113,112,255,0.15); border: 1px solid rgba(113,112,255,0.25); color: var(--cf-accent-bright); font-size: 10px; font-weight: 590; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cf-how-title { font-size: 12px; font-weight: 590; color: var(--cf-text-primary); margin-bottom: 2px; }
        .cf-how-desc { font-size: 11px; color: var(--cf-text-subtle); line-height: 1.4; }

        .cf-admin-section { padding-bottom: 48px; }
        .cf-admin-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 24px 28px; }
        .cf-admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
        .cf-admin-title-row { display: flex; align-items: center; gap: 12px; }
        .cf-admin-title { font-size: 16px; font-weight: 590; color: var(--cf-text-primary); letter-spacing: -0.2px; }
        .cf-admin-desc { font-size: 13px; color: var(--cf-text-muted); line-height: 1.6; }
        .cf-pending-badge { background: rgba(245,158,11,0.12); color: var(--cf-warning); border: 1px solid rgba(245,158,11,0.2); border-radius: 9999px; font-size: 11px; font-weight: 590; padding: 1px 8px; }

        .cf-footer { border-top: 1px solid var(--cf-border-subtle); padding: 24px 0; margin-top: 16px; }
        .cf-footer-inner { display: flex; align-items: center; justify-content: space-between; }
        .cf-footer-brand { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--cf-text-subtle); }
        .cf-footer-credits { font-size: 12px; color: #3e3e44; }

        .cf-accent-icon { color: var(--cf-accent-bright); }
        .cf-muted-icon  { color: var(--cf-text-subtle); }
        .cf-subtle-icon { color: #3e3e44; }
      `}</style>
    </main>
  );
}
