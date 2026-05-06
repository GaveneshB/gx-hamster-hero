import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Mic, Send, ChevronRight } from "lucide-react";
import { user, buddyFeatures } from "@/lib/data";
import { calculateSpendingRisk, getHamsterMood } from "@/lib/utils";
import { WeeklyReportContent } from "@/components/WeeklyReportContent";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const riskScore = calculateSpendingRisk(user);
  const hamsterMood = getHamsterMood(user.resilienceScore);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, activeIndex]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs(m => [...m, { role: "me", text }]);
    setInput("");
    setTimeout(() => setMsgs(m => [...m, { role: "buddy", text: reply(text) }]), 600);
  };

  const dragX = useMotionValue(0);

  const onDragEnd = (_: any, info: any) => {
    if (info.offset.x < -100 && activeIndex === 0) {
      setActiveIndex(1);
    } else if (info.offset.x > 100 && activeIndex === 1) {
      setActiveIndex(0);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-5 pt-8 pb-1 shrink-0">
          <PageHeader title="GX Buddy" subtitle={activeIndex === 0 ? "Your pocket money coach" : "Weekly recap from Buddy"} back={false} />
        </div>

        {/* Carousel Area - Fixed height with internal scrolling */}
        <div className="h-[480px] relative overflow-hidden shrink-0 group">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x: dragX }}
            onDragEnd={onDragEnd}
            animate={{ x: activeIndex === 0 ? "0%" : "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex w-full h-full cursor-grab active:cursor-grabbing"
          >
            {/* SLIDE 1: COACH */}
            <div className="w-full shrink-0 flex flex-col px-5 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Hamster Mascot */}
                <div className="flex flex-col items-center py-2 shrink-0">
                  <motion.div
                    animate={listening ? { scale: [1, 1.06, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Hamster mood={listening ? "happy" : hamsterMood} size={130} />
                  </motion.div>
                  <div className="flex gap-1.5 mt-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className={`h-1.5 w-1.5 rounded-full bg-primary ${listening ? "animate-pulse" : "opacity-30"}`} style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>

                {/* Chat Messages */}
                <div ref={scrollRef} className="space-y-2 flex-1 overflow-y-auto no-scrollbar py-1">
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
                <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => send(s)} className="shrink-0 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="mt-2 mb-6 shrink-0">
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
            </div>

            {/* SLIDE 2: WEEKLY REPORT */}
            <div className="w-full shrink-0 px-5 overflow-y-auto no-scrollbar pb-10 pt-2">
              <WeeklyReportContent />
            </div>
          </motion.div>

          {/* Pagination Dots - Stylized */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-30 pointer-events-none">
            {[0, 1].map(i => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === i 
                    ? "bg-primary w-5 shadow-[0_0_8px_rgba(124,58,237,0.5)]" 
                    : "bg-primary/20 w-1.5"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Buddy Tools Section - Part of regular page scroll */}
        <section className="px-5 py-6 pb-32">
          <div className="mb-4 pb-2 border-b border-white/10">
            <h2 className="text-base font-bold flex items-center gap-2">
              Buddy Tools <ChevronRight className="h-5 w-5 text-primary" />
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Explore features</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {buddyFeatures.map(feature => (
              <Link key={feature.id} to={feature.route as any} className="group text-left">
                <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card h-full flex flex-col gap-3 transition-all hover:shadow-glow group-active:scale-95">
                  <div className={`${feature.icon.length > 2 ? "text-[11px] font-bold text-primary bg-primary/10 w-fit px-2.5 py-1 rounded-full border border-primary/20" : "text-3xl"}`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-tight">{feature.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{feature.desc}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
