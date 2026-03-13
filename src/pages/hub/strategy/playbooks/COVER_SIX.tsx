import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  quarter: '#60a5fa',
  half:    '#38bdf8',
  flat:    '#fbbf24',
  seam:    '#34d399',
  hook:    '#22c55e',
  match:   '#a78bfa',
  poach:   '#f472b6',
  blitz:   '#ef4444',
  stunt:   '#f97316',
  sim:     '#8b5cf6',
  fit:     '#94a3b8',
  contain: '#f59e0b',
};

const CAT_META = {
  base:   { label: 'Base Structure', short: 'BASE', accent: '#60a5fa', bg: '#60a5fa12' },
  trips:  { label: '3x1 Match',      short: '3x1',  accent: '#a78bfa', bg: '#a78bfa12' },
  front:  { label: 'Front Adj.',     short: 'FRNT', accent: '#94a3b8', bg: '#94a3b812' },
  sim:    { label: '4-Man / Sim',    short: 'SIM',  accent: '#8b5cf6', bg: '#8b5cf612' },
  fire:   { label: '5-Man Fire',     short: 'FIRE', accent: '#ef4444', bg: '#ef444412' },
  red:    { label: 'Red Zone',       short: 'RED',  accent: '#fbbf24', bg: '#fbbf2412' },
  third:  { label: '3rd Down',       short: '3RD',  accent: '#34d399', bg: '#34d39912' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* ── DEFENSIVE ALIGNMENTS ────────────────────── */
const FRONT_FOUR = [62, 82, 98, 118];
const FRONT_FIVE = [52, 72, 90, 108, 128];

const BASE_TWOHIGH = [
  {x:18,y:56,t:'CB'},
  {x:54,y:64,t:'S'},
  {x:148,y:64,t:'S'},
  {x:182,y:56,t:'CB'},
  {x:72,y:86,t:'LB'},
  {x:90,y:82,t:'LB'},
  {x:108,y:86,t:'LB'},
];

const NICKEL = [
  {x:18,y:56,t:'CB'},
  {x:42,y:72,t:'N'},
  {x:54,y:64,t:'S'},
  {x:148,y:64,t:'S'},
  {x:158,y:72,t:'N'},
  {x:182,y:56,t:'CB'},
  {x:78,y:86,t:'LB'},
  {x:102,y:86,t:'LB'},
];

const DIME = [
  {x:16,y:56,t:'CB'},
  {x:34,y:70,t:'CB'},
  {x:54,y:64,t:'S'},
  {x:148,y:64,t:'S'},
  {x:166,y:70,t:'CB'},
  {x:184,y:56,t:'CB'},
  {x:82,y:86,t:'LB'},
];

const RED = [
  {x:18,y:60,t:'CB'},
  {x:54,y:70,t:'S'},
  {x:148,y:70,t:'S'},
  {x:182,y:60,t:'CB'},
  {x:72,y:88,t:'LB'},
  {x:90,y:84,t:'LB'},
  {x:108,y:88,t:'LB'},
];

const GOAL = [
  {x:24,y:60,t:'CB'},
  {x:176,y:60,t:'CB'},
  {x:60,y:84,t:'LB'},
  {x:80,y:80,t:'LB'},
  {x:100,y:80,t:'LB'},
  {x:120,y:84,t:'LB'},
  {x:90,y:64,t:'S'},
];

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#38bdf8','#fbbf24','#34d399','#22c55e',
  '#a78bfa','#f472b6','#ef4444','#f97316','#8b5cf6','#94a3b8','#f59e0b',
];

/* ── PLAY DATA ───────────────────────────────── */
const PLAYS = [
  /* ═══ BASE STRUCTURE 1-10 ════════════════════ */
  {
    id:1, name:'C6_Base', label:'C6 Base', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:CB([54,64],[50,50],[44,40],[40,28]), c:CLR.flat,w:2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([62,LOS],[60,LOS-12]), c:CLR.fit,w:1.2,a:true},
      {d:P([82,LOS],[82,LOS-12]), c:CLR.fit,w:1.2,a:true},
      {d:P([98,LOS],[98,LOS-12]), c:CLR.fit,w:1.2,a:true},
      {d:P([118,LOS],[120,LOS-12]), c:CLR.fit,w:1.2,a:true},
    ],
  },
  {
    id:2, name:'C6_Flip', label:'C6 Flip', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:P([18,56],[18,20]), c:CLR.half,w:2.2,a:true},
      {d:CB([182,56],[182,36],[180,24],[176,14]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([54,64],[48,48],[42,34],[38,22]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[152,50],[158,40],[162,28]), c:CLR.flat,w:2,a:true},
      {d:P([72,86],[66,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:3, name:'C6_Press', label:'C6 Press', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:62,t:'CB'},{x:54,y:64,t:'S'},{x:148,y:64,t:'S'},{x:182,y:62,t:'CB'},
      {x:72,y:86,t:'LB'},{x:90,y:82,t:'LB'},{x:108,y:86,t:'LB'},
    ],
    rt:[
      {d:CB([18,62],[18,40],[20,26],[24,16]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,62],[182,22]), c:CLR.half,w:2.2,a:true},
      {d:CB([54,64],[50,50],[44,40],[40,28]), c:CLR.flat,w:2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:4, name:'C6_Off', label:'C6 Off', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:48,t:'CB'},{x:54,y:60,t:'S'},{x:148,y:60,t:'S'},{x:182,y:48,t:'CB'},
      {x:72,y:86,t:'LB'},{x:90,y:82,t:'LB'},{x:108,y:86,t:'LB'},
    ],
    rt:[
      {d:CB([18,48],[18,32],[20,22],[24,12]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,48],[182,18]), c:CLR.half,w:2.2,a:true},
      {d:CB([54,60],[50,46],[44,36],[40,26]), c:CLR.flat,w:2,a:true},
      {d:CB([148,60],[150,44],[156,30],[162,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,86],[68,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,50]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[112,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:5, name:'C6_Cloud', label:'C6 Cloud', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:QQ([18,56],[14,44],[12,30]), c:CLR.flat,w:2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:6, name:'C6_Trap', label:'C6 Trap', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:QQ([18,56],[24,66],[38,70]), c:CLR.poach,w:2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:7, name:'C6_Lock', label:'C6 Lock', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:P([18,56],[18,16]), c:CLR.match,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([18,56],[18,66]), c:CLR.fit,w:1.1,a:false,dsh:true},
    ],
  },
  {
    id:8, name:'C6_MEG', label:'C6 MEG', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:P([18,56],[18,14]), c:CLR.match,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([54,64],[46,42]), c:CLR.fit,w:1.1,a:false,dsh:true},
    ],
  },
  {
    id:9, name:'C6_MOD', label:'C6 MOD', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:QQ([18,56],[20,40],[28,26]), c:CLR.match,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,86],[68,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[112,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:10, name:'C6_Poach', label:'C6 Poach', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:QQ([148,64],[132,58],[118,46]), c:CLR.poach,w:2,a:true},
      {d:P([72,86],[66,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },

  /* ═══ MATCH VARIANTS VS 3x1 11-15 ════════════ */
  {
    id:11, name:'C6_Special', label:'C6 Special', cat:'trips',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([18,56],[18,18]), c:CLR.match,w:2.2,a:true},
      {d:P([182,56],[182,22]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:QQ([148,64],[138,54],[126,40]), c:CLR.poach,w:2,a:true},
      {d:P([42,72],[34,42]), c:CLR.match,w:1.8,a:true},
      {d:P([78,86],[72,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([102,86],[110,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:12, name:'C6_Solo', label:'C6 Solo', cat:'trips',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([18,56],[18,16]), c:CLR.match,w:2.2,a:true},
      {d:P([182,56],[182,22]), c:CLR.half,w:2.2,a:true},
      {d:QQ([54,64],[66,54],[78,40]), c:CLR.poach,w:2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([42,72],[34,42]), c:CLR.match,w:1.8,a:true},
      {d:P([78,86],[72,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([102,86],[110,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:13, name:'C6_Stubbie', label:'C6 Stubbie', cat:'trips',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([18,56],[18,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,22]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[146,50],[142,38],[136,26]), c:CLR.match,w:2.1,a:true},
      {d:P([42,72],[48,46]), c:CLR.match,w:1.8,a:true},
      {d:P([78,86],[72,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([102,86],[110,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:14, name:'C6_Stress', label:'C6 Stress', cat:'trips',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([18,56],[18,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,22]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:QQ([148,64],[134,60],[120,48]), c:CLR.poach,w:2,a:true},
      {d:P([42,72],[34,30]), c:CLR.match,w:1.8,a:true},
      {d:P([78,86],[74,56]), c:CLR.hook,w:1.8,a:true},
      {d:P([102,86],[110,56]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:15, name:'C6_Box', label:'C6 Box', cat:'trips',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([18,56],[18,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,22]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([148,64],[142,40]), c:CLR.match,w:2,a:true},
      {d:P([42,72],[48,44]), c:CLR.match,w:1.8,a:true},
      {d:P([78,86],[72,60]), c:CLR.hook,w:1.8,a:true},
      {d:P([102,86],[108,60]), c:CLR.hook,w:1.8,a:true},
    ],
  },

  /* ═══ FRONT ADJUSTMENTS 16-20 ════════════════ */
  {
    id:16, name:'C6_Over_Front', label:'C6 Over Front', cat:'front',
    dl:[{x:58,y:LOS,t:'DL'},{x:76,y:LOS,t:'DL'},{x:98,y:LOS,t:'DL'},{x:120,y:LOS,t:'DL'}],
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:P([58,LOS],[58,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([76,LOS],[76,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([98,LOS],[98,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([120,LOS],[120,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([90,82],[92,52]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:17, name:'C6_Under_Front', label:'C6 Under Front', cat:'front',
    dl:[{x:62,y:LOS,t:'DL'},{x:84,y:LOS,t:'DL'},{x:104,y:LOS,t:'DL'},{x:124,y:LOS,t:'DL'}],
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:P([62,LOS],[62,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([84,LOS],[84,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([104,LOS],[104,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([124,LOS],[124,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:18, name:'C6_Wide9_Edge', label:'C6 Wide 9 Edge', cat:'front',
    dl:[{x:48,y:LOS,t:'DL'},{x:78,y:LOS,t:'DL'},{x:102,y:LOS,t:'DL'},{x:132,y:LOS,t:'DL'}],
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:P([48,LOS],[40,LOS-12]), c:CLR.contain,w:1.7,a:true},
      {d:P([78,LOS],[78,LOS-12]), c:CLR.fit,w:1.4,a:true},
      {d:P([102,LOS],[102,LOS-12]), c:CLR.fit,w:1.4,a:true},
      {d:P([132,LOS],[140,LOS-12]), c:CLR.contain,w:1.7,a:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },
  {
    id:19, name:'C6_Bear', label:'C6 Bear', cat:'front',
    dl: FRONT_FIVE.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:56,t:'CB'},{x:54,y:64,t:'S'},{x:148,y:64,t:'S'},{x:182,y:56,t:'CB'},
      {x:74,y:86,t:'LB'},{x:106,y:86,t:'LB'}
    ],
    rt:[
      {d:P([52,LOS],[52,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([72,LOS],[72,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([90,LOS],[90,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([108,LOS],[108,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([128,LOS],[128,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([74,86],[68,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:20, name:'C6_Mint', label:'C6 Mint', cat:'front',
    dl:[{x:68,y:LOS,t:'DL'},{x:90,y:LOS,t:'DL'},{x:112,y:LOS,t:'DL'}],
    sk:[...NICKEL],
    rt:[
      {d:P([68,LOS],[66,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([90,LOS],[90,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([112,LOS],[114,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([78,86],[72,58]), c:CLR.seam,w:1.8,a:true},
      {d:P([102,86],[108,58]), c:CLR.seam,w:1.8,a:true},
    ],
  },

  /* ═══ 4-MAN RUSH + SIM PRESSURE 21-25 ════════ */
  {
    id:21, name:'C6_Creeper_Strong', label:'C6 Creeper Strong', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([102,86],[118,56]), c:CLR.sim,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:QQ([98,LOS],[94,76],[90,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },
  {
    id:22, name:'C6_Creeper_Weak', label:'C6 Creeper Weak', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([78,86],[62,56]), c:CLR.sim,w:2.2,a:true},
      {d:QQ([62,LOS],[66,78],[70,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },
  {
    id:23, name:'C6_Nickel_Sim', label:'C6 Nickel Sim', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([42,72],[34,36]), c:CLR.sim,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:QQ([98,LOS],[94,76],[90,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },
  {
    id:24, name:'C6_Mike_Sim', label:'C6 Mike Sim', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([78,86],[88,54]), c:CLR.sim,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:QQ([82,LOS],[84,76],[86,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:QQ([98,LOS],[96,76],[94,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },
  {
    id:25, name:'C6_Edge_Sim', label:'C6 Edge Sim', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([158,72],[166,34]), c:CLR.sim,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:QQ([98,LOS],[94,76],[90,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },

  /* ═══ 5-MAN PRESSURE TAGS 26-30 ══════════════ */
  {
    id:26, name:'C6_Sam_Fire', label:'C6 Sam Fire', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:P([108,86],[124,56]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },
  {
    id:27, name:'C6_Will_Fire', label:'C6 Will Fire', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:P([72,86],[56,56]), c:CLR.blitz,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([62,LOS],[66,78],[70,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },
  {
    id:28, name:'C6_Nickel_Fire', label:'C6 Nickel Fire', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL],
    rt:[
      {d:P([42,72],[34,36]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },
  {
    id:29, name:'C6_Boundary_Cat', label:'C6 Boundary Cat', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:P([18,56],[24,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },
  {
    id:30, name:'C6_Cross_Dog', label:'C6 Cross Dog', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_TWOHIGH],
    rt:[
      {d:CB([72,86],[78,72],[86,56],[94,44]), c:CLR.blitz,w:2.2,a:true},
      {d:CB([108,86],[102,72],[94,56],[86,44]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:CB([18,56],[18,36],[20,24],[24,14]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,56],[182,20]), c:CLR.half,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.quarter,w:2.2,a:true},
    ],
  },

  /* ═══ RED ZONE PACKAGE 31-35 ═════════════════ */
  {
    id:31, name:'C6_Red', label:'C6 Red', cat:'red',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...RED],
    rt:[
      {d:CB([18,60],[18,42],[20,32],[24,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,60],[182,34]), c:CLR.half,w:2.2,a:true},
      {d:P([54,70],[54,28]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,70],[150,54],[156,42],[162,30]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,88],[68,62]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,84],[92,56]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,88],[112,62]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:32, name:'C6_Red_Trap', label:'C6 Red Trap', cat:'red',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...RED],
    rt:[
      {d:QQ([18,60],[24,68],[36,70]), c:CLR.poach,w:2,a:true},
      {d:P([182,60],[182,34]), c:CLR.half,w:2.2,a:true},
      {d:P([54,70],[54,28]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,70],[150,54],[156,42],[162,30]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,88],[68,62]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,84],[92,56]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,88],[112,62]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:33, name:'C6_Red_Lock', label:'C6 Red Lock', cat:'red',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...RED],
    rt:[
      {d:P([18,60],[18,20]), c:CLR.match,w:2.2,a:true},
      {d:P([182,60],[182,34]), c:CLR.half,w:2.2,a:true},
      {d:P([54,70],[54,28]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,70],[150,54],[156,42],[162,30]), c:CLR.quarter,w:2.2,a:true},
      {d:P([72,88],[68,62]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,84],[92,56]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,88],[112,62]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:34, name:'C6_Red_Poach', label:'C6 Red Poach', cat:'red',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...RED],
    rt:[
      {d:CB([18,60],[18,42],[20,32],[24,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,60],[182,34]), c:CLR.half,w:2.2,a:true},
      {d:P([54,70],[54,28]), c:CLR.quarter,w:2.2,a:true},
      {d:QQ([148,70],[136,60],[122,50]), c:CLR.poach,w:2,a:true},
      {d:P([72,88],[68,62]), c:CLR.seam,w:1.8,a:true},
      {d:P([90,84],[92,56]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,88],[112,62]), c:CLR.seam,w:1.8,a:true},
    ],
  },
  {
    id:35, name:'C6_Red_Pressure', label:'C6 Red Pressure', cat:'red',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...RED],
    rt:[
      {d:P([108,88],[124,60]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:CB([18,60],[18,42],[20,32],[24,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([182,60],[182,34]), c:CLR.half,w:2.2,a:true},
      {d:P([54,70],[54,28]), c:CLR.quarter,w:2.2,a:true},
    ],
  },

  /* ═══ 3RD DOWN VARIANTS 36-40 ════════════════ */
  {
    id:36, name:'C6_3L', label:'C6 3L', cat:'third',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...DIME],
    rt:[
      {d:CB([16,56],[16,38],[18,28],[22,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([184,56],[184,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([34,70],[28,46]), c:CLR.match,w:1.8,a:true},
      {d:P([166,70],[172,46]), c:CLR.match,w:1.8,a:true},
      {d:P([82,86],[82,56]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:37, name:'C6_3M', label:'C6 3M', cat:'third',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...DIME],
    rt:[
      {d:P([16,56],[16,18]), c:CLR.match,w:2.2,a:true},
      {d:P([184,56],[184,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([34,70],[28,42]), c:CLR.match,w:1.8,a:true},
      {d:P([166,70],[172,42]), c:CLR.match,w:1.8,a:true},
      {d:P([82,86],[82,56]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:38, name:'C6_Drop8', label:'C6 Drop-8', cat:'third',
    dl:[{x:76,y:LOS,t:'DL'},{x:98,y:LOS,t:'DL'},{x:118,y:LOS,t:'DL'}],
    sk:[...DIME],
    rt:[
      {d:CB([16,56],[16,38],[18,28],[22,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([184,56],[184,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([34,70],[28,46]), c:CLR.curl,w:1.7,a:true},
      {d:P([166,70],[172,46]), c:CLR.curl,w:1.7,a:true},
      {d:P([82,86],[82,56]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LOS],[126,76],[134,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([76,LOS],[76,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[118,LOS-12]), c:CLR.blitz,w:2,a:true},
    ],
  },
  {
    id:39, name:'C6_2Man_Swap', label:'C6 2-Man Swap', cat:'third',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...DIME],
    rt:[
      {d:P([16,56],[16,18]), c:CLR.match,w:2.2,a:true},
      {d:P([184,56],[184,18]), c:CLR.match,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([34,70],[34,42]), c:CLR.poach,w:1.8,a:true},
      {d:P([166,70],[166,42]), c:CLR.poach,w:1.8,a:true},
      {d:P([82,86],[82,56]), c:CLR.poach,w:1.8,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
    ],
  },
  {
    id:40, name:'C6_Double', label:'C6 Double', cat:'third',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...DIME],
    rt:[
      {d:CB([16,56],[16,38],[18,28],[22,18]), c:CLR.quarter,w:2.2,a:true},
      {d:P([184,56],[184,20]), c:CLR.half,w:2.2,a:true},
      {d:P([54,64],[54,18]), c:CLR.quarter,w:2.2,a:true},
      {d:CB([148,64],[150,48],[156,34],[162,22]), c:CLR.quarter,w:2.2,a:true},
      {d:P([34,70],[26,46]), c:CLR.poach,w:1.8,a:true},
      {d:P([166,70],[174,46]), c:CLR.poach,w:1.8,a:true},
      {d:P([82,86],[82,56]), c:CLR.hook,w:1.8,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
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
  CB:'#60a5fa',
  S:'#38bdf8',
  N:'#06b6d4',
  LB:'#34d399',
  DL:'#f97316',
};

function Player({ x, y, t, large = false }) {
  const c = PLAYER_COLORS[t] || '#fff';
  const r = large ? 6.5 : 5;

  if (t === 'DL') {
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
          opacity={0.92}
        />
        <rect
          x={x-s/2}
          y={y-s*0.45}
          width={s}
          height={s*0.9}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
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
          fill="#001018"
          fontWeight="800"
          fontFamily="monospace"
        >
          {t}
        </text>
      )}
    </g>
  );
}

/* ── ROUTE / RESPONSIBILITY ──────────────────── */
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
      opacity={0.92}
    />
  );
}

/* ── FIELD SVG ───────────────────────────────── */
function PlayField({ play, large = false }) {
  const losY = LOS;

  return (
    <svg viewBox="0 0 200 130" width="100%" style={{ display: 'block' }}>
      <SVGDefs />
      <rect width={200} height={130} fill="#07111a" />

      {[20,40,60].map(y => (
        <line
          key={y}
          x1={0}
          y1={losY-y}
          x2={200}
          y2={losY-y}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.5}
          strokeDasharray="3,5"
        />
      ))}

      {[75,125].map(hx => (
        [20,30,40,50,60].map(hy => (
          <line
            key={`${hx}-${hy}`}
            x1={hx}
            y1={losY-hy}
            x2={hx+5}
            y2={losY-hy}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.4}
          />
        ))
      ))}

      <line
        x1={0}
        y1={losY}
        x2={200}
        y2={losY}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={0.8}
      />

      {play.rt.map((r, i) => <Route key={i} {...r} />)}
      {(play.dl || []).map((p, i) => <Player key={`dl-${i}`} x={p.x} y={p.y} t={p.t} large={large} />)}
      {(play.sk || []).map((p, i) => <Player key={`sk-${i}`} x={p.x} y={p.y} t={p.t} large={large} />)}

      <ellipse
        cx={90}
        cy={losY - 1}
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
  base: [
    {c:CLR.quarter,l:'Quarter'},
    {c:CLR.half,l:'Half'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.seam,l:'Seam / Curl'},
    {c:CLR.poach,l:'Poach / Trap'},
  ],
  trips: [
    {c:CLR.match,l:'Match'},
    {c:CLR.quarter,l:'Quarter'},
    {c:CLR.half,l:'Half'},
    {c:CLR.poach,l:'Poach / Special'},
    {c:CLR.seam,l:'Seam Help'},
  ],
  front: [
    {c:CLR.fit,l:'Run Fit'},
    {c:CLR.contain,l:'Contain'},
    {c:CLR.quarter,l:'Quarter'},
    {c:CLR.half,l:'Half'},
  ],
  sim: [
    {c:CLR.sim,l:'Sim Pressure'},
    {c:CLR.hook,l:'Dropper'},
    {c:CLR.quarter,l:'Quarter'},
    {c:CLR.half,l:'Half'},
  ],
  fire: [
    {c:CLR.blitz,l:'Pressure'},
    {c:CLR.hook,l:'Dropper'},
    {c:CLR.quarter,l:'Quarter'},
    {c:CLR.half,l:'Half'},
  ],
  red: [
    {c:CLR.quarter,l:'Quarter'},
    {c:CLR.half,l:'Half'},
    {c:CLR.seam,l:'Inside Help'},
    {c:CLR.poach,l:'Trap / Poach'},
    {c:CLR.blitz,l:'Pressure'},
  ],
  third: [
    {c:CLR.match,l:'Match / Man'},
    {c:CLR.quarter,l:'Quarter'},
    {c:CLR.half,l:'Half'},
    {c:CLR.poach,l:'Bracket / Double'},
    {c:CLR.blitz,l:'Rush'},
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
        background: hov ? '#112031' : '#0a1522',
        border: `1px solid ${hov ? meta.accent + '55' : '#152536'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'all 0.18s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 6px 24px ${meta.accent}24` : '0 2px 8px rgba(0,0,0,0.45)',
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
        borderTop: `1px solid ${hov ? meta.accent + '35' : '#152536'}`,
        background: hov ? meta.bg : 'transparent',
      }}>
        <div style={{
          color: '#e7f4ff',
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
        background: 'rgba(3,8,14,0.9)',
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
          background: 'linear-gradient(160deg, #102030 0%, #08111a 100%)',
          border: `1px solid ${meta.accent}45`,
          borderRadius: 18,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 440,
          boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${meta.accent}14`,
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
                color: '#001018',
                fontFamily: 'monospace',
              }}>
                {meta.short}
              </div>
              <span style={{ color:'rgba(255,255,255,0.22)', fontSize:9, fontFamily:'monospace' }}>
                PLAY #{String(play.id).padStart(2,'0')}
              </span>
            </div>

            <div style={{
              color: '#e7f4ff',
              fontSize: 20,
              fontWeight: 900,
              fontFamily: "'Courier New', monospace",
              letterSpacing: '-0.5px',
            }}>
              {play.name}
            </div>

            <div style={{ color: meta.accent, fontSize: 11, fontWeight: 500, opacity: 0.85, marginTop: 2 }}>
              {play.label}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.55)',
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

        <div style={{ background: '#060d14', padding: '0 0 4px' }}>
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
              ['CB','#60a5fa'],
              ['S','#38bdf8'],
              ['N','#06b6d4'],
              ['LB','#34d399'],
              ['DL','#f97316'],
            ].map(([t,c]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:10, height:10, borderRadius: t==='DL'?2:5, background:c, opacity:0.9 }} />
                <span style={{ color:'rgba(255,255,255,0.45)', fontSize:9, fontFamily:'monospace' }}>{t}</span>
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
                <span style={{ color:'rgba(255,255,255,0.45)', fontSize:9, fontFamily:'monospace' }}>{l}</span>
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
  { id:'all',   label:'All 40',       accent:'#94a3b8' },
  { id:'base',  label:'Base (10)',    accent:'#60a5fa' },
  { id:'trips', label:'3x1 (5)',      accent:'#a78bfa' },
  { id:'front', label:'Front (5)',    accent:'#94a3b8' },
  { id:'sim',   label:'Sim (5)',      accent:'#8b5cf6' },
  { id:'fire',  label:'Fire (5)',     accent:'#ef4444' },
  { id:'red',   label:'Red (5)',      accent:'#fbbf24' },
  { id:'third', label:'3rd (5)',      accent:'#34d399' },
];

/* ── APP ─────────────────────────────────────── */
export default function Cover6Playbook() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const displayed = filter === 'all' ? PLAYS : PLAYS.filter(p => p.cat === filter);

  return (
    <div style={{
      background: '#050c12',
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
        ::-webkit-scrollbar-track { background:#050c12 }
        ::-webkit-scrollbar-thumb { background:#1e3a52; border-radius:2px }
        * { box-sizing:border-box }
      `}</style>

      <div style={{
        background: 'linear-gradient(180deg, #0d1926 0%, #08111a 100%)',
        borderBottom: '1px solid #152536',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(96,165,250,0.7))' }}>
            🛡️
          </div>
          <div>
            <div style={{ color:'#e7f4ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              COVER 6
            </div>
            <div style={{ color:'#60a5fa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.85 }}>
              QUARTERS / HALVES · SPLIT-FIELD · MATCH
            </div>
          </div>
          <div style={{ marginLeft:'auto', color:'rgba(255,255,255,0.18)', fontSize:10, letterSpacing:'1px' }}>
            {displayed.length} CALLS
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
                  color: active ? cat.accent : 'rgba(255,255,255,0.34)',
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
        borderTop: '1px solid #0d1926',
        color: 'rgba(255,255,255,0.12)',
        fontSize: 9,
        letterSpacing: '2px',
      }}>
        COVER 6 SYSTEM · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
