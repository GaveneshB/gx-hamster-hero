import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { ChevronRight, Calendar, Mic, Sparkles } from "lucide-react";
import { user, buddyFeatures } from "@/lib/data";
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
  { id: "coach" as const, label: "AI Coach", icon: Mic },
  { id: "report" as const, label: "Weekly Report", icon: Calendar },
];

function Coach() {
  const { tab } = useSearch({ from: "/coach" });
  const [activeTab, setActiveTab] = useState<"coach" | "report">(tab ?? "coach");
  const hamsterMood = getHamsterMood(user.resilienceScore);

  return (
    <AppShell>
      {/* Single flat column — AppShell is the ONLY scroller, nothing inside has overflow-y-auto */}
      <div className="flex flex-col px-5 pt-8 pb-32">

        {/* Header + toggle */}
        <PageHeader
          title="GX Buddy"
          subtitle={activeTab === "coach" ? "Your pocket money coach" : "Weekly recap from Buddy"}
          back={false}
        />

        {/* Segmented pill toggle */}
        <div
          className="flex p-1 mt-3 mb-5 rounded-2xl glass border border-white/10"
          role="tablist"
          aria-label="Buddy sections"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors duration-150"
                style={{
                  background: isActive ? "var(--color-primary)" : "transparent",
                  color: isActive ? "var(--color-primary-foreground)" : "rgba(255,255,255,0.45)",
                }}
              >
                <tab.icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── AI COACH TAB ── */}
        {activeTab === "coach" && (
          <div className="flex flex-col gap-6">
            {/* Hamster Mascot & Score Badge */}
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

            {/* Coach's Advice (Vertical but Compact & Scrollable) */}
            <div className="mt-1 px-1">
              <p className="text-[11px] text-center text-white/50 uppercase tracking-widest font-bold mb-3">Today's Advice</p>
              
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                
                {/* Advice Bubble 1 */}
                <div className="flex justify-start">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full">
                    <Card className="max-w-[92%] p-3 rounded-2xl rounded-tl-none bg-card border-white/5 shadow-card relative">
                      <Sparkles className="absolute -top-2 -left-2 h-5 w-5 text-primary bg-[#0C0121] rounded-full p-0.5" />
                      <p className="text-[12px] text-white/90 leading-relaxed">
                        Hey {user.firstName}! 🐹 Your <span className="font-bold text-primary">Pre-Spending Warning</span> caught 2 impulse buys this week. Awesome job.
                      </p>
                    </Card>
                  </motion.div>
                </div>

                {/* Advice Bubble 2 */}
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

                {/* Advice Bubble 3 */}
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

        {/* ── WEEKLY REPORT TAB — flat, no overflow wrapper ── */}
        {activeTab === "report" && (
          <WeeklyReportContent />
        )}

        {/* ── BUDDY TOOLS — always below, part of the same flat scroll ── */}
        <div className="mt-8 pb-4 border-t border-white/10 pt-6">
          <h2 className="text-base font-bold flex items-center gap-2 mb-1">
            Buddy Tools <ChevronRight className="h-5 w-5 text-primary" />
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Explore features</p>
          <div className="grid grid-cols-2 gap-3">
            {buddyFeatures.map(feature => (
              <Link key={feature.id} to={feature.route as any} className="group text-left">
                <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card h-full flex flex-col gap-3 group-active:scale-95 transition-transform">
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
        </div>

      </div>
    </AppShell>
  );
}
