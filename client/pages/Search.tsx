import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bike,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  TimerReset,
  X,
  IndianRupee,
  Award,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Rider {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  rating: number;
  trips: number;
  distanceKm: number;
  etaMin: number;
  fare: number; // per seat
  experienceYears: number;
  helmetAvailable: boolean;
}

interface CurrentRide {
  id: string;
  rider: Rider;
  from: string;
  to: string;
  seats: number;
  otp: string;
  status: "allocated" | "ongoing" | "completed";
  createdAt: number;
}

const demoRiders: Rider[] = [
  {
    id: "r1",
    name: "Aman K.",
    vehicle: "Hero Splendor (Black)",
    plate: "RJ14 BK 4021",
    rating: 4.9,
    trips: 1240,
    distanceKm: 0.8,
    etaMin: 3,
    fare: 48,
    experienceYears: 5,
    helmetAvailable: true,
  },
  {
    id: "r2",
    name: "Neeraj S.",
    vehicle: "TVS Star City (Blue)",
    plate: "RJ45 AC 9982",
    rating: 4.8,
    trips: 980,
    distanceKm: 1.2,
    etaMin: 5,
    fare: 46,
    experienceYears: 4,
    helmetAvailable: true,
  },
  {
    id: "r3",
    name: "Ravi P.",
    vehicle: "Bajaj Platina (Red)",
    plate: "RJ27 DD 2156",
    rating: 4.7,
    trips: 1523,
    distanceKm: 1.8,
    etaMin: 7,
    fare: 45,
    experienceYears: 6,
    helmetAvailable: true,
  },
  {
    id: "r4",
    name: "Vikas T.",
    vehicle: "Honda Shine (Grey)",
    plate: "RJ19 CC 7721",
    rating: 4.6,
    trips: 730,
    distanceKm: 0.6,
    etaMin: 2,
    fare: 52,
    experienceYears: 3,
    helmetAvailable: true,
  },
  {
    id: "r5",
    name: "Meena L.",
    vehicle: "Hero Passion (Blue)",
    plate: "RJ11 EE 3321",
    rating: 4.8,
    trips: 1102,
    distanceKm: 2.1,
    etaMin: 8,
    fare: 44,
    experienceYears: 5,
    helmetAvailable: true,
  },
  {
    id: "r6",
    name: "Karan J.",
    vehicle: "Bajaj CT 100 (Black)",
    plate: "RJ22 AB 5523",
    rating: 4.5,
    trips: 620,
    distanceKm: 1.0,
    etaMin: 4,
    fare: 47,
    experienceYears: 2,
    helmetAvailable: true,
  },
];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("ridelink:auth") || "null");
  } catch {
    return null;
  }
}

function readCurrentRide(): CurrentRide | null {
  try {
    return JSON.parse(localStorage.getItem("ridelink:currentRide") || "null");
  } catch {
    return null;
  }
}

