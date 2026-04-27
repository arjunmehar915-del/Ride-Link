import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// --- SCHEMAS ---
const loginSchema = z.object({
  email: z.string().email("Enter a valid Gmail address"),
  password: z.string().min(6, "Enter your password"),
  otp: z.string().length(6, "Enter 6‑digit OTP"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().regex(/^\d{10}$/g, "Enter 10‑digit mobile number"),
  email: z.string().email("Enter a valid Gmail address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  otp: z.string().length(6, "Enter 6‑digit OTP"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegistrationValues = z.infer<typeof registerSchema>;

type Step = "auth" | "role" | "rider-kyc";

interface RiderDocs {
  license?: File | null;
  rc?: File | null;
}

// --- REAL BACKEND OTP LOGIC ---
function useOtp() {
  const [seconds, setSeconds] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "empty" | "default" | "error" | "success" }>({
    text: "",
    type: "empty"
  });

  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  const send = async (email: string, isLoginMode: boolean = false) => {
    if (!email || !email.includes("@")) {
      setStatusMsg({ text: "❌ Please enter a valid email.", type: "error" });
      return;
    }

    try {
      setIsSending(true);
      setStatusMsg({ text: "⏳ Sending OTP...", type: "default" });

      const requestType = isLoginMode ? "login" : "register";
      const response = await fetch(`http://localhost:9090/api/auth/send-otp?email=${email}&type=${requestType}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (!isLoginMode) {
          throw new Error("Failed to send OTP because email already registered.");
        } else {
          throw new Error(errorData?.message || "Account not found. Please Sign Up first.");
        }
      }

      setSeconds(60);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);

      setStatusMsg({ text: "✅ OTP sent successfully!", type: "success" });
      toast.success("OTP sent to your Gmail!");
    } catch (error: any) {
      setStatusMsg({ text: "❌ " + error.message, type: "error" });
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => {
    setStatusMsg({ text: "", type: "empty" });
    setSeconds(0);
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  return { send, seconds, isSending, statusMsg, reset };
}

const verifyOtpBackend = async (email: string, otp: string) => {
  const response = await fetch(`http://localhost:9090/api/auth/verify-otp?email=${email}&otp=${otp}`, {
    method: "POST"
  });
  if (!response.ok) throw new Error("Invalid or Expired OTP");
  return true;
};

// ================= CLOUDINARY HELPER =================
const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);


  formData.append("upload_preset", "RideLink_docs");
  const cloudName = "dnfu7zadq";

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url;
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = (searchParams.get("step") as Step) || "auth";
  const redirectParam = searchParams.get("redirect");

  const redirectTo = useMemo(() => {
    if (!redirectParam) return "/";
    if (!redirectParam.startsWith("/")) return "/";
    if (redirectParam === "/login") return "/";
    return redirectParam;
  }, [redirectParam]);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otp = useOtp();

  const [registrationData, setRegistrationData] = useState<RegistrationValues | null>(null);
  const [docs, setDocs] = useState<RiderDocs>({});

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("ridelink:auth") || "{}");
    if (auth?.token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", otp: "" },
  });

  const registerForm = useForm<RegistrationValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "", email: "", password: "", otp: "" },
  });

  const go = (next: Step) => {
    const params = new URLSearchParams(searchParams);
    params.set("step", next);
    setSearchParams(params);
  };

  // ================= 1. LOGIN SUBMIT =================
  const onLoginSubmit = async (data: LoginValues) => {
    try {
      setIsSubmitting(true);
      await verifyOtpBackend(data.email, data.otp);

      const response = await fetch("http://localhost:9090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      if (!response.ok) throw new Error("Invalid credentials");
      const authData = await response.json();

      let assignedRole = "user";
      const dbRole = String(authData.role || "").toUpperCase();

      if (dbRole.includes("ADMIN")) {
        assignedRole = "ADMIN";
      } else if (dbRole.includes("DRIVER")) {
        assignedRole = "rider";
      }

      localStorage.setItem("ridelink:auth", JSON.stringify({
        token: authData.token || authData.jwt,
        id: authData.id,
        role: assignedRole,
        email: authData.email,
        name: authData.fullName || authData.name || "User",
        kycStatus: authData.kycStatus || "PENDING" // 🔥 Added KYC Status
      }));

      toast.success("Successfully logged in!");

      setTimeout(() => {
        window.location.replace(redirectTo);
      }, 500);

    } catch (error: any) {
      toast.error(error.message || "Login Failed");
      setIsSubmitting(false);
    }
  };

  // ================= 2. REGISTER PASSENGER SUBMIT =================
  const registerPassengerBackend = async (details: RegistrationValues) => {
    try {
      await fetch("http://localhost:9090/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: details.name, email: details.email, password: details.password, phone: details.phone, role: "USER" })
      });

      const loginRes = await fetch("http://localhost:9090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: details.email, password: details.password })
      });

      const authData = await loginRes.json();

      localStorage.setItem("ridelink:auth", JSON.stringify({
        token: authData.jwt || authData.token,
        id: authData.id,
        role: "user",
        name: details.name,
        email: authData.email,
        kycStatus: authData.kycStatus || null
      }));

      window.location.replace("/");
      return true;
    } catch (error) {
      toast.error("Registration Failed");
      return false;
    }
  };

  // ================= 3. REGISTER RIDER (KYC) SUBMIT =================
  const onRiderKycSubmit = async () => {
    if (!registrationData) return;
    if (!docs.license || !docs.rc) {
      toast.error("Please upload both Licence and RC");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info("Uploading documents, please wait...");

      // 1. Upload images to Cloudinary
      const licenseUrl = await uploadToCloudinary(docs.license);
      const rcUrl = await uploadToCloudinary(docs.rc);

      // 2. Register Driver with backend
      await fetch("http://localhost:9090/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: registrationData.name,
          email: registrationData.email,
          password: registrationData.password,
          phone: registrationData.phone,
          role: "DRIVER",
          licenseUrl: licenseUrl,
          rcUrl: rcUrl
        })
      });

      // 3. Auto Login
      const loginRes = await fetch("http://localhost:9090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registrationData.email, password: registrationData.password })
      });

      const authData = await loginRes.json();

      localStorage.setItem("ridelink:auth", JSON.stringify({
        token: authData.jwt || authData.token,
        id: authData.id,
        role: "rider",
        name: registrationData.name,
        email: authData.email,
        kycStatus: "PENDING"
      }));

      toast.success("Registration successful! Pending Admin Verification.");
      window.location.replace("/");

    } catch (error) {
      console.error(error);
      toast.error("Rider registration failed. Check file size or network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegistrationValues) => {
    try {
      setIsSubmitting(true);
      await verifyOtpBackend(data.email, data.otp);
      setRegistrationData(data);
      toast.success("OTP Verified! Choose your role.");
      go("role");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= RENDER STEPS =================
  if (step === "role") {
    return (
      <section className="flex items-center justify-center px-4 py-8 min-h-[70vh]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-xl">Choose your role</CardTitle>
          </CardHeader>
          <CardContent className="pb-5 grid grid-cols-2 gap-3">
            <Button className="h-9 text-xs" onClick={() => registerPassengerBackend(registrationData!)} disabled={isSubmitting}>
              Passenger
            </Button>
            <Button variant="outline" className="h-9 text-xs" onClick={() => go("rider-kyc")} disabled={isSubmitting}>
              Rider
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (step === "rider-kyc") {
    return (
      <section className="flex items-center justify-center px-4 py-8 min-h-[70vh]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-xl">Rider verification</CardTitle>
          </CardHeader>
          <CardContent className="pb-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input type="file" className="h-9 text-xs" onChange={(e) => setDocs(d => ({...d, license: e.target.files?.[0]}))} />
              <Input type="file" className="h-9 text-xs" onChange={(e) => setDocs(d => ({...d, rc: e.target.files?.[0]}))} />
            </div>
            {/* 🔥 Changed onClick to onRiderKycSubmit 🔥 */}
            <Button className="w-full h-9 text-sm" onClick={onRiderKycSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify & Continue"}
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex items-center justify-center px-4 py-4 min-h-[75vh]">
      <Card className="w-full max-w-[420px] shadow-xl border-primary/10">
        <CardHeader className="pb-2 pt-5">
          <div className="flex bg-slate-100 p-1 rounded-md mb-2">
            <Button variant={isLoginMode ? "default" : "ghost"} onClick={() => { setIsLoginMode(true); otp.reset(); }} className="flex-1 h-8 text-xs font-semibold">Login</Button>
            <Button variant={!isLoginMode ? "default" : "ghost"} onClick={() => { setIsLoginMode(false); otp.reset(); }} className="flex-1 h-8 text-xs font-semibold">Sign Up</Button>
          </div>
          <CardTitle className="text-lg font-bold text-slate-800">{isLoginMode ? "Welcome Back" : "Create an Account"}</CardTitle>
          <CardDescription className="text-xs">
            {isLoginMode ? "Enter details to login." : "Fill the form below to join."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-5">
          <form onSubmit={isLoginMode ? loginForm.handleSubmit(onLoginSubmit) : registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3">
            {!isLoginMode && <Input placeholder="Full Name" className="h-9 text-sm" {...registerForm.register("name")} />}
            {!isLoginMode && <Input placeholder="Mobile (10 digits)" className="h-9 text-sm" {...registerForm.register("phone")} />}

            <Input type="email" placeholder="Gmail address" className="h-9 text-sm" {...(isLoginMode ? loginForm.register("email") : registerForm.register("email"))} />
            <Input type="password" placeholder="Password" className="h-9 text-sm" {...(isLoginMode ? loginForm.register("password") : registerForm.register("password"))} />

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => otp.send(isLoginMode ? loginForm.getValues("email") : registerForm.getValues("email"), isLoginMode)}
                disabled={otp.seconds > 0 || otp.isSending}
                className="w-full sm:w-auto h-8 text-xs"
              >
                {otp.seconds > 0 ? `Resend (${otp.seconds}s)` : "Send OTP"}
              </Button>
              {otp.statusMsg.text && (
                <span className={`text-[11px] font-semibold ${otp.statusMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                  {otp.statusMsg.text}
                </span>
              )}
            </div>

            <div className="mt-2 flex justify-center">
              <InputOTP maxLength={6} value={isLoginMode ? loginForm.watch("otp") : registerForm.watch("otp")} onChange={(v) => isLoginMode ? loginForm.setValue("otp", v) : registerForm.setValue("otp", v)}>
                <InputOTPGroup>{[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} className="h-8 w-8 text-sm" />)}</InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" className="w-full h-9 font-bold mt-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : isLoginMode ? "Login" : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}