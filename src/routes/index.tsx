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
  X, ShieldAlert, ShieldX, ShieldCheck, AlertTriangle, BarChart3, Clock, CheckCircle2, Zap, Users, TrendingDown, Coins,
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
              { Icon: Plus, label: "Add money", active: false },
              { Icon: ScanLine, label: "Scan QR", active: true, onClick: () => setGStep("pick") },
              { Icon: Send, label: "Send money", active: false },
            ].map(({ Icon, label, active, onClick }) => (
              active ? (
                <button 
                  key={label} 
                  onClick={onClick} 
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <motion.div 
                    whileTap={{ scale: 0.9 }} 
                    className="h-12 w-12 rounded-full bg-primary-gradient grid place-items-center shadow-glow group-hover:scale-110 transition-transform duration-300"
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </motion.div>
                  <span className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
                    {label}
                  </span>
                </button>
              ) : (
                <div key={label} className="flex flex-col items-center gap-2 opacity-50 grayscale">
                  <div className="h-12 w-12 rounded-full bg-white/10 grid place-items-center">
                    <Icon className="h-5 w-5 text-white/50" />
                  </div>
                  <span className="text-xs font-semibold text-white/50">
                    {label}
                  </span>
                </div>
              )
            ))}
          </div>
        </Card>
      </section>

      {/* ENLARGED GX BUDDY CARD */}
      <section className="px-5 mt-6">
        <Link to="/coach" className="block active:scale-[0.98] transition-transform group">
          <Card className="p-5 rounded-[2rem] glass-strong shadow-card flex items-center justify-between border border-[#771FFF]/40 relative overflow-hidden">
            <div aria-hidden className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#771FFF]/20 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="h-16 w-16 rounded-full bg-[#0C0121] flex items-center justify-center shrink-0 border-2 border-[#771FFF]/50 overflow-hidden shadow-[0_0_20px_rgba(119,31,255,0.3)]">
                <Hamster mood={hamsterMood} size={55} float={true} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-black text-white tracking-wide">GX Buddy</p>
                  <span className="px-1.5 py-[2px] bg-[#F8326D] rounded text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                    NEW
                  </span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed pr-2">
                  Your AI sidekick to build financial resilience. Try our buddy tools to outsmart impulse spending!
                </p>
                <div className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-white group-hover:bg-white/20 transition-colors">
                  Try it now <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>
            
            <ChevronRight className="h-6 w-6 text-white/30 relative z-10 group-hover:text-white transition-colors shrink-0" />
          </Card>
        </Link>
      </section>

      {/* Everyday account row — GXBank style */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Your everyday account</h2>
          <span className="text-xs text-muted-foreground">●●●</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/main-account">
            <Card className="p-4 rounded-2xl glass border-white/10 shadow-card h-full flex flex-col justify-between min-h-[140px] cursor-pointer hover:bg-white/5 transition-colors">
              <div>
                <p className="text-xs text-muted-foreground">Main account</p>
                <p className="text-lg font-extrabold mt-1">RM{user.balance.toLocaleString()}</p>
              </div>
              <div className="mt-3 flex items-center justify-between bg-primary/20 hover:bg-primary/30 transition-colors rounded-lg px-2 py-1.5 border border-primary/30">
                <p className="text-[10px] text-[#c1a3ff] font-bold uppercase tracking-widest">View Breakdown</p>
                <span className="text-[#c1a3ff] font-bold">→</span>
              </div>
            </Card>
          </Link>
          <div className="h-full">
            <Card className="p-4 rounded-2xl glass-strong border-white/10 shadow-card h-full flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div className="relative">
                <div className="flex items-center gap-1.5">
                <p className="text-[15px] font-bold">Pockets</p>
                <span className="px-1.5 py-[2px] bg-[#F8326D] rounded text-[8px] font-black text-white uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(248,50,109,0.5)] whitespace-nowrap">
                  NEW SQUAD POCKET
                </span>
              </div>
                <p className="text-[11px] text-white/70 mt-1">Earn up to 3.55% p.a.</p>
                <span className="inline-block mt-1.5 px-1.5 py-0.5 bg-[#4EE6E6] text-[#0C0121] text-[10px] font-bold rounded">Up to 3.55% p.a.</span>
              </div>
              <button onClick={() => setPocketStep("type")} className="relative z-10 mt-3 w-fit px-4 py-1 rounded-full border border-white/80 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer">Create</button>
            </Card>
          </div>
        </div>
      </section>

      {/* For you today */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">For you today</h2>
        <div className="space-y-3">
          {/* Pre-Spending Warning Card */}
          <button onClick={() => setGStep("pick")} className="w-full text-left">
            <Card className="p-4 rounded-3xl glass-strong border-white/10 shadow-card relative overflow-hidden cursor-pointer">
              <div aria-hidden className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-[#771FFF]/20 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="relative h-24 w-24 grid place-items-center shrink-0">
                  <span aria-hidden className="absolute h-24 w-24 rounded-full border border-[#771FFF]/40 animate-pulse-ring" />
                  <span aria-hidden className="absolute h-16 w-16 rounded-full border border-[#771FFF]/60 animate-pulse-ring" style={{ animationDelay: "0.6s" }} />
                  <div className="h-12 w-12 rounded-full bg-[#771FFF] grid place-items-center shadow-[0_0_20px_rgba(119,31,255,0.5)]">
                    <ShieldAlert className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold flex items-center gap-2">
                    Pre-Spending Warning
                    <span className="bg-[#4EE6E6]/20 text-[#4EE6E6] text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-[#4EE6E6]/20">Active</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    Warns you on <span className="font-bold text-white">Scan QR</span> & <span className="font-bold text-white">Send Money</span> — only if the payment is risky. Essential transactions go straight through.
                  </p>
                  <div className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-white group-hover:bg-white/20 transition-colors">
                    Try it now <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Card>
          </button>

          {/* Squad Pocket Card */}
          <Link to="/group-challenges" className="block text-left group">
            <Card className="p-4 rounded-3xl glass-strong border-white/10 shadow-card relative overflow-hidden transition-all duration-300 group-hover:bg-white/5">
              <div aria-hidden className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-[#F8326D]/20 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="relative h-24 w-24 grid place-items-center shrink-0">
                  <span aria-hidden className="absolute h-24 w-24 rounded-full border border-[#F8326D]/40 animate-pulse-ring" />
                  <span aria-hidden className="absolute h-16 w-16 rounded-full border border-[#F8326D]/60 animate-pulse-ring" style={{ animationDelay: "0.6s" }} />
                  <div className="h-12 w-12 rounded-full bg-[#F8326D] grid place-items-center shadow-[0_0_20px_rgba(248,50,109,0.5)]">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    Squad Pockets
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    Saving for a <span className="font-bold text-white">shared goal</span>? Create a group pocket to <span className="font-bold text-white">save together</span> with your friends and track everyone's progress automatically.
                  </p>
                  <div className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-white group-hover:bg-white/20 transition-colors">
                    Create Pocket <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Your Insights */}
      <section className="mt-8 mb-32 px-5">
        <h2 className="text-base font-bold mb-3">Your insights</h2>
        <div className="flex overflow-x-auto snap-x hide-scrollbar pb-4 gap-8 no-scrollbar">
          
          {/* Insight 1: Buddy Shield Vault */}
          <div className="flex items-center gap-4 shrink-0 snap-start">
             <div className="h-12 w-12 rounded-full border-[2px] border-primary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
               <ShieldCheck className="h-6 w-6 text-primary" />
             </div>
             <div>
                <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Buddy Shield Vault</p>
                <p className="text-base font-medium text-foreground tracking-tight">RM600.00</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Emergency Vault</p>
             </div>
          </div>

          {/* Insight 2: Smart Auto-Save */}
          <div className="flex items-center gap-4 shrink-0 snap-start">
             <div className="h-12 w-12 rounded-full border-[2px] border-[#4EE6E6] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(78,230,230,0.2)]">
               <Coins className="h-6 w-6 text-[#4EE6E6]" />
             </div>
             <div>
                <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Smart Auto-Saved</p>
                <p className="text-base font-medium text-foreground tracking-tight">RM35.00</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">From Round-ups</p>
             </div>
          </div>

          {/* Insight 3: Squad Pocket */}
          <div className="flex items-center gap-4 shrink-0 snap-start pr-5">
             <div className="h-12 w-12 rounded-full border-[2px] border-[#F8326D] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(248,50,109,0.2)]">
               <Users className="h-6 w-6 text-[#F8326D]" />
             </div>
             <div>
                <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Squad Pocket Saved</p>
                <p className="text-base font-medium text-foreground tracking-tight">RM150.00</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Shared Goal</p>
             </div>
          </div>

        </div>
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
