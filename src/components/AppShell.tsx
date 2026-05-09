import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { Home, User, Sparkles, Gift, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = { to: string; label: string; Icon: typeof Home; center?: boolean };
const items: NavItem[] = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/discover", label: "Discover", Icon: LayoutGrid },
  { to: "/me", label: "Me", Icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-app relative overflow-hidden text-foreground">
      {/* decorative blobs - static, no animation to keep mobile smooth */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.55_0.27_320)]/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

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
                      className="h-16 w-16 rounded-full bg-primary-gradient grid place-items-center shadow-glow ring-4 ring-[oklch(0.16_0.05_295)]"
                    >
                      <Icon className="h-7 w-7 text-primary-foreground" />
                    </motion.div>
                    <span className="block text-[10px] font-semibold text-center mt-1 text-primary">{label}</span>
                  </Link>
                );
              }
              return (
                <Link key={to} to={to} className="flex-1 grid place-items-center py-2">
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
  const router = useRouter();
  return (
    <div className="px-5 pt-12 pb-4">
      {back && (
        <button 
          onClick={() => router.history.back()} 
          className="text-sm text-primary font-medium flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          ← Back
        </button>
      )}
      <h1 className="text-2xl font-extrabold tracking-tight mt-2">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
