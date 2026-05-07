import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Hamster, type Mood } from "@/components/Hamster";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/debt-radar")({
  head: () => ({ meta: [{ title: "Debt Risk Radar — GX Buddy" }, { name: "description", content: "AI-predicted risk of running short within 30 days." }] }),
  component: DebtRadar,
});

const drivers = [
  { name: "BNPL Instalments", basePct: 28, bad: true },
  { name: "Dining-out spike", basePct: 40, bad: true },
  { name: "Emergency Buffer", basePct: 52, bad: true },
];

function DebtRadar() {
  // Behavioral Nudge: Let user simulate saving more / spending less daily
  const [savePerDay, setSavePerDay] = useState<number>(0);

  // Compute dynamic risk
  const baseRisk = 82;
  const currentRisk = Math.max(12, Math.round(baseRisk - (savePerDay * 2.5)));
  
  // Buddy's mood based on simulated risk
  let mood: Mood = "happy";
  let toneClass = "bg-success/20 text-success";
  let icon = <CheckCircle2 className="h-6 w-6 text-success" />;
  let message = "You're safe! Buddy is relaxed.";
  
  if (currentRisk > 60) {
    mood = "worried";
    toneClass = "bg-destructive/20 text-destructive";
    icon = <ShieldAlert className="h-6 w-6 text-destructive" />;
    message = "High risk of hitting a RM250 deficit by Day 26.";
  } else if (currentRisk > 35) {
    mood = "sleepy";
    toneClass = "bg-warning/20 text-warning-foreground";
    icon = <AlertTriangle className="h-6 w-6 text-warning" />;
    message = "Cutting close! Buddy is watching your spending.";
  }

  // Generate 30-day projection chart data
  const chartData = useMemo(() => {
    const data = [];
    let baseBalance = 500; // Starting balance
    const dailySpend = 25; // Base daily spend causing the deficit
    
    for (let day = 0; day <= 30; day += 3) {
      // Simulate trajectory: Balance - expenses + (simulated daily savings * day)
      const projected = baseBalance - (dailySpend * day) + (savePerDay * day);
      data.push({
        day: `Day ${day}`,
        balance: Math.round(projected),
      });
    }
    return data;
  }, [savePerDay]);

  return (
    <AppShell>
      <PageHeader title="Debt Risk Radar" subtitle="Buddy's AI forecast 🔮" />

      <div className="px-5 space-y-6 pb-12">
        {/* Dynamic Hero Section */}
        <Card className={`p-6 rounded-3xl border-0 shadow-card relative overflow-hidden transition-colors duration-500 ${toneClass}`}>
          <div className="absolute top-4 right-4">{icon}</div>
          
          <div className="flex flex-col items-center text-center mt-2">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={mood}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
              >
                <div aria-hidden className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
                <Hamster mood={mood} size={110} />
              </motion.div>
            </AnimatePresence>
            
            <p className="text-xs opacity-80 uppercase tracking-widest font-bold mt-4">30-Day Risk Score</p>
            <motion.p 
              key={currentRisk}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl font-black mt-1 tracking-tighter"
            >
              {currentRisk}%
            </motion.p>
            <p className="text-sm mt-3 font-medium opacity-90">{message}</p>
          </div>
        </Card>

        {/* Behavioral Nudge Simulator */}
        <Card className="p-5 rounded-3xl border-0 shadow-card glass-strong">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Zap className="h-5 w-5" />
            <h3 className="font-bold text-sm">Buddy's Action Plan</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Use the slider to see how reducing your daily spend or auto-saving changes your future balance.
          </p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-sm font-semibold">Simulate Daily Savings</span>
              <span className="text-xl font-extrabold text-primary">RM{savePerDay} / day</span>
            </div>
            <Slider
              defaultValue={[0]}
              max={30}
              step={1}
              value={[savePerDay]}
              onValueChange={(val) => setSavePerDay(val[0])}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase">
              <span>Current Path</span>
              <span>Safe Zone</span>
            </div>
          </div>
        </Card>

        {/* Predictive AI Chart */}
        <Card className="p-5 rounded-3xl border-0 shadow-card">
          <h3 className="font-bold text-sm mb-4">30-Day Cashflow Projection</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentRisk > 60 ? "#ef4444" : "#10b981"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={currentRisk > 60 ? "#ef4444" : "#10b981"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' }}
                  itemStyle={{ color: '#111', fontWeight: 'bold' }}
                />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke={currentRisk > 60 ? "#ef4444" : "#10b981"} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 text-center">
            {chartData[chartData.length - 1].balance < 0 
              ? `You will be RM${Math.abs(chartData[chartData.length - 1].balance)} in debt by Day 30.` 
              : `You will have a surplus of RM${chartData[chartData.length - 1].balance} by Day 30.`}
          </p>
        </Card>

        {/* Risk Drivers */}
        <section>
          <h3 className="font-bold mb-3 text-sm px-1">What's driving your risk?</h3>
          <Card className="p-4 rounded-2xl border-0 shadow-card space-y-4">
            {drivers.map(d => {
              // Adjust driver percentages slightly based on the slider to simulate impact
              const adjustedPct = Math.max(5, Math.round(d.basePct - (savePerDay * 1.2)));
              const isBad = adjustedPct > 40;
              return (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold">{d.name}</span>
                    <span className={isBad ? "text-destructive" : "text-success font-bold"}>{adjustedPct}%</span>
                  </div>
                  <Progress value={adjustedPct} className={`h-2 ${isBad ? '*:bg-destructive' : '*:bg-success'}`} />
                </div>
              );
            })}
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
