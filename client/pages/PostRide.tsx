import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Navigation, ShieldCheck } from "lucide-react";

const schema = z.object({
  from: z.string().min(2, "Enter pickup location"),
  to: z.string().min(2, "Enter drop location"),
  time: z.string().min(1, "Select date & time"),
  seats: z.string().min(1),
  vehicle: z.enum(["car", "bike", "auto"]),
});

type FormValues = z.infer<typeof schema>;

interface StoredAuth {
  role?: string;
  docs?: {
    license?: string | null;
    rc?: string | null;
    aadhaar?: string | null;
  };
  [key: string]: unknown;
}

export default function PostRide() {
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: "",
      to: "",
      time: "",
      seats: "2",
      vehicle: "car",
    },
  });

  const values = watch();

  const onSubmit = (data: FormValues) => {
    let auth: unknown;
    try {
      auth = JSON.parse(localStorage.getItem("ridelink:auth") || "null");
    } catch {
      auth = null;
    }
    const authData = (auth as StoredAuth | null) ?? null;
    const docs = authData?.docs;
    const hasRiderDocs =
      docs !== undefined &&
      typeof docs?.license === "string" &&
      docs.license &&
      typeof docs?.rc === "string" &&
      docs.rc &&
      typeof docs?.aadhaar === "string" &&
      docs.aadhaar;

    if (authData?.role !== "rider" || !hasRiderDocs) {
      toast.error("Complete rider verification to publish rides");
      const params = new URLSearchParams();
      params.set("step", "rider-kyc");
      params.set("redirect", "/post-ride");
      navigate(`/login?${params.toString()}`);
      return;
    }

    const ride = { ...data, id: crypto.randomUUID(), createdAt: Date.now() };
    const key = "ridelink:rides";
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as unknown[];
    localStorage.setItem(key, JSON.stringify([ride, ...existing]));
    toast.success("Ride posted", { description: `${data.from} → ${data.to} • ${data.seats} seat(s)` });
    navigate(`/search?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}&seats=${data.seats}`);
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post a ride</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium">From</label>
              <div className="relative">
                <Input placeholder="Pickup location" className="pl-9" {...register("from")} />
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.from && <p className="mt-1 text-sm text-red-600">{errors.from.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">To</label>
              <div className="relative">
                <Input placeholder="Drop location" className="pl-9" {...register("to")} />
                <Navigation className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.to && <p className="mt-1 text-sm text-red-600">{errors.to.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Date & time</label>
                <Input type="datetime-local" {...register("time")} />
                {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Seats</label>
                <Select value={values.seats} onValueChange={(v) => setValue("seats", v, { shouldDirty: true })}>
                  <SelectTrigger><SelectValue placeholder="1" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Vehicle type</label>
              <Select value={values.vehicle} onValueChange={(v: FormValues["vehicle"]) => setValue("vehicle", v, { shouldDirty: true })}>
                <SelectTrigger><SelectValue placeholder="car" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                  <SelectItem value="auto">Auto / EV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> OTP verification at start; live GPS tracking supported.
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">Publish ride</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
