"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatViews, videos } from "@/demo/data";
import { thumbDataUrl } from "./thumbs";
import "./playground.css";

type Item = (typeof videos)[number] & { key: string; part: number };

const PAGE = 12;
const MAX = 48;

function itemsUpTo(n: number): Item[] {
  return Array.from({ length: n }, (_, i) => {
    const v = videos[i % videos.length];
    const part = Math.floor(i / videos.length) + 1;
    return { ...v, key: `${v.id}-${part}`, part, title: part > 1 ? `${v.title} (part ${part})` : v.title };
  });
}

/** Lazy thumbnail: data-src swaps to src when scrolled near (like real feeds). */
function LazyImg({ src, eager }: { src: string; eager: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(eager);
  useEffect(() => {
    if (loaded || !ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLoaded(true), { rootMargin: "200px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [loaded]);
  return <img ref={ref} alt="" src={loaded ? src : undefined} data-src={loaded ? undefined : src} />;
}

/**
 * Streamly — a real DOM video feed for trying Morphic (§11 /playground). Ported from the
 * extension repo's test-website/video-feed.html: lazy thumbnails, infinite scroll,
 * SPA navigation to a watch page, and a ⋮ menu with "Save to Watch later".
 */
export function StreamlySite() {
  const [count, setCount] = useState(PAGE);
  const [watch, setWatch] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ key: string; x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const spinner = useRef<HTMLDivElement>(null);
  const items = useMemo(() => itemsUpTo(count), [count]);

  // SPA navigation: ?v=<key> shows the watch page; back/forward work.
  useEffect(() => {
    const read = () => setWatch(new URLSearchParams(window.location.search).get("v"));
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  const navigate = useCallback((key: string | null) => {
    const url = key ? `?v=${encodeURIComponent(key)}` : window.location.pathname;
    window.history.pushState({ v: key }, "", url);
    setWatch(key);
    window.scrollTo(0, 0);
  }, []);

  // Infinite scroll
  useEffect(() => {
    if (watch || !spinner.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) window.setTimeout(() => setCount((c) => Math.min(c + PAGE, MAX)), 300);
    });
    io.observe(spinner.current);
    return () => io.disconnect();
  }, [watch, count]);

  // Close the menu on outside click / Escape
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && (e.target as Element).closest("#popup")) return;
      setMenu(null);
    };
    const t = window.setTimeout(() => {
      document.addEventListener("click", close);
      document.addEventListener("keydown", close);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2000);
  };

  const current = watch ? items.find((i) => i.key === watch) ?? itemsUpTo(MAX).find((i) => i.key === watch) : null;

  return (
    <div className="pg-stream">
      <header className="st-mast" role="banner">
        <a href="/playground/streamly" className="st-logo" onClick={(e) => (e.preventDefault(), navigate(null))}>
          <span className="st-logo-mark">▶</span> Streamly
        </a>
        <input type="search" placeholder="Search" aria-label="Search" className="st-search" />
        <span className="st-avatar" aria-label="Account" />
      </header>
      <div className="st-layout">
        <nav className="st-guide" aria-label="Guide">
          <a href="/playground/streamly" className={!watch ? "is-on" : ""} onClick={(e) => (e.preventDefault(), navigate(null))}>
            Home
          </a>
          <a href="#">Shorts</a>
          <a href="#">Subscriptions</a>
          <a href="#">Watch later {saved.length > 0 && <span className="st-count">{saved.length}</span>}</a>
          <a href="#">History</a>
        </nav>

        {current ? (
          <section className="st-watch" aria-label="Watch page">
            <div className="st-player">▶ Playing “{current.title}”</div>
            <h1 className="st-watch-title">{current.title}</h1>
            <p className="st-watch-meta">
              <span className="channel-name">{current.channel}</span> · {formatViews(current.views)} views · {current.age}
            </p>
          </section>
        ) : (
          <main id="primary" className="st-main">
            <div className="st-chips" role="list">
              {["All", "Live", "Music", "Gaming", "Cooking", "Science", "Recently uploaded"].map((c, i) => (
                <button key={c} type="button" className={i === 0 ? "is-on" : ""} role="listitem">
                  {c}
                </button>
              ))}
            </div>
            <div id="contents" className="st-grid" aria-label="Recommended videos">
              {items.map((v, i) => (
                <article key={v.key} className="video-card" data-video-id={v.key}>
                  <a className="thumb" href={`?v=${v.key}`} onClick={(e) => (e.preventDefault(), navigate(v.key))}>
                    <LazyImg src={thumbDataUrl(v.thumbSeed + (v.part - 1) * 7)} eager={i < 8} />
                    <span className="duration">{v.duration}</span>
                  </a>
                  <div className="details">
                    <span className="avatar" style={{ background: `url("${thumbDataUrl(v.thumbSeed + 3, 64, 64)}") center/cover` }} />
                    <div className="text">
                      <h3>
                        <a href={`?v=${v.key}`} title={v.title} onClick={(e) => (e.preventDefault(), navigate(v.key))}>
                          {v.title}
                        </a>
                      </h3>
                      <div className="channel-name">{v.channel}</div>
                      <div className="meta">
                        <span className="views">{formatViews(v.views)} views</span> • <span className="age">{v.age}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="menu-button"
                      aria-label="Action menu"
                      onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setMenu({ key: v.key, x: Math.max(8, r.right - 240), y: r.bottom + 4 });
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div id="spinner" ref={spinner} className="st-spinner">
              {count >= MAX ? "You're all caught up" : "Loading more…"}
            </div>
          </main>
        )}
      </div>

      {menu && (
        <div id="popup" role="menu" className="st-popup" style={{ left: menu.x, top: menu.y }}>
          {["Add to queue", "Save to Watch later", "Save to playlist", "Not interested", "Don't recommend channel"].map((label) => (
            <div
              key={label}
              role="menuitem"
              tabIndex={0}
              onClick={() => {
                if (label === "Save to Watch later") {
                  setSaved((s) => (s.includes(menu.key) ? s : [...s, menu.key]));
                  showToast("Saved to Watch later");
                }
                setMenu(null);
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
      {toast && (
        <div id="toast" role="status" className="st-toast">
          {toast}
        </div>
      )}
    </div>
  );
}
