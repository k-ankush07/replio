import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import {
  ArrowDown, ArrowRight, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle,
  Columns2, Copy, Eye, FileText, Grid2X2, Heading1, Heading2, Heading3,
  Image, Layers3, List, Minus, Monitor, MousePointer2, PanelsTopLeft, Play,
  Plus, Redo2, Search, Settings, Square, Star, Trash2, Type, Undo2, Upload,
  WrapText, X,
} from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 9);
const clone = (o) => JSON.parse(JSON.stringify(o));
const kebab = (s) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* block javascript:/data:/vbscript: URLs from link actions */
const safeUrl = (u) => {
  const v = String(u || "").trim();
  if (!v || /^(javascript|data|vbscript):/i.test(v)) return "";
  return v;
};

const DEVICES = {
  desktop: { label: "Desktop", key: "base" },
  tablet: { label: "Tablet", key: "tablet" },
  mobile: { label: "Mobile", key: "mobile" },
};
const DEVICE_PRESETS = {
  desktop: [["Full HD", 1920], ["Macbook Pro 16\"", 1728], ["Macbook Pro 14\"", 1512], ["Default", 1440], ["Chromebook", 1366], ["Macbook Air", 1280]],
  tablet: [["iPad Mini", 768], ["iPad", 810], ["Surface Pro 7", 912], ["iPad Pro", 1024]],
  mobile: [["Galaxy S20", 360], ["iPhone SE", 375], ["iPhone 14", 390], ["iPhone 15", 393], ["iPhone 14 Pro Max", 430]],
};

/* ------------------------------ icons ------------------------------ */
const ICONS = {
  sections: PanelsTopLeft, plus: Plus, layers: Layers3, image: Image, play: Play,
  undo: Undo2, redo: Redo2, gear: Settings, devices: Monitor, left: ChevronLeft,
  trash: Trash2, copy: Copy, up: ChevronUp, down: ChevronDown, right: ChevronRight,
  check: Check, arrowDown: ArrowDown, arrowRight: ArrowRight, wrap: WrapText, eye: Eye,
  upload: Upload, search: Search, close: X, text: Type, heading1: Heading1,
  heading2: Heading2, heading3: Heading3, list: List, rating: Star, container: Square,
  button: MousePointer2, grid: Grid2X2, divider: Minus, icon: Circle, circle: Circle,
  column: Columns2, page: FileText, heading: Heading1,
};
const Ico = ({ n, size = 18, ...props }) => {
  const Icon = ICONS[n];
  return Icon ? <Icon size={size} strokeWidth={1.8} aria-hidden="true" {...props} /> : null;
};

/* ------------------------- node factories -------------------------- */
const node = (type, name, props = {}, base = {}, children = [], mob = {}, tab = {}) => ({
  id: uid(), type, name, props,
  s: { base, tablet: tab, mobile: mob, hover: {} },
  hide: {},
  children,
});

const ph = (w = 800, h = 600, label = "Image") =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' fill='#9ca3af' font-family='sans-serif' font-size='28' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`
  );

const T = (text, base = {}, mob = {}) =>
  node("text", "Text", { text }, { fontSize: "16px", color: "#4b5563", lineHeight: "1.6", ...base }, [], mob);
const H = (text, size = 40, base = {}, mob = {}, tag = "h2") =>
  node("heading", "Heading", { tag, text }, { fontSize: size + "px", fontWeight: "700", color: "#111827", lineHeight: "1.15", ...base }, [], {
    fontSize: Math.max(24, Math.round(size * 0.62)) + "px",
    ...mob,
  });
const Btn = (text, base = {}) =>
  node("button", "Button", { text, action: { type: "none", value: "" } }, {
    padding: "14px 28px", background: "#111827", color: "#ffffff", borderRadius: "8px",
    fontWeight: "600", fontSize: "16px", cursor: "pointer", border: "none", ...base,
  });
const Box = (name, children = [], base = {}, mob = {}, tab = {}) =>
  node("container", name, { tag: "div" }, { display: "flex", flexDirection: "column", gap: "16px", width: "100%", ...base }, children, mob, tab);
const Row = (name, children = [], base = {}, mob = {}) =>
  Box(name, children, { flexDirection: "row", ...base }, { flexDirection: "column", ...mob });
const Img = (src, base = {}) =>
  node("image", "Image", { src, alt: "" }, { width: "100%", objectFit: "cover", borderRadius: "12px", ...base });
const Stars = (rating = 5, base = {}) =>
  node("stars", "Star Rating", { rating }, { color: "#f59e0b", fontSize: "20px", letterSpacing: "2px", ...base });
const Card = (icon, title, text) =>
  Box("Card", [
    node("icon", "Icon", { text: icon }, { fontSize: "32px" }),
    H(title, 20, {}, { fontSize: "20px" }, "h3"),
    T(text),
  ], { flex: "1", padding: "24px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", gap: "10px" });
