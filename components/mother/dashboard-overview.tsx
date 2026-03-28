"use client";

import Link from "next/link";
import { Flower2, Heart, Sparkles, Sprout } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";

export function MotherDashboardOverview() {
  const { user } = useAuth();
  const mother = user && "postpartumDay" in user ? user : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Postpartum Day"
          value={`${mother?.postpartumDay ?? 12}`}
          hint="A gentle timeline to pace your recovery."
        />
        <StatCard
          label="Garden Petals"
          value={`${mother?.gardenPetals ?? 14}`}
          hint="Each check-in and reflection grows your garden."
        />
        <StatCard
          label="Assigned CHW"
          value={mother?.assignedCHW ?? "Grace W."}
          hint="Your community support connection."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden border-uzazi-blush/30 bg-gradient-to-br from-white via-white to-uzazi-petal">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge className="w-fit">Today&apos;s Momentum</Badge>
              <CardTitle className="text-uzazi-earth">
                Your wellness streak is strongest when care stays small and steady.
              </CardTitle>
            </div>
            <div className="rounded-full bg-uzazi-rose/10 p-3 text-uzazi-rose">
              <Sparkles className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="max-w-2xl text-sm leading-7 text-uzazi-earth/75">
              Start with a quick emotional check-in, then visit your companion if you need grounding or reassurance.
              When you complete both, your garden gains new petals and your care team receives a clearer signal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/checkin">Start check-in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/companion">Open 3AM companion</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-uzazi-earth">Care markers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Heart, label: "Rest quality", note: "Two nights improving after guided breathing." },
              { icon: Sprout, label: "Nutrition", note: "Hydration goal hit 4 days in a row." },
              { icon: Flower2, label: "Mood trend", note: "Watch for overwhelm if energy dips again." },
            ].map(({ icon: Icon, label, note }) => (
              <div key={label} className="rounded-[24px] border border-uzazi-petal bg-uzazi-cream/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-3 text-uzazi-rose">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-uzazi-earth">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-uzazi-earth/70">{note}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
