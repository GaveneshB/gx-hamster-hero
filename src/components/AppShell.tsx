import { Link, useLocation } from "@tanstack/react-router";
import { Home, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = { to: string; label: string; Icon: typeof Home; center?: boolean };
const items: NavItem[] = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/coach", label: "Buddy", Icon: Sparkles, center: true },
  { to: "/me", label: "Profile", Icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isMobile = !!import.meta.env.VITE_SPA;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-fintech relative overflow-hidden text-foreground">
        {/* Dynamic HDR Blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-40 -right-24 h-[32rem] w-[32rem] rounded-full bg-primary/30 blur-[120px] animate-float" />
        <div aria-hidden className="pointer-events-none absolute top-1/4 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-primary/20 blur-[100px] animate-float" style={{ animationDelay: "-6s" }} />

        <div className="mx-auto max-w-md min-h-screen flex flex-col relative z-10">
          <main className="flex-1 pb-32">{children}</main>

          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-8 z-50">
            <div className="glass-premium shadow-premium rounded-[2.5rem] px-3 py-3 flex items-center justify-between ring-1 ring-white/10">
              {items.map(({ to, label, Icon, center }) => {
                const active = pathname === to;
                if (center) {
                  return (
                    <Link key={to} to={to} className="relative -mt-12 group">
                    <motion.div
                        whileTap={{ scale: 0.85 }}
                        className="h-16 w-16 rounded-3xl bg-primary-gradient grid place-items-center shadow-glow ring-4 ring-background relative z-10 overflow-hidden active-scale"
                      >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                        <Icon className="h-8 w-8 text-white relative z-20" />
                      </motion.div>
                      <motion.span 
                        animate={{ opacity: active ? 1 : 0.7, scale: active ? 1.1 : 1 }}
                        className="block text-[10px] font-black text-center mt-2 tracking-tighter text-primary uppercase"
                      >
                        {label}
                      </motion.span>
                    </Link>
                  );
                }
                return (
                  <Link key={to} to={to} className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2 group active-scale">
                    <motion.div
                      animate={{ 
                        scale: active ? 1.2 : 1,
                        color: active ? "var(--primary)" : "var(--muted-foreground)"
                      }}
                      className="relative"
                    >
                      <Icon className="h-6 w-6 transition-colors" />
                      {active && (
                        <motion.div 
                          layoutId="nav-dot"
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary shadow-glow"
                        />
                      )}
                    </motion.div>
                    <span className={`text-[10px] font-bold tracking-tight transition-all ${active ? "text-primary scale-105" : "text-muted-foreground opacity-60"}`}>
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    );
  }

  // ORIGINAL WEB UI
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden text-foreground">
      {/* decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl opacity-50" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-30" />

      <div className="mx-auto max-w-md min-h-screen flex flex-col relative">
        <main className="flex-1 pb-28">{children}</main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 z-50">
          <div className="glass shadow-glow rounded-3xl px-2 py-2 flex items-end justify-around">
            {items.map(({ to, label, Icon, center }) => {
              const active = pathname === to;
              if (center) {
                return (
                  <Link key={to} to={to} className="-mt-8 relative">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="h-16 w-16 rounded-full bg-primary-gradient grid place-items-center shadow-glow ring-4 ring-background active-scale"
                    >
                      <Icon className="h-7 w-7 text-primary-foreground" />
                    </motion.div>
                    <span className="block text-[10px] font-semibold text-center mt-1 text-primary">{label}</span>
                  </Link>
                );
              }
              return (
                <Link key={to} to={to} className="flex-1 grid place-items-center py-2 active-scale">
                  <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] mt-1 ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  back = true,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  return (
    <div className="px-5 pt-10 pb-4">
      {back && (
        <Link to="/" className="text-sm text-primary font-medium">← Back</Link>
      )}
      <h1 className="text-2xl font-extrabold tracking-tight mt-2">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
