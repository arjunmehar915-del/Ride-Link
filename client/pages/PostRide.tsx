import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Navigation, ShieldCheck, IndianRupee, Clock, XCircle } from "lucide-react";

const schema = z.object({
  from: z.string().min(2, "Enter pickup location"),
  to: z.string().min(2, "Enter drop location"),
  time: z.string().min(1, "Select date & time"),
  seats: z.string().min(1),
  price: z.string().min(1, "Enter price per seat"),
  vehicle: z.enum(["car", "bike", "auto"]),
});

type FormValues = z.infer<typeof schema>;

export default function PostRide() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auth, setAuth] = useState<any>(null);

  // 1. Auth data load karna component mount hote hi
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("ridelink:auth") || "null");
    setAuth(authData);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: "",
      to: "",
      time: "",
      seats: "2",
      price: "",
      vehicle: "car",
    },
  });

  const values = watch();

  // 2. 🔥 KYC RESTRICTION UI 🔥
  if (auth) {
    const currentRole = String(auth.role || "").toUpperCase();
    const isRider = currentRole.includes("RIDER") || currentRole.includes("DRIVER");

    if (isRider && auth.kycStatus !== "APPROVED") {
      return (
        <section className="mx-auto max-w-3xl px-4 py-20 text-center">
          <Card className="border-dashed border-2">
            <CardContent className="pt-10 pb-10 flex flex-col items-center">
              {auth.kycStatus === "REJECTED" ? (
                <>
                  <XCircle className="h-16 w-16 text-destructive mb-4" />
                  <h2 className="text-2xl font-bold">KYC Rejected</h2>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Your documents were rejected by the admin. Please update your profile with correct details.
                  </p>
                </>
              ) : (
                <>
                  <Clock className="h-16 w-16 text-yellow-500 mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold">Verification Pending</h2>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Aapka KYC verification abhi process mein hai. Admin ki approval ke baad hi aap ride post kar payenge.
                  </p>
                </>
              )}
              <div className="mt-6 flex gap-3">
                <Button variant="outline" asChild><Link to="/">Home</Link></Button>
                <Button asChild><Link to="/account">Check Profile</Link></Button>
              </div>
            </CardContent>
          </Card>
        </section>
      );
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!auth?.token) {
      toast.error("You must be logged in!");
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        sourceName: data.from,
        sourceLatitude: 28.7041,
        sourceLongitude: 77.1025,
        destinationName: data.to,
        destinationLatitude: 26.9124,
        destinationLongitude: 75.7873,
        departureTime: data.time + ":00",
        pricePerSeat: parseFloat(data.price),
        totalSeats: parseInt(data.seats)
      };

      const response = await fetch(`http://localhost:9090/api/rides/create?driverId=${auth.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Server error while creating ride");

      toast.success("Ride posted successfully!");
      navigate("/search");

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post a ride</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Form Fields - Pehle wale hi rahenge */}
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
                <label className="mb-1 block text-sm font-medium">Price per seat (₹)</label>
                <div className="relative">
                  <Input type="number" placeholder="e.g. 500" className="pl-9" {...register("price")} />
                  <IndianRupee className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Seats</label>
                <Select value={values.seats} onValueChange={(v) => setValue("seats", v)}>
                  <SelectTrigger><SelectValue placeholder="1" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Vehicle type</label>
                <Select value={values.vehicle} onValueChange={(v: any) => setValue("vehicle", v)}>
                  <SelectTrigger><SelectValue placeholder="car" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="auto">Auto / EV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Approved drivers only.
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish ride"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/")} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}