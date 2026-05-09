import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { ChevronRight, Calendar, Sparkles, Info, X, TrendingDown, Coins, ShieldCheck } from "lucide-react";
import { user } from "@/lib/data";
import { getHamsterMood } from "@/lib/utils";
import { WeeklyReportContent } from "@/components/WeeklyReportContent";

export const Route = createFileRoute("/coach")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as "coach" | "report") ?? "coach",
  }),
  head: () => ({
    meta: [
      { title: "AI Coach — GX Buddy" },
      { name: "description", content: "Talk to your purple hamster buddy. Ask anything about your money, savings or debt." },
    ],
  }),
  component: Coach,
});

const TABS = [
  { id: "coach" as const, label: "AI Coach", icon: Sparkles },
  { id: "report" as const, label: "Weekly Report", icon: Calendar },
];

// Only the 3 active Buddy Tools (no Emergency Buffer, no Squad Pocket)
const buddyTools = [
  {
    id: "debt-radar",
    title: "Debt Risk Radar",
    desc: "30-day deficit predictor",
    route: "/debt-radar",
    icon: <TrendingDown className="h-6 w-6 text-warning" />,
    iconBg: "bg-warning/20",
    scenario: "Mid-Month Cash Crunch",
    scenarioDesc: "Spending too fast? Buddy monitors your daily burn rate and predicts if you'll run out of cash before the month ends — showing exactly how much to cut back today.",
  },
  {
    id: "auto-save",
    title: "Smart Auto-Save",
    desc: "Automated round-up savings",
    route: "/auto-save",
    icon: <Coins className="h-6 w-6 text-[#4EE6E6]" />,
    iconBg: "bg-[#4EE6E6]/20",
    scenario: "Daily Coffee Habit",
    scenarioDesc: "Buying iced lattes every day? Buddy rounds up your RM12 coffee to RM15 and silently auto-saves the RM3 difference — painlessly building your savings without you noticing.",
  },
  {
    id: "salary-shield",
    title: "Buddy Shield Vault",
    desc: "Protect your money before spending starts",
    route: "/buddy-shield-vault",
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    iconBg: "bg-primary/20",
    scenario: "Payday Temptation",
    scenarioDesc: "Before you accidentally spend your rent money, Buddy auto-locks a percentage of your salary the second it lands — so your essentials are always covered first.",
  },
];

type BuddyTool = typeof buddyTools[0];

