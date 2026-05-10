import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Hamster, type Mood } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, AlertTriangle, CheckCircle2, TrendingDown, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/debt-radar")({
  head: () => ({ meta: [{ title: "Debt Risk Radar — GX Buddy" }, { name: "description", content: "AI-predicted cashflow deficit impact." }] }),
  component: DebtRadar,
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-3 shadow-card">
        <p className="text-xs font-bold mb-2 text-foreground">{label}</p>
        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive/50"></span>
              Current Burn Rate:
            </span>
            <span className="font-bold text-foreground">RM {payload[0].value}</span>
          </p>
          {payload[1] && (
            <p className={`text-[11px] font-bold flex items-center justify-between gap-4 ${payload[1].value < 0 ? 'text-destructive' : 'text-primary'}`}>
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${payload[1].value < 0 ? 'bg-destructive' : 'bg-primary'}`}></span>
                Adjusted Spend:
              </span>
              <span>RM {payload[1].value}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

function DebtRadar() {
  const router = useRouter();
  const [reduceSpendPerDay, setReduceSpendPerDay] = useState(0);

  // Constants to simulate a user spending too fast
  const startingBalance = 400; // RM400
  const currentBurnRate = 22; // spending RM22/day
  const daysInMonth = 30;

  const chartData = useMemo(() => {
    const data = [];
    for (let day = 0; day <= daysInMonth; day++) {
      // Base trajectory: spending RM22/day
      const baseBalance = startingBalance - (currentBurnRate * day);
      
      // Projected: reducing spend by 'reduceSpendPerDay' each day
      const projectedBalance = startingBalance - ((currentBurnRate - reduceSpendPerDay) * day);

      data.push({
        day: `Day ${day}`,
        base: Math.round(baseBalance),
        projected: Math.round(projectedBalance),
      });
    }
    return data;
  }, [reduceSpendPerDay]);

  const lowestBase = chartData[daysInMonth].base;
  const lowestProjected = chartData[daysInMonth].projected;
  
  let mood: Mood = "happy";
  let toneClass = "bg-success/10 border-success/30";
  let textColor = "text-success";
  let icon = <CheckCircle2 className="h-6 w-6 text-success" />;
  let riskLevel = "Safe Zone";
  let message = "Your spending speed is healthy. You will easily make it to the end of the month!";

  if (lowestProjected < 0) {
    mood = "worried";
    toneClass = "bg-destructive/10 border-destructive/30";
    textColor = "text-destructive";
    icon = <ShieldAlert className="h-6 w-6 text-destructive" />;
    riskLevel = "Deficit Risk";
    message = `Warning: At your current spending speed, you'll be RM${Math.abs(lowestProjected)} in debt by Day 30.`;
  } else if (lowestProjected < 60) {
    mood = "sleepy";
    toneClass = "bg-warning/10 border-warning/30";
    textColor = "text-warning";
    icon = <AlertTriangle className="h-6 w-6 text-warning" />;
    riskLevel = "Medium Risk";
    message = "Cutting it close. Your balance will be dangerously low by the end of the month.";
  }

  // Calculate required savings to prevent going into negative BEFORE slider offset
  const requiredDailySave = useMemo(() => {
     if (lowestBase >= 0) return 0;
     const required = currentBurnRate - (startingBalance / daysInMonth);
     return Math.ceil(required);
  }, [lowestBase]);

  return (
    <AppShell>
      <div className="px-5 pt-4 pb-3">
        <button 
          onClick={() => router.history.back()} 
          className="text-sm text-primary font-medium flex items-center mb-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Debt Risk Radar</h1>
          <p className="text-sm text-muted-foreground">30-Day Deficit Predictor</p>
        </div>
      </div>

      <div className="px-5 pb-12 space-y-4">
        
        {/* Dynamic Hero Section */}
        <Card className={`p-5 rounded-3xl border shadow-card relative overflow-hidden transition-all duration-500 ${toneClass}`}>
          <div className="absolute top-4 right-4">{icon}</div>
          <div className="flex flex-col items-center text-center mt-2">
            <AnimatePresence mode="popLayout">
              <motion.div key={mood} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative">
                <div aria-hidden className="absolute inset-0 bg-white/10 blur-2xl rounded-full" />
                <Hamster mood={mood} size={100} />
              </motion.div>
            </AnimatePresence>
            <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold mt-4">Cashflow Trajectory</p>
            <motion.p key={riskLevel} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-3xl font-black tracking-tight ${textColor}`}>
              {riskLevel}
            </motion.p>
            <p className="text-xs mt-2 font-medium opacity-90 max-w-[240px] leading-relaxed mx-auto">{message}</p>
          </div>
        </Card>

        {/* Action Plan Card (Always visible because it's actively analyzing current spend) */}
        <Card className="p-4 rounded-3xl border-0 shadow-card bg-secondary/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/15 grid place-items-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-bold">Burn Rate Alert</p>
                <p className="text-xs text-muted-foreground">Spending RM{currentBurnRate}/day</p>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border/30 mt-2">
            <div className="flex justify-between items-center text-xs mb-3">
              <span className="text-muted-foreground">Current Balance:</span>
              <span className="font-bold text-foreground">RM {startingBalance.toFixed(2)}</span>
            </div>
            {requiredDailySave > 0 && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex gap-2 items-start">
                <Lightbulb className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-destructive">Buddy's Action Plan:</strong> Your balance is draining too fast. To survive until the end of the month, reduce your daily spending by <span className="text-foreground font-bold">RM{requiredDailySave}/day</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Interactive Slider for Action Plan */}
        <Card className="p-4 rounded-3xl border-0 shadow-card">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Zap className="h-4 w-4" />
            <h3 className="font-bold text-sm">Cut Back Simulator</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-xs font-semibold text-muted-foreground">Simulate cutting daily spend</span>
              <span className="text-lg font-extrabold text-primary">- RM{reduceSpendPerDay}/day</span>
            </div>
            <Slider defaultValue={[0]} max={20} step={1} value={[reduceSpendPerDay]} onValueChange={(val) => setReduceSpendPerDay(val[0])} className="py-2" />
            
            <AnimatePresence>
              {reduceSpendPerDay >= requiredDailySave && requiredDailySave > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="rounded-xl bg-success/15 border border-success/30 px-3 py-2 flex items-center gap-2 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-xs font-bold text-success">Great! You are back in the Safe Zone.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Predictive AI Chart */}
        <Card className="p-4 rounded-3xl border-0 shadow-card">
          <h3 className="font-bold text-sm mb-4">30-Day Deficit Radar</h3>
          <div className="h-48 w-full -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={lowestProjected < 0 ? "#ef4444" : "#771FFF"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={lowestProjected < 0 ? "#ef4444" : "#771FFF"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" fontSize={9} tickLine={false} axisLine={false} dy={5} stroke="#888888" minTickGap={5} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="#888888" dx={-5} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                
                {/* Base Trajectory (The warning trajectory) */}
                <Area type="monotone" dataKey="base" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" fill="url(#colorBase)" animationDuration={500} />
                
                {/* Adjusted Trajectory */}
                {reduceSpendPerDay > 0 && (
                  <Area type="monotone" dataKey="projected" stroke={lowestProjected < 0 ? "#ef4444" : "#771FFF"} strokeWidth={3} fill="url(#colorProjected)" animationDuration={800} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-bold text-muted-foreground uppercase">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive/50 border border-destructive border-dashed"></div> Current Burn Rate</div>
            {reduceSpendPerDay > 0 && <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${lowestProjected < 0 ? 'bg-destructive' : 'bg-primary'}`}></div> Adjusted Spend</div>}
          </div>
        </Card>
        
      </div>
    </AppShell>
  );
}
