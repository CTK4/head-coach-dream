import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  zone:      '#60a5fa',
  deep:      '#a78bfa',
  flat:      '#fb923c',
  hook:      '#34d399',
  curl:      '#fbbf24',
  man:       '#f472b6',
  rob:       '#22c55e',
  blitz:     '#ef4444',
  sim:       '#f87171',
  rush:      '#64748b',
  stunt:     '#94a3b8',
  drop:      '#38bdf8',
  bracket:   '#e879f9',
  spy:       '#10b981',
  press:     '#facc15',
};

const CAT_META = {
  shell: { label: 'Shell',      short: 'SHELL', accent: '#60a5fa', bg: '#60a5fa12' },
  odd:   { label: 'Odd Front',  short: 'ODD',   accent: '#94a3b8', bg: '#94a3b812' },
  sim:   { label: 'Sim',        short: 'SIM',   accent: '#f87171', bg: '#f8717112' },
  press: { label: 'Pressure',   short: 'HEAT',  accent: '#ef4444', bg: '#ef444412' },
  drop8: { label: 'Drop-8',     short: 'DROP',  accent: '#a78bfa', bg: '#a78bfa12' },
  situ:  { label: 'Situational',short: 'SIT',   accent: '#fb923c', bg: '#fb923c12' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* ── ALIGNMENT HELPERS ───────────────────────── */
const C_Y = LOS + 6;
const LB_Y = LOS + 14;
const S_Y  = LOS + 30;
const DL_Y = LOS;
const BALL_X = 100;

const CHAOS_BASE = [
  { x: 30,  y: C_Y,  t: 'CB' },
  { x: 64,  y: LB_Y, t: 'LB' },
  { x: 88,  y: LB_Y, t: 'LB' },
  { x: 118, y: LB_Y, t: 'NB' },
  { x: 170, y: C_Y,  t: 'CB' },
  { x: 78,  y: S_Y,  t: 'S' },
  { x: 122, y: S_Y,  t: 'S' },
];

const STACK_335 = [
  { x: 30,  y: C_Y,  t: 'CB' },
  { x: 70,  y: LB_Y, t: 'LB' },
  { x: 88,  y: LB_Y+2, t: 'LB' },
  { x: 106, y: LB_Y, t: 'LB' },
  { x: 170, y: C_Y,  t: 'CB' },
  { x: 60,  y: S_Y,  t: 'S' },
  { x: 100, y: S_Y,  t: 'S' },
  { x: 140, y: S_Y,  t: 'NB' },
];

const DIME_DEF = [
  { x: 26,  y: C_Y,    t: 'CB' },
  { x: 52,  y: LB_Y,   t: 'DB' },
  { x: 82,  y: LB_Y,   t: 'LB' },
  { x: 118, y: LB_Y,   t: 'DB' },
  { x: 146, y: LB_Y,   t: 'DB' },
  { x: 174, y: C_Y,    t: 'CB' },
  { x: 78,  y: S_Y+2,  t: 'S' },
  { x: 122, y: S_Y+2,  t: 'S' },
];

const RED_DEF = [
  { x: 34,  y: C_Y,    t: 'CB' },
  { x: 68,  y: LB_Y-2, t: 'LB' },
  { x: 88,  y: LB_Y-2, t: 'LB' },
  { x: 112, y: LB_Y-2, t: 'NB' },
  { x: 166, y: C_Y,    t: 'CB' },
  { x: 82,  y: S_Y-6,  t: 'S' },
  { x: 118, y: S_Y-6,  t: 'S' },
];

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#a78bfa','#fb923c','#34d399','#fbbf24',
  '#f472b6','#22c55e','#ef4444','#f87171','#64748b',
  '#94a3b8','#38bdf8','#e879f9','#10b981','#facc15',
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ BASE DISGUISE SHELLS 1-10 ══════════════ */
  {
    id:1, name:'Chaos_C2_Shell', label:'Chaos C2 Shell', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([78,S_Y],[64,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[136,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([30,C_Y],[30,44]), c:CLR.flat,w:2,a:true},
      {d:P([170,C_Y],[170,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:2, name:'Chaos_C3_Spin', label:'Chaos C3 Spin', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.rob,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:3, name:'Chaos_Quarters_Rotate', label:'Chaos Quarters Rotate', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,22]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,22]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:4, name:'Chaos_C6_Spin', label:'Chaos C6 Spin', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,44]), c:CLR.flat,w:2,a:true},
      {d:P([78,S_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:5, name:'Chaos_C1_LateRoll', label:'Chaos C1 Late Roll', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([78,S_Y],[100,14]), c:CLR.deep,w:2.3,a:true},
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2.0,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2.0,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.rob,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.man,w:1.8,a:true},
      {d:QQ([122,S_Y],[116,56],[108,46]), c:CLR.rob,w:2,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:6, name:'Chaos_Robber_Spin', label:'Chaos Robber Spin', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[114,58],[104,46]), c:CLR.rob,w:2.1,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.man,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:7, name:'Chaos_Cloud_Trap', label:'Chaos Cloud Trap', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,42]), c:CLR.flat,w:2,a:true},
      {d:P([78,S_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.rob,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:8, name:'Chaos_Drop_Safety', label:'Chaos Drop Safety', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[74,54],[70,46]), c:CLR.drop,w:1.9,a:true,dsh:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:9, name:'Chaos_PressBail', label:'Chaos Press Bail', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:CB([30,C_Y],[26,14],[24,12],[22,10]), c:CLR.press,w:1.6,a:true,dsh:true},
      {d:CB([170,C_Y],[174,14],[176,12],[178,10]), c:CLR.press,w:1.6,a:true,dsh:true},
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:10, name:'Chaos_Match_Rotate', label:'Chaos Match Rotate', cat:'shell',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,52],[134,44]), c:CLR.curl,w:2,a:true},
      {d:QQ([64,LB_Y],[58,58],[52,48]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[124,58],[130,48]), c:CLR.man,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ ODD FRONT VARIANTS 11-15 ═══════════════ */
  {
    id:11, name:'Stack_335', label:'3-3-5 Stack', cat:'odd',
    sk:[...STACK_335],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([60,S_Y],[60,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([100,S_Y],[100,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([140,S_Y],[140,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y+2],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([106,LB_Y],[106,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([80,DL_Y],[80,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,DL_Y],[100,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:12, name:'Mint_4i_0_4i', label:'Mint 4i-0-4i', cat:'odd',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:CB([74,DL_Y],[72,DL_Y-6],[70,DL_Y-8],[68,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:CB([106,DL_Y],[108,DL_Y-6],[110,DL_Y-8],[112,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,DL_Y],[118,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:13, name:'Bear_Chaos', label:'Bear Chaos', cat:'odd',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([74,DL_Y],[74,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([86,DL_Y],[86,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([98,DL_Y],[98,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([110,DL_Y],[110,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:14, name:'Wide9_Standup', label:'Wide 9 Standup', cat:'odd',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:CB([56,DL_Y],[54,DL_Y-8],[52,DL_Y-10],[50,DL_Y-12]), c:CLR.rush,w:1.3,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:CB([124,DL_Y],[126,DL_Y-8],[128,DL_Y-10],[130,DL_Y-12]), c:CLR.rush,w:1.3,a:true},
    ],
  },
  {
    id:15, name:'Amoeba', label:'Amoeba', cat:'odd',
    sk:[...STACK_335],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([60,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([100,S_Y],[90,54],[84,46]), c:CLR.rob,w:2,a:true},
      {d:QQ([140,S_Y],[148,54],[156,46]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y+2],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([106,LB_Y],[106,52]), c:CLR.man,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ SIMULATED PRESSURE 16-25 ═══════════════ */
  {
    id:16, name:'Creeper_Field', label:'Creeper Field', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:17, name:'Creeper_Boundary', label:'Creeper Boundary', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,54],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:18, name:'EdgeDrop_Replace', label:'Edge Drop Replace', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([72,DL_Y],[66,34],[58,28],[50,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:19, name:'Mike_Loop_Sim', label:'Mike Loop Sim', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:CB([88,LB_Y],[94,58],[102,48],[110,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:20, name:'Nickel_Cross_Sim', label:'Nickel Cross Sim', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:CB([118,LB_Y],[112,60],[102,54],[92,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:21, name:'Safety_Insert_Sim', label:'Safety Insert Sim', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,54],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([122,S_Y],[122,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:22, name:'Tackle_Drop_Sim', label:'Tackle Drop Sim', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,54],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([96,DL_Y],[96,34],[88,28],[80,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:23, name:'DoubleMug_Drop', label:'Double Mug Drop', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([88,LB_Y],[88,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([72,DL_Y],[66,34],[58,28],[50,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:QQ([108,DL_Y],[114,34],[122,28],[130,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:24, name:'Boundary_Spin_Sim', label:'Boundary Spin Sim', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[72,56],[66,46]), c:CLR.rob,w:2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:25, name:'Chaos_Replace_Cross', label:'Chaos Replace Cross', cat:'sim',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:CB([64,LB_Y],[70,60],[82,54],[94,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:CB([118,LB_Y],[112,60],[100,54],[88,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([72,DL_Y],[66,34],[58,28],[50,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ TRUE PRESSURE 26-33 ════════════════════ */
  {
    id:26, name:'Zero_Edge', label:'Zero Edge', cat:'press',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.man,w:1.8,a:true},
      {d:P([78,S_Y],[78,30]), c:CLR.man,w:1.8,a:true},
      {d:P([122,S_Y],[122,30]), c:CLR.man,w:1.8,a:true},
      {d:P([30,C_Y],[30,LOS-8]), c:CLR.blitz,w:2.1,a:true},
      {d:P([170,C_Y],[170,LOS-8]), c:CLR.blitz,w:2.1,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:27, name:'Zero_Cross', label:'Zero Cross', cat:'press',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2,a:true},
      {d:P([78,S_Y],[78,30]), c:CLR.man,w:1.8,a:true},
      {d:P([122,S_Y],[122,30]), c:CLR.man,w:1.8,a:true},
      {d:CB([64,LB_Y],[70,60],[82,54],[94,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:CB([118,LB_Y],[112,60],[100,54],[88,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:28, name:'Double_A_Gap', label:'Double A Gap', cat:'press',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2,a:true},
      {d:P([78,S_Y],[78,30]), c:CLR.man,w:1.8,a:true},
      {d:P([122,S_Y],[122,30]), c:CLR.man,w:1.8,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([88,LB_Y],[88,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.man,w:1.8,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:29, name:'Nickel_Cat', label:'Nickel Cat', cat:'press',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2,a:true},
      {d:P([78,S_Y],[78,30]), c:CLR.man,w:1.8,a:true},
      {d:P([122,S_Y],[122,30]), c:CLR.man,w:1.8,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:30, name:'Safety_Blitz', label:'Safety Blitz', cat:'press',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2,a:true},
      {d:P([78,S_Y],[78,30]), c:CLR.man,w:1.8,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.man,w:1.8,a:true},
      {d:P([122,S_Y],[122,LOS-8]), c:CLR.blitz,w:2.1,a:true},
      {d:P([72,DL_Y],[72,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:31, name:'FireZone_Replace', label:'Fire Zone Replace', cat:'press',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([72,DL_Y],[66,34],[58,28],[50,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:32, name:'Field_Storm', label:'Field Storm', cat:'press',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2,a:true},
      {d:P([78,S_Y],[78,30]), c:CLR.man,w:1.8,a:true},
      {d:P([122,S_Y],[122,30]), c:CLR.man,w:1.8,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([170,C_Y],[170,LOS-8]), c:CLR.blitz,w:2.1,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:33, name:'Boundary_Storm', label:'Boundary Storm', cat:'press',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2,a:true},
      {d:P([78,S_Y],[78,30]), c:CLR.man,w:1.8,a:true},
      {d:P([122,S_Y],[122,30]), c:CLR.man,w:1.8,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.man,w:1.8,a:true},
      {d:P([30,C_Y],[30,LOS-8]), c:CLR.blitz,w:2.1,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ DROP-8 & CONFUSION 34-37 ═══════════════ */
  {
    id:34, name:'Drop8_Quarters', label:'Drop-8 Quarters', cat:'drop8',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y+2],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y+2],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([52,LB_Y],[52,52]), c:CLR.hook,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([118,LB_Y],[118,48]), c:CLR.curl,w:1.7,a:true},
      {d:P([146,LB_Y],[146,52]), c:CLR.curl,w:1.7,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,DL_Y],[100,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([110,DL_Y],[110,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:35, name:'Drop8_Cloud', label:'Drop-8 Cloud', cat:'drop8',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,42]), c:CLR.flat,w:2,a:true},
      {d:P([78,S_Y+2],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y+2],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([52,LB_Y],[52,52]), c:CLR.hook,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([118,LB_Y],[118,48]), c:CLR.curl,w:1.7,a:true},
      {d:P([146,LB_Y],[146,52]), c:CLR.curl,w:1.7,a:true},
      {d:QQ([174,C_Y],[180,46],[186,54]), c:CLR.flat,w:1.9,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:36, name:'Drop8_Bracket', label:'Drop-8 Bracket', cat:'drop8',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y+2],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y+2],[128,42],[136,32]), c:CLR.bracket,w:2,a:true},
      {d:QQ([118,LB_Y],[124,58],[130,48]), c:CLR.bracket,w:1.8,a:true},
      {d:P([52,LB_Y],[52,52]), c:CLR.hook,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([146,LB_Y],[146,52]), c:CLR.curl,w:1.7,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:37, name:'Drop8_Spy', label:'Drop-8 Spy', cat:'drop8',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y+2],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y+2],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:P([52,LB_Y],[52,52]), c:CLR.hook,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([118,LB_Y],[118,48]), c:CLR.curl,w:1.7,a:true},
      {d:P([146,LB_Y],[146,52]), c:CLR.curl,w:1.7,a:true},
      {d:P([100,LB_Y],[100,62]), c:CLR.spy,w:2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ SITUATIONAL 38-40 ══════════════════════ */
  {
    id:38, name:'ThirdLong_ChaosSim', label:'3rd Long Chaos Sim', cat:'situ',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y+2],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y+2],[126,54],[134,44]), c:CLR.flat,w:2,a:true},
      {d:P([52,LB_Y],[52,52]), c:CLR.hook,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([146,LB_Y],[146,52]), c:CLR.curl,w:1.7,a:true},
      {d:QQ([84,DL_Y],[78,34],[70,28],[62,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:39, name:'RedZone_ZeroRotate', label:'Red Zone Zero Rotate', cat:'situ',
    sk:[...RED_DEF],
    rt:[
      {d:P([34,C_Y],[34,34]), c:CLR.man,w:2.1,a:true},
      {d:P([166,C_Y],[166,34]), c:CLR.man,w:2.1,a:true},
      {d:P([68,LB_Y-2],[68,54]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y-2],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([112,LB_Y-2],[112,54]), c:CLR.man,w:1.8,a:true},
      {d:P([82,S_Y-6],[82,30]), c:CLR.man,w:1.8,a:true},
      {d:P([118,S_Y-6],[118,30]), c:CLR.blitz,w:2.1,a:true},
      {d:P([68,LB_Y-2],[68,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:40, name:'TwoMinute_SpinPressure', label:'2-Minute Spin Pressure', cat:'situ',
    sk:[...CHAOS_BASE],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[116,56],[108,46]), c:CLR.rob,w:2.1,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([72,DL_Y],[66,34],[58,28],[50,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([84,DL_Y],[84,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
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
  CB:'#a78bfa',
  S:'#60a5fa',
  NB:'#22c55e',
  DB:'#e879f9',
  LB:'#fbbf24',
  DL:'#8b9ab5',
};

function Player({ x, y, t, large = false }) {
  const c = PLAYER_COLORS[t] || '#fff';
  const r = large ? 6.5 : 5;

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
          fontSize={5.2}
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
      opacity={0.92}
    />
  );
}

/* ── FIELD SVG ───────────────────────────────── */
function PlayField({ play, large = false }) {
  const dlX = [72, 84, 96, 108];

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

      {dlX.map((x, i) => <Player key={`dl-${i}`} x={x} y={DL_Y} t="DL" large={large} />)}
      {play.sk.map((p, i) => <Player key={i} x={p.x} y={p.y} t={p.t} large={large} />)}

      <ellipse
        cx={BALL_X}
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
  shell: [
    {c:CLR.deep,l:'Deep Shell'},
    {c:CLR.flat,l:'Flat / Cloud'},
    {c:CLR.hook,l:'Hook / Seam'},
    {c:CLR.curl,l:'Curl / Match'},
    {c:CLR.rob,l:'Spin / Robber'},
    {c:CLR.rush,l:'Rush'},
  ],
  odd: [
    {c:CLR.deep,l:'Deep Help'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.hook,l:'Hook'},
    {c:CLR.man,l:'Match / Mug'},
    {c:CLR.rush,l:'Odd Rush'},
  ],
  sim: [
    {c:CLR.deep,l:'Deep Help'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.hook,l:'Hook'},
    {c:CLR.sim,l:'Sim Pressure'},
    {c:CLR.drop,l:'Dropper'},
  ],
  press: [
    {c:CLR.man,l:'Man'},
    {c:CLR.blitz,l:'Pressure'},
    {c:CLR.deep,l:'Post Help'},
    {c:CLR.flat,l:'Replace Zone'},
  ],
  drop8: [
    {c:CLR.deep,l:'Deep Help'},
    {c:CLR.hook,l:'Hook'},
    {c:CLR.curl,l:'Curl'},
    {c:CLR.bracket,l:'Bracket'},
    {c:CLR.spy,l:'Spy'},
  ],
  situ: [
    {c:CLR.deep,l:'Late Deep'},
    {c:CLR.rob,l:'Spin / Robber'},
    {c:CLR.blitz,l:'Pressure'},
    {c:CLR.drop,l:'Dropper'},
    {c:CLR.man,l:'Zero / Match'},
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
                CALL #{String(play.id).padStart(2,'0')}
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
              ['CB','#a78bfa'],
              ['S','#60a5fa'],
              ['NB','#22c55e'],
              ['DB','#e879f9'],
              ['LB','#fbbf24'],
              ['DL','#8b9ab5'],
            ].map(([t,c]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:10, height:10, borderRadius:5, background:c, opacity:0.85 }} />
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
  { id:'all',   label:'All 40',       accent:'#94a3b8' },
  { id:'shell', label:'Shells (10)',  accent:'#60a5fa' },
  { id:'odd',   label:'Odd (5)',      accent:'#94a3b8' },
  { id:'sim',   label:'Sim (10)',     accent:'#f87171' },
  { id:'press', label:'Pressure (8)', accent:'#ef4444' },
  { id:'drop8', label:'Drop-8 (4)',   accent:'#a78bfa' },
  { id:'situ',  label:'Situ (3)',     accent:'#fb923c' },
];

/* ── APP ─────────────────────────────────────── */
export default function ChaosFrontPlaybook() {
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
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))' }}>
            🏈
          </div>
          <div>
            <div style={{ color:'#ede8ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              CHAOS FRONT
            </div>
            <div style={{ color:'#f87171', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              DISGUISE · ROTATION · PRESSURE CONFUSION
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
        CHAOS FRONT · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
