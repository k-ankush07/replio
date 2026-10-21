// import { useEffect, useRef, useState } from "react";

// /* ---------- helpers ---------- */
// const splitPercents = (n) => {
//   const base = Math.floor(1000 / n) / 10;
//   const arr = Array(n).fill(base);
//   arr[n - 1] = Math.round((100 - base * (n - 1)) * 10) / 10;
//   return arr;
// };
// const fmt = (p) => `${Number.isInteger(p) ? p : p.toFixed(1)}%`;
// const pctsOf = (info) =>
//   info.groups ? (info.percents?.length === info.groups ? info.percents : splitPercents(info.groups)) : [];
// const activesOf = (info) => Array.from({ length: info.groups || 0 }, (_, j) => info.pagesActive?.[j] ?? true);
// // A funnel is Active when at least one page is Active (or when it has no split)
// const funnelActive = (info) => (info.groups > 0 ? activesOf(info).some(Boolean) : true);

// const STATS = [
//   ["SHOWN", "7,651"],
//   ["CONV", "375"],
//   ["RATE", "6.64%"],
//   ["AOV", "$24.24"],
//   ["REVENUE", "$9,091.50", true],
//   ["REV / VISIT", "$1.61", true],
// ];

// /* ---------- icons ---------- */
// const Icon = ({ children, size = 24, sw = 1.8 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
//     {children}
//   </svg>
// );
// const HomeIcon = (p) => (
//   <Icon {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></Icon>
// );
// const BoltIcon = ({ size = 9 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="#facc15"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>
// );
// const CartIcon = (p) => (
//   <Icon {...p}>
//     <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
//     <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.95-1.5L23 6H6" />
//   </Icon>
// );
// const CheckIcon = (p) => (<Icon {...p} sw={2.6}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>);
// const GiftIcon = (p) => (
//   <Icon {...p}>
//     <rect x="3" y="8" width="18" height="4" rx="1" />
//     <path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
//     <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
//   </Icon>
// );
// const GripIcon = (p) => (
//   <Icon {...p} sw={2.4}>
//     {[6, 12, 18].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.6" />))}
//   </Icon>
// );
// const CopyIcon = (p) => (
//   <Icon {...p} sw={2}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Icon>
// );
// const TrashIcon = (p) => (
//   <Icon {...p} sw={2}>
//     <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6M10 11v6M14 11v6" />
//   </Icon>
// );
// const CloseIcon = (p) => (<Icon {...p} sw={2.2}><path d="M6 6l12 12M18 6 6 18" /></Icon>);
// const FlagIcon = (p) => (<Icon {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></Icon>);
// const ExternalIcon = ({ size = 9 }) => (
//   <Icon size={size} sw={2}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Icon>
// );

// /* ---------- nodes ---------- */
// const card = "rounded-xl border border-[#2b2928] bg-[#1c1b1a] shadow-[0_10px_30px_rgba(0,0,0,0.45)]";

// const StatusBadge = ({ active }) => (
//   <span
//     className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] ${
//       active
//         ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
//         : "border-neutral-500/40 bg-neutral-500/10 text-neutral-400"
//     }`}
//   >
//     <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-neutral-500"}`} />
//     {active ? "Active" : "Inactive"}
//   </span>
// );

// const StoreNode = () => (
//   <div className={`${card} w-[150px] shrink-0 px-3.5 py-3.5`}>
//     <div className="flex items-center gap-2.5">
//       <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#b0614a] text-white"><HomeIcon size={14} /></div>
//       <span className="text-[10px] tracking-[0.18em] text-neutral-300">STOREFRONT</span>
//     </div>
//     <div className="mt-3 text-[12px] font-medium text-neutral-100">pomence.com</div>
//   </div>
// );

// const TriggerNode = ({ info, onClick, onCopy, onDragStart, dragging }) => {
//   const active = funnelActive(info);
//   const cls = `${card} w-full px-3.5 py-3 text-left`;
//   const tool = "flex h-6 w-6 items-center justify-center rounded-md border border-[#3a3837] bg-[#1c1b1a] text-neutral-300 hover:border-[#b0614a] hover:text-white";
//   const body = (
//     <>
//       <div className="flex items-center gap-1.5">
//         <BoltIcon />
//         <span className="text-[8px] tracking-wide text-neutral-300">TRIGGER</span>
//         <span className="ml-0.5"><StatusBadge active={active} /></span>
//       </div>
//       <div className={`mt-2 truncate text-[12px] font-bold ${active ? "text-neutral-100" : "text-neutral-400"}`}>{info.name}</div>
//       <div className="mt-1.5 flex items-center gap-1 text-[8px] text-neutral-400">
//         {info.sub}
//         {info.badge && <span className="rounded bg-[#2d2b2a] px-1 py-0.5 text-[8px] text-neutral-300">{info.badge}</span>}
//       </div>
//     </>
//   );
//   return (
//     <div className="group relative w-[150px] shrink-0">
//       {onCopy && (
//         <div className={`absolute bottom-full left-0 flex gap-1 pb-1.5 transition-opacity group-hover:opacity-100 ${dragging ? "opacity-100" : "opacity-0"}`}>
//           <button type="button" onPointerDown={onDragStart} title="Drag to reorder" className={`${tool} cursor-grab touch-none active:cursor-grabbing`}>
//             <GripIcon size={13} />
//           </button>
//           <button type="button" onClick={onCopy} title="Duplicate funnel" className={tool}>
//             <CopyIcon size={13} />
//           </button>
//         </div>
//       )}
//       {onClick ? (
//         <button
//           type="button"
//           onClick={onClick}
//           aria-haspopup="dialog"
//           title="Click to edit funnel"
//           className={`${cls} cursor-pointer transition hover:border-[#b0614a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b0614a]`}
//         >
//           {body}
//         </button>
//       ) : (
//         <div className={cls}>{body}</div>
//       )}
//     </div>
//   );
// };

