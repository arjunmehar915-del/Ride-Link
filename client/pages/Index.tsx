import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  MapPin,
  Navigation,
  Sparkles,
  Users,
  GraduationCap,
  Building2,
  Handshake,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();

  // Validation date (Today)
  const today = format(new Date(), "yyyy-MM-dd");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(today);
  const [seats, setSeats] = useState("1");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (date < today) {
      toast.error("Please select a current or future date.");
      return;
    }

    const params = new URLSearchParams({
      from: from,
      to: to,
      date: date,
      seats: seats
    });

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* HERO SECTION - CLEAN & ELEGANT */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_400px_at_50%_-100px,hsla(46,95%,55%,0.15),transparent)]" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div className="z-10 flex flex-col justify-center">
            <Badge className="mb-4 w-fit bg-primary/20 text-primary border-primary/30 hover:bg-primary/30" variant="outline">
              Eco‑friendly ride pooling
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Pool smarter. Pay less. <br /> Go greener.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/60">
              RideLink matches commuters going the same way so you can save money, reduce traffic and cut emissions.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/50">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary/80" /> OTP Verified</span>
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary/80" /> AI Matching</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary/80" /> Trusted Community</span>
            </div>
          </div>

          {/* SEARCH FORM - DESCENT UI */}
          <form
            onSubmit={onSearch}
            className="z-10 rounded-xl border border-white/10 bg-white p-6 text-foreground shadow-xl md:self-center"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pickup Location</label>
                <div className="relative">
                  <Input
                    placeholder="E.g. Indore"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="pl-9 h-11 bg-slate-50 border-slate-200"
                    required
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination</label>
                <div className="relative">
                  <Input
                    placeholder="E.g. Ujjain"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="pl-9 h-11 bg-slate-50 border-slate-200"
                    required
                  />
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-9 h-11 bg-slate-50 border-slate-200"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seats</label>
                <Select value={seats} onValueChange={setSeats}>
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Seat</SelectItem>
                    <SelectItem value="2">2 Seats</SelectItem>
                    <SelectItem value="3">3 Seats</SelectItem>
                    <SelectItem value="4">4 Seats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 mt-2 flex flex-col gap-3">
                <Button type="submit" className="h-11 text-base font-semibold shadow-sm active:scale-[0.98] transition-all">
                  Find Rides
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                  onClick={() => navigate("/post-ride")}
                >
                  Offer a ride
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Tell us your route</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Enter pickup, drop and time. We’ll compute the best options near you instantly.</p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Get AI‑matched rides</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Matching ranks rides by route similarity, minimal detour and ETA for your comfort.</p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Ride with trust</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Safety first with OTP, live GPS tracking and verified community profiles.</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-900">Ready to start pooling?</h3>
            <p className="text-muted-foreground mt-1">Join thousands of commuters saving daily.</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/post-ride")} className="px-8 font-semibold">Offer a ride</Button>
            <Button variant="outline" onClick={() => navigate("/search")} className="px-8 font-semibold">Find rides</Button>
          </div>
        </div>
      </section>
    </div>
  );
}