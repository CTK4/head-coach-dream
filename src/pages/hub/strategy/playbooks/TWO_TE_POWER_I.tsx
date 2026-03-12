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

/* ── FORMATION HELPERS ───────────────────────── */
const OL_X = [70, 80, 90, 100, 110];
const QB_Y = 92;
const FB_Y = 98;
const RB_Y = 106;

/* Base Power I / Two-TE families */
const POWER_I_STRONG = [
  {x:20,y:LOS,t:'TE'},
  {x:100,y:LOS,t:'TE'},
  {x:176,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:88,y:FB_Y,t:'FB'},
  {x:88,y:RB_Y,t:'RB'},
];

const POWER_I_WEAK = [
  {x:10,y:LOS,t:'WR'},
  {x:80,y:LOS,t:'TE'},
  {x:100,y:LOS,t:'TE'},
  {x:88,y:QB_Y,t:'QB'},
  {x:88,y:FB_Y,t:'FB'},
  {x:88,y:RB_Y,t:'RB'},
];

const TWO_TE_PRO = [
  {x:14,y:LOS,t:'WR'},
  {x:80,y:LOS,t:'TE'},
  {x:100,y:LOS,t:'TE'},
  {x:176,y:LOS,t:'WR'},
  {x:88,y:QB_Y,t:'QB'},
  {x:102,y:QB_Y+8,t:'RB'},
];

const GOAL_HEAVY = [
  {x:18,y:LOS,t:'TE'},
  {x:38,y:LOS,t:'TE'},
  {x:100,y:LOS,t:'TE'},
  {x:88,y:QB_Y,t:'QB'},
  {x:88,y:FB_Y,t:'FB'},
  {x:88,y:RB_Y,t:'RB'},
];

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#ef4444','#a78bfa','#22c55e','#fb923c','#fbbf24',
  '#f472b6','#34d399','#64748b','#475569','#f87171','#10b981',
];

