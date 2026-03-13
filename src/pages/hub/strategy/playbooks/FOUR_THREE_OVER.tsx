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
  base:   { label: 'Base Coverage', short: 'BASE', accent: '#60a5fa', bg: '#60a5fa12' },
  front:  { label: 'Fronts',        short: 'FRNT', accent: '#34d399', bg: '#34d39912' },
  rush:   { label: 'Rush / Stunts', short: 'RUSH', accent: '#f59e0b', bg: '#f59e0b12' },
  fire:   { label: 'Fire Zone',     short: 'FIRE', accent: '#ef4444', bg: '#ef444412' },
  sim:    { label: 'Sim Pressure',  short: 'SIM',  accent: '#f59e0b', bg: '#f59e0b12' },
  man:    { label: 'Man Pressure',  short: 'MAN',  accent: '#f472b6', bg: '#f472b612' },
  dime:   { label: 'Dime / 3rd',    short: 'DIME', accent: '#a78bfa', bg: '#a78bfa12' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s, c, e) => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s, c1, c2, e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* Alignment landmarks */
const S_Y = 28;
const LB_Y = 48;
const SAM_Y = 52;
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
const BASE_43_OVER_SK = [
  { x: 24,  y: CB_OFF_Y, t: 'CB' },
  { x: 70,  y: SAM_Y,    t: 'LB' },
  { x: 90,  y: LB_Y,     t: 'LB' },
  { x: 114, y: LB_Y,     t: 'LB' },
  { x: 176, y: CB_OFF_Y, t: 'CB' },
  { x: 78,  y: S_Y,      t: 'S'  },
  { x: 122, y: S_Y,      t: 'S'  },
  { x: 146, y: 40,       t: 'N'  },
];

const DL_43_OVER = [
  { x: 60,  y: DL_Y, t: 'EDGE' },
  { x: 82,  y: DL_Y, t: 'DT'   },
  { x: 100, y: DL_Y, t: 'DT'   },
  { x: 124, y: DL_Y, t: 'EDGE' },
];

