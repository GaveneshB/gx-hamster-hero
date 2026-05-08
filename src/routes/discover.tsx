import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Sparkles, Users, ShieldAlert, BookOpen, ChevronRight, Zap } from "lucide-react";

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

        {/* GX BUDDY AS A BIG FUNCTION */}
        <h3 className="text-base font-bold mb-3">Your Financial Arsenal</h3>
        <div className="grid gap-3 mb-8">
          {/* Squad Pocket Card */}
          <Link to="/group-challenges">
            <Card className="p-5 rounded-3xl glass-strong border border-[#F8326D]/30 shadow-card relative overflow-hidden flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div aria-hidden className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F8326D]/20 to-transparent" />
              <div className="h-14 w-14 rounded-full bg-[#F8326D]/20 flex items-center justify-center shrink-0 border border-[#F8326D]/50">
                <Users className="h-7 w-7 text-[#ffb3c6]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-0.5">Squad Pocket</h4>
                <p className="text-[11px] text-white/70 leading-snug pr-2">Pool funds with friends for that Bali trip. Social accountability works.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40 absolute right-4" />
            </Card>
          </Link>
        </div>

        {/* BITE-SIZED LEARNING */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">Quick Insights</h3>
          <span className="text-xs text-[#771FFF] font-bold">View all</span>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Card className="min-w-[200px] p-4 rounded-2xl glass border-white/10 snap-start shrink-0">
            <div className="h-8 w-8 rounded-full bg-mint/20 flex items-center justify-center mb-3">
              <Zap className="h-4 w-4 text-mint" />
            </div>
            <h4 className="text-xs font-bold mb-1">Surviving till PTPTN</h4>
            <p className="text-[10px] text-white/60">How to calculate your true daily survival budget.</p>
          </Card>
          
          <Card className="min-w-[200px] p-4 rounded-2xl glass border-white/10 snap-start shrink-0">
            <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center mb-3">
              <BookOpen className="h-4 w-4 text-warning" />
            </div>
            <h4 className="text-xs font-bold mb-1">The BNPL Trap</h4>
            <p className="text-[10px] text-white/60">Why paying in 3 months costs you more than you think.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
