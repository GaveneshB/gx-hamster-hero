import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
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
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const buf = user.emergencyBuffer;
  const safeToSpend = user.safeToSpend;
  const riskScore = calculateSpendingRisk(user);
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
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = touchStart.x - endX;
    const deltaY = Math.abs(touchStart.y - endY);

    // Only swipe if horizontal movement is much larger than vertical
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > deltaY * 2) {
      if (deltaX > 0) {
        // Swiped left - next slide
        setBuddySlide((prev: number) => (prev + 1) % buddyCards.length);
      } else {
        // Swiped right - previous slide
        setBuddySlide((prev: number) => (prev - 1 + buddyCards.length) % buddyCards.length);
      }
    }

    setTouchStart(null);
  };
  const isMobile = !!import.meta.env.VITE_SPA;

  if (isMobile) {
    return (
      <AppShell>
        {/* HERO — GXBank Pro style for Mobile */}
        <section className="relative px-6 pt-14 pb-8 overflow-hidden">
          <div aria-hidden className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-primary/20 blur-[100px] animate-float" />
  
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-glow animate-pulse" />
                <p className="text-[11px] font-black uppercase tracking-widest text-white/50">Total Balance</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-2xl">
                  <span className="text-white/60 text-2xl mr-1 font-bold">RM</span>
                  {user.balance.toLocaleString()}
                </h1>
                <Eye className="h-5 w-5 text-white/40" />
              </div>
              <Link to="/me" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary group">
                Account Details <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-11 w-11 rounded-2xl glass-premium grid place-items-center active-scale transition-all border-white/5" aria-label="help">
                <HelpCircle className="h-5 w-5 text-white/80" />
              </button>
              <button className="h-11 w-11 rounded-2xl glass-premium grid place-items-center active-scale transition-all border-white/5 relative" aria-label="notifications">
                <Bell className="h-5 w-5 text-white/80" />
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-destructive shadow-glow ring-2 ring-background" />
              </button>
            </div>
          </div>
  
          {/* Action Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { Icon: Plus, label: "Add Money", to: "/auto-save" },
              { Icon: ScanLine, label: "Scan QR", to: "/" },
              { Icon: Send, label: "Send", to: "/coach" },
            ].map(({ Icon, label, to }) => (
              <Link key={label} to={to} className="group">
                <div className="flex flex-col items-center gap-3">
                  <motion.div 
                    whileTap={{ scale: 0.85 }} 
                    className="h-14 w-14 rounded-2xl glass-premium grid place-items-center shadow-premium group-hover:shadow-glow transition-all ring-1 ring-white/10 active-scale"
                  >
                    <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </motion.div>
                  <span className="text-[11px] font-black uppercase tracking-tight text-white/70 group-hover:text-white transition-colors">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
  
        {/* AI WHISPER — Buddy carousel */}
        <section className="px-6 mt-4">
          <div 
            className="overflow-hidden rounded-[2.5rem] glass-card ring-1 ring-white/10"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              initial={false}
              animate={{ x: `${-buddySlide * 100}%` }}
              transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.8 }}
              className="flex"
            >
              {buddyCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.to} className="min-w-full flex-shrink-0 p-1">
                    <Link to={card.to} className="block">
                      <div className="p-4 flex items-center gap-4 active-scale">
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                          <Hamster mood={hamsterMood} size={64} float={false} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{card.label}</p>
                          <p className="text-[15px] font-bold leading-tight text-white tracking-tight drop-shadow-sm">{card.message}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-white/5 grid place-items-center shrink-0 border border-white/5">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </motion.div>
          </div>
  
          {/* Dot indicators - Liquid Apple Style */}
          <div className="flex items-center justify-center gap-3 mt-5">
            {buddyCards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setBuddySlide(idx)}
                className="relative h-4 w-10 flex items-center justify-center group"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <motion.div
                  animate={{ 
                    width: idx === buddySlide ? 28 : 8,
                    backgroundColor: idx === buddySlide ? "var(--primary)" : "rgba(255,255,255,0.2)"
                  }}
                  className="h-1.5 rounded-full transition-colors duration-200"
                />
                {idx === buddySlide && (
                  <motion.div 
                    layoutId="buddy-dot-glow"
                    className="absolute inset-0 bg-primary/10 blur-lg rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </section>
  
        {/* Everyday account row — GXBank Pro style */}
        <section className="px-6 mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black tracking-tight">Accounts</h2>
            <ChevronRight className="h-5 w-5 text-white/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/me" className="block">
              <Card className="p-5 rounded-[2rem] glass-premium border-white/5 shadow-premium h-full flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                <div aria-hidden className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Main</p>
                  <p className="text-xl font-black mt-2 tracking-tighter">RM{user.balance.toLocaleString()}</p>
                </div>
                <p className="text-[10px] font-bold text-primary flex items-center gap-1 mt-4">
                  View All <ChevronRight className="h-3 w-3" />
                </p>
              </Card>
            </Link>
            <Link to="/auto-save" className="block">
              <Card className="p-5 rounded-[2rem] glass-card border-white/5 shadow-premium h-full flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                <div aria-hidden className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl group-hover:bg-accent/20 transition-all" />
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent/60">Smart Save</p>
                  <p className="text-[15px] font-extrabold leading-tight mt-2 text-white/90">Earn 2.50% p.a.</p>
                  <p className="text-[10px] text-white/40 mt-1 font-bold">Auto-roundups active</p>
                </div>
                <span className="relative inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest w-fit">Active</span>
              </Card>
            </Link>
          </div>
        </section>
  
        {/* For you today */}
        <section className="px-6 mt-10">
          <h2 className="text-lg font-black tracking-tight mb-4">Financial Health</h2>
          <Card className="p-6 rounded-[2.5rem] glass-premium border-white/5 shadow-premium relative overflow-hidden group">
            <div aria-hidden className="absolute -top-20 -left-20 h-52 w-52 rounded-full bg-accent/10 blur-[100px] group-hover:bg-accent/20 transition-all" />
            <div className="relative flex items-center gap-5">
              <div className="relative h-20 w-20 grid place-items-center shrink-0">
                <div className="absolute inset-0 rounded-full border border-accent/20 animate-pulse" />
                <div className="h-12 w-12 rounded-2xl bg-mint-gradient grid place-items-center shadow-glow rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  <Shield className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-accent mb-1">Emergency Buffer</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-black tracking-tighter">RM{buf.current}</p>
                  <p className="text-xs text-white/30 font-bold">/ RM{buf.target}</p>
                </div>
                <Progress value={(buf.current / buf.target) * 100} className="h-2 mt-3" />
                <Link to="/emergency" className="inline-flex mt-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all">Top up</Link>
              </div>
            </div>
          </Card>
        </section>
  
        {/* Transactions */}
        <section className="px-6 mt-10 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black tracking-tight">Recent Activity</h2>
            <p className="text-[11px] font-black text-primary uppercase">View All</p>
          </div>
          <Card className="rounded-[2.5rem] glass-premium border-white/5 shadow-premium overflow-hidden">
            <div className="divide-y divide-white/5">
              {transactions.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                  <div className={`h-12 w-12 rounded-2xl grid place-items-center text-sm font-black shadow-inner transition-transform group-active:scale-90 ${
                    t.risk === "save" ? "bg-accent/10 text-accent" :
                    t.risk === "high" ? "bg-destructive/10 text-destructive" :
                    t.risk === "med" ? "bg-warning/10 text-warning" :
                    "bg-white/5 text-white/50"
                  }`}>{t.category[0]}</div>
                  <div className="flex-1">
                    <p className="text-[14px] font-black text-white tracking-tight">{t.name}</p>
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-tighter">{t.category} · {t.time}</p>
                  </div>
                  <p className={`text-[15px] font-black tracking-tighter ${t.amount > 0 ? "text-accent" : "text-white"}`}>
                    {t.amount > 0 ? "+" : "-"}RM{Math.abs(t.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </AppShell>
    );
  }

  // ORIGINAL WEB UI
  return (
    <AppShell>
      {/* HERO — GXBank style */}
      <section className="relative px-5 pt-12 pb-6 bg-hero rounded-b-[2.5rem] overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="absolute top-10 -left-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />

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
        <Card className="relative mt-5 p-4 rounded-3xl glass shadow-card">
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

      {/* AI WHISPER — Buddy carousel */}
      <section className="px-5 mt-5">
        <div 
          className="overflow-hidden rounded-3xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            initial={false}
            animate={{ x: `${-buddySlide * 100}%` }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 50,
              mass: 1,
            }}
            className="flex"
          >
            {buddyCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.to}
                  className="min-w-full flex-shrink-0 p-1"
                >
                  <Link to={card.to} className="block">
                    <div className="rounded-3xl glass-card p-4 flex items-center gap-4 shadow-premium border-white/5 active-scale">
                      <div className="relative pointer-events-none">
                        <Hamster mood={hamsterMood} size={64} float={false} />
                      </div>
                      <div className="flex-1 min-w-0 pointer-events-none">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-black mb-1">{card.label}</p>
                        <p className="text-sm font-bold leading-tight text-white tracking-tight">{card.message}</p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-white/5 grid place-items-center">
                        <Icon className="h-5 w-5 text-primary shrink-0" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Dot indicators - Direct state control */}
        <div className="flex items-center justify-center gap-2 mt-4 pointer-events-auto">
          {buddyCards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => setBuddySlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === buddySlide 
                  ? "w-8 h-2.5 bg-primary" 
                  : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to ${card.label}`}
              type="button"
            />
          ))}
        </div>
      </section>

      {/* Everyday account row — GXBank style */}
      <section className="px-5 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black tracking-tight">Accounts</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/me">
            <Card className="p-4 rounded-3xl glass-premium border-white/5 shadow-premium h-full flex flex-col justify-between min-h-[140px] active-scale">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Main</p>
                <p className="text-lg font-black mt-2">RM{user.balance.toLocaleString()}</p>
              </div>
              <p className="text-[10px] font-bold text-primary flex items-center gap-1 mt-4">View All <ChevronRight className="h-3 w-3" /></p>
            </Card>
          </Link>
          <Link to="/auto-save">
            <Card className="p-4 rounded-3xl glass-card border-white/5 shadow-premium h-full flex flex-col justify-between min-h-[140px] relative overflow-hidden active-scale">
              <div aria-hidden className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-accent/20 blur-2xl" />
              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent">Smart Save</p>
                <p className="text-xs font-bold mt-2 text-white/90">Earn 2.50% p.a.</p>
              </div>
              <span className="relative inline-flex items-center justify-center px-3 py-1 rounded-full border border-accent/20 bg-accent/10 text-[10px] font-black text-accent uppercase tracking-widest w-fit">Active</span>
            </Card>
          </Link>
        </div>
      </section>

      {/* For you today */}
      <section className="px-5 mt-8">
        <h2 className="text-base font-black tracking-tight mb-4">Financial Health</h2>
        <Card className="p-5 rounded-[2rem] glass-premium border-white/5 shadow-premium relative overflow-hidden active-scale">
          <div aria-hidden className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="relative h-16 w-16 grid place-items-center shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-mint-gradient grid place-items-center shadow-glow">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Emergency Buffer</p>
              <p className="text-lg font-black tracking-tighter">RM{buf.current} <span className="text-white/30 text-xs">/ RM{buf.target}</span></p>
                <Progress value={(buf.current / buf.target) * 100} className="h-2 mt-3" />
              <Link to="/emergency" className="inline-flex mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">Top up</Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Activity */}
      <section className="px-5 mt-6 mb-10">
        <h2 className="text-base font-bold mb-3">Recent Activity</h2>
        <Card className="rounded-2xl glass border-white/10 shadow-card divide-y divide-white/5 overflow-hidden">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3">
              <div className={`h-10 w-10 rounded-xl grid place-items-center text-xs font-bold ${
                t.risk === "save" ? "bg-accent/20 text-accent" :
                t.risk === "high" ? "bg-destructive/20 text-destructive" :
                t.risk === "med" ? "bg-warning/20 text-warning" :
                "bg-white/10 text-foreground"
              }`}>{t.category[0]}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.category} · {t.time}</p>
              </div>
              <p className={`text-sm font-bold ${t.amount > 0 ? "text-accent" : "text-white"}`}>
                {t.amount > 0 ? "+" : ""}RM {Math.abs(t.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </Card>
      </section>
    </AppShell>
  );
}
