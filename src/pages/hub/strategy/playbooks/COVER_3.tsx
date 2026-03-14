// @ts-nocheck
import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  zone:      '#60a5fa',
  man:       '#f472b6',
  deep:      '#a78bfa',
  hook:      '#34d399',
  curl:      '#fbbf24',
  flat:      '#fb923c',
  blitz:     '#ef4444',
  sim:       '#f87171',
  rush:      '#64748b',
  stunt:     '#94a3b8',
  rob:       '#22c55e',
  bracket:   '#e879f9',
  press:     '#facc15',
  drop:      '#38bdf8',
};

const CAT_META = {
  base:   { label: 'Base',      short: 'BASE', accent: '#60a5fa', bg: '#60a5fa12' },
  front:  { label: 'Front',     short: 'FRNT', accent: '#94a3b8', bg: '#94a3b812' },
  fire:   { label: 'Fire Zone', short: 'FIRE', accent: '#ef4444', bg: '#ef444412' },
  sim:    { label: 'Sim',       short: 'SIM',  accent: '#f87171', bg: '#f8717112' },
  man:    { label: 'Man Blend', short: 'MAN',  accent: '#f472b6', bg: '#f472b612' },
  dime:   { label: 'Dime',      short: 'DIME', accent: '#a78bfa', bg: '#a78bfa12' },
  red:    { label: 'Red Zone',  short: 'RED',  accent: '#fb923c', bg: '#fb923c12' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* ── FIELD / ALIGNMENT HELPERS ───────────────── */
const BALL_X = 100;
const LB_Y = LOS + 12;
const S_Y  = LOS + 30;
const C_Y  = LOS + 6;

const BASE_DEF = [
  { x: 30,  y: C_Y,  t: 'CB' },
  { x: 70,  y: LB_Y, t: 'LB' },
  { x: 88,  y: LB_Y, t: 'LB' },
  { x: 112, y: LB_Y, t: 'LB' },
  { x: 170, y: C_Y,  t: 'CB' },
  { x: 78,  y: S_Y,  t: 'S' },
  { x: 122, y: S_Y,  t: 'S' },
];

const NICKEL_DEF = [
  { x: 30,  y: C_Y,  t: 'CB' },
  { x: 64,  y: LB_Y, t: 'LB' },
  { x: 88,  y: LB_Y, t: 'LB' },
  { x: 118, y: LB_Y, t: 'NB' },
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
  { x: 34,  y: C_Y,  t: 'CB' },
  { x: 70,  y: LB_Y-2, t: 'LB' },
  { x: 88,  y: LB_Y-2, t: 'LB' },
  { x: 112, y: LB_Y-2, t: 'LB' },
  { x: 166, y: C_Y,  t: 'CB' },
  { x: 82,  y: S_Y-6,  t: 'S' },
  { x: 118, y: S_Y-6,  t: 'S' },
];

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#f472b6','#a78bfa','#34d399','#fbbf24',
  '#fb923c','#ef4444','#f87171','#64748b','#94a3b8',
  '#22c55e','#e879f9','#38bdf8','#facc15',
];

/* ── PLAY DATA ───────────────────────────────── */
const PLAYS = [
  /* ═══ BASE STRUCTURE 1-10 ════════════════════ */
  {
    id:1, name:'C3_Sky', label:'C3 Sky', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]),  c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]),  c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]),c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]),c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]),c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]),c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]),c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:2, name:'C3_Buzz', label:'C3 Buzz', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]),    c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]),  c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]),   c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,52],[132,44]), c:CLR.rob,w:2,a:true},
      {d:P([70,LB_Y],[70,52]),   c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]),   c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:3, name:'C3_Cloud', label:'C3 Cloud', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,44]),    c:CLR.flat,w:2,a:true},
      {d:P([170,C_Y],[170,18]),  c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]),  c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[30,18]),    c:CLR.deep,w:2.2,a:true},
      {d:P([70,LB_Y],[70,52]),   c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]),   c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:4, name:'C3_PressBail', label:'C3 Press Bail', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:CB([30,C_Y],[26,14],[24,12],[22,10]),  c:CLR.press,w:1.6,a:true,dsh:true},
      {d:CB([170,C_Y],[174,14],[176,12],[178,10]), c:CLR.press,w:1.6,a:true,dsh:true},
      {d:P([30,C_Y],[30,18]),    c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]),  c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]),  c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([88,LB_Y],[88,48]),   c:CLR.hook,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:5, name:'C3_Off', label:'C3 Off', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,22]),    c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,22]),  c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,18]),  c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,54],[58,46]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,54]),   c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,50]),   c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,54]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:6, name:'C3_Match', label:'C3 Match', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]),    c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]),  c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]),  c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[62,56],[56,46]), c:CLR.curl,w:2,a:true},
      {d:QQ([70,LB_Y],[66,60],[60,54]), c:CLR.curl,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]),   c:CLR.hook,w:1.8,a:true},
      {d:QQ([112,LB_Y],[118,60],[126,54]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:7, name:'C3_SeamCarry', label:'C3 Seam Carry', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]),    c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]),  c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]),  c:CLR.deep,w:2.2,a:true},
      {d:CB([78,S_Y],[72,46],[74,28],[78,18]), c:CLR.rob,w:2,a:true},
      {d:CB([70,LB_Y],[70,52],[72,34],[74,24]), c:CLR.hook,w:1.9,a:true},
      {d:P([88,LB_Y],[88,48]),   c:CLR.hook,w:1.8,a:true},
      {d:CB([112,LB_Y],[112,52],[110,34],[108,24]), c:CLR.curl,w:1.9,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:8, name:'C3_Lock', label:'C3 Lock', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]),    c:CLR.man,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]),  c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]),  c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]),   c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]),   c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:9, name:'C3_Invert', label:'C3 Invert', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]),    c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,44]),  c:CLR.flat,w:2,a:true},
      {d:P([78,S_Y],[170,18]),   c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]),  c:CLR.deep,w:2.2,a:true},
      {d:P([70,LB_Y],[70,52]),   c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]),   c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:10, name:'C3_Robber', label:'C3 Robber', cat:'base',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]),    c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]),  c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]),   c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[116,56],[108,46]), c:CLR.rob,w:2.1,a:true},
      {d:P([70,LB_Y],[70,52]),   c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]),   c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ FRONT VARIATIONS 11-15 ═════════════════ */
  {
    id:11, name:'C3_OverFront', label:'C3 Over Front', cat:'front',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([66,LOS],[66,LOS-9]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-7]), c:CLR.rush,w:1.2,a:true},
      {d:P([92,LOS],[92,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([106,LOS],[106,LOS-7]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:12, name:'C3_UnderFront', label:'C3 Under Front', cat:'front',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-7]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,LOS],[84,LOS-9]), c:CLR.rush,w:1.2,a:true},
      {d:P([98,LOS],[98,LOS-7]), c:CLR.rush,w:1.2,a:true},
      {d:P([112,LOS],[112,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:13, name:'C3_Wide9Rush', label:'C3 Wide 9 Rush', cat:'front',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:CB([58,LOS],[56,LOS-8],[54,LOS-10],[52,LOS-12]), c:CLR.rush,w:1.3,a:true},
      {d:P([80,LOS],[80,LOS-7]), c:CLR.rush,w:1.2,a:true},
      {d:P([92,LOS],[92,LOS-7]), c:CLR.rush,w:1.2,a:true},
      {d:CB([124,LOS],[126,LOS-8],[128,LOS-10],[130,LOS-12]), c:CLR.rush,w:1.3,a:true},
    ],
  },
  {
    id:14, name:'C3_TightFront', label:'C3 Tight Front', cat:'front',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([76,LOS],[76,LOS-7]), c:CLR.rush,w:1.2,a:true},
      {d:P([88,LOS],[88,LOS-9]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.rush,w:1.2,a:true},
      {d:P([112,LOS],[112,LOS-7]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:15, name:'C3_BearInterior', label:'C3 Bear Interior', cat:'front',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([74,LOS],[74,LOS-7]), c:CLR.rush,w:1.2,a:true},
      {d:P([88,LOS],[88,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([114,LOS],[114,LOS-7]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ FIRE ZONE 16-20 ════════════════════════ */
  {
    id:16, name:'Nickel_Fire', label:'Nickel Fire', cat:'fire',
    sk:[...NICKEL_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([118,LB_Y],[124,58],[132,48]), c:CLR.flat,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:17, name:'Sam_FireZone', label:'Sam Fire Zone', cat:'fire',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
    ],
  },
  {
    id:18, name:'CrossDog_Zone', label:'Cross Dog Zone', cat:'fire',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,52],[132,44]), c:CLR.flat,w:2,a:true},
      {d:CB([70,LB_Y],[74,60],[84,54],[92,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:CB([112,LB_Y],[108,60],[98,54],[88,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:19, name:'Boundary_CatFire', label:'Boundary Cat Fire', cat:'fire',
    sk:[...NICKEL_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[60,56],[54,46]), c:CLR.flat,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([30,C_Y],[30,LOS-8]), c:CLR.blitz,w:2.1,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
    ],
  },
  {
    id:20, name:'SS_FireZone', label:'Strong Safety Fire Zone', cat:'fire',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([122,S_Y],[122,LOS-8]), c:CLR.blitz,w:2.1,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
    ],
  },

  /* ═══ SIMULATED PRESSURE 21-25 ═══════════════ */
  {
    id:21, name:'Nickel_SimStrong', label:'Nickel Sim Strong', cat:'sim',
    sk:[...NICKEL_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[60,56],[54,46]), c:CLR.flat,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([118,LB_Y],[118,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:22, name:'MikeMug_Sim', label:'Mike Mug Sim', cat:'sim',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[126,52],[132,44]), c:CLR.flat,w:2,a:true},
      {d:P([88,LB_Y],[88,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:23, name:'Boundary_Creeper', label:'Boundary Creeper', cat:'sim',
    sk:[...NICKEL_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([64,LB_Y],[60,56],[54,46]), c:CLR.flat,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([30,C_Y],[30,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([118,LB_Y],[118,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:24, name:'TackleDrop_Sim', label:'Tackle Drop Sim', cat:'sim',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:QQ([90,LOS],[90,30],[82,26]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:25, name:'EdgeReplace_Sim', label:'Edge Replace Sim', cat:'sim',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,LOS-8]), c:CLR.sim,w:2,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:QQ([70,LOS],[64,34],[58,28],[52,24]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ MAN-BLENDED VARIANTS 26-30 ═════════════ */
  {
    id:26, name:'C3_MatchPress', label:'C3 Match Press', cat:'man',
    sk:[...BASE_DEF],
    rt:[
      {d:CB([30,C_Y],[28,14],[26,12],[24,10]), c:CLR.press,w:1.6,a:true,dsh:true},
      {d:CB([170,C_Y],[172,14],[174,12],[176,10]), c:CLR.press,w:1.6,a:true,dsh:true},
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[64,54],[58,46]), c:CLR.man,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.man,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:27, name:'C3_Lock1', label:'C3 Lock #1', cat:'man',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.man,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:28, name:'C3_BracketSlot', label:'C3 Bracket Slot', cat:'man',
    sk:[...NICKEL_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([118,LB_Y],[126,56],[132,48]), c:CLR.bracket,w:2,a:true},
      {d:QQ([122,S_Y],[128,42],[136,32]), c:CLR.bracket,w:2,a:true},
      {d:P([64,LB_Y],[64,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:29, name:'C3_CutCross', label:'C3 Cut Cross', cat:'man',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([122,S_Y],[116,56],[108,46]), c:CLR.rob,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.rob,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.man,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:30, name:'C3_DoubleX', label:'C3 Double X', cat:'man',
    sk:[...BASE_DEF],
    rt:[
      {d:P([30,C_Y],[30,18]), c:CLR.bracket,w:2.2,a:true},
      {d:P([170,C_Y],[170,18]), c:CLR.bracket,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y],[70,52]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y],[112,52]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ DIME PACKAGE 31-35 ═════════════════════ */
  {
    id:31, name:'Dime_C3Sky', label:'Dime C3 Sky', cat:'dime',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[66,52],[60,44]), c:CLR.flat,w:2,a:true},
      {d:P([54,LB_Y],[54,54]), c:CLR.hook,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([118,LB_Y],[118,48]), c:CLR.curl,w:1.7,a:true},
      {d:P([146,LB_Y],[146,54]), c:CLR.curl,w:1.7,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:32, name:'Dime_C3Match', label:'Dime C3 Match', cat:'dime',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([78,S_Y],[62,56],[56,46]), c:CLR.curl,w:2,a:true},
      {d:P([54,LB_Y],[54,54]), c:CLR.man,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([118,LB_Y],[118,48]), c:CLR.man,w:1.7,a:true},
      {d:P([146,LB_Y],[146,54]), c:CLR.curl,w:1.7,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:33, name:'Dime_C1Robber', label:'Dime C1 Robber', cat:'dime',
    sk:[...DIME_DEF],
    rt:[
      {d:P([78,S_Y],[100,14]), c:CLR.deep,w:2.3,a:true},
      {d:P([26,C_Y],[26,26]),  c:CLR.man,w:2.1,a:true},
      {d:P([54,LB_Y],[54,50]), c:CLR.man,w:1.8,a:true},
      {d:P([82,LB_Y],[82,46]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,46]), c:CLR.man,w:1.8,a:true},
      {d:P([146,LB_Y],[146,50]), c:CLR.man,w:1.8,a:true},
      {d:P([174,C_Y],[174,26]), c:CLR.man,w:2.1,a:true},
      {d:QQ([122,S_Y],[116,56],[108,46]), c:CLR.rob,w:2,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:34, name:'Dime_2Man', label:'Dime 2-Man', cat:'dime',
    sk:[...DIME_DEF],
    rt:[
      {d:P([78,S_Y],[68,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[132,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([26,C_Y],[26,26]),  c:CLR.man,w:2.1,a:true},
      {d:P([54,LB_Y],[54,50]), c:CLR.man,w:1.8,a:true},
      {d:P([82,LB_Y],[82,46]), c:CLR.man,w:1.8,a:true},
      {d:P([118,LB_Y],[118,46]), c:CLR.man,w:1.8,a:true},
      {d:P([146,LB_Y],[146,50]), c:CLR.man,w:1.8,a:true},
      {d:P([174,C_Y],[174,26]), c:CLR.man,w:2.1,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:35, name:'Dime_Drop8Cloud', label:'Dime Drop-8 Cloud', cat:'dime',
    sk:[...DIME_DEF],
    rt:[
      {d:P([26,C_Y],[26,42]), c:CLR.flat,w:2,a:true},
      {d:P([174,C_Y],[174,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([78,S_Y],[26,18]), c:CLR.deep,w:2.2,a:true},
      {d:P([122,S_Y],[100,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([54,LB_Y],[54,54]), c:CLR.hook,w:1.7,a:true},
      {d:P([82,LB_Y],[82,48]), c:CLR.hook,w:1.7,a:true},
      {d:P([118,LB_Y],[118,48]), c:CLR.curl,w:1.7,a:true},
      {d:P([146,LB_Y],[146,54]), c:CLR.curl,w:1.7,a:true},
      {d:QQ([174,C_Y],[180,46],[186,54]), c:CLR.flat,w:1.9,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },

  /* ═══ RED ZONE PACKAGE 36-40 ═════════════════ */
  {
    id:36, name:'Red_C3Match', label:'Red C3 Match', cat:'red',
    sk:[...RED_DEF],
    rt:[
      {d:P([34,C_Y],[34,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([166,C_Y],[166,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([118,S_Y-6],[100,24]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([82,S_Y-6],[70,52],[64,46]), c:CLR.curl,w:2,a:true},
      {d:P([70,LB_Y-2],[70,54]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y-2],[88,48]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y-2],[112,54]), c:CLR.man,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:37, name:'Red_C3CloudTrap', label:'Red C3 Cloud Trap', cat:'red',
    sk:[...RED_DEF],
    rt:[
      {d:P([34,C_Y],[34,46]), c:CLR.flat,w:2,a:true},
      {d:P([166,C_Y],[166,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([82,S_Y-6],[34,26]), c:CLR.deep,w:2.2,a:true},
      {d:P([118,S_Y-6],[100,24]), c:CLR.deep,w:2.2,a:true},
      {d:P([70,LB_Y-2],[70,54]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y-2],[88,48]), c:CLR.rob,w:1.8,a:true},
      {d:P([112,LB_Y-2],[112,54]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:38, name:'Red_C1Robber', label:'Red C1 Robber', cat:'red',
    sk:[...RED_DEF],
    rt:[
      {d:P([82,S_Y-6],[100,22]), c:CLR.deep,w:2.3,a:true},
      {d:P([34,C_Y],[34,34]), c:CLR.man,w:2.1,a:true},
      {d:P([70,LB_Y-2],[70,54]), c:CLR.man,w:1.8,a:true},
      {d:P([88,LB_Y-2],[88,48]), c:CLR.man,w:1.8,a:true},
      {d:P([112,LB_Y-2],[112,54]), c:CLR.man,w:1.8,a:true},
      {d:P([166,C_Y],[166,34]), c:CLR.man,w:2.1,a:true},
      {d:QQ([118,S_Y-6],[112,54],[104,46]), c:CLR.rob,w:2,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:39, name:'Red_FireZone', label:'Red Fire Zone', cat:'red',
    sk:[...RED_DEF],
    rt:[
      {d:P([34,C_Y],[34,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([166,C_Y],[166,28]), c:CLR.deep,w:2.2,a:true},
      {d:P([82,S_Y-6],[100,24]), c:CLR.deep,w:2.2,a:true},
      {d:QQ([118,S_Y-6],[124,54],[132,46]), c:CLR.flat,w:2,a:true},
      {d:P([70,LB_Y-2],[70,54]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y-2],[88,LOS-8]), c:CLR.blitz,w:2,a:true},
      {d:P([112,LB_Y-2],[112,54]), c:CLR.curl,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.drop,w:1.6,a:true,dsh:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.rush,w:1.2,a:true},
    ],
  },
  {
    id:40, name:'GoalLine_C3Heavy', label:'Goal Line C3 Heavy', cat:'red',
    sk:[...RED_DEF],
    rt:[
      {d:P([34,C_Y],[34,30]), c:CLR.deep,w:2.1,a:true},
      {d:P([166,C_Y],[166,30]), c:CLR.deep,w:2.1,a:true},
      {d:P([118,S_Y-6],[100,26]), c:CLR.deep,w:2.1,a:true},
      {d:P([82,S_Y-6],[82,48]), c:CLR.flat,w:1.9,a:true},
      {d:P([70,LB_Y-2],[70,56]), c:CLR.hook,w:1.8,a:true},
      {d:P([88,LB_Y-2],[88,50]), c:CLR.hook,w:1.8,a:true},
      {d:P([112,LB_Y-2],[112,56]), c:CLR.curl,w:1.8,a:true},
      {d:P([72,LOS],[72,LOS-7]), c:CLR.rush,w:1.2,a:true},
      {d:P([84,LOS],[84,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([96,LOS],[96,LOS-8]), c:CLR.rush,w:1.2,a:true},
      {d:P([108,LOS],[108,LOS-7]), c:CLR.rush,w:1.2,a:true},
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

/* ── ROUTE / ZONE ────────────────────────────── */
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
  const dlX = [70, 80, 90, 100];

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

      {dlX.map((x, i) => <Player key={`dl-${i}`} x={x} y={LOS} t="DL" large={large} />)}
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
    {c:CLR.deep,l:'Deep Third'},
    {c:CLR.flat,l:'Flat / Curl-Flat'},
    {c:CLR.hook,l:'Hook / Seam'},
    {c:CLR.curl,l:'Curl / Match'},
    {c:CLR.rob,l:'Robber / Buzz'},
    {c:CLR.rush,l:'Rush'},
  ],
  front: [
    {c:CLR.deep,l:'Deep Third'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.hook,l:'Hook'},
    {c:CLR.rush,l:'Rush Lane'},
  ],
  fire: [
    {c:CLR.deep,l:'3-Deep'},
    {c:CLR.flat,l:'Under Zone'},
    {c:CLR.hook,l:'Hook Drop'},
    {c:CLR.blitz,l:'Blitz'},
    {c:CLR.drop,l:'Dropper'},
  ],
  sim: [
    {c:CLR.deep,l:'3-Deep'},
    {c:CLR.flat,l:'Flat'},
    {c:CLR.hook,l:'Hook'},
    {c:CLR.sim,l:'Sim Pressure'},
    {c:CLR.drop,l:'Dropper'},
  ],
  man: [
    {c:CLR.deep,l:'Deep Third'},
    {c:CLR.man,l:'Man / Lock'},
    {c:CLR.bracket,l:'Bracket'},
    {c:CLR.rob,l:'Cut / Robber'},
    {c:CLR.press,l:'Press'},
  ],
  dime: [
    {c:CLR.deep,l:'Deep Help'},
    {c:CLR.man,l:'Man'},
    {c:CLR.hook,l:'Under Drop'},
    {c:CLR.curl,l:'Curl Drop'},
    {c:CLR.rob,l:'Robber'},
  ],
  red: [
    {c:CLR.deep,l:'Red Zone Deep'},
    {c:CLR.flat,l:'Flat / Trap'},
    {c:CLR.hook,l:'Hook'},
    {c:CLR.man,l:'Man'},
    {c:CLR.blitz,l:'Pressure'},
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
  { id:'all',   label:'All 40',        accent:'#94a3b8' },
  { id:'base',  label:'Base (10)',     accent:'#60a5fa' },
  { id:'front', label:'Front (5)',     accent:'#94a3b8' },
  { id:'fire',  label:'Fire (5)',      accent:'#ef4444' },
  { id:'sim',   label:'Sim (5)',       accent:'#f87171' },
  { id:'man',   label:'Man (5)',       accent:'#f472b6' },
  { id:'dime',  label:'Dime (5)',      accent:'#a78bfa' },
  { id:'red',   label:'Red (5)',       accent:'#fb923c' },
];

/* ── APP ─────────────────────────────────────── */
export default function Cover3SingleHighPlaybook() {
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
              COVER 3 SINGLE-HIGH
            </div>
            <div style={{ color:'#60a5fa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              POST SAFETY · CURL-FLAT · FIRE ZONE
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
        COVER 3 SYSTEM · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
