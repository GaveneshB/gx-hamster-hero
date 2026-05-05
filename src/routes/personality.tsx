import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/Hamster";

export const Route = createFileRoute("/personality")({
  head: () => ({ meta: [{ title: "Financial Personality — GX Buddy" }, { name: "description", content: "Discover your money archetype with a quick 5-question scan." }] }),
  component: Personality,
});

const qs = [
  { q: "Payday hits. First move?", a: ["Treat yourself", "Pay bills", "Auto-save", "Pay BNPL"] },
  { q: "Friend wants bubble tea daily?", a: ["Always join", "Sometimes", "Brew at home", "Skip"] },
  { q: "Sales notification ping!", a: ["Buy fast", "Add to cart", "Wait 24h", "Ignore"] },
];

const archetypes = [
  { name: "🐹 The Cozy Saver", desc: "Steady, intentional. You feel safest with a buffer." },
  { name: "🦋 The Free Spirit", desc: "Spontaneous spender. Buddy will help you breathe between buys." },
  { name: "🦅 The Strategist", desc: "Planner energy. You'll love the Future You simulator." },
];

function Personality() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const result = archetypes[0];
  return (
    <AppShell>
      <PageHeader title="Personality Scan" subtitle="2-minute money mirror" />
      <section className="px-5">
        {!done ? (
          <Card className="p-5 rounded-3xl border-0 shadow-card">
            <p className="text-xs text-muted-foreground">Question {step+1} of {qs.length}</p>
            <p className="text-lg font-extrabold mt-2">{qs[step].q}</p>
            <div className="mt-4 space-y-2">
              {qs[step].a.map(a => (
                <button
                  key={a}
                  onClick={() => step+1 < qs.length ? setStep(step+1) : setDone(true)}
                  className="w-full text-left px-4 py-3 rounded-2xl bg-secondary hover:bg-primary hover:text-primary-foreground text-sm font-semibold transition"
                >
                  {a}
                </button>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 rounded-3xl border-0 bg-hero text-primary-foreground shadow-glow text-center">
            <Hamster mood="happy" size={130} className="mx-auto" />
            <p className="text-xs uppercase opacity-80 mt-2">You are</p>
            <p className="text-2xl font-extrabold mt-1">{result.name}</p>
            <p className="text-sm mt-2 opacity-90">{result.desc}</p>
            <button onClick={() => { setDone(false); setStep(0); }} className="mt-5 px-4 py-2 rounded-full bg-white/20 text-xs font-bold">Retake</button>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
