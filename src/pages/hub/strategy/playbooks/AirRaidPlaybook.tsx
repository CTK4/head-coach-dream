import { useState, useEffect } from "react";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  run:     '#ef4444',
  pass:    '#a78bfa',
  rpo:     '#fb923c',
  sit:     '#fbbf24',
  block:   '#64748b',
  motion:  '#f472b6',
  protect: '#475569',
  qbmove:  '#fb923c',
  pull:    '#f87171',
  toss:    '#fbbf24',
  read:    '#34d399',
};

const CAT_META = {
  run:         { label: 'Runs',        short: 'RUN',  accent: '#ef4444', bg: '#ef444412' },
  pass:        { label: 'Pass',        short: 'PASS', accent: '#a78bfa', bg: '#a78bfa12' },
  rpo:         { label: 'RPO/Const.',  short: 'RPO',  accent: '#fb923c', bg: '#fb923c12' },
  situational: { label: 'Situational', short: 'SIT',  accent: '#fbbf24', bg: '#fbbf2412' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

const LOS  = 72;
/* Air Raid: wide splits, shotgun QB */
const OL_X = [70, 80, 90, 100, 110]; // tight OL in spread
/* Typical formation helpers */
// 2x2: WR@8,28 | WR@162,180
// 3x1: WR@8,28,44 | WR@172
// 4-wide: WR@4,18,162,178
const QB_Y = 88;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#ef4444','#a78bfa','#fb923c','#fbbf24',
  '#f472b6','#34d399','#64748b','#475569','#f87171','#10b981',
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [

  /* ═══ RUNS 1-12 ═══════════════════════════════════════ */
  {
    id:1, name:'InsideZone_Spread', label:'Inside Zone Spread', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:100,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([100,QB_Y],[96,80],[90,70],[88,52]), c:CLR.run, w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([6,LOS],[6,LOS-8]),    c:CLR.block,w:1,a:true},
      {d:P([162,LOS],[162,LOS-8]),c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:2, name:'Draw_Gun', label:'Draw (Shotgun)', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:100,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]),             c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,QB_Y],[94,QB_Y-2],[88,62],[86,48]),c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[66,LOS-6]),  c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[77,LOS-7]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[103,LOS-7]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[113,LOS-6]),c:CLR.block,w:1.2,a:true},
      {d:P([6,LOS],[6,LOS-8]),    c:CLR.block,w:1,a:true},
      {d:P([180,LOS],[180,LOS-8]),c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:3, name:'Trap_Spread', label:'Trap Spread', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:100,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([100,QB_Y],[92,82],[84,68],[84,50]),c:CLR.run,  w:2.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[84,LOS+2],[86,LOS-8]),c:CLR.pull,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([6,LOS],[6,LOS-8]),    c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:4, name:'Counter_Read', label:'Counter Read', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,QB_Y],[100,80],[96,66],[94,50]),c:CLR.run,  w:2.8,a:true},
      {d:CB([80,LOS],[86,LOS+8],[96,LOS+2],[100,LOS-8]),c:CLR.pull,w:1.8,a:true},
      {d:CB([70,LOS],[76,LOS+6],[94,LOS+2],[100,LOS-6]),c:CLR.pull,w:1.5,a:true},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([88,QB_Y],[80,QB_Y-6]),c:CLR.read,  w:1.2,a:true,dsh:true},
    ],
  },
  {
    id:5, name:'QB_Draw', label:'QB Draw', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+6]),              c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([88,QB_Y+6],[88,74],[88,62],[86,46]),c:CLR.run,  w:2.8,a:true},
      {d:CB([6,LOS],[6,46],[30,30],[46,28]),     c:CLR.pass,w:1,a:true,dsh:true},
      {d:CB([26,LOS],[26,56],[52,46],[70,44]),   c:CLR.pass,w:1,a:true,dsh:true},
      {d:CB([180,LOS],[180,46],[154,30],[140,28]),c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]),c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:6, name:'Zone_Read', label:'Zone Read', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,QB_Y],[100,82],[92,68],[82,50]),c:CLR.run,  w:2.8,a:true},
      {d:CB([88,QB_Y],[88,82],[78,66],[68,52]),  c:CLR.read, w:2,a:true,dsh:true},
      {d:P([70,LOS],[66,LOS-6]),  c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]),c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:7, name:'Sweep_Spread', label:'Sweep Spread', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:QQ([88,QB_Y],[130,QB_Y-4],[162,QB_Y-10]),c:CLR.toss,w:1.5,a:true,dsh:true},
      {d:CB([162,QB_Y-10],[178,54],[188,40],[192,30]),c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[80,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[102,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[112,LOS-5]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[122,LOS-5]),c:CLR.block,w:1.2,a:true},
      {d:P([6,LOS],[6,LOS-9]),    c:CLR.block,w:1,a:true},
      {d:P([26,LOS],[26,LOS-9]),  c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:8, name:'Duo_Spread', label:'Duo Spread', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:88,y:QB_Y+12,t:'RB'},
    ],
    rt:[
      {d:CB([88,QB_Y+12],[88,QB_Y],[88,74],[88,52]),c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([100,LOS],[100,LOS-10]),c:CLR.block,w:1.8,a:true},
      {d:P([110,LOS],[110,LOS-10]),c:CLR.block,w:1.8,a:true},
    ],
  },
  {
    id:9, name:'PinPull_Spread', label:'Pin & Pull Spread', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,QB_Y],[108,84],[124,66],[148,52]),c:CLR.run,w:2.8,a:true},
      {d:CB([100,LOS],[106,LOS+8],[126,LOS+2],[132,LOS-8]),c:CLR.pull,w:1.8,a:true},
      {d:CB([110,LOS],[118,LOS+6],[132,LOS+2],[138,LOS-8]),c:CLR.pull,w:1.5,a:true},
      {d:P([70,LOS],[66,LOS-6]),  c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([162,LOS],[158,LOS-7]),c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:10, name:'Power_Read', label:'Power Read', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,QB_Y],[104,82],[106,68],[106,52]),c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[80,84],[70,68],[68,52]),   c:CLR.read,w:2,a:true,dsh:true},
      {d:CB([70,LOS],[76,LOS+8],[96,LOS+2],[104,LOS-8]),c:CLR.pull,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]),c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:11, name:'Delay_Draw', label:'Delay Draw', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y],[100,QB_Y-4],[90,64],[90,48]),c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:CB([6,LOS],[6,46],[30,32],[50,28]),  c:CLR.pass,w:1,a:true,dsh:true},
      {d:CB([26,LOS],[30,48],[54,40],[68,40]),c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:12, name:'Jet_Sweep_Spread', label:'Jet Sweep Spread', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([6,LOS],[30,LOS+14],[70,LOS+16],[116,LOS+2]),c:CLR.motion,w:1.5,a:false,dsh:true},
      {d:P([88,QB_Y],[104,QB_Y-6]),               c:CLR.toss,w:1.2,a:true,dsh:true},
      {d:CB([116,LOS+2],[140,60],[162,46],[180,36]),c:CLR.run, w:2.8,a:true},
      {d:P([70,LOS],[80,LOS-6]),  c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[90,LOS-6]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[100,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[110,LOS-6]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[120,LOS-6]),c:CLR.block,w:1.2,a:true},
    ],
  },

  /* ═══ PASS CONCEPTS 13-28 ═════════════════════════════ */
  {
    id:13, name:'FourVerts', label:'Four Verticals', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:100,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([6,LOS],[6,12]),   c:CLR.pass,w:2.2,a:true},
      {d:P([26,LOS],[26,12]), c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,12]),c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,12]),c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,QB_Y],[108,80],[118,74],[126,70]),c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:14, name:'Y_Cross', label:'Y Cross', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:100,y:LOS,t:'TE'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},
    ],
    rt:[
      {d:CB([100,LOS],[100,48],[80,42],[48,42]),    c:CLR.pass,w:2.5,a:true},
      {d:CB([26,LOS],[26,40],[52,36],[80,36]),      c:CLR.pass,w:2.2,a:true},
      {d:P([6,LOS],[6,24]),    c:CLR.pass,w:1.8,a:true},
      {d:CB([162,LOS],[162,46],[136,44],[116,44]),  c:CLR.pass,w:2,a:true},
      {d:P([180,LOS],[180,24]),c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:15, name:'Mesh', label:'Mesh', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:100,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([26,LOS],[48,60],[82,58],[112,60]),    c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[138,58],[104,56],[72,58]),  c:CLR.pass,w:2.2,a:true},
      {d:P([6,LOS],[6,24]),    c:CLR.pass,w:1.8,a:true},
      {d:CB([180,LOS],[190,42],[178,22],[164,20]), c:CLR.pass,w:1.8,a:true},
      {d:QQ([100,QB_Y],[114,80],[126,76]),         c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:16, name:'Stick', label:'Stick', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:100,y:LOS,t:'TE'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},
    ],
    rt:[
      {d:P([162,LOS],[162,54],[162,58]),           c:CLR.pass,w:2.2,a:true},
      {d:QQ([100,LOS],[114,60],[130,58]),          c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,28]),  c:CLR.pass,w:1.8,a:true},
      {d:P([26,LOS],[26,54],[26,58]),              c:CLR.pass,w:2.2,a:true},
      {d:P([6,LOS],[6,28]),      c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:17, name:'Shallow_Cross', label:'Shallow Cross', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([6,LOS],[34,60],[84,58],[130,58]),    c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[158,46],[108,44],[72,46]), c:CLR.pass,w:2.2,a:true},
      {d:P([26,LOS],[26,26]),    c:CLR.pass,w:1.8,a:true},
      {d:P([162,LOS],[162,26]),  c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:18, name:'AllHitches', label:'All Hitches', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([6,LOS],[6,54],[6,58]),   c:CLR.pass,w:2.2,a:true},
      {d:P([26,LOS],[26,54],[26,58]),c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,54],[162,58]),c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,54],[180,58]),c:CLR.pass,w:2.2,a:true},
      {d:QQ([102,QB_Y],[118,82],[132,80]),         c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:19, name:'Smash', label:'Smash', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([6,LOS],[2,40],[18,22],[30,20]),      c:CLR.pass,w:2.2,a:true},
      {d:P([26,LOS],[26,54],[26,58]),             c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[188,40],[172,22],[160,20]),c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,54],[162,58]),          c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:20, name:'Drive', label:'Drive', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([26,LOS],[46,50],[80,48],[110,50]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[144,46],[110,44],[78,46]), c:CLR.pass,w:2.2,a:true},
      {d:P([6,LOS],[6,24]),    c:CLR.pass,w:1.8,a:true},
      {d:P([180,LOS],[180,24]),c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:21, name:'Dagger', label:'Dagger', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([6,LOS],[6,32],[88,32]),               c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[26,46],[48,32],[66,26]),    c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[180,32],[148,22],[122,20]),c:CLR.pass,w:2,a:true},
      {d:P([162,LOS],[162,52],[140,52]),          c:CLR.pass,w:2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:22, name:'SwitchVerts', label:'Switch Verticals', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([6,LOS],[6,44],[22,36],[30,24]),      c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[26,54],[10,44],[6,24]),     c:CLR.pass,w:1.8,a:true},
      {d:CB([180,LOS],[180,44],[164,36],[156,24]),c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[162,54],[178,44],[180,24]),c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:23, name:'Levels', label:'Levels', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([6,LOS],[6,36],[90,36]),              c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[48,58],[76,58],[106,58]),  c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,24]),  c:CLR.pass,w:1.8,a:true},
      {d:P([162,LOS],[162,42]),  c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:24, name:'Y_Sail', label:'Y Sail', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:100,y:LOS,t:'TE'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},
    ],
    rt:[
      {d:CB([180,LOS],[192,40],[178,20],[162,18]),c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,50],[196,50]),          c:CLR.pass,w:2.2,a:true},
      {d:QQ([100,LOS],[118,66],[136,64]),         c:CLR.pass,w:2,a:true},
      {d:P([6,LOS],[6,24]),    c:CLR.pass,w:1.8,a:true},
      {d:P([26,LOS],[26,50],[26,54]),             c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:25, name:'Post_Wheel', label:'Post + Wheel', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([26,LOS],[26,32],[44,20],[62,18]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([6,LOS],[6,LOS+4],[6,LOS+10],[10,LOS+16],[32,LOS+14],[40,LOS+4],[40,36]),c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[162,32],[144,20],[128,18]),c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,26]),  c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:26, name:'Corner_Post', label:'Corner + Post', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([6,LOS],[6,38],[28,26],[48,22]),      c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[26,38],[44,26],[64,20]),    c:CLR.pass,w:2,a:true},
      {d:CB([180,LOS],[180,38],[162,26],[142,22]),c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[162,38],[144,26],[124,20]),c:CLR.pass,w:2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:27, name:'DoubleSlants', label:'Double Slants', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([6,LOS],[20,52],[38,48],[54,48]),    c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[38,52],[56,48],[68,48]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[166,52],[148,48],[132,48]),c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[150,52],[132,48],[120,48]),c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:28, name:'Fade_Stop', label:'Fade + Stop', cat:'pass',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([6,LOS],[0,36],[4,20],[10,14]),       c:CLR.pass,w:2.2,a:true},
      {d:P([26,LOS],[26,54],[26,58]),             c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[188,36],[184,20],[178,14]),c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,54],[162,58]),          c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },

  /* ═══ RPO / CONSTRAINT 29-34 ══════════════════════════ */
  {
    id:29, name:'RPO_Slant', label:'RPO Slant', cat:'rpo',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,QB_Y],[100,80],[96,66],[94,50]),c:CLR.run,  w:2,a:true,dsh:true},
      {d:CB([162,LOS],[148,56],[132,52],[118,52]),c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,26]),  c:CLR.pass,w:1.5,a:true},
      {d:P([6,LOS],[6,26]),      c:CLR.pass,w:1.5,a:true},
      {d:P([26,LOS],[26,50]),    c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[100,QB_Y-8]),c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:30, name:'RPO_Bubble', label:'RPO Bubble Screen', cat:'rpo',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,QB_Y],[100,80],[96,68],[94,52]),c:CLR.run,  w:2,a:true,dsh:true},
      {d:QQ([162,LOS],[148,72],[136,78]),         c:CLR.sit,  w:2.2,a:true},
      {d:QQ([180,LOS],[166,72],[154,78]),         c:CLR.sit,  w:1.5,a:true},
      {d:P([6,LOS],[6,26]),      c:CLR.pass,w:1.5,a:true},
      {d:P([26,LOS],[26,50]),    c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[102,QB_Y-8]),c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:31, name:'RPO_Glance', label:'RPO Glance', cat:'rpo',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,QB_Y],[100,80],[96,68],[92,52]),c:CLR.run,  w:2,a:true,dsh:true},
      {d:CB([162,LOS],[158,52],[144,48],[128,48]),c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,24]),  c:CLR.pass,w:1.5,a:true},
      {d:P([26,LOS],[26,50]),    c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[104,QB_Y-8]),c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:32, name:'RPO_Stick', label:'RPO Stick', cat:'rpo',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:100,y:LOS,t:'TE'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},
    ],
    rt:[
      {d:CB([88,QB_Y],[86,80],[84,68],[82,52]),  c:CLR.run,  w:2,a:true,dsh:true},
      {d:P([162,LOS],[162,52],[162,56]),         c:CLR.pass,w:2.2,a:true},
      {d:QQ([100,LOS],[116,60],[132,58]),        c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,26]),  c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[104,QB_Y-8]),c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:33, name:'Screen_Alert', label:'Screen Alert', cat:'rpo',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,QB_Y],[106,76],[120,74],[132,76]),c:CLR.sit,  w:2.2,a:true},
      {d:CB([88,QB_Y],[100,80],[110,76],[132,76]),  c:CLR.sit,  w:1.5,a:true,dsh:true},
      {d:CB([162,LOS],[148,72],[138,74],[134,76]),  c:CLR.block,w:1.2,a:true},
      {d:CB([180,LOS],[160,70],[148,72],[140,74]),  c:CLR.block,w:1.2,a:true},
      {d:P([6,LOS],[6,24]),      c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([26,LOS],[26,44]),    c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:34, name:'QuickNow_Screen', label:'Quick Now Screen', cat:'rpo',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:QQ([26,LOS],[24,72],[22,78]),           c:CLR.sit,  w:2.2,a:true},
      {d:CB([88,QB_Y],[64,84],[40,80],[22,78]),  c:CLR.sit,  w:1.8,a:true,dsh:true},
      {d:QQ([6,LOS],[10,70],[14,76]),            c:CLR.block,w:1.5,a:true},
      {d:P([180,LOS],[180,26]),  c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([162,LOS],[162,42]),  c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+6]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },

  /* ═══ SITUATIONAL / SCREENS 35-40 ════════════════════ */
  {
    id:35, name:'RB_Swing', label:'RB Swing', cat:'situational',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:104,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([104,QB_Y],[136,QB_Y],[164,76],[174,70]),c:CLR.sit,w:2.2,a:true},
      {d:CB([88,QB_Y+8],[128,QB_Y+6],[162,76],[174,70]),c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:CB([180,LOS],[192,40],[182,20],[168,18]),c:CLR.pass,w:1.8,a:true},
      {d:P([162,LOS],[162,30]),  c:CLR.pass,w:1.5,a:true},
      {d:P([6,LOS],[6,26]),      c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:36, name:'WR_Tunnel', label:'WR Tunnel Screen', cat:'situational',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+6]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([26,LOS],[30,70],[34,78],[36,82]),     c:CLR.sit,  w:2.2,a:true},
      {d:CB([88,QB_Y+6],[62,86],[46,84],[36,82]),  c:CLR.sit,  w:1.8,a:true,dsh:true},
      {d:CB([6,LOS],[12,68],[24,74],[30,78]),      c:CLR.block,w:1.5,a:true},
      {d:CB([100,LOS],[84,64],[62,60],[44,62]),    c:CLR.block,w:1.5,a:true},
      {d:P([180,LOS],[180,26]),  c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([162,LOS],[162,26]),  c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:37, name:'Middle_Screen', label:'Middle Screen', cat:'situational',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y],[102,QB_Y+4],[98,QB_Y+6],[90,QB_Y+10]),c:CLR.sit,w:2,a:true},
      {d:CB([88,QB_Y+10],[88,QB_Y+10],[88,QB_Y+10],[88,QB_Y+12]),c:CLR.sit,w:1.5,a:false,dsh:true},
      {d:CB([88,QB_Y+12],[84,76],[84,62],[84,50]),  c:CLR.sit,w:2.2,a:true},
      {d:CB([70,LOS],[74,66],[76,58],[82,56]),       c:CLR.block,w:1.5,a:true},
      {d:CB([80,LOS],[82,66],[84,60],[86,56]),       c:CLR.block,w:1.2,a:true},
      {d:P([6,LOS],[6,24]),      c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([180,LOS],[180,24]),  c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:38, name:'Jailbreak', label:'Jailbreak Screen', cat:'situational',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y],[120,QB_Y],[148,80],[168,74]),c:CLR.sit, w:2.2,a:true},
      {d:CB([88,QB_Y+10],[120,QB_Y+6],[152,80],[168,74]),c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:CB([162,LOS],[158,70],[160,74],[164,76]),  c:CLR.block,w:1.5,a:true},
      {d:CB([180,LOS],[174,68],[172,72],[168,74]),  c:CLR.block,w:1.5,a:true},
      {d:P([6,LOS],[6,24]),      c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([26,LOS],[26,42]),    c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:39, name:'Shot_SevenManProtect', label:'7-Man Shot', cat:'situational',
    sk:[
      {x:6,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:100,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:P([100,QB_Y],[100,QB_Y-2]),               c:CLR.protect,w:2,a:false},
      {d:CB([180,LOS],[192,36],[176,14],[158,12]),  c:CLR.pass,w:2.5,a:true},
      {d:CB([162,LOS],[162,32],[136,18],[112,16]),  c:CLR.pass,w:2.5,a:true},
      {d:CB([6,LOS],[4,32],[26,16],[50,14]),        c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),  c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),  c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:40, name:'Tempo_QB_Draw', label:'Tempo QB Draw', cat:'situational',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:102,y:QB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([6,LOS],[6,46],[28,34],[50,30]),       c:CLR.pass,w:1.5,a:true,dsh:true},
      {d:CB([26,LOS],[28,52],[50,46],[70,44]),     c:CLR.pass,w:1.5,a:true,dsh:true},
      {d:CB([180,LOS],[180,46],[158,34],[136,30]), c:CLR.pass,w:1.5,a:true,dsh:true},
      {d:CB([162,LOS],[160,52],[140,46],[120,44]),  c:CLR.pass,w:1.5,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([88,QB_Y+8],[88,QB_Y+4],[88,66],[88,48]),c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),  c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),  c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),  c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),c:CLR.protect,w:1.2,a:false},
    ],
  },
];

