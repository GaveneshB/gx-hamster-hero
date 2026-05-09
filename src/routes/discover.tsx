import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Sparkles, Users, ShieldAlert, BookOpen, ChevronRight, Zap, Lock, Coins } from "lucide-react";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — GX Buddy" },
      { name: "description", content: "Discover Buddy tools: debt radar, future you, BNPL detector, missions and more." },
    ],
  }),
  component: Discover,
});

function Discover() {
  return (
    <AppShell>
      {/* Top Background Gradient - Signature GXBank style */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-[#771FFF]/40 via-[#F8326D]/10 to-transparent pointer-events-none -z-10" />

      <div className="px-5 pt-16 pb-6 relative z-10">
        <h1 className="text-3xl font-black mb-1">Discover</h1>
        <p className="text-sm text-white/70 mb-6">Explore campaigns, tools, and insights.</p>

        {/* HERO CAMPAIGN BANNER */}
        <div className="relative rounded-[2rem] overflow-hidden bg-[#0C0121] border border-white/10 shadow-2xl mb-8 group">
          <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F8326D]/40 blur-3xl" />
          <div aria-hidden className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-[#771FFF]/40 blur-3xl" />
          
          <div className="relative p-6">
            <span className="inline-block px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-3 backdrop-blur-md">
              Featured Campaign
            </span>
            <h2 className="text-2xl font-black leading-tight mb-2">The Youth Resilience Challenge</h2>
            <p className="text-xs text-white/80 mb-5 leading-relaxed max-w-[85%]">
              Turn your financial habits from passive to proactive. Meet your new AI Money Coach and start building wealth today.
            </p>
            <Link to="/coach" className="inline-flex items-center justify-center bg-white text-black font-bold text-sm px-5 py-2.5 rounded-full active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Meet GX Buddy <Sparkles className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* BUDDY IN ACTION - ALL 5 TOOLS */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="text-xl font-black">Buddy in Action</h3>
        </div>
        
        <div className="flex flex-col gap-4 pb-8">
          {/* Tool 1: Debt Risk Radar */}
          <Card className="p-0 rounded-[1.5rem] glass-strong border border-warning/20 relative overflow-hidden group">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-warning/20 via-transparent to-transparent opacity-60" />
            <div className="p-4 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center border border-warning/40 shadow-[0_0_15px_rgba(255,200,50,0.2)] shrink-0">
                  <BookOpen className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight">Debt Risk Radar</h3>
                  <p className="text-[9px] text-warning font-bold uppercase tracking-widest mt-0.5">Scenario: Mid-Month Cash Crunch</p>
                </div>
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed mb-4">
                Spending too fast? Buddy continuously monitors your burn rate and predicts if you'll run out of cash before the month ends, showing exactly how much to cut back today.
              </p>
              <Link to="/coach" className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-warning text-black font-extrabold text-[11px] hover:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(255,200,50,0.3)]">
                Try Debt Risk Radar <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Tool 2: Smart Auto-Save */}
          <Card className="p-0 rounded-[1.5rem] glass-strong border border-[#4ade80]/20 relative overflow-hidden group">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/20 via-transparent to-transparent opacity-60" />
            <div className="p-4 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#4ade80]/20 flex items-center justify-center border border-[#4ade80]/40 shadow-[0_0_15px_rgba(74,222,128,0.2)] shrink-0">
                  <Coins className="h-5 w-5 text-[#4ade80]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight">Smart Auto-Save</h3>
                  <p className="text-[9px] text-[#4ade80] font-bold uppercase tracking-widest mt-0.5">Scenario: Daily Coffee Habit</p>
                </div>
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed mb-4">
                Buying iced lattes every day? Buddy rounds up your RM12 coffee to RM15 and silently auto-saves the difference.
              </p>
              <Link to="/coach" className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#4ade80] text-black font-extrabold text-[11px] hover:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                Try Smart Auto-Save <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
          
          {/* Tool 3: Buddy Shield Vault */}
          <Card className="p-0 rounded-[1.5rem] glass-strong border border-primary/20 relative overflow-hidden group">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-60" />
            <div className="p-4 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/30 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(119,31,255,0.2)] shrink-0">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight">Salary Shield</h3>
                  <p className="text-[9px] text-[#c1a3ff] font-bold uppercase tracking-widest mt-0.5">Scenario: Payday Temptation</p>
                </div>
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed mb-4">
                Before you accidentally spend your rent money, Buddy auto-locks a percentage of your salary the second it lands.
              </p>
              <Link to="/coach" className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white font-extrabold text-[11px] hover:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(119,31,255,0.3)]">
                Try Salary Shield <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Tool 4: Squad Pocket */}
          <Card className="p-0 rounded-[1.5rem] glass-strong border border-[#F8326D]/20 relative overflow-hidden group">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#F8326D]/20 via-transparent to-transparent opacity-60" />
            <div className="p-4 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#F8326D]/20 flex items-center justify-center border border-[#F8326D]/40 shadow-[0_0_15px_rgba(248,50,109,0.2)] shrink-0">
                  <Users className="h-5 w-5 text-[#F8326D]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight">Squad Pocket</h3>
                  <p className="text-[9px] text-[#F8326D] font-bold uppercase tracking-widest mt-0.5">Scenario: Grad Trip to Bali</p>
                </div>
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed mb-4">
                Create a pocket with 3 friends. Set a goal, track everyone's progress, and build social accountability to make it happen.
              </p>
              <Link to="/coach" className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#F8326D] text-white font-extrabold text-[11px] hover:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(248,50,109,0.3)]">
                Try Squad Pocket <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Tool 5: Emergency Buffer */}
          <Card className="p-0 rounded-[1.5rem] glass-strong border border-mint/20 relative overflow-hidden group">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-mint/20 via-transparent to-transparent opacity-60" />
            <div className="p-4 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-mint/20 flex items-center justify-center border border-mint/40 shadow-[0_0_15px_rgba(78,230,230,0.2)] shrink-0">
                  <ShieldAlert className="h-5 w-5 text-mint" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight">Emergency Buffer</h3>
                  <p className="text-[9px] text-mint font-bold uppercase tracking-widest mt-0.5">Scenario: Unexpected Repair</p>
                </div>
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed mb-4">
                Don't panic! Buddy keeps a dedicated reserve of cash actively protected so you don't go into debt when life happens.
              </p>
              <Link to="/coach" className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-mint text-[#0C0121] font-extrabold text-[11px] hover:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(78,230,230,0.3)]">
                Try Emergency Buffer <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
