import { useEffect, useRef, useState } from "react";

/* ---------- helpers ---------- */
const splitPercents = (n) => {
  const base = Math.floor(1000 / n) / 10;
  const arr = Array(n).fill(base);
  arr[n - 1] = Math.round((100 - base * (n - 1)) * 10) / 10;
  return arr;
};
const fmt = (p) => `${Number.isInteger(p) ? p : p.toFixed(1)}%`;
const pctsOf = (info) =>
  info.groups ? (info.percents?.length === info.groups ? info.percents : splitPercents(info.groups)) : [];
const activesOf = (info) => Array.from({ length: info.groups || 0 }, (_, j) => info.pagesActive?.[j] ?? true);
// A funnel is Active when at least one page is Active (or when it has no split)
const funnelActive = (info) => (info.groups > 0 ? activesOf(info).some(Boolean) : true);

const STATS = [
  ["SHOWN", "7,651"],
  ["CONV", "375"],
  ["RATE", "6.64%"],
  ["AOV", "$24.24"],
  ["REVENUE", "$9,091.50", true],
  ["REV / VISIT", "$1.61", true],
];

/* ---------- icons ---------- */
const Icon = ({ children, size = 24, sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const HomeIcon = (p) => (
  <Icon {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></Icon>
);
const BoltIcon = ({ size = 9 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#facc15"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>
);
const CartIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.95-1.5L23 6H6" />
  </Icon>
);
const CheckIcon = (p) => (<Icon {...p} sw={2.6}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>);
const GiftIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </Icon>
);
const GripIcon = (p) => (
  <Icon {...p} sw={2.4}>
    {[6, 12, 18].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.6" />))}
  </Icon>
);
const CopyIcon = (p) => (
  <Icon {...p} sw={2}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Icon>
);
const TrashIcon = (p) => (
  <Icon {...p} sw={2}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6M10 11v6M14 11v6" />
  </Icon>
);
const CloseIcon = (p) => (<Icon {...p} sw={2.2}><path d="M6 6l12 12M18 6 6 18" /></Icon>);
const FlagIcon = (p) => (<Icon {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></Icon>);
const ExternalIcon = ({ size = 9 }) => (
  <Icon size={size} sw={2}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Icon>
);

/* ---------- nodes ---------- */
const card = "rounded-xl border border-[#2b2928] bg-[#1c1b1a] shadow-[0_10px_30px_rgba(0,0,0,0.45)]";

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] ${
      active
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
        : "border-neutral-500/40 bg-neutral-500/10 text-neutral-400"
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-neutral-500"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

const StoreNode = () => (
  <div className={`${card} w-[150px] shrink-0 px-3.5 py-3.5`}>
    <div className="flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#b0614a] text-white"><HomeIcon size={14} /></div>
      <span className="text-[10px] tracking-[0.18em] text-neutral-300">STOREFRONT</span>
    </div>
    <div className="mt-3 text-[12px] font-medium text-neutral-100">pomence.com</div>
  </div>
);

const TriggerNode = ({ info, onClick, onCopy, onDragStart, dragging }) => {
  const active = funnelActive(info);
  const cls = `${card} w-full px-3.5 py-3 text-left`;
  const tool = "flex h-6 w-6 items-center justify-center rounded-md border border-[#3a3837] bg-[#1c1b1a] text-neutral-300 hover:border-[#b0614a] hover:text-white";
  const body = (
    <>
      <div className="flex items-center gap-1.5">
        <BoltIcon />
        <span className="text-[8px] tracking-wide text-neutral-300">TRIGGER</span>
        <span className="ml-0.5"><StatusBadge active={active} /></span>
      </div>
      <div className={`mt-2 truncate text-[12px] font-bold ${active ? "text-neutral-100" : "text-neutral-400"}`}>{info.name}</div>
      <div className="mt-1.5 flex items-center gap-1 text-[8px] text-neutral-400">
        {info.sub}
        {info.badge && <span className="rounded bg-[#2d2b2a] px-1 py-0.5 text-[8px] text-neutral-300">{info.badge}</span>}
      </div>
    </>
  );
  return (
    <div className="group relative w-[150px] shrink-0">
      {onCopy && (
        <div className={`absolute bottom-full left-0 flex gap-1 pb-1.5 transition-opacity group-hover:opacity-100 ${dragging ? "opacity-100" : "opacity-0"}`}>
          <button type="button" onPointerDown={onDragStart} title="Drag to reorder" className={`${tool} cursor-grab touch-none active:cursor-grabbing`}>
            <GripIcon size={13} />
          </button>
          <button type="button" onClick={onCopy} title="Duplicate funnel" className={tool}>
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

const CheckoutCard = ({ active = true, selected = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title="Click to configure page"
    className={`${card} block w-[300px] shrink-0 cursor-pointer p-3 text-left transition ${
      selected ? "ring-1 ring-[#b0614a]" : "hover:ring-1 hover:ring-[#b0614a]/50"
    }`}
  >
    <div className="mb-2 flex items-center justify-between border-b border-[#2b2928] pb-2">
      <div className={`flex items-center gap-2 ${active ? "" : "opacity-60"}`}>
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#262322] text-[#c0694d]"><CartIcon size={13} /></div>
        <div>
          <div className="text-[8px] text-neutral-400">Checkout page</div>
          <div className="text-[10px] font-medium text-neutral-100">pomence.co...</div>
        </div>
      </div>
      <StatusBadge active={active} />
    </div>
    <div className={`grid grid-cols-3 gap-1.5 ${active ? "" : "opacity-50"}`}>
      {STATS.map(([label, value, green]) => (
        <div key={label} className="rounded-md border border-[#2b2928] bg-[#1d1c1b] py-1.5 text-center">
          <div className="text-[7px] tracking-wide text-neutral-400">{label}</div>
          <div className={`mt-0.5 text-[12px] font-bold ${active && green ? "text-[#4ade80]" : "text-neutral-100"}`}>
            {active ? value : "-"}
          </div>
        </div>
      ))}
    </div>
  </button>
);

/* ---------- pipeline ---------- */
const STEPS = [
  { title: "Payment Success", sub: "100% routed", icon: <CheckIcon size={18} />, circle: "border-[#2f7d4f] bg-[#1f3a2b] text-[#4ade80]", titleCls: "text-neutral-100", subCls: "text-[#4ade80]", line: "border-t-2 border-dotted border-[#8b5cf6]" },
  { title: "Upsells", sub: "3 dynamic steps", icon: <GiftIcon size={18} />, circle: "border-[#7c4fb8] bg-[#2a2145] text-[#c4a1ff]", titleCls: "text-[#b58bff]", subCls: "text-neutral-400", link: true, line: "bg-[#3b82d6] h-[2px]" },
  { title: "Confirmation Page", sub: "Custom receipt", icon: <FlagIcon size={18} />, circle: "border-[#3b6fb0] bg-[#172a47] text-[#7cc0ff]", titleCls: "text-[#4aa8ff]", subCls: "text-neutral-400", link: true },
];
const Pipeline = () => (
  <div className="flex shrink-0">
    {STEPS.map((s) => (
      <div key={s.title} className="relative flex w-[100px] flex-col items-center text-center">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${s.circle}`}>{s.icon}</div>
        <div className={`mt-2 flex items-center gap-1 text-[8px] font-medium ${s.titleCls}`}>{s.title}{s.link && <ExternalIcon />}</div>
        <div className={`mt-0.5 text-[8px] ${s.subCls}`}>{s.sub}</div>
        {s.line && <div className={`absolute top-[17px] ${s.line}`} style={{ left: "calc(50% + 21px)", width: "calc(100% - 42px)" }} />}
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
  const rows = Array.from({ length: n }, (_, i) => Math.round(((i + 0.5) / n) * h));
  const total = LEFT + CARD_W;
  const wires = [];
  const arrows = [];

  if (n > 1) wires.push(`M0 ${mid} H${TRUNK - R}`);
  rows.forEach((cy) => {
    if (Math.abs(cy - mid) < 1) {
      wires.push(`M${n > 1 ? TRUNK - R : 0} ${mid} H${LEFT}`);
    } else if (cy < mid) {
      wires.push(
        `M${TRUNK - R} ${mid} A${R} ${R} 0 0 0 ${TRUNK} ${mid - R} V${cy + R} A${R} ${R} 0 0 1 ${TRUNK + R} ${cy} H${LEFT}`
      );
    } else {
      wires.push(
        `M${TRUNK - R} ${mid} A${R} ${R} 0 0 1 ${TRUNK} ${mid + R} V${cy - R} A${R} ${R} 0 0 0 ${TRUNK + R} ${cy} H${LEFT}`
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
      <g fill="none" stroke={ARROW} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {arrows.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {rows.map((cy, i) => (
        <g key={i}>
          <rect x={pillX - 20} y={cy - 8} width="40" height="16" rx="8" fill="#1c1b1a" stroke="#3a3837" />
          <text x={pillX} y={cy} fill="#d4d4d4" fontSize="8" textAnchor="middle" dominantBaseline="central">
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
  <svg width={w} height={h} className={`${className} overflow-visible`} shapeRendering="geometricPrecision">
    <g fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </g>
    <g fill="none" stroke={ARROW} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {arrows.map((d, i) => <path key={i} d={d} />)}
    </g>
  </svg>
);

function FanIn({ h, ys }) {
  const W = fanWidth(ys.length);
  if (!(h > 0)) return <div style={{ width: W }} className="shrink-0" />;
  const mid = Math.round(h / 2);
  const up = ys.filter((y) => y < mid - 1).sort((a, b) => b - a);
  const dn = ys.filter((y) => y > mid + 1).sort((a, b) => a - b);
  const paths = ys.filter((y) => Math.abs(y - mid) <= 1).map(() => `M0 ${mid} H${W}`);
  [[up, -1], [dn, 1]].forEach(([list, s]) =>
    list.forEach((y0, rank) => {
      const y = Math.round(y0);
      const r = Math.min(R, Math.abs(y - mid) / 2);
      const x = R + 14 * (list.length - 1 - rank);
      paths.push(
        `M0 ${mid} H${x - r} A${r} ${r} 0 0 ${s < 0 ? 0 : 1} ${x} ${mid + s * r} V${y - s * r} A${r} ${r} 0 0 ${s < 0 ? 1 : 0} ${x + r} ${y} H${W}`
      );
    })
  );
  return <Wires w={W} h={h} paths={paths} arrows={ys.map((y) => chevron(W, Math.round(y)))} />;
}

const TRIG_W = 150;
const MSTEP = 10;

// every card (or an unsplit trigger) gets its own line into the pipeline
function layoutMerge(h, pts, colW) {
  if (!(h > 0) || !pts.length) return { W: 60, paths: [], arrows: [] };
  const mid = Math.round(h / 2);
  const up = pts.filter((p) => p.y < mid - 1).sort((a, b) => b.y - a.y);
  const dn = pts.filter((p) => p.y > mid + 1).sort((a, b) => a.y - b.y);
  const W = 60 + MSTEP * 2 * Math.max(up.length, dn.length);
  const end = colW + W;
  const paths = pts.filter((p) => Math.abs(p.y - mid) <= 1).map((p) => `M${p.x} ${mid} H${end}`);
  [[up, -1], [dn, 1]].forEach(([list, s]) =>
    list.forEach((p, rank) => {
      const y = Math.round(p.y);
      const r = Math.min(R, Math.abs(y - mid) / 2);
      const x = colW + R + 8 + MSTEP * (2 * rank + (s < 0 ? 0 : 1));
      paths.push(
        `M${p.x} ${y} H${x - r} A${r} ${r} 0 0 ${s < 0 ? 1 : 0} ${x} ${y - s * r} V${mid + s * r} A${r} ${r} 0 0 ${s < 0 ? 0 : 1} ${x + r} ${mid} H${end}`
      );
    })
  );
  return { W, paths, arrows: [chevron(end, mid)] };
}

/* ---------- one trigger + its split cards ---------- */
function Block({ info, groups, onEdit, onAdd, onCopy, onDragStart, onPage, selectedPage, dragY, dragging, target }) {
  const [rowsEl, setRowsEl] = useState(null);
  const [h, setH] = useState(0);
  const percents = pctsOf(info);
  const actives = activesOf(info);

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
      style={dragY != null ? { transform: `translateY(${dragY}px)`, zIndex: 20 } : undefined}
      className={`relative flex items-center ${dragging ? "opacity-80" : ""} ${target ? "rounded-xl outline-dashed outline-1 outline-offset-4 outline-[#b0614a]/70" : ""}`}
    >
      <TriggerNode info={info} onClick={onEdit} onCopy={onCopy} onDragStart={onDragStart} dragging={dragging} />
      {groups > 0 && (
        <div className="relative flex shrink-0 items-center">
          <div style={{ width: LEFT }} />
          <div ref={setRowsEl} className="flex flex-col">
            {percents.map((_, i) => (
              <div key={i} className="py-2">
                <CheckoutCard active={actives[i]} selected={selectedPage === i} onClick={() => onPage(i)} />
              </div>
            ))}
          </div>
          <SplitWires n={groups} h={h} percents={percents} />
          <button
            type="button"
            onClick={onAdd}
            style={{ left: LEFT, width: CARD_W }}
            className="absolute top-full mt-1 rounded-xl border border-dashed border-[#b0614a]/60 py-2.5 text-[10px] text-[#d08b73] transition hover:bg-[#b0614a]/10"
          >
            + Split test another page
          </button>
        </div>
      )}
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
    <div className="fixed right-6 top-20 z-40 w-[300px] rounded-xl border border-[#2b2928] bg-[#1c1b1a] p-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#2b2928] pb-2.5">
        <span className="text-[12px] font-bold text-neutral-100">Checkout page</span>
        <button type="button" onClick={onClose} title="Close" className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-[#2b2928] hover:text-white">
          <CloseIcon size={13} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="truncate text-[13px] font-bold text-neutral-100">{funnel.name} · Page {page + 1}</span>
        <StatusBadge active={active} />
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-neutral-400">
        How this page serves inside the funnel: its share of the split and whether it takes traffic at all.
      </p>

      <div className="mt-3 rounded-lg border border-[#2b2928] bg-[#1d1c1b] p-3">
        <div className="text-[9px] tracking-wide text-neutral-400">TRAFFIC ALLOCATION</div>
        <div className={`mt-1 text-[18px] font-bold ${active ? "text-neutral-100" : "text-neutral-500"}`}>{fmt(percent)}</div>
        <div className="mt-1 text-[9px] text-neutral-500">Change the split from Edit funnel (click the trigger).</div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-[#2b2928] bg-[#1d1c1b] p-3">
        <div>
          <div className="text-[11px] font-medium text-neutral-100">Takes traffic</div>
          <div className="mt-0.5 text-[9px] leading-snug text-neutral-400">
            An inactive page keeps its place in the split but serves nothing.
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => onToggle(!active)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition ${active ? "bg-emerald-500" : "bg-[#3a3837]"}`}
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${active ? "left-[18px]" : "left-0.5"}`} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1.5 rounded-md border border-red-500/40 px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-500/10"
        >
          <TrashIcon size={12} />
          Remove from funnel
        </button>
        <span className="text-[9px] leading-snug text-neutral-500">Detaches it; the page survives.</span>
      </div>
    </div>
  );
}

/* ---------- add / edit funnel popup ---------- */
const PRODUCTS = ["Classic Tee", "Hoodie", "Sneakers", "Baseball Cap", "Backpack", "Water Bottle", "Sunglasses", "Wrist Watch", "Leather Wallet", "Phone Case"];

function FunnelModal({ initial, onSave, onDelete, onClose }) {
  const initN = initial?.groups > 0 ? initial.groups : 1;
  const [name, setName] = useState(initial?.name ?? "");
  const [picked, setPicked] = useState(initial?.picked ?? []);
  const [n, setN] = useState(initN);
  const [pcts, setPcts] = useState(
    initial?.percents?.length === initN && initN > 1 ? initial.percents : splitPercents(initN)
  );
  const [confirmDel, setConfirmDel] = useState(false);
  const all = picked.length === PRODUCTS.length;
  const total = Math.round(pcts.reduce((a, b) => a + b, 0) * 10) / 10;
  const totalOk = n === 1 || total === 100;
  const ok = name.trim() !== "" && picked.length > 0 && totalOk;
  const toggle = (p) => setPicked((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  const changeN = (v) => {
    setN(v);
    setPcts(splitPercents(v));
  };

  // Changing one group auto-adjusts the others so the total always stays 100
  const setPct = (i, v) => {
    const val = Math.min(100, Math.max(0, Math.round(v * 10) / 10));
    setPcts((p) => {
      if (p.length === 1) return [100];
      const rest = Math.round((100 - val) * 10) / 10;
      const others = p.map((x, k) => k).filter((k) => k !== i);
      const oldSum = others.reduce((a, k) => a + p[k], 0);
      const next = [...p];
      next[i] = val;
      let used = 0;
      others.forEach((k, idx) => {
        if (idx === others.length - 1) {
          // the last one takes the remainder so the total is exactly 100
          next[k] = Math.round((rest - used) * 10) / 10;
        } else {
          const share = oldSum > 0 ? p[k] / oldSum : 1 / others.length;
          next[k] = Math.round(rest * share * 10) / 10;
          used += next[k];
        }
      });
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const box = (on) => (
    <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${on ? "border-[#b0614a] bg-[#b0614a] text-white" : "border-[#4a4746]"}`}>
      {on && <CheckIcon size={9} />}
    </span>
  );
  const stepBtn = "flex h-7 w-7 items-center justify-center rounded-md border border-[#3a3837] text-[13px] text-neutral-200 hover:border-[#b0614a]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initial ? "Edit checkout funnel" : "Add checkout funnel"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[95vh] w-[400px] overflow-y-auto rounded-xl border border-[#2b2928] bg-[#1c1b1a] p-4 shadow-2xl"
      >
        <div className="text-[13px] font-bold text-neutral-100">{initial ? "Edit checkout funnel" : "Add checkout funnel"}</div>

        <label className="mt-3 block text-[9px] tracking-wide text-neutral-400">1. FUNNEL NAME</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Summer sale funnel"
          className="mt-1 w-full select-text rounded-md border border-[#3a3837] bg-[#1d1c1b] px-2 py-1.5 text-[11px] text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-[#b0614a]"
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[9px] tracking-wide text-neutral-400">2. PRODUCTS (10 DEFAULT)</span>
          <button type="button" onClick={() => setPicked(all ? [] : [...PRODUCTS])} className="flex items-center gap-1.5 text-[10px] text-neutral-300 hover:text-white">
            {box(all)}Check all
          </button>
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          {PRODUCTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[10px] ${picked.includes(p) ? "border-[#b0614a] bg-[#b0614a]/10 text-neutral-100" : "border-[#2b2928] bg-[#1d1c1b] text-neutral-300 hover:border-[#3a3837]"}`}
            >
              {box(picked.includes(p))}
              {p}
            </button>
          ))}
        </div>

        <div className="mt-3 text-[9px] tracking-wide text-neutral-400">3. SPLIT OPTION</div>
        <div className="mt-1.5 flex items-center gap-2">
          <button type="button" onClick={() => changeN(Math.max(1, n - 1))} className={stepBtn}>−</button>
          <div className="w-8 text-center text-[15px] font-bold text-neutral-100">{n}</div>
          <button type="button" onClick={() => changeN(Math.min(8, n + 1))} className={stepBtn}>+</button>
          <span className="ml-1 text-[11px] text-neutral-400">{n === 1 ? "No split" : `${n} groups`}</span>
        </div>

        {n > 1 && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {pcts.map((p, i) => (
                <div key={i} className="rounded-lg border border-[#3a3837] bg-[#1d1c1b] px-2.5 py-2">
                  <div className="text-[11px] font-medium text-neutral-300">Group {i + 1}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <button type="button" onClick={() => setPct(i, p - 1)} className={stepBtn}>−</button>
                    <div className="flex flex-1 items-center justify-center rounded-md border border-[#3a3837] bg-[#161515] px-1 py-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={p}
                        onChange={(e) => setPct(i, parseFloat(e.target.value) || 0)}
                        className="w-full select-text bg-transparent text-center text-[13px] font-bold text-neutral-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="text-[11px] text-neutral-400">%</span>
                    </div>
                    <button type="button" onClick={() => setPct(i, p + 1)} className={stepBtn}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <button type="button" onClick={() => setPcts(splitPercents(n))} className="text-[10px] text-[#d08b73] hover:underline">
                Equal split
              </button>
              <span className={`text-[11px] font-medium ${totalOk ? "text-emerald-400" : "text-red-400"}`}>
                Total: {fmt(total)} {totalOk ? "" : "(must be 100%)"}
              </span>
            </div>
          </>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          {/* Delete (edit mode only) */}
          <div className="flex items-center gap-2">
            {initial && onDelete && (
              confirmDel ? (
                <>
                  <span className="text-[10px] text-red-300">Delete funnel?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-red-500"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDel(false)}
                    className="rounded-md border border-[#3a3837] px-2.5 py-1.5 text-[10px] text-neutral-300 hover:border-neutral-500"
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDel(true)}
                  className="flex items-center gap-1.5 rounded-md border border-red-500/40 px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-500/10"
                >
                  <TrashIcon size={12} />
                  Delete
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-[#3a3837] px-3 py-1.5 text-[10px] text-neutral-300 hover:border-neutral-500">Cancel</button>
            <button
              type="button"
              disabled={!ok}
              onClick={() =>
                onSave({
                  name: name.trim(),
                  sub: all ? "All products" : `${picked.length} selected`,
                  groups: n > 1 ? n : 0,
                  percents: n > 1 ? pcts : undefined,
                  // keep the existing active/inactive status when the group count is unchanged
                  pagesActive: n > 1 && initial?.pagesActive?.length === n ? initial.pagesActive : undefined,
                  picked,
                })
              }
              className="rounded-md bg-[#b0614a] px-4 py-1.5 text-[10px] font-medium text-white hover:bg-[#c26f56] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- main ---------- */
export default function App() {
  const [funnels, setFunnels] = useState([{ name: "All Products", sub: "Always matches", badge: "Default", groups: 0, locked: true }]);
  const [modal, setModal] = useState(null); // "new" | funnel index | null
  const [panel, setPanel] = useState(null); // { f: funnelIndex, p: pageIndex } | null
  const [colEl, setColEl] = useState(null);
  const [geo, setGeo] = useState({ h: 0, w: 0, mids: [], pts: [] });
  const ml = layoutMerge(geo.h, geo.pts, geo.w);

  // Adding a group: percentages reset to an equal split, the new page starts Active
  const setGroups = (i, v) =>
    setFunnels((f) =>
      f.map((x, k) => (k === i ? { ...x, groups: v, percents: undefined, pagesActive: [...activesOf(x), true].slice(0, v) } : x))
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
      })
    );
  const removePage = (fi, pi) => {
    setPanel(null);
    setFunnels((l) =>
      l.map((x, k) => {
        if (k !== fi) return x;
        const arr = activesOf(x).filter((_, j) => j !== pi);
        const g = x.groups - 1;
        return g < 2
          ? { ...x, groups: 0, percents: undefined, pagesActive: undefined }
          : { ...x, groups: g, percents: undefined, pagesActive: arr };
      })
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
    const k = Math.min(1, el.clientWidth / c.offsetWidth, el.clientHeight / c.offsetHeight);
    setView({ k, x: (el.clientWidth - c.offsetWidth * k) / 2, y: (el.clientHeight - c.offsetHeight * k) / 2 });
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
        zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0025));
      } else {
        const horiz = e.shiftKey && !e.deltaX;
        setView((v) => ({ ...v, x: v.x - (horiz ? e.deltaY : e.deltaX), y: v.y - (horiz ? 0 : e.deltaY) }));
      }
    };
    const typing = (t) => /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable;
    const onKeyDown = (e) => {
      if (typing(e.target) || document.querySelector('[role="dialog"]')) return;
      if (e.code === "Space") {
        e.preventDefault();
        spaceRef.current = true;
        setSpace(true);
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") { e.preventDefault(); zoomCenter(1.2); }
        else if (e.key === "-") { e.preventDefault(); zoomCenter(1 / 1.2); }
        else if (e.key === "0") { e.preventDefault(); fit(); }
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
    const ok = e.button === 1 || (e.button === 0 && (spaceRef.current || !e.target.closest("button")));
    if (!ok) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
    setDrag(true);
  };
  const onMove = (e) => {
    const d = dragRef.current;
    if (d) setView((v) => ({ ...v, x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }));
  };
  const onUp = () => {
    dragRef.current = null;
    setDrag(false);
  };

  useEffect(() => {
    if (!colEl) return;
    const update = () => {
      const mids = [];
      const pts = [];
      Array.from(colEl.children).forEach((c, i) => {
        const g = funnels[i]?.groups || 0;
        const top = c.offsetTop;
        const hh = c.offsetHeight;
        mids.push(top + hh / 2);
        if (g > 0) for (let k = 0; k < g; k++) pts.push({ x: TRIG_W + LEFT + CARD_W, y: top + ((k + 0.5) / g) * hh });
        else pts.push({ x: TRIG_W, y: top + hh / 2 });
      });
      setGeo({ h: colEl.offsetHeight, w: colEl.offsetWidth, mids, pts });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(colEl);
    Array.from(colEl.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [colEl, funnels]);

  const panelFunnel = panel ? funnels[panel.f] : null;
  const panelValid = panelFunnel && panel.p < (panelFunnel.groups || 0);

  return (
    <div className="relative h-screen w-screen select-none overflow-hidden bg-[#0f0e0e] text-neutral-100">
      <button
        type="button"
        onClick={() => setModal("new")}
        className="fixed right-6 top-5 z-40 rounded-lg bg-[#b0614a] px-4 py-2 text-[11px] font-medium text-white shadow-lg transition hover:bg-[#c26f56]"
      >
        + Add checkout funnel
      </button>

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
          <div className={`flex items-center p-8 ${space ? "[&_*]:!cursor-grab" : ""}`}>
            <StoreNode />
            <FanIn h={geo.h} ys={geo.mids} />
            <div className="relative flex shrink-0">
              <div ref={setColEl} className="relative flex shrink-0 flex-col gap-16">
                {funnels.map((f, i) => (
                  <Block
                    key={i}
                    info={f}
                    groups={f.groups}
                    onEdit={f.locked ? undefined : () => setModal(i)}
                    onAdd={() => setGroups(i, Math.min(8, f.groups + 1))}
                    onCopy={f.locked ? undefined : () => copyFunnel(i)}
                    onDragStart={f.locked ? undefined : (e) => startDrag(i, e)}
                    onPage={(p) => setPanel({ f: i, p })}
                    selectedPage={panel?.f === i ? panel.p : -1}
                    dragY={dnd?.i === i ? dnd.dy : undefined}
                    dragging={dnd?.i === i}
                    target={!!dnd && dnd.to === i && dnd.i !== i}
                  />
                ))}
              </div>
              <div style={{ width: ml.W }} className="shrink-0" />
              {geo.h > 0 && <Wires w={geo.w + ml.W} h={geo.h} paths={ml.paths} arrows={ml.arrows} className="pointer-events-none absolute left-0 top-0" />}
            </div>
            <Pipeline />
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 right-6 z-40 flex items-center gap-1 rounded-lg border border-[#2b2928] bg-[#1c1b1a] p-1 text-[11px] text-neutral-200 shadow-lg">
        <button type="button" onClick={() => zoomCenter(1 / 1.2)} className="h-6 w-6 rounded hover:bg-[#2b2928]" title="Zoom out (Ctrl -)">−</button>
        <button type="button" onClick={() => setView((v) => ({ ...v, k: 1 }))} className="w-11 rounded py-1 hover:bg-[#2b2928]" title="Reset to 100%">{Math.round(view.k * 100)}%</button>
        <button type="button" onClick={() => zoomCenter(1.2)} className="h-6 w-6 rounded hover:bg-[#2b2928]" title="Zoom in (Ctrl +)">+</button>
        <button type="button" onClick={fit} className="rounded px-2 py-1 hover:bg-[#2b2928]" title="Fit to screen (Ctrl 0)">Fit</button>
      </div>
      <div className="pointer-events-none fixed bottom-5 left-6 z-40 text-[10px] text-neutral-500">
        Scroll to pan · Ctrl + scroll to zoom · Space + drag to move
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

      {modal !== null && (
        <FunnelModal
          key={modal}
          initial={typeof modal === "number" ? funnels[modal] : undefined}
          onClose={() => setModal(null)}
          onDelete={
            typeof modal === "number"
              ? () => {
                  deleteFunnel(modal);
                  setModal(null);
                }
              : undefined
          }
          onSave={(f) => {
            setFunnels((list) => (typeof modal === "number" ? list.map((x, k) => (k === modal ? f : x)) : [...list, f]));
            setModal(null);
          }}
        />
      )}
    </div>
  );
}