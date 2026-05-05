import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/spending-warnings")({
  head: () => ({ meta: [{ title: "Pre-Spending Warnings — GX Buddy" }, { name: "description", content: "Get nudged before risky purchases hurt your goals." }] }),
  component: Warnings,
});

const items = [
  { name: "Shopee Hoodie RM89", impact: "Pushes goal back 6 days", level: "high" },
  { name: "GrabFood RM24.50", impact: "5th order this week — over budget", level: "med" },
  { name: "Spotify Family RM23", impact: "You already have Premium Solo", level: "med" },
];

function Warnings() {
  return (
    <AppShell>
      <PageHeader title="Spending Warnings" subtitle="Buddy taps your shoulder ✋" />
      <section className="px-5">
        <Card className="p-5 rounded-3xl border-0 bg-destructive/10 shadow-card flex items-center gap-3">
          <Hamster mood="worried" size={100} float={false} />
          <div>
            <p className="font-bold">3 risky moves spotted today</p>
            <p className="text-xs text-muted-foreground">Tap any to see Buddy's take</p>
          </div>
        </Card>
      </section>

      <section className="px-5 mt-5 space-y-3">
        {items.map(i => (
          <Card key={i.name} className="p-4 rounded-2xl border-0 shadow-card">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm">{i.name}</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${i.level === "high" ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}`}>{i.level.toUpperCase()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{i.impact}</p>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-xl bg-primary-gradient text-primary-foreground text-xs font-bold py-2">Skip it</button>
              <button className="flex-1 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold py-2">Allow once</button>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
