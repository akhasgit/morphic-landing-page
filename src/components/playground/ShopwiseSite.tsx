"use client";

import { useMemo, useState } from "react";
import { formatCount, moreProducts, products } from "@/demo/data";
import { thumbDataUrl } from "./thumbs";
import "./playground.css";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

/**
 * Shopwise — a real DOM search-results page for trying Morphic (§11 /playground). Ported from
 * test-website/shop.html: product cards, prices with was-prices, ratings, shipping, a working
 * cart and "show more results" pagination.
 */
export function ShopwiseSite() {
  const [cart, setCart] = useState(0);
  const [more, setMore] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const list = useMemo(() => {
    const all = more ? [...products, ...moreProducts] : products;
    if (sort === "featured") return all;
    const out = [...all];
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    if (sort === "rating") out.sort((a, b) => b.rating - a.rating);
    return out;
  }, [more, sort]);

  return (
    <div className="pg-shop">
      <header className="sw-head">
        <a href="/playground/shopwise" className="sw-logo">
          shopwise
        </a>
        <form className="sw-search" role="search" onSubmit={(e) => e.preventDefault()}>
          <input type="search" defaultValue="headphones" aria-label="Search products" />
          <button type="submit">Search</button>
        </form>
        <span className="cart" aria-label="Cart">
          Cart: <span id="cart-count">{cart}</span>
        </span>
      </header>
      <div className="sw-wrap">
        <aside className="sw-filters" aria-label="Filters">
          <h4>Brand</h4>
          {["Aerial", "Lumen", "Driftwood", "Halcyon", "Atlas"].map((b) => (
            <label key={b}>
              <input type="checkbox" /> {b}
            </label>
          ))}
          <h4>Price</h4>
          {["Under $50", "$50–$150", "Over $150"].map((b) => (
            <label key={b}>
              <input type="checkbox" /> {b}
            </label>
          ))}
          <h4>Customer rating</h4>
          <label>
            <input type="checkbox" /> 4★ & up
          </label>
        </aside>
        <main className="sw-main">
          <div className="sw-bar">
            <span>
              1–{list.length} of over 2,000 results for <b>“headphones”</b>
            </span>
            <label>
              Sort by{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Avg. rating</option>
              </select>
            </label>
          </div>
          <ul className="results" aria-label="Search results">
            {list.map((p) => (
              <li key={p.id} className="result-card" data-asin={p.id}>
                <a href={`#${p.id}`}>
                  <img alt={p.name} src={thumbDataUrl(p.thumbSeed, 400, 400, "product")} />
                </a>
                <h2 className="title">
                  <a href={`#${p.id}`}>{p.name}</a>
                </h2>
                <div className="price-row">
                  <span className="price">${p.price.toFixed(2)}</span>
                  {p.oldPrice && <span className="was">${p.oldPrice.toFixed(2)}</span>}
                </div>
                <div className="stars" aria-label={`${p.rating} out of 5 stars`}>
                  {"★".repeat(Math.round(p.rating))}
                  {"☆".repeat(5 - Math.round(p.rating))} <span className="reviews">({formatCount(p.reviews)})</span>
                </div>
                <div className="ship">{p.shipping.startsWith("Free") ? `✓ ${p.shipping} shipping` : `${p.shipping} shipping`}</div>
                <button type="button" className="add-to-cart" onClick={() => setCart((c) => c + 1)}>
                  Add to cart
                </button>
              </li>
            ))}
          </ul>
          {!more && (
            <button type="button" className="sw-more" onClick={() => setMore(true)}>
              Show more results
            </button>
          )}
        </main>
      </div>
    </div>
  );
}
