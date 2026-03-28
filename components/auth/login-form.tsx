"use client";

import type { ConfirmationResult } from "firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  EMAIL_REGEX,
  PHONE_REGEX,
  getWarmFirebaseMessage,
  isEmailAddress,
  localeToLanguage,
  normalizePhoneNumber,
  resetPhoneVerification,
  resolveDestination,
  sendPhoneVerificationCode,
  sendResetLink,
  signInWithGoogleFlow,
  signInWithIdentifier,
  verifyPhoneCode,
} from "@/components/auth/auth-utils";
import { AuthIntentDivider } from "@/components/auth/auth-widgets";
import { GoogleIcon } from "@/components/auth/google-icon";
import { LanguageToggle } from "@/components/auth/language-toggle";
import { LoadingBloom } from "@/components/auth/loading-bloom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/providers/ToastProvider";

const LOGIN_PHONE_RECAPTCHA_ID = "login-phone-recaptcha";

const loginSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .refine(
        (value) => EMAIL_REGEX.test(value.toLowerCase()) || PHONE_REGEX.test(value.replace(/[^\d+]/g, "")),
        {
          message: "Use a valid email address or phone number in E.164 format, for example +254700000000.",
        },
      ),
    password: z.string().optional(),
  })
  .superRefine((values, context) => {
    const identifier = values.identifier.trim();
    const password = values.password?.trim() ?? "";
    const emailLogin = isEmailAddress(identifier);

    if (emailLogin && password.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Enter your password to continue.",
      });
    }

    if (!emailLogin && password.length > 0 && password.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Passwords should be at least 8 characters long.",
      });
    }
  });

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [phoneChallenge, setPhoneChallenge] = useState<ConfirmationResult | null>(null);
  const [phoneCode, setPhoneCode] = useState("");
  const fieldRing =
    "focus-visible:ring-2 focus-visible:ring-uzazi-blush focus-visible:ring-offset-2 focus-visible:ring-offset-uzazi-cream";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
    getValues,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const identifierValue = watch("identifier");
  const passwordValue = watch("password");
  const normalizedPhone = normalizePhoneNumber(identifierValue ?? "");
  const phoneLogin = PHONE_REGEX.test(normalizedPhone);
  const emailLogin = isEmailAddress(identifierValue ?? "");
  const smsLogin = phoneLogin && !(passwordValue?.trim() ?? "");

  useEffect(() => {
    return () => {
      resetPhoneVerification();
    };
  }, []);

  const loadingCopy = useMemo(
    () => ({
      title: phoneChallenge ? "Checking your verification code" : "Opening your care space",
      description: phoneChallenge
        ? "We’re confirming your phone number and preparing the right dashboard."
        : "We’re gathering your profile and guiding you back to the right place.",
    }),
    [phoneChallenge],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (phoneLogin && !(values.password?.trim() ?? "")) {
      setIsPhoneLoading(true);

      try {
        const confirmation = await sendPhoneVerificationCode(values.identifier, LOGIN_PHONE_RECAPTCHA_ID);
        setPhoneChallenge(confirmation);
        toast({
          title: "A verification code is on its way",
          description: `We sent an SMS to ${normalizedPhone}. Enter the 6-digit code to continue.`,
        });
      } catch (error) {
        const message = getWarmFirebaseMessage(error, "login");
        toast({ ...message, variant: "destructive" });
      } finally {
        setIsPhoneLoading(false);
      }

      return;
    }

    try {
      const { profile } = await signInWithIdentifier(values.identifier, values.password ?? "");
      router.replace(resolveDestination(profile.role, returnTo));
    } catch (error) {
      const message = getWarmFirebaseMessage(error, "login");
      toast({ ...message, variant: "destructive" });
    }
  });

  const handlePhoneVerification = async () => {
    if (!phoneChallenge) {
      return;
    }

    if (phoneCode.trim().length < 6) {
      toast({
        title: "Enter the full verification code",
        description: "Use the 6-digit SMS code to finish signing in.",
        variant: "destructive",
      });
      return;
    }

    setIsPhoneLoading(true);

    try {
      const { profile } = await verifyPhoneCode(phoneChallenge, phoneCode, {
        language: localeToLanguage(language),
      });

      setPhoneChallenge(null);
      setPhoneCode("");
      resetPhoneVerification();
      router.replace(resolveDestination(profile.role, returnTo));
    } catch (error) {
      const message = getWarmFirebaseMessage(error, "login");
      toast({ ...message, variant: "destructive" });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendResetLink(getValues("identifier"));
      toast({
        title: "A reset link is on its way",
        description: "Check your inbox for the email you entered. You can return here once your password is ready.",
      });
    } catch (error) {
      if ((error as Error).message === "reset-email-only") {
        toast({
          title: "Password reset works with email sign-in",
          description: "Use the email linked to your account. Phone sign-in now works with SMS verification.",
          variant: "destructive",
        });
        return;
      }

      const message = getWarmFirebaseMessage(error, "reset");
      toast({ ...message, variant: "destructive" });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogleFlow({
        language: localeToLanguage(language),
      });

      if (result.redirected) {
        return;
      }

      router.replace(resolveDestination(result.profile.role, returnTo));
    } catch (error) {
      const message = getWarmFirebaseMessage(error, "google");
      toast({ ...message, variant: "destructive" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      {isSubmitting || isGoogleLoading || isPhoneLoading ? <LoadingBloom {...loadingCopy} /> : null}

      <Card className="overflow-hidden border-white/70 bg-white/88">
        <CardHeader className="border-b border-uzazi-petal/70 bg-white/75">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="badge-bloom w-fit">Karibu tena</p>
              <CardTitle className="text-4xl text-uzazi-rose">Sign in</CardTitle>
            </div>
            <LanguageToggle onChange={setLanguage} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 md:p-8">
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-medium text-uzazi-earth">
                Email or Phone Number
              </label>
              <Input
                id="identifier"
                aria-label="Email or phone number"
                aria-invalid={Boolean(errors.identifier)}
                placeholder="you@example.com or +254700000000"
                className={fieldRing}
                {...register("identifier")}
              />
              {errors.identifier ? (
                <p className="text-sm text-rose-600">{errors.identifier.message}</p>
              ) : null}
              {phoneLogin ? (
                <p className="text-sm leading-6 text-uzazi-earth/65">
                  Leave the password empty to sign in with an SMS code. If you used an older phone-password account,
                  you can still enter that password here.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-uzazi-earth">
                Password {smsLogin ? <span className="text-uzazi-earth/45">(optional for SMS sign-in)</span> : null}
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-uzazi-earth/55 transition hover:text-uzazi-earth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uzazi-blush"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
            </div>

            {phoneChallenge ? (
              <div className="space-y-4 rounded-[28px] border border-uzazi-blush/60 bg-uzazi-petal/55 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-2 text-uzazi-rose">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-uzazi-earth">Enter the SMS verification code</p>
                    <p className="mt-1 text-sm leading-6 text-uzazi-earth/72">
                      We sent a code to {normalizedPhone}. Enter it below to finish signing in.
                    </p>
                  </div>
                </div>

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
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={() => void handlePhoneVerification()}
                    className="rounded-full"
                    disabled={isPhoneLoading}
                  >
                    Verify and Continue
                  </Button>
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
            ) : null}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleForgotPassword()}
                className="text-sm font-medium text-uzazi-rose underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uzazi-blush"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting || isPhoneLoading}
              className="h-12 w-full rounded-full transition duration-200 hover:scale-[1.02] hover:shadow-bloom"
            >
              {smsLogin ? "Send Verification Code" : "Sign In"}
            </Button>
          </form>

          <AuthIntentDivider label="or continue with" />

          <Button
            type="button"
            variant="outline"
            onClick={() => void handleGoogleSignIn()}
            className="h-12 w-full rounded-full border-uzazi-earth/10 bg-white text-uzazi-earth hover:scale-[1.02] hover:bg-white"
          >
            <GoogleIcon />
            Google
          </Button>

          {!emailLogin ? (
            <p className="text-sm leading-6 text-uzazi-earth/65">
              Email accounts use passwords. Phone accounts can now use SMS verification without needing a password.
            </p>
          ) : null}

          <p className="text-sm text-uzazi-earth/72">
            New to Uzazi?{" "}
            <Link href="/register" className="font-semibold text-uzazi-rose underline-offset-4 hover:underline">
              Register here
            </Link>
          </p>

          <div id={LOGIN_PHONE_RECAPTCHA_ID} className="hidden" aria-hidden="true" />
        </CardContent>
      </Card>
    </div>
  );
}
