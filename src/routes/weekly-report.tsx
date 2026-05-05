import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/Hamster";
import { spendingByCategory, weeklyTrend } from "@/lib/data";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/weekly-report")({
  head: () => ({ meta: [{ title: "Weekly Report — GX Buddy" }, { name: "description", content: "Sunday-night recap of where your money flowed." }] }),
  component: Weekly,
});

function Weekly() {
  return (
    <AppShell>
      <PageHeader title="Weekly Report" subtitle="Sunday recap from Buddy" />

      <section className="px-5">
        <Card className="p-5 rounded-3xl border-0 bg-primary-gradient text-primary-foreground shadow-glow flex items-center gap-3">
          <Hamster mood="happy" size={90} float={false} />
          <div>
            <p className="font-extrabold">Solid week, {`Ahmad`}!</p>
            <p className="text-xs opacity-90">Spend ↓ 12% · Saved RM 68 · Streak 🔥 12</p>
          </div>
        </Card>
      </section>

      <section className="px-5 mt-5">
        <h3 className="font-bold text-sm mb-2">Daily flow</h3>
        <Card className="p-3 rounded-2xl border-0 shadow-card">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Bar dataKey="spend" fill="oklch(0.55 0.22 295)" radius={[8,8,0,0]} />
              <Bar dataKey="save" fill="oklch(0.7 0.17 155)" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      <section className="px-5 mt-5">
        <h3 className="font-bold text-sm mb-2">Where it went</h3>
        <Card className="p-3 rounded-2xl border-0 shadow-card flex items-center">
          <ResponsiveContainer width="55%" height={170}>
            <PieChart>
              <Pie data={spendingByCategory} dataKey="value" innerRadius={36} outerRadius={70} paddingAngle={3}>
                {spendingByCategory.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex-1 space-y-1 text-xs">
            {spendingByCategory.map(c => (
              <li key={c.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                <span className="flex-1">{c.name}</span>
                <span className="font-bold">RM{c.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="px-5 mt-5">
        <Card className="p-4 rounded-2xl border-0 bg-mint shadow-card">
          <p className="font-bold text-sm">🐹 Buddy's takeaway</p>
          <p className="text-xs mt-1">Friday and Saturday were 50% of your spend. Try a "no-spend Saturday" next week — I'll cheer you on.</p>
        </Card>
      </section>
    </AppShell>
  );
}
