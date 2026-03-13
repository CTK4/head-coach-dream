import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  run:     '#ef4444',
  pass:    '#a78bfa',
  rpo:     '#fb923c',
  playact: '#f97316',
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
  run:        { label: 'Run Game',    short: 'RUN',  accent: '#ef4444', bg: '#ef444412' },
  rpo:        { label: 'RPO',         short: 'RPO',  accent: '#fb923c', bg: '#fb923c12' },
  pass:       { label: 'Dropback',    short: 'PASS', accent: '#a78bfa', bg: '#a78bfa12' },
  playaction: { label: 'Shot PA',     short: 'PA',   accent: '#f97316', bg: '#f9731612' },
  screen:     { label: 'Screens',     short: 'SCR',  accent: '#fbbf24', bg: '#fbbf2412' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* Power Spread: shotgun QB, attached TE/H, spread width */
const QB_Y = 88;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#ef4444','#a78bfa','#fb923c','#fbbf24',
  '#f472b6','#34d399','#64748b','#475569','#f87171','#10b981','#f97316',
];

/* ── FORMATION HELPERS ───────────────────────── */
const DOUBLES_SKILL = [
  {x:6,y:LOS,t:'WR'},
  {x:26,y:LOS,t:'WR'},
  {x:162,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:102,y:QB_Y,t:'RB'},
];

const TREY_RIGHT_SKILL = [
  {x:8,y:LOS,t:'WR'},
  {x:100,y:LOS,t:'TE'},
  {x:162,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:102,y:QB_Y,t:'RB'},
];

const H_SLICE_SKILL = [
  {x:6,y:LOS,t:'WR'},
  {x:26,y:LOS,t:'WR'},
  {x:98,y:LOS+10,t:'H'},
  {x:162,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:102,y:QB_Y,t:'RB'},
];

