"use client";

import { CheckCircle2, Clock3, Flower2, HeartPulse, Sparkles, Sprout, Trophy } from "lucide-react";
import { runTransaction, doc } from "firebase/firestore";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { useSubmitCheckIn } from "@/lib/hooks/use-checkin";
import type { CheckInResponse, Mother, Sentiment } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

const NAIROBI_UTC_OFFSET = "+03:00";
const NAIROBI_TIMEZONE = "Africa/Nairobi";

const prompts = [
  {
    id: "mood",
    title: "How is your mood today?",
    helper: "A few honest words are enough.",
    placeholder: "Calm, stretched thin, hopeful, weepy, steady...",
  },
  {
    id: "sleep",
    title: "How did sleep feel in the last 24 hours?",
    helper: "Include naps, interruptions, or how rested you feel.",
    placeholder: "Broken sleep, one solid stretch, light naps, no rest...",
  },
  {
    id: "body",
    title: "What is your body telling you right now?",
    helper: "Pain, bleeding, dizziness, breast changes, or energy shifts matter.",
    placeholder: "Tender incision, headache, heavy bleeding, sore breasts...",
  },
  {
    id: "support",
    title: "What support would help most today?",
    helper: "Think practical, emotional, or urgent support.",
    placeholder: "Rest, food, help with baby care, reassurance, transport...",
  },
] as const;

interface GardenReward {
  currentCheckInStreak: number;
  earnedPetal: boolean;
  gardenPetals: number;
  lastCheckInDate: string;
  lastPetalAwardedAt?: string;
  longestCheckInStreak: number;
}

function inferSentiment(answer: string): Sentiment {
  const value = answer.toLowerCase();

  if (/(sad|overwhelmed|cry|pain|bleed|anxious|alone|scared|dizzy|panic|faint|fever)/.test(value)) {
    return "negative";
  }

  if (/(good|better|calm|supported|strong|rested|hopeful|steady|lighter)/.test(value)) {
    return "positive";
  }

  return "neutral";
}

function getNairobiDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getPreviousNairobiDateKey(dateKey: string) {
  const referenceDate = new Date(`${dateKey}T12:00:00${NAIROBI_UTC_OFFSET}`);
  referenceDate.setDate(referenceDate.getDate() - 1);
  return getNairobiDateKey(referenceDate);
}

async function awardDailyGardenPetal(userId: string) {
  const userRef = doc(db, "users", userId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);

    if (!snapshot.exists()) {
      throw new Error("We could not find your garden profile.");
    }

    const profile = snapshot.data() as Partial<Mother>;
    const today = getNairobiDateKey();
    const previousDate = getPreviousNairobiDateKey(today);
    const currentPetals = typeof profile.gardenPetals === "number" ? profile.gardenPetals : 0;
    const currentStreak =
      typeof profile.currentCheckInStreak === "number" ? profile.currentCheckInStreak : 0;
    const longestStreak =
      typeof profile.longestCheckInStreak === "number" ? profile.longestCheckInStreak : 0;

    if (profile.lastCheckInDate === today) {
      return {
        earnedPetal: false,
        gardenPetals: currentPetals,
        lastCheckInDate: today,
        currentCheckInStreak: currentStreak,
        longestCheckInStreak: longestStreak,
        lastPetalAwardedAt: profile.lastPetalAwardedAt,
      } satisfies GardenReward;
    }

    const nextStreak = profile.lastCheckInDate === previousDate ? currentStreak + 1 : 1;
    const nextLongestStreak = Math.max(longestStreak, nextStreak);
    const nextPetalCount = currentPetals + 1;
    const awardedAt = new Date().toISOString();

    transaction.set(
      userRef,
      {
        gardenPetals: nextPetalCount,
        lastCheckInDate: today,
        currentCheckInStreak: nextStreak,
        longestCheckInStreak: nextLongestStreak,
        lastPetalAwardedAt: awardedAt,
      },
      { merge: true },
    );

    return {
      earnedPetal: true,
      gardenPetals: nextPetalCount,
      lastCheckInDate: today,
      currentCheckInStreak: nextStreak,
      longestCheckInStreak: nextLongestStreak,
      lastPetalAwardedAt: awardedAt,
    } satisfies GardenReward;
  });
}

