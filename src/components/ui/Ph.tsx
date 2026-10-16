import { hasPlaceholder, text } from "@/lib/placeholder";

/**
 * Renders a config value that may contain {{placeholders}}. In development, unresolved
 * placeholder copy gets a dashed amber outline so it can't ship unnoticed.
 */
export function Ph({ value, className }: { value: string; className?: string }) {
  const resolved = text(value);
  if (!hasPlaceholder(value) || process.env.NODE_ENV === "production") {
    return className ? <span className={className}>{resolved}</span> : <>{resolved}</>;
  }
  return (
    <span className={className} data-placeholder="dev" title="Placeholder — set in src/config">
      {resolved}
    </span>
  );
}
