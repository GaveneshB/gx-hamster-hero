import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/group-challenges")({
  head: () => ({ meta: [{ title: "Group Challenges — GX Buddy" }, { name: "description", content: "Save with friends. Compare progress, never balances." }] }),
  component: Group,
});

const friends = [
  { name: "Aisha", emoji: "🦊", streak: 18, pct: 92, badges: 6 },
  { name: "You", emoji: "🐹", streak: 12, pct: 78, badges: 3, you: true },
  { name: "Daniel", emoji: "🐼", streak: 9, pct: 64, badges: 4 },
  { name: "Mei", emoji: "🐰", streak: 7, pct: 58, badges: 2 },
];

function Group() {
  return (
    <AppShell>
      <PageHeader title="Group Challenges" subtitle="Sweat the savings together 💪" />

      <section className="px-5">
        <Card className="p-5 rounded-3xl border-0 bg-primary-gradient text-primary-foreground shadow-glow">
          <p className="text-xs uppercase opacity-80 tracking-widest">Active challenge</p>
          <p className="text-2xl font-extrabold">No-Spend Weekend</p>
          <p className="text-xs opacity-90">Ends in 2 days · 4 friends</p>
          <Progress value={68} className="h-2 mt-3 bg-white/20" />
        </Card>
      </section>

      <section className="px-5 mt-5">
        <h3 className="font-bold text-sm mb-2">Leaderboard</h3>
        <div className="space-y-2">
          {friends.sort((a,b) => b.pct - a.pct).map((f, i) => (
            <Card key={f.name} className={`p-3 rounded-2xl border-0 shadow-card flex items-center gap-3 ${f.you ? "ring-2 ring-primary" : ""}`}>
              <span className="text-xs font-bold text-muted-foreground w-5">#{i+1}</span>
              <div className="text-2xl">{f.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-bold">{f.name}</p>
                <p className="text-[11px] text-muted-foreground">🔥{f.streak}d · 🏅{f.badges}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-primary">{f.pct}%</p>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-3">Buddy hides balances — only progress is shown 🛡️</p>
      </section>
    </AppShell>
  );
}
