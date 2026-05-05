import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { missions, badges } from "@/lib/data";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: "Missions — GX Buddy" },
      { name: "description", content: "Complete debt-escape missions, earn XP, unlock outfits for your hamster." },
    ],
  }),
  component: MissionsPage,
});

function MissionsPage() {
  return (
    <AppShell>
      <PageHeader title="Missions" subtitle="Complete to power up your buddy" back={false} />

      <section className="px-5">
        <Card className="p-5 rounded-3xl border-0 bg-primary-gradient text-primary-foreground shadow-glow flex items-center gap-4">
          <Hamster mood="happy" size={90} float={false} />
          <div>
            <p className="text-xs opacity-80">This Week's XP</p>
            <p className="text-3xl font-extrabold">+ 310</p>
            <p className="text-xs opacity-80 mt-1">2 missions complete · streak 🔥 12</p>
          </div>
        </Card>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">Your Missions</h2>
        <div className="space-y-3">
          {missions.map(m => (
            <Card key={m.id} className="p-4 rounded-2xl border-0 shadow-card">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{m.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{m.title}</p>
                  <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                </div>
                <span className="text-xs font-bold text-primary">+{m.xp}xp</span>
              </div>
              <Progress value={m.progress} className="h-2 mt-3" />
              <p className="text-[11px] text-muted-foreground mt-2">🎁 Reward: {m.reward}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map(b => (
            <Card key={b.id} className={`p-4 rounded-2xl border-0 shadow-card text-center ${b.earned ? "" : "opacity-40 grayscale"}`}>
              <div className="text-4xl">{b.emoji}</div>
              <p className="text-[11px] font-semibold mt-2">{b.name}</p>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
