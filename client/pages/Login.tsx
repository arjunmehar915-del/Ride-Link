import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

const baseSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().regex(/^\d{10}$/g, "Enter 10‑digit mobile number"),
  email: z.string().email("Enter a valid Gmail address"),
  otp: z.string().length(6, "Enter 6‑digit OTP"),
});

type RegistrationValues = z.infer<typeof baseSchema>;

type Step = "register" | "role" | "rider-kyc";

interface RiderDocs {
  license?: File | null;
  rc?: File | null;
}

function useOtp(phone: string) {
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    [],
  );

  const send = () => {
    if (!phone) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setSeconds(30);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(
      () => setSeconds((s) => (s > 0 ? s - 1 : 0)),
      1000,
    );
    toast.success("OTP sent", {
      description: `+91 ${phone} • Demo code: ${code}`,
    });
  };

  const verify = (value: string) => value === sentCode;

  return { send, verify, seconds, hasCode: !!sentCode };
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = (searchParams.get("step") as Step) || "register";
  const redirectParam = searchParams.get("redirect");
  const redirectTo = useMemo(() => {
    if (!redirectParam) return "/";
    if (!redirectParam.startsWith("/")) return "/";
    if (redirectParam.startsWith("//")) return "/";
    if (redirectParam === "/login") return "/";
    return redirectParam;
  }, [redirectParam]);
  const roleParamRaw = searchParams.get("role");
  const roleHint: "user" | "rider" | null =
    roleParamRaw === "user" || roleParamRaw === "rider" ? roleParamRaw : null;

  const [registration, setRegistration] = useState<RegistrationValues | null>(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("ridelink:registration") || "null",
        );
      } catch {
        return null;
      }
    },
  );

  const form = useForm<RegistrationValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { name: "", phone: "", email: "", otp: "" },
  });
  const otp = useOtp(form.watch("phone"));

  useEffect(() => {
    if ((step === "role" || step === "rider-kyc") && !registration) {
      const params = new URLSearchParams();
      params.set("step", "register");
      if (redirectParam !== null) params.set("redirect", redirectParam);
      if (roleHint) params.set("role", roleHint);
      setSearchParams(params);
    }
  }, [step, registration, redirectParam, roleHint, setSearchParams]);

  const go = (next: Step) => {
    const params = new URLSearchParams();
    params.set("step", next);
    if (redirectParam !== null) params.set("redirect", redirectParam);
    if (roleHint) params.set("role", roleHint);
    setSearchParams(params);
  };

  const completePassengerSignin = (details: RegistrationValues) => {
    localStorage.setItem(
      "ridelink:auth",
      JSON.stringify({
        role: "user",
        name: details.name,
        phone: details.phone,
        email: details.email,
      }),
    );
    localStorage.removeItem("ridelink:registration");
    setRegistration(null);
    toast.success("Signed in as passenger");
    navigate(redirectTo, { replace: true });
  };

  const onRegister = form.handleSubmit((data) => {
    if (!otp.verify(data.otp)) {
      toast.error("Invalid OTP");
      return;
    }
    setRegistration(data);
    localStorage.setItem("ridelink:registration", JSON.stringify(data));
    toast.success("Verified");
    if (roleHint === "user") {
      completePassengerSignin(data);
      return;
    }
    if (roleHint === "rider") {
      go("rider-kyc");
      return;
    }
    go("role");
  });

  const choosePassenger = () => {
    if (!registration) return;
    completePassengerSignin(registration);
  };

  const [docs, setDocs] = useState<RiderDocs>({});
  const onRiderKyc = () => {
    if (!registration) return;
    if (!docs.license || !docs.rc) {
      toast.error("Please upload Licence and RC");
      return;
    }
    localStorage.setItem(
      "ridelink:auth",
      JSON.stringify({
        role: "rider",
        name: registration.name,
        phone: registration.phone,
        email: registration.email,
        docs: {
          license: (docs.license as File).name,
          rc: (docs.rc as File).name,
        },
      }),
    );
    localStorage.removeItem("ridelink:registration");
    setRegistration(null);
    toast.success("Rider verified");
    navigate(redirectTo, { replace: true });
  };

  if (step === "role") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Choose your role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-5">
                <h3 className="text-lg font-semibold">Passenger</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Request rides instantly and pay per seat.
                </p>
                <Button className="mt-4 w-full" onClick={choosePassenger}>
                  Continue as passenger
                </Button>
              </div>
              <div className="rounded-lg border p-5">
                <h3 className="text-lg font-semibold">Rider</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Offer rides and earn. KYC required.
                </p>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => go("rider-kyc")}
                >
                  Continue as rider
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-6"
              onClick={() => go("register")}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (step === "rider-kyc") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Rider verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Licence
                </label>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    setDocs((d) => ({
                      ...d,
                      license: e.target.files?.[0] || null,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  RC card
                </label>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    setDocs((d) => ({ ...d, rc: e.target.files?.[0] || null }))
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button className="flex-1" onClick={onRiderKyc}>
                Verify & continue
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => go("role")}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onRegister} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Full name
              </label>
              <Input placeholder="Your name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.name.message as string}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Mobile number
                </label>
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10‑digit number"
                  {...form.register("phone")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Gmail</label>
                <Input
                  type="email"
                  placeholder="you@gmail.com"
                  {...form.register("email")}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={otp.send}
                  disabled={!form.watch("phone") || otp.seconds > 0}
                >
                  {otp.seconds > 0 ? `Resend in ${otp.seconds}s` : "Send OTP"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  We’ll text a 6‑digit code to your phone.
                </span>
              </div>
              <div className="mt-3">
                <InputOTP
                  maxLength={6}
                  value={form.watch("otp")}
                  onChange={(v) => form.setValue("otp", v)}
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(redirectTo, { replace: true })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
