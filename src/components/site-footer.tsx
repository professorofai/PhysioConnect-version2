import { Link } from "@tanstack/react-router";
import physioLogo from "@/assets/Physio.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-elegant">
              <img src={physioLogo} alt="Physio Connect Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-base font-bold">Physio Connect</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            The connected recovery platform for patients and physiotherapists.
            Assess, book, rehab, and track progress in one place.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/questionnaire" className="hover:text-foreground">Assessment</Link></li>
            <li><Link to="/find" className="hover:text-foreground">Find Physio</Link></li>
            <li><Link to="/videos" className="hover:text-foreground">Exercise Library</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Recovery Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>About</li>
            <li>For Clinicians</li>
            <li>Privacy</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Physio Connect. All rights reserved.
      </div>
    </footer>
  );

}
