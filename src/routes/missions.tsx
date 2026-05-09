import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { user } from "@/lib/data";
import { Hamster } from "@/components/Hamster";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ShieldCheck, Zap, TrendingDown, Users, Coins, ChevronRight,
  Clock, CheckCircle2, Trophy, Star, Flame
} from "lucide-react";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: "Rewards — GX Buddy" },
      { name: "description", content: "Earn badges, complete missions and unlock rewards through smart financial habits." },
    ],
  }),
  component: RewardsPage,
});

const allBadges = [
  { id: 1,  name: "First Save",       emoji: "🥇", earned: true,  desc: "Saved for the first time" },
  { id: 2,  name: "Streak x10",       emoji: "🔥", earned: true,  desc: "10-day saving streak" },
  { id: 3,  name: "Debt Defender",    emoji: "🛡️", earned: true,  desc: "Survived Debt Risk Radar" },
  { id: 4,  name: "Budget Boss",      emoji: "👑", earned: false, desc: "Stay in Safe Zone for 30 days" },
  { id: 5,  name: "Emergency Hero",   emoji: "🦸", earned: false, desc: "Fill Emergency Buffer to 100%" },
  { id: 6,  name: "Money Guardian",   emoji: "🧙", earned: false, desc: "Lock salary 3 months in a row" },
  { id: 7,  name: "Squad Leader",     emoji: "🤝", earned: false, desc: "Complete your first Squad Pocket goal" },
  { id: 8,  name: "Round-Up Royale",  emoji: "💎", earned: false, desc: "Auto-save RM100 from round-ups" },
  { id: 9,  name: "Ghost Shield",     emoji: "👻", earned: false, desc: "Block 5 risky payments in a row" },
];

const featureMissions = [
  {
    id: 1,
    icon: <TrendingDown className="h-6 w-6 text-warning" />,
    iconBg: "bg-warning/15",
    title: "30-Day Safe Zone Challenge",
    desc: "Keep your Debt Risk Radar in Safe Zone for 30 consecutive days.",
    reward: "RM5 cashback + Debt Defender Badge",
    daysLeft: 18,
    progress: 40,
    xp: 200,
    route: "/debt-radar",
  },
  {
    id: 2,
    icon: <Coins className="h-6 w-6 text-[#4EE6E6]" />,
    iconBg: "bg-[#4EE6E6]/15",
    title: "Auto-Save RM50 This Month",
    desc: "Let Smart Auto-Save round up your transactions until you've saved RM50.",
    reward: "Round-Up Royale Badge",
    daysLeft: 22,
    progress: 70,
    xp: 150,
    route: "/auto-save",
  },
  {
    id: 3,
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    iconBg: "bg-primary/15",
    title: "Lock Your Salary 3x",
    desc: "Activate Salary Shield on your next 3 paydays without skipping.",
    reward: "Money Guardian Badge",
    daysLeft: 52,
    progress: 33,
    xp: 180,
    route: "/buddy-shield-vault",
  },
  {
    id: 4,
    icon: <Users className="h-6 w-6 text-[#F8326D]" />,
    iconBg: "bg-[#F8326D]/15",
    title: "Complete a Squad Pocket Goal",
    desc: "Finish saving for any shared goal with your squad.",
    reward: "Squad Leader Badge + RM3 cashback",
    daysLeft: 30,
    progress: 15,
    xp: 220,
    route: "/group-challenges",
  },
  {
    id: 5,
    icon: <Zap className="h-6 w-6 text-success" />,
    iconBg: "bg-success/15",
    title: "Block 5 Risky Payments",
    desc: "Use the Pre-Spending Guardian and cancel 5 flagged risky transactions.",
    reward: "Ghost Shield Badge",
    daysLeft: 14,
    progress: 60,
    xp: 100,
    route: "/",
  },
];

