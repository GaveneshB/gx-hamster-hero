import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — GX Buddy" },
      { name: "description", content: "Discover Buddy tools: debt radar, future you, BNPL detector, missions and more." },
    ],
  }),
  component: Discover,
});

const sections = [
  { title: "🛡️ Debt Risk Radar", desc: "Predict if you'll run short in 7/14/30 days", to: "/debt-radar", tone: "bg-warning/30" },
  { title: "🐷 Smart Auto-Save", desc: "Quietly stash RM3/day & round-ups", to: "/auto-save", tone: "bg-mint" },
  { title: "🚨 Pre-Spending Warnings", desc: "Get nudged before risky buys", to: "/spending-warnings", tone: "bg-destructive/20" },
  { title: "🔮 Future You Simulator", desc: "See your money in 6 months", to: "/future-you", tone: "bg-primary/20" },
  { title: "👀 BNPL & Debt Detector", desc: "Track every Atome / Shopee Later", to: "/bnpl", tone: "bg-accent/40" },
  { title: "🚑 Emergency Buffer", desc: "Build a RM300 safety net", to: "/emergency", tone: "bg-secondary" },
  { title: "📈 Weekly AI Report", desc: "Sunday night recap from Buddy", to: "/weekly-report", tone: "bg-primary/15" },
  { title: "💜 Personality Scan", desc: "Discover your money archetype", to: "/personality", tone: "bg-mint" },
  { title: "👥 Group Challenges", desc: "Save with friends, no balance shown", to: "/group-challenges", tone: "bg-warning/25" },
  { title: "🏠 Mascot Room", desc: "Visit your hamster's home", to: "/mascot-room", tone: "bg-primary-gradient text-primary-foreground" },
];

function Discover() {
  return (
    <AppShell>
      <PageHeader title="Discover" subtitle="Every Buddy tool in one place" back={false} />
      <div className="px-5 grid grid-cols-2 gap-3">
        {sections.map(s => (
          <Link key={s.to} to={s.to}>
            <Card className={`p-4 rounded-2xl border-0 shadow-card h-full ${s.tone}`}>
              <p className="font-bold text-sm leading-tight">{s.title}</p>
              <p className="text-[11px] mt-1 opacity-80">{s.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
