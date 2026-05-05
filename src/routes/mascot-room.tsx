import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Hamster, type Mood } from "@/components/Hamster";
import { motion } from "framer-motion";

export const Route = createFileRoute("/mascot-room")({
  head: () => ({ meta: [{ title: "Buddy's Room — GX Buddy" }, { name: "description", content: "Visit your purple hamster's cozy room. Outfits, mood, and savings goals." }] }),
  component: Room,
});

const outfits = [
  { id: "guardian", name: "Money Guardian", emoji: "🧙", unlocked: true },
  { id: "defender", name: "Debt Defender", emoji: "🛡️", unlocked: true },
  { id: "explorer", name: "Goal Explorer", emoji: "🧭", unlocked: false },
  { id: "ninja", name: "Saver Ninja", emoji: "🥷", unlocked: false },
];

function Room() {
  const [mood, setMood] = useState<Mood>("happy");
  return (
    <AppShell>
      <PageHeader title="Buddy's Room" subtitle="Your hamster's cozy HQ" />

      <section className="px-5">
        <Card className="p-6 rounded-3xl border-0 shadow-glow relative overflow-hidden bg-gradient-to-b from-[oklch(0.85_0.1_300)] to-[oklch(0.7_0.16_280)]">
          {/* room scene */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-[oklch(0.55_0.22_295)]" />
          <div aria-hidden className="absolute left-6 top-6 text-3xl">🪟</div>
          <div aria-hidden className="absolute right-6 top-6 text-3xl">🖼️</div>
          <div aria-hidden className="absolute right-4 bottom-24 text-4xl">🌱</div>
          <div aria-hidden className="absolute left-4 bottom-24 text-4xl">📚</div>

          <div className="relative grid place-items-center py-8">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
              <Hamster mood={mood} size={180} float={false} />
            </motion.div>
          </div>

          <div className="relative grid grid-cols-3 gap-2 text-center text-primary-foreground">
            <div className="rounded-2xl bg-white/20 p-2">
              <p className="text-[10px] uppercase opacity-80">Mood</p>
              <p className="text-sm font-bold capitalize">{mood}</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-2">
              <p className="text-[10px] uppercase opacity-80">Goal</p>
              <p className="text-sm font-bold">Buffer 48%</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-2">
              <p className="text-[10px] uppercase opacity-80">Streak</p>
              <p className="text-sm font-bold">🔥 12d</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="px-5 mt-5">
        <h3 className="font-bold text-sm mb-2">Try Buddy's mood</h3>
        <div className="flex gap-2">
          {(["happy","worried","sleepy"] as Mood[]).map(m => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`flex-1 py-2 rounded-2xl text-xs font-bold capitalize ${mood === m ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >{m}</button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h3 className="font-bold text-sm mb-2">Outfits & Unlocks</h3>
        <div className="grid grid-cols-2 gap-3">
          {outfits.map(o => (
            <Card key={o.id} className={`p-4 rounded-2xl border-0 shadow-card text-center ${o.unlocked ? "" : "opacity-50 grayscale"}`}>
              <div className="text-4xl">{o.emoji}</div>
              <p className="text-xs font-bold mt-2">{o.name}</p>
              <p className="text-[10px] text-muted-foreground">{o.unlocked ? "Tap to wear" : "Complete a mission"}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <Card className="p-4 rounded-2xl border-0 bg-mint shadow-card">
          <p className="text-sm font-bold">🐹 Buddy says</p>
          <p className="text-xs mt-1">"Top up the buffer to 60% and I unlock the Saver Ninja outfit. Wanna try?"</p>
        </Card>
      </section>
    </AppShell>
  );
}
