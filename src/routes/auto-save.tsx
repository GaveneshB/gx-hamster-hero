import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Vault,
  Calendar,
  Clock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Info,
  Sparkles,
  X,
  ThumbsUp,
  ThumbsDown,
  Target,
  Brain,
  ShieldAlert,
  Lightbulb,
  Utensils,
  Moon,
  Wallet,
  Plus,
  Trash2,
  MoreHorizontal,
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

// ── types ─────────────────────────────────────────────────────────────────────
type CollectFreq = "daily" | "weekly" | "monthly";
type RoundTo = 0.5 | 1;
type GoalPriority = "high" | "medium" | "low";
type GoalIconKey = "shield" | "target" | "sparkles";

interface RoundUpEntry {
  id: number;
  name: string;
  amount: number;
  roundUp: number;
}

interface BuddySuggestion {
  roundTo: RoundTo;
  freq: CollectFreq;
  reason: string;
  hamsterMood: "happy" | "worried" | "sleepy";
  tag: string;
}

interface SavingGoal {
  id: number;
  name: string;
  target: number;
  saved: number;
  priority: GoalPriority;
  icon: GoalIconKey;
}

interface MoodSignal {
  label: string;
  message: string;
  icon: typeof Brain;
  severity: "gentle" | "warning" | "positive";
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore localStorage errors silently
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────
function calcRoundUp(amount: number, roundTo: RoundTo): number {
  const abs = Math.abs(amount);
  const ceiled = roundTo === 0.5 ? Math.ceil(abs * 2) / 2 : Math.ceil(abs);
  const diff = parseFloat((ceiled - abs).toFixed(2));
  return diff === 0 ? roundTo : diff;
}

function getBuddySuggestion(balance: number, income: number): BuddySuggestion {
  const ratio = balance / income;

  if (ratio >= 0.8) {
    return {
      roundTo: 1,
      freq: "daily",
      reason: `Your balance (RM${balance.toLocaleString()}) is strong — rounding to the nearest RM1 and collecting daily will build savings faster without feeling it.`,
      hamsterMood: "happy",
      tag: "Aggressive Saver",
    };
  } else if (ratio >= 0.5) {
    return {
      roundTo: 1,
      freq: "weekly",
      reason: `With RM${balance.toLocaleString()} in your balance, rounding to RM1 weekly is a smart middle ground — meaningful savings without stressing your day-to-day.`,
      hamsterMood: "happy",
      tag: "Balanced",
    };
  } else if (ratio >= 0.3) {
    return {
      roundTo: 0.5,
      freq: "weekly",
      reason: `Your balance is moderate at RM${balance.toLocaleString()}. Rounding to 50 sen weekly keeps savings gentle so you don't feel the pinch before payday.`,
      hamsterMood: "sleepy",
      tag: "Gentle Save",
    };
  } else {
    return {
      roundTo: 0.5,
      freq: "monthly",
      reason: `Balance is on the lower side (RM${balance.toLocaleString()}). Buddy suggests collecting just 50 sen round-ups monthly so your cash flow stays comfortable.`,
      hamsterMood: "worried",
      tag: "Conservative",
    };
  }
}

function getAdaptiveSettings(balance: number, income: number): BuddySuggestion {
  const ratio = balance / income;

  if (ratio < 0.25) {
    return {
      roundTo: 0.5,
      freq: "monthly",
      reason: "Adaptive AI reduced your round-up because your balance is close to the safety zone.",
      hamsterMood: "worried",
      tag: "Cash Flow Protection",
    };
  }

  if (ratio < 0.45) {
    return {
      roundTo: 0.5,
      freq: "weekly",
      reason: "Adaptive AI keeps your savings light before payday so you do not feel pressured.",
      hamsterMood: "sleepy",
      tag: "Gentle Mode",
    };
  }

  return getBuddySuggestion(balance, income);
}

function getMoodSignals(): MoodSignal[] {
  const foodSpends = transactions.filter(
    (t) => t.amount < 0 && /food|grab|cafe|coffee|tea|restaurant|mamak/i.test(t.name)
  );

  const highSpends = transactions.filter((t) => Math.abs(t.amount) >= 50 && t.amount < 0);

  const signals: MoodSignal[] = [];

  if (foodSpends.length >= 2) {
    signals.push({
      label: "Food impulse pattern",
      message: "Buddy noticed repeated food/drink spending. Small round-ups from these can quietly grow your savings.",
      icon: Utensils,
      severity: "gentle",
    });
  }

  if (highSpends.length >= 1) {
    signals.push({
      label: "Big spend alert",
      message: "You had a larger transaction this cycle. Buddy can keep round-ups gentle to avoid cash flow stress.",
      icon: Wallet,
      severity: "warning",
    });
  }

  signals.push({
    label: "Late-night protection",
    message: "If you usually spend late at night, Buddy can suggest a softer saving mode before bedtime.",
    icon: Moon,
    severity: "positive",
  });

  return signals;
}

const freqLabel: Record<CollectFreq, string> = {
  daily: "End of Day",
  weekly: "End of Week",
  monthly: "End of Month",
};

const goalIconMap: Record<GoalIconKey, typeof Target> = {
  shield: ShieldAlert,
  target: Target,
  sparkles: Sparkles,
};

const initialGoals: SavingGoal[] = [
  { id: 1, name: "Emergency Fund", target: 1000, saved: 420, priority: "high", icon: "shield" },
  { id: 2, name: "New Shoes", target: 400, saved: 315, priority: "medium", icon: "target" },
  { id: 3, name: "Japan Trip", target: 5000, saved: 860, priority: "low", icon: "sparkles" },
];

// ── component ─────────────────────────────────────────────────────────────────
function AutoSave() {
  const suggestion = getBuddySuggestion(user.balance, user.income);
  const adaptiveSuggestion = getAdaptiveSettings(user.balance, user.income);
  const moodSignals = getMoodSignals();
  const lowBalanceMode = user.balance / user.income < 0.25;

  const [enabled, setEnabled] = useState<boolean>(() =>
    getStoredValue("gx_enabled", !lowBalanceMode)
  );
  const [roundTo, setRoundTo] = useState<RoundTo>(() =>
    getStoredValue("gx_roundTo", 1)
  );
  const [freq, setFreq] = useState<CollectFreq>(() =>
    getStoredValue("gx_freq", "weekly")
  );
  const [collected, setCollected] = useState<boolean>(() =>
    getStoredValue("gx_collected", false)
  );
  const [showInfo, setShowInfo] = useState(false);
  const [showSuggest, setShowSuggest] = useState<boolean>(() =>
    getStoredValue("gx_showSuggest", true)
  );
  const [suggApplied, setSuggApplied] = useState<boolean>(() =>
    getStoredValue("gx_suggApplied", false)
  );
  const [adaptiveMode, setAdaptiveMode] = useState<boolean>(() =>
    getStoredValue("gx_adaptiveMode", true)
  );
  const [animKey, setAnimKey] = useState(0);
  const [goals, setGoals] = useState<SavingGoal[]>(() =>
    getStoredValue("gx_goals", initialGoals)
  );
  const [selectedGoalId, setSelectedGoalId] = useState<number>(() =>
    getStoredValue("gx_selectedGoalId", 1)
  );
  const [showGoalMenu, setShowGoalMenu] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [showMoodSection, setShowMoodSection] = useState(false);
  const [showInsightsSection, setShowInsightsSection] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Save persistent settings
  useEffect(() => setStoredValue("gx_enabled", enabled), [enabled]);
  useEffect(() => setStoredValue("gx_roundTo", roundTo), [roundTo]);
  useEffect(() => setStoredValue("gx_freq", freq), [freq]);
  useEffect(() => setStoredValue("gx_collected", collected), [collected]);
  useEffect(() => setStoredValue("gx_showSuggest", showSuggest), [showSuggest]);
  useEffect(() => setStoredValue("gx_suggApplied", suggApplied), [suggApplied]);
  useEffect(() => setStoredValue("gx_adaptiveMode", adaptiveMode), [adaptiveMode]);
  useEffect(() => setStoredValue("gx_goals", goals), [goals]);
  useEffect(() => setStoredValue("gx_selectedGoalId", selectedGoalId), [selectedGoalId]);

  useEffect(() => {
    if (adaptiveMode) {
      setRoundTo(adaptiveSuggestion.roundTo);
      setFreq(adaptiveSuggestion.freq);
    }
  }, [adaptiveMode, adaptiveSuggestion.roundTo, adaptiveSuggestion.freq]);

  useEffect(() => {
    setAnimKey((k) => k + 1);
    setCollected(false);
  }, [roundTo]);

  useEffect(() => {
    if (lowBalanceMode) {
      setEnabled(false);
    }
  }, [lowBalanceMode]);

  useEffect(() => {
    const selectedExists = goals.some((goal) => goal.id === selectedGoalId);
    if (!selectedExists && goals.length > 0) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  const spends = transactions.filter((t) => t.amount < 0);
  const entries: RoundUpEntry[] = spends.map((t) => ({
    id: t.id,
    name: t.name,
    amount: t.amount,
    roundUp: calcRoundUp(t.amount, roundTo),
  }));

  const pendingTotal = parseFloat(entries.reduce((s, e) => s + e.roundUp, 0).toFixed(2));
  const alreadySaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalInPocket = parseFloat((alreadySaved + (collected ? pendingTotal : 0)).toFixed(2));

  const suggEntries = spends.map((t) => calcRoundUp(t.amount, suggestion.roundTo));
  const suggTotal = parseFloat(suggEntries.reduce((s, v) => s + v, 0).toFixed(2));

  const selectedGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];
  const SelectedGoalIcon = selectedGoal ? goalIconMap[selectedGoal.icon] : Target;
  const closestGoal = [...goals].sort((a, b) => a.target - a.saved - (b.target - b.saved))[0];
  const totalYearEstimate = parseFloat((pendingTotal * 52).toFixed(2));
  const foodRoundUps = entries
    .filter((e) => /food|grab|cafe|coffee|tea|restaurant|mamak/i.test(e.name))
    .reduce((s, e) => s + e.roundUp, 0);

  function applyBuddySuggestion() {
    setAdaptiveMode(false);
    setRoundTo(suggestion.roundTo);
    setFreq(suggestion.freq);
    setSuggApplied(true);
    setShowSuggest(false);
  }

  function dismissSuggestion() {
    setShowSuggest(false);
  }

  function collectNow() {
    if (!selectedGoal) return;

    setCollected(true);
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === selectedGoalId
          ? { ...goal, saved: parseFloat((goal.saved + pendingTotal).toFixed(2)) }
          : goal
      )
    );
  }

