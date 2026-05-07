import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { user, transactions } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { calculateSpendingRisk, getHamsterMood } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Shield, Mic, Eye, Plus, ScanLine, Send, HelpCircle, ChevronRight, Bell, Calendar,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GX Buddy — Your AI Money Companion" },
      { name: "description", content: "GX Buddy is an AI-powered financial companion inside GXBank for young Malaysians. Build resilience, dodge debt, and meet your purple hamster mascot." },
      { property: "og:title", content: "GX Buddy — Your AI Money Companion" },
      { property: "og:description", content: "AI coaching, debt prediction, auto-savings & a cute purple hamster mascot." },
    ],
  }),
  component: Home,
});

function Home() {
  const [buddySlide, setBuddySlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const buf = user.emergencyBuffer;
  const safeToSpend = user.safeToSpend;
  const hamsterMood = getHamsterMood(user.resilienceScore);

  const buddyCards = [
    {
      to: "/coach",
      label: "Ask Buddy",
      icon: Mic,
      message: `"Spend up to RM${safeToSpend} today and still hit your weekend goal 🐹"`,
    },
    {
      to: "/weekly-report",
      label: "Weekly Report",
      icon: Calendar,
      message: `"Check your weekly spending insights and progress 📊"`,
    },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > deltaY * 2) {
      if (deltaX > 0) {
        setBuddySlide((p) => (p + 1) % buddyCards.length);
      } else {
        setBuddySlide((p) => (p - 1 + buddyCards.length) % buddyCards.length);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <AppShell>
      {/* HERO — GXBank style */}
      <section className="relative px-5 pt-12 pb-6 bg-hero rounded-b-[2.5rem] overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-[oklch(0.7_0.25_330)]/40 blur-3xl" />
        <div aria-hidden className="absolute top-10 -left-20 h-60 w-60 rounded-full bg-primary/40 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/70">Total balance</p>
              <Shield className="h-3.5 w-3.5 text-white/70" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-[28px] font-extrabold tracking-tight text-white">RM{user.balance.toLocaleString()}</h1>
              <Eye className="h-4 w-4 text-white/70" />
            </div>
            <Link to="/me" className="flex items-center gap-1 mt-1 text-xs text-white/70">
              Balance info <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-full glass grid place-items-center" aria-label="help">
              <HelpCircle className="h-4 w-4 text-white" />
            </button>
            <button className="h-9 w-9 rounded-full glass grid place-items-center relative" aria-label="notifications">
              <Bell className="h-4 w-4 text-white" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
          </div>
        </div>

        {/* Action pills */}
        <Card className="relative mt-5 p-4 rounded-3xl glass-strong border-white/10 shadow-card">
          <div className="grid grid-cols-3 gap-2">
            {[
              { Icon: Plus, label: "Add Money", to: "/auto-save" },
              { Icon: ScanLine, label: "Scan QR", to: "/" },
              { Icon: Send, label: "Send Money", to: "/coach" },
            ].map(({ Icon, label, to }) => (
              <Link key={label} to={to} className="flex flex-col items-center gap-2">
                <motion.div whileTap={{ scale: 0.9 }} className="h-12 w-12 rounded-full bg-primary-gradient grid place-items-center shadow-glow">
                  <Icon className="h-5 w-5 text-white" />
                </motion.div>
                <span className="text-xs font-semibold text-white/90">{label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* AI WHISPER — Buddy carousel with clickable dots + swipe */}
      <section className="px-5 mt-5">
        {/* Slide track — pure CSS transform, GPU accelerated, no JS animation loop */}
        <div
          className="overflow-hidden rounded-3xl glass-strong shadow-card"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(-${buddySlide * 100}%)`,
              transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
            }}
          >
            {buddyCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.to} className="min-w-full flex-shrink-0 p-1">
                  <Link to={card.to} className="block">
                    <div className="rounded-2xl p-3 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <span aria-hidden className="absolute inset-0 rounded-full bg-primary/40 animate-pulse-ring" />
                        <Hamster mood={hamsterMood} size={56} float={false} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{card.label}</p>
                        <p className="text-sm font-semibold leading-snug text-foreground">{card.message}</p>
                      </div>
                      <Icon className="h-5 w-5 text-primary shrink-0" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination dots — clickable to switch slides */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {buddyCards.map((card, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setBuddySlide(idx)}
              aria-label={`Go to ${card.label}`}
              style={{
                width: idx === buddySlide ? 28 : 10,
                height: 10,
                borderRadius: 999,
                background: idx === buddySlide ? "var(--color-primary)" : "rgba(255,255,255,0.3)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease",
              }}
            />
          ))}
        </div>
      </section>

      {/* Everyday account row — GXBank style */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Your everyday account</h2>
          <span className="text-xs text-muted-foreground">●●●</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/me">
            <Card className="p-4 rounded-2xl glass border-white/10 shadow-card h-full flex flex-col justify-between min-h-[140px]">
              <div>
                <p className="text-xs text-muted-foreground">Main account</p>
                <p className="text-lg font-extrabold mt-1">RM{user.balance.toLocaleString()}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">View transactions</p>
            </Card>
          </Link>
          <Link to="/auto-save">
            <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card h-full flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div aria-hidden className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-mint/30 blur-2xl" />
              <div className="relative">
                <p className="text-sm font-bold">Smart Auto-Save</p>
                <p className="text-[11px] text-muted-foreground mt-1">Earn 2.50% p.a.<br/>Auto-save round-ups</p>
              </div>
              <span className="relative inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-white/30 text-xs font-semibold w-fit">Activate</span>
            </Card>
          </Link>
        </div>
      </section>

      {/* For you today */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">For you today</h2>
        <Card className="p-4 rounded-3xl glass-strong border-white/10 shadow-card relative overflow-hidden">
          <div aria-hidden className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-mint/30 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="relative h-24 w-24 grid place-items-center shrink-0">
              <span aria-hidden className="absolute h-24 w-24 rounded-full border border-mint/40 animate-pulse-ring" />
              <span aria-hidden className="absolute h-16 w-16 rounded-full border border-mint/60 animate-pulse-ring" style={{ animationDelay: "0.6s" }} />
              <div className="h-12 w-12 rounded-full bg-mint-gradient grid place-items-center shadow-glow">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Emergency Buffer</p>
              <p className="text-[11px] text-muted-foreground">RM{buf.current.toFixed(2)} of RM{buf.target} — Buddy stashing round-ups</p>
              <Progress value={(buf.current / buf.target) * 100} className="h-1.5 mt-2" />
              <Link to="/emergency" className="inline-flex mt-3 px-3 py-1.5 rounded-full border border-white/30 text-xs font-semibold">Top up now</Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Transactions */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">Recent Activity</h2>
        <Card className="rounded-2xl glass border-white/10 shadow-card divide-y divide-white/5 overflow-hidden">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3">
              <div className={`h-10 w-10 rounded-xl grid place-items-center text-xs font-bold ${
                t.risk === "save" ? "bg-mint/20 text-mint" :
                t.risk === "high" ? "bg-destructive/20 text-destructive" :
                t.risk === "med" ? "bg-warning/20 text-warning" :
                "bg-white/10 text-foreground"
              }`}>{t.category[0]}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.category} · {t.time}</p>
              </div>
              <p className={`text-sm font-bold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>
                {t.amount > 0 ? "+" : ""}RM {Math.abs(t.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </Card>
      </section>
    </AppShell>
  );
}
