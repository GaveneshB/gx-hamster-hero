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
  Clock, CheckCircle2, Trophy, Star, Flame, Sparkles
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

const rarityConfig: Record<string, { label: string; color: string; glow: string; border: string }> = {
  common:    { label: "Common",    color: "#9CA3AF", glow: "rgba(156,163,175,0.3)", border: "rgba(156,163,175,0.25)" },
  rare:      { label: "Rare",      color: "#60A5FA", glow: "rgba(96,165,250,0.35)", border: "rgba(96,165,250,0.3)" },
  epic:      { label: "Epic",      color: "#A855F7", glow: "rgba(168,85,247,0.4)",  border: "rgba(168,85,247,0.35)" },
  legendary: { label: "Legendary", color: "#F59E0B", glow: "rgba(245,158,11,0.45)", border: "rgba(245,158,11,0.4)" },
};

const allBadges = [
  { id: 1, name: "First Save",      emoji: "🥇", earned: true,  rarity: "common",    desc: "Saved for the first time" },
  { id: 2, name: "Streak x10",      emoji: "🔥", earned: true,  rarity: "rare",      desc: "10-day saving streak" },
  { id: 3, name: "Debt Defender",   emoji: "🛡️", earned: true,  rarity: "epic",      desc: "Survived Debt Risk Radar" },
  { id: 4, name: "Budget Boss",     emoji: "👑", earned: false, rarity: "legendary", desc: "Safe Zone for 30 days" },
  { id: 5, name: "Emergency Hero",  emoji: "🦸", earned: false, rarity: "rare",      desc: "Fill Emergency Buffer 100%" },
  { id: 6, name: "Money Guardian",  emoji: "🧙", earned: false, rarity: "epic",      desc: "Lock salary 3 months" },
  { id: 7, name: "Squad Leader",    emoji: "🤝", earned: false, rarity: "rare",      desc: "Complete a Squad Pocket goal" },
  { id: 8, name: "Round-Up Royale", emoji: "💎", earned: false, rarity: "legendary", desc: "Auto-save RM100 from round-ups" },
  { id: 9, name: "Ghost Shield",    emoji: "👻", earned: false, rarity: "epic",      desc: "Block 5 risky payments" },
];

