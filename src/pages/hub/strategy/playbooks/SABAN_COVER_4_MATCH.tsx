// @ts-nocheck
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
  press:     '#facc15',
  clamp:     '#10b981',
};

const CAT_META = {
  base:   { label: 'Base Quarters', short: 'BASE',  accent: '#60a5fa', bg: '#60a5fa12' },
  trips:  { label: 'Trips Adj.',    short: 'TRIP',  accent: '#22c55e', bg: '#22c55e12' },
  mint:   { label: 'Mint',          short: 'MINT',  accent: '#94a3b8', bg: '#94a3b812' },
  sim:    { label: 'Sim',           short: 'SIM',   accent: '#f87171', bg: '#f8717112' },
  fire:   { label: 'Nickel Fire',   short: 'FIRE',  accent: '#ef4444', bg: '#ef444412' },
  c1:     { label: 'C1',            short: 'C1',    accent: '#f472b6', bg: '#f472b612' },
  situ:   { label: '3rd/Red',       short: 'SIT',   accent: '#fb923c', bg: '#fb923c12' },
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

const QUARTERS_BASE = [
  { x: 30,  y: C_Y,  t: 'CB' },
  { x: 64,  y: LB_Y, t: 'LB' },
  { x: 88,  y: LB_Y, t: 'LB' },
  { x: 118, y: LB_Y, t: 'NB' }, // Star
  { x: 170, y: C_Y,  t: 'CB' },
  { x: 78,  y: S_Y,  t: 'S' },
  { x: 122, y: S_Y,  t: 'S' },
];

const TRIPS_CHECK = [
  { x: 30,  y: C_Y,  t: 'CB' },
  { x: 60,  y: LB_Y, t: 'LB' },
  { x: 86,  y: LB_Y, t: 'LB' },
  { x: 120, y: LB_Y, t: 'NB' },
  { x: 170, y: C_Y,  t: 'CB' },
  { x: 74,  y: S_Y,  t: 'S' },
  { x: 126, y: S_Y,  t: 'S' },
];

const MINT_FRONT = [
  { x: 30,  y: C_Y,  t: 'CB' },
  { x: 62,  y: LB_Y, t: 'LB' },
  { x: 88,  y: LB_Y, t: 'LB' },
  { x: 120, y: LB_Y, t: 'NB' },
  { x: 170, y: C_Y,  t: 'CB' },
  { x: 78,  y: S_Y,  t: 'S' },
  { x: 122, y: S_Y,  t: 'S' },
];

const DIME_DEF = [
  { x: 26,  y: C_Y,  t: 'CB' },
  { x: 54,  y: LB_Y, t: 'DB' },
  { x: 82,  y: LB_Y, t: 'LB' },
  { x: 118, y: LB_Y, t: 'DB' },
  { x: 146, y: LB_Y, t: 'DB' },
  { x: 174, y: C_Y,  t: 'CB' },
  { x: 78,  y: S_Y,  t: 'S' },
  { x: 122, y: S_Y,  t: 'S' },
];

const RED_DEF = [
  { x: 34,  y: C_Y,    t: 'CB' },
  { x: 66,  y: LB_Y-2, t: 'LB' },
  { x: 88,  y: LB_Y-2, t: 'LB' },
  { x: 118, y: LB_Y-2, t: 'NB' },
  { x: 166, y: C_Y,    t: 'CB' },
  { x: 82,  y: S_Y-6,  t: 'S' },
  { x: 118, y: S_Y-6,  t: 'S' },
];

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#a78bfa','#fb923c','#34d399','#fbbf24',
  '#f472b6','#22c55e','#ef4444','#f87171','#64748b',
  '#94a3b8','#38bdf8','#e879f9','#facc15','#10b981',
];