function InfoSheet({ tool, onClose }: { tool: BuddyTool; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md bg-card rounded-t-3xl z-10"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        <div className="px-6 pb-10 pt-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-full ${tool.iconBg} flex items-center justify-center`}>
                {tool.icon}
              </div>
              <div>
                <p className="font-extrabold text-base leading-tight">{tool.title}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">GX Buddy Tool</p>
              </div>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Buddy in Action</p>
          <p className="text-sm font-bold text-foreground mb-3">📍 Scenario: {tool.scenario}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{tool.scenarioDesc}</p>

          <Link
            to={tool.route as any}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary text-white font-extrabold text-sm shadow-[0_0_20px_rgba(119,31,255,0.4)]"
          >
            Try {tool.title} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Coach() {
  const { tab } = useSearch({ from: "/coach" });
  const [activeTab, setActiveTab] = useState<"coach" | "report">(tab ?? "coach");
  const [activeTool, setActiveTool] = useState<BuddyTool | null>(null);
  const hamsterMood = getHamsterMood(user.resilienceScore);

  return (
    <AppShell>
      <AnimatePresence>
        {activeTool && <InfoSheet tool={activeTool} onClose={() => setActiveTool(null)} />}
      </AnimatePresence>

      <div className="flex flex-col px-5 pt-8 pb-32">

        <PageHeader
          title="GX Buddy"
          subtitle={activeTab === "coach" ? "Your pocket money coach" : "Weekly recap from Buddy"}
        />

        {/* Segmented pill toggle */}
        <div className="flex p-1 mt-3 mb-5 rounded-2xl glass border border-white/10" role="tablist">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id} role="tab" type="button" aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors duration-150"
                style={{ background: isActive ? "var(--color-primary)" : "transparent", color: isActive ? "var(--color-primary-foreground)" : "rgba(255,255,255,0.45)" }}
              >
                <tab.icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* AI COACH TAB */}
        {activeTab === "coach" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center py-2 relative">
              <Link to="/buddy-profile" className="relative group active:scale-95 transition-transform">
                <div aria-hidden className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <Hamster mood={hamsterMood} size={120} />
                  <div className="absolute -bottom-1 -right-2 bg-primary-gradient px-3 py-1 rounded-full border-2 border-[#0C0121] shadow-lg">
                    <p className="text-[11px] font-black text-white">Score: {user.resilienceScore}</p>
                  </div>
                </div>
              </Link>
              <Link to="/buddy-profile" className="mt-4 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary flex items-center gap-2 hover:bg-primary/20 transition-colors active:scale-95">
                GX Buddy Profile <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Today's Advice bubbles */}
            <div className="mt-1 px-1">
              <p className="text-[11px] text-center text-white/50 uppercase tracking-widest font-bold mb-3">Today's Advice</p>
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="flex justify-start">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full">
                    <Card className="max-w-[92%] p-3 rounded-2xl rounded-tl-none bg-card border-white/5 shadow-card relative">
                      <Sparkles className="absolute -top-2 -left-2 h-5 w-5 text-primary bg-[#0C0121] rounded-full p-0.5" />
                      <p className="text-[12px] text-white/90 leading-relaxed">
                        Hey {user.firstName}! 🐹 You spent RM12 on coffee today — I've <span className="font-bold text-[#4EE6E6]">auto-saved RM3</span> from the round-up. Small steps add up! ☕
                      </p>
                    </Card>
                  </motion.div>
                </div>
                <div className="flex justify-start">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full">
                    <Card className="max-w-[92%] p-3 rounded-2xl rounded-tl-none bg-card border-white/5 shadow-card">
                      <p className="text-[12px] text-white/90 leading-relaxed mb-2">
                        <span className="font-bold text-mint">💡 Auto-Save Tip:</span> You spend RM40 on average for GrabFood. Turn on <span className="font-bold text-mint">Smart Auto-Save</span> to stash RM12 this week.
                      </p>
                      <Link to="/auto-save" className="inline-block text-[10px] text-black bg-mint px-3 py-1.5 rounded-lg font-bold active:scale-95 transition-transform">
                        Turn on Auto-Save
                      </Link>
                    </Card>
                  </motion.div>
                </div>
                <div className="flex justify-start">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full">
                    <Card className="max-w-[92%] p-3 rounded-2xl rounded-tl-none bg-card border-white/5 shadow-card">
                      <p className="text-[12px] text-white/90 leading-relaxed mb-2">
                        <span className="font-bold text-[#F8326D]">🚨 Squad Alert:</span> Your <span className="font-bold text-[#F8326D]">Squad Pocket</span> is falling behind. Skip your next Tealive to catch up!
                      </p>
                      <Link to="/group-challenges" className="inline-block text-[10px] text-white bg-[#F8326D]/80 px-3 py-1.5 rounded-lg font-bold active:scale-95 transition-transform">
                        Check Squad Pocket
                      </Link>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY REPORT TAB */}
        {activeTab === "report" && <WeeklyReportContent />}

        {/* BUDDY TOOLS — Compact horizontal list */}
        <div className="mt-8 pb-4 border-t border-white/10 pt-6">
          <div className="mb-4">
            <h2 className="text-base font-bold">Buddy Tools</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Explore your AI features</p>
          </div>
          <div className="space-y-3">
            {buddyTools.map((tool) => (
              <div key={tool.id} className="relative group">
                <Link to={tool.route as any} className="block">
                  <Card className="p-4 rounded-3xl glass-strong border-white/10 shadow-card group-active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-4">
                      {/* 3D Emoji Icon — Smaller */}
                      <div className="text-3xl shrink-0">
                        {tool.id === "debt-radar" ? "🔮" : 
                         tool.id === "auto-save" ? "💰" : "🔐"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-tight">{tool.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {tool.id === "debt-radar" ? "30-day risk prediction" :
                           tool.id === "auto-save" ? "Automated savings plan" :
                           "Protect your salary before spending"}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 mr-6" />
                    </div>
                  </Card>
                </Link>

                {/* Info button - positioned slightly in from the right edge */}
                <button
                  onClick={() => setActiveTool(tool)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 h-7 w-7 rounded-full flex items-center justify-center z-10 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  aria-label={`Buddy in action: ${tool.title}`}
                >
                  <Info className="h-3.5 w-3.5 text-white/60" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
