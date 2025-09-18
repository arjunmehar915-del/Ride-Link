import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Menu, Leaf, TrendingUp } from "lucide-react";

function Header() {
  const location = useLocation();
  useEffect(() => {
    // simple scroll to top on route change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const linkBase = "px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">RideLink</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>Home</NavLink>
          <NavLink to="/search" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>Search</NavLink>
          <NavLink to="/post-ride" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>Post a ride</NavLink>
          <NavLink to="/safety" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>Safety</NavLink>
          <NavLink to="/about" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>About</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild className="shadow-sm">
            <Link to="/signup" className="inline-flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Start pooling
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold">RideLink</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-right">
            Efficient, affordable and eco‑friendly ride pooling for daily commutes.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
