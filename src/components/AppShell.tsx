import { Link, useLocation } from "@tanstack/react-router";
import { Home, Compass, Target, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/discover", label: "Discover", Icon: Compass },
  { to: "/coach", label: "Buddy", Icon: Sparkles, center: true },
  { to: "/missions", label: "Missions", Icon: Target },
  { to: "/me", label: "Me", Icon: User },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-soft-gradient relative overflow-hidden">
      {/* decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-blob" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl animate-blob" style={{ animationDelay: "-4s" }} />

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
                      className="h-16 w-16 rounded-full bg-primary-gradient grid place-items-center shadow-glow ring-4 ring-background"
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
  return (
    <div className="px-5 pt-12 pb-4">
      {back && (
        <Link to="/" className="text-sm text-primary font-medium">← Back</Link>
      )}
      <h1 className="text-2xl font-extrabold tracking-tight mt-2">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
