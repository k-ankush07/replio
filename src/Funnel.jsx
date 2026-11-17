import { Fragment, useEffect, useRef, useState } from "react";

/* ---------- helpers ---------- */
const splitPercents = (n) => {
  const base = Math.floor(1000 / n) / 10;
  const arr = Array(n).fill(base);
  arr[n - 1] = Math.round((100 - base * (n - 1)) * 10) / 10;
  return arr;
};
const fmt = (p) => `${Number.isInteger(p) ? p : p.toFixed(1)}%`;
const pctsOf = (info) =>
  info.groups
    ? info.percents?.length === info.groups
      ? info.percents
      : splitPercents(info.groups)
    : [];
const activesOf = (info) =>
  Array.from(
    { length: info.groups || 0 },
    (_, j) => info.pagesActive?.[j] ?? true,
  );

const funnelActive = (info) =>
  info.groups > 0 ? activesOf(info).some(Boolean) : true;

/* ---------- analytics (demo data) ---------- */
/* ---------- date range ---------- */
const DAY = 86400000;
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const sameDay = (a, b) => !!a && !!b && a.getTime() === b.getTime();
const fmtDay = (d) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const ALL_RANGE = { id: "all", label: "All time", from: null, to: null };
const PRESETS = [
  { id: "today", label: "Today", get: (t) => [t, t] },
  { id: "yesterday", label: "Yesterday", get: (t) => [addDays(t, -1), addDays(t, -1)] },
  { id: "7d", label: "Last 7 days", get: (t) => [addDays(t, -6), t] },
  { id: "30d", label: "Last 30 days", get: (t) => [addDays(t, -29), t] },
  { id: "month", label: "This month", get: (t) => [new Date(t.getFullYear(), t.getMonth(), 1), t] },
  {
    id: "lastMonth",
    label: "Last month",
    get: (t) => [
      new Date(t.getFullYear(), t.getMonth() - 1, 1),
      new Date(t.getFullYear(), t.getMonth(), 0),
    ],
  },
];
const rangeLabel = (r) =>
  r.id === "custom"
    ? sameDay(r.from, r.to)
      ? fmtDay(r.from)
      : `${fmtDay(r.from)} – ${fmtDay(r.to)}`
    : r.label;
// demo data scale: selected days -> factor (real app me yahan API query lagegi)
const rangeFactor = (r) => {
  if (!r.from) return 1;
  const days = Math.round((r.to - r.from) / DAY) + 1;
  return Math.min(1, Math.max(0.01, days / 120));
};

const AOV = 24.24;
const money = (n) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const buildStats = (f) => {
  const shown = Math.max(1, Math.round(7651 * f));
  const conv = Math.round(375 * f);
  const rev = conv * AOV;
  return [
    ["SHOWN", shown.toLocaleString()],
    ["CONV", conv.toLocaleString()],
    ["RATE", `${((conv / shown) * 100).toFixed(2)}%`],
    ["AOV", money(AOV)],
    ["REVENUE", money(rev), true],
    ["REV / VISIT", money(rev / shown), true],
  ];
};
const matches = (f, q) =>
  !q ||
  [f.name, f.trigType, ...(f.terms || [])].join(" ").toLowerCase().includes(q);

