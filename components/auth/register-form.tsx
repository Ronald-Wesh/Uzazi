"use client";

import type { ConfirmationResult, User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, HeartHandshake, MessageSquareText, ShieldPlus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type FieldPath, useForm } from "react-hook-form";
import { z } from "zod";

import {
  KENYA_COUNTIES,
  PREFERRED_LANGUAGES,
  PHONE_REGEX,
  calculatePostpartumDay,
  clearGoogleRegistrationRedirectIntent,
  clearPendingRegistrationDraft,
  ensureLocalAuthPersistence,
  getStoredLocale,
  getWarmFirebaseMessage,
  hasPendingGoogleRegistrationRedirectIntent,
  localeToLanguage,
  normalizePhoneNumber,
  readPendingRegistrationDraft,
  readUserProfile,
  resetPhoneVerification,
  resolvePasswordStrength,
  sendPhoneVerificationCode,
  signInWithGoogleFlow,
  storeGoogleRegistrationRedirectIntent,
  storePendingRegistrationDraft,
  syncSession,
  verifyPhoneCode,
} from "@/components/auth/auth-utils";
import { AuthSessionGate } from "@/components/auth/auth-session-gate";
import { GoogleIcon } from "@/components/auth/google-icon";
import { LoadingBloom } from "@/components/auth/loading-bloom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import { getDefaultRouteForRole } from "@/lib/auth";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

const REGISTER_PHONE_RECAPTCHA_ID = "register-phone-recaptcha";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Tell us the name you want us to use."),
    phoneNumber: z
      .string()
      .trim()
      .refine((value) => PHONE_REGEX.test(value.replace(/[^\d+]/g, "")), {
        message: "Use a phone number in E.164 format, for example +254700000000.",
      }),
    email: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || z.string().email().safeParse(value).success, {
        message: "Please use a valid email address or leave this field empty.",
      }),
    county: z.string().min(1, "Choose your county."),
    preferredLanguage: z.enum(PREFERRED_LANGUAGES),
    role: z.enum(["mother", "chw"]),
    authMethod: z.enum(["email", "phone", "google"]),
    babyDateOfBirth: z.string().optional(),
    pregnancyNumber: z.enum(["1st", "2nd", "3rd+"]).optional(),
    deliveryType: z.enum(["Vaginal", "C-Section", "Prefer not to say"]).optional(),
    trustedContactName: z.string().optional(),
    trustedContactPhone: z.string().optional(),
    chwId: z.string().optional(),
    subCounty: z.string().optional(),
    facilityName: z.string().optional(),
    supervisorContact: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    consent: z.boolean().refine((value) => value, {
      message: "Please confirm you understand Uzazi is not a replacement for emergency care.",
    }),
    privacyAccepted: z.boolean().refine((value) => value, {
      message: "Please agree to the privacy notice before continuing.",
    }),
  })
  .superRefine((values, context) => {
    if (values.trustedContactPhone && !PHONE_REGEX.test(values.trustedContactPhone.replace(/[^\d+]/g, ""))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["trustedContactPhone"],
        message: "Use E.164 format for the trusted contact number.",
      });
    }

    if (values.supervisorContact && !PHONE_REGEX.test(values.supervisorContact.replace(/[^\d+]/g, ""))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["supervisorContact"],
        message: "Use E.164 format for the supervisor contact.",
      });
    }

    if (values.authMethod === "email") {
      if (!values.email?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Add an email address to create an email/password account.",
        });
      }

      if (!values.password || values.password.length < 8) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Choose a password with at least 8 characters.",
        });
      }

      if (!values.confirmPassword || values.confirmPassword.length < 8) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: "Please confirm your password.",
        });
      }

      if ((values.password ?? "") !== (values.confirmPassword ?? "")) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: "The passwords do not match yet.",
        });
      }
    }

    if (values.role === "mother") {
      if (!values.babyDateOfBirth) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["babyDateOfBirth"],
          message: "Add your baby’s date of birth.",
        });
      }

      if (!values.pregnancyNumber) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pregnancyNumber"],
          message: "Choose the pregnancy number.",
        });
      }

      if (!values.deliveryType) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deliveryType"],
          message: "Please choose the type of delivery.",
        });
      }
    }

    if (values.role === "chw") {
      if (!values.chwId?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chwId"],
          message: "Add the CHW or national ID.",
        });
      }

      if (!values.subCounty?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["subCounty"],
          message: "Add the sub-county you support.",
        });
      }

      if (!values.facilityName?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["facilityName"],
          message: "Add the facility name.",
        });
      }

      if (!values.supervisorContact?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["supervisorContact"],
          message: "Add the supervisor contact.",
        });
      }
    }
  });