function writeCurrentRide(v: CurrentRide | null) {
  if (v) localStorage.setItem("ridelink:currentRide", JSON.stringify(v));
  else localStorage.removeItem("ridelink:currentRide");
}

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function Search() {
  const qp = useQuery();
  const [assigning, setAssigning] = useState(false);
  const [current, setCurrent] = useState<CurrentRide | null>(() =>
    readCurrentRide(),
  );
  const [sortBy, setSortBy] = useState<"price" | "eta" | "rating" | "distance">(
    "price",
  );

  const from = qp.get("from") || "Current location";
  const to = qp.get("to") || "Destination";
  const seats = parseInt(qp.get("seats") || "1", 10);

  useEffect(() => {
    const onStorage = () => setCurrent(readCurrentRide());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sortedRiders = useMemo(() => {
    const arr = [...demoRiders];
    switch (sortBy) {
      case "price":
        arr.sort((a, b) => a.fare - b.fare || a.etaMin - b.etaMin);
        break;
      case "eta":
        arr.sort((a, b) => a.etaMin - b.etaMin || a.fare - b.fare);
        break;
      case "rating":
        arr.sort((a, b) => b.rating - a.rating || a.fare - b.fare);
        break;
      case "distance":
        arr.sort((a, b) => a.distanceKm - b.distanceKm || a.etaMin - b.etaMin);
        break;
    }
    return arr;
  }, [sortBy]);

  const bestMatch = sortedRiders[0];

  const requestRide = (rider: Rider) => {
    if (!getAuth()) {
      toast.error("Please login to request a ride");
      return;
    }
    setAssigning(true);
    setTimeout(() => {
      const ride: CurrentRide = {
        id: `ride_${Date.now()}`,
        rider,
        from,
        to,
        seats,
        otp: generateOtp(),
        status: "allocated",
        createdAt: Date.now(),
      };
      writeCurrentRide(ride);
      setCurrent(ride);
      setAssigning(false);
      toast.success("Rider allocated", {
        description: `${rider.name} arriving in ${rider.etaMin} min`,
      });
    }, 900);
  };

  const cancelRide = () => {
    writeCurrentRide(null);
    setCurrent(null);
    toast("Ride canceled");
  };

  const completeRide = () => {
    if (!current) return;
    writeCurrentRide(null);
    setCurrent(null);
    toast.success("Ride completed", {
      description: "Thanks for riding with RideLink",
    });
  };

  if (current) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ride allocated</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                OTP
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Bike className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{current.rider.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {current.rider.vehicle} • {current.rider.plate}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />{" "}
                    {current.rider.rating}
                  </span>
                  <span>{current.rider.trips} trips</span>
                  <span>
                    <TimerReset className="mr-1 inline h-4 w-4" />
                    ETA {current.rider.etaMin} min
                  </span>
                  <span>{current.rider.distanceKm} km away</span>
                  <span className="inline-flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {current.rider.experienceYears} yrs exp
                  </span>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">
                  Share this 4‑digit OTP with your rider
                </div>
                <div className="mt-2 text-4xl font-extrabold tracking-widest">
                  {current.otp}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Call rider
                  </Button>
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={() =>
                      navigator
                        .share?.({
                          title: "RideLink OTP",
                          text: `OTP: ${current.otp}`,
                        })
                        .catch(() => {})
                    }
                  >
                    Share OTP
                  </Button>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Verification handled by rider app. No OTP entry needed here.
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                From:{" "}
                <span className="font-medium text-foreground">
                  {current.from}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                To:{" "}
                <span className="font-medium text-foreground">
                  {current.to}
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                Total for {current.seats} seat(s):{" "}
                <span className="font-medium text-foreground">
                  ₹{current.rider.fare * current.seats}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={cancelRide}
                >
                  <X className="h-4 w-4" />
                  Cancel ride
                </Button>
                <Button onClick={completeRide}>Complete ride</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Nearby riders</span>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {from} → {to}
              </Badge>
              <div className="flex items-center gap-2 text-sm">
                <span>Sort by</span>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="eta">ETA</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {sortedRiders.map((r) => (
              <div
                key={r.id}
                className="flex flex-col items-start justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-primary/10 p-2">
                    <Bike className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {r.name}{" "}
                      <span className="ml-2 align-middle text-sm text-muted-foreground">
                        {r.vehicle} • {r.plate}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                        {r.rating}
                      </span>
                      <span>{r.trips} trips</span>
                      <span>{r.distanceKm} km away</span>
                      <span>{r.etaMin} min ETA</span>
                      <span className="inline-flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        {r.experienceYears} yrs exp
                      </span>
                      <span>
                        {r.helmetAvailable ? "Helmet provided" : "Bring helmet"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ₹{r.fare}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        / seat
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total for {seats}: ₹{r.fare * seats}
                    </div>
                  </div>
                  <Button disabled={assigning} onClick={() => requestRide(r)}>
                    {assigning ? "Assigning..." : "Select"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Best match: {bestMatch.name} in {bestMatch.etaMin} min
            </div>
            <Button disabled={assigning} onClick={() => requestRide(bestMatch)}>
              {assigning ? "Assigning..." : "Select best match"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
        <ShieldCheck className="h-3.5 w-3.5" />
        OTP will be verified by the rider app at pickup.
      </p>
    </section>
  );
}
