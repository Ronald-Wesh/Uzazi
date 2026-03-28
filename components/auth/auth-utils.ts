import type { FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  type ConfirmationResult,
  getRedirectResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { getDefaultRouteForRole, getRequiredRole } from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import type { AppUser, UserRole } from "@/lib/types";

export const PHONE_REGEX = /^\+[1-9]\d{8,14}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_ALIAS_DOMAIN = "phone.uzazi.app";
export const PENDING_REGISTRATION_STORAGE_KEY = "uzazi-pending-registration";
export const KENYA_COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
];

export const LANGUAGE_TOGGLE_OPTIONS = [
  { code: "EN", label: "English", uiLabel: "EN" },
  { code: "SW", label: "Swahili", uiLabel: "SW" },
  { code: "KI", label: "Kikuyu", uiLabel: "KI" },
] as const;

export const PREFERRED_LANGUAGES = ["Swahili", "Kikuyu", "English", "Hausa", "Amharic"] as const;
export const TESTIMONIAL_PILLS = [
  { name: "Amina", text: "Niko hapa, najihisi kusikizwa." },
  { name: "Wanjiku", text: "Uzazi inanipa utulivu wa usiku." },
  { name: "Zawadi", text: "Najua msaada uko karibu." },
];

let persistencePromise: Promise<void> | null = null;
const SESSION_SYNC_TIMEOUT_MS = 10_000;
let recaptchaVerifier: RecaptchaVerifier | null = null;
let recaptchaContainerId: string | null = null;

export class SessionSyncError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "SessionSyncError";
    this.status = status;
  }
}

export function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function isPhoneNumber(value: string) {
  return PHONE_REGEX.test(normalizePhoneNumber(value));
}

export function isEmailAddress(value: string) {
  return EMAIL_REGEX.test(value.trim().toLowerCase());
}

export function toAuthEmail(identifier: string, emailOverride?: string) {
  const candidate = (emailOverride ?? identifier).trim().toLowerCase();

  if (isEmailAddress(candidate)) {
    return candidate;
  }

  const phone = normalizePhoneNumber(candidate);
  return `${phone.replace(/^\+/, "")}@${PHONE_ALIAS_DOMAIN}`;
}

export function getStoredLocale() {
  if (typeof window === "undefined") {
    return "EN";
  }

  return localStorage.getItem("uzazi-language") ?? "EN";
}

export function storeLocale(locale: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("uzazi-language", locale);
  }
}

export function localeToLanguage(locale: string) {
  if (locale === "SW") {
    return "Swahili";
  }

  if (locale === "KI") {
    return "Kikuyu";
  }

  return "English";
}

export function calculatePostpartumDay(dateOfBirth: string) {
  if (!dateOfBirth) {
    return 0;
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  birthDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / 86_400_000));
}

export function resolvePasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { score, label: "Soft", className: "bg-rose-300" };
  }

  if (score === 2) {
    return { score, label: "Steady", className: "bg-amber-300" };
  }

  if (score === 3) {
    return { score, label: "Strong", className: "bg-emerald-400" };
  }

  return { score, label: "Very strong", className: "bg-emerald-500" };
}

export function resolveDestination(role: UserRole, returnTo?: string) {
  if (!returnTo) {
    return getDefaultRouteForRole(role);
  }

  const requiredRole = getRequiredRole(returnTo);
  return !requiredRole || requiredRole === role ? returnTo : getDefaultRouteForRole(role);
}

