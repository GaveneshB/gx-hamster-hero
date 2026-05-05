import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { user, missions, transactions } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Shield, TrendingUp, AlertTriangle, PiggyBank, Sparkles, Mic,
  Eye, Trophy, Users, Heart, Bell, Zap,
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

const quickActions = [
  { to: "/coach", label: "Ask Buddy", Icon: Sparkles, tone: "bg-primary-gradient text-primary-foreground" },
  { to: "/debt-radar", label: "Debt Radar", Icon: AlertTriangle, tone: "bg-warning/20 text-warning-foreground" },
  { to: "/auto-save", label: "Auto Save", Icon: PiggyBank, tone: "bg-mint-gradient text-accent-foreground" },
  { to: "/future-you", label: "Future You", Icon: TrendingUp, tone: "bg-secondary text-secondary-foreground" },
  { to: "/spending-warnings", label: "Warnings", Icon: Bell, tone: "bg-destructive/15 text-destructive" },
  { to: "/bnpl", label: "BNPL", Icon: Eye, tone: "bg-accent/40 text-accent-foreground" },
  { to: "/emergency", label: "Buffer", Icon: Shield, tone: "bg-secondary text-secondary-foreground" },
  { to: "/personality", label: "Persona", Icon: Heart, tone: "bg-primary/15 text-primary" },
  { to: "/weekly-report", label: "Report", Icon: Zap, tone: "bg-warning/25 text-warning-foreground" },
  { to: "/group-challenges", label: "Friends", Icon: Users, tone: "bg-mint-gradient text-accent-foreground" },
  { to: "/mascot-room", label: "Pet Room", Icon: Trophy, tone: "bg-primary-gradient text-primary-foreground" },
];

function Home() {
  const buf = user.emergencyBuffer;
  const safeToSpend = 42;
  return (
    <AppShell>
      {/* HERO */}
      <section className="relative px-5 pt-12 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Salam, {user.firstName} 👋</p>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">
              Your buddy is <span className="text-primary">cheering you on</span>
            </h1>
          </div>
          <button className="h-10 w-10 rounded-full glass grid place-items-center" aria-label="notifications">
            <Bell className="h-5 w-5 text-primary" />
          </button>
        </div>

        <Card className="mt-6 p-5 rounded-3xl bg-hero text-primary-foreground border-0 shadow-glow overflow-hidden relative">
          <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-xl animate-pulse" />
              <Hamster mood="happy" size={120} />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest opacity-80">Available Balance</p>
              <p className="text-3xl font-extrabold">RM {user.balance.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-white/20">Score {user.resilienceScore}</span>
                <span className="px-2 py-1 rounded-full bg-white/20">Lvl {user.level}</span>
                <span className="px-2 py-1 rounded-full bg-mint text-accent-foreground font-semibold">🔥 {user.streak}d</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/15 p-3">
              <p className="text-[10px] uppercase opacity-80">Safe Today</p>
              <p className="text-lg font-bold">RM {safeToSpend}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <p className="text-[10px] uppercase opacity-80">Saved</p>
              <p className="text-lg font-bold">RM {user.totalSavings}</p>
            </div>
            <Link to="/coach" className="rounded-2xl bg-mint text-accent-foreground p-3 flex flex-col items-center justify-center font-bold">
              <Mic className="h-4 w-4" />
              <span className="text-xs mt-1">Talk</span>
            </Link>
          </div>
        </Card>
      </section>

      {/* AI WHISPER */}
      <section className="px-5">
        <Link to="/coach">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="rounded-3xl glass p-4 flex items-center gap-3 shadow-card"
          >
            <div className="h-10 w-10 rounded-full bg-primary-gradient grid place-items-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Buddy whispers</p>
              <p className="text-sm font-semibold leading-snug">
                "You can spend up to RM42 today and still hit your weekend goal 🐹"
              </p>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* EMERGENCY BUFFER */}
      <section className="px-5 mt-5">
        <Card className="p-4 rounded-3xl border-0 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold">Emergency Buffer</p>
            </div>
            <p className="text-xs text-muted-foreground">RM {buf.current} / RM {buf.target}</p>
          </div>
          <Progress value={(buf.current / buf.target) * 100} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">RM155 to go — Buddy will auto-stash RM3/day 🐹</p>
        </Card>
      </section>

      {/* QUICK ACTIONS */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">Buddy Tools</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ to, label, Icon, tone }) => (
            <Link key={to} to={to} className="group">
              <div className={`aspect-square rounded-2xl ${tone} grid place-items-center shadow-card transition-transform group-active:scale-95`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-semibold text-center mt-1.5">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* MISSIONS */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Active Missions</h2>
          <Link to="/missions" className="text-xs text-primary font-semibold">View all →</Link>
        </div>
        <div className="space-y-3">
          {missions.slice(0, 2).map(m => (
            <Card key={m.id} className="p-4 rounded-2xl border-0 shadow-card flex items-center gap-3">
              <div className="text-3xl">{m.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-bold">{m.title}</p>
                <Progress value={m.progress} className="h-2 mt-2" />
                <p className="text-[11px] text-muted-foreground mt-1">{m.desc}</p>
              </div>
              <span className="text-xs font-bold text-primary">+{m.xp}xp</span>
            </Card>
          ))}
        </div>
      </section>

      {/* TRANSACTIONS */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">Recent Activity</h2>
        <Card className="rounded-2xl border-0 shadow-card divide-y divide-border overflow-hidden">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3">
              <div className={`h-10 w-10 rounded-xl grid place-items-center text-xs font-bold ${
                t.risk === "save" ? "bg-mint text-accent-foreground" :
                t.risk === "high" ? "bg-destructive/15 text-destructive" :
                t.risk === "med" ? "bg-warning/25 text-warning-foreground" :
                "bg-secondary text-secondary-foreground"
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
