import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  zone:     '#60a5fa',
  man:      '#f472b6',
  pressure: '#ef4444',
  stunt:    '#f59e0b',
  front:    '#34d399',
  bracket:  '#a78bfa',
  fit:      '#fbbf24',
  drop:     '#64748b',
  blitz:    '#f87171',
  robber:   '#22c55e',
  rush:     '#fb923c',
};

const CAT_META = {
  base:       { label: 'Base Structure',   short: 'BASE', accent: '#60a5fa', bg: '#60a5fa12' },
  front:      { label: 'Front Adjust',     short: 'FRNT', accent: '#34d399', bg: '#34d39912' },
  rush:       { label: 'Rush / Stunts',    short: 'RUSH', accent: '#f59e0b', bg: '#f59e0b12' },
  pressure:   { label: 'Five-Man Pressure',short: 'FIRE', accent: '#ef4444', bg: '#ef444412' },
  situational:{ label: 'Situational',      short: 'SUB',  accent: '#a78bfa', bg: '#a78bfa12' },
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
  '#f87171','#22c55e','#fb923c',
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

const DL_OKIE = [
  { x: 74,  y: DL_Y, t: 'DE' },
  { x: 94,  y: DL_Y, t: 'NT' },
  { x: 114, y: DL_Y, t: 'DE' },
];

const DIME_DB = [
  { x: 54,  y: 40, t: 'DB' },
  { x: 146, y: 40, t: 'DB' },
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ BASE STRUCTURE 1-10 ═══════════════════════════ */
  {
    id:1, name:'ThreeFourTwoGapC3', label:'3-4 Two-Gap C3', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]),                   c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,14]),                 c:CLR.zone, w:2.2, a:true },
      { d:P([122,S_Y],[122,12]),                      c:CLR.zone, w:2.2, a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]),      c:CLR.zone, w:2.2, a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]),            c:CLR.drop, w:1.8, a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),             c:CLR.drop, w:1.8, a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),          c:CLR.drop, w:1.8, a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]),         c:CLR.drop, w:1.8, a:true },
      { d:P([76,DL_Y],[76,60]),                      c:CLR.fit,  w:1.8, a:true },
      { d:P([94,DL_Y],[94,60]),                      c:CLR.fit,  w:1.8, a:true },
      { d:P([112,DL_Y],[112,60]),                    c:CLR.fit,  w:1.8, a:true },
    ],
  },
  {
    id:2, name:'ThreeFourTwoGapC1', label:'3-4 Two-Gap C1', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                  c:CLR.man,   w:2.0, a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.man,   w:2.0, a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                      c:CLR.zone,  w:2.2, a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]),           c:CLR.man,   w:1.8, a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),            c:CLR.man,   w:1.8, a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),         c:CLR.man,   w:1.8, a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]),        c:CLR.man,   w:1.8, a:true,dsh:true },
      { d:P([122,S_Y],[122,32]),                    c:CLR.robber,w:1.8, a:true },
    ],
  },
  {
    id:3, name:'ThreeFourTwoGapQuarters', label:'3-4 Two-Gap Quarters', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                 c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),               c:CLR.zone, w:2.2, a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),    c:CLR.zone, w:2.2, a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]),c:CLR.zone, w:2.2, a:true },
      { d:QQ([70,OLB_Y],[66,42],[62,34]),          c:CLR.drop, w:1.8, a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]),           c:CLR.drop, w:1.8, a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),        c:CLR.drop, w:1.8, a:true },
      { d:QQ([130,OLB_Y],[134,42],[138,34]),       c:CLR.drop, w:1.8, a:true },
    ],
  },
  {
    id:4, name:'ThreeFourTwoGapC2', label:'3-4 Two-Gap C2', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([24,CB_OFF_Y],[18,24],[12,16],[10,10]), c:CLR.zone, w:2.2, a:true },
      { d:CB([176,CB_OFF_Y],[182,24],[188,16],[190,10]), c:CLR.zone, w:2.2, a:true },
      { d:P([78,S_Y],[78,10]),                         c:CLR.zone, w:2.2, a:true },
      { d:P([122,S_Y],[122,10]),                       c:CLR.zone, w:2.2, a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]),             c:CLR.drop, w:1.8, a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]),              c:CLR.drop, w:1.8, a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),           c:CLR.drop, w:1.8, a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]),          c:CLR.drop, w:1.8, a:true },
    ],
  },
  {
    id:5, name:'ThreeFourTwoGapRobber', label:'3-4 Two-Gap Robber', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                 c:CLR.man,    w:2.0, a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),               c:CLR.man,    w:2.0, a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                     c:CLR.zone,   w:2.2, a:true },
      { d:P([122,S_Y],[122,34]),                    c:CLR.robber, w:2.0, a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]),          c:CLR.man,    w:1.8, a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),           c:CLR.drop,   w:1.8, a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),        c:CLR.drop,   w:1.8, a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]),       c:CLR.man,    w:1.8, a:true,dsh:true },
    ],
  },
  {
    id:6, name:'ThreeFourTwoGapPressC1', label:'3-4 Two-Gap Press C1', cat:'base',
    sk:[
      { x:24, y:CB_PRESS_Y, t:'CB' },
      { x:70, y:OLB_Y,      t:'OLB' },
      { x:86, y:LB_Y,       t:'ILB' },
      { x:114,y:LB_Y,       t:'ILB' },
      { x:130,y:OLB_Y,      t:'OLB' },
      { x:176,y:CB_PRESS_Y, t:'CB' },
      { x:78, y:S_Y,        t:'S' },
      { x:122,y:S_Y,        t:'S' },
    ],
    dl:DL_34,
    rt:[
      { d:P([24,CB_PRESS_Y],[24,18]),               c:CLR.man,    w:2.0, a:true,dsh:true },
      { d:P([176,CB_PRESS_Y],[176,18]),             c:CLR.man,    w:2.0, a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                     c:CLR.zone,   w:2.2, a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]),          c:CLR.man,    w:1.8, a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),           c:CLR.man,    w:1.8, a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),        c:CLR.man,    w:1.8, a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]),       c:CLR.man,    w:1.8, a:true,dsh:true },
      { d:P([122,S_Y],[122,32]),                   c:CLR.robber, w:1.8, a:true },
    ],
  },
  {
    id:7, name:'ThreeFourTwoGapCloud', label:'3-4 Two-Gap Cloud', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,24],[10,16],[8,10]), c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),               c:CLR.zone, w:2.2, a:true },
      { d:P([78,S_Y],[78,10]),                      c:CLR.zone, w:2.2, a:true },
      { d:CB([122,S_Y],[136,14],[150,12],[162,14]),c:CLR.zone, w:2.2, a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]),          c:CLR.fit,  w:1.8, a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]),           c:CLR.drop, w:1.8, a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),        c:CLR.drop, w:1.8, a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]),       c:CLR.drop, w:1.8, a:true },
    ],
  },
  {
    id:8, name:'ThreeFourTwoGapMatch', label:'3-4 Two-Gap Match', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),                  c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.zone, w:2.2, a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),     c:CLR.zone, w:2.2, a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone, w:2.2, a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]),           c:CLR.man,  w:1.8, a:true,dsh:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]),            c:CLR.drop, w:1.8, a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),         c:CLR.drop, w:1.8, a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]),        c:CLR.man,  w:1.8, a:true,dsh:true },
    ],
  },
  {
    id:9, name:'ThreeFourTwoGapC6', label:'3-4 Two-Gap C6', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([24,CB_OFF_Y],[16,24],[10,16],[8,10]), c:CLR.zone, w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,18]),               c:CLR.zone, w:2.2, a:true },
      { d:CB([78,S_Y],[90,14],[102,14],[114,16]),  c:CLR.zone, w:2.2, a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]),c:CLR.zone, w:2.2, a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),           c:CLR.drop, w:1.8, a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),        c:CLR.drop, w:1.8, a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]),       c:CLR.drop, w:1.8, a:true },
    ],
  },
  {
    id:10, name:'ThreeFourTwoGapBuzz', label:'3-4 Two-Gap Buzz', cat:'base',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,14]),                  c:CLR.zone,  w:2.2, a:true },
      { d:P([176,CB_OFF_Y],[176,14]),                c:CLR.zone,  w:2.2, a:true },
      { d:P([78,S_Y],[100,16]),                      c:CLR.zone,  w:2.2, a:true },
      { d:P([122,S_Y],[122,34]),                     c:CLR.robber,w:2.0, a:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]),          c:CLR.drop,  w:1.8, a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),           c:CLR.drop,  w:1.8, a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),        c:CLR.drop,  w:1.8, a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]),       c:CLR.drop,  w:1.8, a:true },
    ],
  },

  /* ═══ FRONT ADJUSTMENTS 11-15 ═══════════════════════ */
  {
    id:11, name:'OkieFront', label:'Okie Front', cat:'front',
    sk:[...BASE_34_SK],
    dl:DL_OKIE,
    rt:[
      { d:P([74,DL_Y],[74,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([114,DL_Y],[114,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[66,42],[62,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[134,42],[138,34]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:12, name:'UnderFront', label:'Under Front', cat:'front',
    sk:[...BASE_34_SK],
    dl:[
      { x: 68, y: DL_Y, t:'DE' },
      { x: 90, y: DL_Y, t:'NT' },
      { x: 112,y: DL_Y, t:'DE' },
    ],
    rt:[
      { d:P([68,DL_Y],[68,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([90,DL_Y],[90,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[62,42],[54,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]),c:CLR.fit,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[138,42],[146,34]),c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:13, name:'MintFront', label:'Mint Front', cat:'front',
    sk:[...BASE_34_SK],
    dl:[
      { x: 72, y: DL_Y, t:'DE' },
      { x: 94, y: DL_Y, t:'NT' },
      { x: 116,y: DL_Y, t:'DE' },
    ],
    rt:[
      { d:P([72,DL_Y],[72,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([116,DL_Y],[116,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[66,42],[62,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[134,42],[138,34]), c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:14, name:'BearFront', label:'Bear Front', cat:'front',
    sk:[...BASE_34_SK],
    dl:[
      { x: 72, y: DL_Y, t:'DE' },
      { x: 86, y: DL_Y, t:'DT' },
      { x: 100,y: DL_Y, t:'NT' },
      { x: 114,y: DL_Y, t:'DT' },
      { x: 128,y: DL_Y, t:'DE' },
    ],
    rt:[
      { d:P([72,DL_Y],[72,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.front,w:2.2,a:true },
      { d:P([114,DL_Y],[114,60]), c:CLR.front,w:2.2,a:true },
      { d:P([128,DL_Y],[128,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),  c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),c:CLR.fit,w:1.8,a:true },
    ],
  },
  {
    id:15, name:'HeavyGoalLine', label:'Heavy Goal Line', cat:'front',
    sk:[
      { x:24, y:38, t:'CB' },
      { x:70, y:54, t:'OLB' },
      { x:86, y:48, t:'ILB' },
      { x:114,y:48, t:'ILB' },
      { x:130,y:54, t:'OLB' },
      { x:176,y:38, t:'CB' },
      { x:78, y:26, t:'S'  },
      { x:122,y:26, t:'S'  },
    ],
    dl:[
      { x: 72, y: DL_Y, t:'DE' },
      { x: 86, y: DL_Y, t:'DT' },
      { x: 100,y: DL_Y, t:'NT' },
      { x: 114,y: DL_Y, t:'DT' },
      { x: 128,y: DL_Y, t:'DE' },
    ],
    rt:[
      { d:P([72,DL_Y],[72,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([86,DL_Y],[86,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.front,w:2.2,a:true },
      { d:P([114,DL_Y],[114,60]), c:CLR.front,w:2.2,a:true },
      { d:P([128,DL_Y],[128,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([70,54],[66,42],[62,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([86,48],[86,40],[86,32]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([114,48],[114,40],[114,32]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([130,54],[134,42],[138,34]), c:CLR.fit,w:1.8,a:true },
    ],
  },

  /* ═══ FOUR-MAN RUSH / STUNTS 16-20 ══════════════════ */
  {
    id:16, name:'BaseRush', label:'Base Rush', cat:'rush',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([70,OLB_Y],[64,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]),  c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),  c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]),c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,52]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:17, name:'TETwist', label:'T/E Twist', cat:'rush',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([70,OLB_Y],[66,58]), c:CLR.rush,w:2.2,a:true },
      { d:CB([76,DL_Y],[82,64],[90,58],[98,52]), c:CLR.stunt,w:2.2,a:true },
      { d:CB([94,DL_Y],[88,62],[80,56],[72,52]), c:CLR.stunt,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,52]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:18, name:'OLBLoop', label:'OLB Loop', cat:'rush',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([70,OLB_Y],[78,62],[88,58],[100,52]), c:CLR.stunt,w:2.2,a:true },
      { d:P([76,DL_Y],[70,58]),                    c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),                    c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]),                  c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,52]),       c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:19, name:'InteriorStunt', label:'Interior Stunt', cat:'rush',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([70,OLB_Y],[64,58]), c:CLR.rush,w:2.2,a:true },
      { d:CB([76,DL_Y],[84,64],[92,58],[98,52]), c:CLR.stunt,w:2.2,a:true },
      { d:CB([94,DL_Y],[88,64],[82,58],[76,52]), c:CLR.stunt,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,52]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:20, name:'WideEdgeRush', label:'Wide Edge Rush', cat:'rush',
    sk:[
      { x:24, y:CB_OFF_Y, t:'CB' },
      { x:60, y:OLB_Y,    t:'OLB' },
      { x:86, y:LB_Y,     t:'ILB' },
      { x:114,y:LB_Y,     t:'ILB' },
      { x:140,y:OLB_Y,    t:'OLB' },
      { x:176,y:CB_OFF_Y, t:'CB' },
      { x:78, y:S_Y,      t:'S'  },
      { x:122,y:S_Y,      t:'S'  },
    ],
    dl:DL_34,
    rt:[
      { d:P([60,OLB_Y],[50,56]),  c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([140,OLB_Y],[150,56]),c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[78,12]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },

  /* ═══ FIVE-MAN PRESSURE 21-30 ═══════════════════════ */
  {
    id:21, name:'SamFire', label:'Sam Fire', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,OLB_Y],[64,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]),    c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),    c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]),  c:CLR.rush,w:2.2,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:22, name:'WillFire', label:'Will Fire', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([70,OLB_Y],[62,56]),  c:CLR.blitz,w:2.4,a:true },
      { d:P([130,OLB_Y],[136,58]),c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]), c:CLR.rush,w:2.2,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:23, name:'CrossDog', label:'Cross Dog', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([86,LB_Y],[94,56],[102,54],[110,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([114,LB_Y],[106,56],[98,54],[90,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,OLB_Y],[64,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([130,OLB_Y],[136,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),    c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:24, name:'DoubleA', label:'Double A', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([86,LB_Y],[88,58]),  c:CLR.blitz,w:2.4,a:true },
      { d:P([114,LB_Y],[112,58]),c:CLR.blitz,w:2.4,a:true },
      { d:P([70,OLB_Y],[64,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([130,OLB_Y],[136,58]),c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),  c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:25, name:'BoundaryCat', label:'Boundary Cat', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,OLB_Y],[64,58]),    c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]),   c:CLR.rush,w:2.2,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:26, name:'FieldStorm', label:'Field Storm', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([176,CB_OFF_Y],[166,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([130,OLB_Y],[136,58]),    c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]),     c:CLR.rush,w:2.2,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[78,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:27, name:'ZoneFireC3', label:'Zone Fire C3', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([70,OLB_Y],[64,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]),  c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),  c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]),c:CLR.rush,w:2.2,a:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:28, name:'ZoneFireC1', label:'Zone Fire C1', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([130,OLB_Y],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]),    c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),    c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]),  c:CLR.rush,w:2.2,a:true },
      { d:QQ([70,OLB_Y],[64,58],[58,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,32]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:29, name:'OLBCross', label:'OLB Cross', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:CB([70,OLB_Y],[82,58],[94,56],[108,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([130,OLB_Y],[118,58],[106,56],[92,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([76,DL_Y],[76,58]),  c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),  c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]),c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:30, name:'SafetyInsert', label:'Safety Insert', cat:'pressure',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([122,S_Y],[114,48]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,OLB_Y],[64,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]),  c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),  c:CLR.rush,w:2.2,a:true },
      { d:P([112,DL_Y],[112,58]),c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },

  /* ═══ SITUATIONAL / SUBPACKAGE 31-40 ════════════════ */
  {
    id:31, name:'Dime2Man', label:'Dime 2-Man', cat:'situational',
    sk:[...BASE_34_SK, ...DIME_DB],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,40],[54,20]),       c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([146,40],[146,20]),     c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.bracket,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:32, name:'DimeC1', label:'Dime C1', cat:'situational',
    sk:[...BASE_34_SK, ...DIME_DB],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,40],[54,20]),       c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([146,40],[146,20]),     c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),     c:CLR.zone,w:2.2,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,32]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:33, name:'RedC1', label:'Red C1', cat:'situational',
    sk:[
      { x:24, y:36, t:'CB' },
      { x:70, y:52, t:'OLB' },
      { x:86, y:46, t:'ILB' },
      { x:114,y:46, t:'ILB' },
      { x:130,y:52, t:'OLB' },
      { x:176,y:36, t:'CB' },
      { x:78, y:24, t:'S'  },
      { x:122,y:24, t:'S'  },
    ],
    dl:DL_34,
    rt:[
      { d:P([24,36],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,36],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,24],[100,14]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([70,52],[64,42],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,46],[84,38],[82,30]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,46],[116,38],[118,30]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([130,52],[136,42],[142,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,24],[122,30]), c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:34, name:'RedFire', label:'Red Fire', cat:'situational',
    sk:[
      { x:24, y:36, t:'CB' },
      { x:70, y:52, t:'OLB' },
      { x:86, y:46, t:'ILB' },
      { x:114,y:46, t:'ILB' },
      { x:130,y:52, t:'OLB' },
      { x:176,y:36, t:'CB' },
      { x:78, y:24, t:'S'  },
      { x:122,y:24, t:'S'  },
    ],
    dl:DL_34,
    rt:[
      { d:P([86,46],[90,58]),   c:CLR.blitz,w:2.4,a:true },
      { d:P([130,52],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,52],[64,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,36],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,36],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,24],[100,14]),  c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:35, name:'Drop8', label:'Drop-8', cat:'situational',
    sk:[...BASE_34_SK],
    dl:[
      { x: 94, y: DL_Y, t:'NT' },
      { x: 112,y: DL_Y, t:'DE' },
    ],
    rt:[
      { d:P([94,DL_Y],[94,60]),  c:CLR.rush,w:2.2,a:true },
      { d:QQ([112,DL_Y],[118,58],[126,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:36, name:'ThirdLongSim', label:'3rd Long Sim', cat:'situational',
    sk:[...BASE_34_SK, ...DIME_DB],
    dl:DL_34,
    rt:[
      { d:P([114,LB_Y],[112,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([70,OLB_Y],[64,58]),  c:CLR.rush,w:2.2,a:true },
      { d:P([76,DL_Y],[76,58]),   c:CLR.rush,w:2.2,a:true },
      { d:QQ([112,DL_Y],[118,58],[126,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,58],[142,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,40],[54,22]), c:CLR.bracket,w:2.0,a:true },
      { d:P([146,40],[146,22]), c:CLR.bracket,w:2.0,a:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:37, name:'GoalLineFiveTwo', label:'Goal Line 5-2', cat:'situational',
    sk:[
      { x:24, y:40, t:'CB' },
      { x:74, y:52, t:'ILB' },
      { x:126,y:52, t:'ILB' },
      { x:176,y:40, t:'CB' },
      { x:78, y:26, t:'S'  },
      { x:122,y:26, t:'S'  },
    ],
    dl:[
      { x:64, y:DL_Y, t:'EDGE' },
      { x:78, y:DL_Y, t:'DE'   },
      { x:94, y:DL_Y, t:'NT'   },
      { x:110,y:DL_Y, t:'DE'   },
      { x:126,y:DL_Y, t:'EDGE' },
    ],
    rt:[
      { d:P([64,DL_Y],[64,58]),   c:CLR.front,w:2.2,a:true },
      { d:P([78,DL_Y],[78,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([94,DL_Y],[94,60]),   c:CLR.front,w:2.2,a:true },
      { d:P([110,DL_Y],[110,60]), c:CLR.front,w:2.2,a:true },
      { d:P([126,DL_Y],[126,58]), c:CLR.front,w:2.2,a:true },
      { d:QQ([74,52],[74,42],[74,34]), c:CLR.fit,w:1.8,a:true },
      { d:QQ([126,52],[126,42],[126,34]), c:CLR.fit,w:1.8,a:true },
      { d:P([24,40],[24,24]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,40],[176,24]), c:CLR.man,w:2.0,a:true,dsh:true },
    ],
  },
  {
    id:38, name:'BearPressure', label:'Bear Pressure', cat:'situational',
    sk:[...BASE_34_SK],
    dl:[
      { x:72, y:DL_Y, t:'DE' },
      { x:86, y:DL_Y, t:'DT' },
      { x:100,y:DL_Y, t:'NT' },
      { x:114,y:DL_Y, t:'DT' },
      { x:128,y:DL_Y, t:'DE' },
    ],
    rt:[
      { d:P([70,OLB_Y],[62,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([130,OLB_Y],[138,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([86,DL_Y],[86,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([114,DL_Y],[114,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:39, name:'BracketX', label:'Bracket X', cat:'situational',
    sk:[...BASE_34_SK, ...DIME_DB],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]), c:CLR.bracket,w:2.2,a:true },
      { d:P([54,40],[54,22]), c:CLR.bracket,w:2.0,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.zone,w:2.2,a:true },
      { d:P([146,40],[146,22]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.zone,w:2.2,a:true },
      { d:QQ([86,LB_Y],[86,42],[86,34]), c:CLR.drop,w:1.8,a:true },
      { d:QQ([114,LB_Y],[114,42],[114,34]), c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:40, name:'RobberRat', label:'Robber Rat', cat:'situational',
    sk:[...BASE_34_SK],
    dl:DL_34,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),   c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,30]),  c:CLR.robber,w:2.0,a:true },
      { d:P([86,LB_Y],[86,34]),   c:CLR.robber,w:1.8,a:true,dsh:true },
      { d:QQ([70,OLB_Y],[64,44],[58,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([130,OLB_Y],[136,44],[142,34]), c:CLR.man,w:1.8,a:true,dsh:true },
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
  EDGE:'#ef4444',
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
      <rect width={200} height={130} fill="#130913" />

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
    { c: CLR.man,    l: 'Man' },
    { c: CLR.drop,   l: 'Hook / Curl' },
    { c: CLR.robber, l: 'Robber / Buzz' },
    { c: CLR.fit,    l: 'Two-Gap Fit' },
  ],
  front: [
    { c: CLR.front, l: 'Front Alignment' },
    { c: CLR.fit,   l: 'Run Fit' },
  ],
  rush: [
    { c: CLR.rush,  l: 'Rush' },
    { c: CLR.stunt, l: 'Twist / Loop' },
    { c: CLR.drop,  l: 'Zone Replace' },
  ],
  pressure: [
    { c: CLR.blitz, l: 'Blitz' },
    { c: CLR.rush,  l: 'Rush' },
    { c: CLR.drop,  l: 'Replace Drop' },
    { c: CLR.zone,  l: 'Zone' },
    { c: CLR.man,   l: 'Man' },
  ],
  situational: [
    { c: CLR.bracket,l:'Bracket' },
    { c: CLR.man,    l:'Man' },
    { c: CLR.zone,   l:'Zone' },
    { c: CLR.robber, l:'Robber / Rat' },
    { c: CLR.front,  l:'Goal Line Front' },
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
        background: hov ? '#241126' : '#170c1a',
        border: `1px solid ${hov ? meta.accent + '55' : '#2b1530'}`,
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
        borderTop: `1px solid ${hov ? meta.accent + '35' : '#2b1530'}`,
        background: hov ? meta.bg : 'transparent',
      }}>
        <div style={{
          color: '#f6eaff', fontSize: 11, fontWeight: 700,
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
      background: 'rgba(12,4,16,0.9)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #1d0d20 0%, #110713 100%)',
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
              color: '#f6eaff', fontSize: 20, fontWeight: 900,
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

        <div style={{ background: '#110713', padding: '0 0 4px' }}>
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
              ['DE','#f59e0b'],['NT','#8b9ab5'],['DT','#64748b'],['EDGE','#ef4444'],['DB','#f472b6']
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
  { id:'all',         label:'All 40',       accent:'#94a3b8' },
  { id:'base',        label:'Base (10)',    accent:'#60a5fa' },
  { id:'front',       label:'Fronts (5)',   accent:'#34d399' },
  { id:'rush',        label:'Rush (5)',     accent:'#f59e0b' },
  { id:'pressure',    label:'Pressure (10)',accent:'#ef4444' },
  { id:'situational', label:'Sub (10)',     accent:'#a78bfa' },
];

/* ── APP ─────────────────────────────────────── */
export default function ThreeFourTwoGapPlaybook() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const displayed = filter === 'all' ? PLAYS : PLAYS.filter(p => p.cat === filter);

  return (
    <div style={{
      background: '#0d0610',
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
        ::-webkit-scrollbar-track { background:#0d0610 }
        ::-webkit-scrollbar-thumb { background:#3a1740; border-radius:2px }
        * { box-sizing:border-box }
      `}</style>

      <div style={{
        background: 'linear-gradient(180deg, #1a0b1d 0%, #110713 100%)',
        borderBottom: '1px solid #2b1530',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(244,114,182,0.7))' }}>
            🛡️
          </div>
          <div>
            <div style={{ color:'#f6eaff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              3-4 TWO-GAP
            </div>
            <div style={{ color:'#f472b6', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.82 }}>
              OKIE FRONT · TWO-GAP CONTROL · PRESSURE MENU
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
        borderTop: '1px solid #1a0b1d',
        color: 'rgba(255,255,255,0.12)',
        fontSize: 9, letterSpacing: '2px',
      }}>
        3-4 TWO-GAP SYSTEM · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
