import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Hamster } from "@/components/Hamster";

export const Route = createFileRoute("/bnpl")({
  head: () => ({ meta: [{ title: "BNPL Detector — GX Buddy" }, { name: "description", content: "All your buy-now-pay-later in one place. Don't get caught." }] }),
  component: BNPL,
});

const items = [
  { provider: "Shopee SPayLater", item: "Hoodie + Sneakers", total: 220, paid: 110, due: "15 Jun" },
  { provider: "Atome", item: "iPad case bundle", total: 120, paid: 40, due: "22 Jun" },
];

function BNPL() {
  const totalDue = items.reduce((a, b) => a + (b.total - b.paid), 0);
  return (
    <AppShell>
      <PageHeader title="BNPL Detector" subtitle="The hidden debt iceberg 🧊" />

      <section className="px-5">
        <Card className="p-5 rounded-3xl border-0 bg-hero text-primary-foreground shadow-glow text-center">
          <Hamster mood="worried" size={100} className="mx-auto" />
          <p className="text-xs uppercase opacity-80 tracking-widest">Outstanding BNPL</p>
          <p className="text-4xl font-extrabold mt-1">RM {totalDue}</p>
          <p className="text-xs mt-1 opacity-80">{items.length} active commitments</p>
        </Card>
      </section>

      <section className="px-5 mt-5 space-y-3">
        {items.map((i, idx) => (
          <Card key={idx} className="p-4 rounded-2xl border-0 shadow-card">
            <div className="flex justify-between">
              <div>
                <p className="font-bold text-sm">{i.provider}</p>
                <p className="text-xs text-muted-foreground">{i.item}</p>
              </div>
              <span className="text-xs font-semibold text-destructive">Due {i.due}</span>
            </div>
            <Progress value={(i.paid / i.total) * 100} className="h-2 mt-3" />
            <p className="text-[11px] mt-2 text-muted-foreground">RM{i.paid} of RM{i.total} paid</p>
          </Card>
        ))}
      </section>

      <section className="px-5 mt-6">
        <Card className="p-4 rounded-2xl border-0 bg-mint shadow-card">
          <p className="text-sm font-bold">🐹 Buddy says</p>
          <p className="text-xs mt-1">"Pause new BNPL for 14 days and I'll move RM50/wk to clear Shopee first. You'll be debt-free by July ✨"</p>
        </Card>
      </section>
    </AppShell>
  );
}
