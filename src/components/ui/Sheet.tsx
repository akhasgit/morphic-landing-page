"use client";

import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

/** Glass bottom sheet (mobile dock list, email capture, FAQ answers). */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  theme = "dark",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  theme?: "light" | "dark";
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[90] bg-black/45"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                data-theme={theme}
                className="glass fixed inset-x-2 bottom-2 z-[91] mx-auto max-h-[80dvh] max-w-[520px] overflow-hidden rounded-[24px] text-ink"
                style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))", backgroundColor: theme === "dark" ? "rgba(20,20,24,0.78)" : "rgba(255,255,255,0.86)" }}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                exit={{ y: "110%" }}
                transition={{ type: "spring", stiffness: 380, damping: 38 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 90 || info.velocity.y > 500) onOpenChange(false);
                }}
              >
                <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-current opacity-20" aria-hidden="true" />
                <div className="px-5 pt-4">
                  <Dialog.Title className="h3 text-[19px] text-ink">{title}</Dialog.Title>
                  {description ? (
                    <Dialog.Description className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{description}</Dialog.Description>
                  ) : (
                    <Dialog.Description className="sr-only">Bottom sheet</Dialog.Description>
                  )}
                </div>
                <div className="px-5 pt-4">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
