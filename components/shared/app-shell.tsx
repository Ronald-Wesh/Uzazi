"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, LayoutDashboard, Leaf, MessagesSquare, ShieldPlus, Users, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

const navigation = {
  mother: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/checkin", label: "Check-In", icon: ClipboardCheck },
    { href: "/companion", label: "Companion", icon: MessagesSquare },
    { href: "/garden", label: "Garden", icon: Leaf },
  ],
  chw: [
    { href: "/triage", label: "Triage", icon: ShieldPlus },
    { href: "/mothers", label: "Mothers", icon: Users },
  ],
};

export function AppShell({
  role,
  children,
}: {
  role: "mother" | "chw";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-hero-glow">
      <div className="container py-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="card-soft h-fit rounded-[32px] border border-white/80 bg-white/80 p-5 backdrop-blur">
            <Link href={role === "mother" ? "/dashboard" : "/triage"} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-uzazi-rose text-white">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <p className="text-display text-2xl text-uzazi-earth">UZAZI</p>
                <p className="text-sm text-uzazi-earth/60">
                  {role === "mother" ? "Mother Journey" : "CHW Command"}
                </p>
              </div>
            </Link>

            <div className="mt-8 rounded-[28px] bg-uzazi-petal/80 p-4">
              <p className="text-sm uppercase tracking-[0.24em] text-uzazi-earth/50">Signed in</p>
              <p className="mt-3 font-semibold text-uzazi-earth">{user?.name ?? "UZAZI Member"}</p>
              <p className="text-sm text-uzazi-earth/65">{user?.county ?? "Care Network"}</p>
            </div>

            <nav className="mt-6 space-y-2">
              {navigation[role].map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-uzazi-rose text-white shadow-bloom"
                        : "text-uzazi-earth/70 hover:bg-uzazi-petal/70 hover:text-uzazi-earth",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Button variant="outline" className="mt-6 w-full" onClick={() => void signOut()}>
              Sign out
            </Button>
          </aside>

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
