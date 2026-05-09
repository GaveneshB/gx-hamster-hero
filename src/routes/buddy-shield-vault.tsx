import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, LockKeyhole, Unlock, Brain, CalendarDays, TrendingUp,
  AlertTriangle, CheckCircle2, ChevronRight, X, Settings, Flame, PiggyBank,
  Coins, Target, Trophy, Star, Zap, HeartCrack, Ambulance, Receipt,
  ShoppingBag, CalendarClock,
} from "lucide-react";
import { user } from "@/lib/data";

export const Route = createFileRoute("/buddy-shield-vault")({
  head: () => ({
    meta: [
      { title: "Salary Shield — GX Buddy" },
      { name: "description", content: "Protect salary before spending starts." },
    ],
  }),
  component: BuddyShieldVault,
});

type ShieldMode = "chill" | "balanced" | "discipline" | "beast";
type ShieldLevel = "Starter Shield" | "Smart Protected" | "Fully Protected" | "Elite Shield";
type IncomeType = "Salary" | "PTPTN" | "Allowance";
type ActiveSection = "protect" | "insights" | "unlock";
type UnlockReason = "emergency" | "bigGoal" | "personalSpend" | "other";

interface SavingGoal { id: number; name: string; targetAmount: number; emoji: string; }
interface IncomeDeposit { id: number; type: IncomeType; amount: number; date: string; }
interface VaultActivity { id: number; title: string; description: string; amount: number; type: "shielded" | "unlock" | "bonus"; reason?: UnlockReason; customReason?: string; }
interface ShieldChallenge { id: string; title: string; description: string; target: number; current: number; reward: string; completed: boolean; }

const SHIELD_PERCENT: Record<ShieldMode, number> = { chill: 10, balanced: 20, discipline: 30, beast: 40 };
const MODE_LABEL: Record<ShieldMode, string> = { chill: "Chill", balanced: "Balanced", discipline: "Discipline", beast: "Beast Mode" };
const MODE_DESC: Record<ShieldMode, string> = {
  chill: "Protect a small amount and keep spending flexible.",
  balanced: "Best default for steady saving without pressure.",
  discipline: "Protect more salary before impulse spending starts.",
  beast: "Maximum protection for serious saving months.",
};

const UNLOCK_REASONS: { key: UnlockReason; label: string; helper: string; Icon: typeof Ambulance }[] = [
  { key: "bigGoal", label: "Big Goal", helper: "Laptop, travel, investment", Icon: Target },
  { key: "emergency", label: "Emergency", helper: "Urgent real-life needs", Icon: Ambulance },
  { key: "personalSpend", label: "Personal Spend", helper: "Treats or extra spending", Icon: ShoppingBag },
  { key: "other", label: "Other", helper: "Custom reason", Icon: Receipt },
];

const PRESET_GOALS: SavingGoal[] = [
  { id: 1, name: "Emergency Fund", targetAmount: 5000, emoji: "🛡️" },
  { id: 2, name: "New Laptop", targetAmount: 3000, emoji: "💻" },
  { id: 3, name: "Travel Fund", targetAmount: 2000, emoji: "✈️" },
  { id: 4, name: "Investment Seed", targetAmount: 10000, emoji: "📈" },
];

function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const s = window.localStorage.getItem(key); return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}
function setStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function getShieldLevel(percent: number): ShieldLevel {
  if (percent >= 40) return "Elite Shield";
  if (percent >= 30) return "Fully Protected";
  if (percent >= 20) return "Smart Protected";
  return "Starter Shield";
}

