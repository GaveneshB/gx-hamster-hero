import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/Hamster";
import { spendingByCategory, weeklyTrend, user, transactions } from "@/lib/data";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { Download, TrendingDown, TrendingUp, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const weekLabel = "Apr 28 – May 4, 2026";
const totalSpend = weeklyTrend.reduce((s, d) => s + d.spend, 0);
const totalSave  = weeklyTrend.reduce((s, d) => s + d.save,  0);
const spendChange = -12; // % vs last week

export function downloadReport() {
  const rows = transactions
    .map(
      (t) =>
        `<tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:8px 12px;color:#374151">${t.time}</td>
          <td style="padding:8px 12px;font-weight:600;color:#111827">${t.name}</td>
          <td style="padding:8px 12px;color:#6b7280">${t.category}</td>
          <td style="padding:8px 12px;text-align:right;font-weight:700;color:${t.amount < 0 ? "#ef4444" : "#10b981"}">
            ${t.amount < 0 ? "-" : "+"}RM${Math.abs(t.amount).toFixed(2)}
          </td>
        </tr>`
    )
    .join("");

  const catRows = spendingByCategory
    .map(
      (c) =>
        `<tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:8px 12px">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c.color};margin-right:6px"></span>
            ${c.name}
          </td>
          <td style="padding:8px 12px;text-align:right;font-weight:700">RM${c.value.toFixed(2)}</td>
          <td style="padding:8px 12px;text-align:right;color:#6b7280">${((c.value / totalSpend) * 100).toFixed(1)}%</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>GX Buddy — Weekly E-Statement ${weekLabel}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#111827; background:#fff; }
  .page { max-width:760px; margin:0 auto; padding:40px 32px; }

  /* ── Header ── */
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #7c3aed; padding-bottom:24px; margin-bottom:32px; }
  .brand h1 { font-size:26px; font-weight:800; color:#7c3aed; letter-spacing:-0.5px; }
  .brand p  { font-size:12px; color:#6b7280; margin-top:2px; }
  .meta     { text-align:right; }
  .meta p   { font-size:12px; color:#6b7280; line-height:1.6; }
  .meta strong { color:#111827; }

  /* ── Summary cards ── */
  .summary { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px; }
  .stat-card { background:#f5f3ff; border-radius:12px; padding:16px; text-align:center; }
  .stat-card .label { font-size:11px; color:#7c3aed; text-transform:uppercase; letter-spacing:.5px; font-weight:600; }
  .stat-card .value { font-size:26px; font-weight:800; color:#111827; margin:6px 0 2px; }
  .stat-card .sub   { font-size:11px; color:#6b7280; }
  .stat-card.green  { background:#f0fdf4; }
  .stat-card.green .label { color:#059669; }
  .stat-card.red    { background:#fef2f2; }
  .stat-card.red .label { color:#dc2626; }

  /* ── Section ── */
  h2 { font-size:14px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.5px; margin-bottom:10px; }
  table { width:100%; border-collapse:collapse; margin-bottom:28px; font-size:13px; }
  thead tr { background:#7c3aed; color:#fff; }
  thead th { padding:10px 12px; text-align:left; font-weight:600; font-size:12px; letter-spacing:.3px; }
  thead th:last-child { text-align:right; }
  tbody tr:hover { background:#fafafa; }

  /* ── AI Insights ── */
  .insights { background:#f5f3ff; border-left:4px solid #7c3aed; border-radius:8px; padding:16px 20px; margin-bottom:28px; }
  .insights h3 { font-size:13px; font-weight:700; color:#7c3aed; margin-bottom:8px; }
  .insights ul { list-style:none; }
  .insights li { font-size:12px; color:#374151; line-height:1.7; }
  .insights li::before { content:"✦ "; color:#7c3aed; }

  /* ── Footer ── */
  .footer { border-top:1px solid #e5e7eb; padding-top:16px; display:flex; justify-content:space-between; align-items:center; }
  .footer p { font-size:11px; color:#9ca3af; }
  .badge { background:#7c3aed; color:#fff; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; }

  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <h1>🐹 GX Buddy</h1>
      <p>Weekly Financial E-Statement</p>
    </div>
    <div class="meta">
      <p><strong>Account Holder:</strong> ${user.name}</p>
      <p><strong>Period:</strong> ${weekLabel}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString("en-MY", { dateStyle: "long" })}</p>
      <p><strong>Tier:</strong> ${user.tier} · Level ${user.level}</p>
    </div>
  </div>

  <!-- Summary -->
  <div class="summary">
    <div class="stat-card red">
      <div class="label">Total Spent</div>
      <div class="value">RM${totalSpend.toFixed(2)}</div>
      <div class="sub">${spendChange}% vs last week</div>
    </div>
    <div class="stat-card green">
      <div class="label">Total Saved</div>
      <div class="value">RM${totalSave.toFixed(2)}</div>
      <div class="sub">Auto-save rounds</div>
    </div>
    <div class="stat-card">
      <div class="label">Streak</div>
      <div class="value">🔥 ${user.streak}</div>
      <div class="sub">days active</div>
    </div>
  </div>

  <!-- Spending Breakdown -->
  <h2>Spending Breakdown by Category</h2>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th style="text-align:right">Amount</th>
        <th style="text-align:right">% of Total</th>
      </tr>
    </thead>
    <tbody>${catRows}</tbody>
  </table>

  <!-- Transaction History -->
  <h2>Transaction History</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <!-- AI Insights -->
  <div class="insights">
    <h3>🐹 Buddy's AI Insights</h3>
    <ul>
      <li>Friday & Saturday accounted for ~50% of your weekly spend — consider a "no-spend Saturday" challenge.</li>
      <li>Food spending (RM${spendingByCategory[0].value}) is your highest category — reducing GrabFood orders by 2× saves RM~49/week.</li>
      <li>You saved RM${totalSave} this week through auto-save round-ups. Keep it up to hit your RM500 goal!</li>
      <li>Your BNPL balance stands at RM${user.bnplTotal} across ${user.bnplActive} active plans — avoid adding new plans this week.</li>
      <li>Resilience Score: ${user.resilienceScore}/100 — up from last month. Great momentum!</li>
    </ul>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>This report is generated automatically by GX Buddy. For queries, contact support@gxbuddy.my</p>
    <span class="badge">GX Buddy</span>
  </div>

</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");
  if (win) {
    win.addEventListener("load", () => {
      setTimeout(() => {
        win.print();
        URL.revokeObjectURL(url);
      }, 400);
    });
  }
}

export function WeeklyReportContent() {
  const isMobile = !!import.meta.env.VITE_SPA;

  if (isMobile) {
    return (
      <div className="space-y-6 pb-20">
        {/* Hero summary card — Next-Gen style */}
        <section>
          <Card className="p-6 rounded-[2.5rem] border-0 bg-hero text-primary-foreground shadow-premium relative overflow-hidden group">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_70%)] opacity-20" />
            <div className="relative flex items-center gap-5">
              <div className="relative">
                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 animate-pulse" />
                  <Hamster mood="happy" size={100} float={false} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Weekly Insights</p>
                </div>
                <h2 className="text-xl font-black tracking-tight leading-tight">Solid week, {user.firstName}!</h2>
                <p className="text-xs font-bold text-white/60 mt-1.5 flex items-center gap-2">
                  Spend ↓ 12% <span className="h-1 w-1 rounded-full bg-white/30" /> Saved RM{totalSave}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Quick stats row */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: "Spent", value: `RM${totalSpend}`, Icon: TrendingDown, cls: "text-destructive", bg: "bg-destructive/10" },
            { label: "Saved", value: `RM${totalSave}`,  Icon: TrendingUp,   cls: "text-accent", bg: "bg-accent/10"     },
            { label: "Streak", value: `${user.streak}d`, Icon: Flame,  cls: "text-primary", bg: "bg-primary/10"      },
          ].map(({ label, value, Icon, cls, bg }) => (
            <Card key={label} className="p-4 rounded-3xl border-white/5 glass-premium shadow-premium text-center group active-scale">
              <div className={`h-10 w-10 ${bg} rounded-xl grid place-items-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-5 w-5 ${cls}`} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</p>
              <p className="text-[15px] font-black mt-1 text-white tracking-tighter">{value}</p>
            </Card>
          ))}
        </section>

        {/* Daily flow bar chart */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2">Daily Flow</h3>
          </div>
          <Card className="p-5 rounded-[2.5rem] border-white/5 glass-premium shadow-premium">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyTrend}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(20,20,25,0.95)', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '11px',
                    fontWeight: 800,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }} 
                />
                <Bar dataKey="spend" name="Spent"  fill="var(--primary)" radius={[6,6,0,0]} barSize={24} />
                <Bar dataKey="save"  name="Saved"  fill="var(--accent)"  radius={[6,6,0,0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* Category breakdown */}
        <section>
          <h3 className="text-[13px] font-black uppercase tracking-widest text-white/50 px-2 mb-4">Where It Went</h3>
          <Card className="p-6 rounded-[2.5rem] border-white/5 glass-premium shadow-premium flex items-center gap-6">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={spendingByCategory} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={4} stroke="none">
                  {spendingByCategory.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {spendingByCategory.slice(0, 4).map(c => (
                <div key={c.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full shadow-glow shrink-0 group-hover:scale-150 transition-transform" style={{ background: c.color }} />
                    <span className="text-[11px] font-bold text-white/70 tracking-tight">{c.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-white">RM{c.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Buddy takeaway — Liquid glass style */}
        <section>
          <Card className="p-6 rounded-[2.5rem] border-white/5 glass-card shadow-premium relative overflow-hidden group">
            <div aria-hidden className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl group-hover:bg-accent/30 transition-all" />
            <div className="relative">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-accent mb-2">
                <Sparkles className="h-4 w-4" /> Buddy's Takeaway
              </p>
              <p className="text-[14px] font-bold leading-relaxed text-white/90 italic">
                "Friday and Saturday were 50% of your spend. Try a <span className="text-accent">no-spend Saturday</span> next week — I'll cheer you on. You're on track to save RM500 by April! 🎉"
              </p>
            </div>
          </Card>
        </section>

        {/* Download E-Statement button */}
        <section>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={downloadReport}
            id="download-estatement-btn"
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-primary-gradient text-white font-black uppercase tracking-[0.15em] text-xs shadow-glow hover:brightness-110 transition-all active-scale"
          >
            <Download className="h-5 w-5" />
            Download E-Statement
          </motion.button>
        </section>
      </div>
    );
  }

  // ORIGINAL WEB UI
  return (
    <div className="space-y-6 pb-20">
      {/* Summary card */}
      <Card className="p-6 rounded-[2rem] border-0 bg-hero text-primary-foreground shadow-premium relative overflow-hidden group">
        <div aria-hidden className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,white,transparent_60%)]" />
        <div className="relative flex items-center gap-4">
          <Hamster mood="happy" size={80} float={false} />
          <div>
            <h2 className="text-xl font-black tracking-tight">Week in Review</h2>
            <p className="text-xs font-bold text-white/50">{weekLabel}</p>
            <p className="text-sm font-bold mt-2 text-accent flex items-center gap-2">
               <Sparkles className="h-4 w-4" /> Saved RM{totalSave} more!
            </p>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 rounded-[2rem] glass-premium border-white/5 shadow-premium active-scale">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Spent</p>
          <p className="text-2xl font-black mt-2 text-white">RM {totalSpend}</p>
          <p className="text-[10px] font-bold text-destructive mt-2 flex items-center gap-1 uppercase tracking-tight">
            <TrendingUp className="h-3 w-3" /> {Math.abs(spendChange)}% vs last week
          </p>
        </Card>
        <Card className="p-5 rounded-[2rem] glass-premium border-white/5 shadow-premium active-scale">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Saved</p>
          <p className="text-2xl font-black mt-2 text-accent">RM {totalSave}</p>
          <p className="text-[10px] font-bold text-accent mt-2 flex items-center gap-1 uppercase tracking-tight">
            <TrendingDown className="h-3 w-3" /> Through Auto-Save
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-5 rounded-[2.5rem] glass-premium border-white/5 shadow-premium">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-6">Daily Spending vs Saving</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrend}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: 700}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(20,20,25,0.95)', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '11px',
                  fontWeight: 800,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="spend" name="Spent" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="save" name="Saved" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category breakdown */}
      <Card className="p-6 rounded-[2.5rem] glass-premium border-white/5 shadow-premium">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-6">Spending by Category</h3>
        <div className="flex items-center gap-6">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {spendingByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full shadow-glow" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] font-bold text-white/70 tracking-tight">{cat.name}</span>
                </div>
                <span className="text-[11px] font-black text-white">RM {cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Action */}
      <button 
        onClick={downloadReport}
        className="w-full py-5 rounded-[2rem] bg-primary-gradient text-white font-black uppercase tracking-widest text-xs shadow-glow flex items-center justify-center gap-2 active-scale"
      >
        <Download className="h-4 w-4" /> Download PDF Statement
      </button>

      <div className="h-8" />
    </div>
  );
}
