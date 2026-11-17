import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import {
  ArrowDown, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle,
  Columns2, Copy, Eye, FileText, Grid2X2, Heading1, Heading2, Heading3,
  Image, Images, Layers3, List, Minus, Monitor, MousePointer2, PanelsTopLeft, Play,
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
  column: Columns2, page: FileText, heading: Heading1, slider: Images,
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

/* ------------------------------ slider ----------------------------- */
const SLIDER_DEFAULTS = { fit: "cover", arrows: true, dots: true, loop: true, autoplay: false, interval: 4000, perView: 1, perViewTablet: 1, perViewMobile: 1, gap: 0 };
/* how many slides are visible at once on a device (1 to 6) */
const perViewOf = (p, device) => {
  const raw = device === "mobile" ? p.perViewMobile : device === "tablet" ? p.perViewTablet : p.perView;
  return Math.max(1, Math.min(6, parseInt(raw, 10) || 1));
};
/* "16 / 9" -> 56.25 (padding-top % that reserves the slider height without relying on aspect-ratio) */
const ratioPct = (r) => {
  const m = /^\s*([\d.]+)\s*(?:\/\s*([\d.]+))?\s*$/.exec(String(r || "16 / 9"));
  const w = m ? +m[1] : 16, h = m && m[2] ? +m[2] : m ? 1 : 9;
  return w > 0 && h > 0 ? (h / w) * 100 : 56.25;
};
const newSlide = (i) => ({ src: ph(1200, 675, "Slide " + i), alt: "Slide " + i, caption: "" });
const buildSlider = () =>
  node("slider", "Slider", { ...SLIDER_DEFAULTS, slides: [1, 2, 3].map(newSlide) }, {
    width: "100%", aspectRatio: "16 / 9", borderRadius: "12px",
  });

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
  { key: "slider", label: "Slider", glyph: "slider", build: buildSlider },
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

/* ======================================================================
   SHOPIFY / STORE COMPONENTS
   Paste this block in your editor file RIGHT AFTER the `COMPONENTS = [...]`
   array (and after the SECTIONS block is fine too). It only uses helpers
   that already exist in the file (node, T, H, Btn, Box, Row, Img, Stars,
   grid, ph), so the renderer, export, undo/redo etc. need NO changes.
   Every item becomes a normal, editable, draggable, countable component.
   ====================================================================== */

const colCell = () => Box("Column", [], { padding: "16px", border: "1px dashed #d1d5db" });
const BORDER = "1px solid #d1d5db";

/* small building blocks */
const optionBtn = (t, active) =>
  Btn(t, {
    padding: "10px 18px", fontSize: "14px", borderRadius: "8px",
    background: active ? "#111827" : "#ffffff", color: active ? "#ffffff" : "#111827", border: BORDER,
  });
const optionList = (name, label, opts) =>
  Box(name, [
    T(label, { fontWeight: "600", color: "#111827", fontSize: "14px" }),
    node("container", "Options", { tag: "div" }, { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" },
      opts.map((o, i) => optionBtn(o, i === 0))),
  ], { gap: "8px" });
const dropdown = (name, label, value) =>
  Box(name, [
    T(label, { fontWeight: "600", color: "#111827", fontSize: "14px" }),
    Row("Select", [T(value, { color: "#111827", fontSize: "14px" }), T("▾", { color: "#6b7280" })],
      { justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: BORDER, borderRadius: "8px", background: "#ffffff" },
      { flexDirection: "row" }),
  ], { gap: "8px" });
const swatches = (name, colors) =>
  Row(name, colors.map((c, i) =>
    node("circle", "Swatch", {}, { width: "28px", height: "28px", borderRadius: "9999px", background: c, border: i === 0 ? "2px solid #111827" : "1px solid #d1d5db", cursor: "pointer" })),
  { gap: "10px", alignItems: "center", width: "auto" }, { flexDirection: "row" });
const qtySelector = () =>
  Row("Quantity Selector", [
    T("−", { fontSize: "20px", textAlign: "center", color: "#111827", width: "40px", cursor: "pointer" }),
    T("1", { fontSize: "16px", textAlign: "center", color: "#111827", width: "40px" }),
    T("+", { fontSize: "20px", textAlign: "center", color: "#111827", width: "40px", cursor: "pointer" }),
  ], { width: "fit-content", alignItems: "center", border: BORDER, borderRadius: "8px", padding: "8px 0", gap: "0px" }, { flexDirection: "row" });
const thumbs = (n = 4) =>
  Row("Thumbnails", Array.from({ length: n }, (_, i) => Img(ph(160, 160, String(i + 1)), { width: "64px", height: "64px", borderRadius: "8px" })),
    { gap: "8px" }, { flexDirection: "row" });
const productTitle = () => H("Product title", 32, {}, {}, "h1");
const productPrice = () => T("$19.99", { fontSize: "24px", fontWeight: "700", color: "#111827" });
const compareAt = () => T("$29.99", { fontSize: "24px", fontWeight: "700", color: "#2563eb", textDecoration: "line-through" });
const productDesc = () => T("Short description of what the product does and who it is for.");
const addToCart = () => Btn("Add to Cart", { width: "100%", background: "#2563eb" });
const buyNow = () => Btn("Buy Now", { width: "100%", background: "#2563eb" });
const ratingLine = (brand, reviews = "1,234") =>
  Row(brand + " Rating", [Stars(5), T(`4.9 (${reviews})`, { fontSize: "14px" })], { alignItems: "center", gap: "8px", width: "auto" }, { flexDirection: "row" });
const reviewsWidget = (brand) =>
  Box(brand + " Reviews", [
    H("Customer reviews", 28, {}, { fontSize: "24px" }, "h2"),
    ratingLine(brand, "2,184"),
    ...[1, 2, 3].map((i) =>
      Box("Review", [Stars(5), T("“Short, specific quote about a real result.”", { color: "#111827" }), T("Customer " + i, { fontSize: "14px", fontWeight: "600" })],
        { padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", gap: "8px" })),
    T(`Powered by ${brand}`, { fontSize: "12px", color: "#9ca3af" }),
  ], { padding: "24px", gap: "16px" });
const planList = () =>
  Box("Selling Plans", [
    ...["One-time purchase", "Subscribe & save 15%", "Subscribe & save 20% (quarterly)"].map((t, i) =>
      Row("Plan", [node("circle", "Radio", {}, { width: "16px", height: "16px", borderRadius: "9999px", border: "2px solid #111827", background: i === 1 ? "#111827" : "#ffffff", flexShrink: "0" }),
        T(t, { color: "#111827", fontSize: "14px" })],
        { alignItems: "center", gap: "10px", padding: "12px", border: BORDER, borderRadius: "8px" }, { flexDirection: "row" })),
  ], { gap: "8px" });
const buyBox = (extra = []) =>
  Box("Buy Box", [
    productTitle(), ratingLine("Reviews"),
    Row("Price", [productPrice(), compareAt()], { gap: "12px", alignItems: "center", width: "auto" }, { flexDirection: "row" }),
    productDesc(), ...extra, qtySelector(), addToCart(), buyNow(),
  ], { gap: "14px" });
const bundleBuilder = (name) =>
  Box(name, [
    H("Build your bundle", 28, {}, { fontSize: "24px" }, "h2"),
    grid("Bundle Items", 3, [1, 2, 3].map((i) =>
      Box("Bundle Item", [Img(ph(400, 400, "Product " + i), { height: "auto", aspectRatio: "1 / 1" }), T("Product " + i, { fontWeight: "600", color: "#111827" }), T("$19.99"), Btn("Add", { padding: "8px 16px", fontSize: "14px" })],
        { gap: "8px", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "12px" }))),
    Btn("Add bundle to cart", { width: "100%", background: "#2563eb" }),
  ], { padding: "24px", gap: "16px" });

/* the component definitions. glyph = key of the ICONS map */
const SHOPIFY_COMPONENTS = [
  /* extra layout columns */
  { key: "col12", label: "1/2 Columns", glyph: "column", build: () => grid("1/2 Columns", 2, [colCell(), colCell()], { gridTemplateColumns: "1fr 2fr" }) },
  { key: "col21", label: "2/1 Columns", glyph: "column", build: () => grid("2/1 Columns", 2, [colCell(), colCell()], { gridTemplateColumns: "2fr 1fr" }) },
  { key: "col4", label: "4 Columns", glyph: "column", build: () => grid("4 Columns", 4, [1, 2, 3, 4].map(colCell)) },

  /* product blocks */
  { key: "buybox", label: "Buy Box", glyph: "container", build: () => buyBox() },
  { key: "productcollection", label: "Product Collection", glyph: "grid", build: () =>
      grid("Product Collection", 3, [1, 2, 3].map((i) =>
        Box("Product Card", [Img(ph(500, 500, "Product " + i), { height: "auto", aspectRatio: "1 / 1" }), T("Product " + i, { fontWeight: "600", color: "#111827" }), T("$19.99")], { gap: "8px" }))) },
  { key: "buyboxcarousel", label: "Buy Box with Carousel", glyph: "slider", build: () =>
      Row("Buy Box with Carousel", [
        Box("Gallery", [buildSlider(), thumbs()], { flex: "1" }),
        Box("Details", buyBox().children, { flex: "1", justifyContent: "center" }),
      ], { gap: "32px", padding: "32px" }, { gap: "20px", padding: "16px" }) },
  { key: "buyboxswatches", label: "Buy Box with Swatches", glyph: "container", build: () =>
      buyBox([T("Color", { fontWeight: "600", color: "#111827", fontSize: "14px" }), swatches("Swatches", ["#111827", "#2563eb", "#dc2626", "#16a34a"])]) },
  { key: "buyboxvariants", label: "Buy Box with Variants", glyph: "container", build: () =>
      buyBox([optionList("Size", "Size", ["S", "M", "L", "XL"])]) },
  { key: "buynow", label: "Buy Now Button", glyph: "button", build: buyNow },
  { key: "addtocart", label: "Add To Cart Button", glyph: "button", build: addToCart },
  { key: "dynamiccheckout", label: "Dynamic Checkout", glyph: "button", build: () =>
      Btn("Pay", { width: "100%", background: "#5a31f4" }) },
  { key: "buywithprime", label: "Buy With Prime Button", glyph: "button", build: () =>
      Btn("Buy with prime", { width: "100%", background: "#1a98ff", color: "#ffffff" }) },
  { key: "productqtyselector", label: "Product Quantity Selector", glyph: "container", build: qtySelector },
  { key: "productselection", label: "Product Selection", glyph: "list", build: () =>
      Box("Product Selection", [dropdown("Product", "Product", "Select a product"), qtySelector()], { gap: "12px" }) },
  { key: "productimagegrid", label: "Product Image Grid", glyph: "grid", build: () =>
      grid("Product Image Grid", 2, [1, 2, 3, 4].map((i) => Img(ph(500, 500, "Image " + i), { height: "auto", aspectRatio: "1 / 1" })), { gap: "12px" }) },
  { key: "productdescription", label: "Product Description", glyph: "text", build: productDesc },
  { key: "producttitle", label: "Product Title", glyph: "text", build: productTitle },
  { key: "productquantity", label: "Product Quantity", glyph: "text", build: () => T("Qty 1", { fontWeight: "700", color: "#2563eb", fontSize: "20px" }) },
  { key: "productvariantimage", label: "Product Variant Image", glyph: "image", build: () => Img(ph(600, 600, "Variant image"), { height: "auto", aspectRatio: "1 / 1" }) },
  { key: "productprice", label: "Product Price", glyph: "text", build: productPrice },
  { key: "compareatprice", label: "Compare At Price", glyph: "text", build: compareAt },
  { key: "quantityselector", label: "Quantity Selector", glyph: "container", build: qtySelector },
  { key: "circularoptionlist", label: "Circular Option List", glyph: "circle", build: () => swatches("Circular Option List", ["#111827", "#2563eb", "#dc2626", "#16a34a", "#f59e0b"]) },
  { key: "productimages", label: "Product Images", glyph: "slider", build: () =>
      Box("Product Images", [Img(ph(800, 800, "Product image"), { height: "auto", aspectRatio: "1 / 1" }), thumbs()], { gap: "12px" }) },
  { key: "paymentterms", label: "Payment Terms", glyph: "text", build: () =>
      T("Pay in 4 interest-free installments of $5.00 with Shop Pay", { fontSize: "14px", color: "#4b5563" }) },

  /* variants / options */
  { key: "variantlist", label: "Variant List", glyph: "list", build: () => optionList("Variant List", "Variant", ["Small", "Medium", "Large"]) },
  { key: "variantdropdown", label: "Variant Dropdown", glyph: "list", build: () => dropdown("Variant Dropdown", "Variant", "Select a variant") },
  { key: "variantlistreviews", label: "Variant List with Reviews", glyph: "list", build: () =>
      Box("Variant List with Reviews", [optionList("Variant List", "Variant", ["Small", "Medium", "Large"]), ratingLine("Reviews")], { gap: "12px" }) },
  { key: "optionlist", label: "Option List", glyph: "list", build: () => optionList("Option List", "Option", ["Option 1", "Option 2", "Option 3"]) },
  { key: "optiondropdown", label: "Option Dropdown", glyph: "list", build: () => dropdown("Option Dropdown", "Option", "Select an option") },
  { key: "optionlistreviews", label: "Option List with Reviews", glyph: "list", build: () =>
      Box("Option List with Reviews", [optionList("Option List", "Option", ["Option 1", "Option 2", "Option 3"]), ratingLine("Reviews")], { gap: "12px" }) },

  /* selling plans / subscriptions */
  { key: "sellingplanlist", label: "Selling Plan List", glyph: "list", build: planList },
  { key: "sellingplandropdown", label: "Selling Plan Dropdown", glyph: "list", build: () => dropdown("Selling Plan Dropdown", "Delivery", "Subscribe & save 15%") },
  { key: "sellingplanlistprice", label: "Selling Plan List with Price", glyph: "list", build: () =>
      Box("Selling Plan List with Price", [planList(), Row("Price", [productPrice(), compareAt()], { gap: "12px", alignItems: "center", width: "auto" }, { flexDirection: "row" })], { gap: "12px" }) },
  { key: "subscribesave", label: "Subscribe & Save", glyph: "container", build: () =>
      Box("Subscribe & Save", [T("One time", { fontSize: "12px", color: "#9ca3af", textAlign: "center" }), Btn("Subscribe", { width: "100%", background: "#2563eb" })],
        { padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", gap: "8px" }) },

  /* bundles */
  { key: "collectionbundle", label: "Collection Bundle Builder", glyph: "grid", build: () => bundleBuilder("Collection Bundle Builder") },
  { key: "pdpbundle", label: "PDP Bundle Builder", glyph: "grid", build: () => bundleBuilder("PDP Bundle Builder") },

  /* third-party apps (visual placeholders, wire to the real app later) */
  { key: "stayai", label: "Stay Ai Subscription", glyph: "container", build: () =>
      Box("Stay Ai Subscription", [T("♥ Subscribe & save", { fontWeight: "700", color: "#e11d48", fontSize: "18px" }), planList()], { gap: "12px" }) },
  { key: "okendoreviews", label: "Okendo Reviews", glyph: "rating", build: () => reviewsWidget("Okendo") },
  { key: "okendorating", label: "Okendo Product Rating", glyph: "rating", build: () => ratingLine("Okendo") },
  { key: "junipreviews", label: "Junip Product Reviews", glyph: "rating", build: () => reviewsWidget("Junip") },
  { key: "juniprating", label: "Junip Product Rating", glyph: "rating", build: () => ratingLine("Junip") },
  { key: "yotporeviews", label: "Yotpo Reviews", glyph: "rating", build: () => reviewsWidget("Yotpo") },
  { key: "yotporating", label: "Yotpo Product Rating", glyph: "rating", build: () => ratingLine("Yotpo") },
  { key: "looxreviews", label: "Loox Reviews", glyph: "rating", build: () => reviewsWidget("Loox") },
  { key: "looxrating", label: "Loox Product Rating", glyph: "rating", build: () => ratingLine("Loox") },
  { key: "judgemereviews", label: "Judge.me Reviews", glyph: "rating", build: () => reviewsWidget("Judge.me") },
  { key: "judgemerating", label: "Judge.me Product Rating", glyph: "rating", build: () => ratingLine("Judge.me") },
  { key: "stampedreviews", label: "Stamped Reviews", glyph: "rating", build: () => reviewsWidget("Stamped") },
  { key: "stampedrating", label: "Stamped Product Rating", glyph: "rating", build: () => ratingLine("Stamped") },
  { key: "klaviyoreviews", label: "Klaviyo Reviews", glyph: "rating", build: () => reviewsWidget("Klaviyo") },
  { key: "klaviyorating", label: "Klaviyo Product Rating", glyph: "rating", build: () => ratingLine("Klaviyo") },
];

/* register them once (skips keys that already exist, safe on hot reload) */
SHOPIFY_COMPONENTS.forEach((c) => { if (!COMPONENTS.some((x) => x.key === c.key)) COMPONENTS.push(c); });

/* ======================================================================
   BLOCK 2: UI / INTERACTIVE / EMBED / APP COMPONENTS
   Paste this RIGHT AFTER the first block (after the line
   `SHOPIFY_COMPONENTS.forEach(...)`). It uses the same helpers
   (node, T, H, Btn, Box, Row, Img, Stars, grid, ph, buildSlider, BORDER).
   No renderer changes needed. These are static visual versions, so they can
   be dragged, styled, hidden per device, exported and counted like any other.
   ====================================================================== */

const dot = (on) => node("circle", "Dot", {}, { width: "10px", height: "10px", borderRadius: "9999px", background: on ? "#2563eb" : "#d1d5db", flexShrink: "0" });
const arrowBtn = (name, glyph) =>
  node("button", name, { text: glyph, action: { type: "none", value: "" } },
    { width: "40px", height: "40px", borderRadius: "9999px", border: "none", background: "#2563eb", color: "#ffffff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0" });
const placeholderBox = (name, title, hint, extra = {}) =>
  Box(name, [T(title, { fontWeight: "700", color: "#111827", textAlign: "center" }), T(hint, { fontSize: "13px", color: "#6b7280", textAlign: "center" })],
    { padding: "32px", border: "1px dashed #9ca3af", borderRadius: "12px", background: "#f9fafb", alignItems: "center", justifyContent: "center", gap: "6px", minHeight: "120px", ...extra });
const panel = (title, body) =>
  Box("Panel", [H(title, 18, { fontWeight: "600" }, { fontSize: "18px" }, "h3"), T(body)], { gap: "8px", padding: "16px 0", borderBottom: "1px solid #e5e7eb" });
const slideCard = (i) => Img(ph(900, 600, "Slide " + i), { height: "auto", aspectRatio: "3 / 2" });
const carouselShell = (name, perView, withDots = true) => {
  const s = buildSlider();
  s.name = name;
  s.props.perView = perView;
  s.props.perViewTablet = Math.min(perView, 2);
  s.props.perViewMobile = 1;
  s.props.gap = perView > 1 ? 16 : 0;
  s.props.slides = [1, 2, 3, 4, 5].map(newSlide);
  s.props.dots = withDots;
  return s;
};

const SHOPIFY_COMPONENTS_2 = [
  /* ---- UI elements ---- */
  { key: "spinner", label: "Spinner", glyph: "circle", build: () =>
      node("circle", "Spinner", {}, { width: "40px", height: "40px", borderRadius: "9999px", background: "transparent", border: "4px solid #dbeafe", borderTopColor: "#2563eb" }) },
  { key: "ticker", label: "Ticker", glyph: "text", build: () =>
      Row("Ticker", ["Free shipping", "30-day returns", "Secure checkout", "Free shipping", "30-day returns"].map((t) => T(t + "  •", { fontWeight: "600", color: "#ffffff", whiteSpace: "nowrap" })),
        { background: "#2563eb", padding: "12px 16px", gap: "24px", overflow: "hidden", alignItems: "center" }, { flexDirection: "row" }) },
  { key: "switch", label: "Switch", glyph: "container", build: () =>
      Row("Switch", [node("circle", "Knob", {}, { width: "20px", height: "20px", borderRadius: "9999px", background: "#ffffff" })],
        { width: "44px", height: "24px", padding: "2px", background: "#2563eb", borderRadius: "9999px", justifyContent: "flex-end", alignItems: "center", cursor: "pointer" }, { flexDirection: "row" }) },
  { key: "radio", label: "Radio Button", glyph: "circle", build: () =>
      Row("Radio Button", [
        node("circle", "Radio", {}, { width: "20px", height: "20px", borderRadius: "9999px", border: "6px solid #2563eb", background: "#ffffff", flexShrink: "0" }),
        T("Option", { color: "#111827" }),
      ], { alignItems: "center", gap: "10px", width: "auto" }, { flexDirection: "row" }) },
  { key: "collapsible", label: "Collapsible", glyph: "container", build: () =>
      Box("Collapsible", [
        Row("Header", [H("Collapsible title", 18, { fontWeight: "600" }, { fontSize: "18px" }, "h3"), T("▾", { color: "#6b7280" })], { justifyContent: "space-between", alignItems: "center", cursor: "pointer" }, { flexDirection: "row" }),
        T("Hidden content goes here. Replace it with your own text."),
      ], { padding: "16px", border: "1px solid #e5e7eb", borderRadius: "8px", gap: "10px" }) },
  { key: "tabstop", label: "Tabs (Top)", glyph: "container", build: () =>
      Box("Tabs (Top)", [
        Row("Tab Bar", ["Tab 1", "Tab 2", "Tab 3"].map((t, i) =>
          T(t, { padding: "10px 16px", fontWeight: "600", color: i === 0 ? "#2563eb" : "#6b7280", borderBottom: i === 0 ? "2px solid #2563eb" : "2px solid transparent", cursor: "pointer" })),
          { gap: "0px", borderBottom: "1px solid #e5e7eb" }, { flexDirection: "row" }),
        Box("Tab Content", [T("Content for the first tab.")], { padding: "16px 0" }),
      ], { gap: "0px" }) },
  { key: "tabsleft", label: "Tabs (Left)", glyph: "container", build: () =>
      Row("Tabs (Left)", [
        Box("Tab List", ["Tab 1", "Tab 2", "Tab 3"].map((t, i) =>
          T(t, { padding: "10px 16px", fontWeight: "600", color: i === 0 ? "#2563eb" : "#6b7280", borderLeft: i === 0 ? "2px solid #2563eb" : "2px solid #e5e7eb", cursor: "pointer" })),
          { width: "160px", gap: "0px", flexShrink: "0" }),
        Box("Tab Content", [T("Content for the first tab.")], { flex: "1", padding: "0 16px" }),
      ], { gap: "16px" }, { gap: "12px" }) },
  { key: "accordion", label: "Accordion", glyph: "list", build: () =>
      Box("Accordion", ["First question", "Second question", "Third question"].map((q) =>
        Box("Accordion Item", [
          Row("Header", [H(q, 18, { fontWeight: "600" }, { fontSize: "18px" }, "h3"), T("▾", { color: "#6b7280" })], { justifyContent: "space-between", alignItems: "center", cursor: "pointer" }, { flexDirection: "row" }),
          T("Answer text goes here."),
        ], { padding: "16px 0", borderBottom: "1px solid #e5e7eb", gap: "8px" })), { gap: "0px" }) },
  { key: "countdown", label: "Countdown Timer", glyph: "text", build: () =>
      Row("Countdown Timer", [["19", "Hours"], ["20", "Mins"], ["45", "Secs"]].map(([n, l]) =>
        Box("Unit", [T(n, { fontSize: "36px", fontWeight: "700", color: "#2563eb", textAlign: "center", lineHeight: "1" }), T(l, { fontSize: "12px", color: "#6b7280", textAlign: "center" })],
          { alignItems: "center", gap: "4px", padding: "12px 16px", background: "#eff6ff", borderRadius: "8px", width: "auto" })),
        { gap: "12px", justifyContent: "center" }, { flexDirection: "row" }) },
  { key: "popup", label: "Popup", glyph: "container", build: () =>
      Box("Popup", [
        T("✕", { textAlign: "right", color: "#6b7280", cursor: "pointer" }),
        H("Get 10% off", 28, { textAlign: "center" }, { fontSize: "24px" }),
        T("Join our list and save on your first order.", { textAlign: "center" }),
        Btn("Claim offer", { width: "100%" }),
      ], { maxWidth: "420px", margin: "0 auto", padding: "24px", background: "#ffffff", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,.2)", gap: "12px" }) },
  { key: "tooltip", label: "Tooltip", glyph: "text", build: () =>
      Box("Tooltip", [
        T("Helpful hint appears here", { background: "#111827", color: "#ffffff", fontSize: "13px", padding: "8px 12px", borderRadius: "6px", width: "fit-content" }),
        T("▼", { color: "#111827", fontSize: "10px", paddingLeft: "16px", lineHeight: "1" }),
      ], { gap: "0px", width: "fit-content" }) },

  /* ---- Carousels ---- */
  { key: "carouselsingle", label: "Single-Slide Carousel", glyph: "slider", build: () => carouselShell("Single-Slide Carousel", 1) },
  { key: "carouselmulti", label: "Multi-slide Carousel", glyph: "slider", build: () => carouselShell("Multi-slide Carousel", 3) },
  { key: "carouselcentered", label: "Centered Carousel", glyph: "slider", build: () => {
      const s = carouselShell("Centered Carousel", 3);
      s.s.base.maxWidth = "960px"; s.s.base.margin = "0 auto";
      return s;
    } },
  { key: "carouselnext", label: "Carousel Next", glyph: "button", build: () => arrowBtn("Carousel Next", "›") },
  { key: "carouselprev", label: "Carousel Previous", glyph: "button", build: () => arrowBtn("Carousel Previous", "‹") },
  { key: "carouselindicators", label: "Carousel Indicators", glyph: "circle", build: () =>
      Row("Carousel Indicators", [dot(true), dot(false), dot(false)], { gap: "8px", justifyContent: "center", alignItems: "center" }, { flexDirection: "row" }) },
  { key: "carouselcounter", label: "Carousel Panels Counter", glyph: "text", build: () =>
      T("1 / 2", { fontSize: "24px", fontWeight: "700", color: "#2563eb", textAlign: "center" }) },
  { key: "beforeafter", label: "Before/After Slider", glyph: "slider", build: () =>
      Row("Before/After Slider", [
        Box("Before", [Img(ph(600, 600, "Before"), { height: "auto", aspectRatio: "1 / 1" }), T("Before", { textAlign: "center", fontWeight: "600", color: "#111827" })], { flex: "1", gap: "8px" }),
        Box("After", [Img(ph(600, 600, "After"), { height: "auto", aspectRatio: "1 / 1" }), T("After", { textAlign: "center", fontWeight: "600", color: "#111827" })], { flex: "1", gap: "8px" }),
      ], { gap: "16px" }, { gap: "12px" }) },

  /* ---- social / media embeds (placeholders) ---- */
  { key: "tiktok", label: "TikTok", glyph: "image", build: () => placeholderBox("TikTok", "TikTok embed", "Paste your TikTok video URL in the Config tab.", { background: "#111827", color: "#ffffff" }) },
  { key: "klaviyoform", label: "Klaviyo Form Embed", glyph: "container", build: () =>
      Box("Klaviyo Form Embed", [H("Join our newsletter", 24, { textAlign: "center" }), T("Enter your email", { padding: "12px", border: BORDER, borderRadius: "8px", color: "#9ca3af" }), Btn("Subscribe", { width: "100%", background: "#2563eb" })],
        { padding: "24px", background: "#eef2ff", borderRadius: "12px", gap: "12px" }) },
  { key: "googlemaps", label: "Google Maps Embed", glyph: "image", build: () =>
      placeholderBox("Google Maps Embed", "📍 Google Maps", "Map embed placeholder. Add your location in Config.", { minHeight: "320px" }) },

  /* ---- Shopify / theme blocks ---- */
  { key: "shopifysection", label: "Section", glyph: "container", build: () =>
      placeholderBox("Shopify Section", "Shopify Section", "Renders a theme section from your Shopify store.") },
  { key: "appthemeblock", label: "App and Theme Block", glyph: "container", build: () =>
      placeholderBox("App and Theme Block", "App / Theme Block", "Renders an app or theme block from your Shopify store.") },
  { key: "liquid", label: "Liquid", glyph: "text", build: () =>
      placeholderBox("Liquid", "{ } Liquid", "Liquid code runs on Shopify only. Not rendered in this editor.", { fontFamily: "monospace" }) },
  { key: "customcode", label: "Custom Code", glyph: "text", build: () =>
      placeholderBox("Custom Code", "</> Custom Code", "Custom HTML / CSS / JS block. Not rendered in this editor.", { fontFamily: "monospace" }) },

  /* ---- third-party apps (placeholders) ---- */
  { key: "knocommerce", label: "KnoCommerce", glyph: "container", build: () =>
      placeholderBox("KnoCommerce", "KnoCommerce survey", "Post-purchase survey from KnoCommerce.") },
  { key: "rebuybundles", label: "Rebuy Dynamic Bundles", glyph: "grid", build: () =>
      Box("Rebuy Dynamic Bundles", [
        Row("Bundle", [1, 2].map((i) => Img(ph(300, 300, "Product " + i), { width: "120px", height: "120px", flexShrink: "0" })), { gap: "12px", alignItems: "center" }, { flexDirection: "row" }),
        T("Total: $20.00", { fontWeight: "600", color: "#111827" }),
        Btn("Add Bundle to Cart", { width: "100%", background: "#7c3aed" }),
      ], { padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", gap: "12px" }) },
  { key: "rebuyhome", label: "Rebuy Home Page Widget", glyph: "grid", build: () =>
      Box("Rebuy Home Page Widget", [H("Recommended for you", 24, {}, { fontSize: "20px" }), grid("Products", 3, [1, 2, 3].map((i) =>
        Box("Product", [Img(ph(400, 400, "Product " + i), { height: "auto", aspectRatio: "1 / 1" }), T("$19.99"), Btn("Add to cart", { background: "#7c3aed", width: "100%", padding: "10px" })], { gap: "8px" })))], { gap: "16px" }) },
  { key: "rebuyproductadd", label: "Rebuy Product Add-ons", glyph: "list", build: () =>
      Box("Rebuy Product Add-ons", [T("Add to your order", { fontWeight: "600", color: "#111827" }),
        Row("Add-on", [Img(ph(120, 120, ""), { width: "56px", height: "56px", flexShrink: "0" }), T("Add-on product", { flex: "1", color: "#111827" }), Btn("Add", { background: "#7c3aed", padding: "8px 16px" })], { alignItems: "center", gap: "12px" }, { flexDirection: "row" })],
        { padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", gap: "12px" }) },
  { key: "rebuyproductpage1", label: "Rebuy Product Page Widget", glyph: "grid", build: () =>
      Box("Rebuy Product Page Widget", [T("You may also like", { fontWeight: "700", color: "#111827" }), grid("Products", 2, [1, 2].map((i) =>
        Box("Product", [Img(ph(300, 300, "Product " + i), { height: "auto", aspectRatio: "1 / 1" }), Btn("Add", { background: "#7c3aed", width: "100%", padding: "10px" })], { gap: "8px" })))], { gap: "12px" }) },
  { key: "rebuyproductpage2", label: "Rebuy Product Page Upsell", glyph: "list", build: () =>
      Box("Rebuy Product Page Upsell", [T("Frequently bought together", { fontWeight: "700", color: "#111827" }),
        Row("Upsell", [Img(ph(120, 120, ""), { width: "56px", height: "56px", flexShrink: "0" }), T("Upsell product", { flex: "1", color: "#111827" }), T("$9.99", { fontWeight: "600", color: "#111827" })], { alignItems: "center", gap: "12px" }, { flexDirection: "row" }),
        Btn("Upgrade", { background: "#7c3aed", width: "100%" })], { padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", gap: "12px" }) },
];

SHOPIFY_COMPONENTS_2.forEach((c) => { if (!COMPONENTS.some((x) => x.key === c.key)) COMPONENTS.push(c); });

/* ----------------------------- sections ---------------------------- */
const faq = (q, a) => Box("FAQ Item", [H(q, 18, { fontWeight: "600" }, { fontSize: "18px" }, "h3"), T(a), node("hr", "Divider", {}, { width: "100%", height: "1px", background: "#e5e7eb", border: "none" })], { gap: "8px" });

const SECTIONS = [
  {
    id: "hero", name: "Hero", desc: "Grab attention", items: [
      {
        name: "Split hero", build: () => Row("Hero Section", [
          Box("Hero Copy", [H("Everything your customers need, in one place", 52, {}, {}, "h1"), T("One clear sentence about why this product is worth buying today.", { fontSize: "18px" }), Btn("Shop now")], { flex: "1", justifyContent: "center" }),
          Img(ph(900, 700, "Hero image"), { flex: "1", height: "460px" }),
        ], { padding: "64px 48px", gap: "48px", alignItems: "center", background: "#f9fafb" }, { padding: "32px 20px", gap: "24px" })
      },
      {
        name: "Centered hero", build: () => Box("Hero Section", [
          H("Make your headline count", 56, { textAlign: "center" }, {}, "h1"),
          T("Back it up with one honest sentence.", { fontSize: "20px", textAlign: "center", maxWidth: "640px" }),
          Btn("Get started"), Img(ph(1200, 500, "Product shot"), { height: "380px" }),
        ], { padding: "80px 48px", alignItems: "center", gap: "24px" }, { padding: "40px 20px" })
      },
    ]
  },
  {
    id: "banners", name: "Banners", desc: "Drive urgency", items: [
      { name: "Announcement bar", build: () => Box("Announcement", [T("Free shipping on orders over $50", { color: "#ffffff", textAlign: "center", fontWeight: "600", fontSize: "14px" })], { background: "#111827", padding: "10px 16px" }) },
      { name: "Sale banner", build: () => Row("Sale Banner", [T("Autumn sale: 20% off everything", { color: "#7c2d12", fontWeight: "700", fontSize: "18px" }), Btn("Shop the sale", { padding: "10px 20px" })], { background: "#fed7aa", padding: "16px 32px", alignItems: "center", justifyContent: "center", gap: "20px" }) },
    ]
  },
  {
    id: "benefits", name: "Benefits & Features", desc: "Prove the value", items: [
      { name: "3 benefit cards", build: () => Box("Benefits", [H("Why people love it", 36, { textAlign: "center" }), Row("Cards", [Card("🌿", "Natural", "Made from simple ingredients."), Card("🚚", "Fast delivery", "Ships within 24 hours."), Card("♻️", "Sustainable", "Packaging that can be recycled.")], { gap: "20px" })], { padding: "64px 48px" }, { padding: "32px 20px" }) },
    ]
  },
  {
    id: "product", name: "Product Detail", desc: "Sell that product", items: [
      {
        name: "Product with buy box", build: () => Row("Product Detail", [
          Img(ph(800, 800, "Product image"), { flex: "1", height: "auto", aspectRatio: "1 / 1" }),
          Box("Buy Box", [
            H("Product name", 36, {}, {}, "h1"),
            Row("Rating", [Stars(5), T("(2,184 reviews)", { fontSize: "14px" })], { alignItems: "center", gap: "8px" }, { flexDirection: "row" }),
            H("$49.00", 28, { fontWeight: "600" }, { fontSize: "28px" }, "h3"),
            T("Short description of what the product does and who it is for."),
            Btn("Add to cart", { width: "100%" }),
          ], { flex: "1", justifyContent: "center" }),
        ], { padding: "48px", gap: "48px" }, { padding: "20px", gap: "24px" })
      },
    ]
  },
  {
    id: "gallery", name: "Gallery & Slider", desc: "Show more visuals", items: [
      {
        name: "Image slider", build: () => Box("Slider Section", [
          H("See it in action", 36, { textAlign: "center" }),
          (() => { const s = buildSlider(); s.s.base.maxWidth = "960px"; s.s.base.margin = "0 auto"; return s; })(),
        ], { padding: "64px 48px" }, { padding: "32px 20px" })
      },
    ]
  },
  {
    id: "cta", name: "Conversion CTAs", desc: "Drive more actions", items: [
      { name: "Dark CTA", build: () => Box("CTA", [H("Ready to try it?", 40, { color: "#ffffff", textAlign: "center" }), T("30-day money back guarantee.", { color: "#d1d5db", textAlign: "center" }), Btn("Order now", { background: "#ffffff", color: "#111827" })], { background: "#111827", padding: "64px 24px", alignItems: "center" }, { padding: "40px 20px" }) },
    ]
  },
  {
    id: "compare", name: "Comparisons", desc: "Show why it wins", items: [
      {
        name: "Comparison table", build: () => {
          const row = (a, b, c, head) => {
            const g = grid("Row", 3, [T(a, { fontWeight: head ? "700" : "500", color: "#111827" }), T(b, { fontWeight: head ? "700" : "400", textAlign: "center" }), T(c, { fontWeight: head ? "700" : "400", textAlign: "center" })], { padding: "12px 0", borderBottom: "1px solid #e5e7eb" });
            g.s.base.gridTemplateColumns = "2fr 1fr 1fr";
            g.s.mobile.gridTemplateColumns = "2fr 1fr 1fr";
            return g;
          };
          return Box("Comparison", [H("Why we win", 36, { textAlign: "center" }), row("", "Us", "Others", true), row("Natural ingredients", "✓", "✗"), row("Free returns", "✓", "✗"), row("Lifetime support", "✓", "✓")], { padding: "64px 48px", maxWidth: "900px" }, { padding: "32px 20px" });
        }
      },
    ]
  },
  {
    id: "proof", name: "Social Proof", desc: "Boost credibility", items: [
      {
        name: "Testimonials", build: () => Box("Reviews", [H("Loved by thousands", 36, { textAlign: "center" }), Row("Review Cards", [1, 2, 3].map((i) =>
          Box("Review", [Stars(5), T("“Short, specific quote about a real result.”", { color: "#111827" }), T("Customer " + i, { fontSize: "14px", fontWeight: "600" })], { flex: "1", padding: "24px", border: "1px solid #e5e7eb", borderRadius: "12px", gap: "10px" })), { gap: "20px" })], { padding: "64px 48px" }, { padding: "32px 20px" })
      },
    ]
  },
  {
    id: "guarantees", name: "Guarantees", desc: "Reduce risk", items: [
      {
        name: "Guarantee strip", build: () => Row("Guarantees", [["🛡️", "30-day guarantee"], ["↩️", "Free returns"], ["🔒", "Secure checkout"]].map(([i, t]) =>
          Row("Item", [node("icon", "Icon", { text: i }, { fontSize: "28px" }), T(t, { fontWeight: "600", color: "#111827" })], { flex: "1", alignItems: "center", justifyContent: "center", gap: "12px" }, { flexDirection: "row" })), { padding: "32px 48px", background: "#f3f4f6" }, { padding: "20px", gap: "12px" })
      },
    ]
  },
  {
    id: "faqs", name: "FAQs", desc: "Remove Objections", items: [
      { name: "FAQ list", build: () => Box("FAQs", [H("Frequently asked questions", 36, { textAlign: "center" }), faq("How long does shipping take?", "Orders ship within 24 hours and arrive in 3–5 business days."), faq("What is your return policy?", "Return any item within 30 days for a full refund."), faq("Is it safe for everyday use?", "Yes. Add your real answer here.")], { padding: "64px 48px", maxWidth: "820px" }, { padding: "32px 20px" }) },
    ]
  },
  {
    id: "collections", name: "Collections", desc: "Show options", items: [
      { name: "Collection grid", build: () => Box("Collections", [H("Shop by category", 36, { textAlign: "center" }), grid("Collection Grid", 3, ["Indoor", "Outdoor", "Gifts"].map((t) => Box("Collection", [Img(ph(600, 600, t), { height: "auto", aspectRatio: "1 / 1" }), H(t, 20, { textAlign: "center" }, {}, "h3")], { gap: "10px" })))], { padding: "64px 48px" }, { padding: "32px 20px" }) },
    ]
  },
  {
    id: "howto", name: "How to & Education", desc: "Guide and inform", items: [
      {
        name: "3 steps", build: () => Box("How it works", [H("How it works", 36, { textAlign: "center" }), Row("Steps", ["Order", "Unbox", "Enjoy"].map((t, i) =>
          Box("Step", [node("circle", "Step Number", { text: String(i + 1) }, { width: "48px", height: "48px", borderRadius: "9999px", background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }), H(t, 22, {}, {}, "h3"), T("One short line explaining this step.")], { flex: "1", gap: "10px" })), { gap: "24px" })], { padding: "64px 48px" }, { padding: "32px 20px" })
      },
    ]
  },
  {
    id: "about", name: "About & Story", desc: "Build connection", items: [
      { name: "Founder story", build: () => Row("About", [Img(ph(700, 700, "Founder"), { flex: "1", height: "420px" }), Box("Story", [H("Why we started", 36), T("Tell the honest story of how and why this brand began. Keep it personal and specific.")], { flex: "1", justifyContent: "center" })], { padding: "64px 48px", gap: "48px", alignItems: "center" }, { padding: "32px 20px", gap: "24px" }) },
    ]
  },
  {
    id: "listicle", name: "Listicle", desc: "Inform and engage", items: [
      { name: "Reasons list", build: () => Box("Listicle", [H("5 reasons to switch", 36), node("list", "List", { items: ["Reason one", "Reason two", "Reason three", "Reason four", "Reason five"] }, { listStyle: "decimal", paddingLeft: "24px", color: "#374151", lineHeight: "2", fontSize: "18px" })], { padding: "64px 48px", maxWidth: "820px" }, { padding: "32px 20px" }) },
    ]
  },
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
const fixSlide = (s, i) => ({
  src: String(s?.src ?? ph(1200, 675, "Slide " + (i + 1))),
  alt: String(s?.alt ?? ""),
  caption: String(s?.caption ?? ""),
});
const fixProps = (n) => {
  const props = n.props || {};
  if (n.type !== "slider") return props;
  return { ...SLIDER_DEFAULTS, ...props, slides: (Array.isArray(props.slides) ? props.slides : []).map(fixSlide) };
};
const fixNode = (n) => ({
  ...n,
  id: n.id || uid(),
  type: n.type || "container",
  name: n.name || n.type || "Layer",
  props: fixProps(n),
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

/* shared by the editor canvas, preview and the exported page */
const SLIDER_CSS =
  ".rp-sl-track{position:absolute;inset:0;display:flex;transition:transform .4s ease}" +
  ".rp-sl-sizer{display:block;width:100%;height:0}" +
  ".rp-sl-slide{position:relative;box-sizing:border-box;flex:0 0 calc(100% / var(--sl-pv,1));min-width:0;height:100%;padding:0 calc(var(--sl-gap,0px) / 2)}" +
  ".rp-sl-slide img{display:block;width:100%;height:100%}" +
  ".rp-sl-cap{position:absolute;left:calc(var(--sl-gap,0px) / 2);right:calc(var(--sl-gap,0px) / 2);bottom:0;padding:36px 20px 40px;color:#fff;font-size:16px;line-height:1.4;background:linear-gradient(transparent,rgba(0,0,0,.6))}" +
  ".rp-sl-arrow{position:absolute;top:50%;z-index:2;display:flex;align-items:center;justify-content:center;width:40px;height:40px;transform:translateY(-50%);border:none;border-radius:9999px;background:rgba(255,255,255,.88);color:#111827;font-size:22px;line-height:1;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2)}" +
  ".rp-sl-arrow:disabled{opacity:.4;cursor:default}" +
  ".rp-sl-prev{left:12px}.rp-sl-next{right:12px}" +
  ".rp-sl-dots{position:absolute;left:0;right:0;bottom:12px;z-index:2;display:flex;justify-content:center;gap:8px}" +
  ".rp-sl-dot{width:10px;height:10px;padding:0;border:none;border-radius:9999px;background:#fff;opacity:.5;cursor:pointer;box-shadow:0 0 0 1px rgba(0,0,0,.15)}" +
  ".rp-sl-dot[aria-current='true']{opacity:1}" +
  "@media(prefers-reduced-motion:reduce){.rp-sl-track{transition:none}}";

const FRAME_CSS = ".rp-frame *{box-sizing:border-box}.rp-frame :where(h1,h2,h3,h4,h5,h6,p,ul,hr){margin:0}.rp-frame button{font-family:inherit}" + SLIDER_CSS;

/* tiny dependency-free script for the exported page (ES5 on purpose) */
const SLIDER_JS = `(function(){
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll("[data-slider]").forEach(function(root){
var track=root.querySelector(".rp-sl-track");
if(!track)return;
var n=track.children.length;
if(!n)return;
var dots=root.querySelectorAll(".rp-sl-dot");
var prev=root.querySelector(".rp-sl-prev"),next=root.querySelector(".rp-sl-next");
var loop=root.getAttribute("data-loop")==="1";
var auto=root.getAttribute("data-autoplay")==="1"&&!reduce&&n>1;
var gap=Math.max(1000,parseInt(root.getAttribute("data-interval"),10)||4000);
var i=0,timer=null,x0=null;
function pv(){var v=parseInt(getComputedStyle(root).getPropertyValue("--sl-pv"),10);return v>0?v:1;}
function show(k){
var m=Math.max(1,n-pv()+1);
i=loop?((k%m)+m)%m:Math.max(0,Math.min(m-1,k));
track.style.transform="translateX(-"+(i*100/pv())+"%)";
for(var j=0;j<dots.length;j++){dots[j].style.display=j<m?"":"none";dots[j].setAttribute("aria-current",j===i?"true":"false");}
if(prev){prev.disabled=!loop&&i===0;prev.style.display=m<2?"none":"";}
if(next){next.disabled=!loop&&i>=m-1;next.style.display=m<2?"none":"";}
}
function stop(){if(timer){clearInterval(timer);timer=null;}}
function start(){stop();if(auto)timer=setInterval(function(){show(i+1);},gap);}
if(prev)prev.addEventListener("click",function(e){e.stopPropagation();show(i-1);start();});
if(next)next.addEventListener("click",function(e){e.stopPropagation();show(i+1);start();});
for(var d=0;d<dots.length;d++)dots[d].addEventListener("click",(function(k){return function(e){e.stopPropagation();show(k);start();};})(d));
root.addEventListener("mouseenter",stop);
root.addEventListener("mouseleave",start);
root.addEventListener("focusin",stop);
root.addEventListener("focusout",start);
root.addEventListener("touchstart",function(e){x0=e.touches[0].clientX;stop();},{passive:true});
root.addEventListener("touchend",function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40)show(i+(dx<0?1:-1));start();});
root.addEventListener("keydown",function(e){if(e.key==="ArrowLeft")show(i-1);else if(e.key==="ArrowRight")show(i+1);});
window.addEventListener("resize",function(){show(i);});
show(0);start();
});
})();`;

const cssText = (o) => Object.entries(o).map(([k, v]) => `${kebab(k)}:${v}`).join(";");

function exportHTML(page) {
  let base = "", tab = "", mob = "", hov = "", hide = "", usesTw = false, usesSlider = false;
  const el = (n) => {
    const cls = "n-" + n.id;
    const p = n.props;
    if (p.className) usesTw = true;
    const isSlider = n.type === "slider";
    if (isSlider) usesSlider = true;
    const pre =
      (n.s.base.minWidth == null ? "min-width:0;" : "") +
      (n.type === "text" && !n.s.base.whiteSpace ? "white-space:pre-wrap;" : "") +
      (n.type === "image" && n.s.base.maxWidth == null ? "max-width:100%;" : "") +
      (isSlider && n.s.base.position == null ? "position:relative;" : "") +
      (isSlider && n.s.base.overflow == null ? "overflow:hidden;" : "") +
      (isSlider && n.s.base.height == null && n.s.base.aspectRatio == null ? "aspect-ratio:16/9;" : "") +
      (Object.keys(n.s.hover).length && !n.s.base.transition ? "transition:all .15s ease;" : "");
    base += `.${cls}{${pre}${cssText(n.s.base)}}`;
    if (Object.keys(n.s.tablet).length) tab += `.${cls}{${cssText(n.s.tablet)}}`;
    if (Object.keys(n.s.mobile).length) mob += `.${cls}{${cssText(n.s.mobile)}}`;
    if (Object.keys(n.s.hover).length) hov += `.${cls}:hover{${cssText(n.s.hover)}}`;
    if (isSlider) {
      base += `.${cls}{--sl-pv:${perViewOf(p, "desktop")};--sl-gap:${Math.max(0, parseInt(p.gap, 10) || 0)}px}.${cls}>.rp-sl-sizer{padding-top:${ratioPct(n.s.base.aspectRatio)}%}`;
      tab += `.${cls}{--sl-pv:${perViewOf(p, "tablet")}}` + (n.s.tablet.aspectRatio ? `.${cls}>.rp-sl-sizer{padding-top:${ratioPct(n.s.tablet.aspectRatio)}%}` : "");
      mob += `.${cls}{--sl-pv:${perViewOf(p, "mobile")}}` + (n.s.mobile.aspectRatio ? `.${cls}>.rp-sl-sizer{padding-top:${ratioPct(n.s.mobile.aspectRatio)}%}` : "");
    }
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
      case "slider": {
        const slides = Array.isArray(p.slides) ? p.slides : [];
        const multi = slides.length > 1;
        const fit = ["cover", "contain", "fill"].includes(p.fit) ? p.fit : "cover";
        const extra =
          (p.role ? "" : ' role="region"') +
          (p.ariaLabel ? "" : ' aria-label="Image slider"') +
          ' aria-roledescription="carousel" tabindex="0" data-slider' +
          ` data-loop="${p.loop !== false ? 1 : 0}" data-autoplay="${p.autoplay ? 1 : 0}" data-interval="${Math.max(1000, +p.interval || 4000)}"`;
        const track = slides.map((s, i) =>
          `<div class="rp-sl-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}"><img src="${esc(s.src)}" alt="${esc(s.alt)}" style="object-fit:${fit}"${i > 0 ? ' loading="lazy"' : ""}>${s.caption ? `<div class="rp-sl-cap">${esc(s.caption)}</div>` : ""}</div>`
        ).join("");
        const arrows = multi && p.arrows !== false
          ? '<button type="button" class="rp-sl-arrow rp-sl-prev" aria-label="Previous slide">‹</button><button type="button" class="rp-sl-arrow rp-sl-next" aria-label="Next slide">›</button>'
          : "";
        const dots = multi && p.dots !== false
          ? `<div class="rp-sl-dots">${slides.map((_, i) => `<button type="button" class="rp-sl-dot" aria-label="Go to slide ${i + 1}" aria-current="${i === 0}"></button>`).join("")}</div>`
          : "";
        return `<div${a}${extra}><div class="rp-sl-sizer" aria-hidden="true"></div><div class="rp-sl-track">${track}</div>${arrows}${dots}</div>`;
      }
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
${usesSlider ? SLIDER_CSS : ""}
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
${usesSlider ? `<script>\n${SLIDER_JS}\n</script>\n` : ""}</body>
</html>`;
}

/* ------------------------------ context ---------------------------- */
const Ctx = createContext({ preview: false });

/* ------------------------------ slider view ------------------------ */
function SliderView({ n, common, preview, device }) {
  const p = n.props;
  const st = common.style;
  const slides = Array.isArray(p.slides) ? p.slides : [];
  const count = slides.length;
  const loop = p.loop !== false;
  const fit = ["cover", "contain", "fill"].includes(p.fit) ? p.fit : "cover";
  const pv = perViewOf(p, device);
  const gap = Math.max(0, parseInt(p.gap, 10) || 0);
  const positions = Math.max(1, count - pv + 1); // how many places the track can stop at
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const current = Math.min(index, positions - 1);

  const step = (dir) => {
    if (positions < 2) return;
    setIndex((i) => {
      const base = Math.min(i, positions - 1);
      const next = base + dir;
      return loop ? (next + positions) % positions : Math.max(0, Math.min(positions - 1, next));
    });
  };
  const goTo = (i) => setIndex(Math.max(0, Math.min(positions - 1, i)));

  /* autoplay runs only in Preview (never while editing) */
  useEffect(() => {
    if (!preview || !p.autoplay || positions < 2 || paused) return undefined;
    const timer = setInterval(() => step(1), Math.max(1000, Number(p.interval) || 4000));
    return () => clearInterval(timer);
  }, [preview, p.autoplay, p.interval, positions, paused, loop]);

  const swallow = (fn) => (e) => { e.stopPropagation(); fn(); };
  const multi = positions > 1;
  const needsSizer = st.height == null || st.height === "auto";

  return (
    <div
      {...common}
      style={{ ...st, "--sl-pv": pv, "--sl-gap": `${gap}px` }}
      role={p.role || "region"}
      aria-roledescription="carousel"
      aria-label={p.ariaLabel || "Image slider"}
      tabIndex={preview ? 0 : undefined}
      onMouseEnter={(e) => { common.onMouseEnter(e); setPaused(true); }}
      onMouseLeave={(e) => { common.onMouseLeave(e); setPaused(false); }}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (touchX.current !== null) {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
        }
        touchX.current = null;
        setPaused(false);
      }}
      onKeyDown={preview ? (e) => {
        if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "ArrowRight") step(1);
      } : undefined}
    >
      {needsSizer && <div className="rp-sl-sizer" aria-hidden="true" style={{ paddingTop: `${ratioPct(st.aspectRatio)}%` }} />}
      <div className="rp-sl-track" style={{ transform: `translateX(-${(current * 100) / pv}%)` }}>
        {slides.map((s, i) => (
          <div key={i} className="rp-sl-slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}>
            <img src={s.src} alt={s.alt || ""} draggable={false} style={{ objectFit: fit }} />
            {s.caption ? <div className="rp-sl-cap">{s.caption}</div> : null}
          </div>
        ))}
      </div>
      {!count && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13, background: "#f1f5f9" }}>
          No slides yet. Add slides in the Config tab.
        </div>
      )}
      {multi && p.arrows !== false && (
        <>
          <button type="button" className="rp-sl-arrow rp-sl-prev" aria-label="Previous slide" disabled={!loop && current === 0} onClick={swallow(() => step(-1))}>‹</button>
          <button type="button" className="rp-sl-arrow rp-sl-next" aria-label="Next slide" disabled={!loop && current === positions - 1} onClick={swallow(() => step(1))}>›</button>
        </>
      )}
      {multi && p.dots !== false && (
        <div className="rp-sl-dots">
          {Array.from({ length: positions }, (_, i) => (
            <button key={i} type="button" className="rp-sl-dot" aria-label={`Go to slide ${i + 1}`} aria-current={i === current} onClick={swallow(() => goTo(i))} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ renderer --------------------------- */
function Render({ n, device, isPageSection = false }) {
  const c = useContext(Ctx);
  const [hov, setHov] = useState(false);
  const isInlineEditing = !c.preview
    && c.inlineEdit?.id === n.id
    && c.inlineEdit.type !== "image"
    && c.activeDevice === device;
  useEffect(() => {
    if (!isInlineEditing || !c.inlineEditRef.current) return;
    const input = c.inlineEditRef.current;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }, [isInlineEditing]);
  if (n.hide[device]) return null;

  const isSel = !c.preview && c.selectedId === n.id && c.activeDevice === device;
  const hoverOn = (c.preview && hov) || (isSel && c.stateTab === "hover");
  const st = { ...resolveStyle(n, device, hoverOn) };
  const p = n.props;
  const empty = n.type === "container" && n.children.length === 0;
  if (isPageSection && !c.preview && c.draggingSection) st.cursor = "grabbing";

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
  if (n.type === "slider") {
    if (st.position == null) st.position = "relative";
    if (st.overflow == null) st.overflow = "hidden";
    if (st.height == null && st.aspectRatio == null) st.aspectRatio = "16 / 9";
  }
  if (isPageSection && !c.preview && st.position == null) st.position = "relative";
  if (!c.preview) {
    if (isSel) { st.outline = "2px solid #2563eb"; st.outlineOffset = "-2px"; }
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
    "data-page-section": isPageSection ? "true" : undefined,
    onClick,
    draggable: !c.preview && !isPageSection && !isInlineEditing,
    onDragStart: !c.preview && !isPageSection ? (e) => {
      e.stopPropagation();
      e.dataTransfer.setData("text/x-move", n.id);
      e.dataTransfer.effectAllowed = "move";
      c.startMove(n.id);
    } : undefined,
    onDragEnd: !c.preview && !isPageSection ? (e) => { e.stopPropagation(); c.endMove(); } : undefined,
    onDoubleClick: c.preview || isInlineEditing || !["text", "heading", "button", "icon", "image"].includes(n.type) ? undefined : (e) => {
      e.stopPropagation();
      c.editNode(n, device, e.currentTarget);
    },
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
  const inlineInput = isInlineEditing ? (
    <textarea
      ref={c.inlineEditRef}
      autoFocus
      rows={1}
      value={c.inlineEdit.value}
      aria-label="Edit text"
      className="box-border block w-full min-w-0 resize-none overflow-hidden whitespace-pre-wrap break-words rounded border border-blue-400 bg-transparent px-1 py-0.5 outline-none"
      style={{
        color: "inherit",
        font: "inherit",
        lineHeight: "inherit",
        textAlign: st.textAlign || "inherit",
        letterSpacing: st.letterSpacing || "inherit",
        textTransform: st.textTransform || "inherit",
        backgroundColor: "transparent",
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.currentTarget.style.height = "auto";
        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
        c.changeInlineText(n.id, e.currentTarget.value);
      }}
      onBlur={c.saveInlineEdit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          c.saveInlineEdit();
        }
      }}
    />
  ) : null;

  /* Only this handle moves a whole section; dragging text, buttons, stars etc. no longer drags the section. */
  const sectionHandle = isPageSection && !c.preview && n.type === "container" && (hov || isSel) ? (
    <button
      key="section-handle"
      type="button"
      draggable
      title="Drag to move this section"
      aria-label="Drag to move this section"
      onClick={(e) => e.stopPropagation()}
      onDragStart={(e) => {
        e.stopPropagation();
        const section = e.currentTarget.closest('[data-page-section="true"]');
        if (!section) { e.preventDefault(); return; }
        e.dataTransfer.setData("text/x-node", n.id);
        e.dataTransfer.effectAllowed = "move";
        c.startSectionDrag(section.getBoundingClientRect(), e.clientX, e.clientY);
        const dragImage = document.createElement("canvas");
        dragImage.width = 1;
        dragImage.height = 1;
        e.dataTransfer.setDragImage(dragImage, 0, 0);
      }}
      onDragEnd={c.endSectionDrag}
      className="flex items-center gap-1 rounded-bl-md bg-blue-600 px-2 py-1 text-[11px] font-medium text-white"
      style={{
        position: "absolute", top: 0, right: 0, zIndex: 25, cursor: "grab", border: "none",
        transform: `scale(${1 / (c.zoom || 1)})`, transformOrigin: "top right",
      }}
    >
      ⠿ Move section
    </button>
  ) : null;

  switch (n.type) {
    case "image": return <img {...common} src={p.src} alt={p.alt || ""} />;
    case "hr": return <hr {...common} />;
    case "list": return <ul {...common}>{(p.items || []).map((t, i) => <li key={i}>{t}</li>)}</ul>;
    case "stars": {
      const r = Math.round(Math.max(0, Math.min(5, +p.rating || 0)));
      return <div {...common}>{"★".repeat(r) + "☆".repeat(5 - r)}</div>;
    }
    case "slider": return <SliderView n={n} common={common} preview={!!c.preview} device={device} />;
    case "text": return <p {...common}>{inlineInput || p.text}</p>;
    case "heading": return React.createElement(p.tag || "h2", common, inlineInput || p.text);
    case "button": return c.thumbnail
      ? <div style={st} className={p.className || undefined}>{p.text}</div>
      : <button type="button" {...common}>{inlineInput || p.text}</button>;
    case "icon": return <span {...common}>{inlineInput || p.text}</span>;
    default: {
      const dropProps = c.preview ? {} : {
        onDragOver: (e) => {
          if (e.dataTransfer.types.includes("text/x-node")) {
            if (isPageSection) c.dragOverNode(e, n.id);
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.types.includes("text/x-comp") || e.dataTransfer.types.includes("text/x-move")) c.hintDrop(e, n.id);
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
        empty && !c.preview ? <span key="hint" style={{ color: "#94a3b8", fontSize: 12, pointerEvents: "none" }}>Drop components here</span> : null,
        sectionHandle
      );
    }
  }
}

/* --------------------------- small UI parts ------------------------ */
const Section = ({ title, children, open, onToggle }) => {
  return (
    <div className="border-b border-gray-100 py-3">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center gap-1 text-left text-[13px] font-semibold text-gray-800">
        <span className="flex w-3 text-gray-400"><Ico n={open ? "down" : "right"} size={13} /></span>{title}
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
};
const Seg = ({ value, options, onChange }) => (
  <div className="flex rounded-md bg-gray-100 p-0.5 text-xs">
    {options.map((o) => {
      const v = typeof o === "string" ? o : o.value;
      const l = typeof o === "string" ? o : o.label;
      return (
        <button key={v} type="button" onClick={() => onChange(v)} className={`flex-1 rounded px-2 py-1 ${value === v ? "bg-white font-medium text-blue-600 shadow-sm" : "text-gray-600"}`}>{l}</button>
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
const Inp = ({ value, onChange, placeholder, type = "text", autoFocus = false }) => (
  <input type={type} value={value ?? ""} placeholder={placeholder} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500" />
);
const StepInp = ({ value, onChange, placeholder, step = 1, defaultUnit = "", compact = false, label = "value" }) => {
  const rawValue = String(value ?? "").trim();
  const match = /^(-?(?:\d+\.?\d*|\.\d+))(.*)$/.exec(rawValue || String(placeholder ?? "").trim());
  const adjust = (direction) => {
    if (!match) return;
    const precision = Math.min(6, (String(step).split(".")[1] || "").length);
    const next = Number((Number(match[1]) + direction * step).toFixed(precision));
    onChange(`${next}${match[2].trim() || defaultUnit}`);
  };
  const stepButton = (direction) => (
    <button type="button" aria-label={`${direction > 0 ? "Increase" : "Decrease"} ${label}`} title={`${direction > 0 ? "Increase" : "Decrease"} ${label}`}
      disabled={!match} onClick={() => adjust(direction)}
      className="flex flex-1 items-center justify-center text-gray-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30">
      <Ico n={direction > 0 ? "up" : "down"} size={compact ? 8 : 10} />
    </button>
  );
  return (
    <div className={compact ? "relative w-12" : "relative w-full min-w-0"}>
      <input type="text" inputMode="decimal" value={value ?? ""} placeholder={placeholder}
        aria-label={label} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            adjust(e.key === "ArrowUp" ? 1 : -1);
          }
        }}
        className={compact
          ? "w-full bg-transparent pr-3 text-center text-xs outline-none placeholder:text-gray-400 focus:text-blue-600"
          : "w-full rounded-md border border-gray-200 bg-white px-2 py-1 pr-6 text-xs outline-none focus:border-blue-500"} />
      <div className={`absolute inset-y-0 right-0 flex flex-col ${compact ? "w-3" : "w-5"}`}>
        {stepButton(1)}
        {stepButton(-1)}
      </div>
    </div>
  );
};
const Sel = ({ value, options, onChange }) => (
  <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-200 bg-white px-1.5 py-1 text-xs outline-none focus:border-blue-500">
    {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
  </select>
);
const Area = ({ value, onChange, rows = 3, autoFocus = false }) => (
  <textarea rows={rows} value={value ?? ""} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)}
    className="w-full resize-y rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500" />
);
const Toggle = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
    <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />{label}
  </label>
);
const Color = ({ value, onChange }) => (
  <div className="flex gap-1.5">
    <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || "") ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-6 w-8 shrink-0 cursor-pointer rounded border border-gray-200 bg-white p-0" />
    <Inp value={value} onChange={onChange} placeholder="none" />
  </div>
);
const Mini = ({ value, onChange, label }) => (
  <StepInp value={value} onChange={onChange} placeholder="0px" step={1} defaultUnit="px" compact label={label} />
);
const IconBtn = ({ n, title, onClick, active, danger }) => (
  <button type="button" title={title} aria-label={title} onClick={onClick} className={`flex h-8 w-8 items-center justify-center rounded-md ${active ? "bg-gray-900 text-white" : danger ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-100"}`}>
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
  const glyph = { container: "container", text: "text", heading: "heading", button: "button", image: "image", slider: "slider", list: "list", hr: "divider", stars: "rating", circle: "circle", icon: "icon" }[n.type];
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
function SectionThumbnail({ item }) {
  const [sample] = useState(() => item.build());
  const [height, setHeight] = useState(20);
  const contentRef = useRef(null);
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const updateHeight = () => setHeight(Math.max(20, Math.min(120, content.offsetHeight * 0.2)));
    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);
    updateHeight();
    return () => observer.disconnect();
  }, []);
  return (
    <div className="rp-frame pointer-events-none relative overflow-hidden bg-white" style={{ height }}>
      <div ref={contentRef} className="absolute left-0 top-0 w-[1000px] origin-top-left" style={{ transform: "scale(0.2)" }}>
        <Ctx.Provider value={{ preview: true, thumbnail: true }}>
          <Render n={sample} device="desktop" />
        </Ctx.Provider>
      </div>
    </div>
  );
}
function SectionsPanel({ onAdd, onPreviewVisibilityChange }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const list = SECTIONS.filter((s) => (s.name + s.desc + s.items.map((i) => i.name).join(" ")).toLowerCase().includes(q.toLowerCase()));
  const activeSection = list.find((section) => section.id === activeSectionId);
  const setActiveSection = (sectionId) => {
    setActiveSectionId(sectionId);
    onPreviewVisibilityChange(Boolean(sectionId));
  };
  return (
    <div className="mt-1 flex min-h-0 flex-1 gap-2" onMouseLeave={() => setActiveSection(null)}>
      <div className={`flex ${activeSection ? "w-[240px] max-w-[50%] shrink-0" : "w-full min-w-0"} flex-col`}>
        <SearchBox value={q} onChange={(value) => { setQ(value); setActiveSection(null); }} placeholder="Search sections…" />
        <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto pr-1">
          {list.map((s) => (
            <div key={s.id} onMouseEnter={() => setActiveSection(s.id)}>
              <button
                onFocus={() => setActiveSection(s.id)}
                onClick={() => { setActiveSection(s.id); setOpen(open === s.id ? null : s.id); }}
                className={`flex w-full items-center justify-between rounded-lg p-2 text-left ${activeSection?.id === s.id ? "bg-gray-50" : "hover:bg-gray-50"}`}
              >
                <span><span className="block text-[13px] font-semibold text-gray-900">{s.name}</span><span className="block text-xs text-gray-500">{s.desc}</span></span>
                <span className="text-gray-400"><Ico n={open === s.id ? "down" : "right"} size={14} /></span>
              </button>
            </div>
          ))}
          {!list.length && <p className="p-2 text-xs text-gray-500">No sections found.</p>}
        </div>
      </div>
      {activeSection && (
        <div className="flex min-w-0 flex-1 flex-col border-l border-gray-100 pl-2">
          <div className="mb-2 px-1 text-xs font-semibold text-gray-800">{activeSection.name}</div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {activeSection.items.map((it, index) => (
                <div key={it.name} role="button" tabIndex={0} draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/x-section", `${activeSection.id}:${index}`);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => onAdd(it.build())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onAdd(it.build());
                    }
                  }}
                  aria-label={`Add ${it.name}`}
                  title={it.name}
                  className="block w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-left transition-colors hover:border-blue-400 hover:bg-blue-50">
                  <SectionThumbnail item={it} />
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function ComponentsPanel() {
  const [q, setQ] = useState("");
  const list = COMPONENTS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder="Search components…" />
      <p className="mt-2 text-[11px] text-gray-500">
        {q ? `${list.length} of ${COMPONENTS.length} components` : `${COMPONENTS.length} components`}. Drag one onto the canvas and drop it where you want it.
      </p>
      <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto pr-1">
        {list.map((c) => (
          <div key={c.key} draggable
            onDragStart={(e) => { e.dataTransfer.setData("text/x-comp", c.key); e.dataTransfer.effectAllowed = "copy"; }}
            title={c.label}
            className="flex h-[84px] cursor-grab flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-1 text-gray-700 hover:border-blue-400 hover:bg-blue-50 active:cursor-grabbing">
            <span className="text-blue-600"><Ico n={c.glyph} size={20} /></span>
            <span className="line-clamp-2 text-center text-[11px] leading-tight">{c.label}</span>
          </div>
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
      <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto pr-1">
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

/* config editor for the Slider component */
function SliderConfig({ p, api }) {
  const slides = Array.isArray(p.slides) ? p.slides : [];
  const setSlides = (next) => api.setProps({ slides: next });
  const patch = (i, o) => setSlides(slides.map((s, j) => (j === i ? { ...s, ...o } : s)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    setSlides(next);
  };
  const upload = (i, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => patch(i, { src: r.result });
    r.readAsDataURL(file);
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Toggle label="Arrows" checked={p.arrows !== false} onChange={(v) => api.setProps({ arrows: v })} />
        <Toggle label="Dots" checked={p.dots !== false} onChange={(v) => api.setProps({ dots: v })} />
        <Toggle label="Loop" checked={p.loop !== false} onChange={(v) => api.setProps({ loop: v })} />
        <Toggle label="Autoplay" checked={!!p.autoplay} onChange={(v) => api.setProps({ autoplay: v })} />
      </div>
      {p.autoplay && (
        <Field label="Delay (ms)"><Inp value={p.interval} onChange={(v) => api.setProps({ interval: v.replace(/\D/g, "") })} placeholder="4000" /></Field>
      )}
      <Field label="Image fit"><Sel value={p.fit || "cover"} options={["cover", "contain", "fill"]} onChange={(v) => api.setProps({ fit: v })} /></Field>
      <div className="space-y-2 rounded-lg bg-gray-50 p-2">
        <span className="block text-xs font-medium text-gray-700">Slides visible at once</span>
        <Field label="Desktop"><Sel value={String(perViewOf(p, "desktop"))} options={["1", "2", "3", "4", "5", "6"]} onChange={(v) => api.setProps({ perView: +v })} /></Field>
        <Field label="Tablet"><Sel value={String(perViewOf(p, "tablet"))} options={["1", "2", "3", "4", "5", "6"]} onChange={(v) => api.setProps({ perViewTablet: +v })} /></Field>
        <Field label="Mobile"><Sel value={String(perViewOf(p, "mobile"))} options={["1", "2", "3", "4", "5", "6"]} onChange={(v) => api.setProps({ perViewMobile: +v })} /></Field>
        <Field label="Gap (px)"><Inp value={p.gap} onChange={(v) => api.setProps({ gap: v.replace(/\D/g, "") })} placeholder="0" /></Field>
      </div>
      <p className="text-[11px] text-gray-500">Autoplay runs in Preview and in the exported page, never while editing.</p>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">Slides ({slides.length})</span>
        <button type="button" onClick={() => setSlides([...slides, newSlide(slides.length + 1)])} className="rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white hover:bg-black">Add slide</button>
      </div>
      {slides.map((s, i) => (
        <div key={i} className="space-y-1.5 rounded-lg border border-gray-200 p-2">
          <div className="flex items-center gap-2">
            <img src={s.src} alt="" className="h-9 w-14 shrink-0 rounded object-cover" />
            <span className="flex-1 text-xs font-medium text-gray-700">Slide {i + 1}</span>
            <button type="button" title="Move up" aria-label="Move slide up" onClick={() => move(i, -1)} className="p-0.5 text-gray-500 hover:text-gray-900"><Ico n="up" size={13} /></button>
            <button type="button" title="Move down" aria-label="Move slide down" onClick={() => move(i, 1)} className="p-0.5 text-gray-500 hover:text-gray-900"><Ico n="down" size={13} /></button>
            <button type="button" title="Remove slide" aria-label="Remove slide" onClick={() => setSlides(slides.filter((_, j) => j !== i))} className="p-0.5 text-red-400 hover:text-red-600"><Ico n="trash" size={13} /></button>
          </div>
          <Inp value={s.src?.startsWith("data:") ? "(uploaded / placeholder)" : s.src} onChange={(v) => { if (v !== "(uploaded / placeholder)") patch(i, { src: v }); }} placeholder="Image URL" />
          <Inp value={s.alt} onChange={(v) => patch(i, { alt: v })} placeholder="Alt text" />
          <Inp value={s.caption} onChange={(v) => patch(i, { caption: v })} placeholder="Caption text shown on the image (optional)" />
          <label className="block cursor-pointer rounded-md border border-gray-200 py-1 text-center text-[11px] text-gray-700 hover:bg-gray-50">
            Upload image
            <input type="file" accept="image/*" hidden onChange={(e) => { upload(i, e.target.files[0]); e.target.value = ""; }} />
          </label>
        </div>
      ))}
      {!slides.length && <p className="text-[11px] text-gray-500">No slides yet. Click “Add slide”.</p>}
    </div>
  );
}

function RightPanel({ node: n, device, stateTab, setStateTab, tab, setTab, api }) {
  const fileRef = useRef(null);
  /* States + Size are open by default; sections no longer close each other.
     RightPanel is remounted per selected node (key={selNode.id}), so this default applies on every new selection. */
  const [openSections, setOpenSections] = useState(["states", "size"]);
  const isOpen = (id) => openSections.includes(id);
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
  const posKind = cur.position || "static";
  const toggleSection = (section) =>
    setOpenSections((list) => (list.includes(section) ? list.filter((x) => x !== section) : [...list, section]));

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
    <div className="pointer-events-auto absolute right-3 top-[88px] bottom-3 flex w-[300px] flex-col overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold capitalize text-gray-900">{n.type} <span className="font-normal text-gray-400">· {n.name}</span></span>
          <button onClick={() => api.select(null)} aria-label="Close panel" className="text-gray-400 hover:text-gray-700"><Ico n="close" size={15} /></button>
        </div>
        <div className="mt-2 flex gap-4 border-b border-gray-100 text-xs">
          {[["design", "Design"], ["config", "Config"], ["interactions", "Interactions"], ["a11y", "Accessibility"]].filter(([k]) => !isPage || k === "design").map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`pb-2 ${tab === k ? "border-b-2 border-blue-600 font-medium text-blue-600" : "text-gray-500"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {tab === "design" && (
          <>
            <Section title="States" open={isOpen("states")} onToggle={() => toggleSection("states")}>
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

            <Section title="Size" open={isOpen("size")} onToggle={() => toggleSection("size")}>
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
              <Section title="Layout" open={isOpen("layout")} onToggle={() => toggleSection("layout")}>
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
                    <Field label="Col Gap"><StepInp value={gapOf(cur, "col")} onChange={(v) => api.setStyles({ gap: "", columnGap: v, rowGap: gapOf(cur, "row") }, editKey)} placeholder="0px" step={1} defaultUnit="px" label="column gap" /></Field>
                    <Field label="Row Gap"><StepInp value={gapOf(cur, "row")} onChange={(v) => api.setStyles({ gap: "", rowGap: v, columnGap: gapOf(cur, "col") }, editKey)} placeholder="0px" step={1} defaultUnit="px" label="row gap" /></Field>
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
                        <StepInp value={cur.gap} onChange={(v) => set("gap", v)} placeholder="0px" step={1} defaultUnit="px" label="gap" />
                        <span className="block text-xs text-gray-500">Order</span>
                        <Seg value={reversed ? "reverse" : "forward"} options={[{ value: "forward", label: "Forward" }, { value: "reverse", label: "Reverse" }]}
                          onChange={(m) => set("flexDirection", axis + (m === "reverse" ? "-reverse" : ""))} />
                      </div>
                      <div className="grid h-[84px] w-[84px] shrink-0 grid-cols-3 gap-1 rounded-md bg-gray-50 p-2">
                        {[0, 1, 2].flatMap((r) => [0, 1, 2].map((cc) => {
                          const main = axis === "row" ? cc : r, cross = axis === "row" ? r : cc;
                          const on = cur.justifyContent === V3[main] && cur.alignItems === V3[cross];
                          return <button key={r + "-" + cc} aria-label="Set alignment" onClick={() => api.setStyles({ justifyContent: V3[main], alignItems: V3[cross] }, editKey)} className={`rounded-full ${on ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"}`} />;
                        }))}
                      </div>
                    </div>
                  </>
                ) : <p className="text-[11px] text-gray-500">The page uses normal stacked layout. Choose Auto Layout to control direction, gap and alignment of your sections, or Columns for a grid.</p>}
              </Section>
            )}

            {!isPage && (<Section title="Visibility" open={isOpen("visibility")} onToggle={() => toggleSection("visibility")}>
              <div className="flex gap-2">
                {["mobile", "tablet", "desktop"].map((d) => (
                  <button key={d} onClick={() => api.toggleHide(n.id, d)} className={`flex-1 rounded-md border px-2 py-1 text-xs capitalize ${n.hide[d] ? "border-red-300 bg-red-50 text-red-600" : "border-gray-200 text-gray-600"}`}>
                    {n.hide[d] ? "Hidden " : ""}{d}
                  </button>
                ))}
              </div>
            </Section>)}

            <Section title="Spacing" open={isOpen("spacing")} onToggle={() => toggleSection("spacing")}>
              <div className="rounded-lg bg-orange-50 p-2 text-[10px] text-orange-500">
                <div className="mb-0.5">Margin</div>
                <div className="flex justify-center"><Mini value={margin.top} onChange={(v) => setBox("margin", "top", v)} label="top margin" /></div>
                <div className="flex items-center justify-between">
                  <Mini value={margin.left} onChange={(v) => setBox("margin", "left", v)} label="left margin" />
                  <div className="mx-1 flex-1 rounded-md bg-green-50 p-1 text-green-600">
                    <div>Padding</div>
                    <div className="flex justify-center"><Mini value={padding.top} onChange={(v) => setBox("padding", "top", v)} label="top padding" /></div>
                    <div className="flex items-center justify-between">
                      <Mini value={padding.left} onChange={(v) => setBox("padding", "left", v)} label="left padding" />
                      <div className="h-5 w-8 rounded bg-white" />
                      <Mini value={padding.right} onChange={(v) => setBox("padding", "right", v)} label="right padding" />
                    </div>
                    <div className="flex justify-center"><Mini value={padding.bottom} onChange={(v) => setBox("padding", "bottom", v)} label="bottom padding" /></div>
                  </div>
                  <Mini value={margin.right} onChange={(v) => setBox("margin", "right", v)} label="right margin" />
                </div>
                <div className="flex justify-center"><Mini value={margin.bottom} onChange={(v) => setBox("margin", "bottom", v)} label="bottom margin" /></div>
              </div>
              <p className="text-[11px] text-gray-500">Use values like 16px, 2rem, auto. Shorthand padding and margin values are shown per side.</p>
            </Section>

            <Section title="Positioning" open={isOpen("positioning")} onToggle={() => toggleSection("positioning")}>
              <Seg value={posKind} options={["static", "relative", "absolute", "sticky", "fixed"]} onChange={(v) => set("position", v === "static" ? "" : v)} />
              {posKind !== "static" && (
                <div className="grid grid-cols-2 gap-2">
                  {["top", "right", "bottom", "left"].map((k) => <Inp key={k} value={cur[k]} onChange={(v) => set(k, v)} placeholder={k} />)}
                </div>
              )}
              <Field label="Z-index"><Inp value={cur.zIndex} onChange={(v) => set("zIndex", v)} placeholder="auto" /></Field>
            </Section>

            {(isTxt || isPage) && (
              <Section title="Typography" open={isOpen("typography")} onToggle={() => toggleSection("typography")}>
                <Field label="Font"><Inp value={cur.fontFamily} onChange={(v) => set("fontFamily", v)} placeholder="inherit" /></Field>
                <Field label="Size"><StepInp value={cur.fontSize} onChange={(v) => set("fontSize", v)} placeholder="16px" step={1} defaultUnit="px" label="font size" /></Field>
                <Field label="Weight"><Sel value={cur.fontWeight || ""} options={["", "300", "400", "500", "600", "700", "800", "900"]} onChange={(v) => set("fontWeight", v)} /></Field>
                <Field label="Color"><Color value={cur.color} onChange={(v) => set("color", v)} /></Field>
                <Field label="Line h."><StepInp value={cur.lineHeight} onChange={(v) => set("lineHeight", v)} placeholder="1.5" step={0.05} label="line height" /></Field>
                <Field label="Letter sp."><StepInp value={cur.letterSpacing} onChange={(v) => set("letterSpacing", v)} placeholder="0" step={0.1} defaultUnit="px" label="letter spacing" /></Field>
                <Seg value={cur.textAlign || "left"} options={["left", "center", "right"]} onChange={(v) => set("textAlign", v)} />
              </Section>
            )}

            <Section title="Background" open={isOpen("background")} onToggle={() => toggleSection("background")}>
              <Field label="Color"><Color value={cur.background} onChange={(v) => set("background", v)} /></Field>
              {isC && (
                <Field label="Image URL"><Inp value={(cur.backgroundImage || "").replace(/^url\(["']?|["']?\)$/g, "")} onChange={(v) => api.setStyles(v ? { backgroundImage: `url("${v}")`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundImage: "" }, editKey)} placeholder="https://…" /></Field>
              )}
            </Section>

            <Section title="Border & effects" open={isOpen("border")} onToggle={() => toggleSection("border")}>
              <Field label="Border"><Inp value={cur.border} onChange={(v) => set("border", v)} placeholder="1px solid #e5e7eb" /></Field>
              <Field label="Radius"><Inp value={cur.borderRadius} onChange={(v) => set("borderRadius", v)} placeholder="0px" /></Field>
              <Field label="Shadow"><Inp value={cur.boxShadow} onChange={(v) => set("boxShadow", v)} placeholder="0 4px 12px rgba(0,0,0,.1)" /></Field>
              <Field label="Opacity"><Inp value={cur.opacity} onChange={(v) => set("opacity", v)} placeholder="1" /></Field>
              <Field label="Overflow"><Sel value={cur.overflow || ""} options={["", "visible", "hidden", "auto", "scroll"]} onChange={(v) => set("overflow", v)} /></Field>
              {n.type === "image" && <Field label="Fit"><Sel value={cur.objectFit || ""} options={["", "cover", "contain", "fill", "none"]} onChange={(v) => set("objectFit", v)} /></Field>}
              <Field label="Cursor"><Sel value={cur.cursor || ""} options={["", "pointer", "default", "not-allowed"]} onChange={(v) => set("cursor", v)} /></Field>
            </Section>

            <Section title="Custom CSS" open={isOpen("custom-css")} onToggle={() => toggleSection("custom-css")}>
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
              <div><span className="mb-1 block text-xs text-gray-500">Content</span><Area autoFocus value={p.text} onChange={(v) => api.setProps({ text: v })} /></div>
            )}
            {n.type === "list" && (
              <div><span className="mb-1 block text-xs text-gray-500">Items (one per line)</span><Area rows={5} value={(p.items || []).join("\n")} onChange={(v) => api.setProps({ items: v.split("\n") })} /></div>
            )}
            {n.type === "stars" && <Field label="Rating"><Sel value={String(p.rating ?? 5)} options={["0", "1", "2", "3", "4", "5"]} onChange={(v) => api.setProps({ rating: +v })} /></Field>}
            {n.type === "slider" && <SliderConfig p={p} api={api} />}
            {n.type === "image" && (
              <>
                <Field label="Image URL"><Inp autoFocus value={p.src?.startsWith("data:") ? "(uploaded / placeholder)" : p.src} onChange={(v) => api.setProps({ src: v })} /></Field>
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
        <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700"><Ico n="close" size={15} /></button>
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
  const [panelTab, setPanelTab] = useState("design");
  const [inlineEdit, setInlineEdit] = useState(null);
  const inlineEditRef = useRef(null);
  const [leftTab, setLeftTab] = useState("sections");
  const [leftOpen, setLeftOpen] = useState(true);
  const [sectionPreviewsVisible, setSectionPreviewsVisible] = useState(false);
  const [zoom, setZoom] = useState(50);
  const [show, setShow] = useState({ desktop: true, tablet: true, mobile: true });
  const [widths, setWidths] = useState({ desktop: 1440, tablet: 810, mobile: 393 });
  const [assets, setAssets] = useState([]);
  const [draggingSection, setDraggingSection] = useState(false);
  const [sectionDragOutline, setSectionDragOutline] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dropLine, setDropLine] = useState(null); // blue insertion line while dragging a component / element
  const movingRef = useRef(null); // id of the element being moved inside the page
  useEffect(() => {
    const clear = () => { movingRef.current = null; setDropLine(null); };
    window.addEventListener("dragend", clear);
    window.addEventListener("drop", clear);
    return () => { window.removeEventListener("dragend", clear); window.removeEventListener("drop", clear); };
  }, []);
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
  const wheelZoom = useRef({ frame: 0, target: null, x: 0, y: 0, lastTime: 0 });
  const view = useRef({ zoom, pan });
  view.current = { zoom, pan };
  const s = zoom / 100;

  const applyZoomAt = (z2, cx, cy) => {
    const { zoom: z1, pan: p } = view.current;
    z2 = Math.min(400, Math.max(10, z2));
    const r = z2 / z1;
    const nextPan = { x: cx - (cx - p.x) * r, y: cy - (cy - p.y) * r };
    view.current = { zoom: z2, pan: nextPan };
    setPan(nextPan);
    setZoom(z2);
  };
  const cancelWheelZoom = () => {
    if (wheelZoom.current.frame) cancelAnimationFrame(wheelZoom.current.frame);
    wheelZoom.current = { frame: 0, target: null, x: 0, y: 0, lastTime: 0 };
  };
  const zoomAt = (z2, cx, cy) => {
    cancelWheelZoom();
    applyZoomAt(z2, cx, cy);
  };
  const animateWheelZoom = (time) => {
    const animation = wheelZoom.current;
    if (animation.target === null) return;
    const elapsed = animation.lastTime ? Math.min(time - animation.lastTime, 50) : 16;
    animation.lastTime = time;
    const current = view.current.zoom;
    const difference = animation.target - current;
    if (Math.abs(difference) < 0.05) {
      applyZoomAt(animation.target, animation.x, animation.y);
      wheelZoom.current = { frame: 0, target: null, x: 0, y: 0, lastTime: 0 };
      return;
    }
    applyZoomAt(current + difference * (1 - Math.exp(-elapsed / 70)), animation.x, animation.y);
    animation.frame = requestAnimationFrame(animateWheelZoom);
  };
  const queueWheelZoom = (deltaY, cx, cy) => {
    const animation = wheelZoom.current;
    const base = animation.frame ? animation.target : view.current.zoom;
    animation.target = Math.min(400, Math.max(10, base * Math.exp(-deltaY * 0.002)));
    animation.x = cx;
    animation.y = cy;
    if (!animation.frame) animation.frame = requestAnimationFrame(animateWheelZoom);
  };
  const fit = () => {
    cancelWheelZoom();
    const left = leftOpen ? leftTab === "sections" ? sectionPreviewsVisible ? 610 : 350 : 390 : 110;
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
    const target = e.target instanceof Element ? e.target : null;
    const onBg = !target?.closest("[data-nopan], [data-node], input, textarea, select, button, a, [contenteditable='true']");
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
        const deltaY = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1);
        queueWheelZoom(deltaY, e.clientX, e.clientY);
      } else {
        const horiz = e.shiftKey && !e.deltaX;
        setPan((p) => ({ x: p.x - (horiz ? e.deltaY : e.deltaX), y: p.y - (horiz ? 0 : e.deltaY) }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [space]);
  useEffect(() => () => cancelWheelZoom(), []);

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
    setPanelTab("design");
  };
  const editNode = (n, d, element) => {
    const bounds = element.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 24);
    const left = Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12));
    const popoverHeight = n.type === "image" ? 190 : 170;
    const top = bounds.bottom + popoverHeight + 12 < window.innerHeight
      ? bounds.bottom + 8
      : Math.max(8, bounds.top - popoverHeight - 8);
    setSelId(n.id);
    setActiveDevice(d);
    setInlineEdit({
      id: n.id,
      type: n.type,
      left,
      top,
      width,
      value: n.type === "image" ? n.props.src || "" : n.props.text || "",
      alt: n.props.alt || "",
    });
  };

  /* mutations */
  const patchId = (id, fn, key) => update((p) => (id === PAGE_ID ? { ...p, s: fn(pageNodeOf(p)).s } : { ...p, children: mapTree(p.children, id, fn) }), key && id + key);
  const saveInlineEdit = () => {
    if (!inlineEdit) return;
    const { id, type, value, alt } = inlineEdit;
    const props = type === "image" ? { src: value, alt } : { text: value };
    patchId(id, (n) => ({ ...n, props: { ...n.props, ...props } }), "inline-content");
    setInlineEdit(null);
    setSelId(null);
  };
  const closeInlineEdit = () => {
    setInlineEdit(null);
    setSelId(null);
  };
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
  /* Click-to-add in a container inserts after its first heading, or at the end if it has none. */
  const addAfterSelection = (nn) => {
    if (!selNode || selNode.id === PAGE_ID) return addNode(nn, null);
    if (selNode.type === "container") {
      const headingIndex = selNode.children.findIndex((child) => child.type === "heading");
      const index = headingIndex < 0 ? selNode.children.length : headingIndex + 1;
      update((p) => ({ ...p, children: insertInto(p.children, selNode.id, nn, index) }));
      setSelId(nn.id);
      return;
    }
    const parent = findParentId(page.children, selNode.id) ?? null;
    const list = parent == null ? page.children : findNode(page.children, parent).children;
    const idx = list.findIndex((x) => x.id === selNode.id) + 1;
    update((p) => ({ ...p, children: insertInto(p.children, parent, nn, idx) }));
    setSelId(nn.id);
  };
  const addSection = (nn) => addNode(nn, null);
  const addSectionAtDrop = (nn, e) => {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const pageFrame = target?.closest(".rp-frame");
    const sections = pageFrame ? [...pageFrame.querySelectorAll('[data-page-section="true"]')] : [];
    const targetSection = target?.closest('[data-page-section="true"]');
    let index = page.children.length;

    if (targetSection) {
      const targetIndex = page.children.findIndex((child) => child.id === targetSection.dataset.node);
      const bounds = targetSection.getBoundingClientRect();
      if (targetIndex >= 0) index = targetIndex + (e.clientY >= bounds.top + bounds.height / 2 ? 1 : 0);
    } else if (sections.length) {
      const next = sections.find((section) => {
        const bounds = section.getBoundingClientRect();
        return e.clientY < bounds.top + bounds.height / 2;
      });
      if (next) {
        const nextIndex = page.children.findIndex((child) => child.id === next.dataset.node);
        if (nextIndex >= 0) index = nextIndex;
      }
    }

    update((p) => ({ ...p, children: insertInto(p.children, null, nn, index) }));
    setSelId(nn.id);
  };
  /* where inside a container would a drop land? returns the child index and a line to draw */
  const dropSlot = (parentId, e, excludeId) => {
    const parent = findNode(page.children, parentId);
    const parentEl = e.currentTarget?.dataset?.node === parentId ? e.currentTarget : document.querySelector(`[data-node="${parentId}"]`);
    if (!parent || !parentEl) return null;
    const kids = [...parentEl.children].filter((ch) => ch.dataset.node && ch.dataset.node !== excludeId);
    const cs = window.getComputedStyle(parentEl);
    const horizontal = cs.display === "grid" || (cs.display === "flex" && cs.flexDirection.startsWith("row"));
    const coord = horizontal ? e.clientX : e.clientY;
    const target = kids.find((ch) => {
      const r = ch.getBoundingClientRect();
      return coord < (horizontal ? r.left + r.width / 2 : r.top + r.height / 2);
    });
    const siblings = parent.children.filter((ch) => ch.id !== excludeId);
    const index = target ? Math.max(0, siblings.findIndex((ch) => ch.id === target.dataset.node)) : siblings.length;
    let line;
    if (target) {
      const r = target.getBoundingClientRect();
      line = horizontal ? { left: r.left - 2, top: r.top, width: 4, height: r.height } : { left: r.left, top: r.top - 2, width: r.width, height: 4 };
    } else if (kids.length) {
      const r = kids[kids.length - 1].getBoundingClientRect();
      line = horizontal ? { left: r.right - 2, top: r.top, width: 4, height: r.height } : { left: r.left, top: r.bottom - 2, width: r.width, height: 4 };
    } else {
      const r = parentEl.getBoundingClientRect();
      line = { left: r.left + 6, top: r.top + 6, width: Math.max(0, r.width - 12), height: 4 };
    }
    return { index, line };
  };
  const insideItself = (id, parentId) => {
    if (!id) return false;
    if (id === parentId) return true;
    const moving = findNode(page.children, id);
    return !!(moving && findNode(moving.children, parentId));
  };
  const hintDrop = (e, parentId) => {
    if (insideItself(movingRef.current, parentId)) { setDropLine(null); return; }
    const slot = dropSlot(parentId, e, movingRef.current);
    if (!slot) return;
    setDropLine((old) => old && old.left === slot.line.left && old.top === slot.line.top && old.width === slot.line.width && old.height === slot.line.height ? old : slot.line);
  };
  const moveNodeTo = (id, parentId, index) => update((p) => {
    const moving = findNode(p.children, id);
    if (!moving || parentId == null || parentId === id || findNode(moving.children, parentId)) return p;
    return { ...p, children: insertInto(removeNode(p.children, id), parentId, moving, index) };
  });
  const addComponentAtDrop = (nn, parentId, e) => {
    if (parentId == null) return addSectionAtDrop(nn, e);
    const slot = dropSlot(parentId, e, null);
    update((p) => ({ ...p, children: insertInto(p.children, parentId, nn, slot ? slot.index : undefined) }));
    setSelId(nn.id);
  };
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
    const bounds = e.currentTarget.getBoundingClientRect();
    setSectionDragOutline((outline) => outline ? {
      ...outline,
      left: outline.startLeft + e.clientX - outline.startX,
      top: outline.startTop + e.clientY - outline.startY,
    } : outline);
    setDropTarget({
      id: targetId,
      position: e.clientY < bounds.top + bounds.height / 2 ? "before" : "after",
    });
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
    const moveId = e.dataTransfer.getData("text/x-move") || movingRef.current;
    if (moveId && e.dataTransfer.types.includes("text/x-move")) {
      if (parentId != null && !insideItself(moveId, parentId)) {
        const slot = dropSlot(parentId, e, moveId);
        if (slot) { moveNodeTo(moveId, parentId, slot.index); setSelId(moveId); }
      }
      movingRef.current = null;
      setDropLine(null);
      return;
    }
    const sectionKey = e.dataTransfer.getData("text/x-section");
    if (sectionKey) {
      const [sectionId, rawIndex] = sectionKey.split(":");
      const item = SECTIONS.find((section) => section.id === sectionId)?.items[Number(rawIndex)];
      if (item) addSectionAtDrop(item.build(), e);
      return;
    }
    const assetId = e.dataTransfer.getData("text/x-asset");
    if (assetId) { dropAsset(e, parentId); return; }
    const key = e.dataTransfer.getData("text/x-comp");
    const def = COMPONENTS.find((c) => c.key === key);
    if (def) addComponentAtDrop(def.build(), parentId, e);
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
    preview: false, zoom: s, selectedId: selId, activeDevice, stateTab, inlineEdit, inlineEditRef,
    changeInlineText: (id, value) => {
      setInlineEdit((edit) => edit?.id === id ? { ...edit, value } : edit);
      patchId(id, (n) => n.props.text === value ? n : ({ ...n, props: { ...n.props, text: value } }), "inline-content");
    },
    saveInlineEdit, select, editNode, drop, dropAsset,
    dropTarget, draggingSection,
    startSectionDrag: (bounds, x, y) => {
      setDraggingSection(true);
      setSectionDragOutline({
        left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height,
        startLeft: bounds.left, startTop: bounds.top, startX: x, startY: y,
      });
    },
    endSectionDrag: () => { setDraggingSection(false); setSectionDragOutline(null); setDropTarget(null); },
    dragOverNode, dropNode,
    hintDrop,
    startMove: (id) => { movingRef.current = id; },
    endMove: () => { movingRef.current = null; setDropLine(null); },
  };
  const visible = Object.keys(DEVICES).filter((d) => show[d]);

  const railBtn = (id, icon, title) => (
    <button key={id} title={title} aria-label={title} onClick={() => { if (leftTab === id && leftOpen) { setLeftOpen(false); setSectionPreviewsVisible(false); } else { setLeftTab(id); setLeftOpen(true); setSectionPreviewsVisible(false); } }}
      className={`flex h-9 w-9 items-center justify-center rounded-lg ${leftTab === id && leftOpen ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
      <Ico n={icon} />
    </button>
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#fafafa] font-sans text-gray-900"
      onClick={() => { setPop(null); setDimPop(null); }}
      onPointerDownCapture={(e) => {
        if (inlineEdit && !inlineEditRef.current?.contains(e.target)) saveInlineEdit();
      }}
    >
      {/* canvas (infinite, pannable) */}
      <div ref={canvasRef} className="absolute inset-0 overflow-hidden"
        style={{
          backgroundColor: "#fafafa",
          backgroundImage: "radial-gradient(#d4d4d8 1px, transparent 1px)",
          backgroundSize: `${16 * s}px ${16 * s}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          cursor: panning || draggingSection ? "grabbing" : space ? "grab" : "default",
        }}
        onMouseDown={onCanvasDown}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("text/x-comp") || e.dataTransfer.types.includes("text/x-asset") || e.dataTransfer.types.includes("text/x-section") || e.dataTransfer.types.includes("text/x-node") || e.dataTransfer.types.includes("text/x-move")) e.preventDefault();
          if (e.dataTransfer.types.includes("text/x-node")) {
            setSectionDragOutline((outline) => outline ? {
              ...outline,
              left: outline.startLeft + e.clientX - outline.startX,
              top: outline.startTop + e.clientY - outline.startY,
            } : outline);
          }
        }}
        onDrop={(e) => drop(e, null)}
        onClickCapture={preventPanSelection}
        onAuxClickCapture={preventPanSelection}
        onClick={() => { if (justZoomed.current) { justZoomed.current = false; return; } select(null); }}>
        <div className="absolute left-0 top-0 flex items-start"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${s})`, transformOrigin: "0 0", gap: 16 / s, width: "max-content" }}>
          <style>{FRAME_CSS}</style>
          {visible.map((d, i) => {
            const W = widths[d];
            return (
              <div key={d} data-nopan className="group relative shrink-0" style={{ width: Math.max(W, 175 / s) }} onClick={(e) => e.stopPropagation()}>
                {/* header: always screen-size, whatever the zoom */}
                <div style={{ width: W, height: 58 / s }}>
                  <div className="relative flex items-center gap-2 rounded-lg bg-white px-3 shadow-sm ring-1 ring-black/5"
                    style={{ width: Math.max(W * s, 175), height: 48, transform: `scale(${1 / s})`, transformOrigin: "0 0" }}>
                    {i === 0 && (
                      <button title="Show devices" aria-label="Show devices" onClick={(e) => { e.stopPropagation(); openDim(e, "devices"); }}
                        className="absolute flex items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5"
                        style={{ left: -60, top: 0, width: 48, height: 48 }}><Ico n="sections" /></button>
                    )}
                    <span className={`text-sm font-semibold ${activeDevice === d ? "text-blue-600" : ""}`}>{DEVICES[d].label}</span>
                    <button onClick={(e) => { e.stopPropagation(); openDim(e, "width", d); }}
                      className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">{W}px <Ico n="down" size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setPreview(d); }} title="Preview" aria-label={`Preview ${DEVICES[d].label}`}
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
                    {!page.children.length && <div className="flex h-[400px] items-center justify-center text-sm text-gray-400">Add a section from the left panel, or drop a component here.</div>}
                  </div>
                </Ctx.Provider>
              </div>
            );
          })}
          {!visible.length && (
            <div data-nopan className="flex items-center gap-3 text-sm text-gray-500">
              <button onClick={(e) => { e.stopPropagation(); openDim(e, "devices"); }} aria-label="Show devices" className="flex items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5" style={{ width: 48 / s, height: 48 / s }}><Ico n="sections" /></button>
              No device selected.
            </div>
          )}
        </div>
      </div>

      {sectionDragOutline && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-30 border-2 border-blue-500"
          style={{
            left: sectionDragOutline.left,
            top: sectionDragOutline.top,
            width: sectionDragOutline.width,
            height: sectionDragOutline.height,
          }}
        />
      )}

      {dropLine && (
        <div aria-hidden="true" className="pointer-events-none fixed z-30 rounded bg-blue-600"
          style={{ left: dropLine.left, top: dropLine.top, width: dropLine.width, height: dropLine.height }} />
      )}

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
        <button title="Page settings" aria-label="Page settings" onClick={() => setPop(pop === "settings" ? null : "settings")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 cursor-pointer"><Ico n="gear" size={16} /></button>
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
      <div className="absolute left-3 top-[76px] bottom-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-fit flex-col gap-1 rounded-xl bg-white p-1.5 shadow-md ring-1 ring-black/5">
          {railBtn("sections", "sections", "Sections")}
          {railBtn("components", "plus", "Components")}
          {railBtn("layers", "layers", "Layers")}
          {railBtn("assets", "image", "Assets")}
        </div>
        {leftOpen && (
          <div className={`flex h-full ${leftTab === "sections" && sectionPreviewsVisible ? "w-[520px] max-w-[calc(100vw-80px)]" : "w-[260px]"} flex-col overflow-hidden rounded-xl bg-white p-3 shadow-md ring-1 ring-black/5`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold capitalize">{leftTab}</span>
              <button onClick={() => { setLeftOpen(false); setSectionPreviewsVisible(false); }} aria-label="Collapse panel" className="text-gray-400 hover:text-gray-700"><Ico n="left" size={16} /></button>
            </div>
            {leftTab === "sections" && <SectionsPanel onAdd={addSection} onPreviewVisibilityChange={setSectionPreviewsVisible} />}
            {leftTab === "components" && <ComponentsPanel />}
            {leftTab === "layers" && (
              <div className="min-h-0 flex-1 overflow-y-auto">
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
          <button onClick={() => setPop(pop === "previewMenu" ? null : "previewMenu")} aria-label="Preview device menu" className="rounded-r-lg border border-l-0 border-gray-200 px-2 text-gray-500 hover:bg-gray-50"><Ico n="down" size={14} /></button>
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
              <p className="text-[11px] text-gray-500">The HTML file uses your styles, mobile/tablet overrides, hover states and sliders. Tailwind (via CDN) is included only if you used Tailwind classes.</p>
            </div>
          )}
        </div>
      </div>

      {/* bottom bar: undo / redo / zoom / fit */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl bg-white p-1.5 shadow-md ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
        <IconBtn n="undo" title="Undo (Ctrl+Z)" onClick={undo} />
        <IconBtn n="redo" title="Redo (Ctrl+Shift+Z)" onClick={redo} />
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <select aria-label="Zoom" value={Math.round(zoom)} onChange={(e) => zoomAt(+e.target.value, window.innerWidth / 2, window.innerHeight / 2)} className="rounded-md border border-gray-200 px-2 py-1 text-xs">
          {[...new Set([10, 25, 33, 50, 75, 100, 125, 150, 200, 300, 400, Math.round(zoom)])].sort((a, b) => a - b).map((z) => <option key={z} value={z}>{z}%</option>)}
        </select>
        <button onClick={fit} className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">Fit</button>
      </div>

      {/* right panel */}
      {selNode && !inlineEdit && (
        <div className="pointer-events-none absolute inset-0" onClick={(e) => e.stopPropagation()}>
          <RightPanel key={selNode.id} node={selNode} device={activeDevice} stateTab={stateTab} setStateTab={setStateTab} tab={panelTab} setTab={setPanelTab} api={api} />
        </div>
      )}

      {inlineEdit?.type === "image" && (
        <div
          ref={inlineEditRef}
          className="fixed z-50 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/10"
          style={{ left: inlineEdit.left, top: inlineEdit.top, width: inlineEdit.width }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeInlineEdit();
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveInlineEdit();
          }}
        >
          <div className="mb-2 text-xs font-semibold text-gray-700">Edit image</div>
          <div className="space-y-2">
            <Inp autoFocus value={inlineEdit.value} placeholder="Image URL" onChange={(value) => setInlineEdit((edit) => ({ ...edit, value }))} />
            <Inp value={inlineEdit.alt} placeholder="Alt text" onChange={(alt) => setInlineEdit((edit) => ({ ...edit, alt }))} />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={closeInlineEdit} className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={saveInlineEdit} className="rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-black">Save</button>
          </div>
          <p className="mt-2 text-[10px] text-gray-400">Ctrl+Enter to save · Esc to cancel</p>
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
                <style>{FRAME_CSS}</style>
                {page.children.map((n) => <Render key={n.id} n={n} device={preview} />)}
              </div>
            </Ctx.Provider>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div key={toast.id} role="status" className="pointer-events-none fixed left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow-lg" style={{ bottom: 76, zIndex: 60 }}>{toast.message}</div>
      )}
    </div>
  );
}