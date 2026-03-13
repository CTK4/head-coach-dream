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
  zero:     '#fb7185',
};

const CAT_META = {
  base:     { label: 'Base Man',      short: 'BASE', accent: '#f472b6', bg: '#f472b612' },
  pressure: { label: '5-Man Pressure',short: 'PRESS',accent: '#ef4444', bg: '#ef444412' },
  zero:     { label: 'Zero Tier',     short: 'ZERO', accent: '#fb7185', bg: '#fb718512' },
  fire:     { label: 'Fire Zone',     short: 'FIRE', accent: '#60a5fa', bg: '#60a5fa12' },
  stunt:    { label: 'Stunts / Loops',short: 'STNT', accent: '#f59e0b', bg: '#f59e0b12' },
  dime:     { label: 'Dime / 3rd',    short: 'DIME', accent: '#a78bfa', bg: '#a78bfa12' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s, c, e) => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s, c1, c2, e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* Landmarks */
const S_Y = 26;
const LB_Y = 48;
const NICKEL_Y = 40;
const DL_Y = 70;
const CB_PRESS_Y = 38;
const CB_OFF_Y = 30;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#f472b6','#ef4444','#f59e0b',
  '#34d399','#a78bfa','#fbbf24','#64748b',
  '#f87171','#22c55e','#fb923c','#fb7185',
];

/* ── COMMON PERSONNEL ────────────────────────── */
const BASE_NICKEL_SK = [
  { x: 24,  y: CB_OFF_Y, t: 'CB' },
  { x: 54,  y: NICKEL_Y, t: 'N'  },
  { x: 86,  y: LB_Y,     t: 'LB' },
  { x: 114, y: LB_Y,     t: 'LB' },
  { x: 146, y: NICKEL_Y, t: 'N'  },
  { x: 176, y: CB_OFF_Y, t: 'CB' },
  { x: 78,  y: S_Y,      t: 'S'  },
  { x: 122, y: S_Y,      t: 'S'  },
];

const DL_NICKEL = [
  { x: 60,  y: DL_Y, t: 'EDGE' },
  { x: 82,  y: DL_Y, t: 'DT'   },
  { x: 100, y: DL_Y, t: 'DT'   },
  { x: 124, y: DL_Y, t: 'EDGE' },
];

