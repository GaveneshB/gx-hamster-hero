import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Plus, Users, ArrowUpRight, CheckCircle2, ChevronLeft, Target, PiggyBank, Search, Link as LinkIcon, MessageCircle, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/group-challenges")({
  head: () => ({ meta: [{ title: "Squad Savings — GX Buddy" }, { name: "description", content: "Create a pool, invite friends, save together." }] }),
  component: SquadSavingsManager,
});

// --- DUMMY DATA ---
const defaultFriends = [
  { id: 1, name: "Aisha", emoji: "🦊", amount: 650, role: "MVP Saver", badge: "🏆" },
  { id: 2, name: "Daniel", emoji: "🐼", amount: 420, role: "On Fire", badge: "🔥" },
  { id: 3, name: "You", emoji: "🐹", amount: 300, role: "Catching up", badge: "👀", you: true },
  { id: 4, name: "Mei", emoji: "🐰", amount: 130, role: "Slacking...", badge: "🐢" },
];

const contactsList = [
  { id: 10, name: "Hakim", emoji: "🐯", phone: "+60 12-345 6789", hasGX: true },
  { id: 11, name: "Sara", emoji: "🐱", phone: "+60 17-222 3333", hasGX: true },
  { id: 12, name: "Aisha", emoji: "🦊", phone: "+60 19-987 6543", hasGX: true },
  { id: 13, name: "Daniel", emoji: "🐼", phone: "+60 11-111 2222", hasGX: false },
  { id: 14, name: "Mei", emoji: "🐰", phone: "+60 13-444 5555", hasGX: false },
];

