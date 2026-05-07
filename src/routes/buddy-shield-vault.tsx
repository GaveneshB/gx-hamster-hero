import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Wallet,
  LockKeyhole,
  Unlock,
  Sparkles,
  Brain,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  X,
  Settings,
  Target,
  Flame,
  PiggyBank,
  Coins,
} from "lucide-react";
import { user } from "@/lib/data";

export const Route = createFileRoute('/buddy-shield-vault')({
  head: () => ({
    meta: [
      { title: "Buddy Shield Vault — GX Buddy" },
      { name: "description", content: "Protect salary before spending starts." },
    ],
  }),
  component: BuddyShieldVault,
});

type ShieldMode = "chill" | "balanced" | "discipline" | "beast";
type ShieldLevel = "Starter Shield" | "Smart Protected" | "Fully Protected" | "Elite Shield";
type IncomeType = "Salary" | "PTPTN" | "Allowance";

interface IncomeDeposit {
  id: number;
  type: IncomeType;
  amount: number;
  date: string;
}

interface VaultActivity {
  id: number;
  title: string;
  description: string;
  amount: number;
  type: "shielded" | "unlock" | "bonus";
}

const SHIELD_PERCENT: Record<ShieldMode, number> = {
  chill: 10,
  balanced: 20,
  discipline: 30,
  beast: 40,
};

const MODE_LABEL: Record<ShieldMode, string> = {
  chill: "Chill",
  balanced: "Balanced",
  discipline: "Discipline",
  beast: "Beast Mode",
};

const MODE_DESC: Record<ShieldMode, string> = {
  chill: "Protect a small amount and keep spending flexible.",
  balanced: "Best default for steady saving without pressure.",
  discipline: "Protect more salary before impulse spending starts.",
  beast: "Maximum protection for serious saving months.",
};

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

function getShieldLevel(percent: number): ShieldLevel {
  if (percent >= 40) return "Elite Shield";
  if (percent >= 30) return "Fully Protected";
  if (percent >= 20) return "Smart Protected";
  return "Starter Shield";
}

function getBuddyMessage(percent: number, safeToSpend: number): string {
  if (percent >= 30) {
    return `Strong protection is active. Buddy protected your future first, leaving RM${safeToSpend.toFixed(2)} safe to spend.`;
  }

  if (percent >= 20) {
    return `Balanced protection is active. You can spend confidently because your savings are already secured.`;
  }

  return `Starter protection is active. Buddy is helping you save without making your spending feel tight.`;
}

const initialIncome: IncomeDeposit = {
  id: 1,
  type: "Salary",
  amount: 3000,
  date: "Today",
};

const initialActivities: VaultActivity[] = [
  {
    id: 1,
    title: "Salary detected",
    description: "Buddy found a recurring income deposit and triggered Shield Vault.",
    amount: 3000,
    type: "bonus",
  },
  {
    id: 2,
    title: "Savings protected",
    description: "A portion of your salary was moved before spending started.",
    amount: 600,
    type: "shielded",
  },
];

