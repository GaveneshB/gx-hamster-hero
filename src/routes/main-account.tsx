import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  ChevronLeft, Plus, Send, MoreHorizontal, Copy, Info, TrendingUp,
  ArrowDownRight, Pocket, Zap, ArrowUpRight, Coins, ChevronRight, Brain,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { user, transactions } from "@/lib/data";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/main-account")({
  component: MainAccount,
});

type RoundTo = 0.5 | 1;
function calcRoundUp(amount: number, roundTo: RoundTo): number {
  const abs = Math.abs(amount);
  const ceiled = roundTo === 0.5 ? Math.ceil(abs * 2) / 2 : Math.ceil(abs);
  const diff = parseFloat((ceiled - abs).toFixed(2));
  return diff === 0 ? roundTo : diff;
}
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const s = window.localStorage.getItem(key); return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}

const squadPocket  = 150;

function MainAccount() {
  const router = useRouter();
  const mainBalance = user.balance;

  const roundTo       = getStored<RoundTo>("gx_roundTo", 1);
  const autoEnabled   = getStored<boolean>("gx_enabled", true);
  const autoCollected = getStored<boolean>("gx_collected", false);

  const goals = getStored<{ id: number; saved: number }[]>("gx_goals2", [
    { id: 1, saved: 31 }, { id: 2, saved: 10 }, { id: 3, saved: 5 },
  ]);
  const bills = getStored<{ id: number; saved: number }[]>("gx_bills2", [
    { id: 1, saved: 35 }, { id: 2, saved: 10 }, { id: 3, saved: 18 },
  ]);

  // Buddy Shield Vault balances (read from localStorage, same keys as buddy-shield-vault page)
  const shieldVaultBalance    = getStored<number>("gx_vault_balance", 450);
  const shieldBufferBalance   = getStored<number>("gx_emergency_buffer_balance", 150);
  const buddyShieldTotal      = parseFloat((shieldVaultBalance + shieldBufferBalance).toFixed(2));

  const spends = transactions.filter((t) => t.amount < 0);
  const pendingTotal = autoEnabled && !autoCollected
    ? parseFloat(spends.reduce((s, t) => s + calcRoundUp(t.amount, roundTo), 0).toFixed(2))
    : 0;
  const goalSaved    = goals.reduce((s, g) => s + g.saved, 0);
  const billSaved    = bills.reduce((s, b) => s + b.saved, 0);
  const autoSaveVault = parseFloat((goalSaved + billSaved + (autoCollected ? pendingTotal : 0)).toFixed(2));
  const totalAssets   = mainBalance + buddyShieldTotal + autoSaveVault + squadPocket;

  const recentTxns = transactions.slice(0, 5);
  const [tab, setTab] = useState<"wealth" | "activity">("wealth");

  return (
    <AppShell>
      <div className="min-h-screen bg-background text-foreground flex flex-col pb-24">

        {/* Header */}
        <div className="px-5 pt-8 pb-3">
          <button onClick={() => router.history.back()} className="mb-5 -ml-2 p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <p className="text-xs font-semibold mb-0.5 text-foreground/70 uppercase tracking-widest">Main account</p>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold mb-1.5 tracking-tight">
            RM{mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </motion.h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>8888-02078779-2</span>
            <Copy className="h-3 w-3 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-4 flex justify-between items-center">
          {([
            { Icon: Plus,           label: "Add money",  bg: "border border-primary/50 bg-primary/10 hover:bg-primary/20",       iconCls: "text-primary" },
            { Icon: Send,           label: "Send money", bg: "bg-[#771FFF] hover:bg-[#771FFF]/90 shadow-[0_0_15px_rgba(119,31,255,0.4)]", iconCls: "text-white" },
            { Icon: MoreHorizontal, label: "More",       bg: "bg-secondary hover:bg-secondary/80",                               iconCls: "text-foreground" },
          ] as const).map(({ Icon, label, bg, iconCls }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className={`h-13 w-13 rounded-full flex items-center justify-center group-active:scale-95 transition-transform ${bg}`}>
                <Icon className={`h-5 w-5 ${iconCls}`} />
              </div>
              <span className="text-[11px] font-semibold text-foreground/80">{label}</span>
            </div>
          ))}
        </div>

        {/* Interest Card */}
        <div className="px-5 mb-4">
          <Card className="p-3 bg-secondary/40 border-0 rounded-2xl flex items-center justify-between shadow-none hover:bg-secondary/60 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center border border-border/40">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-success font-bold text-sm">RM1.24</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Interest earned · 2.00% p.a.</p>
              </div>
            </div>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </Card>
        </div>

        {/* Tab Bar */}
        <div className="px-5 mb-3">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary/50 p-1">
            {(["wealth", "activity"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-xl py-2 text-xs font-bold capitalize transition-all ${tab === t ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground"}`}>
                {t === "wealth" ? "Wealth" : "Activity"}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* WEALTH TAB */}
          {tab === "wealth" && (
            <motion.div key="wealth" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-5 space-y-3">

              <div className="flex justify-between items-center px-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Wealth</p>
                <p className="text-sm font-extrabold">RM {totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>

              <Card className="rounded-3xl bg-secondary/30 border-0 overflow-hidden p-1 shadow-none space-y-0.5">

                {/* Main Account */}
                <div className="p-3 bg-card rounded-2xl flex items-center gap-3 border border-border/50 shadow-card">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Main Account</p>
                    <p className="text-[10px] text-muted-foreground">Available to spend</p>
                  </div>
                  <p className="font-bold text-primary text-sm">RM {mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>

                {/* Smart Auto-Save — total only, tap to view details in auto-save page */}
                <button
                  onClick={() => router.navigate({ to: "/auto-save" })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors rounded-2xl"
                >
                  <div className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                    <Coins className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">Smart Auto-Save</p>
                    <p className="text-[10px] text-muted-foreground">Total round-ups saved</p>
                  </div>
                  <p className="font-bold text-accent text-sm">RM {autoSaveVault.toFixed(2)}</p>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>

                {/* Buddy Shield Vault */}
                <button
                  onClick={() => router.navigate({ to: "/buddy-shield-vault" })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors rounded-2xl"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">Buddy Shield Vault</p>
                    <p className="text-[10px] text-muted-foreground">Protected student money</p>
                  </div>
                  <p className="font-bold text-primary text-sm">RM {buddyShieldTotal.toFixed(2)}</p>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>

                {/* Squad Pockets */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Pocket className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground/80">Squad Pockets</p>
                    <p className="text-[10px] text-muted-foreground">Shared group balance</p>
                  </div>
                  <p className="font-semibold text-foreground/80 text-sm">RM {squadPocket.toLocaleString()}.00</p>
                </div>

              </Card>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed px-4">
                Main Account balance does <strong className="text-foreground/70">not</strong> include money in Buddy's vaults.
              </p>
            </motion.div>
          )}

          {/* ACTIVITY TAB */}
          {tab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-5 space-y-3">

              {/* Auto-save cycle summary */}
              <Card className="p-3 rounded-2xl border-0 bg-primary/8 border border-primary/20 shadow-none">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary/20 grid place-items-center shrink-0">
                    <Coins className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">Smart Auto-Save this cycle</p>
                    <p className="text-[11px] text-muted-foreground">
                      RM {billSaved.toFixed(2)} to bills · RM {goalSaved.toFixed(2)} to goals
                      {pendingTotal > 0 ? ` · RM${pendingTotal.toFixed(2)} pending` : ""}
                    </p>
                  </div>
                  <button onClick={() => router.navigate({ to: "/auto-save" })} className="text-[10px] font-bold text-primary flex items-center gap-0.5 shrink-0">
                    Details <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </Card>

              {/* Recent transactions */}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-0.5">Recent Transactions</p>
                <Card className="rounded-2xl border-0 shadow-card overflow-hidden">
                  {recentTxns.map((txn, i) => {
                    const isIncome = txn.amount > 0;
                    return (
                      <motion.div key={txn.id}
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 hover:bg-white/3 transition-colors cursor-pointer"
                      >
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/30">
                          {isIncome
                            ? <ArrowDownRight className="h-4 w-4 text-success" />
                            : <ArrowUpRight   className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{txn.name}</p>
                          <p className="text-[10px] text-muted-foreground">{(txn as any).date ?? "May 2026"}</p>
                        </div>
                        <p className={`text-sm font-bold shrink-0 ${isIncome ? "text-success" : "text-foreground"}`}>
                          {isIncome ? "+" : ""}RM{Math.abs(txn.amount).toFixed(2)}
                        </p>
                      </motion.div>
                    );
                  })}
                </Card>
              </div>

              {/* Full Buddy history link */}
              <button
                onClick={() => router.navigate({ to: "/auto-save" })}
                className="w-full rounded-2xl border border-border/30 bg-secondary/30 py-3 text-xs font-bold text-muted-foreground flex items-center justify-center gap-1.5 hover:bg-secondary/50 transition-colors"
              >
                <Brain className="h-3.5 w-3.5" /> View full Buddy activity <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </AppShell>
  );
}
