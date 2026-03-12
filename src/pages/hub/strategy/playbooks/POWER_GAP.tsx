import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  run:     '#ef4444',
  pass:    '#a78bfa',
  sit:     '#fbbf24',
  block:   '#64748b',
  motion:  '#f472b6',
  protect: '#475569',
  qbmove:  '#fb923c',
  pull:    '#f87171',
  toss:    '#fbbf24',
  read:    '#34d399',
};

const CAT_META = {
  run:  { label: 'Runs', short: 'RUN',  accent: '#ef4444', bg: '#ef444412' },
  pass: { label: 'Pass', short: 'PASS', accent: '#a78bfa', bg: '#a78bfa12' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

const QB_Y_UNDER = 94;
const RB_Y_DEEP  = 108;
const FB_Y       = 102;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#ef4444','#a78bfa','#fb923c','#fbbf24',
  '#f472b6','#34d399','#64748b','#475569','#f87171','#10b981',
];

/* ── FORMATION HELPERS ───────────────────────── */
const PRO_SKILL = [
  { x: 18,  y: LOS, t: 'WR' },
  { x: 64,  y: LOS, t: 'TE' },
  { x: 88,  y: QB_Y_UNDER, t: 'QB' },
  { x: 88,  y: FB_Y, t: 'FB' },
  { x: 88,  y: RB_Y_DEEP, t: 'RB' },
  { x: 172, y: LOS, t: 'TE' },
  { x: 188, y: LOS, t: 'WR' },
];

const SINGLEBACK_SKILL = [
  { x: 18,  y: LOS, t: 'WR' },
  { x: 64,  y: LOS, t: 'TE' },
  { x: 88,  y: QB_Y_UNDER, t: 'QB' },
  { x: 88,  y: RB_Y_DEEP, t: 'RB' },
  { x: 172, y: LOS, t: 'TE' },
  { x: 188, y: LOS, t: 'WR' },
];

const HEAVY_SKILL = [
  { x: 28,  y: LOS, t: 'TE' },
  { x: 64,  y: LOS, t: 'TE' },
  { x: 88,  y: QB_Y_UNDER, t: 'QB' },
  { x: 80,  y: FB_Y, t: 'FB' },
  { x: 94,  y: RB_Y_DEEP, t: 'RB' },
  { x: 172, y: LOS, t: 'TE' },
];

const TRIPS_BOOT_SKILL = [
  { x: 18,  y: LOS, t: 'WR' },
  { x: 36,  y: LOS, t: 'WR' },
  { x: 64,  y: LOS, t: 'TE' },
  { x: 88,  y: QB_Y_UNDER, t: 'QB' },
  { x: 88,  y: RB_Y_DEEP, t: 'RB' },
  { x: 182, y: LOS, t: 'WR' },
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ RUNS 1-25 ══════════════════════════════ */
  {
    id:1, name:'Power_O', label:'Power O', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[88,100],[94,84],[102,52]), c:CLR.run, w:2.8, a:true },
      { d:CB([70,LOS],[76,LOS+8],[92,LOS+2],[100,LOS-8]), c:CLR.pull, w:1.9, a:true },
      { d:P([80,LOS],[80,LOS-10]),   c:CLR.block, w:1.3, a:true },
      { d:P([90,LOS],[90,LOS-10]),   c:CLR.block, w:1.3, a:true },
      { d:P([100,LOS],[100,LOS-10]), c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[110,LOS-8]),  c:CLR.block, w:1.3, a:true },
      { d:P([88,FB_Y],[100,78]),     c:CLR.block, w:1.5, a:true },
      { d:P([64,LOS],[60,LOS-8]),    c:CLR.block, w:1.1, a:true },
      { d:P([172,LOS],[176,LOS-8]),  c:CLR.block, w:1.1, a:true },
    ],
  },
  {
    id:2, name:'Counter_Trey', label:'Counter Trey', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[92,102],[100,88],[112,52]), c:CLR.run, w:2.8, a:true },
      { d:CB([100,LOS],[106,LOS+8],[122,LOS+2],[132,LOS-8]), c:CLR.pull, w:1.9, a:true },
      { d:CB([70,LOS],[76,LOS+8],[116,LOS+4],[126,LOS-6]), c:CLR.pull, w:1.6, a:true },
      { d:P([80,LOS],[80,LOS-10]), c:CLR.block, w:1.3, a:true },
      { d:P([90,LOS],[90,LOS-10]), c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[110,LOS-9]),c:CLR.block, w:1.3, a:true },
      { d:P([88,FB_Y],[96,84]),     c:CLR.motion,w:1.2, a:false, dsh:true },
    ],
  },
  {
    id:3, name:'Duo', label:'Duo', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[88,102],[88,82],[88,50]), c:CLR.run, w:2.8, a:true },
      { d:P([70,LOS],[70,LOS-11]),   c:CLR.block, w:1.8, a:true },
      { d:P([80,LOS],[80,LOS-11]),   c:CLR.block, w:1.8, a:true },
      { d:P([90,LOS],[90,LOS-11]),   c:CLR.block, w:1.8, a:true },
      { d:P([100,LOS],[100,LOS-11]), c:CLR.block, w:1.8, a:true },
      { d:P([110,LOS],[110,LOS-11]), c:CLR.block, w:1.8, a:true },
      { d:P([88,FB_Y],[88,78]),      c:CLR.block, w:1.4, a:true },
    ],
  },
  {
    id:4, name:'Iso', label:'Iso', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[88,102],[86,84],[84,52]), c:CLR.run, w:2.8, a:true },
      { d:P([88,FB_Y],[82,78]),      c:CLR.block, w:1.6, a:true },
      { d:P([70,LOS],[68,LOS-8]),    c:CLR.block, w:1.3, a:true },
      { d:P([80,LOS],[78,LOS-10]),   c:CLR.block, w:1.3, a:true },
      { d:P([90,LOS],[90,LOS-10]),   c:CLR.block, w:1.3, a:true },
      { d:P([100,LOS],[102,LOS-9]),  c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[112,LOS-8]),  c:CLR.block, w:1.3, a:true },
    ],
  },
  {
    id:5, name:'Trap', label:'Trap', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[86,102],[82,86],[82,50]), c:CLR.run, w:2.8, a:true },
      { d:CB([100,LOS],[94,LOS+8],[86,LOS+2],[84,LOS-8]), c:CLR.pull, w:1.8, a:true },
      { d:P([70,LOS],[70,LOS-9]),   c:CLR.block, w:1.3, a:true },
      { d:P([80,LOS],[80,LOS-9]),   c:CLR.block, w:1.3, a:true },
      { d:P([90,LOS],[90,LOS-9]),   c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[110,LOS-9]), c:CLR.block, w:1.3, a:true },
      { d:P([64,LOS],[60,LOS-8]),   c:CLR.block, w:1.1, a:true },
    ],
  },
  {
    id:6, name:'Wham', label:'Wham', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[88,100],[90,84],[92,52]), c:CLR.run, w:2.8, a:true },
      { d:CB([64,LOS],[70,76],[84,68],[94,56]), c:CLR.block, w:1.8, a:true, dsh:true },
      { d:P([70,LOS],[70,LOS-8]),   c:CLR.block, w:1.3, a:true },
      { d:P([80,LOS],[80,LOS-10]),  c:CLR.block, w:1.3, a:true },
      { d:P([90,LOS],[90,LOS-10]),  c:CLR.block, w:1.3, a:true },
      { d:P([100,LOS],[100,LOS-8]), c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[110,LOS-8]), c:CLR.block, w:1.3, a:true },
    ],
  },
  {
    id:7, name:'Toss_Crack', label:'Toss Crack', cat:'run',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:QQ([88,QB_Y_UNDER],[122,96],[166,90]), c:CLR.toss, w:1.5, a:true, dsh:true },
      { d:CB([166,90],[178,72],[188,56],[192,36]), c:CLR.run, w:2.8, a:true },
      { d:CB([188,LOS],[176,60],[164,54],[154,52]), c:CLR.block, w:1.5, a:true },
      { d:P([172,LOS],[184,LOS-6]), c:CLR.block, w:1.2, a:true },
      { d:P([100,LOS],[110,LOS-5]), c:CLR.block, w:1.2, a:true },
      { d:P([110,LOS],[122,LOS-5]), c:CLR.block, w:1.2, a:true },
      { d:P([64,LOS],[64,LOS-8]),   c:CLR.block, w:1.0, a:true },
    ],
  },
  {
    id:8, name:'Sweep', label:'Sweep', cat:'run',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:QQ([88,QB_Y_UNDER],[52,96],[18,90]), c:CLR.toss, w:1.5, a:true, dsh:true },
      { d:CB([18,90],[10,72],[8,56],[10,36]), c:CLR.run, w:2.8, a:true },
      { d:P([70,LOS],[58,LOS-5]),  c:CLR.block, w:1.2, a:true },
      { d:P([80,LOS],[68,LOS-5]),  c:CLR.block, w:1.2, a:true },
      { d:P([90,LOS],[78,LOS-5]),  c:CLR.block, w:1.2, a:true },
      { d:P([64,LOS],[52,LOS-7]),  c:CLR.block, w:1.2, a:true },
      { d:CB([18,LOS],[24,60],[28,52],[32,48]), c:CLR.block, w:1.2, a:true },
    ],
  },
  {
    id:9, name:'Lead_Draw', label:'Lead Draw', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+7]), c:CLR.qbmove, w:1.4, a:false, dsh:true },
      { d:CB([88,RB_Y_DEEP],[88,104],[90,86],[92,50]), c:CLR.run, w:2.8, a:true },
      { d:P([88,FB_Y],[94,80]), c:CLR.block, w:1.5, a:true },
      { d:P([70,LOS],[70,LOS-9]),   c:CLR.block, w:1.2, a:true },
      { d:P([80,LOS],[80,LOS-9]),   c:CLR.block, w:1.2, a:true },
      { d:P([90,LOS],[90,LOS-9]),   c:CLR.block, w:1.2, a:true },
      { d:P([100,LOS],[100,LOS-9]), c:CLR.block, w:1.2, a:true },
      { d:P([110,LOS],[110,LOS-9]), c:CLR.block, w:1.2, a:true },
    ],
  },
  {
    id:10, name:'GT_Counter', label:'GT Counter', cat:'run',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[92,102],[104,86],[122,50]), c:CLR.run, w:2.8, a:true },
      { d:CB([90,LOS],[96,LOS+8],[114,LOS+4],[126,LOS-8]), c:CLR.pull, w:1.9, a:true },
      { d:CB([70,LOS],[76,LOS+8],[118,LOS+2],[132,LOS-6]), c:CLR.pull, w:1.7, a:true },
      { d:P([80,LOS],[80,LOS-10]),   c:CLR.block, w:1.3, a:true },
      { d:P([100,LOS],[100,LOS-9]),  c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[110,LOS-9]),  c:CLR.block, w:1.3, a:true },
      { d:P([172,LOS],[176,LOS-8]),  c:CLR.block, w:1.0, a:true },
    ],
  },
  {
    id:11, name:'Pin_Pull', label:'Pin-Pull', cat:'run',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[92,102],[112,84],[146,54]), c:CLR.run, w:2.8, a:true },
      { d:CB([100,LOS],[108,LOS+8],[126,LOS+2],[140,LOS-8]), c:CLR.pull, w:1.9, a:true },
      { d:CB([110,LOS],[120,LOS+6],[136,LOS+2],[148,LOS-8]), c:CLR.pull, w:1.6, a:true },
      { d:P([70,LOS],[66,LOS-6]),  c:CLR.block, w:1.2, a:true },
      { d:P([80,LOS],[76,LOS-8]),  c:CLR.block, w:1.2, a:true },
      { d:P([90,LOS],[88,LOS-8]),  c:CLR.block, w:1.2, a:true },
      { d:P([172,LOS],[168,LOS-7]),c:CLR.block, w:1.0, a:true },
    ],
  },
  {
    id:12, name:'Inside_Zone', label:'Inside Zone', cat:'run',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[86,102],[82,86],[80,50]), c:CLR.run, w:2.8, a:true },
      { d:P([70,LOS],[66,LOS-7]),  c:CLR.block, w:1.2, a:true },
      { d:P([80,LOS],[78,LOS-9]),  c:CLR.block, w:1.2, a:true },
      { d:P([90,LOS],[90,LOS-10]), c:CLR.block, w:1.2, a:true },
      { d:P([100,LOS],[102,LOS-9]),c:CLR.block, w:1.2, a:true },
      { d:P([110,LOS],[114,LOS-7]),c:CLR.block, w:1.2, a:true },
      { d:P([64,LOS],[60,LOS-8]),  c:CLR.block, w:1.0, a:true },
    ],
  },
  {
    id:13, name:'Split_Zone', label:'Split Zone', cat:'run',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[90,102],[96,86],[100,50]), c:CLR.run, w:2.8, a:true },
      { d:CB([172,LOS],[154,76],[126,66],[102,56]), c:CLR.block, w:1.6, a:true, dsh:true },
      { d:P([70,LOS],[72,LOS-7]),   c:CLR.block, w:1.2, a:true },
      { d:P([80,LOS],[82,LOS-9]),   c:CLR.block, w:1.2, a:true },
      { d:P([90,LOS],[90,LOS-10]),  c:CLR.block, w:1.2, a:true },
      { d:P([100,LOS],[98,LOS-9]),  c:CLR.block, w:1.2, a:true },
      { d:P([110,LOS],[108,LOS-7]), c:CLR.block, w:1.2, a:true },
    ],
  },
  {
    id:14, name:'Goal_Line_Lead', label:'Goal Line Lead', cat:'run',
    sk:[...HEAVY_SKILL],
    rt:[
      { d:CB([94,RB_Y_DEEP],[94,104],[94,88],[94,54]), c:CLR.run, w:2.8, a:true },
      { d:P([80,FB_Y],[90,80]), c:CLR.block, w:1.7, a:true },
      { d:P([70,LOS],[70,LOS-12]),   c:CLR.block, w:1.8, a:true },
      { d:P([80,LOS],[80,LOS-12]),   c:CLR.block, w:1.8, a:true },
      { d:P([90,LOS],[90,LOS-12]),   c:CLR.block, w:1.8, a:true },
      { d:P([100,LOS],[100,LOS-12]), c:CLR.block, w:1.8, a:true },
      { d:P([110,LOS],[110,LOS-12]), c:CLR.block, w:1.8, a:true },
      { d:P([28,LOS],[28,LOS-8]),    c:CLR.block, w:1.1, a:true },
      { d:P([172,LOS],[172,LOS-8]),  c:CLR.block, w:1.1, a:true },
    ],
  },
  {
    id:15, name:'QB_Sneak', label:'QB Sneak', cat:'run',
    sk:[...HEAVY_SKILL],
    rt:[
      { d:CB([88,QB_Y_UNDER],[88,86],[88,72],[88,56]), c:CLR.run, w:2.8, a:true },
      { d:P([70,LOS],[70,LOS-10]),   c:CLR.block, w:1.7, a:true },
      { d:P([80,LOS],[80,LOS-10]),   c:CLR.block, w:1.7, a:true },
      { d:P([90,LOS],[90,LOS-10]),   c:CLR.block, w:1.7, a:true },
      { d:P([100,LOS],[100,LOS-10]), c:CLR.block, w:1.7, a:true },
      { d:P([110,LOS],[110,LOS-10]), c:CLR.block, w:1.7, a:true },
      { d:P([80,FB_Y],[88,84]),      c:CLR.block, w:1.3, a:true },
    ],
  },
  {
    id:16, name:'TE_Insert', label:'TE Insert', cat:'run',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[86,102],[82,86],[80,52]), c:CLR.run, w:2.8, a:true },
      { d:CB([172,LOS],[160,74],[132,64],[96,56]), c:CLR.block, w:1.8, a:true, dsh:true },
      { d:P([70,LOS],[68,LOS-8]),    c:CLR.block, w:1.3, a:true },
      { d:P([80,LOS],[78,LOS-10]),   c:CLR.block, w:1.3, a:true },
      { d:P([90,LOS],[90,LOS-10]),   c:CLR.block, w:1.3, a:true },
      { d:P([100,LOS],[102,LOS-8]),  c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[112,LOS-7]),  c:CLR.block, w:1.3, a:true },
    ],
  },
  {
    id:17, name:'FB_Dive', label:'FB Dive', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,FB_Y],[88,92],[88,76],[88,52]), c:CLR.run, w:2.8, a:true },
      { d:P([70,LOS],[70,LOS-10]),   c:CLR.block, w:1.5, a:true },
      { d:P([80,LOS],[80,LOS-10]),   c:CLR.block, w:1.5, a:true },
      { d:P([90,LOS],[90,LOS-10]),   c:CLR.block, w:1.5, a:true },
      { d:P([100,LOS],[100,LOS-10]), c:CLR.block, w:1.5, a:true },
      { d:P([110,LOS],[110,LOS-10]), c:CLR.block, w:1.5, a:true },
      { d:QQ([88,RB_Y_DEEP],[96,102],[108,102]),  c:CLR.motion, w:1.1, a:false, dsh:true },
    ],
  },
  {
    id:18, name:'Heavy_Toss', label:'Heavy Toss', cat:'run',
    sk:[...HEAVY_SKILL],
    rt:[
      { d:QQ([88,QB_Y_UNDER],[126,98],[166,90]), c:CLR.toss, w:1.5, a:true, dsh:true },
      { d:CB([166,90],[180,72],[190,56],[194,38]), c:CLR.run, w:2.8, a:true },
      { d:P([172,LOS],[184,LOS-7]), c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[122,LOS-5]), c:CLR.block, w:1.3, a:true },
      { d:P([100,LOS],[112,LOS-5]), c:CLR.block, w:1.3, a:true },
      { d:P([80,FB_Y],[98,84]),     c:CLR.block, w:1.5, a:true },
      { d:P([28,LOS],[40,LOS-5]),   c:CLR.block, w:1.1, a:true },
    ],
  },
  {
    id:19, name:'Counter_OF', label:'Counter OF', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[84,102],[72,88],[56,54]), c:CLR.run, w:2.8, a:true },
      { d:P([88,FB_Y],[72,80]), c:CLR.pull, w:1.7, a:true },
      { d:CB([110,LOS],[104,LOS+8],[84,LOS+4],[70,LOS-8]), c:CLR.pull, w:1.7, a:true },
      { d:P([70,LOS],[70,LOS-9]),   c:CLR.block, w:1.2, a:true },
      { d:P([80,LOS],[80,LOS-9]),   c:CLR.block, w:1.2, a:true },
      { d:P([90,LOS],[90,LOS-9]),   c:CLR.block, w:1.2, a:true },
      { d:P([100,LOS],[100,LOS-9]), c:CLR.block, w:1.2, a:true },
    ],
  },
  {
    id:20, name:'Strong_Iso', label:'Strong Iso', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[90,102],[96,86],[100,52]), c:CLR.run, w:2.8, a:true },
      { d:P([88,FB_Y],[98,80]), c:CLR.block, w:1.6, a:true },
      { d:P([70,LOS],[72,LOS-7]),   c:CLR.block, w:1.3, a:true },
      { d:P([80,LOS],[82,LOS-9]),   c:CLR.block, w:1.3, a:true },
      { d:P([90,LOS],[90,LOS-10]),  c:CLR.block, w:1.3, a:true },
      { d:P([100,LOS],[98,LOS-9]),  c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[108,LOS-7]), c:CLR.block, w:1.3, a:true },
    ],
  },
  {
    id:21, name:'Weak_Iso', label:'Weak Iso', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[86,102],[80,86],[76,52]), c:CLR.run, w:2.8, a:true },
      { d:P([88,FB_Y],[80,80]), c:CLR.block, w:1.6, a:true },
      { d:P([70,LOS],[68,LOS-7]),   c:CLR.block, w:1.3, a:true },
      { d:P([80,LOS],[78,LOS-9]),   c:CLR.block, w:1.3, a:true },
      { d:P([90,LOS],[90,LOS-10]),  c:CLR.block, w:1.3, a:true },
      { d:P([100,LOS],[102,LOS-9]), c:CLR.block, w:1.3, a:true },
      { d:P([110,LOS],[112,LOS-7]), c:CLR.block, w:1.3, a:true },
    ],
  },
  {
    id:22, name:'Stretch', label:'Stretch', cat:'run',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[96,102],[116,90],[146,56]), c:CLR.run, w:2.8, a:true },
      { d:P([70,LOS],[78,LOS-5]),   c:CLR.block, w:1.2, a:true },
      { d:P([80,LOS],[90,LOS-5]),   c:CLR.block, w:1.2, a:true },
      { d:P([90,LOS],[100,LOS-5]),  c:CLR.block, w:1.2, a:true },
      { d:P([100,LOS],[112,LOS-5]), c:CLR.block, w:1.2, a:true },
      { d:P([110,LOS],[124,LOS-5]), c:CLR.block, w:1.2, a:true },
      { d:P([172,LOS],[184,LOS-5]), c:CLR.block, w:1.0, a:true },
    ],
  },
  {
    id:23, name:'Jet_Sweep', label:'Jet Sweep', cat:'run',
    sk:[
      { x:18,  y:LOS, t:'WR' },
      { x:64,  y:LOS, t:'TE' },
      { x:88,  y:QB_Y_UNDER, t:'QB' },
      { x:88,  y:RB_Y_DEEP, t:'RB' },
      { x:172, y:LOS, t:'TE' },
      { x:188, y:LOS, t:'WR' },
    ],
    rt:[
      { d:CB([18,LOS],[36,LOS+14],[74,LOS+16],[118,LOS+2]), c:CLR.motion, w:1.5, a:false, dsh:true },
      { d:P([88,QB_Y_UNDER],[104,QB_Y_UNDER-5]), c:CLR.toss, w:1.3, a:true, dsh:true },
      { d:CB([118,LOS+2],[142,62],[166,48],[184,36]), c:CLR.run, w:2.8, a:true },
      { d:P([90,LOS],[100,LOS-6]),  c:CLR.block, w:1.2, a:true },
      { d:P([100,LOS],[112,LOS-6]), c:CLR.block, w:1.2, a:true },
      { d:P([110,LOS],[124,LOS-6]), c:CLR.block, w:1.2, a:true },
      { d:P([172,LOS],[186,LOS-6]), c:CLR.block, w:1.2, a:true },
    ],
  },
  {
    id:24, name:'Reverse', label:'Reverse', cat:'run',
    sk:[
      { x:18,  y:LOS, t:'WR' },
      { x:64,  y:LOS, t:'TE' },
      { x:88,  y:QB_Y_UNDER, t:'QB' },
      { x:88,  y:RB_Y_DEEP, t:'RB' },
      { x:172, y:LOS, t:'TE' },
      { x:188, y:LOS, t:'WR' },
    ],
    rt:[
      { d:QQ([88,QB_Y_UNDER],[120,98],[166,92]), c:CLR.toss, w:1.4, a:true, dsh:true },
      { d:QQ([166,92],[138,88],[96,90]), c:CLR.motion, w:1.4, a:true, dsh:true },
      { d:CB([96,90],[62,72],[32,54],[14,34]), c:CLR.run, w:2.8, a:true },
      { d:P([64,LOS],[54,LOS-5]),  c:CLR.block, w:1.2, a:true },
      { d:P([70,LOS],[62,LOS-5]),  c:CLR.block, w:1.2, a:true },
      { d:P([80,LOS],[72,LOS-5]),  c:CLR.block, w:1.2, a:true },
      { d:CB([18,LOS],[26,64],[34,56],[42,50]), c:CLR.block, w:1.2, a:true },
    ],
  },
  {
    id:25, name:'Crack_Toss', label:'Crack Toss', cat:'run',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:QQ([88,QB_Y_UNDER],[120,96],[160,92]), c:CLR.toss, w:1.5, a:true, dsh:true },
      { d:CB([160,92],[174,72],[186,56],[192,36]), c:CLR.run, w:2.8, a:true },
      { d:CB([188,LOS],[176,58],[162,52],[150,50]), c:CLR.block, w:1.5, a:true },
      { d:P([172,LOS],[184,LOS-6]), c:CLR.block, w:1.2, a:true },
      { d:P([100,LOS],[112,LOS-5]), c:CLR.block, w:1.2, a:true },
      { d:P([110,LOS],[124,LOS-5]), c:CLR.block, w:1.2, a:true },
      { d:P([64,LOS],[64,LOS-8]),   c:CLR.block, w:1.0, a:true },
    ],
  },

  /* ═══ PASS 26-40 ═════════════════════════════ */
  {
    id:26, name:'PlayAction_Post', label:'Play-Action Post', cat:'pass',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([18,LOS],[18,36],[44,22],[70,18]), c:CLR.pass, w:2.3, a:true },
      { d:P([188,LOS],[188,28]), c:CLR.pass, w:1.7, a:true },
      { d:CB([172,LOS],[172,34],[154,22],[134,18]), c:CLR.pass, w:2.0, a:true },
      { d:P([64,LOS],[64,28]), c:CLR.pass, w:1.7, a:true },
      { d:CB([88,RB_Y_DEEP],[92,100],[100,94],[108,92]), c:CLR.qbmove, w:1.4, a:false, dsh:true },
      { d:P([88,FB_Y],[96,88]), c:CLR.protect, w:1.4, a:false },
      { d:P([70,LOS],[70,LOS-9]),   c:CLR.protect, w:1.2, a:false },
      { d:P([80,LOS],[80,LOS-9]),   c:CLR.protect, w:1.2, a:false },
      { d:P([90,LOS],[90,LOS-9]),   c:CLR.protect, w:1.2, a:false },
      { d:P([100,LOS],[100,LOS-9]), c:CLR.protect, w:1.2, a:false },
      { d:P([110,LOS],[110,LOS-9]), c:CLR.protect, w:1.2, a:false },
    ],
  },
  {
    id:27, name:'Y_Corner', label:'Y Corner', cat:'pass',
    sk:[...PRO_SKILL],
    rt:[
      { d:CB([64,LOS],[68,44],[92,30],[118,24]), c:CLR.pass, w:2.3, a:true },
      { d:P([18,LOS],[18,52],[18,56]),  c:CLR.pass, w:2.1, a:true },
      { d:P([188,LOS],[188,26]),        c:CLR.pass, w:1.8, a:true },
      { d:P([172,LOS],[172,42],[150,42]), c:CLR.pass, w:1.8, a:true },
      { d:QQ([88,RB_Y_DEEP],[106,92],[126,90]), c:CLR.pass, w:1.0, a:true, dsh:true },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+8]), c:CLR.qbmove, w:1.4, a:false, dsh:true },
    ],
  },
  {
    id:28, name:'Smash', label:'Smash', cat:'pass',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([18,LOS],[10,40],[22,22],[36,18]), c:CLR.pass, w:2.2, a:true },
      { d:P([64,LOS],[64,54],[64,58]),          c:CLR.pass, w:2.2, a:true },
      { d:CB([188,LOS],[196,40],[184,22],[170,18]), c:CLR.pass, w:2.2, a:true },
      { d:P([172,LOS],[172,54],[172,58]),          c:CLR.pass, w:2.2, a:true },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+8]),    c:CLR.qbmove, w:1.5, a:false, dsh:true },
    ],
  },
  {
    id:29, name:'Levels', label:'Levels', cat:'pass',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:P([18,LOS],[18,34],[92,34]),      c:CLR.pass, w:2.2, a:true },
      { d:CB([64,LOS],[76,54],[104,56],[126,56]), c:CLR.pass, w:2.2, a:true },
      { d:P([188,LOS],[188,24]),            c:CLR.pass, w:1.8, a:true },
      { d:P([172,LOS],[172,42]),            c:CLR.pass, w:1.6, a:true },
      { d:QQ([88,RB_Y_DEEP],[104,92],[122,88]), c:CLR.pass, w:1.0, a:true, dsh:true },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+8]), c:CLR.qbmove, w:1.5, a:false, dsh:true },
    ],
  },
  {
    id:30, name:'Flood', label:'Flood', cat:'pass',
    sk:[...TRIPS_BOOT_SKILL],
    rt:[
      { d:CB([182,LOS],[194,40],[178,20],[160,18]), c:CLR.pass, w:2.2, a:true },
      { d:P([64,LOS],[64,48],[98,48]),             c:CLR.pass, w:2.2, a:true },
      { d:QQ([36,LOS],[54,60],[74,62]),            c:CLR.pass, w:2.0, a:true },
      { d:P([18,LOS],[18,24]),                     c:CLR.pass, w:1.7, a:true },
      { d:CB([88,QB_Y_UNDER],[78,94],[68,88],[58,84]), c:CLR.qbmove, w:1.5, a:true, dsh:true },
      { d:CB([88,RB_Y_DEEP],[92,100],[104,94],[114,92]), c:CLR.protect, w:1.2, a:false },
    ],
  },
  {
    id:31, name:'Boot', label:'Boot', cat:'pass',
    sk:[...TRIPS_BOOT_SKILL],
    rt:[
      { d:CB([64,LOS],[58,56],[42,72],[24,78]),   c:CLR.pass, w:2.2, a:true },
      { d:P([18,LOS],[18,24]),                    c:CLR.pass, w:1.8, a:true },
      { d:CB([182,LOS],[194,42],[180,24],[164,22]), c:CLR.pass, w:2.0, a:true },
      { d:QQ([36,LOS],[58,60],[82,58]),           c:CLR.pass, w:1.8, a:true },
      { d:CB([88,QB_Y_UNDER],[74,96],[60,88],[48,82]), c:CLR.qbmove, w:1.6, a:true, dsh:true },
      { d:CB([88,RB_Y_DEEP],[96,100],[108,94],[116,92]), c:CLR.protect, w:1.2, a:false },
    ],
  },
  {
    id:32, name:'TE_Seam', label:'TE Seam', cat:'pass',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:P([64,LOS],[64,16]), c:CLR.pass, w:2.3, a:true },
      { d:P([172,LOS],[172,24]), c:CLR.pass, w:1.8, a:true },
      { d:P([18,LOS],[18,54],[18,58]), c:CLR.pass, w:2.0, a:true },
      { d:CB([188,LOS],[196,40],[186,22],[172,18]), c:CLR.pass, w:2.0, a:true },
      { d:QQ([88,RB_Y_DEEP],[104,92],[122,90]), c:CLR.pass, w:1.0, a:true, dsh:true },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+8]), c:CLR.qbmove, w:1.5, a:false, dsh:true },
    ],
  },
  {
    id:33, name:'MaxProtect_Cross', label:'Max Protect Cross', cat:'pass',
    sk:[
      { x:18,  y:LOS, t:'WR' },
      { x:64,  y:LOS, t:'TE' },
      { x:88,  y:QB_Y_UNDER, t:'QB' },
      { x:88,  y:FB_Y, t:'FB' },
      { x:88,  y:RB_Y_DEEP, t:'RB' },
      { x:188, y:LOS, t:'WR' },
    ],
    rt:[
      { d:CB([18,LOS],[18,44],[56,36],[104,34]), c:CLR.pass, w:2.4, a:true },
      { d:CB([188,LOS],[188,34],[156,18],[126,14]), c:CLR.pass, w:2.5, a:true },
      { d:P([64,LOS],[64,LOS-8]), c:CLR.protect, w:1.4, a:false },
      { d:P([88,FB_Y],[98,86]),   c:CLR.protect, w:1.5, a:false },
      { d:P([88,RB_Y_DEEP],[100,94]), c:CLR.protect, w:1.5, a:false },
      { d:P([70,LOS],[70,LOS-9]),   c:CLR.protect, w:1.2, a:false },
      { d:P([80,LOS],[80,LOS-9]),   c:CLR.protect, w:1.2, a:false },
      { d:P([90,LOS],[90,LOS-9]),   c:CLR.protect, w:1.2, a:false },
      { d:P([100,LOS],[100,LOS-9]), c:CLR.protect, w:1.2, a:false },
      { d:P([110,LOS],[110,LOS-9]), c:CLR.protect, w:1.2, a:false },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+10]),  c:CLR.qbmove, w:1.5, a:false, dsh:true },
    ],
  },
  {
    id:34, name:'Post_Dig', label:'Post-Dig', cat:'pass',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([18,LOS],[18,34],[42,20],[66,16]), c:CLR.pass, w:2.3, a:true },
      { d:P([188,LOS],[188,34],[132,34]),       c:CLR.pass, w:2.3, a:true },
      { d:P([64,LOS],[64,22]),                  c:CLR.pass, w:1.8, a:true },
      { d:P([172,LOS],[172,48],[196,48]),       c:CLR.pass, w:1.8, a:true },
      { d:QQ([88,RB_Y_DEEP],[104,92],[122,90]), c:CLR.pass, w:1.0, a:true, dsh:true },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+8]), c:CLR.qbmove, w:1.5, a:false, dsh:true },
    ],
  },
  {
    id:35, name:'Mills', label:'Mills', cat:'pass',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([18,LOS],[18,34],[42,20],[68,16]), c:CLR.pass, w:2.3, a:true },
      { d:P([188,LOS],[188,30],[150,30]),       c:CLR.pass, w:2.3, a:true },
      { d:P([64,LOS],[64,54],[64,58]),          c:CLR.pass, w:1.8, a:true },
      { d:P([172,LOS],[172,24]),                c:CLR.pass, w:1.8, a:true },
      { d:QQ([88,RB_Y_DEEP],[104,92],[124,90]), c:CLR.pass, w:1.0, a:true, dsh:true },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+8]), c:CLR.qbmove, w:1.5, a:false, dsh:true },
    ],
  },
  {
    id:36, name:'Dagger', label:'Dagger', cat:'pass',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:P([18,LOS],[18,30],[86,30]),          c:CLR.pass, w:2.2, a:true },
      { d:CB([64,LOS],[64,44],[90,28],[112,22]),c:CLR.pass, w:2.3, a:true },
      { d:CB([188,LOS],[188,34],[158,20],[130,16]), c:CLR.pass, w:2.0, a:true },
      { d:P([172,LOS],[172,50],[148,50]),       c:CLR.pass, w:2.0, a:true },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+8]), c:CLR.qbmove, w:1.5, a:false, dsh:true },
      { d:QQ([88,RB_Y_DEEP],[104,92],[122,90]), c:CLR.pass, w:1.0, a:true, dsh:true },
    ],
  },
  {
    id:37, name:'Sail', label:'Sail', cat:'pass',
    sk:[...TRIPS_BOOT_SKILL],
    rt:[
      { d:CB([182,LOS],[194,40],[180,20],[164,18]), c:CLR.pass, w:2.2, a:true },
      { d:P([64,LOS],[64,48],[102,48]),             c:CLR.pass, w:2.2, a:true },
      { d:QQ([36,LOS],[56,60],[78,58]),             c:CLR.pass, w:1.9, a:true },
      { d:P([18,LOS],[18,24]),                      c:CLR.pass, w:1.7, a:true },
      { d:CB([88,QB_Y_UNDER],[78,96],[66,90],[56,84]), c:CLR.qbmove, w:1.5, a:true, dsh:true },
      { d:CB([88,RB_Y_DEEP],[96,100],[108,94],[118,92]), c:CLR.protect, w:1.2, a:false },
    ],
  },
  {
    id:38, name:'Shallow', label:'Shallow', cat:'pass',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([18,LOS],[42,58],[86,56],[132,58]), c:CLR.pass, w:2.2, a:true },
      { d:CB([188,LOS],[164,44],[118,42],[82,44]), c:CLR.pass, w:2.2, a:true },
      { d:P([64,LOS],[64,24]),  c:CLR.pass, w:1.8, a:true },
      { d:P([172,LOS],[172,24]),c:CLR.pass, w:1.8, a:true },
      { d:QQ([88,RB_Y_DEEP],[104,92],[124,88]), c:CLR.pass, w:1.0, a:true, dsh:true },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+8]), c:CLR.qbmove, w:1.5, a:false, dsh:true },
    ],
  },
  {
    id:39, name:'RB_Wheel', label:'RB Wheel', cat:'pass',
    sk:[...SINGLEBACK_SKILL],
    rt:[
      { d:CB([88,RB_Y_DEEP],[112,104],[144,82],[166,20]), c:CLR.pass, w:2.3, a:true },
      { d:CB([188,LOS],[196,38],[186,20],[170,16]), c:CLR.pass, w:2.0, a:true },
      { d:P([18,LOS],[18,30]),  c:CLR.pass, w:1.8, a:true },
      { d:P([64,LOS],[64,50],[92,50]), c:CLR.pass, w:1.8, a:true },
      { d:P([172,LOS],[172,30]), c:CLR.pass, w:1.8, a:true },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+8]), c:CLR.qbmove, w:1.5, a:false, dsh:true },
    ],
  },
  {
    id:40, name:'TE_Leak', label:'TE Leak', cat:'pass',
    sk:[...PRO_SKILL],
    rt:[
      { d:P([64,LOS],[64,LOS-8]), c:CLR.protect, w:1.2, a:false },
      { d:CB([64,LOS-8],[70,72],[90,62],[120,56]), c:CLR.pass, w:2.2, a:true, dsh:true },
      { d:CB([188,LOS],[196,38],[184,20],[170,16]), c:CLR.pass, w:2.1, a:true },
      { d:P([18,LOS],[18,26]), c:CLR.pass, w:1.8, a:true },
      { d:P([172,LOS],[172,26]), c:CLR.pass, w:1.8, a:true },
      { d:P([88,FB_Y],[98,86]), c:CLR.protect, w:1.5, a:false },
      { d:CB([88,RB_Y_DEEP],[96,100],[108,94],[118,92]), c:CLR.protect, w:1.2, a:false },
      { d:P([88,QB_Y_UNDER],[88,QB_Y_UNDER+10]), c:CLR.qbmove, w:1.5, a:false, dsh:true },
    ],
  },
];

