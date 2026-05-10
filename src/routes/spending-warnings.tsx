import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldX, TrendingDown, Clock, Wallet, ChevronRight, X, Zap, BarChart3, AlertTriangle, CheckCircle2, QrCode } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/spending-warnings")({
  head: () => ({
    meta: [
      { title: "Pre-Spending Guardian — GX Buddy" },
      { name: "description", content: "GX Buddy checks if a purchase is risky before you pay." },
    ],
  }),
  component: SpendingGuardian,
});

// --- MOCK USER FINANCIAL STATE ---
const userState = {
  balance: 312,
  dailyBudget: 30,         // Safe Daily Budget = RM312 / 10 days
  daysToAllowance: 10,
  spentToday: 52,          // Already over budget today
  allowanceDate: "19 May",
};

// --- MERCHANT PRESETS ---
const merchants = [
  { id: 1, name: "Tealive", icon: "🧋", category: "F&B", amount: 12, risk: "medium" },
  { id: 2, name: "Shopee", icon: "🛍️", category: "Shopping", amount: 89, risk: "high" },
  { id: 3, name: "GrabFood", icon: "🍔", category: "Delivery", amount: 28, risk: "high" },
  { id: 4, name: "RapidKL", icon: "🚌", category: "Transport", amount: 2, risk: "low" },
  { id: 5, name: "Caring Pharmacy", icon: "💊", category: "Medical", amount: 25, risk: "low" },
  { id: 6, name: "Steam Game", icon: "🎮", category: "Gaming", amount: 59, risk: "high" },
  { id: 7, name: "Aeon", icon: "🛒", category: "Groceries", amount: 45, risk: "low" },
  { id: 8, name: "Netflix", icon: "📺", category: "Entertainment", amount: 18, risk: "medium" },
];

// Categories that are "necessities"
const necessityCategories = ["Transport", "Medical", "Groceries", "Education"];
const impulsiveCategories = ["Shopping", "Gaming", "Entertainment", "Delivery"];

type RiskLevel = "safe" | "medium" | "high";

interface RiskResult {
  level: RiskLevel;
  score: number;
  reasons: string[];
  safeDailyBudget: number;
  projectedSafedays: number;
}

function calcRisk(amount: number, category: string): RiskResult {
  const { balance, dailyBudget, daysToAllowance, spentToday } = userState;
  const reasons: string[] = [];
  let score = 0;

  const safeDailyBudget = (balance - amount) / daysToAllowance;
  const projectedSafedays = Math.floor((balance - amount) / dailyBudget);

  // Factor 1: Already over daily budget
  if (spentToday >= dailyBudget) {
    score += 35;
    reasons.push(`Already spent RM${spentToday} today (budget: RM${dailyBudget})`);
  } else if (spentToday + amount > dailyBudget) {
    score += 20;
    reasons.push(`This will push today's spending to RM${spentToday + amount}`);
  }

  // Factor 2: Impulse category
  if (impulsiveCategories.includes(category)) {
    score += 25;
    reasons.push(`${category} is a non-essential category`);
  }

  // Factor 3: Balance after purchase
  const remaining = balance - amount;
  if (remaining < dailyBudget * 3) {
    score += 30;
    reasons.push(`Only RM${remaining} left — covers fewer than 3 days`);
  } else if (remaining < dailyBudget * 5) {
    score += 15;
    reasons.push(`RM${remaining} left after purchase`);
  }

  // Factor 4: High amount
  if (amount > 50) {
    score += 15;
    reasons.push(`Large purchase (RM${amount})`);
  }

  // Necessity discount
  if (necessityCategories.includes(category)) {
    score = Math.max(0, score - 40);
  }

  let level: RiskLevel = "safe";
  if (score >= 50) level = "high";
  else if (score >= 25) level = "medium";

  return { level, score: Math.min(score, 100), reasons, safeDailyBudget, projectedSafedays };
}

// --- COMPONENTS ---
function RiskBadge({ level }: { level: RiskLevel }) {
  if (level === "safe") return <span className="px-2.5 py-1 rounded-full bg-success/20 text-success text-xs font-bold flex items-center gap-1"><ShieldCheck className="h-3 w-3"/>Safe</span>;
  if (level === "medium") return <span className="px-2.5 py-1 rounded-full bg-warning/20 text-warning text-xs font-bold flex items-center gap-1"><ShieldAlert className="h-3 w-3"/>Caution</span>;
  return <span className="px-2.5 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center gap-1"><ShieldX className="h-3 w-3"/>Risky</span>;
}

