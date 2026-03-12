import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  run:     '#ef4444',
  pass:    '#a78bfa',
  playact: '#fb923c',
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
  pass:        { label: 'Dropback',    short: 'PASS', accent: '#a78bfa', bg: '#a78bfa12' },
  playaction:  { label: 'Play-Action', short: 'PA',   accent: '#fb923c', bg: '#fb923c12' },
  screen:      { label: 'Screens',     short: 'SCR',  accent: '#fbbf24', bg: '#fbbf2412' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* Coryell: under center / balanced pro spacing */
const QB_Y = 94;
const RB_Y = 108;
const TE_L = 64;
const TE_R = 172;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#ef4444','#a78bfa','#fb923c','#fbbf24',
  '#f472b6','#34d399','#64748b','#475569','#f87171','#10b981',
];

/* ── FORMATION HELPERS ───────────────────────── */
const PRO_SKILL = [
  {x:18,y:LOS,t:'WR'},
  {x:64,y:LOS,t:'TE'},
  {x:88,y:QB_Y,t:'QB'},
  {x:88,y:RB_Y,t:'RB'},
  {x:172,y:LOS,t:'TE'},
  {x:188,y:LOS,t:'WR'},
];

const STRONG_I_SKILL = [
  {x:18,y:LOS,t:'WR'},
  {x:64,y:LOS,t:'TE'},
  {x:88,y:QB_Y,t:'QB'},
  {x:96,y:100,t:'FB'},
  {x:88,y:RB_Y,t:'RB'},
  {x:172,y:LOS,t:'TE'},
  {x:188,y:LOS,t:'WR'},
];

