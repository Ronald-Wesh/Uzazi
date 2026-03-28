"use client";

import type { FirebaseError } from "firebase/app";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";

import {
  clearPendingRegistrationDraft,
  ensureLocalAuthPersistence,
  finishGoogleRedirectFlow,
  hasPendingRegistrationDraft,
  hydrateAuthenticatedUser,
  resolveDestination,
  signInWithIdentifier,
  syncSession,
} from "@/components/auth/auth-utils";
import {
  getDefaultRouteForRole,
  getRequiredRole,
  isPublicPath,
} from "@/lib/auth";
import { auth } from "@/lib/firebase";
import type { AppUser, UserRole } from "@/lib/types";
import { useToast } from "@/providers/ToastProvider";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string, returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getProfileLoadErrorMessage(error: unknown) {
  const firebaseError = error as FirebaseError | undefined;

  if (
    firebaseError?.code === "unavailable" ||
    firebaseError?.message?.toLowerCase().includes("client is offline")
  ) {
    return {
      title: "We couldn’t reach your care profile",
      description:
        "A browser extension, privacy setting, or network issue is blocking Firebase. Disable the blocker for this site, then try again.",
    };
  }

  return {
    title: "We couldn’t load your care profile",
    description: "Please try again in a moment. If this keeps happening, check your browser privacy settings for this site.",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const syncIssueShownRef = useRef(false);
  const roleRef = useRef<UserRole | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    let active = true;
    let authUnsubscribe: () => void = () => {};
    let tokenUnsubscribe: () => void = () => {};
    const notifyProfileLoadError = (error: unknown) => {
      if (syncIssueShownRef.current) {
        return;
      }

      syncIssueShownRef.current = true;
      toast({ ...getProfileLoadErrorMessage(error), variant: "destructive" });
    };

    const initialize = async () => {
      try {
        await ensureLocalAuthPersistence();
        const redirectResult = await finishGoogleRedirectFlow();

        if (redirectResult && active) {
          const waitingForRegistrationCompletion =
            pathname === "/register" && hasPendingRegistrationDraft();

          if (waitingForRegistrationCompletion) {
            return;
          }

          startTransition(() => {
            router.replace(resolveDestination(redirectResult.profile.role));
          });
        }
      } catch {
        // Auth state listeners below still handle the active session path.
      }

      const handleAuthStateChanged = async (firebaseUser: FirebaseUser | null) => {
        if (!active) {
          return;
        }

        if (!firebaseUser) {
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        try {
          const profile = await hydrateAuthenticatedUser(firebaseUser);

          if (!active) {
            return;
          }

          syncIssueShownRef.current = false;
          setUser(profile);
          setRole(profile.role);
          setLoading(false);
        } catch (error) {
          if (!active) {
            return;
          }

          setUser(null);
          setRole(null);
          setLoading(false);
          clearPendingRegistrationDraft();
          notifyProfileLoadError(error);
        }
      };

      const handleTokenChanged = async (firebaseUser: FirebaseUser | null) => {
        const currentRole = roleRef.current;

        if (!firebaseUser || !currentRole) {
          return;
        }

        try {
          await syncSession(firebaseUser, currentRole);

          if (!active) {
            return;
          }

          syncIssueShownRef.current = false;
        } catch (error) {
          if (!active) {
            return;
          }

          notifyProfileLoadError(error);
        }
      };

      authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        void handleAuthStateChanged(firebaseUser);
      });

      tokenUnsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
        void handleTokenChanged(firebaseUser);
      });
    };

    void initialize();

    return () => {
      active = false;
      authUnsubscribe();
      tokenUnsubscribe();
    };
  }, [pathname, router, toast]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      if (!isPublicPath(pathname)) {
        const returnTo = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
        startTransition(() => {
          router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        });
      }

      return;
    }

    const requiredRole = getRequiredRole(pathname);
    const defaultRoute = getDefaultRouteForRole(user.role);
    const isEntryRoute = pathname === "/" || pathname === "/login" || pathname === "/register";

    if (isEntryRoute) {
      startTransition(() => {
        router.replace(defaultRoute);
      });

      return;
    }

    if (requiredRole && requiredRole !== user.role) {
      startTransition(() => {
        router.replace(defaultRoute);
      });
    }
  }, [loading, pathname, router, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      role,
      async signIn(email, password, returnTo) {
        const { profile } = await signInWithIdentifier(email, password);

        setUser(profile);
        setRole(profile.role);

        const requiredRole = returnTo ? getRequiredRole(returnTo) : null;
        const destination =
          returnTo && (!requiredRole || requiredRole === profile.role)
            ? returnTo
            : getDefaultRouteForRole(profile.role);

        startTransition(() => {
          router.replace(destination);
        });
      },
      async signOut() {
        await fetch("/api/session", { method: "DELETE" });
        await firebaseSignOut(auth);
        setUser(null);
        setRole(null);

        startTransition(() => {
          router.replace("/login");
        });
      },
    }),
    [loading, role, router, user],
  );

  if (loading && !isPublicPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-uzazi-cream px-6">
        <div className="card-soft flex w-full max-w-sm flex-col items-center gap-3 p-8 text-center">
          <div className="h-3 w-3 animate-pulse rounded-full bg-uzazi-rose" />
          <p className="text-display text-2xl text-uzazi-earth">Preparing your care space</p>
          <p className="text-sm text-uzazi-earth/70">
            UZAZI is checking your session and loading the right dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