const grid = (name, cols, children, extra = {}) =>
  Box(name, children, { display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px", ...extra }, { gridTemplateColumns: "1fr" });

/* ---------------------------- components --------------------------- */
const COMPONENTS = [
  { key: "text", label: "Text", glyph: "text", build: () => T("Write your text here") },
  { key: "h1", label: "Heading 1", glyph: "heading1", build: () => H("Heading 1", 48, {}, {}, "h1") },
  { key: "h2", label: "Heading 2", glyph: "heading2", build: () => H("Heading 2", 36) },
  { key: "h3", label: "Heading 3", glyph: "heading3", build: () => H("Heading 3", 24, {}, {}, "h3") },
  {
    key: "list", label: "Bulleted List", glyph: "list",
    build: () => node("list", "List", { items: ["First benefit", "Second benefit", "Third benefit"] }, { listStyle: "disc", paddingLeft: "24px", color: "#374151", lineHeight: "1.8" }),
  },
  { key: "starstext", label: "Stars + Text", glyph: "rating", build: () => Row("Stars + Text", [Stars(5), T("4.9 from 2,000+ reviews", { fontSize: "14px" })], { alignItems: "center", gap: "8px" }, { flexDirection: "row" }) },
  { key: "image", label: "Image", glyph: "image", build: () => Img(ph(800, 600), { height: "auto" }) },
  { key: "container", label: "Container", glyph: "container", build: () => Box("Container", [], { padding: "24px", border: "1px dashed #d1d5db", borderRadius: "8px" }) },
  { key: "button", label: "Button", glyph: "button", build: () => Btn("Click me") },
  {
    key: "imggrid", label: "Image Grid", glyph: "grid",
    build: () => grid("Image Grid", 2, [1, 2, 3, 4].map((i) => Img(ph(400, 400, "Image " + i), { height: "auto", aspectRatio: "1 / 1" })), { gap: "12px" }),
  },
  { key: "rating", label: "Star Rating", glyph: "rating", build: () => Stars(5) },
  { key: "hr", label: "Horizontal Rule", glyph: "divider", build: () => node("hr", "Divider", {}, { width: "100%", height: "1px", background: "#e5e7eb", border: "none" }) },
  { key: "icon", label: "Icon", glyph: "icon", build: () => node("icon", "Icon", { text: "⭐" }, { fontSize: "32px" }) },
  { key: "circle", label: "Circle", glyph: "circle", build: () => node("circle", "Circle", {}, { width: "64px", height: "64px", borderRadius: "9999px", background: "#2563eb" }) },
  { key: "col1", label: "1 Column", glyph: "column", build: () => grid("1 Column", 1, [Box("Column", [], { padding: "16px", border: "1px dashed #d1d5db" })]) },
  { key: "col2", label: "2 Columns", glyph: "column", build: () => grid("2 Columns", 2, [1, 2].map(() => Box("Column", [], { padding: "16px", border: "1px dashed #d1d5db" }))) },
  { key: "col3", label: "3 Columns", glyph: "column", build: () => grid("3 Columns", 3, [1, 2, 3].map(() => Box("Column", [], { padding: "16px", border: "1px dashed #d1d5db" }))) },
];

/* ----------------------------- sections ---------------------------- */
const faq = (q, a) => Box("FAQ Item", [H(q, 18, { fontWeight: "600" }, { fontSize: "18px" }, "h3"), T(a), node("hr", "Divider", {}, { width: "100%", height: "1px", background: "#e5e7eb", border: "none" })], { gap: "8px" });

const SECTIONS = [
  { id: "hero", name: "Hero", desc: "Grab attention", items: [
    { name: "Split hero", build: () => Row("Hero Section", [
      Box("Hero Copy", [H("Everything your customers need, in one place", 52, {}, {}, "h1"), T("One clear sentence about why this product is worth buying today.", { fontSize: "18px" }), Btn("Shop now")], { flex: "1", justifyContent: "center" }),
      Img(ph(900, 700, "Hero image"), { flex: "1", height: "460px" }),
    ], { padding: "64px 48px", gap: "48px", alignItems: "center", background: "#f9fafb" }, { padding: "32px 20px", gap: "24px" }) },
    { name: "Centered hero", build: () => Box("Hero Section", [
      H("Make your headline count", 56, { textAlign: "center" }, {}, "h1"),
      T("Back it up with one honest sentence.", { fontSize: "20px", textAlign: "center", maxWidth: "640px" }),
      Btn("Get started"), Img(ph(1200, 500, "Product shot"), { height: "380px" }),
    ], { padding: "80px 48px", alignItems: "center", gap: "24px" }, { padding: "40px 20px" }) },
  ] },
  { id: "banners", name: "Banners", desc: "Drive urgency", items: [
    { name: "Announcement bar", build: () => Box("Announcement", [T("Free shipping on orders over $50", { color: "#ffffff", textAlign: "center", fontWeight: "600", fontSize: "14px" })], { background: "#111827", padding: "10px 16px" }) },
    { name: "Sale banner", build: () => Row("Sale Banner", [T("Autumn sale: 20% off everything", { color: "#7c2d12", fontWeight: "700", fontSize: "18px" }), Btn("Shop the sale", { padding: "10px 20px" })], { background: "#fed7aa", padding: "16px 32px", alignItems: "center", justifyContent: "center", gap: "20px" }) },
  ] },
  { id: "benefits", name: "Benefits & Features", desc: "Prove the value", items: [
    { name: "3 benefit cards", build: () => Box("Benefits", [H("Why people love it", 36, { textAlign: "center" }), Row("Cards", [Card("🌿", "Natural", "Made from simple ingredients."), Card("🚚", "Fast delivery", "Ships within 24 hours."), Card("♻️", "Sustainable", "Packaging that can be recycled.")], { gap: "20px" })], { padding: "64px 48px" }, { padding: "32px 20px" }) },
  ] },
  { id: "product", name: "Product Detail", desc: "Sell that product", items: [
    { name: "Product with buy box", build: () => Row("Product Detail", [
      Img(ph(800, 800, "Product image"), { flex: "1", height: "auto", aspectRatio: "1 / 1" }),
      Box("Buy Box", [
        H("Product name", 36, {}, {}, "h1"),
        Row("Rating", [Stars(5), T("(2,184 reviews)", { fontSize: "14px" })], { alignItems: "center", gap: "8px" }, { flexDirection: "row" }),
        H("$49.00", 28, { fontWeight: "600" }, { fontSize: "28px" }, "h3"),
        T("Short description of what the product does and who it is for."),
        Btn("Add to cart", { width: "100%" }),
      ], { flex: "1", justifyContent: "center" }),
    ], { padding: "48px", gap: "48px" }, { padding: "20px", gap: "24px" }) },
  ] },
  { id: "cta", name: "Conversion CTAs", desc: "Drive more actions", items: [
    { name: "Dark CTA", build: () => Box("CTA", [H("Ready to try it?", 40, { color: "#ffffff", textAlign: "center" }), T("30-day money back guarantee.", { color: "#d1d5db", textAlign: "center" }), Btn("Order now", { background: "#ffffff", color: "#111827" })], { background: "#111827", padding: "64px 24px", alignItems: "center" }, { padding: "40px 20px" }) },
  ] },
  { id: "compare", name: "Comparisons", desc: "Show why it wins", items: [
    { name: "Comparison table", build: () => {
      const row = (a, b, c, head) => {
        const g = grid("Row", 3, [T(a, { fontWeight: head ? "700" : "500", color: "#111827" }), T(b, { fontWeight: head ? "700" : "400", textAlign: "center" }), T(c, { fontWeight: head ? "700" : "400", textAlign: "center" })], { padding: "12px 0", borderBottom: "1px solid #e5e7eb" });
        g.s.base.gridTemplateColumns = "2fr 1fr 1fr";
        g.s.mobile.gridTemplateColumns = "2fr 1fr 1fr";
        return g;
      };
      return Box("Comparison", [H("Why we win", 36, { textAlign: "center" }), row("", "Us", "Others", true), row("Natural ingredients", "✓", "✗"), row("Free returns", "✓", "✗"), row("Lifetime support", "✓", "✓")], { padding: "64px 48px", maxWidth: "900px" }, { padding: "32px 20px" });
    } },
  ] },
  { id: "proof", name: "Social Proof", desc: "Boost credibility", items: [
    { name: "Testimonials", build: () => Box("Reviews", [H("Loved by thousands", 36, { textAlign: "center" }), Row("Review Cards", [1, 2, 3].map((i) =>
      Box("Review", [Stars(5), T("“Short, specific quote about a real result.”", { color: "#111827" }), T("Customer " + i, { fontSize: "14px", fontWeight: "600" })], { flex: "1", padding: "24px", border: "1px solid #e5e7eb", borderRadius: "12px", gap: "10px" })), { gap: "20px" })], { padding: "64px 48px" }, { padding: "32px 20px" }) },
  ] },
  { id: "guarantees", name: "Guarantees", desc: "Reduce risk", items: [
    { name: "Guarantee strip", build: () => Row("Guarantees", [["🛡️", "30-day guarantee"], ["↩️", "Free returns"], ["🔒", "Secure checkout"]].map(([i, t]) =>
      Row("Item", [node("icon", "Icon", { text: i }, { fontSize: "28px" }), T(t, { fontWeight: "600", color: "#111827" })], { flex: "1", alignItems: "center", justifyContent: "center", gap: "12px" }, { flexDirection: "row" })), { padding: "32px 48px", background: "#f3f4f6" }, { padding: "20px", gap: "12px" }) },
  ] },
  { id: "faqs", name: "FAQs", desc: "Remove Objections", items: [
    { name: "FAQ list", build: () => Box("FAQs", [H("Frequently asked questions", 36, { textAlign: "center" }), faq("How long does shipping take?", "Orders ship within 24 hours and arrive in 3–5 business days."), faq("What is your return policy?", "Return any item within 30 days for a full refund."), faq("Is it safe for everyday use?", "Yes. Add your real answer here.")], { padding: "64px 48px", maxWidth: "820px" }, { padding: "32px 20px" }) },
  ] },
  { id: "collections", name: "Collections", desc: "Show options", items: [
    { name: "Collection grid", build: () => Box("Collections", [H("Shop by category", 36, { textAlign: "center" }), grid("Collection Grid", 3, ["Indoor", "Outdoor", "Gifts"].map((t) => Box("Collection", [Img(ph(600, 600, t), { height: "auto", aspectRatio: "1 / 1" }), H(t, 20, { textAlign: "center" }, {}, "h3")], { gap: "10px" })))], { padding: "64px 48px" }, { padding: "32px 20px" }) },
  ] },
  { id: "howto", name: "How to & Education", desc: "Guide and inform", items: [
    { name: "3 steps", build: () => Box("How it works", [H("How it works", 36, { textAlign: "center" }), Row("Steps", ["Order", "Unbox", "Enjoy"].map((t, i) =>
      Box("Step", [node("circle", "Step Number", { text: String(i + 1) }, { width: "48px", height: "48px", borderRadius: "9999px", background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }), H(t, 22, {}, {}, "h3"), T("One short line explaining this step.")], { flex: "1", gap: "10px" })), { gap: "24px" })], { padding: "64px 48px" }, { padding: "32px 20px" }) },
  ] },
  { id: "about", name: "About & Story", desc: "Build connection", items: [
    { name: "Founder story", build: () => Row("About", [Img(ph(700, 700, "Founder"), { flex: "1", height: "420px" }), Box("Story", [H("Why we started", 36), T("Tell the honest story of how and why this brand began. Keep it personal and specific.")], { flex: "1", justifyContent: "center" })], { padding: "64px 48px", gap: "48px", alignItems: "center" }, { padding: "32px 20px", gap: "24px" }) },
  ] },
  { id: "listicle", name: "Listicle", desc: "Inform and engage", items: [
    { name: "Reasons list", build: () => Box("Listicle", [H("5 reasons to switch", 36), node("list", "List", { items: ["Reason one", "Reason two", "Reason three", "Reason four", "Reason five"] }, { listStyle: "decimal", paddingLeft: "24px", color: "#374151", lineHeight: "2", fontSize: "18px" })], { padding: "64px 48px", maxWidth: "820px" }, { padding: "32px 20px" }) },
  ] },
];

/* --------------------------- tree helpers -------------------------- */
const mapTree = (list, id, fn) => list.map((n) => (n.id === id ? fn(n) : { ...n, children: mapTree(n.children, id, fn) }));
const findNode = (list, id) => {
  for (const n of list) {
    if (n.id === id) return n;
    const f = findNode(n.children, id);
    if (f) return f;
  }
  return null;
};
const removeNode = (list, id) => list.filter((n) => n.id !== id).map((n) => ({ ...n, children: removeNode(n.children, id) }));
const findParentId = (list, id, parent = null) => {
  for (const n of list) {
    if (n.id === id) return parent;
    const f = findParentId(n.children, id, n.id);
    if (f !== undefined) return f;
  }
  return undefined;
};
const insertInto = (list, parentId, nn, index) => {
  const ins = (arr) => { const c = [...arr]; c.splice(index == null ? c.length : index, 0, nn); return c; };
  return parentId == null ? ins(list) : mapTree(list, parentId, (n) => ({ ...n, children: ins(n.children) }));
};
const reId = (n) => ({ ...n, id: uid(), s: clone(n.s), props: clone(n.props), hide: { ...n.hide }, children: n.children.map(reId) });
const shift = (list, id, dir) => {
  const i = list.findIndex((n) => n.id === id);
  if (i >= 0) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return list;
    const c = [...list];
    [c[i], c[j]] = [c[j], c[i]];
    return c;
  }
  let changed = false;
  const out = list.map((n) => {
    const ch = shift(n.children, id, dir);
    if (ch === n.children) return n;
    changed = true;
    return { ...n, children: ch };
  });
  return changed ? out : list;
};

/* make imported / stored data safe to render */
const fixNode = (n) => ({
  ...n,
  id: n.id || uid(),
  type: n.type || "container",
  name: n.name || n.type || "Layer",
  props: n.props || {},
  s: { base: {}, tablet: {}, mobile: {}, hover: {}, ...(n.s || {}) },
  hide: n.hide || {},
  children: (Array.isArray(n.children) ? n.children : []).map(fixNode),
});
const PAGE_ID = "__page__";
/* the page itself behaves like a container node: it has its own styles per device */
const pageNodeOf = (p) => ({ id: PAGE_ID, type: "container", name: "Page", props: { tag: "div" }, s: p.s, hide: {}, children: p.children });
const fixPage = (p) => {
  const s = { base: {}, tablet: {}, mobile: {}, hover: {}, ...(p.s || {}) };
  if (!p.s) s.base = { background: p.bg || "#ffffff", fontFamily: p.font || "Inter, system-ui, sans-serif" }; // migrate old pages
  return { name: "My page", title: "My page", ...p, s, children: (Array.isArray(p.children) ? p.children : []).map(fixNode) };
};

/* later layers win; a shorthand in a later layer cancels earlier longhands */
const SIDES = ["Top", "Right", "Bottom", "Left"];
const applyLayer = (r, l) => {
  for (const [k, v] of Object.entries(l)) {
    if (k === "padding" || k === "margin") SIDES.forEach((sd) => delete r[k + sd]);
    if (k === "gap") { delete r.columnGap; delete r.rowGap; }
    delete r[k];
    r[k] = v;
  }
  return r;
};
const resolveStyle = (n, device, hover) => {
  const s = n.s;
  const r = applyLayer({}, s.base);
  if (device === "tablet" || device === "mobile") applyLayer(r, s.tablet);
  if (device === "mobile") applyLayer(r, s.mobile);
  if (hover) applyLayer(r, s.hover);
  return r;
};
const boxSide = (style, property, side) => {
  const direct = style[`${property}${cap(side)}`];
  if (direct != null) return direct;
  const shorthand = style[property];
  if (!shorthand) return "0px";
  const values = String(shorthand).match(/(?:[^()\s]+|\([^)]*\))+/g) || [];
  const [top, right = top, bottom = top, left = right] = values;
  return { top, right, bottom, left }[side] || "0px";
};

/* ------------------------------ export ----------------------------- */
const RESET = "*{box-sizing:border-box}h1,h2,h3,h4,h5,h6,p,ul,hr,figure{margin:0}button{font-family:inherit}";
const cssText = (o) => Object.entries(o).map(([k, v]) => `${kebab(k)}:${v}`).join(";");