function SquadSavingsManager() {
  const [view, setView] = useState<"list" | "create" | "invite" | "detail">("list");
  
  const [pools, setPools] = useState([
    { id: "1", name: "Langkawi Trip ✈️", target: 2000, current: 1500, friends: defaultFriends }
  ]);
  const [selectedPoolId, setSelectedPoolId] = useState("1");

  // Creation State
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  const handleCreate = () => {
    const newPool = {
      id: Date.now().toString(),
      name: newName || "New Squad Goal",
      target: parseInt(newTarget) || 1000,
      current: 50, // initial deposit
      friends: [
        { id: 3, name: "You", emoji: "🐹", amount: 50, role: "Creator", badge: "👑", you: true },
        ...contactsList.filter(c => selectedContacts.includes(c.id)).map(c => ({
          id: c.id, name: c.name, emoji: c.emoji, amount: 0, role: "Invited", badge: "⏳"
        }))
      ]
    };
    setPools([newPool, ...pools]);
    setSelectedPoolId(newPool.id);
    setView("detail");
    setNewName("");
    setNewTarget("");
    setSelectedContacts([]);
  };

  const activePool = pools.find(p => p.id === selectedPoolId) || pools[0];

  // --- RENDER VIEWS ---
  
  if (view === "create") {
    return (
      <AppShell>
        <div className="px-5 pt-12 pb-4">
          <button onClick={() => setView("list")} className="text-sm text-primary font-medium flex items-center gap-1 mb-2"><ChevronLeft className="h-4 w-4"/> Cancel</button>
          <h1 className="text-2xl font-extrabold tracking-tight">New Squad Savings</h1>
          <p className="text-sm text-muted-foreground mt-1">What are we saving for?</p>
        </div>
        <div className="px-5 space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2 block">Pool Name & Emoji</label>
            <input 
              type="text" 
              placeholder="e.g. PS5 Fund 🎮" 
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-secondary text-foreground p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2 block">Target Amount (RM)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">RM</span>
              <input 
                type="number" 
                placeholder="2500" 
                value={newTarget} 
                onChange={e => setNewTarget(e.target.value)}
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
    const gxUsers = contactsList.filter(c => c.hasGX);
    const nonGxUsers = contactsList.filter(c => !c.hasGX);

    return (
      <AppShell>
        <div className="px-5 pt-12 pb-4">
          <button onClick={() => setView("create")} className="text-sm text-primary font-medium flex items-center gap-1 mb-2"><ChevronLeft className="h-4 w-4"/> Back</button>
          <h1 className="text-2xl font-extrabold tracking-tight">Invite Squad</h1>
          <p className="text-sm text-muted-foreground mt-1">Select friends from your contacts</p>
        </div>
        
        <div className="px-5 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search name or number..." 
              className="w-full bg-secondary p-4 pl-12 rounded-2xl text-sm outline-none font-medium focus:ring-2 focus:ring-primary" 
            />
          </div>

          {/* Share Link Button */}
          <button className="w-full p-4 rounded-2xl border border-dashed border-primary/50 text-primary font-bold text-sm flex items-center justify-center gap-2 bg-primary/5 active:scale-95 transition-transform">
            <LinkIcon className="h-4 w-4" /> Share Pool Invite Link
          </button>

          {/* GXBank Users */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 ml-1">On GXBank</h3>
            <div className="space-y-2">
              {gxUsers.map(c => (
                <Card 
                  key={c.id} 
                  className={`p-3 rounded-2xl border-0 shadow-card flex items-center gap-4 cursor-pointer transition-colors ${selectedContacts.includes(c.id) ? "bg-primary/10 ring-2 ring-primary" : "glass"}`}
                  onClick={() => {
                    if (selectedContacts.includes(c.id)) setSelectedContacts(selectedContacts.filter(id => id !== c.id));
                    else setSelectedContacts([...selectedContacts, c.id]);
                  }}
                >
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">{c.emoji}</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.phone}</p>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedContacts.includes(c.id) ? "bg-primary border-primary" : "border-muted"}`}>
                    {selectedContacts.includes(c.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Non GXBank Users */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 ml-1">Invite to GXBank</h3>
            <div className="space-y-2">
              {nonGxUsers.map(c => (
                <Card key={c.id} className="p-3 rounded-2xl border-0 shadow-card flex items-center gap-4 glass opacity-70">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm grayscale">{c.emoji}</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.phone}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-secondary text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
                    <MessageCircle className="h-3 w-3" /> Invite
                  </button>
                </Card>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <div className="pt-4 pb-8">
            <button 
              onClick={handleCreate} 
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-glow active:scale-95 transition-transform"
            >
              Create & Add ({selectedContacts.length})
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (view === "detail") {
    const pct = Math.min(100, Math.round((activePool.current / activePool.target) * 100));
    return (
      <AppShell>
        <div className="px-5 pt-12 pb-2">
          <button onClick={() => setView("list")} className="text-sm text-primary font-medium flex items-center gap-1 mb-2"><ChevronLeft className="h-4 w-4"/> My Squads</button>
        </div>
        
        <section className="px-5 mt-2">
          <Card className="p-6 rounded-3xl border-0 bg-primary-gradient text-primary-foreground shadow-glow relative overflow-hidden">
            <div aria-hidden className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md mb-2 inline-block">Squad Goal</span>
                  <h2 className="text-3xl font-extrabold flex items-center gap-2">{activePool.name}</h2>
                </div>
                <div className="flex -space-x-2">
                  {activePool.friends.slice(0,3).map(f => (
                    <div key={f.id} className="h-8 w-8 rounded-full bg-white text-sm flex items-center justify-center border-2 border-[oklch(0.55_0.27_320)] shadow-sm">{f.emoji}</div>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Total Saved</p>
                    <p className="text-4xl font-black">RM{activePool.current}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90 font-medium">Target</p>
                    <p className="text-lg font-bold">RM{activePool.target}</p>
                  </div>
                </div>
                <div className="relative pt-2">
                  <Progress value={pct} className="h-3 bg-white/20" />
                </div>
                <p className="text-xs mt-3 opacity-90 text-center font-medium">RM{Math.max(0, activePool.target - activePool.current)} left to go! Let's push 🚀</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="px-5 mt-5 flex gap-3">
          <button className="flex-1 py-3.5 rounded-2xl bg-mint text-mint-foreground font-bold flex items-center justify-center gap-2 shadow-card active:scale-95 transition-transform">
            <Plus className="h-5 w-5" /> Contribute
          </button>
          <button className="py-3.5 px-5 rounded-2xl glass-strong font-bold flex items-center justify-center gap-2 shadow-card active:scale-95 transition-transform">
            <ArrowUpRight className="h-5 w-5" /> Nudge
          </button>
        </section>

        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" /> Leaderboard
            </h3>
            <button 
              onClick={() => setView("invite")}
              className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform"
            >
              <UserPlus className="h-3 w-3" /> Add Friend
            </button>
          </div>
          <div className="space-y-3 pb-8">
            {activePool.friends.sort((a,b) => b.amount - a.amount).map((f, i) => (
              <Card key={f.id} className={`p-4 rounded-2xl border-0 shadow-card flex items-center gap-4 relative overflow-hidden ${f.you ? "bg-primary/5 ring-1 ring-primary/20" : "glass"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-black ${
                  i === 0 && f.amount > 0 ? "bg-warning/20 text-warning" : 
                  i === 1 && f.amount > 0 ? "bg-zinc-200 text-zinc-500" : 
                  "bg-secondary text-muted-foreground"
                }`}>#{i+1}</div>
                <div className="text-3xl bg-white rounded-full h-12 w-12 flex items-center justify-center shadow-sm">{f.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold flex items-center gap-1">
                    {f.name} {f.you && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{f.badge} {f.role}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${i === 0 && f.amount > 0 ? "text-warning" : "text-foreground"}`}>RM{f.amount}</p>
                  {f.amount > 0 && <p className="text-[10px] font-bold text-success flex items-center justify-end gap-0.5 mt-0.5"><CheckCircle2 className="h-3 w-3" /> Paid</p>}
                </div>
                {i === activePool.friends.length - 1 && f.amount < (activePool.target / activePool.friends.length) && (
                  <div className="absolute right-0 bottom-0 top-0 w-1 bg-destructive" />
                )}
              </Card>
            ))}
          </div>
        </section>
      </AppShell>
    );
  }

  // DEFAULT VIEW: LIST
  return (
    <AppShell>
      <PageHeader title="Squad Savings" subtitle="Pool funds, achieve goals faster 🎯" />
      
      <section className="px-5 mt-2 space-y-4">
        {/* Create Action */}
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView("create")}
          className="w-full p-4 rounded-3xl border border-dashed border-primary/50 bg-primary/5 flex items-center justify-center gap-2 text-primary font-bold shadow-sm"
        >
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="h-5 w-5" /></div>
          Create New Squad Pool
        </motion.button>

        {/* Active Pools */}
        <h3 className="font-bold text-sm pt-4">Your Active Squads</h3>
        {pools.map(pool => {
          const pct = Math.round((pool.current / pool.target) * 100);
          return (
            <Card 
              key={pool.id} 
              onClick={() => { setSelectedPoolId(pool.id); setView("detail"); }}
              className="p-5 rounded-3xl border-0 shadow-card glass cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-gradient grid place-items-center text-white shadow-glow"><PiggyBank className="h-5 w-5" /></div>
                  <div>
                    <h4 className="font-extrabold">{pool.name}</h4>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3"/> {pool.friends.length} members</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPoolId(pool.id);
                      setView("invite");
                    }}
                    className="text-[10px] bg-primary/20 text-primary font-bold px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-primary/30 transition-colors"
                  >
                    <UserPlus className="h-3 w-3" /> Invite
                  </button>
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
