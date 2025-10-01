import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Leaf,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  Users,
  ShieldCheck,
  TrendingUp,
  Globe,
  MessageCircle,
} from "lucide-react";

export default function About() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            About RideLink
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            RideLink helps commuters pool rides to save money and reduce
            traffic. We match nearby riders and passengers with safety at the
            core: OTP verification, document checks and post‑ride ratings.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Eco‑friendly</Badge>
            <Badge variant="secondary">Community‑driven</Badge>
            <Badge variant="secondary">Safety‑first</Badge>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" /> Who we are
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            We are a small team focused on affordable, sustainable commuting.
            Our mission is to make daily travel simpler while building trust
            through verification and transparent feedback.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-5 w-5 text-primary" /> Safety commitment
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Every ride starts with OTP at pickup. Riders must provide valid
            Licence, RC and Aadhaar before offering rides. We monitor reports
            and enforce standards to keep the community safe.
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Phone className="h-5 w-5 text-primary" /> Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                className="hover:underline"
                href="mailto:support@ridelink.example"
              >
                support@ridelink.example
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                className="hover:underline"
                href="mailto:press@ridelink.example"
              >
                press@ridelink.example
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                className="hover:underline"
                href="mailto:partners@ridelink.example"
              >
                partners@ridelink.example
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Jaipur, Rajasthan, India
            </div>
            <p className="pt-2 text-muted-foreground">
              Support hours: Mon–Sat, 9:00–18:00 IST
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5 text-primary" /> Socials
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <a
              className="inline-flex items-center gap-2 hover:underline"
              href="https://x.com/ridelink"
              target="_blank"
              rel="noreferrer"
            >
              X / Twitter <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              className="inline-flex items-center gap-2 hover:underline"
              href="https://instagram.com/ridelink"
              target="_blank"
              rel="noreferrer"
            >
              Instagram <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              className="inline-flex items-center gap-2 hover:underline"
              href="https://facebook.com/ridelinkapp"
              target="_blank"
              rel="noreferrer"
            >
              Facebook <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              className="inline-flex items-center gap-2 hover:underline"
              href="https://linkedin.com/company/ridelink"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              className="inline-flex items-center gap-2 hover:underline"
              href="https://youtube.com/@ridelink"
              target="_blank"
              rel="noreferrer"
            >
              YouTube <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircle className="h-5 w-5 text-primary" /> Help
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Chat with our assistant for quick help on bookings, payments, or
            safety.
            <div className="mt-4 flex gap-3">
              <Button asChild>
                <Link to="/help">Open chat bot</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/safety">View safety</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" /> Our vision
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          We aim to reduce single‑occupancy travel by connecting trusted
          commuters on the same route. With city partnerships and community
          feedback, we’re scaling responsibly across regions.
        </CardContent>
      </Card>
    </section>
  );
}
