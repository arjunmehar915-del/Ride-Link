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
import { ShieldCheck, MapPin, Navigation, Sparkles, Users, Clock4 } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("1");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ from, to, time, seats });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-100px,hsla(46,95%,55%,0.25),transparent)]" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28 lg:px-8">
          <div>
            <Badge className="mb-4 bg-primary text-primary-foreground" variant="default">Eco‑friendly ride pooling</Badge>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Pool smarter. Pay less. Go greener.
            </h1>
            <p className="mt-4 max-w-xl text-white/70">
              RideLink matches commuters going the same way so you can save money, reduce traffic and cut emissions—without detours.
            </p>
            <ul className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
              <li className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> OTP & GPS tracking</li>
              <li className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI matching</li>
              <li className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> KYC optional</li>
            </ul>
          </div>

          <form onSubmit={onSearch} className="rounded-xl border border-white/10 bg-white p-5 text-foreground shadow-2xl md:self-center">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">From</label>
                <div className="relative">
                  <Input placeholder="Pickup location" value={from} onChange={(e) => setFrom(e.target.value)} className="pl-9" />
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">To</label>
                <div className="relative">
                  <Input placeholder="Drop location" value={to} onChange={(e) => setTo(e.target.value)} className="pl-9" />
                  <Navigation className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Time</label>
                <Input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Seats</label>
                <Select value={seats} onValueChange={setSeats}>
                  <SelectTrigger>
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 mt-2 flex gap-3">
                <Button type="submit" className="flex-1">Find rides</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/post-ride")}>Offer a ride</Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">By continuing you agree to pooled rides and community guidelines.</p>
          </form>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><MapPin className="h-5 w-5 text-primary"/>Tell us your route</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">Enter pickup, drop and time—daily or one‑time. We’ll compute the best options near you.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5 text-primary"/>Get AI‑matched rides</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">Spring AI based matching ranks rides by route similarity, minimal detour and ETA.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><ShieldCheck className="h-5 w-5 text-primary"/>Ride with trust</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">Start with OTP, live GPS tracking and post‑ride ratings. Optional KYC boosts credibility.</CardContent>
          </Card>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 bg-background">
              <CardHeader>
                <CardTitle className="text-xl">Lower daily costs</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Share empty seats to offset fuel and maintenance while passengers pay less than taxis.</CardContent>
            </Card>
            <Card className="border-0 bg-background">
              <CardHeader>
                <CardTitle className="text-xl">Carbon‑smart commutes</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Fewer single‑occupancy vehicles means lower congestion and emissions across the city.</CardContent>
            </Card>
            <Card className="border-0 bg-background">
              <CardHeader>
                <CardTitle className="text-xl">Built to scale</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Architecture ready for multi‑city rollout, with admin dashboards and analytics.</CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/20 to-primary/10 p-8 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-bold">Ready to start pooling?</h3>
            <p className="mt-1 text-muted-foreground">Post your daily route or search for a ride in seconds.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/post-ride")}>Offer a ride</Button>
            <Button variant="outline" onClick={() => navigate("/search")}>Find rides</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
