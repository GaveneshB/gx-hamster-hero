  import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/Hamster";
import { spendingByCategory, weeklyTrend, user, transactions } from "@/lib/data";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { Download, TrendingDown, TrendingUp, Flame } from "lucide-react";
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
      <li>Buddy Score: ${user.resilienceScore}/100 — up from last month. Great momentum!</li>
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
  return (
    <div className="space-y-5">
      {/* Hero summary card */}
      <section>
        <Card className="p-5 rounded-3xl border-0 bg-primary-gradient text-primary-foreground shadow-glow flex items-center gap-3">
          <Hamster mood="happy" size={90} float={false} />
          <div className="flex-1">
            <p className="font-extrabold">Solid week, {user.firstName}!</p>
            <p className="text-xs opacity-90">Spend ↓ 12% · Saved RM{totalSave} · Streak 🔥 {user.streak}</p>
          </div>
        </Card>
      </section>

      {/* Quick stats row */}
      <section className="grid grid-cols-3 gap-2">
        {[
          { label: "Spent", value: `RM${totalSpend}`, Icon: TrendingDown, cls: "text-destructive" },
          { label: "Saved", value: `RM${totalSave}`,  Icon: TrendingUp,   cls: "text-success"     },
          { label: "Streak", value: `🔥 ${user.streak}d`, Icon: Flame,  cls: "text-primary"      },
        ].map(({ label, value, Icon, cls }) => (
          <Card key={label} className="p-3 rounded-2xl border-0 shadow-card text-center">
            <Icon className={`h-4 w-4 mx-auto mb-1 ${cls}`} />
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-sm font-extrabold mt-0.5">{value}</p>
          </Card>
        ))}
      </section>

      {/* Daily flow bar chart */}
      <section>
        <h3 className="font-bold text-sm mb-2">Daily Flow</h3>
        <Card className="p-3 rounded-2xl border-0 shadow-card">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Bar dataKey="spend" name="Spent"  fill="oklch(0.55 0.22 295)" radius={[8,8,0,0]} />
              <Bar dataKey="save"  name="Saved"  fill="oklch(0.7 0.17 155)"  radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {[{ color: "oklch(0.55 0.22 295)", label: "Spent" }, { color: "oklch(0.7 0.17 155)", label: "Saved" }].map(l => (
              <span key={l.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </Card>
      </section>

      {/* Category breakdown */}
      <section>
        <h3 className="font-bold text-sm mb-2">Where It Went</h3>
        <Card className="p-3 rounded-2xl border-0 shadow-card flex items-center">
          <ResponsiveContainer width="55%" height={170}>
            <PieChart>
              <Pie data={spendingByCategory} dataKey="value" innerRadius={36} outerRadius={70} paddingAngle={3}>
                {spendingByCategory.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex-1 space-y-1.5 text-xs">
            {spendingByCategory.map(c => (
              <li key={c.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="flex-1">{c.name}</span>
                <span className="font-bold">RM{c.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Buddy takeaway */}
      <section>
        <Card className="p-4 rounded-2xl border-0 bg-mint shadow-card">
          <p className="font-bold text-sm">🐹 Buddy's Takeaway</p>
          <p className="text-xs mt-1 leading-relaxed">
            Friday and Saturday were 50% of your spend. Try a "no-spend Saturday" next week — I'll cheer you on. You're on track to save RM500 by April! 🎉
          </p>
        </Card>
      </section>

      {/* Download E-Statement button */}
      <section className="pb-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={downloadReport}
          id="download-estatement-btn"
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary-gradient text-primary-foreground font-bold shadow-glow hover:opacity-90 transition-opacity"
        >
          <Download className="h-5 w-5" />
          Download E-Statement (PDF)
        </motion.button>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          Professional report · {weekLabel} · Generated by GX Buddy AI
        </p>
      </section>
    </div>
  );
}
