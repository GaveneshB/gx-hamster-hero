import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Mic, Send, ChevronRight } from "lucide-react";
import { user, buddyFeatures } from "@/lib/data";
import { calculateSpendingRisk, getHamsterMood } from "@/lib/utils";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Coach — GX Buddy" },
      { name: "description", content: "Talk to your purple hamster buddy. Ask anything about your money, savings or debt." },
    ],
  }),
  component: Coach,
});

type Msg = { role: "buddy" | "me"; text: string };

const suggestions = [
  "Can I afford a RM89 hoodie?",
  "How much can I spend today?",
  "Should I use BNPL?",
  "Why is my risk high?",
  "Save RM500 in 90 days?",
];

const reply = (q: string): string => {
  const lower = q.toLowerCase();
  if (lower.includes("afford"))
    return `Hmm 🐹 you have RM${user.balance} but RM380 of bills hit before payday. You can afford it if you skip GrabFood twice this week. Want me to ring-fence the cash?`;
  if (lower.includes("spend today"))
    return `Today's safe-to-spend is RM${user.safeToSpend} ✨. After that you'll dip into your buffer. I'll nudge you if you cross it!`;
  if (lower.includes("bnpl"))
    return `You already have 2 BNPLs (RM340 due). Adding a third pushes your Debt Risk to 🔴 HIGH. I'd say: not yet, mate.`;
  if (lower.includes("risk"))
    return `Your Debt Radar shows risk because: BNPL load 28%, dining-out spike +40%, and buffer at 48%. Fix any one and risk drops 🟢`;
  if (lower.includes("500"))
    return `Easy peasy 🐹 RM500 in 90 days = RM5.55/day. I'll auto-save RM3 daily + round-ups. You'll hit it by April. Lock it in?`;
  return `Got it! Let me crunch your numbers… ✨ Based on your patterns, here's what I'd do: cut subscriptions you don't use (-RM30/mo) and turn on round-up saving. Tiny moves, big wins.`;
};

function Coach() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "buddy", text: `Hey ${user.firstName}! 🐹💜 I'm Buddy — your money sidekick. What's on your mind?` },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const riskScore = calculateSpendingRisk(user);
  const hamsterMood = getHamsterMood(riskScore);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs(m => [...m, { role: "me", text }]);
    setInput("");
    setTimeout(() => setMsgs(m => [...m, { role: "buddy", text: reply(text) }]), 600);
  };

  return (
    <AppShell>
      {/* Fixed Buddy Bar - Top Section */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-background via-background to-background/50 border-b border-white/10 -mx-5 px-5 pb-3">
        <PageHeader title="GX Buddy" subtitle="Your pocket money coach" back={false} />

        {/* Hamster Mascot */}
        <div className="flex flex-col items-center py-3">
          <motion.div
            animate={listening ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Hamster mood={listening ? "happy" : hamsterMood} size={140} />
          </motion.div>
          <div className="flex gap-1.5 mt-2">
            {[0,1,2].map(i => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full bg-primary ${listening ? "animate-pulse" : "opacity-30"}`} style={{ animationDelay: `${i*150}ms` }} />
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="space-y-2 max-h-[22vh] overflow-y-auto no-scrollbar">
          <AnimatePresence>
            {msgs.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "me" ? "justify-end" : "justify-start"}`}
              >
                <Card className={`max-w-[80%] p-3 rounded-2xl border-0 shadow-card text-sm ${
                  m.role === "me" ? "bg-primary-gradient text-primary-foreground rounded-br-sm" : "bg-card rounded-bl-sm"
                }`}>
                  {m.text}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} className="shrink-0 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors">
              {s}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="mt-3">
          <div className="glass rounded-full p-2 flex items-center gap-2 shadow-glow">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="Ask Buddy…"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onMouseDown={() => setListening(true)}
              onMouseUp={() => setListening(false)}
              onTouchStart={() => setListening(true)}
              onTouchEnd={() => setListening(false)}
              className={`h-9 w-9 rounded-full grid place-items-center transition-colors ${listening ? "bg-destructive text-destructive-foreground" : "bg-mint text-accent-foreground hover:opacity-80"}`}
              aria-label="hold to talk"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button onClick={() => send(input)} className="h-9 w-9 rounded-full bg-primary-gradient text-primary-foreground grid place-items-center hover:shadow-glow transition-all" aria-label="send">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Buddy Tools Section */}
      <section className="px-5 py-6 pb-40">
        {/* Buddy Tools Header */}
        <div className="mb-5 pb-3 border-b border-white/10">
          <h2 className="text-base font-bold flex items-center gap-2">
            Buddy Tools <ChevronRight className="h-5 w-5 text-primary" />
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Explore features</p>
        </div>

        {/* Buddy Features Grid */}
        <div className="grid grid-cols-2 gap-3">
          {buddyFeatures.map(feature => (
            <button key={feature.id} className="group text-left">
              <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card h-full flex flex-col gap-3 transition-all hover:shadow-glow group-active:scale-95">
                <div className="text-3xl">{feature.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold leading-tight">{feature.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