// const CheckoutCard = ({ active = true, selected = false, onClick }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     title="Click to configure page"
//     className={`${card} block w-[300px] shrink-0 cursor-pointer p-3 text-left transition ${
//       selected ? "ring-1 ring-[#b0614a]" : "hover:ring-1 hover:ring-[#b0614a]/50"
//     }`}
//   >
//     <div className="mb-2 flex items-center justify-between border-b border-[#2b2928] pb-2">
//       <div className={`flex items-center gap-2 ${active ? "" : "opacity-60"}`}>
//         <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#262322] text-[#c0694d]"><CartIcon size={13} /></div>
//         <div>
//           <div className="text-[8px] text-neutral-400">Checkout page</div>
//           <div className="text-[10px] font-medium text-neutral-100">pomence.co...</div>
//         </div>
//       </div>
//       <StatusBadge active={active} />
//     </div>
//     <div className={`grid grid-cols-3 gap-1.5 ${active ? "" : "opacity-50"}`}>
//       {STATS.map(([label, value, green]) => (
//         <div key={label} className="rounded-md border border-[#2b2928] bg-[#1d1c1b] py-1.5 text-center">
//           <div className="text-[7px] tracking-wide text-neutral-400">{label}</div>
//           <div className={`mt-0.5 text-[12px] font-bold ${active && green ? "text-[#4ade80]" : "text-neutral-100"}`}>
//             {active ? value : "-"}
//           </div>
//         </div>
//       ))}
//     </div>
//   </button>
// );

// /* ---------- pipeline ---------- */
// const STEPS = [
//   { title: "Payment Success", sub: "100% routed", icon: <CheckIcon size={18} />, circle: "border-[#2f7d4f] bg-[#1f3a2b] text-[#4ade80]", titleCls: "text-neutral-100", subCls: "text-[#4ade80]", line: "border-t-2 border-dotted border-[#8b5cf6]" },
//   { title: "Upsells", sub: "3 dynamic steps", icon: <GiftIcon size={18} />, circle: "border-[#7c4fb8] bg-[#2a2145] text-[#c4a1ff]", titleCls: "text-[#b58bff]", subCls: "text-neutral-400", link: true, line: "bg-[#3b82d6] h-[2px]" },
//   { title: "Confirmation Page", sub: "Custom receipt", icon: <FlagIcon size={18} />, circle: "border-[#3b6fb0] bg-[#172a47] text-[#7cc0ff]", titleCls: "text-[#4aa8ff]", subCls: "text-neutral-400", link: true },
// ];
// const Pipeline = () => (
//   <div className="flex shrink-0">
//     {STEPS.map((s) => (
//       <div key={s.title} className="relative flex w-[100px] flex-col items-center text-center">
//         <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${s.circle}`}>{s.icon}</div>
//         <div className={`mt-2 flex items-center gap-1 text-[8px] font-medium ${s.titleCls}`}>{s.title}{s.link && <ExternalIcon />}</div>
//         <div className={`mt-0.5 text-[8px] ${s.subCls}`}>{s.sub}</div>
//         {s.line && <div className={`absolute top-[17px] ${s.line}`} style={{ left: "calc(50% + 21px)", width: "calc(100% - 42px)" }} />}
//       </div>
//     ))}
//   </div>
// );

// /* ---------- split connectors ---------- */
// const LINE = "#3d3a39";
// const ARROW = "#4a4746";
// const R = 20; // elbow radius
// const FAN_W = 84;
// const TRUNK = 56;
// const PCT_W = 112;
// const LEFT = FAN_W + PCT_W;
// const CARD_W = 300;

// const chevron = (x, y) => `M${x - 6} ${y - 5} L${x} ${y} L${x - 6} ${y + 5}`;

// function SplitWires({ n, h, percents }) {
//   if (!(h > 0)) return null;
//   const mid = Math.round(h / 2);
//   const rows = Array.from({ length: n }, (_, i) => Math.round(((i + 0.5) / n) * h));
//   const total = LEFT + CARD_W;
//   const wires = [];
//   const arrows = [];

//   if (n > 1) wires.push(`M0 ${mid} H${TRUNK - R}`);
//   rows.forEach((cy) => {
//     if (Math.abs(cy - mid) < 1) {
//       wires.push(`M${n > 1 ? TRUNK - R : 0} ${mid} H${LEFT}`);
//     } else if (cy < mid) {
//       wires.push(
//         `M${TRUNK - R} ${mid} A${R} ${R} 0 0 0 ${TRUNK} ${mid - R} V${cy + R} A${R} ${R} 0 0 1 ${TRUNK + R} ${cy} H${LEFT}`
//       );
//     } else {
//       wires.push(
//         `M${TRUNK - R} ${mid} A${R} ${R} 0 0 1 ${TRUNK} ${mid + R} V${cy - R} A${R} ${R} 0 0 0 ${TRUNK + R} ${cy} H${LEFT}`
//       );
//     }
//     arrows.push(chevron(LEFT, cy));
//   });

//   const pillX = FAN_W + PCT_W / 2;
//   return (
//     <svg
//       width={total}
//       height={h}
//       className="pointer-events-none absolute left-0 top-0 overflow-visible"
//       shapeRendering="geometricPrecision"
//     >
//       <g fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round">
//         {wires.map((d, i) => (
//           <path key={i} d={d} />
//         ))}
//       </g>
//       <g fill="none" stroke={ARROW} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         {arrows.map((d, i) => (
//           <path key={i} d={d} />
//         ))}
//       </g>
//       {rows.map((cy, i) => (
//         <g key={i}>
//           <rect x={pillX - 20} y={cy - 8} width="40" height="16" rx="8" fill="#1c1b1a" stroke="#3a3837" />
//           <text x={pillX} y={cy} fill="#d4d4d4" fontSize="8" textAnchor="middle" dominantBaseline="central">
//             {fmt(percents[i])}
//           </text>
//         </g>
//       ))}
//     </svg>
//   );
// }

// /* ---------- storefront -> triggers, blocks -> pipeline ---------- */
// const fanWidth = (n) => 80 + 14 * Math.max(0, n - 2);