const SLOT_RIGHT_SKILL = [
  {x:8,y:LOS,t:'WR'},
  {x:28,y:LOS,t:'WR'},
  {x:100,y:LOS,t:'TE'},
  {x:162,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
];

const TRIPS_RIGHT_SKILL = [
  {x:8,y:LOS,t:'WR'},
  {x:148,y:LOS,t:'WR'},
  {x:164,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:102,y:QB_Y,t:'RB'},
];

const DOUBLES_H_SKILL = [
  {x:6,y:LOS,t:'WR'},
  {x:26,y:LOS,t:'WR'},
  {x:98,y:LOS+10,t:'H'},
  {x:162,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:102,y:QB_Y,t:'RB'},
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ CORE RUN GAME 1-15 ═════════════════════ */
  {
    id:1, name:'InsideZone_Gun', label:'Inside Zone (Gun)', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[100,82],[92,68],[82,50]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[66,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([6,LOS],[6,LOS-8]),     c:CLR.block,w:1,a:true},
      {d:P([180,LOS],[180,LOS-8]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:2, name:'SplitZone_Slice', label:'Split Zone (H-back slice)', cat:'run',
    sk:[...DOUBLES_H_SKILL],
    rt:[
      {d:CB([102,QB_Y],[100,82],[96,68],[96,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([98,LOS+10],[86,74],[74,64],[58,56]), c:CLR.block,w:1.7,a:true,dsh:true},
      {d:P([70,LOS],[72,LOS-7]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[82,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[98,LOS-8]),  c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[108,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:3, name:'Duo', label:'Duo', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:88,y:QB_Y+12,t:'RB'},
    ],
    rt:[
      {d:CB([88,QB_Y+12],[88,QB_Y],[88,74],[88,52]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-10]),   c:CLR.block,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-10]),   c:CLR.block,w:1.8,a:true},
      {d:P([90,LOS],[90,LOS-10]),   c:CLR.block,w:1.8,a:true},
      {d:P([100,LOS],[100,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([110,LOS],[110,LOS-10]), c:CLR.block,w:1.8,a:true},
    ],
  },
  {
    id:4, name:'Power', label:'Power', cat:'run',
    sk:[...TREY_RIGHT_SKILL],
    rt:[
      {d:CB([102,QB_Y],[104,82],[106,68],[106,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[96,LOS+2],[104,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([100,LOS],[108,78]), c:CLR.block,w:1.5,a:true,dsh:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:5, name:'Counter', label:'Counter', cat:'run',
    sk:[...DOUBLES_H_SKILL],
    rt:[
      {d:CB([102,QB_Y],[100,80],[96,66],[94,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([80,LOS],[86,LOS+8],[96,LOS+2],[100,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([70,LOS],[76,LOS+6],[94,LOS+2],[100,LOS-6]), c:CLR.pull,w:1.5,a:true},
      {d:P([98,LOS+10],[90,78]), c:CLR.block,w:1.5,a:true,dsh:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:6, name:'Counter_Bash', label:'Counter Bash', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[112,84],[126,70],[144,52]), c:CLR.read,w:2.2,a:true,dsh:true},
      {d:CB([88,QB_Y],[86,80],[82,66],[80,50]),     c:CLR.run,w:2.8,a:true},
      {d:CB([80,LOS],[86,LOS+8],[96,LOS+2],[100,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([70,LOS],[76,LOS+6],[94,LOS+2],[100,LOS-6]), c:CLR.pull,w:1.5,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:7, name:'Power_Read', label:'Power Read', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[104,82],[106,68],[106,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[80,84],[70,68],[68,52]),    c:CLR.read,w:2,a:true,dsh:true},
      {d:CB([70,LOS],[76,LOS+8],[96,LOS+2],[104,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:8, name:'Zone_Read', label:'Zone Read', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[100,82],[92,68],[82,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[88,82],[78,66],[68,52]),   c:CLR.read,w:2,a:true,dsh:true},
      {d:P([70,LOS],[66,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:9, name:'QB_Draw', label:'QB Draw', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+6]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([88,QB_Y+6],[88,74],[88,62],[86,46]), c:CLR.run,w:2.8,a:true},
      {d:CB([6,LOS],[6,46],[30,30],[46,28]),      c:CLR.pass,w:1,a:true,dsh:true},
      {d:CB([26,LOS],[26,56],[52,46],[70,44]),    c:CLR.pass,w:1,a:true,dsh:true},
      {d:CB([180,LOS],[180,46],[154,30],[140,28]),c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:10, name:'PinPull_Sweep', label:'Pin-Pull Sweep', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[108,84],[124,66],[148,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([100,LOS],[106,LOS+8],[126,LOS+2],[132,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([110,LOS],[118,LOS+6],[132,LOS+2],[138,LOS-8]), c:CLR.pull,w:1.5,a:true},
      {d:P([70,LOS],[66,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([162,LOS],[158,LOS-7]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:11, name:'Jet_Sweep', label:'Jet Sweep', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([6,LOS],[30,LOS+14],[70,LOS+16],[116,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
      {d:P([88,QB_Y],[104,QB_Y-6]), c:CLR.toss,w:1.2,a:true,dsh:true},
      {d:CB([116,LOS+2],[140,60],[162,46],[180,36]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[80,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[90,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[100,LOS-6]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[110,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[120,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:12, name:'Trap', label:'Trap', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[92,82],[84,68],[84,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[84,LOS+2],[86,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:13, name:'Stretch', label:'Stretch', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[110,84],[126,70],[148,52]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[80,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[102,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[112,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[124,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([162,LOS],[176,LOS-5]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:14, name:'Lead_Draw', label:'Lead Draw', cat:'run',
    sk:[
      {x:6,y:LOS,t:'WR'},{x:26,y:LOS,t:'WR'},
      {x:162,y:LOS,t:'WR'},{x:180,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:100,y:QB_Y,t:'RB'},{x:112,y:QB_Y,t:'H'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,QB_Y],[96,84],[90,68],[88,50]), c:CLR.run,w:2.8,a:true},
      {d:P([112,QB_Y],[98,80]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:15, name:'Sweep_Read', label:'Sweep Read', cat:'run',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:QQ([88,QB_Y],[130,QB_Y-4],[162,QB_Y-10]), c:CLR.read,w:2,a:true,dsh:true},
      {d:CB([102,QB_Y],[98,82],[92,68],[86,50]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[80,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[102,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[112,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[122,LOS-5]), c:CLR.block,w:1.2,a:true},
    ],
  },

  /* ═══ RPO LAYER 16-25 ════════════════════════ */
  {
    id:16, name:'IZ_Glance', label:'IZ Glance', cat:'rpo',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[100,80],[96,68],[92,52]), c:CLR.run,w:2,a:true,dsh:true},
      {d:CB([162,LOS],[158,52],[144,48],[128,48]), c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,24]), c:CLR.pass,w:1.5,a:true},
      {d:P([26,LOS],[26,50]),   c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[104,QB_Y-8]), c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:17, name:'IZ_Bubble', label:'IZ Bubble', cat:'rpo',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[100,80],[96,68],[94,52]), c:CLR.run,w:2,a:true,dsh:true},
      {d:QQ([162,LOS],[148,72],[136,78]), c:CLR.sit,w:2.2,a:true},
      {d:QQ([180,LOS],[166,72],[154,78]), c:CLR.sit,w:1.5,a:true},
      {d:P([6,LOS],[6,26]),   c:CLR.pass,w:1.5,a:true},
      {d:P([26,LOS],[26,50]), c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[102,QB_Y-8]), c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:18, name:'Duo_Hitch', label:'Duo Hitch', cat:'rpo',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[98,82],[92,68],[88,52]), c:CLR.run,w:2,a:true,dsh:true},
      {d:P([162,LOS],[162,54],[162,58]), c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,24]), c:CLR.pass,w:1.5,a:true},
      {d:P([6,LOS],[6,26]),     c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[100,QB_Y-8]), c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:19, name:'Power_Slant', label:'Power Slant', cat:'rpo',
    sk:[...TREY_RIGHT_SKILL],
    rt:[
      {d:CB([102,QB_Y],[104,82],[106,68],[106,52]), c:CLR.run,w:2,a:true,dsh:true},
      {d:CB([162,LOS],[148,56],[132,52],[118,52]), c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,26]), c:CLR.pass,w:1.5,a:true},
      {d:P([8,LOS],[8,26]),     c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[102,QB_Y-8]), c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:20, name:'Counter_Stick', label:'Counter Stick', cat:'rpo',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:CB([102,QB_Y],[100,80],[96,66],[94,50]), c:CLR.run,w:2,a:true,dsh:true},
      {d:QQ([100,LOS],[116,60],[132,58]), c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,52],[162,56]), c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,26]), c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[102,QB_Y-8]), c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:21, name:'Bash_Bubble', label:'Bash Bubble', cat:'rpo',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[112,84],[126,70],[144,52]), c:CLR.read,w:2.2,a:true,dsh:true},
      {d:CB([88,QB_Y],[86,80],[82,66],[80,50]), c:CLR.run,w:2,a:true,dsh:true}
    ],
  },
  {
    id:21, name:'Bash_Bubble', label:'Bash Bubble', cat:'rpo',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[112,84],[126,70],[144,52]), c:CLR.read,w:2.2,a:true,dsh:true},
      {d:CB([88,QB_Y],[86,80],[82,66],[80,50]), c:CLR.run,w:2,a:true,dsh:true},
      {d:QQ([162,LOS],[148,72],[136,78]), c:CLR.sit,w:2.2,a:true},
      {d:QQ([180,LOS],[166,72],[154,78]), c:CLR.sit,w:1.5,a:true},
      {d:P([88,QB_Y],[102,QB_Y-8]), c:CLR.read,w:1.2,a:true,dsh:true},
    ],
  },
  {
    id:22, name:'SweepOut_RPO', label:'Sweep Out RPO', cat:'rpo',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:QQ([88,QB_Y],[130,QB_Y-4],[162,QB_Y-10]), c:CLR.run,w:2,a:true,dsh:true},
      {d:P([180,LOS],[180,22],[196,22]), c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,24]), c:CLR.pass,w:1.5,a:true},
      {d:P([6,LOS],[6,26]),     c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[102,QB_Y-8]), c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:23, name:'TrapSeam_RPO', label:'Trap Seam RPO', cat:'rpo',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:CB([102,QB_Y],[92,82],[84,68],[84,50]), c:CLR.run,w:2,a:true,dsh:true},
      {d:P([100,LOS],[100,20]), c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,26]), c:CLR.pass,w:1.8,a:true},
      {d:P([180,LOS],[180,26]), c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[96,QB_Y-10]), c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:24, name:'SplitZone_Pop', label:'Split Zone Pop Pass', cat:'rpo',
    sk:[...DOUBLES_H_SKILL],
    rt:[
      {d:CB([102,QB_Y],[100,82],[96,68],[96,50]), c:CLR.run,w:2,a:true,dsh:true},
      {d:P([98,LOS+10],[98,40]), c:CLR.pass,w:2.2,a:true,dsh:true},
      {d:P([162,LOS],[162,26]),   c:CLR.pass,w:1.8,a:true},
      {d:P([180,LOS],[180,26]),   c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[96,QB_Y-10]), c:CLR.read,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:25, name:'ZoneRead_Now', label:'Zone Read Now Screen', cat:'rpo',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([102,QB_Y],[100,82],[92,68],[82,50]), c:CLR.run,w:2,a:true,dsh:true},
      {d:CB([88,QB_Y],[88,82],[78,66],[68,52]),   c:CLR.read,w:1.8,a:true,dsh:true},
      {d:QQ([26,LOS],[24,72],[22,78]),           c:CLR.sit,w:2.2,a:true},
      {d:CB([88,QB_Y],[64,84],[40,80],[22,78]),  c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:QQ([6,LOS],[10,70],[14,76]),            c:CLR.block,w:1.5,a:true},
    ],
  },

  /* ═══ DROPBACK PASS 26-33 ════════════════════ */
  {
    id:26, name:'Four_Verts', label:'4 Verts', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([6,LOS],[6,12]),       c:CLR.pass,w:2.2,a:true},
      {d:P([26,LOS],[26,12]),     c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,12]),   c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,12]),   c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y],[108,80],[118,74],[126,70]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:27, name:'Dagger', label:'Dagger', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([6,LOS],[6,32],[88,32]),                c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[26,46],[48,32],[66,26]),    c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[180,32],[148,22],[122,20]),c:CLR.pass,w:2,a:true},
      {d:P([162,LOS],[162,52],[140,52]),          c:CLR.pass,w:2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:28, name:'Mesh', label:'Mesh', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([26,LOS],[48,60],[82,58],[112,60]),    c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[138,58],[104,56],[72,58]),  c:CLR.pass,w:2.2,a:true},
      {d:P([6,LOS],[6,24]),                        c:CLR.pass,w:1.8,a:true},
      {d:CB([180,LOS],[190,42],[178,22],[164,20]), c:CLR.pass,w:1.8,a:true},
      {d:QQ([102,QB_Y],[114,80],[126,76]),         c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:29, name:'Drive', label:'Drive', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([26,LOS],[46,50],[80,48],[110,50]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[144,46],[110,44],[78,46]), c:CLR.pass,w:2.2,a:true},
      {d:P([6,LOS],[6,24]),                       c:CLR.pass,w:1.8,a:true},
      {d:P([180,LOS],[180,24]),                   c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:30, name:'Levels', label:'Levels', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([6,LOS],[6,36],[90,36]),               c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[48,58],[76,58],[106,58]),   c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,24]),                   c:CLR.pass,w:1.8,a:true},
      {d:P([162,LOS],[162,42]),                   c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:31, name:'Smash', label:'Smash', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([6,LOS],[2,40],[18,22],[30,20]),       c:CLR.pass,w:2.2,a:true},
      {d:P([26,LOS],[26,54],[26,58]),              c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[188,40],[172,22],[160,20]), c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,54],[162,58]),           c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:32, name:'Flood', label:'Flood', cat:'pass',
    sk:[...TRIPS_RIGHT_SKILL],
    rt:[
      {d:CB([180,LOS],[192,40],[178,20],[162,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([164,LOS],[164,48],[196,48]),           c:CLR.pass,w:2.2,a:true},
      {d:QQ([148,LOS],[162,60],[178,58]),          c:CLR.pass,w:2,a:true},
      {d:P([8,LOS],[8,24]),                        c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:33, name:'Deep_Over', label:'Deep Over', cat:'pass',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:CB([8,LOS],[8,42],[56,34],[116,30]),      c:CLR.pass,w:2.3,a:true},
      {d:CB([162,LOS],[162,32],[146,20],[128,16]), c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },

  /* ═══ PLAY-ACTION SHOT PACKAGE 34-37 ═════════ */
  {
    id:34, name:'PA_Post', label:'PA Post', cat:'playaction',
    sk:[...TREY_RIGHT_SKILL],
    rt:[
      {d:CB([8,LOS],[8,34],[34,20],[62,16]),       c:CLR.pass,w:2.3,a:true},
      {d:P([180,LOS],[180,28]),                    c:CLR.pass,w:1.8,a:true},
      {d:CB([162,LOS],[162,34],[146,22],[128,18]), c:CLR.pass,w:2,a:true},
      {d:P([100,LOS],[100,28]),                    c:CLR.pass,w:1.7,a:true},
      {d:CB([102,QB_Y],[104,84],[110,80],[118,78]),c:CLR.playact,w:1.8,a:false,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:34, name:'PA_Post', label:'PA Post', cat:'playaction',
    sk:[...TREY_RIGHT_SKILL],
    rt:[
      {d:CB([8,LOS],[8,34],[34,20],[62,16]),       c:CLR.pass,w:2.3,a:true},
      {d:P([180,LOS],[180,28]),                    c:CLR.pass,w:1.8,a:true},
      {d:CB([162,LOS],[162,34],[146,22],[128,18]), c:CLR.pass,w:2,a:true},
      {d:P([100,LOS],[100,28]),                    c:CLR.pass,w:1.7,a:true},
      {d:CB([102,QB_Y],[104,84],[110,80],[118,78]),c:CLR.playact,w:1.8,a:false,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:35, name:'PA_Yankee', label:'PA Yankee', cat:'playaction',
    sk:[...TREY_RIGHT_SKILL],
    rt:[
      {d:CB([8,LOS],[8,34],[34,18],[68,14]),       c:CLR.pass,w:2.4,a:true},
      {d:CB([162,LOS],[162,42],[126,34],[78,34]),  c:CLR.pass,w:2.3,a:true},
      {d:P([180,LOS],[180,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                    c:CLR.pass,w:1.7,a:true},
      {d:CB([102,QB_Y],[104,84],[110,80],[118,78]),c:CLR.playact,w:1.8,a:false,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:36, name:'PA_Wheel', label:'PA Wheel', cat:'playaction',
    sk:[...DOUBLES_H_SKILL],
    rt:[
      {d:CB([102,QB_Y],[136,QB_Y],[164,76],[174,20]), c:CLR.pass,w:2.3,a:true},
      {d:CB([180,LOS],[188,38],[178,20],[164,16]),   c:CLR.pass,w:2.0,a:true},
      {d:P([6,LOS],[6,30]),                           c:CLR.pass,w:1.8,a:true},
      {d:P([26,LOS],[26,30]),                         c:CLR.pass,w:1.8,a:true},
      {d:CB([98,LOS+10],[104,76],[112,70],[122,66]), c:CLR.playact,w:1.5,a:false,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:37, name:'PA_SwitchVert', label:'PA Switch Vert', cat:'playaction',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([6,LOS],[6,44],[22,36],[30,24]),       c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[26,54],[10,44],[6,24]),      c:CLR.pass,w:1.8,a:true},
      {d:CB([180,LOS],[180,44],[164,36],[156,24]), c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[162,54],[178,44],[180,24]), c:CLR.pass,w:1.8,a:true},
      {d:CB([102,QB_Y],[104,84],[110,80],[118,78]),c:CLR.playact,w:1.8,a:false,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },

  /* ═══ SCREENS 38-40 ══════════════════════════ */
  {
    id:38, name:'RB_Slip_Screen', label:'RB Slip Screen', cat:'screen',
    sk:[...TREY_RIGHT_SKILL],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y],[132,84],[160,76],[172,70]), c:CLR.sit,w:2.2,a:true},
      {d:CB([88,QB_Y+8],[126,82],[154,74],[172,70]), c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:CB([100,LOS],[118,66],[140,66],[156,68]), c:CLR.block,w:1.5,a:true},
      {d:CB([110,LOS],[128,64],[148,66],[162,68]), c:CLR.block,w:1.5,a:true},
      {d:P([8,LOS],[8,24]),     c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([180,LOS],[180,24]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:39, name:'WR_Tunnel_Screen', label:'WR Tunnel Screen', cat:'screen',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+6]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([26,LOS],[30,70],[34,78],[36,82]), c:CLR.sit,w:2.2,a:true},
      {d:CB([88,QB_Y+6],[62,86],[46,84],[36,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:CB([6,LOS],[12,68],[24,74],[30,78]),     c:CLR.block,w:1.5,a:true},
      {d:CB([100,LOS],[84,64],[62,60],[44,62]),   c:CLR.block,w:1.5,a:true},
      {d:P([180,LOS],[180,26]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([162,LOS],[162,26]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:40, name:'Swing_Screen', label:'Swing Screen', cat:'screen',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y],[136,QB_Y],[164,76],[174,70]), c:CLR.sit,w:2.2,a:true},
      {d:CB([88,QB_Y+8],[128,QB_Y+6],[162,76],[174,70]), c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:CB([180,LOS],[192,40],[182,20],[168,18]), c:CLR.pass,w:1.8,a:true},
      {d:P([162,LOS],[162,30]), c:CLR.pass,w:1.5,a:true},
      {d:P([6,LOS],[6,26]),     c:CLR.pass,w:1,a:true,dsh:true},
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
  WR:'#a78bfa',
  TE:'#34d399',
  QB:'#fbbf24',
  RB:'#f87171',
  FB:'#fb923c',
  H:'#f472b6',
  OL:'#8b9ab5',
};

function Player({ x, y, t, large = false }) {
  const c = PLAYER_COLORS[t] || '#fff';
  const r = large ? 6.5 : 5;

  if (t === 'OL') {
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
          opacity={0.9}
        />
        <rect
          x={x-s/2}
          y={y-s*0.45}
          width={s}
          height={s*0.9}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
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
      opacity={0.9}
    />
  );
}

/* ── FIELD SVG ───────────────────────────────── */
function PlayField({ play, large = false }) {
  const olX = [70, 80, 90, 100, 110];

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
      {olX.map((x, i) => <Player key={i} x={x} y={LOS} t="OL" large={large} />)}
      {play.sk.map((p, i) => <Player key={i} x={p.x} y={p.y} t={p.t} large={large} />)}

      <ellipse
        cx={88}
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
  run: [
    {c:CLR.run,l:'Ball Carrier'},
    {c:CLR.read,l:'QB Read'},
    {c:CLR.pull,l:'Pull'},
    {c:CLR.motion,l:'Motion'},
    {c:CLR.toss,l:'Toss/Pitch'},
    {c:CLR.block,l:'Block'},
  ],
  rpo: [
    {c:CLR.run,l:'Run Path'},
    {c:CLR.pass,l:'Route'},
    {c:CLR.read,l:'QB Read'},
    {c:CLR.sit,l:'Screen/Quick'},
  ],
  pass: [
    {c:CLR.pass,l:'Route'},
    {c:CLR.qbmove,l:'QB Drop'},
  ],
  playaction: [
    {c:CLR.pass,l:'Route'},
    {c:CLR.playact,l:'Run Action'},
    {c:CLR.qbmove,l:'QB Set'},
    {c:CLR.protect,l:'Protection'},
  ],
  screen: [
    {c:CLR.sit,l:'Screen Path'},
    {c:CLR.block,l:'Escort'},
    {c:CLR.pass,l:'Clearout'},
    {c:CLR.qbmove,l:'QB Set'},
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
              ['WR','#a78bfa'],
              ['TE','#34d399'],
              ['QB','#fbbf24'],
              ['RB','#f87171'],
              ['H','#f472b6'],
              ['OL','#8b9ab5'],
            ].map(([t,c]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:10, height:10, borderRadius: t==='OL'?2:5, background:c, opacity:0.85 }} />
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
  { id:'all',        label:'All 40',      accent:'#94a3b8' },
  { id:'run',        label:'Run (15)',    accent:'#ef4444' },
  { id:'rpo',        label:'RPO (10)',    accent:'#fb923c' },
  { id:'pass',       label:'Pass (8)',    accent:'#a78bfa' },
  { id:'playaction', label:'PA Shot (4)', accent:'#f97316' },
  { id:'screen',     label:'Screens (3)', accent:'#fbbf24' },
];

/* ── APP ─────────────────────────────────────── */
export default function PowerSpreadPlaybook() {
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
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))' }}>
            🏈
          </div>
          <div>
            <div style={{ color:'#ede8ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              POWER SPREAD
            </div>
            <div style={{ color:'#ef4444', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              PHYSICAL SPREAD · QB THREAT · RPO LAYER
            </div>
          </div>
          <div style={{ marginLeft:'auto', color:'rgba(255,255,255,0.18)', fontSize:10, letterSpacing:'1px' }}>
            {displayed.length} PLAYS
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
            key={`${play.id}-${idx}`}
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
        POWER SPREAD · 40 PLAYS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
