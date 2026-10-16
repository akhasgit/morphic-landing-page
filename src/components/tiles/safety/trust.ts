import { CodeXml, Hand, Layers, MonitorSmartphone } from "lucide-react";

/** Safety trust list (§7.5) — copy is final. */
export const trust = [
  { icon: CodeXml, title: "No generated code", line: "Specs are checked against a schema and drawn by fixed components." },
  { icon: Layers, title: "Isolated rendering", line: "Views live in a Shadow DOM, apart from the site's own scripts." },
  { icon: Hand, title: "You approve risky actions", line: "Deleting, buying, posting or sending always asks first." },
  { icon: MonitorSmartphone, title: "Only on your screen", line: "The site, and everyone else on it, sees nothing different." },
];