// const Wires = ({ w, h, paths, arrows, className = "shrink-0" }) => (
//   <svg width={w} height={h} className={`${className} overflow-visible`} shapeRendering="geometricPrecision">
//     <g fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round">
//       {paths.map((d, i) => <path key={i} d={d} />)}
//     </g>
//     <g fill="none" stroke={ARROW} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       {arrows.map((d, i) => <path key={i} d={d} />)}
//     </g>
//   </svg>
// );

// function FanIn({ h, ys }) {
//   const W = fanWidth(ys.length);
//   if (!(h > 0)) return <div style={{ width: W }} className="shrink-0" />;
//   const mid = Math.round(h / 2);
//   const up = ys.filter((y) => y < mid - 1).sort((a, b) => b - a);
//   const dn = ys.filter((y) => y > mid + 1).sort((a, b) => a - b);
//   const paths = ys.filter((y) => Math.abs(y - mid) <= 1).map(() => `M0 ${mid} H${W}`);
//   [[up, -1], [dn, 1]].forEach(([list, s]) =>
//     list.forEach((y0, rank) => {
//       const y = Math.round(y0);
//       const r = Math.min(R, Math.abs(y - mid) / 2);
//       const x = R + 14 * (list.length - 1 - rank);
//       paths.push(
//         `M0 ${mid} H${x - r} A${r} ${r} 0 0 ${s < 0 ? 0 : 1} ${x} ${mid + s * r} V${y - s * r} A${r} ${r} 0 0 ${s < 0 ? 1 : 0} ${x + r} ${y} H${W}`
//       );
//     })
//   );
//   return <Wires w={W} h={h} paths={paths} arrows={ys.map((y) => chevron(W, Math.round(y)))} />;
// }

// const TRIG_W = 150;
// const MSTEP = 10;

// // every card (or an unsplit trigger) gets its own line into the pipeline
// function layoutMerge(h, pts, colW) {
//   if (!(h > 0) || !pts.length) return { W: 60, paths: [], arrows: [] };
//   const mid = Math.round(h / 2);
//   const up = pts.filter((p) => p.y < mid - 1).sort((a, b) => b.y - a.y);
//   const dn = pts.filter((p) => p.y > mid + 1).sort((a, b) => a.y - b.y);
//   const W = 60 + MSTEP * 2 * Math.max(up.length, dn.length);
//   const end = colW + W;
//   const paths = pts.filter((p) => Math.abs(p.y - mid) <= 1).map((p) => `M${p.x} ${mid} H${end}`);
//   [[up, -1], [dn, 1]].forEach(([list, s]) =>
//     list.forEach((p, rank) => {
//       const y = Math.round(p.y);
//       const r = Math.min(R, Math.abs(y - mid) / 2);
//       const x = colW + R + 8 + MSTEP * (2 * rank + (s < 0 ? 0 : 1));
//       paths.push(
//         `M${p.x} ${y} H${x - r} A${r} ${r} 0 0 ${s < 0 ? 1 : 0} ${x} ${y - s * r} V${mid + s * r} A${r} ${r} 0 0 ${s < 0 ? 0 : 1} ${x + r} ${mid} H${end}`
//       );
//     })
//   );
//   return { W, paths, arrows: [chevron(end, mid)] };
// }

// /* ---------- one trigger + its split cards ---------- */
// function Block({ info, groups, onEdit, onAdd, onCopy, onDragStart, onPage, selectedPage, dragY, dragging, target }) {
//   const [rowsEl, setRowsEl] = useState(null);
//   const [h, setH] = useState(0);
//   const percents = pctsOf(info);
//   const actives = activesOf(info);

//   useEffect(() => {
//     if (!rowsEl) return;
//     const update = () => setH(rowsEl.offsetHeight);
//     update();
//     const ro = new ResizeObserver(update);
//     ro.observe(rowsEl);
//     return () => ro.disconnect();
//   }, [rowsEl, groups]);

//   return (
//     <div
//       style={dragY != null ? { transform: `translateY(${dragY}px)`, zIndex: 20 } : undefined}
//       className={`relative flex items-center ${dragging ? "opacity-80" : ""} ${target ? "rounded-xl outline-dashed outline-1 outline-offset-4 outline-[#b0614a]/70" : ""}`}
//     >
//       <TriggerNode info={info} onClick={onEdit} onCopy={onCopy} onDragStart={onDragStart} dragging={dragging} />
//       {groups > 0 && (
//         <div className="relative flex shrink-0 items-center">
//           <div style={{ width: LEFT }} />
//           <div ref={setRowsEl} className="flex flex-col">
//             {percents.map((_, i) => (
//               <div key={i} className="py-2">
//                 <CheckoutCard active={actives[i]} selected={selectedPage === i} onClick={() => onPage(i)} />
//               </div>
//             ))}
//           </div>
//           <SplitWires n={groups} h={h} percents={percents} />
//           <button
//             type="button"
//             onClick={onAdd}
//             style={{ left: LEFT, width: CARD_W }}
//             className="absolute top-full mt-1 rounded-xl border border-dashed border-[#b0614a]/60 py-2.5 text-[10px] text-[#d08b73] transition hover:bg-[#b0614a]/10"
//           >
//             + Split test another page
//           </button>
//         </div>
//       )}
//       <div className="min-w-[24px] flex-1" />
//     </div>
//   );
// }

// /* ---------- checkout page side panel ---------- */
// function PagePanel({ funnel, page, onToggle, onRemove, onClose }) {
//   const percent = pctsOf(funnel)[page];
//   const active = activesOf(funnel)[page];

//   useEffect(() => {
//     const onKey = (e) => e.key === "Escape" && onClose();
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onClose]);

//   return (
//     <div className="fixed right-6 top-20 z-40 w-[300px] rounded-xl border border-[#2b2928] bg-[#1c1b1a] p-4 shadow-2xl">
//       <div className="flex items-center justify-between border-b border-[#2b2928] pb-2.5">
//         <span className="text-[12px] font-bold text-neutral-100">Checkout page</span>
//         <button type="button" onClick={onClose} title="Close" className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-[#2b2928] hover:text-white">
//           <CloseIcon size={13} />
//         </button>
//       </div>

