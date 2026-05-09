import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChevronLeft, Plus, Send, MoreHorizontal, Copy, Info, TrendingUp, ArrowDownRight, ShieldCheck, Pocket, Zap, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { user } from "@/lib/data";

export const Route = createFileRoute("/main-account")({
  component: MainAccount,
});

function MainAccount() {
  const router = useRouter();
  
  // Real balance from the fake database
  const mainBalance = user.balance; 
  
  // Money stored inside GX Buddy Features
  const salaryShield = 600;
  const emergencyBuffer = 350;
  const squadPocket = 150;
  const totalAssets = mainBalance + salaryShield + emergencyBuffer + squadPocket;

  return (
    <AppShell>
      <div className="min-h-screen bg-background text-foreground flex flex-col pb-20">
        {/* Header exactly like GXBank */}
        <div className="px-5 pt-8 pb-4">
          <button onClick={() => router.history.back()} className="mb-6 -ml-2 p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <p className="text-sm font-semibold mb-1 text-foreground/90">Main account</p>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">RM{mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>8888-02078779-2</span>
            <Copy className="h-3 w-3 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-6 flex justify-between items-center">
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="h-14 w-14 rounded-full border border-primary/50 flex items-center justify-center group-active:scale-95 transition-transform bg-primary/10 hover:bg-primary/20">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <span className="text-[11px] font-semibold text-foreground/90">Add money</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="h-14 w-14 rounded-full bg-[#771FFF] flex items-center justify-center group-active:scale-95 transition-transform hover:bg-[#771FFF]/90 shadow-[0_0_15px_rgba(119,31,255,0.4)]">
              <Send className="h-6 w-6 text-white" />
            </div>
            <span className="text-[11px] font-semibold text-foreground/90">Send money</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center group-active:scale-95 transition-transform hover:bg-secondary/80">
              <MoreHorizontal className="h-6 w-6 text-foreground" />
            </div>
            <span className="text-[11px] font-semibold text-foreground/90">More</span>
          </div>
        </div>

        {/* Interest Earned Card */}
        <div className="px-5 mb-8">
          <Card className="p-4 bg-secondary/40 border-0 rounded-2xl flex items-center justify-between shadow-none hover:bg-secondary/60 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border/40">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-success font-bold text-sm">RM1.24</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight font-medium">Interest earned since account opened<br/>Current interest at 2.00% p.a.</p>
              </div>
            </div>
            <Info className="h-4 w-4 text-muted-foreground" />
          </Card>
        </div>

        {/* UPGRADED BREAKDOWN SECTION */}
        <div className="px-5 mb-8">
          <div className="flex justify-between items-end mb-3 px-1">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Wealth Breakdown</h2>
            <p className="text-sm font-extrabold text-foreground">RM {totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          
          <Card className="p-1 rounded-3xl bg-secondary/30 border-0 overflow-hidden shadow-none">
            <div className="p-3 bg-card rounded-2xl flex items-center justify-between border border-border/50 shadow-card mb-1">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Main Account</p>
                  <p className="text-[9px] text-muted-foreground">Available to spend instantly</p>
                </div>
              </div>
              <p className="font-bold text-primary">RM {mainBalance.toLocaleString()}</p>
            </div>
            
            <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground/80">Salary Shield Vault</p>
              </div>
              <p className="font-medium text-foreground/80">RM {salaryShield.toLocaleString()}</p>
            </div>
            <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground/80">Emergency Buffer</p>
              </div>
              <p className="font-medium text-foreground/80">RM {emergencyBuffer.toLocaleString()}</p>
            </div>
            <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Pocket className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground/80">Squad Pockets (Total)</p>
              </div>
              <p className="font-medium text-foreground/80">RM {squadPocket.toLocaleString()}</p>
            </div>
          </Card>
          <p className="text-[10px] text-muted-foreground text-center mt-3 mx-4 leading-relaxed">
            Your Main Account balance <strong className="text-foreground/80">does not</strong> include money locked in Buddy's vaults to prevent accidental spending.
          </p>
        </div>

        {/* Transactions list */}
        <div className="flex-1 bg-card/40 rounded-t-3xl pt-6 px-5 border-t border-border/30">
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">May</h2>
          <div className="space-y-5">
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold mb-2">4 May 2026</p>
              <Card className="p-4 bg-secondary/40 border-0 rounded-2xl flex items-center justify-between hover:bg-secondary/60 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border/40">
                    <ArrowDownRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">AVIDIAN DIPESH SIVA</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">11:25 PM</p>
                  </div>
                </div>
                <p className="text-success font-bold text-sm">+RM20.00</p>
              </Card>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold mb-2">2 May 2026</p>
              <Card className="p-4 bg-secondary/40 border-0 rounded-2xl flex items-center justify-between hover:bg-secondary/60 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border/40">
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Steam Games</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">04:12 PM</p>
                  </div>
                </div>
                <p className="text-foreground font-bold text-sm">-RM45.00</p>
              </Card>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
