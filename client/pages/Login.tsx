import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

const baseSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().regex(/^\d{10}$/g, "Enter 10‑digit mobile number"),
  email: z.string().email("Enter a valid Gmail address"),
  otp: z.string().length(6, "Enter 6‑digit OTP"),
});

const riderSchema = baseSchema.extend({
  license: z.instanceof(File).or(z.any()).optional(),
  rc: z.instanceof(File).or(z.any()).optional(),
  aadhaar: z.instanceof(File).or(z.any()).optional(),
});

type UserValues = z.infer<typeof baseSchema>;
interface RiderValues extends z.infer<typeof riderSchema> {}

function useOtp(phone: string) {
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  const send = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setSeconds(30);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    toast.success("OTP sent", { description: `+91 ${phone} • Demo code: ${code}` });
  };

  const verify = (value: string) => value === sentCode;

  return { send, verify, seconds, hasCode: !!sentCode };
}

export default function Login() {
  const navigate = useNavigate();

  const userForm = useForm<UserValues>({ resolver: zodResolver(baseSchema), defaultValues: { name: "", phone: "", email: "", otp: "" } });
  const riderForm = useForm<RiderValues>({ resolver: zodResolver(riderSchema), defaultValues: { name: "", phone: "", email: "", otp: "" } });

  const userOtp = useOtp(userForm.watch("phone"));
  const riderOtp = useOtp(riderForm.watch("phone"));

  const handleUser = userForm.handleSubmit((data) => {
    if (!userOtp.verify(data.otp)) { toast.error("Invalid OTP"); return; }
    localStorage.setItem("ridelink:auth", JSON.stringify({ role: "user", name: data.name, phone: data.phone, email: data.email }));
    toast.success("Signed in as passenger");
    navigate("/");
  });

  const handleRider = riderForm.handleSubmit((data) => {
    if (!riderOtp.verify(data.otp)) { toast.error("Invalid OTP"); return; }
    const docs = {
      license: (data as any).license?.name ?? null,
      rc: (data as any).rc?.name ?? null,
      aadhaar: (data as any).aadhaar?.name ?? null,
    };
    if (!docs.license || !docs.rc || !docs.aadhaar) { toast.error("Please upload Licence, RC and Aadhaar"); return; }
    localStorage.setItem("ridelink:auth", JSON.stringify({ role: "rider", name: data.name, phone: data.phone, email: data.email, docs }));
    toast.success("Rider verified");
    navigate("/");
  });

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="user">Passenger</TabsTrigger>
              <TabsTrigger value="rider">Rider</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUser} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium">Full name</label>
                  <Input placeholder="Your name" {...userForm.register("name")} />
                  {userForm.formState.errors.name && <p className="mt-1 text-sm text-red-600">{userForm.formState.errors.name.message as string}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Mobile number</label>
                    <Input inputMode="numeric" maxLength={10} placeholder="10‑digit number" {...userForm.register("phone")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Gmail</label>
                    <Input type="email" placeholder="you@gmail.com" {...userForm.register("email")} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <Button type="button" onClick={userOtp.send} disabled={!userForm.watch("phone") || userOtp.seconds>0}>
                      {userOtp.seconds>0?`Resend in ${userOtp.seconds}s`:"Send OTP"}
                    </Button>
                    <span className="text-xs text-muted-foreground">We’ll text a 6‑digit code to your phone.</span>
                  </div>
                  <div className="mt-3">
                    <InputOTP maxLength={6} value={userForm.watch("otp")} onChange={(v)=>userForm.setValue("otp", v)}>
                      <InputOTPGroup>
                        {[0,1,2,3,4,5].map(i=> (<InputOTPSlot key={i} index={i} />))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">Continue</Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={()=>navigate("/")}>Cancel</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="rider">
              <form onSubmit={handleRider} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium">Full name</label>
                  <Input placeholder="Your name" {...riderForm.register("name")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Mobile number</label>
                    <Input inputMode="numeric" maxLength={10} placeholder="10‑digit number" {...riderForm.register("phone")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Gmail</label>
                    <Input type="email" placeholder="you@gmail.com" {...riderForm.register("email")} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Licence</label>
                    <Input type="file" accept="image/*,application/pdf" onChange={(e)=>riderForm.setValue("license", e.target.files?.[0] as any)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">RC card</label>
                    <Input type="file" accept="image/*,application/pdf" onChange={(e)=>riderForm.setValue("rc", e.target.files?.[0] as any)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Aadhaar</label>
                    <Input type="file" accept="image/*,application/pdf" onChange={(e)=>riderForm.setValue("aadhaar", e.target.files?.[0] as any)} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <Button type="button" onClick={riderOtp.send} disabled={!riderForm.watch("phone") || riderOtp.seconds>0}>
                      {riderOtp.seconds>0?`Resend in ${riderOtp.seconds}s`:"Send OTP"}
                    </Button>
                    <span className="text-xs text-muted-foreground">We’ll text a 6‑digit code to your phone.</span>
                  </div>
                  <div className="mt-3">
                    <InputOTP maxLength={6} value={riderForm.watch("otp")} onChange={(v)=>riderForm.setValue("otp", v)}>
                      <InputOTPGroup>
                        {[0,1,2,3,4,5].map(i=> (<InputOTPSlot key={i} index={i} />))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">Verify & continue</Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={()=>navigate("/")}>Cancel</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