export function CheckInForm() {
  const { user, updateUser } = useAuth();
  const mother = user && "gardenPetals" in user ? user : null;
  const mutation = useSubmitCheckIn();
  const [answers, setAnswers] = useState<Record<string, string>>({
    mood: "",
    sleep: "",
    body: "",
    support: "",
  });
  const [hoursSlept, setHoursSlept] = useState("4");
  const [reward, setReward] = useState<GardenReward | null>(null);
  const [gardenSyncError, setGardenSyncError] = useState<string | null>(null);

  const hoursValue = Number(hoursSlept);
  const hoursAreValid = Number.isFinite(hoursValue) && hoursValue >= 0 && hoursValue <= 24;
  const answeredPrompts = prompts.filter((prompt) => answers[prompt.id].trim().length > 0).length;
  const completedFields = answeredPrompts + (hoursAreValid ? 1 : 0);
  const totalFields = prompts.length + 1;
  const completionPercent = Math.round((completedFields / totalFields) * 100);
  const formComplete = hoursAreValid && prompts.every((prompt) => answers[prompt.id].trim().length > 0);

  const currentGardenPetals = reward?.gardenPetals ?? mother?.gardenPetals ?? 0;
  const currentStreak = reward?.currentCheckInStreak ?? mother?.currentCheckInStreak ?? 0;
  const longestStreak = reward?.longestCheckInStreak ?? mother?.longestCheckInStreak ?? 0;
  const today = getNairobiDateKey();
  const lastRewardDate = reward?.lastCheckInDate ?? mother?.lastCheckInDate;
  const alreadyEarnedToday = lastRewardDate === today;

  const submit = async () => {
    if (!formComplete) {
      return;
    }

    setGardenSyncError(null);

    const responses: CheckInResponse[] = prompts.map((prompt) => ({
      questionId: prompt.id,
      questionText: prompt.title,
      answer: prompt.id === "sleep" ? `${hoursSlept} hours. ${answers[prompt.id]}` : answers[prompt.id],
      sentiment: inferSentiment(prompt.id === "sleep" ? `${hoursSlept} hours ${answers[prompt.id]}` : answers[prompt.id]),
    }));

    await mutation.mutateAsync({
      userId: user?.uid ?? "guest-mother",
      responses,
    });

    if (!mother) {
      return;
    }

    try {
      const nextReward = await awardDailyGardenPetal(mother.uid);
      setReward(nextReward);
      updateUser((currentUser) => {
        if (!currentUser || !("gardenPetals" in currentUser)) {
          return currentUser;
        }

        return {
          ...currentUser,
          gardenPetals: nextReward.gardenPetals,
          lastCheckInDate: nextReward.lastCheckInDate,
          currentCheckInStreak: nextReward.currentCheckInStreak,
          longestCheckInStreak: nextReward.longestCheckInStreak,
          lastPetalAwardedAt: nextReward.lastPetalAwardedAt,
        };
      });
    } catch {
      setGardenSyncError(
        "Your check-in went through, but the garden reward could not update just yet. Try refreshing once and we’ll sync it back.",
      );
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card className="overflow-hidden border-uzazi-blush/30 bg-gradient-to-br from-white via-white to-uzazi-petal/90">
          <CardHeader className="border-b border-uzazi-blush/15 bg-white/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <Badge className="w-fit">Daily Garden Ritual</Badge>
                <CardTitle className="text-uzazi-earth">
                  Finish today&apos;s reflection and your garden earns a new petal.
                </CardTitle>
                <p className="max-w-2xl text-sm leading-7 text-uzazi-earth/75">
                  One complete check-in per day keeps the streak alive. Honest answers help your care team and turn
                  steady self-care into visible growth.
                </p>
              </div>
              <div className="rounded-[28px] border border-uzazi-blush/30 bg-white/90 px-5 py-4 text-right shadow-soft">
                <p className="text-xs uppercase tracking-[0.22em] text-uzazi-earth/45">Progress</p>
                <p className="mt-2 text-3xl font-semibold text-uzazi-rose">{completionPercent}%</p>
                <p className="text-sm text-uzazi-earth/65">
                  {completedFields} of {totalFields} reflections ready
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-uzazi-earth/70">
                <span>Today&apos;s bloom meter</span>
                <span>{formComplete ? "Ready to earn" : "Complete every field"}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-uzazi-petal/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-uzazi-rose via-uzazi-blush to-uzazi-leaf transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-uzazi-petal bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-uzazi-rose/10 p-3 text-uzazi-rose">
                    <Flower2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-uzazi-earth/60">Garden petals</p>
                    <p className="text-2xl font-semibold text-uzazi-earth">{currentGardenPetals}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-uzazi-petal bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-uzazi-leaf/10 p-3 text-uzazi-leaf">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-uzazi-earth/60">Current streak</p>
                    <p className="text-2xl font-semibold text-uzazi-earth">{currentStreak} day{currentStreak === 1 ? "" : "s"}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-uzazi-petal bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-uzazi-earth/60">Best streak</p>
                    <p className="text-2xl font-semibold text-uzazi-earth">{longestStreak} day{longestStreak === 1 ? "" : "s"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-uzazi-petal bg-white/75 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-uzazi-midnight/10 p-3 text-uzazi-midnight">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-uzazi-earth">Before you submit</p>
                  <p className="text-sm text-uzazi-earth/70">
                    Completing every field is what unlocks today&apos;s petal. Submitting again today keeps the care
                    signal fresh, but it won&apos;t add a second petal.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-uzazi-earth">Approximate hours slept</label>
                  <Input
                    value={hoursSlept}
                    onChange={(event) => setHoursSlept(event.target.value)}
                    inputMode="decimal"
                    placeholder="4"
                    className="bg-white"
                  />
                  <p className="text-xs text-uzazi-earth/55">Use a number from 0 to 24.</p>
                </div>

                {prompts.map((prompt, index) => (
                  <div key={prompt.id} className="rounded-[24px] border border-uzazi-petal bg-uzazi-cream/55 p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-uzazi-rose shadow-soft">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-uzazi-earth">{prompt.title}</p>
                        <p className="text-sm text-uzazi-earth/65">{prompt.helper}</p>
                      </div>
                    </div>
                    <Textarea
                      placeholder={prompt.placeholder}
                      value={answers[prompt.id]}
                      className="min-h-28 bg-white"
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          [prompt.id]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <Button className="w-full" onClick={() => void submit()} disabled={!formComplete || mutation.isPending}>
                {mutation.isPending ? "Growing your garden..." : alreadyEarnedToday ? "Submit today’s reflection" : "Submit and earn today’s petal"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden bg-gradient-to-br from-white via-uzazi-petal/70 to-uzazi-blush/30">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className="w-fit">Garden Preview</Badge>
                <CardTitle className="text-uzazi-earth">Your garden is growing with steady care.</CardTitle>
              </div>
              <div className="rounded-full bg-white/85 p-3 text-uzazi-rose shadow-soft">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, index) => {
                const filled = index < currentGardenPetals;
                const nextPetal = index === currentGardenPetals && !alreadyEarnedToday;

                return (
                  <div
                    key={index}
                    className={`flex aspect-square items-center justify-center rounded-[22px] border transition ${
                      filled
                        ? "border-uzazi-blush bg-white text-uzazi-rose shadow-soft"
                        : nextPetal
                          ? "border-dashed border-uzazi-leaf/40 bg-uzazi-leaf/10 text-uzazi-leaf"
                          : "border-dashed border-uzazi-earth/10 bg-white/45 text-uzazi-earth/20"
                    }`}
                  >
                    <Flower2 className="h-6 w-6" />
                  </div>
                );
              })}
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/80 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-uzazi-rose/10 p-3 text-uzazi-rose">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-uzazi-earth">
                    {alreadyEarnedToday
                      ? "Today’s petal is already safe in your garden"
                      : "One full check-in today unlocks the next petal"}
                  </p>
                  <p className="text-sm leading-6 text-uzazi-earth/72">
                    Your streak only grows when the whole reflection is complete. If tomorrow&apos;s check-in happens on
                    time, the garden keeps blooming instead of resetting.
                  </p>
                </div>
              </div>
            </div>

            {reward ? (
              <div
                className={`rounded-[24px] border p-4 ${
                  reward.earnedPetal
                    ? "border-uzazi-leaf/30 bg-uzazi-leaf/10"
                    : "border-uzazi-sky/25 bg-uzazi-sky/15"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-2xl p-3 ${
                      reward.earnedPetal ? "bg-white text-uzazi-leaf" : "bg-white text-uzazi-midnight"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-uzazi-earth">
                      {reward.earnedPetal
                        ? "Petal earned. Your garden just grew."
                        : "Check-in saved. Today’s petal was already earned."}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-uzazi-earth/72">
                      {reward.earnedPetal
                        ? `You are now on a ${reward.currentCheckInStreak}-day streak with ${reward.gardenPetals} petals in bloom.`
                        : `Your streak stays at ${reward.currentCheckInStreak} day${reward.currentCheckInStreak === 1 ? "" : "s"}, and your garden remains at ${reward.gardenPetals} petals.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {gardenSyncError ? (
              <p className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {gardenSyncError}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-uzazi-earth">Care summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mutation.data ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      mutation.data.riskLevel === "high"
                        ? "default"
                        : mutation.data.riskLevel === "medium"
                          ? "info"
                          : "success"
                    }
                  >
                    {mutation.data.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="muted">Score {mutation.data.riskScore}</Badge>
                </div>
                <p className="text-sm leading-7 text-uzazi-earth/80">{mutation.data.aiSummary}</p>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm leading-7 text-uzazi-earth/70">
                  After submission, UZAZI turns today&apos;s answers into a quick signal for your care team and tells
                  you whether anything needs faster attention.
                </p>
                <div className="rounded-[24px] border border-uzazi-petal bg-uzazi-cream/70 p-4">
                  <p className="font-semibold text-uzazi-earth">What the summary watches for</p>
                  <p className="mt-1 text-sm leading-6 text-uzazi-earth/70">
                    Mood strain, sleep disruption, body alarms, and requests for extra support all shape the risk
                    signal.
                  </p>
                </div>
              </div>
            )}

            {mutation.error ? (
              <p className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {(mutation.error as Error).message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