function getBuddyMessage(percent: number, safeToSpend: number, streak: number, justUnlocked: boolean, justShielded: boolean, unlockReason: UnlockReason | null, protectedAmount: number): string {
  if (justShielded) return `Boom! RM${protectedAmount.toFixed(2)} protected before you even touched it. Buddy is proud of you! 🎉`;
  if (justUnlocked && unlockReason === "personalSpend") return `Buddy noticed you used shield money for personal spending. No stress — let's rebuild it next payday. 💪`;
  if (justUnlocked && unlockReason === "bigGoal") return `Nice! You used your shield money for a real goal. That's exactly what this vault is for. 🎯`;
  if (justUnlocked && unlockReason === "emergency") return `Hope everything is okay. Buddy will help you rebuild this vault once things settle down. 🤍`;
  if (streak >= 5) return `${streak} months of protection! You're on an incredible streak. Keep this up and your future self will thank you.`;
  if (percent >= 30) return `Strong protection active. RM${safeToSpend.toFixed(2)} is yours to spend — guilt-free, because savings are already locked.`;
  if (percent >= 20) return `Balanced protection active. Spend confidently — your savings are already secured before anything else.`;
  return `Starter protection active. Buddy is helping you save without making your spending feel tight.`;
}

function getMonthsToGoal(vaultBalance: number, protectedAmount: number, goalAmount: number): number | null {
  if (protectedAmount <= 0 || vaultBalance >= goalAmount) return null;
  return Math.ceil((goalAmount - vaultBalance) / protectedAmount);
}

const initialIncome: IncomeDeposit = { id: 1, type: "Salary", amount: 3000, date: "Today" };
const initialActivities: VaultActivity[] = [
  { id: 1, title: "Salary detected", description: "Buddy found a recurring income deposit and triggered Shield Vault.", amount: 3000, type: "bonus" },
  { id: 2, title: "Savings protected", description: "A portion of your salary was moved before spending started.", amount: 600, type: "shielded" },
];
const initialChallenges: ShieldChallenge[] = [
  { id: "streak3", title: "Hat Trick", description: "Protect 3 paydays in a row", target: 3, current: 3, reward: "Buddy Badge 🏅", completed: true },
  { id: "vault1000", title: "Four Digits", description: "Reach RM1,000 vault balance", target: 1000, current: 600, reward: "Elite Shield Frame ✨", completed: false },
  { id: "streak5", title: "Iron Will", description: "Protect 5 paydays in a row", target: 5, current: 3, reward: "Beast Mode Unlock 🔥", completed: false },
  { id: "nounlock", title: "Untouchable", description: "Go 1 month without unlocking", target: 1, current: 1, reward: "Payday Calm Bonus 💚", completed: true },
];