/* ── SVG DEFS ────────────────────────────────── */
function SVGDefs() {
  return (
    <defs>
      {ARROW_COLORS.map(color => (
        <marker
          key={color}
          id={`ar-${color.replace('#','')}`}
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3.5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0.5 L0,6.5 L7,3.5 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

/* ── PLAYER ──────────────────────────────────── */
const PLAYER_COLORS = {
  WR:'#a78bfa',
  TE:'#34d399',
  QB:'#fbbf24',
  RB:'#f87171',
  FB:'#fb923c',
  H:'#f472b6',
  OL:'#8b9ab5',
};

function Player({ x, y, t, large = false }) {
  const c = PLAYER_COLORS[t] || '#fff';
  const r = large ? 6.5 : 5;

  if (t === 'OL') {
    const s = large ? 10 : 8;
    return (
      <g>
        <rect
          x={x-s/2}
          y={y-s*0.45}
          width={s}
          height={s*0.9}
          fill={c}
          rx={1.5}
          opacity={0.9}
        />
        <rect
          x={x-s/2}
          y={y-s*0.45}
          width={s}
          height={s*0.9}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
          rx={1.5}
        />
      </g>
    );
  }

  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={c} opacity={0.92} />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={0.5}
      />
      {large && (
        <text
          x={x}
          y={y+1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={5.5}
          fill="#000"
          fontWeight="800"
          fontFamily="monospace"
        >
          {t}
        </text>
      )}
    </g>
  );
}

/* ── ROUTE ───────────────────────────────────── */
function Route({ d, c, w = 1.5, a = false, dsh = false }) {
  const markerEnd = a ? `url(#ar-${c.replace('#','')})` : undefined;
  return (
    <path
      d={d}
      fill="none"
      stroke={c}
      strokeWidth={w}
      strokeDasharray={dsh ? '5,3' : undefined}
      markerEnd={markerEnd}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.9}
    />
  );
}

/* ── FIELD SVG ───────────────────────────────── */
function PlayField({ play, large = false }) {
  const olX = [70, 80, 90, 100, 110];

  return (
    <svg viewBox="0 0 200 130" width="100%" style={{ display: 'block' }}>
      <SVGDefs />
      <rect width={200} height={130} fill="#0a0612" />

      {[20,40,60].map(y => (
        <line
          key={y}
          x1={0}
          y1={LOS-y}
          x2={200}
          y2={LOS-y}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.5}
          strokeDasharray="3,5"
        />
      ))}

      {[75,125].map(hx => (
        [30,40,50,60].map(hy => (
          <line
            key={`${hx}-${hy}`}
            x1={hx}
            y1={LOS-hy}
            x2={hx+5}
            y2={LOS-hy}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.4}
          />
        ))
      ))}

      <line
        x1={0}
        y1={LOS}
        x2={200}
        y2={LOS}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={0.8}
      />

      {play.rt.map((r, i) => <Route key={i} {...r} />)}
      {olX.map((x, i) => <Player key={i} x={x} y={LOS} t="OL" large={large} />)}
      {play.sk.map((p, i) => <Player key={i} x={p.x} y={p.y} t={p.t} large={large} />)}

      <ellipse
        cx={88}
        cy={LOS - 1}
        rx={3.5}
        ry={2.2}
        fill="#c97b2a"
        stroke="#f59e2e"
        strokeWidth={0.6}
      />
    </svg>
  );
}

/* ── LEGENDS ─────────────────────────────────── */
const LEGENDS = {
  run: [
    { c:CLR.run, l:'Ball Carrier' },
    { c:CLR.pull, l:'Pull' },
    { c:CLR.toss, l:'Toss/Pitch' },
    { c:CLR.motion, l:'Motion' },
    { c:CLR.block, l:'Block' },
  ],
  pass: [
    { c:CLR.pass, l:'Route' },
    { c:CLR.qbmove, l:'QB Action' },
    { c:CLR.protect, l:'Protection' },
  ],
};

/* ── PLAY CARD ───────────────────────────────── */
function PlayCard({ play, onClick }) {
  const meta = CAT_META[play.cat];
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: 'pointer',
        background: hov ? '#160d2e' : '#0f0920',
        border: `1px solid ${hov ? meta.accent + '55' : '#1c0f38'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'all 0.18s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 6px 24px ${meta.accent}28` : '0 2px 8px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <PlayField play={play} />
        <div style={{
          position: 'absolute',
          top: 6,
          right: 7,
          background: meta.accent + '22',
          border: `1px solid ${meta.accent}55`,
          borderRadius: 4,
          padding: '2px 5px',
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: '1.5px',
          color: meta.accent,
          fontFamily: 'monospace',
        }}>
          {meta.short}
        </div>
        <div style={{
          position: 'absolute',
          top: 6,
          left: 7,
          color: 'rgba(255,255,255,0.22)',
          fontSize: 9,
          fontWeight: 700,
          fontFamily: 'monospace',
        }}>
          {String(play.id).padStart(2,'0')}
        </div>
      </div>

      <div style={{
        padding: '6px 9px 8px',
        borderTop: `1px solid ${hov ? meta.accent + '35' : '#1c0f38'}`,
        background: hov ? meta.bg : 'transparent',
      }}>
        <div style={{
          color: '#ede8ff',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.3px',
          lineHeight: 1.3,
          fontFamily: "'Courier New', monospace",
        }}>
          {play.name}
        </div>
      </div>
    </div>
  );
}

/* ── MODAL ───────────────────────────────────── */
function PlayModal({ play, onClose }) {
  const meta = CAT_META[play.cat];

  useEffect(() => {
    const h = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4,0,12,0.9)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #130a26 0%, #080412 100%)',
          border: `1px solid ${meta.accent}45`,
          borderRadius: 18,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 440,
          boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${meta.accent}18`,
          animation: 'slideUp 0.2s ease',
        }}
      >
        <div style={{
          padding: '14px 16px 12px',
          background: `linear-gradient(90deg, ${meta.accent}14, transparent)`,
          borderBottom: `1px solid ${meta.accent}30`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{
                background: meta.accent,
                borderRadius: 4,
                padding: '2px 7px',
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '2px',
                color: '#000',
                fontFamily: 'monospace',
              }}>
                {meta.short}
              </div>
              <span style={{ color:'rgba(255,255,255,0.22)', fontSize:9, fontFamily:'monospace' }}>
                PLAY #{String(play.id).padStart(2,'0')}
              </span>
            </div>

            <div style={{
              color: '#ede8ff',
              fontSize: 20,
              fontWeight: 900,
              fontFamily: "'Courier New', monospace",
              letterSpacing: '-0.5px',
            }}>
              {play.name}
            </div>

            <div style={{ color: meta.accent, fontSize: 11, fontWeight: 500, opacity: 0.8, marginTop: 2 }}>
              {play.label}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)',
              width: 30,
              height: 30,
              borderRadius: 15,
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ background: '#060010', padding: '0 0 4px' }}>
          <PlayField play={play} large={true} />
        </div>

        <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${meta.accent}20` }}>
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.28)',
            marginBottom: 8,
            fontFamily: 'monospace',
          }}>
            LEGEND
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 14px', marginBottom:8 }}>
            {[
              ['WR','#a78bfa'],
              ['TE','#34d399'],
              ['QB','#fbbf24'],
              ['RB','#f87171'],
              ['FB','#fb923c'],
              ['OL','#8b9ab5'],
            ].map(([t,c]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:10, height:10, borderRadius: t==='OL'?2:5, background:c, opacity:0.85 }} />
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:9, fontFamily:'monospace' }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{ height:1, background:'rgba(255,255,255,0.06)', marginBottom:8 }} />

          <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 14px' }}>
            {(LEGENDS[play.cat] || []).map(({c,l}) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <svg width={18} height={6}>
                  <line x1={0} y1={3} x2={14} y2={3} stroke={c} strokeWidth={2.5} strokeLinecap="round" />
                  <polygon points="12,0.5 12,5.5 18,3" fill={c} />
                </svg>
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:9, fontFamily:'monospace' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── TABS ────────────────────────────────────── */
const CATS = [
  { id:'all',  label:'All 40',    accent:'#94a3b8' },
  { id:'run',  label:'Runs (25)', accent:'#ef4444' },
  { id:'pass', label:'Pass (15)', accent:'#a78bfa' },
];

/* ── APP ─────────────────────────────────────── */
export default function PowerGapPlaybook() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const displayed = filter === 'all' ? PLAYS : PLAYS.filter(p => p.cat === filter);

  return (
    <div style={{
      background: '#06020e',
      minHeight: '100vh',
      fontFamily: "'Courier New', monospace",
      maxWidth: 520,
      margin: '0 auto',
      position: 'relative',
    }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes cardIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:#06020e }
        ::-webkit-scrollbar-thumb { background:#28103c; border-radius:2px }
        * { box-sizing:border-box }
      `}</style>

      <div style={{
        background: 'linear-gradient(180deg, #120622 0%, #08011a 100%)',
        borderBottom: '1px solid #1c0f38',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(239,68,68,0.65))' }}>
            🏈
          </div>
          <div>
            <div style={{ color:'#ede8ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              POWER / GAP
            </div>
            <div style={{ color:'#ef4444', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              PHYSICALITY · PULLERS · PLAY-ACTION
            </div>
          </div>
          <div style={{ marginLeft:'auto', color:'rgba(255,255,255,0.18)', fontSize:10, letterSpacing:'1px' }}>
            {displayed.length} PLAYS
          </div>
        </div>

        <div style={{ display:'flex', gap:2, overflowX:'auto', scrollbarWidth:'none' }}>
          {CATS.map(cat => {
            const active = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                style={{
                  background: active ? cat.accent + '18' : 'transparent',
                  color: active ? cat.accent : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderBottom: active ? `2px solid ${cat.accent}` : '2px solid transparent',
                  padding: '7px 10px 9px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.5px',
                  fontFamily: "'Courier New', monospace",
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        padding: 10,
      }}>
        {displayed.map((play, idx) => (
          <div
            key={play.id}
            style={{
              animation: `cardIn 0.25s ease both`,
              animationDelay: `${idx * 0.03}s`,
            }}
          >
            <PlayCard play={play} onClick={() => setSelected(play)} />
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        padding: '12px 16px 20px',
        borderTop: '1px solid #120622',
        color: 'rgba(255,255,255,0.12)',
        fontSize: 9,
        letterSpacing: '2px',
      }}>
        POWER / GAP SYSTEM · 40 PLAYS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
