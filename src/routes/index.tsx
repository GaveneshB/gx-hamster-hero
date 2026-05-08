import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import { user, transactions } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { getHamsterMood } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Shield, Mic, Eye, Plus, ScanLine, Send, HelpCircle, ChevronRight, Bell, Calendar,
  X, ShieldAlert, ShieldX, ShieldCheck, AlertTriangle, BarChart3, Clock, CheckCircle2, Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GX Buddy — Your AI Money Companion" },
      { name: "description", content: "GX Buddy is an AI-powered financial companion inside GXBank for young Malaysians. Build resilience, dodge debt, and meet your purple hamster mascot." },
      { property: "og:title", content: "GX Buddy — Your AI Money Companion" },
      { property: "og:description", content: "AI coaching, debt prediction, auto-savings & a cute purple hamster mascot." },
    ],
  }),
  component: Home,
});

// --- GUARDIAN DATA ---
const MERCHANTS = [
  { id: 1, name: "Tealive", icon: "🦹", category: "F&B", amount: 12 },
  { id: 2, name: "Shopee", icon: "🛍️", category: "Shopping", amount: 89 },
  { id: 3, name: "GrabFood", icon: "🍔", category: "Delivery", amount: 28 },
  { id: 4, name: "RapidKL", icon: "🚌", category: "Transport", amount: 2 },
  { id: 5, name: "Caring Pharmacy", icon: "💊", category: "Medical", amount: 25 },
  { id: 6, name: "Steam Game", icon: "🎮", category: "Gaming", amount: 59 },
];
const NECESSITY = ["Transport", "Medical", "Groceries"];
const IMPULSE = ["Shopping", "Gaming", "Entertainment", "Delivery"];
const MOCK = { balance: 312, dailyBudget: 30, daysLeft: 10, spentToday: 52, allowanceDate: "19 May" };

type RiskLevel = "safe" | "medium" | "high";
function calcRisk(amount: number, category: string) {
  let score = 0;
  const reasons: string[] = [];
  if (MOCK.spentToday >= MOCK.dailyBudget) { score += 35; reasons.push(`Already spent RM${MOCK.spentToday} today (budget: RM${MOCK.dailyBudget})`); }
  else if (MOCK.spentToday + amount > MOCK.dailyBudget) { score += 20; reasons.push(`Will push today to RM${MOCK.spentToday + amount}`); }
  if (IMPULSE.includes(category)) { score += 25; reasons.push(`${category} is non-essential`); }
  const left = MOCK.balance - amount;
  if (left < MOCK.dailyBudget * 3) { score += 30; reasons.push(`Only RM${left} left after payment`); }
  else if (left < MOCK.dailyBudget * 5) { score += 15; reasons.push(`RM${left} remaining after payment`); }
  if (amount > 50) { score += 10; reasons.push(`Large purchase (RM${amount})`); }
  if (NECESSITY.includes(category)) score = Math.max(0, score - 40);
  const level: RiskLevel = score >= 50 ? "high" : score >= 25 ? "medium" : "safe";
  return { level, score: Math.min(score, 100), reasons, safePerDay: ((MOCK.balance - amount) / MOCK.daysLeft).toFixed(0), safedays: Math.floor((MOCK.balance - amount) / MOCK.dailyBudget) };
}



