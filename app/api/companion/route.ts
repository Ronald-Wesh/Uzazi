import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ROLE_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth";
import { authenticateSession } from "@/lib/auth-server";
import type { CompanionMessage } from "@/lib/types";

interface CompanionRequest {
  messages?: CompanionMessage[];
}

function buildReply(userMessage: string) {
  const hour = new Date().getHours();
  const isLateNight = hour < 6 || hour >= 22;
  const lower = userMessage.toLowerCase();

  if (/(bleeding|faint|fever|can't breathe|suicidal|harm)/.test(lower)) {
    return "What you described may need urgent support. Please contact your CHW or local emergency care now, and if someone is nearby, ask them to stay with you while you seek help.";
  }

  if (/(alone|overwhelmed|cry|anxious|panic|scared)/.test(lower)) {
    return isLateNight
      ? "You do not need to carry this whole night alone. Put one hand on your chest, one on your belly, breathe in for four counts and out for six, and tell me the next smallest thing that would make the next ten minutes feel safer."
      : "That sounds heavy. Let’s slow this down together: name one feeling, one body sensation, and one person you could reach for today, even if the ask is very small.";
  }

  if (/(tired|sleep|exhausted)/.test(lower)) {
    return "Exhaustion can make everything feel sharper. If the baby is settled, try a two-minute reset: sip water, release your shoulders, and choose whether rest, food, or help is the next most urgent need.";
  }

  return "I hear you. Based on what you shared, I’d start with one gentle check: what feels most intense right now, your thoughts, your body, or the pressure of doing too much alone?";
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await authenticateSession({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    roleToken: cookieStore.get(ROLE_COOKIE_NAME)?.value,
    sessionToken: cookieStore.get(SESSION_COOKIE_NAME)?.value,
  });

  if (!session) {
    return NextResponse.json({ error: "You must be signed in to use the companion." }, { status: 401 });
  }

  if (session.role !== "mother") {
    return NextResponse.json({ error: "Only mother accounts can use the companion." }, { status: 403 });
  }

  const body = (await request.json()) as CompanionRequest;
  const latest = body.messages?.at(-1);

  if (!latest) {
    return NextResponse.json({ error: "At least one message is required." }, { status: 400 });
  }

  const message: CompanionMessage = {
    role: "assistant",
    content: buildReply(latest.content),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({ message });
}
