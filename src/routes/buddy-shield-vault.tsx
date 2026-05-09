import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, LockKeyhole, Unlock, Brain, CalendarDays, TrendingUp,
  AlertTriangle, CheckCircle2, ChevronRight, X, Settings, Flame, PiggyBank,
  Coins, Target, Trophy, Star, Zap, HeartCrack, Receipt,
  ShoppingBag, CalendarClock, ChevronDown, Wallet, BarChart3, ShieldOff,
} from "lucide-react";

export const Route = createFileRoute("/buddy-shield-vault")({
  head: () => ({
    meta: [
      { title: "Buddy Shield Vault — GX Buddy" },
      { name: "description", content: "Student money protection for PTPTN, scholarship, zakat, part-time work, and intern pay." },
    ],
  }),
  component: BuddyShieldVault,
});

type ShieldMode = "chill" | "balanced" | "discipline" | "beast";
type ShieldLevel = "Starter Shield" | "Smart Protected" | "Fully Protected" | "Elite Shield";
type IncomeType = "PTPTN" | "Scholarship" | "Zakat" | "Allowance" | "Intern Pay" | "Part-Time Work";
type ActiveSection = "shield" | "stats" | "vault";
type UnlockReason = "bigGoal" | "personalSpend" | "other";

interface SavingGoal { id: number; name: string; targetAmount: number; emoji: string; }
interface IncomeDeposit { id: number; type: IncomeType; amount: number; date: string; }
interface IncomeSource { id: number; type: IncomeType; amount: number; emoji: string; active: boolean; }
interface VaultActivity { id: number; title: string; description: string; amount: number; type: "shielded" | "unlock" | "bonus"; reason?: UnlockReason; customReason?: string; }
interface ShieldChallenge { id: string; title: string; description: string; target: number; current: number; xpReward: number; completed: boolean; xpClaimed: boolean; }

const SHIELD_PERCENT: Record<ShieldMode, number> = { chill: 10, balanced: 20, discipline: 30, beast: 40 };
const EMERGENCY_PERCENT: Record<ShieldMode, number> = { chill: 2, balanced: 5, discipline: 8, beast: 10 };
const RING_COLORS = ["#8B5CF6", "#22C55E", "#F59E0B", "#38BDF8", "#EC4899", "#A3E635"];
const MODE_LABEL: Record<ShieldMode, string> = { chill: "Chill Shield", balanced: "Steady Shield", discipline: "Focus Shield", beast: "Power Shield" };
const MODE_DESC: Record<ShieldMode, string> = {
  chill: "Light saving for pocket money or smaller deposits.",
  balanced: "Best default for PTPTN, scholarship, allowance, or intern pay.",
  discipline: "Stronger saving for students who want to reach goals faster.",
  beast: "Maximum saving for serious goal-focused months.",
};

const UNLOCK_REASONS: { key: UnlockReason; label: string; helper: string; Icon: typeof ShoppingBag }[] = [
  { key: "bigGoal", label: "Big Goal", helper: "Laptop, travel, investment", Icon: Target },
  { key: "personalSpend", label: "Personal Spend", helper: "Treats or extra spending", Icon: ShoppingBag },
  { key: "other", label: "Other", helper: "Custom reason", Icon: Receipt },
];

const PRESET_GOALS: SavingGoal[] = [
  { id: 1, name: "New Laptop", targetAmount: 3000, emoji: "💻" },
  { id: 2, name: "Study Speaker", targetAmount: 800, emoji: "🔊" },
  { id: 3, name: "iPad / Tablet", targetAmount: 2500, emoji: "📱" },
  { id: 4, name: "Travel Trip", targetAmount: 2000, emoji: "✈️" },
  { id: 5, name: "Camera Gear", targetAmount: 1800, emoji: "📷" },
  { id: 6, name: "Investment Starter", targetAmount: 5000, emoji: "📈" },
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
  if (streak >= 5) return `${streak} months of protection! You're on an incredible streak. Keep this up and your future self will thank you.`;
  if (percent >= 30) return `Strong protection active. RM${safeToSpend.toFixed(2)} is yours to spend — guilt-free.`;
  if (percent >= 20) return `Balanced protection active. Spend confidently — your savings are already secured.`;
  return `Starter protection active. Buddy is helping you save without making spending feel tight.`;
}

function getMonthsToGoal(vaultBalance: number, protectedAmount: number, goalAmount: number): number | null {
  if (protectedAmount <= 0 || vaultBalance >= goalAmount) return null;
  return Math.ceil((goalAmount - vaultBalance) / protectedAmount);
}