function exportHTML(page) {
  let base = "", tab = "", mob = "", hov = "", hide = "", usesTw = false;
  const el = (n) => {
    const cls = "n-" + n.id;
    const p = n.props;
    if (p.className) usesTw = true;
    const pre =
      (n.s.base.minWidth == null ? "min-width:0;" : "") +
      (n.type === "text" && !n.s.base.whiteSpace ? "white-space:pre-wrap;" : "") +
      (n.type === "image" && n.s.base.maxWidth == null ? "max-width:100%;" : "") +
      (Object.keys(n.s.hover).length && !n.s.base.transition ? "transition:all .15s ease;" : "");
    base += `.${cls}{${pre}${cssText(n.s.base)}}`;
    if (Object.keys(n.s.tablet).length) tab += `.${cls}{${cssText(n.s.tablet)}}`;
    if (Object.keys(n.s.mobile).length) mob += `.${cls}{${cssText(n.s.mobile)}}`;
    if (Object.keys(n.s.hover).length) hov += `.${cls}:hover{${cssText(n.s.hover)}}`;
    if (n.hide.desktop) hide += `@media(min-width:1025px){.${cls}{display:none!important}}`;
    if (n.hide.tablet) hide += `@media(min-width:481px) and (max-width:1024px){.${cls}{display:none!important}}`;
    if (n.hide.mobile) hide += `@media(max-width:480px){.${cls}{display:none!important}}`;
    let a = ` class="${cls}${p.className ? " " + esc(p.className) : ""}"`;
    if (p.htmlId) a += ` id="${esc(p.htmlId)}"`;
    if (p.ariaLabel) a += ` aria-label="${esc(p.ariaLabel)}"`;
    if (p.role) a += ` role="${esc(p.role)}"`;
    if (p.title) a += ` title="${esc(p.title)}"`;
    const act = p.action;
    const val = act ? safeUrl(act.value) : "";
    if (act && act.type === "link" && val) a += ` onclick="${esc(`window.open(${JSON.stringify(val)},${act.newTab ? '"_blank"' : '"_self"'})`)}" style="cursor:pointer"`;
    if (act && act.type === "scroll" && val) a += ` onclick="${esc(`document.getElementById(${JSON.stringify(val)})?.scrollIntoView({behavior:'smooth'})`)}" style="cursor:pointer"`;
    switch (n.type) {
      case "image": return `<img${a} src="${esc(p.src)}" alt="${esc(p.alt)}">`;
      case "hr": return `<hr${a}>`;
      case "list": return `<ul${a}>${(p.items || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
      case "stars": { const r = Math.round(Math.max(0, Math.min(5, +p.rating || 0))); return `<div${a}>${"★".repeat(r)}${"☆".repeat(5 - r)}</div>`; }
      case "text": return `<p${a}>${esc(p.text)}</p>`;
      case "heading": return `<${p.tag || "h2"}${a}>${esc(p.text)}</${p.tag || "h2"}>`;
      case "button": return `<button${a}>${esc(p.text)}</button>`;
      case "icon": return `<span${a}>${esc(p.text)}</span>`;
      default: { const tag = p.tag || "div"; return `<${tag}${a}>${p.text ? esc(p.text) : ""}${n.children.map(el).join("")}</${tag}>`; }
    }
  };
  const body = page.children.map(el).join("\n");
  const ps = page.s || { base: {}, tablet: {}, mobile: {}, hover: {} };
  base = `.n-page{${cssText(ps.base)}}` + base;
  if (Object.keys(ps.tablet).length) tab = `.n-page{${cssText(ps.tablet)}}` + tab;
  if (Object.keys(ps.mobile).length) mob = `.n-page{${cssText(ps.mobile)}}` + mob;
  if (Object.keys(ps.hover).length) hov = `.n-page:hover{${cssText(ps.hover)}}` + hov;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title || page.name)}</title>
${usesTw ? '<script src="https://cdn.tailwindcss.com"></script>\n' : ""}<style>
${RESET}
body{margin:0;background:${ps.base.background || "#ffffff"};font-family:${ps.base.fontFamily || "system-ui,sans-serif"}}
${base}
@media(max-width:1024px){${tab}}
@media(max-width:480px){${mob}}
${hov}
${hide}
</style>
</head>
<body>
<div class="n-page">
${body}
</div>
</body>
</html>`;
}

/* ------------------------------ context ---------------------------- */
const Ctx = createContext({ preview: false });

/* ------------------------------ renderer --------------------------- */
function Render({ n, device, isPageSection = false }) {
  const c = useContext(Ctx);
  const [hov, setHov] = useState(false);
  if (n.hide[device]) return null;

  const isSel = !c.preview && c.selectedId === n.id && c.activeDevice === device;
  const hoverOn = (c.preview && hov) || (isSel && c.stateTab === "hover");
  const st = { ...resolveStyle(n, device, hoverOn) };
  const p = n.props;
  const empty = n.type === "container" && n.children.length === 0;

  if (st.minWidth == null) st.minWidth = "0";
  if (c.preview) {
    st.transition = "background-color .15s ease, color .15s ease, opacity .15s ease, box-shadow .15s ease, border-color .15s ease, filter .15s ease";
    if (st.cursor == null) {
      const hasAction = p.action && ["link", "scroll"].includes(p.action.type) && safeUrl(p.action.value);
      st.cursor = n.type === "button" || hasAction ? "pointer" : "default";
    }
  }
  if (n.type === "text" && !st.whiteSpace) st.whiteSpace = "pre-wrap";
  if (n.type === "image" && st.maxWidth == null) st.maxWidth = "100%"; // images never overflow their container on small screens
  if (!c.preview) {
    if (isSel) { st.outline = "2px solid #2563eb"; st.outlineOffset = "-2px"; }
    else if (isPageSection && c.dropTarget?.id === n.id) {
      st.boxShadow = c.dropTarget.position === "before" ? "inset 0 4px #2563eb" : "inset 0 -4px #2563eb";
    }
    else if (hov) { st.outline = "1px solid #93c5fd"; st.outlineOffset = "-1px"; }
    else if (empty) st.outline = "1px dashed #cbd5e1";
    if (empty && !st.minHeight) st.minHeight = "56px";
  }

  const onClick = (e) => {
    if (!c.preview) { e.stopPropagation(); c.select(n.id, device); return; }
    const a = p.action;
    const val = a ? safeUrl(a.value) : "";
    if (!a || a.type === "none" || !val) return;
    e.stopPropagation();
    if (a.type === "link") window.open(val, a.newTab ? "_blank" : "_self");
    if (a.type === "scroll") document.getElementById(val)?.scrollIntoView({ behavior: "smooth" });
  };

  const common = {
    style: st,
    className: p.className || undefined,
    id: p.htmlId || undefined,
    title: p.title || undefined,
    role: p.role || undefined,
    "aria-label": p.ariaLabel || undefined,
    "data-node": n.id,
    onClick,
    draggable: isPageSection && !c.preview,
    onDragStart: isPageSection && !c.preview ? (e) => {
      e.dataTransfer.setData("text/x-node", n.id);
      e.dataTransfer.effectAllowed = "move";
    } : undefined,
    onDragEnd: isPageSection && !c.preview ? c.clearDropTarget : undefined,
    onDragOver: (e) => {
      if (c.preview) return;
      if (isPageSection && e.dataTransfer.types.includes("text/x-node")) {
        c.dragOverNode(e, n.id);
        return;
      }
      if (e.dataTransfer.types.includes("text/x-asset")) e.preventDefault();
    },
    onDrop: (e) => {
      if (c.preview) return;
      if (isPageSection && e.dataTransfer.types.includes("text/x-node")) {
        e.stopPropagation();
        c.dropNode(e, n.id);
        return;
      }
      if (e.dataTransfer.types.includes("text/x-asset")) c.dropAsset(e, n.id);
    },
    onMouseEnter: () => setHov(true),
    onMouseLeave: () => setHov(false),
  };

  switch (n.type) {
    case "image": return <img {...common} src={p.src} alt={p.alt || ""} draggable={false} />;
    case "hr": return <hr {...common} />;
    case "list": return <ul {...common}>{(p.items || []).map((t, i) => <li key={i}>{t}</li>)}</ul>;
    case "stars": {
      const r = Math.round(Math.max(0, Math.min(5, +p.rating || 0)));
      return <div {...common}>{"★".repeat(r) + "☆".repeat(5 - r)}</div>;
    }
    case "text": return <p {...common}>{p.text}</p>;
    case "heading": return React.createElement(p.tag || "h2", common, p.text);
    case "button": return <button type="button" {...common}>{p.text}</button>;
    case "icon": return <span {...common}>{p.text}</span>;
    default: {
      const dropProps = c.preview ? {} : {
        onDragOver: (e) => {
          if (e.dataTransfer.types.includes("text/x-node")) {
            if (isPageSection) c.dragOverNode(e, n.id);
            return;
          }
          e.preventDefault();
          e.stopPropagation();
        },
        onDrop: (e) => {
          if (e.dataTransfer.types.includes("text/x-node")) {
            if (isPageSection) {
              e.stopPropagation();
              c.dropNode(e, n.id);
            }
            return;
          }
          e.stopPropagation();
          c.drop(e, n.id);
        },
      };
      return React.createElement(
        p.tag || "div",
        { ...common, ...dropProps },
        p.text || null,
        n.children.map((ch) => <Render key={ch.id} n={ch} device={device} />),
        empty && !c.preview ? <span key="hint" style={{ color: "#94a3b8", fontSize: 12, pointerEvents: "none" }}>Drop components here</span> : null
      );
    }
  }
}

/* --------------------------- small UI parts ------------------------ */
const Section = ({ title, children, open: o0 = true }) => {
  const [o, setO] = useState(o0);
  return (
    <div className="border-b border-gray-100 py-3">
      <button onClick={() => setO(!o)} className="flex w-full items-center gap-1 text-left text-[13px] font-semibold text-gray-800">
        <span className="flex w-3 text-gray-400"><Ico n={o ? "down" : "right"} size={13} /></span>{title}
      </button>
      {o && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
};
const Seg = ({ value, options, onChange }) => (
  <div className="flex rounded-md bg-gray-100 p-0.5 text-xs">
    {options.map((o) => {
      const v = typeof o === "string" ? o : o.value;
      const l = typeof o === "string" ? o : o.label;
      return (
        <button key={v} onClick={() => onChange(v)} className={`flex-1 rounded px-2 py-1 ${value === v ? "bg-white font-medium text-blue-600 shadow-sm" : "text-gray-600"}`}>{l}</button>
      );
    })}
  </div>
);
const Field = ({ label, children }) => (
  <div className="flex items-center gap-2">
    <span className="w-[68px] shrink-0 text-xs text-gray-500">{label}</span>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);
const Inp = ({ value, onChange, placeholder, type = "text" }) => (
  <input type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500" />
);
const Sel = ({ value, options, onChange }) => (
  <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-200 bg-white px-1.5 py-1 text-xs outline-none focus:border-blue-500">
    {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
  </select>
);
const Area = ({ value, onChange, rows = 3 }) => (
  <textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
    className="w-full resize-y rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500" />
);
const Color = ({ value, onChange }) => (
  <div className="flex gap-1.5">
    <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || "") ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-6 w-8 shrink-0 cursor-pointer rounded border border-gray-200 bg-white p-0" />
    <Inp value={value} onChange={onChange} placeholder="none" />
  </div>
);
const Mini = ({ value, onChange }) => (
  <input value={value ?? ""} placeholder="0px" onChange={(e) => onChange(e.target.value)} className="w-12 bg-transparent text-center text-xs outline-none placeholder:text-gray-400 focus:text-blue-600" />
);
const IconBtn = ({ n, title, onClick, active, danger }) => (
  <button title={title} onClick={onClick} className={`flex h-8 w-8 items-center justify-center rounded-md ${active ? "bg-gray-900 text-white" : danger ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-100"}`}>
    <Ico n={n} size={17} />
  </button>
);

/* split on ';' that are not inside (), "" or '' (e.g. data: URLs) */
const splitDecls = (text) => {
  const out = [];
  let cur = "", depth = 0, q = null;
  for (const ch of text) {
    if (q) { if (ch === q) q = null; cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === ";" && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
};

function CustomCss({ value, onApply }) {
  const text = Object.entries(value).map(([k, v]) => `${kebab(k)}: ${v};`).join("\n");
  const [d, setD] = useState(text);
  useEffect(() => setD(text), [text]);
  const apply = () => {
    const o = {};
    splitDecls(d).forEach((line) => {
      const i = line.indexOf(":");
      if (i < 0) return;
      const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
      if (k && v) o[k.startsWith("--") ? k : camel(k)] = v;
    });
    onApply(o);
  };
  return (
    <textarea rows={6} value={d} onChange={(e) => setD(e.target.value)} onBlur={apply} spellCheck={false}
      className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-[11px] outline-none focus:border-blue-500" />
  );
}

/* --------------------------- layers panel -------------------------- */
function LayerItem({ n, depth, api, selectedId }) {
  const [open, setOpen] = useState(true);
  const [edit, setEdit] = useState(false);
  const sel = selectedId === n.id;
  const glyph = { container: "container", text: "text", heading: "heading", button: "button", image: "image", list: "list", hr: "divider", stars: "rating", circle: "circle", icon: "icon" }[n.type];
  return (
    <div>
      <div onClick={() => api.select(n.id)} className={`group flex cursor-pointer items-center gap-1 rounded-md py-1 pr-1 text-xs ${sel ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`} style={{ paddingLeft: 4 + depth * 14 }}>
        <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className={`flex w-4 items-center justify-center text-gray-400 ${n.children.length ? "" : "invisible"}`}><Ico n={open ? "down" : "right"} size={13} /></button>
        <span className="flex w-4 justify-center text-gray-400"><Ico n={glyph} size={14} /></span>
        {edit ? (
          <input autoFocus defaultValue={n.name} onClick={(e) => e.stopPropagation()} onBlur={(e) => { api.rename(n.id, e.target.value || n.name); setEdit(false); }}
            onKeyDown={(e) => e.key === "Enter" && e.target.blur()} className="min-w-0 flex-1 rounded border border-blue-400 px-1 text-xs outline-none" />
        ) : (
          <span onDoubleClick={() => setEdit(true)} className={`min-w-0 flex-1 truncate ${n.hide[api.device] ? "opacity-40 line-through" : ""}`}>{n.name}</span>
        )}
        <span className={`flex items-center ${sel ? "" : "invisible group-hover:visible"}`}>
          <button title="Hide on this device" onClick={(e) => { e.stopPropagation(); api.toggleHide(n.id); }} className="p-0.5 text-gray-500 hover:text-gray-900"><Ico n="eye" size={13} /></button>
          <button title="Move up" onClick={(e) => { e.stopPropagation(); api.move(n.id, -1); }} className="p-0.5 text-gray-500 hover:text-gray-900"><Ico n="up" size={13} /></button>
          <button title="Move down" onClick={(e) => { e.stopPropagation(); api.move(n.id, 1); }} className="p-0.5 text-gray-500 hover:text-gray-900"><Ico n="down" size={13} /></button>
          <button title="Duplicate" onClick={(e) => { e.stopPropagation(); api.dup(n.id); }} className="p-0.5 text-gray-500 hover:text-gray-900"><Ico n="copy" size={13} /></button>
          <button title="Delete" onClick={(e) => { e.stopPropagation(); api.remove(n.id); }} className="p-0.5 text-red-400 hover:text-red-600"><Ico n="trash" size={13} /></button>
        </span>
      </div>
      {open && n.children.map((ch) => <LayerItem key={ch.id} n={ch} depth={depth + 1} api={api} selectedId={selectedId} />)}
    </div>
  );
}

/* --------------------------- left panels --------------------------- */
const SearchBox = ({ value, onChange, placeholder }) => (
  <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1.5 text-gray-400 focus-within:border-blue-500">
    <Ico n="search" size={14} />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-xs text-gray-800 outline-none" />
  </div>
);
function SectionsPanel({ onAdd, onDragStateChange }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const list = SECTIONS.filter((s) => (s.name + s.desc + s.items.map((i) => i.name).join(" ")).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder="Search sections…" />
      <div className="mt-2 space-y-1 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 230px)" }}>
        {list.map((s) => (
          <div key={s.id}>
            <button onClick={() => setOpen(open === s.id ? null : s.id)} className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-gray-50">
              <span><span className="block text-[13px] font-semibold text-gray-900">{s.name}</span><span className="block text-xs text-gray-500">{s.desc}</span></span>
              <span className="text-gray-400"><Ico n={open === s.id || q ? "down" : "right"} size={14} /></span>
            </button>
            {(open === s.id || q) && (
              <div className="mb-1 ml-2 space-y-1 border-l border-gray-100 pl-2">
                {s.items.map((it, index) => (
                  <button key={it.name} draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/x-section", `${s.id}:${index}`);
                      e.dataTransfer.effectAllowed = "copy";
                      onDragStateChange(true);
                    }}
                    onDragEnd={() => onDragStateChange(false)}
                    onClick={() => onAdd(it.build())}
                    className="block w-full rounded-md border border-gray-200 px-2 py-2 text-left text-xs text-gray-700 hover:border-blue-400 hover:bg-blue-50">+ {it.name}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {!list.length && <p className="p-2 text-xs text-gray-500">No sections found.</p>}
      </div>
    </>
  );
}
function ComponentsPanel({ onAdd, onDragStateChange }) {
  const [q, setQ] = useState("");
  const list = COMPONENTS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder="Search components…" />
      <p className="mt-2 text-[11px] text-gray-500">Click to add, or drag onto the canvas.</p>
      <div className="mt-2 grid grid-cols-2 gap-2 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 250px)" }}>
        {list.map((c) => (
          <button key={c.key} draggable
            onDragStart={(e) => { e.dataTransfer.setData("text/x-comp", c.key); e.dataTransfer.effectAllowed = "copy"; onDragStateChange(true); }}
            onDragEnd={() => onDragStateChange(false)}
            onClick={() => onAdd(c.build())}
            className="flex h-[84px] flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400 hover:bg-blue-50">
            <span className="text-blue-600"><Ico n={c.glyph} size={20} /></span>
            <span className="text-[11px]">{c.label}</span>
          </button>
        ))}
        {!list.length && <p className="col-span-2 p-2 text-xs text-gray-500">No components found.</p>}
      </div>
    </>
  );
}
function AssetsPanel({ assets, setAssets, onUse }) {
  const [q, setQ] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef(null);
  const upload = (files) => Array.from(files).forEach((f) => {
    const r = new FileReader();
    r.onload = () => setAssets((a) => [{ id: uid(), name: f.name, src: r.result }, ...a]);
    r.readAsDataURL(f);
  });
  const addUrl = () => {
    const u = url.trim();
    if (!u || /^(javascript|vbscript):/i.test(u)) return;
    setAssets((a) => [{ id: uid(), name: u.split("/").pop() || "image", src: u }, ...a]);
    setUrl("");
  };
  const list = assets.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="flex gap-2">
        <div className="flex-1"><SearchBox value={q} onChange={setQ} placeholder="Search" /></div>
        <button onClick={() => fileRef.current.click()} title="Upload" className="rounded-lg border border-gray-200 px-2 text-gray-600 hover:bg-gray-50"><Ico n="upload" size={15} /></button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
      </div>
      <div className="mt-2 flex gap-1">
        <Inp value={url} onChange={setUrl} placeholder="Paste image URL" />
        <button onClick={addUrl} className="rounded-md bg-gray-900 px-2 text-xs text-white">Add</button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {list.map((a) => (
          <button key={a.id} draggable
            onDragStart={(e) => { e.dataTransfer.setData("text/x-asset", a.id); e.dataTransfer.effectAllowed = "copy"; }}
            onClick={() => onUse(a)} className="overflow-hidden rounded-lg border border-gray-200 text-left hover:border-blue-400">
            <img src={a.src} alt="" draggable={false} className="h-24 w-full object-cover" />
            <span className="block truncate px-1.5 py-1 text-[11px] text-gray-600">{a.name}</span>
          </button>
        ))}
        {!list.length && <p className="col-span-2 p-2 text-xs text-gray-500">Upload images or paste a URL. Click an image to add it, or to replace the selected image.</p>}
      </div>
    </>
  );
}

/* --------------------------- right panel --------------------------- */
const V3 = ["flex-start", "center", "flex-end"];

/* column layout presets: [template, visual fractions] */
const GRID_PRESETS = [
  ["repeat(1, 1fr)", [1]],
  ["repeat(2, 1fr)", [1, 1]],
  ["1fr 2fr", [1, 2]],
  ["2fr 1fr", [2, 1]],
  ["repeat(3, 1fr)", [1, 1, 1]],
  ["repeat(4, 1fr)", [1, 1, 1, 1]],
];
const normTpl = (t) => String(t || "").replace(/\s+/g, " ").trim();
const trackCount = (t) => {
  const v = normTpl(t);
  const m = /^repeat\((\d+)/.exec(v);
  if (m) return +m[1];
  if (!v) return 1;
  return (v.match(/(?:[^()\s]+|\([^)]*\))+/g) || []).length || 1;
};
/* gap shorthand is "row col" */
const gapOf = (st, which) => {
  const direct = which === "col" ? st.columnGap : st.rowGap;
  if (direct != null) return direct;
  if (!st.gap) return "";
  const [row, col = row] = String(st.gap).match(/(?:[^()\s]+|\([^)]*\))+/g) || [];
  return which === "col" ? col : row;
};
const SIDE_KEYS = ["top", "right", "bottom", "left"];

function RightPanel({ node: n, device, stateTab, setStateTab, api }) {
  const [tab, setTab] = useState("design");
  const fileRef = useRef(null);
  const editKey = stateTab === "hover" ? "hover" : DEVICES[device].key;
  const cur = resolveStyle(n, device, stateTab === "hover");
  const set = (k, v) => api.setStyles({ [k]: v }, editKey);
  const isC = n.type === "container";
  const isPage = n.id === PAGE_ID;
  const isTxt = ["text", "heading", "button", "list", "icon", "stars", "circle"].includes(n.type);
  const p = n.props;

  const wMode = cur.width === "100%" ? "fill" : !cur.width || cur.width === "fit-content" ? "fit" : "fixed";
  const hMode = cur.height === "100%" ? "fill" : !cur.height || cur.height === "auto" ? "fit" : "fixed";
  const fd = cur.flexDirection || "row";
  const axis = fd.startsWith("column") ? "column" : "row";
  const reversed = fd.endsWith("-reverse");
  const isGrid = cur.display === "grid";
  const sidesOf = (prop) => Object.fromEntries(SIDE_KEYS.map((sd) => [sd, boxSide(cur, prop, sd)]));
  const margin = sidesOf("margin");
  const padding = sidesOf("padding");
  const colCount = (/repeat\((\d+)/.exec(cur.gridTemplateColumns || "") || [])[1] || "";
  const posKind = cur.position || "static";

  /* write all four longhands and drop the shorthand so nothing conflicts */
  const setBox = (prop, side, v) => {
    const vals = prop === "margin" ? margin : padding;
    const o = { [prop]: "" };
    SIDE_KEYS.forEach((sd) => { o[prop + cap(sd)] = sd === side ? v : vals[sd]; });
    api.setStyles(o, editKey);
  };

  /* horizontal alignment of the element itself, via auto margins (works in block and flex parents) */
  const alignNow = margin.left === "auto" && margin.right === "auto" ? "center" : margin.left === "auto" ? "right" : "left";
  const setAlign = (v) => {
    const o = {
      margin: "",
      marginTop: margin.top, marginBottom: margin.bottom,
      marginLeft: v === "left" ? "" : "auto",
      marginRight: v === "right" ? "" : "auto",
    };
    if (["image", "button", "icon"].includes(n.type)) o.display = "block"; // inline elements ignore auto margins
    if (["icon", "stars"].includes(n.type) && !cur.width) o.width = "fit-content";
    api.setStyles(o, editKey);
  };

  const layoutOn = !isPage || cur.display === "flex" || isGrid;
  const setAxis = (v) => {
    if (v === "wrap") { set("flexWrap", cur.flexWrap === "wrap" ? "nowrap" : "wrap"); return; }
    const o = { flexDirection: v + (reversed ? "-reverse" : "") };
    if (cur.flexWrap === "wrap") o.flexWrap = "nowrap";
    api.setStyles(o, editKey);
  };

  return (
    <div className="pointer-events-auto absolute right-3 top-[88px] w-[300px] overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5" style={{ maxHeight: "calc(100vh - 150px)" }}>
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold capitalize text-gray-900">{n.type} <span className="font-normal text-gray-400">· {n.name}</span></span>
          <button onClick={() => api.select(null)} className="text-gray-400 hover:text-gray-700"><Ico n="close" size={15} /></button>
        </div>
        <div className="mt-2 flex gap-4 border-b border-gray-100 text-xs">
          {[["design", "Design"], ["config", "Config"], ["interactions", "Interactions"], ["a11y", "Accessibility"]].filter(([k]) => !isPage || k === "design").map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`pb-2 ${tab === k ? "border-b-2 border-blue-600 font-medium text-blue-600" : "text-gray-500"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: "calc(100vh - 230px)" }}>
        {tab === "design" && (
          <>
            <Section title="States">
              <div className="flex gap-2">
                <button onClick={() => setStateTab("default")} className={`rounded-md border px-3 py-1 text-xs ${stateTab === "default" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600"}`}>Default</button>
                {!isPage && <button onClick={() => setStateTab("hover")} className={`rounded-md border px-3 py-1 text-xs ${stateTab === "hover" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600"}`}>Hover</button>}
              </div>
              <p className="text-[11px] text-gray-500">
                Editing: <b>{stateTab === "hover" ? "hover style" : DEVICES[device].label}</b>
                {device !== "desktop" && stateTab !== "hover" ? " (overrides desktop)" : ""}. Click a frame to switch device.
              </p>
              {Object.keys(n.s[editKey]).length > 0 && editKey !== "base" && (
                <button onClick={() => api.replaceStyle(editKey, {})} className="text-[11px] text-blue-600 underline">Reset {editKey} overrides</button>
              )}
            </Section>

            <Section title="Size">
              {!isPage && (<>
              <Field label="Width">
                <div className="flex gap-1">
                  <div className="w-[96px]"><Seg value={wMode} options={[{ value: "fill", label: "Fill" }, { value: "fit", label: "Fit" }, { value: "fixed", label: "Px" }]}
                    onChange={(m) => set("width", m === "fill" ? "100%" : m === "fit" ? "fit-content" : /^\d/.test(cur.width || "") ? cur.width : "300px")} /></div>
                  <Inp value={cur.width} onChange={(v) => set("width", v)} placeholder="auto" />
                </div>
              </Field>
              <Field label="Height">
                <div className="flex gap-1">
                  <div className="w-[96px]"><Seg value={hMode} options={[{ value: "fill", label: "Fill" }, { value: "fit", label: "Fit" }, { value: "fixed", label: "Px" }]}
                    onChange={(m) => set("height", m === "fill" ? "100%" : m === "fit" ? "auto" : /^\d/.test(cur.height || "") ? cur.height : "300px")} /></div>
                  <Inp value={cur.height} onChange={(v) => set("height", v)} placeholder="auto" />
                </div>
              </Field>
              </>)}
              <Field label="Max width"><Inp value={cur.maxWidth} onChange={(v) => set("maxWidth", v)} placeholder="none" /></Field>
              <Field label="Min height"><Inp value={cur.minHeight} onChange={(v) => set("minHeight", v)} placeholder="0" /></Field>
              {!isPage && (<>
              <Field label="Flex"><Inp value={cur.flex} onChange={(v) => set("flex", v)} placeholder="e.g. 1" /></Field>
              <Field label="Ratio"><Inp value={cur.aspectRatio} onChange={(v) => set("aspectRatio", v)} placeholder="e.g. 16 / 9" /></Field>
              <Field label="Align">
                <Seg value={alignNow} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} onChange={setAlign} />
              </Field>
              </>)}
            </Section>

            {isC && (
              <Section title="Layout">
                <Seg value={isGrid ? "columns" : layoutOn ? "auto" : ""} options={[{ value: "auto", label: "Auto Layout" }, { value: "columns", label: "Columns" }]}
                  onChange={(m) => m === "columns"
                    ? api.setStyles({ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }, editKey)
                    : api.setStyles({ display: "flex", gridTemplateColumns: "", flexDirection: cur.flexDirection || "column" }, editKey)} />
                {isGrid ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {GRID_PRESETS.map(([tpl, fr]) => {
                        const on = normTpl(cur.gridTemplateColumns) === tpl;
                        return (
                          <button key={tpl} title={fr.join(" : ")} onClick={() => set("gridTemplateColumns", tpl)}
                            className={`flex h-9 gap-1 rounded-md border p-1 ${on ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
                            {fr.map((f, i) => (
                              <span key={i} style={{ flex: f }} className={`flex items-center justify-center rounded-sm text-[11px] ${on ? "bg-white text-blue-600" : "bg-white text-gray-500"}`}>{f}</span>
                            ))}
                          </button>
                        );
                      })}
                    </div>
                    <Field label="Columns">
                      <Sel value={String(trackCount(cur.gridTemplateColumns))} options={Array.from({ length: 12 }, (_, i) => String(i + 1))}
                        onChange={(v) => set("gridTemplateColumns", `repeat(${v}, 1fr)`)} />
                    </Field>
                    <Field label="Col Gap"><Inp value={gapOf(cur, "col")} onChange={(v) => api.setStyles({ gap: "", columnGap: v, rowGap: gapOf(cur, "row") }, editKey)} placeholder="0px" /></Field>
                    <Field label="Row Gap"><Inp value={gapOf(cur, "row")} onChange={(v) => api.setStyles({ gap: "", rowGap: v, columnGap: gapOf(cur, "col") }, editKey)} placeholder="0px" /></Field>
                    <Field label="Align"><Sel value={cur.alignItems || ""} options={["", "stretch", "flex-start", "center", "flex-end"]} onChange={(v) => set("alignItems", v)} /></Field>
                  </>
                ) : layoutOn ? (
                  <>
                    <Seg value={cur.flexWrap === "wrap" ? "wrap" : axis} options={[{ value: "row", label: <span className="flex items-center justify-center gap-1"><Ico n="arrowRight" size={13} />Row</span> }, { value: "column", label: <span className="flex items-center justify-center gap-1"><Ico n="arrowDown" size={13} />Col</span> }, { value: "wrap", label: <span className="flex items-center justify-center gap-1"><Ico n="wrap" size={13} />Wrap</span> }]} onChange={setAxis} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <span className="text-xs text-gray-500">Spacing</span>
                        <Seg value={cur.justifyContent === "space-between" ? "spaced" : "packed"} options={[{ value: "packed", label: "Packed" }, { value: "spaced", label: "Spaced" }]}
                          onChange={(m) => set("justifyContent", m === "spaced" ? "space-between" : "flex-start")} />
                        <span className="block text-xs text-gray-500">Gap</span>
                        <Inp value={cur.gap} onChange={(v) => set("gap", v)} placeholder="0px" />
                        <span className="block text-xs text-gray-500">Order</span>
                        <Seg value={reversed ? "reverse" : "forward"} options={[{ value: "forward", label: "Forward" }, { value: "reverse", label: "Reverse" }]}
                          onChange={(m) => set("flexDirection", axis + (m === "reverse" ? "-reverse" : ""))} />
                      </div>
                      <div className="grid h-[84px] w-[84px] shrink-0 grid-cols-3 gap-1 rounded-md bg-gray-50 p-2">
                        {[0, 1, 2].flatMap((r) => [0, 1, 2].map((cc) => {
                          const main = axis === "row" ? cc : r, cross = axis === "row" ? r : cc;
                          const on = cur.justifyContent === V3[main] && cur.alignItems === V3[cross];
                          return <button key={r + "-" + cc} onClick={() => api.setStyles({ justifyContent: V3[main], alignItems: V3[cross] }, editKey)} className={`rounded-full ${on ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"}`} />;
                        }))}
                      </div>
                    </div>
                  </>
                ) : <p className="text-[11px] text-gray-500">The page uses normal stacked layout. Choose Auto Layout to control direction, gap and alignment of your sections, or Columns for a grid.</p>}
              </Section>
            )}

            {!isPage && (<Section title="Visibility">
              <div className="flex gap-2">
                {["mobile", "tablet", "desktop"].map((d) => (
                  <button key={d} onClick={() => api.toggleHide(n.id, d)} className={`flex-1 rounded-md border px-2 py-1 text-xs capitalize ${n.hide[d] ? "border-red-300 bg-red-50 text-red-600" : "border-gray-200 text-gray-600"}`}>
                    {n.hide[d] ? "Hidden " : ""}{d}
                  </button>
                ))}
              </div>
            </Section>)}

            <Section title="Spacing">
              <div className="rounded-lg bg-orange-50 p-2 text-[10px] text-orange-500">
                <div className="mb-0.5">Margin</div>
                <div className="flex justify-center"><Mini value={margin.top} onChange={(v) => setBox("margin", "top", v)} /></div>
                <div className="flex items-center justify-between">
                  <Mini value={margin.left} onChange={(v) => setBox("margin", "left", v)} />
                  <div className="mx-1 flex-1 rounded-md bg-green-50 p-1 text-green-600">
                    <div>Padding</div>
                    <div className="flex justify-center"><Mini value={padding.top} onChange={(v) => setBox("padding", "top", v)} /></div>
                    <div className="flex items-center justify-between">
                      <Mini value={padding.left} onChange={(v) => setBox("padding", "left", v)} />
                      <div className="h-5 w-8 rounded bg-white" />
                      <Mini value={padding.right} onChange={(v) => setBox("padding", "right", v)} />
                    </div>
                    <div className="flex justify-center"><Mini value={padding.bottom} onChange={(v) => setBox("padding", "bottom", v)} /></div>
                  </div>
                  <Mini value={margin.right} onChange={(v) => setBox("margin", "right", v)} />
                </div>
                <div className="flex justify-center"><Mini value={margin.bottom} onChange={(v) => setBox("margin", "bottom", v)} /></div>
              </div>
              <p className="text-[11px] text-gray-500">Use values like 16px, 2rem, auto. Shorthand padding and margin values are shown per side.</p>
            </Section>

            <Section title="Positioning" open={false}>
              <Seg value={posKind} options={["static", "relative", "absolute", "sticky", "fixed"]} onChange={(v) => set("position", v === "static" ? "" : v)} />
              {posKind !== "static" && (
                <div className="grid grid-cols-2 gap-2">
                  {["top", "right", "bottom", "left"].map((k) => <Inp key={k} value={cur[k]} onChange={(v) => set(k, v)} placeholder={k} />)}
                </div>
              )}
              <Field label="Z-index"><Inp value={cur.zIndex} onChange={(v) => set("zIndex", v)} placeholder="auto" /></Field>
            </Section>

            {(isTxt || isPage) && (
              <Section title="Typography">
                <Field label="Font"><Inp value={cur.fontFamily} onChange={(v) => set("fontFamily", v)} placeholder="inherit" /></Field>
                <Field label="Size"><Inp value={cur.fontSize} onChange={(v) => set("fontSize", v)} placeholder="16px" /></Field>
                <Field label="Weight"><Sel value={cur.fontWeight || ""} options={["", "300", "400", "500", "600", "700", "800", "900"]} onChange={(v) => set("fontWeight", v)} /></Field>
                <Field label="Color"><Color value={cur.color} onChange={(v) => set("color", v)} /></Field>
                <Field label="Line h."><Inp value={cur.lineHeight} onChange={(v) => set("lineHeight", v)} placeholder="1.5" /></Field>
                <Field label="Letter sp."><Inp value={cur.letterSpacing} onChange={(v) => set("letterSpacing", v)} placeholder="0" /></Field>
                <Seg value={cur.textAlign || "left"} options={["left", "center", "right"]} onChange={(v) => set("textAlign", v)} />
              </Section>
            )}

            <Section title="Background">
              <Field label="Color"><Color value={cur.background} onChange={(v) => set("background", v)} /></Field>
              {isC && (
                <Field label="Image URL"><Inp value={(cur.backgroundImage || "").replace(/^url\(["']?|["']?\)$/g, "")} onChange={(v) => api.setStyles(v ? { backgroundImage: `url("${v}")`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundImage: "" }, editKey)} placeholder="https://…" /></Field>
              )}
            </Section>

            <Section title="Border & effects">
              <Field label="Border"><Inp value={cur.border} onChange={(v) => set("border", v)} placeholder="1px solid #e5e7eb" /></Field>
              <Field label="Radius"><Inp value={cur.borderRadius} onChange={(v) => set("borderRadius", v)} placeholder="0px" /></Field>
              <Field label="Shadow"><Inp value={cur.boxShadow} onChange={(v) => set("boxShadow", v)} placeholder="0 4px 12px rgba(0,0,0,.1)" /></Field>
              <Field label="Opacity"><Inp value={cur.opacity} onChange={(v) => set("opacity", v)} placeholder="1" /></Field>
              <Field label="Overflow"><Sel value={cur.overflow || ""} options={["", "visible", "hidden", "auto", "scroll"]} onChange={(v) => set("overflow", v)} /></Field>
              {n.type === "image" && <Field label="Fit"><Sel value={cur.objectFit || ""} options={["", "cover", "contain", "fill", "none"]} onChange={(v) => set("objectFit", v)} /></Field>}
              <Field label="Cursor"><Sel value={cur.cursor || ""} options={["", "pointer", "default", "not-allowed"]} onChange={(v) => set("cursor", v)} /></Field>
            </Section>

            <Section title="Custom CSS" open={false}>
              <CustomCss key={n.id + editKey} value={n.s[editKey]} onApply={(o) => api.replaceStyle(editKey, o)} />
              <p className="text-[11px] text-gray-500">One property per line. Applies to the current device / state.</p>
            </Section>
          </>
        )}

        {tab === "config" && (
          <div className="space-y-3 pt-3">
            <Field label="Name"><Inp value={n.name} onChange={(v) => api.rename(n.id, v)} /></Field>
            {n.type === "container" && <Field label="HTML tag"><Sel value={p.tag || "div"} options={["div", "section", "header", "footer", "main", "nav", "article", "aside"]} onChange={(v) => api.setProps({ tag: v })} /></Field>}
            {n.type === "heading" && <Field label="HTML tag"><Sel value={p.tag || "h2"} options={["h1", "h2", "h3", "h4", "h5", "h6"]} onChange={(v) => api.setProps({ tag: v })} /></Field>}
            {["text", "heading", "button", "icon", "circle"].includes(n.type) && (
              <div><span className="mb-1 block text-xs text-gray-500">Content</span><Area value={p.text} onChange={(v) => api.setProps({ text: v })} /></div>
            )}
            {n.type === "list" && (
              <div><span className="mb-1 block text-xs text-gray-500">Items (one per line)</span><Area rows={5} value={(p.items || []).join("\n")} onChange={(v) => api.setProps({ items: v.split("\n") })} /></div>
            )}
            {n.type === "stars" && <Field label="Rating"><Sel value={String(p.rating ?? 5)} options={["0", "1", "2", "3", "4", "5"]} onChange={(v) => api.setProps({ rating: +v })} /></Field>}
            {n.type === "image" && (
              <>
                <Field label="Image URL"><Inp value={p.src?.startsWith("data:") ? "(uploaded / placeholder)" : p.src} onChange={(v) => api.setProps({ src: v })} /></Field>
                <button onClick={() => fileRef.current.click()} className="w-full rounded-md border border-gray-200 py-1.5 text-xs text-gray-700 hover:bg-gray-50">Upload image</button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => api.setProps({ src: r.result }); r.readAsDataURL(f); e.target.value = ""; }} />
              </>
            )}
            <Field label="HTML id"><Inp value={p.htmlId} onChange={(v) => api.setProps({ htmlId: v })} placeholder="for scroll targets" /></Field>
            <div>
              <span className="mb-1 block text-xs text-gray-500">Tailwind classes</span>
              <Inp value={p.className} onChange={(v) => api.setProps({ className: v })} placeholder="e.g. shadow-lg hover:scale-105" />
              <p className="mt-1 text-[11px] text-gray-500">Only classes that exist in your Tailwind build will apply. Use the Design tab for any custom value.</p>
            </div>
          </div>
        )}

        {tab === "interactions" && (
          <div className="space-y-3 pt-3">
            <span className="text-xs font-medium text-gray-700">On click</span>
            <Seg value={p.action?.type || "none"} options={[{ value: "none", label: "None" }, { value: "link", label: "Open link" }, { value: "scroll", label: "Scroll to" }]}
              onChange={(v) => api.setProps({ action: { ...(p.action || {}), type: v, value: p.action?.value || "" } })} />
            {(p.action?.type === "link" || p.action?.type === "scroll") && (
              <Field label={p.action.type === "link" ? "URL" : "Element id"}>
                <Inp value={p.action.value} onChange={(v) => api.setProps({ action: { ...p.action, value: v } })} placeholder={p.action.type === "link" ? "https://…" : "section-id"} />
              </Field>
            )}
            {p.action?.type === "link" && (
              <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={!!p.action.newTab} onChange={(e) => api.setProps({ action: { ...p.action, newTab: e.target.checked } })} />Open in new tab</label>
            )}
            <p className="text-[11px] text-gray-500">Hover effects: Design → States → Hover, then change any style. Works in Preview and in the exported page.</p>
          </div>
        )}

        {tab === "a11y" && (
          <div className="space-y-3 pt-3">
            <Field label="Aria label"><Inp value={p.ariaLabel} onChange={(v) => api.setProps({ ariaLabel: v })} /></Field>
            <Field label="Role"><Inp value={p.role} onChange={(v) => api.setProps({ role: v })} placeholder="e.g. banner" /></Field>
            <Field label="Title"><Inp value={p.title} onChange={(v) => api.setProps({ title: v })} placeholder="tooltip" /></Field>
            {n.type === "image" && <Field label="Alt text"><Inp value={p.alt} onChange={(v) => api.setProps({ alt: v })} /></Field>}
          </div>
        )}

        {!isPage && <div className="mt-3 flex gap-2">
          <button onClick={() => api.dup(n.id)} className="flex-1 rounded-md border border-gray-200 py-1.5 text-xs text-gray-700 hover:bg-gray-50">Duplicate</button>
          <button onClick={() => api.remove(n.id)} className="flex-1 rounded-md border border-red-200 py-1.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
        </div>}
      </div>
    </div>
  );
}

/* ------------------- preview dimensions popover -------------------- */
function DimPanel({ d, width, onChange, onClose }) {
  const [v, setV] = useState(String(width));
  const [open, setOpen] = useState(false);
  useEffect(() => setV(String(width)), [width]);
  const commit = () => {
    const n = parseInt(v, 10);
    if (n >= 200 && n <= 4000) onChange(n); else setV(String(width));
  };
  const cur = DEVICE_PRESETS[d].find((p) => p[1] === width);
  return (
    <div className="w-[240px] rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">Preview Dimensions</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><Ico n="close" size={15} /></button>
      </div>
      <div className="mt-3 text-xs text-gray-500">Set Preview Width</div>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5 focus-within:border-blue-500">
        <Ico n="devices" size={14} />
        <input value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ""))} onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && e.target.blur()} className="w-full text-xs outline-none" />
        <span className="text-xs text-gray-400">px</span>
      </div>
      <div className="mt-3 text-xs text-gray-500">By Device</div>
      <button onClick={() => setOpen(!open)} className="mt-1 flex w-full items-center justify-between rounded-md border border-gray-200 px-2 py-1.5 text-xs">
        <span>{cur ? `${cur[0]} (${cur[1]}px)` : "Custom"}</span><Ico n="down" size={13} />
      </button>
      {open && (
        <div className="mt-1 rounded-lg border border-gray-100 p-1 shadow-md">
          {DEVICE_PRESETS[d].map(([name, w]) => (
            <button key={name} onClick={() => { onChange(w); setOpen(false); }}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-gray-50 ${w === width ? "bg-gray-50" : ""}`}>
              <span>{name} <span className="text-gray-400">({w}px)</span></span>
              {w === width && <Ico n="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ main app --------------------------- */
const initialPage = () => fixPage({
  name: "My page",
  title: "My page",
  children: [SECTIONS[1].items[0].build(), SECTIONS[0].items[0].build()],
});
const STORE = "replo-clone:page";
const loadPage = () => {
  try {
    const s = localStorage.getItem(STORE);
    if (s) { const j = JSON.parse(s); if (j && Array.isArray(j.children)) return fixPage(j); }
  } catch (e) { /* storage unavailable or corrupt */ }
  return initialPage();
};

export default function Editor() {
  const [hist, setHist] = useState(() => ({ past: [], present: loadPage(), future: [] }));
  const lastKey = useRef({ k: null, t: 0 });
  const page = hist.present;

  const [selId, setSelId] = useState(null);
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [stateTab, setStateTab] = useState("default");
  const [leftTab, setLeftTab] = useState("sections");
  const [leftOpen, setLeftOpen] = useState(true);
  const [zoom, setZoom] = useState(50);
  const [show, setShow] = useState({ desktop: true, tablet: true, mobile: true });
  const [widths, setWidths] = useState({ desktop: 1440, tablet: 810, mobile: 393 });
  const [assets, setAssets] = useState([]);
  const [draggingComponent, setDraggingComponent] = useState(false);
  const [dropTarget, setDropTarget] = useState(null);
  const [pop, setPop] = useState(null); // settings | publish | previewMenu | nameEdit
  const [preview, setPreview] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [toast, setToast] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const toastTimer = useRef(null);
  const importRef = useRef(null);

  const notify = (msg) => {
    setToast({ id: Date.now(), message: msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => { if (pop !== "settings") setConfirmClear(false); }, [pop]);

  /* infinite canvas state */
  const [pan, setPan] = useState({ x: 450, y: 110 });
  const [dimPop, setDimPop] = useState(null); // {kind:"width"|"devices", d, x, y}
  const [panning, setPanning] = useState(false);
  const [space, setSpace] = useState(false);
  const canvasRef = useRef(null);
  const drag = useRef(null);
  const justPanned = useRef(false);
  const justZoomed = useRef(false);
  const view = useRef({ zoom, pan });
  view.current = { zoom, pan };
  const s = zoom / 100;

  const zoomAt = (z2, cx, cy) => {
    const { zoom: z1, pan: p } = view.current;
    z2 = Math.min(400, Math.max(10, z2));
    const r = z2 / z1;
    setPan({ x: cx - (cx - p.x) * r, y: cy - (cy - p.y) * r });
    setZoom(z2);
  };
  const fit = () => {
    const left = leftOpen ? 390 : 110;
    const vis = Object.keys(DEVICES).filter((d) => show[d]);
    const total = vis.reduce((a, d) => a + widths[d], 0);
    const avail = window.innerWidth - left - 140 - 16 * Math.max(0, vis.length - 1);
    setZoom(Math.min(100, Math.max(10, (avail / Math.max(total, 1)) * 100)));
    setPan({ x: left + 60, y: 110 });
  };
  const openDim = (e, kind, d) => {
    const r = e.currentTarget.getBoundingClientRect();
    setDimPop({ kind, d, x: r.left, y: r.bottom + 8 });
  };
  const onCanvasDown = (e) => {
    const onBg = !e.target.closest("[data-nopan]");
    if (!(e.button === 1 || (e.button === 0 && (onBg || space)))) return;
    e.preventDefault();
    document.activeElement?.blur?.(); // preventDefault stops the browser doing this itself
    drag.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y, moved: false };
    setPanning(true);
  };
  /* swallow the click that ends a pan drag (or any click while Space is held) */
  const preventPanSelection = (e) => {
    if (!space && !justPanned.current) return;
    e.preventDefault();
    e.stopPropagation();
    setPop(null);
    setDimPop(null);
    justPanned.current = false;
  };

  /* wheel: scroll = pan, ctrl/cmd or space + scroll = zoom at cursor */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const zooming = e.ctrlKey || e.metaKey || space;
      if (zooming) {
        justZoomed.current = true;
        setTimeout(() => { justZoomed.current = false; }, 0);
        zoomAt(view.current.zoom * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
      } else {
        const horiz = e.shiftKey && !e.deltaX;
        setPan((p) => ({ x: p.x - (horiz ? e.deltaY : e.deltaX), y: p.y - (horiz ? 0 : e.deltaY) }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [space]);

  /* drag to pan */
  useEffect(() => {
    const mv = (e) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      setPan({ x: d.px + dx, y: d.py + dy });
    };
    const up = () => {
      const d = drag.current;
      if (!d) return;
      if (d.moved) { justPanned.current = true; setTimeout(() => { justPanned.current = false; }, 0); }
      drag.current = null;
      setPanning(false);
    };
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, []);

  /* hold Space to pan */
  useEffect(() => {
    const dn = (e) => {
      if (e.code === "Space" && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName) && !e.target.isContentEditable) { e.preventDefault(); setSpace(true); }
    };
    const up = (e) => { if (e.code === "Space") setSpace(false); };
    const blur = () => setSpace(false);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, []);

  useEffect(() => { fit(); }, []);

  /* keep the active device among the visible ones */
  useEffect(() => {
    if (!show[activeDevice]) {
      const f = Object.keys(DEVICES).find((d) => show[d]);
      if (f) setActiveDevice(f);
    }
  }, [show, activeDevice]);

  /* history */
  const update = (fn, key) => {
    const now = Date.now();
    const merge = !!key && lastKey.current.k === key && now - lastKey.current.t < 800;
    lastKey.current = { k: key, t: now };
    setHist((h) => {
      const next = fn(h.present);
      if (next === h.present) return h;
      return { past: merge ? h.past : [...h.past, h.present].slice(-100), present: next, future: [] };
    });
  };
  const undo = () => setHist((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h));
  const redo = () => setHist((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h));

  const savePage = (pageToSave = page, showFeedback = false) => {
    try {
      localStorage.setItem(STORE, JSON.stringify(pageToSave));
      setSaveStatus("saved");
      if (showFeedback) notify("Changes saved automatically ✌️");
      return true;
    } catch (error) {
      console.error("Unable to save page to local storage", error);
      setSaveStatus("error");
      notify("Could not save changes. Check browser storage settings.");
      return false;
    }
  };

  /* Debounced autosave, with a synchronous flush when the page is closed. */
  useEffect(() => {
    setSaveStatus("saving");
    const t = setTimeout(() => savePage(page), 400);
    const flush = () => savePage(page);
    window.addEventListener("pagehide", flush);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pagehide", flush);
    };
  }, [page]);

  /* selection */
  const pageNode = pageNodeOf(page);
  const pageStyleFor = (d) => ({ boxSizing: "border-box", background: "#ffffff", ...resolveStyle(pageNode, d, false) });
  const selNode = selId === PAGE_ID ? pageNode : selId ? findNode(page.children, selId) : null;
  useEffect(() => { if (selId && !selNode) setSelId(null); });
  const select = (id, d) => {
    setSelId(id);
    setDimPop(null);
    if (d) setActiveDevice(d);
    setStateTab("default");
  };

  /* mutations */
  const patchId = (id, fn, key) => update((p) => (id === PAGE_ID ? { ...p, s: fn(pageNodeOf(p)).s } : { ...p, children: mapTree(p.children, id, fn) }), key && id + key);
  const setPageBase = (k, v) => update((p) => {
    const base = { ...p.s.base };
    if (v === "" || v == null) delete base[k]; else base[k] = v;
    return { ...p, s: { ...p.s, base } };
  }, "pg:" + k);
  const api = {
    device: activeDevice,
    select,
    setStyles: (obj, tgt) =>
      patchId(selId, (n) => {
        const o = { ...n.s[tgt] };
        Object.entries(obj).forEach(([k, v]) => { if (v === "" || v == null) delete o[k]; else o[k] = v; });
        return { ...n, s: { ...n.s, [tgt]: o } };
      }, `s:${tgt}:${Object.keys(obj).join()}`),
    replaceStyle: (tgt, o) => patchId(selId, (n) => ({ ...n, s: { ...n.s, [tgt]: o } })),
    setProps: (obj) => patchId(selId, (n) => ({ ...n, props: { ...n.props, ...obj } }), `p:${Object.keys(obj).join()}`),
    rename: (id, name) => patchId(id, (n) => ({ ...n, name }), "rename"),
    toggleHide: (id, d) => patchId(id, (n) => ({ ...n, hide: { ...n.hide, [d || activeDevice]: !n.hide[d || activeDevice] } })),
    remove: (id) => { update((p) => ({ ...p, children: removeNode(p.children, id) })); },
    dup: (id) => {
      const orig = findNode(page.children, id);
      if (!orig) return;
      const copy = reId(orig);
      const parent = findParentId(page.children, id);
      const list = parent == null ? page.children : findNode(page.children, parent).children;
      const idx = list.findIndex((x) => x.id === id) + 1;
      update((p) => ({ ...p, children: insertInto(p.children, parent ?? null, copy, idx) }));
      setSelId(copy.id);
    },
    move: (id, dir) => update((p) => {
      const children = shift(p.children, id, dir);
      return children === p.children ? p : { ...p, children };
    }),
  };

  const addNode = (nn, parentId = null) => {
    update((p) => ({ ...p, children: insertInto(p.children, parentId, nn) }));
    setSelId(nn.id);
  };
  /* click-to-add: empty container -> inside it; otherwise as a NEW sibling right after the selection;
     nothing selected -> end of page. (Dragging onto a container still nests explicitly.) */
  const addAfterSelection = (nn) => {
    if (!selNode || selNode.id === PAGE_ID) return addNode(nn, null);
    if (selNode.type === "container" && selNode.children.length === 0) return addNode(nn, selNode.id);
    const parent = findParentId(page.children, selNode.id) ?? null;
    const list = parent == null ? page.children : findNode(page.children, parent).children;
    const idx = list.findIndex((x) => x.id === selNode.id) + 1;
    update((p) => ({ ...p, children: insertInto(p.children, parent, nn, idx) }));
    setSelId(nn.id);
  };
  const addSection = (nn) => addNode(nn, null);
  const useAsset = (a) => {
    if (selNode && selNode.type === "image") api.setProps({ src: a.src });
    else { const nn = Img(a.src, { height: "auto" }); nn.props.alt = a.name; addAfterSelection(nn); }
  };
  const dropAsset = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    const asset = assets.find((a) => a.id === e.dataTransfer.getData("text/x-asset"));
    if (!asset) return;
    const target = targetId ? findNode(page.children, targetId) : null;
    if (target?.type === "image") {
      patchId(target.id, (n) => ({ ...n, props: { ...n.props, src: asset.src, alt: asset.name } }));
      setSelId(target.id);
      return;
    }
    const parentId = target?.type === "container" ? target.id : targetId ? findParentId(page.children, targetId) : null;
    const image = Img(asset.src, { height: "auto" });
    image.props.alt = asset.name;
    addNode(image, parentId ?? null);
  };
  const reorderSection = (sourceId, targetId, position) => update((p) => {
    if (sourceId === targetId) return p;
    const children = [...p.children];
    const sourceIndex = children.findIndex((n) => n.id === sourceId);
    if (sourceIndex < 0) return p;
    const [moving] = children.splice(sourceIndex, 1);
    const targetIndex = targetId ? children.findIndex((n) => n.id === targetId) : children.length;
    if (targetIndex < 0) return p;
    children.splice(targetIndex + (position === "after" && targetId ? 1 : 0), 0, moving);
    return { ...p, children };
  });
  const dragOverNode = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    const { top, height } = e.currentTarget.getBoundingClientRect();
    setDropTarget({ id: targetId, position: e.clientY < top + height / 2 ? "before" : "after" });
  };
  const dropNode = (e, targetId) => {
    const sourceId = e.dataTransfer.getData("text/x-node");
    if (!sourceId) return false;
    e.preventDefault();
    e.stopPropagation();
    const { top, height } = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < top + height / 2 ? "before" : "after";
    reorderSection(sourceId, targetId, position);
    setDropTarget(null);
    return true;
  };
  const drop = (e, parentId) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData("text/x-node");
    if (sourceId) {
      reorderSection(sourceId, null, "after");
      setDropTarget(null);
      return;
    }
    const sectionKey = e.dataTransfer.getData("text/x-section");
    if (sectionKey) {
      const [sectionId, rawIndex] = sectionKey.split(":");
      const item = SECTIONS.find((section) => section.id === sectionId)?.items[Number(rawIndex)];
      if (item) addSection(item.build());
      setDraggingComponent(false);
      return;
    }
    const assetId = e.dataTransfer.getData("text/x-asset");
    if (assetId) { dropAsset(e, parentId); setDraggingComponent(false); return; }
    const key = e.dataTransfer.getData("text/x-comp");
    const def = COMPONENTS.find((c) => c.key === key);
    if (def) addNode(def.build(), parentId);
    setDraggingComponent(false);
  };

  /* keyboard */
  useEffect(() => {
    const h = (e) => {
      const t = e.target;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        savePage(page, true);
        return;
      }
      if (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable) return;
      if (e.key === "Escape") {
        if (preview) setPreview(null); else setSelId(null);
        setPop(null);
        setDimPop(null);
        return;
      }
      if (preview) return; // no editing shortcuts while previewing
      const k = e.key.toLowerCase();
      if (mod && k === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && k === "y") { e.preventDefault(); redo(); }
      else if (mod && k === "d" && selId && selId !== PAGE_ID) { e.preventDefault(); api.dup(selId); }
      else if ((e.key === "Delete" || e.key === "Backspace") && selId && selId !== PAGE_ID) { e.preventDefault(); api.remove(selId); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  /* publish helpers */
  const download = (name, text, type) => {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const copyJSON = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(page)); notify("JSON copied to clipboard"); }
    catch (e) { notify("Clipboard blocked by the browser. Use Download JSON instead."); }
  };
  const slug = (page.name || "page").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "page";
  const importJSON = (file) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        if (!j || !Array.isArray(j.children)) throw new Error("bad shape");
        update(() => fixPage(j));
        setSelId(null);
        setPop(null);
        notify("Page imported");
      } catch (e) { notify("Invalid page JSON file"); }
    };
    r.readAsText(file);
  };

  const ctx = {
    preview: false, selectedId: selId, activeDevice, stateTab, select, drop, dropAsset,
    dropTarget, dragOverNode, dropNode, clearDropTarget: () => setDropTarget(null),
  };
  const visible = Object.keys(DEVICES).filter((d) => show[d]);

  const railBtn = (id, icon, title) => (
    <button key={id} title={title} onClick={() => { if (leftTab === id && leftOpen) setLeftOpen(false); else { setLeftTab(id); setLeftOpen(true); } }}
      className={`flex h-9 w-9 items-center justify-center rounded-lg ${leftTab === id && leftOpen ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
      <Ico n={icon} />
    </button>
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#fafafa] font-sans text-gray-900" onClick={() => { setPop(null); setDimPop(null); }}>
      {/* canvas (infinite, pannable) */}
      <div ref={canvasRef} className="absolute inset-0 overflow-hidden"
        style={{
          backgroundColor: "#fafafa",
          backgroundImage: "radial-gradient(#d4d4d8 1px, transparent 1px)",
          backgroundSize: `${16 * s}px ${16 * s}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          cursor: panning ? "grabbing" : space ? "grab" : "default",
        }}
        onMouseDown={onCanvasDown}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("text/x-comp") || e.dataTransfer.types.includes("text/x-asset") || e.dataTransfer.types.includes("text/x-section") || e.dataTransfer.types.includes("text/x-node")) e.preventDefault();
        }}
        onDrop={(e) => { drop(e, null); setDraggingComponent(false); }}
        onClickCapture={preventPanSelection}
        onAuxClickCapture={preventPanSelection}
        onClick={() => { if (justZoomed.current) { justZoomed.current = false; return; } select(null); }}>
        <div className="absolute left-0 top-0 flex items-start"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${s})`, transformOrigin: "0 0", gap: 16 / s, width: "max-content" }}>
          <style>{`.rp-frame *{box-sizing:border-box}.rp-frame :where(h1,h2,h3,h4,h5,h6,p,ul,hr){margin:0}.rp-frame button{font-family:inherit}`}</style>
          {visible.map((d, i) => {
            const W = widths[d];
            return (
              <div key={d} data-nopan className="group relative shrink-0" style={{ width: W }} onClick={(e) => e.stopPropagation()}>
                {/* header: always screen-size, whatever the zoom */}
                <div style={{ width: W, height: 58 / s }}>
                  <div className="relative flex items-center gap-2 rounded-lg bg-white px-3 shadow-sm ring-1 ring-black/5"
                    style={{ width: Math.max(W * s, 175), height: 48, transform: `scale(${1 / s})`, transformOrigin: "0 0" }}>
                    {i === 0 && (
                      <button title="Show devices" onClick={(e) => { e.stopPropagation(); openDim(e, "devices"); }}
                        className="absolute flex items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5"
                        style={{ left: -60, top: 0, width: 48, height: 48 }}><Ico n="sections" /></button>
                    )}
                    <span className={`text-sm font-semibold ${activeDevice === d ? "text-blue-600" : ""}`}>{DEVICES[d].label}</span>
                    <button onClick={(e) => { e.stopPropagation(); openDim(e, "width", d); }}
                      className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">{W}px <Ico n="down" size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setPreview(d); }} title="Preview"
                      className="ml-auto flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-700 hover:bg-gray-50"><Ico n="play" size={13} /></button>
                  </div>
                </div>
                <Ctx.Provider value={ctx}>
                  <div className="rp-frame relative shadow ring-1 ring-black/10" style={{ ...pageStyleFor(d), width: W, ...(selId === PAGE_ID && activeDevice === d ? { outline: "2px solid #2563eb", outlineOffset: "-2px" } : {}) }}
                    onClick={() => select(null, d)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => drop(e, null)}>
                    <button title="Select page" onClick={(e) => { e.stopPropagation(); select(PAGE_ID, d); }}
                      className={`absolute left-0 top-0 z-20 rounded-br-md bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white ${selId === PAGE_ID && activeDevice === d ? "block" : "hidden group-hover:block"}`}
                      style={{ transform: `scale(${1 / s})`, transformOrigin: "0 0" }}>Page</button>
                    {page.children.map((n) => <Render key={n.id} n={n} device={d} isPageSection />)}
                    {draggingComponent && (
                      <div
                        className="m-3 flex min-h-16 items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/60 text-sm font-medium text-blue-600"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.stopPropagation(); drop(e, null); setDraggingComponent(false); }}
                      >
                        Drop to add at end
                      </div>
                    )}
                    {!page.children.length && <div className="flex h-[400px] items-center justify-center text-sm text-gray-400">Add a section from the left panel, or drop a component here.</div>}
                  </div>
                </Ctx.Provider>
              </div>
            );
          })}
          {!visible.length && (
            <div data-nopan className="flex items-center gap-3 text-sm text-gray-500">
              <button onClick={(e) => { e.stopPropagation(); openDim(e, "devices"); }} className="flex items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5" style={{ width: 48 / s, height: 48 / s }}><Ico n="sections" /></button>
              No device selected.
            </div>
          )}
        </div>
      </div>

      {/* page card */}
      <div className="absolute left-3 top-3 flex h-[52px] w-[300px] items-center gap-2 rounded-xl bg-white px-3 shadow-md ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">R</div>
        {pop === "nameEdit" ? (
          <input autoFocus defaultValue={page.name} onBlur={(e) => { update((p) => ({ ...p, name: e.target.value || p.name }), "name"); setPop(null); }} onKeyDown={(e) => e.key === "Enter" && e.target.blur()} className="min-w-0 flex-1 rounded border border-blue-400 px-1 text-sm font-semibold outline-none" />
        ) : (
          <button onClick={() => setPop("nameEdit")} className="min-w-0 flex-1 truncate text-left text-sm font-semibold">{page.name}</button>
        )}
        <span title={saveStatus === "saving" ? "Saving changes…" : saveStatus === "error" ? "Could not save changes" : "All changes saved"} className={`shrink-0 text-[10px] ${saveStatus === "error" ? "text-red-500" : saveStatus === "saving" ? "text-gray-400" : "text-green-600"}`}>
          {saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Save failed" : "Saved"}
        </span>
        <button title="Page settings" onClick={() => setPop(pop === "settings" ? null : "settings")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700"><Ico n="gear" size={16} /></button>
        {pop === "settings" && (
          <div className="absolute top-0 z-40 space-y-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5"
            style={{ left: "min(calc(100% + 8px), calc(100vw - 312px))", width: "min(300px, calc(100vw - 24px))" }}>
            <span className="text-[13px] font-semibold">Page settings</span>
            <Field label="Title"><Inp value={page.title} onChange={(v) => update((p) => ({ ...p, title: v }), "title")} /></Field>
            <Field label="Background"><Color value={page.s.base.background} onChange={(v) => setPageBase("background", v)} /></Field>
            <Field label="Font"><Inp value={page.s.base.fontFamily} onChange={(v) => setPageBase("fontFamily", v)} /></Field>
            {/* window.confirm is blocked in sandboxed iframes, so confirm inline */}
            {confirmClear ? (
              <div className="flex gap-2">
                <button onClick={() => { update((p) => ({ ...p, children: [] })); setSelId(null); setConfirmClear(false); }} className="flex-1 rounded-md bg-red-600 py-1.5 text-xs font-medium text-white hover:bg-red-700">Yes, clear page</button>
                <button onClick={() => setConfirmClear(false)} className="flex-1 rounded-md border border-gray-200 py-1.5 text-xs text-gray-700 hover:bg-gray-50">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmClear(true)} className="w-full rounded-md border border-red-200 py-1.5 text-xs text-red-600 hover:bg-red-50">Clear page</button>
            )}
          </div>
        )}
      </div>

      {/* left rail + panel */}
      <div className="absolute left-3 top-[76px] flex gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-fit flex-col gap-1 rounded-xl bg-white p-1.5 shadow-md ring-1 ring-black/5">
          {railBtn("sections", "sections", "Sections")}
          {railBtn("components", "plus", "Components")}
          {railBtn("layers", "layers", "Layers")}
          {railBtn("assets", "image", "Assets")}
        </div>
        {leftOpen && (
          <div className="w-[260px] rounded-xl bg-white p-3 shadow-md ring-1 ring-black/5" style={{ maxHeight: "calc(100vh - 150px)" }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold capitalize">{leftTab}</span>
              <button onClick={() => setLeftOpen(false)} className="text-gray-400 hover:text-gray-700"><Ico n="left" size={16} /></button>
            </div>
            {leftTab === "sections" && <SectionsPanel onAdd={addSection} onDragStateChange={setDraggingComponent} />}
            {leftTab === "components" && <ComponentsPanel onAdd={addAfterSelection} onDragStateChange={setDraggingComponent} />}
            {leftTab === "layers" && (
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 210px)" }}>
                <button onClick={() => select(PAGE_ID)} className={`mb-1 flex w-full items-center gap-1 rounded-md px-1 py-1 text-left text-xs font-medium ${selId === PAGE_ID ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}><Ico n="page" size={14} />Page</button>
                {page.children.map((n) => <LayerItem key={n.id} n={n} depth={1} api={api} selectedId={selId} />)}
                {!page.children.length && <p className="p-2 text-xs text-gray-500">Nothing here yet.</p>}
              </div>
            )}
            {leftTab === "assets" && <AssetsPanel assets={assets} setAssets={setAssets} onUse={useAsset} />}
          </div>
        )}
      </div>

      {/* top right */}
      <div className="absolute right-3 top-3 flex h-[52px] items-center gap-2 rounded-xl bg-white px-2 shadow-md ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex">
          <button onClick={() => setPreview("desktop")} className="rounded-l-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Preview</button>
          <button onClick={() => setPop(pop === "previewMenu" ? null : "previewMenu")} className="rounded-r-lg border border-l-0 border-gray-200 px-2 text-gray-500 hover:bg-gray-50"><Ico n="down" size={14} /></button>
          {pop === "previewMenu" && (
            <div className="absolute right-0 top-[40px] w-36 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5">
              {Object.keys(DEVICES).map((d) => <button key={d} onClick={() => { setPreview(d); setPop(null); }} className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50">{DEVICES[d].label}</button>)}
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setPop(pop === "publish" ? null : "publish")} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">Publish</button>
          {pop === "publish" && (
            <div className="absolute right-0 top-[48px] w-[260px] space-y-2 rounded-xl bg-white p-3 shadow-lg ring-1 ring-black/5">
              <div className="text-[13px] font-semibold">Publish</div>
              <button onClick={() => download(slug + ".html", exportHTML(page), "text/html")} className="w-full rounded-md bg-gray-900 py-2 text-xs font-medium text-white">Download HTML page</button>
              <button onClick={() => download(slug + ".json", JSON.stringify(page, null, 2), "application/json")} className="w-full rounded-md border border-gray-200 py-2 text-xs hover:bg-gray-50">Download JSON</button>
              <button onClick={copyJSON} className="w-full rounded-md border border-gray-200 py-2 text-xs hover:bg-gray-50">Copy JSON</button>
              <button onClick={() => importRef.current.click()} className="w-full rounded-md border border-gray-200 py-2 text-xs hover:bg-gray-50">Import JSON</button>
              <input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => { if (e.target.files[0]) importJSON(e.target.files[0]); e.target.value = ""; }} />
              <p className="text-[11px] text-gray-500">The HTML file uses your styles, mobile/tablet overrides and hover states. Tailwind (via CDN) is included only if you used Tailwind classes.</p>
            </div>
          )}
        </div>
      </div>

      {/* bottom bar: undo / redo / zoom / fit */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl bg-white p-1.5 shadow-md ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
        <IconBtn n="undo" title="Undo (Ctrl+Z)" onClick={undo} />
        <IconBtn n="redo" title="Redo (Ctrl+Shift+Z)" onClick={redo} />
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <select value={Math.round(zoom)} onChange={(e) => zoomAt(+e.target.value, window.innerWidth / 2, window.innerHeight / 2)} className="rounded-md border border-gray-200 px-2 py-1 text-xs">
          {[...new Set([10, 25, 33, 50, 75, 100, 125, 150, 200, 300, 400, Math.round(zoom)])].sort((a, b) => a - b).map((z) => <option key={z} value={z}>{z}%</option>)}
        </select>
        <button onClick={fit} className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">Fit</button>
      </div>

      {/* right panel */}
      {selNode && (
        <div className="pointer-events-none absolute inset-0" onClick={(e) => e.stopPropagation()}>
          <RightPanel key={selNode.id} node={selNode} device={activeDevice} stateTab={stateTab} setStateTab={setStateTab} api={api} />
        </div>
      )}

      {/* Show Devices / Preview Dimensions popover */}
      {dimPop && (
        <div className="fixed z-40" style={{ left: Math.min(dimPop.x, window.innerWidth - 260), top: dimPop.y }} onClick={(e) => e.stopPropagation()}>
          {dimPop.kind === "devices" ? (
            <div className="w-[200px] rounded-xl bg-white p-3 shadow-lg ring-1 ring-black/5">
              <div className="mb-2 text-[13px] font-semibold">Show Devices</div>
              {Object.keys(DEVICES).map((d) => (
                <label key={d} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" checked={show[d]} onChange={(e) => setShow({ ...show, [d]: e.target.checked })} />{DEVICES[d].label}</label>
              ))}
            </div>
          ) : (
            <DimPanel d={dimPop.d} width={widths[dimPop.d]} onClose={() => setDimPop(null)}
              onChange={(w) => setWidths((x) => ({ ...x, [dimPop.d]: w }))} />
          )}
        </div>
      )}

      {/* full preview */}
      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 bg-white px-4 py-2 shadow">
            <span className="text-sm font-semibold">Preview</span>
            <div className="w-64"><Seg value={preview} options={Object.keys(DEVICES).map((d) => ({ value: d, label: DEVICES[d].label }))} onChange={setPreview} /></div>
            <button onClick={() => setPreview(null)} className="ml-auto rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white">Close</button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <Ctx.Provider value={{ preview: true }}>
              <div className="rp-frame mx-auto shadow-lg" style={{ maxWidth: "100%", minHeight: "100%", ...pageStyleFor(preview), width: Math.min(widths[preview], 1600) }}>
                <style>{`.rp-frame *{box-sizing:border-box}.rp-frame :where(h1,h2,h3,h4,h5,h6,p,ul,hr){margin:0}.rp-frame button{font-family:inherit}`}</style>
                {page.children.map((n) => <Render key={n.id} n={n} device={preview} />)}
              </div>
            </Ctx.Provider>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div key={toast.id} className="pointer-events-none fixed left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow-lg" style={{ bottom: 76, zIndex: 60 }}>{toast.message}</div>
      )}
    </div>
  );
}