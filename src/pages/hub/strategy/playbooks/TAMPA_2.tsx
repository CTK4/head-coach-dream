import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  zone:    '#60a5fa',
  deep:    '#38bdf8',
  hook:    '#34d399',
  curl:    '#22c55e',
  flat:    '#fbbf24',
  blitz:   '#ef4444',
  stunt:   '#f97316',
  contain: '#f59e0b',
  sim:     '#a78bfa',
  robber:  '#f472b6',
  fit:     '#94a3b8',
};

const CAT_META = {
  base:   { label: 'Base Shells', short: 'BASE', accent: '#60a5fa', bg: '#60a5fa12' },
  front:  { label: 'Front / Fit', short: 'FRNT', accent: '#94a3b8', bg: '#94a3b812' },
  rush:   { label: 'Rush / Stunt', short: 'RUSH', accent: '#f97316', bg: '#f9731612' },
  fire:   { label: 'Fire Zone', short: 'FIRE', accent: '#ef4444', bg: '#ef444412' },
  sim:    { label: 'Sim Pressure', short: 'SIM',  accent: '#a78bfa', bg: '#a78bfa12' },
  sub:    { label: 'Subpackage', short: 'SUB',  accent: '#34d399', bg: '#34d39912' },
  red:    { label: 'Red Zone', short: 'RED',  accent: '#fbbf24', bg: '#fbbf2412' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* ── DEFENSIVE ALIGNMENTS ────────────────────── */
const FRONT_FOUR = [62, 82, 98, 118];
const FRONT_FIVE = [52, 72, 90, 108, 128];
const LBS_BASE = [{x:72,y:86,t:'LB'},{x:90,y:80,t:'LB'},{x:108,y:86,t:'LB'}];
const NICKEL_LBS = [{x:78,y:84,t:'LB'},{x:102,y:84,t:'LB'}];

const BASE_43 = [
  {x:18,y:54,t:'CB'},{x:52,y:64,t:'S'},{x:148,y:64,t:'S'},{x:182,y:54,t:'CB'},
  ...LBS_BASE,
];
const NICKEL_425 = [
  {x:18,y:54,t:'CB'},{x:42,y:72,t:'N'},{x:52,y:62,t:'S'},{x:148,y:62,t:'S'},{x:158,y:72,t:'N'},{x:182,y:54,t:'CB'},
  ...NICKEL_LBS,
];
const DIME = [
  {x:16,y:54,t:'CB'},{x:34,y:68,t:'CB'},{x:52,y:62,t:'S'},{x:148,y:62,t:'S'},{x:166,y:68,t:'CB'},{x:184,y:54,t:'CB'},
  {x:82,y:84,t:'LB'},
];
const GOALINE = [
  {x:24,y:58,t:'CB'},{x:176,y:58,t:'CB'},
  {x:60,y:82,t:'LB'},{x:80,y:78,t:'LB'},{x:100,y:78,t:'LB'},{x:120,y:82,t:'LB'},
  {x:90,y:60,t:'S'},
];

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#38bdf8','#34d399','#22c55e','#fbbf24',
  '#ef4444','#f97316','#f59e0b','#a78bfa','#f472b6','#94a3b8'
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ BASE SHELLS 1-10 ═══════════════════════ */
  {
    id:1, name:'Tampa2_Base', label:'Tampa 2 Base', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([62,LOS],[62,LOS-12]), c:CLR.fit,w:1.2,a:true},
      {d:P([82,LOS],[82,LOS-12]), c:CLR.fit,w:1.2,a:true},
      {d:P([98,LOS],[98,LOS-12]), c:CLR.fit,w:1.2,a:true},
      {d:P([118,LOS],[118,LOS-12]), c:CLR.fit,w:1.2,a:true},
    ],
  },
  {
    id:2, name:'Tampa2_Press', label:'Tampa 2 Press', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:60,t:'CB'},{x:52,y:64,t:'S'},{x:148,y:64,t:'S'},{x:182,y:60,t:'CB'},
      ...LBS_BASE
    ],
    rt:[
      {d:P([18,60],[18,28]), c:CLR.flat,w:2,a:true},
      {d:P([182,60],[182,28]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:3, name:'Tampa2_Off', label:'Tampa 2 Off', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:48,t:'CB'},{x:52,y:60,t:'S'},{x:148,y:60,t:'S'},{x:182,y:48,t:'CB'},
      ...LBS_BASE
    ],
    rt:[
      {d:P([18,48],[18,20]), c:CLR.flat,w:2,a:true},
      {d:P([182,48],[182,20]), c:CLR.flat,w:2,a:true},
      {d:P([52,60],[52,12]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,60],[148,12]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,58],[92,40],[94,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[68,56]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[112,56]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:4, name:'Tampa2_Cloud', label:'Tampa 2 Cloud', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:P([18,54],[12,30]), c:CLR.flat,w:2.2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[70,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([18,54],[18,66]), c:CLR.robber,w:1.2,a:false,dsh:true},
    ],
  },
  {
    id:5, name:'Tampa2_Invert', label:'Tampa 2 Invert', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:P([18,54],[18,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([182,54],[182,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([52,64],[42,30]), c:CLR.flat,w:2,a:true},
      {d:P([148,64],[158,30]), c:CLR.flat,w:2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[68,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[112,58]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:6, name:'Tampa2_Trap', label:'Tampa 2 Trap', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:QQ([18,54],[22,66],[38,70]), c:CLR.robber,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[68,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[112,58]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:7, name:'Tampa2_Sink', label:'Tampa 2 Sink', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:QQ([18,54],[14,42],[12,28]), c:CLR.flat,w:2,a:true},
      {d:QQ([182,54],[186,42],[188,28]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,20]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([72,86],[62,70],[58,52]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([108,86],[118,70],[122,52]), c:CLR.curl,w:1.8,a:true},
    ],
  },
  {
    id:8, name:'Tampa2_Match', label:'Tampa 2 Match', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,20]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([72,86],[60,66],[56,44]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([108,86],[120,66],[124,44]), c:CLR.curl,w:1.8,a:true},
      {d:P([18,54],[24,46]), c:CLR.fit,w:1.1,a:false,dsh:true},
      {d:P([182,54],[176,46]), c:CLR.fit,w:1.1,a:false,dsh:true},
    ],
  },
  {
    id:9, name:'Tampa2_SeamCarry', label:'Tampa 2 Seam Carry', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,20]), c:CLR.deep,w:2.2,a:true},
      {d:CB([72,86],[68,60],[66,42],[64,22]), c:CLR.hook,w:1.9,a:true},
      {d:CB([108,86],[112,60],[114,42],[116,22]), c:CLR.hook,w:1.9,a:true},
    ],
  },
  {
    id:10, name:'Tampa2_RobberChangeup', label:'Tampa 2 Robber Changeup', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([90,80],[92,68],[100,58]), c:CLR.robber,w:2,a:true},
      {d:P([72,86],[66,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.hook,w:1.8,a:true},
    ],
  },

  /* ═══ FRONT / RUN FIT VARIANTS 11-15 ═════════ */
  {
    id:11, name:'Over_Front', label:'Over Front', cat:'front',
    dl:[{x:58,y:LOS,t:'DL'},{x:76,y:LOS,t:'DL'},{x:98,y:LOS,t:'DL'},{x:120,y:LOS,t:'DL'}],
    sk:[...BASE_43],
    rt:[
      {d:P([58,LOS],[58,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([76,LOS],[76,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([98,LOS],[98,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([120,LOS],[120,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([72,86],[64,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([90,80],[92,24]), c:CLR.deep,w:2,a:true},
      {d:P([108,86],[116,58]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:12, name:'Under_Front', label:'Under Front', cat:'front',
    dl:[{x:62,y:LOS,t:'DL'},{x:84,y:LOS,t:'DL'},{x:104,y:LOS,t:'DL'},{x:124,y:LOS,t:'DL'}],
    sk:[...BASE_43],
    rt:[
      {d:P([62,LOS],[62,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([84,LOS],[84,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([104,LOS],[104,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([124,LOS],[124,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([90,80],[92,20]), c:CLR.deep,w:2,a:true},
    ],
  },
  {
    id:13, name:'Wide9_Front', label:'Wide 9 Front', cat:'front',
    dl:[{x:48,y:LOS,t:'DL'},{x:78,y:LOS,t:'DL'},{x:102,y:LOS,t:'DL'},{x:132,y:LOS,t:'DL'}],
    sk:[...BASE_43],
    rt:[
      {d:P([48,LOS],[40,LOS-12]), c:CLR.contain,w:1.7,a:true},
      {d:P([78,LOS],[78,LOS-12]), c:CLR.fit,w:1.4,a:true},
      {d:P([102,LOS],[102,LOS-12]), c:CLR.fit,w:1.4,a:true},
      {d:P([132,LOS],[140,LOS-12]), c:CLR.contain,w:1.7,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,20]), c:CLR.deep,w:2.2,a:true},
    ],
  },
  {
    id:14, name:'Bear_Changeup', label:'Bear Changeup', cat:'front',
    dl: FRONT_FIVE.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:54,t:'CB'},{x:52,y:64,t:'S'},{x:148,y:64,t:'S'},{x:182,y:54,t:'CB'},
      {x:74,y:86,t:'LB'},{x:106,y:86,t:'LB'}
    ],
    rt:[
      {d:P([52,LOS],[52,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([72,LOS],[72,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([90,LOS],[90,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([108,LOS],[108,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([128,LOS],[128,LOS-12]), c:CLR.fit,w:1.5,a:true},
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([74,86],[66,56]), c:CLR.hook,w:1.8,a:true},
      {d:P([106,86],[114,56]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:15, name:'GoalLine_53', label:'Goal Line 5-3', cat:'front',
    dl: FRONT_FIVE.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...GOALINE],
    rt:[
      {d:P([52,LOS],[52,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([72,LOS],[72,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([108,LOS],[108,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([128,LOS],[128,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([60,82],[56,58]), c:CLR.fit,w:1.5,a:true},
      {d:P([80,78],[78,54]), c:CLR.fit,w:1.5,a:true},
      {d:P([100,78],[102,54]), c:CLR.fit,w:1.5,a:true},
      {d:P([120,82],[124,58]), c:CLR.fit,w:1.5,a:true},
      {d:P([90,60],[90,28]), c:CLR.deep,w:2,a:true},
    ],
  },

  /* ═══ FOUR-MAN RUSH / STUNTS 16-20 ═══════════ */
  {
    id:16, name:'Base_Rush', label:'Base Rush', cat:'rush',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([42,72],[34,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([158,72],[166,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
    ],
  },
  {
    id:17, name:'TE_Twist', label:'T/E Twist', cat:'rush',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:CB([62,LOS],[64,LOS+8],[76,LOS+2],[88,LOS-12]), c:CLR.stunt,w:2,a:true},
      {d:CB([82,LOS],[78,LOS+8],[70,LOS+2],[66,LOS-12]), c:CLR.stunt,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
    ],
  },
  {
    id:18, name:'ET_Twist', label:'E/T Twist', cat:'rush',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:CB([98,LOS],[96,LOS+8],[84,LOS+2],[72,LOS-12]), c:CLR.stunt,w:2,a:true},
      {d:CB([118,LOS],[122,LOS+8],[130,LOS+2],[134,LOS-12]), c:CLR.stunt,w:2,a:true},
      {d:P([42,72],[34,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([158,72],[166,26]), c:CLR.flat,w:1.8,a:true},
    ],
  },
  {
    id:19, name:'Interior_Pirate', label:'Interior Pirate', cat:'rush',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:CB([82,LOS],[90,LOS+8],[98,LOS+2],[104,LOS-12]), c:CLR.stunt,w:2,a:true},
      {d:CB([98,LOS],[90,LOS+8],[82,LOS+2],[76,LOS-12]), c:CLR.stunt,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
    ],
  },
  {
    id:20, name:'DoubleEdge_Contain', label:'Double Edge Contain', cat:'rush',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([62,LOS],[52,LOS-14]), c:CLR.contain,w:2,a:true},
      {d:P([82,LOS],[84,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[96,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[128,LOS-14]), c:CLR.contain,w:2,a:true},
      {d:P([42,72],[34,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([158,72],[166,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([90,84],[92,20]), c:CLR.deep,w:2.2,a:true},
    ],
  },

  /* ═══ FIRE / PRESSURE PACKAGE 21-25 ══════════ */
  {
    id:21, name:'Sam_Fire', label:'Sam Fire', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:P([108,86],[124,56]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:22, name:'Mike_Plug', label:'Mike Plug', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:P([90,80],[90,50]), c:CLR.blitz,w:2.3,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([82,LOS],[84,76],[86,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:QQ([98,LOS],[96,76],[94,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
    ],
  },
  {
    id:23, name:'Nickel_Fire', label:'Nickel Fire', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([42,72],[34,36]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([158,72],[166,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,84],[74,56]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:24, name:'BoundaryCat_Tampa', label:'Boundary Cat Tampa', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:P([18,54],[24,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([90,80],[92,22]), c:CLR.deep,w:2.2,a:true},
    ],
  },
  {
    id:25, name:'CrossDog_Tampa', label:'Cross Dog Tampa', cat:'fire',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...BASE_43],
    rt:[
      {d:CB([72,86],[78,72],[86,56],[94,44]), c:CLR.blitz,w:2.2,a:true},
      {d:CB([108,86],[102,72],[94,56],[86,44]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,64],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,64],[148,14]), c:CLR.deep,w:2.2,a:true},
    ],
  },

  /* ═══ SIMULATED PRESSURE 26-30 ═══════════════ */
  {
    id:26, name:'Nickel_Sim', label:'Nickel Sim', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([42,72],[34,36]), c:CLR.sim,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:QQ([98,LOS],[94,76],[90,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([158,72],[166,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
    ],
  },
  {
    id:27, name:'MikeMug_Sim', label:'Mike Mug Sim', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([78,84],[84,54]), c:CLR.sim,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:QQ([82,LOS],[84,76],[86,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:QQ([98,LOS],[96,76],[94,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([42,72],[34,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([158,72],[166,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([90,84],[92,22]), c:CLR.deep,w:2.2,a:true},
    ],
  },
  {
    id:28, name:'Boundary_Creeper', label:'Boundary Creeper', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([182,54],[176,32]), c:CLR.sim,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:QQ([98,LOS],[94,76],[90,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([42,72],[34,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
    ],
  },
  {
    id:29, name:'TackleDrop_Sim', label:'Tackle Drop Sim', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([62,LOS],[60,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:QQ([98,LOS],[96,76],[92,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([42,72],[34,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([158,72],[166,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,84],[74,56]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:30, name:'EdgeReplace_Sim', label:'Edge Replace Sim', cat:'sim',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([42,72],[34,36]), c:CLR.sim,w:2.2,a:true},
      {d:QQ([62,LOS],[66,78],[70,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([158,72],[166,26]), c:CLR.flat,w:1.8,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([102,84],[108,56]), c:CLR.hook,w:1.8,a:true},
    ],
  },

  /* ═══ SUBPACKAGE / LONG YARDAGE 31-35 ════════ */
  {
    id:31, name:'Dime_Tampa', label:'Dime Tampa', cat:'sub',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...DIME],
    rt:[
      {d:P([16,54],[16,24]), c:CLR.flat,w:2,a:true},
      {d:P([184,54],[184,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([82,84],[84,60],[90,42],[94,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([34,68],[28,46]), c:CLR.curl,w:1.7,a:true},
      {d:P([166,68],[172,46]), c:CLR.curl,w:1.7,a:true},
    ],
  },
  {
    id:32, name:'Dime_2Man', label:'Dime 2-Man', cat:'sub',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...DIME],
    rt:[
      {d:P([16,54],[16,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([184,54],[184,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([34,68],[34,44]), c:CLR.robber,w:1.8,a:true},
      {d:P([166,68],[166,44]), c:CLR.robber,w:1.8,a:true},
      {d:P([82,84],[82,54]), c:CLR.robber,w:1.8,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
    ],
  },
  {
    id:33, name:'Dime_Drop8', label:'Dime Drop-8', cat:'sub',
    dl:[{x:76,y:LOS,t:'DL'},{x:98,y:LOS,t:'DL'},{x:118,y:LOS,t:'DL'}],
    sk:[...DIME],
    rt:[
      {d:P([16,54],[16,24]), c:CLR.flat,w:2,a:true},
      {d:P([184,54],[184,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([34,68],[28,46]), c:CLR.curl,w:1.7,a:true},
      {d:P([166,68],[172,46]), c:CLR.curl,w:1.7,a:true},
      {d:P([82,84],[82,56]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LOS],[126,76],[134,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([76,LOS],[76,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[118,LOS-12]), c:CLR.blitz,w:2,a:true},
    ],
  },
  {
    id:34, name:'ThirdLong_TampaMatch', label:'3rd Long Tampa Match', cat:'sub',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...DIME],
    rt:[
      {d:P([16,54],[16,24]), c:CLR.flat,w:2,a:true},
      {d:P([184,54],[184,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([82,84],[84,60],[90,42],[94,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([34,68],[24,50],[20,34]), c:CLR.curl,w:1.7,a:true},
      {d:QQ([166,68],[176,50],[180,34]), c:CLR.curl,w:1.7,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
    ],
  },
  {
    id:35, name:'Tampa_DoubleSlot', label:'Tampa Double Slot', cat:'sub',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...NICKEL_425],
    rt:[
      {d:P([42,72],[34,30]), c:CLR.curl,w:1.8,a:true},
      {d:P([158,72],[166,30]), c:CLR.curl,w:1.8,a:true},
      {d:P([18,54],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,54],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([52,62],[52,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,62],[148,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([78,84],[82,58],[90,40],[94,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([102,84],[108,56]), c:CLR.hook,w:1.8,a:true},
    ],
  },

  /* ═══ RED ZONE 36-40 ═════════════════════════ */
  {
    id:36, name:'Red_Tampa', label:'Red Tampa', cat:'red',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:60,t:'CB'},{x:52,y:68,t:'S'},{x:148,y:68,t:'S'},{x:182,y:60,t:'CB'},
      ...LBS_BASE
    ],
    rt:[
      {d:P([18,60],[18,38]), c:CLR.flat,w:2,a:true},
      {d:P([182,60],[182,38]), c:CLR.flat,w:2,a:true},
      {d:P([52,68],[52,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,68],[148,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([90,80],[92,34]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[66,58]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[114,58]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:37, name:'Red_Trap', label:'Red Trap', cat:'red',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:60,t:'CB'},{x:52,y:68,t:'S'},{x:148,y:68,t:'S'},{x:182,y:60,t:'CB'},
      ...LBS_BASE
    ],
    rt:[
      {d:QQ([18,60],[22,68],[36,70]), c:CLR.robber,w:2,a:true},
      {d:P([182,60],[182,36]), c:CLR.flat,w:2,a:true},
      {d:P([52,68],[52,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,68],[148,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([90,80],[92,36]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[68,60]), c:CLR.hook,w:1.8,a:true},
      {d:P([108,86],[112,60]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:38, name:'Red_Match', label:'Red Match', cat:'red',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:60,t:'CB'},{x:52,y:68,t:'S'},{x:148,y:68,t:'S'},{x:182,y:60,t:'CB'},
      ...LBS_BASE
    ],
    rt:[
      {d:P([18,60],[18,34]), c:CLR.flat,w:2,a:true},
      {d:P([182,60],[182,34]), c:CLR.flat,w:2,a:true},
      {d:P([52,68],[52,26]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,68],[148,26]), c:CLR.deep,w:2.2,a:true},
      {d:P([90,80],[92,32]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([72,86],[62,68],[58,50]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([108,86],[118,68],[122,50]), c:CLR.curl,w:1.8,a:true},
    ],
  },
  {
    id:39, name:'Red_Fire', label:'Red Fire', cat:'red',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:60,t:'CB'},{x:52,y:68,t:'S'},{x:148,y:68,t:'S'},{x:182,y:60,t:'CB'},
      ...LBS_BASE
    ],
    rt:[
      {d:P([108,86],[124,58]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.hook,w:1.7,a:true,dsh:true},
      {d:P([18,60],[18,36]), c:CLR.flat,w:2,a:true},
      {d:P([52,68],[52,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([148,68],[148,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([72,86],[68,60]), c:CLR.hook,w:1.8,a:true},
    ],
  },
  {
    id:40, name:'GoalLine_Tampa_Heavy', label:'Goal Line Tampa Heavy', cat:'red',
    dl: FRONT_FIVE.map(x => ({x,y:LOS,t:'DL'})),
    sk:[...GOALINE],
    rt:[
      {d:P([24,58],[24,34]), c:CLR.flat,w:2,a:true},
      {d:P([176,58],[176,34]), c:CLR.flat,w:2,a:true},
      {d:P([90,60],[90,26]), c:CLR.deep,w:2.2,a:true},
      {d:P([60,82],[56,58]), c:CLR.fit,w:1.5,a:true},
      {d:P([80,78],[78,54]), c:CLR.fit,w:1.5,a:true},
      {d:P([100,78],[102,54]), c:CLR.fit,w:1.5,a:true},
      {d:P([120,82],[124,58]), c:CLR.fit,w:1.5,a:true},
      {d:P([52,LOS],[52,LOS-10]), c:CLR.blitz,w:1.7,a:true},
      {d:P([72,LOS],[72,LOS-10]), c:CLR.blitz,w:1.7,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.blitz,w:1.7,a:true},
      {d:P([108,LOS],[108,LOS-10]), c:CLR.blitz,w:1.7,a:true},
      {d:P([128,LOS],[128,LOS-10]), c:CLR.blitz,w:1.7,a:true},
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
    {c:CLR.deep,l:'Deep Half / Pole'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.hook,l:'Hook / Seam'},
    {c:CLR.robber,l:'Robber / Trap'},
    {c:CLR.fit,l:'Rush / Fit'},
  ],
  front: [
    {c:CLR.fit,l:'Run Fit'},
    {c:CLR.contain,l:'Contain'},
    {c:CLR.deep,l:'Deep Help'},
  ],
  rush: [
    {c:CLR.blitz,l:'Rush Lane'},
    {c:CLR.stunt,l:'Stunt / Twist'},
    {c:CLR.contain,l:'Contain'},
    {c:CLR.deep,l:'Coverage'},
  ],
  fire: [
    {c:CLR.blitz,l:'Pressure'},
    {c:CLR.deep,l:'Deep'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.hook,l:'Hook / Drop'},
  ],
  sim: [
    {c:CLR.sim,l:'Sim Pressure'},
    {c:CLR.deep,l:'Deep'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.hook,l:'Dropper'},
  ],
  sub: [
    {c:CLR.deep,l:'Deep'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.curl,l:'Curl / Match'},
    {c:CLR.blitz,l:'Rush'},
    {c:CLR.robber,l:'Man Help'},
  ],
  red: [
    {c:CLR.deep,l:'Red Zone Deep'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.hook,l:'Inside Zone'},
    {c:CLR.blitz,l:'Pressure'},
    {c:CLR.fit,l:'Goal Line Fit'},
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
  { id:'all',   label:'All 40',      accent:'#94a3b8' },
  { id:'base',  label:'Base (10)',   accent:'#60a5fa' },
  { id:'front', label:'Front (5)',   accent:'#94a3b8' },
  { id:'rush',  label:'Rush (5)',    accent:'#f97316' },
  { id:'fire',  label:'Fire (5)',    accent:'#ef4444' },
  { id:'sim',   label:'Sim (5)',     accent:'#a78bfa' },
  { id:'sub',   label:'Sub (5)',     accent:'#34d399' },
  { id:'red',   label:'Red (5)',     accent:'#fbbf24' },
];

/* ── APP ─────────────────────────────────────── */
export default function Tampa2Playbook() {
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
              TAMPA 2
            </div>
            <div style={{ color:'#60a5fa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.85 }}>
              TWO-HIGH · MIKE RUNNER · ZONE DISCIPLINE
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
        TAMPA 2 SYSTEM · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
