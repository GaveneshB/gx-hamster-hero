export const transactions = [
  { id: 1, name: "Shopee BNPL", amount: -89, category: "Shopping", risk: "high", time: "2h ago" },
  { id: 2, name: "GrabFood", amount: -24.5, category: "Food", risk: "med", time: "5h ago" },
  { id: 3, name: "Touch n Go", amount: -50, category: "Transport", risk: "low", time: "1d ago" },
  { id: 4, name: "Auto-Save", amount: 3, category: "Save", risk: "save", time: "1d ago" },
  { id: 5, name: "Spotify", amount: -16.9, category: "Subs", risk: "med", time: "2d ago" },
  { id: 6, name: "Salary", amount: 3200, category: "Income", risk: "save", time: "5d ago" },
  { id: 7, name: "Auto-Save", amount: 1.5, category: "Save", risk: "save", time: "3d ago" },
  { id: 8, name: "Auto-Save", amount: 0.8, category: "Save", risk: "save", time: "4d ago" },
];

const totalRoundUps = transactions
  .filter(t => t.category === "Save")
  .reduce((acc, t) => acc + t.amount, 0);

export const user = {
  name: "Ahmad Rizqi",
  firstName: "Ahmad",
  balance: 2980.5,
  income: 3200,
  payday: 28,
  resilienceScore: 70,
  tier: "Budget Builder",
  level: 3,
  memberSince: "January 2026",
  totalSavings: 555,
  emergencyBuffer: { current: 145 + totalRoundUps, target: 300 },
  activeMissions: 3,
  streak: 12,
  bnplActive: 2,
  bnplTotal: 340,
  ghostShield: { level: 1, protected: 185, shieldPercentage: 10 },
  safeToSpend: 42,
};

export const ghostShield = {
  vault: 185,
  target: 300,
  levels: [
    { level: 1, percentage: 10, name: "Basic Protection", description: "10% of salary auto-protected" },
    { level: 2, percentage: 20, name: "Warded", description: "20% of salary auto-protected" },
    { level: 3, percentage: 30, name: "Fully Sealed", description: "30%+ of salary auto-protected" },
  ],
  nextBillDate: "May 28, 2026",
  protectedBills: [
    { name: "Internet Bill", amount: 89, dueDate: "May 25", protected: true },
    { name: "Netflix Sub", amount: 23, dueDate: "May 20", protected: true },
    { name: "Phone Bill", amount: 45, dueDate: "May 28", protected: true },
  ],
};

export const buddyFeatures = [
  { id: 1, title: "Debt Risk Radar", desc: "30-day risk prediction", icon: "🔮", color: "destructive", route: "/debt-radar" },
  { id: 2, title: "Smart Auto-Save", desc: "Automated savings plan", icon: "💰", color: "success", route: "/auto-save" },
  { id: 3, title: "Buddy Shield Vault", desc: "Protect your salary before spending starts", icon: "🔐", color: "primary", route: "/buddy-shield-vault" },
  { id: 4, title: "Emergency Buffer", desc: "Safety cushion status", icon: "🎯", color: "success", route: "/emergency" },
  { id: 5, title: "Squad Pocket", desc: "Pool funds & save together", icon: "🏆", color: "primary", route: "/group-challenges" },
];
export const spendingByCategory = [
  { name: "Food", value: 480, color: "oklch(0.7 0.18 320)" },
  { name: "Transport", value: 220, color: "oklch(0.55 0.22 295)" },
  { name: "Subs", value: 95, color: "oklch(0.82 0.16 160)" },
  { name: "Shopping", value: 310, color: "oklch(0.78 0.16 75)" },
  { name: "Bills", value: 380, color: "oklch(0.62 0.22 22)" },
];

export const weeklyTrend = [
  { day: "Mon", spend: 42, save: 8 },
  { day: "Tue", spend: 28, save: 12 },
  { day: "Wed", spend: 65, save: 5 },
  { day: "Thu", spend: 38, save: 10 },
  { day: "Fri", spend: 92, save: 0 },
  { day: "Sat", spend: 110, save: 15 },
  { day: "Sun", spend: 35, save: 18 },
];

export const futureScenarios = [
  { month: "Now", current: 2980, coached: 2980 },
  { month: "M1", current: 2400, coached: 3200 },
  { month: "M2", current: 1750, coached: 3550 },
  { month: "M3", current: 1100, coached: 3980 },
  { month: "M6", current: -200, coached: 5400 },
];

export const missions = [
  { id: 1, title: "BNPL Detox Week", desc: "No new BNPL for 7 days", progress: 60, reward: "Debt Defender Badge", xp: 120, emoji: "🛡️" },
  { id: 2, title: "Save RM50 by Friday", desc: "Auto-save micro amounts", progress: 78, reward: "Money Guardian Outfit", xp: 80, emoji: "💰" },
  { id: 3, title: "Skip 3 Coffees", desc: "Brew at home instead", progress: 33, reward: "+50 Resilience", xp: 50, emoji: "☕" },
  { id: 4, title: "Track every ringgit", desc: "Categorize 20 transactions", progress: 90, reward: "Eagle Eye Badge", xp: 60, emoji: "🦅" },
];

export const badges = [
  { id: 1, name: "First Save", emoji: "🥇", earned: true },
  { id: 2, name: "Streak x10", emoji: "🔥", earned: true },
  { id: 3, name: "Debt Defender", emoji: "🛡️", earned: true },
  { id: 4, name: "Budget Boss", emoji: "👑", earned: false },
  { id: 5, name: "Emergency Hero", emoji: "🦸", earned: false },
  { id: 6, name: "Money Guardian", emoji: "🧙", earned: false },
];

export const nav = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/discover", label: "Discover", icon: "compass" },
  { to: "/coach", label: "Buddy", icon: "buddy" },
  { to: "/missions", label: "Missions", icon: "target" },
  { to: "/me", label: "Me", icon: "user" },
] as const;
