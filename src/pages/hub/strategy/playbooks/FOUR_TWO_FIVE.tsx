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
};

const CAT_META = {
  base:       { label: 'Base Coverages', short: 'BASE', accent: '#60a5fa', bg: '#60a5fa12' },
  fit:        { label: 'Run Fits',       short: 'FIT',  accent: '#34d399', bg: '#34d39912' },
  sim:        { label: 'Sim Pressure',   short: 'SIM',  accent: '#f59e0b', bg: '#f59e0b12' },
  fire:       { label: 'Fire Zones',     short: 'FIRE', accent: '#ef4444', bg: '#ef444412' },
  manpress:   { label: 'Man Pressure',   short: 'MAN',  accent: '#f472b6', bg: '#f472b612' },
  thirddown:  { label: '3rd Down',       short: '3RD',  accent: '#a78bfa', bg: '#a78bfa12' },
  red:        { label: 'Red Zone',       short: 'RED',  accent: '#fbbf24', bg: '#fbbf2412' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s, c, e) => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s, c1, c2, e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* Landmarks */
const S_Y = 28;
const LB_Y = 48;
const NICKEL_Y = 42;
const DL_Y = 70;
const CB_PRESS_Y = 38;
const CB_OFF_Y = 30;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#f472b6','#ef4444','#f59e0b',
  '#34d399','#a78bfa','#fbbf24','#64748b',
  '#f87171','#22c55e','#fb923c',
];

/* ── COMMON PERSONNEL ────────────────────────── */
const BASE_425_SK = [
  { x: 24,  y: CB_OFF_Y, t: 'CB' },
  { x: 60,  y: NICKEL_Y, t: 'N'  },
  { x: 86,  y: LB_Y,     t: 'LB' },
  { x: 114, y: LB_Y,     t: 'LB' },
  { x: 140, y: NICKEL_Y, t: 'N'  },
  { x: 176, y: CB_OFF_Y, t: 'CB' },
  { x: 78,  y: S_Y,      t: 'S'  },
  { x: 122, y: S_Y,      t: 'S'  },
];

const DL_425 = [
  { x: 64,  y: DL_Y, t: 'EDGE' },
  { x: 86,  y: DL_Y, t: 'DT'   },
  { x: 104, y: DL_Y, t: 'DT'   },
  { x: 126, y: DL_Y, t: 'EDGE' },
];