//       <div className="mt-3 flex items-center gap-2">
//         <span className="truncate text-[13px] font-bold text-neutral-100">{funnel.name} · Page {page + 1}</span>
//         <StatusBadge active={active} />
//       </div>
//       <p className="mt-2 text-[10px] leading-relaxed text-neutral-400">
//         How this page serves inside the funnel: its share of the split and whether it takes traffic at all.
//       </p>

//       <div className="mt-3 rounded-lg border border-[#2b2928] bg-[#1d1c1b] p-3">
//         <div className="text-[9px] tracking-wide text-neutral-400">TRAFFIC ALLOCATION</div>
//         <div className={`mt-1 text-[18px] font-bold ${active ? "text-neutral-100" : "text-neutral-500"}`}>{fmt(percent)}</div>
//         <div className="mt-1 text-[9px] text-neutral-500">Change the split from Edit funnel (click the trigger).</div>
//       </div>

//       <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-[#2b2928] bg-[#1d1c1b] p-3">
//         <div>
//           <div className="text-[11px] font-medium text-neutral-100">Takes traffic</div>
//           <div className="mt-0.5 text-[9px] leading-snug text-neutral-400">
//             An inactive page keeps its place in the split but serves nothing.
//           </div>
//         </div>
//         <button
//           type="button"
//           role="switch"
//           aria-checked={active}
//           onClick={() => onToggle(!active)}
//           className={`relative h-5 w-9 shrink-0 rounded-full transition ${active ? "bg-emerald-500" : "bg-[#3a3837]"}`}
//         >
//           <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${active ? "left-[18px]" : "left-0.5"}`} />
//         </button>
//       </div>

//       <div className="mt-3 flex items-center justify-between gap-2">
//         <button
//           type="button"
//           onClick={onRemove}
//           className="flex items-center gap-1.5 rounded-md border border-red-500/40 px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-500/10"
//         >
//           <TrashIcon size={12} />
//           Remove from funnel
//         </button>
//         <span className="text-[9px] leading-snug text-neutral-500">Detaches it; the page survives.</span>
//       </div>
//     </div>
//   );
// }

// /* ---------- add / edit funnel popup ---------- */
// const PRODUCTS = ["Classic Tee", "Hoodie", "Sneakers", "Baseball Cap", "Backpack", "Water Bottle", "Sunglasses", "Wrist Watch", "Leather Wallet", "Phone Case"];

// function FunnelModal({ initial, onSave, onDelete, onClose }) {
//   const initN = initial?.groups > 0 ? initial.groups : 1;
//   const [name, setName] = useState(initial?.name ?? "");
//   const [picked, setPicked] = useState(initial?.picked ?? []);
//   const [n, setN] = useState(initN);
//   const [pcts, setPcts] = useState(
//     initial?.percents?.length === initN && initN > 1 ? initial.percents : splitPercents(initN)
//   );
//   const [confirmDel, setConfirmDel] = useState(false);
//   const all = picked.length === PRODUCTS.length;
//   const total = Math.round(pcts.reduce((a, b) => a + b, 0) * 10) / 10;
//   const totalOk = n === 1 || total === 100;
//   const ok = name.trim() !== "" && picked.length > 0 && totalOk;
//   const toggle = (p) => setPicked((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
//   const changeN = (v) => {
//     setN(v);
//     setPcts(splitPercents(v));
//   };

//   // Changing one group auto-adjusts the others so the total always stays 100
//   const setPct = (i, v) => {
//     const val = Math.min(100, Math.max(0, Math.round(v * 10) / 10));
//     setPcts((p) => {
//       if (p.length === 1) return [100];
//       const rest = Math.round((100 - val) * 10) / 10;
//       const others = p.map((x, k) => k).filter((k) => k !== i);
//       const oldSum = others.reduce((a, k) => a + p[k], 0);
//       const next = [...p];
//       next[i] = val;
//       let used = 0;
//       others.forEach((k, idx) => {
//         if (idx === others.length - 1) {
//           // the last one takes the remainder so the total is exactly 100
//           next[k] = Math.round((rest - used) * 10) / 10;
//         } else {
//           const share = oldSum > 0 ? p[k] / oldSum : 1 / others.length;
//           next[k] = Math.round(rest * share * 10) / 10;
//           used += next[k];
//         }
//       });
//       return next;
//     });
//   };

//   useEffect(() => {
//     const onKey = (e) => e.key === "Escape" && onClose();
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onClose]);

//   const box = (on) => (
//     <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${on ? "border-[#b0614a] bg-[#b0614a] text-white" : "border-[#4a4746]"}`}>
//       {on && <CheckIcon size={9} />}
//     </span>
//   );
//   const stepBtn = "flex h-7 w-7 items-center justify-center rounded-md border border-[#3a3837] text-[13px] text-neutral-200 hover:border-[#b0614a]";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
//       <div
//         role="dialog"
//         aria-modal="true"
//         aria-label={initial ? "Edit checkout funnel" : "Add checkout funnel"}
//         onClick={(e) => e.stopPropagation()}
//         className="max-h-[95vh] w-[400px] overflow-y-auto rounded-xl border border-[#2b2928] bg-[#1c1b1a] p-4 shadow-2xl"
//       >
//         <div className="text-[13px] font-bold text-neutral-100">{initial ? "Edit checkout funnel" : "Add checkout funnel"}</div>

//         <label className="mt-3 block text-[9px] tracking-wide text-neutral-400">1. FUNNEL NAME</label>
//         <input
//           autoFocus
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="e.g. Summer sale funnel"
//           className="mt-1 w-full select-text rounded-md border border-[#3a3837] bg-[#1d1c1b] px-2 py-1.5 text-[11px] text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-[#b0614a]"
//         />

