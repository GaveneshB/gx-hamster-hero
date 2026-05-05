import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/auto-save")({
  head: () => ({ meta: [{ title: "Smart Auto-Save — GX Buddy" }, { name: "description", content: "Quietly stash RM3/day, round-ups, and bonus income." }] }),
  component: AutoSave,
});

function AutoSave() {
  const [daily, setDaily] = useState(true);
  const [round, setRound] = useState(true);
  const [bonus, setBonus] = useState(false);
  return (
    <AppShell>
      <PageHeader title="Smart Auto-Save" subtitle="Tiny moves. Big wins." />
      <section className="px-5">
        <Card className="p-5 rounded-3xl border-0 bg-mint-gradient shadow-card text-center">
          <Hamster mood="happy" size={120} className="mx-auto" />
          <p className="text-xs uppercase tracking-widest opacity-80">Saved this month</p>
          <p className="text-4xl font-extrabold mt-1">RM 87.30</p>
          <p className="text-xs mt-1 opacity-80">29 silent stashes 🐹</p>
        </Card>
      </section>

      <section className="px-5 mt-6 space-y-3">
        <Toggle title="Daily RM3" desc="Skim RM3 every morning" on={daily} setOn={setDaily} />
        <Toggle title="Round-ups" desc="Round every spend up to nearest RM" on={round} setOn={setRound} />
        <Toggle title="Bonus catcher" desc="Save 20% of any income above salary" on={bonus} setOn={setBonus} />
      </section>

      <section className="px-5 mt-6">
        <Card className="p-4 rounded-2xl border-0 shadow-card">
          <p className="text-sm font-bold">⚠️ Auto-pause rule</p>
          <p className="text-xs text-muted-foreground mt-1">Buddy stops saving if balance falls below RM500 — your money stays safe.</p>
        </Card>
      </section>
    </AppShell>
  );
}

function Toggle({ title, desc, on, setOn }: { title: string; desc: string; on: boolean; setOn: (v: boolean) => void }) {
  return (
    <Card className="p-4 rounded-2xl border-0 shadow-card flex items-center justify-between">
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </Card>
  );
}
