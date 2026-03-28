"use client";

import { ArrowRight, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultRouteForRole } from "@/lib/auth";
import type { AppUser } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

interface AuthSessionGateProps {
  actionLabel: string;
  description: string;
  stayOnPath: string;
  title: string;
  user: AppUser;
}

export function AuthSessionGate({
  actionLabel,
  description,
  stayOnPath,
  title,
  user,
}: AuthSessionGateProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const fallbackContact =
    "phone" in user && typeof user.phone === "string" ? user.phone : "";
  const contactLabel = user.email || fallbackContact || "UZAZI account";

  return (
    <div className="relative w-full max-w-xl">
      <Card className="overflow-hidden border-white/70 bg-white/88">
        <CardHeader className="space-y-3 border-b border-uzazi-petal/70 bg-white/75">
          <p className="badge-bloom w-fit">Session detected</p>
          <CardTitle className="text-3xl text-uzazi-rose">{title}</CardTitle>
          <p className="max-w-lg text-sm leading-6 text-uzazi-earth/72">{description}</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="rounded-[28px] border border-uzazi-blush/50 bg-uzazi-petal/55 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-uzazi-earth/50">Signed in as</p>
            <p className="mt-3 text-xl font-semibold text-uzazi-earth">{user.name}</p>
            <p className="mt-1 text-sm text-uzazi-earth/70">{contactLabel}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="rounded-full"
              onClick={() => router.replace(getDefaultRouteForRole(user.role))}
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => void signOut(stayOnPath)}
            >
              <RefreshCcw className="h-4 w-4" />
              Use Another Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
