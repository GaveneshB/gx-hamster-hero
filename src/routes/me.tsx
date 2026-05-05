import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { user, badges } from "@/lib/data";
import { Settings, Bell, Lock, LogOut, HelpCircle, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

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
  return (
    <AppShell>
      <PageHeader title="Profile" back={false} />

      {/* User Card with Score */}
      <section className="px-5">
        <Card className="p-5 rounded-3xl border-0 bg-hero text-primary-foreground shadow-glow relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,white,transparent_60%)]" />
          <div className="relative flex items-end gap-4">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity }}>
              <Hamster mood="happy" size={100} float={false} />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold">{user.name}</h2>
              <p className="text-xs opacity-80 mt-1">{user.tier} · Level {user.level} · {user.memberSince}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-mint text-accent-foreground text-xs font-bold">🎯 {user.resilienceScore}</span>
                <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-bold">🔥 {user.streak}d</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Resilience Score Section */}
      <section className="px-5 mt-6">
        <h3 className="text-base font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> GX Resilience Score
        </h3>
        <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-extrabold text-foreground">{user.resilienceScore}/100</p>
              <p className="text-[11px] text-muted-foreground mt-1">Financial strength score</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-bold">
              {user.resilienceScore >= 70 ? "Excellent" : user.resilienceScore >= 50 ? "Good" : "Improving"}
            </span>
          </div>
          <Progress value={user.resilienceScore} className="h-2" />
          <p className="text-[10px] text-muted-foreground mt-2">{100 - user.resilienceScore} more points to level up 🐹</p>
        </Card>
      </section>

      {/* Financial Snapshot */}
      <section className="px-5 mt-6">
        <h3 className="text-base font-bold mb-3">Financial Snapshot</h3>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total Saved" value={`RM${user.totalSavings}`} icon="💰" />
          <Stat label="Buffer" value={`RM${user.emergencyBuffer.current}`} icon="🛡️" />
          <Stat label="Streak" value={`${user.streak}d`} icon="🔥" />
        </div>
      </section>

      {/* Emergency Buffer */}
      <section className="px-5 mt-4">
        <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold">Emergency Buffer</p>
            <p className="text-xs text-muted-foreground">{Math.round((user.emergencyBuffer.current / user.emergencyBuffer.target) * 100)}%</p>
          </div>
          <Progress value={(user.emergencyBuffer.current / user.emergencyBuffer.target) * 100} className="h-2" />
          <p className="text-[10px] text-muted-foreground mt-2">RM{user.emergencyBuffer.current} of RM{user.emergencyBuffer.target}</p>
        </Card>
      </section>

      {/* Achievements */}
      <section className="px-5 mt-6">
        <h3 className="text-base font-bold mb-3">Badges & Achievements</h3>
        <div className="grid grid-cols-4 gap-3">
          {badges.map(b => (
            <motion.div
              key={b.id}
              whileHover={b.earned ? { scale: 1.1 } : {}}
              className={`aspect-square rounded-2xl glass-strong border border-white/10 shadow-card grid place-items-center text-3xl transition-all ${b.earned ? "shadow-glow" : "opacity-30 grayscale"}`}
              title={b.name}
            >
              {b.emoji}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Personalization Section */}
      <section className="px-5 mt-6">
        <h3 className="text-base font-bold mb-3">Personalization</h3>
        <div className="space-y-2">
          <Link to="/personality">
            <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card flex items-center justify-between group hover:shadow-glow transition-all">
              <span className="font-semibold text-sm flex items-center gap-2">💜 Financial Personality Scan</span>
              <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">›</span>
            </Card>
          </Link>
          <Link to="/mascot-room">
            <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card flex items-center justify-between group hover:shadow-glow transition-all">
              <span className="font-semibold text-sm flex items-center gap-2">🏠 Buddy Room</span>
              <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">›</span>
            </Card>
          </Link>
          <Link to="/weekly-report">
            <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card flex items-center justify-between group hover:shadow-glow transition-all">
              <span className="font-semibold text-sm flex items-center gap-2">📊 Weekly AI Report</span>
              <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">›</span>
            </Card>
          </Link>
        </div>
      </section>

      {/* Settings & Support */}
      <section className="px-5 mt-6">
        <h3 className="text-base font-bold mb-3">Settings & Support</h3>
        <div className="space-y-2">
          <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card flex items-center justify-between group hover:shadow-glow transition-all">
            <span className="font-semibold text-sm flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</span>
            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">›</span>
          </Card>
          <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card flex items-center justify-between group hover:shadow-glow transition-all">
            <span className="font-semibold text-sm flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Privacy & Security</span>
            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">›</span>
          </Card>
          <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card flex items-center justify-between group hover:shadow-glow transition-all">
            <span className="font-semibold text-sm flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Account Settings</span>
            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">›</span>
          </Card>
          <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card flex items-center justify-between group hover:shadow-glow transition-all">
            <span className="font-semibold text-sm flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Help & Support</span>
            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">›</span>
          </Card>
          <Card className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 shadow-card flex items-center justify-between group hover:shadow-glow transition-all">
            <span className="font-semibold text-sm flex items-center gap-2"><LogOut className="h-4 w-4 text-destructive" /> Logout</span>
            <span className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">›</span>
          </Card>
        </div>
      </section>

      <div className="h-8" />
    </AppShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Card className="p-3 rounded-2xl glass-strong border-white/10 shadow-card text-center">
      <p className="text-lg">{icon}</p>
      <p className="text-xs uppercase text-muted-foreground tracking-wider mt-1">{label}</p>
      <p className="text-sm font-extrabold mt-1">{value}</p>
    </Card>
  );
}
