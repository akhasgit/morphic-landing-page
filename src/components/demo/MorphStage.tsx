"use client";

import { AnimatePresence, LayoutGroup, m as motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Heart, Search, ShoppingCart, Star, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { formatCount, formatPrice, formatViews, type Metric, type Product, type Video } from "@/demo/data";
import { MetricLayouts, PulseboardClutter } from "./MetricLayouts";
import { Clutter, chromeIn, clutterExit, fadeIn, recT } from "./stage-presets";
import { Thumb } from "./Thumb";
import "./demo.css";

export type Layout = "original" | "circle-grid" | "deck" | "table" | "grid" | "reader" | "big-text" | "chat";
export type SortState = { key: "views" | "title" | "age" | "price" | "rating" | "reviews"; dir: "asc" | "desc" } | null;
export type CellHover = { id: string; field: string; selector: string; x: number; y: number } | null;

type Common = {
  layout: Layout;
  sort?: SortState;
  /** Increment to auto-swipe the top deck card right ("Saved to Watch later"). */
  deckSwipe?: number;
  interactive?: boolean;
  /** Narrow screens: tables render as stacked cards. */
  compact?: boolean;
  onMorphStart?: (layout: Layout) => void;
  onMorphComplete?: (layout: Layout) => void;
  className?: string;
};
type Props =
  | (Common & { dataset: "videos"; records: Video[] })
  | (Common & { dataset: "metrics"; records: Metric[] })
  | (Common & {
      dataset: "products";
      records: Product[];
      pulseIds?: string[];
      flashIds?: string[];
      /** Hover a cell → mono "from page → selector" tooltip + ghosted original highlight. */
      sourceTips?: boolean;
    });

const BG: Record<Layout, string> = {
  original: "#EEEEF1",
  "circle-grid": "#FFFFFF",
  deck: "#F4F2FF",
  table: "#FFFFFF",
  grid: "#F7F8FB",
  reader: "#FFFCF6",
  "big-text": "#FFFFFF",
  chat: "#F6F7FB",
};

/** "Source" selectors shown by tooltips (§7.3) — match the /playground/shopwise markup. */
const PRODUCT_SELECTORS: Record<string, string> = {
  name: ".result-card h2 a",
  price: ".result-card .price",
  rating: ".result-card .stars",
  reviews: ".result-card .reviews",
  shipping: ".result-card .ship",
  link: ".result-card h2 a[href]",
};

function useSorted<T extends Video | Product>(records: T[], sort: SortState): T[] {
  return useMemo(() => {
    if (!sort || !records.length) return records;
    // Products have `name` where videos have `title`.
    const k = (sort.key === "title" && !("title" in records[0]) ? "name" : sort.key) as keyof T;
    const out = [...records].sort((a, b) => {
      const av = a[k] as unknown;
      const bv = b[k] as unknown;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    return sort.dir === "desc" ? out.reverse() : out;
  }, [records, sort]);
}

/**
 * Renders the same records as original · circle-grid · deck · table · grid · reader · big-text
 * (§5.5). Every record is a motion element with layoutId rec-{id} and nested thumb-/title-/
 * price- layoutIds, so items physically fly from old position to new. Clutter exits first
 * (opacity, scale .96, blur 6px, 250ms), records move, new chrome enters last.
 */
export function MorphStage(props: Props) {
  const { layout, interactive = false, compact = false, onMorphStart, onMorphComplete, className = "" } = props;
  const groupId = useId();
  const [sort, setSort] = useState<SortState>(props.sort ?? null);
  const [hover, setHover] = useState<CellHover>(null);
  const firstLayout = useRef(true);
  const cbs = useRef({ onMorphStart, onMorphComplete });
  cbs.current = { onMorphStart, onMorphComplete };

  useEffect(() => setSort(props.sort ?? null), [props.sort]);

  useEffect(() => {
    if (firstLayout.current) {
      firstLayout.current = false;
      return;
    }
    cbs.current.onMorphStart?.(layout);
    const t = window.setTimeout(() => cbs.current.onMorphComplete?.(layout), 950);
    return () => window.clearTimeout(t);
  }, [layout]);

  const sourceTips = props.dataset === "products" && props.sourceTips && layout === "table";
  const stageRef = useRef<HTMLDivElement>(null);
  const [hlBox, setHlBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  // Measure the matching element on the ghosted original so its highlight can sit above the fade.
  useLayoutEffect(() => {
    if (!hover || !stageRef.current) return setHlBox(null);
    const el = stageRef.current.querySelector<HTMLElement>(".d-ghost .d-hl");
    if (!el) return setHlBox(null);
    const r = el.getBoundingClientRect();
    const s = stageRef.current.getBoundingClientRect();
    setHlBox({ left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height });
  }, [hover]);

  return (
    <div ref={stageRef} className={`d-stage ${className}`} data-layout={layout} data-dataset={props.dataset} data-compact={compact || undefined}>
      <motion.div className="d-stage-bg" initial={false} animate={{ backgroundColor: BG[layout] }} transition={{ duration: 0.45 }} />
      {props.dataset === "products" && sourceTips && (
        <AnimatePresence>
          {hover && (
            <motion.div
              key="ghost"
              className="d-ghost"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
            >
              <ShopwiseOriginal records={props.records} plain highlight={hover} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {hover && hlBox && sourceTips && <div className="d-hlbox" style={hlBox} aria-hidden="true" />}
      <div className="d-stage-inner" data-ghosting={hover ? "" : undefined}>
        <LayoutGroup id={groupId}>
          <AnimatePresence>
            {layout === "original" &&
              (props.dataset === "videos" ? (
                <StreamlyClutter key="clutter" />
              ) : props.dataset === "metrics" ? (
                <PulseboardClutter key="clutter" records={props.records} />
              ) : (
                <ShopwiseClutter key="clutter" />
              ))}
          </AnimatePresence>
          {props.dataset === "metrics" ? (
            <MetricLayouts layout={layout} records={props.records} compact={compact} />
          ) : props.dataset === "videos" ? (
            <VideoLayouts layout={layout} records={props.records} sort={sort} setSort={interactive ? setSort : undefined} deckSwipe={props.deckSwipe ?? 0} interactive={interactive} compact={compact} />
          ) : (
            <ProductLayouts
              layout={layout}
              records={props.records}
              sort={sort}
              setSort={interactive ? setSort : undefined}
              compact={compact}
              pulseIds={props.pulseIds}
              flashIds={props.flashIds}
              onHover={sourceTips ? setHover : undefined}
            />
          )}
        </LayoutGroup>
      </div>
      <AnimatePresence>
        {hover && sourceTips && (
          <motion.div
            key={`${hover.id}-${hover.field}`}
            className="d-tip"
            style={{ left: hover.x, top: hover.y }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            from page → {hover.selector}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ───────────────────────────── Videos (Streamly) ─────────────────────────────

function VideoLayouts({
  layout,
  records,
  sort,
  setSort,
  deckSwipe,
  interactive,
  compact,
}: {
  layout: Layout;
  records: Video[];
  sort: SortState;
  setSort?: (s: SortState) => void;
  deckSwipe: number;
  interactive: boolean;
  compact: boolean;
}) {
  const sorted = useSorted(records, layout === "table" ? sort : null);
  switch (layout) {
    case "original":
      return (
        <div className="d-o-main">
          <div className="d-o-grid">
            {records.map((r, i) => (
              <motion.div key={r.id} layoutId={`rec-${r.id}`} className="d-o-card" transition={recT(i)}>
                <motion.div layoutId={`thumb-${r.id}`} className="d-o-thumb" style={{ borderRadius: "7%" }} transition={recT(i)}>
                  <Thumb seed={r.thumbSeed} duration={r.duration} />
                </motion.div>
                <div className="d-o-text">
                  <motion.p layoutId={`title-${r.id}`} layout="position" className="d-o-title" transition={recT(i)}>
                    {r.title}
                  </motion.p>
                  <motion.p className="d-o-meta" {...fadeIn(i)}>
                    {r.channel} · {formatViews(r.views)} views · {r.age}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "circle-grid":
      return (
        <div className="d-cg">
          <motion.div className="d-viewbar" {...chromeIn}>
            <span className="d-viewbar-dot" /> Circle grid <span className="d-viewbar-n">{records.length} videos</span>
          </motion.div>
          <div className="d-cg-grid">
            {records.map((r, i) => (
              <motion.div
                key={r.id}
                layoutId={`rec-${r.id}`}
                className="d-cg-item"
                transition={recT(i)}
                whileHover={interactive ? { scale: 1.06 } : undefined}
              >
                <motion.div layoutId={`thumb-${r.id}`} className="d-cg-thumb" style={{ borderRadius: "50%" }} transition={recT(i)}>
                  <Thumb seed={r.thumbSeed} bare />
                </motion.div>
                <motion.p layoutId={`title-${r.id}`} layout="position" className="d-cg-title" transition={recT(i)}>
                  {r.title}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "deck":
      return <VideoDeck records={records} deckSwipe={deckSwipe} interactive={interactive} />;

    case "table":
      return (
        <div className="d-table" data-compact={compact || undefined}>
          <motion.div className="d-tr d-th" {...chromeIn}>
            <span className="d-td-num">#</span>
            <span />
            <SortHead label="Video" k="title" sort={sort} setSort={setSort} className="d-td-title" />
            <span className="d-td-ch">Channel</span>
            <SortHead label="Views" k="views" sort={sort} setSort={setSort} className="d-td-views" />
            <span className="d-td-age">Uploaded</span>
          </motion.div>
          {sorted.map((r, i) => (
            <motion.div key={r.id} layoutId={`rec-${r.id}`} className="d-tr" transition={recT(i)}>
              <motion.span className="d-td-num" {...fadeIn(i)}>
                {i + 1}
              </motion.span>
              <motion.div layoutId={`thumb-${r.id}`} className="d-td-thumb" style={{ borderRadius: "14%" }} transition={recT(i)}>
                <Thumb seed={r.thumbSeed} bare />
              </motion.div>
              <motion.span layoutId={`title-${r.id}`} layout="position" className="d-td-title" transition={recT(i)}>
                {r.title}
              </motion.span>
              <motion.span className="d-td-ch" {...fadeIn(i)}>
                {r.channel}
              </motion.span>
              <motion.span className="d-td-views" {...fadeIn(i)}>
                {formatViews(r.views)}
              </motion.span>
              <motion.span className="d-td-age" {...fadeIn(i)}>
                {r.age.replace(" ago", "")}
              </motion.span>
            </motion.div>
          ))}
        </div>
      );

    case "grid":
      return (
        <div className="d-grid">
          {records.map((r, i) => (
            <motion.div key={r.id} layoutId={`rec-${r.id}`} className="d-grid-card" transition={recT(i)}>
              <motion.div layoutId={`thumb-${r.id}`} className="d-grid-thumb" style={{ borderRadius: "9%" }} transition={recT(i)}>
                <Thumb seed={r.thumbSeed} duration={r.duration} />
              </motion.div>
              <motion.p layoutId={`title-${r.id}`} layout="position" className="d-grid-title" transition={recT(i)}>
                {r.title}
              </motion.p>
            </motion.div>
          ))}
        </div>
      );

    case "reader":
      return (
        <div className="d-reader">
          <motion.div className="d-reader-head" {...chromeIn}>
            Reading list <span>· {records.length} videos</span>
          </motion.div>
          {records.map((r, i) => (
            <motion.div key={r.id} layoutId={`rec-${r.id}`} className="d-reader-row" transition={recT(i)}>
              <motion.div layoutId={`thumb-${r.id}`} className="d-reader-thumb" style={{ borderRadius: "10%" }} transition={recT(i)}>
                <Thumb seed={r.thumbSeed} bare />
              </motion.div>
              <div className="min-w-0">
                <motion.p layoutId={`title-${r.id}`} layout="position" className="d-reader-title" transition={recT(i)}>
                  {r.title}
                </motion.p>
                <motion.p className="d-reader-meta" {...fadeIn(i)}>
                  {r.channel} · {formatViews(r.views)} views · {r.duration}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      );

    case "big-text":
      return (
        <div className="d-big">
          {records.map((r, i) => (
            <motion.div key={r.id} layoutId={`rec-${r.id}`} className="d-big-row" transition={recT(i)}>
              <motion.div layoutId={`thumb-${r.id}`} className="d-big-thumb" style={{ borderRadius: "8%" }} transition={recT(i)}>
                <Thumb seed={r.thumbSeed} />
              </motion.div>
              <motion.p layoutId={`title-${r.id}`} layout="position" className="d-big-title" transition={recT(i)}>
                {r.title}
              </motion.p>
              <motion.p className="d-big-meta" {...fadeIn(i)}>
                {r.channel}
              </motion.p>
            </motion.div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function VideoDeck({ records, deckSwipe, interactive }: { records: Video[]; deckSwipe: number; interactive: boolean }) {
  const [order, setOrder] = useState(() => records.map((r) => r.id));
  const [swiping, setSwiping] = useState<{ id: string; dir: 1 | -1 } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const byId = useMemo(() => Object.fromEntries(records.map((r) => [r.id, r])), [records]);
  const lastSwipe = useRef(deckSwipe);

  const swipe = (dir: 1 | -1) => {
    const id = order[0];
    if (!id || swiping) return;
    setSwiping({ id, dir });
    window.setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]]);
      setSwiping(null);
    }, 380);
    if (dir === 1) {
      setToast("Saved to Watch later");
      window.setTimeout(() => setToast(null), 1700);
    }
  };

  useEffect(() => {
    if (deckSwipe !== lastSwipe.current) {
      lastSwipe.current = deckSwipe;
      swipe(1);
    }
  }, [deckSwipe]); // swipe() reads current state; only the counter should trigger it

  return (
    <div className="d-deck">
      <motion.div className="d-viewbar" {...chromeIn}>
        <span className="d-viewbar-dot" /> Swipe deck <span className="d-viewbar-n">→ Watch later</span>
      </motion.div>
      <div className="d-deck-stack">
        {order.map((id, depth) => {
          const r = byId[id];
          if (!r) return null;
          const d = Math.min(depth, 2);
          const isSwiping = swiping?.id === id;
          const top = depth === 0;
          return (
            <motion.div
              key={id}
              layoutId={`rec-${id}`}
              className="d-deck-card"
              style={{ zIndex: 30 - depth, borderRadius: "1.1em" }}
              initial={false}
              animate={
                isSwiping
                  ? { x: `${swiping.dir * 135}%`, rotate: swiping.dir * 16, opacity: 0, y: 0, scale: 1 }
                  : { x: 0, rotate: 0, y: `${d * 9}%`, scale: 1 - d * 0.06, opacity: depth < 3 ? 1 - d * 0.12 : 0 }
              }
              transition={{ ...recT(Math.min(depth, 11)), default: { type: "spring", stiffness: 300, damping: 30 } }}
              drag={interactive && top && !swiping ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.7}
              onDragEnd={(_, info) => {
                if (info.offset.x > 70 || info.velocity.x > 500) swipe(1);
                else if (info.offset.x < -70 || info.velocity.x < -500) swipe(-1);
              }}
            >
              <motion.div layoutId={`thumb-${id}`} className="d-deck-thumb" style={{ borderRadius: "0.6em" }} transition={recT(depth)}>
                <Thumb seed={r.thumbSeed} duration={r.duration} />
              </motion.div>
              <motion.p layoutId={`title-${id}`} layout="position" className="d-deck-title" transition={recT(depth)}>
                {r.title}
              </motion.p>
              <motion.p className="d-deck-meta" {...fadeIn(depth)}>
                {r.channel} · {formatViews(r.views)} views
              </motion.p>
            </motion.div>
          );
        })}
      </div>
      <motion.div className="d-deck-actions" {...chromeIn}>
        <button type="button" className="d-deck-btn" onClick={() => interactive && swipe(-1)} tabIndex={interactive ? 0 : -1} aria-label="Skip">
          <X />
        </button>
        <button type="button" className="d-deck-btn is-save" onClick={() => interactive && swipe(1)} tabIndex={interactive ? 0 : -1} aria-label="Save to Watch later">
          <Heart />
        </button>
      </motion.div>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="d-toast"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
          >
            <span className="d-toast-check">✓</span> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortHead({
  label,
  k,
  sort,
  setSort,
  className,
}: {
  label: string;
  k: NonNullable<SortState>["key"];
  sort: SortState;
  setSort?: (s: SortState) => void;
  className?: string;
}) {
  const active = sort?.key === k;
  const content = (
    <>
      {label}
      {active && <ChevronDown className="d-sort-ic" style={{ transform: sort?.dir === "asc" ? "rotate(180deg)" : undefined }} />}
    </>
  );
  if (!setSort) return <span className={`${className} ${active ? "is-sorted" : ""}`}>{content}</span>;
  return (
    <button
      type="button"
      className={`d-sort ${className} ${active ? "is-sorted" : ""}`}
      onClick={() => setSort({ key: k, dir: active && sort?.dir === "desc" ? "asc" : "desc" })}
    >
      {content}
    </button>
  );
}

// ───────────────────────────── Products (Shopwise) ─────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="d-stars" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={i < Math.round(rating) ? "is-on" : ""} />
      ))}
    </span>
  );
}

function ShopwiseOriginal({ records, plain, highlight }: { records: Product[]; plain?: boolean; highlight?: CellHover }) {
  return (
    <>
      {plain && <ShopwiseClutter static />}
      <div className="d-o-main is-shop">
      <div className="d-o-grid is-shop">
        {records.map((r, i) => {
          const hl = (f: string) => (highlight && highlight.id === r.id && highlight.field === f ? "d-hl" : "");
          const card = (
            <>
              <motion.div
                layoutId={plain ? undefined : `thumb-${r.id}`}
                className="d-o-thumb is-shop"
                style={{ borderRadius: "6%" }}
                transition={recT(i)}
              >
                <Thumb seed={r.thumbSeed} kind="product" />
              </motion.div>
              <motion.p layoutId={plain ? undefined : `title-${r.id}`} layout={plain ? undefined : "position"} className={`d-o-title is-shop ${hl("name")} ${hl("link")}`} transition={recT(i)}>
                {r.name}
              </motion.p>
              <div className="d-o-pricerow">
                <motion.span layoutId={plain ? undefined : `price-${r.id}`} layout={plain ? undefined : "position"} className={`d-o-price ${hl("price")}`} transition={recT(i)}>
                  {formatPrice(r.price)}
                </motion.span>
                {r.oldPrice && <span className="d-o-was">{formatPrice(r.oldPrice)}</span>}
              </div>
              <div className={`d-o-stars ${hl("rating")}`}>
                <Stars rating={r.rating} /> <span className={`d-o-rev ${hl("reviews")}`}>({formatCount(r.reviews)})</span>
              </div>
              <div className={`d-o-ship ${hl("shipping")}`}>{r.shipping.startsWith("Free") ? `✓ ${r.shipping} shipping` : `${r.shipping} shipping`}</div>
              <div className="d-o-cart">Add to cart</div>
            </>
          );
          return plain ? (
            <div key={r.id} className="d-o-card is-shop">
              {card}
            </div>
          ) : (
            <motion.div key={r.id} layoutId={`rec-${r.id}`} className="d-o-card is-shop" transition={recT(i)}>
              {card}
            </motion.div>
          );
        })}
      </div>
      </div>
    </>
  );
}

function ProductLayouts({
  layout,
  records,
  sort,
  setSort,
  compact,
  pulseIds = [],
  flashIds = [],
  onHover,
}: {
  layout: Layout;
  records: Product[];
  sort: SortState;
  setSort?: (s: SortState) => void;
  compact: boolean;
  pulseIds?: string[];
  flashIds?: string[];
  onHover?: (h: CellHover) => void;
}) {
  const sorted = useSorted(records, layout === "table" ? sort : null);
  const tableRef = useRef<HTMLDivElement>(null);

  if (layout === "original") return <ShopwiseOriginal records={records} />;

  if (layout === "table" && compact) {
    return (
      <div className="d-pcards">
        {sorted.map((r, i) => (
          <motion.div
            key={r.id}
            layoutId={`rec-${r.id}`}
            className={`d-pcard ${pulseIds.includes(r.id) ? "d-pulse" : ""}`}
            transition={recT(i)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div layoutId={`thumb-${r.id}`} className="d-pcard-thumb" style={{ borderRadius: "14%" }} transition={recT(i)}>
              <Thumb seed={r.thumbSeed} kind="product" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <motion.p layoutId={`title-${r.id}`} layout="position" className="d-pcard-name" transition={recT(i)}>
                {r.name}
              </motion.p>
              <p className="d-pcard-meta">
                <Stars rating={r.rating} /> {r.rating} · {formatCount(r.reviews)} · {r.shipping}
              </p>
            </div>
            <motion.span layoutId={`price-${r.id}`} layout="position" className={`d-pcard-price ${flashIds.includes(r.id) ? "d-flash" : ""}`} transition={recT(i)}>
              {formatPrice(r.price)}
            </motion.span>
          </motion.div>
        ))}
      </div>
    );
  }

  if (layout === "table") {
    const cell = (r: Product, field: string, children: ReactNode, cls: string, extra = "") => (
      <motion.span className={`${cls} ${extra}`} data-field={field} data-id={r.id} {...fadeIn()}>
        {children}
      </motion.span>
    );
    return (
      <div
        ref={tableRef}
        className="d-table is-shop"
        onPointerMove={(e) => {
          if (!onHover) return;
          const el = (e.target as HTMLElement).closest<HTMLElement>("[data-field]");
          const stage = tableRef.current?.closest<HTMLElement>(".d-stage");
          if (!el || !stage) return onHover(null);
          const r = el.getBoundingClientRect();
          const s = stage.getBoundingClientRect();
          const field = el.dataset.field!;
          onHover({ id: el.dataset.id!, field, selector: PRODUCT_SELECTORS[field], x: r.left - s.left, y: r.bottom - s.top + 6 });
        }}
        onPointerLeave={() => onHover?.(null)}
      >
        <motion.div className="d-tr d-th" {...chromeIn}>
          <SortHead label="Product" k="title" sort={sort} setSort={setSort} className="d-tp-name" />
          <SortHead label="Price" k="price" sort={sort} setSort={setSort} className="d-tp-price" />
          <SortHead label="Rating" k="rating" sort={sort} setSort={setSort} className="d-tp-rating" />
          <SortHead label="Reviews" k="reviews" sort={sort} setSort={setSort} className="d-tp-rev" />
          <span className="d-tp-ship">Shipping</span>
          <span className="d-tp-link">Link</span>
        </motion.div>
        <AnimatePresence initial={false}>
          {sorted.map((r, i) => (
            <motion.div
              key={r.id}
              layoutId={`rec-${r.id}`}
              className={`d-tr is-shop ${pulseIds.includes(r.id) ? "d-pulse" : ""}`}
              transition={recT(i)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="d-tp-name" data-field="name" data-id={r.id}>
                <motion.div layoutId={`thumb-${r.id}`} className="d-td-thumb is-shop" style={{ borderRadius: "16%" }} transition={recT(i)}>
                  <Thumb seed={r.thumbSeed} kind="product" />
                </motion.div>
                <motion.span layoutId={`title-${r.id}`} layout="position" className="d-tp-title" transition={recT(i)}>
                  {r.name}
                </motion.span>
              </span>
              <motion.span
                layoutId={`price-${r.id}`}
                layout="position"
                className={`d-tp-price ${flashIds.includes(r.id) ? "d-flash" : ""}`}
                data-field="price"
                data-id={r.id}
                transition={recT(i)}
              >
                {formatPrice(r.price)}
                {r.oldPrice && <s>{formatPrice(r.oldPrice)}</s>}
              </motion.span>
              {cell(
                r,
                "rating",
                <>
                  <Star className="d-tp-star" /> {r.rating.toFixed(1)}
                </>,
                "d-tp-rating",
              )}
              {cell(r, "reviews", formatCount(r.reviews), "d-tp-rev")}
              {cell(r, "shipping", r.shipping, "d-tp-ship", r.shipping.startsWith("Free") ? "is-free" : "")}
              {cell(r, "link", <ArrowUpRight />, "d-tp-link")}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // grid (and any other layout) — clean product cards
  return (
    <div className="d-grid is-shop">
      {records.map((r, i) => (
        <motion.div key={r.id} layoutId={`rec-${r.id}`} className="d-grid-card is-shop" transition={recT(i)}>
          <motion.div layoutId={`thumb-${r.id}`} className="d-grid-thumb is-shop" style={{ borderRadius: "10%" }} transition={recT(i)}>
            <Thumb seed={r.thumbSeed} kind="product" />
          </motion.div>
          <motion.p layoutId={`title-${r.id}`} layout="position" className="d-grid-title" transition={recT(i)}>
            {r.name}
          </motion.p>
          <motion.span layoutId={`price-${r.id}`} layout="position" className="d-grid-price" transition={recT(i)}>
            {formatPrice(r.price)}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}

// ───────────────────────────── Clutter (the busy "before" pages) ─────────────────────────────

function StreamlyClutter() {
  return (
    <div className="d-clutter">
      <Clutter className="d-c-top">
        <span className="d-c-logo">
          <span className="d-c-logo-mark">▶</span> Streamly
        </span>
        <span className="d-c-search">
          Search <Search />
        </span>
        <span className="d-c-avatar" />
      </Clutter>
      <Clutter className="d-c-nav">
        {["Home", "Shorts", "Subscriptions", "Library", "History", "Trending", "Gaming", "Music"].map((l, i) => (
          <span key={l} className={i === 0 ? "is-on" : ""}>
            <i />
            {l}
          </span>
        ))}
      </Clutter>
      <Clutter className="d-c-chips">
        {["All", "Live", "Music", "Gaming", "Podcasts", "Cooking", "News", "Recently uploaded", "Watched"].map((c, i) => (
          <span key={c} className={i === 0 ? "is-on" : ""}>
            {c}
          </span>
        ))}
      </Clutter>
      <Clutter className="d-c-ad">
        <span className="d-c-ad-tag">AD</span>
        <span className="d-c-ad-copy">
          <b>Upgrade your kitchen</b> 40% off countertop gadgets — today only
        </span>
        <span className="d-c-ad-btn">Shop now</span>
      </Clutter>
      <Clutter className="d-c-sponsored">
        <span className="d-c-ad-tag">Sponsored</span>
        <span>Try Brightwave Premium free for 30 days · Learn more</span>
      </Clutter>
      <Clutter className="d-c-side">
        <b>Recommended</b>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i}>
            <i />
            <em />
          </span>
        ))}
      </Clutter>
      <Clutter className="d-c-cookie">
        <span>We use cookies to personalise content and ads. By continuing you accept our policy.</span>
        <span className="d-c-cookie-btns">
          <i>Manage</i>
          <b>Accept all</b>
        </span>
      </Clutter>
    </div>
  );
}

function ShopwiseClutter({ static: isStatic }: { static?: boolean }) {
  return (
    <div className="d-clutter is-shop">
      <Clutter className="d-c-top is-shop" isStatic={isStatic}>
        <span className="d-c-logo is-shop">shopwise</span>
        <span className="d-c-search">
          headphones <Search />
        </span>
        <span className="d-c-cart">
          <ShoppingCart /> 0
        </span>
      </Clutter>
      <Clutter className="d-c-filters" isStatic={isStatic}>
        <b>Brand</b>
        {["Aerial", "Lumen", "Driftwood", "Halcyon"].map((b) => (
          <span key={b}>
            <i />
            {b}
          </span>
        ))}
        <b>Price</b>
        {["Under $50", "$50–$150", "Over $150"].map((b) => (
          <span key={b}>
            <i />
            {b}
          </span>
        ))}
        <b>Rating</b>
        <span>
          <i />
          4★ & up
        </span>
      </Clutter>
      <Clutter className="d-c-ad is-shop" isStatic={isStatic}>
        <span className="d-c-ad-tag">Sponsored</span>
        <span className="d-c-ad-copy">
          <b>Brightwave Buds</b> — the #1 pick, now with 3 extra ear tips
        </span>
        <span className="d-c-ad-btn">See deal</span>
      </Clutter>
      <Clutter className="d-c-sortbar" isStatic={isStatic}>
        <span>1–{8} of over 2,000 results for “headphones”</span>
        <span className="d-c-sortsel">
          Sort by: Featured <ChevronDown />
        </span>
      </Clutter>
      <Clutter className="d-c-cookie" isStatic={isStatic}>
        <span>We use cookies to improve your experience and show relevant ads.</span>
        <span className="d-c-cookie-btns">
          <i>Settings</i>
          <b>Accept</b>
        </span>
      </Clutter>
    </div>
  );
}
