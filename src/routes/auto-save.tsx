import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Coins, Vault, Calendar, Clock, CalendarDays, CheckCircle2, ChevronRight,
  TrendingUp, Info, Sparkles, X, ThumbsUp, Target, Brain,
  Lightbulb, Utensils, Moon, Wallet, Plus, Trash2, Settings, ReceiptText,
  Smartphone, Music, Film, ListChecks, ArrowLeft, ArrowRight, Zap,
  PieChart, Star, AlertCircle,
} from "lucide-react";
import { transactions, user } from "@/lib/data";

export const Route = createFileRoute("/auto-save")({
  head: () => ({
    meta: [
      { title: "Smart Auto-Save — GX Buddy" },
      { name: "description", content: "Round up your spare cents and watch them grow." },
    ],
  }),
  component: AutoSave,
});

type CollectFreq = "daily" | "weekly" | "monthly";
type RoundTo = 0.5 | 1;
type GoalPriority = "high" | "medium" | "low";
type GoalIconKey = "target" | "sparkles" | "star";
type BillIconKey = "phone" | "music" | "film" | "receipt";
type ActiveTab = "split" | "bills" | "goals" | "history";

interface RoundUpEntry { id: number; name: string; amount: number; roundUp: number; }
interface BuddySuggestion { roundTo: RoundTo; freq: CollectFreq; reason: string; hamsterMood: "happy" | "worried" | "sleepy"; tag: string; }
interface SavingGoal { id: number; name: string; target: number; saved: number; priority: GoalPriority; icon: GoalIconKey; }
interface BillReserve { id: number; name: string; amount: number; saved: number; dueInDays: number; icon: BillIconKey; enabled: boolean; }
interface AllocationResult { billAllocations: { id: number; name: string; amount: number }[]; goalAllocations: { id: number; name: string; amount: number }[]; totalBills: number; totalGoals: number; }
interface MoodSignal { label: string; message: string; icon: typeof Brain; severity: "gentle" | "warning" | "positive"; }

function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const s = window.localStorage.getItem(key); return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}
function setStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function calcRoundUp(amount: number, roundTo: RoundTo): number {
  const abs = Math.abs(amount);
  const ceiled = roundTo === 0.5 ? Math.ceil(abs * 2) / 2 : Math.ceil(abs);
  const diff = parseFloat((ceiled - abs).toFixed(2));
  return diff === 0 ? roundTo : diff;
}

function computeAllocation(total: number, bills: BillReserve[], goals: SavingGoal[]): AllocationResult {
  let remaining = total;
  const billAllocations: { id: number; name: string; amount: number }[] = [];
  const goalAllocations: { id: number; name: string; amount: number }[] = [];

  const activeBills = bills.filter((b) => b.enabled && b.saved < b.amount);
  if (activeBills.length > 0) {
    let billPool = remaining;
    const eachShare = parseFloat((billPool / activeBills.length).toFixed(2));
    for (const bill of activeBills) {
      const shortfall = parseFloat((bill.amount - bill.saved).toFixed(2));
      const alloc = parseFloat(Math.min(eachShare, shortfall, billPool).toFixed(2));
      if (alloc > 0) {
        billAllocations.push({ id: bill.id, name: bill.name, amount: alloc });
        billPool = parseFloat((billPool - alloc).toFixed(2));
        remaining = parseFloat((remaining - alloc).toFixed(2));
      }
    }
  }

  const priorityOrder: GoalPriority[] = ["high", "medium", "low"];
  const sortedGoals = [...goals].sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  for (const goal of sortedGoals) {
    if (remaining <= 0) break;
    const shortfall = parseFloat((goal.target - goal.saved).toFixed(2));
    if (shortfall <= 0) continue;
    const alloc = parseFloat(Math.min(remaining, shortfall).toFixed(2));
    goalAllocations.push({ id: goal.id, name: goal.name, amount: alloc });
    remaining = parseFloat((remaining - alloc).toFixed(2));
  }

  return {
    billAllocations, goalAllocations,
    totalBills: billAllocations.reduce((s, b) => s + b.amount, 0),
    totalGoals: goalAllocations.reduce((s, g) => s + g.amount, 0),
  };
}

function getBuddySuggestion(balance: number, income: number): BuddySuggestion {
  const ratio = balance / income;
  if (ratio >= 0.8) return { roundTo: 1, freq: "daily", reason: `Your balance (RM${balance.toLocaleString()}) is strong — rounding to the nearest RM1 and collecting daily will build savings faster without feeling it.`, hamsterMood: "happy", tag: "Aggressive Saver" };
  if (ratio >= 0.5) return { roundTo: 1, freq: "weekly", reason: `With RM${balance.toLocaleString()} in your balance, rounding to RM1 weekly is a smart middle ground.`, hamsterMood: "happy", tag: "Balanced" };
  if (ratio >= 0.3) return { roundTo: 0.5, freq: "weekly", reason: `Your balance is moderate at RM${balance.toLocaleString()}. Rounding to 50 sen weekly keeps savings gentle.`, hamsterMood: "sleepy", tag: "Gentle Save" };
  return { roundTo: 0.5, freq: "monthly", reason: `Balance is on the lower side (RM${balance.toLocaleString()}). Buddy suggests collecting just 50 sen round-ups monthly.`, hamsterMood: "worried", tag: "Conservative" };
}

