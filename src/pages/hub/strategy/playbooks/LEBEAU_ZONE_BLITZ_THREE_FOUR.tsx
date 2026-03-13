import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  zone:     '#60a5fa',
  man:      '#f472b6',
  pressure: '#ef4444',
  sim:      '#f59e0b',
  front:    '#34d399',
  bracket:  '#a78bfa',
  fit:      '#fbbf24',
  drop:     '#64748b',
  blitz:    '#f87171',
  robber:   '#22c55e',
  rush:     '#fb923c',
  trap:     '#38bdf8',
};

const CAT_META = {
  base:      { label: 'Base Shells',         short: 'BASE', accent: '#60a5fa', bg: '#60a5fa12' },
  fire:      { label: 'Core Fire Zones',     short: 'FIRE', accent: '#ef4444', bg: '#ef444412' },
  exchange:  { label: 'Edge / Exchange',     short: 'EXCH', accent: '#34d399', bg: '#34d39912' },
  sim:       { label: 'Sim Fire',            short: 'SIM',  accent: '#f59e0b', bg: '#f59e0b12' },
  man:       { label: 'Man Pressure',        short: 'MAN',  accent: '#f472b6', bg: '#f472b612' },
  red:       { label: 'Red Zone / Trap',     short: 'RED',  accent: '#a78bfa', bg: '#a78bfa12' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s, c, e) => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s, c1, c2, e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* Defensive landmarks */
const S_Y = 28;
const LB_Y = 48;
const OLB_Y = 56;
const DL_Y = 70;
const CB_PRESS_Y = 38;
const CB_OFF_Y = 30;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#f472b6','#ef4444','#f59e0b',
  '#34d399','#a78bfa','#fbbf24','#64748b',
  '#f87171','#22c55e','#fb923c','#38bdf8',
];

/* ── COMMON PERSONNEL ────────────────────────── */
const BASE_34_SK = [
  { x: 24,  y: CB_OFF_Y, t: 'CB'  },
  { x: 70,  y: OLB_Y,    t: 'OLB' },
  { x: 86,  y: LB_Y,     t: 'ILB' },
  { x: 114, y: LB_Y,     t: 'ILB' },
  { x: 130, y: OLB_Y,    t: 'OLB' },
  { x: 176, y: CB_OFF_Y, t: 'CB'  },
  { x: 78,  y: S_Y,      t: 'S'   },
  { x: 122, y: S_Y,      t: 'S'   },
];

const DL_34 = [
  { x: 76,  y: DL_Y, t: 'DE' },
  { x: 94,  y: DL_Y, t: 'NT' },
  { x: 112, y: DL_Y, t: 'DE' },
];

