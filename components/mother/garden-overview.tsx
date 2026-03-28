"use client";

import { Flower2, Sparkle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";

export function GardenOverview() {
  const { user } = useAuth();
  const mother = user && "gardenPetals" in user ? user : null;
  const petals = mother?.gardenPetals ?? 16;
  const badges = mother?.badges ?? [
    {
      id: "b1",
      name: "Soft Start",
      description: "Completed your first week with daily reflections.",
      icon: "Sparkle",
      earnedAt: new Date().toISOString(),
    },
    {
      id: "b2",
      name: "Rest Reclaimer",
      description: "Logged three honest sleep check-ins.",
      icon: "Moon",
      earnedAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="overflow-hidden bg-gradient-to-br from-white via-uzazi-petal/70 to-uzazi-blush/30">
        <CardHeader>
          <CardTitle className="text-uzazi-earth">Healing Garden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-5">
            {Array.from({ length: 20 }).map((_, index) => {
              const filled = index < petals;

              return (
                <div
                  key={index}
                  className={`flex aspect-square items-center justify-center rounded-[26px] border ${
                    filled
                      ? "border-uzazi-blush bg-white text-uzazi-rose shadow-soft"
                      : "border-dashed border-uzazi-earth/10 bg-white/40 text-uzazi-earth/20"
                  }`}
                >
                  <Flower2 className="h-7 w-7" />
                </div>
              );
            })}
          </div>
          <p className="max-w-xl text-sm leading-7 text-uzazi-earth/75">
            Each petal marks a moment of care: a mood check, a calmer night, a reflective message, or reaching for help
            before overwhelm builds.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-uzazi-earth">Earned badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {badges.map((badge) => (
            <div key={badge.id} className="rounded-[24px] border border-uzazi-petal bg-uzazi-cream/70 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-uzazi-rose/10 p-3 text-uzazi-rose">
                  <Sparkle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-uzazi-earth">{badge.name}</p>
                  <p className="mt-1 text-sm leading-6 text-uzazi-earth/70">{badge.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
