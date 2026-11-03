import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  ChevronDown,
  Sparkles,
  Check,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import physioLogo from "@/assets/Physio.png";
import { usePatientAuth } from "@/lib/auth-context";
import { PatientAvatar, FemaleCartoonAvatar, MaleCartoonAvatar, NeutralCartoonAvatar } from "@/components/patient-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const baseNav = [
  { to: "/", label: "Home" },
  { to: "/questionnaire", label: "Assessment" },
  { to: "/find", label: "Find Physio" },
  { to: "/videos", label: "Exercise Library" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const {
    user,
    loading,
    displayName,
    gender,
    avatarUrl,
    preferCartoon,
    updateGender,
    setPreferCartoon,
    signOut,
  } = usePatientAuth();

  const navLinks = user
    ? [...baseNav, { to: "/dashboard", label: "Dashboard" }]
    : baseNav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-elegant ring-1 ring-primary/20">
            <img src={physioLogo} alt="Physio Connect Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            Physio Connect
          </span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Auth / Action buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Button asChild size="sm" variant="outline" className="hidden lg:inline-flex border-primary/30 text-primary hover:bg-primary/10">
                <Link to="/questionnaire">
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Assessment
                </Link>
              </Button>

              {/* Patient Avatar & Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 rounded-full border border-border/80 bg-background/50 pl-1 pr-2.5 py-1 hover:bg-muted/80 shadow-xs"
                  >
                    <PatientAvatar
                      user={user}
                      gender={gender}
                      avatarUrl={avatarUrl}
                      forceCartoon={preferCartoon}
                      size="xs"
                    />
                    <span className="max-w-[100px] truncate text-xs font-semibold text-foreground">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-72 p-2 shadow-xl border-border/70">
                  {/* User Profile Header Card */}
                  <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                    <PatientAvatar
                      user={user}
                      gender={gender}
                      avatarUrl={avatarUrl}
                      forceCartoon={preferCartoon}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary">
                          <UserCheck className="mr-0.5 h-2.5 w-2.5" /> Patient
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email || "Authenticated Patient"}
                      </p>
                    </div>
                  </div>

                  {/* Avatar & Cartoon Switcher */}
                  <div className="mt-3 px-2 py-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" /> Avatar Character
                      </span>
                      <span className="text-[10px] uppercase font-bold text-primary">
                        {preferCartoon ? "Cartoon" : avatarUrl ? "Google Photo" : "Cartoon"}
                      </span>
                    </div>

                    {/* Cartoon Gender Switcher */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          void updateGender("female");
                          if (preferCartoon === false && avatarUrl) setPreferCartoon(true);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[11px] transition-all",
                          gender === "female" && (preferCartoon || !avatarUrl)
                            ? "border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary/40"
                            : "border-border/60 hover:bg-muted text-muted-foreground",
                        )}
                        title="Female cartoon avatar"
                      >
                        <div className="h-7 w-7 rounded-full overflow-hidden">
                          <FemaleCartoonAvatar />
                        </div>
                        <span>Female</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void updateGender("male");
                          if (preferCartoon === false && avatarUrl) setPreferCartoon(true);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[11px] transition-all",
                          gender === "male" && (preferCartoon || !avatarUrl)
                            ? "border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary/40"
                            : "border-border/60 hover:bg-muted text-muted-foreground",
                        )}
                        title="Male cartoon avatar"
                      >
                        <div className="h-7 w-7 rounded-full overflow-hidden">
                          <MaleCartoonAvatar />
                        </div>
                        <span>Male</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void updateGender("other");
                          if (preferCartoon === false && avatarUrl) setPreferCartoon(true);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[11px] transition-all",
                          (gender === "other" || !gender) && (preferCartoon || !avatarUrl)
                            ? "border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary/40"
                            : "border-border/60 hover:bg-muted text-muted-foreground",
                        )}
                        title="Neutral cartoon avatar"
                      >
                        <div className="h-7 w-7 rounded-full overflow-hidden">
                          <NeutralCartoonAvatar />
                        </div>
                        <span>Neutral</span>
                      </button>
                    </div>

                    {/* Google Photo toggle if user has one */}
                    {avatarUrl && (
                      <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground text-[11px]">Use Gmail profile photo</span>
                        <button
                          type="button"
                          onClick={() => setPreferCartoon(!preferCartoon)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors",
                            !preferCartoon
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80",
                          )}
                        >
                          {!preferCartoon ? "Active" : "Switch to Photo"}
                        </button>
                      </div>
                    )}
                  </div>

                  <DropdownMenuSeparator className="my-1.5" />

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      <span>Patient Dashboard</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/questionnaire" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4 text-primary" />
                      <span>Take Assessment Intake</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1.5" />

                  <DropdownMenuItem
                    onClick={() => void signOut()}
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button asChild variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-foreground">
                <Link to="/auth">
                  <LogIn className="mr-1.5 h-4 w-4" /> Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-hero shadow-elegant">
                <Link to="/questionnaire">Start Assessment</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="rounded-lg p-1.5 text-foreground hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="border-t border-border/60 bg-background p-4 md:hidden animate-in slide-in-from-top-2">
          {/* User profile row on mobile */}
          {user && (
            <div className="mb-4 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <PatientAvatar
                  user={user}
                  gender={gender}
                  avatarUrl={avatarUrl}
                  forceCartoon={preferCartoon}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Quick Cartoon Avatar Switcher on Mobile */}
              <div className="mt-3 pt-2.5 border-t border-border/50">
                <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                  Select Cartoon Avatar Character:
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      void updateGender("female");
                      if (preferCartoon === false && avatarUrl) setPreferCartoon(true);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border py-1 px-2 text-xs",
                      gender === "female" && (preferCartoon || !avatarUrl)
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border/60 bg-background text-muted-foreground",
                    )}
                  >
                    <div className="h-5 w-5 rounded-full overflow-hidden">
                      <FemaleCartoonAvatar />
                    </div>
                    <span>Female</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void updateGender("male");
                      if (preferCartoon === false && avatarUrl) setPreferCartoon(true);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border py-1 px-2 text-xs",
                      gender === "male" && (preferCartoon || !avatarUrl)
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border/60 bg-background text-muted-foreground",
                    )}
                  >
                    <div className="h-5 w-5 rounded-full overflow-hidden">
                      <MaleCartoonAvatar />
                    </div>
                    <span>Male</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void updateGender("other");
                      if (preferCartoon === false && avatarUrl) setPreferCartoon(true);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border py-1 px-2 text-xs",
                      (gender === "other" || !gender) && (preferCartoon || !avatarUrl)
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border/60 bg-background text-muted-foreground",
                    )}
                  >
                    <div className="h-5 w-5 rounded-full overflow-hidden">
                      <NeutralCartoonAvatar />
                    </div>
                    <span>Neutral</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex flex-col gap-1">
            {navLinks.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action buttons on mobile */}
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-2">
            {user ? (
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-gradient-hero shadow-elegant">
                  <Link to="/questionnaire" onClick={() => setOpen(false)}>
                    Start Assessment
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
