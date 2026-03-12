import { useState, useEffect } from "react";
import { LOS } from "./playbookConstants";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  run:     '#ef4444',
  pass:    '#a78bfa',
  pa:      '#22c55e',
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
  run:  { label: 'Runs',        short: 'RUN',  accent: '#ef4444', bg: '#ef444412' },
  pass: { label: 'Pass',        short: 'PASS', accent: '#a78bfa', bg: '#a78bfa12' },
  pa:   { label: 'Play Action', short: 'PA',   accent: '#22c55e', bg: '#22c55e12' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* ── FORMATION / ALIGNMENT HELPERS ───────────── */
const OL_X = [70, 80, 90, 100, 110];
const QB_Y = 92;
const RB_Y = 104;
const TE_Y = LOS;

const PRO_RIGHT = [
  {x:12,y:LOS,t:'WR'},
  {x:100,y:LOS,t:'TE'},
  {x:166,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:102,y:QB_Y+8,t:'RB'},
];

const PRO_LEFT = [
  {x:12,y:LOS,t:'WR'},
  {x:26,y:LOS,t:'WR'},
  {x:100,y:LOS,t:'TE'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:74,y:QB_Y+8,t:'RB'},
];

const TWINS = [
  {x:12,y:LOS,t:'WR'},
  {x:100,y:LOS,t:'TE'},
  {x:162,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:102,y:QB_Y+8,t:'RB'},
];

const DOUBLES = [
  {x:8,y:LOS,t:'WR'},
  {x:26,y:LOS,t:'WR'},
  {x:162,y:LOS,t:'WR'},
  {x:180,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:100,y:QB_Y,t:'RB'},
];

const I_PRO = [
  {x:12,y:LOS,t:'WR'},
  {x:100,y:LOS,t:'TE'},
  {x:176,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:88,y:98,t:'FB'},
  {x:88,y:104,t:'RB'},
];

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#ef4444','#a78bfa','#22c55e','#fb923c','#fbbf24',
  '#f472b6','#34d399','#64748b','#475569','#f87171','#10b981',
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ RUNS 1-10 ══════════════════════════════ */
  {
    id:1, name:'InsideZone', label:'Inside Zone', cat:'run',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[88,96],[88,76],[88,50]), c:CLR.run, w:2.8,a:true},
      {d:P([70,LOS],[68,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[79,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-10]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[101,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[112,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[104,LOS-7]), c:CLR.block,w:1,a:true},
      {d:P([12,LOS],[12,LOS-8]),   c:CLR.block,w:1,a:true},
      {d:P([176,LOS],[176,LOS-8]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:2, name:'OutsideZone', label:'Outside Zone', cat:'run',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[98,98],[118,78],[144,50]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[80,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:CB([88,98],[98,92],[124,76],[142,54]), c:CLR.block,w:1.6,a:true},
      {d:P([176,LOS],[180,LOS-8]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:3, name:'Duo', label:'Duo', cat:'run',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[88,96],[88,76],[88,48]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-10]),   c:CLR.block,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-10]),   c:CLR.block,w:1.8,a:true},
      {d:P([90,LOS],[90,LOS-10]),   c:CLR.block,w:1.8,a:true},
      {d:P([100,LOS],[100,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([110,LOS],[110,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([88,98],[88,72]),        c:CLR.block,w:1.4,a:true},
      {d:P([100,LOS],[106,LOS-8]),  c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:4, name:'Power', label:'Power', cat:'run',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[96,98],[110,78],[124,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([110,LOS],[104,LOS+8],[94,LOS+2],[88,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([88,98],[96,90],[114,74],[128,56]), c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:5, name:'Counter', label:'Counter', cat:'run',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[96,98],[114,80],[130,54]), c:CLR.run,w:2.8,a:true},
      {d:CB([110,LOS],[104,LOS+8],[94,LOS+2],[88,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([100,LOS],[96,LOS+8],[86,LOS+2],[82,LOS-8]),  c:CLR.pull,w:1.8,a:true},
      {d:CB([88,98],[96,90],[116,74],[132,56]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[70,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]),   c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:6, name:'Draw', label:'Draw', cat:'run',
    sk:[...PRO_RIGHT],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y+8],[96,96],[90,76],[90,48]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[68,LOS-7]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([12,LOS],[12,24]),      c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([180,LOS],[180,24]),    c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:7, name:'Toss', label:'Toss', cat:'run',
    sk:[...I_PRO],
    rt:[
      {d:QQ([88,QB_Y],[116,92],[142,88]), c:CLR.toss,w:1.5,a:true,dsh:true},
      {d:CB([88,104],[110,98],[138,72],[156,42]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,98],[104,92],[134,74],[150,48]), c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[82,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[94,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-6]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([176,LOS],[180,LOS-8]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:8, name:'Trap', label:'Trap', cat:'run',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[84,96],[82,76],[82,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([110,LOS],[104,LOS+8],[92,LOS+2],[86,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([88,98],[84,72]),       c:CLR.block,w:1.4,a:true},
    ],
  },
  {
    id:9, name:'Lead', label:'Lead', cat:'run',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[88,96],[88,78],[88,48]), c:CLR.run,w:2.8,a:true},
      {d:P([88,98],[88,70]),                   c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:10, name:'Stretch', label:'Stretch', cat:'run',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[100,98],[122,76],[144,48]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[80,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:CB([88,98],[98,92],[124,76],[142,54]), c:CLR.block,w:1.6,a:true},
      {d:P([176,LOS],[180,LOS-8]), c:CLR.block,w:1,a:true},
    ],
  },

  /* ═══ PASS 11-35 ═════════════════════════════ */
  {
    id:11, name:'FourVerts', label:'4 Verts', cat:'pass',
    sk:[...DOUBLES],
    rt:[
      {d:P([8,LOS],[8,12]),       c:CLR.pass,w:2.2,a:true},
      {d:P([26,LOS],[26,12]),     c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,12]),   c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,12]),   c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,QB_Y],[108,80],[118,74],[126,70]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:12, name:'NineEightNine', label:'989', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:P([12,LOS],[12,12]),                     c:CLR.pass,w:2.3,a:true},
      {d:CB([100,LOS],[100,40],[80,30],[56,28]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,14]),                   c:CLR.pass,w:2.3,a:true},
      {d:P([180,LOS],[180,26]),                   c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),               c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),            c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:13, name:'Mills', label:'Mills', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:P([12,LOS],[12,34],[84,34]),               c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[180,34],[158,20],[136,16]), c:CLR.pass,w:2.4,a:true},
      {d:P([166,LOS],[166,24]),                     c:CLR.pass,w:1.7,a:true},
      {d:P([100,LOS],[100,26]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),              c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:14, name:'Yankee', label:'Yankee', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:CB([12,LOS],[12,34],[34,20],[58,16]),      c:CLR.pass,w:2.4,a:true},
      {d:CB([180,LOS],[164,42],[120,30],[76,28]),   c:CLR.pass,w:2.4,a:true},
      {d:P([166,LOS],[166,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),              c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:15, name:'Dagger', label:'Dagger', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:P([12,LOS],[12,32],[96,32]),               c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[180,32],[148,22],[122,20]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,52],[144,52]),           c:CLR.pass,w:2,a:true},
      {d:P([100,LOS],[100,26]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:16, name:'Divide', label:'Divide', cat:'pass',
    sk:[...DOUBLES],
    rt:[
      {d:P([8,LOS],[8,18]),                       c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[26,38],[46,28],[68,24]),   c:CLR.pass,w:2.1,a:true},
      {d:CB([162,LOS],[162,38],[142,28],[120,24]), c:CLR.pass,w:2.1,a:true},
      {d:P([180,LOS],[180,18]),                   c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),               c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,QB_Y],[108,80],[118,74],[126,70]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:17, name:'Scissors', label:'Scissors', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:CB([166,LOS],[166,42],[184,30],[196,18]), c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[180,34],[160,22],[140,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([12,LOS],[12,26]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:18, name:'DoublePost', label:'Double Post', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:CB([12,LOS],[12,34],[30,22],[50,18]),      c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[180,34],[162,22],[142,18]),  c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,26]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),              c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:19, name:'DeepComeback', label:'Deep Comeback', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:P([12,LOS],[12,24]),                       c:CLR.pass,w:2.3,a:true},
      {d:P([166,LOS],[166,24]),                     c:CLR.pass,w:2.3,a:true},
      {d:P([180,LOS],[180,24]),                     c:CLR.pass,w:2.3,a:true},
      {d:P([100,LOS],[100,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),              c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:20, name:'SlotFade', label:'Slot Fade', cat:'pass',
    sk:[...DOUBLES],
    rt:[
      {d:P([26,LOS],[26,14]),                       c:CLR.pass,w:2.3,a:true},
      {d:P([162,LOS],[162,14]),                     c:CLR.pass,w:2.3,a:true},
      {d:P([8,LOS],[8,26]),                         c:CLR.pass,w:1.8,a:true},
      {d:P([180,LOS],[180,26]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,QB_Y],[108,80],[118,74],[126,70]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:21, name:'Sail', label:'Sail', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:CB([180,LOS],[192,40],[178,20],[162,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,50],[196,50]),           c:CLR.pass,w:2.2,a:true},
      {d:QQ([100,LOS],[118,66],[136,64]),          c:CLR.pass,w:2,a:true},
      {d:P([12,LOS],[12,24]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:22, name:'Smash', label:'Smash', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:CB([12,LOS],[6,40],[20,22],[32,20]),       c:CLR.pass,w:2.2,a:true},
      {d:P([100,LOS],[100,54],[100,58]),            c:CLR.pass,w:2.2,a:true},
      {d:CB([180,LOS],[188,40],[172,22],[160,20]),  c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,54],[166,58]),            c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:23, name:'PostWheel', label:'Post-Wheel', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:CB([12,LOS],[12,32],[34,20],[56,18]),      c:CLR.pass,w:2.2,a:true},
      {d:CB([102,QB_Y+8],[122,QB_Y],[144,76],[166,34]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,26]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([180,LOS],[180,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:24, name:'Flood', label:'Flood', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:CB([180,LOS],[192,34],[180,14],[162,12]),  c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,38],[148,38]),            c:CLR.pass,w:2.2,a:true},
      {d:QQ([100,LOS],[118,62],[136,70]),           c:CLR.pass,w:2.1,a:true},
      {d:P([12,LOS],[12,24]),                       c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[96,QB_Y+6]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:25, name:'DeepOver', label:'Deep Over', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:CB([180,LOS],[166,42],[128,30],[76,28]),   c:CLR.pass,w:2.4,a:true},
      {d:P([166,LOS],[166,18]),                     c:CLR.pass,w:2.2,a:true},
      {d:P([12,LOS],[12,24]),                       c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,26]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),              c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:26, name:'CurlFlat', label:'Curl-Flat', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:P([12,LOS],[12,50],[12,54]),               c:CLR.pass,w:2.2,a:true},
      {d:QQ([102,QB_Y+8],[118,84],[132,82]),        c:CLR.pass,w:1.4,a:true},
      {d:P([166,LOS],[166,28]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([180,LOS],[180,24]),                     c:CLR.pass,w:1.5,a:true},
      {d:P([100,LOS],[100,26]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:27, name:'China', label:'China', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:CB([180,LOS],[190,38],[176,30],[164,34]),  c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,52],[166,56]),            c:CLR.pass,w:2.2,a:true},
      {d:P([12,LOS],[12,26]),                       c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:28, name:'Dig', label:'Dig', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:P([180,LOS],[180,34],[128,34]),            c:CLR.pass,w:2.3,a:true},
      {d:P([166,LOS],[166,18]),                     c:CLR.pass,w:2.1,a:true},
      {d:P([12,LOS],[12,24]),                       c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),              c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:29, name:'Levels', label:'Levels', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:P([12,LOS],[12,36],[90,36]),               c:CLR.pass,w:2.2,a:true},
      {d:CB([100,LOS],[120,58],[146,58],[176,58]), c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([166,LOS],[166,42]),                     c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:30, name:'Drive', label:'Drive', cat:'pass',
    sk:[...PRO_RIGHT],
    rt:[
      {d:CB([12,LOS],[36,58],[78,56],[120,58]),     c:CLR.pass,w:2.2,a:true},
      {d:P([100,LOS],[100,26]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([166,LOS],[166,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([180,LOS],[180,26]),                     c:CLR.pass,w:1.5,a:true},
      {d:QQ([102,QB_Y+8],[118,84],[132,82]),        c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:31, name:'GoBender', label:'Go-Bender', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:P([12,LOS],[12,14]),                       c:CLR.pass,w:2.2,a:true},
      {d:CB([100,LOS],[100,34],[114,24],[128,16]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([180,LOS],[180,14]),                     c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:32, name:'Bench', label:'Bench', cat:'pass',
    sk:[...DOUBLES],
    rt:[
      {d:P([8,LOS],[8,50],[38,50]),                 c:CLR.pass,w:2.2,a:true},
      {d:P([26,LOS],[26,50],[56,50]),               c:CLR.pass,w:2.2,a:true},
      {d:P([162,LOS],[162,50],[132,50]),            c:CLR.pass,w:2.2,a:true},
      {d:P([180,LOS],[180,50],[150,50]),            c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,QB_Y],[108,80],[118,74],[126,70]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:33, name:'DeepCorner', label:'Deep Corner', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:CB([180,LOS],[192,38],[176,22],[156,18]),  c:CLR.pass,w:2.3,a:true},
      {d:P([166,LOS],[166,18]),                     c:CLR.pass,w:2.1,a:true},
      {d:P([12,LOS],[12,26]),                       c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:34, name:'Cross', label:'Cross', cat:'pass',
    sk:[...TWINS],
    rt:[
      {d:CB([180,LOS],[164,44],[118,36],[70,34]),   c:CLR.pass,w:2.4,a:true},
      {d:P([166,LOS],[166,18]),                     c:CLR.pass,w:2.1,a:true},
      {d:P([12,LOS],[12,24]),                       c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,26]),                     c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),              c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:35, name:'SwitchVert', label:'Switch Vert', cat:'pass',
    sk:[...DOUBLES],
    rt:[
      {d:CB([8,LOS],[8,44],[24,36],[32,24]),        c:CLR.pass,w:2.2,a:true},
      {d:CB([26,LOS],[26,54],[10,44],[8,24]),       c:CLR.pass,w:1.8,a:true},
      {d:CB([180,LOS],[180,44],[164,36],[156,24]),  c:CLR.pass,w:2.2,a:true},
      {d:CB([162,LOS],[162,54],[178,44],[180,24]),  c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },

  /* ═══ PLAY ACTION 36-40 ══════════════════════ */
  {
    id:36, name:'PAPost', label:'PA Post', cat:'pa',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[88,98],[94,92],[98,88]),      c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([88,98],[88,82]),                        c:CLR.protect,w:1.6,a:false},
      {d:CB([176,LOS],[176,34],[154,20],[132,16]), c:CLR.pa,w:2.5,a:true},
      {d:P([12,LOS],[12,28]),                       c:CLR.pa,w:1.8,a:true},
      {d:P([100,LOS],[100,26]),                     c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:37, name:'PAMills', label:'PA Mills', cat:'pa',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[88,98],[94,92],[98,88]),      c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([88,98],[88,82]),                        c:CLR.protect,w:1.6,a:false},
      {d:P([12,LOS],[12,34],[84,34]),               c:CLR.pa,w:2.2,a:true},
      {d:CB([176,LOS],[176,34],[154,20],[132,16]), c:CLR.pa,w:2.4,a:true},
      {d:P([100,LOS],[100,26]),                     c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:38, name:'PAYankee', label:'PA Yankee', cat:'pa',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[88,98],[94,92],[98,88]),      c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([88,98],[88,82]),                        c:CLR.protect,w:1.6,a:false},
      {d:CB([12,LOS],[12,34],[34,20],[58,16]),      c:CLR.pa,w:2.4,a:true},
      {d:CB([176,LOS],[160,42],[118,30],[76,28]),   c:CLR.pa,w:2.4,a:true},
      {d:P([100,LOS],[100,24]),                     c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:39, name:'PAFlood', label:'PA Flood', cat:'pa',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[88,98],[96,92],[108,88]),     c:CLR.qbmove,w:1.6,a:false,dsh:true},
      {d:CB([88,QB_Y],[108,92],[132,82],[150,72]),  c:CLR.qbmove,w:1.6,a:false,dsh:true},
      {d:CB([176,LOS],[188,34],[176,14],[158,12]),  c:CLR.pa,w:2.2,a:true},
      {d:P([100,LOS],[100,38],[136,38]),            c:CLR.pa,w:2.2,a:true},
      {d:QQ([12,LOS],[28,62],[44,70]),              c:CLR.pa,w:2.1,a:true},
      {d:P([70,LOS],[70,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:40, name:'PAShot', label:'PA Shot', cat:'pa',
    sk:[...I_PRO],
    rt:[
      {d:CB([88,104],[88,98],[94,92],[98,88]),      c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([88,98],[88,82]),                        c:CLR.protect,w:1.6,a:false},
      {d:CB([12,LOS],[12,30],[30,18],[50,14]),      c:CLR.pa,w:2.5,a:true},
      {d:CB([176,LOS],[176,30],[156,16],[134,12]),  c:CLR.pa,w:2.5,a:true},
      {d:P([100,LOS],[100,24]),                     c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                    c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
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
    {c:CLR.pull,l:'Pull'},
    {c:CLR.toss,l:'Toss/Pitch'},
    {c:CLR.block,l:'Lead/Block'},
  ],
  pass: [
    {c:CLR.pass,l:'Route'},
    {c:CLR.qbmove,l:'Drop'},
    {c:CLR.protect,l:'Protection'},
  ],
  pa: [
    {c:CLR.pa,l:'PA Route'},
    {c:CLR.qbmove,l:'Play Fake / Boot'},
    {c:CLR.protect,l:'Protection'},
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
  { id:'all',  label:'All 40',     accent:'#94a3b8' },
  { id:'run',  label:'Runs (10)',  accent:'#ef4444' },
  { id:'pass', label:'Pass (25)',  accent:'#a78bfa' },
  { id:'pa',   label:'PA (5)',     accent:'#22c55e' },
];

/* ── APP ─────────────────────────────────────── */
export default function VerticalPassingPlaybook() {
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
              VERTICAL PASSING
            </div>
            <div style={{ color:'#a78bfa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              SHOT PLAYS · DEEP DIGS · PLAY ACTION
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
        VERTICAL PASSING SYSTEM · 40 PLAYS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