  function addGoal() {
    const cleanName = newGoalName.trim();
    const target = parseFloat(newGoalTarget);

    if (!cleanName || Number.isNaN(target) || target <= 0) return;

    const newGoal: SavingGoal = {
      id: Date.now(),
      name: cleanName,
      target,
      saved: 0,
      priority: "medium",
      icon: "target",
    };

    setGoals((prev) => [...prev, newGoal]);
    setSelectedGoalId(newGoal.id);
    setNewGoalName("");
    setNewGoalTarget("");
    setShowGoalMenu(false);
  }

  function deleteGoal(goalId: number) {
    if (goals.length === 1) return;

    const remainingGoals = goals.filter((goal) => goal.id !== goalId);
    setGoals(remainingGoals);

    if (selectedGoalId === goalId && remainingGoals.length > 0) {
      setSelectedGoalId(remainingGoals[0].id);
    }
  }

  return (
    <AppShell>
      <PageHeader title="Smart Auto-Save" subtitle="Every cent counts." />

      {/* ── Emergency Auto-Pause ── */}
      <AnimatePresence>
        {lowBalanceMode && (
          <motion.section
            className="px-5 pb-4"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-4 rounded-2xl border border-destructive/25 shadow-card bg-destructive/10 flex gap-3 items-start">
              <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-destructive">Emergency Auto-Pause is on</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Buddy paused auto-save because your balance is in the safety zone. This protects your cash flow.
                </p>
              </div>
            </Card>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Savings Jar ── */}
      <section className="px-5 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="p-6 rounded-3xl border-0 shadow-card bg-gradient-to-br from-[oklch(0.35_0.12_295)] to-[oklch(0.22_0.07_295)] relative overflow-hidden text-center">
            <div aria-hidden className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/25 blur-2xl" />
            <div aria-hidden className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-primary/20 grid place-items-center mx-auto mb-3">
                <Vault className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Total in pocket</p>
              <motion.p
                key={totalInPocket}
                initial={{ scale: 0.88 }}
                animate={{ scale: 1 }}
                className="text-5xl font-extrabold mt-1 tracking-tight"
              >
                RM {totalInPocket.toFixed(2)}
              </motion.p>
              <p className="text-xs text-muted-foreground mt-2">
                Collected from spare cents — no effort needed
              </p>

              <AnimatePresence>
                {!collected && pendingTotal > 0 && enabled && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 inline-flex items-center gap-1.5 bg-accent/20 rounded-xl px-3 py-1.5"
                  >
                    <Coins className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs font-semibold text-accent">
                      RM {pendingTotal.toFixed(2)} pending
                    </span>
                  </motion.div>
                )}

                {collected && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 inline-flex items-center gap-1.5 bg-success/20 rounded-xl px-3 py-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs font-semibold text-success">Cents collected!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* ── Goal-Based Saving ── */}
      {selectedGoal && (
        <section className="px-5 pb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Saving Goals</p>
            <button
              onClick={() => setShowGoalMenu((v) => !v)}
              className="h-8 rounded-xl bg-secondary px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              Manage
            </button>
          </div>

          <Card className="p-4 rounded-2xl border-0 shadow-card space-y-3">
            <button
              onClick={() => setShowGoalMenu((v) => !v)}
              className="w-full rounded-2xl p-3 text-left bg-primary/10 border border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl grid place-items-center bg-primary/20 shrink-0">
                  <SelectedGoalIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold truncate">{selectedGoal.name}</p>
                    <span className="text-xs font-semibold text-muted-foreground">
                      RM {selectedGoal.saved.toFixed(2)} / RM {selectedGoal.target.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((selectedGoal.saved / selectedGoal.target) * 100, 100)}%` }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    RM {Math.max(selectedGoal.target - selectedGoal.saved, 0).toFixed(2)} left • Tap Manage to change goal
                  </p>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {showGoalMenu && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-3"
                >
                  <div className="rounded-2xl bg-secondary/50 p-3 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Create Goal</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={newGoalName}
                        onChange={(e) => setNewGoalName(e.target.value)}
                        placeholder="Goal name"
                        className="rounded-xl bg-background px-3 py-2 text-xs outline-none border border-border/40"
                      />
                      <input
                        value={newGoalTarget}
                        onChange={(e) => setNewGoalTarget(e.target.value)}
                        placeholder="Target RM"
                        type="number"
                        min="1"
                        className="rounded-xl bg-background px-3 py-2 text-xs outline-none border border-border/40"
                      />
                    </div>
                    <button
                      onClick={addGoal}
                      className="w-full rounded-xl bg-primary text-primary-foreground py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Goal
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {goals.map((goal) => {
                      const Icon = goalIconMap[goal.icon];
                      const progress = Math.min((goal.saved / goal.target) * 100, 100);
                      const selected = selectedGoalId === goal.id;

                      return (
                        <div
                          key={goal.id}
                          className={`rounded-xl px-3 py-2 flex items-center gap-2 border ${
                            selected ? "bg-primary/10 border-primary/30" : "bg-secondary/40 border-transparent"
                          }`}
                        >
                          <button
                            onClick={() => {
                              setSelectedGoalId(goal.id);
                              setShowGoalMenu(false);
                            }}
                            className="flex-1 text-left flex items-center gap-2 min-w-0"
                          >
                            <div className="h-8 w-8 rounded-lg grid place-items-center bg-muted shrink-0">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{goal.name}</p>
                              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => deleteGoal(goal.id)}
                            disabled={goals.length === 1}
                            className="h-8 w-8 rounded-lg grid place-items-center bg-destructive/10 text-destructive disabled:opacity-30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {closestGoal && (
              <div className="rounded-xl bg-accent/10 border border-accent/20 p-3 flex gap-2 items-start">
                <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Buddy suggests focusing on <span className="font-bold text-foreground">{closestGoal.name}</span> because you are only RM{(closestGoal.target - closestGoal.saved).toFixed(2)} away.
                </p>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* ── Buddy Suggestion Card ── */}
      <AnimatePresence>
        {showSuggest && !lowBalanceMode && (
          <motion.section
            className="px-5 pb-4"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="rounded-3xl border-0 shadow-card overflow-hidden border border-primary/25">
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 px-4 pt-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold text-primary">Buddy's Suggestion</p>
                  <Badge className="text-[10px] bg-primary/20 text-primary border-0 px-1.5">
                    {suggestion.tag}
                  </Badge>
                </div>
                <button onClick={dismissSuggestion} className="opacity-50 hover:opacity-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 pb-4 pt-3 flex gap-3 items-start">
                <Hamster mood={suggestion.hamsterMood} size={72} float={false} className="shrink-0 -mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.reason}</p>

                  <div className="mt-3 flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-2.5 py-1.5">
                      <Coins className="h-3 w-3 text-primary" />
                      <span className="text-[11px] font-bold">
                        {suggestion.roundTo === 0.5 ? "Nearest 50 sen" : "Nearest RM1"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-2.5 py-1.5">
                      <Clock className="h-3 w-3 text-primary" />
                      <span className="text-[11px] font-bold">{freqLabel[suggestion.freq]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-accent/15 rounded-xl px-2.5 py-1.5">
                      <TrendingUp className="h-3 w-3 text-accent" />
                      <span className="text-[11px] font-bold text-accent">~RM {suggTotal.toFixed(2)}/cycle</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={applyBuddySuggestion}
                      className="flex-1 rounded-xl bg-primary-gradient text-primary-foreground text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Apply this
                    </button>
                    <button
                      onClick={dismissSuggestion}
                      className="flex-1 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      I'll set myself
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Applied confirmation */}
      <AnimatePresence>
        {suggApplied && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-5 mb-4 rounded-2xl bg-success/10 border border-success/25 px-4 py-3 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <p className="text-xs font-semibold text-success">
              Buddy's settings applied! You can still adjust below anytime.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mood / Spending Detection Dropdown ── */}
      <section className="px-5 pb-4">
        <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
          <button
            onClick={() => setShowMoodSection((v) => !v)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Mood & Spending Detection</p>
                <p className="text-xs text-muted-foreground">AI detects spending behavior patterns</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${showMoodSection ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {showMoodSection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-4 pb-4"
              >
                <div className="space-y-3">
                  {moodSignals.map((signal) => {
                    const Icon = signal.icon;
                    return (
                      <div key={signal.label} className="flex gap-3 items-start rounded-xl bg-secondary/40 p-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/15 grid place-items-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{signal.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{signal.message}</p>
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

      {/* ── Adaptive AI Dropdown ── */}
      <section className="px-5 pb-4">
        <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
          <button
            onClick={() => setShowAdvancedSettings((v) => !v)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Adaptive AI Round-Up</p>
                <p className="text-xs text-muted-foreground">Smart saving automation settings</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${showAdvancedSettings ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {showAdvancedSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-4 pb-4"
              >
                <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Adaptive AI Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Buddy adjusts saving based on balance and cash flow
                    </p>
                  </div>
                  <Switch checked={adaptiveMode} onCheckedChange={setAdaptiveMode} disabled={lowBalanceMode} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* ── Enable toggle ── */}
      <section className="px-5 pb-4">
        <Card className="p-4 rounded-2xl border-0 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl grid place-items-center ${enabled ? "bg-primary/20" : "bg-muted"}`}>
              <Coins className={`h-4 w-4 ${enabled ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-sm font-bold">Round-Up Savings</p>
              <p className="text-xs text-muted-foreground">Automatically collect spare cents</p>
            </div>
          </div>
          <Switch
            checked={enabled}
            disabled={lowBalanceMode}
            onCheckedChange={(v) => {
              setEnabled(v);
              setCollected(false);
            }}
          />
        </Card>
      </section>

      {/* ── Round-up setting + Collect frequency only show when enabled ── */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* ── Round-up setting ── */}
            <section className="px-5 pb-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Round Up To</p>
                {!showSuggest && !suggApplied && !lowBalanceMode && (
                  <button
                    onClick={() => {
                      setShowSuggest(true);
                      setSuggApplied(false);
                    }}
                    className="flex items-center gap-1 text-[10px] text-primary font-semibold"
                  >
                    <Sparkles className="h-3 w-3" /> Ask Buddy
                  </button>
                )}
              </div>
              <Card className="p-4 rounded-2xl border-0 shadow-card">
                <div className="flex gap-3">
                  {([0.5, 1] as RoundTo[]).map((val) => (
                    <button
                      key={val}
                      disabled={adaptiveMode}
                      onClick={() => setRoundTo(val)}
                      className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                        roundTo === val
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "bg-secondary text-secondary-foreground"
                      } ${adaptiveMode ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      {val === 0.5 ? "Nearest 50 sen" : "Nearest RM 1"}
                    </button>
                  ))}
                </div>

                {adaptiveMode && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Adaptive AI is on, so Buddy controls this setting automatically.
                  </p>
                )}

                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Info className="h-3.5 w-3.5" />
                  How does this work?
                  <ChevronRight className={`h-3 w-3 transition-transform ${showInfo ? "rotate-90" : ""}`} />
                </button>

                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs text-muted-foreground space-y-2">
                        <p>
                          <span className="font-bold text-foreground">Nearest 50 sen: </span>
                          Spend RM4.30 → saves <span className="text-accent font-bold">20 sen</span>.
                          Spend RM4.60 → saves <span className="text-accent font-bold">40 sen</span>.
                        </p>
                        <p>
                          <span className="font-bold text-foreground">Nearest RM1: </span>
                          Spend RM4.80 → saves <span className="text-accent font-bold">20 sen</span>.
                          Spend RM4.20 → saves <span className="text-accent font-bold">80 sen</span>.
                        </p>
                        <p className="text-[10px] opacity-70">Max saved per transaction is capped at RM1.00.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </section>

            {/* ── Collect frequency ── */}
            <section className="px-5 pb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Collect My Cents
              </p>
              <Card className="p-4 rounded-2xl border-0 shadow-card">
                <div className="flex flex-col gap-2">
                  {(
                    [
                      { key: "daily", Icon: Clock, label: "End of Day", desc: "Cents swept into your jar every night" },
                      { key: "weekly", Icon: Calendar, label: "End of Week", desc: "Collected every Sunday at midnight" },
                      { key: "monthly", Icon: CalendarDays, label: "End of Month", desc: "Swept on the last day of each month" },
                    ] as { key: CollectFreq; Icon: typeof Clock; label: string; desc: string }[]
                  ).map(({ key, Icon, label, desc }) => {
                    const active = freq === key;
                    return (
                      <button
                        key={key}
                        disabled={adaptiveMode}
                        onClick={() => setFreq(key)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                          active ? "bg-primary/15 border border-primary/30" : "bg-secondary/50"
                        } ${adaptiveMode ? "opacity-30 cursor-not-allowed" : ""}`}
                      >
                        <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${active ? "bg-primary/20" : "bg-muted"}`}>
                          <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        {active && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {!enabled && (
        <section className="px-5 pb-4">
          <Card className="p-4 rounded-2xl border-0 shadow-card text-center opacity-70">
            <p className="text-sm font-semibold text-muted-foreground">
              Turn on Round-Up Savings to customize round-up and collection settings.
            </p>
          </Card>
        </section>
      )}

      {/* ── Invisible Saving Insights Dropdown ── */}
      <section className="px-5 pb-4">
        <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
          <button
            onClick={() => setShowInsightsSection((v) => !v)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/15 grid place-items-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Invisible Saving Insights</p>
                <p className="text-xs text-muted-foreground">See hidden savings statistics</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${showInsightsSection ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {showInsightsSection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-4 pb-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-accent/10 border border-accent/20 p-3">
                    <TrendingUp className="h-4 w-4 text-accent mb-2" />
                    <p className="text-lg font-extrabold">RM {totalYearEstimate.toFixed(2)}</p>
                    <p className="text-[11px] text-muted-foreground">estimated yearly savings</p>
                  </div>

                  <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3">
                    <Coins className="h-4 w-4 text-primary mb-2" />
                    <p className="text-lg font-extrabold">RM {foodRoundUps.toFixed(2)}</p>
                    <p className="text-[11px] text-muted-foreground">saved from food/drink spends</p>
                  </div>

                  <div className="col-span-2 rounded-xl bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      Your small transactions are doing hidden work. At this pace, tiny round-ups can become meaningful savings without changing your lifestyle.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* ── Round-up breakdown ── */}
      <section className="px-5 pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          This Cycle's Round-Ups
        </p>
        <Card className="p-4 rounded-2xl border-0 shadow-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={animKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">
                      RM {Math.abs(e.amount).toFixed(2)} → RM {(Math.abs(e.amount) + e.roundUp).toFixed(2)}
                    </p>
                  </div>
                  <Badge className="text-xs bg-accent/15 text-accent border-0">
                    + RM {e.roundUp.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold">Total this cycle</span>
            </div>
            <span className="text-accent font-extrabold">RM {pendingTotal.toFixed(2)}</span>
          </div>
        </Card>
      </section>

      {/* ── Collect button ── */}
      <section className="px-5 pb-10">
        {enabled && !collected && pendingTotal > 0 && selectedGoal && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={collectNow}
              className="w-full rounded-2xl bg-primary-gradient text-primary-foreground font-bold py-4 text-sm shadow-glow flex items-center justify-center gap-2"
            >
              <Coins className="h-4 w-4" />
              Collect RM {pendingTotal.toFixed(2)} into {selectedGoal.name}
            </motion.button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Or auto-collects at {freqLabel[freq].toLowerCase()}
            </p>
          </motion.div>
        )}

        {collected && selectedGoal && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-5 rounded-2xl border-0 shadow-card text-center bg-success/10 border border-success/20">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm font-bold">
                RM {pendingTotal.toFixed(2)} added to {selectedGoal.name}!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Next auto-collection at {freqLabel[freq].toLowerCase()}
              </p>
            </Card>
          </motion.div>
        )}

        {!enabled && (
          <Card className="p-4 rounded-2xl border-0 shadow-card text-center opacity-60">
            <p className="text-sm text-muted-foreground">Round-Up Savings is turned off</p>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
