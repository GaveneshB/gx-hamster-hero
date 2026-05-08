import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { ChevronRight, Calendar, Activity } from "lucide-react";
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

const TABS = [
  { id: "coach" as const, label: "Vibe Check", icon: Activity },
  { id: "report" as const, label: "Weekly Report", icon: Calendar },
];

function Coach() {
  const [activeTab, setActiveTab] = useState<"coach" | "report">("coach");
  const hamsterMood = getHamsterMood(user.resilienceScore);

  return (
    <AppShell>
      {/* Single flat column — AppShell is the ONLY scroller, nothing inside has overflow-y-auto */}
      <div className="flex flex-col px-5 pt-8 pb-32">

        {/* Header + toggle */}
        <PageHeader
          title="GX Buddy"
          subtitle={activeTab === "coach" ? "Your financial vital signs" : "Weekly recap from Buddy"}
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

        {/* ── VIBE CHECK TAB ── */}
        {activeTab === "coach" && (
          <div className="flex flex-col gap-6">
            {/* Hamster Mascot & Score Circle */}
            <div className="relative flex justify-center py-6">
              <div className="relative w-48 h-48">
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#771FFF" strokeWidth="6" strokeLinecap="round" strokeDasharray="289" strokeDashoffset={289 - (289 * user.resilienceScore) / 100} className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 m-2 rounded-full bg-[#0C0121] flex items-center justify-center overflow-hidden border-4 border-[#771FFF]/10 shadow-[0_0_40px_rgba(119,31,255,0.2)]">
                  <Hamster mood={hamsterMood} size={130} float={true} />
                </div>
              </div>
            </div>

            {/* Score & Safe to Spend Details */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-5 rounded-3xl glass-strong border border-white/10 text-center relative overflow-hidden">
                <div aria-hidden className="absolute -top-6 -right-6 h-16 w-16 bg-[#4EE6E6]/20 blur-2xl rounded-full" />
                <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold mb-1 relative z-10">Buddy Score</p>
                <p className="text-4xl font-black text-white relative z-10">{user.resilienceScore}</p>
                <p className="text-[10px] text-[#4EE6E6] font-bold uppercase tracking-wider mt-1 relative z-10">{user.resilienceScore >= 80 ? 'Excellent' : 'Good'}</p>
              </Card>
              <Card className="p-5 rounded-3xl glass-strong border border-white/10 text-center relative overflow-hidden">
                <div aria-hidden className="absolute -top-6 -right-6 h-16 w-16 bg-[#771FFF]/30 blur-2xl rounded-full" />
                <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold mb-1 relative z-10">Safe to Spend</p>
                <p className="text-4xl font-black text-[#c1a3ff] relative z-10">RM{user.safeToSpend.toFixed(0)}</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1 relative z-10">Today</p>
              </Card>
            </div>

            {/* Missions to increase score */}
            <div className="mt-4">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                Level up your score <span className="text-lg">🚀</span>
              </h3>
              <div className="space-y-3">
                {[
                  { title: "Top up Emergency Buffer", desc: "Add RM50 to reach your RM300 goal", pts: "+3 pts" },
                  { title: "Turn on Smart Auto-Save", desc: "Stash your spare change automatically", pts: "+5 pts" },
                  { title: "Join a Squad", desc: "Create or join a Squad Pocket goal", pts: "+10 pts" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-3xl glass border border-white/5 active:scale-95 transition-transform cursor-pointer">
                    <div className="h-11 w-11 rounded-full bg-[#771FFF]/20 flex items-center justify-center shrink-0 border border-[#771FFF]/30">
                      <span className="text-[11px] font-black text-[#c1a3ff]">{m.pts}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-0.5">{m.title}</p>
                      <p className="text-[11px] text-white/50 leading-snug">{m.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/30" />
                  </div>
                ))}
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