//         <div className="mt-3 flex items-center justify-between">
//           <span className="text-[9px] tracking-wide text-neutral-400">2. PRODUCTS (10 DEFAULT)</span>
//           <button type="button" onClick={() => setPicked(all ? [] : [...PRODUCTS])} className="flex items-center gap-1.5 text-[10px] text-neutral-300 hover:text-white">
//             {box(all)}Check all
//           </button>
//         </div>
//         <div className="mt-1.5 grid grid-cols-2 gap-1.5">
//           {PRODUCTS.map((p) => (
//             <button
//               key={p}
//               type="button"
//               onClick={() => toggle(p)}
//               className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[10px] ${picked.includes(p) ? "border-[#b0614a] bg-[#b0614a]/10 text-neutral-100" : "border-[#2b2928] bg-[#1d1c1b] text-neutral-300 hover:border-[#3a3837]"}`}
//             >
//               {box(picked.includes(p))}
//               {p}
//             </button>
//           ))}
//         </div>

//         <div className="mt-3 text-[9px] tracking-wide text-neutral-400">3. SPLIT OPTION</div>
//         <div className="mt-1.5 flex items-center gap-2">
//           <button type="button" onClick={() => changeN(Math.max(1, n - 1))} className={stepBtn}>−</button>
//           <div className="w-8 text-center text-[15px] font-bold text-neutral-100">{n}</div>
//           <button type="button" onClick={() => changeN(Math.min(8, n + 1))} className={stepBtn}>+</button>
//           <span className="ml-1 text-[11px] text-neutral-400">{n === 1 ? "No split" : `${n} groups`}</span>
//         </div>

//         {n > 1 && (
//           <>
//             <div className="mt-3 grid grid-cols-2 gap-2">
//               {pcts.map((p, i) => (
//                 <div key={i} className="rounded-lg border border-[#3a3837] bg-[#1d1c1b] px-2.5 py-2">
//                   <div className="text-[11px] font-medium text-neutral-300">Group {i + 1}</div>
//                   <div className="mt-1.5 flex items-center gap-1.5">
//                     <button type="button" onClick={() => setPct(i, p - 1)} className={stepBtn}>−</button>
//                     <div className="flex flex-1 items-center justify-center rounded-md border border-[#3a3837] bg-[#161515] px-1 py-1">
//                       <input
//                         type="number"
//                         min="0"
//                         max="100"
//                         step="0.1"
//                         value={p}
//                         onChange={(e) => setPct(i, parseFloat(e.target.value) || 0)}
//                         className="w-full select-text bg-transparent text-center text-[13px] font-bold text-neutral-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
//                       />
//                       <span className="text-[11px] text-neutral-400">%</span>
//                     </div>
//                     <button type="button" onClick={() => setPct(i, p + 1)} className={stepBtn}>+</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-2 flex items-center justify-between">
//               <button type="button" onClick={() => setPcts(splitPercents(n))} className="text-[10px] text-[#d08b73] hover:underline">
//                 Equal split
//               </button>
//               <span className={`text-[11px] font-medium ${totalOk ? "text-emerald-400" : "text-red-400"}`}>
//                 Total: {fmt(total)} {totalOk ? "" : "(must be 100%)"}
//               </span>
//             </div>
//           </>
//         )}

//         <div className="mt-4 flex items-center justify-between gap-2">
//           {/* Delete (edit mode only) */}
//           <div className="flex items-center gap-2">
//             {initial && onDelete && (
//               confirmDel ? (
//                 <>
//                   <span className="text-[10px] text-red-300">Delete funnel?</span>
//                   <button
//                     type="button"
//                     onClick={onDelete}
//                     className="rounded-md bg-red-600 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-red-500"
//                   >
//                     Yes, delete
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setConfirmDel(false)}
//                     className="rounded-md border border-[#3a3837] px-2.5 py-1.5 text-[10px] text-neutral-300 hover:border-neutral-500"
//                   >
//                     No
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={() => setConfirmDel(true)}
//                   className="flex items-center gap-1.5 rounded-md border border-red-500/40 px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-500/10"
//                 >
//                   <TrashIcon size={12} />
//                   Delete
//                 </button>
//               )
//             )}
//           </div>

//           <div className="flex items-center gap-2">
//             <button type="button" onClick={onClose} className="rounded-md border border-[#3a3837] px-3 py-1.5 text-[10px] text-neutral-300 hover:border-neutral-500">Cancel</button>
//             <button
//               type="button"
//               disabled={!ok}
//               onClick={() =>
//                 onSave({
//                   name: name.trim(),
//                   sub: all ? "All products" : `${picked.length} selected`,
//                   groups: n > 1 ? n : 0,
//                   percents: n > 1 ? pcts : undefined,
//                   // keep the existing active/inactive status when the group count is unchanged
//                   pagesActive: n > 1 && initial?.pagesActive?.length === n ? initial.pagesActive : undefined,
//                   picked,
//                 })
//               }
//               className="rounded-md bg-[#b0614a] px-4 py-1.5 text-[10px] font-medium text-white hover:bg-[#c26f56] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------- main ---------- */
// export default function App() {
//   const [funnels, setFunnels] = useState([{ name: "All Products", sub: "Always matches", badge: "Default", groups: 0, locked: true }]);
//   const [modal, setModal] = useState(null); // "new" | funnel index | null
//   const [panel, setPanel] = useState(null); // { f: funnelIndex, p: pageIndex } | null
//   const [colEl, setColEl] = useState(null);
//   const [geo, setGeo] = useState({ h: 0, w: 0, mids: [], pts: [] });
//   const ml = layoutMerge(geo.h, geo.pts, geo.w);

