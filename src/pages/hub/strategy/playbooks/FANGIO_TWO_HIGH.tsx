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
  stunt:    '#fb923c',
  rotate:   '#22c55e',
};

const CAT_META = {
  base:     { label: 'Base Split-Safety', short: 'BASE', accent: '#60a5fa', bg: '#60a5fa12' },
  front:    { label: 'Front / Fit',       short: 'FIT',  accent: '#34d399', bg: '#34d39912' },
  sim:      { label: 'Sim / Creeper',     short: 'SIM',  accent: '#f59e0b', bg: '#f59e0b12' },
  pressure: { label: 'Fire / Pressure',   short: 'FIRE', accent: '#ef4444', bg: '#ef444412' },
  dime:     { label: 'Dime / Red Zone',   short: 'DIME', accent: '#a78bfa', bg: '#a78bfa12' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s, c, e) => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s, c1, c2, e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* Defensive shell landmarks */
const S_Y = 30;
const LB_Y = 52;
const DL_Y = 70;
const CB_PRESS_Y = 38;
const CB_OFF_Y = 30;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#f472b6','#ef4444','#f59e0b',
  '#34d399','#a78bfa','#fbbf24','#64748b','#f87171','#22c55e','#fb923c',
];

/* ── COMMON PLAYER HELPERS ───────────────────── */
const BASE_SKILL_43 = [
  { x: 24,  y: CB_OFF_Y, t: 'CB' },
  { x: 64,  y: LB_Y,     t: 'N'  },
  { x: 82,  y: LB_Y,     t: 'LB' },
  { x: 100, y: LB_Y,     t: 'LB' },
  { x: 118, y: LB_Y,     t: 'LB' },
  { x: 176, y: CB_OFF_Y, t: 'CB' },
  { x: 76,  y: S_Y,      t: 'S'  },
  { x: 124, y: S_Y,      t: 'S'  },
];

const DL_4 = [
  { x: 66,  y: DL_Y, t: 'EDGE' },
  { x: 88,  y: DL_Y, t: 'DT'   },
  { x: 100, y: DL_Y, t: 'DT'   },
  { x: 122, y: DL_Y, t: 'EDGE' },
];

const DL_MINT = [
  { x: 72,  y: DL_Y, t: 'EDGE' },
  { x: 88,  y: DL_Y, t: 'DT'   },
  { x: 100, y: DL_Y, t: 'DT'   },
  { x: 112, y: DL_Y, t: 'DT'   },
  { x: 128, y: DL_Y, t: 'EDGE' },
];

