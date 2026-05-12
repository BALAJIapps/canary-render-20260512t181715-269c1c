"use client";

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
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// Client component — data fetched via API on mount
export default function Home() {
  const [stats, setStats] = useState({ lessons: 0, approved: 0, pending: 0, subs: 0 });
  const [lessons, setLessons] = useState<Array<{
    id: string; title: string; category: string; status: string;
    teacherEmail: string; priceCents: number; aiSummary: string | null;
  }>>([]);

  useEffect(() => {
    fetch("/api/canary-lessons")
      .then(r => r.json())
      .then((d: { ok: boolean; lessons: typeof lessons }) => {
        if (d.ok) {
          setLessons(d.lessons.slice(0, 9));
          const approved = d.lessons.filter((l) => l.status === "approved").length;
          const pending  = d.lessons.filter((l) => l.status === "pending").length;
          setStats({ lessons: d.lessons.length, approved, pending, subs: 0 });
        }
      })
      .catch(() => {});
  }, []);

  function formatPrice(cents: number) {
    return cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`;
  }

  return (
    <main className="cf-page">
      {/* Nav */}
      <header className="cf-nav">
        <div className="cf-container cf-nav-inner">
          <Link href="/" className="cf-logo">
            <GraduationCap size={18} style={{ color: "#f7f8f8" }} />
            <span className="cf-logo-text">CourseForge</span>
          </Link>
          <nav className="cf-nav-links">
            <Link href="/sign-in"><button className="cf-btn-ghost">Sign in</button></Link>
            <Link href="/sign-up"><button className="cf-btn-primary">Start teaching</button></Link>
          </nav>
        </div>
      </header>

      {/* Hero — left column + right visual anchor */}
      <section className="cf-container cf-hero-wrap">
        <div className="cf-hero-left">
          <div className="cf-hero-badge">
            <Sparkles size={11} style={{ color: "#7170ff" }} />
            <span>AI-powered summaries on every lesson</span>
          </div>
          <h1 className="cf-display">
            The marketplace where knowledge finds its audience
          </h1>
          <p className="cf-hero-sub">
            Teachers upload lessons. AI generates instant summaries. Students discover,
            subscribe, and learn. Admins keep quality high.
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
        </div>

        {/* Right: live lesson card preview */}
        <div className="cf-hero-right" aria-hidden="true">
          <div className="cf-preview-card">
            <div className="cf-preview-bar">
              <span className="cf-preview-dot cf-dot-red" />
              <span className="cf-preview-dot cf-dot-yellow" />
              <span className="cf-preview-dot cf-dot-green" />
              <span className="cf-preview-title">Latest lesson</span>
            </div>
            <div className="cf-preview-body">
              {lessons[0] ? (
                <>
                  <div className="cf-preview-category">{lessons[0].category}</div>
                  <div className="cf-preview-lesson-title">{lessons[0].title}</div>
                  <div className="cf-preview-teacher">{lessons[0].teacherEmail}</div>
                  {lessons[0].aiSummary && (
                    <div className="cf-preview-summary">{lessons[0].aiSummary.slice(0, 100)}…</div>
                  )}
                  <div className="cf-preview-footer">
                    <span className={`cf-preview-status cf-ps-${lessons[0].status}`}>{lessons[0].status}</span>
                    <span className="cf-preview-price">{formatPrice(lessons[0].priceCents)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="cf-preview-category">programming</div>
                  <div className="cf-preview-lesson-title">Introduction to Machine Learning</div>
                  <div className="cf-preview-teacher">teacher@example.com</div>
                  <div className="cf-preview-summary">A clear, structured introduction to supervised and unsupervised learning with real-world examples.</div>
                  <div className="cf-preview-footer">
                    <span className="cf-preview-status cf-ps-approved">approved</span>
                    <span className="cf-preview-price">$19.99</span>
                  </div>
                </>
              )}
            </div>
            <div className="cf-preview-ai-row">
              <Zap size={11} style={{ color: "#7170ff" }} />
              <span>AI summary generated</span>
            </div>
          </div>
          {/* Floating status badges */}
          <div className="cf-float-badge cf-float-1">
            <CheckCircle size={12} style={{ color: "#10b981" }} />
            <span>{stats.approved} approved</span>
          </div>
          <div className="cf-float-badge cf-float-2">
            <Clock size={12} style={{ color: "#f59e0b" }} />
            <span>{stats.pending} pending</span>
          </div>
        </div>
      </section>

      {/* Metrics strip — neutral icons, not accent */}
      <section className="cf-metrics-strip">
        <div className="cf-container cf-metrics-grid">
          {([
            { icon: BookOpen,    label: "Lessons",         value: stats.lessons,  dim: false },
            { icon: CheckCircle, label: "Approved",        value: stats.approved, dim: false },
            { icon: Clock,       label: "Pending Review",  value: stats.pending,  dim: false },
            { icon: TrendingUp,  label: "Subscriptions",   value: stats.subs,     dim: false },
          ] as const).map(({ icon: Icon, label, value }) => (
            <div key={label} className="cf-metric-item">
              <div className="cf-metric-icon-wrap">
                <Icon size={15} style={{ color: "#8a8f98" }} />
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
            <Search size={13} style={{ color: "#62666d" }} />
            <span>Search by title or category</span>
          </div>
        </div>

        {lessons.length === 0 ? (
          <div className="cf-empty-state">
            <BookOpen size={36} style={{ color: "#3e3e44", margin: "0 auto 16px", display: "block" }} />
            <p className="cf-empty-title">No lessons in the marketplace yet</p>
            <p className="cf-empty-sub">Sign up as a teacher to add the first one</p>
          </div>
        ) : (
          <div className="cf-lesson-grid">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="cf-lesson-card">
                <div className="cf-card-badges">
                  <span className={`cf-badge cf-cat-${lesson.category?.toLowerCase() ?? "general"}`}>
                    {lesson.category}
                  </span>
                  <span className={`cf-badge cf-status-${lesson.status}`}>
                    {lesson.status}
                  </span>
                </div>
                <h3 className="cf-card-title">{lesson.title}</h3>
                {lesson.aiSummary && (
                  <p className="cf-card-summary">
                    {lesson.aiSummary.slice(0, 120)}{lesson.aiSummary.length > 120 ? "…" : ""}
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

      {/* Comparison section — unconventional, not template */}
      <section className="cf-comparison-section">
        <div className="cf-container">
          <h2 className="cf-heading" style={{ marginBottom: 32 }}>CourseForge vs. the old way</h2>
          <div className="cf-comparison-grid">
            <div className="cf-comparison-col cf-col-old">
              <div className="cf-comparison-label">
                <X size={13} style={{ color: "#ef4444" }} />
                <span>Without CourseForge</span>
              </div>
              {[
                "Manual lesson summaries take hours",
                "No structured approval workflow",
                "Scattered payments across platforms",
                "No searchable lesson marketplace",
                "Teachers manage students ad-hoc",
              ].map(item => (
                <div key={item} className="cf-comparison-row cf-row-bad">
                  <span className="cf-compare-dot cf-dot-bad" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="cf-comparison-col cf-col-new">
              <div className="cf-comparison-label">
                <CheckCircle size={13} style={{ color: "#10b981" }} />
                <span>With CourseForge</span>
              </div>
              {[
                "AI generates summaries in seconds",
                "Admin queue with review notes built-in",
                "Stripe checkout on every lesson",
                "Searchable marketplace, live instantly",
                "Students subscribe, teachers earn",
              ].map(item => (
                <div key={item} className="cf-comparison-row cf-row-good">
                  <span className="cf-compare-dot cf-dot-good" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features — asymmetric 2-col */}
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
                  <Icon size={15} style={{ color: "#8a8f98" }} />
                  <div className="cf-feature-title">{title}</div>
                  <div className="cf-feature-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="cf-how-panel">
            <div className="cf-how-label">How it works</div>
            {([
              { icon: Upload,      step: "1", title: "Teacher submits a lesson",  desc: "With title, category, assets, and pricing." },
              { icon: Zap,         step: "2", title: "AI generates a summary",    desc: "Instant 2–3 sentence overview for students." },
              { icon: ShieldCheck, step: "3", title: "Admin approves the lesson", desc: "Review note attached, lesson goes live." },
              { icon: TrendingUp,  step: "4", title: "Student subscribes",        desc: "Payment-ready checkout, access granted." },
            ] as const).map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="cf-how-row">
                <div className="cf-how-step">{step}</div>
                <Icon size={13} style={{ color: "#8a8f98", flexShrink: 0 }} />
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
              <ShieldCheck size={17} style={{ color: "#8a8f98" }} />
              <h3 className="cf-admin-title">Admin Approval Queue</h3>
              {stats.pending > 0 && (
                <span className="cf-pending-badge">{stats.pending} pending</span>
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
            <GraduationCap size={13} style={{ color: "#3e3e44" }} />
            <span>CourseForge — AI Course Marketplace</span>
          </div>
          <span className="cf-footer-credits">Powered by Baljia · Next.js · Neon · Stripe</span>
        </div>
      </footer>

      <style>{`
        .cf-page { min-height: 100vh; background: var(--cf-bg); color: var(--cf-text-primary); font-family: var(--font-body); font-feature-settings: 'cv01','ss03'; }

        .cf-nav { border-bottom: 1px solid var(--cf-border-subtle); background: rgba(15,16,17,0.94); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50; }
        .cf-nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; }
        .cf-container { max-width: 1152px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
        .cf-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .cf-logo-text { font-weight: 700; font-size: 15px; letter-spacing: -0.3px; color: var(--cf-text-primary); font-family: var(--font-display); }
        .cf-nav-links { display: flex; align-items: center; gap: 4px; }

        .cf-btn-ghost { background: rgba(255,255,255,0.04); border: 1px solid var(--cf-border); border-radius: 6px; color: var(--cf-text-secondary); padding: 5px 12px; font-size: 13px; font-weight: 510; cursor: pointer; font-family: var(--font-body); transition: background 0.15s; }
        .cf-btn-ghost:hover { background: rgba(255,255,255,0.07); }
        .cf-btn-primary { background: var(--cf-accent); border: none; border-radius: 6px; color: #fff; padding: 5px 12px; font-size: 13px; font-weight: 510; cursor: pointer; margin-left: 4px; display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body); transition: background 0.15s; }
        .cf-btn-primary:hover { background: var(--cf-accent-hover); }
        .cf-btn-lg { padding: 9px 20px; font-size: 14px; }

        /* Hero — two-column layout */
        .cf-hero-wrap { display: grid; gap: 48px; padding: 72px 0 64px; align-items: center; grid-template-columns: 1fr; }
        @media(min-width: 900px){ .cf-hero-wrap { grid-template-columns: 1fr 1fr; } }
        .cf-hero-left { max-width: 560px; }
        .cf-hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(113,112,255,0.08); border: 1px solid rgba(113,112,255,0.2); border-radius: 9999px; padding: 3px 10px 3px 6px; margin-bottom: 24px; font-size: 12px; font-weight: 510; color: var(--cf-accent-bright); letter-spacing: 0.01em; }
        .cf-display { font-family: var(--font-display); font-size: clamp(32px, 4.5vw, 50px); font-weight: 800; line-height: 1.06; letter-spacing: -1.5px; color: var(--cf-text-primary); margin-bottom: 20px; }
        .cf-hero-sub { font-size: 17px; line-height: 1.65; color: var(--cf-text-muted); margin-bottom: 32px; }
        .cf-hero-cta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        /* Hero right — product preview card */
        .cf-hero-right { position: relative; display: none; }
        @media(min-width: 900px){ .cf-hero-right { display: block; } }
        .cf-preview-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 24px 48px rgba(0,0,0,0.4); }
        .cf-preview-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
        .cf-preview-dot { width: 10px; height: 10px; border-radius: 50%; }
        .cf-dot-red    { background: #ef4444; opacity: 0.7; }
        .cf-dot-yellow { background: #f59e0b; opacity: 0.7; }
        .cf-dot-green  { background: #10b981; opacity: 0.7; }
        .cf-preview-title { font-size: 11px; color: var(--cf-text-subtle); margin-left: 4px; font-weight: 510; }
        .cf-preview-body { padding: 16px; }
        .cf-preview-category { font-size: 10px; font-weight: 590; text-transform: uppercase; letter-spacing: 0.07em; color: var(--cf-text-subtle); margin-bottom: 6px; }
        .cf-preview-lesson-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--cf-text-primary); margin-bottom: 4px; line-height: 1.3; }
        .cf-preview-teacher { font-size: 11px; color: var(--cf-text-subtle); margin-bottom: 10px; }
        .cf-preview-summary { font-size: 12px; color: var(--cf-text-muted); line-height: 1.55; margin-bottom: 12px; }
        .cf-preview-footer { display: flex; align-items: center; justify-content: space-between; }
        .cf-preview-status { font-size: 10px; font-weight: 590; padding: 2px 7px; border-radius: 4px; border: 1px solid; text-transform: uppercase; letter-spacing: 0.04em; }
        .cf-ps-approved { background: rgba(16,185,129,0.12); color: #34d399; border-color: rgba(16,185,129,0.2); }
        .cf-ps-pending  { background: rgba(245,158,11,0.12); color: #fbbf24; border-color: rgba(245,158,11,0.2); }
        .cf-preview-price { font-size: 14px; font-weight: 700; font-family: var(--font-display); color: var(--cf-text-primary); }
        .cf-preview-ai-row { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: var(--cf-text-subtle); background: rgba(113,112,255,0.04); }
        /* Floating status badges */
        .cf-float-badge { position: absolute; display: flex; align-items: center; gap: 6px; background: rgba(15,16,17,0.92); border: 1px solid rgba(255,255,255,0.1); border-radius: 9999px; padding: 5px 12px; font-size: 11px; font-weight: 510; color: var(--cf-text-secondary); backdrop-filter: blur(8px); white-space: nowrap; }
        .cf-float-1 { top: -16px; right: -8px; }
        .cf-float-2 { bottom: -16px; left: -8px; }

        /* Metrics strip — muted icons, no accent overuse */
        .cf-metrics-strip { border-top: 1px solid var(--cf-border-subtle); border-bottom: 1px solid var(--cf-border-subtle); background: rgba(255,255,255,0.012); }
        .cf-metrics-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; padding: 18px 24px; }
        @media(min-width:768px){ .cf-metrics-grid { grid-template-columns: repeat(4,1fr); } }
        .cf-metric-item { display: flex; align-items: center; gap: 10px; }
        .cf-metric-icon-wrap { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 7px; padding: 7px; flex-shrink: 0; }
        .cf-metric-value { font-family: var(--font-display); font-size: 21px; font-weight: 700; color: var(--cf-text-primary); letter-spacing: -0.3px; }
        .cf-metric-label { font-size: 11px; color: var(--cf-text-subtle); font-weight: 510; }

        .cf-section { padding: 64px 0; }
        .cf-section-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
        .cf-heading { font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: -0.4px; color: var(--cf-text-primary); margin-bottom: 4px; }
        .cf-section-sub { font-size: 13px; color: var(--cf-text-muted); }
        .cf-search-hint { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 5px 11px; font-size: 12px; color: var(--cf-text-subtle); flex-shrink: 0; }

        .cf-lesson-grid { display: grid; gap: 14px; }
        @media(min-width:768px){ .cf-lesson-grid { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1024px){ .cf-lesson-grid { grid-template-columns: repeat(3,1fr); } }
        .cf-lesson-card { background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 16px 18px; transition: border-color 0.15s; }
        .cf-lesson-card:hover { border-color: rgba(255,255,255,0.13); }
        .cf-card-badges { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
        .cf-badge { font-size: 10px; font-weight: 590; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 7px; border-radius: 3px; border: 1px solid; }
        .cf-cat-programming { background: rgba(59,130,246,0.1);  color: #60a5fa; border-color: rgba(59,130,246,0.2); }
        .cf-cat-design      { background: rgba(167,139,250,0.1); color: #a78bfa; border-color: rgba(167,139,250,0.2); }
        .cf-cat-business    { background: rgba(251,146,60,0.1);  color: #fb923c; border-color: rgba(251,146,60,0.2); }
        .cf-cat-science     { background: rgba(34,211,238,0.1);  color: #22d3ee; border-color: rgba(34,211,238,0.2); }
        .cf-cat-general     { background: rgba(148,163,184,0.1); color: #94a3b8; border-color: rgba(148,163,184,0.2); }
        .cf-status-approved { background: rgba(16,185,129,0.12); color: #34d399; border-color: rgba(16,185,129,0.2); }
        .cf-status-pending  { background: rgba(245,158,11,0.12); color: #fbbf24; border-color: rgba(245,158,11,0.2); }
        .cf-status-rejected { background: rgba(239,68,68,0.12);  color: #f87171; border-color: rgba(239,68,68,0.2); }
        .cf-card-title { font-size: 14px; font-weight: 590; color: var(--cf-text-primary); margin-bottom: 6px; letter-spacing: -0.1px; line-height: 1.4; }
        .cf-card-summary { font-size: 12px; color: var(--cf-text-muted); line-height: 1.55; margin-bottom: 10px; }
        .cf-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
        .cf-card-teacher { font-size: 11px; color: var(--cf-text-subtle); }
        .cf-card-price { font-size: 13px; font-weight: 700; font-family: var(--font-display); color: var(--cf-text-primary); }
        .cf-price-free { color: var(--cf-success); }

        .cf-empty-state { text-align: center; padding: 56px 0; border: 1px dashed rgba(255,255,255,0.07); border-radius: 10px; }
        .cf-empty-title { font-size: 15px; color: var(--cf-text-subtle); margin-bottom: 6px; }
        .cf-empty-sub { font-size: 12px; color: #3e3e44; }

        /* Comparison section — unconventional, brand-specific */
        .cf-comparison-section { border-top: 1px solid var(--cf-border-subtle); border-bottom: 1px solid var(--cf-border-subtle); background: rgba(255,255,255,0.01); padding: 56px 0; }
        .cf-comparison-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
        @media(min-width:640px){ .cf-comparison-grid { grid-template-columns: 1fr 1fr; } }
        .cf-comparison-col { border-radius: 10px; overflow: hidden; }
        .cf-col-old { border: 1px solid rgba(239,68,68,0.12); }
        .cf-col-new { border: 1px solid rgba(16,185,129,0.15); }
        .cf-comparison-label { display: flex; align-items: center; gap: 8px; padding: 12px 16px; font-size: 12px; font-weight: 590; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .cf-col-old .cf-comparison-label { color: #f87171; background: rgba(239,68,68,0.06); }
        .cf-col-new .cf-comparison-label { color: #34d399; background: rgba(16,185,129,0.06); }
        .cf-comparison-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 16px; font-size: 13px; color: var(--cf-text-muted); border-bottom: 1px solid rgba(255,255,255,0.03); }
        .cf-compare-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .cf-dot-bad  { background: rgba(239,68,68,0.5); }
        .cf-dot-good { background: rgba(16,185,129,0.7); }
        .cf-row-good { color: var(--cf-text-secondary); }

        /* Features section */
        .cf-features-section { padding: 56px 0; }
        .cf-features-grid { display: grid; gap: 32px; padding: 0 24px; }
        @media(min-width:768px){ .cf-features-grid { grid-template-columns: 2fr 1fr; } }
        .cf-features-heading { font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.6px; color: var(--cf-text-primary); margin-bottom: 10px; }
        .cf-features-sub { font-size: 14px; color: var(--cf-text-muted); line-height: 1.65; margin-bottom: 24px; max-width: 480px; }
        .cf-feature-cards { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
        .cf-feature-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 14px; }
        .cf-feature-title { font-size: 12px; font-weight: 590; color: var(--cf-text-primary); margin: 7px 0 4px; }
        .cf-feature-desc { font-size: 11px; color: var(--cf-text-muted); line-height: 1.5; }

        .cf-how-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 18px; align-self: start; }
        .cf-how-label { font-size: 10px; font-weight: 590; color: var(--cf-text-subtle); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 12px; }
        .cf-how-row { display: flex; align-items: flex-start; gap: 9px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .cf-how-step { width: 17px; height: 17px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--cf-text-subtle); font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: var(--font-display); }
        .cf-how-title { font-size: 12px; font-weight: 590; color: var(--cf-text-primary); margin-bottom: 2px; }
        .cf-how-desc { font-size: 11px; color: var(--cf-text-subtle); line-height: 1.4; }

        .cf-admin-section { padding-bottom: 48px; }
        .cf-admin-card { background: rgba(255,255,255,0.018); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 22px 26px; }
        .cf-admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
        .cf-admin-title-row { display: flex; align-items: center; gap: 10px; }
        .cf-admin-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--cf-text-primary); letter-spacing: -0.2px; }
        .cf-admin-desc { font-size: 13px; color: var(--cf-text-muted); line-height: 1.6; }
        .cf-pending-badge { background: rgba(245,158,11,0.1); color: var(--cf-warning); border: 1px solid rgba(245,158,11,0.18); border-radius: 9999px; font-size: 11px; font-weight: 590; padding: 1px 8px; }

        .cf-footer { border-top: 1px solid rgba(255,255,255,0.04); padding: 20px 0; margin-top: 16px; }
        .cf-footer-inner { display: flex; align-items: center; justify-content: space-between; }
        .cf-footer-brand { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--cf-text-subtle); }
        .cf-footer-credits { font-size: 11px; color: #3e3e44; }
      `}</style>
    </main>
  );
}
