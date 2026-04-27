import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // Input import kiya
import {
  ShieldCheck,
  IdCard,
  FileCheck2,
  PhoneCall,
  BellRing,
  Siren,
  MessageCircle,
  Star,
  HelpCircle,
  ArrowRight,
  Loader2,
  UploadCloud
} from "lucide-react";
import { toast } from "sonner";

interface AuthUser {
  id: number;
  token: string;
  role: string;
  name: string;
  phone: string;
  email: string;
  kycStatus?: string;
  licenseUrl?: string | null;
  rcUrl?: string | null;
}

// --- CLOUDINARY UPLOAD HELPER ---
const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  // 🔥 APNI DETAILS YAHAN DAALEIN 🔥
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

function readAuth(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem("ridelink:auth") || "null");
  } catch {
    return null;
  }
}

function DocBadge({ status }: { status: string }) {
  const isOk = status === "APPROVED";
  const isPending = status === "PENDING";

  return (
    <Badge
      variant={isOk ? "default" : "secondary"}
      className={isOk ? "bg-green-600" : isPending ? "bg-yellow-500 text-white" : "bg-red-500 text-white"}
    >
      {status || "NOT SUBMITTED"}
    </Badge>
  );
}

export default function Safety() {
  const [auth, setAuth] = useState<AuthUser | null>(() => readAuth());
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<{ license: File | null; rc: File | null }>({
    license: null,
    rc: null,
  });

  useEffect(() => {
    const onStorage = () => setAuth(readAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleUpdateDocuments = async () => {
    if (!auth) return;
    if (!files.license || !files.rc) {
      toast.error("Please select both License and RC files");
      return;
    }

    try {
      setIsUploading(true);
      toast.info("Uploading documents to Cloudinary...");

      // 1. Upload to Cloudinary
      const licenseUrl = await uploadToCloudinary(files.license);
      const rcUrl = await uploadToCloudinary(files.rc);

      // 2. Backend Update
      const response = await fetch(`http://localhost:9090/api/auth/update-kyc?userId=${auth.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          licenseUrl: licenseUrl,
          rcUrl: rcUrl
        })
      });

      if (response.ok) {
        // LocalStorage Update
        const updatedAuth = { ...auth, kycStatus: "PENDING", licenseUrl, rcUrl };
        localStorage.setItem("ridelink:auth", JSON.stringify(updatedAuth));
        setAuth(updatedAuth);

        toast.success("Documents submitted! Admin will verify soon.");
        setFiles({ license: null, rc: null });
      } else {
        throw new Error("Failed to update backend");
      }
    } catch (error) {
      toast.error("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" /> Safety & Security
        </h1>
        {auth && (
          <Badge variant="secondary" className="text-sm">
            Status: <span className="ml-1 font-bold">{auth.kycStatus || "NEW"}</span>
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Verification Card */}
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <IdCard className="h-5 w-5 text-primary" /> Verification Portal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <DocBadge status={auth?.kycStatus || ""} />
              </div>

              {/* File Inputs - Visible only for Riders */}
              {auth?.role?.toLowerCase().includes("rider") || auth?.role?.toLowerCase().includes("driver") ? (
                <div className="space-y-3 pt-2 border-t">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Update Documents</p>
                  <div>
                    <label className="text-[10px] font-bold ml-1">DRIVING LICENSE</label>
                    <Input type="file" onChange={(e) => setFiles({...files, license: e.target.files?.[0] || null})} className="h-9 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold ml-1">VEHICLE RC</label>
                    <Input type="file" onChange={(e) => setFiles({...files, rc: e.target.files?.[0] || null})} className="h-9 text-xs" />
                  </div>
                  <Button
                    onClick={handleUpdateDocuments}
                    disabled={isUploading}
                    className="w-full mt-2"
                  >
                    {isUploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><UploadCloud className="mr-2 h-4 w-4" /> Submit for Verification</>
                    )}
                  </Button>
                </div>
              ) : (
                <Alert>
                  <FileCheck2 className="h-4 w-4" />
                  <AlertTitle>Passenger Account</AlertTitle>
                  <AlertDescription>Verification is only required for Riders to offer rides.</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BellRing className="h-5 w-5 text-primary" /> Emergency Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-3 mb-6">
              <li className="flex gap-2">✅ Share live location with family.</li>
              <li className="flex gap-2">✅ OTP verification before starting ride.</li>
              <li className="flex gap-2">✅ 24/7 Incident reporting system.</li>
            </ul>
            <div className="flex gap-3">
              <Button asChild variant="destructive" className="flex-1">
                <a href="tel:112"><Siren className="mr-2 h-4 w-4" /> SOS 112</a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a href="sms:112"><PhoneCall className="mr-2 h-4 w-4" /> SMS Help</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQs Section - (Pehle wala Accordion yahan rahega) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Safety Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Before the ride</AccordionTrigger>
              <AccordionContent>Always verify the vehicle number and driver photo before boarding.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>During the ride</AccordionTrigger>
              <AccordionContent>Share your trip status and keep your GPS on.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}