function Home() {
  const [gStep, setGStep] = useState<"off" | "pick" | "confirm" | "warn" | "ok" | "delay">("off");
  const [pocketStep, setPocketStep] = useState<"off" | "type">("off");
  const [gMerchant, setGMerchant] = useState<typeof MERCHANTS[0] | null>(null);
  const [gAmt, setGAmt] = useState("");
  const [gRisk, setGRisk] = useState<ReturnType<typeof calcRisk> | null>(null);

  const gPay = () => {
    if (!gMerchant) return;
    const amt = parseInt(gAmt) || gMerchant.amount;
    const r = calcRisk(amt, gMerchant.category);
    setGRisk(r);
    if (r.level === "safe") { setGStep("ok"); }
    else { setGStep("warn"); }
  };
  const gConfirm = () => { toast(`RM${gAmt || gMerchant?.amount} paid to ${gMerchant?.name}`); setGStep("ok"); };
  const gDelay = () => setGStep("delay");
  const gReset = () => { setGStep("off"); setGMerchant(null); setGAmt(""); setGRisk(null); };

  const amt = parseInt(gAmt) || (gMerchant?.amount ?? 0);

  const buf = user.emergencyBuffer;
  const safeToSpend = user.safeToSpend;
  const hamsterMood = getHamsterMood(user.resilienceScore);

  return (
    <AppShell>
      {/* HERO — GXBank style */}
      <section className="relative px-5 pt-12 pb-6 bg-hero rounded-b-[2.5rem] overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-[oklch(0.7_0.25_330)]/40 blur-3xl" />
        <div aria-hidden className="absolute top-10 -left-20 h-60 w-60 rounded-full bg-primary/40 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/70">Total balance</p>
              <Shield className="h-3.5 w-3.5 text-white/70" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-[28px] font-extrabold tracking-tight text-white">RM{user.balance.toLocaleString()}</h1>
              <Eye className="h-4 w-4 text-white/70" />
            </div>
            <Link to="/me" className="flex items-center gap-1 mt-1 text-xs text-white/70">
              Balance info <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-full glass grid place-items-center" aria-label="help">
              <HelpCircle className="h-4 w-4 text-white" />
            </button>
            <button className="h-9 w-9 rounded-full glass grid place-items-center relative" aria-label="notifications">
              <Bell className="h-4 w-4 text-white" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
          </div>
        </div>

        {/* Action pills */}
        <Card className="relative mt-5 p-4 rounded-3xl glass-strong border-white/10 shadow-card">
          <div className="grid grid-cols-3 gap-2">
            {[
              { Icon: Plus, label: "Add money", to: "/auto-save", onClick: undefined },
              { Icon: ScanLine, label: "Scan QR", to: null, onClick: () => setGStep("pick") },
              { Icon: Send, label: "Send money", to: "/coach", onClick: undefined },
            ].map(({ Icon, label, to, onClick }) => (
              onClick
                ? <button key={label} onClick={onClick} className="flex flex-col items-center gap-2">
                    <motion.div whileTap={{ scale: 0.9 }} className="h-12 w-12 rounded-full bg-primary-gradient grid place-items-center shadow-glow">
                      <Icon className="h-5 w-5 text-white" />
                    </motion.div>
                    <span className="text-xs font-semibold text-white/90">{label}</span>
                  </button>
                : <Link key={label} to={to!} className="flex flex-col items-center gap-2">
                    <motion.div whileTap={{ scale: 0.9 }} className="h-12 w-12 rounded-full bg-primary-gradient grid place-items-center shadow-glow">
                      <Icon className="h-5 w-5 text-white" />
                    </motion.div>
                    <span className="text-xs font-semibold text-white/90">{label}</span>
                  </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* HAMSTER RESILIENCE DASHBOARD */}
      <section className="px-5 mt-5">
        <div className="rounded-[2rem] glass-strong shadow-card p-4 relative overflow-hidden border border-[#771FFF]/30">
          <div aria-hidden className="absolute top-0 right-0 w-32 h-32 bg-[#771FFF]/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-5 mb-4 relative z-10">
            {/* Hamster Circle Progress */}
            <div className="relative shrink-0 w-[72px] h-[72px]">
              <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle 
                  cx="50" cy="50" r="46" fill="none" stroke="#771FFF" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="289" strokeDashoffset={289 - (289 * user.resilienceScore) / 100} 
                  className="transition-all duration-1000" 
                />
              </svg>
              <div className="absolute inset-0 m-1.5 rounded-full bg-[#0C0121] flex items-center justify-center overflow-hidden">
                <Hamster mood={hamsterMood} size={50} float={true} />
              </div>
            </div>

            {/* Score & Safe to Spend */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Buddy Score</p>
                  <p className="text-2xl font-black text-white">{user.resilienceScore}<span className="text-sm text-white/40">/100</span></p>
                </div>
                <div className="px-2 py-0.5 bg-[#4EE6E6]/20 rounded-md border border-[#4EE6E6]/30">
                  <p className="text-[10px] text-[#4EE6E6] font-bold uppercase tracking-wider">{user.resilienceScore >= 80 ? 'Excellent' : 'Good'}</p>
                </div>
              </div>
              
              <div className="mt-2 bg-black/40 rounded-xl p-2 border border-white/5 flex items-center justify-between">
                <p className="text-[11px] text-white/70 font-semibold px-2">Safe to spend today</p>
                <div className="bg-[#771FFF]/20 px-2 py-1 rounded-lg">
                  <p className="text-sm font-black text-white">RM {safeToSpend.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action / How to increase */}
          <Link to="/emergency" className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between group active:scale-95 transition-transform">
            <div className="flex items-start gap-2">
              <span className="text-sm">💡</span>
              <p className="text-xs text-white/80 leading-snug">
                <span className="font-bold text-white">To reach 85:</span> Top up your Emergency Buffer by RM50.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </section>

      {/* Everyday account row — GXBank style */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Your everyday account</h2>
          <span className="text-xs text-muted-foreground">●●●</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/me">
            <Card className="p-4 rounded-2xl glass border-white/10 shadow-card h-full flex flex-col justify-between min-h-[140px]">
              <div>
                <p className="text-xs text-muted-foreground">Main account</p>
                <p className="text-lg font-extrabold mt-1">RM{user.balance.toLocaleString()}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">View transactions</p>
            </Card>
          </Link>
          <div className="h-full">
            <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card h-full flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div className="relative">
                <p className="text-[15px] font-bold">Pockets</p>
                <p className="text-[11px] text-white/70 mt-1">Earn up to 3.55% p.a.</p>
                <span className="inline-block mt-1.5 px-1.5 py-0.5 bg-[#4EE6E6] text-[#0C0121] text-[10px] font-bold rounded">Up to 3.55% p.a.</span>
              </div>
              <button onClick={() => setPocketStep("type")} className="relative z-10 mt-3 w-fit px-4 py-1 rounded-full border border-white/80 text-xs font-semibold hover:bg-white/10 transition-colors">Create</button>
            </Card>
          </div>
        </div>
      </section>

      {/* For you today */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">For you today</h2>
        <Card className="p-4 rounded-3xl glass-strong border-white/10 shadow-card relative overflow-hidden">
          <div aria-hidden className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-mint/30 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="relative h-24 w-24 grid place-items-center shrink-0">
              <span aria-hidden className="absolute h-24 w-24 rounded-full border border-mint/40 animate-pulse-ring" />
              <span aria-hidden className="absolute h-16 w-16 rounded-full border border-mint/60 animate-pulse-ring" style={{ animationDelay: "0.6s" }} />
              <div className="h-12 w-12 rounded-full bg-mint-gradient grid place-items-center shadow-glow">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Emergency Buffer</p>
              <p className="text-[11px] text-muted-foreground">RM{buf.current.toFixed(2)} of RM{buf.target} — Buddy stashing round-ups</p>
              <Progress value={(buf.current / buf.target) * 100} className="h-1.5 mt-2" />
              <Link to="/emergency" className="inline-flex mt-3 px-3 py-1.5 rounded-full border border-white/30 text-xs font-semibold">Top up now</Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Transactions */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">Recent Activity</h2>
        <Card className="rounded-2xl glass border-white/10 shadow-card divide-y divide-white/5 overflow-hidden">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3">
              <div className={`h-10 w-10 rounded-xl grid place-items-center text-xs font-bold ${
                t.risk === "save" ? "bg-mint/20 text-mint" :
                t.risk === "high" ? "bg-destructive/20 text-destructive" :
                t.risk === "med" ? "bg-warning/20 text-warning" :
                "bg-white/10 text-foreground"
              }`}>{t.category[0]}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.category} · {t.time}</p>
              </div>
              <p className={`text-sm font-bold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>
                {t.amount > 0 ? "+" : ""}RM {Math.abs(t.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </Card>
      </section>
      {/* ===== PAYMENT GUARDIAN MODALS ===== */}
      <AnimatePresence>
        {/* POCKET SELECTION MODAL */}
        {pocketStep === "type" && (
          <div className="fixed inset-0 z-[100] flex items-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPocketStep("off")} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="relative w-full bg-app rounded-t-[2rem] p-6 z-10 border-t border-white/10">
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black">Create a Pocket</h2>
                <button onClick={() => setPocketStep("off")} className="p-2 rounded-full bg-secondary"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">How would you like to save?</p>
              <div className="grid gap-3">
                <button onClick={() => { setPocketStep("off"); toast("Solo pocket created!"); }} className="flex items-center gap-4 p-4 rounded-2xl glass text-left hover:bg-white/10 active:scale-95 transition-all">
                  <div className="h-12 w-12 rounded-full bg-secondary grid place-items-center text-xl">👤</div>
                  <div>
                    <p className="font-bold text-sm">Solo Pocket</p>
                    <p className="text-xs text-muted-foreground">Save for your own personal goals</p>
                  </div>
                </button>
                <Link to="/group-challenges" onClick={() => setPocketStep("off")} className="flex items-center gap-4 p-4 rounded-2xl bg-primary/20 border border-primary/30 text-left hover:bg-primary/30 active:scale-95 transition-all relative overflow-hidden">
                  <div aria-hidden className="absolute -right-4 -top-4 h-16 w-16 bg-primary/30 blur-2xl rounded-full" />
                  <div className="h-12 w-12 rounded-full bg-primary-gradient grid place-items-center text-xl text-white shadow-glow">👥</div>
                  <div>
                    <p className="font-bold text-sm text-primary-foreground">Squad Pocket <span className="ml-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-sm">NEW</span></p>
                    <p className="text-xs text-primary/80">Save together with friends & earn badges</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {/* MERCHANT PICKER */}
        {gStep === "pick" && (
          <div className="fixed inset-0 z-[100] flex items-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={gReset} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="relative w-full bg-app rounded-t-[2rem] p-6 z-10 border-t border-white/10">
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black">Scan & Pay</h2>
                <button onClick={gReset} className="p-2 rounded-full bg-secondary"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Select a merchant to simulate payment</p>
              <div className="grid grid-cols-3 gap-3">
                {MERCHANTS.map(m => (
                  <button key={m.id} onClick={() => { setGMerchant(m); setGAmt(m.amount.toString()); setGStep("confirm"); }}
                    className="p-3 rounded-2xl glass text-center hover:bg-white/10 active:scale-95 transition-all">
                    <p className="text-2xl mb-1">{m.icon}</p>
                    <p className="font-bold text-xs">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">RM{m.amount}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* CONFIRM */}
        {gStep === "confirm" && gMerchant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={gReset} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 text-center z-10 border border-white/10">
              <p className="text-5xl mb-2">{gMerchant.icon}</p>
              <h3 className="text-xl font-black">{gMerchant.name}</h3>
              <p className="text-xs text-muted-foreground mb-5">{gMerchant.category}</p>
              <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-2 mb-5">
                <span className="text-lg font-bold text-muted-foreground">RM</span>
                <input type="number" value={gAmt} onChange={e => setGAmt(e.target.value)}
                  className="bg-transparent outline-none text-3xl font-black w-full [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]" />
              </div>
              <div className="space-y-3">
                <button onClick={gPay} className="w-full py-4 rounded-2xl bg-primary-gradient text-primary-foreground font-black shadow-glow active:scale-95">Pay via GXSecure 🔒</button>
                <button onClick={gReset} className="w-full py-3 rounded-2xl bg-secondary font-bold">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* WARNING */}
        {gStep === "warn" && gRisk && gMerchant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: "spring", damping: 22 }}
              className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 z-10 border border-white/10 overflow-y-auto max-h-[90vh]">
              <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3 ${gRisk.level === "high" ? "bg-destructive/20" : "bg-warning/20"}`}>
                {gRisk.level === "high" ? <ShieldX className="h-7 w-7 text-destructive" /> : <ShieldAlert className="h-7 w-7 text-warning" />}
              </div>
              <h3 className="text-lg font-black text-center mb-1">{gRisk.level === "high" ? "⚠️ Risky Purchase!" : "🤔 Heads Up"}</h3>
              <p className="text-xs text-muted-foreground text-center mb-4">Paying RM{amt} to {gMerchant.name}</p>
              {/* Risk bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className={gRisk.level === "high" ? "text-destructive" : "text-warning"}>{gRisk.score}/100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${gRisk.score}%` }} transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${gRisk.level === "high" ? "bg-destructive" : "bg-warning"}`} />
                </div>
              </div>
              {/* Reasons */}
              <div className="bg-secondary/50 rounded-2xl p-3 mb-3 space-y-1.5">
                {gRisk.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">{r}</p>
                  </div>
                ))}
              </div>
              {/* Impact */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mb-3 space-y-2">
                <p className="text-xs font-bold text-primary flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> What happens if you pay?</p>
                <div className="flex items-start gap-2">
                  <span className="text-base">💸</span>
                  <p className="text-xs text-muted-foreground">You'll have <span className="font-bold text-foreground">RM{MOCK.balance - amt}</span> left in your account for the next <span className="font-bold text-foreground">{MOCK.daysLeft} days</span> until your allowance on <span className="font-bold text-foreground">{MOCK.allowanceDate}</span>.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">📅</span>
                  <p className="text-xs text-muted-foreground">That works out to roughly <span className="font-bold text-foreground">RM{gRisk.safePerDay} per day</span> — which is {parseInt(gRisk.safePerDay) < 20 ? <span className="text-destructive font-bold">very tight</span> : "manageable"} for food, transport, and daily needs.</p>
                </div>
                {gRisk.safedays < MOCK.daysLeft && (
                  <div className="flex items-start gap-2">
                    <span className="text-base">⚠️</span>
                    <p className="text-xs text-muted-foreground">At your usual spending rate, your money may <span className="font-bold text-destructive">run out in {gRisk.safedays} days</span> — before your next allowance arrives.</p>
                  </div>
                )}
              </div>
              <div className="space-y-2.5">
                <button onClick={gDelay} className="w-full py-3.5 rounded-2xl bg-primary-gradient text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-95 shadow-glow"><Clock className="h-4 w-4" /> Delay Purchase</button>
                <button onClick={gConfirm} className="w-full py-3.5 rounded-2xl bg-secondary font-bold active:scale-95">Continue Anyway</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* SUCCESS */}
        {gStep === "ok" && gMerchant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 text-center z-10 border border-white/10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto w-14 h-14 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </motion.div>
              <h3 className="text-xl font-black mb-1">Payment Sent! 💸</h3>
              <p className="text-3xl font-black text-primary mt-3 mb-1">RM{amt}</p>
              <p className="text-sm text-muted-foreground mb-4">to {gMerchant.name}</p>
              <div className="bg-secondary/50 rounded-xl p-3 mb-5"><p className="text-xs text-muted-foreground">Remaining balance</p><p className="font-black text-lg">RM{MOCK.balance - amt}</p></div>
              <button onClick={gReset} className="w-full py-3.5 rounded-2xl bg-primary-gradient text-primary-foreground font-bold active:scale-95">Done</button>
            </motion.div>
          </div>
        )}

        {/* DELAYED */}
        {gStep === "delay" && gMerchant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 text-center z-10 border border-white/10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="text-5xl mb-3">🦸</motion.div>
              <h3 className="text-xl font-black mb-2">Smart Move! 💪</h3>
              <p className="text-sm text-muted-foreground mb-4">You chose to delay this purchase. Your future self thanks you!</p>
              <div className="bg-success/10 border border-success/20 rounded-2xl p-4 mb-5 text-left">
                <p className="text-xs font-bold text-success mb-1 flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Money Saved</p>
                <p className="font-black text-2xl text-success">RM{amt}</p>
                <p className="text-xs text-muted-foreground mt-1">stays in your account until {MOCK.allowanceDate}</p>
              </div>
              <button onClick={gReset} className="w-full py-3.5 rounded-2xl bg-primary-gradient text-primary-foreground font-bold active:scale-95">Back to Home</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
