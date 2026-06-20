import { Logo } from "./Logo";

const LINKS = ["About", "GitHub", "Privacy", "Documentation", "Contact"];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <a key={l} href="#" className="text-sm text-muted-foreground hover:text-foreground">
              {l}
            </a>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ArthaRakshak</p>
      </div>
    </footer>
  );
}