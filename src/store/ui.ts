import { create } from "zustand";

export type Toast = { id: number; text: string; tone?: "default" | "success" };

interface UiState {
  emailOpen: boolean;
  emailSource: string;
  videoOpen: boolean;
  toasts: Toast[];
  openEmail: (source: string) => void;
  setEmailOpen: (open: boolean) => void;
  setVideoOpen: (open: boolean) => void;
  toast: (text: string, tone?: Toast["tone"]) => void;
  dismiss: (id: number) => void;
}

let toastId = 0;

export const useUi = create<UiState>()((set, get) => ({
  emailOpen: false,
  emailSource: "",
  videoOpen: false,
  toasts: [],
  openEmail: (emailSource) => set({ emailOpen: true, emailSource }),
  setEmailOpen: (emailOpen) => set({ emailOpen }),
  setVideoOpen: (videoOpen) => set({ videoOpen }),
  toast: (text, tone = "default") => {
    const id = ++toastId;
    set({ toasts: [...get().toasts.slice(-2), { id, text, tone }] });
    window.setTimeout(() => get().dismiss(id), 3200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
