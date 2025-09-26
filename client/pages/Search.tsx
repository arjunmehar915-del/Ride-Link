import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bike, MapPin, Navigation, Phone, ShieldCheck, Star, TimerReset, X } from "lucide-react";

interface Rider {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  rating: number;
  trips: number;
  distanceKm: number;
  etaMin: number;
  fare: number;
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
  { id: "r1", name: "Aman K.", vehicle: "Hero Splendor", plate: "RJ14 BK 4021", rating: 4.9, trips: 1240, distanceKm: 0.8, etaMin: 3, fare: 48 },
  { id: "r2", name: "Neeraj S.", vehicle: "TVS Star City", plate: "RJ45 AC 9982", rating: 4.8, trips: 980, distanceKm: 1.2, etaMin: 5, fare: 46 },
  { id: "r3", name: "Ravi P.", vehicle: "Bajaj Platina", plate: "RJ27 DD 2156", rating: 4.7, trips: 1523, distanceKm: 1.8, etaMin: 7, fare: 45 },
];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function getAuth() {
  try { return JSON.parse(localStorage.getItem("ridelink:auth") || "null"); } catch { return null; }
}

function readCurrentRide(): CurrentRide | null {
  try { return JSON.parse(localStorage.getItem("ridelink:currentRide") || "null"); } catch { return null; }
}

function writeCurrentRide(v: CurrentRide | null) {
  if (v) localStorage.setItem("ridelink:currentRide", JSON.stringify(v)); else localStorage.removeItem("ridelink:currentRide");
}

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function Search() {
  const qp = useQuery();
  const [waiting, setWaiting] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [current, setCurrent] = useState<CurrentRide | null>(() => readCurrentRide());
  const [enteredOtp, setEnteredOtp] = useState("");

  const from = qp.get("from") || "Current location";
  const to = qp.get("to") || "Destination";
  const seats = parseInt(qp.get("seats") || "1", 10);

  useEffect(() => {
    const onStorage = () => setCurrent(readCurrentRide());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const nearestRider = useMemo(() => {
    return [...demoRiders].sort((a,b) => a.distanceKm - b.distanceKm || a.etaMin - b.etaMin || b.rating - a.rating)[0];
  }, []);

  const requestNearest = () => {
    if (!getAuth()) { toast.error("Please login to request a ride"); return; }
    setDeclined(false);
    setWaiting(true);
    // Simulate rider acceptance flow (server push in real app)
    setTimeout(() => {
      const accepted = true; // acceptance gate; only allocate if rider accepts
      if (!accepted) {
        setWaiting(false);
        setDeclined(true);
        toast.error("Nearest rider declined. Try again in a moment.");
        return;
      }
      const ride: CurrentRide = {
        id: `ride_${Date.now()}`,
        rider: nearestRider,
        from,
        to,
        seats,
        otp: generateOtp(),
        status: "allocated",
        createdAt: Date.now(),
      };
      writeCurrentRide(ride);
      setCurrent(ride);
      setWaiting(false);
      toast.success("Rider accepted", { description: `${nearestRider.name} arriving in ${nearestRider.etaMin} min` });
    }, 1800);
  };

  const cancelRide = () => {
    writeCurrentRide(null);
    setCurrent(null);
    setEnteredOtp("");
    setWaiting(false);
    setDeclined(false);
    toast("Ride canceled");
  };

  const completeRide = () => {
    if (!current) return;
    writeCurrentRide(null);
    setCurrent(null);
    setEnteredOtp("");
    toast.success("Ride completed", { description: "Thanks for riding with RideLink" });
  };

  const verifyOtp = () => {
    if (!current) return;
    if (enteredOtp === current.otp) {
      toast.success("OTP verified. Ride started");
      setCurrent({ ...current, status: "ongoing" });
    } else {
      toast.error("Incorrect OTP");
    }
  };

  if (current) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ride {current.status === "allocated" ? "allocated" : current.status === "ongoing" ? "in progress" : ""}</span>
              <Badge variant="secondary" className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5"/>OTP</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Bike className="h-5 w-5 text-primary"/>
                  <div>
                    <div className="font-semibold">{current.rider.name}</div>
                    <div className="text-sm text-muted-foreground">{current.rider.vehicle} • {current.rider.plate}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500"/> {current.rider.rating} • {current.rider.trips} trips
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <TimerReset className="h-4 w-4"/> ETA {current.rider.etaMin} min • {current.rider.distanceKm} km away
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Share this 4‑digit OTP with your rider</div>
                <div className="mt-2 text-4xl font-extrabold tracking-widest">{current.otp}</div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" className="gap-2"><Phone className="h-4 w-4"/>Call rider</Button>
                  <Button variant="secondary" className="gap-2" onClick={() => navigator.share?.({ title: "RideLink OTP", text: `OTP: ${current.otp}` }).catch(()=>{})}>Share OTP</Button>
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium">Enter OTP to start ride</label>
                  <div className="flex gap-2">
                    <Input inputMode="numeric" maxLength={4} placeholder="1234" value={enteredOtp} onChange={(e)=>setEnteredOtp(e.target.value.replace(/[^0-9]/g, "").slice(0,4))} />
                    <Button onClick={verifyOtp}>Verify</Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="destructive" className="gap-2" onClick={cancelRide}><X className="h-4 w-4"/>Cancel ride</Button>
              {current.status !== "completed" && (
                <Button onClick={completeRide}>Complete ride</Button>
              )}
            </div>
            <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4"/>From: <span className="font-medium text-foreground">{current.from}</span></div>
              <div className="flex items-center gap-2"><Navigation className="h-4 w-4"/>To: <span className="font-medium text-foreground">{current.to}</span></div>
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
          <CardTitle className="flex items-center justify-between">
            <span>Nearest rider</span>
            <Badge variant="secondary">{from} → {to}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-primary/10 p-2"><Bike className="h-6 w-6 text-primary"/></div>
              <div>
                <div className="font-semibold">{nearestRider.name} <span className="ml-2 align-middle text-sm text-muted-foreground">{nearestRider.vehicle} • {nearestRider.plate}</span></div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500"/>{nearestRider.rating}</span>
                  <span>{nearestRider.trips} trips</span>
                  <span>{nearestRider.distanceKm} km away</span>
                  <span>{nearestRider.etaMin} min ETA</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold">₹{nearestRider.fare}</div>
                <div className="text-xs text-muted-foreground">est.</div>
              </div>
              <Button disabled={waiting} onClick={requestNearest}>{waiting ? "Waiting for acceptance..." : "Request ride"}</Button>
            </div>
          </div>
          {declined && (
            <div className="mt-4 text-sm text-red-600">Nearest rider declined. Please try again.</div>
          )}
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5"/>OTP is required to start the ride. Share only with your allotted rider.</p>
    </section>
  );
}
