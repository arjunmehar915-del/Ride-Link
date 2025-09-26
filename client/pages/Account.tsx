import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User2, ShieldCheck, FileCheck2, Phone, Mail, LogOut, Trash2, Save, Repeat2, History, CreditCard, HelpCircle, ExternalLink, Settings, MessageCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface Auth {
  role: "user" | "rider";
  name: string;
  phone: string;
  email: string;
  docs?: { license?: string | null; rc?: string | null; aadhaar?: string | null };
}

function readAuth(): Auth | null {
  try { return JSON.parse(localStorage.getItem("ridelink:auth") || "null"); } catch { return null; }
}
function writeAuth(v: Auth | null) {
  if (v) localStorage.setItem("ridelink:auth", JSON.stringify(v)); else localStorage.removeItem("ridelink:auth");
}

export default function Account() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<Auth | null>(() => readAuth());

  useEffect(() => {
    const onStorage = () => setAuth(readAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [name, setName] = useState(auth?.name || "");
  const [email, setEmail] = useState(auth?.email || "");

  useEffect(() => {
    setName(auth?.name || "");
    setEmail(auth?.email || "");
  }, [auth]);

  const saveProfile = () => {
    if (!auth) return;
    const updated = { ...auth, name: name.trim(), email: email.trim() };
    writeAuth(updated);
    setAuth(updated);
    toast.success("Profile updated");
  };

  const logout = () => {
    localStorage.removeItem("ridelink:auth");
    toast("Signed out");
    navigate("/login");
  };

  const deleteAccount = () => {
    localStorage.removeItem("ridelink:auth");
    localStorage.removeItem("ridelink:currentRide");
    toast.success("Account data cleared");
    navigate("/login");
  };

  const [license, setLicense] = useState<File | null>(null);
  const [rc, setRc] = useState<File | null>(null);
  const [aadhaar, setAadhaar] = useState<File | null>(null);

  const saveKyc = () => {
    if (!auth) return;
    if (!license || !rc || !aadhaar) { toast.error("Upload Licence, RC and Aadhaar"); return; }
    const updated: Auth = {
      ...auth,
      role: "rider",
      docs: { license: license.name, rc: rc.name, aadhaar: aadhaar.name },
    };
    writeAuth(updated);
    setAuth(updated);
    toast.success("KYC saved");
  };

  const kycDone = useMemo(() => !!(auth?.docs?.license && auth.docs.rc && auth.docs.aadhaar), [auth]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2"><User2 className="h-7 w-7 text-primary"/> Account</h1>
        {auth && <Badge variant="secondary">{auth.name} • {auth.role}</Badge>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {auth ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Full name</label>
                  <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Gmail</label>
                  <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@gmail.com" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Mobile number</label>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground"><Phone className="h-4 w-4"/>+91 {auth.phone}</div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground"><Mail className="h-4 w-4"/>{auth.email}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="gap-2" onClick={saveProfile}><Save className="h-4 w-4"/>Save</Button>
                  <Button asChild variant="outline" className="gap-2"><Link to="/login?step=role"><Repeat2 className="h-4 w-4"/>Change role</Link></Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Not signed in. <Link to="/login" className="text-primary underline">Go to login</Link>.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/> Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {auth?.role === "rider" ? (
              <>
                <div className="text-sm text-muted-foreground">Current status: {kycDone ? "Complete" : "Incomplete"}</div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Licence</label>
                    <Input type="file" accept="image/*,application/pdf" onChange={(e)=>setLicense(e.target.files?.[0] || null)} />
                    {auth.docs?.license && <div className="mt-1 text-xs text-muted-foreground">On file: {auth.docs.license}</div>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">RC card</label>
                    <Input type="file" accept="image/*,application/pdf" onChange={(e)=>setRc(e.target.files?.[0] || null)} />
                    {auth.docs?.rc && <div className="mt-1 text-xs text-muted-foreground">On file: {auth.docs.rc}</div>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Aadhaar</label>
                    <Input type="file" accept="image/*,application/pdf" onChange={(e)=>setAadhaar(e.target.files?.[0] || null)} />
                    {auth.docs?.aadhaar && <div className="mt-1 text-xs text-muted-foreground">On file: {auth.docs.aadhaar}</div>}
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button className="gap-2" onClick={saveKyc}><FileCheck2 className="h-4 w-4"/>Save KYC</Button>
                  <Button asChild variant="outline"><Link to="/safety">Safety</Link></Button>
                </div>
              </>
            ) : (
              <Alert>
                <AlertTitle>Rider KYC</AlertTitle>
                <AlertDescription>
                  To offer rides, switch your role to Rider and complete KYC. You can always ride as a passenger without documents.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><History className="h-5 w-5 text-primary"/> Rides & billing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>View your past trips, download invoices, and manage refunds.</div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="gap-2"><Link to="/history"><History className="h-4 w-4"/>Ride history</Link></Button>
              <Button asChild variant="outline" className="gap-2"><Link to="/billing"><CreditCard className="h-4 w-4"/>Billing & payments</Link></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><Settings className="h-5 w-5 text-primary"/> Preferences</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>Communication: transactional emails and SMS for ride updates.</div>
            <div>Privacy: your phone and email are masked during rides.</div>
            <div>Location: live location is shared only with active trips you start.</div>
            <div className="pt-2">Need a change not listed here? <Link to="/help" className="text-primary underline">Contact support</Link>.</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary"/> Help & support</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>Chat with our bot or email the team. Safety issues are prioritized.</div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2"><Link to="/help"><MessageCircle className="h-4 w-4"/>Open chat</Link></Button>
              <Button asChild variant="outline" className="gap-2"><a href="mailto:support@ridelink.example"><HelpCircle className="h-4 w-4"/>Email support</a></Button>
              <Button asChild variant="outline" className="gap-2"><Link to="/safety"><Info className="h-4 w-4"/>Safety center</Link></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><ExternalLink className="h-5 w-5 text-primary"/> Links</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div><a className="text-primary underline" href="/about">About RideLink</a></div>
            <div><a className="text-primary underline" href="/safety">Safety & security</a></div>
            <div><a className="text-primary underline" href="https://instagram.com/ridelink" target="_blank" rel="noreferrer">Instagram</a></div>
            <div><a className="text-primary underline" href="https://x.com/ridelink" target="_blank" rel="noreferrer">X / Twitter</a></div>
            <div><a className="text-primary underline" href="https://linkedin.com/company/ridelink" target="_blank" rel="noreferrer">LinkedIn</a></div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Security & privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <div>Sign-in is OTP based; we don’t store passwords.</div>
            <div>Documents are used for verification only; see Safety for details.</div>
            <div>Delete account removes local app data immediately.</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2" onClick={logout}><LogOut className="h-4 w-4"/>Sign out</Button>
            <Button variant="destructive" className="gap-2" onClick={deleteAccount}><Trash2 className="h-4 w-4"/>Delete account & data</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