const featureMissions = [
  {
    id: 1, icon: <TrendingDown className="h-5 w-5 text-amber-400" />, iconColor: "#F59E0B",
    title: "30-Day Safe Zone Challenge",
    desc: "Keep your Debt Risk Radar in Safe Zone for 30 consecutive days.",
    reward: "Debt Defender Badge", daysLeft: 18, progress: 40, xp: 200, route: "/debt-radar",
  },
  {
    id: 2, icon: <Coins className="h-5 w-5 text-[#4EE6E6]" />, iconColor: "#4EE6E6",
    title: "Auto-Save RM50 This Month",
    desc: "Let Smart Auto-Save round up your transactions until you've saved RM50.",
    reward: "Round-Up Royale Badge", daysLeft: 22, progress: 70, xp: 150, route: "/auto-save",
  },
  {
    id: 3, icon: <ShieldCheck className="h-5 w-5 text-purple-400" />, iconColor: "#A855F7",
    title: "Lock Your Salary 3x",
    desc: "Activate Salary Shield on your next 3 paydays without skipping.",
    reward: "Money Guardian Badge", daysLeft: 52, progress: 33, xp: 180, route: "/buddy-shield-vault",
  },
  {
    id: 4, icon: <Users className="h-5 w-5 text-[#F8326D]" />, iconColor: "#F8326D",
    title: "Complete a Squad Pocket Goal",
    desc: "Finish saving for any shared goal with your squad.",
    reward: "Squad Leader Badge", daysLeft: 30, progress: 15, xp: 220, route: "/group-challenges",
  },
  {
    id: 5, icon: <Zap className="h-5 w-5 text-green-400" />, iconColor: "#4ADE80",
    title: "Block 5 Risky Payments",
    desc: "Use the Pre-Spending Guardian and cancel 5 flagged risky transactions.",
    reward: "Ghost Shield Badge", daysLeft: 14, progress: 60, xp: 100, route: "/",
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
  const todayXP = 25;

  return (
    <AppShell>
      <div className="pb-28">

        {/* ── HERO HEADER ── */}
        <div className="relative overflow-hidden px-5 pt-10 pb-8">
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#771FFF]/40 via-[#771FFF]/10 to-transparent" />
          <div aria-hidden className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[#F8326D]/15 blur-2xl" />
          <div aria-hidden className="absolute top-4 left-8 w-32 h-32 rounded-full bg-[#4EE6E6]/10 blur-2xl" />

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} aria-hidden
              className="absolute w-1 h-1 rounded-full bg-primary/40"
              style={{ top: `${20 + i * 12}%`, left: `${10 + i * 18}%` }}
              animate={{ y: [-4, 4, -4], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          <div className="relative flex items-center gap-5">
            {/* Mascot with bounce */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="h-20 w-20 rounded-full bg-[#0C0121] border-2 border-[#771FFF]/60 overflow-hidden flex items-center justify-center"
                style={{ boxShadow: "0 0 32px rgba(119,31,255,0.5), 0 0 60px rgba(119,31,255,0.2)" }}
              >
                <Hamster mood="happy" size={68} float={false} />
              </motion.div>
              {/* Outer glow ring */}
              <motion.span
                className="absolute inset-0 rounded-full border border-[#771FFF]/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>

            <div>
              <p className="text-[10px] font-black text-[#4EE6E6] uppercase tracking-widest mb-1">GX Buddy</p>
              <h1 className="text-2xl font-extrabold leading-tight">Rewards</h1>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Complete missions, earn badges<br/>& unlock surprises!</p>
            </div>
          </div>
        </div>



        {/* ── XP PROGRESS CARD ── */}
        <section className="px-5 mb-5">
          <div
            className="p-4 rounded-3xl relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(119,31,255,0.2) 0%, rgba(78,230,230,0.05) 100%)", border: "1px solid rgba(119,31,255,0.3)", boxShadow: "0 0 30px rgba(119,31,255,0.15)" }}
          >
            <div aria-hidden className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/25 flex items-center justify-center" style={{ boxShadow: "0 0 12px rgba(119,31,255,0.4)" }}>
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">Budget Builder</p>
                  <p className="text-[10px] text-muted-foreground">Level {user.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-primary">{totalXP} / {nextLevelXP} XP</p>
                <motion.p
                  className="text-[10px] text-green-400 font-bold"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  +{todayXP} XP today 🎉
                </motion.p>
              </div>
            </div>

            {/* Shimmer XP bar */}
            <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "linear-gradient(90deg, #771FFF, #4EE6E6)" }}
                initial={{ width: 0 }}
                animate={{ width: `${(totalXP / nextLevelXP) * 100}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              {/* shimmer overlay */}
              <motion.div
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: [-64, 400] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">{nextLevelXP - totalXP} XP to unlock Level {user.level + 1}</p>

            {/* Streak */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1.5"
              >
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-extrabold text-orange-400">{user.streak} day streak</span>
              </motion.div>
              <span className="text-[10px] text-muted-foreground">Keep saving daily to protect your streak!</span>
            </div>
          </div>
        </section>

        {/* ── BADGES ── */}
        <section className="px-5 mb-5">
          <div
            className="p-4 rounded-3xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Badges</h2>
              <button onClick={() => setShowAllBadges(v => !v)} className="text-primary text-xs font-bold hover:underline">
                {showAllBadges ? "Show less" : "View all"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence>
                {displayedBadges.map((b, i) => {
                  const rarity = rarityConfig[b.rarity];
                  return (
                    <motion.div key={b.id}
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={b.earned ? { scale: 1.06, y: -2 } : {}}
                      className="relative rounded-2xl p-3 flex flex-col items-center text-center transition-all"
                      style={b.earned ? {
                        background: `linear-gradient(135deg, ${rarity.color}15, transparent)`,
                        border: `1px solid ${rarity.border}`,
                        boxShadow: `0 0 16px ${rarity.glow}`,
                      } : {
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        opacity: 0.4,
                        filter: "grayscale(1)",
                      }}
                    >
                      {b.earned && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_8px_rgba(74,222,128,0.6)]">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </span>
                      )}
                      {!b.earned && (
                        <span className="absolute -top-1 -right-1 text-[8px] bg-secondary border border-border rounded-full px-1 py-0.5 font-bold text-muted-foreground">🔒</span>
                      )}
                      {b.earned && (
                        <span className="absolute -top-1 -left-1 text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded-full"
                          style={{ background: rarity.color, color: "#000", opacity: 0.85 }}>
                          {rarity.label}
                        </span>
                      )}
                      <div className="text-3xl mb-1">{b.emoji}</div>
                      <p className="text-[10px] font-bold leading-tight" style={b.earned ? { color: rarity.color } : {}}>{b.name}</p>
                      {showAllBadges && <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{b.desc}</p>}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-[#F8326D]">🎁 Grand Prize Mission</p>
                <p className="text-[10px] text-white/60">{earnedCount}/{allBadges.length} Badges</p>
              </div>
              <div className="bg-[#F8326D]/10 border border-[#F8326D]/20 rounded-2xl p-3">
                <p className="text-[11px] text-white leading-snug">
                  Collect all 9 badges to unlock a <span className="text-[#F8326D] font-bold">RM10 Cashback Grand Prize</span>!
                </p>
                <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#F8326D]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(earnedCount / allBadges.length) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MISSIONS ── */}
        <section className="px-5">
          <h2 className="text-base font-bold mb-3">Missions for you</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {displayedMissions.map((m, i) => (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Link to={m.route as any}>
                    <div className="p-4 rounded-2xl cursor-pointer group"
                      style={{ background: `linear-gradient(135deg, ${m.iconColor}12 0%, rgba(255,255,255,0.03) 100%)`, border: `1px solid ${m.iconColor}28`, backdropFilter: "blur(8px)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `${m.iconColor}20`, border: `1px solid ${m.iconColor}40`, boxShadow: `0 0 12px ${m.iconColor}40` }}>
                          {m.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold leading-tight text-white">{m.title}</p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{m.desc}</p>

                          {/* Animated progress */}
                          <div className="mt-2.5 relative h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div className="absolute inset-y-0 left-0 rounded-full"
                              style={{ background: `linear-gradient(90deg, ${m.iconColor}cc, ${m.iconColor})` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${m.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" /><span>{m.daysLeft} days left</span>
                            </div>
                            <span className="text-[10px] font-extrabold" style={{ color: m.iconColor }}>+{m.xp} XP</span>
                          </div>

                          <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                            style={{ background: `${m.iconColor}15`, border: `1px solid ${m.iconColor}30` }}>
                            <Star className="h-3 w-3" style={{ color: m.iconColor }} />
                            <span className="text-[9px] font-semibold" style={{ color: m.iconColor }}>{m.reward}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => setShowAllMissions(v => !v)}
            className="mt-5 w-full py-3.5 rounded-full text-sm font-bold transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {showAllMissions ? "Show fewer missions" : `View all ${featureMissions.length} missions`}
          </motion.button>
        </section>

      </div>
    </AppShell>
  );
}