/* ---------- icons ---------- */
const Icon = ({ children, size = 24, sw = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);
const HomeIcon = (p) => (
  <Icon {...p}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Icon>
);
const BoltIcon = ({ size = 9 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#facc15">
    <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
  </svg>
);
const CartIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.95-1.5L23 6H6" />
  </Icon>
);
const CheckIcon = (p) => (
  <Icon {...p} sw={2.6}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
const GiftIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </Icon>
);
const GripIcon = (p) => (
  <Icon {...p} sw={2.4}>
    {[6, 12, 18].flatMap((y) =>
      [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.6" />),
    )}
  </Icon>
);
const CopyIcon = (p) => (
  <Icon {...p} sw={2}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </Icon>
);
const TrashIcon = (p) => (
  <Icon {...p} sw={2}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6M10 11v6M14 11v6" />
  </Icon>
);
const CloseIcon = (p) => (
  <Icon {...p} sw={2.2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
const FlagIcon = (p) => (
  <Icon {...p}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </Icon>
);
const ExternalIcon = ({ size = 9 }) => (
  <Icon size={size} sw={2}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Icon>
);
const SearchIcon = (p) => (
  <Icon {...p} sw={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);
const ChevronIcon = (p) => (
  <Icon {...p} sw={2}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
const CalendarIcon = (p) => (
  <Icon {...p} sw={2}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
);
const FlowIcon = (p) => (
  <Icon {...p} sw={2}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="12" r="2.5" />
    <path d="M8.5 6H12v12H8.5M12 12h3.5" />
  </Icon>
);
const TableIcon = (p) => (
  <Icon {...p} sw={2}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M3 15h18M9 4v16" />
  </Icon>
);

const MoreIcon = (p) => (
  <Icon {...p} sw={2}>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </Icon>
);
const ChevronRightIcon = (p) => (
  <Icon {...p} sw={2}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);
const SlidersIcon = (p) => (
  <Icon {...p} sw={2}>
    <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </Icon>
);
const EditIcon = (p) => (
  <Icon {...p} sw={2}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
  </Icon>
);

/* ---------- nodes ---------- */
const card =
  "rounded-xl border border-[#2b2928] bg-[#1c1b1a] shadow-[0_10px_30px_rgba(0,0,0,0.45)]";

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] ${
      active
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
        : "border-neutral-500/40 bg-neutral-500/10 text-neutral-400"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-neutral-500"}`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const StoreNode = () => (
  <div className={`${card} w-[150px] shrink-0 px-3.5 py-3.5`}>
    <div className="flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#b0614a] text-white">
        <HomeIcon size={14} />
      </div>
      <span className="text-[10px] tracking-[0.18em] text-neutral-300">
        STOREFRONT
      </span>
    </div>
    <div className="mt-3 text-[12px] font-medium text-neutral-100">
      pomence.com
    </div>
  </div>
);

const TriggerNode = ({ info, onClick, onCopy, onDragStart, dragging }) => {
  const active = funnelActive(info);
  const cls = `${card} w-full px-3.5 py-3 text-left`;
  const tool =
    "flex h-6 w-6 items-center justify-center rounded-md border border-[#3a3837] bg-[#1c1b1a] text-neutral-300 hover:border-[#b0614a] hover:text-white";
  const body = (
    <>
      <div className="flex items-center gap-1.5">
        <BoltIcon />
        <span className="text-[8px] tracking-wide text-neutral-300">
          TRIGGER
        </span>
        <span className="ml-0.5">
          <StatusBadge active={active} />
        </span>
      </div>
      <div
        className={`mt-2 truncate text-[12px] font-bold ${active ? "text-neutral-100" : "text-neutral-400"}`}
      >
        {info.name}
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[8px] text-neutral-400">
        {info.sub}
        {info.badge && (
          <span className="rounded bg-[#2d2b2a] px-1 py-0.5 text-[8px] text-neutral-300">
            {info.badge}
          </span>
        )}
      </div>
    </>
  );
  return (
    <div className="group relative w-[150px] shrink-0">
      {onCopy && (
        <div
          className={`absolute bottom-full left-0 flex gap-1 pb-1.5 transition-opacity group-hover:opacity-100 ${dragging ? "opacity-100" : "opacity-0"}`}
        >
          <button
            type="button"
            onPointerDown={onDragStart}
            title="Drag to reorder"
            className={`${tool} cursor-grab touch-none active:cursor-grabbing`}
          >
            <GripIcon size={13} />
          </button>
          <button
            type="button"
            onClick={onCopy}
            title="Duplicate funnel"
            className={`${tool} cursor-pointer`}
          >
            <CopyIcon size={13} />
          </button>
        </div>
      )}
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-haspopup="dialog"
          title="Click to edit funnel"
          className={`${cls} cursor-pointer transition hover:border-[#b0614a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b0614a]`}
        >
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </div>
  );
};

const CheckoutCard = ({
  active = true,
  selected = false,
  onClick,
  stats,
  showStats,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={onClick ? "Click to configure page" : undefined}
    className={`${card} block w-[300px] shrink-0 ${onClick ? "cursor-pointer" : "cursor-default"} p-3 text-left transition ${
      selected
        ? "ring-1 ring-[#b0614a]"
        : onClick
          ? "hover:ring-1 hover:ring-[#b0614a]/50"
          : ""
    }`}
  >
    <div
      className={`flex items-center justify-between ${showStats ? "mb-2 border-b border-[#2b2928] pb-2" : ""}`}
    >
      <div className={`flex items-center gap-2 ${active ? "" : "opacity-60"}`}>
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#262322] text-[#c0694d]">
          <CartIcon size={13} />
        </div>
        <div>
          <div className="text-[8px] text-neutral-400">Checkout page</div>
          <div className="text-[10px] font-medium text-neutral-100">
            pomence.co...
          </div>
        </div>
      </div>
      <StatusBadge active={active} />
    </div>
    {showStats && (
      <div className={`grid grid-cols-3 gap-1.5 ${active ? "" : "opacity-60"}`}>
        {stats.map(([label, value, green]) => (
          <div
            key={label}
            className="rounded-md border border-[#2b2928] bg-[#1d1c1b] py-1.5 text-center"
          >
            <div className="text-[7px] tracking-wide text-neutral-400">
              {label}
            </div>
            <div
              className={`mt-0.5 text-[12px] font-bold ${active && green ? "text-[#4ade80]" : "text-neutral-100"}`}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    )}
  </button>
);

/* ---------- pipeline ---------- */
const STEPS = [
  {
    title: "Payment Success",
    sub: "100% routed",
    icon: <CheckIcon size={18} />,
    circle: "border-[#2f7d4f] bg-[#1f3a2b] text-[#4ade80]",
    titleCls: "text-neutral-100",
    subCls: "text-[#4ade80]",
    line: "border-t-2 border-dotted border-[#8b5cf6]",
  },
  {
    title: "Upsells",
    sub: "3 dynamic steps",
    icon: <GiftIcon size={18} />,
    circle: "border-[#7c4fb8] bg-[#2a2145] text-[#c4a1ff]",
    titleCls: "text-[#b58bff]",
    subCls: "text-neutral-400",
    link: "/upsell",
    line: "bg-[#3b82d6] h-[2px]",
  },
  {
    title: "Confirmation Page",
    sub: "Custom receipt",
    icon: <FlagIcon size={18} />,
    circle: "border-[#3b6fb0] bg-[#172a47] text-[#7cc0ff]",
    titleCls: "text-[#4aa8ff]",
    subCls: "text-neutral-400",
    link: "/confirmation",
  },
];
const Pipeline = () => (
  <div className="flex shrink-0">
    {STEPS.map((s) => (
      <div
        key={s.title}
        className="relative flex w-[100px] flex-col items-center text-center"
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${s.circle}`}
        >
          {s.icon}
        </div>
        {s.link ? (
          <a
            href={s.link}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open ${s.title} in a new tab`}
            className={`mt-2 flex cursor-pointer items-center gap-1 text-[8px] font-medium hover:underline ${s.titleCls}`}
          >
            {s.title}
            <ExternalIcon />
          </a>
        ) : (
          <div
            className={`mt-2 flex items-center gap-1 text-[8px] font-medium ${s.titleCls}`}
          >
            {s.title}
          </div>
        )}
        <div className={`mt-0.5 text-[8px] ${s.subCls}`}>{s.sub}</div>
        {s.line && (
          <div
            className={`absolute top-[17px] ${s.line}`}
            style={{ left: "calc(50% + 21px)", width: "calc(100% - 42px)" }}
          />
        )}
      </div>
    ))}
  </div>
);

/* ---------- split connectors ---------- */
const LINE = "#3d3a39";
const ARROW = "#4a4746";
const R = 20; // elbow radius
const FAN_W = 84;
const TRUNK = 56;
const PCT_W = 112;
const LEFT = FAN_W + PCT_W;
const CARD_W = 300;

const chevron = (x, y) => `M${x - 6} ${y - 5} L${x} ${y} L${x - 6} ${y + 5}`;

function SplitWires({ n, h, percents }) {
  if (!(h > 0)) return null;
  const mid = Math.round(h / 2);
  const rows = Array.from({ length: n }, (_, i) =>
    Math.round(((i + 0.5) / n) * h),
  );
  const total = LEFT + CARD_W;
  const wires = [];
  const arrows = [];

  if (n > 1) wires.push(`M0 ${mid} H${TRUNK - R}`);
  rows.forEach((cy) => {
    if (Math.abs(cy - mid) < 1) {
      wires.push(`M${n > 1 ? TRUNK - R : 0} ${mid} H${LEFT}`);
    } else if (cy < mid) {
      wires.push(
        `M${TRUNK - R} ${mid} A${R} ${R} 0 0 0 ${TRUNK} ${mid - R} V${cy + R} A${R} ${R} 0 0 1 ${TRUNK + R} ${cy} H${LEFT}`,
      );
    } else {
      wires.push(
        `M${TRUNK - R} ${mid} A${R} ${R} 0 0 1 ${TRUNK} ${mid + R} V${cy - R} A${R} ${R} 0 0 0 ${TRUNK + R} ${cy} H${LEFT}`,
      );
    }
    arrows.push(chevron(LEFT, cy));
  });

  const pillX = FAN_W + PCT_W / 2;
  return (
    <svg
      width={total}
      height={h}
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      shapeRendering="geometricPrecision"
    >
      <g fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round">
        {wires.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g
        fill="none"
        stroke={ARROW}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {arrows.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {rows.map((cy, i) => (
        <g key={i}>
          <rect
            x={pillX - 22}
            y={cy - 8}
            width="44"
            height="16"
            rx="8"
            fill="#1c1b1a"
            stroke="#3a3837"
          />
          <text
            x={pillX}
            y={cy}
            fill="#d4d4d4"
            fontSize="8"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {fmt(percents[i])}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- storefront -> triggers, blocks -> pipeline ---------- */
const fanWidth = (n) => 80 + 14 * Math.max(0, n - 2);

const Wires = ({ w, h, paths, arrows, className = "shrink-0" }) => (
  <svg
    width={w}
    height={h}
    className={`${className} overflow-visible`}
    shapeRendering="geometricPrecision"
  >
    <g fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round">
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
    <g
      fill="none"
      stroke={ARROW}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {arrows.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  </svg>
);

function FanIn({ h, ys }) {
  const W = fanWidth(ys.length);
  if (!(h > 0)) return <div style={{ width: W }} className="shrink-0" />;
  const mid = Math.round(h / 2);
  const up = ys.filter((y) => y < mid - 1).sort((a, b) => b - a);
  const dn = ys.filter((y) => y > mid + 1).sort((a, b) => a - b);
  const paths = ys
    .filter((y) => Math.abs(y - mid) <= 1)
    .map(() => `M0 ${mid} H${W}`);
  [
    [up, -1],
    [dn, 1],
  ].forEach(([list, s]) =>
    list.forEach((y0, rank) => {
      const y = Math.round(y0);
      const r = Math.min(R, Math.abs(y - mid) / 2);
      const x = R + 14 * (list.length - 1 - rank);
      paths.push(
        `M0 ${mid} H${x - r} A${r} ${r} 0 0 ${s < 0 ? 0 : 1} ${x} ${mid + s * r} V${y - s * r} A${r} ${r} 0 0 ${s < 0 ? 1 : 0} ${x + r} ${y} H${W}`,
      );
    }),
  );
  return (
    <Wires
      w={W}
      h={h}
      paths={paths}
      arrows={ys.map((y) => chevron(W, Math.round(y)))}
    />
  );
}

const TRIG_W = 150;
const MSTEP = 10;

// every checkout card gets its own line into the pipeline
function layoutMerge(h, pts, colW) {
  if (!(h > 0) || !pts.length) return { W: 60, paths: [], arrows: [] };
  const mid = Math.round(h / 2);
  const up = pts.filter((p) => p.y < mid - 1).sort((a, b) => b.y - a.y);
  const dn = pts.filter((p) => p.y > mid + 1).sort((a, b) => a.y - b.y);
  const W = 60 + MSTEP * 2 * Math.max(up.length, dn.length);
  const end = colW + W;
  const paths = pts
    .filter((p) => Math.abs(p.y - mid) <= 1)
    .map((p) => `M${p.x} ${mid} H${end}`);
  [
    [up, -1],
    [dn, 1],
  ].forEach(([list, s]) =>
    list.forEach((p, rank) => {
      const y = Math.round(p.y);
      const r = Math.min(R, Math.abs(y - mid) / 2);
      const x = colW + R + 8 + MSTEP * (2 * rank + (s < 0 ? 0 : 1));
      paths.push(
        `M${p.x} ${y} H${x - r} A${r} ${r} 0 0 ${s < 0 ? 1 : 0} ${x} ${y - s * r} V${mid + s * r} A${r} ${r} 0 0 ${s < 0 ? 0 : 1} ${x + r} ${mid} H${end}`,
      );
    }),
  );
  return { W, paths, arrows: [chevron(end, mid)] };
}

/* ---------- one trigger + its checkout card(s) ---------- */
function Block({
  info,
  groups,
  stats,
  showStats,
  onEdit,
  onInfo,
  onAdd,
  onCopy,
  onDragStart,
  onPage,
  selectedPage,
  dragY,
  dragging,
  target,
}) {
  const [rowsEl, setRowsEl] = useState(null);
  const [h, setH] = useState(0);
  const split = groups > 0;
  // An unsplit funnel still shows ONE checkout card that gets 100% of the traffic
  const n = split ? groups : 1;
  const percents = split ? pctsOf(info) : [100];
  const actives = split ? activesOf(info) : [true];

  useEffect(() => {
    if (!rowsEl) return;
    const update = () => setH(rowsEl.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(rowsEl);
    return () => ro.disconnect();
  }, [rowsEl, groups]);

  return (
    <div
      style={
        dragY != null
          ? { transform: `translateY(${dragY}px)`, zIndex: 20 }
          : undefined
      }
      className={`relative flex items-center ${dragging ? "opacity-80" : ""} ${target ? "rounded-xl outline-dashed outline-1 outline-offset-4 outline-[#b0614a]/70" : ""}`}
    >
      <TriggerNode
        info={info}
        onClick={onEdit ?? onInfo}
        onCopy={onCopy}
        onDragStart={onDragStart}
        dragging={dragging}
      />
      <div className="relative flex shrink-0 items-center">
        <div style={{ width: LEFT }} />
        <div ref={setRowsEl} className="flex flex-col">
          {percents.map((_, i) => (
            <div key={i} className="py-2">
              <CheckoutCard
                active={actives[i]}
                selected={split && selectedPage === i}
                onClick={split ? () => onPage(i) : onEdit}
                stats={stats}
                showStats={showStats}
              />
            </div>
          ))}
        </div>
        <SplitWires n={n} h={h} percents={percents} />
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            style={{ left: LEFT, width: CARD_W }}
            className="absolute top-full mt-1 cursor-pointer rounded-xl border border-dashed border-[#b0614a]/60 py-2.5 text-[10px] text-[#d08b73] transition hover:bg-[#b0614a]/10"
          >
            {split ? "+ Split test another page" : "+ Split test this page"}
          </button>
        )}
      </div>
      <div className="min-w-[24px] flex-1" />
    </div>
  );
}

/* ---------- checkout page side panel ---------- */
function PagePanel({ funnel, page, onToggle, onRemove, onClose }) {
  const percent = pctsOf(funnel)[page];
  const active = activesOf(funnel)[page];

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed right-6 top-36 z-40 w-[300px] rounded-xl border border-[#2b2928] bg-[#1c1b1a] p-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#2b2928] pb-2.5">
        <span className="text-[12px] font-bold text-neutral-100">
          Checkout page
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-neutral-400 hover:bg-[#2b2928] hover:text-white"
        >
          <CloseIcon size={13} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="truncate text-[13px] font-bold text-neutral-100">
          {funnel.name} · Page {page + 1}
        </span>
        <StatusBadge active={active} />
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-neutral-400">
        How this page serves inside the funnel: its share of the split and
        whether it takes traffic at all.
      </p>

      <div className="mt-3 rounded-lg border border-[#2b2928] bg-[#1d1c1b] p-3">
        <div className="text-[9px] tracking-wide text-neutral-400">
          TRAFFIC ALLOCATION
        </div>
        <div
          className={`mt-1 text-[18px] font-bold ${active ? "text-neutral-100" : "text-neutral-500"}`}
        >
          {fmt(percent)}
        </div>
        <div className="mt-1 text-[9px] text-neutral-500">
          Change the split from Edit funnel (click the trigger).
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-[#2b2928] bg-[#1d1c1b] p-3">
        <div>
          <div className="text-[11px] font-medium text-neutral-100">
            Takes traffic
          </div>
          <div className="mt-0.5 text-[9px] leading-snug text-neutral-400">
            An inactive page keeps its place in the split but serves nothing.
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => onToggle(!active)}
          className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition ${active ? "bg-emerald-500" : "bg-[#3a3837]"}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${active ? "left-[18px]" : "left-0.5"}`}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onRemove}
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-red-500/40 px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-500/10"
        >
          <TrashIcon size={12} />
          Remove from funnel
        </button>
        <span className="text-[9px] leading-snug text-neutral-500">
          Detaches it; the page survives.
        </span>
      </div>
    </div>
  );
}

/* ---------- add / edit funnel popup ---------- */
const TRIGGER_TYPES = [
  "Product Name Contains",
  "Product Tag Is",
  "Collection Is",
  "Product Type Is",
  "Vendor Is",
];
const STORE_TEMPLATES = [
  "Stas 1",
  "stas 3",
  "stas 2",
  "stas 4 - products on checkout",
  "Image uploader testing",
  "Test",
  "volttora.com - checkout (VIP)",
  "volttora.com - checkout (Guest)",
  "offer.volttora.com - Checkout",
];
const REIGN_TEMPLATES = [
  "Subscription Classic",
  "Subscription Express",
  "One-page Minimal",
  "Two-step Trust",
  "Bundle Builder",
  "Upsell Focus",
];

const EyeIcon = (p) => (
  <Icon {...p} sw={2}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

const Pill = ({ children, tone = "gray" }) => (
  <span
    className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
      tone === "amber"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
        : "border-[#3a3837] bg-[#1d1c1b] text-neutral-300"
    }`}
  >
    {children}
  </span>
);

const RadioCard = ({ on, title, desc, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-1 cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition ${
      on
        ? "border-[#b0614a] bg-[#b0614a]/10"
        : "border-[#2b2928] bg-[#1d1c1b] hover:border-[#3a3837]"
    }`}
  >
    <span
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        on ? "border-[#b0614a]" : "border-[#4a4746]"
      }`}
    >
      {on && <span className="h-2 w-2 rounded-full bg-[#b0614a]" />}
    </span>
    <span>
      <span className="block text-[13px] font-semibold text-white">
        {title}
      </span>
      <span className="mt-1 block text-[12px] leading-relaxed text-neutral-400">
        {desc}
      </span>
    </span>
  </button>
);

const Thumb = () => (
  <div className="flex h-24 w-full flex-col gap-1.5 rounded-md border border-[#2b2928] bg-[#161515] p-2">
    <div className="h-2 w-1/3 rounded bg-[#2b2928]" />
    <div className="flex flex-1 gap-1.5">
      <div className="flex-1 space-y-1.5">
        <div className="h-2 rounded bg-[#2b2928]" />
        <div className="h-2 rounded bg-[#2b2928]" />
        <div className="h-2 w-2/3 rounded bg-[#2b2928]" />
      </div>
      <div className="w-1/3 rounded bg-[#232120]" />
    </div>
    <div className="h-3 rounded bg-[#b0614a]/40" />
  </div>
);

const redistribute = (rows) => {
  const a = rows.filter((r) => r.active).length;
  const sp = splitPercents(Math.max(a, 1));
  let k = 0;
  return rows.map((r) => ({ ...r, pct: r.active ? sp[k++] : 0 }));
};

function FunnelWizard({ initial, onSave, onDelete, onClose }) {
  const editing = !!initial;
  const [stepId, setStepId] = useState(editing ? "trigger" : "type");
  const [type, setType] = useState(initial?.type ?? "subscriptions");
  const [name, setName] = useState(initial?.rawName ?? "");
  const [trigType, setTrigType] = useState(
    initial?.trigType ?? TRIGGER_TYPES[0],
  );
  const [terms, setTerms] = useState(initial?.terms ?? []);
  const [term, setTerm] = useState("");
  const [source, setSource] = useState("store");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(initial?.selected ?? []);
  const [custom, setCustom] = useState(initial?.custom ?? null);
  const [rows, setRows] = useState(() => {
    if (!initial?.selected || initial.groups < 2) return [];
    const p = pctsOf(initial);
    const a = activesOf(initial);
    return initial.selected
      .slice(0, initial.groups)
      .map((n, i) => ({ name: n, pct: p[i], active: a[i] }));
  });

  // `split` must be declared before any hook that depends on it
  const split = selected.length > 1;
  const steps = [
    { id: "type", label: "Funnel type" },
    { id: "trigger", label: "Trigger" },
    { id: "select", label: "Checkout selection" },
    { id: "custom", label: "Customize" },
    ...(split ? [{ id: "split", label: "Split test" }] : []),
    { id: "review", label: "Review" },
  ];
  const idx = Math.max(
    0,
    steps.findIndex((s) => s.id === stepId),
  );

  // keep the active step centred in the (scrollbar-less) stepper
  const stepperRef = useRef(null);
  const curRef = useRef(null);
  useEffect(() => {
    const box = stepperRef.current;
    const cur = curRef.current;
    if (!box || !cur) return;
    const id = requestAnimationFrame(() => {
      const left = cur.offsetLeft - box.clientWidth / 2 + cur.clientWidth / 2;
      box.scrollTo({ left, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [stepId, split]);

  const activeSum =
    Math.round(
      rows.filter((r) => r.active).reduce((a, r) => a + r.pct, 0) * 10,
    ) / 10;
  const splitOk = rows.some((r) => r.active) && activeSum === 100;

  const valid =
    stepId === "type" ||
    (stepId === "trigger" && (terms.length > 0 || term.trim() !== "")) ||
    (stepId === "select" && selected.length > 0) ||
    (stepId === "custom" && custom !== null) ||
    (stepId === "split" && splitOk) ||
    stepId === "review";

  const finalRows = split
    ? rows
    : selected.map((n) => ({ name: n, pct: 100, active: true }));
  const trigName = name.trim() || trigType;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = (to) => {
    if (to === "split") {
      setRows((r) => {
        const same =
          r.length === selected.length &&
          r.every((x) => selected.includes(x.name));
        if (same) return r;
        return redistribute(
          selected.map((n) => ({
            name: n,
            pct: 0,
            active: r.find((x) => x.name === n)?.active ?? true,
          })),
        );
      });
    }
    setStepId(to);
  };
  const next = () => {
    if (stepId === "trigger" && term.trim()) addTerm();
    if (idx < steps.length - 1) go(steps[idx + 1].id);
  };
  const back = () => idx > 0 && setStepId(steps[idx - 1].id);

  const addTerm = () => {
    const t = term.trim();
    if (t && !terms.includes(t)) setTerms([...terms, t]);
    setTerm("");
  };
  const toggleTpl = (n) =>
    setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  const toggleRow = (i) =>
    setRows((r) =>
      redistribute(
        r.map((x, k) => (k === i ? { ...x, active: !x.active } : x)),
      ),
    );

  // edited row stays fixed, the other active rows auto-adjust so the total stays 100%
  const setRowPct = (i, v) =>
    setRows((r) => {
      const val = Math.min(100, Math.max(0, Math.round(v * 10) / 10));
      const others = r.map((_, k) => k).filter((k) => k !== i && r[k].active);
      if (!others.length) {
        return r.map((x, k) => (k === i ? { ...x, pct: 100 } : x));
      }
      const remaining = Math.round((100 - val) * 10) / 10;
      const oldSum = others.reduce((a, k) => a + r[k].pct, 0);
      const weights =
        oldSum > 0
          ? others.map((k) => r[k].pct / oldSum)
          : others.map(() => 1 / others.length);
      const nextRows = r.map((x) => ({ ...x }));
      nextRows[i].pct = val;
      let used = 0;
      others.forEach((k, n) => {
        if (n === others.length - 1) {
          nextRows[k].pct = Math.round((remaining - used) * 10) / 10;
        } else {
          const p = Math.round(weights[n] * remaining * 10) / 10;
          nextRows[k].pct = p;
          used += p;
        }
      });
      return nextRows;
    });

  const removeRow = (i) => {
    const n = rows[i].name;
    const left = rows.filter((_, k) => k !== i);
    setSelected((s) => s.filter((x) => x !== n));
    if (left.length < 2) setStepId("review");
    else setRows(redistribute(left));
  };

  const save = () =>
    onSave({
      name: trigName,
      rawName: name,
      type,
      trigType,
      terms,
      selected,
      custom,
      sub: `${terms.length} term${terms.length > 1 ? "s" : ""}`,
      badge: type === "subscriptions" ? "Subscription" : undefined,
      groups: split ? finalRows.length : 0,
      percents: split ? finalRows.map((r) => r.pct) : undefined,
      pagesActive: split ? finalRows.map((r) => r.active) : undefined,
    });

  const list = (source === "store" ? STORE_TEMPLATES : REIGN_TEMPLATES).filter(
    (t) => t.toLowerCase().includes(search.toLowerCase()),
  );

  const title = {
    type: "Checkout funnel type",
    trigger: "When does the checkout trigger?",
    select: "Select your checkout",
    custom: "Customize your templates",
    split: "Split test your checkouts",
    review: `${trigName} · Review`,
  }[stepId];
  const desc = {
    type: "Is this checkout funnel for subscriptions or direct sales? The choice decides which templates it can route to.",
    trigger:
      "Pick what a customer's cart must contain for this checkout to show. If more than one funnel matches, the most specific trigger wins.",
    select:
      "Pick the checkout templates this funnel routes to. Selecting more than one adds a split-test step.",
    custom: "Want to change anything on the pages this funnel routes to?",
    split:
      "More than one checkout is selected, so the funnel split tests them. Active templates split the traffic; the split must total 100%.",
    review:
      "What Save funnel commits: the type, the matching rule and the routing it drives.",
  }[stepId];

  const inner = "rounded-xl border border-[#2b2928] bg-[#1d1c1b]";
  const field =
    "w-full select-text rounded-lg border border-[#2b2928] bg-[#161515] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-neutral-500 focus:border-[#b0614a]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add checkout funnel"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-[760px] max-w-full flex-col overflow-hidden rounded-xl border border-[#2b2928] bg-[#1c1b1a] text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        {/* header */}
        <div className="shrink-0 border-b border-[#2b2928]">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-[18px] font-medium text-white">
              Checkout funnel
            </span>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-[#2b2928] text-neutral-300 transition hover:bg-[#2b2928] hover:text-white"
            >
              <CloseIcon size={16} />
            </button>
          </div>
          <div
            ref={stepperRef}
            className="relative flex items-center gap-3 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {steps.map((s, i) => {
              const done = i < idx;
              const cur = i === idx;
              return (
                <div
                  key={s.id}
                  ref={cur ? curRef : null}
                  className="flex shrink-0 items-center gap-3"
                >
                  <div
                    className={`flex items-center gap-2 ${editing ? "cursor-pointer" : ""}`}
                    onClick={() => editing && go(s.id)}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                        done
                          ? "bg-emerald-500 text-white"
                          : cur
                            ? "bg-[#b0614a] text-white"
                            : "border border-[#3a3837] text-neutral-500"
                      }`}
                    >
                      {done ? <CheckIcon size={12} /> : i + 1}
                    </span>
                    <span
                      className={`text-[12px] ${cur ? "font-semibold text-white" : done ? "text-neutral-200" : "text-neutral-500"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <span className="h-px w-5 bg-[#3a3837]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="border-b border-[#2b2928] px-6 py-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-[20px] font-semibold text-white">{title}</h2>
              <Pill>pomence.com</Pill>
              <Pill tone="amber">
                {type === "subscriptions" ? "Subscriptions" : "Direct sales"}
              </Pill>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
              {desc}
            </p>
          </div>

          <div className="space-y-4 px-6 py-5">
            {/* 1. type */}
            {stepId === "type" && (
              <>
                <div className="flex gap-3">
                  <RadioCard
                    on={type === "direct"}
                    onClick={() => setType("direct")}
                    title="Direct sales"
                    desc="One-time purchases. Templates filter to direct-sale checkouts; your store's own templates always show."
                  />
                  <RadioCard
                    on={type === "subscriptions"}
                    onClick={() => setType("subscriptions")}
                    title="Subscriptions"
                    desc="Recurring billing. Templates filter to subscription-ready checkouts; your store's own templates always show."
                  />
                </div>
                <div className={`${inner} p-4`}>
                  <div className="text-[13px] font-semibold text-white">
                    Funnel name
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional — defaults to the trigger"
                    className={`${field} mt-2`}
                  />
                </div>
                {type === "subscriptions" && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#b0614a]/40 bg-[#b0614a]/10 px-4 py-3 text-[12px] text-neutral-200">
                    <span>
                      A subscription checkout does not enroll anyone by itself.
                      Enrollment is decided by the store's subscription plans.
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[#d08b73]">
                      Subscription plans <ExternalIcon size={11} />
                    </span>
                  </div>
                )}
              </>
            )}

            {/* 2. trigger */}
            {stepId === "trigger" && (
              <>
                <div className={`${inner} p-4`}>
                  <div className="mb-3 flex items-center gap-2 text-[12px] text-neutral-400">
                    <span className="rounded-full bg-[#b0614a]/20 px-2 py-0.5 text-[10px] font-semibold text-[#d08b73]">
                      L1
                    </span>
                    Primary
                  </div>
                  <div className="text-[13px] font-semibold text-white">
                    Select Checkout Trigger
                  </div>
                  <select
                    value={trigType}
                    onChange={(e) => setTrigType(e.target.value)}
                    className={`${field} mt-2 cursor-pointer`}
                  >
                    {TRIGGER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <div className="mt-4 text-[13px] font-semibold text-white">
                    Trigger Conditions
                  </div>
                  <input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onBlur={addTerm}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTerm();
                      }
                    }}
                    placeholder="Type a term, press Enter"
                    className={`${field} mt-2`}
                  />
                  {terms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {terms.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1.5 rounded-full border border-[#b0614a]/50 bg-[#b0614a]/10 px-2.5 py-1 text-[12px] text-white"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() =>
                              setTerms(terms.filter((x) => x !== t))
                            }
                            className="cursor-pointer text-neutral-300 hover:text-white"
                          >
                            <CloseIcon size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 text-[11px] text-neutral-500">
                    Press Enter to add each value.
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-[#3a3837] py-3 text-center text-[12px] text-neutral-500">
                  + Add AND condition
                </div>
                <div className="flex items-center justify-between border-t border-[#2b2928] pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (editing && onDelete) return onDelete();
                      setTerms([]);
                      setTerm("");
                    }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md border border-red-500/40 px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-500/10"
                  >
                    <TrashIcon size={13} />
                    Delete trigger
                  </button>
                  <span className="text-[11px] text-neutral-500">
                    Removes this trigger and its routing.
                  </span>
                </div>
              </>
            )}

            {/* 3. select */}
            {stepId === "select" && (
              <>
                <div className="flex gap-3">
                  <RadioCard
                    on={source === "store"}
                    onClick={() => setSource("store")}
                    title="Store templates"
                    desc="Checkout pages from this store, or a copy of one from another store."
                  />
                  <RadioCard
                    on={source === "reign"}
                    onClick={() => setSource("reign")}
                    title="Reign templates"
                    desc="Stock designs for this funnel type. Picking one creates a new page from it."
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] tracking-wide text-neutral-400">
                    {source === "store" ? "STORE" : "REIGN"} TEMPLATES{" "}
                    <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-400">
                      {selected.length} selected
                    </span>
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates"
                    className={`${field} !w-48 !py-1.5 !text-[12px]`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {list.map((t) => {
                    const on = selected.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTpl(t)}
                        className={`relative cursor-pointer rounded-xl border p-2 text-left transition ${
                          on
                            ? "border-[#b0614a] bg-[#b0614a]/10"
                            : "border-[#2b2928] bg-[#1d1c1b] hover:border-[#3a3837]"
                        }`}
                      >
                        {on && (
                          <span className="absolute left-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <CheckIcon size={11} />
                          </span>
                        )}
                        <Thumb />
                        <div className="mt-2 truncate text-[12px] font-medium text-white">
                          {t}
                        </div>
                        <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                          Live
                        </span>
                      </button>
                    );
                  })}
                  {list.length === 0 && (
                    <div className="col-span-3 py-6 text-center text-[12px] text-neutral-500">
                      No templates found.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 4. customize */}
            {stepId === "custom" && (
              <div className="flex gap-3">
                <RadioCard
                  on={custom === "approve"}
                  onClick={() => setCustom("approve")}
                  title="No, brand it and approve"
                  desc="Your store logo is applied automatically and the pages are ready for the next step. You can always edit them later from the checkout pages list."
                />
                <RadioCard
                  on={custom === "edit"}
                  onClick={() => setCustom("edit")}
                  title="Yes, I want to edit the pages"
                  desc="Your logo is applied automatically here too. The page builder opens right here to fine-tune each page before it goes live."
                />
              </div>
            )}

            {/* 5. split */}
            {stepId === "split" && (
              <>
                <div className={`${inner} divide-y divide-[#2b2928]`}>
                  {rows.map((r, i) => (
                    <div
                      key={r.name}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-white">
                        <span className="truncate">{r.name}</span>
                        <EyeIcon size={14} />
                      </span>
                      <div className="flex shrink-0 items-center gap-3">
                        <div
                          className={`flex w-24 items-center rounded-lg border border-[#2b2928] bg-[#161515] px-2 py-1.5 ${r.active ? "" : "opacity-50"}`}
                        >
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            disabled={!r.active}
                            value={r.pct}
                            onChange={(e) =>
                              setRowPct(i, parseFloat(e.target.value) || 0)
                            }
                            className="w-full select-text bg-transparent text-right text-[13px] text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="ml-1 text-[12px] text-neutral-400">
                            %
                          </span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={r.active}
                          onClick={() => toggleRow(i)}
                          className={`relative h-5 w-9 cursor-pointer rounded-full transition ${r.active ? "bg-emerald-500" : "bg-[#3a3837]"}`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${r.active ? "left-[18px]" : "left-0.5"}`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          title="Remove"
                          className="cursor-pointer text-neutral-400 hover:text-white"
                        >
                          <CloseIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRows((r) => redistribute(r))}
                    className="cursor-pointer text-[12px] text-[#d08b73] hover:underline"
                  >
                    Equal split
                  </button>
                  <span
                    className={`text-[12px] font-medium ${splitOk ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {!rows.some((r) => r.active)
                      ? "At least one checkout must take traffic."
                      : `Total: ${fmt(activeSum)}${splitOk ? "" : " (must be 100%)"}`}
                  </span>
                </div>
              </>
            )}

            {/* 6. review */}
            {stepId === "review" && (
              <>
                <div className={`${inner} divide-y divide-[#2b2928] px-4`}>
                  {[
                    [
                      "Funnel type",
                      type === "subscriptions"
                        ? "Subscriptions"
                        : "Direct sales",
                    ],
                    ["Funnel name", trigName],
                    [`L1 · ${trigType}`, terms.join(", ")],
                    [
                      "Customize",
                      custom === "edit"
                        ? "Edit pages after save"
                        : "Brand & approve",
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between gap-4 py-3 text-[13px]"
                    >
                      <span className="text-neutral-400">{k}</span>
                      <span className="truncate font-medium text-white">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div className={`${inner} divide-y divide-[#2b2928] px-4`}>
                  {finalRows.map((r) => (
                    <div
                      key={r.name}
                      className="flex items-center justify-between gap-4 py-3 text-[13px]"
                    >
                      <span className="text-neutral-400">{r.name}</span>
                      <span className="font-medium text-white">
                        {fmt(r.active ? r.pct : 0)} of traffic
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#2b2928] px-6 py-4">
          {idx > 0 ? (
            <button
              type="button"
              onClick={back}
              className="cursor-pointer rounded-md border border-[#3a3837] px-5 py-2 text-[12px] font-medium text-neutral-200 hover:border-neutral-500"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {stepId === "review" ? (
            <button
              type="button"
              onClick={save}
              className="cursor-pointer rounded-md bg-[#b0614a] px-6 py-2 text-[12px] font-semibold text-white transition hover:bg-[#c26f56]"
            >
              Save funnel
            </button>
          ) : (
            <button
              type="button"
              disabled={!valid}
              onClick={next}
              className="cursor-pointer rounded-md bg-[#b0614a] px-6 py-2 text-[12px] font-semibold text-white transition hover:bg-[#c26f56] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- info popup (default trigger only) ---------- */
const InfoIcon = (p) => (
  <Icon {...p} sw={2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Icon>
);

function DefaultTriggerModal({ name, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${name} trigger`}
        onClick={(e) => e.stopPropagation()}
        className="w-[640px] max-w-full overflow-hidden rounded-xl border border-[#2b2928] bg-[#1c1b1a] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between border-b border-[#2b2928] px-6 py-5">
          <span className="text-[18px] font-medium text-neutral-100">
            Default trigger
          </span>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition hover:bg-[#2b2928] hover:text-white"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-semibold text-neutral-100">
              {name} · Trigger
            </h2>
            <span className="rounded-full border border-[#3a3837] bg-[#1d1c1b] px-2.5 py-0.5 text-[11px] text-neutral-300">
              pomence.com
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-[#2b2928] bg-[#1d1c1b] px-5 py-4 text-[13px] leading-relaxed text-neutral-400">
            <p>
              <b className="font-semibold text-neutral-100">{name}</b> is the
              store's fallback: it fires when no other trigger matches, so every
              visitor always reaches a checkout.
            </p>
            <p className="mt-3">
              It was created with the store and can't be edited or removed.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#2b2928] px-6 py-4">
          <div className="flex items-center gap-2 text-[12px] text-neutral-400">
            <InfoIcon size={14} />
            This trigger is read-only.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md bg-[#b0614a] px-6 py-2 text-[12px] font-semibold text-white transition hover:bg-[#c26f56]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- header, range select, table ---------- */
function RangeSelect({ value, onChange }) {
  const today = startOfDay(new Date());
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [anchor, setAnchor] = useState(null); // first click of a custom range
  const [hover, setHover] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => !ref.current?.contains(e.target) && setOpen(false);
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [open]);

  const toggle = () => {
    if (!open) {
      const base = value.to ?? today;
      setMonth(new Date(base.getFullYear(), base.getMonth(), 1));
      setAnchor(null);
      setHover(null);
    }
    setOpen((o) => !o);
  };
  const choose = (r) => {
    onChange(r);
    setOpen(false);
  };
  const pick = (d) => {
    if (!anchor) return setAnchor(d);
    const [a, b] = d < anchor ? [d, anchor] : [anchor, d];
    setAnchor(null);
    choose({ id: "custom", from: a, to: b });
  };

  // preview range (while picking) or the saved range
  let lo = value.from;
  let hi = value.to;
  if (anchor) {
    const e = hover ?? anchor;
    [lo, hi] = e < anchor ? [e, anchor] : [anchor, e];
  }

  // always 6 weeks, like the design
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  const cells = Array.from({ length: 42 }, (_, k) => addDays(gridStart, k));
  const shift = (n) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#2b2928] bg-[#1c1b1a] px-3 py-1.5 text-[11px] text-neutral-200 hover:border-[#3a3837]"
      >
        <CalendarIcon size={13} />
        {rangeLabel(value)}
        <ChevronIcon size={12} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 flex w-[480px] overflow-hidden rounded-2xl border border-[#2b2928] bg-[#1c1b1a] shadow-2xl">
          {/* presets */}
          <div className="w-[150px] shrink-0 space-y-0.5 border-r border-[#2b2928] p-3">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const [from, to] = p.get(today);
                  choose({ id: p.id, label: p.label, from, to });
                }}
                className={`block w-full cursor-pointer rounded-md px-2 py-2 text-left text-[12px] font-medium hover:bg-[#2b2928] ${
                  value.id === p.id ? "text-[#d08b73]" : "text-neutral-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* calendar */}
          <div className="min-w-0 flex-1">
            <div className="p-4 pb-2">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => shift(-1)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 hover:bg-[#2b2928] hover:text-white"
                >
                  <span className="rotate-180">
                    <ChevronRightIcon size={15} />
                  </span>
                </button>
                <span className="text-[13px] font-semibold text-white">
                  {month.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => shift(1)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 hover:bg-[#2b2928] hover:text-white"
                >
                  <ChevronRightIcon size={15} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div
                    key={d}
                    className="py-1.5 text-[10px] font-semibold text-neutral-500"
                  >
                    {d}
                  </div>
                ))}
                {cells.map((d) => {
                  const out = d.getMonth() !== month.getMonth();
                  const inRange = lo && hi && d >= lo && d <= hi;
                  const edge = sameDay(d, lo) || sameDay(d, hi);
                  return (
                    <button
                      key={d.getTime()}
                      type="button"
                      onClick={() => pick(d)}
                      onMouseEnter={() => setHover(d)}
                      className={`mx-auto flex h-8 w-full cursor-pointer items-center justify-center text-[12px] font-medium transition ${
                        edge
                          ? "rounded-md bg-[#b0614a] text-white"
                          : inRange
                            ? "bg-[#b0614a]/20 text-white"
                            : out
                              ? "rounded-md text-neutral-600 hover:bg-[#2b2928]"
                              : "rounded-md text-neutral-100 hover:bg-[#2b2928]"
                      } ${sameDay(d, today) && !edge ? "ring-1 ring-[#3a3837]" : ""}`}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => choose(ALL_RANGE)}
              className={`block w-full cursor-pointer border-t border-[#2b2928] py-2.5 text-center text-[12px] font-medium hover:bg-[#2b2928] ${
                value.id === "all" ? "text-[#d08b73]" : "text-neutral-400"
              }`}
            >
              All dates
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({
  tab,
  setTab,
  mode,
  setMode,
  query,
  setQuery,
  range,
  setRange,
  analytics,
  setAnalytics,
  zoomPct,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFit,
  onAdd,
}) {
  const tabs = [
    ["funnels", "Checkout Funnels"],
    ["pages", "Checkout Pages"],
    ["settings", "Settings"],
  ];
  const flow = mode === "flow";
  const seg = (on) =>
    `flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition ${
      on ? "bg-[#b0614a] text-white" : "text-neutral-400 hover:text-white"
    }`;
  const zb =
    "h-6 w-6 cursor-pointer rounded hover:bg-[#2b2928] disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="z-30 shrink-0 border-b border-[#2b2928] bg-[#0f0e0e]">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] font-semibold text-white">
            Checkout Funnels
          </h1>
          <span className="rounded-full border border-[#b0614a]/50 bg-[#b0614a]/10 px-2 py-0.5 text-[9px] text-[#d08b73]">
            Updated just now
          </span>
          <span className="text-[11px] text-neutral-500">pomence.com</span>
        </div>
        <div className="flex items-center gap-1">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-[11px] transition ${
                tab === id
                  ? "bg-[#b0614a] text-white"
                  : "text-neutral-400 hover:bg-[#1c1b1a] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "funnels" && (
        <div className="flex items-center justify-between gap-4 px-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-[#2b2928] bg-[#1c1b1a] p-0.5">
              <button
                type="button"
                onClick={() => setMode("flow")}
                className={seg(flow)}
              >
                <FlowIcon size={13} /> Flow
              </button>
              <button
                type="button"
                onClick={() => setMode("table")}
                className={seg(!flow)}
              >
                <TableIcon size={13} /> Table
              </button>
            </div>
            <div className="flex w-56 items-center gap-2 rounded-lg border border-[#2b2928] bg-[#1c1b1a] px-3 py-1.5 text-neutral-500 focus-within:border-[#b0614a]">
              <SearchIcon size={13} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search funnels..."
                className="w-full select-text bg-transparent text-[11px] text-white outline-none placeholder:text-neutral-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="cursor-pointer hover:text-white"
                >
                  <CloseIcon size={11} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RangeSelect value={range} onChange={setRange} />
            <div className="flex items-center gap-2 rounded-lg border border-[#2b2928] bg-[#1c1b1a] px-3 py-1.5 text-[11px] text-neutral-200">
              Analytics
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics(!analytics)}
                className={`relative h-4 w-7 cursor-pointer rounded-full transition ${analytics ? "bg-[#b0614a]" : "bg-[#3a3837]"}`}
              >
                <span
                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${analytics ? "left-[14px]" : "left-0.5"}`}
                />
              </button>
            </div>
            <div className="flex items-center gap-0.5 rounded-lg border border-[#2b2928] bg-[#1c1b1a] p-0.5 text-[11px] text-neutral-200">
              <button
                type="button"
                disabled={!flow}
                onClick={onZoomOut}
                className={zb}
                title="Zoom out (Ctrl -)"
              >
                −
              </button>
              <button
                type="button"
                disabled={!flow}
                onClick={onZoomReset}
                className="w-11 cursor-pointer rounded py-1 hover:bg-[#2b2928] disabled:cursor-not-allowed disabled:opacity-40"
                title="Reset to 100%"
              >
                {flow ? `${zoomPct}%` : "—"}
              </button>
              <button
                type="button"
                disabled={!flow}
                onClick={onZoomIn}
                className={zb}
                title="Zoom in (Ctrl +)"
              >
                +
              </button>
              <button
                type="button"
                disabled={!flow}
                onClick={onFit}
                className="cursor-pointer rounded px-2 py-1 hover:bg-[#2b2928] disabled:cursor-not-allowed disabled:opacity-40"
                title="Fit to screen (Ctrl 0)"
              >
                Fit
              </button>
            </div>
            <button
              type="button"
              onClick={onAdd}
              className="cursor-pointer rounded-lg bg-[#b0614a] px-4 py-2 text-[11px] font-medium text-white shadow-lg transition hover:bg-[#c26f56]"
            >
              + Add checkout funnel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DotsMenu({ items }) {
  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    window.addEventListener("mousedown", close);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [pos]);
  return (
    <>
      <button
        type="button"
        title="More actions"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (pos) return setPos(null);
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ top: r.bottom + 4, left: r.right - 176 });
        }}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 hover:bg-[#2b2928] hover:text-white"
      >
        <MoreIcon size={16} />
      </button>
      {pos && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 w-44 overflow-hidden rounded-lg border border-[#2b2928] bg-[#1c1b1a] py-1 shadow-2xl"
        >
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPos(null);
                it.onClick();
              }}
              className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[11px] hover:bg-[#2b2928] ${
                it.danger ? "text-red-400" : "text-neutral-200"
              }`}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function FunnelTable({
  rows,
  statsFor,
  showStats,
  onEdit,
  onCopy,
  onDelete,
  onPage,
  onToggle,
}) {
  const [open, setOpen] = useState({});
  const th =
    "px-4 py-2.5 text-left text-[10px] font-medium tracking-wide text-neutral-400";
  const td = "px-4 py-3 text-[12px] text-neutral-200";
  const head = statsFor(100);
  return (
    <div className="h-full overflow-auto p-6">
      <div className="rounded-xl border border-[#2b2928] bg-[#1c1b1a]">
        <table className="w-full min-w-[960px] border-collapse">
          <thead className="border-b border-[#2b2928] bg-[#1d1c1b]">
            <tr>
              <th className={th}>FUNNEL</th>
              <th className={th}>TRIGGER</th>
              <th className={th}>PAGES</th>
              <th className={th}>STATUS</th>
              {showStats &&
                head.map(([l]) => (
                  <th key={l} className={th}>
                    {l}
                  </th>
                ))}
              <th className={`${th} w-12`} />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2928]">
            {rows.map(({ f, i }) => {
              const split = f.groups > 0;
              const expanded = split && open[i];
              const pcts = pctsOf(f);
              const acts = activesOf(f);
              return (
                <Fragment key={i}>
                  <tr
                    onClick={() => (f.locked ? onEdit(i) : onEdit(i))}
                    className="cursor-pointer hover:bg-[#222120]"
                  >
                    <td className={`${td} font-semibold text-white`}>
                      <span className="flex items-center gap-2">
                        {split ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpen((o) => ({ ...o, [i]: !o[i] }));
                            }}
                            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-neutral-400 hover:bg-[#2b2928] hover:text-white"
                          >
                            <span
                              className={`transition ${expanded ? "rotate-90" : ""}`}
                            >
                              <ChevronRightIcon size={13} />
                            </span>
                          </button>
                        ) : (
                          <span className="w-5" />
                        )}
                        {f.name}
                        {f.badge && (
                          <span className="rounded bg-[#2d2b2a] px-1.5 py-0.5 text-[9px] font-normal text-neutral-300">
                            {f.badge}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className={`${td} text-neutral-400`}>
                      {f.locked
                        ? "Always matches"
                        : `${f.trigType}: ${(f.terms || []).join(", ")}`}
                    </td>
                    <td className={td}>
                      {split ? `Split test · ${f.groups} pages` : "1 page"}
                    </td>
                    <td className={td}>
                      <StatusBadge active={funnelActive(f)} />
                    </td>
                    {showStats &&
                      head.map(([l, v, green]) => (
                        <td
                          key={l}
                          className={`${td} ${green ? "text-[#4ade80]" : ""}`}
                        >
                          {v}
                        </td>
                      ))}
                    <td className={`${td} text-right`}>
                      <DotsMenu
                        items={[
                          ...(split
                            ? [
                                {
                                  label: "Configure page 1",
                                  icon: <SlidersIcon size={13} />,
                                  onClick: () => onPage(i, 0),
                                },
                              ]
                            : []),
                          ...(f.locked
                            ? [
                                {
                                  label: "View details",
                                  icon: <EditIcon size={13} />,
                                  onClick: () => onEdit(i),
                                },
                              ]
                            : [
                                {
                                  label: "Edit funnel",
                                  icon: <EditIcon size={13} />,
                                  onClick: () => onEdit(i),
                                },
                                {
                                  label: "Duplicate",
                                  icon: <CopyIcon size={13} />,
                                  onClick: () => onCopy(i),
                                },
                                {
                                  label: "Delete",
                                  danger: true,
                                  icon: <TrashIcon size={13} />,
                                  onClick: () => onDelete(i),
                                },
                              ]),
                        ]}
                      />
                    </td>
                  </tr>
                  {expanded &&
                    pcts.map((pct, j) => {
                      const on = acts[j];
                      const vs = statsFor(on ? pct : 0);
                      return (
                        <tr
                          key={`${i}-${j}`}
                          onClick={() => onPage(i, j)}
                          className="cursor-pointer bg-[#191817] hover:bg-[#222120]"
                        >
                          <td className={`${td} pl-14 text-neutral-300`}>
                            <span className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${j === 0 ? "bg-blue-500" : "bg-teal-400"}`}
                              />
                              Variant {String.fromCharCode(65 + j)}
                            </span>
                          </td>
                          <td className={`${td} truncate text-neutral-400`}>
                            {f.selected?.[j] ?? `Page ${j + 1}`}
                          </td>
                          <td className={td} />
                          <td className={td}>
                            <span className="flex items-center gap-3">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={on}
                                title={on ? "Stop sending traffic" : "Send traffic"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggle(i, j, !on);
                                }}
                                className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition ${on ? "bg-emerald-500" : "bg-[#3a3837]"}`}
                              >
                                <span
                                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`}
                                />
                              </button>
                              <span className="w-12 text-neutral-400">
                                {fmt(on ? pct : 0)}
                              </span>
                            </span>
                          </td>
                          {showStats &&
                            vs.map(([l, v, green]) => (
                              <td
                                key={l}
                                className={`${td} ${on && green ? "text-[#4ade80]" : ""}`}
                              >
                                {v}
                              </td>
                            ))}
                          <td className={`${td} text-right`}>
                            <DotsMenu
                              items={[
                                {
                                  label: "Configure page",
                                  icon: <SlidersIcon size={13} />,
                                  onClick: () => onPage(i, j),
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- main ---------- */
export default function App() {
  const [funnels, setFunnels] = useState([
    {
      name: "All Products",
      sub: "Always matches",
      badge: "Default",
      groups: 0,
      locked: true,
    },
  ]);
  const [modal, setModal] = useState(null); 
  const [panel, setPanel] = useState(null); 
  const [colEl, setColEl] = useState(null);
  const [geo, setGeo] = useState({ h: 0, w: 0, mids: [], pts: [] });
  const ml = layoutMerge(geo.h, geo.pts, geo.w);

  // header state
  const [tab, setTab] = useState("funnels");
  const [mode, setMode] = useState("flow");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState(ALL_RANGE);
  const [analytics, setAnalytics] = useState(true);

  const q = query.trim().toLowerCase();
  const visible = funnels
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => matches(f, q));
  const rangeF = rangeFactor(range);
  const stats = buildStats(rangeF);
  const statsFor = (pct) => buildStats((rangeF * pct) / 100);
  const flowRef = useRef(true);
  flowRef.current = tab === "funnels" && mode === "flow";

  const addGroup = (i) =>
    setFunnels((f) =>
      f.map((x, k) => {
        if (k !== i) return x;
        const v = x.groups > 0 ? Math.min(10, x.groups + 1) : 2;
        const sel = [...(x.selected ?? [])];
        while (sel.length < v) sel.push(`Page ${sel.length + 1}`);
        return {
          ...x,
          groups: v,
          selected: sel.slice(0, v),
          percents: undefined,
          pagesActive: [...activesOf(x), true, true].slice(0, v),
        };
      }),
    );
  const deleteFunnel = (i) => {
    setPanel(null);
    setFunnels((f) => f.filter((x, k) => k !== i || x.locked));
  };
  const setPageActive = (fi, pi, v) =>
    setFunnels((l) =>
      l.map((x, k) => {
        if (k !== fi) return x;
        const arr = activesOf(x);
        arr[pi] = v;
        return { ...x, pagesActive: arr };
      }),
    );

  const removePage = (fi, pi) => {
    setPanel(null);
    setFunnels((l) =>
      l.map((x, k) => {
        if (k !== fi) return x;
        const arr = activesOf(x).filter((_, j) => j !== pi);
        const sel = (x.selected ?? []).filter((_, j) => j !== pi);
        const g = x.groups - 1;
        return g < 2
          ? {
              ...x,
              groups: 0,
              selected: sel,
              percents: undefined,
              pagesActive: undefined,
            }
          : {
              ...x,
              groups: g,
              selected: sel,
              percents: undefined,
              pagesActive: arr,
            };
      }),
    );
  };

  // Close the side panel as soon as a modal opens
  useEffect(() => {
    if (modal !== null) setPanel(null);
  }, [modal]);

  /* ----- Figma-style canvas: Ctrl+scroll zoom, scroll / Space+drag / middle mouse pan ----- */
  const viewRef = useRef(null);
  const contentRef = useRef(null);
  const spaceRef = useRef(false);
  const dragRef = useRef(null);
  const inited = useRef(false);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [ready, setReady] = useState(false); // content stays hidden until the first fit (prevents the blink)
  const [space, setSpace] = useState(false);
  const [drag, setDrag] = useState(false);

  const zoomAt = (px, py, f) =>
    setView((v) => {
      const k = Math.min(4, Math.max(0.1, v.k * f));
      const r = k / v.k;
      return { k, x: px - (px - v.x) * r, y: py - (py - v.y) * r };
    });
  const fit = () => {
    const el = viewRef.current;
    const c = contentRef.current;
    if (!el || !c) return;
    const k = Math.min(
      1,
      el.clientWidth / c.offsetWidth,
      el.clientHeight / c.offsetHeight,
    );
    setView({
      k,
      x: (el.clientWidth - c.offsetWidth * k) / 2,
      y: (el.clientHeight - c.offsetHeight * k) / 2,
    });
  };
  const zoomCenter = (f) => {
    const el = viewRef.current;
    zoomAt(el.clientWidth / 2, el.clientHeight / 2, f);
  };

  useEffect(() => {
    if (geo.h > 0 && !inited.current) {
      inited.current = true;
      fit();
      setReady(true);
    }
  }, [geo.h]);

  useEffect(() => {
    const el = viewRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(
          e.clientX - rect.left,
          e.clientY - rect.top,
          Math.exp(-e.deltaY * 0.0025),
        );
      } else {
        const horiz = e.shiftKey && !e.deltaX;
        setView((v) => ({
          ...v,
          x: v.x - (horiz ? e.deltaY : e.deltaX),
          y: v.y - (horiz ? 0 : e.deltaY),
        }));
      }
    };
    const typing = (t) =>
      /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable;
    const onKeyDown = (e) => {
      if (
        !flowRef.current ||
        typing(e.target) ||
        document.querySelector('[role="dialog"]')
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        spaceRef.current = true;
        setSpace(true);
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          zoomCenter(1.2);
        } else if (e.key === "-") {
          e.preventDefault();
          zoomCenter(1 / 1.2);
        } else if (e.key === "0") {
          e.preventDefault();
          fit();
        }
      }
    };
    const stopSpace = () => {
      spaceRef.current = false;
      setSpace(false);
    };
    const onKeyUp = (e) => e.code === "Space" && stopSpace();
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", stopSpace);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", stopSpace);
    };
  }, []);

  const [dnd, setDnd] = useState(null); // { i, dy, to } while reordering
  const dndRef = useRef(null);
  const copyFunnel = (i) => {
    setPanel(null);
    setFunnels((l) => {
      const a = [...l];
      a.splice(i + 1, 0, { ...l[i], name: `${l[i].name} copy` });
      return a;
    });
  };
  const startDrag = (i, e) => {
    if (q) return; // no reordering while a search filter is active
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const sy = e.clientY;
    const k = view.k;
    const mids = geo.mids;
    const lock = funnels[0]?.locked ? 1 : 0;
    const move = (ev) => {
      const y = mids[i] + (ev.clientY - sy) / k;
      let to = 0;
      mids.forEach((m, j) => {
        if (Math.abs(m - y) < Math.abs(mids[to] - y)) to = j;
      });
      const st = { i, dy: (ev.clientY - sy) / k, to: Math.max(lock, to) };
      dndRef.current = st;
      setDnd(st);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const st = dndRef.current;
      dndRef.current = null;
      setDnd(null);
      if (st && st.to !== st.i) {
        setPanel(null);
        setFunnels((l) => {
          const a = [...l];
          const [m] = a.splice(st.i, 1);
          a.splice(st.to, 0, m);
          return a;
        });
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onDown = (e) => {
    const ok =
      e.button === 1 ||
      (e.button === 0 && (spaceRef.current || !e.target.closest("button, a")));
    if (!ok) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
    setDrag(true);
  };
  const onMove = (e) => {
    const d = dragRef.current;
    if (d)
      setView((v) => ({
        ...v,
        x: d.ox + e.clientX - d.sx,
        y: d.oy + e.clientY - d.sy,
      }));
  };
  const onUp = () => {
    dragRef.current = null;
    setDrag(false);
  };

  // measure only the funnels currently rendered (search can hide some)
  useEffect(() => {
    if (!colEl) return;
    const vis = funnels.map((_, i) => i).filter((i) => matches(funnels[i], q));
    const update = () => {
      const mids = [];
      const pts = [];
      Array.from(colEl.children).forEach((c, n) => {
        const g = Math.max(1, funnels[vis[n]]?.groups || 0);
        const top = c.offsetTop;
        const hh = c.offsetHeight;
        mids.push(top + hh / 2);
        for (let k = 0; k < g; k++)
          pts.push({
            x: TRIG_W + LEFT + CARD_W,
            y: top + ((k + 0.5) / g) * hh,
          });
      });
      setGeo({ h: colEl.offsetHeight, w: colEl.offsetWidth, mids, pts });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(colEl);
    Array.from(colEl.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [colEl, funnels, q, analytics]);

  const panelFunnel = panel ? funnels[panel.f] : null;
  const panelValid = panelFunnel && panel.p < (panelFunnel.groups || 0);

  return (
    <div className="relative flex h-screen w-screen select-none flex-col overflow-hidden bg-[#0f0e0e] text-neutral-100">
      <Header
        tab={tab}
        setTab={setTab}
        mode={mode}
        setMode={setMode}
        query={query}
        setQuery={setQuery}
        range={range}
        setRange={setRange}
        analytics={analytics}
        setAnalytics={setAnalytics}
        zoomPct={Math.round(view.k * 100)}
        onZoomIn={() => zoomCenter(1.2)}
        onZoomOut={() => zoomCenter(1 / 1.2)}
        onZoomReset={() => setView((v) => ({ ...v, k: 1 }))}
        onFit={fit}
        onAdd={() => setModal("new")}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          ref={viewRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={`absolute inset-0 touch-none select-none ${drag ? "cursor-grabbing" : space ? "cursor-grab" : ""}`}
        >
          <div
            ref={contentRef}
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
              opacity: ready ? 1 : 0,
            }}
            className="absolute left-0 top-0 w-max origin-top-left"
          >
            <div
              className={`flex items-center p-8 ${space ? "[&_*]:!cursor-grab" : ""}`}
            >
              <StoreNode />
              <FanIn h={geo.h} ys={geo.mids} />
              <div className="relative flex shrink-0">
                <div
                  ref={setColEl}
                  className="relative flex shrink-0 flex-col gap-16"
                >
                  {visible.map(({ f, i }) => (
                    <Block
                      key={i}
                      info={f}
                      groups={f.groups}
                      stats={stats}
                      showStats={analytics}
                      onEdit={f.locked ? undefined : () => setModal(i)}
                      onInfo={f.locked ? () => setModal("info") : undefined}
                      onAdd={() => addGroup(i)}
                      onCopy={f.locked ? undefined : () => copyFunnel(i)}
                      onDragStart={
                        f.locked || q ? undefined : (e) => startDrag(i, e)
                      }
                      onPage={(p) => setPanel({ f: i, p })}
                      selectedPage={panel?.f === i ? panel.p : -1}
                      dragY={dnd?.i === i ? dnd.dy : undefined}
                      dragging={dnd?.i === i}
                      target={!!dnd && dnd.to === i && dnd.i !== i}
                    />
                  ))}
                </div>
                <div style={{ width: ml.W }} className="shrink-0" />
                {geo.h > 0 && (
                  <Wires
                    w={geo.w + ml.W}
                    h={geo.h}
                    paths={ml.paths}
                    arrows={ml.arrows}
                    className="pointer-events-none absolute left-0 top-0"
                  />
                )}
              </div>
              <Pipeline />
            </div>
          </div>
        </div>

        {tab === "funnels" && mode === "flow" && visible.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-neutral-500">
            No funnels match “{query}”.
          </div>
        )}

        {tab === "funnels" && mode === "table" && (
          <div className="absolute inset-0 z-10 bg-[#0f0e0e]">
            <FunnelTable
              rows={visible}
              statsFor={statsFor}
              showStats={analytics}
              onEdit={(i) => setModal(funnels[i].locked ? "info" : i)}
              onCopy={copyFunnel}
              onDelete={deleteFunnel}
              onPage={(fi, pi) => setPanel({ f: fi, p: pi })}
              onToggle={setPageActive}
            />
          </div>
        )}

        {tab !== "funnels" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f0e0e] text-[13px] text-neutral-500">
            {tab === "pages" ? "Checkout Pages" : "Settings"} — coming soon
          </div>
        )}

        {tab === "funnels" && mode === "flow" && (
          <div className="pointer-events-none absolute bottom-5 left-6 z-20 text-[10px] text-neutral-500">
            Scroll to pan · Ctrl + scroll to zoom · Space + drag to move
          </div>
        )}
      </div>

      {panelValid && (
        <PagePanel
          funnel={panelFunnel}
          page={panel.p}
          onToggle={(v) => setPageActive(panel.f, panel.p, v)}
          onRemove={() => removePage(panel.f, panel.p)}
          onClose={() => setPanel(null)}
        />
      )}

      {modal === "info" && (
        <DefaultTriggerModal
          name={funnels.find((f) => f.locked)?.name ?? "All Products"}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "new" && (
        <FunnelWizard
          onClose={() => setModal(null)}
          onSave={(f) => {
            setFunnels((list) => [...list, f]);
            setModal(null);
          }}
        />
      )}

      {typeof modal === "number" && (
        <FunnelWizard
          key={modal}
          initial={funnels[modal]}
          onClose={() => setModal(null)}
          onDelete={() => {
            deleteFunnel(modal);
            setModal(null);
          }}
          onSave={(f) => {
            setFunnels((list) => list.map((x, k) => (k === modal ? f : x)));
            setModal(null);
          }}
        />
      )}
    </div>
  );
}