const DIME_DB = [
  { x: 54,  y: 40, t: 'DB' },
  { x: 146, y: 40, t: 'DB' },
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ BASE SHELLS 1-10 ═════════════════════════════ */
  {
    id:1, name:'ThreeFourC3Sky', label:'3-4 C3 Sky', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:2, name:'ThreeFourC3Buzz', label:'3-4 C3 Buzz', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]), c:CLR.robber,w:2.0,a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:3, name:'ThreeFourC1Robber', label:'3-4 C1 Robber', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,30]), c:CLR.robber,w:2.0,a:true },
    ],
  },
  {
    id:4, name:'ThreeFourQuartersMatch', label:'3-4 Quarters Match', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:5, name:'ThreeFourC6Field', label:'3-4 C6 Field', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,24],[10,16],[8,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[90,14],[102,14],[114,16]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:6, name:'ThreeFourPressC3', label:'3-4 Press C3', cat:'base',
    sk:[
      { x: 24,  y: CB_PRESS_Y, t: 'CB'  },
      { x: 70,  y: OLB_Y,      t: 'OLB' },
      { x: 86,  y: LB_Y,       t: 'ILB' },
      { x: 114, y: LB_Y,       t: 'ILB' },
      { x: 130, y: OLB_Y,      t: 'OLB' },
      { x: 176, y: CB_PRESS_Y, t: 'CB'  },
      { x: 78,  y: S_Y,        t: 'S'   },
      { x: 122, y: S_Y,        t: 'S'   },
    ],
    dl:DL_34,
    rt:[
      { d:P([24,CB_PRESS_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_PRESS_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
      { d:P([24,CB_PRESS_Y],[24,CB_PRESS_Y+6]), c:CLR.man,w:1.4,a:false,dsh:true },
      { d:P([176,CB_PRESS_Y],[176,CB_PRESS_Y+6]), c:CLR.man,w:1.4,a:false,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:7, name:'ThreeFourCloudBoundary', label:'3-4 Cloud Boundary', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,24],[10,16],[8,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,10]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:8, name:'ThreeFourTampaTwoChangeup', label:'3-4 Tampa 2 Changeup', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([24,CB_OFF_Y],[18,24],[12,16],[10,10]), c:CLR.zone,w:2.2,a:true },
      { d:CB([176,CB_OFF_Y],[182,24],[188,16],[190,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([86,LB_Y],[100,20]), c:CLR.drop,w:2.0,a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:9, name:'ThreeFourC3SeamCarry', label:'3-4 C3 Seam Carry', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[72,42],[76,28]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[128,42],[124,28]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:10, name:'ThreeFourLockBoundary', label:'3-4 Lock Boundary', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },

  /* ═══ CORE FIRE ZONE PACKAGE 11-20 ═════════════════ */
  {
    id:11, name:'FireXStrong', label:'Fire X Strong', cat:'fire',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:12, name:'FireXWeak', label:'Fire X Weak', cat:'fire',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([70,OLB_Y],[62,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:13, name:'ZoneExchangeStrong', label:'Zone Exchange Strong', cat:'fire',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([112,DL_Y],[118,58],[126,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([70,OLB_Y],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:14, name:'ZoneExchangeWeak', label:'Zone Exchange Weak', cat:'fire',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([70,OLB_Y],[62,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([76,DL_Y],[70,58],[62,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:15, name:'OLBUnderFire', label:'OLB Under Fire', cat:'fire',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([70,OLB_Y],[82,58],[94,56],[108,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([130,OLB_Y],[136,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([94,DL_Y],[100,58],[108,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:16, name:'NickelFireZone', label:'Nickel Fire Zone', cat:'fire',
    sk:[...BASE_34_SK, { x: 52, y: 40, t: 'DB' }],
    dl:DL_34,
    rt:[
      { d:P([52,40],[62,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,OLB_Y],[64,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([76,DL_Y],[70,58],[62,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:17, name:'CrossDogZone', label:'Cross Dog Zone', cat:'fire',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([86,LB_Y],[96,56],[106,54],[118,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([114,LB_Y],[104,56],[94,54],[82,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:18, name:'BoundaryFireZone', label:'Boundary Fire Zone', cat:'fire',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,OLB_Y],[64,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([76,DL_Y],[70,58],[62,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:19, name:'FieldFireZone', label:'Field Fire Zone', cat:'fire',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([176,CB_OFF_Y],[166,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([130,OLB_Y],[136,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([112,DL_Y],[118,58],[126,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[134,20],[146,20],[158,22]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:20, name:'BearFireZone', label:'Bear Fire Zone', cat:'fire',
    sk:[...BASE_34_SK],
    dl:[
      { x: 72, y: DL_Y, t: 'DE' },
      { x: 86, y: DL_Y, t: 'DT' },
      { x: 100,y: DL_Y, t: 'NT' },
      { x: 114,y: DL_Y, t: 'DT' },
      { x: 128,y: DL_Y, t: 'DE' },
    ],
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([72,DL_Y],[72,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([114,DL_Y],[114,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },

  /* ═══ EDGE DROP / EXCHANGE 21-25 ═══════════════════ */
  {
    id:21, name:'EdgeDropStrong', label:'Edge Drop Strong', cat:'exchange',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([112,DL_Y],[118,58],[126,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([70,OLB_Y],[64,58],[58,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:22, name:'EdgeDropWeak', label:'Edge Drop Weak', cat:'exchange',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([70,OLB_Y],[62,56]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([76,DL_Y],[70,58],[62,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,58],[142,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:23, name:'DTPeelExchange', label:'DT Peel Exchange', cat:'exchange',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.rush,w:2.2,a:true },
      { d:P([70,OLB_Y],[62,56]), c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([94,DL_Y],[100,58],[108,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:24, name:'DoubleEdgeReplace', label:'Double Edge Replace', cat:'exchange',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,58],[142,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([112,DL_Y],[118,58],[126,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:25, name:'InteriorLoopExchange', label:'Interior Loop Exchange', cat:'exchange',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([76,DL_Y],[84,64],[92,58],[98,52]), c:CLR.rush,w:2.2,a:true },
      { d:CB([94,DL_Y],[88,64],[82,58],[76,52]), c:CLR.rush,w:2.2,a:true },
      { d:P([130,OLB_Y],[138,56]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([112,DL_Y],[118,58],[126,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },

  /* ═══ SIMULATED FIRE LAYER 26-30 ═══════════════════ */
  {
    id:26, name:'SimFireStrong', label:'Sim Fire Strong', cat:'sim',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.sim,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:27, name:'SimFireWeak', label:'Sim Fire Weak', cat:'sim',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([70,OLB_Y],[62,56]), c:CLR.sim,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,34]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:28, name:'NickelSimExchange', label:'Nickel Sim Exchange', cat:'sim',
    sk:[...BASE_34_SK, { x: 52, y: 40, t: 'DB' }],
    dl:DL_34,
    rt:[
      { d:P([52,40],[62,54]), c:CLR.sim,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:29, name:'MikeMugSim', label:'Mike Mug Sim', cat:'sim',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([86,LB_Y],[90,56]), c:CLR.sim,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:30, name:'BoundaryCreeperSim', label:'Boundary Creeper Sim', cat:'sim',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.sim,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },

  /* ═══ MAN-BLENDED PRESSURE 31-35 ═══════════════════ */
  {
    id:31, name:'C1CrossDog', label:'C1 Cross Dog', cat:'man',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([86,LB_Y],[96,56],[106,54],[118,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([114,LB_Y],[104,56],[94,54],[82,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:32, name:'C1OLBLoop', label:'C1 OLB Loop', cat:'man',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([70,OLB_Y],[82,58],[94,56],[108,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([130,OLB_Y],[136,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[70,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([94,DL_Y],[100,58],[108,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:33, name:'C1NickelCat', label:'C1 Nickel Cat', cat:'man',
    sk:[...BASE_34_SK, { x: 52, y: 40, t: 'DB' }],
    dl:DL_34,
    rt:[
      { d:P([52,40],[62,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,OLB_Y],[64,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:34, name:'C1DoubleA', label:'C1 Double A', cat:'man',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([86,LB_Y],[90,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([114,LB_Y],[110,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:35, name:'C1RobberFire', label:'C1 Robber Fire', cat:'man',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,30]), c:CLR.robber,w:2.0,a:true },
    ],
  },

  /* ═══ RED ZONE / TRAP 36-40 ════════════════════════ */
  {
    id:36, name:'RedFireStrong', label:'Red Fire Strong', cat:'red',
    sk:[
      { x:24,  y:36, t:'CB'  },
      { x:70,  y:52, t:'OLB' },
      { x:86,  y:46, t:'ILB' },
      { x:114, y:46, t:'ILB' },
      { x:130, y:52, t:'OLB' },
      { x:176, y:36, t:'CB'  },
      { x:78,  y:24, t:'S'   },
      { x:122, y:24, t:'S'   },
    ],
    dl:DL_34,
    rt:[
      { d:P([130,52],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,52],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,36],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,36],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,24],[100,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,24],[122,30]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:37, name:'RedFireBoundary', label:'Red Fire Boundary', cat:'red',
    sk:[
      { x:24,  y:36, t:'CB'  },
      { x:70,  y:52, t:'OLB' },
      { x:86,  y:46, t:'ILB' },
      { x:114, y:46, t:'ILB' },
      { x:130, y:52, t:'OLB' },
      { x:176, y:36, t:'CB'  },
      { x:78,  y:24, t:'S'   },
      { x:122, y:24, t:'S'   },
    ],
    dl:DL_34,
    rt:[
      { d:P([24,36],[34,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,52],[62,56]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,52],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([176,36],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,24],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,24],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:38, name:'RedC1Fire', label:'Red C1 Fire', cat:'red',
    sk:[
      { x:24,  y:36, t:'CB'  },
      { x:70,  y:52, t:'OLB' },
      { x:86,  y:46, t:'ILB' },
      { x:114, y:46, t:'ILB' },
      { x:130, y:52, t:'OLB' },
      { x:176, y:36, t:'CB'  },
      { x:78,  y:24, t:'S'   },
      { x:122, y:24, t:'S'   },
    ],
    dl:DL_34,
    rt:[
      { d:P([130,52],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,52],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,36],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,36],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,24],[100,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,24],[122,30]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:39, name:'Drop8CloudFireLook', label:'Drop-8 Cloud Fire Look', cat:'red',
    sk:[...BASE_34_SK, ...DIME_DB],
    dl:[
      { x: 94, y: DL_Y, t:'NT' },
      { x: 112,y: DL_Y, t:'DE' },
    ],
    rt:[
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([112,DL_Y],[118,58],[126,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.trap,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([54,40],[54,20]), c:CLR.zone,w:2.0,a:true },
      { d:P([146,40],[146,20]), c:CLR.zone,w:2.0,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:40, name:'BracketPlusFire', label:'Bracket + Fire', cat:'red',
    sk:[...BASE_34_SK, ...DIME_DB],
    dl:DL_34,
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([54,40],[54,22]), c:CLR.bracket,w:2.0,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
      { d:P([78,S_Y],[100,14]), c:CLR.zone,w:2.2,a:true },
    ],
  },
];

/* ── SVG DEFS ────────────────────────────────── */
function SVGDefs() {
  return (
    <defs>
      {ARROW_COLORS.map(color => (
        <marker key={color}
          id={`ar-${color.replace('#', '')}`}
          markerWidth="7" markerHeight="7"
          refX="6" refY="3.5"
          orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0.5 L0,6.5 L7,3.5 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

/* ── PLAYER ──────────────────────────────────── */
const PLAYER_COLORS = {
  CB:'#60a5fa',
  S:'#a78bfa',
  OLB:'#f87171',
  ILB:'#34d399',
  DE:'#f59e0b',
  NT:'#8b9ab5',
  DT:'#64748b',
  DB:'#f472b6',
};

function Player({ x, y, t, large = false }) {
  const c = PLAYER_COLORS[t] || '#fff';
  const r = large ? 6.2 : 4.8;

  if (t === 'NT' || t === 'DT') {
    const s = large ? 10 : 8;
    return (
      <g>
        <rect x={x - s / 2} y={y - s * 0.45} width={s} height={s * 0.9}
              fill={c} rx={1.5} opacity={0.92} />
        <rect x={x - s / 2} y={y - s * 0.45} width={s} height={s * 0.9}
              fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} rx={1.5} />
      </g>
    );
  }

  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={c} opacity={0.92} />
      <circle cx={x} cy={y} r={r} fill="none"
              stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
      {large && (
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
              fontSize={5.2} fill="#000" fontWeight="800" fontFamily="monospace">
          {t}
        </text>
      )}
    </g>
  );
}

/* ── ROUTE / ASSIGNMENT ──────────────────────── */
function Route({ d, c, w = 1.5, a = false, dsh = false }) {
  const markerEnd = a ? `url(#ar-${c.replace('#', '')})` : undefined;
  return (
    <path d={d} fill="none" stroke={c} strokeWidth={w}
          strokeDasharray={dsh ? '5,3' : undefined}
          markerEnd={markerEnd}
          strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />
  );
}

/* ── FIELD SVG ───────────────────────────────── */
function PlayField({ play, large = false }) {
  const offensiveLOS = [40, 52, 64, 76, 88];
  return (
    <svg viewBox="0 0 200 130" width="100%" style={{ display: 'block' }}>
      <SVGDefs />
      <rect width={200} height={130} fill="#0f0b14" />

      {[14, 28, 42, 56].map(y => (
        <line key={y} x1={0} y1={y} x2={200} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} strokeDasharray="3,5" />
      ))}

      <line x1={0} y1={LOS} x2={200} y2={LOS}
            stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />

      {offensiveLOS.map((x, i) => (
        <rect key={i}
          x={x - 4} y={LOS - 3.5} width={8} height={7}
          fill="rgba(255,255,255,0.08)" rx={1.3} />
      ))}

      {play.rt.map((r, i) => <Route key={i} {...r} />)}
      {(play.dl || []).map((p, i) => <Player key={`dl-${i}`} x={p.x} y={p.y} t={p.t} large={large} />)}
      {play.sk.map((p, i) => <Player key={`sk-${i}`} x={p.x} y={p.y} t={p.t} large={large} />)}

      <ellipse cx={76} cy={LOS - 1} rx={3.3} ry={2.1}
               fill="#c97b2a" stroke="#f59e2e" strokeWidth={0.5} opacity={0.55} />
    </svg>
  );
}

/* ── LEGENDS ─────────────────────────────────── */
const LEGENDS = {
  base: [
    { c: CLR.zone,   l: 'Zone / Shell' },
    { c: CLR.man,    l: 'Lock / Match' },
    { c: CLR.drop,   l: 'Hook / Curl' },
    { c: CLR.robber, l: 'Buzz / Robber' },
    { c: CLR.fit,    l: 'Carry / Fit' },
  ],
  fire: [
    { c: CLR.blitz, l: 'Blitz' },
    { c: CLR.rush,  l: 'Rush' },
    { c: CLR.drop,  l: 'Edge / DL Drop' },
    { c: CLR.zone,  l: 'Fire Zone' },
    { c: CLR.robber,l: 'Middle Help' },
  ],
  exchange: [
    { c: CLR.rush,  l: 'Exchange Rush' },
    { c: CLR.drop,  l: 'Replace Drop' },
    { c: CLR.zone,  l: 'Coverage Shell' },
    { c: CLR.robber,l: 'Middle Rotate' },
  ],
  sim: [
    { c: CLR.sim,   l: 'Simulated Pressure' },
    { c: CLR.rush,  l: 'Rush' },
    { c: CLR.drop,  l: 'Dropper' },
    { c: CLR.zone,  l: 'Zone Behind It' },
  ],
  man: [
    { c: CLR.blitz, l: 'Pressure' },
    { c: CLR.man,   l: 'Man' },
    { c: CLR.drop,  l: 'Replace Drop' },
    { c: CLR.robber,l: 'Robber' },
    { c: CLR.zone,  l: 'Middle Help' },
  ],
  red: [
    { c: CLR.blitz,  l: 'Red Pressure' },
    { c: CLR.man,    l: 'Red Man' },
    { c: CLR.zone,   l: 'Red Zone' },
    { c: CLR.bracket,l: 'Bracket' },
    { c: CLR.trap,   l: 'Trap / Cloud' },
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
        background: hov ? '#1a1321' : '#120d17',
        border: `1px solid ${hov ? meta.accent + '55' : '#23182b'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'all 0.18s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 6px 24px ${meta.accent}28` : '0 2px 8px rgba(0,0,0,0.45)',
      }}>
      <div style={{ position: 'relative' }}>
        <PlayField play={play} />
        <div style={{
          position: 'absolute', top: 6, right: 7,
          background: meta.accent + '22',
          border: `1px solid ${meta.accent}55`,
          borderRadius: 4, padding: '2px 5px',
          fontSize: 8, fontWeight: 800, letterSpacing: '1.5px',
          color: meta.accent, fontFamily: 'monospace',
        }}>{meta.short}</div>
        <div style={{
          position: 'absolute', top: 6, left: 7,
          color: 'rgba(255,255,255,0.22)', fontSize: 9,
          fontWeight: 700, fontFamily: 'monospace',
        }}>{String(play.id).padStart(2, '0')}</div>
      </div>
      <div style={{
        padding: '6px 9px 8px',
        borderTop: `1px solid ${hov ? meta.accent + '35' : '#23182b'}`,
        background: hov ? meta.bg : 'transparent',
      }}>
        <div style={{
          color: '#f3ecff', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.3px', lineHeight: 1.3,
          fontFamily: "'Courier New', monospace",
        }}>{play.name}</div>
      </div>
    </div>
  );
}

/* ── MODAL ───────────────────────────────────── */
function PlayModal({ play, onClose }) {
  const meta = CAT_META[play.cat];

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(8,4,12,0.9)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #18101d 0%, #0f0a14 100%)',
        border: `1px solid ${meta.accent}45`,
        borderRadius: 18,
        overflow: 'hidden',
        width: '100%', maxWidth: 440,
        boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${meta.accent}18`,
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{
          padding: '14px 16px 12px',
          background: `linear-gradient(90deg, ${meta.accent}14, transparent)`,
          borderBottom: `1px solid ${meta.accent}30`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                background: meta.accent, borderRadius: 4, padding: '2px 7px',
                fontSize: 9, fontWeight: 900, letterSpacing: '2px',
                color: '#000', fontFamily: 'monospace',
              }}>{meta.short}</div>
              <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9, fontFamily: 'monospace' }}>
                CALL #{String(play.id).padStart(2, '0')}
              </span>
            </div>
            <div style={{
              color: '#f3ecff', fontSize: 20, fontWeight: 900,
              fontFamily: "'Courier New', monospace", letterSpacing: '-0.5px',
            }}>{play.name}</div>
            <div style={{ color: meta.accent, fontSize: 11, fontWeight: 500, opacity: 0.82, marginTop: 2 }}>
              {play.label}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.5)',
            width: 30, height: 30, borderRadius: 15,
            cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>×</button>
        </div>

        <div style={{ background: '#0f0a14', padding: '0 0 4px' }}>
          <PlayField play={play} large={true} />
        </div>

        <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${meta.accent}20` }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,0.28)', marginBottom: 8, fontFamily: 'monospace',
          }}>LEGEND</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 8 }}>
            {[
              ['CB','#60a5fa'],['S','#a78bfa'],['OLB','#f87171'],['ILB','#34d399'],
              ['DE','#f59e0b'],['NT','#8b9ab5'],['DT','#64748b'],['DB','#f472b6']
            ].map(([t, c]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: (t === 'NT' || t === 'DT') ? 2 : 5, background: c, opacity: 0.85 }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 14px' }}>
            {(LEGENDS[play.cat] || []).map(({ c, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width={18} height={6}>
                  <line x1={0} y1={3} x2={14} y2={3} stroke={c} strokeWidth={2.5} strokeLinecap="round" />
                  <polygon points="12,0.5 12,5.5 18,3" fill={c} />
                </svg>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }}>{l}</span>
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
  { id:'all',      label:'All 40',       accent:'#94a3b8' },
  { id:'base',     label:'Base (10)',    accent:'#60a5fa' },
  { id:'fire',     label:'Fire (10)',    accent:'#ef4444' },
  { id:'exchange', label:'Exchange (5)', accent:'#34d399' },
  { id:'sim',      label:'Sim (5)',      accent:'#f59e0b' },
  { id:'man',      label:'Man (5)',      accent:'#f472b6' },
  { id:'red',      label:'Red (5)',      accent:'#a78bfa' },
];

/* ── APP ─────────────────────────────────────── */
export default function LeBeauZoneBlitzPlaybook() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const displayed = filter === 'all' ? PLAYS : PLAYS.filter(p => p.cat === filter);

  return (
    <div style={{
      background: '#0b0810',
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
        ::-webkit-scrollbar-track { background:#0b0810 }
        ::-webkit-scrollbar-thumb { background:#311f3a; border-radius:2px }
        * { box-sizing:border-box }
      `}</style>

      <div style={{
        background: 'linear-gradient(180deg, #17111d 0%, #0f0a14 100%)',
        borderBottom: '1px solid #23182b',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))' }}>
            🛡️
          </div>
          <div>
            <div style={{ color:'#f3ecff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              LeBEAU ZONE BLITZ
            </div>
            <div style={{ color:'#ef4444', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.82 }}>
              FIRE ZONES · EXCHANGE PRESSURE · DICK LeBEAU DNA
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
              <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
                background: active ? cat.accent + '18' : 'transparent',
                color: active ? cat.accent : 'rgba(255,255,255,0.3)',
                border: 'none',
                borderBottom: active ? `2px solid ${cat.accent}` : '2px solid transparent',
                padding: '7px 10px 9px',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap', letterSpacing: '0.5px',
                fontFamily: "'Courier New', monospace",
                transition: 'all 0.15s',
                flexShrink: 0,
              }}>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8, padding: 10,
      }}>
        {displayed.map((play, idx) => (
          <div key={play.id} style={{
            animation: `cardIn 0.25s ease both`,
            animationDelay: `${idx * 0.03}s`,
          }}>
            <PlayCard play={play} onClick={() => setSelected(play)} />
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center', padding: '12px 16px 20px',
        borderTop: '1px solid #17111d',
        color: 'rgba(255,255,255,0.12)',
        fontSize: 9, letterSpacing: '2px',
      }}>
        LeBEAU ZONE BLITZ · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