type RegisterValues = z.infer<typeof registerSchema>;

const STEP_TITLES = [
  { step: 1, label: "About You" },
  { step: 2, label: "Journey / Area" },
  { step: 3, label: "Access & Consent" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message}</p>;
}

function SelectField({
  id,
  label,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-uzazi-earth">
        {label}
      </label>
      <select
        id={id}
        className="flex h-11 w-full rounded-2xl border border-uzazi-earth/10 bg-white px-4 text-sm text-uzazi-earth shadow-sm transition focus:outline-none focus:ring-2 focus:ring-uzazi-blush focus:ring-offset-2 focus:ring-offset-uzazi-cream"
        {...props}
      >
        {children}
      </select>
      <FieldError message={error} />
    </div>
  );
}

function buildRegistrationProfile(values: RegisterValues, firebaseUser: FirebaseUser) {
  const authEmail = values.email?.trim().toLowerCase() || firebaseUser.email || "";
  const phone = firebaseUser.phoneNumber || normalizePhoneNumber(values.phoneNumber);
  const postpartumDay = calculatePostpartumDay(values.babyDateOfBirth ?? "");

  const sharedProfile = {
    uid: firebaseUser.uid,
    email: authEmail,
    phone,
    role: values.role,
    name: values.fullName,
    language: values.preferredLanguage,
    county: values.county,
    createdAt: new Date().toISOString(),
  };

  if (values.role === "mother") {
    return {
      ...sharedProfile,
      postpartumDay,
      babyDateOfBirth: values.babyDateOfBirth,
      pregnancyNumber: values.pregnancyNumber,
      deliveryType: values.deliveryType,
      trustedContactName: values.trustedContactName?.trim() || "",
      trustedContactPhone: values.trustedContactPhone?.replace(/[^\d+]/g, "") || "",
      assignedCHW: "unassigned",
      riskLevel: "low" as const,
      gardenPetals: 3,
      badges: [],
      onboardingComplete: true,
    };
  }

  return {
    ...sharedProfile,
    assignedMothers: [],
    subCounty: values.subCounty,
    chwId: values.chwId,
    facilityName: values.facilityName,
    supervisorContact: values.supervisorContact?.replace(/[^\d+]/g, "") || "",
    onboardingComplete: true,
  };
}