//   // Adding a group: percentages reset to an equal split, the new page starts Active
//   const setGroups = (i, v) =>
//     setFunnels((f) =>
//       f.map((x, k) => (k === i ? { ...x, groups: v, percents: undefined, pagesActive: [...activesOf(x), true].slice(0, v) } : x))
//     );
//   const deleteFunnel = (i) => {
//     setPanel(null);
//     setFunnels((f) => f.filter((x, k) => k !== i || x.locked));
//   };
//   const setPageActive = (fi, pi, v) =>
//     setFunnels((l) =>
//       l.map((x, k) => {
//         if (k !== fi) return x;
//         const arr = activesOf(x);
//         arr[pi] = v;
//         return { ...x, pagesActive: arr };
//       })
//     );
//   const removePage = (fi, pi) => {
//     setPanel(null);
//     setFunnels((l) =>
//       l.map((x, k) => {
//         if (k !== fi) return x;
//         const arr = activesOf(x).filter((_, j) => j !== pi);
//         const g = x.groups - 1;
//         return g < 2
//           ? { ...x, groups: 0, percents: undefined, pagesActive: undefined }
//           : { ...x, groups: g, percents: undefined, pagesActive: arr };
//       })
//     );
//   };

//   // Close the side panel as soon as a modal opens
//   useEffect(() => {
//     if (modal !== null) setPanel(null);
//   }, [modal]);

//   /* ----- Figma-style canvas: Ctrl+scroll zoom, scroll / Space+drag / middle mouse pan ----- */
//   const viewRef = useRef(null);
//   const contentRef = useRef(null);
//   const spaceRef = useRef(false);
//   const dragRef = useRef(null);
//   const inited = useRef(false);
//   const [view, setView] = useState({ x: 0, y: 0, k: 1 });
//   const [ready, setReady] = useState(false); // content stays hidden until the first fit (prevents the blink)
//   const [space, setSpace] = useState(false);
//   const [drag, setDrag] = useState(false);

//   const zoomAt = (px, py, f) =>
//     setView((v) => {
//       const k = Math.min(4, Math.max(0.1, v.k * f));
//       const r = k / v.k;
//       return { k, x: px - (px - v.x) * r, y: py - (py - v.y) * r };
//     });
//   const fit = () => {
//     const el = viewRef.current;
//     const c = contentRef.current;
//     if (!el || !c) return;
//     const k = Math.min(1, el.clientWidth / c.offsetWidth, el.clientHeight / c.offsetHeight);
//     setView({ k, x: (el.clientWidth - c.offsetWidth * k) / 2, y: (el.clientHeight - c.offsetHeight * k) / 2 });
//   };
//   const zoomCenter = (f) => {
//     const el = viewRef.current;
//     zoomAt(el.clientWidth / 2, el.clientHeight / 2, f);
//   };

//   useEffect(() => {
//     if (geo.h > 0 && !inited.current) {
//       inited.current = true;
//       fit();
//       setReady(true);
//     }
//   }, [geo.h]);

//   useEffect(() => {
//     const el = viewRef.current;
//     const onWheel = (e) => {
//       e.preventDefault();
//       const rect = el.getBoundingClientRect();
//       if (e.ctrlKey || e.metaKey) {
//         zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0025));
//       } else {
//         const horiz = e.shiftKey && !e.deltaX;
//         setView((v) => ({ ...v, x: v.x - (horiz ? e.deltaY : e.deltaX), y: v.y - (horiz ? 0 : e.deltaY) }));
//       }
//     };
//     const typing = (t) => /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable;
//     const onKeyDown = (e) => {
//       if (typing(e.target) || document.querySelector('[role="dialog"]')) return;
//       if (e.code === "Space") {
//         e.preventDefault();
//         spaceRef.current = true;
//         setSpace(true);
//       } else if (e.ctrlKey || e.metaKey) {
//         if (e.key === "=" || e.key === "+") { e.preventDefault(); zoomCenter(1.2); }
//         else if (e.key === "-") { e.preventDefault(); zoomCenter(1 / 1.2); }
//         else if (e.key === "0") { e.preventDefault(); fit(); }
//       }
//     };
//     const stopSpace = () => {
//       spaceRef.current = false;
//       setSpace(false);
//     };
//     const onKeyUp = (e) => e.code === "Space" && stopSpace();
//     el.addEventListener("wheel", onWheel, { passive: false });
//     window.addEventListener("keydown", onKeyDown);
//     window.addEventListener("keyup", onKeyUp);
//     window.addEventListener("blur", stopSpace);
//     return () => {
//       el.removeEventListener("wheel", onWheel);
//       window.removeEventListener("keydown", onKeyDown);
//       window.removeEventListener("keyup", onKeyUp);
//       window.removeEventListener("blur", stopSpace);
//     };
//   }, []);

//   const [dnd, setDnd] = useState(null); // { i, dy, to } while reordering
//   const dndRef = useRef(null);
//   const copyFunnel = (i) => {
//     setPanel(null);
//     setFunnels((l) => {
//       const a = [...l];
//       a.splice(i + 1, 0, { ...l[i], name: `${l[i].name} copy` });
//       return a;
//     });
//   };
//   const startDrag = (i, e) => {
//     if (e.button !== 0) return;
//     e.stopPropagation();
//     e.preventDefault();
//     const sy = e.clientY;
//     const k = view.k;
//     const mids = geo.mids;
//     const lock = funnels[0]?.locked ? 1 : 0;
//     const move = (ev) => {
//       const y = mids[i] + (ev.clientY - sy) / k;
//       let to = 0;
//       mids.forEach((m, j) => {
//         if (Math.abs(m - y) < Math.abs(mids[to] - y)) to = j;
//       });
//       const st = { i, dy: (ev.clientY - sy) / k, to: Math.max(lock, to) };
//       dndRef.current = st;
//       setDnd(st);
//     };
//     const up = () => {
//       window.removeEventListener("pointermove", move);
//       window.removeEventListener("pointerup", up);
//       const st = dndRef.current;
//       dndRef.current = null;
//       setDnd(null);
//       if (st && st.to !== st.i) {
//         setPanel(null);
//         setFunnels((l) => {
//           const a = [...l];
//           const [m] = a.splice(st.i, 1);
//           a.splice(st.to, 0, m);
//           return a;
//         });
//       }
//     };
//     window.addEventListener("pointermove", move);
//     window.addEventListener("pointerup", up);
//   };