const DIME_DB = [
  { x: 42,  y: 40, t: 'DB' },
  { x: 158, y: 40, t: 'DB' },
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ BASE MAN STRUCTURE 1-10 ═════════════════════ */
  {
    id:1, name:'NickelC1Base', label:'Nickel C1 Base', cat:'base',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,30]),      c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:2, name:'NickelC1Press', label:'Nickel C1 Press', cat:'base',
    sk:[
      { x:24,  y:CB_PRESS_Y, t:'CB' },
      { x:54,  y:NICKEL_Y,   t:'N'  },
      { x:86,  y:LB_Y,       t:'LB' },
      { x:114, y:LB_Y,       t:'LB' },
      { x:146, y:NICKEL_Y,   t:'N'  },
      { x:176, y:CB_PRESS_Y, t:'CB' },
      { x:78,  y:S_Y,        t:'S'  },
      { x:122, y:S_Y,        t:'S'  },
    ],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_PRESS_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_PRESS_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([24,CB_PRESS_Y],[24,CB_PRESS_Y+6]),     c:CLR.man,w:1.4,a:false,dsh:true },
      { d:P([176,CB_PRESS_Y],[176,CB_PRESS_Y+6]),   c:CLR.man,w:1.4,a:false,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:3, name:'NickelC1Robber', label:'Nickel C1 Robber', cat:'base',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,28]),      c:CLR.robber,w:2.0,a:true },
    ],
  },
  {
    id:4, name:'NickelC1DoubleX', label:'Nickel C1 Double X', cat:'base',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.bracket,w:2.0,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.bracket,w:2.0,a:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),     c:CLR.bracket,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
    ],
  },
  {
    id:5, name:'NickelC1CutCross', label:'Nickel C1 Cut Cross', cat:'base',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[90,40],[96,32]),   c:CLR.robber,w:1.8,a:true },
      { d:QQ([114,LB_Y],[110,40],[104,32]),c:CLR.robber,w:1.8,a:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,28]),      c:CLR.robber,w:1.8,a:true },
    ],
  },
  {
    id:6, name:'NickelC1StarLock', label:'Nickel C1 Star Lock', cat:'base',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.bracket,w:1.8,a:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
    ],
  },
  {
    id:7, name:'NickelC1InsideLeverage', label:'Nickel C1 Inside Leverage', cat:'base',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:CB([24,CB_OFF_Y],[30,26],[36,24],[42,22]),  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([176,CB_OFF_Y],[170,26],[164,24],[158,22]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[48,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[152,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[88,42],[90,34]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[112,42],[110,34]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:8, name:'NickelC1Trail', label:'Nickel C1 Trail', cat:'base',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[24,20]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,20]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,30]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,30]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,44],[82,36]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,44],[118,36]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),     c:CLR.bracket,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
    ],
  },
  {
    id:9, name:'NickelC1PressBail', label:'Nickel C1 Press Bail', cat:'base',
    sk:[
      { x:24,  y:CB_PRESS_Y, t:'CB' },
      { x:54,  y:NICKEL_Y,   t:'N'  },
      { x:86,  y:LB_Y,       t:'LB' },
      { x:114, y:LB_Y,       t:'LB' },
      { x:146, y:NICKEL_Y,   t:'N'  },
      { x:176, y:CB_PRESS_Y, t:'CB' },
      { x:78,  y:S_Y,        t:'S'  },
      { x:122, y:S_Y,        t:'S'  },
    ],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_PRESS_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_PRESS_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([24,CB_PRESS_Y],[20,24]),   c:CLR.trap,w:1.8,a:true,dsh:true },
      { d:P([176,CB_PRESS_Y],[180,24]), c:CLR.trap,w:1.8,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:10, name:'NickelC1DogAlert', label:'Nickel C1 Dog Alert', cat:'base',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]),c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
      { d:CB([122,S_Y],[116,24],[110,30],[104,36]), c:CLR.blitz,w:1.6,a:true,dsh:true },
    ],
  },

  /* ═══ CORE 5-MAN PRESSURE PACKAGE 11-20 ════════════ */
  {
    id:11, name:'NickelCrossDog', label:'Nickel Cross Dog', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:CB([86,LB_Y],[96,56],[106,54],[118,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([114,LB_Y],[104,56],[94,54],[82,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:12, name:'DoubleAGapMug', label:'Double A Gap Mug', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([86,LB_Y],[90,56]),   c:CLR.blitz,w:2.4,a:true },
      { d:P([114,LB_Y],[110,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:13, name:'NickelCatField', label:'Nickel Cat (Field)', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([146,NICKEL_Y],[156,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:14, name:'BoundaryCat', label:'Boundary Cat', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:15, name:'StrongEdgeOverload', label:'Strong Edge Overload', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([146,NICKEL_Y],[156,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([124,DL_Y],[134,56]),     c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:16, name:'WeakEdgeLoop', label:'Weak Edge Loop', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:CB([60,DL_Y],[72,62],[84,56],[98,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([86,LB_Y],[90,56]),                   c:CLR.blitz,w:2.4,a:true },
      { d:P([82,DL_Y],[76,58]),                   c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),                 c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),                 c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),               c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),             c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]),             c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                   c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:17, name:'SamFireC1', label:'Sam Fire C1', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([86,LB_Y],[90,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:18, name:'MikePlug', label:'Mike Plug', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([114,LB_Y],[110,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:19, name:'SafetyInsertBlitz', label:'Safety Insert Blitz', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([122,S_Y],[114,48]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),  c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),  c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:20, name:'InteriorTwistLBAdd', label:'Interior Twist + LB Add', cat:'pressure',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:CB([82,DL_Y],[90,64],[98,58],[104,52]), c:CLR.rush,w:2.2,a:true },
      { d:CB([100,DL_Y],[92,64],[84,58],[78,52]), c:CLR.rush,w:2.2,a:true },
      { d:P([114,LB_Y],[110,56]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },

  /* ═══ ZERO PRESSURE TIER 21-27 ═════════════════════ */
  {
    id:21, name:'ZeroCrossDog', label:'Zero Cross Dog', cat:'zero',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:CB([86,LB_Y],[96,56],[106,54],[118,58]), c:CLR.zero,w:2.4,a:true },
      { d:CB([114,LB_Y],[104,56],[94,54],[82,58]), c:CLR.zero,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.blitz,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.blitz,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]),        c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,18]),      c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:22, name:'ZeroDoubleA', label:'Zero Double A', cat:'zero',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([86,LB_Y],[90,56]),   c:CLR.zero,w:2.4,a:true },
      { d:P([114,LB_Y],[110,56]), c:CLR.zero,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.blitz,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]), c:CLR.blitz,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]),        c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,18]),      c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:23, name:'ZeroNickelCat', label:'Zero Nickel Cat', cat:'zero',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([146,NICKEL_Y],[156,54]), c:CLR.zero,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),       c:CLR.blitz,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),       c:CLR.blitz,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),     c:CLR.blitz,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),     c:CLR.blitz,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]),        c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,18]),      c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:24, name:'ZeroSafetyEdge', label:'Zero Safety Edge', cat:'zero',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([122,S_Y],[132,52]),  c:CLR.zero,w:2.4,a:true },
      { d:P([124,DL_Y],[134,56]), c:CLR.blitz,w:2.2,a:true },
      { d:P([60,DL_Y],[60,58]),   c:CLR.blitz,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.blitz,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.blitz,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]),        c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:25, name:'ZeroBoundaryOverload', label:'Zero Boundary Overload', cat:'zero',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.zero,w:2.4,a:true },
      { d:P([60,DL_Y],[50,56]),     c:CLR.blitz,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),     c:CLR.blitz,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),   c:CLR.blitz,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),   c:CLR.blitz,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]),        c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,18]),      c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:26, name:'ZeroSlotReplace', label:'Zero Slot Replace', cat:'zero',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([54,NICKEL_Y],[64,54]), c:CLR.zero,w:2.4,a:true },
      { d:P([146,NICKEL_Y],[156,54]), c:CLR.zero,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),     c:CLR.blitz,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),   c:CLR.blitz,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:QQ([114,LB_Y],[116,42],[118,34]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]), c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,18]), c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:27, name:'GoalLineZero', label:'Goal Line Zero', cat:'zero',
    sk:[
      { x:24,  y:38, t:'CB' },
      { x:54,  y:46, t:'N'  },
      { x:86,  y:48, t:'LB' },
      { x:114, y:48, t:'LB' },
      { x:146, y:46, t:'N'  },
      { x:176, y:38, t:'CB' },
      { x:78,  y:24, t:'S'  },
      { x:122, y:24, t:'S'  },
    ],
    dl:[
      { x: 60, y: DL_Y, t:'EDGE' },
      { x: 80, y: DL_Y, t:'DT'   },
      { x: 98, y: DL_Y, t:'DT'   },
      { x: 116,y: DL_Y, t:'DT'   },
      { x: 132,y: DL_Y, t:'EDGE' },
    ],
    rt:[
      { d:P([54,46],[64,54]),   c:CLR.zero,w:2.4,a:true },
      { d:P([146,46],[156,54]), c:CLR.zero,w:2.4,a:true },
      { d:P([86,48],[90,56]),   c:CLR.zero,w:2.4,a:true },
      { d:P([114,48],[110,56]), c:CLR.zero,w:2.4,a:true },
      { d:P([80,DL_Y],[80,60]), c:CLR.blitz,w:2.2,a:true },
      { d:P([98,DL_Y],[98,60]), c:CLR.blitz,w:2.2,a:true },
      { d:P([24,38],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,38],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,24],[78,18]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,24],[122,18]), c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },

  /* ═══ FIRE ZONE CHANGEUPS 28-32 ════════════════════ */
  {
    id:28, name:'NickelFireZone', label:'Nickel Fire Zone', cat:'fire',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([146,NICKEL_Y],[156,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),       c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),     c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),    c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,14]),         c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),       c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]),             c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:29, name:'CrossDogFireZone', label:'Cross Dog Fire Zone', cat:'fire',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:CB([86,LB_Y],[96,56],[106,54],[118,58]), c:CLR.blitz,w:2.4,a:true },
      { d:CB([114,LB_Y],[104,56],[94,54],[82,58]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),                     c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),                   c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,14]),                 c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),               c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]),                     c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,30]),                    c:CLR.robber,w:1.8,a:true },
      { d:QQ([146,NICKEL_Y],[150,34],[154,28]),     c:CLR.drop,w:1.8,a:true },
    ],
  },
  {
    id:30, name:'BoundaryCatFireZone', label:'Boundary Cat Fire Zone', cat:'fire',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[34,52]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),     c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),   c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),    c:CLR.drop,w:1.8,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),       c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]),            c:CLR.zone,w:2.2,a:true },
      { d:CB([78,S_Y],[66,20],[54,20],[42,22]), c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:31, name:'SafetyFireZone', label:'Safety Fire Zone', cat:'fire',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([122,S_Y],[114,48]), c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),  c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),  c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]),c:CLR.rush,w:2.2,a:true },
      { d:QQ([124,DL_Y],[130,58],[138,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),    c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,14]),         c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),       c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[78,12]),              c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:32, name:'OverloadFireZone', label:'Overload Fire Zone', cat:'fire',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([146,NICKEL_Y],[156,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([124,DL_Y],[134,56]),     c:CLR.blitz,w:2.2,a:true },
      { d:P([60,DL_Y],[60,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),       c:CLR.rush,w:2.2,a:true },
      { d:QQ([100,DL_Y],[106,58],[114,50]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([86,LB_Y],[84,42],[82,34]),    c:CLR.drop,w:1.8,a:true },
      { d:P([24,CB_OFF_Y],[24,14]),         c:CLR.zone,w:2.2,a:true },
      { d:P([176,CB_OFF_Y],[176,14]),       c:CLR.zone,w:2.2,a:true },
      { d:P([78,S_Y],[100,12]),             c:CLR.zone,w:2.2,a:true },
    ],
  },

  /* ═══ STUNT & LOOP VARIANTS 33-36 ═════════════════ */
  {
    id:33, name:'EdgeLoopStrong', label:'Edge Loop Strong', cat:'stunt',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:CB([124,DL_Y],[116,64],[108,58],[100,52]), c:CLR.rush,w:2.2,a:true },
      { d:P([146,NICKEL_Y],[156,54]),                c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),                      c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),                      c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[108,58]),                    c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),                  c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),                c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                      c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:34, name:'InteriorPirate', label:'Interior Pirate', cat:'stunt',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:CB([82,DL_Y],[90,64],[98,58],[104,52]), c:CLR.rush,w:2.2,a:true },
      { d:CB([100,DL_Y],[92,64],[84,58],[78,52]), c:CLR.rush,w:2.2,a:true },
      { d:P([60,DL_Y],[60,58]),                    c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),                  c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),                c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),              c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                    c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:35, name:'DoubleEdgeContain', label:'Double Edge Contain', cat:'stunt',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:P([60,DL_Y],[48,56]),   c:CLR.rush,w:2.2,a:true },
      { d:P([82,DL_Y],[82,60]),   c:CLR.rush,w:2.2,a:true },
      { d:P([100,DL_Y],[100,60]), c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[136,56]), c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[78,12]),        c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,12]),      c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:36, name:'TETwistDog', label:'T/E Twist + Dog', cat:'stunt',
    sk:[...BASE_NICKEL_SK],
    dl:DL_NICKEL,
    rt:[
      { d:CB([82,DL_Y],[90,64],[98,58],[104,52]), c:CLR.rush,w:2.2,a:true },
      { d:CB([60,DL_Y],[68,62],[76,56],[84,52]),  c:CLR.rush,w:2.2,a:true },
      { d:P([86,LB_Y],[90,56]),                    c:CLR.blitz,w:2.4,a:true },
      { d:P([124,DL_Y],[124,58]),                  c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),                c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]),              c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]),              c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),                    c:CLR.zone,w:2.2,a:true },
    ],
  },

  /* ═══ DIME & 3RD DOWN 37-40 ═══════════════════════ */
  {
    id:37, name:'DimeC1Pressure', label:'Dime C1 Pressure', cat:'dime',
    sk:[...BASE_NICKEL_SK, ...DIME_DB],
    dl:DL_NICKEL,
    rt:[
      { d:P([146,NICKEL_Y],[156,54]), c:CLR.blitz,w:2.4,a:true },
      { d:P([86,LB_Y],[90,56]),       c:CLR.blitz,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),     c:CLR.rush,w:2.2,a:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([42,40],[42,20]),         c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([158,40],[158,20]),       c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
    ],
  },
  {
    id:38, name:'Dime2Man', label:'Dime 2-Man', cat:'dime',
    sk:[...BASE_NICKEL_SK, ...DIME_DB],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([42,40],[42,20]),         c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([158,40],[158,20]),       c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:CB([78,S_Y],[64,12],[50,10],[36,12]),     c:CLR.bracket,w:2.2,a:true },
      { d:CB([122,S_Y],[136,12],[150,10],[164,12]), c:CLR.bracket,w:2.2,a:true },
      { d:P([54,NICKEL_Y],[46,28]),   c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([146,NICKEL_Y],[154,28]), c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:39, name:'DimeZeroSimLook', label:'Dime Zero Sim Look', cat:'dime',
    sk:[...BASE_NICKEL_SK, ...DIME_DB],
    dl:DL_NICKEL,
    rt:[
      { d:P([42,40],[52,54]),         c:CLR.sim,w:2.4,a:true },
      { d:P([158,40],[148,54]),       c:CLR.sim,w:2.4,a:true },
      { d:P([60,DL_Y],[60,58]),       c:CLR.rush,w:2.2,a:true },
      { d:P([124,DL_Y],[124,58]),     c:CLR.rush,w:2.2,a:true },
      { d:QQ([82,DL_Y],[88,58],[96,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:QQ([100,DL_Y],[94,58],[86,48]), c:CLR.drop,w:1.8,a:true,dsh:true },
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[78,18]),        c:CLR.man,w:1.8,a:true,dsh:true },
      { d:P([122,S_Y],[122,18]),      c:CLR.man,w:1.8,a:true,dsh:true },
    ],
  },
  {
    id:40, name:'DimeRobberDouble', label:'Dime Robber Double', cat:'dime',
    sk:[...BASE_NICKEL_SK, ...DIME_DB],
    dl:DL_NICKEL,
    rt:[
      { d:P([24,CB_OFF_Y],[24,18]),   c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([42,40],[42,20]),         c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([158,40],[158,20]),       c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([176,CB_OFF_Y],[176,18]), c:CLR.man,w:2.0,a:true,dsh:true },
      { d:P([78,S_Y],[100,16]),       c:CLR.zone,w:2.2,a:true },
      { d:P([122,S_Y],[122,28]),      c:CLR.robber,w:2.0,a:true },
      { d:CB([54,NICKEL_Y],[48,32],[44,28],[40,24]), c:CLR.robber,w:1.8,a:true },
      { d:CB([146,NICKEL_Y],[152,32],[156,28],[160,24]), c:CLR.robber,w:1.8,a:true },
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
      <rect width={200} height={130} fill="#120914" />

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
    { c: CLR.man,    l: 'Man' },
    { c: CLR.zone,   l: 'Middle Help' },
    { c: CLR.robber, l: 'Robber / Cut' },
    { c: CLR.bracket,l: 'Double / Lock' },
    { c: CLR.trap,   l: 'Press Bail' },
  ],
  pressure: [
    { c: CLR.blitz, l: 'Blitz' },
    { c: CLR.rush,  l: 'Rush' },
    { c: CLR.man,   l: 'Cover 1' },
    { c: CLR.zone,  l: 'Post Safety' },
  ],
  zero: [
    { c: CLR.zero, l: 'Zero Pressure' },
    { c: CLR.man,  l: 'Zero Man' },
    { c: CLR.blitz,l: 'Add-On' },
  ],
  fire: [
    { c: CLR.blitz, l: 'Blitz' },
    { c: CLR.rush,  l: 'Rush' },
    { c: CLR.drop,  l: 'Dropper' },
    { c: CLR.zone,  l: 'Fire Zone' },
    { c: CLR.robber,l: 'Middle Rotate' },
  ],
  stunt: [
    { c: CLR.rush,  l: 'Loop / Twist' },
    { c: CLR.blitz, l: 'Dog Add' },
    { c: CLR.man,   l: 'Match Behind' },
    { c: CLR.zone,  l: 'Middle Help' },
  ],
  dime: [
    { c: CLR.man,    l: 'Dime Man' },
    { c: CLR.bracket,l: 'Bracket' },
    { c: CLR.robber, l: 'Robber' },
    { c: CLR.sim,    l: 'Sim Look' },
    { c: CLR.zero,   l: 'Zero Threat' },
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
        background: hov ? '#1e1021' : '#140b16',
        border: `1px solid ${hov ? meta.accent + '55' : '#251429'}`,
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
        borderTop: `1px solid ${hov ? meta.accent + '35' : '#251429'}`,
        background: hov ? meta.bg : 'transparent',
      }}>
        <div style={{
          color: '#f8ecff', fontSize: 11, fontWeight: 700,
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
      background: 'rgba(10,4,12,0.9)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #1a0f1c 0%, #100812 100%)',
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
              color: '#f8ecff', fontSize: 20, fontWeight: 900,
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

        <div style={{ background: '#100812', padding: '0 0 4px' }}>
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
  { id:'all',      label:'All 40',       accent:'#94a3b8' },
  { id:'base',     label:'Base (10)',    accent:'#f472b6' },
  { id:'pressure', label:'Pressure (10)',accent:'#ef4444' },
  { id:'zero',     label:'Zero (7)',     accent:'#fb7185' },
  { id:'fire',     label:'Fire (5)',     accent:'#60a5fa' },
  { id:'stunt',    label:'Stunt (4)',    accent:'#f59e0b' },
  { id:'dime',     label:'Dime (4)',     accent:'#a78bfa' },
];

/* ── APP ─────────────────────────────────────── */
export default function BuddyRyanNickelPressurePlaybook() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const displayed = filter === 'all' ? PLAYS : PLAYS.filter(p => p.cat === filter);

  return (
    <div style={{
      background: '#0a060b',
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
        ::-webkit-scrollbar-track { background:#0a060b }
        ::-webkit-scrollbar-thumb { background:#3a183a; border-radius:2px }
        * { box-sizing:border-box }
      `}</style>

      <div style={{
        background: 'linear-gradient(180deg, #1a0b1b 0%, #100812 100%)',
        borderBottom: '1px solid #251429',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(244,114,182,0.7))' }}>
            🛡️
          </div>
          <div>
            <div style={{ color:'#f8ecff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              BUDDY RYAN NICKEL PRESSURE
            </div>
            <div style={{ color:'#f472b6', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.82 }}>
              AGGRESSIVE MAN PRESSURE · ZERO MENU · 3RD DOWN HEAT
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
        borderTop: '1px solid #1a0b1b',
        color: 'rgba(255,255,255,0.12)',
        fontSize: 9, letterSpacing: '2px',
      }}>
        BUDDY RYAN NICKEL PRESSURE · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