function BuddyShieldVault() {
  const router = useRouter();
  const [shieldEnabled, setShieldEnabled] = useState<boolean>(() => getStoredValue("gx_shield_enabled", true));
  const [mode, setMode] = useState<ShieldMode>(() => getStoredValue("gx_shield_mode", "balanced"));
  const [paydayCalm, setPaydayCalm] = useState<boolean>(() => getStoredValue("gx_payday_calm", true));
  const [income, setIncome] = useState<IncomeDeposit>(() => getStoredValue("gx_income_deposit", initialIncome));
  const [vaultBalance, setVaultBalance] = useState<number>(() => getStoredValue("gx_vault_balance", 600));
  const [streak, setStreak] = useState<number>(() => getStoredValue("gx_shield_streak", 3));
  const [shieldUsedThisCycle, setShieldUsedThisCycle] = useState<boolean>(() => getStoredValue("gx_shield_used_cycle", false));
  const [showSettings, setShowSettings] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("protect");
  const [unlockAmount, setUnlockAmount] = useState("");
  const [unlockReason, setUnlockReason] = useState<UnlockReason | null>(null);
  const [customUnlockReason, setCustomUnlockReason] = useState("");
  const [activities, setActivities] = useState<VaultActivity[]>(() => getStoredValue("gx_shield_activities", initialActivities));
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal>(() => getStoredValue("gx_shield_goal", PRESET_GOALS[0]));
  const [challenges, setChallenges] = useState<ShieldChallenge[]>(() => getStoredValue("gx_shield_challenges", initialChallenges));
  const [showPaydayCelebration, setShowPaydayCelebration] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [justShielded, setJustShielded] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  useEffect(() => setStoredValue("gx_shield_enabled", shieldEnabled), [shieldEnabled]);
  useEffect(() => setStoredValue("gx_shield_mode", mode), [mode]);
  useEffect(() => setStoredValue("gx_payday_calm", paydayCalm), [paydayCalm]);
  useEffect(() => setStoredValue("gx_income_deposit", income), [income]);
  useEffect(() => setStoredValue("gx_vault_balance", vaultBalance), [vaultBalance]);
  useEffect(() => setStoredValue("gx_shield_streak", streak), [streak]);
  useEffect(() => setStoredValue("gx_shield_used_cycle", shieldUsedThisCycle), [shieldUsedThisCycle]);
  useEffect(() => setStoredValue("gx_shield_activities", activities), [activities]);
  useEffect(() => setStoredValue("gx_shield_goal", selectedGoal), [selectedGoal]);
  useEffect(() => setStoredValue("gx_shield_challenges", challenges), [challenges]);

  const basePercent = SHIELD_PERCENT[mode];
  const effectivePercent = paydayCalm && shieldEnabled ? Math.min(basePercent + 5, 45) : basePercent;
  const shieldLevel = getShieldLevel(effectivePercent);
  const protectedAmount = shieldEnabled ? parseFloat(((income.amount * effectivePercent) / 100).toFixed(2)) : 0;
  const safeToSpend = shieldEnabled ? parseFloat((income.amount - protectedAmount).toFixed(2)) : income.amount;
  const projectedYearlyProtection = parseFloat((protectedAmount * 12).toFixed(2));
  const goalProgress = Math.min(100, (vaultBalance / selectedGoal.targetAmount) * 100);
  const monthsToGoal = getMonthsToGoal(vaultBalance, protectedAmount, selectedGoal.targetAmount);
  const buddyMessage = getBuddyMessage(effectivePercent, safeToSpend, streak, justUnlocked, justShielded, unlockReason, protectedAmount);
  const healthScore = useMemo(() => Math.min(100, 45 + effectivePercent + streak * 5), [effectivePercent, streak]);
  const unlockPatterns = useMemo(() => {
    const counts: Record<UnlockReason, number> = { bigGoal: 0, emergency: 0, personalSpend: 0, other: 0 };
    activities.forEach((a) => { if (a.type === "unlock" && a.reason) counts[a.reason]++; });
    return counts;
  }, [activities]);
  const streakBroken = justUnlocked && activities[0]?.reason === "personalSpend";

  function runSalaryShield() {
    if (!shieldEnabled || shieldUsedThisCycle) return;
    const amountToProtect = parseFloat(((income.amount * effectivePercent) / 100).toFixed(2));
    const newBalance = parseFloat((vaultBalance + amountToProtect).toFixed(2));
    setVaultBalance(newBalance);
    setStreak((prev) => prev + 1);
    setJustShielded(true);
    setJustUnlocked(false);
    setShowPaydayCelebration(true);
    setShieldUsedThisCycle(true);
    setChallenges((prev) => prev.map((c) => {
      if (c.id === "streak3" || c.id === "streak5") { const next = Math.min(c.target, c.current + 1); return { ...c, current: next, completed: next >= c.target }; }
      if (c.id === "vault1000") { const next = Math.min(c.target, newBalance); return { ...c, current: next, completed: next >= c.target }; }
      return c;
    }));
    setActivities((prev) => [{ id: Date.now(), title: "Shield activated", description: `${effectivePercent}% of your ${income.type.toLowerCase()} protected automatically.`, amount: amountToProtect, type: "shielded" }, ...prev]);
    setTimeout(() => { setShowPaydayCelebration(false); setJustShielded(false); }, 3500);
  }

  function simulateNewSalary() { setShieldUsedThisCycle(false); setIncome((prev) => ({ ...prev, date: "Today" })); }

  function unlockFromVault() {
    const amount = parseFloat(unlockAmount);
    if (Number.isNaN(amount) || amount <= 0 || amount > vaultBalance || !unlockReason) return;
    setVaultBalance((prev) => parseFloat((prev - amount).toFixed(2)));
    const reasonText = customUnlockReason.trim();
    setUnlockAmount(""); setShowUnlock(false); setJustUnlocked(true); setJustShielded(false);
    if (unlockReason === "personalSpend") { setStreak(0); setChallenges((prev) => prev.map((c) => c.id === "nounlock" ? { ...c, current: 0, completed: false } : c)); }
    setActivities((prev) => [{
      id: Date.now(),
      title: "Shield money used",
      description:
        unlockReason === "personalSpend"
          ? "Used for personal spending. Streak paused — rebuild next payday!"
          : unlockReason === "bigGoal"
          ? `Used for a big goal${reasonText ? `: ${reasonText}` : "."}`
          : unlockReason === "emergency"
          ? `Emergency withdrawal${reasonText ? `: ${reasonText}` : ". Buddy has your back."}`
          : `Custom reason${reasonText ? `: ${reasonText}` : "."}`,
      amount,
      type: "unlock",
      reason: unlockReason,
      customReason: reasonText || undefined,
    }, ...prev]);
    setUnlockReason(null);
    setCustomUnlockReason("");
    setTimeout(() => setJustUnlocked(false), 5000);
  }

  function updateIncomeAmount(value: string) { const amount = parseFloat(value); setIncome((prev) => ({ ...prev, amount: Number.isNaN(amount) ? 0 : amount })); }

  return (
    <AppShell>
      {/* Payday Celebration */}
      <AnimatePresence>
        {showPaydayCelebration && (
          <motion.div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", damping: 18, stiffness: 300 }} className="bg-card border border-primary/30 rounded-3xl p-6 shadow-2xl text-center mx-8">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.6, delay: 0.2 }} className="text-5xl mb-3">🎉</motion.div>
              <p className="text-lg font-extrabold text-primary">Salary Shielded!</p>
              <p className="text-2xl font-extrabold mt-1">RM {protectedAmount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">protected before spending started</p>
              <div className="mt-3 flex justify-center gap-2"><Badge className="bg-accent/15 text-accent border-0">🔥 {streak + 1} month streak</Badge></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <button 
          onClick={() => router.history.back()} 
          className="text-sm text-primary font-medium flex items-center mb-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          ← Back
        </button>
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-2xl font-extrabold tracking-tight">Salary Shield</h1><p className="text-sm text-muted-foreground">Protect salary before spending starts.</p></div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(true)} className="h-11 w-11 rounded-2xl bg-secondary grid place-items-center shadow-card shrink-0"><Settings className="h-5 w-5" /></motion.button>
        </div>
      </div>

      {/* Vault card */}
      <section className="px-5 pb-4">
        <Card className="p-5 rounded-3xl border-0 shadow-card bg-gradient-to-br from-[oklch(0.35_0.13_275)] to-[oklch(0.18_0.06_275)] relative overflow-hidden">
          <div aria-hidden className="absolute -top-10 -right-8 h-36 w-36 rounded-full bg-primary/25 blur-2xl" />
          <div aria-hidden className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Salary Shield Balance</p>
              <motion.p key={vaultBalance} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-4xl font-extrabold mt-1 tracking-tight">RM {vaultBalance.toFixed(2)}</motion.p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Badge className="bg-primary/20 text-primary border-0">{shieldLevel}</Badge>
                <Badge className="bg-accent/15 text-accent border-0">{effectivePercent}% Shield</Badge>
                {streak > 0 && <Badge className="bg-orange-500/20 text-orange-400 border-0">🔥 {streak}mo streak</Badge>}
              </div>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-primary/20 grid place-items-center shrink-0"><ShieldCheck className="h-7 w-7 text-primary" /></div>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-background/10 p-3"><p className="text-[10px] text-muted-foreground">Income</p><p className="text-sm font-extrabold">RM {income.amount.toFixed(2)}</p></div>
            <div className="rounded-2xl bg-background/10 p-3"><p className="text-[10px] text-muted-foreground">Protected</p><p className="text-sm font-extrabold text-accent">RM {protectedAmount.toFixed(2)}</p></div>
            <div className="rounded-2xl bg-background/10 p-3"><p className="text-[10px] text-muted-foreground">Safe Spend</p><p className="text-sm font-extrabold">RM {safeToSpend.toFixed(2)}</p></div>
          </div>
          <div className="relative mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <button onClick={() => setShowGoalPicker(true)} className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                <span>{selectedGoal.emoji}</span><span>{selectedGoal.name}</span><ChevronRight className="h-3 w-3" />
              </button>
              <span className="text-[11px] text-muted-foreground">RM {vaultBalance.toFixed(0)} / RM {selectedGoal.targetAmount.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-background/20 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${goalProgress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-accent" />
            </div>
            {monthsToGoal && <p className="text-[10px] text-muted-foreground mt-1">📅 {monthsToGoal} month{monthsToGoal !== 1 ? "s" : ""} to reach goal at current rate</p>}
            {vaultBalance >= selectedGoal.targetAmount && <p className="text-[10px] text-accent mt-1 font-bold">🎯 Goal reached! Set a new one.</p>}
          </div>
        </Card>
      </section>

      {/* Buddy advice */}
      <section className="px-5 pb-4">
        <Card className={`rounded-2xl border-0 shadow-card p-4 border ${streakBroken ? "border-destructive/30" : "border-primary/20"}`}>
          <div className="flex items-center gap-3">
           
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-sm font-bold ${streakBroken ? "text-destructive" : "text-primary"}`}>{streakBroken ? "Streak Reset 💔" : "Buddy Protection"}</p>
                {paydayCalm && !streakBroken && <Badge className="text-[10px] bg-accent/15 text-accent border-0">Payday Calm +5%</Badge>}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{buddyMessage}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Section tabs */}
      <section className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-secondary/50 p-1">
          {([
            { key: "protect", label: "Protect", Icon: ShieldCheck },
            { key: "insights", label: "Insights", Icon: TrendingUp },
            { key: "unlock", label: "Unlock", Icon: Unlock },
          ] as { key: ActiveSection; label: string; Icon: typeof ShieldCheck }[]).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setActiveSection(key)} className={`rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 ${activeSection === key ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground"}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>
      </section>

      {/* PROTECT */}
      {activeSection === "protect" && (
        <>
          <section className="px-5 pb-4">
            <Card className="p-4 rounded-2xl border-0 shadow-card space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center"><Brain className="h-5 w-5 text-primary" /></div>
                  <div><p className="text-sm font-bold">Income Detected</p><p className="text-xs text-muted-foreground">{income.type} received • {income.date}</p></div>
                </div>
                <Badge className="bg-success/15 text-success border-0">Active</Badge>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Buddy will protect</p>
                  <p className="text-lg font-extrabold">RM {protectedAmount.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">toward {selectedGoal.emoji} {selectedGoal.name}</p>
                </div>
                {!shieldUsedThisCycle ? (
                  <motion.button whileTap={{ scale: 0.96 }} onClick={runSalaryShield} disabled={!shieldEnabled} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold disabled:opacity-40">
                    Run Shield
                  </motion.button>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <div className="rounded-xl bg-success/15 border border-success/25 px-3 py-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs font-bold text-success">Shielded</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-right">Resets next payday</p>
                  </div>
                )}
              </div>
              {shieldUsedThisCycle && (
                <button onClick={simulateNewSalary} className="w-full rounded-xl bg-secondary py-2 text-[11px] text-muted-foreground font-semibold">
                  Simulate new salary deposit →
                </button>
              )}
            </Card>
          </section>

          <section className="px-5 pb-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shield Mode</p>
              <p className="text-[11px] text-muted-foreground">Choose protection strength</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["chill", "balanced", "discipline", "beast"] as ShieldMode[]).map((key) => {
                const active = mode === key;
                return (
                  <button key={key} onClick={() => setMode(key)} className={`rounded-2xl p-4 text-left border transition-all ${active ? "bg-primary/15 border-primary/40 shadow-card" : "bg-card border-border/30"}`}>
                    <div className="flex items-center justify-between mb-2"><p className="text-sm font-extrabold">{MODE_LABEL[key]}</p>{active && <CheckCircle2 className="h-4 w-4 text-primary" />}</div>
                    <p className="text-xl font-extrabold text-primary">{SHIELD_PERCENT[key]}%</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{MODE_DESC[key]}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Shield Challenges — collapsible dropdown */}
          <section className="px-5 pb-4">
            <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
              <button onClick={() => setShowChallenges((v) => !v)} className="w-full p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/15 grid place-items-center"><Trophy className="h-5 w-5 text-accent" /></div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Shield Challenges</p>
                    <p className="text-xs text-muted-foreground">{challenges.filter((c) => c.completed).length}/{challenges.length} completed</p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${showChallenges ? "rotate-90" : ""}`} />
              </button>
              <AnimatePresence>
                {showChallenges && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-2">
                      {challenges.map((c) => {
                        const progress = Math.min(100, (c.current / c.target) * 100);
                        return (
                          <div key={c.id} className={`rounded-2xl p-3 border ${c.completed ? "bg-accent/10 border-accent/20" : "bg-card border-border/30"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  {c.completed ? <Trophy className="h-3.5 w-3.5 text-accent shrink-0" /> : <Star className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                                  <p className="text-sm font-bold">{c.title}</p>
                                </div>
                                <p className="text-[11px] text-muted-foreground">{c.description}</p>
                                {!c.completed && (
                                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-primary" />
                                  </div>
                                )}
                              </div>
                              <Badge className={`text-[10px] border-0 shrink-0 ${c.completed ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"}`}>{c.reward}</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </section>
        </>
      )}

      {/* INSIGHTS */}
      {activeSection === "insights" && (
        <>
          <section className="px-5 pb-4">
            <Card className="p-4 rounded-2xl border-0 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/15 grid place-items-center"><TrendingUp className="h-5 w-5 text-accent" /></div>
                  <div><p className="text-sm font-bold">Protection Health</p><p className="text-xs text-muted-foreground">Shield strength + streak</p></div>
                </div>
                <p className="text-xl font-extrabold text-accent">{healthScore}%</p>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${healthScore}%` }} className="h-full rounded-full bg-accent" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-secondary/40 p-3"><Flame className="h-4 w-4 text-primary mb-2" /><p className="text-lg font-extrabold">{streak} months</p><p className="text-[11px] text-muted-foreground">protection streak</p></div>
                <div className="rounded-2xl bg-secondary/40 p-3"><PiggyBank className="h-4 w-4 text-primary mb-2" /><p className="text-lg font-extrabold">RM {projectedYearlyProtection.toFixed(0)}</p><p className="text-[11px] text-muted-foreground">projected yearly</p></div>
              </div>
            </Card>
          </section>

          <section className="px-5 pb-4">
            <Card className="p-4 rounded-2xl border-0 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center"><Target className="h-5 w-5 text-primary" /></div>
                  <div><p className="text-sm font-bold">Saving Goal</p><p className="text-xs text-muted-foreground">{selectedGoal.emoji} {selectedGoal.name}</p></div>
                </div>
                <button onClick={() => setShowGoalPicker(true)} className="text-[11px] text-primary font-bold">Change</button>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${goalProgress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-primary" /></div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">RM {vaultBalance.toFixed(0)} saved</span>
                <span className="font-bold">{goalProgress.toFixed(0)}%</span>
                <span className="text-muted-foreground">RM {selectedGoal.targetAmount.toLocaleString()} goal</span>
              </div>
              {monthsToGoal && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">At this rate, you'll reach your goal in <span className="font-bold text-foreground">{monthsToGoal} month{monthsToGoal !== 1 ? "s" : ""}</span>. Keep shielding every payday!</p>
                </div>
              )}
            </Card>
          </section>

          <section className="px-5 pb-4">
            <Card className="p-4 rounded-2xl border-0 shadow-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><Zap className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm font-bold">Unlock Patterns</p><p className="text-xs text-muted-foreground">What you've used vault money for</p></div>
              </div>
              <div className="space-y-2">
                {UNLOCK_REASONS.map(({ key, label, Icon }) => {
                  const count = unlockPatterns[key];
                  const total = Object.values(unlockPatterns).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-secondary grid place-items-center shrink-0"><Icon className="h-3.5 w-3.5 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1"><p className="text-xs font-bold">{label}</p><p className="text-[11px] text-muted-foreground">{count}x ({pct}%)</p></div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${key === "personalSpend" ? "bg-destructive" : key === "bigGoal" ? "bg-primary" : "bg-accent"}`} style={{ width: `${pct}%` }} /></div>
                      </div>
                    </div>
                  );
                })}
                {Object.values(unlockPatterns).every((v) => v === 0) && <p className="text-xs text-muted-foreground text-center py-2">No unlocks yet — Buddy is impressed! 💪</p>}
              </div>
            </Card>
          </section>
        </>
      )}

      {/* UNLOCK */}
      {activeSection === "unlock" && (
        <>
          <section className="px-5 pb-4">
            <Card className="p-4 rounded-2xl border-0 shadow-card space-y-3">
              <button onClick={() => setShowUnlock((v) => !v)} className="w-full flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 grid place-items-center"><Unlock className="h-5 w-5 text-destructive" /></div>
                  <div><p className="text-sm font-bold">Use Shield Money</p><p className="text-xs text-muted-foreground">Your savings, your choice</p></div>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${showUnlock ? "rotate-90" : ""}`} />
              </button>
              <AnimatePresence>
                {showUnlock && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
                    <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex gap-2 items-start">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">Buddy will help you track why you use shield money, so your savings habit stays clear and easy.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Why are you unlocking?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {UNLOCK_REASONS.map(({ key, label, Icon }) => (
                          <button key={key} onClick={() => setUnlockReason(key)} className={`rounded-xl p-2.5 flex flex-col items-center gap-1.5 border transition-all text-center ${unlockReason === key ? key === "personalSpend" ? "bg-destructive/15 border-destructive/40" : "bg-primary/15 border-primary/40" : "bg-card border-border/30"}`}>
                            <Icon className={`h-4 w-4 ${unlockReason === key ? key === "personalSpend" ? "text-destructive" : "text-primary" : "text-muted-foreground"}`} />
                            <p className="text-[10px] font-bold leading-tight">{label}</p>
                            <p className="text-[9px] text-muted-foreground leading-tight">{UNLOCK_REASONS.find((r) => r.key === key)?.helper}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    {unlockReason === "personalSpend" && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 flex gap-2">
                        <HeartCrack className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">Personal spending will pause your <span className="font-bold text-destructive">{streak}-month streak</span>. You can rebuild it next payday.</p>
                      </motion.div>
                    )}
                    {unlockReason && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Reason / Note</p>
                        <input value={customUnlockReason} onChange={(e) => setCustomUnlockReason(e.target.value)} placeholder={unlockReason === "bigGoal" ? "Example: New laptop" : unlockReason === "emergency" ? "Example: Clinic / family need" : unlockReason === "personalSpend" ? "Example: Shopping / food / entertainment" : "Type your reason"} className="w-full rounded-xl bg-background px-3 py-2 text-xs outline-none border border-border/40" />
                      </div>
                    )}
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input value={unlockAmount} onChange={(e) => setUnlockAmount(e.target.value)} placeholder="Amount RM" type="number" min="1" className="rounded-xl bg-background px-3 py-2 text-xs outline-none border border-border/40" />
                      <button onClick={unlockFromVault} disabled={!unlockReason} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold disabled:opacity-40">Use Money</button>
                    </div>
                    {!unlockReason && <p className="text-[11px] text-muted-foreground text-center">Select a reason to unlock</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </section>

          <section className="px-5 pb-10">
            <Card className="p-4 rounded-2xl border-0 shadow-card">
              <button onClick={() => setShowActivity((v) => !v)} className="w-full flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><CalendarDays className="h-5 w-5 text-primary" /></div>
                  <div><p className="text-sm font-bold">Vault Activity</p><p className="text-xs text-muted-foreground">Recent protection history</p></div>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${showActivity ? "rotate-90" : ""}`} />
              </button>
              <AnimatePresence>
                {showActivity && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-4 space-y-3">
                    {activities.map((activity) => {
                      const isUnlock = activity.type === "unlock";
                      const Icon = isUnlock ? Unlock : activity.type === "shielded" ? LockKeyhole : Coins;
                      const reasonLabel =
                        activity.reason === "personalSpend" ? "✨ Personal Spend" :
                        activity.reason === "bigGoal" ? "🎯 Big Goal" :
                        activity.reason === "emergency" ? "🚨 Emergency" :
                        activity.reason === "other" ? "📝 Other" : null;
                      return (
                        <div key={activity.id} className="flex items-start justify-between gap-3 rounded-xl bg-secondary/40 p-3">
                          <div className="flex gap-3">
                            <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${isUnlock ? "bg-destructive/10" : "bg-primary/15"}`}><Icon className={`h-4 w-4 ${isUnlock ? "text-destructive" : "text-primary"}`} /></div>
                            <div>
                              <div className="flex items-center gap-2"><p className="text-sm font-bold">{activity.title}</p>{reasonLabel && <span className="text-[10px] text-muted-foreground">{reasonLabel}</span>}</div>
                              <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                            </div>
                          </div>
                          <p className={`text-xs font-extrabold shrink-0 ${isUnlock ? "text-destructive" : "text-accent"}`}>{isUnlock ? "-" : "+"}RM {activity.amount.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </section>
        </>
      )}

      {/* Goal Picker Modal */}
      <AnimatePresence>
        {showGoalPicker && (
          <motion.div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm px-5 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: "spring", damping: 24, stiffness: 260 }} className="w-full max-w-sm rounded-t-3xl bg-card shadow-card border border-border/40 p-5 pb-8 space-y-4">
              <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-muted" />
              <div className="flex items-center justify-between">
                <div><p className="text-lg font-extrabold">Choose a Goal</p><p className="text-xs text-muted-foreground">What are you saving toward?</p></div>
                <button onClick={() => setShowGoalPicker(false)} className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-2">
                {PRESET_GOALS.map((goal) => {
                  const active = selectedGoal.id === goal.id;
                  return (
                    <button key={goal.id} onClick={() => { setSelectedGoal(goal); setShowGoalPicker(false); }} className={`w-full rounded-2xl p-4 text-left border flex items-center justify-between transition-all ${active ? "bg-primary/15 border-primary/40" : "bg-secondary/40 border-border/30"}`}>
                      <div className="flex items-center gap-3"><span className="text-2xl">{goal.emoji}</span><div><p className="text-sm font-bold">{goal.name}</p><p className="text-xs text-muted-foreground">RM {goal.targetAmount.toLocaleString()} target</p></div></div>
                      {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm px-5 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 320 }} animate={{ y: 0 }} exit={{ y: 320 }} transition={{ type: "spring", damping: 24, stiffness: 260 }} className="w-full max-w-sm rounded-t-3xl bg-card shadow-card border border-border/40 p-5 pb-8 space-y-4 max-h-[86vh] overflow-y-auto">
              <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-muted" />
              <div className="flex items-center justify-between">
                <div><p className="text-lg font-extrabold">Shield Settings</p><p className="text-xs text-muted-foreground">Customize salary protection</p></div>
                <button onClick={() => setShowSettings(false)} className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><X className="h-4 w-4" /></button>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between">
                <div><p className="text-sm font-bold">Shield Vault</p><p className="text-xs text-muted-foreground">Protect salary automatically</p></div>
                <Switch checked={shieldEnabled} onCheckedChange={setShieldEnabled} />
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between">
                <div><p className="text-sm font-bold">Payday Calm Mode</p><p className="text-xs text-muted-foreground">Add +5% protection after payday</p></div>
                <Switch checked={paydayCalm} onCheckedChange={setPaydayCalm} disabled={!shieldEnabled} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Income Amount (RM)</p>
                <input value={income.amount} onChange={(e) => updateIncomeAmount(e.target.value)} type="number" min="0" className="w-full rounded-xl bg-background px-3 py-3 text-sm outline-none border border-border/40" />
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs text-muted-foreground">
                Buddy will protect <span className="font-bold text-foreground">RM {protectedAmount.toFixed(2)}</span> from your next {income.type.toLowerCase()} and leave <span className="font-bold text-foreground">RM {safeToSpend.toFixed(2)}</span> as safe spending money.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}