//   const onDown = (e) => {
//     const ok = e.button === 1 || (e.button === 0 && (spaceRef.current || !e.target.closest("button")));
//     if (!ok) return;
//     e.preventDefault();
//     e.currentTarget.setPointerCapture(e.pointerId);
//     dragRef.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
//     setDrag(true);
//   };
//   const onMove = (e) => {
//     const d = dragRef.current;
//     if (d) setView((v) => ({ ...v, x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }));
//   };
//   const onUp = () => {
//     dragRef.current = null;
//     setDrag(false);
//   };

//   useEffect(() => {
//     if (!colEl) return;
//     const update = () => {
//       const mids = [];
//       const pts = [];
//       Array.from(colEl.children).forEach((c, i) => {
//         const g = funnels[i]?.groups || 0;
//         const top = c.offsetTop;
//         const hh = c.offsetHeight;
//         mids.push(top + hh / 2);
//         if (g > 0) for (let k = 0; k < g; k++) pts.push({ x: TRIG_W + LEFT + CARD_W, y: top + ((k + 0.5) / g) * hh });
//         else pts.push({ x: TRIG_W, y: top + hh / 2 });
//       });
//       setGeo({ h: colEl.offsetHeight, w: colEl.offsetWidth, mids, pts });
//     };
//     update();
//     const ro = new ResizeObserver(update);
//     ro.observe(colEl);
//     Array.from(colEl.children).forEach((c) => ro.observe(c));
//     return () => ro.disconnect();
//   }, [colEl, funnels]);

//   const panelFunnel = panel ? funnels[panel.f] : null;
//   const panelValid = panelFunnel && panel.p < (panelFunnel.groups || 0);

//   return (
//     <div className="relative h-screen w-screen select-none overflow-hidden bg-[#0f0e0e] text-neutral-100">
//       <button
//         type="button"
//         onClick={() => setModal("new")}
//         className="fixed right-6 top-5 z-40 rounded-lg bg-[#b0614a] px-4 py-2 text-[11px] font-medium text-white shadow-lg transition hover:bg-[#c26f56]"
//       >
//         + Add checkout funnel
//       </button>

//       <div
//         ref={viewRef}
//         onPointerDown={onDown}
//         onPointerMove={onMove}
//         onPointerUp={onUp}
//         onPointerCancel={onUp}
//         className={`absolute inset-0 touch-none select-none ${drag ? "cursor-grabbing" : space ? "cursor-grab" : ""}`}
//       >
//         <div
//           ref={contentRef}
//           style={{
//             transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
//             opacity: ready ? 1 : 0,
//           }}
//           className="absolute left-0 top-0 w-max origin-top-left"
//         >
//           <div className={`flex items-center p-8 ${space ? "[&_*]:!cursor-grab" : ""}`}>
//             <StoreNode />
//             <FanIn h={geo.h} ys={geo.mids} />
//             <div className="relative flex shrink-0">
//               <div ref={setColEl} className="relative flex shrink-0 flex-col gap-16">
//                 {funnels.map((f, i) => (
//                   <Block
//                     key={i}
//                     info={f}
//                     groups={f.groups}
//                     onEdit={f.locked ? undefined : () => setModal(i)}
//                     onAdd={() => setGroups(i, Math.min(8, f.groups + 1))}
//                     onCopy={f.locked ? undefined : () => copyFunnel(i)}
//                     onDragStart={f.locked ? undefined : (e) => startDrag(i, e)}
//                     onPage={(p) => setPanel({ f: i, p })}
//                     selectedPage={panel?.f === i ? panel.p : -1}
//                     dragY={dnd?.i === i ? dnd.dy : undefined}
//                     dragging={dnd?.i === i}
//                     target={!!dnd && dnd.to === i && dnd.i !== i}
//                   />
//                 ))}
//               </div>
//               <div style={{ width: ml.W }} className="shrink-0" />
//               {geo.h > 0 && <Wires w={geo.w + ml.W} h={geo.h} paths={ml.paths} arrows={ml.arrows} className="pointer-events-none absolute left-0 top-0" />}
//             </div>
//             <Pipeline />
//           </div>
//         </div>
//       </div>

//       <div className="fixed bottom-5 right-6 z-40 flex items-center gap-1 rounded-lg border border-[#2b2928] bg-[#1c1b1a] p-1 text-[11px] text-neutral-200 shadow-lg">
//         <button type="button" onClick={() => zoomCenter(1 / 1.2)} className="h-6 w-6 rounded hover:bg-[#2b2928]" title="Zoom out (Ctrl -)">−</button>
//         <button type="button" onClick={() => setView((v) => ({ ...v, k: 1 }))} className="w-11 rounded py-1 hover:bg-[#2b2928]" title="Reset to 100%">{Math.round(view.k * 100)}%</button>
//         <button type="button" onClick={() => zoomCenter(1.2)} className="h-6 w-6 rounded hover:bg-[#2b2928]" title="Zoom in (Ctrl +)">+</button>
//         <button type="button" onClick={fit} className="rounded px-2 py-1 hover:bg-[#2b2928]" title="Fit to screen (Ctrl 0)">Fit</button>
//       </div>
//       <div className="pointer-events-none fixed bottom-5 left-6 z-40 text-[10px] text-neutral-500">
//         Scroll to pan · Ctrl + scroll to zoom · Space + drag to move
//       </div>

//       {panelValid && (
//         <PagePanel
//           funnel={panelFunnel}
//           page={panel.p}
//           onToggle={(v) => setPageActive(panel.f, panel.p, v)}
//           onRemove={() => removePage(panel.f, panel.p)}
//           onClose={() => setPanel(null)}
//         />
//       )}

