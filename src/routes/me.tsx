import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { user, badges } from "@/lib/data";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "Me — GX Buddy" },
      { name: "description", content: "Your profile, resilience score and hamster room." },
    ],
  }),
  component: Me,
});

function Me() {
  return (
    <AppShell>
      <PageHeader title="Profile" back={false} />

      <section className="px-5">
        <Card className="p-5 rounded-3xl border-0 bg-hero text-primary-foreground shadow-glow text-center relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,white,transparent_60%)]" />
          <div className="relative">
            <Hamster mood="happy" size={130} className="mx-auto" />
            <h2 className="text-xl font-extrabold mt-2">{user.name}</h2>
            <p className="text-xs opacity-80">{user.tier} · Level {user.level} · Member since {user.memberSince}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-mint text-accent-foreground text-xs font-bold">RizQ Score {user.resilienceScore}</span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">🔥 {user.streak} day streak</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="px-5 mt-6 grid grid-cols-3 gap-3">
        <Stat label="Saved" value={`RM ${user.totalSavings}`} />
        <Stat label="Buffer" value={`RM ${user.emergencyBuffer.current}`} />
        <Stat label="Missions" value={`${user.activeMissions}`} />
      </section>

      <section className="px-5 mt-6">
        <h3 className="text-base font-bold mb-3">Resilience Progress</h3>
        <Card className="p-4 rounded-2xl border-0 shadow-card">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Budget Builder</span><span>Money Master</span>
          </div>
          <Progress value={user.resilienceScore} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">28 more points to level up 🐹</p>
        </Card>
      </section>

      <section className="px-5 mt-6">
        <h3 className="text-base font-bold mb-3">Trophy Wall</h3>
        <div className="grid grid-cols-4 gap-3">
          {badges.map(b => (
            <div key={b.id} className={`aspect-square rounded-2xl glass grid place-items-center text-3xl ${b.earned ? "" : "opacity-30 grayscale"}`}>
              {b.emoji}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6 space-y-2">
        {[
          { to: "/mascot-room", label: "🏠 Buddy's Room" },
          { to: "/personality", label: "💜 Financial Personality Scan" },
          { to: "/weekly-report", label: "📊 Weekly Report" },
          { to: "/group-challenges", label: "👥 Group Challenges" },
        ].map(i => (
          <Link key={i.to} to={i.to}>
            <Card className="p-4 rounded-2xl border-0 shadow-card flex items-center justify-between">
              <span className="font-semibold text-sm">{i.label}</span>
              <span className="text-primary">›</span>
            </Card>
          </Link>
        ))}

        <Card className="p-4 rounded-2xl border-0 shadow-card flex items-center justify-between">
          <span className="font-semibold text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</span>
          <span className="text-muted-foreground">›</span>
        </Card>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 rounded-2xl border-0 shadow-card text-center">
      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</p>
      <p className="text-base font-extrabold mt-1">{value}</p>
    </Card>
  );
}
