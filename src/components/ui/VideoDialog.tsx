"use client";

import { X } from "lucide-react";
import { AnimatePresence, m as motion } from "motion/react";
import { Dialog } from "radix-ui";
import { site } from "@/config/site";
import { demoVideoConfigured } from "@/lib/links";
import { useUi } from "@/store/ui";

/** 16:9 demo player (§9). Hidden entirely until site.demoVideo is configured. */
export function VideoDialog() {
  const open = useUi((s) => s.videoOpen);
  const setOpen = useUi((s) => s.setVideoOpen);
  if (!demoVideoConfigured) return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed left-1/2 top-1/2 z-[91] w-[min(1100px,92vw)] -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Dialog.Title className="sr-only">Morphic demo video</Dialog.Title>
                <Dialog.Description className="sr-only">A 60 second walkthrough of Morphic.</Dialog.Description>
                <div
                  className="overflow-hidden rounded-[24px] border border-white/10 bg-[var(--bg)]"
                  style={{ boxShadow: "0 0 0 1px rgba(255,255,255,.04), 0 40px 120px -20px rgba(109,40,217,.55)" }}
                >
                  <video
                    className="aspect-video w-full"
                    src={site.demoVideo.src}
                    poster={site.demoVideo.poster}
                    controls
                    autoPlay
                    playsInline
                  />
                </div>
                <Dialog.Close
                  className="glass absolute -top-3 -right-3 grid h-10 w-10 place-items-center rounded-full text-white"
                  data-theme="dark"
                  aria-label="Close video"
                >
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
