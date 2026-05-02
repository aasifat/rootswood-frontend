// Rootswood · Full React SPA  ·  connects to Go backend on :8080
import { useState, useEffect, useCallback, useRef } from "react";

const API = "https://rootswood-api.onrender.com/api";

/* ─── API helpers ─────────────────────────────────────────────────────────── */
const getToken  = () => localStorage.getItem("rw_token");
const setToken  = t  => localStorage.setItem("rw_token", t);
const clearToken= () => localStorage.removeItem("rw_token");

async function api(path, opts = {}) {
  const token = getToken();
  const res = await fetch(API + path, {
    ...opts,
    headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}), ...(opts.headers||{}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/* ─── Global styles ───────────────────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --cream:#F5F0E8;--warm:#EDE5D4;--bark:#8B6F47;--forest:#2D4A3E;
      --moss:#4A7C59;--gold:#C9973A;--rust:#A0522D;--ink:#1A1A14;
      --fog:#9A9488;--paper:#FDFAF5;--shadow:rgba(26,26,20,.12);
    }
    html,body,#root{height:100%}
    body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);overflow-x:hidden}
    h1,h2,h3,h4{font-family:'Playfair Display',serif}
    ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--warm)}::-webkit-scrollbar-thumb{background:var(--bark);border-radius:3px}
    .page{animation:fadeUp .32s ease both}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .card{background:var(--paper);border:1px solid var(--warm);border-radius:12px;box-shadow:0 2px 16px var(--shadow)}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;border-radius:8px;border:none;
      font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .18s}
    .btn:disabled{opacity:.45;cursor:not-allowed}
    .btn-primary{background:var(--forest);color:#fff}
    .btn-primary:not(:disabled):hover{background:var(--moss);transform:translateY(-1px);box-shadow:0 4px 12px rgba(45,74,62,.3)}
    .btn-secondary{background:transparent;color:var(--forest);border:1.5px solid var(--forest)}
    .btn-secondary:not(:disabled):hover{background:var(--forest);color:#fff}
    .btn-gold{background:var(--gold);color:#fff}.btn-gold:not(:disabled):hover{background:var(--bark)}
    .btn-danger{background:#FFF0EE;color:var(--rust);border:1px solid #FECDCA}
    .btn-danger:not(:disabled):hover{background:var(--rust);color:#fff}
    .btn-sm{padding:7px 14px;font-size:13px}.btn-xs{padding:5px 10px;font-size:12px}
    .input{width:100%;padding:11px 14px;border:1.5px solid var(--warm);border-radius:8px;
      font-family:'DM Sans',sans-serif;font-size:14px;background:var(--paper);color:var(--ink);outline:none;transition:border-color .2s}
    .input:focus{border-color:var(--forest)}
    label{font-size:13px;font-weight:500;color:var(--fog);display:block;margin-bottom:5px}
    .nav-pill{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;cursor:pointer;
      font-size:14px;font-weight:400;color:var(--ink);transition:all .18s;border:none;background:none;width:100%;text-align:left}
    .nav-pill:hover{background:var(--warm);color:var(--forest)}.nav-pill.active{background:var(--forest);color:#fff}
    .badge{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;
      border-radius:50%;background:var(--gold);color:#fff;font-size:10px;font-weight:700}
    /* tree */
    .tree-node{position:absolute;background:var(--paper);border:2px solid var(--warm);border-radius:10px;
      padding:10px 12px;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px var(--shadow);text-align:center}
    .tree-node:hover{border-color:var(--forest);transform:scale(1.04)}
    .tree-node.selected{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,151,58,.25)}
    .spouse-pair{position:absolute;display:flex;align-items:stretch;background:var(--paper);
      border:2px solid var(--warm);border-radius:12px;box-shadow:0 2px 8px var(--shadow);overflow:hidden}
    .spouse-half{flex:1;padding:10px 12px;cursor:pointer;transition:background .15s;text-align:center;
      border:none;background:transparent;font-family:inherit;color:inherit}
    .spouse-half:hover{background:rgba(45,74,62,.06)}.spouse-half.selected{background:rgba(201,151,58,.12)}
    .spouse-divider{width:1px;background:var(--warm);flex-shrink:0}
    /* avatar */
    .avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-family:'Playfair Display',serif;font-weight:700;flex-shrink:0}
    /* timeline */
    .timeline-item{display:flex;gap:16px;padding-bottom:20px;position:relative}
    .timeline-item::before{content:'';position:absolute;left:19px;top:36px;width:2px;height:calc(100% - 12px);background:var(--warm)}
    .timeline-item:last-child::before{display:none}
    .stat-card{background:var(--paper);border:1px solid var(--warm);border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:6px}
    /* modal */
    .modal-overlay{position:fixed;inset:0;background:rgba(26,26,20,.55);z-index:200;
      display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
    .modal-box{background:var(--paper);border-radius:16px;width:100%;max-width:520px;
      box-shadow:0 24px 64px rgba(0,0,0,.3);animation:fadeUp .25s ease both;max-height:92vh;overflow-y:auto}
    /* toast */
    .toast{position:fixed;bottom:24px;right:24px;z-index:999;padding:12px 20px;border-radius:10px;
      font-size:14px;font-weight:500;color:#fff;animation:fadeUp .3s ease;box-shadow:0 8px 24px rgba(0,0,0,.2)}
    .empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:60px 24px;color:var(--fog)}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spinner{width:28px;height:28px;border:3px solid var(--warm);border-top-color:var(--forest);border-radius:50%;animation:spin .7s linear infinite}
    /* auth pages — centred card on gradient bg, NO sidebar/topbar */
    .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,var(--cream) 45%,#2D4A3E 100%);padding:24px}
    /* contact form textarea */
    textarea.input{resize:vertical;line-height:1.6}
    /* pill tags */
    .pill{padding:5px 12px;border-radius:20px;font-size:12px;font-weight:500;
      background:rgba(45,74,62,.09);color:var(--forest);border:1px solid rgba(45,74,62,.18)}
  `}</style>
);

/* ─── Icon set ────────────────────────────────────────────────────────────── */
const Icon = ({ name, size=18, style:s }) => {
  const P = {fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};
  const M = {
    home:     <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    tree:     <><path d="M12 2a9 9 0 0 1 9 9c0 3.6-2.1 6.7-5.2 8.2"/><path d="M12 2a9 9 0 0 0-9 9c0 3.6 2.1 6.7 5.2 8.2"/><line x1="12" y1="22" x2="12" y2="11"/><path d="M12 11 8 7"/><path d="M12 11l4-4"/></>,
    user:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    users:    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 1-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    bell:     <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    plus:     <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    search:   <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    edit:     <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:    <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
    chevron:  <polyline points="9 18 15 12 9 6"/>,
    arrowLeft:<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    leaf:     <path d="M2 22c1.25-1.25 2.4-2.4 3.5-3.5C8.33 15.67 10 13 10 9a8 8 0 0 1 8-8s0 8-8 8c-3.6 0-6 1.5-8 5.5L2 22z"/>,
    camera:   <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    info:     <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    share:    <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    save:     <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
    logout:   <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    pen:      <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
    mail:     <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    globe:    <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    code:     <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
    star:     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    link:     <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    send:     <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    check:    <polyline points="20 6 9 12 4 10"/>,
    fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" {...P} style={s}>{M[name]||<circle cx="12" cy="12" r="10"/>}</svg>;
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const COLORS = ["#4A7C59","#8B6F47","#C9973A","#A0522D","#2D4A3E","#7B68AE","#5B8A5F","#B05B6F","#4A7A8A","#7A6A3A","#9B7EA8","#6A8F6A"];
const memberColor = i => COLORS[i % COLORS.length];
const makeAvatar  = n => n.trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("");

const Toast = ({ msg, type="success", onDone }) => {
  useEffect(()=>{ const t=setTimeout(onDone,3200); return ()=>clearTimeout(t); },[]);
  const bg = type==="error"?"var(--rust)":type==="warning"?"var(--gold)":"var(--forest)";
  return <div className="toast" style={{background:bg}}>{msg}</div>;
};
const Spinner = () => <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40}}><div className="spinner"/></div>;

/* ─── Tree layout engine ──────────────────────────────────────────────────── */
const NODE_W=130, NODE_H=86, NODE_GAP=32, ROW_H=165, PAIR_W=268;

function layoutTree(members, relationships) {
  if (!members.length) return null;

  const spouseEdges  = relationships.filter(r => r.rel_type === "spouse");
  const parentEdges  = relationships.filter(r => r.rel_type === "parent");
  const siblingEdges = relationships.filter(r => r.rel_type === "sibling");

  /* ── 1. Spouse pairs ───────────────────────────────────────────────────── */
  const pairedIds  = new Set();
  const spousePairs = [];
  const pairOf = {};
  spouseEdges.forEach(e => {
    const a = members.find(m => m.id === e.from_id);
    const b = members.find(m => m.id === e.to_id);
    if (!a || !b || pairedIds.has(a.id) || pairedIds.has(b.id)) return;
    pairedIds.add(a.id); pairedIds.add(b.id);
    const pair = [a, b];
    spousePairs.push(pair);
    pairOf[a.id] = pair; pairOf[b.id] = pair;
  });

  /* ── 2. Generation groups ──────────────────────────────────────────────── */
  const genGroups = {};
  members.forEach(m => { const g = m.generation ?? 0; (genGroups[g] = genGroups[g] || []).push(m); });
  const gens = Object.keys(genGroups).map(Number).sort((a, b) => a - b);

  /* ── 3. Render units ───────────────────────────────────────────────────── */
  // Each "unit" is either a spouse-pair card or a solo node card.
  // unitWidth(u) = pixel width
  const unitWidth = u => u.type === "pair" ? PAIR_W : NODE_W;

  const units = {};
  gens.forEach(g => {
    const placed = new Set(), U = [];
    spousePairs.forEach(([a, b]) => {
      if ((a.generation ?? 0) === g && !placed.has(a.id)) {
        U.push({ type: "pair", members: [a, b], uid: `p${a.id}_${b.id}` });
        placed.add(a.id); placed.add(b.id);
      }
    });
    genGroups[g].forEach(m => {
      if (!placed.has(m.id)) { U.push({ type: "solo", members: [m], uid: `s${m.id}` }); placed.add(m.id); }
    });
    units[g] = U;
  });

  // Quick lookup: uid → unit object
  const unitByUid = {};
  gens.forEach(g => units[g].forEach(u => { unitByUid[u.uid] = u; }));

  // memberId → unit uid
  const uidOf = id => {
    if (pairedIds.has(id)) { const pair = pairOf[id]; return `p${pair[0].id}_${pair[1].id}`; }
    return `s${id}`;
  };

  /* ── 4. childMap & unitChildrenMap ─────────────────────────────────────── */
  // childMap[parentMemberId] = [childMemberId, ...]
  const childMap = {};
  parentEdges.forEach(e => { (childMap[e.from_id] = childMap[e.from_id] || []).push(e.to_id); });

  // unitChildrenMap[parentUid] = Set of child uids
  const unitChildrenMap = {};
  Object.entries(childMap).forEach(([pidStr, cids]) => {
    const puid = uidOf(+pidStr);
    if (!unitChildrenMap[puid]) unitChildrenMap[puid] = new Set();
    cids.forEach(cid => unitChildrenMap[puid].add(uidOf(cid)));
  });

  // primaryParentOf[childUid] = parentUid  (first registrant wins)
  const primaryParentOf = {};
  Object.entries(unitChildrenMap).forEach(([puid, childSet]) => {
    childSet.forEach(cuid => { if (!primaryParentOf[cuid]) primaryParentOf[cuid] = puid; });
  });

  /* ── 5. Parent-aware X layout ──────────────────────────────────────────── */
  const PADDING = 60;
  const MIN_GAP = NODE_GAP;

  // unitCX[uid] = centre-x (float)
  const unitCX = {};
  // unitRowY[uid] = top-y
  const unitRowY = {};

  // Assign Y rows
  gens.forEach((g, rowIdx) => {
    units[g].forEach(u => { unitRowY[u.uid] = rowIdx * ROW_H + 28; });
  });

  // Identify roots (no primary parent)
  const rootUnits = [];
  gens.forEach(g => units[g].forEach(u => { if (!primaryParentOf[u.uid]) rootUnits.push(u); }));

  // Space roots evenly
  const totalRootW = rootUnits.reduce((s, u) => s + unitWidth(u), 0) + MIN_GAP * Math.max(0, rootUnits.length - 1);
  const startX = PADDING + Math.max(0, (760 - totalRootW) / 2);
  let rx = startX;
  rootUnits.forEach(u => { unitCX[u.uid] = rx + unitWidth(u) / 2; rx += unitWidth(u) + MIN_GAP; });

  // BFS: centre children under parents
  const visited = new Set(rootUnits.map(u => u.uid));
  const queue   = [...rootUnits];
  while (queue.length) {
    const parent = queue.shift();
    const childUids = [...(unitChildrenMap[parent.uid] || [])];
    const childUnits = childUids.map(uid => unitByUid[uid]).filter(Boolean).filter(u => !visited.has(u.uid));
    if (!childUnits.length) continue;

    const totalCW = childUnits.reduce((s, u) => s + unitWidth(u), 0) + MIN_GAP * Math.max(0, childUnits.length - 1);
    const parentCX = unitCX[parent.uid] ?? PADDING;
    let cx0 = parentCX - totalCW / 2;

    childUnits.forEach(cu => {
      unitCX[cu.uid] = cx0 + unitWidth(cu) / 2;
      visited.add(cu.uid);
      queue.push(cu);
      cx0 += unitWidth(cu) + MIN_GAP;
    });
  }

  // Fallback: any unvisited units
  gens.forEach(g => units[g].forEach(u => { if (!visited.has(u.uid)) { unitCX[u.uid] = PADDING; visited.add(u.uid); } }));

  // Overlap resolution: push nodes apart row by row (multiple passes)
  const resolveOverlaps = () => {
    gens.forEach(g => {
      const row = [...units[g]].sort((a, b) => (unitCX[a.uid] ?? 0) - (unitCX[b.uid] ?? 0));
      for (let i = 1; i < row.length; i++) {
        const prev = row[i - 1], cur = row[i];
        const needed = (unitCX[prev.uid] + unitWidth(prev) / 2) + MIN_GAP + unitWidth(cur) / 2;
        if ((unitCX[cur.uid] ?? 0) < needed) unitCX[cur.uid] = needed;
      }
      for (let i = row.length - 2; i >= 0; i--) {
        const cur = row[i], next = row[i + 1];
        const max = (unitCX[next.uid] - unitWidth(next) / 2) - MIN_GAP - unitWidth(cur) / 2;
        if ((unitCX[cur.uid] ?? 0) > max) unitCX[cur.uid] = max;
      }
    });
  };

  // Recentre parents over their children (bottom-up)
  const recentreParents = () => {
    [...gens].reverse().forEach(g => {
      units[g].forEach(u => {
        const childUids = [...(unitChildrenMap[u.uid] || [])];
        if (!childUids.length) return;
        const cxs = childUids.map(uid => unitCX[uid]).filter(v => v != null);
        if (!cxs.length) return;
        const avg = cxs.reduce((a, b) => a + b, 0) / cxs.length;
        unitCX[u.uid] = (unitCX[u.uid] + avg) / 2;
      });
    });
  };

  // Iterative convergence: overlap → recentre → repeat
  for (let i = 0; i < 5; i++) { resolveOverlaps(); recentreParents(); }
  resolveOverlaps(); // final cleanup pass

  /* ── 6. Shift entire layout right if any node bleeds past left edge ─────── */
  const minLeft = Math.min(...gens.flatMap(g =>
    units[g].map(u => (unitCX[u.uid] ?? 0) - unitWidth(u) / 2)
  ));
  if (minLeft < PADDING) {
    const shift = PADDING - minLeft;
    gens.forEach(g => units[g].forEach(u => { if (unitCX[u.uid] != null) unitCX[u.uid] += shift; }));
  }

  /* ── 7. posMap from final unitCX ───────────────────────────────────────── */
  const maxRight = Math.max(0, ...gens.flatMap(g =>
    units[g].map(u => (unitCX[u.uid] ?? 0) + unitWidth(u) / 2)
  ));
  const CANVAS_W = Math.max(760, maxRight + PADDING);

  const posMap = {};
  gens.forEach(g => {
    units[g].forEach(u => {
      const cx0 = unitCX[u.uid] ?? PADDING;
      const y   = unitRowY[u.uid] ?? 0;
      if (u.type === "pair") {
        const pairLeftX = cx0 - PAIR_W / 2;
        posMap[u.members[0].id] = { x: pairLeftX,              y, unitType: "pair-left",  pairLeftX };
        posMap[u.members[1].id] = { x: pairLeftX + PAIR_W / 2, y, unitType: "pair-right", pairLeftX };
      } else {
        posMap[u.members[0].id] = { x: cx0 - NODE_W / 2, y, unitType: "solo" };
      }
    });
  });

  /* ── 7. Geometry helpers ────────────────────────────────────────────────── */
  const cx = id => {
    const p = posMap[id]; if (!p) return 0;
    if (p.unitType === "pair-left")  return p.pairLeftX + PAIR_W * 0.25;
    if (p.unitType === "pair-right") return p.pairLeftX + PAIR_W * 0.75;
    return p.x + NODE_W / 2;
  };
  const pairCX   = id => { const p = posMap[id]; return p ? p.pairLeftX + PAIR_W / 2 : cx(id); };
  const nodeTop  = id => posMap[id]?.y ?? 0;
  const nodeBot  = id => nodeTop(id) + NODE_H;
  // Landing x for a line going TO a child (whole pair centre, or solo centre)
  const targetCX = id => pairedIds.has(id) ? pairCX(id) : cx(id);

  /* ── 8. Build SVG edges ─────────────────────────────────────────────────── */
  const edges = [];
  const drawnChildren = new Set();

  // Spouse-pair parents → children
  spousePairs.forEach(([a, b]) => {
    const shared = [...new Set([...(childMap[a.id] || []), ...(childMap[b.id] || [])])];
    if (!shared.length) return;
    const posA = posMap[a.id]; if (!posA) return;
    const originX = posA.pairLeftX + PAIR_W / 2;
    const originY = nodeBot(a.id);

    if (shared.length === 1) {
      const cid = shared[0]; if (drawnChildren.has(cid)) return; drawnChildren.add(cid);
      const tx = targetCX(cid), ty = nodeTop(cid), midY = (originY + ty) / 2;
      edges.push({ d: `M ${originX} ${originY} L ${originX} ${midY} L ${tx} ${midY} L ${tx} ${ty}`, type: "parent", key: `pair-${a.id}-${b.id}-${cid}` });
    } else {
      const toDraw = shared.filter(cid => !drawnChildren.has(cid));
      if (!toDraw.length) return;
      toDraw.forEach(cid => drawnChildren.add(cid));
      const txs  = toDraw.map(targetCX);
      const busY = originY + ROW_H * 0.38;
      const busL = Math.min(originX, ...txs), busR = Math.max(originX, ...txs);
      edges.push({ d: `M ${originX} ${originY} L ${originX} ${busY}`, type: "parent", key: `stem-${a.id}-${b.id}` });
      edges.push({ d: `M ${busL} ${busY} L ${busR} ${busY}`,          type: "parent", key: `bus-${a.id}-${b.id}` });
      toDraw.forEach(cid => {
        const tx = targetCX(cid), ty = nodeTop(cid);
        edges.push({ d: `M ${tx} ${busY} L ${tx} ${ty}`, type: "parent", key: `drop-${a.id}-${b.id}-${cid}` });
      });
    }
  });

  // Solo parents → children
  Object.entries(childMap).forEach(([pidStr, cids]) => {
    const pid = +pidStr; if (pairedIds.has(pid)) return;
    const originX = cx(pid), originY = nodeBot(pid);
    cids.forEach(cid => {
      if (drawnChildren.has(cid)) return; drawnChildren.add(cid);
      const tx = targetCX(cid), ty = nodeTop(cid), midY = (originY + ty) / 2;
      edges.push({ d: `M ${originX} ${originY} L ${originX} ${midY} L ${tx} ${midY} L ${tx} ${ty}`, type: "parent", key: `solo-${pid}-${cid}` });
    });
  });

  // Sibling arcs (deduplicated)
  const drawnSibs = new Set();
  siblingEdges.forEach(e => {
    const key = [e.from_id, e.to_id].sort().join("-");
    if (drawnSibs.has(key)) return; drawnSibs.add(key);
    const ax = cx(e.from_id), ay = nodeTop(e.from_id) + NODE_H / 2, bx = cx(e.to_id);
    edges.push({ d: `M ${ax} ${ay} C ${ax} ${ay + 40} ${bx} ${ay + 40} ${bx} ${ay}`, type: "sibling", key: `sib-${key}` });
  });

  // Spouse connector lines with ♥ (SVG)
  spousePairs.forEach(([a, b]) => {
    const posA = posMap[a.id]; if (!posA) return;
    const lineY  = posA.y + NODE_H / 2;
    const leftX  = posA.pairLeftX + PAIR_W * 0.25;
    const rightX = posA.pairLeftX + PAIR_W * 0.75;
    edges.push({ d: `M ${leftX} ${lineY} L ${rightX} ${lineY}`, type: "spouse", key: `spouse-${a.id}-${b.id}` });
  });

  return { posMap, spousePairs, pairedIds, edges, CANVAS_W, canvasH: gens.length * ROW_H + 60, units, gens };
}

/* ─── Confirm modal ───────────────────────────────────────────────────────── */
function ConfirmModal({title,body,onConfirm,onClose}){
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{maxWidth:380}}>
        <div style={{padding:"24px 24px 0"}}><h3 style={{fontSize:19,marginBottom:10}}>{title}</h3><p style={{fontSize:14,color:"var(--fog)",lineHeight:1.6}}>{body}</p></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",padding:"20px 24px 24px"}}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={()=>{onConfirm();onClose();}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Create Tree Modal ───────────────────────────────────────────────────── */
function CreateTreeModal({onCreated,onClose}){
  const [name,setName]=useState(""), [desc,setDesc]=useState(""), [saving,setSaving]=useState(false);
  const go=async()=>{ if(!name.trim()) return; setSaving(true); try{ const t=await api("/trees",{method:"POST",body:{name:name.trim(),description:desc.trim()}}); onCreated(t); onClose(); }catch(e){alert(e.message);}finally{setSaving(false);} };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{maxWidth:440}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 0"}}>
          <h3 style={{fontSize:20}}>Create Family Tree</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--fog)"}}><Icon name="x" size={20}/></button>
        </div>
        <div style={{padding:"20px 24px 24px",display:"flex",flexDirection:"column",gap:14}}>
          <div><label>Tree name *</label><input className="input" placeholder="e.g. The Ashford Family" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div><label>Description <span style={{fontWeight:400,color:"var(--fog)"}}>(optional)</span></label>
            <textarea className="input" rows={2} placeholder="What is this tree about?" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={go} disabled={!name.trim()||saving}><Icon name="plus" size={14}/>{saving?"Creating…":"Create tree"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Add / Edit Member Modal ─────────────────────────────────────────────── */
function MemberModal({mode="add",member,treeId,members,relationships,onSave,onClose}){
  const blank={name:"",born:"",died:"",gender:"male",relation:"",location:"",bio:"",generation:"0",
    relatedToId:"",relationshipType:"child",motherId:"",totalGenerations:"3"};
  const [form,setForm]=useState(member?{
    name:member.name,born:String(member.born),died:member.died?String(member.died):"",
    gender:member.gender||"male",relation:member.relation,location:member.location||"",
    bio:member.bio||"",generation:String(member.generation??0),
    relatedToId:"",relationshipType:"child",motherId:"",totalGenerations:"3"
  }:blank);
  const [step,setStep]=useState(1);
  const [saving,setSaving]=useState(false);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const avatarL=form.name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("")||"?";
  const canProceed=form.name.trim()&&form.born.trim()&&form.relation.trim();

  // When relationship type changes, auto-set generation relative to related member
  const relatedMember = members.find(m=>m.id===parseInt(form.relatedToId));
  const autoGen = ()=>{
    if(!relatedMember) return;
    let g = relatedMember.generation??0;
    if(form.relationshipType==="child") g = g+1;
    else if(form.relationshipType==="parent") g = g-1;
    else g = g; // spouse/sibling same gen
    f("generation",String(Math.max(0,g)));
  };
  useEffect(autoGen,[form.relatedToId,form.relationshipType]);

  const handleSave=async()=>{
    setSaving(true);
    try{
      const payload={
        name:form.name.trim(), born:parseInt(form.born)||0,
        died:form.died.trim()?parseInt(form.died):null,
        gender:form.gender, relation:form.relation.trim(),
        location:form.location.trim(), bio:form.bio.trim(),
        avatar:avatarL, generation:parseInt(form.generation)||0,
        color:member?.color||memberColor(members.length),
      };
      let saved;
      if(mode==="edit"&&member){
        saved=await api(`/trees/${treeId}/members/${member.id}`,{method:"PUT",body:payload});
      } else {
        saved=await api(`/trees/${treeId}/members`,{method:"POST",body:payload});
        // link relationship
        if(form.relatedToId){
          const rid=parseInt(form.relatedToId);
          if(form.relationshipType==="child"){
            // selected person is father, also connect mother if chosen
            await api(`/trees/${treeId}/relationships`,{method:"POST",body:{from_id:rid,to_id:saved.id,rel_type:"parent",label:"Parent"}}).catch(()=>{});
            if(form.motherId){
              await api(`/trees/${treeId}/relationships`,{method:"POST",body:{from_id:parseInt(form.motherId),to_id:saved.id,rel_type:"parent",label:"Parent"}}).catch(()=>{});
            }
          } else if(form.relationshipType==="parent"){
            await api(`/trees/${treeId}/relationships`,{method:"POST",body:{from_id:saved.id,to_id:rid,rel_type:"parent",label:"Parent"}}).catch(()=>{});
          } else if(form.relationshipType==="spouse"){
            await api(`/trees/${treeId}/relationships`,{method:"POST",body:{from_id:saved.id,to_id:rid,rel_type:"spouse",label:"Spouse"}}).catch(()=>{});
            // inherit same parents as the related member
            const relParents=relationships.filter(r=>r.rel_type==="parent"&&r.to_id===rid);
            for(const rp of relParents){
              await api(`/trees/${treeId}/relationships`,{method:"POST",body:{from_id:rp.from_id,to_id:saved.id,rel_type:"parent",label:"Parent"}}).catch(()=>{});
            }
          } else if(form.relationshipType==="sibling"){
            await api(`/trees/${treeId}/relationships`,{method:"POST",body:{from_id:saved.id,to_id:rid,rel_type:"sibling",label:"Sibling"}}).catch(()=>{});
            // inherit same parents
            const relParents=relationships.filter(r=>r.rel_type==="parent"&&r.to_id===rid);
            for(const rp of relParents){
              await api(`/trees/${treeId}/relationships`,{method:"POST",body:{from_id:rp.from_id,to_id:saved.id,rel_type:"parent",label:"Parent"}}).catch(()=>{});
            }
          }
        }
      }
      onSave(saved); onClose();
    }catch(e){ alert(e.message); }finally{ setSaving(false); }
  };

  const genOptions = Array.from({length:parseInt(form.totalGenerations)||3},(_,i)=>i);

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        {/* header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 0"}}>
          <div>
            <h3 style={{fontSize:20}}>{mode==="edit"?"Edit Member":"Add Family Member"}</h3>
            {mode==="add"&&<p style={{fontSize:12,color:"var(--fog)",marginTop:3}}>Step {step} of 2 — {step===1?"Basic info":"Connection"}</p>}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--fog)",padding:4}}><Icon name="x" size={20}/></button>
        </div>
        {mode==="add"&&(
          <div style={{display:"flex",gap:6,padding:"12px 24px 0"}}>
            {[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?"var(--forest)":"var(--warm)",transition:"background .3s"}}/>)}
          </div>
        )}

        {/* Step 1 — basic info */}
        {(step===1||mode==="edit")&&(
          <div style={{padding:"18px 24px 24px"}}>
            {/* live preview */}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,padding:"12px 14px",background:"var(--warm)",borderRadius:10}}>
              <div className="avatar" style={{background:"var(--forest)",color:"#fff",width:46,height:46,fontSize:16,flexShrink:0}}>{avatarL}</div>
              <div>
                <div style={{fontSize:15,fontWeight:600}}>{form.name||<span style={{color:"var(--fog)"}}>Full name…</span>}</div>
                <div style={{fontSize:12,color:"var(--fog)",marginTop:2}}>{form.relation||"Relation…"}{form.born?` · b. ${form.born}`:""}</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{gridColumn:"1/-1"}}><label>Full name *</label><input className="input" placeholder="e.g. Mary Ashford" value={form.name} onChange={e=>f("name",e.target.value)}/></div>
              <div><label>Relation / role *</label><input className="input" placeholder="e.g. Grandmother…" value={form.relation} onChange={e=>f("relation",e.target.value)}/></div>
              <div><label>Gender</label>
                <select className="input" value={form.gender} onChange={e=>f("gender",e.target.value)} style={{cursor:"pointer"}}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div><label>Birth year *</label><input className="input" type="number" placeholder="e.g. 1985" value={form.born} onChange={e=>f("born",e.target.value)}/></div>
              <div><label>Death year <span style={{fontWeight:400,color:"var(--fog)"}}>(if applicable)</span></label><input className="input" type="number" placeholder="—" value={form.died} onChange={e=>f("died",e.target.value)}/></div>
              <div><label>Generation <span style={{fontWeight:400,color:"var(--fog)"}}>(0 = oldest)</span></label>
                <input className="input" type="number" min="0" placeholder="0" value={form.generation} onChange={e=>f("generation",e.target.value)}/>
              </div>
              <div><label>Location</label><input className="input" placeholder="City, Country" value={form.location} onChange={e=>f("location",e.target.value)}/></div>
              <div style={{gridColumn:"1/-1"}}><label>Biography <span style={{fontWeight:400,color:"var(--fog)"}}>(optional)</span></label>
                <textarea className="input" rows={2} placeholder="A short biography…" value={form.bio} onChange={e=>f("bio",e.target.value)}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16}}>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
              {mode==="edit"
                ? <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!canProceed||saving}><Icon name="save" size={14}/>{saving?"Saving…":"Save changes"}</button>
                : <button className="btn btn-primary btn-sm" onClick={()=>setStep(2)} disabled={!canProceed}>Next: Connection →</button>}
            </div>
          </div>
        )}

        {/* Step 2 — connection */}
        {step===2&&mode==="add"&&(
          <div style={{padding:"18px 24px 24px"}}>
            <p style={{fontSize:13,color:"var(--fog)",marginBottom:16,lineHeight:1.6}}>
              Link <strong>{form.name}</strong> to an existing member and define how many generations your tree has.
            </p>

            {/* total generations picker */}
            <div style={{marginBottom:16}}>
              <label>Total generations in this tree</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
                {[2,3,4,5,6,7].map(n=>(
                  <button key={n} onClick={()=>f("totalGenerations",String(n))}
                    style={{padding:"6px 16px",borderRadius:8,border:`2px solid ${form.totalGenerations===String(n)?"var(--forest)":"var(--warm)"}`,
                      background:form.totalGenerations===String(n)?"var(--forest)":"transparent",
                      color:form.totalGenerations===String(n)?"#fff":"var(--ink)",cursor:"pointer",fontSize:13,fontWeight:500,transition:"all .18s"}}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <label>Related to <span style={{fontWeight:400,color:"var(--fog)"}}>(optional)</span></label>
              <select className="input" value={form.relatedToId} onChange={e=>f("relatedToId",e.target.value)} style={{cursor:"pointer"}}>
                <option value="">— No connection yet —</option>
                {members.map(m=><option key={m.id} value={m.id}>{m.name} ({m.relation})</option>)}
              </select>
            </div>

            {form.relatedToId&&(
              <>
                <div style={{marginBottom:14}}>
                  <label>Relationship type</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}>
                    {[
                      {val:"child",  icon:"↓",label:"Child of",   desc:"This person is a child of the selected member"},
                      {val:"parent", icon:"↑",label:"Parent of",  desc:"This person is a parent of the selected member"},
                      {val:"spouse", icon:"♥",label:"Spouse of",  desc:"Married — will share same parents"},
                      {val:"sibling",icon:"↔",label:"Sibling of", desc:"Will inherit same parents automatically"},
                    ].map(opt=>(
                      <div key={opt.val} onClick={()=>f("relationshipType",opt.val)}
                        style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",border:`2px solid ${form.relationshipType===opt.val?"var(--forest)":"var(--warm)"}`,
                          background:form.relationshipType===opt.val?"rgba(45,74,62,.06)":"transparent",transition:"all .18s"}}>
                        <div style={{fontSize:16,marginBottom:3}}>{opt.icon}</div>
                        <div style={{fontSize:13,fontWeight:600}}>{opt.label}</div>
                        <div style={{fontSize:11,color:"var(--fog)",marginTop:2,lineHeight:1.4}}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* If child — also pick mother */}
                {form.relationshipType==="child"&&(
                  <div style={{marginBottom:14,padding:"12px 14px",background:"rgba(201,151,58,.07)",borderRadius:10,border:"1px solid rgba(201,151,58,.3)"}}>
                    <label style={{color:"var(--bark)"}}>Also select the mother <span style={{fontWeight:400}}>(optional)</span></label>
                    <select className="input" value={form.motherId} onChange={e=>f("motherId",e.target.value)} style={{cursor:"pointer",marginTop:6}}>
                      <option value="">— Select mother —</option>
                      {members.filter(m=>m.id!==parseInt(form.relatedToId)).map(m=><option key={m.id} value={m.id}>{m.name} ({m.relation})</option>)}
                    </select>
                  </div>
                )}
              </>
            )}

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn btn-secondary btn-sm" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn btn-gold btn-sm" onClick={handleSave} disabled={saving}>
                <Icon name="plus" size={14}/>{saving?"Adding…":"Add to tree"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
const NAV=[
  {path:"/dashboard",label:"Dashboard",    icon:"home"},
  {path:"/tree",      label:"Family Tree",  icon:"tree"},
  {path:"/families",  label:"Manage Trees", icon:"users"},
  {path:"/member",    label:"My Profile",   icon:"user"},
  {path:"/activity",  label:"Activity",     icon:"activity"},
  {path:"/export",    label:"Export",       icon:"download"},
  {path:"/settings",  label:"Settings",     icon:"settings"},
  {path:"/author",    label:"About Author", icon:"pen"},
];

function Sidebar({current,navigate,collapsed,setCollapsed,user}){
  return(
    <aside style={{width:collapsed?68:232,flexShrink:0,background:"var(--paper)",borderRight:"1px solid var(--warm)",
      display:"flex",flexDirection:"column",transition:"width .25s",overflow:"hidden",zIndex:10}}>
      <div style={{padding:"22px 18px 18px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:8,background:"var(--forest)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
          <Icon name="leaf" size={18}/>
        </div>
        {!collapsed&&<span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:17,color:"var(--forest)",whiteSpace:"nowrap"}}>Rootswood</span>}
      </div>
      <nav style={{flex:1,padding:"6px 10px",display:"flex",flexDirection:"column",gap:2}}>
        {NAV.map(r=>(
          <button key={r.path} className={`nav-pill${current===r.path?" active":""}`}
            onClick={()=>navigate(r.path)} title={collapsed?r.label:""}>
            <Icon name={r.icon} size={17}/>
            {!collapsed&&<span style={{flex:1}}>{r.label}</span>}
          </button>
        ))}
      </nav>
      <button onClick={()=>setCollapsed(!collapsed)}
        style={{margin:"10px",padding:"8px",border:"1px solid var(--warm)",borderRadius:8,background:"none",cursor:"pointer",color:"var(--fog)",display:"flex",justifyContent:"center"}}>
        <Icon name="chevron" size={16} style={{transform:collapsed?"rotate(0)":"rotate(180deg)",transition:"transform .25s"}}/>
      </button>
      <div style={{padding:"14px 14px 18px",borderTop:"1px solid var(--warm)",display:"flex",alignItems:"center",gap:10}}>
        <div className="avatar" style={{background:"var(--forest)",color:"#fff",width:34,height:34,fontSize:13}}>
          {user?.name?makeAvatar(user.name):"?"}
        </div>
        {!collapsed&&(
          <div style={{minWidth:0}}>
            <div style={{fontSize:13,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.name||"…"}</div>
            <div style={{fontSize:11,color:"var(--fog)"}}>{user?.email||""}</div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ─── Topbar ──────────────────────────────────────────────────────────────── */
function Topbar({title,canGoBack,goBack}){
  return(
    <header style={{height:60,borderBottom:"1px solid var(--warm)",display:"flex",alignItems:"center",
      justifyContent:"space-between",padding:"0 24px",background:"var(--paper)",flexShrink:0,gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
        {canGoBack&&(
          <button onClick={goBack}
            style={{width:34,height:34,borderRadius:8,border:"1.5px solid var(--warm)",background:"none",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",color:"var(--ink)",flexShrink:0,transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="var(--warm)"}
            onMouseLeave={e=>e.currentTarget.style.background="none"}>
            <Icon name="arrowLeft" size={16}/>
          </button>
        )}
        <h2 style={{fontSize:20,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</h2>
      </div>
    </header>
  );
}

/* ─── Welcome Banner ──────────────────────────────────────────────────────── */
function WelcomeBanner({user,navigate,onDismiss}){
  return(
    <div className="modal-overlay">
      <div className="modal-box" style={{maxWidth:480,textAlign:"center"}}>
        <div style={{padding:"40px 32px 36px"}}>
          <div style={{width:64,height:64,borderRadius:16,background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:"#fff"}}>
            <Icon name="leaf" size={28}/>
          </div>
          <h2 style={{fontSize:24,marginBottom:10}}>Hello, {user?.name?.split(" ")[0]||"there"}! 👋</h2>
          <p style={{fontSize:15,color:"var(--fog)",lineHeight:1.7,marginBottom:28}}>
            Welcome to Rootswood. Let's start preserving your family's story.
          </p>
          <div onClick={()=>{navigate("/families");onDismiss();}}
            style={{cursor:"pointer",border:"2px dashed var(--forest)",borderRadius:14,padding:"22px 24px",marginBottom:16,transition:"all .2s",background:"rgba(45,74,62,.03)"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(45,74,62,.08)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(45,74,62,.03)"}>
            <div style={{width:44,height:44,borderRadius:10,background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",margin:"0 auto 12px"}}><Icon name="plus" size={20}/></div>
            <div style={{fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:6}}>Create your first family tree</div>
            <div style={{fontSize:13,color:"var(--fog)"}}>Go to Manage Trees to get started.</div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={onDismiss}>I'll do this later</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────────────────────────── */
function Dashboard({navigate,user,trees,onCreateTree}){
  const totalMembers=trees.reduce((s,t)=>s+(t.member_count||0),0);
  const primaryTree=trees[0];
  const recentMembers=useState([]); // will be loaded from first tree

  return(
    <div className="page" style={{padding:28,overflowY:"auto",height:"100%"}}>
      {/* Welcome banner */}
      <div style={{background:"var(--forest)",borderRadius:14,padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14,marginBottom:24}}>
        <div style={{color:"#fff"}}>
          <div style={{fontSize:13,opacity:.7,marginBottom:4}}>{new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening"},</div>
          <h2 style={{color:"#fff",fontSize:24}}>{user?.name||"…"}</h2>
          <p style={{opacity:.65,fontSize:14,marginTop:4}}>
            {trees.length>0?`You have ${trees.length} tree${trees.length>1?"s":""} with ${totalMembers} member${totalMembers!==1?"s":""}.`:"Start by creating your first family tree."}
          </p>
        </div>
        {trees.length>0
          ?<button className="btn btn-gold" onClick={()=>navigate("/tree")}><Icon name="tree" size={16}/> View your tree</button>
          :<button className="btn btn-gold" onClick={onCreateTree}><Icon name="plus" size={16}/> Create tree</button>}
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {[
          {label:"Total Members",value:totalMembers,    icon:"users",  color:"var(--forest)"},
          {label:"Generations",  value:trees.length?primaryTree?.member_count>0?"–":"0":"0",icon:"activity",color:"var(--bark)"},
          {label:"Family Trees", value:trees.length,    icon:"tree",   color:"var(--moss)"},
          {label:"Photos",       value:0,               icon:"camera", color:"var(--gold)"},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{color:s.color}}><Icon name={s.icon} size={20}/></div>
            <div style={{fontSize:28,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{s.value}</div>
            <div style={{fontSize:12,color:"var(--fog)"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:20}}>
        {/* Recent members */}
        <div className="card" style={{padding:22}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <h3 style={{fontSize:16}}>Recent Members</h3>
            <button className="btn btn-secondary btn-sm" onClick={()=>navigate("/families")}>See all</button>
          </div>
          {trees.length===0?(
            <div className="empty" style={{padding:"30px 0"}}>
              <Icon name="users" size={36} style={{color:"var(--warm)"}}/>
              <div style={{fontSize:14}}>No members yet. Create a tree first.</div>
            </div>
          ):(
            <RecentMembersInline treeId={primaryTree?.id} navigate={navigate}/>
          )}
        </div>

        {/* Right col */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Tree Visualizer card */}
          <div className="card" style={{padding:22}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
              <div style={{width:38,height:38,borderRadius:9,background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><Icon name="tree" size={18}/></div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"var(--forest)",fontFamily:"'Playfair Display',serif"}}>Family Tree Visualizer</div>
                <div style={{fontSize:12,color:"var(--fog)",marginTop:2}}>{primaryTree?.name||"No tree yet"}</div>
              </div>
            </div>
            {primaryTree&&(
              <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:"var(--forest)",color:"#fff",fontSize:12,fontWeight:500}}>
                  <Icon name="users" size={12}/>{primaryTree.member_count||0} members
                </span>
              </div>
            )}
            <button className="btn btn-primary btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>navigate("/tree")}>
              Open visualizer →
            </button>
          </div>

          {/* Quick actions */}
          <div className="card" style={{padding:20}}>
            <h3 style={{fontSize:15,marginBottom:14}}>Quick Actions</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"Add new member",  icon:"plus",     action:()=>navigate("/tree")},
                {label:"Export GEDCOM",   icon:"download", action:()=>navigate("/export")},
                {label:"View activity",   icon:"activity", action:()=>navigate("/activity")},
              ].map(a=>(
                <button key={a.label} className="nav-pill" onClick={a.action}><Icon name={a.icon} size={16}/>{a.label}</button>
              ))}
            </div>
          </div>

          {/* Notifications preview */}
          <div className="card" style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{fontSize:15}}>Notifications</h3>
              <span className="badge">0</span>
            </div>
            <div style={{fontSize:13,color:"var(--fog)",textAlign:"center",padding:"12px 0"}}>No new notifications.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* inline loader for recent members on dashboard */
function RecentMembersInline({treeId,navigate}){
  const [members,setMembers]=useState([]);
  useEffect(()=>{ if(treeId) api(`/trees/${treeId}/members`).then(d=>setMembers(d||[])).catch(()=>{}); },[treeId]);
  if(!members.length) return <div style={{fontSize:13,color:"var(--fog)",padding:"12px 0"}}>No members yet.</div>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {members.slice(0,5).map(m=>(
        <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",padding:"8px 10px",borderRadius:8,transition:"background .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="var(--warm)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div className="avatar" style={{background:m.color+"22",color:m.color,width:38,height:38,fontSize:13}}>{m.avatar}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:500}}>{m.name}</div>
            <div style={{fontSize:12,color:"var(--fog)"}}>{m.relation} · b. {m.born}</div>
          </div>
          <Icon name="chevron" size={15} style={{color:"var(--fog)"}}/>
        </div>
      ))}
    </div>
  );
}

/* ─── Tree Visualizer ─────────────────────────────────────────────────────── */
function TreeView({treeId,navigate,showToast}){
  const [members,setMembers]=useState([]);
  const [relationships,setRelationships]=useState([]);
  const [tree,setTree]=useState(null);
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(true);
  const [addModal,setAddModal]=useState(false);
  const [editModal,setEditModal]=useState(null);
  const [confirmDel,setConfirmDel]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const scrollRef = useRef(null);

  // Auto-centre the canvas horizontally whenever layout changes
  useEffect(()=>{
    if(!scrollRef.current||!members.length) return;
    const el = scrollRef.current;
    const centre = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollLeft = centre;
  },[members.length, treeId]);

  const load=useCallback(async()=>{
    if(!treeId) return;
    setLoading(true);
    try{
      const [t,mems,rels]=await Promise.all([api(`/trees/${treeId}`),api(`/trees/${treeId}/members`),api(`/trees/${treeId}/relationships`)]);
      setTree(t); setMembers(mems||[]); setRelationships(rels||[]);
      if(mems?.length) setSelected(mems[0].id);
    }catch(e){ showToast(e.message,"error"); }finally{ setLoading(false); }
  },[treeId]);

  useEffect(()=>{load();},[load]);

  const selMem=members.find(m=>m.id===selected);
  const layout=members.length?layoutTree(members,relationships):null;

  const handleDeleteMember=async()=>{
    try{ await api(`/trees/${treeId}/members/${selected}`,{method:"DELETE"}); showToast("Member removed"); load(); }
    catch(e){ showToast(e.message,"error"); }
  };

  if(!treeId) return(
    <div className="empty page" style={{flex:1,height:"100%"}}>
      <Icon name="tree" size={48} style={{color:"var(--warm)"}}/>
      <h3>No tree selected</h3>
      <p style={{color:"var(--fog)"}}>Open a tree from Manage Trees.</p>
      <button className="btn btn-primary btn-sm" onClick={()=>navigate("/families")}>Manage Trees</button>
    </div>
  );
  if(loading) return <Spinner/>;

  return(
    <div className="page" style={{display:"flex",height:"100%",overflow:"hidden"}}>
      {addModal&&<MemberModal mode="add" treeId={treeId} members={members} relationships={relationships} onSave={load} onClose={()=>setAddModal(false)}/>}
      {editModal&&<MemberModal mode="edit" member={editModal} treeId={treeId} members={members} relationships={relationships} onSave={load} onClose={()=>setEditModal(null)}/>}
      {confirmDel&&<ConfirmModal title="Remove member?" body={`Remove "${selMem?.name}"? This cannot be undone.`} onConfirm={handleDeleteMember} onClose={()=>setConfirmDel(false)}/>}

      {/* canvas */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* toolbar */}
        <div style={{padding:"10px 16px",display:"flex",alignItems:"center",gap:12,background:"var(--paper)",borderBottom:"1px solid var(--warm)",flexShrink:0}}>
          <div style={{fontWeight:600,fontSize:15,color:"var(--forest)",flex:1}}>{tree?.name||"Family Tree"}</div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            {[{color:"#2D4A3E",dash:"none",lbl:"Parent/Child"},{color:"#8B6F47",dash:"4 3",lbl:"Sibling"}].map(l=>(
              <div key={l.lbl} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"var(--fog)"}}>
                <svg width={22} height={8}><line x1={0} y1={4} x2={22} y2={4} stroke={l.color} strokeWidth={2} strokeDasharray={l.dash}/></svg>
                {l.lbl}
              </div>
            ))}
            <span style={{fontSize:12,color:"var(--fog)",display:"flex",alignItems:"center",gap:4}}>
              <span style={{color:"var(--gold)",fontSize:14}}>♥</span> Spouse (joined card)
            </span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>setAddModal(true)}><Icon name="plus" size={14}/> Add Member</button>
        </div>

        {/* canvas scroll */}
        <div ref={scrollRef} style={{flex:1,overflow:"auto",position:"relative",background:"var(--cream)"}}>
          {members.length===0?(
            <div className="empty" style={{minHeight:400}}>
              <Icon name="users" size={48} style={{color:"var(--warm)"}}/>
              <h3>No members yet</h3>
              <p style={{color:"var(--fog)"}}>Add your first family member to start building the tree.</p>
              <button className="btn btn-primary" onClick={()=>setAddModal(true)}><Icon name="plus" size={16}/> Add first member</button>
            </div>
          ):layout&&(
            <div style={{padding:"24px 60px 40px 60px",display:"inline-block",minWidth:"100%",boxSizing:"border-box"}}>
            <div style={{position:"relative",width:layout.CANVAS_W,height:layout.canvasH}}>
              {/* SVG edges */}
              <svg style={{position:"absolute",top:0,left:0,overflow:"visible",pointerEvents:"none"}} width={layout.CANVAS_W} height={layout.canvasH}>
                <defs>
                  <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3z" fill="#2D4A3E" opacity="0.55"/>
                  </marker>
                </defs>
                {layout.edges.map(e => {
                  if (e.type === "spouse") {
                    // Gold horizontal line between the two spouse halves
                    // Extract midpoint for the ♥ symbol
                    const parts = e.d.match(/[\d.]+/g);
                    const mx = parts ? (parseFloat(parts[0]) + parseFloat(parts[2])) / 2 : 0;
                    const my = parts ? parseFloat(parts[1]) : 0;
                    return (
                      <g key={e.key}>
                        <path d={e.d} fill="none"
                          stroke="#C9973A" strokeWidth={1.5}
                          strokeDasharray="5 3" opacity={0.8}/>
                        <text x={mx} y={my + 4.5} textAnchor="middle"
                          fontSize="9" fill="#C9973A" fontFamily="sans-serif"
                          style={{userSelect:"none"}}>♥</text>
                      </g>
                    );
                  }
                  if (e.type === "sibling") {
                    return (
                      <path key={e.key} d={e.d} fill="none"
                        stroke="#8B6F47" strokeWidth={1.8}
                        strokeDasharray="4 3" opacity={0.65}/>
                    );
                  }
                  // parent / default
                  return (
                    <path key={e.key} d={e.d} fill="none"
                      stroke="#2D4A3E" strokeWidth={1.8}
                      opacity={0.65} markerEnd="url(#arr)"/>
                  );
                })}
              </svg>
              {/* Spouse pairs */}
              {layout.spousePairs.map(([a,b])=>{
                const posA=layout.posMap[a.id]; if(!posA) return null;
                const isSel=selected===a.id||selected===b.id;
                return(
                  <div key={`${a.id}-${b.id}`} className="spouse-pair"
                    style={{left:posA.x,top:posA.y,width:PAIR_W,borderColor:isSel?"var(--gold)":"var(--warm)",boxShadow:isSel?"0 0 0 3px rgba(201,151,58,.22)":undefined}}>
                    {[a,b].map((m,idx)=>(
                      <>
                        {idx===1&&<div key="div" className="spouse-divider"/>}
                        <button key={m.id} className={`spouse-half${selected===m.id?" selected":""}`} onClick={()=>setSelected(m.id)} style={{width:PAIR_W/2}}>
                          <div className="avatar" style={{margin:"0 auto 5px",background:m.color+"22",color:m.color,width:32,height:32,fontSize:11}}>{m.avatar}</div>
                          <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                          <div style={{fontSize:10,color:"var(--fog)"}}>b. {m.born}</div>
                          <span style={{display:"inline-block",marginTop:2,fontSize:9,background:"var(--warm)",color:"var(--forest)",padding:"1px 5px",borderRadius:4,fontWeight:600}}>{m.relation}</span>
                        </button>
                      </>
                    ))}
                  </div>
                );
              })}
              {/* Solo nodes */}
              {members.filter(m=>!layout.pairedIds.has(m.id)).map(m=>{
                const pos=layout.posMap[m.id]; if(!pos) return null;
                return(
                  <div key={m.id} className={`tree-node${selected===m.id?" selected":""}`} style={{left:pos.x,top:pos.y,width:NODE_W}} onClick={()=>setSelected(m.id)}>
                    <div className="avatar" style={{margin:"0 auto 5px",background:m.color+"22",color:m.color,width:32,height:32,fontSize:11}}>{m.avatar}</div>
                    <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                    <div style={{fontSize:10,color:"var(--fog)"}}>b. {m.born}</div>
                    <span style={{display:"inline-block",marginTop:2,fontSize:9,background:"var(--warm)",color:"var(--forest)",padding:"1px 5px",borderRadius:4,fontWeight:600}}>{m.relation}</span>
                  </div>
                );
              })}
            </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Collapsible side panel ── */}
      <div style={{
        width: sidebarOpen ? 260 : 44,
        minWidth: sidebarOpen ? 260 : 44,
        background:"var(--paper)",
        borderLeft:"1px solid var(--warm)",
        flexShrink:0,
        display:"flex",
        flexDirection:"column",
        transition:"width .3s cubic-bezier(.4,0,.2,1), min-width .3s cubic-bezier(.4,0,.2,1)",
        overflow:"hidden",
        position:"relative",
      }}>
        {/* Toggle button */}
        <button
          onClick={()=>setSidebarOpen(o=>!o)}
          title={sidebarOpen?"Collapse panel":"Expand panel"}
          style={{
            position:"absolute",top:12,left:sidebarOpen?12:6,
            width:28,height:28,borderRadius:"50%",
            border:"1.5px solid var(--warm)",
            background:"var(--paper)",
            color:"var(--forest)",
            cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            zIndex:10,
            boxShadow:"0 2px 8px var(--shadow)",
            transition:"left .3s cubic-bezier(.4,0,.2,1)",
            flexShrink:0,
          }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            {sidebarOpen
              ? <polyline points="15 18 9 12 15 6"/>
              : <polyline points="9 18 15 12 9 6"/>
            }
          </svg>
        </button>

        {/* Expanded content */}
        {sidebarOpen&&selMem&&(
          <div style={{paddingTop:52,padding:"52px 16px 16px",display:"flex",flexDirection:"column",gap:14,overflowY:"auto",height:"100%"}}>
            <div className="avatar" style={{margin:"0 auto",background:selMem.color+"22",color:selMem.color,width:56,height:56,fontSize:18}}>{selMem.avatar}</div>
            <div style={{textAlign:"center"}}>
              <h3 style={{fontSize:17}}>{selMem.name}</h3>
              <div style={{fontSize:12,color:"var(--fog)",marginTop:3}}>{selMem.relation}</div>
            </div>
            {selMem.bio&&<div style={{fontSize:13,color:"var(--fog)",lineHeight:1.65}}>{selMem.bio}</div>}
            <div style={{fontSize:13,display:"flex",flexDirection:"column",gap:5}}>
              {selMem.born&&<div><strong>Born:</strong> {selMem.born}</div>}
              {selMem.died&&<div><strong>Died:</strong> {selMem.died}</div>}
              {selMem.location&&<div><strong>Location:</strong> {selMem.location}</div>}
            </div>
            {(()=>{
              const rels=relationships.filter(r=>r.from_id===selMem.id||r.to_id===selMem.id);
              if(!rels.length) return null;
              return(
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--fog)",letterSpacing:".07em",marginBottom:8}}>CONNECTIONS</div>
                  {rels.map((r,i)=>{
                    const otherId=r.from_id===selMem.id?r.to_id:r.from_id;
                    const other=members.find(m=>m.id===otherId); if(!other) return null;
                    const lbl=r.from_id===selMem.id?r.label:(r.rel_type==="spouse"?"Spouse":r.rel_type==="sibling"?"Sibling":"Child");
                    const dotC=r.rel_type==="spouse"?"var(--gold)":r.rel_type==="sibling"?"var(--bark)":"var(--forest)";
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid var(--warm)",cursor:"pointer"}} onClick={()=>setSelected(otherId)}>
                        <div className="avatar" style={{background:other.color+"22",color:other.color,width:26,height:26,fontSize:10}}>{other.avatar}</div>
                        <div style={{flex:1,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{other.name.split(" ")[0]}</div>
                        <span style={{fontSize:10,background:dotC,color:"#fff",padding:"2px 6px",borderRadius:4,fontWeight:600,flexShrink:0}}>{lbl}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div style={{display:"flex",gap:8,marginTop:"auto"}}>
              <button className="btn btn-secondary btn-sm" style={{flex:1,justifyContent:"center"}} onClick={()=>setEditModal(selMem)}><Icon name="edit" size={13}/> Edit</button>
              <button className="btn btn-danger btn-sm" style={{justifyContent:"center"}} onClick={()=>setConfirmDel(true)}><Icon name="trash" size={13}/></button>
            </div>
          </div>
        )}

        {/* Collapsed — show avatar */}
        {!sidebarOpen&&selMem&&(
          <div style={{paddingTop:52,display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div className="avatar" title={selMem.name} style={{background:selMem.color+"22",color:selMem.color,width:28,height:28,fontSize:10,cursor:"pointer"}} onClick={()=>setSidebarOpen(true)}>{selMem.avatar}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Manage Trees ────────────────────────────────────────────────────────── */
function Families({navigate,trees,onRefresh,showToast,setActiveTreeId}){
  const [createModal,setCreateModal]=useState(false);
  const [editModal,setEditModal]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);
  const [editForm,setEditForm]=useState({name:"",description:""});

  const handleDelete=async(id)=>{ try{ await api(`/trees/${id}`,{method:"DELETE"}); showToast("Tree deleted"); onRefresh(); }catch(e){ showToast(e.message,"error"); } };
  const handleUpdate=async()=>{ try{ await api(`/trees/${editModal.id}`,{method:"PUT",body:editForm}); showToast("Tree updated"); setEditModal(null); onRefresh(); }catch(e){ showToast(e.message,"error"); } };

  return(
    <div className="page" style={{padding:28,overflowY:"auto",height:"100%"}}>
      {createModal&&<CreateTreeModal onCreated={t=>{showToast("Tree created!"); setActiveTreeId(t.id); onRefresh();}} onClose={()=>setCreateModal(false)}/>}
      {editModal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setEditModal(null)}>
          <div className="modal-box" style={{maxWidth:420}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px 0"}}>
              <h3 style={{fontSize:19}}>Edit Tree</h3>
              <button onClick={()=>setEditModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--fog)"}}><Icon name="x" size={20}/></button>
            </div>
            <div style={{padding:"18px 24px 24px",display:"flex",flexDirection:"column",gap:12}}>
              <div><label>Name</label><input className="input" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/></div>
              <div><label>Description</label><textarea className="input" rows={2} value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})}/></div>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>setEditModal(null)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleUpdate}><Icon name="save" size={13}/> Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {confirmDel&&<ConfirmModal title="Delete tree?" body={`Delete "${confirmDel.name}"? All members and relationships will be permanently removed.`} onConfirm={()=>handleDelete(confirmDel.id)} onClose={()=>setConfirmDel(null)}/>}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><h2 style={{fontSize:22}}>My Family Trees</h2><p style={{color:"var(--fog)",fontSize:14,marginTop:3}}>Manage and explore your lineages</p></div>
        <button className="btn btn-primary" onClick={()=>setCreateModal(true)}><Icon name="plus" size={16}/> New tree</button>
      </div>

      {trees.length===0?(
        <div className="card empty" style={{padding:60}}>
          <Icon name="tree" size={48} style={{color:"var(--warm)"}}/>
          <h3>No family trees yet</h3>
          <button className="btn btn-primary" onClick={()=>setCreateModal(true)}><Icon name="plus" size={16}/> Create your first tree</button>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
          {trees.map(t=>(
            <div key={t.id} className="card" style={{padding:22}}>
              <div style={{width:44,height:44,borderRadius:10,background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",marginBottom:14}}>
                <Icon name="tree" size={20}/>
              </div>
              <h3 style={{fontSize:17,marginBottom:6}}>{t.name}</h3>
              {t.description&&<p style={{fontSize:13,color:"var(--fog)",marginBottom:10,lineHeight:1.5}}>{t.description}</p>}
              {/* real member count */}
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,background:"rgba(45,74,62,0.1)",color:"var(--forest)",fontSize:12,fontWeight:500}}>
                  <Icon name="users" size={12}/>{t.member_count||0} members
                </span>
              </div>
              <div style={{fontSize:12,color:"var(--fog)",marginBottom:14}}>
                Updated {t.updated_at?new Date(t.updated_at).toLocaleDateString():"—"}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-primary btn-sm" onClick={()=>{setActiveTreeId(t.id);navigate("/tree",t.id);}}>
                  <Icon name="tree" size={13}/> Open
                </button>
                <button className="btn btn-secondary btn-sm" onClick={()=>{setEditModal(t);setEditForm({name:t.name,description:t.description||""});}}><Icon name="edit" size={13}/></button>
                <button className="btn btn-danger btn-sm" style={{marginLeft:"auto"}} onClick={()=>setConfirmDel(t)}><Icon name="trash" size={13}/></button>
              </div>
            </div>
          ))}
          {/* create card */}
          <div className="card" style={{padding:22,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,cursor:"pointer",border:"2px dashed var(--warm)",background:"transparent",minHeight:180}}
            onClick={()=>setCreateModal(true)}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--fog)"}}><Icon name="plus" size={20}/></div>
            <div style={{fontSize:14,color:"var(--fog)",textAlign:"center"}}>Create a new family tree</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Activity ────────────────────────────────────────────────────────────── */
function Activity({trees,activeTreeId}){
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const loadAll=async()=>{
      setLoading(true);
      try{
        const allEvents=[];
        // Load members from all trees and build activity timeline
        for(const t of trees){
          const mems=await api(`/trees/${t.id}/members`).catch(()=>[]);
          (mems||[]).forEach(m=>{
            allEvents.push({action:"Member added",detail:`${m.name} added to "${t.name}"`,icon:"user",treeName:t.name,time:m.id}); // id as proxy for time order
          });
          allEvents.push({action:"Tree created",detail:`"${t.name}" was created`,icon:"tree",treeName:t.name,time:t.id*-1});
        }
        // sort by time desc (id desc approximation)
        allEvents.sort((a,b)=>b.time-a.time);
        setEvents(allEvents.slice(0,20));
      }catch(e){ console.error(e); }
      finally{ setLoading(false); }
    };
    if(trees.length) loadAll(); else setLoading(false);
  },[trees]);

  if(loading) return <Spinner/>;

  return(
    <div className="page" style={{padding:28,overflowY:"auto",height:"100%"}}>
      <h2 style={{fontSize:22,marginBottom:6}}>Activity Log</h2>
      <p style={{color:"var(--fog)",fontSize:14,marginBottom:24}}>A live history of all changes across your trees.</p>
      <div className="card" style={{padding:"8px 22px"}}>
        {events.length===0?(
          <div className="empty" style={{padding:40}}>
            <Icon name="activity" size={36} style={{color:"var(--warm)"}}/>
            <div>No activity yet. Start adding members to your trees.</div>
          </div>
        ):events.map((a,i)=>(
          <div key={i} className="timeline-item" style={{paddingTop:18}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--forest)",flexShrink:0}}>
              <Icon name={a.icon} size={16}/>
            </div>
            <div style={{paddingTop:8,flex:1}}>
              <div style={{fontSize:14,fontWeight:500}}>{a.action}</div>
              <div style={{fontSize:13,color:"var(--fog)",marginTop:2}}>{a.detail}</div>
              <div style={{fontSize:11,background:"rgba(45,74,62,.08)",color:"var(--forest)",padding:"2px 8px",borderRadius:20,display:"inline-block",marginTop:5,fontWeight:500}}>{a.treeName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Export ──────────────────────────────────────────────────────────────── */
function Export({trees,showToast}){
  const [format,setFormat]=useState("gedcom");
  const [treeId,setTreeId]=useState(trees[0]?.id||"");
  const [dl,setDl]=useState(false);

  const handleExport=async()=>{
    if(!treeId){ showToast("Select a tree first","warning"); return; }
    setDl(true);
    try{
      const mems=await api(`/trees/${treeId}/members`);
      const rels=await api(`/trees/${treeId}/relationships`);
      const tree=trees.find(t=>t.id===parseInt(treeId));

      let content="", filename="", mime="text/plain";

      if(format==="json"){
        content=JSON.stringify({tree,members:mems,relationships:rels},null,2);
        filename=`${tree?.name||"family-tree"}.json`; mime="application/json";
      } else if(format==="gedcom"){
        let g="0 HEAD\n1 SOUR Rootswood\n1 GEDC\n2 VERS 5.5.1\n0 @SUBM@ SUBM\n1 NAME Rootswood User\n";
        (mems||[]).forEach(m=>{
          g+=`0 @I${m.id}@ INDI\n1 NAME ${m.name}\n1 SEX ${m.gender==="female"?"F":m.gender==="male"?"M":"U"}\n`;
          if(m.born) g+=`1 BIRT\n2 DATE ${m.born}\n`;
          if(m.died) g+=`1 DEAT\n2 DATE ${m.died}\n`;
        });
        g+="0 TRLR\n"; content=g; filename=`${tree?.name||"family-tree"}.ged`;
      } else {
        // CSV
        content="Name,Born,Died,Gender,Relation,Location\n"+(mems||[]).map(m=>`"${m.name}",${m.born||""},${m.died||""},${m.gender},"${m.relation}","${m.location}"`).join("\n");
        filename=`${tree?.name||"family-tree"}.csv`; mime="text/csv";
      }

      const blob=new Blob([content],{type:mime});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a"); a.href=url; a.download=filename; a.click();
      URL.revokeObjectURL(url);
      showToast("Export downloaded!");
    }catch(e){ showToast(e.message,"error"); }
    finally{ setTimeout(()=>setDl(false),1000); }
  };

  return(
    <div className="page" style={{padding:28,overflowY:"auto",maxWidth:600,margin:"0 auto"}}>
      <h2 style={{fontSize:22,marginBottom:6}}>Export Data</h2>
      <p style={{color:"var(--fog)",fontSize:14,marginBottom:24}}>Download your family tree in your preferred format.</p>
      <div className="card" style={{padding:26,marginBottom:18}}>
        <div style={{marginBottom:18}}>
          <label>Select tree</label>
          <select className="input" value={treeId} onChange={e=>setTreeId(e.target.value)} style={{cursor:"pointer"}}>
            <option value="">— Choose a tree —</option>
            {trees.map(t=><option key={t.id} value={t.id}>{t.name} ({t.member_count||0} members)</option>)}
          </select>
        </div>
        <div>
          <label>Export format</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:8}}>
            {[{val:"gedcom",label:"GEDCOM",desc:"Standard genealogy format (.ged)"},
              {val:"json",  label:"JSON",  desc:"Full data backup (.json)"},
              {val:"csv",   label:"CSV",   desc:"Spreadsheet compatible (.csv)"}].map(f=>(
              <div key={f.val} onClick={()=>setFormat(f.val)}
                style={{padding:"14px 12px",borderRadius:10,cursor:"pointer",border:`2px solid ${format===f.val?"var(--forest)":"var(--warm)"}`,
                  background:format===f.val?"rgba(45,74,62,.06)":"transparent",transition:"all .2s"}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{f.label}</div>
                <div style={{fontSize:11,color:"var(--fog)"}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card" style={{padding:18,marginBottom:18,background:"rgba(45,74,62,.04)"}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <Icon name="info" size={18} style={{color:"var(--forest)",flexShrink:0,marginTop:1}}/>
          <div style={{fontSize:13,lineHeight:1.6}}>
            {treeId
              ?<>Exporting <strong>{trees.find(t=>t.id===parseInt(treeId))?.name}</strong> as {format.toUpperCase()} — includes all members and relationships.</>
              :"Select a tree above to export."}
          </div>
        </div>
      </div>
      <button className="btn btn-primary" style={{padding:"13px 28px"}} onClick={handleExport} disabled={dl||!treeId}>
        <Icon name="download" size={16}/>{dl?"Preparing…":`Export as ${format.toUpperCase()}`}
      </button>
    </div>
  );
}

/* ─── My Profile ──────────────────────────────────────────────────────────── */
function MemberProfile({user}){
  return(
    <div className="page" style={{padding:28,overflowY:"auto",maxWidth:640,margin:"0 auto"}}>
      <div className="card" style={{padding:28}}>
        <div style={{display:"flex",gap:20,alignItems:"center",marginBottom:24}}>
          <div className="avatar" style={{background:"var(--forest)",color:"#fff",width:68,height:68,fontSize:24}}>{user?.name?makeAvatar(user.name):"?"}</div>
          <div><h2 style={{fontSize:22}}>{user?.name||"…"}</h2><div style={{color:"var(--fog)",fontSize:14,marginTop:4}}>{user?.email||""}</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["Name",user?.name],["Email",user?.email],["Member since",user?.created_at?new Date(user.created_at).getFullYear():"–"]].map(([k,v])=>(
            <div key={k} style={{background:"var(--warm)",padding:"12px 14px",borderRadius:8}}>
              <div style={{fontSize:11,color:"var(--fog)",marginBottom:3}}>{k}</div>
              <div style={{fontSize:14}}>{v||"–"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Settings ────────────────────────────────────────────────────────────── */
function Settings({user,onLogout,showToast}){
  const [name,setName]=useState(user?.name||"");
  const [password,setPassword]=useState("");
  const [saving,setSaving]=useState(false);

  const handleSave=async()=>{
    setSaving(true);
    try{
      const body={};
      if(name.trim()&&name!==user?.name) body.name=name.trim();
      if(password.trim()) body.password=password.trim();
      if(!Object.keys(body).length){ showToast("Nothing changed","warning"); return; }
      await api("/auth/me/update",{method:"PUT",body});
      showToast("Profile updated!"); setPassword("");
    }catch(e){ showToast(e.message,"error"); }finally{ setSaving(false); }
  };

  const Sec=({title,children})=>(
    <div className="card" style={{padding:24,marginBottom:18}}>
      <h3 style={{fontSize:16,marginBottom:18,paddingBottom:12,borderBottom:"1px solid var(--warm)"}}>{title}</h3>
      {children}
    </div>
  );

  return(
    <div className="page" style={{padding:28,overflowY:"auto",maxWidth:640,margin:"0 auto"}}>
      <h2 style={{fontSize:22,marginBottom:22}}>Settings</h2>
      <Sec title="Account">
        <div style={{marginBottom:14}}><label>Full name</label><input className="input" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div style={{marginBottom:14}}><label>Email address</label><input className="input" value={user?.email||""} disabled style={{opacity:.65}}/></div>
        <div style={{marginBottom:18}}><label>New password <span style={{fontWeight:400,color:"var(--fog)"}}>(leave blank to keep current)</span></label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/></div>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}><Icon name="save" size={13}/>{saving?"Saving…":"Save changes"}</button>
      </Sec>
      <Sec title="Session">
        <p style={{fontSize:14,color:"var(--fog)",marginBottom:16}}>Signed in as <strong>{user?.email}</strong></p>
        <button className="btn btn-danger btn-sm" onClick={onLogout}><Icon name="logout" size={14}/> Log out</button>
      </Sec>
      <Sec title="Danger Zone">
        <p style={{fontSize:13,color:"var(--fog)",marginBottom:14}}>Permanently delete your account and all data. This cannot be undone.</p>
        <button className="btn btn-danger btn-sm"><Icon name="trash" size={13}/> Delete account</button>
      </Sec>
    </div>
  );
}

/* ─── About the Author ────────────────────────────────────────────────────── */
function Author(){
  const [contact,setContact]=useState({name:"",email:"",subject:"",message:""});
  const [sent,setSent]=useState(false);
  const f=(k,v)=>setContact(p=>({...p,[k]:v}));

  const handleSend=()=>{
    if(!contact.name||!contact.email||!contact.message){ alert("Please fill in all required fields."); return; }
    // In a real app: POST to backend. For now simulate.
    setSent(true);
  };

  const skills=["React","SVG Visualisation","Genealogy Data Modelling","UI / UX Design","TypeScript","Node.js","Go (Golang)","PostgreSQL / SQLite"];
  const projects=[
    {name:"Rootswood",   desc:"Full-stack family tree platform with visual genealogy tools.",  tech:"React · Go · SQLite", icon:"tree"  },
    {name:"AncestorAI",  desc:"AI-powered record matching engine for genealogical research.",   tech:"Python · ML · FastAPI",icon:"search"},
    {name:"HeritageMaps",desc:"Interactive geographic visualiser for family migration patterns.",tech:"D3.js · GeoJSON",      icon:"globe" },
  ];

  return(
    <div className="page" style={{overflowY:"auto",height:"100%"}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,var(--forest) 0%,var(--moss) 100%)",padding:"52px 40px 60px",position:"relative",overflow:"hidden"}}>
        {[320,540].map((r,i)=><div key={i} style={{position:"absolute",width:r,height:r,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.07)",top:"50%",right:-r/3,transform:"translateY(-50%)",pointerEvents:"none"}}/>)}
        <div style={{display:"flex",alignItems:"center",gap:28,flexWrap:"wrap",position:"relative",zIndex:1}}>
          <div style={{width:100,height:100,borderRadius:"50%",background:"rgba(201,151,58,0.2)",border:"3px solid var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"var(--gold)",fontSize:36,fontFamily:"'Playfair Display',serif",fontWeight:700}}>AA</div>
          <div style={{color:"#fff"}}>
            <div style={{fontSize:11,letterSpacing:"0.14em",opacity:.55,marginBottom:8,textTransform:"uppercase"}}>Creator &amp; Lead Developer</div>
            <h1 style={{fontSize:"clamp(1.9rem,4vw,2.7rem)",color:"#fff",marginBottom:10}}>Ahsan Ahmed Sifat</h1>
            <p style={{fontSize:15,opacity:.68,maxWidth:460,lineHeight:1.7}}>Full-stack engineer passionate about making family history accessible through thoughtful design and powerful visualisation.</p>
            <div style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap"}}>
              {[{icon:"globe",label:"rootswood.io"},{icon:"mail",label:"ahsanahmedsifat@gmail.com"},{icon:"code",label:"@ahsansifat"}].map(l=>(
                <span key={l.label} style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.11)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:20,padding:"5px 13px",fontSize:13}}><Icon name={l.icon} size={13}/>{l.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"32px 40px",display:"flex",flexDirection:"column",gap:26,maxWidth:900,margin:"0 auto"}}>
        {/* About */}
        <div className="card" style={{padding:28}}>
          <h3 style={{fontSize:18,marginBottom:14}}>About Me</h3>
          <p style={{fontSize:14,lineHeight:1.9}}>I built Rootswood out of a personal obsession with tracing my own family's roots. After spending hours fighting clunky desktop genealogy software, I decided to build the tool I always wanted — fast, visual, and a pleasure to use.</p>
          <p style={{fontSize:14,lineHeight:1.9,marginTop:12}}>Genealogy is more than collecting names and dates; it's about preserving stories, understanding where we came from, and connecting generations. Rootswood is my attempt to make that experience beautiful and accessible for everyone.</p>
        </div>

        {/* Skills */}
        <div className="card" style={{padding:28}}>
          <h3 style={{fontSize:18,marginBottom:16}}>Skills &amp; Technologies</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {skills.map(sk=><span key={sk} className="pill">{sk}</span>)}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h3 style={{fontSize:18,marginBottom:16}}>Other Projects</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
            {projects.map(p=>(
              <div key={p.name} className="card" style={{padding:22}}>
                <div style={{width:40,height:40,borderRadius:9,background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--forest)",marginBottom:12}}><Icon name={p.icon} size={18}/></div>
                <div style={{fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:6}}>{p.name}</div>
                <div style={{fontSize:13,color:"var(--fog)",lineHeight:1.6,marginBottom:10}}>{p.desc}</div>
                <div style={{fontSize:11,color:"var(--bark)",fontWeight:600}}>{p.tech}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="card" style={{padding:28,borderLeft:"4px solid var(--gold)",background:"linear-gradient(135deg,rgba(45,74,62,.03),rgba(201,151,58,.05))"}}>
          <div style={{fontSize:32,color:"var(--gold)",lineHeight:1,marginBottom:8,fontFamily:"Georgia,serif"}}>"</div>
          <p style={{fontSize:15,lineHeight:1.85,fontStyle:"italic"}}>The best time to plant a tree was 20 years ago. The second best time is now. The best time to record your family's history is today — before another generation's stories are lost.</p>
          <div style={{marginTop:16,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Icon name="star" size={14}/></div>
            <div style={{fontSize:13,fontWeight:600}}>Ahsan Ahmed Sifat <span style={{color:"var(--fog)",fontWeight:400}}>— Founder, Rootswood</span></div>
          </div>
        </div>

        {/* ── Contact Form ── */}
        <div className="card" style={{padding:28}}>
          <h3 style={{fontSize:18,marginBottom:6}}>Get in Touch</h3>
          <p style={{fontSize:14,color:"var(--fog)",marginBottom:20,lineHeight:1.6}}>Have a question, suggestion, or just want to say hello? I'd love to hear from you.</p>

          {sent?(
            <div style={{textAlign:"center",padding:"32px 0"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(45,74,62,.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"var(--forest)"}}><Icon name="check" size={24}/></div>
              <h4 style={{fontSize:18,marginBottom:8}}>Message sent!</h4>
              <p style={{color:"var(--fog)",fontSize:14}}>Thanks for reaching out. I'll get back to you as soon as possible.</p>
              <button className="btn btn-secondary btn-sm" style={{marginTop:16}} onClick={()=>setSent(false)}>Send another message</button>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label>Your name *</label><input className="input" placeholder="John Smith" value={contact.name} onChange={e=>f("name",e.target.value)}/></div>
              <div><label>Email address *</label><input className="input" type="email" placeholder="you@example.com" value={contact.email} onChange={e=>f("email",e.target.value)}/></div>
              <div style={{gridColumn:"1/-1"}}><label>Subject</label><input className="input" placeholder="e.g. Feature request, Bug report…" value={contact.subject} onChange={e=>f("subject",e.target.value)}/></div>
              <div style={{gridColumn:"1/-1"}}><label>Message *</label><textarea className="input" rows={4} placeholder="Write your message here…" value={contact.message} onChange={e=>f("message",e.target.value)}/></div>
              <div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end"}}>
                <button className="btn btn-primary" onClick={handleSend}><Icon name="send" size={15}/> Send message</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Landing ─────────────────────────────────────────────────────────────── */
function Landing({navigate}){
  return(
    <div className="page" style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"linear-gradient(160deg,#2D4A3E 0%,#1A2E28 100%)",color:"#fff",overflow:"hidden"}}>
      <div style={{position:"relative",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 24px",textAlign:"center"}}>
        {[420,650,880].map((r,i)=><div key={i} style={{position:"absolute",width:r,height:r,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.06)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>)}
        <div style={{width:68,height:68,borderRadius:18,background:"rgba(201,151,58,.25)",border:"1.5px solid var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:26,color:"var(--gold)"}}><Icon name="leaf" size={30}/></div>
        <h1 style={{fontSize:"clamp(2.4rem,6vw,4.2rem)",lineHeight:1.1,fontWeight:700,marginBottom:18,maxWidth:640}}>Every family has<br/>a story worth preserving.</h1>
        <p style={{fontSize:17,color:"rgba(255,255,255,0.65)",maxWidth:500,lineHeight:1.7,marginBottom:40}}>Build, visualise, and share your family tree across generations.</p>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center"}}>
          <button className="btn btn-gold" style={{fontSize:15,padding:"13px 32px"}} onClick={()=>navigate("/register")}>Start for free</button>
          <button className="btn btn-secondary" style={{fontSize:15,padding:"13px 32px",borderColor:"rgba(255,255,255,0.35)",color:"#fff"}} onClick={()=>navigate("/login")}>Sign in</button>
        </div>
      </div>
      <div style={{background:"rgba(0,0,0,0.2)",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"center",flexWrap:"wrap"}}>
        {[{icon:"tree",label:"Visual tree builder"},{icon:"users",label:"Multi-tree management"},{icon:"link",label:"Relationship linking"},{icon:"download",label:"Export data"}].map(f=>(
          <div key={f.label} style={{padding:"22px 32px",display:"flex",alignItems:"center",gap:10,color:"rgba(255,255,255,0.7)",borderRight:"1px solid rgba(255,255,255,0.07)",fontSize:14}}>
            <Icon name={f.icon} size={18}/>{f.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Login ───────────────────────────────────────────────────────────────── */
function Login({navigate,onLogin}){
  const [form,setForm]=useState({email:"",password:""});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const go=async()=>{
    setLoading(true); setErr("");
    try{ const d=await api("/auth/login",{method:"POST",body:form}); setToken(d.token); onLogin(d.user); }
    catch(e){ setErr(e.message); }finally{ setLoading(false); }
  };

  return(
    <div className="auth-page">
      <div className="card" style={{width:"100%",maxWidth:400,padding:40}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:48,height:48,borderRadius:12,background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:"#fff"}}><Icon name="leaf" size={22}/></div>
          <h1 style={{fontSize:26}}>Welcome back</h1>
          <p style={{color:"var(--fog)",fontSize:14,marginTop:6}}>Sign in to your Rootswood account</p>
        </div>
        {err&&<div style={{background:"#FFF0EE",color:"var(--rust)",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14}}>{err}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label>Email</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div><label>Password</label><input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}} onClick={go} disabled={loading}>{loading?"Signing in…":"Sign in"}</button>
        </div>
        <p style={{textAlign:"center",fontSize:13,color:"var(--fog)",marginTop:20}}>No account? <button style={{background:"none",border:"none",color:"var(--forest)",cursor:"pointer",fontWeight:500}} onClick={()=>navigate("/register")}>Create one →</button></p>
        <button style={{background:"none",border:"none",color:"var(--fog)",cursor:"pointer",fontSize:12,marginTop:10,display:"block",marginLeft:"auto"}} onClick={()=>navigate("/")}>← Back to home</button>
      </div>
    </div>
  );
}

/* ─── Register ────────────────────────────────────────────────────────────── */
function Register({navigate,onLogin}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const go=async()=>{
    setLoading(true); setErr("");
    try{ const d=await api("/auth/register",{method:"POST",body:form}); setToken(d.token); onLogin(d.user,true); }
    catch(e){ setErr(e.message); }finally{ setLoading(false); }
  };

  return(
    <div className="auth-page">
      <div className="card" style={{width:"100%",maxWidth:440,padding:40}}>
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {[1,2].map(s=><div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?"var(--forest)":"var(--warm)",transition:"background .3s"}}/>)}
        </div>
        {err&&<div style={{background:"#FFF0EE",color:"var(--rust)",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14}}>{err}</div>}
        {step===1?(
          <>
            <h1 style={{fontSize:24,marginBottom:6}}>Create your account</h1>
            <p style={{color:"var(--fog)",fontSize:14,marginBottom:24}}>Start preserving your family's story today.</p>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label>Full name</label><input className="input" placeholder="e.g. James Clarke" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
              <div><label>Email address</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <button className="btn btn-primary" style={{justifyContent:"center",padding:"13px"}} onClick={()=>setStep(2)} disabled={!form.name.trim()||!form.email.trim()}>Continue →</button>
            </div>
          </>
        ):(
          <>
            <h1 style={{fontSize:24,marginBottom:6}}>Set your password</h1>
            <p style={{color:"var(--fog)",fontSize:14,marginBottom:24}}>Almost there, <strong>{form.name.split(" ")[0]}</strong>.</p>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label>Password</label><input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
              <button className="btn btn-primary" style={{justifyContent:"center",padding:"13px"}} onClick={go} disabled={form.password.length<6||loading}>
                {loading?"Creating account…":"Create account 🌳"}
              </button>
              <button style={{background:"none",border:"none",color:"var(--fog)",cursor:"pointer",fontSize:13}} onClick={()=>setStep(1)}>← Back</button>
            </div>
          </>
        )}
        <p style={{textAlign:"center",fontSize:13,color:"var(--fog)",marginTop:20}}>Already have an account? <button style={{background:"none",border:"none",color:"var(--forest)",cursor:"pointer",fontWeight:500}} onClick={()=>navigate("/login")}>Sign in</button></p>
        <button style={{background:"none",border:"none",color:"var(--fog)",cursor:"pointer",fontSize:12,marginTop:10,display:"block",marginLeft:"auto"}} onClick={()=>navigate("/")}>← Back to home</button>
      </div>
    </div>
  );
}

/* ─── App root ────────────────────────────────────────────────────────────── */
const PAGE_TITLES={
  "/dashboard":"Dashboard","/tree":"Family Tree Visualizer","/families":"Manage Trees",
  "/member":"My Profile","/activity":"Activity Log","/export":"Export Data",
  "/settings":"Settings","/author":"About the Author",
};

export default function App(){
  const [user,setUser]         = useState(null);
  const [authLoading,setAuthL] = useState(true);
  const [history,setHistory]   = useState(["/"]);
  const [collapsed,setCollapsed]= useState(false);
  const [trees,setTrees]       = useState([]);
  const [activeTreeId,setActiveTreeId] = useState(null);
  const [toast,setToast]       = useState(null);
  const [welcomeModal,setWelcomeModal] = useState(false);
  const [createTreeModal,setCreateTreeModal] = useState(false);

  const route    = history[history.length-1];
  const navigate = (path,treeId) => { setHistory(p=>[...p,path]); if(treeId) setActiveTreeId(treeId); };
  const goBack   = () => setHistory(p=>p.length>1?p.slice(0,-1):p);
  const canGoBack = history.length>1;

  const showToast=(msg,type="success")=>setToast({msg,type,id:Date.now()});

  // Auth check
  useEffect(()=>{
    if(!getToken()){ setAuthL(false); return; }
    api("/auth/me").then(u=>setUser(u)).catch(()=>clearToken()).finally(()=>setAuthL(false));
  },[]);

  // Load trees
  const loadTrees=useCallback(async()=>{
    if(!user) return;
    try{ const d=await api("/trees"); setTrees(d||[]); if(d?.length&&!activeTreeId) setActiveTreeId(d[0].id); }
    catch(e){ console.error(e); }
  },[user]);

  useEffect(()=>{ loadTrees(); },[loadTrees]);

  const handleLogin=(u,isNew=false)=>{ setUser(u); setHistory(["/dashboard"]); if(isNew) setWelcomeModal(true); };
  const handleLogout=()=>{ clearToken(); setUser(null); setTrees([]); setActiveTreeId(null); setHistory(["/"]); };

  if(authLoading) return(
    <><GlobalStyle/><div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div className="spinner"/></div></>
  );

  // Public pages — no sidebar/topbar
  if(!user){
    if(route==="/register") return <><GlobalStyle/><Register navigate={p=>setHistory(h=>[...h,p])} onLogin={handleLogin}/></>;
    if(route==="/login")    return <><GlobalStyle/><Login    navigate={p=>setHistory(h=>[...h,p])} onLogin={handleLogin}/></>;
    return <><GlobalStyle/><Landing navigate={p=>setHistory(h=>[...h,p])}/></>;
  }

  const pageTitle=PAGE_TITLES[route]||"Rootswood";

  const renderPage=()=>{
    if(route==="/dashboard") return <Dashboard navigate={navigate} user={user} trees={trees} onCreateTree={()=>setCreateTreeModal(true)}/>;
    if(route==="/tree")      return <TreeView  treeId={activeTreeId} navigate={navigate} showToast={showToast}/>;
    if(route==="/families")  return <Families  navigate={navigate} trees={trees} onRefresh={loadTrees} showToast={showToast} setActiveTreeId={setActiveTreeId}/>;
    if(route==="/member")    return <MemberProfile user={user}/>;
    if(route==="/activity")  return <Activity trees={trees} activeTreeId={activeTreeId}/>;
    if(route==="/export")    return <Export trees={trees} showToast={showToast}/>;
    if(route==="/settings")  return <Settings user={user} onLogout={handleLogout} showToast={showToast}/>;
    if(route==="/author")    return <Author/>;
    return <Dashboard navigate={navigate} user={user} trees={trees} onCreateTree={()=>setCreateTreeModal(true)}/>;
  };

  return(
    <>
      <GlobalStyle/>
      {toast&&<Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}

      {/* First-time welcome */}
      {welcomeModal&&trees.length===0&&<WelcomeBanner user={user} navigate={navigate} onDismiss={()=>setWelcomeModal(false)}/>}

      {/* Create tree modal */}
      {createTreeModal&&(
        <CreateTreeModal
          onCreated={t=>{ setActiveTreeId(t.id); showToast("Tree created! Start adding members."); loadTrees(); }}
          onClose={()=>setCreateTreeModal(false)}
        />
      )}

      <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
        <Sidebar current={route} navigate={p=>navigate(p)} collapsed={collapsed} setCollapsed={setCollapsed} user={user}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <Topbar title={pageTitle} canGoBack={canGoBack} goBack={goBack}/>
          <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}