function getAdaptiveSettings(balance: number, income: number): BuddySuggestion {
  const ratio = balance / income;
  if (ratio < 0.25) return { roundTo: 0.5, freq: "monthly", reason: "Adaptive AI reduced your round-up because your balance is close to the safety zone.", hamsterMood: "worried", tag: "Cash Flow Protection" };
  if (ratio < 0.45) return { roundTo: 0.5, freq: "weekly", reason: "Adaptive AI keeps your savings light before payday so you do not feel pressured.", hamsterMood: "sleepy", tag: "Gentle Mode" };
  return getBuddySuggestion(balance, income);
}

function getMoodSignals(): MoodSignal[] {
  const foodSpends = transactions.filter((t) => t.amount < 0 && /food|grab|cafe|coffee|tea|restaurant|mamak/i.test(t.name));
  const highSpends = transactions.filter((t) => Math.abs(t.amount) >= 50 && t.amount < 0);
  const signals: MoodSignal[] = [];
  if (foodSpends.length >= 2) signals.push({ label: "Food impulse pattern", message: "Buddy noticed repeated food/drink spending. Small round-ups from these can quietly grow your savings.", icon: Utensils, severity: "gentle" });
  if (highSpends.length >= 1) signals.push({ label: "Big spend alert", message: "You had a larger transaction this cycle. Buddy can keep round-ups gentle to avoid cash flow stress.", icon: Wallet, severity: "warning" });
  signals.push({ label: "Late-night protection", message: "If you usually spend late at night, Buddy can suggest a softer saving mode before bedtime.", icon: Moon, severity: "positive" });
  return signals;
}

const freqLabel: Record<CollectFreq, string> = { daily: "End of Day", weekly: "End of Week", monthly: "End of Month" };
const freqShort: Record<CollectFreq, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };
const goalIconMap: Record<GoalIconKey, typeof Target> = { target: Target, sparkles: Sparkles, star: Star };
const billIconMap: Record<BillIconKey, typeof ReceiptText> = { phone: Smartphone, music: Music, film: Film, receipt: ReceiptText };
const priorityColors: Record<GoalPriority, string> = { high: "text-rose-500", medium: "text-primary", low: "text-muted-foreground" };
const priorityBg: Record<GoalPriority, string> = { high: "bg-rose-500/8 border-rose-500/20", medium: "bg-primary/8 border-primary/20", low: "bg-muted/40 border-border/30" };
const priorityBarColor: Record<GoalPriority, string> = { high: "bg-rose-500", medium: "bg-primary", low: "bg-muted-foreground/60" };

// Urgency color for bills by due days
function billUrgencyColor(days: number) {
  if (days <= 2) return "text-rose-500";
  if (days <= 5) return "text-amber-500";
  return "text-emerald-500";
}
function billUrgencyBg(days: number) {
  if (days <= 2) return "bg-rose-500/10 border-rose-500/25";
  if (days <= 5) return "bg-amber-500/10 border-amber-500/25";
  return "bg-emerald-500/8 border-emerald-500/20";
}
function billBarColor(days: number) {
  if (days <= 2) return "bg-rose-500";
  if (days <= 5) return "bg-amber-500";
  return "bg-emerald-500";
}

const initialGoals: SavingGoal[] = [
  { id: 1, name: "New Shoes", target: 80, saved: 31, priority: "high", icon: "target" },
  { id: 2, name: "Treat Fund", target: 50, saved: 10, priority: "medium", icon: "sparkles" },
  { id: 3, name: "Gift Budget", target: 60, saved: 5, priority: "low", icon: "star" },
];

const initialBills: BillReserve[] = [
  { id: 1, name: "Phone Bill", amount: 60, saved: 35, dueInDays: 5, icon: "phone", enabled: true },
  { id: 2, name: "Spotify", amount: 15, saved: 10, dueInDays: 2, icon: "music", enabled: true },
  { id: 3, name: "Netflix", amount: 45, saved: 18, dueInDays: 9, icon: "film", enabled: true },
];

