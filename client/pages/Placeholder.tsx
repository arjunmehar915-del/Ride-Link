import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Placeholder({ title }: { title?: string }) {
  const location = useLocation();
  const label = title ?? location.pathname.replace("/", "").replace(/-/g, " ") || "Page";

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-2xl text-muted-foreground">
            This page is ready to be designed. Tell me what you want here and I’ll build it.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/post-ride">Post a ride</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