/* ── PLAYS DATA ──────────────────────────────── */
const PLAYS = [
  /* ═══ RUNS 1-20 ══════════════════════════════ */
  {
    id:1, name:'IsoStrong', label:'Iso Strong', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[88,100],[94,82],[100,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,FB_Y],[92,88],[98,74],[102,54]), c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[82,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[92,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[112,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([20,LOS],[24,LOS-8]),   c:CLR.block,w:1.1,a:true},
    ],
  },
  {
    id:2, name:'IsoWeak', label:'Iso Weak', cat:'run',
    sk:[...POWER_I_WEAK],
    rt:[
      {d:CB([88,RB_Y],[88,100],[82,82],[76,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,FB_Y],[84,88],[78,74],[74,54]), c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[68,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[88,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[98,LOS-9]),  c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[108,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[74,LOS-8]),   c:CLR.block,w:1.1,a:true},
    ],
  },
  {
    id:3, name:'Power', label:'Power', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[94,100],[110,80],[126,54]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,FB_Y],[96,90],[114,76],[128,58]), c:CLR.block,w:1.8,a:true},
      {d:CB([110,LOS],[104,LOS+8],[94,LOS+2],[88,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([20,LOS],[28,LOS-8]),   c:CLR.block,w:1.1,a:true},
    ],
  },
  {
    id:4, name:'Counter', label:'Counter', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[96,100],[114,80],[130,54]), c:CLR.run,w:2.8,a:true},
      {d:CB([110,LOS],[104,LOS+8],[94,LOS+2],[88,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([100,LOS],[96,LOS+8],[86,LOS+2],[82,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([88,FB_Y],[96,90],[116,74],[132,56]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[70,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]),   c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:5, name:'Toss', label:'Toss', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:QQ([88,QB_Y],[118,92],[146,88]), c:CLR.toss,w:1.5,a:true,dsh:true},
      {d:CB([88,RB_Y],[112,100],[142,72],[160,42]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,FB_Y],[104,92],[136,74],[152,48]), c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[82,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[94,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-6]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([176,LOS],[180,LOS-8]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:6, name:'LeadSweep', label:'Lead Sweep', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[106,100],[134,76],[154,46]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,FB_Y],[100,92],[128,76],[146,52]), c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[82,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[94,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([20,LOS],[30,LOS-7]),   c:CLR.block,w:1.1,a:true},
    ],
  },
  {
    id:7, name:'Trap', label:'Trap', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[84,100],[82,78],[82,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([110,LOS],[104,LOS+8],[92,LOS+2],[86,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([88,FB_Y],[84,72]),     c:CLR.block,w:1.4,a:true},
    ],
  },
  {
    id:8, name:'Stretch', label:'Stretch', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[100,100],[122,78],[146,48]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[80,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:CB([88,FB_Y],[98,92],[124,76],[142,54]), c:CLR.block,w:1.6,a:true},
      {d:P([176,LOS],[180,LOS-8]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:9, name:'Duo', label:'Duo', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[88,98],[88,78],[88,48]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-10]),   c:CLR.block,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-10]),   c:CLR.block,w:1.8,a:true},
      {d:P([90,LOS],[90,LOS-10]),   c:CLR.block,w:1.8,a:true},
      {d:P([100,LOS],[100,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([110,LOS],[110,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([88,FB_Y],[88,72]),      c:CLR.block,w:1.4,a:true},
      {d:P([20,LOS],[26,LOS-8]),    c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:10, name:'FBDive', label:'FB Dive', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,FB_Y],[88,90],[88,74],[88,50]), c:CLR.run,w:2.8,a:true},
      {d:P([88,RB_Y],[88,94]),                  c:CLR.block,w:1.5,a:true},
      {d:P([70,LOS],[70,LOS-10]),   c:CLR.block,w:1.6,a:true},
      {d:P([80,LOS],[80,LOS-10]),   c:CLR.block,w:1.6,a:true},
      {d:P([90,LOS],[90,LOS-10]),   c:CLR.block,w:1.6,a:true},
      {d:P([100,LOS],[100,LOS-10]), c:CLR.block,w:1.6,a:true},
      {d:P([110,LOS],[110,LOS-10]), c:CLR.block,w:1.6,a:true},
    ],
  },
  {
    id:11, name:'PinPull', label:'Pin-Pull', cat:'run',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([102,QB_Y+8],[110,96],[128,74],[150,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([90,LOS],[98,LOS+8],[118,LOS+2],[128,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([100,LOS],[108,LOS+8],[128,LOS+2],[138,LOS-8]), c:CLR.pull,w:1.6,a:true},
      {d:P([70,LOS],[66,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[76,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[118,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([176,LOS],[170,LOS-8]), c:CLR.block,w:1,a:true},
      {d:P([80,LOS],[72,LOS-8]),   c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:12, name:'CounterTrey', label:'Counter Trey', cat:'run',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[96,100],[114,80],[130,52]), c:CLR.run,w:2.8,a:true},
      {d:CB([110,LOS],[104,LOS+8],[94,LOS+2],[88,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([100,LOS],[96,LOS+8],[86,LOS+2],[82,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:CB([88,FB_Y],[96,90],[116,74],[132,56]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[70,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]),   c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:13, name:'InsideZone', label:'Inside Zone', cat:'run',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([102,QB_Y+8],[98,82],[92,68],[90,50]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[68,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[79,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-10]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[101,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[112,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[74,LOS-7]),   c:CLR.block,w:1,a:true},
      {d:P([100,LOS],[104,LOS-7]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:14, name:'OutsideZone', label:'Outside Zone', cat:'run',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([102,QB_Y+8],[112,96],[130,76],[152,50]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[80,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[92,LOS-5]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-5]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-5]), c:CLR.block,w:1.2,a:true},
      {d:P([176,LOS],[180,LOS-8]), c:CLR.block,w:1,a:true},
      {d:P([100,LOS],[108,LOS-8]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:15, name:'PowerWeak', label:'Power Weak', cat:'run',
    sk:[...POWER_I_WEAK],
    rt:[
      {d:CB([88,RB_Y],[82,100],[66,80],[52,54]), c:CLR.run,w:2.8,a:true},
      {d:CB([88,FB_Y],[80,90],[62,76],[48,58]), c:CLR.block,w:1.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[86,LOS+2],[92,LOS-8]), c:CLR.pull,w:1.8,a:true},
      {d:P([80,LOS],[80,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[74,LOS-8]),   c:CLR.block,w:1.1,a:true},
    ],
  },
  {
    id:16, name:'SplitLead', label:'Split Lead', cat:'run',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([102,QB_Y+8],[96,82],[90,68],[88,50]), c:CLR.run,w:2.8,a:true},
      {d:CB([80,LOS],[72,76],[74,66],[82,56]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[68,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([176,LOS],[180,LOS-8]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:17, name:'TossCrack', label:'Toss Crack', cat:'run',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:QQ([88,QB_Y],[116,92],[144,88]), c:CLR.toss,w:1.5,a:true,dsh:true},
      {d:CB([102,QB_Y+8],[124,98],[150,74],[166,44]), c:CLR.run,w:2.8,a:true},
      {d:CB([176,LOS],[166,56],[152,52],[138,50]), c:CLR.block,w:1.6,a:true},
      {d:P([70,LOS],[82,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[94,LOS-6]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[104,LOS-6]),  c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[116,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[126,LOS-6]), c:CLR.block,w:1.2,a:true},
    ],
  },
  {
    id:18, name:'Draw', label:'Draw', cat:'run',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+10]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y+8],[96,96],[90,76],[90,48]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[68,LOS-7]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[78,LOS-8]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[102,LOS-8]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[114,LOS-6]), c:CLR.block,w:1.2,a:true},
      {d:P([14,LOS],[14,24]),      c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([176,LOS],[176,24]),    c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:19, name:'Delay', label:'Delay', cat:'run',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:P([88,QB_Y],[88,QB_Y+8]),                  c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y+8],[102,QB_Y],[92,64],[92,48]), c:CLR.run,w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([80,LOS],[80,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([90,LOS],[90,LOS-9]),   c:CLR.block,w:1.2,a:true},
      {d:P([100,LOS],[100,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([110,LOS],[110,LOS-9]), c:CLR.block,w:1.2,a:true},
      {d:P([14,LOS],[14,26]),      c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([176,LOS],[176,26]),    c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:20, name:'GoalLineLead', label:'Goal Line Lead', cat:'run',
    sk:[...GOAL_HEAVY],
    rt:[
      {d:CB([88,RB_Y],[88,100],[88,80],[88,58]), c:CLR.run,w:2.8,a:true},
      {d:P([88,FB_Y],[88,74]),                   c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-11]),   c:CLR.block,w:2,a:true},
      {d:P([80,LOS],[80,LOS-11]),   c:CLR.block,w:2,a:true},
      {d:P([90,LOS],[90,LOS-11]),   c:CLR.block,w:2,a:true},
      {d:P([100,LOS],[100,LOS-11]), c:CLR.block,w:2,a:true},
      {d:P([110,LOS],[110,LOS-11]), c:CLR.block,w:2,a:true},
      {d:P([18,LOS],[18,LOS-9]),    c:CLR.block,w:1.4,a:true},
      {d:P([38,LOS],[38,LOS-9]),    c:CLR.block,w:1.4,a:true},
      {d:P([100,LOS],[104,LOS-9]),  c:CLR.block,w:1.4,a:true},
    ],
  },

  /* ═══ PASS 21-35 ═════════════════════════════ */
  {
    id:21, name:'Smash', label:'Smash', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([14,LOS],[8,40],[22,22],[34,20]),      c:CLR.pass,w:2.2,a:true},
      {d:P([80,LOS],[80,54],[80,58]),              c:CLR.pass,w:2.2,a:true},
      {d:CB([176,LOS],[184,40],[168,22],[156,20]), c:CLR.pass,w:2.2,a:true},
      {d:P([100,LOS],[100,54],[100,58]),           c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:22, name:'Flood', label:'Flood', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([176,LOS],[188,34],[176,14],[158,12]), c:CLR.pass,w:2.2,a:true},
      {d:P([100,LOS],[100,38],[136,38]),           c:CLR.pass,w:2.2,a:true},
      {d:QQ([80,LOS],[98,62],[116,70]),            c:CLR.pass,w:2.1,a:true},
      {d:P([14,LOS],[14,24]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[96,QB_Y+6]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:23, name:'Sail', label:'Sail', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([176,LOS],[188,40],[174,20],[158,18]), c:CLR.pass,w:2.2,a:true},
      {d:P([100,LOS],[100,50],[132,50]),           c:CLR.pass,w:2.2,a:true},
      {d:QQ([80,LOS],[98,66],[116,64]),            c:CLR.pass,w:2,a:true},
      {d:P([14,LOS],[14,24]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:24, name:'Dig', label:'Dig', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:P([176,LOS],[176,34],[126,34]),           c:CLR.pass,w:2.3,a:true},
      {d:P([14,LOS],[14,18]),                      c:CLR.pass,w:2.1,a:true},
      {d:P([80,LOS],[80,24]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),             c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:25, name:'Post', label:'Post', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([14,LOS],[14,34],[34,20],[56,16]),     c:CLR.pass,w:2.3,a:true},
      {d:CB([176,LOS],[176,34],[156,20],[134,16]), c:CLR.pass,w:2.3,a:true},
      {d:P([80,LOS],[80,24]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:26, name:'Comeback', label:'Comeback', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:P([14,LOS],[14,24]),                      c:CLR.pass,w:2.3,a:true},
      {d:P([176,LOS],[176,24]),                    c:CLR.pass,w:2.3,a:true},
      {d:P([80,LOS],[80,28]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,28]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),             c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:27, name:'Levels', label:'Levels', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:P([14,LOS],[14,36],[92,36]),              c:CLR.pass,w:2.2,a:true},
      {d:CB([80,LOS],[98,58],[124,58],[154,58]),   c:CLR.pass,w:2.2,a:true},
      {d:P([176,LOS],[176,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,42]),                    c:CLR.pass,w:1.5,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:28, name:'Mesh', label:'Mesh', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([80,LOS],[96,60],[124,58],[154,60]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([100,LOS],[88,58],[62,56],[34,58]),    c:CLR.pass,w:2.2,a:true},
      {d:P([14,LOS],[14,24]),                      c:CLR.pass,w:1.8,a:true},
      {d:CB([176,LOS],[186,42],[174,22],[160,20]), c:CLR.pass,w:1.8,a:true},
      {d:QQ([102,QB_Y+8],[118,84],[132,82]),       c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:29, name:'Wheel', label:'Wheel', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([102,QB_Y+8],[124,QB_Y],[148,76],[168,34]), c:CLR.pass,w:2.2,a:true},
      {d:P([14,LOS],[14,24]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([80,LOS],[80,26]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([176,LOS],[176,18]),                    c:CLR.pass,w:2.1,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:30, name:'Bench', label:'Bench', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:P([14,LOS],[14,50],[44,50]),              c:CLR.pass,w:2.2,a:true},
      {d:P([80,LOS],[80,50],[110,50]),             c:CLR.pass,w:2.2,a:true},
      {d:P([100,LOS],[100,50],[130,50]),           c:CLR.pass,w:2.2,a:true},
      {d:P([176,LOS],[176,50],[146,50]),           c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:31, name:'Stick', label:'Stick', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:QQ([100,LOS],[116,60],[132,58]),          c:CLR.pass,w:2.2,a:true},
      {d:P([80,LOS],[80,54],[80,58]),              c:CLR.pass,w:2.2,a:true},
      {d:P([176,LOS],[176,28]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([14,LOS],[14,28]),                      c:CLR.pass,w:1.5,a:true},
      {d:QQ([102,QB_Y+8],[118,82],[132,78]),       c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:32, name:'Shallow', label:'Shallow', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([14,LOS],[34,60],[84,58],[132,58]),    c:CLR.pass,w:2.2,a:true},
      {d:P([176,LOS],[176,26]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([80,LOS],[80,26]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:33, name:'DeepCross', label:'Deep Cross', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([176,LOS],[160,44],[118,34],[72,32]),  c:CLR.pass,w:2.4,a:true},
      {d:P([14,LOS],[14,20]),                      c:CLR.pass,w:2.1,a:true},
      {d:P([80,LOS],[80,24]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([102,QB_Y+8],[102,QB_Y+2]),             c:CLR.protect,w:1.5,a:false},
    ],
  },
  {
    id:34, name:'Corner', label:'Corner', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:CB([176,LOS],[188,38],[172,22],[152,18]), c:CLR.pass,w:2.3,a:true},
      {d:P([14,LOS],[14,26]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([80,LOS],[80,24]),                      c:CLR.pass,w:1.8,a:true},
      {d:P([100,LOS],[100,24]),                    c:CLR.pass,w:1.8,a:true},
      {d:P([88,QB_Y],[88,QB_Y+10]),                c:CLR.qbmove,w:1.5,a:false,dsh:true},
    ],
  },
  {
    id:35, name:'FourVerts', label:'4 Verts', cat:'pass',
    sk:[...TWO_TE_PRO],
    rt:[
      {d:P([14,LOS],[14,12]),                      c:CLR.pass,w:2.2,a:true},
      {d:P([80,LOS],[80,12]),                      c:CLR.pass,w:2.2,a:true},
      {d:P([100,LOS],[100,12]),                    c:CLR.pass,w:2.2,a:true},
      {d:P([176,LOS],[176,12]),                    c:CLR.pass,w:2.2,a:true},
      {d:P([88,QB_Y],[88,QB_Y+8]),                 c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:CB([102,QB_Y+8],[110,80],[120,74],[128,70]), c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },

  /* ═══ PLAY ACTION 36-40 ══════════════════════ */
  {
    id:36, name:'PAPost', label:'PA Post', cat:'pa',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[88,100],[94,94],[98,90]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([88,FB_Y],[88,82]),                    c:CLR.protect,w:1.6,a:false},
      {d:CB([176,LOS],[176,34],[154,20],[132,16]), c:CLR.pa,w:2.5,a:true},
      {d:P([20,LOS],[20,28]),                     c:CLR.pa,w:1.8,a:true},
      {d:P([100,LOS],[100,26]),                   c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:37, name:'PABoot', label:'PA Boot', cat:'pa',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[88,100],[96,94],[108,90]), c:CLR.qbmove,w:1.6,a:false,dsh:true},
      {d:CB([88,QB_Y],[108,92],[132,82],[150,72]), c:CLR.qbmove,w:1.6,a:false,dsh:true},
      {d:QQ([100,LOS],[118,68],[140,66]),         c:CLR.pa,w:2.2,a:true},
      {d:P([176,LOS],[176,24]),                   c:CLR.pa,w:2.2,a:true},
      {d:CB([20,LOS],[20,38],[36,26],[52,22]),    c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:38, name:'PACross', label:'PA Cross', cat:'pa',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[88,100],[94,94],[98,90]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([88,FB_Y],[88,82]),                    c:CLR.protect,w:1.6,a:false},
      {d:CB([176,LOS],[160,44],[118,34],[72,32]), c:CLR.pa,w:2.5,a:true},
      {d:P([20,LOS],[20,20]),                     c:CLR.pa,w:2,a:true},
      {d:P([100,LOS],[100,24]),                   c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:39, name:'PAFlood', label:'PA Flood', cat:'pa',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[88,100],[96,94],[108,90]), c:CLR.qbmove,w:1.6,a:false,dsh:true},
      {d:CB([88,QB_Y],[108,92],[132,82],[150,72]), c:CLR.qbmove,w:1.6,a:false,dsh:true},
      {d:CB([176,LOS],[188,34],[176,14],[158,12]), c:CLR.pa,w:2.2,a:true},
      {d:P([100,LOS],[100,38],[136,38]),          c:CLR.pa,w:2.2,a:true},
      {d:QQ([20,LOS],[36,62],[52,70]),            c:CLR.pa,w:2.1,a:true},
      {d:P([70,LOS],[70,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                c:CLR.protect,w:1.2,a:false},
    ],
  },
  {
    id:40, name:'PADeepShot', label:'PA Deep Shot', cat:'pa',
    sk:[...POWER_I_STRONG],
    rt:[
      {d:CB([88,RB_Y],[88,100],[94,94],[98,90]), c:CLR.qbmove,w:1.5,a:false,dsh:true},
      {d:P([88,FB_Y],[88,82]),                    c:CLR.protect,w:1.6,a:false},
      {d:CB([20,LOS],[20,30],[38,18],[58,14]),    c:CLR.pa,w:2.5,a:true},
      {d:CB([176,LOS],[176,30],[156,16],[134,12]), c:CLR.pa,w:2.5,a:true},
      {d:P([100,LOS],[100,24]),                   c:CLR.pa,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([80,LOS],[80,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([90,LOS],[90,LOS-9]),                  c:CLR.protect,w:1.2,a:false},
      {d:P([100,LOS],[100,LOS-9]),                c:CLR.protect,w:1.2,a:false},
      {d:P([110,LOS],[110,LOS-9]),                c:CLR.protect,w:1.2,a:false},
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
  { id:'all',  label:'All 40',     accent:'#94a3b8' },
  { id:'run',  label:'Runs (20)',  accent:'#ef4444' },
  { id:'pass', label:'Pass (15)',  accent:'#a78bfa' },
  { id:'pa',   label:'PA (5)',     accent:'#22c55e' },
];

/* ── APP ─────────────────────────────────────── */
export default function PowerITwoTEPlaybook() {
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
              POWER I / TWO-TE
            </div>
            <div style={{ color:'#a78bfa', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.8 }}>
              HEAVY BASE · LEAD RUNS · PLAY ACTION
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
        POWER I / TWO-TE BASE · 40 PLAYS · TAP TO DETAIL
      </div>

      {selected && <PlayModal play={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