export function getWarmFirebaseMessage(error: unknown, mode: "login" | "register" | "google" | "reset") {
  const code = (error as FirebaseError | undefined)?.code;

  switch (code) {
    case "auth/popup-blocked":
    case "auth/cancelled-popup-request":
      return {
        title: "Google sign-in needs a gentler route",
        description: "Your browser blocked the pop-up, so Uzazi can switch to a full-page Google sign-in instead.",
      };
    case "auth/unauthorized-domain":
      return {
        title: "This website is not yet approved in Firebase Auth",
        description: "Add the current domain to Firebase Authentication > Settings > Authorized domains, then try again.",
      };
    case "auth/operation-not-allowed":
      return {
        title: "Google sign-in is not enabled yet",
        description: "Turn on the Google provider in Firebase Authentication before using this sign-in method.",
      };
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return {
        title: "We couldn’t sign you in just yet",
        description: "Please check your details and try again. If the night feels long, you can try once more in a moment.",
      };
    case "auth/email-already-in-use":
      return {
        title: "That account already has a home here",
        description: "Try signing in instead, or reset your password if it has slipped away.",
      };
    case "auth/popup-closed-by-user":
      return {
        title: "Google sign-in was closed",
        description: "No problem. You can open it again whenever you’re ready.",
      };
    case "auth/invalid-verification-code":
      return {
        title: "That verification code did not match",
        description: "Check the SMS code and try again, or request a new code.",
      };
    case "auth/code-expired":
      return {
        title: "That verification code has expired",
        description: "Request a fresh code and continue from there.",
      };
    case "auth/captcha-check-failed":
    case "auth/missing-app-credential":
    case "auth/invalid-app-credential":
      return {
        title: "Phone verification could not start",
        description: "The browser could not complete the verification check. Refresh the page and try again.",
      };
    case "auth/quota-exceeded":
      return {
        title: "Too many SMS requests were sent",
        description: "Firebase has temporarily limited phone verification attempts. Wait a little, then try again.",
      };
    case "auth/too-many-requests":
      return {
        title: "Let’s pause for a moment",
        description: "There have been several attempts in a short time. Please wait a bit, then try again.",
      };
    case "permission-denied":
      return {
        title: "Firebase is rejecting profile access",
        description: "Check Firestore rules and make sure signed-in users can read and write their own profile document.",
      };
    case "unavailable":
    case "deadline-exceeded":
      return {
        title: "Firebase is taking too long to respond",
        description: "Check your network, browser privacy settings, and Firebase project availability, then try again.",
      };
    default:
      if (error instanceof SessionSyncError) {
        return {
          title: "Your sign-in completed, but the app session did not",
          description:
            "The browser could not finish syncing the login cookie. Check the /api/session route response and site cookie settings, then try again.",
        };
      }

      if (mode === "reset") {
        return {
          title: "We couldn’t send the reset link",
          description: "Please confirm the email address and try again when you’re ready.",
        };
      }

      if (mode === "register") {
        return {
          title: "We couldn’t start your journey yet",
          description: "Your details are still here. Please try again in a moment.",
        };
      }

      if (mode === "google") {
        return {
          title: "Google sign-in needs another try",
          description: "The connection did not settle cleanly. Please try again.",
        };
      }

      return {
        title: "Something small went off track",
        description: "Please try again in a moment. Your progress has not been lost.",
      };
  }
}

export async function ensureLocalAuthPersistence() {
  if (typeof window === "undefined") {
    return;
  }

  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence).then(() => undefined);
  }

  await persistencePromise;
}

export async function syncSession(firebaseUser: FirebaseUser, role: UserRole) {
  const token = await firebaseUser.getIdToken();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SESSION_SYNC_TIMEOUT_MS);

  try {
    const response = await fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, role }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new SessionSyncError("Session sync request failed.", response.status);
    }
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new SessionSyncError("Session sync timed out.");
    }

    if (error instanceof SessionSyncError) {
      throw error;
    }

    throw new SessionSyncError("Session sync could not reach the server.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function clearRecaptchaContainer(containerId: string | null) {
  if (typeof window === "undefined" || !containerId) {
    return;
  }

  const container = document.getElementById(containerId);

  if (container) {
    container.innerHTML = "";
  }
}

export function resetPhoneVerification() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }

  clearRecaptchaContainer(recaptchaContainerId);
  recaptchaVerifier = null;
  recaptchaContainerId = null;
}

async function getPhoneRecaptchaVerifier(containerId: string) {
  if (typeof window === "undefined") {
    throw new Error("phone-auth-browser-only");
  }

  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error("phone-auth-container-missing");
  }

  if (recaptchaVerifier && recaptchaContainerId !== containerId) {
    resetPhoneVerification();
  }

  if (!recaptchaVerifier) {
    clearRecaptchaContainer(containerId);
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    });
    recaptchaContainerId = containerId;
    await recaptchaVerifier.render();
  }

  return recaptchaVerifier;
}