// SVG Pie Chart Component
function PieChart({ sources, colors, size = 100 }: { sources: { amount: number; color: string; label: string }[]; colors: string[]; size?: number }) {
  const total = sources.reduce((s, x) => s + x.amount, 0);
  if (total <= 0) return <div className="rounded-full bg-muted" style={{ width: size, height: size }} />;

  let cumulative = 0;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;

  const slices = sources.map((src, i) => {
    const pct = src.amount / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    return { path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, color: colors[i % colors.length] };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((slice, i) => (
        <path key={i} d={slice.path} fill={slice.color} stroke="transparent" strokeWidth={1.5} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.52} fill="var(--background)" />
    </svg>
  );
}

function SafetyBufferCard({ emergencyBufferBalance, onWithdraw }: { emergencyBufferBalance: number; onWithdraw: (amount: number) => void }) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [error, setError] = useState("");

  function handleWithdraw() {
    const amount = parseFloat(withdrawAmount);
    if (Number.isNaN(amount) || amount <= 0) { setError("Enter a valid amount."); return; }
    if (amount > emergencyBufferBalance) { setError(`Max available is RM${emergencyBufferBalance.toFixed(2)}.`); return; }
    onWithdraw(amount);
    setWithdrawAmount("");
    setError("");
    setShowWithdraw(false);
  }

  return (
    <Card className="p-4 rounded-2xl border-0 shadow-card">
      <div className="flex items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center"><ShieldCheck className="h-4 w-4 text-primary" /></div>
          <div>
            <p className="text-sm font-bold">Safety Buffer</p>
            <p className="text-[11px] text-muted-foreground">For genuine emergencies only</p>
          </div>
        </div>
        <p className="text-lg font-extrabold text-primary">RM{emergencyBufferBalance.toFixed(2)}</p>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (emergencyBufferBalance / 500) * 100)}%` }} />
      </div>

      <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
        Automatically set aside for real emergencies — medical, urgent transport, family needs. Separate from your goal savings.
      </p>

      <button
        onClick={() => { setShowWithdraw((v) => !v); setError(""); setWithdrawAmount(""); }}
        className={`w-full rounded-xl py-2.5 text-xs font-bold border transition-all flex items-center justify-center gap-2 ${showWithdraw ? "bg-destructive/15 border-destructive/40 text-destructive" : "bg-secondary border-border/30 text-muted-foreground"}`}
      >
        <Unlock className="h-3.5 w-3.5" />
        {showWithdraw ? "Cancel Withdrawal" : "Withdraw from Buffer"}
      </button>

      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2.5">
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 flex gap-2 items-start">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground">Only withdraw for real emergencies. This is your safety net.</p>
              </div>

              <div className="rounded-xl bg-secondary/40 p-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Available to withdraw</p>
                <p className="text-sm font-extrabold text-primary">RM{emergencyBufferBalance.toFixed(2)}</p>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">RM</span>
                <input
                  value={withdrawAmount}
                  onChange={(e) => { setWithdrawAmount(e.target.value); setError(""); }}
                  placeholder="0.00"
                  type="number"
                  min="1"
                  max={emergencyBufferBalance}
                  className="w-full rounded-xl bg-background pl-8 pr-3 py-2.5 text-sm font-bold outline-none border border-border/40 focus:border-destructive/50"
                />
              </div>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                {[50, 100, emergencyBufferBalance].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => { setWithdrawAmount(preset.toFixed(2)); setError(""); }}
                    disabled={preset > emergencyBufferBalance}
                    className="rounded-lg bg-secondary py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    {preset === emergencyBufferBalance ? "All" : `RM${preset}`}
                  </button>
                ))}
              </div>

              {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}

              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="w-full rounded-xl bg-destructive text-white py-2.5 text-xs font-bold disabled:opacity-40 transition-opacity"
              >
                Confirm Withdrawal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

const initialIncome: IncomeDeposit = { id: 1, type: "Scholarship", amount: 3000, date: "Today" };
const initialIncomeSources: IncomeSource[] = [
  { id: 1, type: "PTPTN", amount: 1500, emoji: "🎓", active: true },
  { id: 2, type: "Scholarship", amount: 1000, emoji: "🏅", active: true },
  { id: 3, type: "Zakat", amount: 300, emoji: "🤲", active: true },
  { id: 4, type: "Part-Time Work", amount: 450, emoji: "💼", active: true },
  { id: 5, type: "Allowance", amount: 250, emoji: "💜", active: true },
  { id: 6, type: "Intern Pay", amount: 0, emoji: "🧑‍💻", active: false },
];
const initialActivities: VaultActivity[] = [
  { id: 1, title: "Student money detected", description: "Buddy found money from PTPTN, scholarship, zakat, and part-time work.", amount: 3500, type: "bonus" },
  { id: 2, title: "Money protected", description: "A portion was saved for your goal and safety buffer before spending started.", amount: 600, type: "shielded" },
];
const initialChallenges: ShieldChallenge[] = [
  { id: "streak3", title: "3-Income Streak", description: "Shield 3 student income deposits in a row", target: 3, current: 3, xpReward: 120, completed: true, xpClaimed: true },
  { id: "vault1000", title: "RM1K Shield", description: "Reach RM1,000 total shield balance", target: 1000, current: 600, xpReward: 200, completed: false, xpClaimed: false },
  { id: "streak5", title: "Focus Saver", description: "Shield 5 deposits without breaking the habit", target: 5, current: 3, xpReward: 250, completed: false, xpClaimed: false },
  { id: "nounlock", title: "Safe Zone", description: "Go 1 cycle without using shield money for personal spend", target: 1, current: 1, xpReward: 150, completed: true, xpClaimed: true },
];

function BuddyShieldVault() {
  const router = useRouter();
  const [shieldEnabled, setShieldEnabled] = useState<boolean>(() => getStoredValue("gx_shield_enabled", true));
  const [mode, setMode] = useState<ShieldMode>(() => getStoredValue("gx_shield_mode", "balanced"));
  const [paydayCalm, setPaydayCalm] = useState<boolean>(() => getStoredValue("gx_payday_calm", true));
  const [income, setIncome] = useState<IncomeDeposit>(() => getStoredValue("gx_income_deposit", initialIncome));
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(() => getStoredValue("gx_income_sources", initialIncomeSources));
  const [vaultBalance, setVaultBalance] = useState<number>(() => getStoredValue("gx_vault_balance", 450));
  const [emergencyBufferBalance, setEmergencyBufferBalance] = useState<number>(() => getStoredValue("gx_emergency_buffer_balance", 150));
  const [streak, setStreak] = useState<number>(() => getStoredValue("gx_shield_streak", 3));
  const [shieldUsedThisCycle, setShieldUsedThisCycle] = useState<boolean>(() => getStoredValue("gx_shield_used_cycle", false));
  const [showSettings, setShowSettings] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("shield");
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
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [shieldXp, setShieldXp] = useState<number>(() => getStoredValue("gx_shield_xp", 310));

  useEffect(() => setStoredValue("gx_shield_enabled", shieldEnabled), [shieldEnabled]);
  useEffect(() => setStoredValue("gx_shield_mode", mode), [mode]);
  useEffect(() => setStoredValue("gx_payday_calm", paydayCalm), [paydayCalm]);
  useEffect(() => setStoredValue("gx_income_deposit", income), [income]);
  useEffect(() => setStoredValue("gx_income_sources", incomeSources), [incomeSources]);
  useEffect(() => setStoredValue("gx_vault_balance", vaultBalance), [vaultBalance]);
  useEffect(() => setStoredValue("gx_emergency_buffer_balance", emergencyBufferBalance), [emergencyBufferBalance]);
  useEffect(() => setStoredValue("gx_shield_streak", streak), [streak]);
  useEffect(() => setStoredValue("gx_shield_used_cycle", shieldUsedThisCycle), [shieldUsedThisCycle]);
  useEffect(() => setStoredValue("gx_shield_activities", activities), [activities]);
  useEffect(() => setStoredValue("gx_shield_goal", selectedGoal), [selectedGoal]);
  useEffect(() => setStoredValue("gx_shield_challenges", challenges), [challenges]);
  useEffect(() => setStoredValue("gx_shield_xp", shieldXp), [shieldXp]);

  const activeIncomeSources = incomeSources.filter((s) => s.active && s.amount > 0);
  const totalIncome = parseFloat(activeIncomeSources.reduce((sum, s) => sum + s.amount, 0).toFixed(2));
  const sourceSummary = activeIncomeSources.length > 0 ? activeIncomeSources.map((s) => s.type).join(", ") : "student money";

  const basePercent = SHIELD_PERCENT[mode];
  const effectivePercent = paydayCalm && shieldEnabled ? Math.min(basePercent + 5, 45) : basePercent;
  const shieldLevel = getShieldLevel(effectivePercent);
  const protectedAmount = shieldEnabled ? parseFloat(((totalIncome * effectivePercent) / 100).toFixed(2)) : 0;
  const emergencyPercent = shieldEnabled ? (paydayCalm ? Math.min(EMERGENCY_PERCENT[mode] + 1, 12) : EMERGENCY_PERCENT[mode]) : 0;
  const emergencyBufferAmount = shieldEnabled ? parseFloat(((totalIncome * emergencyPercent) / 100).toFixed(2)) : 0;
  const goalProtectedAmount = shieldEnabled ? parseFloat((protectedAmount - emergencyBufferAmount).toFixed(2)) : 0;
  const safeToSpend = shieldEnabled ? parseFloat((totalIncome - protectedAmount).toFixed(2)) : totalIncome;
  const totalShieldBalance = parseFloat((vaultBalance + emergencyBufferBalance).toFixed(2));
  const availableForUnlock = vaultBalance;
  const projectedYearlyProtection = parseFloat((protectedAmount * 12).toFixed(2));
  const goalProgress = Math.min(100, (vaultBalance / selectedGoal.targetAmount) * 100);
  const monthsToGoal = getMonthsToGoal(vaultBalance, goalProtectedAmount, selectedGoal.targetAmount);
  const buddyMessage = getBuddyMessage(effectivePercent, safeToSpend, streak, justUnlocked, justShielded, unlockReason, protectedAmount);
  const healthScore = useMemo(() => Math.min(100, 45 + effectivePercent + streak * 5), [effectivePercent, streak]);
  const unlockPatterns = useMemo(() => {
    const counts: Record<UnlockReason, number> = { bigGoal: 0, personalSpend: 0, other: 0 };
    activities.forEach((a) => { if (a.type === "unlock" && a.reason) counts[a.reason]++; });
    return counts;
  }, [activities]);
  const streakBroken = justUnlocked && activities[0]?.reason === "personalSpend";

  // Pie chart data: goal saved + emergency buffer + safe to spend
  const pieData = useMemo(() => [
    { label: "Goal Saved", amount: goalProtectedAmount, color: "#8B5CF6" },
    { label: "Safety Buffer", amount: emergencyBufferAmount, color: "#22C55E" },
    { label: "Safe to Spend", amount: safeToSpend, color: "#38BDF8" },
  ].filter((d) => d.amount > 0), [goalProtectedAmount, emergencyBufferAmount, safeToSpend]);

  const incomeChartData = useMemo(() =>
    activeIncomeSources.map((s, i) => ({ label: s.type, amount: s.amount, color: RING_COLORS[i % RING_COLORS.length] })),
    [activeIncomeSources]
  );

  function runShield() {
    if (!shieldEnabled || shieldUsedThisCycle) return;
    const amountToProtect = parseFloat(((totalIncome * effectivePercent) / 100).toFixed(2));
    const amountForEmergency = parseFloat(((totalIncome * emergencyPercent) / 100).toFixed(2));
    const amountForGoal = parseFloat((amountToProtect - amountForEmergency).toFixed(2));
    const newBalance = parseFloat((vaultBalance + amountForGoal).toFixed(2));
    const newEmergencyBalance = parseFloat((emergencyBufferBalance + amountForEmergency).toFixed(2));
    setVaultBalance(newBalance);
    setEmergencyBufferBalance(newEmergencyBalance);
    setStreak((prev) => prev + 1);
    setJustShielded(true);
    setJustUnlocked(false);
    setShowPaydayCelebration(true);
    setShieldUsedThisCycle(true);
    setChallenges((prev) => prev.map((c) => {
      let nextCurrent = c.current;
      if (c.id === "streak3" || c.id === "streak5") nextCurrent = Math.min(c.target, c.current + 1);
      if (c.id === "vault1000") nextCurrent = Math.min(c.target, parseFloat((newBalance + newEmergencyBalance).toFixed(2)));
      const nowCompleted = nextCurrent >= c.target;
      if (nowCompleted && !c.xpClaimed) {
        setShieldXp((xp) => xp + (c.xpReward ?? 100));
        return { ...c, current: nextCurrent, completed: true, xpClaimed: true };
      }
      return { ...c, current: nextCurrent, completed: nowCompleted };
    }));
    setActivities((prev) => [{ id: Date.now(), title: "Shield activated", description: `Goal RM${amountForGoal.toFixed(2)} + safety buffer RM${amountForEmergency.toFixed(2)} protected from your student money (${sourceSummary}).`, amount: amountToProtect, type: "shielded" }, ...prev]);
    setTimeout(() => { setShowPaydayCelebration(false); setJustShielded(false); }, 3500);
  }

  function simulateNewIncome() { setShieldUsedThisCycle(false); setIncome((prev) => ({ ...prev, date: "Today" })); }

  function unlockFromVault() {
    const amount = parseFloat(unlockAmount);
    if (Number.isNaN(amount) || amount <= 0 || !unlockReason) return;
    if (amount > availableForUnlock) return;
    setVaultBalance((prev) => parseFloat((prev - amount).toFixed(2)));
    const reasonText = customUnlockReason.trim();
    setUnlockAmount(""); setShowUnlock(false); setJustUnlocked(true); setJustShielded(false);
    if (unlockReason === "personalSpend") { setStreak(0); setChallenges((prev) => prev.map((c) => c.id === "nounlock" ? { ...c, current: 0, completed: false, xpClaimed: false } : c)); }
    setActivities((prev) => [{
      id: Date.now(),
      title: "Shield money used",
      description:
        unlockReason === "personalSpend"
          ? "Used for personal spending. Streak paused — rebuild next payday!"
          : unlockReason === "bigGoal"
          ? `Used for a big goal${reasonText ? `: ${reasonText}` : "."}`
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

  function updateIncomeSourceAmount(id: number, value: string) {
    const amount = parseFloat(value);
    setIncomeSources((prev) => prev.map((source) => source.id === id ? { ...source, amount: Number.isNaN(amount) ? 0 : amount, active: !Number.isNaN(amount) && amount > 0 } : source));
  }

  function toggleIncomeSource(id: number) {
    setIncomeSources((prev) => prev.map((source) => source.id === id ? { ...source, active: !source.active } : source));
  }

  return (
    <AppShell>
      {/* Payday Celebration */}
      <AnimatePresence>
        {showPaydayCelebration && (
          <motion.div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", damping: 18, stiffness: 300 }} className="bg-card border border-primary/30 rounded-3xl p-6 shadow-2xl text-center mx-8">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.6, delay: 0.2 }} className="text-5xl mb-3">🎉</motion.div>
              <p className="text-lg font-extrabold text-primary">Money Shielded!</p>
              <p className="text-2xl font-extrabold mt-1">RM {protectedAmount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">protected before spending started</p>
              <div className="mt-3 flex justify-center gap-2"><Badge className="bg-accent/15 text-accent border-0">🔥 {streak + 1} month streak</Badge></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <button onClick={() => router.history.back()} className="text-sm text-primary font-medium flex items-center mb-2 cursor-pointer hover:opacity-80 transition-opacity">
          ← Back
        </button>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Buddy Shield Vault</h1>
            <p className="text-xs text-muted-foreground">Protect PTPTN, scholarship, zakat & part-time pay</p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(true)} className="h-10 w-10 rounded-2xl bg-secondary grid place-items-center shadow-card shrink-0">
            <Settings className="h-4.5 w-4.5" />
          </motion.button>
        </div>
      </div>

      {/* ── DASHBOARD CARD ── */}
      <section className="px-5 pb-3">
        <Card className="rounded-3xl border-0 shadow-card bg-gradient-to-br from-[oklch(0.35_0.13_275)] to-[oklch(0.18_0.06_275)] relative overflow-hidden p-4">
          <div aria-hidden className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/25 blur-2xl" />
          <div aria-hidden className="absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />

          {/* Top row: total + shield info */}
          <div className="relative flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Shielded</p>
              <motion.p key={totalShieldBalance} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-3xl font-extrabold tracking-tight">RM {totalShieldBalance.toFixed(2)}</motion.p>
              <div className="mt-1.5 flex gap-1.5 flex-wrap">
                <Badge className="bg-primary/20 text-primary border-0 text-[10px]">{shieldLevel}</Badge>
                <Badge className="bg-accent/15 text-accent border-0 text-[10px]">{effectivePercent}% Shield</Badge>
                {streak > 0 && <Badge className="bg-orange-500/20 text-orange-400 border-0 text-[10px]">🔥 {streak}mo</Badge>}
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/20 grid place-items-center shrink-0">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Goal + Emergency Buffer cards */}
          <div className="relative grid grid-cols-2 gap-2 mb-4">
            {/* Goal Card */}
            <div className="rounded-2xl bg-background/15 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="h-3.5 w-3.5 text-accent" />
                <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Goal Fund</p>
              </div>
              <p className="text-xl font-extrabold">RM {vaultBalance.toFixed(0)}</p>
              <button onClick={() => setShowGoalPicker(true)} className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-muted-foreground">{selectedGoal.emoji} {selectedGoal.name}</span>
                <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
              {/* mini progress bar */}
              <div className="mt-2 h-1 rounded-full bg-background/20 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${goalProgress}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-accent" />
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">{goalProgress.toFixed(0)}% of RM{selectedGoal.targetAmount.toLocaleString()}</p>
            </div>

            {/* Emergency Buffer Card */}
            <div className="rounded-2xl bg-background/15 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Safety Buffer</p>
              </div>
              <p className="text-xl font-extrabold">RM {emergencyBufferBalance.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Emergency use only</p>
              <div className="mt-2 h-1 rounded-full bg-background/20 overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (emergencyBufferBalance / 500) * 100)}%` }} />
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">Next: +RM{emergencyBufferAmount.toFixed(0)}</p>
            </div>
          </div>

          {/* Pie chart + income breakdown */}
          <div className="relative rounded-2xl bg-background/10 p-3">
            <div className="flex items-center gap-3">
              {/* Pie chart: money split */}
              <div className="relative shrink-0">
                <PieChart sources={pieData} colors={pieData.map(d => d.color)} size={84} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[8px] text-muted-foreground leading-tight">Total</p>
                    <p className="text-[11px] font-extrabold leading-tight">RM{totalIncome.toFixed(0)}</p>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-1.5 min-w-0">
                {pieData.map((d) => (
                  <div key={d.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <p className="text-[10px] text-muted-foreground truncate">{d.label}</p>
                    </div>
                    <p className="text-[10px] font-bold shrink-0">RM{d.amount.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Income sources mini row */}
            {activeIncomeSources.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-white/10">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1.5">Income Sources</p>
                <div className="flex gap-1.5 flex-wrap">
                  {activeIncomeSources.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-1 rounded-lg bg-background/15 px-1.5 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: RING_COLORS[i % RING_COLORS.length] }} />
                      <span className="text-[9px] font-semibold">{s.emoji} RM{s.amount.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Safe to spend highlight */}
          <div className="relative mt-2 rounded-xl bg-background/10 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">Safe to Spend</p>
            </div>
            <p className="text-sm font-extrabold">RM {safeToSpend.toFixed(2)}</p>
          </div>
        </Card>
      </section>

      {/* Buddy advice — compact */}
      <section className="px-5 pb-3">
        <Card className={`rounded-2xl border-0 shadow-card px-4 py-3 border ${streakBroken ? "border-destructive/30" : "border-primary/20"}`}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`text-xs font-bold ${streakBroken ? "text-destructive" : "text-primary"}`}>{streakBroken ? "Streak Reset 💔" : "Buddy says"}</p>
                {paydayCalm && !streakBroken && <Badge className="text-[9px] bg-accent/15 text-accent border-0 h-4">+5% Payday Calm</Badge>}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{buddyMessage}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Section tabs — renamed */}
      <section className="px-5 pb-3">
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-secondary/50 p-1">
          {([
            { key: "shield", label: "Shield", Icon: ShieldCheck },
            { key: "stats", label: "Stats", Icon: BarChart3 },
            { key: "vault", label: "Vault", Icon: Wallet },
          ] as { key: ActiveSection; label: string; Icon: typeof ShieldCheck }[]).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setActiveSection(key)} className={`rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${activeSection === key ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground"}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>
      </section>

      {/* ── SHIELD TAB ── */}
      {activeSection === "shield" && (
        <div className="px-5 pb-6 space-y-3">
          {/* Run Shield */}
          <Card className="p-4 rounded-2xl border-0 shadow-card">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center"><Brain className="h-4.5 w-4.5 text-primary" /></div>
                <div>
                  <p className="text-sm font-bold">Money Ring Detected</p>
                  <p className="text-[11px] text-muted-foreground">{activeIncomeSources.length} source{activeIncomeSources.length !== 1 ? "s" : ""} • {income.date}</p>
                </div>
              </div>
              <Badge className="bg-success/15 text-success border-0 text-[10px]">Active</Badge>
            </div>
            <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Buddy will protect</p>
                <p className="text-lg font-extrabold">RM {protectedAmount.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">Goal RM{goalProtectedAmount.toFixed(2)} · Buffer RM{emergencyBufferAmount.toFixed(2)}</p>
              </div>
              {!shieldUsedThisCycle ? (
                <motion.button whileTap={{ scale: 0.96 }} onClick={runShield} disabled={!shieldEnabled} className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-bold disabled:opacity-40 shrink-0">
                  Run Shield
                </motion.button>
              ) : (
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="rounded-xl bg-success/15 border border-success/25 px-3 py-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs font-bold text-success">Shielded</span>
                  </div>
                  <button onClick={simulateNewIncome} className="text-[10px] text-primary font-semibold">New income →</button>
                </div>
              )}
            </div>
          </Card>

          {/* Shield Mode picker */}
          <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
            <button onClick={() => setShowModeMenu((v) => !v)} className="w-full p-4 flex items-center justify-between text-left">
              <div>
                <p className="text-sm font-extrabold">{MODE_LABEL[mode]}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{effectivePercent}% shield · RM{emergencyBufferAmount.toFixed(2)} buffer</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-muted-foreground">Change</p>
                <ChevronDown className={`h-4 w-4 transition-transform ${showModeMenu ? "rotate-180" : ""}`} />
              </div>
            </button>
            <AnimatePresence>
              {showModeMenu && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-2">
                    {(["chill", "balanced", "discipline", "beast"] as ShieldMode[]).map((key) => {
                      const active = mode === key;
                      const totalPct = paydayCalm ? Math.min(SHIELD_PERCENT[key] + 5, 45) : SHIELD_PERCENT[key];
                      const emergencyPct = paydayCalm ? Math.min(EMERGENCY_PERCENT[key] + 1, 12) : EMERGENCY_PERCENT[key];
                      const totalAmt = shieldEnabled ? parseFloat(((totalIncome * totalPct) / 100).toFixed(2)) : 0;
                      const emergencyAmt = shieldEnabled ? parseFloat(((totalIncome * emergencyPct) / 100).toFixed(2)) : 0;
                      const goalAmt = parseFloat((totalAmt - emergencyAmt).toFixed(2));
                      return (
                        <button key={key} onClick={() => { setMode(key); setShowModeMenu(false); }} className={`w-full rounded-2xl p-3 text-left border transition-all ${active ? "bg-primary/15 border-primary/40" : "bg-secondary/40 border-border/30"}`}>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="text-sm font-extrabold">{MODE_LABEL[key]}</p>
                              <p className="text-[10px] text-muted-foreground">{MODE_DESC[key]}</p>
                            </div>
                            {active && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="rounded-xl bg-background/40 p-1.5"><p className="text-[9px] text-muted-foreground">Total</p><p className="text-xs font-extrabold">RM{totalAmt.toFixed(0)}</p></div>
                            <div className="rounded-xl bg-background/40 p-1.5"><p className="text-[9px] text-accent">Goal</p><p className="text-xs font-extrabold text-accent">RM{goalAmt.toFixed(0)}</p></div>
                            <div className="rounded-xl bg-background/40 p-1.5"><p className="text-[9px] text-primary">Buffer</p><p className="text-xs font-extrabold text-primary">RM{emergencyAmt.toFixed(0)}</p></div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Shield Missions */}
          <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
            <button onClick={() => setShowChallenges((v) => !v)} className="w-full p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-accent/15 grid place-items-center"><Trophy className="h-4 w-4 text-accent" /></div>
                <div className="text-left">
                  <p className="text-sm font-bold">Shield Missions</p>
                  <p className="text-[11px] text-muted-foreground">{shieldXp} XP · {challenges.filter((c) => c.completed).length}/{challenges.length} done</p>
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
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {c.completed ? <Trophy className="h-3 w-3 text-accent shrink-0" /> : <Star className="h-3 w-3 text-muted-foreground shrink-0" />}
                                <p className="text-xs font-bold">{c.title}</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{c.description}</p>
                              {!c.completed && (
                                <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-primary" />
                                </div>
                              )}
                            </div>
                            <Badge className={`text-[10px] border-0 shrink-0 ${c.completed ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"}`}>+{c.xpReward} XP</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      )}

      {/* ── STATS TAB ── */}
      {activeSection === "stats" && (
        <div className="px-5 pb-6 space-y-3">
          {/* Health + streak row */}
          <Card className="p-4 rounded-2xl border-0 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-accent/15 grid place-items-center"><TrendingUp className="h-4 w-4 text-accent" /></div>
                <div><p className="text-sm font-bold">Protection Health</p><p className="text-[11px] text-muted-foreground">Shield strength + streak</p></div>
              </div>
              <p className="text-xl font-extrabold text-accent">{healthScore}%</p>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
              <motion.div initial={{ width: 0 }} animate={{ width: `${healthScore}%` }} className="h-full rounded-full bg-accent" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-secondary/40 p-2.5 text-center"><Flame className="h-4 w-4 text-orange-400 mx-auto mb-1" /><p className="text-base font-extrabold">{streak}</p><p className="text-[10px] text-muted-foreground">streak</p></div>
              <div className="rounded-2xl bg-secondary/40 p-2.5 text-center"><PiggyBank className="h-4 w-4 text-primary mx-auto mb-1" /><p className="text-base font-extrabold">RM{projectedYearlyProtection.toFixed(0)}</p><p className="text-[10px] text-muted-foreground">yearly</p></div>
              <div className="rounded-2xl bg-secondary/40 p-2.5 text-center"><ShieldCheck className="h-4 w-4 text-primary mx-auto mb-1" /><p className="text-base font-extrabold">RM{emergencyBufferBalance.toFixed(0)}</p><p className="text-[10px] text-muted-foreground">buffer</p></div>
            </div>
          </Card>

          {/* Income pie + sources */}
          <Card className="p-4 rounded-2xl border-0 shadow-card">
            <p className="text-sm font-bold mb-3">Income Breakdown</p>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <PieChart sources={incomeChartData} colors={RING_COLORS} size={90} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[8px] text-muted-foreground">Total</p>
                    <p className="text-xs font-extrabold">RM{totalIncome.toFixed(0)}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                {activeIncomeSources.map((s, i) => {
                  const pct = totalIncome > 0 ? ((s.amount / totalIncome) * 100).toFixed(0) : "0";
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: RING_COLORS[i % RING_COLORS.length] }} />
                        <p className="text-[10px] truncate">{s.emoji} {s.type}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <p className="text-[10px] font-bold">RM{s.amount.toFixed(0)}</p>
                        <span className="text-[9px] text-muted-foreground">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Saving Goal */}
          <Card className="p-4 rounded-2xl border-0 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center"><Target className="h-4 w-4 text-primary" /></div>
                <div><p className="text-sm font-bold">Saving Goal</p><p className="text-[11px] text-muted-foreground">{selectedGoal.emoji} {selectedGoal.name}</p></div>
              </div>
              <button onClick={() => setShowGoalPicker(true)} className="text-[11px] text-primary font-bold">Change</button>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-1.5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${goalProgress}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-primary" />
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">RM{vaultBalance.toFixed(0)} saved</span>
              <span className="font-bold">{goalProgress.toFixed(0)}%</span>
              <span className="text-muted-foreground">RM{selectedGoal.targetAmount.toLocaleString()} goal</span>
            </div>
            {monthsToGoal && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-2.5 flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground">Reach goal in <span className="font-bold text-foreground">{monthsToGoal} month{monthsToGoal !== 1 ? "s" : ""}</span> at current rate</p>
              </div>
            )}
          </Card>

          {/* XP */}
          <Card className="p-4 rounded-2xl border-0 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-accent/15 grid place-items-center"><Trophy className="h-4 w-4 text-accent" /></div>
                <div><p className="text-sm font-bold">Rewards XP</p><p className="text-[11px] text-muted-foreground">From Shield Missions</p></div>
              </div>
              <p className="text-lg font-extrabold text-accent">{shieldXp} XP</p>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (shieldXp / 500) * 100)}%` }} className="h-full rounded-full bg-accent" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Claim rewards on the Rewards page.</p>
          </Card>

          {/* Unlock patterns */}
          <Card className="p-4 rounded-2xl border-0 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><Zap className="h-4 w-4 text-primary" /></div>
              <div><p className="text-sm font-bold">Spending Patterns</p><p className="text-[11px] text-muted-foreground">How you use protected money</p></div>
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
                      <div className="flex items-center justify-between mb-0.5"><p className="text-xs font-bold">{label}</p><p className="text-[10px] text-muted-foreground">{count}x ({pct}%)</p></div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${key === "personalSpend" ? "bg-destructive" : key === "bigGoal" ? "bg-primary" : "bg-accent"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {Object.values(unlockPatterns).every((v) => v === 0) && <p className="text-xs text-muted-foreground text-center py-1">No unlocks yet — Buddy is impressed! 💪</p>}
            </div>
          </Card>
        </div>
      )}

      {/* ── VAULT TAB ── */}
      {activeSection === "vault" && (
        <div className="px-5 pb-6 space-y-3">
          {/* Use Money */}
          <Card className="p-4 rounded-2xl border-0 shadow-card space-y-3">
            <button onClick={() => setShowUnlock((v) => !v)} className="w-full flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-destructive/10 grid place-items-center"><Unlock className="h-4 w-4 text-destructive" /></div>
                <div><p className="text-sm font-bold">Use Goal Money</p><p className="text-[11px] text-muted-foreground">RM{vaultBalance.toFixed(2)} available</p></div>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${showUnlock ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {showUnlock && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 flex gap-2 items-start">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground">Buddy tracks why you use shield money so your saving habit stays clear.</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Why are you using this?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {UNLOCK_REASONS.map(({ key, label, Icon }) => (
                        <button key={key} onClick={() => setUnlockReason(key)} className={`rounded-xl p-2.5 flex flex-col items-center gap-1 border transition-all text-center ${unlockReason === key ? key === "personalSpend" ? "bg-destructive/15 border-destructive/40" : "bg-primary/15 border-primary/40" : "bg-card border-border/30"}`}>
                          <Icon className={`h-4 w-4 ${unlockReason === key ? key === "personalSpend" ? "text-destructive" : "text-primary" : "text-muted-foreground"}`} />
                          <p className="text-[10px] font-bold leading-tight">{label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {unlockReason === "personalSpend" && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-destructive/10 border border-destructive/30 p-2.5 flex gap-2">
                      <HeartCrack className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted-foreground">This will pause your <span className="font-bold text-destructive">{streak}-month streak</span>. Rebuild next payday.</p>
                    </motion.div>
                  )}
                  {unlockReason && (
                    <input value={customUnlockReason} onChange={(e) => setCustomUnlockReason(e.target.value)} placeholder={unlockReason === "bigGoal" ? "e.g. New laptop" : unlockReason === "personalSpend" ? "e.g. Shopping / food" : "Type your reason"} className="w-full rounded-xl bg-background px-3 py-2 text-xs outline-none border border-border/40" />
                  )}
                  {unlockReason && (
                    <div className="rounded-xl bg-secondary/40 p-3 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Goal savings available</p>
                      <p className="text-sm font-extrabold">RM{availableForUnlock.toFixed(2)}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input value={unlockAmount} onChange={(e) => setUnlockAmount(e.target.value)} placeholder="Amount RM" type="number" min="1" max={availableForUnlock} className="rounded-xl bg-background px-3 py-2 text-xs outline-none border border-border/40" />
                    <button onClick={unlockFromVault} disabled={!unlockReason} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold disabled:opacity-40">Use</button>
                  </div>
                  {!unlockReason && <p className="text-[10px] text-muted-foreground text-center">Select a reason above</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Safety Buffer with withdraw */}
          <SafetyBufferCard
            emergencyBufferBalance={emergencyBufferBalance}
            onWithdraw={(amount) => {
              setEmergencyBufferBalance((prev) => parseFloat((prev - amount).toFixed(2)));
              setActivities((prev) => [{
                id: Date.now(),
                title: "Safety buffer used",
                description: `Emergency withdrawal of RM${amount.toFixed(2)} from safety buffer.`,
                amount,
                type: "unlock",
                reason: undefined,
              }, ...prev]);
            }}
          />

          {/* Activity */}
          <Card className="p-4 rounded-2xl border-0 shadow-card">
            <button onClick={() => setShowActivity((v) => !v)} className="w-full flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><CalendarDays className="h-4 w-4 text-primary" /></div>
                <div><p className="text-sm font-bold">Vault Activity</p><p className="text-[11px] text-muted-foreground">Recent protection history</p></div>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${showActivity ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {showActivity && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-3 space-y-2">
                  {activities.map((activity) => {
                    const isUnlock = activity.type === "unlock";
                    const Icon = isUnlock ? Unlock : activity.type === "shielded" ? LockKeyhole : Coins;
                    const reasonLabel =
                      activity.reason === "personalSpend" ? "✨ Personal" :
                      activity.reason === "bigGoal" ? "🎯 Big Goal" :
                      activity.reason === "other" ? "📝 Other" : null;
                    return (
                      <div key={activity.id} className="flex items-start justify-between gap-3 rounded-xl bg-secondary/40 p-2.5">
                        <div className="flex gap-2.5">
                          <div className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 ${isUnlock ? "bg-destructive/10" : "bg-primary/15"}`}><Icon className={`h-3.5 w-3.5 ${isUnlock ? "text-destructive" : "text-primary"}`} /></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold">{activity.title}</p>
                              {reasonLabel && <span className="text-[9px] text-muted-foreground">{reasonLabel}</span>}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{activity.description}</p>
                          </div>
                        </div>
                        <p className={`text-xs font-extrabold shrink-0 ${isUnlock ? "text-destructive" : "text-accent"}`}>{isUnlock ? "-" : "+"}RM{activity.amount.toFixed(2)}</p>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      )}

      {/* Goal Picker Modal */}
      <AnimatePresence>
        {showGoalPicker && (
          <motion.div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm px-5 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: "spring", damping: 24, stiffness: 260 }} className="w-full max-w-sm rounded-t-3xl bg-card shadow-card border border-border/40 p-5 pb-8 space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-muted" />
              <div className="flex items-center justify-between">
                <div><p className="text-base font-extrabold">Choose a Goal</p><p className="text-xs text-muted-foreground">What are you saving toward?</p></div>
                <button onClick={() => setShowGoalPicker(false)} className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-2">
                {PRESET_GOALS.map((goal) => {
                  const active = selectedGoal.id === goal.id;
                  return (
                    <button key={goal.id} onClick={() => { setSelectedGoal(goal); setShowGoalPicker(false); }} className={`w-full rounded-2xl p-3 text-left border flex items-center justify-between transition-all ${active ? "bg-primary/15 border-primary/40" : "bg-secondary/40 border-border/30"}`}>
                      <div className="flex items-center gap-2.5"><span className="text-xl">{goal.emoji}</span><div><p className="text-sm font-bold">{goal.name}</p><p className="text-[11px] text-muted-foreground">RM{goal.targetAmount.toLocaleString()} target</p></div></div>
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
            <motion.div initial={{ y: 320 }} animate={{ y: 0 }} exit={{ y: 320 }} transition={{ type: "spring", damping: 24, stiffness: 260 }} className="w-full max-w-sm rounded-t-3xl bg-card shadow-card border border-border/40 p-5 pb-8 space-y-3 max-h-[86vh] overflow-y-auto">
              <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-muted" />
              <div className="flex items-center justify-between">
                <div><p className="text-base font-extrabold">Shield Settings</p><p className="text-xs text-muted-foreground">Customize protection</p></div>
                <button onClick={() => setShowSettings(false)} className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><X className="h-4 w-4" /></button>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between">
                <div><p className="text-sm font-bold">Shield Vault</p><p className="text-xs text-muted-foreground">Auto-protect student money</p></div>
                <Switch checked={shieldEnabled} onCheckedChange={setShieldEnabled} />
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between">
                <div><p className="text-sm font-bold">Payday Calm Mode</p><p className="text-xs text-muted-foreground">+5% protection on payday</p></div>
                <Switch checked={paydayCalm} onCheckedChange={setPaydayCalm} disabled={!shieldEnabled} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Money Sources</p>
                  <p className="text-[10px] text-muted-foreground">Total RM{totalIncome.toFixed(2)}</p>
                </div>
                {incomeSources.map((source) => (
                  <div key={source.id} className="rounded-2xl bg-secondary/40 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <button onClick={() => toggleIncomeSource(source.id)} className="flex items-center gap-2 text-left">
                        <span className="text-base">{source.emoji}</span>
                        <div>
                          <p className="text-sm font-bold">{source.type}</p>
                          <p className="text-[10px] text-muted-foreground">{source.active ? "Included" : "Not included"}</p>
                        </div>
                      </button>
                      <Switch checked={source.active} onCheckedChange={() => toggleIncomeSource(source.id)} />
                    </div>
                    <input value={source.amount} onChange={(e) => updateIncomeSourceAmount(source.id, e.target.value)} type="number" min="0" className="w-full rounded-xl bg-background px-3 py-2 text-sm outline-none border border-border/40" />
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-[11px] text-muted-foreground">
                Buddy will protect <span className="font-bold text-foreground">RM{protectedAmount.toFixed(2)}</span> — including RM{emergencyBufferAmount.toFixed(2)} safety buffer — and leave <span className="font-bold text-foreground">RM{safeToSpend.toFixed(2)}</span> to spend.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