function RewardsPage() {
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showAllMissions, setShowAllMissions] = useState(false);

  const earnedCount = allBadges.filter(b => b.earned).length;
  const displayedBadges = showAllBadges ? allBadges : allBadges.slice(0, 3);
  const displayedMissions = showAllMissions ? featureMissions : featureMissions.slice(0, 3);

  const totalXP = 310;
  const nextLevelXP = 500;

  return (
    <AppShell>
      <div className="pb-28">
        {/* Hero Header — GX Buddy branded */}
        <div className="relative overflow-hidden px-5 pt-10 pb-6">
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#771FFF]/30 via-background to-background" />
          <div aria-hidden className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#F8326D]/10 blur-3xl" />
          
          <div className="relative flex items-center gap-5">
            {/* Animated hamster — ties the whole page to GX Buddy */}
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full bg-[#0C0121] border-2 border-[#771FFF]/50 overflow-hidden shadow-[0_0_24px_rgba(119,31,255,0.4)] flex items-center justify-center">
                <Hamster mood="happy" size={68} float={true} />
              </div>
              {/* Live pulse ring */}
              <span className="absolute inset-0 rounded-full border border-[#771FFF]/30 animate-ping" />
            </div>

            <div>
              <p className="text-[10px] font-black text-[#4EE6E6] uppercase tracking-widest mb-1">GX Buddy</p>
              <h1 className="text-2xl font-extrabold leading-tight">Rewards</h1>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Complete Buddy missions,<br/>earn badges &amp; unlock surprises!</p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar — behavioural nudge: show progress to next level */}
        <section className="px-5 -mt-2 mb-6">
          <Card className="p-4 rounded-3xl bg-secondary/40 border-0 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold">Budget Builder</p>
                  <p className="text-[10px] text-muted-foreground">Level {user.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-primary">{totalXP} / {nextLevelXP} XP</p>
                <p className="text-[10px] text-muted-foreground">{nextLevelXP - totalXP} XP to next level</p>
              </div>
            </div>
            <Progress value={(totalXP / nextLevelXP) * 100} className="h-2" />

            {/* Streak — embedded behavioural nudge */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-extrabold">{user.streak} day streak</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Keep saving daily to protect your streak!</span>
            </div>
          </Card>
        </section>

        {/* Badges Section — exact GXBank layout */}
        <section className="px-5 mb-6">
          <Card className="p-4 rounded-3xl bg-secondary/40 border-0 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Badges</h2>
              <button
                onClick={() => setShowAllBadges(v => !v)}
                className="text-primary text-sm font-bold hover:underline"
              >
                {showAllBadges ? "Show less" : "View all"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence>
                {displayedBadges.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative rounded-2xl p-3 border flex flex-col items-center text-center transition-all ${
                      b.earned
                        ? "bg-primary/10 border-primary/30 shadow-[0_0_12px_rgba(119,31,255,0.15)]"
                        : "bg-white/5 border-white/10 opacity-50 grayscale"
                    }`}
                  >
                    {b.earned && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </span>
                    )}
                    {!b.earned && (
                      <span className="absolute -top-1 -right-1 text-[9px] bg-secondary border border-border rounded-full px-1.5 py-0.5 font-bold text-muted-foreground whitespace-nowrap">
                        Locked
                      </span>
                    )}
                    <div className="text-3xl mb-1">{b.emoji}</div>
                    <p className="text-[10px] font-bold leading-tight">{b.name}</p>
                    {showAllBadges && (
                      <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{b.desc}</p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{earnedCount} of {allBadges.length} earned</p>
              <div className="flex gap-0.5">
                {allBadges.map(b => (
                  <div
                    key={b.id}
                    className={`h-1.5 rounded-full transition-all ${b.earned ? "w-4 bg-primary" : "w-1.5 bg-white/20"}`}
                  />
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Missions Section — GXBank style list, GX Buddy content */}
        <section className="px-5">
          <h2 className="text-base font-bold mb-3">Missions for you</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {displayedMissions.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={m.route}>
                    <Card className="p-4 rounded-2xl bg-secondary/40 border-0 shadow-card group hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        {/* Icon — GXBank circle icon style */}
                        <div className={`h-11 w-11 rounded-full ${m.iconBg} flex items-center justify-center shrink-0 border border-white/10`}>
                          {m.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold leading-tight">{m.title}</p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{m.desc}</p>
                          
                          {/* Progress bar */}
                          <div className="mt-2.5">
                            <Progress value={m.progress} className="h-1.5" />
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{m.daysLeft} days left</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-primary">+{m.xp} XP</span>
                            </div>
                          </div>

                          {/* Reward pill */}
                          <div className="mt-2 inline-flex items-center gap-1 bg-success/10 border border-success/20 rounded-full px-2 py-0.5">
                            <Star className="h-3 w-3 text-success" />
                            <span className="text-[10px] font-semibold text-success">{m.reward}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* View all missions button — matches GXBank pill */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAllMissions(v => !v)}
            className="mt-5 w-full py-3.5 rounded-full border border-white/20 bg-white/5 text-sm font-bold hover:bg-white/10 transition-colors"
          >
            {showAllMissions ? "Show fewer missions" : `View all ${featureMissions.length} missions`}
          </motion.button>
        </section>

      </div>
    </AppShell>
  );
}
