"use client";

import { useQuery } from "@tanstack/react-query";

import type { Mother } from "@/lib/types";

const demoMothers: Mother[] = [
  {
    uid: "mother-001",
    email: "amina@example.com",
    role: "mother",
    name: "Amina N.",
    language: "Swahili",
    county: "Nairobi",
    postpartumDay: 14,
    assignedCHW: "Grace W.",
    riskLevel: "high",
    gardenPetals: 11,
    badges: [
      {
        id: "badge-1",
        name: "Daily Check-in",
        description: "Completed three consecutive check-ins.",
        icon: "Flower2",
        earnedAt: new Date().toISOString(),
      },
    ],
  },
  {
    uid: "mother-002",
    email: "nala@example.com",
    role: "mother",
    name: "Nala O.",
    language: "English",
    county: "Kiambu",
    postpartumDay: 32,
    assignedCHW: "Grace W.",
    riskLevel: "medium",
    gardenPetals: 18,
    badges: [],
  },
  {
    uid: "mother-003",
    email: "zuri@example.com",
    role: "mother",
    name: "Zuri M.",
    language: "Luo",
    county: "Kisumu",
    postpartumDay: 7,
    assignedCHW: "Grace W.",
    riskLevel: "low",
    gardenPetals: 6,
    badges: [],
  },
];

export function useMothers() {
  return useQuery({
    queryKey: ["mothers"],
    queryFn: async () => demoMothers,
    staleTime: 60_000,
  });
}