/* ── SVG DEFS ────────────────────────────────── */
function SVGDefs() {
  return (
    <defs>
      {ARROW_COLORS.map(color => (
        <marker key={color}
          id={`ar-${color.replace('#','')}`}
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
  WR:'#a78bfa', TE:'#34d399', QB:'#fbbf24', RB:'#f87171',
  FB:'#fb923c', H:'#f472b6', OL:'#8b9ab5',
};
function Player({ x, y, t, large = false }) {
  const c = PLAYER_COLORS[t] || '#fff';
  const r = large ? 6.5 : 5;
  if (t === 'OL') {
    const s = large ? 10 : 8;
    return (
      <g>
        <rect x={x-s/2} y={y-s*0.45} width={s} height={s*0.9}
              fill={c} rx={1.5} opacity={0.9} />
        <rect x={x-s/2} y={y-s*0.45} width={s} height={s*0.9}
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
        <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
              fontSize={5.5} fill="#000" fontWeight="800" fontFamily="monospace">
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
    <path d={d} fill="none" stroke={c} strokeWidth={w}
          strokeDasharray={dsh ? '5,3' : undefined}
          markerEnd={markerEnd}
          strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
  );
}

/* ── FIELD SVG ───────────────────────────────── */
function PlayField({ play, large = false }) {
  const olX = [70, 80, 90, 100, 110];
  return (
    <svg viewBox="0 0 200 130" width="100%" style={{ display: 'block' }}>
      <SVGDefs />
      <rect width={200} height={130} fill="#0a0612" />

      {/* Field lines */}
      {[20,40,60].map(y => (
        <line key={y} x1={0} y1={LOS-y} x2={200} y2={LOS-y}
              stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} strokeDasharray="3,5" />
      ))}
      {[75,125].map(hx => (
        [30,40,50,60].map(hy => (
          <line key={`${hx}-${hy}`}
                x1={hx} y1={LOS-hy} x2={hx+5} y2={LOS-hy}
                stroke="rgba(255,255,255,0.1)" strokeWidth={0.4} />
        ))
      ))}

      {/* LOS */}
      <line x1={0} y1={LOS} x2={200} y2={LOS}
            stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} />

      {/* Routes under players */}
      {play.rt.map((r, i) => <Route key={i} {...r} />)}

      {/* OL */}
      {olX.map((x, i) => <Player key={i} x={x} y={LOS} t="OL" large={large} />)}

      {/* Skill */}
      {play.sk.map((p, i) => <Player key={i} x={p.x} y={p.y} t={p.t} large={large} />)}

      {/* Ball */}
      <ellipse cx={88} cy={LOS - 1} rx={3.5} ry={2.2}
               fill="#c97b2a" stroke="#f59e2e" strokeWidth={0.6} />
    </svg>
  );
}

/* ── LEGENDS ─────────────────────────────────── */
const LEGENDS = {
  run:         [{c:CLR.run,l:'Ball Carrier'},{c:CLR.read,l:'QB Read'},{c:CLR.pull,l:'Pull'},{c:CLR.motion,l:'Motion'},{c:CLR.toss,l:'Toss/Pitch'},{c:CLR.block,l:'Block'}],
  pass:        [{c:CLR.pass,l:'Route'},{c:CLR.qbmove,l:'QB Drop'},{c:CLR.protect,l:'Protection'}],
  rpo:         [{c:CLR.run,l:'Run Path'},{c:CLR.pass,l:'Route'},{c:CLR.read,l:'QB Read'},{c:CLR.sit,l:'Screen'}],
  situational: [{c:CLR.sit,l:'Screen'},{c:CLR.pass,l:'Route'},{c:CLR.block,l:'Release'},{c:CLR.protect,l:'Max Protect'},{c:CLR.run,l:'Run'}],
};

/* ── PLAY CARD ───────────────────────────────── */
function PlayCard({ play, onClick }) {
  const meta = CAT_META[play.cat];
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
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
        }}>{String(play.id).padStart(2,'0')}</div>
      </div>
      <div style={{
        padding: '6px 9px 8px',
        borderTop: `1px solid ${hov ? meta.accent + '35' : '#1c0f38'}`,
        background: hov ? meta.bg : 'transparent',
      }}>
        <div style={{
          color: '#ede8ff', fontSize: 11, fontWeight: 700,
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
      background: 'rgba(4,0,12,0.9)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #130a26 0%, #080412 100%)',
        border: `1px solid ${meta.accent}45`,
        borderRadius: 18,
        overflow: 'hidden',
        width: '100%', maxWidth: 440,
        boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${meta.accent}18`,
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px 12px',
          background: `linear-gradient(90deg, ${meta.accent}14, transparent)`,
          borderBottom: `1px solid ${meta.accent}30`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{
                background: meta.accent, borderRadius: 4, padding: '2px 7px',
                fontSize: 9, fontWeight: 900, letterSpacing: '2px',
                color: '#000', fontFamily: 'monospace',
              }}>{meta.short}</div>
              <span style={{ color:'rgba(255,255,255,0.22)', fontSize:9, fontFamily:'monospace' }}>
                PLAY #{String(play.id).padStart(2,'0')}
              </span>
            </div>
            <div style={{
              color: '#ede8ff', fontSize: 20, fontWeight: 900,
              fontFamily: "'Courier New', monospace", letterSpacing: '-0.5px',
            }}>{play.name}</div>
            <div style={{ color: meta.accent, fontSize: 11, fontWeight: 500, opacity: 0.8, marginTop: 2 }}>
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

        {/* Field */}
        <div style={{ background: '#060010', padding: '0 0 4px' }}>
          <PlayField play={play} large={true} />
        </div>

        {/* Legend */}
        <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${meta.accent}20` }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,0.28)', marginBottom: 8, fontFamily: 'monospace',
          }}>LEGEND</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 14px', marginBottom:8 }}>
            {[['WR','#a78bfa'],['TE','#34d399'],['QB','#fbbf24'],['RB','#f87171'],['OL','#8b9ab5']].map(([t,c]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:10, height:10, borderRadius: t==='OL'?2:5, background:c, opacity:0.85 }} />
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:9, fontFamily:'monospace' }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ height:1, background:'rgba(255,255,255,0.06)', marginBottom:8 }} />
          <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 14px' }}>
            {(LEGENDS[play.cat]||[]).map(({c,l}) => (
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
  { id:'all',         label:'All 40',        accent:'#94a3b8' },
  { id:'run',         label:'Runs (12)',      accent:'#ef4444' },
  { id:'pass',        label:'Pass (16)',      accent:'#a78bfa' },
  { id:'rpo',         label:'RPO (6)',        accent:'#fb923c' },
  { id:'situational', label:'Situational (6)',accent:'#fbbf24' },
];

/* ── APP ─────────────────────────────────────── */
export default function AirRaidPlaybook() {
  const [filter, setFilter]   = useState('all');
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
        @keyframes fadeIn  { from{opacity:0}     to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes cardIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:#06020e }
        ::-webkit-scrollbar-thumb { background:#28103c; border-radius:2px }
        * { box-sizing:border-box }
      `}</style>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(180deg, #120622 0%, #08011a 100%)',
        borderBottom: '1px solid #1c0f38',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(167,139,250,0.7))' }}>
            🏈
          </div>
          <div>
            <div style={{ color:'#ede8ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              AIR RAID
            </div>
            <div style={{ color:'#a78bfa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              PASS VOLUME · SPACING · TEMPO
            </div>
          </div>
          <div style={{ marginLeft:'auto', color:'rgba(255,255,255,0.18)', fontSize:10, letterSpacing:'1px' }}>
            {displayed.length} PLAYS
          </div>
        </div>

        {/* Tabs */}
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

      {/* GRID */}
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

      {/* FOOTER */}
      <div style={{
        textAlign: 'center', padding: '12px 16px 20px',
        borderTop: '1px solid #120622',
        color: 'rgba(255,255,255,0.12)',
        fontSize: 9, letterSpacing: '2px',
      }}>
        AIR RAID SYSTEM · 40 PLAYS · TAP TO DETAIL
      </div>

      {/* MODAL */}
      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
