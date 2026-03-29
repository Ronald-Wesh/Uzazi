import { NextResponse } from "next/server";

import { ROLE_COOKIE_NAME, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import {
  getSessionUid,
  readUserRoleFromFirestoreIdToken,
  signRoleToken,
  verifySessionCookie,
} from "@/lib/auth-server";

interface SessionRequest {
  token?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as SessionRequest;

  if (!body.token) {
    return NextResponse.json({ error: "A Firebase token is required." }, { status: 400 });
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    return NextResponse.json({ error: "Firebase project configuration is missing." }, { status: 500 });
  }

  const sessionPayload = await verifySessionCookie(body.token, projectId);

  if (!sessionPayload) {
    return NextResponse.json({ error: "The Firebase token is invalid." }, { status: 401 });
  }

  const uid = getSessionUid(sessionPayload);

  if (!uid) {
    return NextResponse.json({ error: "The Firebase token does not contain a user id." }, { status: 401 });
  }

  const role = await readUserRoleFromFirestoreIdToken({
    projectId,
    token: body.token,
    uid,
  });

  if (!role) {
    return NextResponse.json(
      { error: "Only registered Uzazi accounts can start an app session." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ success: true });
  const roleToken = await signRoleToken(role, uid);
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(SESSION_COOKIE_NAME, body.token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  response.cookies.set(ROLE_COOKIE_NAME, roleToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(ROLE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