const DIME_DB = [
  { x: 48,  y: 40, t: 'DB' },
  { x: 152, y: 40, t: 'DB' },
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ BASE COVERAGES 1-10 ═════════════════════ */
  {
    id:1, name:'FourTwoFiveC3', label:'4-2-5 C3', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]),                   c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),                 c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]),                       c:CLR.zone,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[54,36],[48,30]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),             c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),          c:CLR.drop,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[146,36],[152,30]),      c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:2, name:'FourTwoFiveC3Buzz', label:'4-2-5 C3 Buzz', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]),                   c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),                 c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]),                       c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,34]),                      c:CLR.robber,w:2.0,a:true },
      { d:QQ([60,NICKEL_Y],[54,36],[48,30]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),             c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),          c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:3, name:'FourTwoFiveQuarters', label:'4-2-5 Quarters', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                   c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),                 c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),      c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]),  c:CLR.zone,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[58,36],[56,28]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]),             c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),          c:CLR.drop,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[142,36],[144,28]),      c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:4, name:'FourTwoFiveMatch', label:'4-2-5 Match', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                   c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),                 c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),      c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]),  c:CLR.zone,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[54,38],[48,30]),         c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),             c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),          c:CLR.drop,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[146,38],[152,30]),      c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:5, name:'FourTwoFiveC2', label:'4-2-5 C2', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:CB([24,CB_OFF_Y],[18,24],[12,16],[10,10]), c:CLR.zone,w:2.2,a:true },
      { d:CB([176,CB_OFF_Y],[182,24],[188,16],[190,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,10]),                        c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,10]),                      c:CLR.zone,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[54,36],[48,30]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]),             c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),          c:CLR.drop,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[146,36],[152,30]),      c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:6, name:'FourTwoFiveTampa', label:'4-2-5 Tampa', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:CB([24,CB_OFF_Y],[18,24],[12,16],[10,10]), c:CLR.zone,w:2.2,a:true },
      { d:CB([176,CB_OFF_Y],[182,24],[188,16],[190,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,10]),                        c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,10]),                      c:CLR.zone,w:2.2,a:true },
      { d:P([86,LB_Y],[100,20]),                      c:CLR.drop,w:2.0,a:true },
      { d:QQ([60,NICKEL_Y],[54,36],[48,30]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),          c:CLR.drop,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[146,36],[152,30]),      c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:7, name:'FourTwoFiveC6', label:'4-2-5 C6', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,24],[10,16],[8,10]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[90,14],[102,14],[114,16]),   c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),             c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),          c:CLR.drop,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[146,36],[152,30]),      c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:8, name:'FourTwoFiveC1', label:'4-2-5 C1', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),                 c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([60,NICKEL_Y],[52,30]),                   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([140,NICKEL_Y],[148,30]),                 c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                       c:CLR.zone,w:2.2,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),             c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),          c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,32]),                      c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:9, name:'FourTwoFiveRobber', label:'4-2-5 Robber', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),                 c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([60,NICKEL_Y],[52,30]),                   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([140,NICKEL_Y],[148,30]),                 c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                       c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,30]),                      c:CLR.robber,w:2.0,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),             c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),          c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:10, name:'FourTwoFiveCloud', label:'4-2-5 Cloud', cat:'base',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,24],[10,16],[8,10]),  c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,10]),                       c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[54,36],[48,30]),        c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]),            c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),         c:CLR.drop,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[146,36],[152,30]),     c:CLR.drop,w:1.8,a:true },
    ],
  },

  /* ═══ RUN-FIT VARIANTS 11-15 ══════════════════ */
  {
    id:11, name:'SpillFront', label:'Spill Front', cat:'fit',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([64,DL_Y],[60,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]), c:CLR.front,w:2.2,a:true },
      { d:P([126,DL_Y],[130,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[52,38],[44,30]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[82,42],[78,34]),     c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[118,42],[122,34]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[148,38],[156,30]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:12, name:'BoxFitHeavy', label:'Box Fit Heavy', cat:'fit',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([64,DL_Y],[64,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]), c:CLR.front,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[60,36],[60,28]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[86,40],[86,32]),     c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,40],[114,32]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[140,36],[140,28]), c:CLR.fit,w:1.8,a:true },
      { d:P([78,S_Y],[78,24]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:13, name:'Wide9Edge', label:'Wide 9 Edge', cat:'fit',
    sk:[...BASE_425_SK],
    dl:[
      { x: 54,  y: DL_Y, t:'EDGE' },
      { x: 86,  y: DL_Y, t:'DT'   },
      { x: 104, y: DL_Y, t:'DT'   },
      { x: 136, y: DL_Y, t:'EDGE' },
    ],
    rt:[
      { d:P([54,DL_Y],[54,56]),   c:CLR.front,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]), c:CLR.front,w:2.2,a:true },
      { d:P([136,DL_Y],[136,56]), c:CLR.front,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[54,38],[48,30]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[86,40],[86,32]),     c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,40],[114,32]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[146,38],[152,30]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:14, name:'UnderFront', label:'Under Front', cat:'fit',
    sk:[...BASE_425_SK],
    dl:[
      { x: 58,  y: DL_Y, t:'EDGE' },
      { x: 82,  y: DL_Y, t:'DT'   },
      { x: 100, y: DL_Y, t:'DT'   },
      { x: 126, y: DL_Y, t:'EDGE' },
    ],
    rt:[
      { d:P([58,DL_Y],[58,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.front,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[52,38],[44,30]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[82,42],[78,34]),     c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[148,38],[156,30]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:15, name:'OverFront', label:'Over Front', cat:'fit',
    sk:[...BASE_425_SK],
    dl:[
      { x: 64,  y: DL_Y, t:'EDGE' },
      { x: 90,  y: DL_Y, t:'DT'   },
      { x: 108, y: DL_Y, t:'DT'   },
      { x: 132, y: DL_Y, t:'EDGE' },
    ],
    rt:[
      { d:P([64,DL_Y],[64,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([90,DL_Y],[90,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([108,DL_Y],[108,60]), c:CLR.front,w:2.2,a:true },
      { d:P([132,DL_Y],[132,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[58,36],[56,28]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[86,40],[86,32]),     c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,40],[114,32]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[142,36],[144,28]), c:CLR.fit,w:1.8,a:true },
    ],
  },

  /* ═══ SIM PRESSURES 16-20 ════════════════════ */
  {
    id:16, name:'NickelSimStrong', label:'Nickel Sim Strong', cat:'sim',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([140,NICKEL_Y],[132,54]), c:CLR.sim,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),     c:CLR.rush,w:2.2,a:true },
      { d:QQ([126,DL_Y],[132,58],[140,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:17, name:'NickelSimWeak', label:'Nickel Sim Weak', cat:'sim',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([60,NICKEL_Y],[68,54]), c:CLR.sim,w:2.4,a:true },
      { d:P([126,DL_Y],[126,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),   c:CLR.rush,w:2.2,a:true },
      { d:QQ([64,DL_Y],[58,58],[50,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:18, name:'MikeSim', label:'Mike Sim', cat:'sim',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([86,LB_Y],[90,56]),   c:CLR.sim,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([104,DL_Y],[110,58],[118,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:19, name:'EdgeDropSim', label:'Edge Drop Sim', cat:'sim',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([140,NICKEL_Y],[132,54]), c:CLR.sim,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),     c:CLR.rush,w:2.2,a:true },
      { d:QQ([126,DL_Y],[132,58],[140,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:20, name:'CreeperCross', label:'Creeper Cross', cat:'sim',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:CB([86,LB_Y],[96,56],[106,54],[118,58]), c:CLR.sim,w:2.4,a:true },
      { d:CB([114,LB_Y],[104,56],[94,54],[82,58]), c:CLR.sim,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),                     c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]),                   c:CLR.rush,w:2.2,a:true },
      { d:QQ([86,DL_Y],[80,58],[72,50]),            c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([104,DL_Y],[110,58],[118,50]),         c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },

  /* ═══ FIRE ZONES 21-25 ═══════════════════════ */
  {
    id:21, name:'NickelFireC3', label:'Nickel Fire C3', cat:'fire',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([140,NICKEL_Y],[132,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]),     c:CLR.rush,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[54,36],[48,30]), c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:22, name:'SamFireZone', label:'Sam Fire Zone', cat:'fire',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([114,LB_Y],[118,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[54,36],[48,30]), c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:23, name:'BoundaryFire', label:'Boundary Fire', cat:'fire',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[54,36],[48,30]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:24, name:'FieldFire', label:'Field Fire', cat:'fire',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([176,CB_OFF_Y],[166,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([140,NICKEL_Y],[146,36],[152,30]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:25, name:'CrossDogC3', label:'Cross Dog C3', cat:'fire',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:CB([86,LB_Y],[96,56],[106,54],[118,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([114,LB_Y],[104,56],[94,54],[82,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),                     c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]),                   c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,14]),                 c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),               c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]),                     c:CLR.zone,w:2.2,a:true },
      { d:QQ([60,NICKEL_Y],[54,36],[48,30]),        c:CLR.drop,w:1.8,a:true },
      { d:QQ([140,NICKEL_Y],[146,36],[152,30]),     c:CLR.drop,w:1.8,a:true },
    ],
  },

  /* ═══ MAN PRESSURE 26-30 ═════════════════════ */
  {
    id:26, name:'C1NickelFire', label:'C1 Nickel Fire', cat:'manpress',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([140,NICKEL_Y],[132,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([60,NICKEL_Y],[52,30]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:27, name:'C1CrossDog', label:'C1 Cross Dog', cat:'manpress',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:CB([86,LB_Y],[96,56],[106,54],[118,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([114,LB_Y],[104,56],[94,54],[82,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),                     c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]),                   c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),                 c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),               c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([60,NICKEL_Y],[52,30]),                 c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([140,NICKEL_Y],[148,30]),               c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                     c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:28, name:'DoubleAC1', label:'Double A C1', cat:'manpress',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([86,LB_Y],[90,56]),   c:CLR.blitz,w:2.4,a:true },
      { d:P([114,LB_Y],[110,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([60,NICKEL_Y],[52,30]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([140,NICKEL_Y],[148,30]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:29, name:'C0Nickel', label:'C0 Nickel', cat:'manpress',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([60,NICKEL_Y],[68,54]),  c:CLR.blitz,w:2.4,a:true },
      { d:P([140,NICKEL_Y],[132,54]),c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),      c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),      c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),    c:CLR.rush,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]),    c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]),       c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,18]),     c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:30, name:'C0Edge', label:'C0 Edge', cat:'manpress',
    sk:[...BASE_425_SK],
    dl:DL_425,
    rt:[
      { d:P([64,DL_Y],[56,56]),      c:CLR.blitz,w:2.4,a:true },
      { d:P([126,DL_Y],[134,56]),    c:CLR.blitz,w:2.4,a:true },
      { d:P([86,DL_Y],[86,60]),      c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),    c:CLR.rush,w:2.2,a:true },
      { d:P([60,NICKEL_Y],[52,30]),  c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([140,NICKEL_Y],[148,30]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]),  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]),       c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,18]),     c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },

  /* ═══ 3RD DOWN PACKAGE 31-35 ═════════════════ */
  {
    id:31, name:'Dime2Man', label:'4-2-5 Dime 2-Man', cat:'thirddown',
    sk:[...BASE_425_SK, ...DIME_DB],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([48,40],[48,20]),        c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([152,40],[152,20]),      c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),   c:CLR.bracket,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]),c:CLR.bracket,w:2.2,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:32, name:'Drop8', label:'Drop-8', cat:'thirddown',
    sk:[...BASE_425_SK, ...DIME_DB],
    dl:[
      { x: 86, y: DL_Y, t:'DT' },
      { x: 104,y: DL_Y, t:'DT' },
      { x: 126,y: DL_Y, t:'EDGE' },
    ],
    rt:[
      { d:P([86,DL_Y],[86,60]),                     c:CLR.rush,w:2.2,a:true },
      { d:QQ([104,DL_Y],[110,58],[118,48]),        c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([126,DL_Y],[132,58],[140,48]),        c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]),                c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),              c:CLR.zone,w:2.2,a:true },
      { d:P([48,40],[48,18]),                      c:CLR.zone,w:2.0,a:true },
      { d:P([152,40],[152,18]),                    c:CLR.zone,w:2.0,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),    c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]),c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:33, name:'ThirdLongQuarters', label:'3rd Long Quarters', cat:'thirddown',
    sk:[...BASE_425_SK, ...DIME_DB],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                   c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]),                 c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),      c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]),  c:CLR.zone,w:2.2,a:true },
      { d:P([48,40],[48,22]),                         c:CLR.bracket,w:2.0,a:true },
      { d:P([152,40],[152,22]),                       c:CLR.bracket,w:2.0,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]),             c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),          c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:34, name:'RobberRat', label:'Robber Rat', cat:'thirddown',
    sk:[...BASE_425_SK, ...DIME_DB],
    dl:DL_425,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([48,40],[48,20]),        c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([152,40],[152,20]),      c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),      c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,30]),     c:CLR.robber,w:2.0,a:true },
      { d:P([86,LB_Y],[86,34]),      c:CLR.robber,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:35, name:'SimBracket', label:'Sim + Bracket', cat:'thirddown',
    sk:[...BASE_425_SK, ...DIME_DB],
    dl:DL_425,
    rt:[
      { d:P([140,NICKEL_Y],[132,54]), c:CLR.sim,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]),     c:CLR.rush,w:2.2,a:true },
      { d:QQ([126,DL_Y],[132,58],[140,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([48,40],[48,22]),         c:CLR.bracket,w:2.0,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
    ],
  },

  /* ═══ RED ZONE 36-40 ═════════════════════════ */
  {
    id:36, name:'RedC6', label:'Red C6', cat:'red',
    sk:[
      { x:24,  y:36, t:'CB' },
      { x:60,  y:44, t:'N'  },
      { x:86,  y:46, t:'LB' },
      { x:114, y:46, t:'LB' },
      { x:140, y:44, t:'N'  },
      { x:176, y:36, t:'CB' },
      { x:78,  y:24, t:'S'  },
      { x:122, y:24, t:'S'  },
    ],
    dl:DL_425,
    rt:[
      { d:CB([24,36],[16,26],[10,18],[8,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,36],[176,18]),               c:CLR.zone,w:2.2,a:true },
      { d:CB([78,24],[90,16],[102,16],[114,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,24],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([86,46],[84,38],[82,30]),        c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,46],[114,38],[114,30]),     c:CLR.drop,w:1.8,a:true },
      { d:QQ([140,44],[146,34],[152,28]),     c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:37, name:'RedC1', label:'Red C1', cat:'red',
    sk:[
      { x:24,  y:36, t:'CB' },
      { x:60,  y:44, t:'N'  },
      { x:86,  y:46, t:'LB' },
      { x:114, y:46, t:'LB' },
      { x:140, y:44, t:'N'  },
      { x:176, y:36, t:'CB' },
      { x:78,  y:24, t:'S'  },
      { x:122, y:24, t:'S'  },
    ],
    dl:DL_425,
    rt:[
      { d:P([24,36],[24,18]),  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,36],[176,18]),c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([60,44],[52,30]),  c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([140,44],[148,30]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,24],[100,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,24],[122,30]),c:CLR.robber,w:1.8,a:true },
      { d:QQ([86,46],[84,38],[82,30]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,46],[116,38],[118,30]), c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:38, name:'RedTwoMan', label:'Red 2-Man', cat:'red',
    sk:[
      { x:24,  y:36, t:'CB' },
      { x:60,  y:44, t:'N'  },
      { x:86,  y:46, t:'LB' },
      { x:114, y:46, t:'LB' },
      { x:140, y:44, t:'N'  },
      { x:176, y:36, t:'CB' },
      { x:78,  y:24, t:'S'  },
      { x:122, y:24, t:'S'  },
    ],
    dl:DL_425,
    rt:[
      { d:P([24,36],[24,18]),  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,36],[176,18]),c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([60,44],[52,30]),  c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([140,44],[148,30]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:CB([78,24],[64,12],[50,10],[36,12]), c:CLR.bracket,w:2.2,a:true },
      { d:CB([122,24],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
      { d:QQ([86,46],[86,38],[86,30]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:39, name:'RedFire', label:'Red Fire', cat:'red',
    sk:[
      { x:24,  y:36, t:'CB' },
      { x:60,  y:44, t:'N'  },
      { x:86,  y:46, t:'LB' },
      { x:114, y:46, t:'LB' },
      { x:140, y:44, t:'N'  },
      { x:176, y:36, t:'CB' },
      { x:78,  y:24, t:'S'  },
      { x:122, y:24, t:'S'  },
    ],
    dl:DL_425,
    rt:[
      { d:P([86,46],[90,56]),   c:CLR.blitz,w:2.4,a:true },
      { d:P([140,44],[132,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([64,DL_Y],[64,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([104,DL_Y],[104,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,36],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,36],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,24],[100,14]),  c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:40, name:'GoalLineFourTwoFiveHeavy', label:'Goal Line 4-2-5 Heavy', cat:'red',
    sk:[
      { x:24,  y:40, t:'CB' },
      { x:60,  y:48, t:'N'  },
      { x:86,  y:50, t:'LB' },
      { x:114, y:50, t:'LB' },
      { x:140, y:48, t:'N'  },
      { x:176, y:40, t:'CB' },
      { x:78,  y:26, t:'S'  },
      { x:122, y:26, t:'S'  },
    ],
    dl:[
      { x: 64, y: DL_Y, t:'EDGE' },
      { x: 82, y: DL_Y, t:'DT'   },
      { x: 100,y: DL_Y, t:'DT'   },
      { x: 118,y: DL_Y, t:'DT'   },
      { x: 136,y: DL_Y, t:'EDGE' },
    ],
    rt:[
      { d:P([64,DL_Y],[64,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.front,w:2.2,a:true },
      { d:P([118,DL_Y],[118,60]), c:CLR.front,w:2.2,a:true },
      { d:P([136,DL_Y],[136,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([60,48],[56,38],[52,30]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,50],[86,40],[86,32]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,50],[114,40],[114,32]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([140,48],[144,38],[148,30]), c:CLR.fit,w:1.8,a:true },
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
    { c: CLR.man,    l: 'Man / Match' },
    { c: CLR.drop,   l: 'Hook / Curl' },
    { c: CLR.robber, l: 'Buzz / Robber' },
    { c: CLR.fit,    l: 'Fit Insert' },
  ],
  fit: [
    { c: CLR.front, l: 'Front Alignment' },
    { c: CLR.fit,   l: 'Run Fit' },
  ],
  sim: [
    { c: CLR.sim,  l: 'Sim / Creeper' },
    { c: CLR.rush, l: 'Rush' },
    { c: CLR.drop, l: 'Dropper' },
    { c: CLR.zone, l: 'Shell' },
  ],
  fire: [
    { c: CLR.blitz, l: 'Blitz' },
    { c: CLR.rush,  l: 'Rush' },
    { c: CLR.drop,  l: 'Replace Drop' },
    { c: CLR.zone,  l: 'Fire Zone' },
  ],
  manpress: [
    { c: CLR.blitz, l: 'Pressure' },
    { c: CLR.man,   l: 'Man' },
    { c: CLR.robber,l: 'Middle Help' },
    { c: CLR.rush,  l: 'Rush' },
  ],
  thirddown: [
    { c: CLR.bracket,l:'Bracket' },
    { c: CLR.man,    l:'Man' },
    { c: CLR.zone,   l:'Zone' },
    { c: CLR.robber, l:'Robber / Rat' },
    { c: CLR.sim,    l:'Sim' },
  ],
  red: [
    { c: CLR.zone,  l:'Red Zone Zone' },
    { c: CLR.man,   l:'Red Zone Man' },
    { c: CLR.blitz, l:'Red Pressure' },
    { c: CLR.front, l:'Heavy Front' },
    { c: CLR.fit,   l:'Goal Line Fit' },
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
  { id:'all',       label:'All 40',        accent:'#94a3b8' },
  { id:'base',      label:'Base (10)',     accent:'#60a5fa' },
  { id:'fit',       label:'Fits (5)',      accent:'#34d399' },
  { id:'sim',       label:'Sim (5)',       accent:'#f59e0b' },
  { id:'fire',      label:'Fire (5)',      accent:'#ef4444' },
  { id:'manpress',  label:'Man (5)',       accent:'#f472b6' },
  { id:'thirddown', label:'3rd Down (5)',  accent:'#a78bfa' },
  { id:'red',       label:'Red (5)',       accent:'#fbbf24' },
];

/* ── APP ─────────────────────────────────────── */
export default function FourTwoFiveBasePlaybook() {
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
              4-2-5 BASE
            </div>
            <div style={{ color:'#60a5fa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.82 }}>
              NICKEL STRUCTURE · MULTIPLE FITS · PRESSURE FLEXIBILITY
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
        4-2-5 BASE SYSTEM · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