/* ── PLAY DATA ───────────────────────────────── */
const PLAYS = [
  /* ═══ BASE QUARTERS STRUCTURE 1-10 ═══════════ */
  {
    id:1, name:'Quarters_MOD', label:'Quarters Base (MOD)', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:2, name:'Quarters_Press', label:'Quarters Press', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:CB([30,C_Y],[26,14],[24,12],[22,10]), c:CLR.press,w:1.6,a:true,dsh:true},
      {d:CB([170,C_Y],[174,14],[176,12],[178,10]), c:CLR.press,w:1.6,a:true,dsh:true},
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:3, name:'Quarters_Off', label:'Quarters Off', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,24]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,24]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,20]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,58],[48,48]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,50]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,58],[134,48]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:4, name:'Quarters_SeamRead', label:'Quarters Seam Read', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:CB([78,S_Y],[74,46],[74,28],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:CB([122,S_Y],[126,46],[126,28],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:CB([64,LB_Y],[64,54],[68,34],[72,24]), c:CLR.hook,w:1.9,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:CB([118,LB_Y],[118,54],[114,34],[110,24]), c:CLR.hook,w:1.9,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:5, name:'Quarters_Lock1', label:'Quarters Lock #1', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.man,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.man,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:6, name:'Quarters_MEG_Boundary', label:'Quarters MEG Boundary', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.man,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.man,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:7, name:'Quarters_PoachAlert', label:'Quarters Poach Alert', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[110,54],[98,42]), c:CLR.rob,w:2.1,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:8, name:'Quarters_Invert', label:'Quarters Invert', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:9, name:'Quarters_Box_2x2', label:'Quarters Box vs 2x2', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[58,56],[54,46]), c:CLR.bracket,w:1.9,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.clamp,w:1.8,a:true},
      {d:QQ([118,LB_Y],[124,56],[128,46]), c:CLR.bracket,w:1.9,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:10, name:'Quarters_Clamp', label:'Quarters Clamp', cat:'base',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.clamp,w:1.9,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.clamp,w:1.9,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.clamp,w:1.9,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ TRIPS ADJUSTMENTS 11-17 ════════════════ */
  {
    id:11, name:'Special', label:'Special', cat:'trips',
    sk:[...TRIPS_CHECK],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.man,w:2.2,a:true},
      {d:P([74,S_Y],[74,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([126,S_Y],[114,54],[98,40]), c:CLR.rob,w:2.1,a:true},
      {d:QQ([60,LB_Y],[54,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([86,LB_Y],[86,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[126,56],[132,46]), c:CLR.bracket,w:1.9,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([120,LB_Y],[120,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:12, name:'Solo', label:'Solo', cat:'trips',
    sk:[...TRIPS_CHECK],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.man,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([74,S_Y],[74,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([126,S_Y],[114,54],[98,40]), c:CLR.rob,w:2.1,a:true},
      {d:QQ([60,LB_Y],[54,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([86,LB_Y],[86,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[126,56],[132,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([60,LB_Y],[60,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:13, name:'Stubbie', label:'Stubbie', cat:'trips',
    sk:[...TRIPS_CHECK],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([74,S_Y],[74,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([126,S_Y],[114,54],[100,40]), c:CLR.bracket,w:2.1,a:true},
      {d:QQ([60,LB_Y],[54,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([86,LB_Y],[86,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[124,56],[128,46]), c:CLR.bracket,w:1.9,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([120,LB_Y],[120,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:14, name:'Poach', label:'Poach', cat:'trips',
    sk:[...TRIPS_CHECK],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.man,w:2.2,a:true},
      {d:P([74,S_Y],[74,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([126,S_Y],[112,54],[96,40]), c:CLR.rob,w:2.1,a:true},
      {d:QQ([60,LB_Y],[54,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([86,LB_Y],[86,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[126,56],[132,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([60,LB_Y],[60,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:15, name:'Stress', label:'Stress', cat:'trips',
    sk:[...TRIPS_CHECK],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([74,S_Y],[74,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([126,S_Y],[118,54],[112,44]), c:CLR.flat,w:2,a:true},
      {d:QQ([60,LB_Y],[52,56],[44,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([86,LB_Y],[86,48]), c:CLR.clamp,w:1.8,a:true},
      {d:QQ([120,LB_Y],[126,56],[132,46]), c:CLR.clamp,w:1.9,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([120,LB_Y],[120,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:16, name:'Box_Poach', label:'Box Poach', cat:'trips',
    sk:[...TRIPS_CHECK],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([74,S_Y],[74,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([126,S_Y],[112,54],[96,40]), c:CLR.rob,w:2.1,a:true},
      {d:QQ([60,LB_Y],[54,56],[48,46]), c:CLR.bracket,w:1.9,a:true},
      {d:P([86,LB_Y],[86,48]), c:CLR.bracket,w:1.9,a:true},
      {d:QQ([120,LB_Y],[124,56],[128,46]), c:CLR.bracket,w:1.9,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([120,LB_Y],[120,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:17, name:'Push_Check', label:'Push Check', cat:'trips',
    sk:[...TRIPS_CHECK],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.man,w:2.2,a:true},
      {d:P([74,S_Y],[100,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([126,S_Y],[118,54],[110,44]), c:CLR.rob,w:2.1,a:true},
      {d:QQ([60,LB_Y],[52,56],[44,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([86,LB_Y],[86,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[126,56],[132,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([60,LB_Y],[60,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ MINT FRONT PACKAGE 18-22 ═══════════════ */
  {
    id:18, name:'Mint_Quarters_Base', label:'Mint Quarters Base', cat:'mint',
    sk:[...MINT_FRONT],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([62,LB_Y],[54,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[128,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:CB([82,DL_Y],[80,DL_Y-6],[78,DL_Y-8],[76,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:CB([110,DL_Y],[112,DL_Y-6],[114,DL_Y-8],[116,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([120,LB_Y],[120,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:19, name:'Mint_Match_Press', label:'Mint Match Press', cat:'mint',
    sk:[...MINT_FRONT],
    rt:[
      {d:CB([30,C_Y],[26,14],[24,12],[22,10]), c:CLR.press,w:1.6,a:true,dsh:true},
      {d:CB([170,C_Y],[174,14],[176,12],[178,10]), c:CLR.press,w:1.6,a:true,dsh:true},
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([62,LB_Y],[54,56],[48,46]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[128,56],[134,46]), c:CLR.man,w:1.8,a:true},
      {d:CB([82,DL_Y],[80,DL_Y-6],[78,DL_Y-8],[76,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:CB([110,DL_Y],[112,DL_Y-6],[114,DL_Y-8],[116,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:20, name:'Mint_Special', label:'Mint Special', cat:'mint',
    sk:[...MINT_FRONT],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.man,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[110,54],[96,40]), c:CLR.rob,w:2.1,a:true},
      {d:QQ([62,LB_Y],[54,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[126,56],[132,46]), c:CLR.bracket,w:1.9,a:true},
      {d:CB([82,DL_Y],[80,DL_Y-6],[78,DL_Y-8],[76,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:CB([110,DL_Y],[112,DL_Y-6],[114,DL_Y-8],[116,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([62,LB_Y],[62,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:21, name:'Mint_Poach', label:'Mint Poach', cat:'mint',
    sk:[...MINT_FRONT],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.man,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[110,54],[96,40]), c:CLR.rob,w:2.1,a:true},
      {d:QQ([62,LB_Y],[54,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[128,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:CB([82,DL_Y],[80,DL_Y-6],[78,DL_Y-8],[76,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:CB([110,DL_Y],[112,DL_Y-6],[114,DL_Y-8],[116,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([120,LB_Y],[120,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:22, name:'Mint_Spill_Front', label:'Mint Spill Front', cat:'mint',
    sk:[...MINT_FRONT],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([62,LB_Y],[54,56],[48,46]), c:CLR.clamp,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([120,LB_Y],[128,56],[134,46]), c:CLR.clamp,w:1.8,a:true},
      {d:CB([82,DL_Y],[80,DL_Y-6],[78,DL_Y-8],[76,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:CB([110,DL_Y],[112,DL_Y-6],[114,DL_Y-8],[116,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([120,LB_Y],[120,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ SIMULATED PRESSURE 23-28 ═══════════════ */
  {
    id:23, name:'Nickel_Sim_Strong', label:'Nickel Sim Strong', cat:'sim',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:24, name:'Mike_Mug_Sim', label:'Mike Mug Sim', cat:'sim',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:25, name:'Boundary_Creeper', label:'Boundary Creeper', cat:'sim',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([78,DL_Y],[72,34],[64,28],[56,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:26, name:'Tackle_Drop_Sim', label:'Tackle Drop Sim', cat:'sim',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([90,DL_Y],[90,34],[84,28],[76,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:27, name:'Star_Insert_Sim', label:'Star Insert Sim', cat:'sim',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:QQ([102,DL_Y],[108,34],[116,28],[124,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:28, name:'Cross_Sim_Exchange', label:'Cross Sim Exchange', cat:'sim',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:CB([64,LB_Y],[70,60],[82,54],[94,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:CB([118,LB_Y],[112,60],[100,54],[88,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([78,DL_Y],[72,34],[64,28],[56,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ NICKEL FIRE 29-33 ══════════════════════ */
  {
    id:29, name:'Star_Fire_Quarters', label:'Star Fire Quarters', cat:'fire',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:QQ([102,DL_Y],[108,34],[116,28],[124,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:30, name:'Field_Fire_Match', label:'Field Fire Match', cat:'fire',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.man,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.man,w:1.8,a:true},
      {d:QQ([78,DL_Y],[72,34],[64,28],[56,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:31, name:'Boundary_Cat_Match', label:'Boundary Cat Match', cat:'fire',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,LOS-8]), c:CLR.blitz,w:2.1,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[56,56],[48,46]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([118,LB_Y],[126,56],[134,46]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([78,DL_Y],[72,34],[64,28],[56,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:32, name:'CrossDog_Quarters', label:'Cross Dog Quarters', cat:'fire',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:CB([64,LB_Y],[70,60],[82,54],[94,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:CB([118,LB_Y],[112,60],[100,54],[88,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:QQ([78,DL_Y],[72,34],[64,28],[56,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:33, name:'Mint_Fire', label:'Mint Fire', cat:'fire',
    sk:[...MINT_FRONT],
    rt:[
      {d:P([30,C_Y],[30,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,20]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([62,LB_Y],[54,56],[48,46]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([120,LB_Y],[120,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:QQ([96,DL_Y],[102,34],[110,28],[118,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:CB([82,DL_Y],[80,DL_Y-6],[78,DL_Y-8],[76,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
      {d:P([62,LB_Y],[62,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:CB([110,DL_Y],[112,DL_Y-6],[114,DL_Y-8],[116,DL_Y-10]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ C1 CHANGEUPS 34-36 ═════════════════════ */
  {
    id:34, name:'C1_Robber', label:'C1 Robber', cat:'c1',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([78,S_Y],[100,14]), c:CLR.deep,w:2.3,a:true},
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.man,w:1.8,a:true},
      {d:QQ([122,S_Y],[114,56],[104,46]), c:CLR.rob,w:2,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:35, name:'C1_DoubleX', label:'C1 Double X', cat:'c1',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([78,S_Y],[100,14]), c:CLR.deep,w:2.3,a:true},
      {d:P([30,C_Y],[30,26]), c:CLR.bracket,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.bracket,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.man,w:1.8,a:true},
      {d:QQ([122,S_Y],[114,56],[104,46]), c:CLR.rob,w:2,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:36, name:'C1_StarLock', label:'C1 Star Lock', cat:'c1',
    sk:[...QUARTERS_BASE],
    rt:[
      {d:P([78,S_Y],[100,14]), c:CLR.deep,w:2.3,a:true},
      {d:P([30,C_Y],[30,26]), c:CLR.man,w:2,a:true},
      {d:P([170,C_Y],[170,26]), c:CLR.man,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.bracket,w:1.9,a:true},
      {d:QQ([122,S_Y],[114,56],[104,46]), c:CLR.rob,w:2,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([64,LB_Y],[64,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ 3RD DOWN / DROP-8 / RED ZONE 37-40 ═════ */
  {
    id:37, name:'Drop8_Quarters', label:'Drop-8 Quarters', cat:'situ',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[78,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[122,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([54,LB_Y],[54,52]), c:CLR.curl,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([118,LB_Y],[118,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([146,LB_Y],[146,52]), c:CLR.curl,w:1.7,a:true},
      {d:P([100,LB_Y],[100,60]), c:CLR.rob,w:1.9,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:38, name:'Drop8_PoachCloud', label:'Drop-8 Poach Cloud', cat:'situ',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,42]), c:CLR.flat,w:2,a:true},
      {d:P([78,S_Y],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([54,LB_Y],[54,52]), c:CLR.curl,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:QQ([118,LB_Y],[112,56],[104,46]), c:CLR.rob,w:1.9,a:true},
      {d:P([146,LB_Y],[146,52]), c:CLR.curl,w:1.7,a:true},
      {d:QQ([174,C_Y],[180,46],[186,54]), c:CLR.flat,w:1.9,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:39, name:'Dime_2Man_Bracket', label:'Dime 2-Man Bracket', cat:'situ',
    sk:[...DIME_DEF],
    rt:[
      {d:P([78,S_Y],[68,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[132,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([26,C_Y],[26,26]), c:CLR.bracket,w:2.1,a:true},
      {d:P([54,LB_Y],[54,50]), c:CLR.man,w:1.8,a:true},
      {d:P([82,LB_Y],[82,46]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,46]), c:CLR.man,w:1.8,a:true},
      {d:P([146,LB_Y],[146,50]), c:CLR.bracket,w:2.1,a:true},
      {d:P([174,C_Y],[174,26]), c:CLR.man,w:2.1,a:true},
      {d:P([96,DL_Y],[96,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,DL_Y],[108,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([82,LB_Y],[82,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:40, name:'Red_Match_Clamp', label:'Red Match Clamp', cat:'situ',
    sk:[...RED_DEF],
    rt:[
      {d:P([34,C_Y],[34,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([166,C_Y],[166,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([82,S_Y-6],[82,24]), c:CLR.deep,w:2.2,a:true},
      {d:P([118,S_Y-6],[118,24]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([66,LB_Y-2],[58,54],[50,46]), c:CLR.clamp,w:1.9,a:true},
      {d:P([88,LB_Y-2],[88,46]), c:CLR.clamp,w:1.9,a:true},
      {d:QQ([118,LB_Y-2],[126,54],[134,46]), c:CLR.clamp,w:1.9,a:true},
      {d:P([78,DL_Y],[78,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,DL_Y],[90,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([102,DL_Y],[102,DL_Y-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([118,LB_Y-2],[118,LOS-8]), c:CLR.rush,w:1.2,a:true},
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
  NB:'#22c55e', // Star
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
          fontSize={5.1}
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
  const dlX = [78, 90, 102];

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
  base: [
    {c:CLR.deep,l:'Quarter Help'},
    {c:CLR.curl,l:'Curl / Match'},
    {c:CLR.hook,l:'Hook / Seam'},
    {c:CLR.man,l:'Lock / MEG'},
    {c:CLR.rob,l:'Poach / Read'},
    {c:CLR.clamp,l:'Clamp'},
  ],
  trips: [
    {c:CLR.deep,l:'Quarter Help'},
    {c:CLR.man,l:'Solo / Lock'},
    {c:CLR.rob,l:'Poach / Special'},
    {c:CLR.bracket,l:'Box / Stubbie'},
    {c:CLR.clamp,l:'Stress / Clamp'},
  ],
  mint: [
    {c:CLR.deep,l:'Quarter Help'},
    {c:CLR.curl,l:'Match'},
    {c:CLR.hook,l:'Hook'},
    {c:CLR.man,l:'Press / Special'},
    {c:CLR.rob,l:'Poach'},
    {c:CLR.rush,l:'Mint Rush'},
  ],
  sim: [
    {c:CLR.deep,l:'Quarter Help'},
    {c:CLR.curl,l:'Curl'},
    {c:CLR.hook,l:'Hook'},
    {c:CLR.sim,l:'Sim Pressure'},
    {c:CLR.drop,l:'Dropper'},
  ],
  fire: [
    {c:CLR.deep,l:'Quarter Help'},
    {c:CLR.man,l:'Match / Lock'},
    {c:CLR.hook,l:'Hook'},
    {c:CLR.blitz,l:'Fire'},
    {c:CLR.drop,l:'Dropper'},
  ],
  c1: [
    {c:CLR.deep,l:'Post'},
    {c:CLR.man,l:'Man'},
    {c:CLR.rob,l:'Robber'},
    {c:CLR.bracket,l:'Double X / Star Lock'},
  ],
  situ: [
    {c:CLR.deep,l:'Deep Help'},
    {c:CLR.man,l:'2-Man / Match'},
    {c:CLR.rob,l:'Poach / Robber'},
    {c:CLR.bracket,l:'Bracket'},
    {c:CLR.clamp,l:'Clamp'},
    {c:CLR.drop,l:'Drop-8'},
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
  { id:'all',   label:'All 40',      accent:'#94a3b8' },
  { id:'base',  label:'Base (10)',   accent:'#60a5fa' },
  { id:'trips', label:'Trips (7)',   accent:'#22c55e' },
  { id:'mint',  label:'Mint (5)',    accent:'#94a3b8' },
  { id:'sim',   label:'Sim (6)',     accent:'#f87171' },
  { id:'fire',  label:'Fire (5)',    accent:'#ef4444' },
  { id:'c1',    label:'C1 (3)',      accent:'#f472b6' },
  { id:'situ',  label:'Situ (4)',    accent:'#fb923c' },
];

/* ── APP ─────────────────────────────────────── */
export default function SabanCover4MatchPlaybook() {
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
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(96,165,250,0.7))' }}>
            🏈
          </div>
          <div>
            <div style={{ color:'#ede8ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              SABAN COVER 4 MATCH
            </div>
            <div style={{ color:'#60a5fa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              QUARTERS MATCH · TRIPS CHECKS · MINT PRESSURES
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
        SABAN COVER 4 MATCH · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
