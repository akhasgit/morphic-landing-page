import Link from "next/link";
import { site } from "@/config/site";
import { isSet, text } from "@/lib/placeholder";
import { Ph } from "./Ph";
import "./site-footer.css";

/** Slim footer (§7.9). On the homepage it's pinned inside the final tile. */
export function SiteFooter({ home = false, className = "" }: { home?: boolean; className?: string }) {
  const links = [
    { label: "Use cases", href: home ? "#use-cases" : "/#use-cases" },
    { label: "Pricing", href: home ? "#pricing" : "/#pricing" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];
  return (
    <footer className={`site-footer ${className}`}>
      <div className="site-footer-row">
        <Link href="/" className="site-footer-brand" aria-label="Morphic home">
          <img src={site.brand.mark} alt="" width={26} height={21} />
          <span>Morphic</span>
        </Link>
        <nav aria-label="Footer" className="site-footer-links">
          {links.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
          {isSet(site.social.x) && (
            <a href={site.social.x} target="_blank" rel="noopener">
              X
            </a>
          )}
          {isSet(site.social.productHunt) && (
            <a href={site.social.productHunt} target="_blank" rel="noopener">
              Product Hunt
            </a>
          )}
          {isSet(site.social.github) && (
            <a href={site.social.github} target="_blank" rel="noopener">
              GitHub
            </a>
          )}
        </nav>
        <span className="site-footer-copy">
          © 2026 <Ph value={site.legalEntity} />
        </span>
      </div>
      <p className="site-footer-note">
        Morphic is not affiliated with the websites it works on.
        {isSet(site.supportEmail) && (
          <>
            {" "}
            · <a href={`mailto:${text(site.supportEmail)}`}>{text(site.supportEmail)}</a>
          </>
        )}
      </p>
    </footer>
  );
}
