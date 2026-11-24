// FAQ copy (§7.8). Also feeds the FAQPage JSON-LD.
import { site } from "./site";

export const faq: { q: string; a: string }[] = [
  {
    q: "What does Morphic actually change?",
    a: "Only what you see in your own browser. The website, and everyone else on it, sees nothing different.",
  },
  {
    q: "Which websites does it work on?",
    a: "Most sites where content is on the page: feeds, search results, listings, dashboards, articles. Content drawn in a canvas or locked in some embeds can be unavailable.",
  },
  {
    q: "Does it ever make things up?",
    a: "Morphic builds views from data it reads on the page. AI-generated labels, summaries and selections can contain errors. You can compare a view with the original page at any time.",
  },
  {
    q: "Can it click things for me? Is that safe?",
    a: "Agents never run code. Actions are limited to opening links, saving, loading more, and replaying short click sequences. Anything risky asks you first.",
  },
  {
    q: "What data does Morphic see and send?",
    a: site.privacyLine,
  },
  {
    q: "What happens when a site changes its design?",
    a: "Morphic notices when a view breaks and agents repair it. Your versions stay available.",
  },
  {
    q: "Can I go back to the normal site?",
    a: "Anytime. Flip the toggle, or undo to any earlier version.",
  },
  {
    q: "Which browsers are supported? Can I cancel?",
    a: `${site.supportedBrowsers}. You can update your card or cancel your paid subscription in Manage billing.`,
  },
];
