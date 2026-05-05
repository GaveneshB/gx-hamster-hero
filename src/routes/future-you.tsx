import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/Hamster";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { futureScenarios } from "@/lib/data";

export const Route = createFileRoute("/future-you")({
  head: () => ({ meta: [{ title: "Future You Simulator — GX Buddy" }, { name: "description", content: "Two timelines: keep current habits vs follow Buddy. See who you become." }] }),
  component: FutureYou,
});

function FutureYou() {
  return (
    <AppShell>
      <PageHeader title="Future You" subtitle="Two timelines. One choice." />

      <section className="px-5">
        <Card className="p-4 rounded-3xl border-0 shadow-card">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={futureScenarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 300)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }} />
              <Line type="monotone" dataKey="current" stroke="oklch(0.62 0.22 22)" strokeWidth={3} dot={{ r: 4 }} name="Current" />
              <Line type="monotone" dataKey="coached" stroke="oklch(0.55 0.22 295)" strokeWidth={3} dot={{ r: 4 }} name="With Buddy" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </section>

      <section className="px-5 mt-5 grid grid-cols-2 gap-3">
        <Card className="p-4 rounded-2xl border-0 bg-destructive/10 shadow-card">
          <Hamster mood="worried" size={80} float={false} />
          <p className="font-bold text-sm mt-2">Current path</p>
          <p className="text-xs text-muted-foreground">Negative balance by month 6. 3 BNPLs overdue.</p>
        </Card>
        <Card className="p-4 rounded-2xl border-0 bg-mint shadow-card">
          <Hamster mood="happy" size={80} float={false} />
          <p className="font-bold text-sm mt-2">With Buddy</p>
          <p className="text-xs text-muted-foreground">RM5,400 saved + emergency buffer full 🎉</p>
        </Card>
      </section>

      <section className="px-5 mt-6">
        <button className="w-full rounded-2xl bg-primary-gradient text-primary-foreground font-bold py-4 shadow-glow">
          Lock in Buddy's plan ✨
        </button>
      </section>
    </AppShell>
  );
}
