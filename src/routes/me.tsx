import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { user, badges } from "@/lib/data";
import { Settings, Bell, Lock, LogOut, HelpCircle, Shield, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { getHamsterMood } from "@/lib/utils";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "Profile — GX Buddy" },
      { name: "description", content: "Your profile, resilience score, achievements and personalization." },
    ],
  }),
  component: Me,
});

function Me() {
  const hamsterMood = getHamsterMood(user.resilienceScore);
  const isMobile = !!import.meta.env.VITE_SPA;

  if (isMobile) {
    return (
      <AppShell>
        <div className="px-6 pt-10 pb-2">
          <PageHeader title="Profile" back={false} />
        </div>

        {/* User Card with Score — Pro Style */}
        <section className="px-6 mt-4">
          <Card className="p-6 rounded-[2.5rem] border-0 bg-hero text-primary-foreground shadow-premium relative overflow-hidden group">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_70%)] opacity-20" />
            <div className="relative flex items-end gap-5">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                <Hamster mood={hamsterMood} size={110} float={false} />
              </motion.div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{user.tier}</p>
                </div>
                <h2 className="text-2xl font-black tracking-tight leading-tight">{user.name}</h2>
                <p className="text-xs font-bold text-white/50 mt-1">Level {user.level} · {user.memberSince}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">🔥 {user.streak} day streak</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* GX Score Section */}
        <section className="px-6 mt-10">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2 flex items-center gap-2">
               <TrendingUp className="h-4 w-4 text-primary" /> GX Score
             </h3>
          </div>
          <Card className="p-6 rounded-[2.5rem] glass-premium border-white/5 shadow-premium">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-4xl font-black text-white tracking-tighter">{user.resilienceScore}<span className="text-white/20 text-xl">/100</span></p>
                <p className="text-[11px] font-bold text-white/40 mt-1 uppercase tracking-tight">Financial strength score</p>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest shadow-glow">
                {user.resilienceScore >= 70 ? "Excellent" : user.resilienceScore >= 50 ? "Good" : "Improving"}
              </span>
            </div>
            <Progress value={user.resilienceScore} className="h-2.5 bg-white/5" indicatorClassName="bg-primary shadow-glow" />
            <p className="text-[10px] font-bold text-white/30 mt-3 uppercase tracking-widest text-center">{100 - user.resilienceScore} points to next level 🐹</p>
          </Card>
        </section>

        {/* Financial Snapshot */}
        <section className="px-6 mt-10">
          <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2 mb-4">Snapshot</h3>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Saved" value={`RM${user.totalSavings}`} icon="💰" />
            <Stat label="Buffer" value={`RM${user.emergencyBuffer.current}`} icon="🛡️" />
            <Stat label="Streak" value={`${user.streak}d`} icon="🔥" />
          </div>
        </section>

        {/* Achievements */}
        <section className="px-6 mt-10">
          <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2 mb-4">Badges</h3>
          <div className="grid grid-cols-4 gap-4">
            {badges.map(b => (
              <motion.div
                key={b.id}
                whileHover={b.earned ? { scale: 1.1, rotate: 5 } : {}}
                className={`aspect-square rounded-[1.8rem] glass-premium border border-white/5 shadow-premium grid place-items-center text-3xl transition-all active-scale ${b.earned ? "shadow-glow opacity-100" : "opacity-20 grayscale"}`}
                title={b.name}
              >
                {b.emoji}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Settings & Support — Refined List */}
        <section className="px-6 mt-12 pb-32">
          <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2 mb-4">Account & Support</h3>
          <div className="space-y-3">
            {[
              { label: "Financial Personality", icon: Sparkles, color: "text-primary", to: "/personality" },
              { label: "Buddy Room", icon: Shield, color: "text-accent", to: "/mascot-room" },
              { label: "Account Settings", icon: Settings, color: "text-white/40", to: "/me" },
              { label: "Help & Support", icon: HelpCircle, color: "text-white/40", to: "/me" },
            ].map((item, i) => (
              <Link key={i} to={item.to as any} className="active-scale block">
                <Card className="p-5 rounded-[2rem] glass-premium border-white/5 shadow-premium flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/5 grid place-items-center">
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <span className="font-bold text-[15px] text-white/90 tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </Card>
              </Link>
            ))}
            <Card className="p-5 rounded-[2rem] bg-destructive/10 border border-destructive/20 shadow-premium flex items-center justify-between group active-scale cursor-pointer">
              <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-destructive/20 grid place-items-center">
                      <LogOut className="h-5 w-5 text-destructive" />
                  </div>
                  <span className="font-bold text-[15px] text-destructive tracking-tight">Logout</span>
              </div>
              <ChevronRight className="h-5 w-5 text-destructive/20" />
            </Card>
          </div>
        </section>
      </AppShell>
    );
  }

  // ORIGINAL WEB UI
  return (
    <AppShell>
      <PageHeader title="Profile" back={false} />

      {/* User Card with Score */}
      <section className="px-5">
        <Card className="p-6 rounded-[2rem] border-0 bg-hero text-primary-foreground shadow-premium relative overflow-hidden group">
          <div aria-hidden className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,white,transparent_60%)]" />
          <div className="relative flex items-end gap-5">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity }}>
              <Hamster mood={hamsterMood} size={100} float={false} />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-2xl font-black tracking-tight leading-tight">{user.name}</h2>
              <p className="text-xs font-bold text-white/50 mt-1">{user.tier} · Level {user.level}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">🔥 {user.streak}d streak</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Resilience Score Section */}
      <section className="px-5 mt-8">
        <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> GX Score
        </h3>
        <Card className="p-6 rounded-[2rem] glass-premium border-white/5 shadow-premium">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-black text-white">{user.resilienceScore}/100</p>
              <p className="text-[11px] font-bold text-white/40 mt-1 uppercase tracking-tight">Financial strength score</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
              {user.resilienceScore >= 70 ? "Excellent" : user.resilienceScore >= 50 ? "Good" : "Improving"}
            </span>
          </div>
          <Progress value={user.resilienceScore} className="h-2 bg-white/5" indicatorClassName="bg-primary shadow-glow" />
          <p className="text-[10px] font-bold text-white/30 mt-3 uppercase tracking-widest">{100 - user.resilienceScore} more points to level up 🐹</p>
        </Card>
      </section>

      {/* Financial Snapshot */}
      <section className="px-5 mt-8">
        <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2 mb-4">Financial Snapshot</h3>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Saved" value={`RM${user.totalSavings}`} icon="💰" />
          <Stat label="Buffer" value={`RM${user.emergencyBuffer.current}`} icon="🛡️" />
          <Stat label="Streak" value={`${user.streak}d`} icon="🔥" />
        </div>
      </section>

      {/* Achievements */}
      <section className="px-5 mt-8">
        <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2 mb-4">Badges & Achievements</h3>
        <div className="grid grid-cols-4 gap-3">
          {badges.map(b => (
            <motion.div
              key={b.id}
              whileHover={b.earned ? { scale: 1.1 } : {}}
              className={`aspect-square rounded-2xl glass-premium border border-white/5 shadow-premium grid place-items-center text-3xl transition-all active-scale ${b.earned ? "shadow-glow opacity-100" : "opacity-20 grayscale"}`}
              title={b.name}
            >
              {b.emoji}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Settings & Support */}
      <section className="px-5 mt-10 pb-20">
        <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2 mb-4">Settings & Support</h3>
        <div className="space-y-3">
          {[
            { label: "Notifications", icon: Bell },
            { label: "Privacy & Security", icon: Lock },
            { label: "Account Settings", icon: Settings },
          ].map((item, i) => (
            <Card key={i} className="p-5 rounded-[2rem] glass-premium border-white/5 shadow-premium flex items-center justify-between group active-scale">
                <span className="font-bold text-[14px] text-white/90 flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-primary" /> {item.label}
                </span>
                <ChevronRight className="h-5 w-5 text-white/20" />
            </Card>
          ))}
          <Card className="p-5 rounded-[2rem] bg-destructive/10 border border-destructive/20 shadow-premium flex items-center justify-between group active-scale">
            <span className="font-bold text-[14px] text-destructive flex items-center gap-3">
                <LogOut className="h-4 w-4 text-destructive" /> Logout
            </span>
            <ChevronRight className="h-5 w-5 text-destructive/20" />
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  const isMobile = !!import.meta.env.VITE_SPA;
  if (isMobile) {
    return (
      <Card className="p-4 rounded-[2rem] glass-premium border-white/5 shadow-premium text-center active-scale">
        <p className="text-2xl mb-1">{icon}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</p>
        <p className="text-[14px] font-black mt-1 text-white tracking-tighter">{value}</p>
      </Card>
    );
  }
  return (
    <Card className="p-3 rounded-2xl glass-strong border-white/10 shadow-card text-center">
      <p className="text-lg">{icon}</p>
      <p className="text-xs uppercase text-muted-foreground tracking-wider mt-1">{label}</p>
      <p className="text-sm font-extrabold mt-1">{value}</p>
    </Card>
  );
}
