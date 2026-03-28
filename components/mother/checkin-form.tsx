"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitCheckIn } from "@/lib/hooks/use-checkin";
import type { CheckInResponse, Sentiment } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

const prompts = [
  { id: "mood", title: "How is your mood today?", placeholder: "Calm, tired, overwhelmed, hopeful..." },
  { id: "sleep", title: "How was your sleep in the last 24 hours?", placeholder: "Broken sleep, restful naps, none..." },
  { id: "body", title: "What is your body telling you right now?", placeholder: "Pain, dizziness, breast discomfort..." },
  { id: "support", title: "What support do you need most today?", placeholder: "Rest, food, help with baby care..." },
];

function inferSentiment(answer: string): Sentiment {
  const value = answer.toLowerCase();

  if (/(sad|overwhelmed|cry|pain|bleed|anxious|alone|scared|dizzy|panic)/.test(value)) {
    return "negative";
  }

  if (/(good|better|calm|supported|strong|rested|hopeful)/.test(value)) {
    return "positive";
  }

  return "neutral";
}

export function CheckInForm() {
  const { user } = useAuth();
  const mutation = useSubmitCheckIn();
  const [answers, setAnswers] = useState<Record<string, string>>({
    mood: "",
    sleep: "",
    body: "",
    support: "",
  });
  const [hoursSlept, setHoursSlept] = useState("4");

  const submit = async () => {
    const responses: CheckInResponse[] = prompts.map((prompt) => ({
      questionId: prompt.id,
      questionText: prompt.title,
      answer: prompt.id === "sleep" ? `${hoursSlept} hours. ${answers[prompt.id]}` : answers[prompt.id],
      sentiment: inferSentiment(answers[prompt.id]),
    }));

    await mutation.mutateAsync({
      userId: user?.uid ?? "guest-mother",
      responses,
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <Badge className="w-fit">Daily Emotional Triage</Badge>
          <CardTitle className="text-uzazi-earth">Capture today&apos;s signal in under two minutes.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-uzazi-earth">Approximate hours slept</label>
            <Input value={hoursSlept} onChange={(event) => setHoursSlept(event.target.value)} inputMode="numeric" />
          </div>

          {prompts.map((prompt) => (
            <div key={prompt.id} className="space-y-2">
              <label className="text-sm font-medium text-uzazi-earth">{prompt.title}</label>
              <Textarea
                placeholder={prompt.placeholder}
                value={answers[prompt.id]}
                onChange={(event) =>
                  setAnswers((current) => ({
                    ...current,
                    [prompt.id]: event.target.value,
                  }))
                }
              />
            </div>
          ))}

          <Button className="w-full" onClick={() => void submit()} disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit check-in"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white via-white to-uzazi-petal">
        <CardHeader>
          <CardTitle className="text-uzazi-earth">AI summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mutation.data ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant={mutation.data.riskLevel === "high" ? "default" : mutation.data.riskLevel === "medium" ? "info" : "success"}>
                  {mutation.data.riskLevel.toUpperCase()} RISK
                </Badge>
                <Badge variant="muted">Score {mutation.data.riskScore}</Badge>
              </div>
              <p className="text-sm leading-7 text-uzazi-earth/80">{mutation.data.aiSummary}</p>
            </>
          ) : (
            <p className="text-sm leading-7 text-uzazi-earth/70">
              After you submit, UZAZI will cluster the responses into a quick summary and flag whether your CHW should
              see this sooner.
            </p>
          )}

          {mutation.error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {(mutation.error as Error).message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
