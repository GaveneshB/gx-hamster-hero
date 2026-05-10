import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/Hamster";
import { user } from "@/lib/data";
import { getHamsterMood } from "@/lib/utils";
import { ChevronRight, TrendingUp, Zap, Target, Star } from "lucide-react";

export const Route = createFileRoute("/buddy-profile")({
  head: () => ({
    meta: [
      { title: "Buddy Profile — GX Buddy" },
      { name: "description", content: "Check your financial resilience and level up your buddy score." },
    ],
  }),
  component: BuddyProfile,
});

function BuddyProfile() {
  const hamsterMood = getHamsterMood(user.resilienceScore);

  const tips = [
    { icon: TrendingUp, text: "Maintain a 3-month emergency buffer", points: "+15 pts" },
    { icon: Zap, text: "Set up Smart Auto-Save for daily spends", points: "+10 pts" },
    { icon: Target, text: "Complete 2 financial missions this week", points: "+5 pts" },
    { icon: Star, text: "Join a Squad Pocket and save together", points: "+10 pts" },
  ];

  return (
    <AppShell>
      <PageHeader title="Buddy Profile" subtitle="Your financial resilience hub" />

      <div className="px-5 pb-32">
        {/* Main Score Card */}
        <Card className="p-6 rounded-[2.5rem] bg-hero text-white border-0 shadow-card relative overflow-hidden mb-6">
          <div aria-hidden className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          
          <div className="flex flex-col items-center relative z-10 text-center">
            <div className="mb-4">
              <Hamster mood={hamsterMood} size={120} float={true} />
            </div>
            <p className="text-xs uppercase tracking-widest font-bold opacity-70">Current Buddy Score</p>
            <h2 className="text-6xl font-black mt-1">{user.resilienceScore}</h2>
            <div className="mt-3 px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider">
              {user.resilienceScore >= 80 ? 'Master Saver' : 'Rising Hero'}
            </div>
          </div>
        </Card>

        {/* Feature Highlight: Personality Scan */}
        <Link to="/personality">
          <Card className="p-5 rounded-3xl glass-strong border border-[#F8326D]/30 shadow-card relative overflow-hidden flex items-center gap-4 mb-8 active:scale-[0.98] transition-transform group">
            <div aria-hidden className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F8326D]/20 to-transparent" />
            <div className="h-12 w-12 rounded-full bg-[#F8326D]/20 flex items-center justify-center shrink-0 border border-[#F8326D]/50 text-xl">
              🧬
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-0.5">Financial Personality Scan</h4>
              <p className="text-[11px] text-white/70 leading-snug">Discover your archetype and unlock personalized tips.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
          </Card>
        </Link>

        {/* How to increase score */}
        <h3 className="text-base font-bold mb-4 flex items-center gap-2 px-1">
          <span className="text-primary">⚡</span> How to Level Up
        </h3>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <Card key={i} className="p-4 rounded-2xl glass border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <tip.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-white/90 leading-snug max-w-[180px]">{tip.text}</p>
              </div>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase">
                {tip.points}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
