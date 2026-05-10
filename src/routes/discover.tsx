import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Hamster } from "@/components/Hamster";
import {
  CreditCard, Lock, PiggyBank, Wallet, Car, Shield, Plane, Building2, Users
} from "lucide-react";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — GX Buddy" },
      { name: "description", content: "Explore GXBank features and your GX Buddy tools." },
    ],
  }),
  component: DiscoverPage,
});

const gxSections = [
  {
    title: "Spend",
    items: [
      { label: "GX Card",   icon: <CreditCard className="h-6 w-6 text-white/70" />, badge: null },
      { label: "GXsecure",  icon: <Lock       className="h-6 w-6 text-white/70" />, badge: null },
    ],
  },
  {
    title: "Insurance",
    items: [
      { label: "Car insurance",        icon: <Car    className="h-6 w-6 text-white/70" />, badge: "RM100" },
      { label: "Cyber Fraud Protect",  icon: <Shield className="h-6 w-6 text-white/70" />, badge: null },
      { label: "Travel insurance",     icon: <Plane  className="h-6 w-6 text-white/70" />, badge: null },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Biz Account", icon: <Building2 className="h-6 w-6 text-white/70" />, badge: "2.50%" },
    ],
  },
];

function DiscoverPage() {
  return (
    <AppShell>
      <div className="px-5 pt-10 pb-4">
        <h1 className="text-xl font-extrabold text-center">Discover</h1>
      </div>

      <div className="px-5 pb-12 space-y-8">

        {/* ===== EDUCATION ===== */}
        <section>
          <h2 className="text-base font-bold mb-5">Education</h2>
          <div className="flex flex-col items-center">
            <Link to="/coach" className="flex flex-col items-center gap-2 relative group active:scale-95 transition-transform">
              {/* NEW badge */}
              <span className="absolute -top-1.5 -right-1.5 z-10 bg-[#F8326D] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(248,50,109,0.6)]">
                NEW
              </span>
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full border border-[#771FFF]/40 animate-ping scale-110 pointer-events-none" />
              <div className="h-16 w-16 rounded-full bg-[#0C0121] border-2 border-[#771FFF]/70 overflow-hidden flex items-center justify-center shadow-[0_0_24px_rgba(119,31,255,0.5)]">
                <Hamster mood="happy" size={52} float={true} />
              </div>
              <span className="text-xs font-bold">GX Buddy</span>
            </Link>
          </div>
        </section>

        {/* ===== SAVE ===== */}
        <section>
          <h2 className="text-base font-bold mb-4">Save</h2>
          <div className="flex gap-5">
            {/* Squad Pocket — ACTIVE, clickable, NEW — leftmost */}
            <Link to="/group-challenges" className="flex flex-col items-center gap-2 relative group active:scale-95 transition-transform">
              <span className="absolute -top-1.5 -left-1.5 z-10 bg-[#F8326D] text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(248,50,109,0.5)]">NEW</span>
              <div className="h-14 w-14 rounded-full bg-[#F8326D]/20 flex items-center justify-center border border-[#F8326D]/40 shadow-[0_0_14px_rgba(248,50,109,0.2)] group-hover:bg-[#F8326D]/30 transition-colors">
                <Users className="h-6 w-6 text-[#F8326D]" />
              </div>
              <span className="text-[10px] font-bold text-center leading-tight max-w-[56px]">Squad Pocket</span>
            </Link>

            {/* Bonus Pocket — non-interactive, no badge */}
            <div className="flex flex-col items-center gap-2 relative opacity-50">
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <PiggyBank className="h-6 w-6 text-white/70" />
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight max-w-[56px] text-muted-foreground">Bonus Pocket</span>
            </div>

            {/* Savings Pockets — non-interactive, no badge */}
            <div className="flex flex-col items-center gap-2 relative opacity-50">
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <Wallet className="h-6 w-6 text-white/70" />
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight max-w-[56px] text-muted-foreground">Savings Pockets</span>
            </div>
          </div>
        </section>

        {/* ===== OTHER GXBANK SECTIONS ===== */}
        {gxSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-bold mb-4">{section.title}</h2>
            <div className="flex gap-5 flex-wrap">
              {section.items.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 relative opacity-60">
                  {item.badge && (
                    <span className={`absolute -top-1.5 -left-1.5 z-10 text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                      item.badge === "NEW" ? "bg-[#F8326D]" : "bg-[#771FFF]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-center leading-tight max-w-[56px] text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}

      </div>
    </AppShell>
  );
}
