import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { MapPin, Navigation, Gauge, Wallet, ShieldCheck } from "lucide-react";

const schema = z.object({
  from: z.string().min(2, "Enter pickup location"),
  to: z.string().min(2, "Enter drop location"),
  time: z.string().min(1, "Select date & time"),
  seats: z.string().min(1),
  vehicle: z.enum(["car", "bike", "auto"]),
  distanceKm: z.coerce.number().min(0.5, "Distance must be >= 0.5 km"),
  pricePerSeat: z.coerce.number().min(1, "Price must be >= 1"),
  detourKm: z.number().min(0).max(10),
});

type FormValues = z.infer<typeof schema>;

function vehicleBase(vehicle: FormValues["vehicle"]) {
  switch (vehicle) {
    case "bike":
      return 3; // INR/km
    case "auto":
      return 5;
    default:
      return 6.5; // car
  }
}

export default function PostRide() {
  const navigate = useNavigate();
  const [detour, setDetour] = useState([2]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: "",
      to: "",
      time: "",
      seats: "2",
      vehicle: "car",
      distanceKm: 10,
      pricePerSeat: 0,
      detourKm: detour[0],
    },
  });

  const values = watch();

  const suggestedPrice = useMemo(() => {
    const base = vehicleBase(values.vehicle);
    const surge = values.time ? 1 : 1; // hook for future time-based pricing
    const perSeat = Math.round(base * Number(values.distanceKm) * surge / Number(values.seats || "1"));
    return Math.max(perSeat, 5);
  }, [values.vehicle, values.distanceKm, values.seats, values.time]);

  const totalPayout = useMemo(() => suggestedPrice * Number(values.seats || "1"), [suggestedPrice, values.seats]);

  const onSubmit = (data: FormValues) => {
    const ride = { ...data, id: crypto.randomUUID(), createdAt: Date.now() };
    const key = "ridelink:rides";
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as unknown[];
    localStorage.setItem(key, JSON.stringify([ride, ...existing]));
    toast.success("Ride posted", { description: `${data.from} → ${data.to} • ${data.seats} seat(s)` });
    navigate(`/search?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}&seats=${data.seats}`);
  };

  // keep detour in RHF state
  const onDetourChange = (v: number[]) => {
    setDetour(v);
    setValue("detourKm", v[0], { shouldDirty: true });
  };

  // auto-apply suggestion when empty or lower than suggestion
  const onDistanceChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = Number(e.target.value);
    setValue("distanceKm", val, { shouldDirty: true, shouldValidate: true });
    if (!values.pricePerSeat || values.pricePerSeat < suggestedPrice) setValue("pricePerSeat", suggestedPrice);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2">
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

              <div className="grid gap-4 sm:grid-cols-2">
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
                <div>
                  <label className="mb-1 block text-sm font-medium">Approx distance (km)</label>
                  <Input type="number" step="0.1" min={0.5} {...register("distanceKm", { valueAsNumber: true })} onChange={onDistanceChange} />
                  {errors.distanceKm && <p className="mt-1 text-sm text-red-600">{errors.distanceKm.message}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Detour tolerance (km)</label>
                <div className="px-1 py-2">
                  <Slider value={detour} onValueChange={onDetourChange} min={0} max={10} step={0.5} />
                </div>
                <input type="hidden" {...register("detourKm", { value: detour[0] })} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Price per seat (₹)</label>
                <Input type="number" min={1} step={1} {...register("pricePerSeat", { valueAsNumber: true })} onFocus={() => !values.pricePerSeat && setValue("pricePerSeat", suggestedPrice)} />
                {errors.pricePerSeat && <p className="mt-1 text-sm text-red-600">{errors.pricePerSeat.message}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Suggested: ₹{suggestedPrice} per seat based on distance and vehicle.</p>
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

        <Card className="md:sticky md:top-20 md:h-fit">
          <CardHeader>
            <CardTitle className="text-2xl">Live estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Gauge className="h-4 w-4 text-primary"/>Distance</span><span>{values.distanceKm} km</span></div>
              <div className="flex items-center justify-between"><span>Vehicle</span><span className="capitalize">{values.vehicle}</span></div>
              <div className="flex items-center justify-between"><span>Seats</span><span>{values.seats}</span></div>
              <div className="flex items-center justify-between"><span>Detour</span><span>{detour[0]} km</span></div>
              <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Wallet className="h-4 w-4 text-primary"/>Per‑seat price</span><span className="font-semibold">₹{values.pricePerSeat || suggestedPrice}</span></div>
              <div className="flex items-center justify-between border-t pt-3 text-base font-semibold"><span>Total payout</span><span>₹{totalPayout}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