export function RegisterForm() {
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneChallenge, setPhoneChallenge] = useState<ConfirmationResult | null>(null);
  const [phoneCode, setPhoneCode] = useState("");
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [waitingForGoogleRegistrationResume, setWaitingForGoogleRegistrationResume] =
    useState(false);
  const fieldRing =
    "focus-visible:ring-2 focus-visible:ring-uzazi-blush focus-visible:ring-offset-2 focus-visible:ring-offset-uzazi-cream";

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      county: "",
      preferredLanguage: "Swahili",
      role: "mother",
      authMethod: "email",
      babyDateOfBirth: "",
      pregnancyNumber: "1st",
      deliveryType: "Vaginal",
      trustedContactName: "",
      trustedContactPhone: "",
      chwId: "",
      subCounty: "",
      facilityName: "",
      supervisorContact: "",
      password: "",
      confirmPassword: "",
      consent: false,
      privacyAccepted: false,
    },
  });

  useEffect(() => {
    const locale = getStoredLocale();
    setValue("preferredLanguage", localeToLanguage(locale) as RegisterValues["preferredLanguage"]);
  }, [setValue]);

  useEffect(() => {
    setWaitingForGoogleRegistrationResume(hasPendingGoogleRegistrationRedirectIntent());
  }, []);

  useEffect(() => {
    return () => {
      resetPhoneVerification();
    };
  }, []);

  const role = watch("role");
  const authMethod = watch("authMethod");
  const babyDateOfBirth = watch("babyDateOfBirth");
  const password = watch("password");
  const phoneNumber = watch("phoneNumber");
  const postpartumDay = useMemo(() => calculatePostpartumDay(babyDateOfBirth ?? ""), [babyDateOfBirth]);
  const passwordStrength = resolvePasswordStrength(password ?? "");

  const resetRegistrationState = () => {
    clearGoogleRegistrationRedirectIntent();
    clearPendingRegistrationDraft();
    resetPhoneVerification();
    setPhoneChallenge(null);
    setPhoneCode("");
    setWaitingForGoogleRegistrationResume(false);
  };

  const completeRegistration = async (firebaseUser: FirebaseUser, values: RegisterValues) => {
    const existingProfile = await readUserProfile(firebaseUser.uid);
    const onboardingComplete =
      existingProfile && "onboardingComplete" in existingProfile
        ? Boolean(existingProfile.onboardingComplete)
        : false;

    if (onboardingComplete && existingProfile) {
      await syncSession(firebaseUser, existingProfile.role);
      resetRegistrationState();
      toast({
        title: "This account already exists",
        description: "We found your profile and signed you in instead of creating a duplicate account.",
      });
      router.replace(getDefaultRouteForRole(existingProfile.role));
      return;
    }

    await updateProfile(firebaseUser, { displayName: values.fullName });
    const profile = buildRegistrationProfile(values, firebaseUser);
    await setDoc(doc(db, "users", firebaseUser.uid), profile, { merge: true });
    await syncSession(firebaseUser, values.role);
    resetRegistrationState();
    router.replace(getDefaultRouteForRole(values.role));
  };

  useEffect(() => {
    const pendingDraft = readPendingRegistrationDraft<RegisterValues>();
    const shouldResumeGoogleRegistration = hasPendingGoogleRegistrationRedirectIntent();

    if (!pendingDraft || pendingDraft.authMethod !== "google") {
      setWaitingForGoogleRegistrationResume(false);
      clearGoogleRegistrationRedirectIntent();
      return;
    }

    setWaitingForGoogleRegistrationResume(shouldResumeGoogleRegistration);

    if (!shouldResumeGoogleRegistration) {
      clearPendingRegistrationDraft();
      return;
    }

    setStep(3);
    let finished = false;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser || finished) {
        return;
      }

      finished = true;
      setIsGoogleLoading(true);

      void (async () => {
        try {
          await completeRegistration(firebaseUser, pendingDraft);
        } catch (error) {
          resetRegistrationState();
          const message = getWarmFirebaseMessage(error, "register");
          toast({ ...message, variant: "destructive" });
        } finally {
          setIsGoogleLoading(false);
        }
      })();
    });

    return () => {
      finished = true;
      unsubscribe();
    };
  }, [toast]);

  const nextStep = async () => {
    const fields =
      step === 1
        ? ["fullName", "phoneNumber", "email", "county", "preferredLanguage", "role"]
        : role === "mother"
          ? ["babyDateOfBirth", "pregnancyNumber", "deliveryType", "trustedContactName", "trustedContactPhone"]
          : ["chwId", "subCounty", "facilityName", "supervisorContact"];

    const valid = await trigger(fields as FieldPath<RegisterValues>[]);

    if (valid) {
      setStep((current) => Math.min(3, current + 1));
    }
  };

  const previousStep = () => {
    setStep((current) => Math.max(1, current - 1));
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await ensureLocalAuthPersistence();

      if (values.authMethod === "email") {
        const accountEmail = values.email?.trim().toLowerCase();

        if (!accountEmail) {
          toast({
            title: "Add an email address to continue",
            description: "Email/password registration needs a working email address.",
            variant: "destructive",
          });
          return;
        }

        const credential = await createUserWithEmailAndPassword(auth, accountEmail, values.password ?? "");
        await completeRegistration(credential.user, values);
        return;
      }

      if (values.authMethod === "phone") {
        if (!phoneChallenge) {
          setIsPhoneLoading(true);

          try {
            const confirmation = await sendPhoneVerificationCode(values.phoneNumber, REGISTER_PHONE_RECAPTCHA_ID);
            setPhoneChallenge(confirmation);
            toast({
              title: "Verification code sent",
              description: `We sent an SMS to ${normalizePhoneNumber(values.phoneNumber)}. Enter the code to finish registration.`,
            });
          } finally {
            setIsPhoneLoading(false);
          }

          return;
        }

        if (phoneCode.trim().length < 6) {
          toast({
            title: "Enter the full verification code",
            description: "Use the 6-digit code from the SMS message.",
            variant: "destructive",
          });
          return;
        }

        setIsPhoneLoading(true);

        try {
          const { credential } = await verifyPhoneCode(phoneChallenge, phoneCode, {
            language: values.preferredLanguage,
          });
          await completeRegistration(credential.user, values);
        } finally {
          setIsPhoneLoading(false);
        }

        return;
      }

      setIsGoogleLoading(true);
      storePendingRegistrationDraft(values);
      storeGoogleRegistrationRedirectIntent();
      setWaitingForGoogleRegistrationResume(true);

      try {
        const result = await signInWithGoogleFlow({
          language: values.preferredLanguage,
        });

        if (result.redirected) {
          return;
        }

        await completeRegistration(result.credential.user, values);
      } catch (error) {
        resetRegistrationState();
        throw error;
      } finally {
        setIsGoogleLoading(false);
      }
    } catch (error) {
      const message = getWarmFirebaseMessage(error, "register");
      toast({ ...message, variant: "destructive" });
    }
  });

  const submitLabel =
    authMethod === "email"
      ? role === "mother"
        ? "Begin My Journey"
        : "Access Dashboard"
      : authMethod === "phone"
        ? phoneChallenge
          ? "Verify and Continue"
          : "Send Verification Code"
        : "Continue with Google";

  if (!authLoading && user && !waitingForGoogleRegistrationResume) {
    return (
      <AuthSessionGate
        title="An Uzazi account is already active here"
        description="Registration can only continue after signing out of the current account. Keep the current session, or switch accounts and return to this form."
        actionLabel="Continue to Dashboard"
        stayOnPath="/register"
        user={user}
      />
    );
  }

  return (
    <div className="relative w-full max-w-3xl">
      {isSubmitting || isPhoneLoading || isGoogleLoading ? (
        <LoadingBloom
          title={
            authMethod === "phone"
              ? phoneChallenge
                ? "Confirming your phone number"
                : "Sending your verification code"
              : authMethod === "google"
                ? "Connecting to Google"
                : role === "mother"
                  ? "Beginning your journey"
                  : "Opening your dashboard"
          }
          description="We’re preparing your Uzazi account with care."
        />
      ) : null}

      <Card className="overflow-hidden border-white/70 bg-white/88">
        <CardHeader className="space-y-5 border-b border-uzazi-petal/70 bg-white/75">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="badge-bloom w-fit">Create your Uzazi account</p>
              <CardTitle className="text-4xl text-uzazi-rose">Register</CardTitle>
            </div>
            <p className="max-w-md text-sm leading-6 text-uzazi-earth/70">
              A few caring details now help Uzazi meet you with the right support from day one.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {STEP_TITLES.map((item) => {
              const complete = step > item.step;
              const active = step === item.step;

              return (
                <div
                  key={item.step}
                  className={`rounded-[24px] border px-4 py-3 transition ${
                    active
                      ? "border-uzazi-rose bg-uzazi-petal"
                      : complete
                        ? "border-uzazi-blush bg-white"
                        : "border-uzazi-earth/10 bg-white/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        active || complete ? "bg-uzazi-rose text-white" : "bg-uzazi-petal text-uzazi-earth"
                      }`}
                    >
                      {item.step}
                    </span>
                    <p className="text-sm font-medium text-uzazi-earth">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={onSubmit} noValidate>
            <div key={`${step}-${role}`} className="animate-in slide-in-from-right-6 fade-in duration-300">
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="fullName" className="text-sm font-medium text-uzazi-earth">
                        Full Name
                      </label>
                      <Input id="fullName" className={fieldRing} aria-label="Full name" {...register("fullName")} />
                      <FieldError message={errors.fullName?.message} />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="text-sm font-medium text-uzazi-earth">
                        Phone Number
                      </label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        className={fieldRing}
                        aria-label="Phone number"
                        aria-invalid={Boolean(errors.phoneNumber)}
                        placeholder="+254700000000"
                        {...register("phoneNumber")}
                      />
                      <FieldError message={errors.phoneNumber?.message} />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-uzazi-earth">
                        Email (optional unless you choose email login)
                      </label>
                      <Input
                        id="email"
                        type="email"
                        className={fieldRing}
                        aria-label="Email address"
                        aria-invalid={Boolean(errors.email)}
                        placeholder="you@example.com"
                        {...register("email")}
                      />
                      <FieldError message={errors.email?.message} />
                    </div>

                    <SelectField id="county" label="County" error={errors.county?.message} {...register("county")}>
                      <option value="">Select your county</option>
                      {KENYA_COUNTIES.map((county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </SelectField>

                    <SelectField
                      id="preferredLanguage"
                      label="Preferred Language"
                      error={errors.preferredLanguage?.message}
                      {...register("preferredLanguage")}
                    >
                      {PREFERRED_LANGUAGES.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-uzazi-earth">Choose your role</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setValue("role", "mother", { shouldValidate: true })}
                        className={`rounded-[28px] border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uzazi-blush ${
                          role === "mother"
                            ? "border-uzazi-rose bg-uzazi-petal shadow-bloom"
                            : "border-uzazi-earth/10 bg-white hover:border-uzazi-blush"
                        }`}
                        aria-pressed={role === "mother"}
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-white p-3 text-2xl">🌸</div>
                          <div>
                            <p className="font-semibold text-uzazi-earth">I am a Mother</p>
                            <p className="mt-2 text-sm leading-6 text-uzazi-earth/70">
                              Postpartum mother seeking support, calm guidance, and a caring rhythm.
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setValue("role", "chw", { shouldValidate: true })}
                        className={`rounded-[28px] border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uzazi-blush ${
                          role === "chw"
                            ? "border-uzazi-rose bg-uzazi-petal shadow-bloom"
                            : "border-uzazi-earth/10 bg-white hover:border-uzazi-blush"
                        }`}
                        aria-pressed={role === "chw"}
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-white p-3 text-2xl">🏥</div>
                          <div>
                            <p className="font-semibold text-uzazi-earth">I am a Community Health Worker</p>
                            <p className="mt-2 text-sm leading-6 text-uzazi-earth/70">
                              Supporting mothers in my area with follow-up, triage, and trusted care.
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 && role === "mother" ? (
                <div className="space-y-6">
                  <div className="rounded-[26px] bg-uzazi-petal/65 p-4">
                    <p className="flex items-center gap-2 font-medium text-uzazi-earth">
                      <HeartHandshake className="h-4 w-4 text-uzazi-rose" />
                      Your Journey
                    </p>
                    <p className="mt-2 text-sm leading-6 text-uzazi-earth/72">
                      We use these details to shape postpartum timing, support cues, and the right pace of care.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="babyDateOfBirth" className="text-sm font-medium text-uzazi-earth">
                        Baby&apos;s Date of Birth
                      </label>
                      <Input
                        id="babyDateOfBirth"
                        type="date"
                        className={fieldRing}
                        aria-label="Baby date of birth"
                        {...register("babyDateOfBirth")}
                      />
                      <FieldError message={errors.babyDateOfBirth?.message} />
                    </div>

                    <div className="rounded-[24px] border border-uzazi-blush/60 bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-uzazi-earth/45">Postpartum day</p>
                      <p className="mt-2 font-mono text-3xl text-uzazi-rose">{postpartumDay}</p>
                    </div>

                    <SelectField
                      id="pregnancyNumber"
                      label="Pregnancy Number"
                      error={errors.pregnancyNumber?.message}
                      {...register("pregnancyNumber")}
                    >
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="3rd+">3rd+</option>
                    </SelectField>

                    <SelectField
                      id="deliveryType"
                      label="Type of Delivery"
                      error={errors.deliveryType?.message}
                      {...register("deliveryType")}
                    >
                      <option value="Vaginal">Vaginal</option>
                      <option value="C-Section">C-Section</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </SelectField>

                    <div className="space-y-2">
                      <label htmlFor="trustedContactName" className="text-sm font-medium text-uzazi-earth">
                        Trusted Contact Name
                      </label>
                      <Input
                        id="trustedContactName"
                        className={fieldRing}
                        aria-label="Trusted contact name"
                        placeholder="Optional"
                        {...register("trustedContactName")}
                      />
                      <FieldError message={errors.trustedContactName?.message} />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="trustedContactPhone" className="text-sm font-medium text-uzazi-earth">
                        Trusted Contact Phone
                      </label>
                      <Input
                        id="trustedContactPhone"
                        type="tel"
                        className={fieldRing}
                        aria-label="Trusted contact phone"
                        aria-invalid={Boolean(errors.trustedContactPhone)}
                        placeholder="+254700000000"
                        {...register("trustedContactPhone")}
                      />
                      <FieldError message={errors.trustedContactPhone?.message} />
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 && role === "chw" ? (
                <div className="space-y-6">
                  <div className="rounded-[26px] bg-uzazi-petal/65 p-4">
                    <p className="flex items-center gap-2 font-medium text-uzazi-earth">
                      <ShieldPlus className="h-4 w-4 text-uzazi-rose" />
                      Your Area
                    </p>
                    <p className="mt-2 text-sm leading-6 text-uzazi-earth/72">
                      These details help route mothers and triage tasks to the right place quickly.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="chwId" className="text-sm font-medium text-uzazi-earth">
                        CHW ID / National ID
                      </label>
                      <Input id="chwId" className={fieldRing} aria-label="CHW ID" {...register("chwId")} />
                      <FieldError message={errors.chwId?.message} />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subCounty" className="text-sm font-medium text-uzazi-earth">
                        Sub-county of Operation
                      </label>
                      <Input
                        id="subCounty"
                        className={fieldRing}
                        aria-label="Sub-county"
                        {...register("subCounty")}
                      />
                      <FieldError message={errors.subCounty?.message} />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="facilityName" className="text-sm font-medium text-uzazi-earth">
                        Facility Name
                      </label>
                      <Input
                        id="facilityName"
                        className={fieldRing}
                        aria-label="Facility name"
                        {...register("facilityName")}
                      />
                      <FieldError message={errors.facilityName?.message} />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="supervisorContact" className="text-sm font-medium text-uzazi-earth">
                        Supervisor Contact
                      </label>
                      <Input
                        id="supervisorContact"
                        type="tel"
                        className={fieldRing}
                        aria-label="Supervisor contact"
                        aria-invalid={Boolean(errors.supervisorContact)}
                        placeholder="+254700000000"
                        {...register("supervisorContact")}
                      />
                      <FieldError message={errors.supervisorContact?.message} />
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-6">
                  <div className="rounded-[26px] bg-uzazi-petal/65 p-4">
                    <p className="flex items-center gap-2 font-medium text-uzazi-earth">
                      <Sparkles className="h-4 w-4 text-uzazi-rose" />
                      Access Method & Consent
                    </p>
                    <p className="mt-2 text-sm leading-6 text-uzazi-earth/72">
                      Choose how you want to sign in to Uzazi, then confirm the final consent items below.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-uzazi-earth">Choose how you will access your account</p>
                    <div className="grid gap-4 md:grid-cols-3">
                      {[
                        {
                          value: "email",
                          title: "Email + Password",
                          description: "Best when you want a classic email login and password reset support.",
                        },
                        {
                          value: "phone",
                          title: "Phone + SMS Code",
                          description: "Use your phone number and a one-time verification code instead of a password.",
                        },
                        {
                          value: "google",
                          title: "Continue with Google",
                          description: "Sign up fast with Google and keep your Uzazi profile details here.",
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setValue("authMethod", option.value as RegisterValues["authMethod"], {
                              shouldValidate: true,
                            })
                          }
                          className={`rounded-[28px] border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uzazi-blush ${
                            authMethod === option.value
                              ? "border-uzazi-rose bg-uzazi-petal shadow-bloom"
                              : "border-uzazi-earth/10 bg-white hover:border-uzazi-blush"
                          }`}
                          aria-pressed={authMethod === option.value}
                        >
                          <p className="font-semibold text-uzazi-earth">{option.title}</p>
                          <p className="mt-2 text-sm leading-6 text-uzazi-earth/70">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {authMethod === "email" ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="password" className="text-sm font-medium text-uzazi-earth">
                            Password
                          </label>
                          <div className="relative">
                            <Input
                              id="password"
                              aria-label="Password"
                              aria-invalid={Boolean(errors.password)}
                              type={showPassword ? "text" : "password"}
                              className={`pr-12 ${fieldRing}`}
                              {...register("password")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((current) => !current)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-uzazi-earth/55 transition hover:text-uzazi-earth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uzazi-blush"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <FieldError message={errors.password?.message} />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="text-sm font-medium text-uzazi-earth">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              aria-label="Confirm password"
                              aria-invalid={Boolean(errors.confirmPassword)}
                              type={showConfirmPassword ? "text" : "password"}
                              className={`pr-12 ${fieldRing}`}
                              {...register("confirmPassword")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((current) => !current)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-uzazi-earth/55 transition hover:text-uzazi-earth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uzazi-blush"
                              aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <FieldError message={errors.confirmPassword?.message} />
                        </div>
                      </div>

                      <div className="space-y-2 rounded-[24px] border border-uzazi-earth/10 bg-white/80 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-medium text-uzazi-earth">Password strength</p>
                          <p className="text-sm text-uzazi-earth/65">{passwordStrength.label}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 rounded-full ${
                                index < passwordStrength.score ? passwordStrength.className : "bg-uzazi-petal"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}

                  {authMethod === "phone" ? (
                    <div className="space-y-4 rounded-[28px] border border-uzazi-blush/60 bg-uzazi-petal/55 p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-white p-2 text-uzazi-rose">
                          <MessageSquareText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-uzazi-earth">Register with your phone number</p>
                          <p className="mt-1 text-sm leading-6 text-uzazi-earth/72">
                            Uzazi will send a one-time verification code to {normalizePhoneNumber(phoneNumber || "")}.
                          </p>
                        </div>
                      </div>

                      {phoneChallenge ? (
                        <div className="space-y-2">
                          <label htmlFor="phoneCode" className="text-sm font-medium text-uzazi-earth">
                            Verification Code
                          </label>
                          <Input
                            id="phoneCode"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className={fieldRing}
                            value={phoneCode}
                            onChange={(event) => setPhoneCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="123456"
                          />
                          <p className="text-sm leading-6 text-uzazi-earth/65">
                            Enter the 6-digit SMS code, then choose “Verify and Continue”.
                          </p>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              disabled={isPhoneLoading}
                              onClick={() => void onSubmit()}
                            >
                              Resend Code
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="rounded-full"
                              disabled={isPhoneLoading}
                              onClick={() => {
                                setPhoneChallenge(null);
                                setPhoneCode("");
                                resetPhoneVerification();
                              }}
                            >
                              Use a Different Number
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-6 text-uzazi-earth/65">
                          No password is required for this option. After you request the code, Uzazi will complete your
                          signup as soon as the number is verified.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {authMethod === "google" ? (
                    <div className="rounded-[28px] border border-uzazi-earth/10 bg-white p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-uzazi-petal p-3 text-uzazi-rose">
                          <GoogleIcon />
                        </div>
                        <div>
                          <p className="font-semibold text-uzazi-earth">Use Google for a faster start</p>
                          <p className="mt-1 text-sm leading-6 text-uzazi-earth/72">
                            We will use Google only for sign-in. Your Uzazi profile details, role, and county still come
                            from this registration form.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 rounded-[24px] border border-uzazi-earth/10 bg-white p-4">
                      <input
                        type="checkbox"
                        className="mt-1 h-5 w-5 rounded border-uzazi-blush accent-uzazi-rose"
                        {...register("consent")}
                        aria-label="Consent confirmation"
                      />
                      <span className="text-sm leading-6 text-uzazi-earth/80">
                        I understand Uzazi is a wellness support tool and not a replacement for emergency medical care.
                      </span>
                    </label>
                    <FieldError message={errors.consent?.message} />

                    <label className="flex items-start gap-3 rounded-[24px] border border-uzazi-earth/10 bg-white p-4">
                      <input
                        type="checkbox"
                        className="mt-1 h-5 w-5 rounded border-uzazi-blush accent-uzazi-rose"
                        {...register("privacyAccepted")}
                        aria-label="Privacy consent"
                      />
                      <span className="text-sm leading-6 text-uzazi-earth/80">
                        I agree to the data privacy terms and have read the{" "}
                        <Link href="/privacy" className="font-semibold text-uzazi-rose underline-offset-4 hover:underline">
                          privacy policy
                        </Link>
                        .
                      </span>
                    </label>
                    <FieldError message={errors.privacyAccepted?.message} />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-uzazi-petal/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={previousStep} className="rounded-full">
                    Back
                  </Button>
                ) : null}
                {step < 3 ? (
                  <Button type="button" onClick={() => void nextStep()} className="rounded-full">
                    Continue
                  </Button>
                ) : null}
              </div>

              {step === 3 ? (
                <Button
                  type="submit"
                  className="rounded-full px-6 hover:scale-[1.02] hover:shadow-bloom"
                  disabled={isSubmitting || isPhoneLoading || isGoogleLoading}
                >
                  {submitLabel}
                </Button>
              ) : null}
            </div>

            <p className="mt-6 text-sm text-uzazi-earth/72">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-uzazi-rose underline-offset-4 hover:underline">
                Sign in here
              </Link>
            </p>

            <div id={REGISTER_PHONE_RECAPTCHA_ID} className="hidden" aria-hidden="true" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
