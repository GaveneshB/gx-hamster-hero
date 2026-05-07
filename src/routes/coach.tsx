import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Mic, Send, ChevronRight, Sparkles } from "lucide-react";
import { user, buddyFeatures } from "@/lib/data";
import { getHamsterMood } from "@/lib/utils";
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

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-6 pt-10 pb-2 shrink-0">
          <PageHeader title="GX Buddy" subtitle={activeIndex === 0 ? "AI Money Coach" : "Weekly Recap"} back={false} />
        </div>

        {/* Carousel Area - Pro UI Unified */}
        <div className="h-[620px] relative shrink-0 overflow-hidden group">
          <motion.div
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.05}
            onDragEnd={(_: any, info: any) => {
              const threshold = 50;
              const velocity = info.velocity.x;
              if (info.offset.x < -threshold || velocity < -400) {
                if (activeIndex === 0) setActiveIndex(1);
              } else if (info.offset.x > threshold || velocity > 400) {
                if (activeIndex === 1) setActiveIndex(0);
              }
            }}
            animate={{ x: activeIndex === 0 ? "0%" : "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.5 }}
            className="flex w-full h-full will-change-transform"
          >
            {/* SLIDE 1: COACH */}
            <div className="w-full h-full shrink-0 flex flex-col px-6 py-2">
              <div className="flex-1 flex flex-col min-h-0 glass-premium rounded-[3rem] p-6 shadow-premium ring-1 ring-white/10 relative overflow-hidden">
                <div aria-hidden className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
                
                {/* Hamster Area */}
                <div className="flex flex-col items-center py-6 shrink-0 relative z-10">
                  <div className="relative">
                    <motion.div
                      animate={listening ? { 
                        scale: [1, 1.1, 1],
                        y: [0, -5, 0]
                      } : {
                        y: [0, -8, 0]
                      }}
                      transition={{ duration: listening ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Hamster mood={listening ? "happy" : hamsterMood} size={150} />
                    </motion.div>
                    <AnimatePresence>
                      {listening && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1.2 }}
                          exit={{ opacity: 0, scale: 1.5 }}
                          className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full -z-10 animate-pulse"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Chat Messages */}
                <div ref={scrollRef} className="space-y-6 flex-1 overflow-y-auto no-scrollbar py-4 scrolling-touch overscroll-contain relative z-10">
                  <AnimatePresence mode="popLayout">
                    {msgs.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${m.role === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[88%] px-5 py-4 rounded-[2.2rem] shadow-premium text-[15px] font-bold leading-relaxed tracking-tight relative ${
                          m.role === "me" 
                            ? "bg-primary-gradient text-white rounded-br-none" 
                            : "glass-card text-white/90 rounded-bl-none border-white/5"
                        }`}>
                          {m.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Suggestions */}
                <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-2 shrink-0 relative z-10">
                  {suggestions.map(s => (
                    <button 
                      key={s} 
                      onClick={() => send(s)} 
                      className="shrink-0 px-5 py-3 rounded-full glass-premium text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 shadow-glow active-scale"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Message Bar — Apple Intelligence Style */}
                <div className="mt-6 shrink-0 relative z-10">
                  <div className="glass-premium rounded-[2.5rem] p-2 flex items-center gap-2 shadow-premium ring-1 ring-white/20 bg-white/5 backdrop-blur-3xl group-focus-within:ring-primary/40 transition-all">
                    <div className="flex-1 px-4">
                      <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send(input)}
                        placeholder="Ask Buddy anything..."
                        className="w-full bg-transparent py-4 text-[15px] font-bold outline-none placeholder:text-white/20 text-white tracking-tight"
                      />
                    </div>
                    <div className="flex gap-2 pr-1">
                      <button
                        onMouseDown={() => setListening(true)}
                        onMouseUp={() => setListening(false)}
                        onTouchStart={() => setListening(true)}
                        onTouchEnd={() => setListening(false)}
                        className={`h-12 w-12 rounded-[1.5rem] grid place-items-center transition-all active-scale ${listening ? "bg-destructive text-white shadow-glow" : "bg-white/5 text-accent"}`}
                      >
                        <Mic className="h-6 w-6" />
                      </button>
                      <button onClick={() => send(input)} className="h-12 w-12 rounded-[1.5rem] bg-primary-gradient text-white grid place-items-center shadow-glow active-scale">
                        <Send className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SLIDE 2: WEEKLY REPORT */}
            <div className="w-full h-full shrink-0 px-6 py-2 flex flex-col">
              <div className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-2 scrolling-touch overscroll-contain glass-premium rounded-[3rem] p-6 shadow-premium border-white/5 ring-1 ring-white/10 relative">
                <WeeklyReportContent />
              </div>
            </div>
          </motion.div>

          {/* Pagination — Liquid Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-50">
            {[0, 1].map(i => (
              <button key={i} onClick={() => setActiveIndex(i)} className="relative h-6 w-12 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    width: activeIndex === i ? 40 : 10,
                    backgroundColor: activeIndex === i ? "var(--primary)" : "rgba(255,255,255,0.1)",
                  }}
                  className="h-2 rounded-full shadow-glow"
                />
                {activeIndex === i && <motion.div layoutId="coach-dot-glow" className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Area */}
        <section className="px-6 py-12 pb-32">
          <div className="flex items-center justify-between px-6 mb-8">
              <h2 className="text-[13px] font-black tracking-[0.2em] uppercase text-white/50">Buddy Ecosystem</h2>
              <div className="h-[2px] flex-1 bg-white/5 mx-4" />
              <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {buddyFeatures.map(feature => (
              <Link key={feature.id} to={feature.route as any} className="active-scale">
                <Card className="p-6 rounded-[2.5rem] glass-premium border-white/5 shadow-premium h-full flex flex-col gap-5 hover:border-primary/20 transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 grid place-items-center text-3xl shadow-inner ring-1 ring-white/5">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="text-[16px] font-black leading-tight tracking-tight text-white">{feature.title}</p>
                    <p className="text-[11px] font-bold text-white/30 mt-1.5 uppercase tracking-tighter leading-snug">{feature.desc}</p>
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