function AutoSave() {
  const router = useRouter();
  const suggestion = getBuddySuggestion(user.balance, user.income);
  const adaptiveSuggestion = getAdaptiveSettings(user.balance, user.income);
  const moodSignals = getMoodSignals();
  const lowBalanceMode = user.balance / user.income < 0.25;

  const [enabled, setEnabled] = useState<boolean>(() => getStoredValue("gx_enabled", !lowBalanceMode));
  const [roundTo, setRoundTo] = useState<RoundTo>(() => getStoredValue("gx_roundTo", 1));
  const [freq, setFreq] = useState<CollectFreq>(() => getStoredValue("gx_freq", "weekly"));
  const [collected, setCollected] = useState<boolean>(() => getStoredValue("gx_collected", false));
  const [showInfo, setShowInfo] = useState(false);
  const [showSuggest, setShowSuggest] = useState<boolean>(() => getStoredValue("gx_showSuggest", true));
  const [suggApplied, setSuggApplied] = useState<boolean>(() => getStoredValue("gx_suggApplied", false));
  const [adaptiveMode, setAdaptiveMode] = useState<boolean>(() => getStoredValue("gx_adaptiveMode", true));
  const [goals, setGoals] = useState<SavingGoal[]>(() => getStoredValue("gx_goals2", initialGoals));
  const [bills, setBills] = useState<BillReserve[]>(() => getStoredValue("gx_bills2", initialBills));
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => getStoredValue("gx_activeTab2", "split"));
  const [showSettings, setShowSettings] = useState(false);
  const [showGoalMenu, setShowGoalMenu] = useState(false);
  const [showBillMenu, setShowBillMenu] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<GoalPriority>("medium");
  const [newBillName, setNewBillName] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillDue, setNewBillDue] = useState("");
  const [showMoodSection, setShowMoodSection] = useState(false);
  const [showInsightsSection, setShowInsightsSection] = useState(false);

  useEffect(() => setStoredValue("gx_enabled", enabled), [enabled]);
  useEffect(() => setStoredValue("gx_roundTo", roundTo), [roundTo]);
  useEffect(() => setStoredValue("gx_freq", freq), [freq]);
  useEffect(() => setStoredValue("gx_collected", collected), [collected]);
  useEffect(() => setStoredValue("gx_showSuggest", showSuggest), [showSuggest]);
  useEffect(() => setStoredValue("gx_suggApplied", suggApplied), [suggApplied]);
  useEffect(() => setStoredValue("gx_adaptiveMode", adaptiveMode), [adaptiveMode]);
  useEffect(() => setStoredValue("gx_goals2", goals), [goals]);
  useEffect(() => setStoredValue("gx_bills2", bills), [bills]);
  useEffect(() => setStoredValue("gx_activeTab2", activeTab), [activeTab]);

  useEffect(() => { if (adaptiveMode) { setRoundTo(adaptiveSuggestion.roundTo); setFreq(adaptiveSuggestion.freq); } }, [adaptiveMode, adaptiveSuggestion.roundTo, adaptiveSuggestion.freq]);
  useEffect(() => { setCollected(false); }, [roundTo]);
  useEffect(() => { if (lowBalanceMode) setEnabled(false); }, [lowBalanceMode]);

  const spends = transactions.filter((t) => t.amount < 0);
  const entries: RoundUpEntry[] = spends.map((t) => ({ id: t.id, name: t.name, amount: t.amount, roundUp: calcRoundUp(t.amount, roundTo) }));
  const pendingTotal = parseFloat(entries.reduce((s, e) => s + e.roundUp, 0).toFixed(2));
  const allocation = computeAllocation(pendingTotal, bills, goals);
  const goalSavedTotal = goals.reduce((s, g) => s + g.saved, 0);
  const billSavedTotal = bills.reduce((s, b) => s + b.saved, 0);
  const alreadySaved = goalSavedTotal + billSavedTotal;
  const totalInPocket = parseFloat((alreadySaved + (collected ? pendingTotal : 0)).toFixed(2));
  const safeToSpend = parseFloat((user.balance - pendingTotal).toFixed(2));
  const suggEntries = spends.map((t) => calcRoundUp(t.amount, suggestion.roundTo));
  const suggTotal = parseFloat(suggEntries.reduce((s, v) => s + v, 0).toFixed(2));
  const totalYearEstimate = parseFloat((pendingTotal * 52).toFixed(2));
  const foodRoundUps = entries.filter((e) => /food|grab|cafe|coffee|tea|restaurant|mamak/i.test(e.name)).reduce((s, e) => s + e.roundUp, 0);
  const nearestBill = [...bills].filter((b) => b.enabled).sort((a, b) => a.dueInDays - b.dueInDays)[0];
  const highestGoal = [...goals].sort((a, b) => ["high","medium","low"].indexOf(a.priority) - ["high","medium","low"].indexOf(b.priority))[0];

  function applyBuddySuggestion() { setAdaptiveMode(false); setRoundTo(suggestion.roundTo); setFreq(suggestion.freq); setSuggApplied(true); setShowSuggest(false); }

  function collectNow() {
    setCollected(true);
    setBills((prev) => prev.map((bill) => { const alloc = allocation.billAllocations.find((a) => a.id === bill.id); if (!alloc) return bill; return { ...bill, saved: parseFloat((bill.saved + alloc.amount).toFixed(2)) }; }));
    setGoals((prev) => prev.map((goal) => { const alloc = allocation.goalAllocations.find((a) => a.id === goal.id); if (!alloc) return goal; return { ...goal, saved: parseFloat((goal.saved + alloc.amount).toFixed(2)) }; }));
  }

  function addGoal() {
    const cleanName = newGoalName.trim();
    const target = parseFloat(newGoalTarget);
    if (!cleanName || Number.isNaN(target) || target <= 0 || target > 100) return;
    setGoals((prev) => [...prev, { id: Date.now(), name: cleanName, target, saved: 0, priority: newGoalPriority, icon: "target" }]);
    setNewGoalName(""); setNewGoalTarget(""); setNewGoalPriority("medium"); setShowGoalMenu(false);
  }

  function deleteGoal(id: number) { if (goals.length === 1) return; setGoals((prev) => prev.filter((g) => g.id !== id)); }

  function cycleGoalPriority(id: number) {
    const order: GoalPriority[] = ["high", "medium", "low"];
    setGoals((prev) => prev.map((g) => g.id !== id ? g : { ...g, priority: order[(order.indexOf(g.priority) + 1) % order.length] }));
  }

  function addBill() {
    const cleanName = newBillName.trim();
    const amount = parseFloat(newBillAmount);
    const dueInDays = parseInt(newBillDue, 10);
    if (!cleanName || Number.isNaN(amount) || amount <= 0 || amount > 99 || Number.isNaN(dueInDays) || dueInDays < 0) return;
    const lowerName = cleanName.toLowerCase();
    const icon: BillIconKey = lowerName.includes("phone") ? "phone" : lowerName.includes("spotify") || lowerName.includes("music") ? "music" : lowerName.includes("netflix") || lowerName.includes("movie") ? "film" : "receipt";
    setBills((prev) => [...prev, { id: Date.now(), name: cleanName, amount, saved: 0, dueInDays, icon, enabled: true }]);
    setNewBillName(""); setNewBillAmount(""); setNewBillDue(""); setShowBillMenu(false);
  }

  function deleteBill(id: number) { if (bills.length === 1) return; setBills((prev) => prev.filter((b) => b.id !== id)); }
  function toggleBill(id: number) { setBills((prev) => prev.map((b) => b.id === id ? { ...b, enabled: !b.enabled } : b)); }

  // ── SETTINGS SCREEN ──────────────────────────────────────────────────────────
  if (showSettings) {
    return (
      <AppShell>
        <main className="px-4 pt-1 pb-10 space-y-3">
          <div className="flex items-center gap-3 pb-1">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(false)} className="h-10 w-10 rounded-2xl bg-secondary grid place-items-center shadow-card shrink-0"><ArrowLeft className="h-4 w-4" /></motion.button>
            <div><h1 className="text-xl font-extrabold tracking-tight">Settings</h1><p className="text-xs text-muted-foreground">Smart Auto-Save controls</p></div>
          </div>

          <Card className="p-3 rounded-3xl border-0 shadow-card space-y-3">
            {/* Round-Up Toggle */}
            <div className="flex items-center justify-between rounded-2xl bg-secondary/40 p-3">
              <div className="flex items-center gap-2.5">
                <div className={`h-9 w-9 rounded-xl grid place-items-center ${enabled ? "bg-primary/20" : "bg-muted"}`}><Coins className={`h-4 w-4 ${enabled ? "text-primary" : "text-muted-foreground"}`} /></div>
                <div><p className="text-sm font-bold">Round-Up Savings</p><p className="text-[11px] text-muted-foreground">Collect spare cents automatically</p></div>
              </div>
              <Switch checked={enabled} disabled={lowBalanceMode} onCheckedChange={(v) => { setEnabled(v); setCollected(false); }} />
            </div>

            {/* Adaptive AI Toggle */}
            <div className="flex items-center justify-between rounded-2xl bg-secondary/40 p-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center"><Brain className="h-4 w-4 text-primary" /></div>
                <div><p className="text-sm font-bold">Adaptive AI Mode</p><p className="text-[11px] text-muted-foreground">Buddy adjusts to your cash flow</p></div>
              </div>
              <Switch checked={adaptiveMode} onCheckedChange={setAdaptiveMode} disabled={lowBalanceMode || !enabled} />
            </div>

            {!enabled && <div className="rounded-2xl bg-muted/50 p-3 text-center"><p className="text-xs text-muted-foreground">Enable Round-Up Savings to edit settings.</p></div>}

            {enabled && (
              <div className="space-y-3">
                {/* Round To */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Round Up To</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([0.5, 1] as RoundTo[]).map((val) => (
                      <button key={val} disabled={adaptiveMode} onClick={() => setRoundTo(val)}
                        className={`rounded-2xl py-2.5 text-sm font-bold transition-all ${roundTo === val ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-secondary-foreground"} ${adaptiveMode ? "opacity-40 cursor-not-allowed" : ""}`}>
                        {val === 0.5 ? "Nearest 50 sen" : "Nearest RM 1"}
                      </button>
                    ))}
                  </div>
                  {adaptiveMode && <p className="text-[11px] text-muted-foreground mt-1.5">Adaptive AI controls this automatically.</p>}
                </div>

                {/* Collect Frequency */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Collect Frequency</p>
                  <div className="space-y-1.5">
                    {([
                      { key: "daily", Icon: Clock, label: "Daily", desc: "Swept every night" },
                      { key: "weekly", Icon: Calendar, label: "Weekly", desc: "Every Sunday at midnight" },
                      { key: "monthly", Icon: CalendarDays, label: "Monthly", desc: "Last day of each month" },
                    ] as { key: CollectFreq; Icon: typeof Clock; label: string; desc: string }[]).map(({ key, Icon, label, desc }) => {
                      const active = freq === key;
                      return (
                        <button key={key} disabled={adaptiveMode} onClick={() => setFreq(key)}
                          className={`w-full flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-all ${active ? "bg-primary/15 border border-primary/30" : "bg-secondary/50"} ${adaptiveMode ? "opacity-40 cursor-not-allowed" : ""}`}>
                          <div className={`h-8 w-8 rounded-xl grid place-items-center shrink-0 ${active ? "bg-primary/20" : "bg-muted"}`}><Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} /></div>
                          <div className="flex-1 min-w-0"><p className="text-sm font-bold">{label}</p><p className="text-[11px] text-muted-foreground">{desc}</p></div>
                          {active && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* How it works */}
                <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3">
                  <button onClick={() => setShowInfo((v) => !v)} className="w-full flex items-center justify-between text-left">
                    <div className="flex items-center gap-2"><Info className="h-3.5 w-3.5 text-primary" /><p className="text-sm font-bold">How round-up works</p></div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${showInfo ? "rotate-90" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showInfo && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-2.5 text-xs text-muted-foreground space-y-1.5">
                          <p><span className="font-bold text-foreground">50 sen:</span> Spend RM4.30 → saves RM0.20</p>
                          <p><span className="font-bold text-foreground">RM1:</span> Spend RM4.20 → saves RM0.80</p>
                          <p className="text-[11px]">Bills and goals are all under RM100 — these are small, regular round-ups.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </Card>

          {/* Allocation logic card */}
          <Card className="p-3 rounded-3xl border-0 shadow-card space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center"><PieChart className="h-4 w-4 text-primary" /></div>
              <div><p className="text-sm font-bold">Split Logic</p><p className="text-[11px] text-muted-foreground">Bills first, goals by priority</p></div>
            </div>
            <div className="rounded-2xl bg-secondary/50 p-2.5 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><ReceiptText className="h-3 w-3 text-accent" /><span><span className="font-bold text-foreground">Step 1:</span> Active bills split evenly (capped at shortfall)</span></div>
              <div className="flex items-center gap-2"><Target className="h-3 w-3 text-primary" /><span><span className="font-bold text-foreground">Step 2:</span> Remaining → goals: High → Medium → Low</span></div>
              <div className="flex items-center gap-2"><Coins className="h-3 w-3 text-muted-foreground" /><span>All bills &amp; goals capped at RM99</span></div>
            </div>
            <button onClick={() => { setShowSettings(false); setActiveTab("split"); }} className="w-full rounded-2xl bg-secondary py-2.5 text-sm font-bold flex items-center justify-center gap-2">
              View Split Preview <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </Card>
        </main>
      </AppShell>
    );
  }

  // ── MAIN SCREEN ──────────────────────────────────────────────────────────────
  return (
    <AppShell>
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <button onClick={() => router.history.back()} className="text-xs text-primary font-medium flex items-center mb-2 cursor-pointer hover:opacity-80 transition-opacity">
          ← Back
        </button>
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-xl font-extrabold tracking-tight">Smart Auto-Save</h1><p className="text-xs text-muted-foreground">Round-ups for small goals &amp; bills under RM100</p></div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(true)} className="h-10 w-10 rounded-2xl bg-secondary grid place-items-center shadow-card shrink-0"><Settings className="h-4 w-4" /></motion.button>
        </div>
      </div>

      {/* Dashboard Card — compact */}
      <section className="px-4 pb-3">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="p-4 rounded-3xl border-0 shadow-card bg-gradient-to-br from-[oklch(0.35_0.12_295)] to-[oklch(0.22_0.07_295)] relative overflow-hidden">
            <div aria-hidden className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-primary/25 blur-2xl" />
            <div aria-hidden className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-accent/20 blur-2xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Protected</p>
                <motion.p key={totalInPocket} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-3xl font-extrabold tracking-tight mt-0.5">RM {totalInPocket.toFixed(2)}</motion.p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Bills saved + goal savings + pending</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/20 grid place-items-center shrink-0"><Vault className="h-6 w-6 text-primary" /></div>
            </div>
            <div className="relative mt-3 grid grid-cols-3 gap-1.5">
              <div className="rounded-xl bg-background/10 p-2.5"><p className="text-[9px] text-muted-foreground">Pending</p><p className="text-sm font-extrabold text-accent">RM {pendingTotal.toFixed(2)}</p></div>
              <div className="rounded-xl bg-background/10 p-2.5"><p className="text-[9px] text-muted-foreground">Safe Spend</p><p className="text-sm font-extrabold">RM {safeToSpend.toFixed(2)}</p></div>
              <div className="rounded-xl bg-background/10 p-2.5"><p className="text-[9px] text-muted-foreground">Mode</p><p className="text-sm font-extrabold">{adaptiveMode ? "AI" : enabled ? "On" : "Off"}</p></div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Buddy suggestion card */}
      <AnimatePresence>
        {showSuggest && !lowBalanceMode && (
          <motion.section className="px-4 pb-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
            <Card className="rounded-2xl border-0 shadow-card overflow-hidden border border-primary/25 p-3">
              <div className="flex gap-2.5 items-center">
                <Hamster mood={suggestion.hamsterMood} size={48} float={false} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-sm font-bold text-primary">Buddy Suggests</p>
                    <Badge className="text-[9px] bg-primary/20 text-primary border-0 px-1.5">{suggestion.tag}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{suggestion.reason}</p>
                  {/* Split preview pills */}
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className="rounded-full bg-accent/15 text-accent text-[10px] font-bold px-2 py-0.5">RM{suggestion.roundTo === 0.5 ? "0.50" : "1"}/txn</span>
                    <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5">~RM{suggTotal.toFixed(2)}/cycle</span>
                    <span className="rounded-full bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-0.5">{freqShort[suggestion.freq]}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={applyBuddySuggestion} className="h-8 w-8 rounded-xl bg-primary text-primary-foreground grid place-items-center"><ThumbsUp className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setShowSuggest(false)} className="h-8 w-8 rounded-xl bg-secondary grid place-items-center"><X className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </Card>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Tab Bar */}
      <section className="px-4 pb-3">
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-secondary/50 p-1">
          {([
            { key: "split", label: "Split", Icon: PieChart },
            { key: "bills", label: "Bills", Icon: ReceiptText },
            { key: "goals", label: "Goals", Icon: Target },
            { key: "history", label: "History", Icon: ListChecks },
          ] as { key: ActiveTab; label: string; Icon: typeof PieChart }[]).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`rounded-xl py-1.5 text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${activeTab === key ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-3 w-3" />{label}
            </button>
          ))}
        </div>
      </section>

      {/* ── SPLIT TAB ──────────────────────────────────────────────────────────── */}
      {activeTab === "split" && (
        <section className="px-4 pb-4 space-y-3">
          <div className="px-0.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Buddy's Smart Split</p>
              <p className="text-[11px] text-muted-foreground">Bills first → goals by priority</p>
            </div>
            <div className="flex gap-1.5">
              <span className="rounded-full bg-accent/15 text-accent text-[10px] font-bold px-2 py-0.5">Bills RM{allocation.totalBills.toFixed(2)}</span>
              <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5">Goals RM{allocation.totalGoals.toFixed(2)}</span>
            </div>
          </div>

          {/* Bills allocation */}
          <Card className="p-3 rounded-2xl border-0 shadow-card space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-accent/15 grid place-items-center shrink-0"><ReceiptText className="h-3.5 w-3.5 text-accent" /></div>
              <p className="text-sm font-bold flex-1">Bills — Priority 1</p>
              <span className="text-xs font-extrabold text-accent">RM {allocation.totalBills.toFixed(2)}</span>
            </div>
            {allocation.billAllocations.length === 0
              ? <p className="text-xs text-muted-foreground text-center py-1.5">All bills funded or no active bills.</p>
              : allocation.billAllocations.map((a) => {
                  const bill = bills.find((b) => b.id === a.id)!;
                  const Icon = billIconMap[bill.icon];
                  const afterSaved = bill.saved + a.amount;
                  const pct = Math.min(100, (afterSaved / bill.amount) * 100);
                  const urgColor = billUrgencyColor(bill.dueInDays);
                  const urgBg = billUrgencyBg(bill.dueInDays);
                  const barColor = billBarColor(bill.dueInDays);
                  return (
                    <div key={a.id} className={`rounded-xl border p-3 ${urgBg}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-3.5 w-3.5 ${urgColor}`} />
                          <p className="text-xs font-bold">{a.name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${bill.dueInDays <= 2 ? "bg-rose-500/15 text-rose-500" : bill.dueInDays <= 5 ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"}`}>
                            {bill.dueInDays <= 2 ? "⚡ " : ""}{bill.dueInDays}d left
                          </span>
                        </div>
                        <span className={`text-xs font-bold ${urgColor}`}>+RM {a.amount.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full rounded-full ${barColor}`} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-muted-foreground">RM {afterSaved.toFixed(2)} / RM {bill.amount.toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">{Math.round(pct)}%</p>
                      </div>
                    </div>
                  );
                })
            }
          </Card>

          {/* Goals allocation */}
          <Card className="p-3 rounded-2xl border-0 shadow-card space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-primary/15 grid place-items-center shrink-0"><Target className="h-3.5 w-3.5 text-primary" /></div>
              <p className="text-sm font-bold flex-1">Goals — Priority 2</p>
              <span className="text-xs font-extrabold text-primary">RM {allocation.totalGoals.toFixed(2)}</span>
            </div>
            {allocation.goalAllocations.length === 0
              ? <p className="text-xs text-muted-foreground text-center py-1.5">All round-ups went to bills, or no goals to fund.</p>
              : allocation.goalAllocations.map((a, idx) => {
                  const goal = goals.find((g) => g.id === a.id)!;
                  const Icon = goalIconMap[goal.icon];
                  const afterSaved = goal.saved + a.amount;
                  const pct = Math.min(100, (afterSaved / goal.target) * 100);
                  return (
                    <div key={a.id} className={`rounded-xl border p-3 ${priorityBg[goal.priority]}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-3.5 w-3.5 ${priorityColors[goal.priority]}`} />
                          <p className="text-xs font-bold">{a.name}</p>
                          <Badge className={`text-[9px] border-0 px-1 capitalize ${goal.priority === "high" ? "bg-rose-500/10 text-rose-500" : goal.priority === "medium" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{goal.priority}</Badge>
                          {idx === 0 && <span className="text-[9px] text-accent font-bold">first funded</span>}
                        </div>
                        <span className={`text-xs font-bold ${priorityColors[goal.priority]}`}>+RM {a.amount.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full rounded-full ${priorityBarColor[goal.priority]}`} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-muted-foreground">RM {afterSaved.toFixed(2)} / RM {goal.target.toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">{Math.round(pct)}%</p>
                      </div>
                    </div>
                  );
                })
            }
          </Card>

          {/* Contextual hints */}
          <div className="space-y-1.5">
            {nearestBill && nearestBill.dueInDays <= 3 && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 flex gap-2 items-start">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground"><span className="font-bold text-foreground">{nearestBill.name}</span> is due in {nearestBill.dueInDays} days — bills get priority.</p>
              </div>
            )}
            {highestGoal && (
              <div className="rounded-xl bg-primary/8 border border-primary/20 p-2.5 flex gap-2 items-start">
                <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground">After bills, Buddy funds <span className="font-bold text-foreground">{highestGoal.name}</span> first.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── BILLS TAB ──────────────────────────────────────────────────────────── */}
      {activeTab === "bills" && (
        <section className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bill Reserves</p>
              <p className="text-[11px] text-muted-foreground">All under RM100 • bills funded first</p>
            </div>
            <button onClick={() => setShowBillMenu((v) => !v)} className="h-8 rounded-xl bg-secondary px-2.5 text-xs font-bold flex items-center gap-1.5"><Plus className="h-3 w-3" /> Add</button>
          </div>

          <Card className="p-3 rounded-2xl border-0 shadow-card space-y-2.5">
            <AnimatePresence>
              {showBillMenu && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="rounded-2xl bg-secondary/50 p-3 space-y-2 mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">New Bill (max RM99)</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <input value={newBillName} onChange={(e) => setNewBillName(e.target.value)} placeholder="Bill name" className="rounded-xl bg-background px-2.5 py-2 text-xs outline-none border border-border/40" />
                      <input value={newBillAmount} onChange={(e) => setNewBillAmount(e.target.value)} placeholder="Amount (max 99)" type="number" min="1" max="99" className="rounded-xl bg-background px-2.5 py-2 text-xs outline-none border border-border/40" />
                      <input value={newBillDue} onChange={(e) => setNewBillDue(e.target.value)} placeholder="Due (days)" type="number" min="0" className="rounded-xl bg-background px-2.5 py-2 text-xs outline-none border border-border/40" />
                    </div>
                    <button onClick={addBill} className="w-full rounded-xl bg-primary text-primary-foreground py-2 text-xs font-bold flex items-center justify-center gap-1.5"><Plus className="h-3 w-3" /> Save Bill</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {bills.map((bill) => {
              const Icon = billIconMap[bill.icon];
              const pct = Math.min(100, (bill.saved / bill.amount) * 100);
              const urgColor = billUrgencyColor(bill.dueInDays);
              const urgBg = billUrgencyBg(bill.dueInDays);
              const barColor = billBarColor(bill.dueInDays);
              const shortfall = Math.max(bill.amount - bill.saved, 0);
              return (
                <div key={bill.id} className={`rounded-xl border p-3 transition-opacity ${bill.enabled ? urgBg : "bg-muted/20 border-border/20 opacity-55"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${bill.enabled ? "bg-accent/15" : "bg-muted"}`}><Icon className={`h-4 w-4 ${bill.enabled ? urgColor : "text-muted-foreground"}`} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold">{bill.name}</p>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${bill.dueInDays <= 2 ? "bg-rose-500/15 text-rose-500" : bill.dueInDays <= 5 ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"}`}>
                            {bill.dueInDays <= 2 && "⚡"}{bill.dueInDays}d left
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[10px] text-muted-foreground">RM {bill.saved.toFixed(2)} / RM {bill.amount.toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">{Math.round(pct)}% — RM {shortfall.toFixed(2)} left</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mb-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full rounded-full ${barColor}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Switch checked={bill.enabled} onCheckedChange={() => toggleBill(bill.id)} />
                    <button onClick={() => deleteBill(bill.id)} disabled={bills.length === 1} className="h-7 w-7 rounded-lg grid place-items-center bg-destructive/10 text-destructive disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl bg-primary/8 border border-primary/20 p-2.5 flex gap-2 items-start">
              <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground">Toggle a bill off to exclude it from auto-split. Bills always funded before goals.</p>
            </div>
          </Card>
        </section>
      )}

      {/* ── GOALS TAB ──────────────────────────────────────────────────────────── */}
      {activeTab === "goals" && (
        <section className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Saving Goals</p>
              <p className="text-[11px] text-muted-foreground">Small goals under RM100</p>
            </div>
            <button onClick={() => setShowGoalMenu((v) => !v)} className="h-8 rounded-xl bg-secondary px-2.5 text-xs font-bold flex items-center gap-1.5"><Plus className="h-3 w-3" /> Add</button>
          </div>

          <Card className="p-3 rounded-2xl border-0 shadow-card space-y-2.5">
            <AnimatePresence>
              {showGoalMenu && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="rounded-2xl bg-secondary/50 p-3 space-y-2 mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">New Goal (max RM100)</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="Goal name" className="rounded-xl bg-background px-2.5 py-2 text-xs outline-none border border-border/40" />
                      <input value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="Target RM (max 100)" type="number" min="1" max="100" className="rounded-xl bg-background px-2.5 py-2 text-xs outline-none border border-border/40" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">Priority</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["high", "medium", "low"] as GoalPriority[]).map((p) => (
                          <button key={p} onClick={() => setNewGoalPriority(p)}
                            className={`rounded-xl py-1.5 text-[11px] font-bold capitalize border transition-all ${newGoalPriority === p ? p === "high" ? "bg-rose-500/15 border-rose-500/40 text-rose-500" : p === "medium" ? "bg-primary/15 border-primary/40 text-primary" : "bg-muted border-border text-muted-foreground" : "bg-card border-border/30 text-muted-foreground"}`}>{p}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={addGoal} className="w-full rounded-xl bg-primary text-primary-foreground py-2 text-xs font-bold flex items-center justify-center gap-1.5"><Plus className="h-3 w-3" /> Save Goal</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {[...goals].sort((a, b) => ["high","medium","low"].indexOf(a.priority) - ["high","medium","low"].indexOf(b.priority)).map((goal) => {
              const Icon = goalIconMap[goal.icon];
              const pct = Math.min(100, (goal.saved / goal.target) * 100);
              const shortfall = Math.max(goal.target - goal.saved, 0);
              return (
                <div key={goal.id} className={`rounded-xl border p-3 ${priorityBg[goal.priority]}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-muted/60 grid place-items-center shrink-0"><Icon className={`h-4 w-4 ${priorityColors[goal.priority]}`} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold">{goal.name}</p>
                        <span className="text-[10px] text-muted-foreground">RM {goal.saved.toFixed(2)} / RM {goal.target.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[10px] text-muted-foreground">RM {shortfall.toFixed(2)} to go</p>
                        <p className="text-[10px] font-bold text-muted-foreground">{Math.round(pct)}% filled</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mb-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full rounded-full ${priorityBarColor[goal.priority]}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => cycleGoalPriority(goal.id)}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold capitalize border ${goal.priority === "high" ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : goal.priority === "medium" ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                      {goal.priority} priority
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} disabled={goals.length === 1} className="h-7 w-7 rounded-lg grid place-items-center bg-destructive/10 text-destructive disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl bg-primary/8 border border-primary/20 p-2.5 flex gap-2 items-start">
              <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground">Tap priority badge to cycle High → Medium → Low. Highest priority funded first after bills.</p>
            </div>
          </Card>
        </section>
      )}

      {/* ── HISTORY TAB ────────────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <section className="px-4 pb-4 space-y-3">

          {/* Mood signals */}
          <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
            <button onClick={() => setShowMoodSection((v) => !v)} className="w-full p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center"><Brain className="h-4 w-4 text-primary" /></div>
                <div className="text-left"><p className="text-sm font-bold">Behaviour Patterns</p><p className="text-[11px] text-muted-foreground">AI spending detection</p></div>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${showMoodSection ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {showMoodSection && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-3 pb-3">
                  <div className="space-y-2">
                    {moodSignals.map((signal) => {
                      const Icon = signal.icon;
                      return (
                        <div key={signal.label} className="flex gap-2.5 items-start rounded-xl bg-secondary/40 p-2.5">
                          <div className="h-7 w-7 rounded-lg bg-primary/15 grid place-items-center shrink-0"><Icon className="h-3.5 w-3.5 text-primary" /></div>
                          <div><p className="text-xs font-bold">{signal.label}</p><p className="text-[11px] text-muted-foreground mt-0.5">{signal.message}</p></div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Saving insights */}
          <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
            <button onClick={() => setShowInsightsSection((v) => !v)} className="w-full p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-accent/15 grid place-items-center"><TrendingUp className="h-4 w-4 text-accent" /></div>
                <div className="text-left"><p className="text-sm font-bold">Savings Insights</p><p className="text-[11px] text-muted-foreground">What your round-ups add up to</p></div>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${showInsightsSection ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {showInsightsSection && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-3 pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-accent/10 border border-accent/20 p-3"><TrendingUp className="h-4 w-4 text-accent mb-1.5" /><p className="text-base font-extrabold">RM {totalYearEstimate.toFixed(2)}</p><p className="text-[11px] text-muted-foreground">estimated yearly</p></div>
                    <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3"><Utensils className="h-4 w-4 text-primary mb-1.5" /><p className="text-base font-extrabold">RM {foodRoundUps.toFixed(2)}</p><p className="text-[11px] text-muted-foreground">food round-ups</p></div>
                    <div className="rounded-2xl bg-secondary border border-border/30 p-3"><Coins className="h-4 w-4 text-muted-foreground mb-1.5" /><p className="text-base font-extrabold">{entries.length}</p><p className="text-[11px] text-muted-foreground">transactions this cycle</p></div>
                    <div className="rounded-2xl bg-secondary border border-border/30 p-3"><Zap className="h-4 w-4 text-amber-500 mb-1.5" /><p className="text-base font-extrabold">RM {pendingTotal.toFixed(2)}</p><p className="text-[11px] text-muted-foreground">pending this cycle</p></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Round-up log */}
          <Card className="p-3 rounded-2xl border-0 shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">This Cycle's Round-Ups</p>
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-xs font-medium">{e.name}</p>
                    <p className="text-[10px] text-muted-foreground">RM {Math.abs(e.amount).toFixed(2)} → RM {(Math.abs(e.amount) + e.roundUp).toFixed(2)}</p>
                  </div>
                  <Badge className="text-[10px] bg-accent/15 text-accent border-0">+RM {e.roundUp.toFixed(2)}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-border/30 flex items-center justify-between">
              <span className="text-sm font-bold">Total this cycle</span>
              <span className="text-accent font-extrabold">RM {pendingTotal.toFixed(2)}</span>
            </div>
          </Card>
        </section>
      )}

      {/* ── COLLECT BUTTON ──────────────────────────────────────────────────────── */}
      <section className="px-4 pb-8">
        {enabled && !collected && pendingTotal > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={collectNow}
              className="w-full rounded-2xl bg-primary-gradient text-primary-foreground font-bold py-3.5 text-sm shadow-glow flex items-center justify-center gap-2">
              <Coins className="h-4 w-4" /> Collect RM {pendingTotal.toFixed(2)} — Buddy Splits It
            </motion.button>
            <p className="text-center text-[11px] text-muted-foreground mt-1.5">Bills first, then goals by priority • {freqLabel[freq]}</p>
          </motion.div>
        )}
        {collected && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-4 rounded-2xl border-0 shadow-card text-center bg-success/10 border border-success/20">
              <CheckCircle2 className="h-7 w-7 text-success mx-auto mb-1.5" />
              <p className="text-sm font-bold">RM {pendingTotal.toFixed(2)} collected!</p>
              <div className="flex justify-center gap-3 mt-1.5">
                <span className="text-[11px] text-muted-foreground">RM {allocation.totalBills.toFixed(2)} → bills</span>
                <span className="text-[11px] text-muted-foreground">RM {allocation.totalGoals.toFixed(2)} → goals</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Next auto-collect: {freqLabel[freq].toLowerCase()}</p>
            </Card>
          </motion.div>
        )}
        {!enabled && (
          <Card className="p-3 rounded-2xl border-0 shadow-card text-center opacity-60">
            <p className="text-xs text-muted-foreground">Round-Up Savings is off. Tap <Settings className="h-3 w-3 inline" /> to enable.</p>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
