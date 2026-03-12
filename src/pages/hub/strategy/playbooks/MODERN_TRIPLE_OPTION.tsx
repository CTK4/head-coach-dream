import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  run:     '#ef4444',
  pass:    '#a78bfa',
  pa:      '#22c55e',
  screen:  '#fbbf24',
  sit:     '#fbbf24',
  block:   '#64748b',
  motion:  '#f472b6',
  protect: '#475569',
  qbmove:  '#fb923c',
  pull:    '#f87171',
  toss:    '#fbbf24',
  read:    '#34d399',
  pitch:   '#38bdf8',
};

const CAT_META = {
  run:    { label: 'Runs',        short: 'RUN', accent: '#ef4444', bg: '#ef444412' },
  pa:     { label: 'Play Action', short: 'PA',  accent: '#22c55e', bg: '#22c55e12' },
  screen: { label: 'Screens',     short: 'SCR', accent: '#fbbf24', bg: '#fbbf2412' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* ── FORMATION HELPERS ───────────────────────── */
const OL_X = [70, 80, 90, 100, 110];
const QB_Y = 90;

const FLEXBONE = [
  {x:12,y:LOS,t:'WR'},
  {x:176,y:LOS,t:'WR'},
  {x:100,y:LOS,t:'TE'},
  {x:88,y:QB_Y,t:'QB'},
  {x:76,y:QB_Y+8,t:'RB'},
  {x:100,y:QB_Y+8,t:'RB'},
  {x:88,y:QB_Y+16,t:'FB'},
];

const FLEX_LEFT_SLOT = [
  {x:12,y:LOS,t:'WR'},
  {x:176,y:LOS,t:'WR'},
  {x:100,y:LOS,t:'TE'},
  {x:88,y:QB_Y,t:'QB'},
  {x:70,y:QB_Y+8,t:'RB'},
  {x:100,y:QB_Y+8,t:'RB'},
  {x:88,y:QB_Y+16,t:'FB'},
];

const FLEX_RIGHT_SLOT = [
  {x:12,y:LOS,t:'WR'},
  {x:176,y:LOS,t:'WR'},
  {x:100,y:LOS,t:'TE'},
  {x:88,y:QB_Y,t:'QB'},
  {x:76,y:QB_Y+8,t:'RB'},
  {x:106,y:QB_Y+8,t:'RB'},
  {x:88,y:QB_Y+16,t:'FB'},
];

const GUN_OPTION = [
  {x:8,y:LOS,t:'WR'},
  {x:26,y:LOS,t:'WR'},
  {x:162,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:102,y:QB_Y,t:'RB'},
  {x:100,y:LOS,t:'TE'},
];

const HEAVY_GOAL = [
  {x:22,y:LOS,t:'TE'},
  {x:100,y:LOS,t:'TE'},
  {x:176,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:76,y:QB_Y+8,t:'RB'},
  {x:100,y:QB_Y+8,t:'RB'},
  {x:88,y:QB_Y+16,t:'FB'},
];

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#ef4444','#a78bfa','#22c55e','#fbbf24','#38bdf8',
  '#fb923c','#f472b6','#34d399','#64748b','#475569','#f87171','#10b981',
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ RUNS 1-25 ══════════════════════════════ */
  {
    id:1, name:'InsideVeer', label:'Inside Veer', cat:'run',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y],[88,82],[82,70],[80,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[96,82],[108,72],[120,56]), c:CLR.read,w:2,a:true,dsh:true},
      {d:QQ([88,QB_Y],[104,80],[116,62]), c:CLR.pitch,w:1.4,a:true,dsh:true},
      {d:P([88,QB_Y+16],[88,72]), c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[66,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:2, name:'Midline', label:'Midline', cat:'run',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y],[88,80],[88,68],[88,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[98,82],[108,70],[116,56]), c:CLR.read,w:2,a:true,dsh:true},
      {d:QQ([88,QB_Y],[102,80],[114,64]), c:CLR.pitch,w:1.4,a:true,dsh:true},
      {d:P([88,QB_Y+16],[84,72]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:3, name:'OutsideVeer', label:'Outside Veer', cat:'run',
    sk:[...FLEX_RIGHT_SLOT],
    rt:[
      {d:CB([88,QB_Y],[94,84],[108,74],[124,56]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[102,84],[118,74],[136,58]), c:CLR.read,w:2,a:true,dsh:true},
      {d:QQ([88,QB_Y],[110,82],[130,62]), c:CLR.pitch,w:1.4,a:true,dsh:true},
      {d:CB([88,QB_Y+16],[98,88],[112,74],[124,60]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[76,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[88,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[98,LOS-7]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[110,LOS-7]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[122,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:4, name:'SpeedOption', label:'Speed Option', cat:'run',
    sk:[...FLEX_RIGHT_SLOT],
    rt:[
      {d:CB([88,QB_Y],[96,84],[112,72],[130,56]), c:CLR.run,w:2.8,a:true},
      {d:QQ([88,QB_Y],[110,82],[132,60]), c:CLR.pitch,w:1.6,a:true,dsh:true},
      {d:CB([88,QB_Y],[102,84],[118,72],[132,56]), c:CLR.read,w:1.8,a:true,dsh:true},
      {d:P([88,QB_Y+16],[94,76]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[78,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[90,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[102,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:5, name:'CounterOption', label:'Counter Option', cat:'run',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y],[82,84],[72,74],[60,58]), c:CLR.run,w:2.8,a:true},
      {d:CB([110,LOS],[104,LOS+8],[92,LOS+2],[82,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([100,LOS],[96,LOS+8],[84,LOS+2],[76,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([88,QB_Y],[74,84],[58,72],[44,56]), c:CLR.read,w:1.8,a:true,dsh:true},
      {d:QQ([88,QB_Y],[66,82],[46,60]), c:CLR.pitch,w:1.5,a:true,dsh:true},
      {d:P([88,QB_Y+16],[80,78]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:6, name:'TrapOption', label:'Trap Option', cat:'run',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y],[86,82],[84,70],[84,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[84,LOS+2],[86,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([88,QB_Y],[98,82],[110,72],[120,58]), c:CLR.read,w:1.8,a:true,dsh:true},
      {d:QQ([88,QB_Y],[104,80],[116,62]), c:CLR.pitch,w:1.4,a:true,dsh:true},
      {d:P([88,QB_Y+16],[84,72]), c:CLR.block,w:1.6,a:true},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:7, name:'QBPower', label:'QB Power', cat:'run',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([88,QB_Y],[92,82],[98,70],[100,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[94,LOS+2],[102,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([102,QB_Y],[102,QB_Y-2]), c:CLR.block,w:1.6,a:false},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:8, name:'ZoneRead', label:'Zone Read', cat:'run',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([102,QB_Y],[100,82],[92,68],[82,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[88,82],[78,66],[68,52]), c:CLR.read,w:2,a:true,dsh:true},
      {d:P([70,LOS],[66,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:9, name:'PowerRead', label:'Power Read', cat:'run',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([102,QB_Y],[104,82],[106,68],[106,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[80,84],[70,68],[68,52]), c:CLR.read,w:2,a:true,dsh:true},
      {d:CB([70,LOS],[76,LOS+8],[96,LOS+2],[104,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:10, name:'Bash', label:'Bash', cat:'run',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([102,QB_Y],[84,84],[70,68],[66,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[92,82],[96,68],[98,50]), c:CLR.read,w:2,a:true,dsh:true},
      {d:P([70,LOS],[74,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[84,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[94,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[104,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:11, name:'ArcRead', label:'Arc Read', cat:'run',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([102,QB_Y],[100,82],[92,68],[82,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([100,LOS],[108,72],[118,64],[130,56]), c:CLR.block,w:1.6,a:true},
      {d:CB([88,QB_Y],[88,82],[78,66],[68,52]), c:CLR.read,w:2,a:true,dsh:true},
      {d:P([70,LOS],[66,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:12, name:'Triple', label:'Triple', cat:'run',
    sk:[...FLEX_RIGHT_SLOT],
    rt:[
      {d:CB([88,QB_Y],[94,84],[108,74],[124,56]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[104,84],[122,74],[140,56]), c:CLR.read,w:2,a:true,dsh:true},
      {d:QQ([88,QB_Y],[112,82],[136,60]), c:CLR.pitch,w:1.6,a:true,dsh:true},
      {d:CB([88,QB_Y+16],[98,88],[112,74],[124,60]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[76,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[88,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[98,LOS-7]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[110,LOS-7]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[122,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:13, name:'LoadOption', label:'Load Option', cat:'run',
    sk:[...FLEX_RIGHT_SLOT],
    rt:[
      {d:CB([88,QB_Y],[96,84],[112,72],[130,56]), c:CLR.run,w:2.8,a:true},
      {d:CB([100,LOS],[116,72],[130,62],[142,56]), c:CLR.block,w:1.6,a:true},
      {d:QQ([88,QB_Y],[110,82],[132,60]), c:CLR.pitch,w:1.6,a:true,dsh:true},
      {d:CB([88,QB_Y],[102,84],[118,72],[132,56]), c:CLR.read,w:1.8,a:true,dsh:true},
      {d:P([70,LOS],[78,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[90,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[102,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:14, name:'Pitch', label:'Pitch', cat:'run',
    sk:[...FLEX_RIGHT_SLOT],
    rt:[
      {d:QQ([88,QB_Y],[112,82],[136,60]), c:CLR.pitch,w:1.7,a:true,dsh:true},
      {d:CB([106,QB_Y+8],[126,80],[150,62],[170,42]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[100,84],[118,72],[132,56]), c:CLR.read,w:1.5,a:true,dsh:true},
      {d:P([70,LOS],[80,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-5]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:15, name:'TossRead', label:'Toss Read', cat:'run',
    sk:[...GUN_OPTION],
    rt:[
      {d:QQ([88,QB_Y],[126,QB_Y-2],[162,QB_Y-8]), c:CLR.toss,w:1.5,a:true,dsh:true},
      {d:CB([162,QB_Y-8],[178,56],[188,40],[192,30]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[78,82],[68,68],[64,52]), c:CLR.read,w:1.9,a:true,dsh:true},
      {d:P([70,LOS],[80,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[102,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[112,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[122,LOS-5]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:16, name:'SplitVeer', label:'Split Veer', cat:'run',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y],[94,84],[108,74],[122,58]), c:CLR.run,w:2.8,a:true},
      {d:CB([100,LOS],[92,76],[80,66],[70,56]), c:CLR.block,w:1.6,a:true},
      {d:CB([88,QB_Y],[104,84],[120,74],[136,58]), c:CLR.read,w:2,a:true,dsh:true},
      {d:QQ([88,QB_Y],[110,82],[132,60]), c:CLR.pitch,w:1.5,a:true,dsh:true},
      {d:P([88,QB_Y+16],[94,78]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[76,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[88,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[98,LOS-7]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[122,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:17, name:'MidlineTriple', label:'Midline Triple', cat:'run',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y],[88,80],[88,68],[88,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[100,82],[114,72],[128,58]), c:CLR.read,w:2,a:true,dsh:true},
      {d:QQ([88,QB_Y],[108,82],[126,62]), c:CLR.pitch,w:1.5,a:true,dsh:true},
      {d:P([88,QB_Y+16],[84,72]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[70,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:18, name:'InvertedVeer', label:'Inverted Veer', cat:'run',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([88,QB_Y],[92,82],[98,68],[102,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([102,QB_Y],[84,84],[68,68],[62,50]), c:CLR.read,w:2,a:true,dsh:true},
      {d:P([70,LOS],[76,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[86,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[96,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[106,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[116,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:19, name:'BellyOption', label:'Belly Option', cat:'run',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y+16],[90,92],[94,78],[96,54]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[102,84],[118,72],[132,56]), c:CLR.read,w:1.8,a:true,dsh:true},
      {d:QQ([88,QB_Y],[110,82],[132,60]), c:CLR.pitch,w:1.5,a:true,dsh:true},
      {d:P([76,QB_Y+8],[84,76]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[72,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[82,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[92,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[104,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:20, name:'CounterBash', label:'Counter Bash', cat:'run',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([102,QB_Y],[82,84],[66,68],[60,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[94,82],[100,68],[102,50]), c:CLR.read,w:2,a:true,dsh:true},
      {d:CB([80,LOS],[86,LOS+8],[98,LOS+2],[106,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([70,LOS],[76,LOS+6],[94,LOS+2],[102,LOS-6]), c:CLR.pull,w:1.5,a:true},
      {d:P([90,LOS],[90,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:21, name:'QBIso', label:'QB Iso', cat:'run',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y],[88,82],[88,70],[88,48]), c:CLR.run,w:2.8,a:true},
      {d:P([88,QB_Y+16],[88,70]), c:CLR.block,w:1.8,a:true},
      {d:P([76,QB_Y+8],[82,74]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:22, name:'LeadOption', label:'Lead Option', cat:'run',
    sk:[...FLEX_RIGHT_SLOT],
    rt:[
      {d:CB([88,QB_Y],[96,84],[112,72],[128,56]), c:CLR.run,w:2.8,a:true},
      {d:P([88,QB_Y+16],[98,76]), c:CLR.block,w:1.8,a:true},
      {d:QQ([88,QB_Y],[110,82],[132,60]), c:CLR.pitch,w:1.5,a:true,dsh:true},
      {d:CB([88,QB_Y],[102,84],[118,72],[132,56]), c:CLR.read,w:1.8,a:true,dsh:true},
      {d:P([70,LOS],[78,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[90,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[102,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:23, name:'TrapRead', label:'Trap Read', cat:'run',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([102,QB_Y],[94,82],[86,68],[86,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[86,LOS+2],[90,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([88,QB_Y],[88,82],[78,68],[70,54]), c:CLR.read,w:2,a:true,dsh:true},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:24, name:'RocketOption', label:'Rocket Option', cat:'run',
    sk:[...FLEX_RIGHT_SLOT],
    rt:[
      {d:CB([106,QB_Y+8],[138,QB_Y+2],[166,74],[186,42]), c:CLR.motion,w:1.5,a:false,dsh:true},
      {d:P([88,QB_Y],[112,QB_Y-6]), c:CLR.toss,w:1.4,a:true,dsh:true},
      {d:CB([112,QB_Y-6],[136,76],[164,58],[184,36]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[100,84],[116,72],[130,56]), c:CLR.read,w:1.7,a:true,dsh:true},
      {d:P([70,LOS],[80,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-5]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:25, name:'GoalLineVeer', label:'Goal Line Veer', cat:'run',
    sk:[...HEAVY_GOAL],
    rt:[
      {d:CB([88,QB_Y],[92,82],[100,70],[108,54]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,QB_Y],[102,84],[116,72],[128,58]), c:CLR.read,w:1.9,a:true,dsh:true},
      {d:QQ([88,QB_Y],[108,82],[126,62]), c:CLR.pitch,w:1.5,a:true,dsh:true},
      {d:P([88,QB_Y+16],[94,74]), c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-11]), c:CLR.block,w:2,a:true},
      {d:P([80,LOS],[80,LOS-11]), c:CLR.block,w:2,a:true},
      {d:P([90,LOS],[90,LOS-11]), c:CLR.block,w:2,a:true},
      {d:P([100,LOS],[100,LOS-11]), c:CLR.block,w:2,a:true},
      {d:P([110,LOS],[110,LOS-11]), c:CLR.block,w:2,a:true},
    ],
  },

  /* ═══ PLAY ACTION 26-35 ══════════════════════ */
  {
    id:26, name:'PAPost', label:'PA Post', cat:'pa',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y+16],[88,98],[94,92],[98,88]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([76,QB_Y+8],[82,82]), c:CLR.protect,w:1.4,a:false},
      {d:CB([176,LOS],[176,34],[154,20],[132,16]), c:CLR.pa,w:2.5,a:true},
      {d:P([12,LOS],[12,28]), c:CLR.pa,w:1.8,a:true},
      {d:P([100,LOS],[100,26]), c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:27, name:'PASeam', label:'PA Seam', cat:'pa',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y+16],[88,98],[94,92],[98,88]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([76,QB_Y+8],[82,82]), c:CLR.protect,w:1.4,a:false},
      {d:P([100,LOS],[100,14]), c:CLR.pa,w:2.4,a:true},
      {d:P([12,LOS],[12,24]), c:CLR.pa,w:1.8,a:true},
      {d:P([176,LOS],[176,24]), c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:28, name:'PAWheel', label:'PA Wheel', cat:'pa',
    sk:[...FLEX_RIGHT_SLOT],
    rt:[
      {d:CB([88,QB_Y+16],[88,98],[94,92],[98,88]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([106,QB_Y+8],[126,QB_Y],[150,76],[170,34]), c:CLR.pa,w:2.2,a:true},
      {d:P([12,LOS],[12,24]), c:CLR.pa,w:1.8,a:true},
      {d:P([176,LOS],[176,18]), c:CLR.pa,w:2.2,a:true},
      {d:P([100,LOS],[100,26]), c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:29, name:'PAOver', label:'PA Over', cat:'pa',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y+16],[88,98],[94,92],[98,88]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([176,LOS],[160,42],[120,30],[76,28]), c:CLR.pa,w:2.4,a:true},
      {d:P([12,LOS],[12,24]), c:CLR.pa,w:1.8,a:true},
      {d:P([100,LOS],[100,26]), c:CLR.pa,w:1.8,a:true},
      {d:P([76,QB_Y+8],[82,82]), c:CLR.protect,w:1.4,a:false},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:30, name:'PAFade', label:'PA Fade', cat:'pa',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y+16],[88,98],[94,92],[98,88]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([12,LOS],[12,16]), c:CLR.pa,w:2.3,a:true},
      {d:P([176,LOS],[176,16]), c:CLR.pa,w:2.3,a:true},
      {d:P([100,LOS],[100,26]), c:CLR.pa,w:1.8,a:true},
      {d:P([76,QB_Y+8],[82,82]), c:CLR.protect,w:1.4,a:false},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:31, name:'PASwitch', label:'PA Switch', cat:'pa',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([8,LOS],[8,44],[24,36],[32,24]), c:CLR.pa,w:2.2,a:true},
      {d:CB([26,LOS],[26,54],[10,44],[8,24]), c:CLR.pa,w:1.8,a:true},
      {d:CB([180,LOS],[180,44],[164,36],[156,24]), c:CLR.pa,w:2.2,a:true},
      {d:CB([162,LOS],[162,54],[178,44],[180,24]), c:CLR.pa,w:1.8,a:true},
      {d:P([88,QB_Y],[96,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y],[102,QB_Y-2]), c:CLR.protect,w:1.3,a:false},
    ],
  },
  {
    id:32, name:'PACross', label:'PA Cross', cat:'pa',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y+16],[88,98],[94,92],[98,88]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([176,LOS],[158,44],[116,34],[72,32]), c:CLR.pa,w:2.4,a:true},
      {d:P([12,LOS],[12,24]), c:CLR.pa,w:1.8,a:true},
      {d:P([100,LOS],[100,24]), c:CLR.pa,w:1.8,a:true},
      {d:P([76,QB_Y+8],[82,82]), c:CLR.protect,w:1.4,a:false},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:33, name:'PASmash', label:'PA Smash', cat:'pa',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y+16],[88,98],[94,92],[98,88]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([12,LOS],[6,40],[20,22],[32,20]), c:CLR.pa,w:2.2,a:true},
      {d:P([100,LOS],[100,54],[100,58]), c:CLR.pa,w:2.2,a:true},
      {d:CB([176,LOS],[184,40],[168,22],[156,20]), c:CLR.pa,w:2.2,a:true},
      {d:P([76,QB_Y+8],[82,82]), c:CLR.protect,w:1.4,a:false},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:34, name:'PABoot', label:'PA Boot', cat:'pa',
    sk:[...FLEX_RIGHT_SLOT],
    rt:[
      {d:CB([88,QB_Y+16],[88,98],[96,92],[108,88]), c:CLR.qbmove,w:1.6,a:false,dsh:true},
      {d:CB([88,QB_Y],[108,92],[132,82],[150,72]), c:CLR.qbmove,w:1.6,a:false,dsh:true},
      {d:QQ([100,LOS],[118,66],[136,64]), c:CLR.pa,w:2.2,a:true},
      {d:P([176,LOS],[176,24]), c:CLR.pa,w:2.2,a:true},
      {d:CB([12,LOS],[12,38],[28,26],[44,22]), c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:35, name:'PAPop', label:'PA Pop', cat:'pa',
    sk:[...FLEXBONE],
    rt:[
      {d:CB([88,QB_Y+16],[88,98],[94,92],[98,88]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,LOS],[108,58],[116,52]), c:CLR.pa,w:2.2,a:true},
      {d:P([12,LOS],[12,24]), c:CLR.pa,w:1.8,a:true},
      {d:P([176,LOS],[176,24]), c:CLR.pa,w:1.8,a:true},
      {d:P([76,QB_Y+8],[82,82]), c:CLR.protect,w:1.4,a:false},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },

  /* ═══ SCREENS 36-40 ══════════════════════════ */
  {
    id:36, name:'Slip', label:'Slip', cat:'screen',
    sk:[...GUN_OPTION],
    rt:[
      {d:CB([102,QB_Y],[102,QB_Y+4],[98,QB_Y+6],[90,QB_Y+10]), c:CLR.screen,w:2,a:true},
      {d:CB([88,QB_Y],[88,QB_Y+2],[88,QB_Y+6],[88,QB_Y+10]), c:CLR.screen,w:1.5,a:false,dsh:true},
      {d:CB([70,LOS],[74,66],[76,58],[82,56]), c:CLR.block,w:1.5,a:true},
      {d:CB([80,LOS],[82,66],[84,60],[86,56]), c:CLR.block,w:1.2,a:true},
      {d:P([8,LOS],[8,22]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([180,LOS],[180,22]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:37, name:'Tunnel', label:'Tunnel', cat:'screen',
    sk:[...GUN_OPTION],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+6]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([26,LOS],[30,70],[34,78],[36,82]), c:CLR.screen,w:2.2,a:true},
      {d:CB([88,QB_Y+6],[62,86],[46,84],[36,82]), c:CLR.screen,w:1.8,a:true,dsh:true},
      {d:CB([8,LOS],[12,68],[24,74],[30,78]), c:CLR.block,w:1.5,a:true},
      {d:CB([100,LOS],[84,64],[62,60],[44,62]), c:CLR.block,w:1.5,a:true},
      {d:P([180,LOS],[180,22]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([162,LOS],[162,22]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:38, name:'Bubble', label:'Bubble', cat:'screen',
    sk:[...GUN_OPTION],
    rt:[
      {d:QQ([162,LOS],[148,72],[136,78]), c:CLR.screen,w:2.2,a:true},
      {d:QQ([180,LOS],[166,72],[154,78]), c:CLR.block,w:1.5,a:true},
      {d:P([8,LOS],[8,22]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([26,LOS],[26,22]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:CB([88,QB_Y],[104,80],[120,78],[132,76]), c:CLR.screen,w:1.8,a:true,dsh:true},
    ],
  },
  {
    id:39, name:'Swing', label:'Swing', cat:'screen',
    sk:[...GUN_OPTION],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y],[136,QB_Y],[164,76],[174,70]), c:CLR.screen,w:2.2,a:true},
      {d:CB([88,QB_Y+8],[128,QB_Y+6],[162,76],[174,70]), c:CLR.screen,w:1.8,a:true,dsh:true},
      {d:CB([180,LOS],[192,40],[182,20],[168,18]), c:CLR.pass,w:1.8,a:true},
      {d:P([162,LOS],[162,30]), c:CLR.pass,w:1.5,a:true},
      {d:P([8,LOS],[8,22]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:40, name:'TEScreen', label:'TE Screen', cat:'screen',
    sk:[...GUN_OPTION],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,LOS],[102,62],[104,56],[108,54]), c:CLR.screen,w:2.2,a:true},
      {d:CB([88,QB_Y+8],[96,78],[102,64],[108,54]), c:CLR.screen,w:1.8,a:true,dsh:true},
      {d:CB([110,LOS],[116,66],[122,58],[128,54]), c:CLR.block,w:1.5,a:true},
      {d:CB([100,LOS],[96,66],[90,60],[84,56]), c:CLR.block,w:1.5,a:true},
      {d:P([8,LOS],[8,22]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([180,LOS],[180,22]), c:CLR.pass,w:1,a:true,dsh:true},
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

      {OL_X.map((x, i) => <Player key={i} x={x} y={LOS} t="OL" large={large} />)}

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
    {c:CLR.read,l:'Read Key'},
    {c:CLR.pitch,l:'Pitch Phase'},
    {c:CLR.pull,l:'Pull'},
    {c:CLR.block,l:'Lead/Block'},
    {c:CLR.motion,l:'Rocket Motion'},
  ],
  pa: [
    {c:CLR.pa,l:'PA Route'},
    {c:CLR.qbmove,l:'Fake / Boot'},
    {c:CLR.protect,l:'Protection'},
  ],
  screen: [
    {c:CLR.screen,l:'Screen Path'},
    {c:CLR.block,l:'Escort / Release'},
    {c:CLR.qbmove,l:'QB Set'},
    {c:CLR.pass,l:'Clear Route'},
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
        boxShadow: hov ? `0 6px 24px ${meta.accent}28` : '0 2px 8px rgba(0,0,0,0.5)`,
      }}
    >
      <div style={{ position: 'relative' }}>
        <PlayField play={play} />
        <div style={{
          position: 'absolute', top: 6, right: 7,
          background: meta.accent + '22',
          border: `1px solid ${meta.accent}55`,
          borderRadius: 4, padding: '2px 5px',
          fontSize: 8, fontWeight: 800, letterSpacing: '1.5px',
          color: meta.accent, fontFamily: 'monospace',
        }}>
          {meta.short}
        </div>
        <div style={{
          position: 'absolute', top: 6, left: 7,
          color: 'rgba(255,255,255,0.22)', fontSize: 9,
          fontWeight: 700, fontFamily: 'monospace',
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
          color: '#ede8ff', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.3px', lineHeight: 1.3,
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
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
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
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #130a26 0%, #080412 100%)',
        border: `1px solid ${meta.accent}45`,
        borderRadius: 18,
        overflow: 'hidden',
        width: '100%',
        maxWidth: 440,
        boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${meta.accent}18`,
        animation: 'slideUp 0.2s ease',
      }}>
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
          <button onClick={onClose} style={{
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
          }}>
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
            {[['WR','#a78bfa'],['TE','#34d399'],['QB','#fbbf24'],['RB','#f87171'],['FB','#fb923c'],['OL','#8b9ab5']].map(([t,c]) => (
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
  { id:'all',    label:'All 40',      accent:'#94a3b8' },
  { id:'run',    label:'Runs (25)',   accent:'#ef4444' },
  { id:'pa',     label:'PA (10)',     accent:'#22c55e' },
  { id:'screen', label:'Screens (5)', accent:'#fbbf24' },
];

/* ── APP ─────────────────────────────────────── */
export default function ModernTripleOptionPlaybook() {
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
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(167,139,250,0.7))' }}>
            🏈
          </div>
          <div>
            <div style={{ color:'#ede8ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              MODERN TRIPLE OPTION
            </div>
            <div style={{ color:'#22c55e', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              READS · PITCH PHASE · GUN / FLEX HYBRID
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
        MODERN TRIPLE OPTION · 40 PLAYS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
