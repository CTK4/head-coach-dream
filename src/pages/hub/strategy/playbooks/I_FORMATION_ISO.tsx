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
const P  = (...pts) => pts.map((p,i) => `${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s,c,e)  => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* I-Formation spacing */
const QB_Y = 92;
const FB_Y = 100;
const RB_Y = 110;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#ef4444','#a78bfa','#22c55e','#fbbf24',
  '#f472b6','#34d399','#64748b','#475569','#f87171','#10b981',
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ RUNS 1-20 ══════════════════════════════ */
  {
    id:1, name:'IsoStrong', label:'Iso Strong', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[100,98],[98,78],[98,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[94,88],[94,70],[94,52]),   c:CLR.block,w:1.8,a:true},
      {d:P([58,LOS],[58,LOS-10]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.3,a:true},
      {d:P([80,LOS],[80,LOS-10]), c:CLR.block,w:1.3,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.block,w:1.3,a:true},
      {d:P([100,LOS],[100,LOS-10]), c:CLR.block,w:1.3,a:true},
      {d:P([110,LOS],[110,LOS-10]), c:CLR.block,w:1.3,a:true},
    ],
  },
  {
    id:2, name:'IsoWeak', label:'Iso Weak', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:82,y:FB_Y,t:'FB'},{x:96,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([96,RB_Y],[94,98],[90,78],[88,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([82,FB_Y],[84,88],[86,70],[86,52]), c:CLR.block,w:1.8,a:true},
      {d:P([58,LOS],[54,LOS-10]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[66,LOS-10]), c:CLR.block,w:1.3,a:true},
      {d:P([80,LOS],[78,LOS-10]), c:CLR.block,w:1.3,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.block,w:1.3,a:true},
      {d:P([100,LOS],[102,LOS-10]), c:CLR.block,w:1.3,a:true},
      {d:P([110,LOS],[112,LOS-10]), c:CLR.block,w:1.3,a:true},
    ],
  },
  {
    id:3, name:'LeadToss', label:'Lead Toss', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:QQ([88,QB_Y],[126,96],[156,90]), c:CLR.toss,w:1.5,a:true,dsh:true},
      {d:CB([156,90],[170,66],[182,46],[192,30]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[118,88],[144,72],[164,52]), c:CLR.block,w:1.8,a:true},
      {d:P([58,LOS],[70,LOS-6]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[82,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([80,LOS],[94,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([90,LOS],[106,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([100,LOS],[118,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([176,LOS],[176,LOS-9]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:4, name:'PowerI', label:'Power I', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[102,96],[104,76],[104,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[100,88],[104,72],[108,54]), c:CLR.block,w:1.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[96,LOS+2],[104,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([58,LOS],[58,LOS-9]), c:CLR.block,w:1.4,a:true},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:5, name:'CounterI', label:'Counter I', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[100,98],[96,78],[94,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[90,92],[88,74],[88,54]),   c:CLR.block,w:1.7,a:true},
      {d:CB([80,LOS],[86,LOS+8],[96,LOS+2],[100,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([70,LOS],[76,LOS+6],[94,LOS+2],[100,LOS-6]), c:CLR.pull,w:1.5,a:true},
      {d:P([58,LOS],[58,LOS-9]), c:CLR.block,w:1.3,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:6, name:'Stretch', label:'Stretch', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[110,98],[128,78],[150,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[114,92],[136,74],[154,56]),  c:CLR.block,w:1.7,a:true},
      {d:P([58,LOS],[70,LOS-6]), c:CLR.block,w:1.4,a:true},
      {d:P([70,LOS],[82,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[102,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[112,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[122,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:7, name:'Trap', label:'Trap', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:100,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([100,RB_Y],[94,98],[86,78],[86,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[84,LOS+2],[86,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([94,FB_Y],[88,90],[86,72],[86,54]), c:CLR.block,w:1.7,a:true},
      {d:P([58,LOS],[58,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:8, name:'Duo', label:'Duo', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:88,y:FB_Y,t:'FB'},{x:88,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([88,RB_Y],[88,98],[88,76],[88,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,FB_Y],[88,90],[88,72],[88,54]), c:CLR.block,w:1.8,a:true},
      {d:P([58,LOS],[58,LOS-10]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([100,LOS],[100,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([110,LOS],[110,LOS-10]), c:CLR.block,w:1.8,a:true},
    ],
  },
  {
    id:9, name:'CounterTrey', label:'Counter Trey', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[100,98],[96,78],[94,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[100,92],[102,74],[102,54]), c:CLR.block,w:1.7,a:true},
      {d:CB([80,LOS],[86,LOS+8],[96,LOS+2],[100,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([70,LOS],[76,LOS+6],[94,LOS+2],[100,LOS-6]), c:CLR.pull,w:1.5,a:true},
      {d:P([58,LOS],[58,LOS-9]), c:CLR.block,w:1.4,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:10, name:'FullbackDive', label:'Fullback Dive', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:88,y:FB_Y,t:'FB'},{x:100,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([88,FB_Y],[88,88],[88,70],[88,50]), c:CLR.run,w:2.8,a:true},
      {d:P([100,RB_Y],[110,100]), c:CLR.protect,w:1.5,a:false},
      {d:P([58,LOS],[58,LOS-10]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.4,a:true},
      {d:P([80,LOS],[80,LOS-10]), c:CLR.block,w:1.4,a:true},
      {d:P([90,LOS],[90,LOS-10]), c:CLR.block,w:1.4,a:true},
      {d:P([100,LOS],[100,LOS-10]), c:CLR.block,w:1.4,a:true},
      {d:P([110,LOS],[110,LOS-10]), c:CLR.block,w:1.4,a:true},
    ],
  },
  {
    id:11, name:'LeadSweep', label:'Lead Sweep', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[118,98],[144,80],[176,42]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[112,94],[140,76],[170,48]), c:CLR.block,w:1.8,a:true},
      {d:P([58,LOS],[70,LOS-6]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[84,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([80,LOS],[96,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([90,LOS],[108,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([100,LOS],[120,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([176,LOS],[176,LOS-10]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:12, name:'TossCrack', label:'Toss Crack', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:QQ([88,QB_Y],[126,96],[156,90]), c:CLR.toss,w:1.5,a:true,dsh:true},
      {d:CB([156,90],[170,66],[182,46],[192,30]), c:CLR.run,w:2.8,a:true},
      {d:CB([176,LOS],[164,56],[150,50],[136,50]), c:CLR.block,w:1.5,a:true},
      {d:CB([94,FB_Y],[116,92],[142,74],[160,56]), c:CLR.block,w:1.8,a:true},
      {d:P([58,LOS],[70,LOS-6]), c:CLR.block,w:1.4,a:true},
      {d:P([70,LOS],[82,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[94,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[106,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:13, name:'InsideZone', label:'Inside Zone', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:100,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([100,RB_Y],[96,98],[90,78],[88,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[92,88],[90,72],[88,56]), c:CLR.block,w:1.7,a:true},
      {d:P([58,LOS],[54,LOS-8]), c:CLR.block,w:1.4,a:true},
      {d:P([70,LOS],[66,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:14, name:'OutsideZone', label:'Outside Zone', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[110,98],[128,78],[150,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[112,94],[132,78],[148,58]), c:CLR.block,w:1.7,a:true},
      {d:P([58,LOS],[70,LOS-6]), c:CLR.block,w:1.4,a:true},
      {d:P([70,LOS],[82,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[102,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[112,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[122,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:15, name:'Pitch', label:'Pitch', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:QQ([88,QB_Y],[122,98],[150,100]), c:CLR.toss,w:1.5,a:true,dsh:true},
      {d:CB([150,100],[166,72],[180,50],[192,34]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[112,94],[138,78],[164,52]), c:CLR.block,w:1.8,a:true},
      {d:P([58,LOS],[70,LOS-6]), c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[84,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([80,LOS],[96,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([90,LOS],[108,LOS-6]), c:CLR.block,w:1.3,a:true},
      {d:P([176,LOS],[176,LOS-9]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:16, name:'PowerWeak', label:'Power Weak', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:82,y:FB_Y,t:'FB'},{x:96,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([96,RB_Y],[94,98],[90,78],[88,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([82,FB_Y],[86,90],[88,74],[90,56]), c:CLR.block,w:1.8,a:true},
      {d:CB([110,LOS],[104,LOS+8],[94,LOS+2],[90,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([58,LOS],[54,LOS-9]), c:CLR.block,w:1.4,a:true},
      {d:P([70,LOS],[66,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:17, name:'SplitLead', label:'Split Lead', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'H'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:100,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([100,RB_Y],[96,98],[90,78],[88,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([118,LOS],[106,62],[96,56],[88,56]), c:CLR.block,w:1.7,a:true},
      {d:CB([94,FB_Y],[92,88],[90,72],[88,54]), c:CLR.block,w:1.7,a:true},
      {d:P([58,LOS],[54,LOS-8]), c:CLR.block,w:1.4,a:true},
      {d:P([70,LOS],[66,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:18, name:'DrawI', label:'Draw I', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:100,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([100,RB_Y],[96,98],[90,78],[88,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[92,90],[90,74],[88,56]), c:CLR.block,w:1.7,a:true},
      {d:P([58,LOS],[58,LOS-7]), c:CLR.block,w:1.2,a:true},
      {d:P([70,LOS],[66,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[77,LOS-7]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[103,LOS-7]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:19, name:'Delay', label:'Delay', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,RB_Y],[100,106],[94,76],[92,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[92,92],[90,76],[90,56]), c:CLR.block,w:1.6,a:true},
      {d:P([58,LOS],[58,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:20, name:'PinPull', label:'Pin-Pull', cat:'run',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[110,100],[126,78],[148,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([94,FB_Y],[112,94],[132,78],[148,58]), c:CLR.block,w:1.7,a:true},
      {d:CB([100,LOS],[106,LOS+8],[126,LOS+2],[132,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([110,LOS],[118,LOS+6],[132,LOS+2],[138,LOS-8]), c:CLR.pull,w:1.5,a:true},
      {d:P([58,LOS],[54,LOS-6]), c:CLR.block,w:1.4,a:true},
      {d:P([70,LOS],[66,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([176,LOS],[172,LOS-7]), c:CLR.block,w:1,a:true},
    ],
  },

  /* ═══ PASS 21-35 ═════════════════════════════ */
  {
    id:21, name:'Smash', label:'Smash', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:CB([14,LOS],[10,40],[26,22],[38,20]), c:CLR.pass,w:2.2,a:true},
      {d:P([58,LOS],[58,54],[58,58]), c:CLR.pass,w:2.2,a:true},
      {d:CB([182,LOS],[190,40],[174,22],[162,20]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,54],[166,58]), c:CLR.pass,w:2.2,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:22, name:'Flood', label:'Flood', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:P([182,LOS],[182,22]), c:CLR.pass,w:2.2,a:true},
      {d:CB([166,LOS],[174,46],[188,48],[198,48]), c:CLR.pass,w:2.2,a:true},
      {d:QQ([58,LOS],[76,66],[94,64]), c:CLR.pass,w:2,a:true},
      {d:P([14,LOS],[14,28]), c:CLR.pass,w:1.4,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[96,QB_Y+6]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:23, name:'Sail', label:'Sail', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:CB([182,LOS],[194,40],[180,20],[164,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,50],[196,50]), c:CLR.pass,w:2.2,a:true},
      {d:QQ([58,LOS],[76,66],[94,64]), c:CLR.pass,w:2,a:true},
      {d:P([14,LOS],[14,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:24, name:'Levels', label:'Levels', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:P([14,LOS],[14,36],[90,36]), c:CLR.pass,w:2.2,a:true},
      {d:CB([58,LOS],[78,58],[102,58],[128,58]), c:CLR.pass,w:2.2,a:true},
      {d:P([182,LOS],[182,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([166,LOS],[166,42]), c:CLR.pass,w:1.5,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:25, name:'DeepPost', label:'Deep Post', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:CB([14,LOS],[14,34],[34,18],[56,12]), c:CLR.pass,w:2.4,a:true},
      {d:P([58,LOS],[58,28]), c:CLR.pass,w:1.6,a:true},
      {d:P([166,LOS],[166,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([182,LOS],[182,20]), c:CLR.pass,w:1.6,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:26, name:'Comeback', label:'Comeback', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:CB([14,LOS],[14,26],[18,38],[8,42]), c:CLR.pass,w:2.2,a:true},
      {d:CB([182,LOS],[182,26],[178,38],[188,42]), c:CLR.pass,w:2.2,a:true},
      {d:P([58,LOS],[58,24]), c:CLR.pass,w:1.6,a:true},
      {d:P([166,LOS],[166,24]), c:CLR.pass,w:1.6,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:27, name:'Dig', label:'Dig', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:P([182,LOS],[182,34],[138,34]), c:CLR.pass,w:2.2,a:true},
      {d:P([14,LOS],[14,22]), c:CLR.pass,w:1.5,a:true},
      {d:P([58,LOS],[58,24]), c:CLR.pass,w:1.6,a:true},
      {d:P([166,LOS],[166,24]), c:CLR.pass,w:1.6,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:28, name:'FourVerts', label:'4 Verts', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:P([14,LOS],[14,12]), c:CLR.pass,w:2.2,a:true},
      {d:P([58,LOS],[58,12]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,12]), c:CLR.pass,w:2.2,a:true},
      {d:P([182,LOS],[182,12]), c:CLR.pass,w:2.2,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:29, name:'Shallow', label:'Shallow', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:CB([58,LOS],[82,58],[112,56],[144,58]), c:CLR.pass,w:2.2,a:true},
      {d:P([14,LOS],[14,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([166,LOS],[166,26]), c:CLR.pass,w:1.8,a:true},
      {d:P([182,LOS],[182,22]), c:CLR.pass,w:1.6,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:30, name:'Corner', label:'Corner', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:CB([182,LOS],[194,40],[180,20],[164,18]), c:CLR.pass,w:2.2,a:true},
      {d:CB([58,LOS],[46,38],[34,24],[24,20]), c:CLR.pass,w:2.2,a:true},
      {d:P([14,LOS],[14,24]), c:CLR.pass,w:1.5,a:true},
      {d:P([166,LOS],[166,24]), c:CLR.pass,w:1.5,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:31, name:'Bench', label:'Bench', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:P([166,LOS],[166,36],[192,36]), c:CLR.pass,w:2.2,a:true},
      {d:P([182,LOS],[182,30],[198,30]), c:CLR.pass,w:2.2,a:true},
      {d:P([58,LOS],[58,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([14,LOS],[14,24]), c:CLR.pass,w:1.5,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:32, name:'Wheel', label:'Wheel', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:104,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:CB([104,FB_Y],[124,94],[146,72],[166,30]), c:CLR.pass,w:2.2,a:true},
      {d:P([58,LOS],[58,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([166,LOS],[166,24]), c:CLR.pass,w:1.8,a:true},
      {d:P([14,LOS],[14,24]), c:CLR.pass,w:1.5,a:true},
      {d:P([182,LOS],[182,24]), c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:33, name:'China', label:'China', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:P([182,LOS],[182,28],[160,28]), c:CLR.pass,w:2.2,a:true},
      {d:CB([166,LOS],[166,40],[182,42],[192,42]), c:CLR.pass,w:2.2,a:true},
      {d:P([58,LOS],[58,22]), c:CLR.pass,w:1.8,a:true},
      {d:P([14,LOS],[14,22]), c:CLR.pass,w:1.5,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:34, name:'Stick', label:'Stick', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:P([166,LOS],[166,54],[166,58]), c:CLR.pass,w:2.2,a:true},
      {d:QQ([58,LOS],[74,60],[90,58]), c:CLR.pass,w:2.2,a:true},
      {d:P([182,LOS],[182,28]), c:CLR.pass,w:1.8,a:true},
      {d:P([14,LOS],[14,28]), c:CLR.pass,w:1.5,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+8]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:35, name:'Cross', label:'Cross', cat:'pass',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},
    ],
    rt:[
      {d:CB([58,LOS],[70,50],[98,42],[136,38]), c:CLR.pass,w:2.4,a:true},
      {d:CB([166,LOS],[154,48],[124,40],[76,36]), c:CLR.pass,w:2.2,a:true},
      {d:P([14,LOS],[14,20]), c:CLR.pass,w:1.5,a:true},
      {d:P([182,LOS],[182,20]), c:CLR.pass,w:1.5,a:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },

  /* ═══ PLAY ACTION 36-40 ══════════════════════ */
  {
    id:36, name:'PA_Post', label:'PA Post', cat:'pa',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[98,100],[94,84],[92,72]), c:CLR.run,w:2,a:true,dsh:true},
      {d:CB([14,LOS],[14,34],[34,18],[56,12]), c:CLR.pa,w:2.4,a:true},
      {d:CB([182,LOS],[182,36],[164,24],[144,18]), c:CLR.pa,w:2.2,a:true},
      {d:P([58,LOS],[58,24]), c:CLR.pa,w:1.6,a:true},
      {d:P([166,LOS],[166,24]), c:CLR.pa,w:1.6,a:true},
      {d:CB([94,FB_Y],[100,92],[104,74],[106,58]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:37, name:'PA_Boot', label:'PA Boot', cat:'pa',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'H'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[98,100],[94,84],[92,72]), c:CLR.run,w:2,a:true,dsh:true},
      {d:QQ([88,QB_Y],[110,QB_Y+8],[128,86]), c:CLR.qbmove,w:1.8,a:false,dsh:true},
      {d:QQ([118,LOS],[136,62],[154,64]), c:CLR.pa,w:2.2,a:true},
      {d:CB([182,LOS],[194,40],[180,20],[164,18]), c:CLR.pa,w:2.2,a:true},
      {d:P([166,LOS],[166,24]), c:CLR.pa,w:1.6,a:true},
      {d:P([14,LOS],[14,24]), c:CLR.pa,w:1.6,a:true},
      {d:CB([94,FB_Y],[100,92],[104,74],[106,58]), c:CLR.protect,w:1.6,a:false},
    ],
  },
  {
    id:38, name:'PA_Sail', label:'PA Sail', cat:'pa',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[98,100],[94,84],[92,72]), c:CLR.run,w:2,a:true,dsh:true},
      {d:CB([182,LOS],[194,40],[180,20],[164,18]), c:CLR.pa,w:2.2,a:true},
      {d:P([166,LOS],[166,50],[196,50]), c:CLR.pa,w:2.2,a:true},
      {d:QQ([58,LOS],[76,66],[94,64]), c:CLR.pa,w:2,a:true},
      {d:P([14,LOS],[14,24]), c:CLR.pa,w:1.6,a:true},
      {d:CB([94,FB_Y],[100,92],[104,74],[106,58]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:39, name:'PA_Cross', label:'PA Cross', cat:'pa',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[98,100],[94,84],[92,72]), c:CLR.run,w:2,a:true,dsh:true},
      {d:CB([58,LOS],[70,50],[98,42],[136,38]), c:CLR.pa,w:2.4,a:true},
      {d:P([182,LOS],[182,22]), c:CLR.pa,w:2.2,a:true},
      {d:P([166,LOS],[166,24]), c:CLR.pa,w:1.6,a:true},
      {d:P([14,LOS],[14,24]), c:CLR.pa,w:1.6,a:true},
      {d:CB([94,FB_Y],[100,92],[104,74],[106,58]), c:CLR.protect,w:1.6,a:false},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:40, name:'PA_DeepShot', label:'PA Deep Shot', cat:'pa',
    sk:[
      {x:14,y:LOS,t:'WR'},{x:58,y:LOS,t:'TE'},{x:166,y:LOS,t:'WR'},{x:182,y:LOS,t:'WR'},
      {x:88,y:QB_Y,t:'QB'},{x:94,y:FB_Y,t:'FB'},{x:102,y:RB_Y,t:'RB'},
    ],
    rt:[
      {d:CB([102,RB_Y],[98,100],[94,84],[92,72]), c:CLR.run,w:2,a:true,dsh:true},
      {d:P([94,FB_Y],[100,96]), c:CLR.protect,w:2,a:false},
      {d:CB([182,LOS],[194,36],[178,14],[160,12]), c:CLR.pa,w:2.5,a:true},
      {d:CB([166,LOS],[166,32],[140,18],[116,16]), c:CLR.pa,w:2.5,a:true},
      {d:CB([14,LOS],[12,32],[34,16],[58,14]), c:CLR.pa,w:2.2,a:true},
      {d:P([58,LOS],[58,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([70,LOS],[70,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.protect,w:1.2,a:false},
      {d:P([88,QB_Y],[88,QB_Y+10]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
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
  run:  [{c:CLR.run,l:'Ball Carrier'},{c:CLR.block,l:'Lead/Block'},{c:CLR.pull,l:'Pull'},{c:CLR.toss,l:'Pitch'}],
  pass: [{c:CLR.pass,l:'Route'},{c:CLR.qbmove,l:'Drop'},{c:CLR.protect,l:'Protect'}],
  pa:   [{c:CLR.run,l:'Run Fake'},{c:CLR.pa,l:'PA Route'},{c:CLR.protect,l:'Protection'},{c:CLR.qbmove,l:'Boot/Set'}],
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
            {[['WR','#a78bfa'],['TE','#34d399'],['QB','#fbbf24'],['RB','#f87171'],['FB','#fb923c'],['H','#f472b6'],['OL','#8b9ab5']].map(([t,c]) => (
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
  { id:'all',  label:'All 40',      accent:'#94a3b8' },
  { id:'run',  label:'Runs (20)',   accent:'#ef4444' },
  { id:'pass', label:'Pass (15)',   accent:'#a78bfa' },
  { id:'pa',   label:'PA (5)',      accent:'#22c55e' },
];

/* ── APP ─────────────────────────────────────── */
export default function IFormationIsoSystemPlaybook() {
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
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))' }}>
            🏈
          </div>
          <div>
            <div style={{ color:'#ede8ff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              I-FORMATION ISO
            </div>
            <div style={{ color:'#ef4444', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              LEAD BACKS · DOWNHILL RUNS · PLAY-ACTION
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
        I-FORMATION ISO SYSTEM · 40 PLAYS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
