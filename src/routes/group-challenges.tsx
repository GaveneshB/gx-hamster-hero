import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Plus,
  Users,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  Target,
  Search,
  Link as LinkIcon,
  MessageCircle,
  UserPlus,
  X,
  ArrowDownToLine,
  CreditCard,
  LogOut,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/group-challenges")({
  head: () => ({
    meta: [
      { title: "Squad Pocket — GX Buddy" },
      { name: "description", content: "Create a pool, invite friends, save together." },
    ],
  }),
  component: SquadSavingsManager,
});

// --- DUMMY DATA ---
const defaultFriends = [
  { id: 1, name: "Aisha", emoji: "🦊", amount: 500 },
  { id: 2, name: "Daniel", emoji: "🐼", amount: 420 },
  { id: 3, name: "You", emoji: "🐹", amount: 300, you: true },
  { id: 4, name: "Mei", emoji: "🐰", amount: 130 },
];

const fullFriends = [
  { id: 10, name: "Hakim", emoji: "🐯", amount: 600 },
  { id: 11, name: "Sara", emoji: "🐱", amount: 600 },
  { id: 3, name: "You", emoji: "🐹", amount: 600, you: true },
];

const charityFriends = [
  { id: 11, name: "Sara", emoji: "🐱", amount: 450 },
  { id: 10, name: "Hakim", emoji: "🐯", amount: 200 },
  { id: 3, name: "You", emoji: "🐹", amount: 50, you: true },
];

const contactsList = [
  { id: 10, name: "Hakim", emoji: "🐯", phone: "+60 12-345 6789", hasGX: true },
  { id: 11, name: "Sara", emoji: "🐱", phone: "+60 17-222 3333", hasGX: true },
  { id: 12, name: "Aisha", emoji: "🦊", phone: "+60 19-987 6543", hasGX: true },
  { id: 13, name: "Daniel", emoji: "🐼", phone: "+60 11-111 2222", hasGX: false },
  { id: 14, name: "Mei", emoji: "🐰", phone: "+60 13-444 5555", hasGX: false },
];

// Helper to calculate badges dynamically based on rank
const calculateRoles = (friends: any[]) => {
  const sorted = [...friends].sort((a, b) => b.amount - a.amount);
  return sorted.map((f, i) => {
    if (f.bailed) return { ...f, role: "Emergency Exit", badge: "🚨" };
    let role = "Slacking...";
    let badge = "🐢";
    if (f.amount === 0) {
      role = "Invited";
      badge = "⏳";
    } else if (i === 0) {
      role = "MVP Saver";
      badge = "🏆";
    } else if (i === 1) {
      role = "On Fire";
      badge = "🔥";
    } else if (i === 2) {
      role = "Steady";
      badge = "👍";
    }

    return { ...f, role, badge };
  });
};

