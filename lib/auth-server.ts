import { createRemoteJWKSet, jwtVerify, SignJWT, type JWTPayload } from "jose";

import { ROLE_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export { ROLE_COOKIE_NAME, SESSION_COOKIE_NAME };

interface RoleTokenPayload {
  role?: UserRole;
  uid?: string;
}

export interface AuthenticatedSession {
  role: UserRole;
  uid: string;
}

const secureTokenJwks = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

function getSessionSecret() {
  const secret =
    process.env.UZAZI_SESSION_SECRET ??
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "uzazi-dev-session-secret";

  return new TextEncoder().encode(secret);
}

export async function signRoleToken(role: UserRole, uid: string) {
  return new SignJWT({ role, uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5d")
    .sign(getSessionSecret());
}

export async function verifyRoleToken(token: string): Promise<AuthenticatedSession | null> {
  try {
    const { payload } = await jwtVerify<RoleTokenPayload>(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.role || !payload.uid) {
      return null;
    }

    return { role: payload.role, uid: payload.uid };
  } catch {
    return null;
  }
}

export async function verifySessionCookie(token: string, projectId: string) {
  try {
    const { payload } = await jwtVerify(token, secureTokenJwks, {
      issuer: [
        `https://securetoken.google.com/${projectId}`,
        `https://session.firebase.google.com/${projectId}`,
      ],
      audience: projectId,
    });

    return payload;
  } catch {
    return null;
  }
}

export function getSessionUid(payload: JWTPayload) {
  if (typeof payload.user_id === "string") {
    return payload.user_id;
  }

  if (typeof payload.sub === "string") {
    return payload.sub;
  }

  return null;
}

export async function authenticateSession({
  projectId,
  roleToken,
  sessionToken,
}: {
  projectId?: string;
  roleToken?: string;
  sessionToken?: string;
}): Promise<AuthenticatedSession | null> {
  if (!projectId || !sessionToken || !roleToken) {
    return null;
  }

  const sessionPayload = await verifySessionCookie(sessionToken, projectId);

  if (!sessionPayload) {
    return null;
  }

  const uid = getSessionUid(sessionPayload);

  if (!uid) {
    return null;
  }

  const rolePayload = await verifyRoleToken(roleToken);

  if (!rolePayload || rolePayload.uid !== uid) {
    return null;
  }

  return rolePayload;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "mother" || value === "chw" || value === "admin";
}

export async function readUserRoleFromFirestoreIdToken({
  projectId,
  token,
  uid,
}: {
  projectId: string;
  token: string;
  uid: string;
}): Promise<UserRole | null> {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    fields?: {
      role?: {
        stringValue?: string;
      };
    };
  };

  const role = payload.fields?.role?.stringValue;
  return isUserRole(role) ? role : null;
}
