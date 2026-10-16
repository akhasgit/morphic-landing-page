"use client";

import { Check, X } from "lucide-react";
import { AnimatePresence, m as motion } from "motion/react";
import { Dialog } from "radix-ui";
import { text } from "@/lib/placeholder";
import { compareRows, plans } from "./plans";

const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;

/** "Compare all features" (§7.7) — loaded the first time it's opened. */
export default function CompareDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                data-theme="light"
                className="pr-dialog"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={SPRING}
              >
                <Dialog.Title className="h3 text-[22px] text-ink">Compare all features</Dialog.Title>
                <Dialog.Description className="mt-1 text-[14.5px] text-ink-2">
                  A morph is one request that creates or changes a view.
                </Dialog.Description>
                <div className="pr-table-wrap">
                  <table className="pr-table">
                    <thead>
                      <tr>
                        <th scope="col">
                          <span className="sr-only">Feature</span>
                        </th>
                        {plans.map((p) => (
                          <th key={p.id} scope="col" data-pro={p.id === "pro" || undefined}>
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {compareRows.map((r) => (
                        <tr key={r.label}>
                          <th scope="row">{r.label}</th>
                          {r.values.map((v, i) => (
                            <td key={i} data-pro={i === 1 || undefined}>
                              {v === "✓" ? (
                                <Check size={16} strokeWidth={2.5} className="pr-yes" aria-label="Included" />
                              ) : v === "—" ? (
                                <span className="pr-no" aria-label="Not included">
                                  —
                                </span>
                              ) : (
                                text(v)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Dialog.Close className="pr-dialog-close" aria-label="Close">
                  <X size={18} />
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