function SquadSavingsManager() {
  const [view, setView] = useState<"list" | "create" | "invite" | "detail" | "virtual-card">(
    "list",
  );

  const [pools, setPools] = useState([
    {
      id: "1",
      name: "Langkawi Trip ✈️",
      target: 2000,
      current: 1350,
      creatorId: 3,
      friends: calculateRoles(defaultFriends),
    },
    {
      id: "2",
      name: "Coldplay Concert",
      target: 1800,
      current: 1800,
      creatorId: 3,
      friends: calculateRoles(fullFriends),
    },
    {
      id: "3",
      name: "Monthly Apartment Rental 🏠",
      target: 1000,
      current: 700,
      creatorId: 11,
      friends: calculateRoles(charityFriends),
    },
  ]);
  const [selectedPoolId, setSelectedPoolId] = useState("1");

  // Creation State
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  // Contribute Modal State
  const [showContribute, setShowContribute] = useState(false);
  const [contributeAmount, setContributeAmount] = useState("");
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [hasNudged, setHasNudged] = useState<Record<string, boolean>>({});

  const handleCreate = () => {
    const targetAmt = parseInt(newTarget) || 1000;
    const initialFriends = [
      { id: 3, name: "You", emoji: "🐹", amount: 0, you: true },
      ...contactsList
        .filter((c) => selectedContacts.includes(c.id))
        .map((c) => ({
          id: c.id,
          name: c.name,
          emoji: c.emoji,
          amount: 0,
        })),
    ];

    const newPool = {
      id: Date.now().toString(),
      name: newName || "New Squad Goal",
      target: targetAmt,
      current: 0,
      creatorId: 3,
      friends: calculateRoles(initialFriends),
    };

    setPools([newPool, ...pools]);
    setSelectedPoolId(newPool.id);
    setView("detail");
    setNewName("");
    setNewTarget("");
    setSelectedContacts([]);
    toast.success("Squad Pool created! 🎉");
  };

  const handleContributeSubmit = () => {
    const amount = parseInt(contributeAmount);
    if (!amount || amount <= 0) return;

    const currentPool = pools.find((p) => p.id === selectedPoolId);
    if (currentPool) {
      const remaining = currentPool.target - currentPool.current;
      if (amount > remaining) {
        toast.error(`You can only contribute up to RM${remaining}! 😅`);
        return;
      }
    }

    setPools((currentPools) =>
      currentPools.map((pool) => {
        if (pool.id === selectedPoolId) {
          const updatedFriends = pool.friends.map((f) => {
            if (f.you) return { ...f, amount: f.amount + amount };
            return f;
          });
          const newCurrent = updatedFriends.reduce((sum, f) => sum + f.amount, 0);
          return { ...pool, friends: calculateRoles(updatedFriends), current: newCurrent };
        }
        return pool;
      }),
    );

    toast.success(`Successfully added RM${amount} via GXSecure 🔒`);
    setShowContribute(false);
    setContributeAmount("");
  };

  const handleEmergencyWithdraw = () => {
    setPools((currentPools) =>
      currentPools.map((pool) => {
        if (pool.id === selectedPoolId) {
          let withdrawAmount = 0;
          const updatedFriends = pool.friends.map((f) => {
            if (f.you && f.amount > 0) {
              withdrawAmount = f.amount;
              return { ...f, amount: 0, bailed: true };
            }
            return f;
          });

          if (withdrawAmount === 0) {
            toast.error("You don't have any funds to withdraw! 😅");
            return pool;
          }

          const newCurrent = updatedFriends.reduce((sum, f) => sum + f.amount, 0);
          toast.success(
            `Withdrew RM${withdrawAmount}. Your Emergency Buffer is available if needed! 🚨`,
          );
          setShowEmergencyConfirm(false);
          return { ...pool, friends: calculateRoles(updatedFriends), current: newCurrent };
        }
        return pool;
      }),
    );
  };

  const handleCompleteWithdraw = () => {
    toast.success(`RM${activePool.current} transferred to your Main Account! 💸`);
    setPools(pools.filter((p) => p.id !== selectedPoolId));
    setShowWithdrawConfirm(false);
    setView("list");
  };

  const activePool = pools.find((p) => p.id === selectedPoolId) || pools[0];

  // --- RENDER VIEWS ---

  if (view === "create") {
    return (
      <AppShell>
        <div className="px-5 pt-12 pb-4">
          <button
            onClick={() => setView("list")}
            className="text-sm text-primary font-medium flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="h-4 w-4" /> Cancel
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight">New Squad Pocket</h1>
          <p className="text-sm text-muted-foreground mt-1">What are we saving for?</p>
        </div>
        <div className="px-5 space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2 block">
              Pool Name & Emoji
            </label>
            <input
              type="text"
              placeholder="e.g. PS5 Fund 🎮"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-secondary text-foreground p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2 block">
              Target Amount (RM)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                RM
              </span>
              <input
                type="number"
                placeholder="2500"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full bg-secondary text-foreground p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-black text-xl"
              />
            </div>
          </div>
          <button
            disabled={!newName || !newTarget}
            onClick={() => setView("invite")}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-glow mt-8 disabled:opacity-50 transition-opacity"
          >
            Next: Invite Squad
          </button>
        </div>
      </AppShell>
    );
  }

  if (view === "invite") {
    const gxUsers = contactsList.filter((c) => c.hasGX);
    const nonGxUsers = contactsList.filter((c) => !c.hasGX);

    return (
      <AppShell>
        <div className="px-5 pt-12 pb-4">
          <button
            onClick={() => setView(activePool?.id && !newName ? "detail" : "create")}
            className="text-sm text-primary font-medium flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight">Invite Squad</h1>
          <p className="text-sm text-muted-foreground mt-1">Select friends from your contacts</p>
        </div>

        <div className="px-5 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name or number..."
              className="w-full bg-secondary p-4 pl-12 rounded-2xl text-sm outline-none font-medium focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={() => toast("Invite link copied to clipboard! 📋")}
            className="w-full p-4 rounded-2xl border border-dashed border-primary/50 text-primary font-bold text-sm flex items-center justify-center gap-2 bg-primary/5 active:scale-95 transition-transform"
          >
            <LinkIcon className="h-4 w-4" /> Share Pool Invite Link
          </button>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 ml-1">
              On GXBank
            </h3>
            <div className="space-y-2">
              {gxUsers.map((c) => (
                <Card
                  key={c.id}
                  className={`p-3 rounded-2xl border-0 shadow-card flex items-center gap-4 cursor-pointer transition-colors ${selectedContacts.includes(c.id) ? "bg-primary/10 ring-2 ring-primary" : "glass"}`}
                  onClick={() => {
                    if (selectedContacts.includes(c.id))
                      setSelectedContacts(selectedContacts.filter((id) => id !== c.id));
                    else setSelectedContacts([...selectedContacts, c.id]);
                  }}
                >
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                    {c.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.phone}</p>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedContacts.includes(c.id) ? "bg-primary border-primary" : "border-muted"}`}
                  >
                    {selectedContacts.includes(c.id) && (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 ml-1">
              Invite to GXBank
            </h3>
            <div className="space-y-2">
              {nonGxUsers.map((c) => (
                <Card
                  key={c.id}
                  className="p-3 rounded-2xl border-0 shadow-card flex items-center gap-4 glass opacity-70"
                >
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm grayscale">
                    {c.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.phone}</p>
                  </div>
                  <button
                    onClick={() => toast(`Invite sent to ${c.name} via WhatsApp!`)}
                    className="px-3 py-1.5 rounded-full bg-secondary text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <MessageCircle className="h-3 w-3" /> Invite
                  </button>
                </Card>
              ))}
            </div>
          </div>

          <div className="pt-4 pb-8">
            <button
              onClick={() => {
                if (newName) handleCreate();
                else {
                  toast.success(
                    `Invited ${selectedContacts.length} friends to ${activePool.name}!`,
                  );
                  setView("detail");
                  setSelectedContacts([]);
                }
              }}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-glow active:scale-95 transition-transform"
            >
              {newName ? "Create & Add" : "Send Invites"} ({selectedContacts.length})
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (view === "virtual-card") {
    return (
      <AppShell>
        <div className="px-5 pt-12 pb-4">
          <button
            onClick={() => setView("detail")}
            className="text-sm text-primary font-medium flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight">Squad Card ✨</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Virtual spending card for {activePool.name}
          </p>
        </div>
        <div className="px-5 mt-6">
          <motion.div
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full h-56 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-600 to-[#FF3366] p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-2xl -ml-10 -mb-10" />

            <div className="relative flex justify-between items-start">
              <div className="font-bold tracking-widest opacity-90">GX SQUAD</div>
              <CreditCard className="h-6 w-6 opacity-90" />
            </div>

            <div className="relative">
              <div className="font-mono text-xl md:text-2xl tracking-[0.15em] mb-3 text-white/90">
                5412 7512 3412 9011
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] uppercase opacity-70 font-bold mb-0.5 tracking-wider">
                    Valid Thru
                  </div>
                  <div className="font-mono text-sm font-medium">12/26</div>
                </div>
                <div className="text-right">
                  <div className="font-bold tracking-wide">
                    {activePool.name.replace(/[^\w\s]/gi, "")}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-10 space-y-4">
            <button
              onClick={() => toast.success("Card added to Apple Wallet! 🍎")}
              className="w-full py-4 rounded-2xl bg-black text-white font-bold flex justify-center items-center gap-2 shadow-card active:scale-95 transition-transform"
            >
              Add to Apple Wallet
            </button>
            <button
              onClick={() => toast.success("Card added to Google Pay! 🤖")}
              className="w-full py-4 rounded-2xl bg-secondary text-foreground font-bold flex justify-center items-center gap-2 shadow-card active:scale-95 transition-transform"
            >
              Add to Google Pay
            </button>
            <p className="text-xs text-center text-muted-foreground mt-6 px-4">
              This card is tied to your {activePool.name} pool balance. Anyone in the squad can add
              it to their wallet to make purchases.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (view === "detail") {
    const pct = Math.min(100, Math.round((activePool.current / activePool.target) * 100));
    const sortedFriends = [...activePool.friends].sort((a, b) => b.amount - a.amount);

    return (
      <AppShell>
        <div className="px-5 pt-12 pb-2 flex justify-between items-center relative z-20">
          <button
            onClick={() => setView("list")}
            className="text-sm text-primary font-medium flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="h-4 w-4" /> My Squads
          </button>
          <div className="relative">
            {activePool.creatorId === 3 && (
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 -mr-2 rounded-full hover:bg-secondary/50 text-muted-foreground transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            )}
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-app rounded-2xl shadow-xl border border-white/10 p-2 z-50 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setPools(pools.filter((p) => p.id !== selectedPoolId));
                      setShowOptions(false);
                      setView("list");
                      toast("Squad successfully deleted. 🗑️");
                    }}
                    className="w-full flex items-center gap-2 p-3 text-sm text-destructive hover:bg-destructive/10 rounded-xl font-bold transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Squad
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <section className="px-5 mt-2">
          <Card className="p-6 rounded-3xl border-0 bg-primary-gradient text-primary-foreground shadow-glow relative overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md mb-2 inline-block">
                    Squad Goal
                  </span>
                  <h2 className="text-3xl font-extrabold flex items-center gap-2">
                    {activePool.name}
                  </h2>
                </div>
                <div className="flex -space-x-2">
                  {sortedFriends.slice(0, 3).map((f) => (
                    <div
                      key={f.id}
                      className="h-8 w-8 rounded-full bg-white text-sm flex items-center justify-center border-2 border-[oklch(0.55_0.27_320)] shadow-sm"
                    >
                      {f.emoji}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-wider font-bold">
                      Total Saved
                    </p>
                    <motion.p
                      key={activePool.current}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-4xl font-black"
                    >
                      RM{activePool.current}
                    </motion.p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90 font-medium">Target</p>
                    <p className="text-lg font-bold">RM{activePool.target}</p>
                  </div>
                </div>
                <div className="relative pt-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }}>
                    <Progress
                      value={pct}
                      className="h-3 bg-white/20 transition-all duration-1000 ease-out"
                    />
                  </motion.div>
                </div>
                <p className="text-xs mt-3 opacity-90 text-center font-medium">
                  {pct >= 100
                    ? "Goal Reached! 🎉 Time to celebrate!"
                    : `RM${Math.max(0, activePool.target - activePool.current)} left to go! Let's push 🚀`}
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="px-5 mt-5 flex flex-col gap-3">
          {pct >= 100 ? (
            <>
              {activePool.creatorId === 3 ? (
                <>
                  <div className="text-center mb-1">
                    <p className="text-sm font-bold text-success flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Goal Reached! Choose how to use the
                      funds:
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowWithdrawConfirm(true)}
                      className="flex-1 py-3.5 rounded-2xl bg-secondary text-foreground font-bold flex flex-col items-center justify-center gap-1 shadow-card active:scale-95 transition-transform"
                    >
                      <ArrowDownToLine className="h-5 w-5" />{" "}
                      <span className="text-[11px] uppercase tracking-wider">Withdraw to Main</span>
                    </button>
                    <button
                      onClick={() => setView("virtual-card")}
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-card active:scale-95 transition-transform"
                    >
                      <CreditCard className="h-5 w-5" />{" "}
                      <span className="text-[11px] uppercase tracking-wider">
                        Create Squad Card
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-success/10 border border-success/20 rounded-2xl p-4 text-center w-full">
                  <p className="text-sm font-bold text-success flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Goal Fully Funded!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Waiting for the Admin to withdraw or issue the card.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowContribute(true)}
                className="flex-1 py-3.5 rounded-2xl bg-mint text-mint-foreground font-bold flex items-center justify-center gap-2 shadow-card active:scale-95 transition-transform"
              >
                <Plus className="h-5 w-5" /> Contribute
              </button>
              <button
                onClick={() => {
                  const lowest = sortedFriends[sortedFriends.length - 1];
                  if (lowest && !lowest.you) {
                    toast(`Nudge sent to ${lowest.name}! 📲`);
                    setHasNudged((prev) => ({ ...prev, [selectedPoolId]: true }));
                  } else {
                    toast("You can't nudge yourself! Contribute instead 😅");
                  }
                }}
                disabled={hasNudged[selectedPoolId]}
                className={`py-3.5 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-card transition-all ${
                  hasNudged[selectedPoolId]
                    ? "bg-secondary/50 text-muted-foreground opacity-70 cursor-not-allowed"
                    : "glass-strong active:scale-95"
                }`}
              >
                {hasNudged[selectedPoolId] ? (
                  <>Nudged! ⏳</>
                ) : (
                  <>
                    <ArrowUpRight className="h-5 w-5" /> Nudge
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" /> Leaderboard
            </h3>
            <button
              onClick={() => {
                setNewName("");
                setView("invite");
              }}
              className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform"
            >
              <UserPlus className="h-3 w-3" /> Add Friend
            </button>
          </div>
          <div className="space-y-3 pb-8 relative">
            <AnimatePresence>
              {sortedFriends.map((f, i) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Card
                    className={`p-4 rounded-2xl border-0 shadow-card flex items-center gap-4 relative overflow-hidden ${f.you ? "bg-primary/5 ring-1 ring-primary/20" : "glass"}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-black ${
                        i === 0 && f.amount > 0
                          ? "bg-warning/20 text-warning"
                          : i === 1 && f.amount > 0
                            ? "bg-zinc-200 text-zinc-500"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      #{i + 1}
                    </div>
                    <div className="text-3xl bg-white rounded-full h-12 w-12 flex items-center justify-center shadow-sm">
                      {f.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold flex items-center gap-1">
                        {f.name}{" "}
                        {f.you && (
                          <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5 transition-all">
                        {f.badge} {f.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <motion.p
                        key={f.amount}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className={`text-lg font-black ${i === 0 && f.amount > 0 ? "text-warning" : "text-foreground"}`}
                      >
                        RM{f.amount}
                      </motion.p>
                      {f.amount > 0 && (
                        <p className="text-[10px] font-bold text-success flex items-center justify-end gap-0.5 mt-0.5">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </p>
                      )}
                    </div>
                    {i === sortedFriends.length - 1 &&
                      f.amount < activePool.target / activePool.friends.length && (
                        <div className="absolute right-0 bottom-0 top-0 w-1 bg-destructive" />
                      )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="pt-2 pb-6 flex justify-center">
            <button
              onClick={() => {
                const me = sortedFriends.find((f) => f.you);
                if (!me || me.amount === 0) {
                  toast.error("You don't have any funds to withdraw! 😅");
                  return;
                }
                setShowEmergencyConfirm(true);
              }}
              className="text-[11px] font-bold text-destructive/70 hover:text-destructive flex items-center gap-1.5 active:scale-95 transition-colors"
            >
              <LogOut className="h-3 w-3" /> Emergency Exit
            </button>
          </div>
        </section>

        {/* Contribute Modal (Framer Motion) */}
        <AnimatePresence>
          {showContribute && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowContribute(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="relative w-full max-w-md bg-app rounded-t-[2rem] p-6 pb-12 shadow-2xl border-t border-white/10"
              >
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
                <button
                  onClick={() => setShowContribute(false)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>

                <h2 className="text-2xl font-black mb-1">Add to Squad</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  How much would you like to contribute to {activePool.name}?
                </p>

                <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-3 mb-6">
                  <div className="text-2xl font-bold text-muted-foreground">RM</div>
                  <input
                    type="number"
                    autoFocus
                    placeholder={`Max ${Math.max(0, activePool.target - activePool.current)}`}
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    className="bg-transparent outline-none text-4xl font-black w-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setContributeAmount(amt.toString())}
                      className="py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                    >
                      +RM{amt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleContributeSubmit}
                  disabled={!contributeAmount}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-glow disabled:opacity-50"
                >
                  Confirm via GXSecure
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Emergency Confirm Modal */}
        <AnimatePresence>
          {showEmergencyConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEmergencyConfirm(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 shadow-2xl border border-white/10 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                  <LogOut className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-extrabold mb-2">Emergency Exit? 🚨</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Are you sure you want to withdraw your funds? You will lose your spot on the
                  leaderboard.
                </p>
                <div className="bg-primary/10 p-4 rounded-xl mb-6 border border-primary/20 text-left">
                  <p className="text-xs text-primary font-bold">🐹 GX Buddy says:</p>
                  <p className="text-xs text-primary mt-1">
                    "If you have an unexpected expense, try using your Emergency Buffer pocket
                    first! Stay strong!"
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleEmergencyWithdraw}
                    className="w-full py-3.5 rounded-2xl bg-destructive text-destructive-foreground font-bold active:scale-95 transition-transform"
                  >
                    Withdraw Anyway
                  </button>
                  <button
                    onClick={() => setShowEmergencyConfirm(false)}
                    className="w-full py-3.5 rounded-2xl bg-secondary text-foreground font-bold active:scale-95 transition-transform"
                  >
                    Nevermind, I'll stay
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Complete Goal Withdraw Confirm Modal */}
        <AnimatePresence>
          {showWithdrawConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowWithdrawConfirm(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-sm bg-app rounded-[2rem] p-6 shadow-2xl border border-white/10 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                  <ArrowDownToLine className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-extrabold mb-2">Withdraw Funds? 💰</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you ready to transfer RM{activePool.current} to your main account and close
                  the "{activePool.name}" squad?
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleCompleteWithdraw}
                    className="w-full py-3.5 rounded-2xl bg-success text-white font-bold active:scale-95 transition-transform"
                  >
                    Confirm Withdraw
                  </button>
                  <button
                    onClick={() => setShowWithdrawConfirm(false)}
                    className="w-full py-3.5 rounded-2xl bg-secondary text-foreground font-bold active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AppShell>
    );
  }

  // DEFAULT VIEW: LIST
  return (
    <AppShell>
      <PageHeader title="Squad Pocket" subtitle="Pool funds, achieve goals faster 🎯" />

      <section className="px-5 mt-2 space-y-4 pb-10">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setNewName("");
            setView("create");
          }}
          className="w-full p-4 rounded-3xl border border-dashed border-primary/50 bg-primary/5 flex items-center justify-center gap-2 text-primary font-bold shadow-sm"
        >
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
          Create New Squad Pool
        </motion.button>

        <h3 className="font-bold text-sm pt-4">Your Active Squads</h3>
        {pools.map((pool) => {
          const pct = Math.round((pool.current / pool.target) * 100);
          return (
            <Card
              key={pool.id}
              onClick={() => {
                setSelectedPoolId(pool.id);
                setView("detail");
              }}
              className="p-5 rounded-3xl border-0 shadow-card glass cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-gradient grid place-items-center text-white shadow-glow">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold">{pool.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {pool.friends.length} members
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-center items-end gap-1.5 h-full">
                  <p className="text-sm font-black text-primary">{pct}%</p>
                </div>
              </div>
              <Progress value={pct} className="h-2 mb-2" />
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>RM{pool.current} saved</span>
                <span>RM{pool.target}</span>
              </div>
            </Card>
          );
        })}
      </section>
    </AppShell>
  );
}