function SpendingGuardian() {
  const [step, setStep] = useState<"idle" | "scan" | "confirm" | "warning" | "success" | "delayed">("idle");
  const [selectedMerchant, setSelectedMerchant] = useState<typeof merchants[0] | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [history, setHistory] = useState<Array<{ name: string; amount: number; level: RiskLevel; action: string }>>([]);

  const handleSelectMerchant = (m: typeof merchants[0]) => {
    setSelectedMerchant(m);
    setCustomAmount(m.amount.toString());
    setStep("confirm");
  };

  const handlePay = () => {
    if (!selectedMerchant) return;
    const amount = parseInt(customAmount) || selectedMerchant.amount;
    const result = calcRisk(amount, selectedMerchant.category);
    setRiskResult(result);

    if (result.level === "safe") {
      // Pass through silently
      setStep("success");
      setHistory(prev => [{ name: selectedMerchant.name, amount, level: "safe", action: "Paid" }, ...prev]);
    } else {
      setStep("warning");
    }
  };

  const handleContinueAnyway = () => {
    if (!selectedMerchant || !riskResult) return;
    const amount = parseInt(customAmount) || selectedMerchant.amount;
    setStep("success");
    setHistory(prev => [{ name: selectedMerchant.name, amount, level: riskResult.level, action: "Paid anyway" }, ...prev]);
    toast(`Payment of RM${amount} to ${selectedMerchant.name} completed.`);
  };

  const handleDelay = () => {
    if (!selectedMerchant || !riskResult) return;
    const amount = parseInt(customAmount) || selectedMerchant.amount;
    setStep("delayed");
    setHistory(prev => [{ name: selectedMerchant.name, amount, level: riskResult.level, action: "Delayed ✅" }, ...prev]);
  };

  const reset = () => {
    setStep("idle");
    setSelectedMerchant(null);
    setCustomAmount("");
    setRiskResult(null);
  };

  const amount = parseInt(customAmount) || (selectedMerchant?.amount ?? 0);

  return (
    <AppShell>
      <PageHeader title="Pre-Spending Guardian" subtitle="GX Buddy checks before you pay 🛡️" />

      {/* Financial Snapshot */}
      <section className="px-5 mb-5">
        <Card className="p-4 rounded-3xl border-0 bg-hero text-primary-foreground shadow-glow">
          <p className="text-xs font-bold opacity-70 mb-3 uppercase tracking-wider">Your Financial Pulse</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-black">RM{userState.balance}</p>
              <p className="text-[10px] opacity-70">Balance</p>
            </div>
            <div>
              <p className="text-xl font-black">RM{userState.dailyBudget}</p>
              <p className="text-[10px] opacity-70">Safe/Day</p>
            </div>
            <div>
              <p className="text-xl font-black">{userState.daysToAllowance}d</p>
              <p className="text-[10px] opacity-70">To Allowance</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
            <p className="text-[11px] opacity-80">Spent today</p>
            <p className={`text-sm font-black ${userState.spentToday > userState.dailyBudget ? "text-red-300" : "text-green-300"}`}>
              RM{userState.spentToday} / RM{userState.dailyBudget}
              {userState.spentToday > userState.dailyBudget && " ⚠️"}
            </p>
          </div>
        </Card>
      </section>

      {/* Simulate Payment Button */}
      <section className="px-5 mb-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep("scan")}
          className="w-full p-4 rounded-3xl bg-primary-gradient text-primary-foreground font-bold flex items-center justify-center gap-3 shadow-glow"
        >
          <QrCode className="h-5 w-5" />
          Simulate a Payment
          <ChevronRight className="h-4 w-4 opacity-70" />
        </motion.button>
      </section>

      {/* Transaction History */}
      {history.length > 0 && (
        <section className="px-5">
          <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Session History</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl glass">
                <div>
                  <p className="font-bold text-sm">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.action}</p>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge level={h.level} />
                  <p className="font-black text-sm">RM{h.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== MODALS ===== */}
      <AnimatePresence>
        {/* MERCHANT SELECTION */}
        {step === "scan" && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={reset} className="absolute inset-0 bg-black/75" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-md bg-app rounded-t-[2rem] p-6 shadow-2xl border-t border-white/10 z-10"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-5" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">Choose a Merchant</h2>
                <button onClick={reset} className="p-2 rounded-full bg-secondary"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Simulating a QR / tap payment at...</p>
              <div className="grid grid-cols-2 gap-3">
                {merchants.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMerchant(m)}
                    className="p-4 rounded-2xl glass text-left hover:bg-white/10 transition-colors active:scale-95"
                  >
                    <p className="text-2xl mb-1">{m.icon}</p>
                    <p className="font-bold text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.category} · RM{m.amount}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* PAYMENT CONFIRM */}
        {step === "confirm" && selectedMerchant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={reset} className="absolute inset-0 bg-black/75" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 shadow-2xl border border-white/10 text-center z-10"
            >
              <p className="text-5xl mb-3">{selectedMerchant.icon}</p>
              <h3 className="text-xl font-black mb-1">{selectedMerchant.name}</h3>
              <p className="text-xs text-muted-foreground mb-5">{selectedMerchant.category}</p>

              <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-2 mb-6">
                <span className="text-lg font-bold text-muted-foreground">RM</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="bg-transparent outline-none text-3xl font-black w-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                />
              </div>

              <div className="space-y-3">
                <button onClick={handlePay} className="w-full py-4 rounded-2xl bg-primary-gradient text-primary-foreground font-black shadow-glow active:scale-95 transition-transform">
                  Pay Now via GXSecure 🔒
                </button>
                <button onClick={reset} className="w-full py-3 rounded-2xl bg-secondary font-bold active:scale-95 transition-transform">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ⚠️ RISK WARNING */}
        {step === "warning" && riskResult && selectedMerchant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/85" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 shadow-2xl border border-white/10 z-10"
            >
              {/* Header */}
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${riskResult.level === "high" ? "bg-destructive/20" : "bg-warning/20"}`}>
                {riskResult.level === "high"
                  ? <ShieldX className={`h-8 w-8 text-destructive`} />
                  : <ShieldAlert className={`h-8 w-8 text-warning`} />
                }
              </div>
              <h3 className="text-xl font-black text-center mb-1">
                {riskResult.level === "high" ? "⚠️ Risky Purchase Detected" : "🤔 Heads Up!"}
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Paying RM{amount} to {selectedMerchant.name}
              </p>

              {/* Risk Score Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className={riskResult.level === "high" ? "text-destructive" : "text-warning"}>{riskResult.score}/100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskResult.score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${riskResult.level === "high" ? "bg-destructive" : "bg-warning"}`}
                  />
                </div>
              </div>

              {/* Reasons */}
              <div className="bg-secondary/50 rounded-2xl p-4 mb-4 space-y-2">
                {riskResult.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{r}</p>
                  </div>
                ))}
              </div>

              {/* Budget Impact */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-5">
                <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> Budget Impact</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Safe daily budget after:</span>
                  <span className={`font-bold ${riskResult.safeDailyBudget < 20 ? "text-destructive" : "text-foreground"}`}>RM{riskResult.safeDailyBudget.toFixed(0)}/day</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Days you can sustain:</span>
                  <span className={`font-bold ${riskResult.projectedSafedays < 5 ? "text-destructive" : "text-foreground"}`}>{riskResult.projectedSafedays} days</span>
                </div>
              </div>

              {/* 🐹 GX Buddy Message */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mb-5">
                <p className="text-xs text-primary font-bold">🐹 GX Buddy says:</p>
                <p className="text-xs text-primary mt-1 italic">
                  {riskResult.level === "high"
                    ? `"This purchase would leave you RM${(userState.balance - amount).toFixed(0)} for ${userState.daysToAllowance} days. That's tough! Consider delaying until ${userState.allowanceDate}."`
                    : `"Just a gentle reminder — you've already spent over your daily budget. This one is up to you, but I'm keeping track! 👀"`
                  }
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleDelay}
                  className="w-full py-3.5 rounded-2xl bg-primary-gradient text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-glow"
                >
                  <Clock className="h-4 w-4" /> Delay Purchase
                </button>
                <button
                  onClick={handleContinueAnyway}
                  className="w-full py-3.5 rounded-2xl bg-secondary text-foreground font-bold active:scale-95 transition-transform"
                >
                  Continue Payment Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ✅ SUCCESS */}
        {step === "success" && selectedMerchant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/75" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 shadow-2xl border border-white/10 text-center z-10"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </motion.div>
              <h3 className="text-xl font-black mb-1">Payment Sent! 💸</h3>
              <p className="text-3xl font-black text-primary mt-3 mb-1">RM{amount}</p>
              <p className="text-sm text-muted-foreground mb-2">to {selectedMerchant.name}</p>
              <div className="bg-secondary/50 rounded-xl p-3 mb-6">
                <p className="text-xs text-muted-foreground">Remaining balance</p>
                <p className="font-black text-lg">RM{userState.balance - amount}</p>
              </div>
              <button onClick={reset} className="w-full py-3.5 rounded-2xl bg-primary-gradient text-primary-foreground font-bold active:scale-95">Done</button>
            </motion.div>
          </div>
        )}

        {/* ✅ DELAYED */}
        {step === "delayed" && selectedMerchant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/75" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 shadow-2xl border border-white/10 text-center z-10"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="text-5xl mb-4">🦸</motion.div>
              <h3 className="text-xl font-black mb-2">Smart Move! 💪</h3>
              <p className="text-sm text-muted-foreground mb-4">You chose to delay this purchase. Your future self thanks you!</p>
              <div className="bg-success/10 border border-success/20 rounded-2xl p-4 mb-5 text-left">
                <p className="text-xs font-bold text-success mb-1 flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Money Saved</p>
                <p className="font-black text-2xl text-success">RM{amount}</p>
                <p className="text-xs text-muted-foreground mt-1">stays in your account until {userState.allowanceDate}</p>
              </div>
              <button onClick={reset} className="w-full py-3.5 rounded-2xl bg-primary-gradient text-primary-foreground font-bold active:scale-95">Back to Guardian</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
