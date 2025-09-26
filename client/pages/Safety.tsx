import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, IdCard, FileCheck2, PhoneCall, BellRing, MapPin, Eye, Lock, UserCheck, Siren, MessageCircle, Star, HelpCircle, ArrowRight } from "lucide-react";

interface AuthUser {
  role: "user" | "rider";
  name: string;
  phone: string;
  email: string;
  docs?: { license?: string | null; rc?: string | null; aadhaar?: string | null };
}

function readAuth(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem("ridelink:auth") || "null"); } catch { return null; }
}

function DocBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Badge variant={ok ? "default" : "secondary"} className={ok ? "bg-green-600" : undefined}>
      {ok ? "Verified" : "Missing"} • {label}
    </Badge>
  );
}

export default function Safety() {
  const [auth, setAuth] = useState<AuthUser | null>(() => readAuth());
  useEffect(() => {
    const onStorage = () => setAuth(readAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const docs = auth?.docs ?? {};
  const kycComplete = useMemo(() => !!(docs.license && docs.rc && docs.aadhaar), [docs]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-primary"/> Safety & Security</h1>
        <div className="flex flex-wrap items-center gap-2">
          {auth ? (
            <Badge variant="secondary" className="text-sm">Signed in as {auth.name} • {auth.role}</Badge>
          ) : (
            <Badge variant="secondary" className="text-sm">Not signed in</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><IdCard className="h-5 w-5 text-primary"/> Verification status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <DocBadge ok={!!docs.license} label="Licence"/>
              <DocBadge ok={!!docs.rc} label="RC"/>
              <DocBadge ok={!!docs.aadhaar} label="Aadhaar"/>
            </div>
            <Alert className="mt-4">
              <AlertTitle className="flex items-center gap-2"><FileCheck2 className="h-4 w-4"/>KYC</AlertTitle>
              <AlertDescription>
                {auth?.role === "rider" ? (
                  kycComplete ? "Your rider KYC is complete. Keep documents up to date for continued access." : "Upload required documents to start offering rides."
                ) : (
                  "Passengers are not required to submit documents. Riders must complete KYC before accepting rides."
                )}
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex flex-wrap gap-3">
              {!auth && (
                <Button asChild><Link to="/login?step=register" className="inline-flex items-center gap-2"><UserCheck className="h-4 w-4"/>Register</Link></Button>
              )}
              {auth && auth.role === "user" && (
                <Button asChild variant="outline"><Link to="/login?step=role">Switch role</Link></Button>
              )}
              {auth && auth.role === "rider" && (
                <Button asChild variant="outline"><Link to="/login?step=rider-kyc" className="inline-flex items-center gap-2"><FileCheck2 className="h-4 w-4"/>Update documents</Link></Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><BellRing className="h-5 w-5 text-primary"/> Live ride protection</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc text-muted-foreground space-y-2">
              <li>OTP at pickup to ensure you’re boarding the allotted rider.</li>
              <li>Masked contact: in-app calling without revealing phone numbers.</li>
              <li>Share trip status with trusted contacts and enable live location.</li>
              <li>Post‑ride ratings and reports help us keep the community safe.</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="outline"><a href="tel:112" className="inline-flex items-center gap-2"><Siren className="h-4 w-4"/>Emergency 112</a></Button>
              <Button asChild variant="outline"><a href="sms:+91112" className="inline-flex items-center gap-2"><PhoneCall className="h-4 w-4"/>Text emergency</a></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><HelpCircle className="h-5 w-5 text-primary"/> Safety guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="pickup">
              <AccordionTrigger className="text-base">Before pickup</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="list-inside list-disc space-y-2">
                  <li>Match vehicle model and registration plate shown in the app.</li>
                  <li>Verify rider photo and rating; cancel if details don’t match.</li>
                  <li>Prefer well‑lit pickup points and avoid secluded areas.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="during">
              <AccordionTrigger className="text-base">During the ride</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="list-inside list-disc space-y-2">
                  <li>Share the 4‑digit OTP only after confirming rider details.</li>
                  <li>Wear a helmet; riders are expected to carry a spare for passengers.</li>
                  <li>Keep valuables secure and avoid sharing personal information.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="after">
              <AccordionTrigger className="text-base">After the ride</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="list-inside list-disc space-y-2">
                  <li>Rate your experience and report any issue immediately.</li>
                  <li>Lost and found support is available from your trip history.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacy">
              <AccordionTrigger className="text-base">Privacy and data protection</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="list-inside list-disc space-y-2">
                  <li>Only essential data is stored and never sold to third parties.</li>
                  <li>Documents are used solely for verification and compliance.</li>
                  <li>Requests to delete data can be raised from account settings.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rider-standards">
              <AccordionTrigger className="text-base">Rider standards</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="list-inside list-disc space-y-2">
                  <li>Valid licence, RC and Aadhaar required to accept rides.</li>
                  <li>Carry a spare ISI‑marked helmet and obey traffic rules.</li>
                  <li>Maintain high ratings; repeated safety flags lead to suspension.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="passenger-steps">
              <AccordionTrigger className="text-base">Passenger safety steps</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="list-inside list-disc space-y-2">
                  <li>Check plate number and rider identity before boarding.</li>
                  <li>Confirm route in the app and share trip with a contact.</li>
                  <li>Use in‑app messaging; avoid exchanging personal numbers.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><MessageCircle className="h-5 w-5 text-primary"/> Support</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>If you faced any issue, contact support with your ride ID. Our team prioritizes safety complaints.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline"><a href="mailto:support@ridelink.example" className="inline-flex items-center gap-2"><Eye className="h-4 w-4"/>Email support</a></Button>
            <Button asChild variant="outline"><Link to="/search" className="inline-flex items-center gap-2"><Star className="h-4 w-4"/>View ride options<ArrowRight className="h-4 w-4"/></Link></Button>
            {auth?.role === "rider" && (
              <Button asChild variant="outline"><Link to="/login?step=rider-kyc" className="inline-flex items-center gap-2"><FileCheck2 className="h-4 w-4"/>Manage KYC</Link></Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
