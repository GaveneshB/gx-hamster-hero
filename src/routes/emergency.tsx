import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Hamster } from "@/components/Hamster";
import { user } from "@/lib/data";

export const Route = createFileRoute("/emergency")({
  head: () => ({ meta: [{ title: "Emergency Buffer — GX Buddy" }, { name: "description", content: "Build a RM300 safety net so life surprises don't break you." }] }),
  component: Emergency,
});

function Emergency() {
  const { current, target } = user.emergencyBuffer;
  const pct = (current / target) * 100;
  return (
    <AppShell>
      <PageHeader title="Emergency Buffer" subtitle="Your safety hammock" />
      <section className="px-5">
        <Card className="p-6 rounded-3xl border-0 bg-mint-gradient shadow-card text-center">
          <Hamster mood="happy" size={120} className="mx-auto" />
          <p className="text-xs uppercase tracking-widest opacity-80 mt-2">Buffer</p>
          <p className="text-4xl font-extrabold">RM {current.toFixed(2)} / {target}</p>
          <Progress value={pct} className="h-3 mt-4" />
          <p className="text-xs mt-2 opacity-80">{Math.round(pct)}% of target · Growing with your spending</p>
        </Card>
      </section>

      <section className="px-5 mt-6 space-y-3">
        <Card className="p-4 rounded-2xl border-0 shadow-card">
          <p className="font-bold text-sm">Smart round-ups</p>
          <p className="text-xs text-muted-foreground mt-1">Buddy auto-saves your spare cents from every purchase into this buffer.</p>
        </Card>
        <Card className="p-4 rounded-2xl border-0 shadow-card">
          <p className="font-bold text-sm">Boost goal</p>
          <p className="text-xs text-muted-foreground mt-1">Bump to RM500 after first milestone — Buddy will recommend timing.</p>
        </Card>
      </section>
    </AppShell>
  );
}