//       {modal !== null && (
//         <FunnelModal
//           key={modal}
//           initial={typeof modal === "number" ? funnels[modal] : undefined}
//           onClose={() => setModal(null)}
//           onDelete={
//             typeof modal === "number"
//               ? () => {
//                   deleteFunnel(modal);
//                   setModal(null);
//                 }
//               : undefined
//           }
//           onSave={(f) => {
//             setFunnels((list) => (typeof modal === "number" ? list.map((x, k) => (k === modal ? f : x)) : [...list, f]));
//             setModal(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import {
  ArrowDown, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle,
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
    onDoubleClick: c.preview || isInlineEditing || !["text", "heading", "button", "icon", "image"].includes(n.type) ? undefined : (e) => {
      e.stopPropagation();
      c.editNode(n, device, e.currentTarget);
    },
    draggable: isPageSection && !c.preview,
    onDragStart: isPageSection && !c.preview ? (e) => {
      if (e.target !== e.currentTarget) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData("text/x-node", n.id);
      e.dataTransfer.effectAllowed = "move";
      const bounds = e.currentTarget.getBoundingClientRect();
      c.startSectionDrag(bounds, e.clientX, e.clientY);
      const dragImage = document.createElement("canvas");
      dragImage.width = 1;
      dragImage.height = 1;
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    } : undefined,
    onDragEnd: isPageSection && !c.preview ? c.endSectionDrag : undefined,
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

  switch (n.type) {
    case "image": return <img {...common} src={p.src} alt={p.alt || ""} draggable={false} />;
    case "hr": return <hr {...common} />;
    case "list": return <ul {...common}>{(p.items || []).map((t, i) => <li key={i}>{t}</li>)}</ul>;
    case "stars": {
      const r = Math.round(Math.max(0, Math.min(5, +p.rating || 0)));
      return <div {...common}>{"★".repeat(r) + "☆".repeat(5 - r)}</div>;
    }
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
const Inp = ({ value, onChange, placeholder, type = "text", autoFocus = false }) => (
  <input type={type} value={value ?? ""} placeholder={placeholder} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500" />
);
const Sel = ({ value, options, onChange }) => (
  <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-200 bg-white px-1.5 py-1 text-xs outline-none focus:border-blue-500">
    {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
  </select>
);
const Area = ({ value, onChange, rows = 3, autoFocus = false }) => (
  <textarea rows={rows} value={value ?? ""} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)}
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
function ComponentsPanel({ onAdd }) {
  const [q, setQ] = useState("");
  const list = COMPONENTS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder="Search components…" />
      <p className="mt-2 text-[11px] text-gray-500">Click to add, or drag onto the canvas.</p>
      <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto pr-1">
        {list.map((c) => (
          <button key={c.key} draggable
            onDragStart={(e) => { e.dataTransfer.setData("text/x-comp", c.key); e.dataTransfer.effectAllowed = "copy"; }}
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

function RightPanel({ node: n, device, stateTab, setStateTab, tab, setTab, api }) {
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
    <div className="pointer-events-auto absolute right-3 top-[88px] bottom-3 flex w-[300px] flex-col overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
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

      <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4">
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
              <div><span className="mb-1 block text-xs text-gray-500">Content</span><Area autoFocus value={p.text} onChange={(v) => api.setProps({ text: v })} /></div>
            )}
            {n.type === "list" && (
              <div><span className="mb-1 block text-xs text-gray-500">Items (one per line)</span><Area rows={5} value={(p.items || []).join("\n")} onChange={(v) => api.setProps({ items: v.split("\n") })} /></div>
            )}
            {n.type === "stars" && <Field label="Rating"><Sel value={String(p.rating ?? 5)} options={["0", "1", "2", "3", "4", "5"]} onChange={(v) => api.setProps({ rating: +v })} /></Field>}
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
  const addComponentAtDrop = (nn, parentId, e) => {
    if (parentId == null) return addSectionAtDrop(nn, e);

    const parent = findNode(page.children, parentId);
    const parentElement = document.querySelector(`[data-node="${parentId}"]`);
    if (!parent || !parentElement) return addNode(nn, parentId);

    const children = [...parentElement.children].filter((child) => child.dataset.node);
    const style = window.getComputedStyle(parentElement);
    const horizontal = style.display === "grid" || (style.display === "flex" && style.flexDirection.startsWith("row"));
    const coordinate = horizontal ? e.clientX : e.clientY;
    const targetChild = children.find((child) => {
      const bounds = child.getBoundingClientRect();
      const middle = horizontal ? bounds.left + bounds.width / 2 : bounds.top + bounds.height / 2;
      return coordinate < middle;
    });
    const index = targetChild
      ? parent.children.findIndex((child) => child.id === targetChild.dataset.node)
      : parent.children.length;

    update((p) => ({ ...p, children: insertInto(p.children, parentId, nn, index) }));
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
    preview: false, selectedId: selId, activeDevice, stateTab, inlineEdit, inlineEditRef,
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
  };
  const visible = Object.keys(DEVICES).filter((d) => show[d]);

  const railBtn = (id, icon, title) => (
    <button key={id} title={title} onClick={() => { if (leftTab === id && leftOpen) { setLeftOpen(false); setSectionPreviewsVisible(false); } else { setLeftTab(id); setLeftOpen(true); setSectionPreviewsVisible(false); } }}
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
          if (e.dataTransfer.types.includes("text/x-comp") || e.dataTransfer.types.includes("text/x-asset") || e.dataTransfer.types.includes("text/x-section") || e.dataTransfer.types.includes("text/x-node")) e.preventDefault();
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
          <style>{`.rp-frame *{box-sizing:border-box}.rp-frame :where(h1,h2,h3,h4,h5,h6,p,ul,hr){margin:0}.rp-frame button{font-family:inherit}`}</style>
          {visible.map((d, i) => {
            const W = widths[d];
            return (
              <div key={d} data-nopan className="group relative shrink-0" style={{ width: Math.max(W, 175 / s) }} onClick={(e) => e.stopPropagation()}>
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
        <button title="Page settings" onClick={() => setPop(pop === "settings" ? null : "settings")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 cursor-pointer"><Ico n="gear" size={16} /></button>
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
              <button onClick={() => { setLeftOpen(false); setSectionPreviewsVisible(false); }} className="text-gray-400 hover:text-gray-700"><Ico n="left" size={16} /></button>
            </div>
            {leftTab === "sections" && <SectionsPanel onAdd={addSection} onPreviewVisibilityChange={setSectionPreviewsVisible} />}
            {leftTab === "components" && <ComponentsPanel onAdd={addAfterSelection} />}
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