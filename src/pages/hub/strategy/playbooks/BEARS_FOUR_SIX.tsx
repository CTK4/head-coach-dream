import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  deep:    '#60a5fa',
  mid:     '#38bdf8',
  underneath:'#34d399',
  flat:    '#fbbf24',
  man:     '#a78bfa',
  robber:  '#f472b6',
  blitz:   '#ef4444',
  stunt:   '#f97316',
  fit:     '#94a3b8',
  contain: '#f59e0b',
  sim:     '#8b5cf6',
};

const CAT_META = {
  base:        { label: 'Base',        short: 'BASE', accent: '#60a5fa', bg: '#60a5fa12' },
  pressure:    { label: 'Pressure',    short: 'FIRE', accent: '#ef4444', bg: '#ef444412' },
  situational: { label: 'Situational', short: 'SIT',  accent: '#34d399', bg: '#34d39912' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* ── ALIGNMENTS ──────────────────────────────── */
const FRONT_FOUR = [62, 82, 98, 118];
const FRONT_FIVE = [52, 72, 90, 108, 128];

const DEF46 = [
  {x:18,y:58,t:'CB'},
  {x:46,y:70,t:'S'},
  {x:58,y:62,t:'S'},
  {x:122,y:78,t:'LB'},
  {x:142,y:62,t:'S'},
  {x:154,y:70,t:'S'},
  {x:182,y:58,t:'CB'},
  {x:70,y:84,t:'LB'},
  {x:90,y:80,t:'LB'},
  {x:110,y:84,t:'LB'},
];

const NICKEL46 = [
  {x:18,y:58,t:'CB'},
  {x:38,y:72,t:'N'},
  {x:58,y:62,t:'S'},
  {x:142,y:62,t:'S'},
  {x:162,y:72,t:'N'},
  {x:182,y:58,t:'CB'},
  {x:70,y:84,t:'LB'},
  {x:90,y:80,t:'LB'},
  {x:110,y:84,t:'LB'},
];

const DIME46 = [
  {x:16,y:58,t:'CB'},
  {x:34,y:72,t:'CB'},
  {x:58,y:62,t:'S'},
  {x:142,y:62,t:'S'},
  {x:166,y:72,t:'CB'},
  {x:184,y:58,t:'CB'},
  {x:74,y:84,t:'LB'},
  {x:106,y:84,t:'LB'},
];

const GOAL46 = [
  {x:24,y:62,t:'CB'},
  {x:48,y:72,t:'S'},
  {x:60,y:64,t:'S'},
  {x:72,y:84,t:'LB'},
  {x:90,y:80,t:'LB'},
  {x:108,y:84,t:'LB'},
  {x:120,y:64,t:'S'},
  {x:132,y:72,t:'S'},
  {x:176,y:62,t:'CB'},
];

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#60a5fa','#38bdf8','#34d399','#fbbf24','#a78bfa',
  '#f472b6','#ef4444','#f97316','#94a3b8','#f59e0b','#8b5cf6',
];

/* ── PLAY DATA ───────────────────────────────── */
const PLAYS = [
  /* ═══ BASE 1-10 ══════════════════════════════ */
  {
    id:1, name:'46_C1', label:'46 C1', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([46,70],[36,42]), c:CLR.man,w:2.1,a:true},
      {d:P([154,70],[164,42]), c:CLR.man,w:2.1,a:true},
      {d:P([70,84],[64,48]), c:CLR.man,w:2.1,a:true},
      {d:P([110,84],[116,48]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[124,58],[108,54]), c:CLR.robber,w:2.0,a:true},
      {d:P([90,80],[92,50]), c:CLR.underneath,w:1.8,a:true},
      {d:P([62,LOS],[60,LOS-12]), c:CLR.fit,w:1.2,a:true},
      {d:P([82,LOS],[82,LOS-12]), c:CLR.fit,w:1.2,a:true},
      {d:P([98,LOS],[98,LOS-12]), c:CLR.fit,w:1.2,a:true},
      {d:P([118,LOS],[120,LOS-12]), c:CLR.fit,w:1.2,a:true},
    ],
  },
  {
    id:2, name:'46_C3', label:'46 C3', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([182,58],[182,16]), c:CLR.deep,w:2.2,a:true},
      {d:CB([142,62],[120,56],[102,18],[100,12]), c:CLR.mid,w:2.2,a:true},
      {d:P([46,70],[38,30]), c:CLR.flat,w:2,a:true},
      {d:P([154,70],[162,30]), c:CLR.flat,w:2,a:true},
      {d:P([70,84],[66,56]), c:CLR.underneath,w:1.8,a:true},
      {d:P([90,80],[92,52]), c:CLR.underneath,w:1.8,a:true},
      {d:P([110,84],[114,56]), c:CLR.underneath,w:1.8,a:true},
    ],
  },
  {
    id:3, name:'46_Robber', label:'46 Robber', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([46,70],[36,42]), c:CLR.man,w:2.1,a:true},
      {d:P([154,70],[164,42]), c:CLR.man,w:2.1,a:true},
      {d:P([70,84],[64,48]), c:CLR.man,w:2.1,a:true},
      {d:P([110,84],[116,48]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[130,64],[116,58]), c:CLR.robber,w:2.0,a:true},
      {d:P([90,80],[92,48]), c:CLR.robber,w:1.8,a:true},
    ],
  },
  {
    id:4, name:'46_Press', label:'46 Press', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:64,t:'CB'},{x:46,y:70,t:'S'},{x:58,y:62,t:'S'},
      {x:122,y:78,t:'LB'},{x:142,y:62,t:'S'},{x:154,y:70,t:'S'},
      {x:182,y:64,t:'CB'},{x:70,y:84,t:'LB'},{x:90,y:80,t:'LB'},{x:110,y:84,t:'LB'}
    ],
    rt:[
      {d:P([18,64],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,64],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([46,70],[36,42]), c:CLR.man,w:2.1,a:true},
      {d:P([154,70],[164,42]), c:CLR.man,w:2.1,a:true},
      {d:P([70,84],[64,48]), c:CLR.man,w:2.1,a:true},
      {d:P([110,84],[116,48]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[124,58],[108,54]), c:CLR.robber,w:2.0,a:true},
    ],
  },
  {
    id:5, name:'46_Cloud', label:'46 Cloud', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:QQ([18,58],[14,44],[12,28]), c:CLR.flat,w:2,a:true},
      {d:P([182,58],[182,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.2,a:true},
      {d:CB([142,62],[120,56],[102,18],[100,12]), c:CLR.mid,w:2.2,a:true},
      {d:P([46,70],[38,34]), c:CLR.underneath,w:1.8,a:true},
      {d:P([70,84],[66,56]), c:CLR.underneath,w:1.8,a:true},
      {d:P([110,84],[114,56]), c:CLR.underneath,w:1.8,a:true},
    ],
  },
  {
    id:6, name:'46_Tampa', label:'46 Tampa', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,24]), c:CLR.flat,w:2,a:true},
      {d:P([182,58],[182,24]), c:CLR.flat,w:2,a:true},
      {d:P([58,62],[58,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([142,62],[142,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([90,80],[90,60],[92,42],[94,18]), c:CLR.mid,w:2.2,a:true},
      {d:P([46,70],[38,36]), c:CLR.underneath,w:1.8,a:true},
      {d:P([70,84],[66,58]), c:CLR.underneath,w:1.8,a:true},
      {d:P([110,84],[114,58]), c:CLR.underneath,w:1.8,a:true},
    ],
  },
  {
    id:7, name:'46_Zero', label:'46 Zero', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,18]), c:CLR.man,w:2.2,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.2,a:true},
      {d:P([46,70],[36,42]), c:CLR.man,w:2.2,a:true},
      {d:P([154,70],[164,42]), c:CLR.man,w:2.2,a:true},
      {d:P([70,84],[64,44]), c:CLR.man,w:2.2,a:true},
      {d:P([90,80],[92,44]), c:CLR.man,w:2.2,a:true},
      {d:P([110,84],[116,44]), c:CLR.man,w:2.2,a:true},
      {d:P([58,62],[58,28]), c:CLR.man,w:2.0,a:true},
      {d:P([142,62],[142,28]), c:CLR.man,w:2.0,a:true},
    ],
  },
  {
    id:8, name:'46_Quarters', label:'46 Quarters', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,16]), c:CLR.man,w:2.0,a:true},
      {d:P([182,58],[182,16]), c:CLR.man,w:2.0,a:true},
      {d:P([58,62],[58,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([142,62],[142,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([46,70],[38,34]), c:CLR.match,w:1.9,a:true},
      {d:P([154,70],[162,34]), c:CLR.match,w:1.9,a:true},
      {d:P([90,80],[92,52]), c:CLR.underneath,w:1.8,a:true},
      {d:P([70,84],[66,56]), c:CLR.underneath,w:1.8,a:true},
      {d:P([110,84],[114,56]), c:CLR.underneath,w:1.8,a:true},
    ],
  },
  {
    id:9, name:'46_Lock', label:'46 Lock', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,16]), c:CLR.bracket,w:2.1,a:true},
      {d:P([182,58],[182,16]), c:CLR.bracket,w:2.1,a:true},
      {d:P([46,70],[36,42]), c:CLR.man,w:2.1,a:true},
      {d:P([154,70],[164,42]), c:CLR.man,w:2.1,a:true},
      {d:P([70,84],[64,48]), c:CLR.man,w:2.1,a:true},
      {d:P([110,84],[116,48]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[124,58],[108,54]), c:CLR.robber,w:2.0,a:true},
    ],
  },
  {
    id:10, name:'46_Buzz', label:'46 Buzz', cat:'base',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([182,58],[182,16]), c:CLR.deep,w:2.2,a:true},
      {d:CB([142,62],[122,56],[102,18],[100,12]), c:CLR.mid,w:2.2,a:true},
      {d:P([58,62],[50,30]), c:CLR.flat,w:2,a:true},
      {d:P([46,70],[40,36]), c:CLR.underneath,w:1.8,a:true},
      {d:P([70,84],[66,56]), c:CLR.underneath,w:1.8,a:true},
      {d:P([110,84],[114,56]), c:CLR.underneath,w:1.8,a:true},
    ],
  },

  /* ═══ PRESSURE 11-25 ═════════════════════════ */
  {
    id:11, name:'Edge_Fire', label:'Edge Fire', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([46,70],[34,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([154,70],[166,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[124,58],[108,54]), c:CLR.robber,w:2.0,a:true},
      {d:P([90,80],[92,50]), c:CLR.underneath,w:1.8,a:true},
    ],
  },
  {
    id:12, name:'Cross_Dog', label:'Cross Dog', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:CB([70,84],[78,72],[86,56],[94,42]), c:CLR.blitz,w:2.2,a:true},
      {d:CB([110,84],[102,72],[94,56],[86,42]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[124,58],[108,54]), c:CLR.robber,w:2.0,a:true},
    ],
  },
  {
    id:13, name:'Double_A', label:'Double A', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([70,84],[84,48]), c:CLR.blitz,w:2.2,a:true},
      {d:P([110,84],[96,48]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([90,80],[92,44]), c:CLR.man,w:2.1,a:true},
    ],
  },
  {
    id:14, name:'Strong_Storm', label:'Strong Storm', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([154,70],[166,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([122,78],[130,44]), c:CLR.blitz,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[124,58],[108,54]), c:CLR.robber,w:2.0,a:true},
    ],
  },
  {
    id:15, name:'Weak_Storm', label:'Weak Storm', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([46,70],[34,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([70,84],[62,44]), c:CLR.blitz,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([58,62],[76,58],[92,54]), c:CLR.robber,w:2.0,a:true},
    ],
  },
  {
    id:16, name:'Nickel_Cat', label:'Nickel Cat', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...NICKEL46],
    rt:[
      {d:P([38,72],[28,36]), c:CLR.blitz,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([70,84],[66,50]), c:CLR.man,w:2.1,a:true},
      {d:P([110,84],[114,50]), c:CLR.man,w:2.1,a:true},
    ],
  },
  {
    id:17, name:'Safety_Fire', label:'Safety Fire', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([46,70],[34,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([58,62],[50,30]), c:CLR.blitz,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([154,70],[142,60],[126,54]), c:CLR.robber,w:2.0,a:true},
    ],
  },
  {
    id:18, name:'Zero_Cross', label:'Zero Cross', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:CB([70,84],[78,72],[86,56],[94,42]), c:CLR.blitz,w:2.2,a:true},
      {d:CB([110,84],[102,72],[94,56],[86,42]), c:CLR.blitz,w:2.2,a:true},
      {d:P([46,70],[34,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([154,70],[166,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.2,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.2,a:true},
      {d:P([58,62],[58,28]), c:CLR.man,w:2.0,a:true},
      {d:P([142,62],[142,28]), c:CLR.man,w:2.0,a:true},
    ],
  },
  {
    id:19, name:'Zone_Fire', label:'Zone Fire', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([46,70],[34,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.underneath,w:1.7,a:true,dsh:true},
      {d:P([18,58],[18,20]), c:CLR.flat,w:2,a:true},
      {d:P([182,58],[182,14]), c:CLR.deep,w:2.2,a:true},
      {d:P([58,62],[58,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([142,62],[120,56],[102,18],[100,12]), c:CLR.mid,w:2.2,a:true},
    ],
  },
  {
    id:20, name:'Bear_Fire', label:'Bear Fire', cat:'pressure',
    dl: FRONT_FIVE.map(x => ({x,y:LOS,t:'DL'})), sk:[
      {x:18,y:58,t:'CB'},{x:58,y:62,t:'S'},{x:142,y:62,t:'S'},{x:182,y:58,t:'CB'},
      {x:74,y:84,t:'LB'},{x:106,y:84,t:'LB'}
    ],
    rt:[
      {d:P([52,LOS],[52,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([72,LOS],[72,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([90,LOS],[90,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([108,LOS],[108,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([128,LOS],[128,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
    ],
  },
  {
    id:21, name:'Interior_Twist', label:'Interior Twist', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:CB([82,LOS],[90,LOS+8],[98,LOS+2],[104,LOS-12]), c:CLR.stunt,w:2,a:true},
      {d:CB([98,LOS],[90,LOS+8],[82,LOS+2],[76,LOS-12]), c:CLR.stunt,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[124,58],[108,54]), c:CLR.robber,w:2.0,a:true},
    ],
  },
  {
    id:22, name:'OLB_Loop', label:'OLB Loop', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:CB([70,84],[76,72],[82,60],[92,42]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[124,58],[108,54]), c:CLR.robber,w:2.0,a:true},
      {d:P([110,84],[114,50]), c:CLR.man,w:2.1,a:true},
    ],
  },
  {
    id:23, name:'Mike_Plug', label:'Mike Plug', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([90,80],[90,46]), c:CLR.blitz,w:2.3,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([70,84],[64,50]), c:CLR.man,w:2.1,a:true},
      {d:P([110,84],[116,50]), c:CLR.man,w:2.1,a:true},
    ],
  },
  {
    id:24, name:'Boundary_Cat', label:'Boundary Cat', cat:'pressure',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[24,34]), c:CLR.blitz,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([46,70],[60,60],[76,54]), c:CLR.robber,w:2.0,a:true},
      {d:P([110,84],[116,50]), c:CLR.man,w:2.1,a:true},
    ],
  },
  {
    id:25, name:'GoalLine_Fire', label:'Goal Line Fire', cat:'pressure',
    dl: FRONT_FIVE.map(x => ({x,y:LOS,t:'DL'})), sk:[...GOAL46],
    rt:[
      {d:P([52,LOS],[52,LOS-10]), c:CLR.blitz,w:2,a:true},
      {d:P([72,LOS],[72,LOS-10]), c:CLR.blitz,w:2,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.blitz,w:2,a:true},
      {d:P([108,LOS],[108,LOS-10]), c:CLR.blitz,w:2,a:true},
      {d:P([128,LOS],[128,LOS-10]), c:CLR.blitz,w:2,a:true},
      {d:P([72,84],[66,50]), c:CLR.blitz,w:2.2,a:true},
      {d:P([108,84],[114,50]), c:CLR.blitz,w:2.2,a:true},
      {d:P([24,62],[24,26]), c:CLR.man,w:2.1,a:true},
      {d:P([176,62],[176,26]), c:CLR.man,w:2.1,a:true},
    ],
  },

  /* ═══ SITUATIONAL 26-40 ══════════════════════ */
  {
    id:26, name:'Dime_2Man', label:'Dime 2-Man', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DIME46],
    rt:[
      {d:P([16,58],[16,18]), c:CLR.man,w:2.1,a:true},
      {d:P([184,58],[184,18]), c:CLR.man,w:2.1,a:true},
      {d:P([34,72],[28,42]), c:CLR.man,w:2.1,a:true},
      {d:P([166,72],[172,42]), c:CLR.man,w:2.1,a:true},
      {d:P([74,84],[70,50]), c:CLR.man,w:2.1,a:true},
      {d:P([106,84],[110,50]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
    ],
  },
  {
    id:27, name:'Red_46', label:'Red 46', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:62,t:'CB'},{x:46,y:72,t:'S'},{x:58,y:68,t:'S'},
      {x:122,y:80,t:'LB'},{x:142,y:68,t:'S'},{x:154,y:72,t:'S'},
      {x:182,y:62,t:'CB'},{x:70,y:88,t:'LB'},{x:90,y:84,t:'LB'},{x:110,y:88,t:'LB'}
    ],
    rt:[
      {d:P([18,62],[18,22]), c:CLR.man,w:2.1,a:true},
      {d:P([182,62],[182,22]), c:CLR.man,w:2.1,a:true},
      {d:P([46,72],[38,38]), c:CLR.underneath,w:1.8,a:true},
      {d:P([154,72],[162,38]), c:CLR.underneath,w:1.8,a:true},
      {d:P([58,68],[58,24]), c:CLR.deep,w:2.2,a:true},
      {d:P([142,68],[142,24]), c:CLR.deep,w:2.2,a:true},
      {d:P([90,84],[92,56]), c:CLR.robber,w:1.8,a:true},
    ],
  },
  {
    id:28, name:'Drop8', label:'Drop-8', cat:'situational',
    dl:[{x:76,y:LOS,t:'DL'},{x:98,y:LOS,t:'DL'},{x:118,y:LOS,t:'DL'}], sk:[...DIME46],
    rt:[
      {d:QQ([16,58],[12,42],[10,28]), c:CLR.flat,w:2,a:true},
      {d:P([184,58],[184,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([58,62],[58,14]), c:CLR.deep,w:2.2,a:true},
      {d:CB([142,62],[120,56],[102,18],[100,12]), c:CLR.mid,w:2.2,a:true},
      {d:P([34,72],[28,46]), c:CLR.underneath,w:1.7,a:true},
      {d:P([166,72],[172,46]), c:CLR.underneath,w:1.7,a:true},
      {d:P([74,84],[74,56]), c:CLR.underneath,w:1.8,a:true},
      {d:P([106,84],[106,56]), c:CLR.underneath,w:1.8,a:true},
      {d:P([76,LOS],[76,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[118,LOS-12]), c:CLR.blitz,w:2,a:true},
    ],
  },
  {
    id:29, name:'Bracket', label:'Bracket', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...NICKEL46],
    rt:[
      {d:P([18,58],[18,18]), c:CLR.bracket,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.bracket,w:2.1,a:true},
      {d:P([38,72],[32,40]), c:CLR.bracket,w:2.1,a:true},
      {d:P([162,72],[168,40]), c:CLR.bracket,w:2.1,a:true},
      {d:P([70,84],[66,48]), c:CLR.man,w:2.1,a:true},
      {d:P([110,84],[114,48]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
    ],
  },
  {
    id:30, name:'ThirdLong_Zero', label:'3rd Long Zero', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DIME46],
    rt:[
      {d:P([16,58],[16,18]), c:CLR.man,w:2.2,a:true},
      {d:P([184,58],[184,18]), c:CLR.man,w:2.2,a:true},
      {d:P([34,72],[28,40]), c:CLR.man,w:2.2,a:true},
      {d:P([166,72],[172,40]), c:CLR.man,w:2.2,a:true},
      {d:P([74,84],[68,46]), c:CLR.blitz,w:2.2,a:true},
      {d:P([106,84],[112,46]), c:CLR.blitz,w:2.2,a:true},
      {d:P([62,LOS],[60,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([118,LOS],[120,LOS-14]), c:CLR.blitz,w:2,a:true},
    ],
  },
  {
    id:31, name:'GoalLine_46_Heavy', label:'Goal Line 46 Heavy', cat:'situational',
    dl: FRONT_FIVE.map(x => ({x,y:LOS,t:'DL'})), sk:[...GOAL46],
    rt:[
      {d:P([52,LOS],[52,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([72,LOS],[72,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([108,LOS],[108,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([128,LOS],[128,LOS-10]), c:CLR.fit,w:1.6,a:true},
      {d:P([24,62],[24,26]), c:CLR.man,w:2.1,a:true},
      {d:P([176,62],[176,26]), c:CLR.man,w:2.1,a:true},
      {d:P([48,72],[40,40]), c:CLR.underneath,w:1.8,a:true},
      {d:P([132,72],[140,40]), c:CLR.underneath,w:1.8,a:true},
      {d:P([90,64],[90,28]), c:CLR.robber,w:1.9,a:true},
    ],
  },
  {
    id:32, name:'46_Cloud_Trap', label:'46 Cloud Trap', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:QQ([18,58],[24,68],[38,70]), c:CLR.robber,w:2.0,a:true},
      {d:P([182,58],[182,16]), c:CLR.deep,w:2.2,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.2,a:true},
      {d:CB([142,62],[120,56],[102,18],[100,12]), c:CLR.mid,w:2.2,a:true},
      {d:P([46,70],[38,36]), c:CLR.underneath,w:1.8,a:true},
      {d:P([70,84],[66,56]), c:CLR.underneath,w:1.8,a:true},
      {d:P([110,84],[114,56]), c:CLR.underneath,w:1.8,a:true},
    ],
  },
  {
    id:33, name:'46_Robber_Rat', label:'46 Robber Rat', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([46,70],[36,42]), c:CLR.man,w:2.1,a:true},
      {d:P([154,70],[164,42]), c:CLR.man,w:2.1,a:true},
      {d:P([70,84],[64,48]), c:CLR.man,w:2.1,a:true},
      {d:P([110,84],[116,48]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([90,80],[92,68],[96,56]), c:CLR.robber,w:2.0,a:true},
      {d:QQ([142,62],[126,62],[112,58]), c:CLR.robber,w:2.0,a:true},
    ],
  },
  {
    id:34, name:'46_Boundary_Double', label:'46 Boundary Double', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DEF46],
    rt:[
      {d:P([18,58],[18,18]), c:CLR.bracket,w:2.1,a:true},
      {d:QQ([46,70],[34,56],[24,38]), c:CLR.bracket,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([70,84],[64,48]), c:CLR.man,w:2.1,a:true},
      {d:P([110,84],[116,48]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([90,80],[92,50]), c:CLR.robber,w:1.8,a:true},
    ],
  },
  {
    id:35, name:'46_Nickel_Pressure', label:'46 Nickel Pressure', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...NICKEL46],
    rt:[
      {d:P([38,72],[28,36]), c:CLR.blitz,w:2.2,a:true},
      {d:P([162,72],[172,36]), c:CLR.blitz,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([70,84],[66,48]), c:CLR.man,w:2.1,a:true},
    ],
  },
  {
    id:36, name:'46_Press_Bail', label:'46 Press Bail', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:64,t:'CB'},{x:46,y:70,t:'S'},{x:58,y:62,t:'S'},
      {x:122,y:78,t:'LB'},{x:142,y:62,t:'S'},{x:154,y:70,t:'S'},
      {x:182,y:64,t:'CB'},{x:70,y:84,t:'LB'},{x:90,y:80,t:'LB'},{x:110,y:84,t:'LB'}
    ],
    rt:[
      {d:CB([18,64],[16,42],[18,28],[22,16]), c:CLR.deep,w:2.2,a:true},
      {d:CB([182,64],[184,42],[182,28],[178,16]), c:CLR.deep,w:2.2,a:true},
      {d:CB([142,62],[120,56],[102,18],[100,12]), c:CLR.mid,w:2.2,a:true},
      {d:P([58,62],[50,30]), c:CLR.flat,w:2,a:true},
      {d:P([46,70],[38,36]), c:CLR.underneath,w:1.8,a:true},
      {d:P([70,84],[66,56]), c:CLR.underneath,w:1.8,a:true},
      {d:P([110,84],[114,56]), c:CLR.underneath,w:1.8,a:true},
    ],
  },
  {
    id:37, name:'46_Edge_Contain', label:'46 Edge Contain', cat:'situational',
    dl:[{x:48,y:LOS,t:'DL'},{x:82,y:LOS,t:'DL'},{x:98,y:LOS,t:'DL'},{x:132,y:LOS,t:'DL'}], sk:[...DEF46],
    rt:[
      {d:P([48,LOS],[40,LOS-14]), c:CLR.contain,w:1.8,a:true},
      {d:P([82,LOS],[82,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-12]), c:CLR.blitz,w:2,a:true},
      {d:P([132,LOS],[140,LOS-14]), c:CLR.contain,w:1.8,a:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:QQ([142,62],[124,58],[108,54]), c:CLR.robber,w:2.0,a:true},
    ],
  },
  {
    id:38, name:'46_Red_Zero', label:'46 Red Zero', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})),
    sk:[
      {x:18,y:62,t:'CB'},{x:46,y:72,t:'S'},{x:58,y:68,t:'S'},
      {x:122,y:80,t:'LB'},{x:142,y:68,t:'S'},{x:154,y:72,t:'S'},
      {x:182,y:62,t:'CB'},{x:70,y:88,t:'LB'},{x:90,y:84,t:'LB'},{x:110,y:88,t:'LB'}
    ],
    rt:[
      {d:P([18,62],[18,22]), c:CLR.man,w:2.2,a:true},
      {d:P([182,62],[182,22]), c:CLR.man,w:2.2,a:true},
      {d:P([46,72],[38,40]), c:CLR.man,w:2.2,a:true},
      {d:P([154,72],[162,40]), c:CLR.man,w:2.2,a:true},
      {d:P([70,88],[64,48]), c:CLR.blitz,w:2.2,a:true},
      {d:P([90,84],[90,48]), c:CLR.blitz,w:2.2,a:true},
      {d:P([110,88],[116,48]), c:CLR.blitz,w:2.2,a:true},
      {d:P([58,68],[58,28]), c:CLR.man,w:2.0,a:true},
      {d:P([142,68],[142,28]), c:CLR.man,w:2.0,a:true},
    ],
  },
  {
    id:39, name:'46_Sim_Pressure', label:'46 Sim Pressure', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...NICKEL46],
    rt:[
      {d:P([70,84],[84,52]), c:CLR.sim,w:2.2,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.sim,w:2,a:true},
      {d:QQ([118,LOS],[122,78],[126,66]), c:CLR.underneath,w:1.7,a:true,dsh:true},
      {d:P([18,58],[18,18]), c:CLR.man,w:2.1,a:true},
      {d:P([182,58],[182,18]), c:CLR.man,w:2.1,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([38,72],[32,42]), c:CLR.man,w:2.0,a:true},
      {d:P([162,72],[168,42]), c:CLR.man,w:2.0,a:true},
    ],
  },
  {
    id:40, name:'46_Double_Threat', label:'46 Double Threat', cat:'situational',
    dl: FRONT_FOUR.map(x => ({x,y:LOS,t:'DL'})), sk:[...DIME46],
    rt:[
      {d:P([16,58],[16,18]), c:CLR.bracket,w:2.1,a:true},
      {d:P([184,58],[184,18]), c:CLR.bracket,w:2.1,a:true},
      {d:P([34,72],[28,40]), c:CLR.bracket,w:2.1,a:true},
      {d:P([166,72],[172,40]), c:CLR.bracket,w:2.1,a:true},
      {d:P([74,84],[74,50]), c:CLR.robber,w:2.0,a:true},
      {d:P([106,84],[106,50]), c:CLR.robber,w:2.0,a:true},
      {d:P([58,62],[58,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([142,62],[142,12]), c:CLR.deep,w:2.3,a:true},
      {d:P([82,LOS],[82,LOS-14]), c:CLR.blitz,w:2,a:true},
      {d:P([98,LOS],[98,LOS-14]), c:CLR.blitz,w:2,a:true},
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
    {c:CLR.man,l:'Man / Match'},
    {c:CLR.deep,l:'Deep Help'},
    {c:CLR.mid,l:'Middle Help'},
    {c:CLR.robber,l:'Robber / Buzz'},
    {c:CLR.flat,l:'Flat'},
  ],
  pressure: [
    {c:CLR.blitz,l:'Pressure'},
    {c:CLR.stunt,l:'Twist / Loop'},
    {c:CLR.man,l:'Man'},
    {c:CLR.deep,l:'Safety Help'},
    {c:CLR.robber,l:'Robber'},
  ],
  situational: [
    {c:CLR.man,l:'Man / Match'},
    {c:CLR.bracket,l:'Bracket'},
    {c:CLR.deep,l:'Deep Help'},
    {c:CLR.sim,l:'Sim'},
    {c:CLR.underneath,l:'Drop-8 / Zone'},
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
  { id:'all',         label:'All 40',        accent:'#94a3b8' },
  { id:'base',        label:'Base (10)',     accent:'#60a5fa' },
  { id:'pressure',    label:'Pressure (15)', accent:'#ef4444' },
  { id:'situational', label:'Situational (15)', accent:'#34d399' },
];

/* ── APP ─────────────────────────────────────── */
export default function Bears46DefensePlaybook() {
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
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))' }}>
            🛡️
          </div>
          <div>
            <div style={{ color:'#e7f4ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              BEARS 46 DEFENSE
            </div>
            <div style={{ color:'#ef4444', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.85 }}>
              BEAR FRONT · PRESSURE · AGGRESSION
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
        BEARS 46 · 40 CALLS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