const SLOT_RIGHT_SKILL = [
  {x:18,y:LOS,t:'WR'},
  {x:64,y:LOS,t:'TE'},
  {x:88,y:QB_Y,t:'QB'},
  {x:88,y:RB_Y,t:'RB'},
  {x:162,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
];

const DOUBLES_SKILL = [
  {x:18,y:LOS,t:'WR'},
  {x:34,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:100,y:QB_Y,t:'RB'},
  {x:166,y:LOS,t:'WR'},
  {x:182,y:LOS,t:'WR'},
];

const TRIPS_RIGHT_SKILL = [
  {x:18,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:100,y:QB_Y,t:'RB'},
  {x:148,y:LOS,t:'WR'},
  {x:166,y:LOS,t:'WR'},
  {x:182,y:LOS,t:'WR'},
];

const TIGHT_PRO_SKILL = [
  {x:22,y:LOS,t:'WR'},
  {x:72,y:LOS,t:'TE'},
  {x:88,y:QB_Y,t:'QB'},
  {x:88,y:RB_Y,t:'RB'},
  {x:104,y:LOS,t:'TE'},
  {x:182,y:LOS,t:'WR'},
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ RUNS 1-10 ══════════════════════════════ */
  {
    id:1, name:'Inside_Zone', label:'Inside Zone', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      {d:CB([88,RB_Y],[86,102],[82,86],[80,50]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[66,LOS-7]),  c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-9]),c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-7]),c:CLR.block,w:1.2,a:true},
      {d:P([64,LOS],[60,LOS-8]),  c:CLR.block,w:1,a:true},
      {d:P([172,LOS],[176,LOS-8]),c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:2, name:'Outside_Zone', label:'Outside Zone', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      {d:CB([88,RB_Y],[96,102],[118,90],[150,56]),c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[78,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[90,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[100,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[112,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[124,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([172,LOS],[184,LOS-5]), c:CLR.block,w:1.1,a:true},
    ],
  },
  {
    id:3, name:'Duo', label:'Duo', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      {d:CB([88,RB_Y],[88,102],[88,82],[88,50]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-11]),   c:CLR.block,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-11]),   c:CLR.block,w:1.8,a:true},
      {d:P([90,LOS],[90,LOS-11]),   c:CLR.block,w:1.8,a:true},
      {d:P([100,LOS],[100,LOS-11]), c:CLR.block,w:1.8,a:true},
      {d:P([110,LOS],[110,LOS-11]), c:CLR.block,w:1.8,a:true},
      {d:P([64,LOS],[60,LOS-9]),    c:CLR.block,w:1.1,a:true},
      {d:P([172,LOS],[176,LOS-9]),  c:CLR.block,w:1.1,a:true},
    ],
  },
  {
    id:4, name:'Power', label:'Power', cat:'run',
    sk:[...STRONG_I_SKILL],
    rt:[
      {d:CB([88,RB_Y],[88,100],[94,84],[102,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[92,LOS+2],[100,LOS-8]), c:CLR.pull,w:1.9,a:true},
      {d:P([96,100],[100,80]),     c:CLR.block,w:1.5,a:true},
      {d:P([80,LOS],[80,LOS-10]),  c:CLR.block,w:1.3,a:true},
      {d:P([90,LOS],[90,LOS-10]),  c:CLR.block,w:1.3,a:true},
      {d:P([100,LOS],[100,LOS-10]),c:CLR.block,w:1.3,a:true},
      {d:P([110,LOS],[110,LOS-8]), c:CLR.block,w:1.3,a:true},
    ],
  },
  {
    id:5, name:'Counter_OF', label:'Counter OF', cat:'run',
    sk:[...STRONG_I_SKILL],
    rt:[
      {d:CB([88,RB_Y],[84,102],[72,88],[56,54]), c:CLR.run,w:2.8,a:true},
      {d:P([96,100],[76,82]),      c:CLR.pull,w:1.7,a:true},
      {d:CB([110,LOS],[104,LOS+8],[84,LOS+4],[70,LOS-8]), c:CLR.pull,w:1.7,a:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:6, name:'Draw_Gun', label:'Draw (Gun)', cat:'run',
    sk:[
      {x:18,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
      {x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:88,t:'QB'},{x:100,y:88,t:'RB'},
    ],
    rt:[
      {d:P([88,88],[88,96]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,88],[96,82],[90,66],[88,48]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([18,LOS],[18,24]),      c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([182,LOS],[182,24]),    c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:7, name:'Stretch_Weak', label:'Stretch Weak', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      {d:CB([88,RB_Y],[80,102],[58,90],[28,58]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[62,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[70,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[80,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[90,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[98,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([64,LOS],[48,LOS-6]),   c:CLR.block,w:1.1,a:true},
    ],
  },
  {
    id:8, name:'Lead_Strong', label:'Lead Strong', cat:'run',
    sk:[...STRONG_I_SKILL],
    rt:[
      {d:CB([88,RB_Y],[90,102],[96,86],[100,52]), c:CLR.run,w:2.8,a:true},
      {d:P([96,100],[102,80]),     c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[72,LOS-7]),   c:CLR.block,w:1.3,a:true},
      {d:P([80,LOS],[82,LOS-9]),   c:CLR.block,w:1.3,a:true},
      {d:P([90,LOS],[90,LOS-10]),  c:CLR.block,w:1.3,a:true},
      {d:P([100,LOS],[98,LOS-9]),  c:CLR.block,w:1.3,a:true},
      {d:P([110,LOS],[108,LOS-7]), c:CLR.block,w:1.3,a:true},
    ],
  },
  {
    id:9, name:'Toss_Crack', label:'Toss Crack', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      {d:QQ([88,QB_Y],[122,96],[166,90]), c:CLR.toss,w:1.5,a:true,dsh:true},
      {d:CB([166,90],[178,72],[188,56],[192,36]), c:CLR.run,w:2.8,a:true},
      {d:CB([188,LOS],[176,60],[164,54],[154,52]), c:CLR.block,w:1.5,a:true},
      {d:P([172,LOS],[184,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[110,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[122,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([64,LOS],[64,LOS-8]),   c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:10, name:'Delay_Trap', label:'Delay Trap', cat:'run',
    sk:[...PRO_SKILL],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+7]), c:CLR.qbmove,w:1.4,a:false,dsh:true},
      {d:CB([88,RB_Y],[86,102],[82,88],[82,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([100,LOS],[94,LOS+8],[86,LOS+2],[84,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },

  /* ═══ DROPBACK PASS 11-30 ════════════════════ */
  {
    id:11, name:'989', label:'989 (Go/Go/Go)', cat:'pass',
    sk:[...TRIPS_RIGHT_SKILL],
    rt:[
      {d:P([18,LOS],[18,12]),   c:CLR.pass,w:2.3,a:true},
      {d:P([148,LOS],[148,12]), c:CLR.pass,w:2.3,a:true},
      {d:P([166,LOS],[166,12]), c:CLR.pass,w:2.3,a:true},
      {d:P([182,LOS],[182,12]), c:CLR.pass,w:2.3,a:true},
      {d:QQ([100,QB_Y],[118,80],[132,76]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:12, name:'Mills', label:'Mills (Post-Dig)', cat:'pass',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:CB([18,LOS],[18,34],[42,20],[68,16]), c:CLR.pass,w:2.3,a:true},
      {d:P([162,LOS],[162,30],[118,30]),       c:CLR.pass,w:2.3,a:true},
      {d:P([180,LOS],[180,24]),                c:CLR.pass,w:1.8,a:true},
      {d:P([64,LOS],[64,54],[64,58]),          c:CLR.pass,w:1.8,a:true},
      {d:QQ([88,RB_Y],[104,92],[124,90]),      c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),             c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:13, name:'Yankee', label:'Yankee (Post-Cross)', cat:'pass',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:CB([18,LOS],[18,34],[42,18],[72,14]), c:CLR.pass,w:2.4,a:true},
      {d:CB([162,LOS],[162,42],[126,34],[78,34]), c:CLR.pass,w:2.3,a:true},
      {d:P([180,LOS],[180,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([64,LOS],[64,26]),   c:CLR.pass,w:1.6,a:true},
      {d:QQ([88,RB_Y],[104,92],[124,90]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:14, name:'Dagger', label:'Dagger', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([18,LOS],[18,30],[86,30]),            c:CLR.pass,w:2.2,a:true},
      {d:CB([34,LOS],[34,44],[62,28],[92,22]),   c:CLR.pass,w:2.3,a:true},
      {d:CB([182,LOS],[182,34],[152,20],[124,16]), c:CLR.pass,w:2,a:true},
      {d:P([166,LOS],[166,50],[142,50]),         c:CLR.pass,w:2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),               c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[118,82],[132,80]),       c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:15, name:'Levels', label:'Levels', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([18,LOS],[18,34],[92,34]),      c:CLR.pass,w:2.2,a:true},
      {d:CB([34,LOS],[48,54],[76,56],[102,56]), c:CLR.pass,w:2.2,a:true},
      {d:P([182,LOS],[182,24]),            c:CLR.pass,w:1.8,a:true},
      {d:P([166,LOS],[166,42]),            c:CLR.pass,w:1.6,a:true},
      {d:QQ([100,QB_Y],[118,82],[132,78]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),         c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:16, name:'Deep_Comeback', label:'Deep Comeback', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([18,LOS],[18,24],[18,28],[30,28]), c:CLR.pass,w:2.3,a:true},
      {d:P([34,LOS],[34,24],[34,28],[46,28]), c:CLR.pass,w:2.1,a:true},
      {d:P([166,LOS],[166,24],[166,28],[154,28]), c:CLR.pass,w:2.1,a:true},
      {d:P([182,LOS],[182,24],[182,28],[170,28]), c:CLR.pass,w:2.3,a:true},
      {d:QQ([100,QB_Y],[118,80],[132,76]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:17, name:'FourVerts_Switch', label:'4 Verts Switch', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([18,LOS],[18,44],[34,34],[42,18]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([34,LOS],[34,54],[16,42],[10,18]),   c:CLR.pass,w:1.8,a:true},
      {d:CB([182,LOS],[182,44],[166,34],[158,18]), c:CLR.pass,w:2.2,a:true},
      {d:CB([166,LOS],[166,54],[184,42],[190,18]), c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),              c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[118,80],[132,76]),       c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:18, name:'Scissors', label:'Scissors', cat:'pass',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:CB([162,LOS],[162,34],[146,20],[130,16]), c:CLR.pass,w:2.3,a:true},
      {d:CB([180,LOS],[188,40],[172,22],[154,18]), c:CLR.pass,w:2.3,a:true},
      {d:P([18,LOS],[18,24]),  c:CLR.pass,w:1.7,a:true},
      {d:P([64,LOS],[64,48],[96,48]), c:CLR.pass,w:1.8,a:true},
      {d:QQ([88,RB_Y],[104,92],[122,88]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:19, name:'Sail_Flood', label:'Sail Flood', cat:'pass',
    sk:[...TRIPS_RIGHT_SKILL],
    rt:[
      {d:CB([182,LOS],[194,40],[178,20],[162,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,48],[196,48]),          c:CLR.pass,w:2.2,a:true},
      {d:QQ([148,LOS],[162,60],[176,58]),         c:CLR.pass,w:2,a:true},
      {d:P([18,LOS],[18,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:QQ([100,QB_Y],[118,80],[132,76]),        c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),               c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:20, name:'Smash', label:'Smash', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([18,LOS],[10,40],[22,22],[36,18]),   c:CLR.pass,w:2.2,a:true},
      {d:P([34,LOS],[34,54],[34,58]),            c:CLR.pass,w:2.2,a:true},
      {d:CB([182,LOS],[190,40],[178,22],[164,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,54],[166,58]),         c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),               c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[118,82],[132,80]),       c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:21, name:'Drive', label:'Drive', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([34,LOS],[52,50],[84,48],[116,50]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([166,LOS],[148,46],[114,44],[80,46]), c:CLR.pass,w:2.2,a:true},
      {d:P([18,LOS],[18,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([182,LOS],[182,24]),                   c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[118,82],[132,80]),        c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:22, name:'Shallow_Cross', label:'Shallow Cross', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([18,LOS],[42,58],[86,56],[132,58]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([182,LOS],[158,44],[112,42],[76,44]), c:CLR.pass,w:2.2,a:true},
      {d:P([34,LOS],[34,26]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([166,LOS],[166,26]),                   c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[118,82],[132,80]),        c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:23, name:'Mesh', label:'Mesh', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([34,LOS],[52,60],[82,58],[112,60]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([166,LOS],[148,58],[118,56],[84,58]), c:CLR.pass,w:2.2,a:true},
      {d:P([18,LOS],[18,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:CB([182,LOS],[192,42],[180,22],[166,20]),c:CLR.pass,w:1.8,a:true},
      {d:QQ([100,QB_Y],[116,80],[128,76]),        c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:24, name:'Post_Wheel', label:'Post-Wheel', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([34,LOS],[34,32],[50,20],[68,18]), c:CLR.pass,w:2.2,a:true},
      {d:CB([18,LOS],[18,LOS+4],[38,LOS+14],[48,36]), c:CLR.pass,w:2.2,a:true},
      {d:CB([166,LOS],[166,32],[150,20],[132,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([182,LOS],[182,26]), c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[116,80],[128,76]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:25, name:'Divide', label:'Divide', cat:'pass',
    sk:[...TRIPS_RIGHT_SKILL],
    rt:[
      {d:P([148,LOS],[148,18]),                     c:CLR.pass,w:2.2,a:true},
      {d:CB([166,LOS],[166,34],[154,22],[142,18]), c:CLR.pass,w:2.1,a:true},
      {d:CB([182,LOS],[182,34],[194,22],[198,18]), c:CLR.pass,w:2.1,a:true},
      {d:P([18,LOS],[18,24]),                       c:CLR.pass,w:1.7,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[118,80],[132,76]),          c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:26, name:'Deep_Over', label:'Deep Over', cat:'pass',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:CB([18,LOS],[18,42],[56,34],[116,30]), c:CLR.pass,w:2.3,a:true},
      {d:CB([162,LOS],[162,32],[146,20],[128,16]), c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([64,LOS],[64,24]),   c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([88,RB_Y],[104,92],[122,88]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:27, name:'ThreeLevel_Flood', label:'3-Level Flood', cat:'pass',
    sk:[...TRIPS_RIGHT_SKILL],
    rt:[
      {d:CB([182,LOS],[194,40],[178,20],[162,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,48],[196,48]),          c:CLR.pass,w:2.2,a:true},
      {d:QQ([148,LOS],[162,62],[178,60]),         c:CLR.pass,w:2,a:true},
      {d:P([18,LOS],[18,30]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),               c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[118,80],[132,76]),        c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:28, name:'Slot_Fade', label:'Slot Fade', cat:'pass',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:CB([162,LOS],[170,40],[176,22],[182,14]), c:CLR.pass,w:2.3,a:true},
      {d:P([180,LOS],[180,26]),                   c:CLR.pass,w:2,a:true},
      {d:P([18,LOS],[18,54],[18,58]),             c:CLR.pass,w:2,a:true},
      {d:P([64,LOS],[64,48],[92,48]),             c:CLR.pass,w:1.7,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([88,RB_Y],[104,92],[122,88]),         c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:29, name:'Double_Post', label:'Double Post', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:CB([18,LOS],[18,34],[40,20],[64,16]),    c:CLR.pass,w:2.3,a:true},
      {d:CB([34,LOS],[34,34],[52,22],[72,18]),    c:CLR.pass,w:2.1,a:true},
      {d:CB([166,LOS],[166,34],[148,22],[128,18]),c:CLR.pass,w:2.1,a:true},
      {d:CB([182,LOS],[182,34],[160,20],[136,16]),c:CLR.pass,w:2.3,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),               c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[118,80],[132,76]),        c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:30, name:'Deep_Curl_Flat', label:'Deep Curl/Flat', cat:'pass',
    sk:[...DOUBLES_SKILL],
    rt:[
      {d:P([18,LOS],[18,28],[18,32]),   c:CLR.pass,w:2.2,a:true},
      {d:QQ([34,LOS],[42,60],[52,62]),  c:CLR.pass,w:2,a:true},
      {d:P([182,LOS],[182,28],[182,32]),c:CLR.pass,w:2.2,a:true},
      {d:QQ([166,LOS],[158,60],[148,62]),c:CLR.pass,w:2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),      c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:QQ([100,QB_Y],[118,82],[132,80]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },

  /* ═══ PLAY-ACTION 31-35 ═════════════════════ */
  {
    id:31, name:'PA_Post_Dig', label:'PA Post-Dig', cat:'playaction',
    sk:[...STRONG_I_SKILL],
    rt:[
      {d:CB([18,LOS],[18,34],[42,20],[68,16]), c:CLR.pass,w:2.3,a:true},
      {d:P([188,LOS],[188,30],[136,30]),       c:CLR.pass,w:2.3,a:true},
      {d:P([64,LOS],[64,24]),                  c:CLR.pass,w:1.7,a:true},
      {d:P([172,LOS],[172,24]),                c:CLR.pass,w:1.7,a:true},
      {d:CB([88,RB_Y],[90,100],[98,94],[108,92]), c:CLR.playact,w:1.8,a:false,dsh:true},
      {d:P([96,100],[102,88]), c:CLR.protect,w:1.3,a:false},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:32, name:'PA_Yankee', label:'PA Yankee', cat:'playaction',
    sk:[...STRONG_I_SKILL],
    rt:[
      {d:CB([18,LOS],[18,34],[42,18],[72,14]), c:CLR.pass,w:2.4,a:true},
      {d:CB([172,LOS],[172,42],[132,34],[80,34]), c:CLR.pass,w:2.3,a:true},
      {d:P([188,LOS],[188,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([64,LOS],[64,24]),   c:CLR.pass,w:1.7,a:true},
      {d:CB([88,RB_Y],[90,100],[98,94],[108,92]), c:CLR.playact,w:1.8,a:false,dsh:true},
      {d:P([96,100],[102,88]), c:CLR.protect,w:1.3,a:false},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:33, name:'PA_Deep_Over', label:'PA Deep Over', cat:'playaction',
    sk:[...STRONG_I_SKILL],
    rt:[
      {d:CB([18,LOS],[18,42],[56,34],[118,30]), c:CLR.pass,w:2.3,a:true},
      {d:CB([172,LOS],[172,32],[154,20],[134,16]), c:CLR.pass,w:2.2,a:true},
      {d:P([188,LOS],[188,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([64,LOS],[64,24]),   c:CLR.pass,w:1.7,a:true},
      {d:CB([88,RB_Y],[90,100],[98,94],[108,92]), c:CLR.playact,w:1.8,a:false,dsh:true},
      {d:P([96,100],[102,88]), c:CLR.protect,w:1.3,a:false},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:34, name:'PA_Sail', label:'PA Sail', cat:'playaction',
    sk:[...TRIPS_RIGHT_SKILL],
    rt:[
      {d:CB([182,LOS],[194,40],[178,20],[162,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,48],[196,48]),          c:CLR.pass,w:2.2,a:true},
      {d:QQ([148,LOS],[162,60],[178,58]),         c:CLR.pass,w:2,a:true},
      {d:P([18,LOS],[18,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:CB([100,QB_Y],[104,90],[112,82],[122,78]), c:CLR.playact,w:1.8,a:false,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),               c:CLR.qbmove,w:1.4,a:false,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:35, name:'PA_Boot_Shot', label:'PA Boot Shot', cat:'playaction',
    sk:[...TIGHT_PRO_SKILL],
    rt:[
      {d:CB([182,LOS],[194,38],[178,16],[156,12]), c:CLR.pass,w:2.5,a:true},
      {d:CB([72,LOS],[62,56],[40,74],[20,80]),     c:CLR.pass,w:2.2,a:true},
      {d:QQ([104,LOS],[122,62],[140,60]),          c:CLR.pass,w:1.8,a:true},
      {d:CB([88,QB_Y],[72,96],[56,88],[42,82]),    c:CLR.qbmove,w:1.6,a:true,dsh:true},
      {d:CB([88,RB_Y],[96,100],[108,94],[118,92]), c:CLR.playact,w:1.8,a:false,dsh:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
    ],
  },

  /* ═══ SCREENS 36-40 ══════════════════════════ */
  {
    id:36, name:'RB_Slip', label:'RB Slip', cat:'screen',
    sk:[...PRO_SKILL],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([88,RB_Y],[118,96],[150,78],[170,72]), c:CLR.sit,w:2.2,a:true},
      {d:CB([88,QB_Y+8],[120,96],[152,78],[170,72]), c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:CB([100,LOS],[116,70],[136,70],[152,72]), c:CLR.block,w:1.5,a:true},
      {d:CB([110,LOS],[126,68],[146,70],[160,72]), c:CLR.block,w:1.5,a:true},
      {d:P([18,LOS],[18,26]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([188,LOS],[188,26]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:37, name:'Middle_Screen', label:'Middle Screen', cat:'screen',
    sk:[...PRO_SKILL],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([88,RB_Y],[88,RB_Y+2],[90,100],[92,96]), c:CLR.sit,w:2,a:true},
      {d:CB([88,QB_Y+10],[88,100],[90,98],[92,96]), c:CLR.sit,w:1.5,a:true,dsh:true},
      {d:CB([92,96],[88,78],[88,62],[88,50]), c:CLR.sit,w:2.2,a:true},
      {d:CB([80,LOS],[84,66],[88,58],[94,56]), c:CLR.block,w:1.5,a:true},
      {d:CB([100,LOS],[96,66],[94,58],[90,56]), c:CLR.block,w:1.5,a:true},
      {d:P([18,LOS],[18,24]),  c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([188,LOS],[188,24]),c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:38, name:'WR_Tunnel', label:'WR Tunnel', cat:'screen',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+6]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([18,LOS],[22,70],[28,78],[34,82]), c:CLR.sit,w:2.2,a:true},
      {d:CB([88,QB_Y+6],[62,86],[46,84],[34,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:CB([64,LOS],[54,66],[44,74],[38,78]), c:CLR.block,w:1.5,a:true},
      {d:CB([70,LOS],[58,64],[48,70],[40,74]), c:CLR.block,w:1.3,a:true},
      {d:P([162,LOS],[162,26]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([180,LOS],[180,26]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:39, name:'TE_Delay', label:'TE Delay', cat:'screen',
    sk:[...PRO_SKILL],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([64,LOS],[64,LOS-8]),   c:CLR.protect,w:1.2,a:false},
      {d:CB([64,LOS-8],[72,72],[92,68],[118,64]), c:CLR.sit,w:2.2,a:true,dsh:true},
      {d:CB([88,QB_Y+8],[94,86],[104,76],[118,64]), c:CLR.sit,w:1.6,a:true,dsh:true},
      {d:CB([80,LOS],[86,70],[98,66],[108,64]), c:CLR.block,w:1.5,a:true},
      {d:CB([90,LOS],[96,68],[106,66],[114,64]), c:CLR.block,w:1.4,a:true},
      {d:P([188,LOS],[188,24]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([18,LOS],[18,24]),   c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:40, name:'Bubble', label:'Bubble', cat:'screen',
    sk:[...SLOT_RIGHT_SKILL],
    rt:[
      {d:QQ([162,LOS],[150,72],[138,78]), c:CLR.sit,w:2.2,a:true},
      {d:QQ([180,LOS],[168,72],[154,78]), c:CLR.block,w:1.5,a:true},
      {d:P([88,QB_Y],[104,QB_Y-6]), c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:P([18,LOS],[18,26]), c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([64,LOS],[64,30]), c:CLR.pass,w:1.4,a:true,dsh:true},
      {d:CB([88,RB_Y],[94,96],[104,92],[114,90]), c:CLR.protect,w:1.2,a:false},
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

      <line x1={0} y1={LOS} x2={200} y2={LOS}
            stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} />

      {play.rt.map((r, i) => <Route key={i} {...r} />)}
      {olX.map((x, i) => <Player key={i} x={x} y={LOS} t="OL" large={large} />)}
      {play.sk.map((p, i) => <Player key={i} x={p.x} y={p.y} t={p.t} large={large} />)}

      <ellipse cx={88} cy={LOS - 1} rx={3.5} ry={2.2}
               fill="#c97b2a" stroke="#f59e2e" strokeWidth={0.6} />
    </svg>
  );
}

/* ── LEGENDS ─────────────────────────────────── */
const LEGENDS = {
  run: [
    {c:CLR.run,l:'Ball Carrier'},
    {c:CLR.pull,l:'Pull'},
    {c:CLR.toss,l:'Toss/Pitch'},
    {c:CLR.block,l:'Block'},
  ],
  pass: [
    {c:CLR.pass,l:'Route'},
    {c:CLR.qbmove,l:'QB Drop'},
    {c:CLR.protect,l:'Check/Protect'},
  ],
  playaction: [
    {c:CLR.pass,l:'Route'},
    {c:CLR.playact,l:'Run Action'},
    {c:CLR.qbmove,l:'Boot/Set'},
    {c:CLR.protect,l:'Protection'},
  ],
  screen: [
    {c:CLR.sit,l:'Screen Path'},
    {c:CLR.block,l:'Escort'},
    {c:CLR.qbmove,l:'QB Set'},
    {c:CLR.pass,l:'Clearout'},
  ],
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

        <div style={{ background: '#060010', padding: '0 0 4px' }}>
          <PlayField play={play} large={true} />
        </div>

        <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${meta.accent}20` }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,0.28)', marginBottom: 8, fontFamily: 'monospace',
          }}>LEGEND</div>
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
  { id:'all',        label:'All 40',         accent:'#94a3b8' },
  { id:'run',        label:'Runs (10)',      accent:'#ef4444' },
  { id:'pass',       label:'Dropback (20)',  accent:'#a78bfa' },
  { id:'playaction', label:'PA (5)',         accent:'#fb923c' },
  { id:'screen',     label:'Screens (5)',    accent:'#fbbf24' },
];

/* ── APP ─────────────────────────────────────── */
export default function CoryellPlaybook() {
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
              AIR CORYELL
            </div>
            <div style={{ color:'#a78bfa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              VERTICAL STRESS · DEEP SHOTS · PLAY-ACTION
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
        borderTop: '1px solid #120622',
        color: 'rgba(255,255,255,0.12)',
        fontSize: 9, letterSpacing: '2px',
      }}>
        CORYELL SYSTEM · 40 PLAYS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
