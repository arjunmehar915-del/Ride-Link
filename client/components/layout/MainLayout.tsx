import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Menu, Leaf, TrendingUp, LogOut, ShieldCheck } from "lucide-react";

function useAuth() {
  const location = useLocation();
  const [auth, setAuth] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("ridelink:auth") || "null");
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const onStorage = () => {
      try {
        setAuth(JSON.parse(localStorage.getItem("ridelink:auth") || "null"));
      } catch {
        setAuth(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    try {
      setAuth(JSON.parse(localStorage.getItem("ridelink:auth") || "null"));
    } catch {
      setAuth(null);
    }
  }, [location.pathname]);
  return auth;
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const linkBase =
    "px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground";

  const logout = () => {
    localStorage.removeItem("ridelink:auth");
    localStorage.removeItem("ridelink:currentRide");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* 🔥 UI SIZE FIX: h-16 ko h-14 kiya aur padding kam ki 🔥 */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            RideLink
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>Home</NavLink>
          <NavLink to="/search" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>Search</NavLink>
          <NavLink to="/post-ride" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>Post a ride</NavLink>
          <NavLink to="/safety" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>Safety</NavLink>
          <NavLink to="/about" className={({ isActive }) => cn(linkBase, isActive && "text-foreground")}>About</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {!auth && (
            <>
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="shadow-sm">
                <Link to="/signup" className="inline-flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Start pooling
                </Link>
              </Button>
            </>
          )}

          {auth && (
            <div className="flex items-center gap-3">

              {/* 🔥 ADMIN PORTAL BUTTON FIX (Case Insensitive & Null Safe) 🔥 */}
              {String(auth?.role || "").toUpperCase().includes("ADMIN") && (
                <Link
                  to="/admin/verify"
                  className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700 active:scale-95"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin Portal</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              )}

              {/* PROFILE WIDGET */}
              <Link
                to="/account"
                className="group flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-2 py-1 transition-all hover:border-primary/50 hover:bg-accent shadow-sm active:scale-95"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                  {auth.name?.[0] || "U"}
                </div>
                <div className="hidden flex-col items-start pr-2 sm:flex">
                  <span className="text-xs font-bold leading-none text-foreground group-hover:text-primary transition-colors">
                    {auth.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-semibold">
                    • {String(auth?.role || "USER").replace("ROLE_", "")}
                  </span>
                </div>
              </Link>

              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors" onClick={logout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}

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
            Efficient, affordable and eco‑friendly ride pooling for daily
            commutes.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ridelink:auth") || "null");
    } catch {
      return null;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (auth) return;
    if (location.pathname === "/login") return;

    const protectedPrefixes = ["/search", "/post-ride", "/account", "/admin"];

    const requiresAuth = protectedPrefixes.some((path) => {
      if (location.pathname === path) return true;
      return location.pathname.startsWith(`${path}/`);
    });

    if (!requiresAuth) return;

    const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
    const params = new URLSearchParams();
    params.set("redirect", redirectTarget && redirectTarget !== "/" ? redirectTarget : "/");

    const roleHints: Record<string, "user" | "rider"> = {
      "/search": "user",
      "/post-ride": "rider",
    };
    const hintedRole = Object.entries(roleHints).find(([path]) => {
      if (location.pathname === path) return true;
      return location.pathname.startsWith(`${path}/`);
    })?.[1];

    if (hintedRole) params.set("role", hintedRole);
    navigate(`/login?${params.toString()}`, { replace: true });
  }, [auth, location.pathname, location.search, location.hash, navigate]);

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