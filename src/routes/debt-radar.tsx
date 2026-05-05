import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/debt-radar")({
  head: () => ({ meta: [{ title: "Debt Risk Radar — GX Buddy" }, { name: "description", content: "AI-predicted risk of running short within 7, 14 and 30 days." }] }),
  component: DebtRadar,
});

const horizons = [
  { days: 7, risk: 22, level: "Low", tone: "bg-success text-success-foreground" },
  { days: 14, risk: 48, level: "Medium", tone: "bg-warning text-warning-foreground" },
  { days: 30, risk: 71, level: "High", tone: "bg-destructive text-destructive-foreground" },
];

const drivers = [
  { name: "BNPL load", pct: 28, bad: true },
  { name: "Dining-out spike", pct: 40, bad: true },
  { name: "Buffer below target", pct: 52, bad: true },
  { name: "Salary buffer days", pct: 65, bad: false },
];

function DebtRadar() {
  return (
    <AppShell>
      <PageHeader title="Debt Risk Radar" subtitle="Buddy's crystal ball 🔮" />

      <section className="px-5">
        <Card className="p-5 rounded-3xl border-0 bg-hero text-primary-foreground shadow-glow text-center">
          <Hamster mood="worried" size={110} className="mx-auto" />
          <p className="text-xs opacity-80 uppercase tracking-widest">30-day risk</p>
          <p className="text-5xl font-extrabold mt-1">71%</p>
          <p className="text-sm mt-2 opacity-90">"You may run RM200 short by day 26"</p>
        </Card>
      </section>

      <section className="px-5 mt-5 grid grid-cols-3 gap-2">
        {horizons.map(h => (
          <Card key={h.days} className="p-3 rounded-2xl border-0 shadow-card text-center">
            <p className="text-xs text-muted-foreground">{h.days} days</p>
            <p className="text-2xl font-extrabold mt-1">{h.risk}%</p>
            <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${h.tone}`}>{h.level}</span>
          </Card>
        ))}
      </section>

      <section className="px-5 mt-6">
        <h3 className="font-bold mb-3">Why your risk is high</h3>
        <Card className="p-4 rounded-2xl border-0 shadow-card space-y-3">
          {drivers.map(d => (
            <div key={d.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold">{d.name}</span>
                <span className={d.bad ? "text-destructive" : "text-success"}>{d.pct}%</span>
              </div>
              <Progress value={d.pct} className="h-2" />
            </div>
          ))}
        </Card>
      </section>

      <section className="px-5 mt-6 space-y-2">
        <Card className="p-4 rounded-2xl border-0 bg-mint shadow-card">
          <p className="text-sm font-bold">🐹 Buddy's plan to drop you to 🟢</p>
          <ul className="text-xs mt-2 space-y-1">
            <li>• Pause new BNPL for 14 days (-22%)</li>
            <li>• Cap dining at RM30/day (-15%)</li>
            <li>• Auto-save RM5/day to buffer (-10%)</li>
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