export async function sendPhoneVerificationCode(phoneNumber: string, containerId: string) {
  await ensureLocalAuthPersistence();
  const verifier = await getPhoneRecaptchaVerifier(containerId);

  try {
    return await signInWithPhoneNumber(auth, normalizePhoneNumber(phoneNumber), verifier);
  } catch (error) {
    resetPhoneVerification();
    throw error;
  }
}

export async function verifyPhoneCode(
  confirmationResult: ConfirmationResult,
  verificationCode: string,
  options?: {
    language?: string;
  },
) {
  const credential = await confirmationResult.confirm(verificationCode.trim());
  const profile = await hydrateAuthenticatedUser(credential.user, options);
  return { credential, profile };
}

export async function readUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? (snapshot.data() as AppUser) : null;
}

export async function ensureUserProfile(
  firebaseUser: FirebaseUser,
  options?: {
    language?: string;
  },
): Promise<AppUser> {
  const existing = await readUserProfile(firebaseUser.uid);

  if (existing) {
    return existing;
  }

  const fallbackProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    phone: "",
    role: "mother" as const,
    name: firebaseUser.displayName ?? "UZAZI Member",
    language: options?.language ?? "English",
    county: "Nairobi",
    postpartumDay: 0,
    assignedCHW: "unassigned",
    riskLevel: "low" as const,
    gardenPetals: 0,
    badges: [],
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", firebaseUser.uid), fallbackProfile, { merge: true });
  return fallbackProfile;
}

export async function hydrateAuthenticatedUser(
  firebaseUser: FirebaseUser,
  options?: {
    language?: string;
  },
) {
  const profile = await ensureUserProfile(firebaseUser, options);
  await syncSession(firebaseUser, profile.role);
  return profile;
}

function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return provider;
}

function shouldPreferRedirectFlow() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|android|mobile/.test(userAgent);
}

export async function finishGoogleRedirectFlow(options?: { language?: string }) {
  await ensureLocalAuthPersistence();
  const result = await getRedirectResult(auth);

  if (!result?.user) {
    return null;
  }

  const profile = await hydrateAuthenticatedUser(result.user, options);
  return { credential: result, profile };
}

export async function signInWithGoogleFlow(options?: { language?: string }) {
  await ensureLocalAuthPersistence();
  const provider = createGoogleProvider();

  if (shouldPreferRedirectFlow()) {
    await signInWithRedirect(auth, provider);
    return { redirected: true as const };
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const profile = await hydrateAuthenticatedUser(result.user, options);
    return { redirected: false as const, credential: result, profile };
  } catch (error) {
    const code = (error as FirebaseError | undefined)?.code;

    if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
      await signInWithRedirect(auth, provider);
      return { redirected: true as const };
    }

    throw error;
  }
}

export async function signInWithIdentifier(identifier: string, password: string) {
  await ensureLocalAuthPersistence();
  const credential = await signInWithEmailAndPassword(auth, toAuthEmail(identifier), password);
  const profile = await hydrateAuthenticatedUser(credential.user);
  return { credential, profile };
}

export async function sendResetLink(identifier: string) {
  if (!isEmailAddress(identifier)) {
    throw new Error("reset-email-only");
  }

  await sendPasswordResetEmail(auth, identifier.trim().toLowerCase());
}

export function storePendingRegistrationDraft(payload: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PENDING_REGISTRATION_STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingRegistrationDraft<T>() {
  if (typeof window === "undefined") {
    return null as T | null;
  }

  const rawValue = localStorage.getItem(PENDING_REGISTRATION_STORAGE_KEY);

  if (!rawValue) {
    return null as T | null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    localStorage.removeItem(PENDING_REGISTRATION_STORAGE_KEY);
    return null as T | null;
  }
}

export function clearPendingRegistrationDraft() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(PENDING_REGISTRATION_STORAGE_KEY);
}

export function hasPendingRegistrationDraft() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(localStorage.getItem(PENDING_REGISTRATION_STORAGE_KEY));
}
