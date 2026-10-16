// src/config/useCases.ts — the carousel. Swapping a placeholder for a real video = set `video`.
//
// ─── Recording tips for AK ───────────────────────────────────────────────────────────────
// • Use a clean Chrome profile and hide the bookmarks bar.
// • Make sure no personal accounts, notifications, or other people's private info are visible.
// • Show the prompt being typed, then speed up the agent wait 4–8× in editing and set
//   `spedUp: true` so the card shows the "▶▶ sped up" badge.
// • Show the morph, do one interaction (swipe / sort / ask), and end by flipping the toggle
//   back to the original site.
// • Export H.264 MP4 (CRF ~23, +faststart, no audio track, 30fps, 1600×1000), ≤4MB each,
//   plus a poster JPG of the first frame. Crop 16:10 to the page + side panel.
// • Put files in /public/videos (same origin, so ambient mode can read frames):
//     ffmpeg -i in.mov -an -vf "fps=30,scale=1600:1000" -c:v libx264 -crf 23 \
//            -movflags +faststart public/videos/01.mp4
//     ffmpeg -i public/videos/01.mp4 -frames:v 1 -q:v 3 public/videos/01.jpg
// ─────────────────────────────────────────────────────────────────────────────────────────

export type UseCase = {
  id: string;
  title: string; // "Swipe through your feed"
  outcome: string; // one line under the title
  prompt: string; // the exact prompt typed in the recording
  siteType: string; // "on a video site"
  video?: { mp4: string; webm?: string; poster: string; spedUp?: boolean };
  ambient: [string, string]; // fallback glow colors (and placeholder gradient)
};

export const useCases: UseCase[] = [
  {
    id: "01",
    title: "Swipe through your feed",
    outcome: "Right to save for later, left to skip.",
    prompt: "Make this feed swipeable cards. Right = Watch later.",
    siteType: "on a video site",
    ambient: ["#7C3AED", "#DB2777"],
    // video: { mp4: "/videos/01.mp4", poster: "/videos/01.jpg", spedUp: true },
  },
  {
    id: "02",
    title: "Compare at a glance",
    outcome: "Price, rating, reviews and shipping, sortable.",
    prompt: "Show these results as a comparison table",
    siteType: "on a store's search results",
    ambient: ["#0EA5E9", "#6366F1"],
  },
  {
    id: "03",
    title: "Talk to your dashboard",
    outcome: "Charts plus answers from the numbers on the page.",
    prompt: "Turn this into charts and let me ask questions about it",
    siteType: "on an analytics dashboard",
    ambient: ["#10B981", "#6366F1"],
  },
  {
    id: "04",
    title: "Just the story",
    outcome: "No ads, no popups, no sidebars.",
    prompt: "Strip everything except the article. Bigger text.",
    siteType: "on a news article",
    ambient: ["#F59E0B", "#EF4444"],
  },
  {
    id: "05",
    title: "Straight to the recipe",
    outcome: "Ingredients as a checklist.",
    prompt: "Skip the life story. Just the recipe.",
    siteType: "on a recipe blog",
    ambient: ["#F97316", "#EAB308"],
  },
  {
    id: "06",
    title: "Your job hunt, organized",
    outcome: "Drag roles between stages.",
    prompt: "Track these jobs on a kanban: Saved, Applied, Interviewing",
    siteType: "on a job board",
    ambient: ["#3B82F6", "#14B8A6"],
  },
  {
    id: "07",
    title: "Easier for everyone",
    outcome: "One column, big text, high contrast.",
    prompt: "Make this easy for my dad to read",
    siteType: "on a dense page",
    ambient: ["#A855F7", "#6366F1"],
  },
  {
    id: "08",
    title: "Make it yours",
    outcome: "Any layout you can describe.",
    prompt: "All the videos in a grid of circles",
    siteType: "on a video site",
    ambient: ["#EC4899", "#8B5CF6"],
  },
];
