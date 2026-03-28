"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock3, HeartPulse } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const queue = [
  {
    id: "visit-391",
    mother: "Amina N.",
    county: "Nairobi",
    risk: "high",
    reason: "Low sleep, escalating anxiety, reports dizziness.",
    updated: "6 minutes ago",
  },
  {
    id: "visit-284",
    mother: "Nala O.",
    county: "Kiambu",
    risk: "medium",
    reason: "Pain score rising, needs feeding support guidance.",
    updated: "22 minutes ago",
  },
  {
    id: "visit-118",
    mother: "Zuri M.",
    county: "Kisumu",
    risk: "low",
    reason: "Routine follow-up with positive recovery trend.",
    updated: "1 hour ago",
  },
];

export function TriageBoard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/90">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-uzazi-rose/10 p-3 text-uzazi-rose">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-3xl text-uzazi-earth">03</p>
              <p className="text-sm text-uzazi-earth/70">Priority mothers needing contact now</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-uzazi-sky/20 p-3 text-uzazi-midnight">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-3xl text-uzazi-earth">14m</p>
              <p className="text-sm text-uzazi-earth/70">Median response time this shift</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-uzazi-leaf/10 p-3 text-uzazi-leaf">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-3xl text-uzazi-earth">27</p>
              <p className="text-sm text-uzazi-earth/70">Active mothers monitored this week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {queue.map((item) => (
          <Card key={item.id} className="bg-white/90">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-uzazi-earth">{item.mother}</CardTitle>
                <p className="mt-2 text-sm text-uzazi-earth/70">{item.county}</p>
              </div>
              <Badge variant={item.risk === "high" ? "default" : item.risk === "medium" ? "info" : "success"}>
                {item.risk.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm leading-7 text-uzazi-earth/80">{item.reason}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-uzazi-earth/45">Updated {item.updated}</p>
              </div>
              <Button asChild>
                <Link href={`/visit/${item.id}`}>
                  Open visit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