const DIME_EXTRA = [
  { x: 54,  y: 42, t: 'DB' },
  { x: 146, y: 42, t: 'DB' },
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ BASE SPLIT-SAFETY 1-10 ═══════════════════════ */
  {
    id:1, name:'FangioQuarters', label:'Fangio Quarters', cat:'base',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),       c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),     c:CLR.zone, w:2.2, a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]),   c:CLR.zone, w:2.2, a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]),c:CLR.zone, w:2.2, a:true },
      { d:QQ([64,LB_Y],[60,42],[56,34]),  c:CLR.drop, w:1.8, a:true },
      { d:QQ([82,LB_Y],[80,44],[78,36]),  c:CLR.drop, w:1.8, a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]),c:CLR.drop,w:1.8,a:true },
      { d:QQ([118,LB_Y],[120,44],[122,36]),c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:2, name:'FangioC6', label:'Fangio C6', cat:'base',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,26],[10,18],[8,12]), c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),               c:CLR.zone, w:2.2, a:true },
      { d:CB([76,S_Y],[86,16],[100,14],[114,16]),  c:CLR.zone, w:2.2, a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]),c:CLR.zone, w:2.2, a:true },
      { d:QQ([64,LB_Y],[60,42],[56,34]),            c:CLR.drop,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([118,LB_Y],[120,44],[122,36]),         c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:3, name:'FangioC6Press', label:'Fangio C6 Press', cat:'base',
    sk:[
      { x: 24,  y: CB_PRESS_Y, t: 'CB' },
      { x: 64,  y: LB_Y,       t: 'N'  },
      { x: 82,  y: LB_Y,       t: 'LB' },
      { x: 100, y: LB_Y,       t: 'LB' },
      { x: 118, y: LB_Y,       t: 'LB' },
      { x: 176, y: CB_PRESS_Y, t: 'CB' },
      { x: 76,  y: S_Y,        t: 'S'  },
      { x: 124, y: S_Y,        t: 'S'  },
    ],
    dl:DL_4,
    rt:[
      { d:CB([24,CB_PRESS_Y],[16,28],[10,20],[8,12]), c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_PRESS_Y],[176,18]),               c:CLR.zone, w:2.2, a:true },
      { d:CB([76,S_Y],[86,16],[100,14],[114,16]),     c:CLR.zone, w:2.2, a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]),   c:CLR.zone, w:2.2, a:true },
      { d:P([24,CB_PRESS_Y],[24,CB_PRESS_Y+6]),       c:CLR.man,  w:1.4, a:false,dsh:true },
      { d:P([176,CB_PRESS_Y],[176,CB_PRESS_Y+6]),     c:CLR.man,  w:1.4, a:false,dsh:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]),           c:CLR.drop, w:1.8, a:true },
    ],
  },
  {
    id:4, name:'FangioC6Cloud', label:'Fangio C6 Cloud', cat:'base',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,26],[10,18],[8,12]), c:CLR.zone, w:2.2, a:true },
      { d:CB([76,S_Y],[88,18],[102,18],[116,20]),  c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),              c:CLR.zone, w:2.2, a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]),c:CLR.zone, w:2.2, a:true },
      { d:QQ([64,LB_Y],[58,40],[54,30]),           c:CLR.fit,  w:1.8, a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]),        c:CLR.drop, w:1.8, a:true },
      { d:QQ([118,LB_Y],[122,44],[126,36]),        c:CLR.drop, w:1.8, a:true },
    ],
  },
  {
    id:5, name:'FangioQuartersOff', label:'Fangio Quarters Off', cat:'base',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]),               c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,14]),             c:CLR.zone, w:2.2, a:true },
      { d:CB([76,S_Y],[60,12],[44,10],[28,12]),   c:CLR.zone, w:2.2, a:true },
      { d:CB([124,S_Y],[140,12],[156,10],[172,12]),c:CLR.zone,w:2.2,a:true },
      { d:QQ([64,LB_Y],[60,44],[56,38]),          c:CLR.drop,w:1.8,a:true },
      { d:QQ([82,LB_Y],[80,46],[78,40]),          c:CLR.drop,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,46],[100,40]),       c:CLR.drop,w:1.8,a:true },
      { d:QQ([118,LB_Y],[120,46],[122,40]),       c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:6, name:'FangioPoach', label:'Fangio Poach', cat:'base',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),              c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),            c:CLR.zone, w:2.2, a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]),  c:CLR.zone, w:2.2, a:true },
      { d:CB([124,S_Y],[112,20],[100,18],[88,14]),c:CLR.rotate,w:2.2,a:true,dsh:true },
      { d:QQ([82,LB_Y],[84,42],[88,34]),         c:CLR.drop,  w:1.8, a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]),      c:CLR.drop,  w:1.8, a:true },
      { d:QQ([118,LB_Y],[120,44],[122,36]),      c:CLR.drop,  w:1.8, a:true },
    ],
  },
  {
    id:7, name:'FangioSolo', label:'Fangio Solo', cat:'base',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),               c:CLR.man,   w:2.0, a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),             c:CLR.zone,  w:2.2, a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]),   c:CLR.zone,  w:2.2, a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]),c:CLR.zone, w:2.2, a:true },
      { d:QQ([64,LB_Y],[58,42],[54,34]),          c:CLR.drop,  w:1.8, a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]),       c:CLR.drop,  w:1.8, a:true },
      { d:QQ([118,LB_Y],[122,44],[126,36]),       c:CLR.drop,  w:1.8, a:true },
    ],
  },
  {
    id:8, name:'FangioStubbie', label:'Fangio Stubbie', cat:'base',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),               c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),             c:CLR.zone, w:2.2, a:true },
      { d:CB([76,S_Y],[62,16],[50,16],[40,18]),   c:CLR.zone, w:2.2, a:true },
      { d:CB([124,S_Y],[138,16],[150,16],[160,18]),c:CLR.zone,w:2.2,a:true },
      { d:QQ([64,LB_Y],[66,40],[70,30]),          c:CLR.bracket,w:1.8,a:true },
      { d:QQ([118,LB_Y],[116,40],[112,30]),       c:CLR.bracket,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]),       c:CLR.drop, w:1.8,a:true },
    ],
  },
  {
    id:9, name:'FangioSpecial', label:'Fangio Special', cat:'base',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:CB([24,CB_OFF_Y],[18,26],[12,18],[10,12]), c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.zone, w:2.2, a:true },
      { d:CB([76,S_Y],[88,18],[102,18],[116,20]),    c:CLR.zone, w:2.2, a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]),  c:CLR.zone, w:2.2, a:true },
      { d:QQ([64,LB_Y],[58,40],[52,30]),             c:CLR.bracket,w:1.8,a:true },
      { d:QQ([82,LB_Y],[84,44],[88,36]),             c:CLR.drop,   w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]),          c:CLR.drop,   w:1.8,a:true },
    ],
  },
  {
    id:10, name:'FangioBox', label:'Fangio Box', cat:'base',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),               c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),             c:CLR.zone, w:2.2, a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]),   c:CLR.zone, w:2.2, a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]),c:CLR.zone,w:2.2,a:true },
      { d:QQ([64,LB_Y],[62,42],[60,36]),          c:CLR.fit,  w:1.8, a:true },
      { d:QQ([82,LB_Y],[84,42],[86,36]),          c:CLR.fit,  w:1.8, a:true },
      { d:QQ([100,LB_Y],[98,42],[96,36]),         c:CLR.fit,  w:1.8, a:true },
      { d:QQ([118,LB_Y],[116,42],[114,36]),       c:CLR.fit,  w:1.8, a:true },
    ],
  },

  /* ═══ FRONT / FIT 11-15 ═════════════════════════════ */
  {
    id:11, name:'MintFront', label:'Mint Front', cat:'front',
    sk:[...BASE_SKILL_43],
    dl:DL_MINT,
    rt:[
      { d:P([72,DL_Y],[72,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.front,w:2.2,a:true },
      { d:P([112,DL_Y],[112,60]), c:CLR.front,w:2.2,a:true },
      { d:P([128,DL_Y],[128,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([82,LB_Y],[82,42],[82,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,42],[100,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([118,LB_Y],[118,42],[118,34]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:12, name:'TiteFront', label:'Tite Front', cat:'front',
    sk:[...BASE_SKILL_43],
    dl:[
      { x: 70, y: DL_Y, t: 'EDGE' },
      { x: 86, y: DL_Y, t: 'DT'   },
      { x: 100,y: DL_Y, t: 'DT'   },
      { x: 114,y: DL_Y, t: 'DT'   },
      { x: 130,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([70,DL_Y],[70,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.front,w:2.2,a:true },
      { d:P([114,DL_Y],[114,60]), c:CLR.front,w:2.2,a:true },
      { d:P([130,DL_Y],[130,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([64,LB_Y],[62,42],[60,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([118,LB_Y],[120,42],[122,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,42],[100,34]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:13, name:'UnderFront', label:'Under Front', cat:'front',
    sk:[...BASE_SKILL_43],
    dl:[
      { x: 60, y: DL_Y, t: 'EDGE' },
      { x: 82, y: DL_Y, t: 'DT'   },
      { x: 96, y: DL_Y, t: 'DT'   },
      { x: 126,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([60,DL_Y],[60,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([96,DL_Y],[96,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([64,LB_Y],[58,42],[52,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([82,LB_Y],[84,42],[86,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([118,LB_Y],[120,42],[122,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:14, name:'BearChangeup', label:'Bear Changeup', cat:'front',
    sk:[...BASE_SKILL_43],
    dl:[
      { x: 66, y: DL_Y, t: 'EDGE' },
      { x: 80, y: DL_Y, t: 'DT'   },
      { x: 92, y: DL_Y, t: 'DT'   },
      { x: 104,y: DL_Y, t: 'DT'   },
      { x: 122,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([66,DL_Y],[66,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([80,DL_Y],[80,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([92,DL_Y],[92,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]), c:CLR.front,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([64,LB_Y],[60,42],[56,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([118,LB_Y],[122,42],[126,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:15, name:'Wide9Edge', label:'Wide 9 Edge', cat:'front',
    sk:[...BASE_SKILL_43],
    dl:[
      { x: 54, y: DL_Y, t: 'EDGE' },
      { x: 88, y: DL_Y, t: 'DT'   },
      { x: 100,y: DL_Y, t: 'DT'   },
      { x: 134,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([54,DL_Y],[54,56]),   c:CLR.front,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.front,w:2.2,a:true },
      { d:P([134,DL_Y],[134,56]), c:CLR.front,w:2.2,a:true },
      { d:QQ([64,LB_Y],[60,42],[56,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([82,LB_Y],[84,42],[86,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,42],[100,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([118,LB_Y],[116,42],[114,34]), c:CLR.fit,w:1.8,a:true },
    ],
  },

  /* ═══ SIM / CREEPERS 16-25 ══════════════════════════ */
  {
    id:16, name:'NickelSimStrong', label:'Nickel Sim Strong', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([64,LB_Y],[72,58]), c:CLR.sim,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]), c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]), c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([122,DL_Y],[128,60],[136,54]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([82,LB_Y],[82,42],[82,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:17, name:'NickelSimWeak', label:'Nickel Sim Weak', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([118,LB_Y],[112,58]), c:CLR.sim,w:2.4,a:true },
      { d:P([122,DL_Y],[122,58]), c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),   c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([66,DL_Y],[60,60],[52,54]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([100,LB_Y],[100,42],[100,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:18, name:'MikeMugSim', label:'Mike Mug Sim', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([100,LB_Y],[100,60]), c:CLR.sim,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]),   c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),   c:CLR.pressure,w:2.2,a:true },
      { d:QQ([100,DL_Y],[108,60],[116,54]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([122,DL_Y],[128,60],[136,54]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:19, name:'BoundaryCreeper', label:'Boundary Creeper', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.sim,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]),     c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),     c:CLR.pressure,w:2.2,a:true },
      { d:QQ([122,DL_Y],[128,60],[136,54]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.rotate,w:2.2,a:true,dsh:true },
      { d:QQ([82,LB_Y],[84,42],[86,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,42],[100,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:20, name:'TackleDropSim', label:'Tackle Drop Sim', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([118,LB_Y],[112,58]), c:CLR.sim,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]),   c:CLR.pressure,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([100,DL_Y],[104,58],[110,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:21, name:'EdgeReplaceSim', label:'Edge Replace Sim', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([82,LB_Y],[70,58]), c:CLR.sim,w:2.4,a:true },
      { d:P([88,DL_Y],[88,60]), c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([66,DL_Y],[60,60],[54,52]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([118,LB_Y],[120,42],[122,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:22, name:'SafetyInsertSim', label:'Safety Insert Sim', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([124,S_Y],[114,50]), c:CLR.sim,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]),  c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),  c:CLR.pressure,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]),c:CLR.pressure,w:2.2,a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([100,LB_Y],[100,42],[100,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([118,LB_Y],[120,42],[122,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:23, name:'CrossSim', label:'Cross Sim', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:CB([82,LB_Y],[90,56],[98,54],[106,58]), c:CLR.sim,w:2.4,a:true },
      { d:CB([118,LB_Y],[110,56],[102,54],[94,58]), c:CLR.sim,w:2.4,a:true },
      { d:P([88,DL_Y],[88,60]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([66,DL_Y],[60,60],[54,52]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([122,DL_Y],[128,60],[136,52]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:24, name:'FieldCreeper', label:'Field Creeper', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([176,CB_OFF_Y],[166,52]), c:CLR.sim,w:2.4,a:true },
      { d:P([122,DL_Y],[122,58]),     c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),     c:CLR.pressure,w:2.2,a:true },
      { d:QQ([66,DL_Y],[60,60],[54,52]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.rotate,w:2.2,a:true,dsh:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([82,LB_Y],[84,42],[86,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,42],[100,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:25, name:'DoubleMugDrop', label:'Double Mug Drop', cat:'sim',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([82,LB_Y],[82,60]), c:CLR.sim,w:2.4,a:true },
      { d:P([100,LB_Y],[100,60]), c:CLR.sim,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]), c:CLR.pressure,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([82,LB_Y],[78,46],[74,34]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([100,LB_Y],[104,46],[108,34]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
    ],
  },

  /* ═══ FIRE / PRESSURE 26-32 ════════════════════════ */
  {
    id:26, name:'NickelFire', label:'Nickel Fire', cat:'pressure',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([64,LB_Y],[72,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]), c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]), c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.pressure,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([118,LB_Y],[120,42],[122,34]), c:CLR.drop,w:1.8,a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:27, name:'BoundaryCat', label:'Boundary Cat', cat:'pressure',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]),     c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),     c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),   c:CLR.pressure,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]),   c:CLR.pressure,w:2.2,a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.rotate,w:2.2,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([100,LB_Y],[100,42],[100,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:28, name:'FieldFire', label:'Field Fire', cat:'pressure',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([176,CB_OFF_Y],[166,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]),       c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),       c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),     c:CLR.pressure,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]),     c:CLR.pressure,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.rotate,w:2.2,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([82,LB_Y],[82,42],[82,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:29, name:'CrossDogMatch', label:'Cross Dog Match', cat:'pressure',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:CB([82,LB_Y],[90,56],[98,54],[106,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([100,LB_Y],[92,56],[84,54],[76,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]), c:CLR.pressure,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]), c:CLR.pressure,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.bracket,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.bracket,w:2.2,a:true },
    ],
  },
  {
    id:30, name:'SamFire', label:'Sam Fire', cat:'pressure',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([118,LB_Y],[126,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]),   c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),   c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.pressure,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([64,LB_Y],[60,42],[56,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:31, name:'WillFire', label:'Will Fire', cat:'pressure',
    sk:[...BASE_SKILL_43],
    dl:DL_4,
    rt:[
      { d:P([82,LB_Y],[74,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([66,DL_Y],[66,58]), c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]), c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.pressure,w:2.2,a:true },
      { d:P([122,DL_Y],[122,58]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([118,LB_Y],[122,42],[126,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:32, name:'MintFire', label:'Mint Fire', cat:'pressure',
    sk:[...BASE_SKILL_43],
    dl:DL_MINT,
    rt:[
      { d:P([64,LB_Y],[72,58]),   c:CLR.blitz,w:2.4,a:true },
      { d:P([72,DL_Y],[72,58]),   c:CLR.pressure,w:2.2,a:true },
      { d:P([88,DL_Y],[88,60]),   c:CLR.pressure,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.pressure,w:2.2,a:true },
      { d:P([112,DL_Y],[112,60]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([128,DL_Y],[134,60],[142,54]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]), c:CLR.zone,w:2.2,a:true },
    ],
  },

  /* ═══ DIME / LONG YARDAGE / RED ZONE 33-40 ═════════ */
  {
    id:33, name:'Dime2Man', label:'Dime 2-Man', cat:'dime',
    sk:[...BASE_SKILL_43, ...DIME_EXTRA],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,42],[54,20]),       c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([146,42],[146,20]),     c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([76,S_Y],[64,14],[50,12],[38,14]),   c:CLR.bracket,w:2.2,a:true },
      { d:CB([124,S_Y],[136,14],[150,12],[162,14]),c:CLR.bracket,w:2.2,a:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]),       c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:34, name:'DimeDrop8', label:'Dime Drop-8', cat:'dime',
    sk:[...BASE_SKILL_43, ...DIME_EXTRA],
    dl:[
      { x: 88, y: DL_Y, t: 'DT'   },
      { x: 100,y: DL_Y, t: 'DT'   },
      { x: 122,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([88,DL_Y],[88,60]), c:CLR.pressure,w:2.2,a:true },
      { d:QQ([100,DL_Y],[104,58],[110,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([122,DL_Y],[128,58],[136,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([54,42],[54,20]), c:CLR.zone,w:2.0,a:true },
      { d:P([146,42],[146,20]), c:CLR.zone,w:2.0,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([76,S_Y],[62,12],[48,10],[34,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,S_Y],[138,12],[152,10],[166,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:35, name:'DimeQuartersBracket', label:'Dime Quarters Bracket', cat:'dime',
    sk:[...BASE_SKILL_43, ...DIME_EXTRA],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([76,S_Y],[60,12],[44,10],[28,12]), c:CLR.bracket,w:2.2,a:true },
      { d:CB([124,S_Y],[140,12],[156,10],[172,12]), c:CLR.bracket,w:2.2,a:true },
      { d:P([54,42],[54,24]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([146,42],[146,24]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([100,LB_Y],[100,44],[100,36]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:36, name:'RedMatch', label:'Red Match', cat:'dime',
    sk:[
      { x: 24,  y: 34, t: 'CB' },
      { x: 64,  y: 48, t: 'N'  },
      { x: 82,  y: 48, t: 'LB' },
      { x: 100, y: 48, t: 'LB' },
      { x: 118, y: 48, t: 'LB' },
      { x: 176, y: 34, t: 'CB' },
      { x: 76,  y: 24, t: 'S'  },
      { x: 124, y: 24, t: 'S'  },
    ],
    dl:DL_4,
    rt:[
      { d:P([24,34],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,34],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([76,24],[64,10],[54,8],[46,10]), c:CLR.bracket,w:2.2,a:true },
      { d:CB([124,24],[136,10],[146,8],[154,10]), c:CLR.bracket,w:2.2,a:true },
      { d:QQ([64,48],[60,38],[56,30]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([100,48],[100,38],[100,30]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([118,48],[122,38],[126,30]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:37, name:'RedClamp', label:'Red Clamp', cat:'dime',
    sk:[
      { x: 24,  y: 34, t: 'CB' },
      { x: 64,  y: 48, t: 'N'  },
      { x: 82,  y: 48, t: 'LB' },
      { x: 100, y: 48, t: 'LB' },
      { x: 118, y: 48, t: 'LB' },
      { x: 176, y: 34, t: 'CB' },
      { x: 76,  y: 24, t: 'S'  },
      { x: 124, y: 24, t: 'S'  },
    ],
    dl:DL_4,
    rt:[
      { d:P([24,34],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,34],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([64,48],[66,34],[70,24]), c:CLR.bracket,w:1.8,a:true },
      { d:QQ([118,48],[116,34],[112,24]), c:CLR.bracket,w:1.8,a:true },
      { d:CB([76,24],[62,10],[48,8],[34,10]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,24],[138,10],[152,8],[166,10]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([100,48],[100,38],[100,30]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:38, name:'RedPoach', label:'Red Poach', cat:'dime',
    sk:[
      { x: 24,  y: 34, t: 'CB' },
      { x: 64,  y: 48, t: 'N'  },
      { x: 82,  y: 48, t: 'LB' },
      { x: 100, y: 48, t: 'LB' },
      { x: 118, y: 48, t: 'LB' },
      { x: 176, y: 34, t: 'CB' },
      { x: 76,  y: 24, t: 'S'  },
      { x: 124, y: 24, t: 'S'  },
    ],
    dl:DL_4,
    rt:[
      { d:P([24,34],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,34],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([76,24],[62,10],[48,8],[34,10]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,24],[112,18],[100,16],[88,12]), c:CLR.rotate,w:2.2,a:true,dsh:true },
      { d:QQ([64,48],[60,38],[56,30]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([100,48],[100,38],[100,30]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([118,48],[122,38],[126,30]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:39, name:'GoalLineSplitSafety', label:'Goal Line Split-Safety', cat:'dime',
    sk:[
      { x: 24,  y: 40, t: 'CB' },
      { x: 76,  y: 28, t: 'S'  },
      { x: 82,  y: 48, t: 'LB' },
      { x: 100, y: 48, t: 'LB' },
      { x: 118, y: 48, t: 'LB' },
      { x: 124, y: 28, t: 'S'  },
      { x: 176, y: 40, t: 'CB' },
    ],
    dl:[
      { x: 70, y: DL_Y, t: 'EDGE' },
      { x: 84, y: DL_Y, t: 'DT'   },
      { x: 96, y: DL_Y, t: 'DT'   },
      { x: 108,y: DL_Y, t: 'DT'   },
      { x: 126,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([24,40],[24,24]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,40],[176,24]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([76,28],[64,14],[52,12],[40,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([124,28],[136,14],[148,12],[160,14]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([82,48],[82,40],[82,32]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([100,48],[100,40],[100,32]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([118,48],[118,40],[118,32]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:40, name:'ThirdLongDoubleBracket', label:'3rd Long Double Bracket', cat:'dime',
    sk:[...BASE_SKILL_43, ...DIME_EXTRA],
    dl:DL_4,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([76,S_Y],[60,12],[44,10],[28,12]), c:CLR.bracket,w:2.2,a:true },
      { d:CB([124,S_Y],[140,12],[156,10],[172,12]), c:CLR.bracket,w:2.2,a:true },
      { d:P([54,42],[54,24]), c:CLR.bracket,w:2.0,a:true,dsh:true },
      { d:P([146,42],[146,24]), c:CLR.bracket,w:2.0,a:true,dsh:true },
      { d:QQ([82,LB_Y],[82,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([100,LB_Y],[100,42],[100,34]), c:CLR.drop,w:1.8,a:true },
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
  N:'#fbbf24',
  LB:'#34d399',
  EDGE:'#f87171',
  DT:'#8b9ab5',
  DB:'#f472b6',
};

function Player({ x, y, t, large = false }) {
  const c = PLAYER_COLORS[t] || '#fff';
  const r = large ? 6.2 : 4.8;

  if (t === 'DT') {
    const s = large ? 10 : 8;
    return (
      <g>
        <rect x={x - s / 2} y={y - s * 0.45} width={s} height={s * 0.9}
              fill={c} rx={1.5} opacity={0.9} />
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
      <rect width={200} height={130} fill="#08111b" />

      {[14, 28, 42, 56].map(y => (
        <line key={y} x1={0} y1={y} x2={200} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} strokeDasharray="3,5" />
      ))}

      <line x1={0} y1={LOS} x2={200} y2={LOS}
            stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />

      {/* Offensive placeholders */}
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
    { c: CLR.zone, l: 'Zone / Match' },
    { c: CLR.drop, l: 'Hook / Curl Drop' },
    { c: CLR.bracket, l: 'Bracket / Special' },
    { c: CLR.rotate, l: 'Poach / Rotation' },
    { c: CLR.fit, l: 'Fit Insert' },
  ],
  front: [
    { c: CLR.front, l: 'Front Alignment' },
    { c: CLR.fit, l: 'Run Fit' },
    { c: CLR.drop, l: 'Coverage Drop' },
  ],
  sim: [
    { c: CLR.sim, l: 'Creeper / Sim' },
    { c: CLR.pressure, l: 'Rush' },
    { c: CLR.drop, l: 'DL / LB Drop' },
    { c: CLR.zone, l: 'Shell' },
  ],
  pressure: [
    { c: CLR.blitz, l: 'Blitz' },
    { c: CLR.pressure, l: 'Rush' },
    { c: CLR.drop, l: 'Replace Drop' },
    { c: CLR.man, l: 'Man / Match' },
    { c: CLR.rotate, l: 'Rotation' },
  ],
  dime: [
    { c: CLR.bracket, l: 'Bracket' },
    { c: CLR.zone, l: 'Zone / Split Safety' },
    { c: CLR.man, l: 'Man' },
    { c: CLR.drop, l: 'Inside Drop' },
    { c: CLR.fit, l: 'Goal Line Fit' },
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
        background: hov ? '#102033' : '#0a1626',
        border: `1px solid ${hov ? meta.accent + '55' : '#15263b'}`,
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
        borderTop: `1px solid ${hov ? meta.accent + '35' : '#15263b'}`,
        background: hov ? meta.bg : 'transparent',
      }}>
        <div style={{
          color: '#e8f0ff', fontSize: 11, fontWeight: 700,
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
      background: 'rgba(3,8,16,0.9)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #0e1a2b 0%, #07111d 100%)',
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
              color: '#e8f0ff', fontSize: 20, fontWeight: 900,
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

        <div style={{ background: '#06101a', padding: '0 0 4px' }}>
          <PlayField play={play} large={true} />
        </div>

        <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${meta.accent}20` }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,0.28)', marginBottom: 8, fontFamily: 'monospace',
          }}>LEGEND</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 8 }}>
            {[
              ['CB','#60a5fa'],['S','#a78bfa'],['N','#fbbf24'],
              ['LB','#34d399'],['EDGE','#f87171'],['DT','#8b9ab5'],['DB','#f472b6']
            ].map(([t, c]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: t === 'DT' ? 2 : 5, background: c, opacity: 0.85 }} />
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
  { id:'front',    label:'Fronts (5)',   accent:'#34d399' },
  { id:'sim',      label:'Sim (10)',     accent:'#f59e0b' },
  { id:'pressure', label:'Fire (7)',     accent:'#ef4444' },
  { id:'dime',     label:'Dime (8)',     accent:'#a78bfa' },
];

/* ── APP ─────────────────────────────────────── */
export default function FangioTwoHighPlaybook() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const displayed = filter === 'all' ? PLAYS : PLAYS.filter(p => p.cat === filter);

  return (
    <div style={{
      background: '#050d16',
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
        ::-webkit-scrollbar-track { background:#050d16 }
        ::-webkit-scrollbar-thumb { background:#17314f; border-radius:2px }
        * { box-sizing:border-box }
      `}</style>

      <div style={{
        background: 'linear-gradient(180deg, #0b1827 0%, #07111d 100%)',
        borderBottom: '1px solid #15263b',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(96,165,250,0.7))' }}>
            🛡️
          </div>
          <div>
            <div style={{ color:'#e8f0ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              FANGIO TWO-HIGH
            </div>
            <div style={{ color:'#60a5fa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.82 }}>
              SPLIT SAFETY · SIM PRESSURE · MATCH COVERAGE
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
        borderTop: '1px solid #0b1827',
        color: 'rgba(255,255,255,0.12)',
        fontSize: 9, letterSpacing: '2px',
      }}>
        FANGIO TWO-HIGH SYSTEM · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