const DIME_DB = [
  { x: 52,  y: 40, t: 'DB' },
  { x: 148, y: 40, t: 'DB' },
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ BASE COVERAGE PACKAGE 1-10 ═════════════════ */
  {
    id:1, name:'OverC3Sky', label:'Over C3 Sky', cat:'base',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]),                  c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),                c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]),                     c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]),     c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]),           c:CLR.fit,w:1.8,a:true },
      { d:QQ([90,LB_Y],[88,42],[86,34]),            c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([146,40],[150,34],[154,28]),           c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:2, name:'OverC3Buzz', label:'Over C3 Buzz', cat:'base',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]),                  c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),                c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]),                      c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]),                     c:CLR.robber,w:2.0,a:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]),           c:CLR.fit,w:1.8,a:true },
      { d:QQ([90,LB_Y],[88,42],[86,34]),            c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([146,40],[150,34],[154,28]),           c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:3, name:'OverC3Cloud', label:'Over C3 Cloud', cat:'base',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,24],[10,16],[8,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),               c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,10]),                      c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]),                    c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]),          c:CLR.fit,w:1.8,a:true },
      { d:QQ([90,LB_Y],[88,42],[86,34]),           c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),        c:CLR.drop,w:1.8,a:true },
      { d:QQ([146,40],[150,34],[154,28]),          c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:4, name:'OverC1Robber', label:'Over C1 Robber', cat:'base',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]),           c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([90,LB_Y],[88,42],[86,34]),            c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),         c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([146,40],[150,34],[154,28]),           c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                      c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,30]),                     c:CLR.robber,w:2.0,a:true },
    ],
  },
  {
    id:5, name:'OverC1Press', label:'Over C1 Press', cat:'base',
    sk:[
      { x: 24,  y: CB_PRESS_Y, t: 'CB' },
      { x: 70,  y: SAM_Y,      t: 'LB' },
      { x: 90,  y: LB_Y,       t: 'LB' },
      { x: 114, y: LB_Y,       t: 'LB' },
      { x: 176, y: CB_PRESS_Y, t: 'CB' },
      { x: 78,  y: S_Y,        t: 'S'  },
      { x: 122, y: S_Y,        t: 'S'  },
      { x: 146, y: 40,         t: 'N'  },
    ],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_PRESS_Y],[24,18]),               c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_PRESS_Y],[176,18]),             c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([24,CB_PRESS_Y],[24,CB_PRESS_Y+6]),     c:CLR.man,w:1.4,a:false,dsh:true },
      { d:P([176,CB_PRESS_Y],[176,CB_PRESS_Y+6]),   c:CLR.man,w:1.4,a:false,dsh:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]),          c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([90,LB_Y],[88,42],[86,34]),           c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),        c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([146,40],[150,34],[154,28]),          c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                     c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:6, name:'OverTampa2', label:'Over Tampa 2', cat:'base',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:CB([24,CB_OFF_Y],[18,24],[12,16],[10,10]), c:CLR.zone,w:2.2,a:true },
      { d:CB([176,CB_OFF_Y],[182,24],[188,16],[190,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,10]),                       c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,10]),                     c:CLR.zone,w:2.2,a:true },
      { d:P([90,LB_Y],[100,20]),                     c:CLR.drop,w:2.0,a:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]),           c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([146,40],[150,34],[154,28]),           c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:7, name:'OverQuartersMatch', label:'Over Quarters Match', cat:'base',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                  c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),     c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]),           c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([90,LB_Y],[90,42],[90,34]),            c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([146,40],[150,34],[154,28]),           c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:8, name:'OverC6Field', label:'Over C6 Field', cat:'base',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,24],[10,16],[8,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),               c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[90,14],[102,14],[114,16]),  c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]),c:CLR.zone,w:2.2,a:true },
      { d:QQ([90,LB_Y],[88,42],[86,34]),           c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),        c:CLR.drop,w:1.8,a:true },
      { d:QQ([146,40],[150,34],[154,28]),          c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:9, name:'OverC2Press', label:'Over C2 Press', cat:'base',
    sk:[
      { x: 24,  y: CB_PRESS_Y, t: 'CB' },
      { x: 70,  y: SAM_Y,      t: 'LB' },
      { x: 90,  y: LB_Y,       t: 'LB' },
      { x: 114, y: LB_Y,       t: 'LB' },
      { x: 176, y: CB_PRESS_Y, t: 'CB' },
      { x: 78,  y: S_Y,        t: 'S'  },
      { x: 122, y: S_Y,        t: 'S'  },
      { x: 146, y: 40,         t: 'N'  },
    ],
    dl:DL_43_OVER,
    rt:[
      { d:CB([24,CB_PRESS_Y],[18,24],[12,16],[10,10]), c:CLR.zone,w:2.2,a:true },
      { d:CB([176,CB_PRESS_Y],[182,24],[188,16],[190,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,10]),                      c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,10]),                    c:CLR.zone,w:2.2,a:true },
      { d:P([24,CB_PRESS_Y],[24,CB_PRESS_Y+6]),     c:CLR.man,w:1.4,a:false,dsh:true },
      { d:P([176,CB_PRESS_Y],[176,CB_PRESS_Y+6]),   c:CLR.man,w:1.4,a:false,dsh:true },
      { d:QQ([90,LB_Y],[90,42],[90,34]),            c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),         c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:10, name:'OverC3SeamCarry', label:'Over C3 Seam Carry', cat:'base',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]),                  c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),                c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]),                     c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]),     c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[72,42],[76,28]),           c:CLR.fit,w:1.8,a:true },
      { d:QQ([90,LB_Y],[90,42],[90,34]),            c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([146,40],[144,34],[140,28]),           c:CLR.fit,w:1.8,a:true },
    ],
  },

  /* ═══ FRONT VARIATIONS 11-15 ═══════════════════════ */
  {
    id:11, name:'OverWide9', label:'Over Wide 9', cat:'front',
    sk:[...BASE_43_OVER_SK],
    dl:[
      { x: 50,  y: DL_Y, t: 'EDGE' },
      { x: 82,  y: DL_Y, t: 'DT'   },
      { x: 100, y: DL_Y, t: 'DT'   },
      { x: 134, y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([50,DL_Y],[50,56]),   c:CLR.front,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.front,w:2.2,a:true },
      { d:P([134,DL_Y],[134,56]), c:CLR.front,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[64,42],[58,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([90,LB_Y],[90,40],[90,32]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,40],[114,32]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:12, name:'OverTightFront', label:'Over Tight Front', cat:'front',
    sk:[...BASE_43_OVER_SK],
    dl:[
      { x: 62, y: DL_Y, t: 'EDGE' },
      { x: 84, y: DL_Y, t: 'DT'   },
      { x: 98, y: DL_Y, t: 'DT'   },
      { x: 120,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([62,DL_Y],[62,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([84,DL_Y],[84,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([98,DL_Y],[98,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([120,DL_Y],[120,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[66,42],[62,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([90,LB_Y],[90,40],[90,32]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,40],[114,32]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:13, name:'OverHeavy', label:'Over Heavy', cat:'front',
    sk:[...BASE_43_OVER_SK],
    dl:[
      { x: 60, y: DL_Y, t: 'EDGE' },
      { x: 80, y: DL_Y, t: 'DT'   },
      { x: 98, y: DL_Y, t: 'DT'   },
      { x: 116,y: DL_Y, t: 'DT'   },
      { x: 132,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([60,DL_Y],[60,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([80,DL_Y],[80,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([98,DL_Y],[98,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([116,DL_Y],[116,60]), c:CLR.front,w:2.2,a:true },
      { d:P([132,DL_Y],[132,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[66,42],[62,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([90,LB_Y],[90,40],[90,32]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,40],[114,32]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:14, name:'OverUnderShift', label:'Over Under Shift', cat:'front',
    sk:[...BASE_43_OVER_SK],
    dl:[
      { x: 56, y: DL_Y, t: 'EDGE' },
      { x: 80, y: DL_Y, t: 'DT'   },
      { x: 98, y: DL_Y, t: 'DT'   },
      { x: 126,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([56,DL_Y],[56,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([80,DL_Y],[80,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([98,DL_Y],[98,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[62,42],[54,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([90,LB_Y],[88,40],[86,32]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,40],[118,32]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:15, name:'OverGoalLineFiveThree', label:'Over Goal Line 5-3', cat:'front',
    sk:[
      { x:24,  y:40, t:'CB' },
      { x:70,  y:52, t:'LB' },
      { x:90,  y:50, t:'LB' },
      { x:114, y:50, t:'LB' },
      { x:176, y:40, t:'CB' },
      { x:78,  y:26, t:'S'  },
      { x:122, y:26, t:'S'  },
      { x:146, y:42, t:'N'  },
    ],
    dl:[
      { x: 60, y: DL_Y, t: 'EDGE' },
      { x: 80, y: DL_Y, t: 'DT'   },
      { x: 98, y: DL_Y, t: 'DT'   },
      { x: 116,y: DL_Y, t: 'DT'   },
      { x: 132,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([60,DL_Y],[60,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([80,DL_Y],[80,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([98,DL_Y],[98,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([116,DL_Y],[116,60]), c:CLR.front,w:2.2,a:true },
      { d:P([132,DL_Y],[132,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([70,52],[66,42],[62,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([90,50],[90,40],[90,32]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,50],[114,40],[114,32]), c:CLR.fit,w:1.8,a:true },
    ],
  },

  /* ═══ 4-MAN RUSH & STUNT MENU 16-20 ════════════════ */
  {
    id:16, name:'TETwistStrong', label:'T/E Twist Strong', cat:'rush',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:CB([82,DL_Y],[88,64],[96,58],[102,52]), c:CLR.rush,w:2.2,a:true },
      { d:CB([60,DL_Y],[68,62],[76,56],[84,52]),  c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),                 c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),                 c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),               c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),             c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]),                  c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:17, name:'ETTwistWeak', label:'E/T Twist Weak', cat:'rush',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:CB([124,DL_Y],[116,64],[108,58],[100,52]), c:CLR.rush,w:2.2,a:true },
      { d:CB([100,DL_Y],[108,62],[116,56],[124,52]), c:CLR.rush,w:2.2,a:true },
      { d:P([60,DL_Y],[60,58]),                      c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),                      c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),                  c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]),                      c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:18, name:'InteriorPirate', label:'Interior Pirate', cat:'rush',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:CB([82,DL_Y],[90,64],[98,58],[104,52]), c:CLR.rush,w:2.2,a:true },
      { d:CB([100,DL_Y],[92,64],[84,58],[78,52]), c:CLR.rush,w:2.2,a:true },
      { d:P([60,DL_Y],[60,58]),                    c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),                  c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),                c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),              c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]),                   c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:19, name:'DoubleEdgeContain', label:'Double Edge Contain', cat:'rush',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([60,DL_Y],[48,56]),   c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[136,56]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[78,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:20, name:'NASCARRush', label:'NASCAR Rush', cat:'rush',
    sk:[...BASE_43_OVER_SK, { x: 52, y: 40, t: 'DB' }],
    dl:[
      { x: 52, y: DL_Y, t: 'EDGE' },
      { x: 76, y: DL_Y, t: 'EDGE' },
      { x: 108,y: DL_Y, t: 'EDGE' },
      { x: 132,y: DL_Y, t: 'EDGE' },
    ],
    rt:[
      { d:P([52,DL_Y],[42,56]),   c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([108,DL_Y],[108,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([132,DL_Y],[142,56]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[78,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },

  /* ═══ FIRE ZONE PACKAGE 21-25 ══════════════════════ */
  {
    id:21, name:'SamFireC3', label:'Sam Fire C3', cat:'fire',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([70,SAM_Y],[62,56]),  c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:22, name:'WillFireC3', label:'Will Fire C3', cat:'fire',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([114,LB_Y],[110,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([100,DL_Y],[106,58],[114,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([146,40],[150,34],[154,28]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:23, name:'NickelFireThreeUnderThreeDeep', label:'Nickel Fire 3-Under/3-Deep', cat:'fire',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([146,40],[156,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:24, name:'StrongCrossDogZone', label:'Strong Cross Dog Zone', cat:'fire',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:CB([70,SAM_Y],[82,56],[94,54],[108,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([90,LB_Y],[98,56],[106,54],[116,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),                    c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),                  c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,14]),                c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),              c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]),                   c:CLR.zone,w:2.2,a:true },
      { d:QQ([146,40],[150,34],[154,28]),          c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:25, name:'BoundaryCatC3', label:'Boundary Cat C3', cat:'fire',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),   c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
    ],
  },

  /* ═══ SIMULATED PRESSURE 26-30 ═════════════════════ */
  {
    id:26, name:'NickelSimStrong', label:'Nickel Sim Strong', cat:'sim',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([146,40],[156,54]),   c:CLR.sim,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:27, name:'MikeMugSim', label:'Mike Mug Sim', cat:'sim',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([90,LB_Y],[94,56]),   c:CLR.sim,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([100,DL_Y],[106,58],[114,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:28, name:'WeakCreeper', label:'Weak Creeper', cat:'sim',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.sim,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),   c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:29, name:'TackleDropSim', label:'Tackle Drop Sim', cat:'sim',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([146,40],[156,54]),   c:CLR.sim,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([100,DL_Y],[106,58],[114,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:30, name:'EdgeReplaceSim', label:'Edge Replace Sim', cat:'sim',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([114,LB_Y],[110,56]), c:CLR.sim,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([146,40],[150,34],[154,28]), c:CLR.drop,w:1.8,a:true },
    ],
  },

  /* ═══ MAN PRESSURE 31-35 ═══════════════════════════ */
  {
    id:31, name:'OverC1CrossDog', label:'Over C1 Cross Dog', cat:'man',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:CB([90,LB_Y],[98,56],[106,54],[116,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([114,LB_Y],[106,56],[98,54],[88,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([146,40],[150,34],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:32, name:'DoubleAGapC1', label:'Double A Gap C1', cat:'man',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([90,LB_Y],[94,56]),   c:CLR.blitz,w:2.4,a:true },
      { d:P([114,LB_Y],[110,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([146,40],[150,34],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:33, name:'NickelCatC1', label:'Nickel Cat C1', cat:'man',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([146,40],[156,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:34, name:'OverC0Edge', label:'Over C0 Edge', cat:'man',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:P([60,DL_Y],[50,56]),   c:CLR.blitz,w:2.4,a:true },
      { d:P([124,DL_Y],[134,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([90,LB_Y],[88,42],[86,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([146,40],[150,34],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:35, name:'BoundaryZeroCross', label:'Boundary Zero Cross', cat:'man',
    sk:[...BASE_43_OVER_SK],
    dl:DL_43_OVER,
    rt:[
      { d:CB([24,CB_OFF_Y],[34,52],[44,56],[56,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([90,LB_Y],[98,56],[106,54],[116,58]),   c:CLR.blitz,w:2.4,a:true },
      { d:P([82,DL_Y],[82,60]),                      c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),                    c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),                  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([70,SAM_Y],[64,44],[58,34]),           c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([146,40],[150,34],[154,28]),           c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]),                       c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,18]),                     c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },

  /* ═══ DIME & 3RD DOWN PACKAGE 36-40 ════════════════ */
  {
    id:36, name:'Dime2Man', label:'Dime 2-Man', cat:'dime',
    sk:[...BASE_43_OVER_SK, ...DIME_DB],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([52,40],[52,20]),         c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([148,40],[148,20]),       c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),     c:CLR.bracket,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
      { d:QQ([90,LB_Y],[90,42],[90,34]),            c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:37, name:'DimeC1Robber', label:'Dime C1 Robber', cat:'dime',
    sk:[...BASE_43_OVER_SK, ...DIME_DB],
    dl:DL_43_OVER,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([52,40],[52,20]),         c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([148,40],[148,20]),       c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,30]),      c:CLR.robber,w:2.0,a:true },
      { d:QQ([90,LB_Y],[88,42],[86,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:38, name:'DimeDrop8Cloud', label:'Dime Drop-8 Cloud', cat:'dime',
    sk:[...BASE_43_OVER_SK, ...DIME_DB],
    dl:[
      { x: 82, y: DL_Y, t:'DT' },
      { x: 100,y: DL_Y, t:'DT' },
      { x: 124,y: DL_Y, t:'EDGE' },
    ],
    rt:[
      { d:P([82,DL_Y],[82,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([100,DL_Y],[106,58],[114,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([124,DL_Y],[130,58],[138,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:CB([24,CB_OFF_Y],[16,24],[10,16],[8,10]), c:CLR.trap,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([52,40],[52,18]), c:CLR.zone,w:2.0,a:true },
      { d:P([148,40],[148,18]), c:CLR.zone,w:2.0,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:39, name:'DimeSimBracketSlot', label:'Dime Sim + Bracket Slot', cat:'dime',
    sk:[...BASE_43_OVER_SK, ...DIME_DB],
    dl:DL_43_OVER,
    rt:[
      { d:P([148,40],[158,54]), c:CLR.sim,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([52,40],[52,22]), c:CLR.bracket,w:2.0,a:true },
      { d:P([148,40],[148,22]), c:CLR.bracket,w:2.0,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
    ],
  },
  {
    id:40, name:'ThirdLongDoubleThreat', label:'3rd Long Double Threat', cat:'dime',
    sk:[...BASE_43_OVER_SK, ...DIME_DB],
    dl:DL_43_OVER,
    rt:[
      { d:P([90,LB_Y],[94,56]), c:CLR.sim,w:2.4,a:true },
      { d:P([148,40],[158,54]), c:CLR.sim,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([52,40],[52,22]), c:CLR.bracket,w:2.0,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
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
  EDGE:'#ef4444',
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
      <rect width={200} height={130} fill="#08131d" />

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
    { c: CLR.man,    l: 'Man / Press' },
    { c: CLR.drop,   l: 'Hook / Curl' },
    { c: CLR.robber, l: 'Robber / Buzz' },
    { c: CLR.fit,    l: 'Sky / Seam Carry' },
  ],
  front: [
    { c: CLR.front, l: 'Front Alignment' },
    { c: CLR.fit,   l: 'Run Fit' },
  ],
  rush: [
    { c: CLR.rush, l: 'Rush / Twist' },
    { c: CLR.man,  l: 'Contain / Match' },
    { c: CLR.zone, l: 'Shell' },
  ],
  fire: [
    { c: CLR.blitz, l: 'Blitz' },
    { c: CLR.rush,  l: 'Rush' },
    { c: CLR.drop,  l: 'Replace Drop' },
    { c: CLR.zone,  l: '3-Deep / Fire Zone' },
  ],
  sim: [
    { c: CLR.sim,  l: 'Sim Pressure' },
    { c: CLR.rush, l: 'Rush' },
    { c: CLR.drop, l: 'Dropper' },
    { c: CLR.zone, l: 'Shell' },
  ],
  man: [
    { c: CLR.blitz, l: 'Pressure' },
    { c: CLR.man,   l: 'Man' },
    { c: CLR.zone,  l: 'Middle Help' },
    { c: CLR.bracket,l:'Zero / Threat' },
  ],
  dime: [
    { c: CLR.bracket,l:'Bracket' },
    { c: CLR.man,    l:'Man' },
    { c: CLR.zone,   l:'Zone / Cloud' },
    { c: CLR.sim,    l:'Sim' },
    { c: CLR.robber, l:'Robber' },
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
              ['LB','#34d399'],['EDGE','#ef4444'],['DT','#8b9ab5'],['DB','#f472b6']
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
  { id:'all',   label:'All 40',      accent:'#94a3b8' },
  { id:'base',  label:'Base (10)',   accent:'#60a5fa' },
  { id:'front', label:'Front (5)',   accent:'#34d399' },
  { id:'rush',  label:'Rush (5)',    accent:'#f59e0b' },
  { id:'fire',  label:'Fire (5)',    accent:'#ef4444' },
  { id:'sim',   label:'Sim (5)',     accent:'#f59e0b' },
  { id:'man',   label:'Man (5)',     accent:'#f472b6' },
  { id:'dime',  label:'Dime (5)',    accent:'#a78bfa' },
];

/* ── APP ─────────────────────────────────────── */
export default function FourThreeOverPlaybook() {
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
              4-3 OVER
            </div>
            <div style={{ color:'#60a5fa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.82 }}>
              OVER FRONT · 4-MAN RUSH · PRESSURE LAYERING
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
        4-3 OVER SYSTEM · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
