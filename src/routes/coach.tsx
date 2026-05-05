import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Mic, Send } from "lucide-react";
import { user } from "@/lib/data";

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
    return `Today's safe-to-spend is RM42 ✨. After that you'll dip into your buffer. I'll nudge you if you cross it!`;
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
      <PageHeader title="GX Buddy" subtitle="Your pocket money coach" />

      <div className="px-5 flex flex-col items-center">
        <motion.div
          animate={listening ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Hamster mood={listening ? "happy" : "happy"} size={150} />
        </motion.div>
        <div className="flex gap-1.5 mt-2">
          {[0,1,2].map(i => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full bg-primary ${listening ? "animate-pulse" : "opacity-30"}`} style={{ animationDelay: `${i*150}ms` }} />
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="px-5 mt-4 space-y-2 max-h-[40vh] overflow-y-auto no-scrollbar">
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

      <div className="px-5 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {suggestions.map(s => (
          <button key={s} onClick={() => send(s)} className="shrink-0 px-3 py-2 rounded-full bg-secondary text-xs font-medium">
            {s}
          </button>
        ))}
      </div>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-5 z-40">
        <div className="glass rounded-full p-2 flex items-center gap-2 shadow-glow">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="Ask Buddy anything…"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            onMouseDown={() => setListening(true)}
            onMouseUp={() => setListening(false)}
            onTouchStart={() => setListening(true)}
            onTouchEnd={() => setListening(false)}
            className={`h-10 w-10 rounded-full grid place-items-center ${listening ? "bg-destructive text-destructive-foreground" : "bg-mint text-accent-foreground"}`}
            aria-label="hold to talk"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button onClick={() => send(input)} className="h-10 w-10 rounded-full bg-primary-gradient text-primary-foreground grid place-items-center" aria-label="send">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