function BuddyShieldVault() {
  const [shieldEnabled, setShieldEnabled] = useState<boolean>(() => getStoredValue("gx_shield_enabled", true));
  const [mode, setMode] = useState<ShieldMode>(() => getStoredValue("gx_shield_mode", "balanced"));
  const [paydayCalm, setPaydayCalm] = useState<boolean>(() => getStoredValue("gx_payday_calm", true));
  const [income, setIncome] = useState<IncomeDeposit>(() => getStoredValue("gx_income_deposit", initialIncome));
  const [vaultBalance, setVaultBalance] = useState<number>(() => getStoredValue("gx_vault_balance", 600));
  const [streak, setStreak] = useState<number>(() => getStoredValue("gx_shield_streak", 3));
  const [showSettings, setShowSettings] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [unlockAmount, setUnlockAmount] = useState("");
  const [activities, setActivities] = useState<VaultActivity[]>(() =>
    getStoredValue("gx_shield_activities", initialActivities)
  );

  const basePercent = SHIELD_PERCENT[mode];
  const effectivePercent = paydayCalm && shieldEnabled ? Math.min(basePercent + 5, 45) : basePercent;
  const shieldLevel = getShieldLevel(effectivePercent);
  const protectedAmount = shieldEnabled ? parseFloat(((income.amount * effectivePercent) / 100).toFixed(2)) : 0;
  const safeToSpend = shieldEnabled ? parseFloat((income.amount - protectedAmount).toFixed(2)) : income.amount;
  const totalBalance = income.amount;
  const projectedYearlyProtection = parseFloat((protectedAmount * 12).toFixed(2));
  const buddyMessage = getBuddyMessage(effectivePercent, safeToSpend);

  const healthScore = useMemo(() => {
    const score = Math.min(100, 45 + effectivePercent + streak * 5);
    return score;
  }, [effectivePercent, streak]);

  useEffect(() => setStoredValue("gx_shield_enabled", shieldEnabled), [shieldEnabled]);
  useEffect(() => setStoredValue("gx_shield_mode", mode), [mode]);
  useEffect(() => setStoredValue("gx_payday_calm", paydayCalm), [paydayCalm]);
  useEffect(() => setStoredValue("gx_income_deposit", income), [income]);
  useEffect(() => setStoredValue("gx_vault_balance", vaultBalance), [vaultBalance]);
  useEffect(() => setStoredValue("gx_shield_streak", streak), [streak]);
  useEffect(() => setStoredValue("gx_shield_activities", activities), [activities]);

  function runSalaryShield() {
    if (!shieldEnabled) return;

    const amountToProtect = parseFloat(((income.amount * effectivePercent) / 100).toFixed(2));
    setVaultBalance((prev) => parseFloat((prev + amountToProtect).toFixed(2)));
    setStreak((prev) => prev + 1);
    setActivities((prev) => [
      {
        id: Date.now(),
        title: "Shield activated",
        description: `${effectivePercent}% of your ${income.type.toLowerCase()} was protected automatically.`,
        amount: amountToProtect,
        type: "shielded",
      },
      ...prev,
    ]);
  }

  function unlockFromVault() {
    const amount = parseFloat(unlockAmount);
    if (Number.isNaN(amount) || amount <= 0 || amount > vaultBalance) return;

    setVaultBalance((prev) => parseFloat((prev - amount).toFixed(2)));
    setUnlockAmount("");
    setShowUnlock(false);
    setActivities((prev) => [
      {
        id: Date.now(),
        title: "Vault unlocked",
        description: "You used protected money. Buddy recommends rebuilding it next payday.",
        amount,
        type: "unlock",
      },
      ...prev,
    ]);
  }

  function updateIncomeAmount(value: string) {
    const amount = parseFloat(value);
    setIncome((prev) => ({
      ...prev,
      amount: Number.isNaN(amount) ? 0 : amount,
    }));
  }

  return (
    <AppShell>
      <div className="px-5 pt-1 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Buddy Shield Vault</h1>
            <p className="text-sm text-muted-foreground">Protect salary before spending starts.</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="h-11 w-11 rounded-2xl bg-secondary grid place-items-center shadow-card shrink-0"
            aria-label="Open shield settings"
          >
            <Settings className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Main vault card */}
      <section className="px-5 pb-4">
        <Card className="p-5 rounded-3xl border-0 shadow-card bg-gradient-to-br from-[oklch(0.35_0.13_275)] to-[oklch(0.18_0.06_275)] relative overflow-hidden">
          <div aria-hidden className="absolute -top-10 -right-8 h-36 w-36 rounded-full bg-primary/25 blur-2xl" />
          <div aria-hidden className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Shield Vault Balance</p>
              <motion.p
                key={vaultBalance}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-4xl font-extrabold mt-1 tracking-tight"
              >
                RM {vaultBalance.toFixed(2)}
              </motion.p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Badge className="bg-primary/20 text-primary border-0">{shieldLevel}</Badge>
                <Badge className="bg-accent/15 text-accent border-0">{effectivePercent}% Shield</Badge>
              </div>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-primary/20 grid place-items-center shrink-0">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-background/10 p-3">
              <p className="text-[10px] text-muted-foreground">Income</p>
              <p className="text-sm font-extrabold">RM {totalBalance.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl bg-background/10 p-3">
              <p className="text-[10px] text-muted-foreground">Protected</p>
              <p className="text-sm font-extrabold text-accent">RM {protectedAmount.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl bg-background/10 p-3">
              <p className="text-[10px] text-muted-foreground">Safe Spend</p>
              <p className="text-sm font-extrabold">RM {safeToSpend.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Buddy advice */}
      <section className="px-5 pb-4">
        <Card className="rounded-2xl border-0 shadow-card p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <Hamster mood={effectivePercent >= 30 ? "happy" : "sleepy"} size={56} float={false} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-primary">Buddy Protection</p>
                {paydayCalm && <Badge className="text-[10px] bg-accent/15 text-accent border-0">Payday Calm +5%</Badge>}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{buddyMessage}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Salary detection */}
      <section className="px-5 pb-4">
        <Card className="p-4 rounded-2xl border-0 shadow-card space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">Income Detected</p>
                <p className="text-xs text-muted-foreground">{income.type} received • {income.date}</p>
              </div>
            </div>
            <Badge className="bg-success/15 text-success border-0">Active</Badge>
          </div>

          <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Buddy will protect</p>
              <p className="text-lg font-extrabold">RM {protectedAmount.toFixed(2)}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={runSalaryShield}
              disabled={!shieldEnabled}
              className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold disabled:opacity-40"
            >
              Run Shield
            </motion.button>
          </div>
        </Card>
      </section>

      {/* Shield modes */}
      <section className="px-5 pb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shield Mode</p>
          <p className="text-[11px] text-muted-foreground">Choose protection strength</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(["chill", "balanced", "discipline", "beast"] as ShieldMode[]).map((key) => {
            const active = mode === key;
            const percent = SHIELD_PERCENT[key];

            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`rounded-2xl p-4 text-left border transition-all ${
                  active ? "bg-primary/15 border-primary/40 shadow-card" : "bg-card border-border/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-extrabold">{MODE_LABEL[key]}</p>
                  {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-xl font-extrabold text-primary">{percent}%</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{MODE_DESC[key]}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Health + insights */}
      <section className="px-5 pb-4">
        <Card className="p-4 rounded-2xl border-0 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/15 grid place-items-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold">Protection Health</p>
                <p className="text-xs text-muted-foreground">Based on shield strength and streak</p>
              </div>
            </div>
            <p className="text-xl font-extrabold text-accent">{healthScore}%</p>
          </div>

          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthScore}%` }}
              className="h-full rounded-full bg-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-secondary/40 p-3">
              <Flame className="h-4 w-4 text-primary mb-2" />
              <p className="text-lg font-extrabold">{streak} months</p>
              <p className="text-[11px] text-muted-foreground">protection streak</p>
            </div>
            <div className="rounded-2xl bg-secondary/40 p-3">
              <PiggyBank className="h-4 w-4 text-primary mb-2" />
              <p className="text-lg font-extrabold">RM {projectedYearlyProtection.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground">projected yearly protection</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Unlock protected money */}
      <section className="px-5 pb-4">
        <Card className="p-4 rounded-2xl border-0 shadow-card space-y-3">
          <button
            onClick={() => setShowUnlock((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 grid place-items-center">
                <Unlock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-bold">Unlock Protected Money</p>
                <p className="text-xs text-muted-foreground">Use only when needed</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${showUnlock ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {showUnlock && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex gap-2 items-start">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Unlocking may reduce your protection streak. Buddy recommends using this only for emergencies.
                  </p>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    value={unlockAmount}
                    onChange={(e) => setUnlockAmount(e.target.value)}
                    placeholder="Amount RM"
                    type="number"
                    min="1"
                    className="rounded-xl bg-background px-3 py-2 text-xs outline-none border border-border/40"
                  />
                  <button
                    onClick={unlockFromVault}
                    className="rounded-xl bg-destructive text-destructive-foreground px-4 py-2 text-xs font-bold"
                  >
                    Unlock
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* Activity */}
      <section className="px-5 pb-10">
        <Card className="p-4 rounded-2xl border-0 shadow-card">
          <button
            onClick={() => setShowActivity((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">Vault Activity</p>
                <p className="text-xs text-muted-foreground">Recent protection history</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${showActivity ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {showActivity && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-4 space-y-3"
              >
                {activities.map((activity) => {
                  const isUnlock = activity.type === "unlock";
                  const Icon = isUnlock ? Unlock : activity.type === "shielded" ? LockKeyhole : Coins;

                  return (
                    <div key={activity.id} className="flex items-start justify-between gap-3 rounded-xl bg-secondary/40 p-3">
                      <div className="flex gap-3">
                        <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${isUnlock ? "bg-destructive/10" : "bg-primary/15"}`}>
                          <Icon className={`h-4 w-4 ${isUnlock ? "text-destructive" : "text-primary"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{activity.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                        </div>
                      </div>
                      <p className={`text-xs font-extrabold shrink-0 ${isUnlock ? "text-destructive" : "text-accent"}`}>
                        {isUnlock ? "-" : "+"}RM {activity.amount.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm px-5 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 320 }}
              animate={{ y: 0 }}
              exit={{ y: 320 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="w-full max-w-sm rounded-t-3xl bg-card shadow-card border border-border/40 p-5 pb-8 space-y-4 max-h-[86vh] overflow-y-auto"
            >
              <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-muted" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-extrabold">Shield Settings</p>
                  <p className="text-xs text-muted-foreground">Customize salary protection</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="h-9 w-9 rounded-xl bg-secondary grid place-items-center">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Shield Vault</p>
                  <p className="text-xs text-muted-foreground">Protect salary automatically</p>
                </div>
                <Switch checked={shieldEnabled} onCheckedChange={setShieldEnabled} />
              </div>

              <div className="rounded-2xl bg-secondary/40 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Payday Calm Mode</p>
                  <p className="text-xs text-muted-foreground">Add +5% protection after payday</p>
                </div>
                <Switch checked={paydayCalm} onCheckedChange={setPaydayCalm} disabled={!shieldEnabled} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Income Amount</p>
                <input
                  value={income.amount}
                  onChange={(e) => updateIncomeAmount(e.target.value)}
                  type="number"
                  min="0"
                  className="w-full rounded-xl bg-background px-3 py-3 text-sm outline-none border border-border/40"
                />
              </div>

              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs text-muted-foreground">
                Buddy will protect RM {protectedAmount.toFixed(2)} from your next {income.type.toLowerCase()} and leave RM {safeToSpend.toFixed(2)} as safe spending money.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
