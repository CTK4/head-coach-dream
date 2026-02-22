import { useState, useEffect } from "react";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  run:     '#00ff88',
  pass:    '#38bdf8',
  pa:      '#fbbf24',
  sit:     '#f472b6',
  block:   '#64748b',
  motion:  '#ff7c2a',
  protect: '#475569',
  qbmove:  '#fbbf24',
  rpo:     '#c084fc',
  pull:    '#ff7c2a',
  toss:    '#fbbf24',
};

const CAT_META = {
  run:         { label: 'Runs',         short: 'RUN',  accent: '#00ff88', bg: '#00ff8812' },
  pass:        { label: 'Pass',         short: 'PASS', accent: '#38bdf8', bg: '#38bdf812' },
  pa:          { label: 'Play-Action',  short: 'P/A',  accent: '#fbbf24', bg: '#fbbf2412' },
  situational: { label: 'Situational',  short: 'SIT',  accent: '#f472b6', bg: '#f472b612' },
};

/* ── SVG PATH HELPERS ────────────────────────── */
const P  = (...pts) => pts.map((p,i) => `${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s, c, e) => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s,c1,c2,e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

const LOS = 70;
const OL_X = [58, 70, 82, 94, 106];

/* ── PLAYS DATA ──────────────────────────────── */
// sk = skill players: [{x,y,t:'WR'|'TE'|'QB'|'RB'|'FB'|'H'}]
// rt = routes: [{d:pathStr, c:color, w:width, a:showArrow, dsh:dashed}]

const PLAYS = [
  /* ═══ RUNS 1-12 ═══════════════════════════════════════ */
  {
    id:1, name:'OZ_Left', label:'Outside Zone Left', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
    ],
    rt:[
      {d:CB([106,84],[82,80],[50,68],[18,46]), c:CLR.run,   w:2.8,a:true},
      {d:P([58,LOS],[46,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([70,LOS],[58,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([82,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([94,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[94,LOS-5]), c:CLR.block,w:1,a:true},
      {d:QQ([118,LOS],[100,LOS-8],[76,LOS-6]),  c:CLR.block,w:1,a:true},
      {d:P([12,LOS],[12,LOS-9]),  c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:2, name:'OZ_Right', label:'Outside Zone Right', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:174,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:68,y:84,t:'RB'},
    ],
    rt:[
      {d:CB([68,84],[100,80],[136,68],[168,46]),c:CLR.run,  w:2.8,a:true},
      {d:P([58,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([70,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([82,LOS],[94,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([94,LOS],[106,LOS-5]), c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[118,LOS-5]),c:CLR.block,w:1,a:true},
      {d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:3, name:'OZ_Weak', label:'Outside Zone Weak', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
    ],
    rt:[
      {d:CB([106,84],[74,80],[40,68],[14,46]),  c:CLR.run,  w:2.8,a:true},
      {d:P([58,LOS],[46,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([70,LOS],[58,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([82,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([94,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[94,LOS-5]), c:CLR.block,w:1,a:true},
      {d:P([12,LOS],[12,LOS-9]),  c:CLR.block,w:1,a:true},
      {d:P([32,LOS],[32,LOS-9]),  c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:4, name:'OZ_MotionFlip', label:'OZ Motion Flip', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
    ],
    rt:[
      {d:P([32,LOS],[84,LOS+12],[140,LOS+2],[152,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
      {d:CB([106,84],[126,80],[148,68],[168,46]),c:CLR.run,  w:2.8,a:true},
      {d:P([58,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([70,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([82,LOS],[94,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([94,LOS],[106,LOS-5]), c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[118,LOS-5]),c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:5, name:'SplitZone_Right', label:'Split Zone Right', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
      {x:56,y:80,t:'H'},
    ],
    rt:[
      {d:CB([106,84],[126,80],[148,68],[168,46]),c:CLR.run,  w:2.8,a:true},
      {d:CB([56,80],[72,76],[96,72],[110,LOS+2]),c:CLR.pull, w:1.8,a:true},
      {d:P([58,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([70,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([82,LOS],[94,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([94,LOS],[106,LOS-5]), c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[118,LOS-5]),c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:6, name:'SplitZone_Left', label:'Split Zone Left', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:70,y:84,t:'RB'},
      {x:132,y:80,t:'H'},
    ],
    rt:[
      {d:CB([70,84],[50,80],[32,68],[14,46]),  c:CLR.run,  w:2.8,a:true},
      {d:CB([132,80],[108,76],[86,72],[68,LOS+2]),c:CLR.pull,w:1.8,a:true},
      {d:P([58,LOS],[46,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([70,LOS],[58,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([82,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([94,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[94,LOS-5]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:7, name:'Duo_Inside', label:'Duo Inside', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:84,y:98,t:'RB'},
    ],
    rt:[
      {d:CB([84,98],[84,84],[82,72],[80,50]),  c:CLR.run,  w:2.8,a:true},
      {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([82,LOS],[82,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([58,LOS],[58,LOS-7]),  c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[106,LOS-7]),c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:8, name:'Duo_Lead', label:'Duo Lead', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
      {x:66,y:84,t:'FB'},
    ],
    rt:[
      {d:CB([66,84],[74,78],[76,64],[76,48]),  c:CLR.block,w:1.8,a:true},
      {d:CB([84,98],[80,86],[78,66],[76,50]),  c:CLR.run,  w:2.8,a:true},
      {d:P([58,LOS],[58,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([82,LOS],[82,LOS-10]), c:CLR.block,w:1.8,a:true},
      {d:P([94,LOS],[94,LOS-7]),  c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[106,LOS-7]),c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:9, name:'Stretch_Crack', label:'Stretch + Crack', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:100,y:84,t:'RB'},
    ],
    rt:[
      {d:QQ([12,LOS],[30,LOS-5],[52,LOS-7]),  c:CLR.block,w:1.5,a:true},
      {d:CB([100,84],[68,80],[36,68],[8,48]),  c:CLR.run,  w:2.8,a:true},
      {d:P([58,LOS],[46,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([70,LOS],[58,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([82,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([94,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[94,LOS-5]), c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:10, name:'Counter_Slice', label:'Counter Slice', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
    ],
    rt:[
      {d:CB([106,84],[90,84],[96,70],[96,50]),  c:CLR.run,  w:2.8,a:true},
      {d:CB([58,LOS],[66,LOS+10],[92,LOS-2],[100,LOS-7]),c:CLR.pull,w:1.8,a:true},
      {d:CB([70,LOS],[76,LOS+8],[100,LOS],[106,LOS-7]),  c:CLR.pull,w:1.5,a:true},
      {d:QQ([118,LOS],[108,LOS-5],[98,LOS-9]),  c:CLR.block,w:1.5,a:true},
      {d:P([82,LOS],[82,LOS-8]),  c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:11, name:'Toss_OutsideZone', label:'Toss Outside Zone', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
    ],
    rt:[
      {d:QQ([84,82],[120,78],[152,74]),        c:CLR.toss, w:1.5,a:true,dsh:true},
      {d:CB([152,74],[166,66],[178,56],[186,42]),c:CLR.run, w:2.8,a:true},
      {d:P([58,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([70,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([82,LOS],[94,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([94,LOS],[106,LOS-5]), c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[118,LOS-5]),c:CLR.block,w:1,a:true},
    ],
  },
  {
    id:12, name:'JetSweep_Orbit', label:'Jet Sweep Orbit', cat:'run',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
    ],
    rt:[
      {d:CB([32,LOS],[58,LOS+14],[84,LOS+16],[132,LOS+2]),c:CLR.motion,w:1.5,a:false,dsh:true},
      {d:P([84,82],[100,74]),      c:CLR.toss, w:1.2,a:true,dsh:true},
      {d:CB([132,LOS+2],[156,56],[174,46],[188,38]),c:CLR.run,w:2.8,a:true},
      {d:QQ([106,82],[84,80],[62,76]),            c:CLR.block,w:1,a:true,dsh:true},
      {d:P([58,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
      {d:P([106,LOS],[118,LOS-5]),c:CLR.block,w:1,a:true},
    ],
  },

  /* ═══ PASS CONCEPTS 13-28 ══════════════════════════════ */
  {
    id:13, name:'Boot_Flood', label:'Boot Flood', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
    ],
    rt:[
      {d:CB([84,84],[60,82],[44,80],[36,76]),   c:CLR.qbmove,w:2,a:true},
      {d:CB([172,LOS],[180,48],[162,28],[148,26]),c:CLR.pass,w:2,a:true},
      {d:P([118,LOS],[118,50],[150,50]),          c:CLR.pass,w:2,a:true},
      {d:QQ([106,84],[124,82],[142,78]),          c:CLR.pass,w:1.8,a:true},
      {d:P([12,LOS],[12,28]),   c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([32,LOS],[32,50]),   c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:14, name:'Boot_Cross', label:'Boot Cross', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
    ],
    rt:[
      {d:CB([84,84],[60,82],[44,80],[36,76]),    c:CLR.qbmove,w:2,a:true},
      {d:CB([172,LOS],[148,52],[90,52],[52,54]), c:CLR.pass, w:2,a:true},
      {d:CB([118,LOS],[96,56],[68,56],[46,58]),  c:CLR.pass, w:2,a:true},
      {d:QQ([106,84],[80,80],[50,78]),           c:CLR.pass, w:1.8,a:true},
      {d:P([12,LOS],[12,26]),  c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:15, name:'PA_Over', label:'PA Over Route', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
    ],
    rt:[
      {d:P([106,78],[128,74]),    c:CLR.pa,   w:1.5,a:true,dsh:true},
      {d:P([84,78],[84,90]),      c:CLR.qbmove,w:1.5,a:true,dsh:true},
      {d:CB([12,LOS],[22,42],[70,48],[112,48]),  c:CLR.pass,w:2.2,a:true},
      {d:CB([118,LOS],[108,46],[78,48],[50,50]), c:CLR.pass,w:2.2,a:true},
      {d:P([172,LOS],[172,28]),  c:CLR.pass,w:1,a:true},
      {d:P([32,LOS],[32,42]),    c:CLR.pass,w:1,a:true},
    ],
  },
  {
    id:16, name:'PA_Yankee', label:'PA Yankee', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
    ],
    rt:[
      {d:P([106,78],[126,74]),   c:CLR.pa,   w:1.5,a:true,dsh:true},
      {d:CB([118,LOS],[130,36],[100,26],[72,26]),c:CLR.pass,w:2.2,a:true},
      {d:CB([172,LOS],[174,46],[150,34],[128,30]),c:CLR.pass,w:2,a:true},
      {d:P([12,LOS],[12,28]),    c:CLR.pass,w:1,a:true},
      {d:CB([32,LOS],[46,56],[80,56],[106,58]),  c:CLR.pass,w:1.5,a:true},
    ],
  },
  {
    id:17, name:'Dagger', label:'Dagger', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:P([12,LOS],[12,36],[82,36]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([32,LOS],[32,46],[52,34],[68,28]),  c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,50],[148,50]),        c:CLR.pass,w:1.5,a:true},
      {d:P([172,LOS],[172,26]),                 c:CLR.pass,w:1,a:true},
    ],
  },
  {
    id:18, name:'Sail', label:'Sail', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:CB([172,LOS],[182,44],[164,28],[148,26]),c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,48],[150,48]),           c:CLR.pass,w:2.2,a:true},
      {d:QQ([106,86],[132,82],[150,78]),           c:CLR.pass,w:1.8,a:true},
      {d:CB([12,LOS],[10,46],[28,48],[46,48]),    c:CLR.pass,w:1,a:true},
      {d:P([32,LOS],[32,36]),   c:CLR.pass,w:1,a:true},
    ],
  },
  {
    id:19, name:'Drift', label:'Drift', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:CB([32,LOS],[52,44],[90,44],[108,46]),  c:CLR.pass,w:2.2,a:true},
      {d:CB([118,LOS],[132,50],[128,36],[116,34]),c:CLR.pass,w:2.2,a:true},
      {d:P([12,LOS],[12,30]),    c:CLR.pass,w:1,a:true},
      {d:CB([172,LOS],[182,46],[168,28],[154,28]),c:CLR.pass,w:1,a:true},
      {d:QQ([106,86],[120,82],[134,80]),         c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:20, name:'DeepOver', label:'Deep Over', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:CB([12,LOS],[12,28],[60,28],[108,28]),   c:CLR.pass,w:2.2,a:true},
      {d:CB([172,LOS],[172,34],[120,34],[80,36]), c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,26]),  c:CLR.pass,w:1.5,a:true},
      {d:P([32,LOS],[32,46],[32,50]),             c:CLR.pass,w:1,a:true},
    ],
  },
  {
    id:21, name:'Mesh_Wide', label:'Mesh Wide', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
    ],
    rt:[
      {d:CB([34,LOS],[62,62],[100,62],[120,64]),  c:CLR.pass,w:2.2,a:true},
      {d:CB([152,LOS],[122,60],[82,60],[60,62]),  c:CLR.pass,w:2.2,a:true},
      {d:P([12,LOS],[12,28]),    c:CLR.pass,w:1,a:true},
      {d:CB([176,LOS],[186,44],[176,28],[166,26]),c:CLR.pass,w:1,a:true},
      {d:P([118,LOS],[118,50]),  c:CLR.pass,w:1,a:true},
    ],
  },
  {
    id:22, name:'Spot', label:'Spot', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:CB([12,LOS],[8,42],[28,26],[38,24]),    c:CLR.pass,w:2.2,a:true},
      {d:P([32,LOS],[32,52],[32,56]),            c:CLR.pass,w:2.2,a:true},
      {d:QQ([106,86],[82,82],[54,80]),           c:CLR.pass,w:1.8,a:true},
      {d:P([172,LOS],[172,46],[172,50]),         c:CLR.pass,w:1,a:true},
      {d:P([118,LOS],[118,42]),                  c:CLR.pass,w:1,a:true},
    ],
  },
  {
    id:23, name:'Quick_Out', label:'Quick Out', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
    ],
    rt:[
      {d:P([12,LOS],[12,57],[2,57]),     c:CLR.pass,w:2.2,a:true},
      {d:P([172,LOS],[172,57],[184,57]), c:CLR.pass,w:2.2,a:true},
      {d:P([32,LOS],[32,56],[32,60]),    c:CLR.pass,w:1.5,a:true},
      {d:P([118,LOS],[118,56],[134,56]), c:CLR.pass,w:1.5,a:true},
      {d:P([84,80],[84,90]),             c:CLR.qbmove,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:24, name:'Stick', label:'Stick', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
    ],
    rt:[
      {d:P([32,LOS],[32,52],[32,56]),            c:CLR.pass,w:2.2,a:true},
      {d:QQ([106,84],[96,80],[78,78]),           c:CLR.pass,w:1.8,a:true},
      {d:P([118,LOS],[118,52],[118,56]),         c:CLR.pass,w:2.2,a:true},
      {d:P([172,LOS],[172,28]),                  c:CLR.pass,w:1,a:true},
      {d:P([12,LOS],[12,28]),                    c:CLR.pass,w:1,a:true},
    ],
  },
  {
    id:25, name:'Levels', label:'Levels', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:P([12,LOS],[12,38],[88,38]),            c:CLR.pass,w:2.2,a:true},
      {d:CB([32,LOS],[50,62],[82,62],[110,62]),  c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,24]),                  c:CLR.pass,w:1.5,a:true},
      {d:P([172,LOS],[172,26]),                  c:CLR.pass,w:1,a:true},
    ],
  },
  {
    id:26, name:'SlantFlat', label:'Slant + Flat', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
    ],
    rt:[
      {d:CB([12,LOS],[26,54],[48,50],[58,50]),   c:CLR.pass,w:2.2,a:true},
      {d:QQ([106,84],[86,80],[64,78]),           c:CLR.pass,w:1.8,a:true},
      {d:CB([172,LOS],[158,54],[136,50],[124,50]),c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,56],[136,56]),         c:CLR.pass,w:1.5,a:true},
      {d:P([84,84],[84,92]),   c:CLR.qbmove,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:27, name:'Smash', label:'Smash', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:CB([12,LOS],[8,42],[24,26],[36,24]),    c:CLR.pass,w:2.2,a:true},
      {d:P([32,LOS],[32,52],[32,56]),            c:CLR.pass,w:2.2,a:true},
      {d:CB([172,LOS],[180,42],[166,26],[152,24]),c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,52],[118,56]),         c:CLR.pass,w:2.2,a:true},
      {d:QQ([106,86],[120,82],[132,80]),         c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:28, name:'Shallow_Cross', label:'Shallow Cross', cat:'pass',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:CB([12,LOS],[36,62],[90,62],[136,62]),  c:CLR.pass,w:2.2,a:true},
      {d:CB([172,LOS],[154,48],[108,48],[72,50]),c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,26]),                  c:CLR.pass,w:1.5,a:true},
      {d:P([32,LOS],[32,38],[32,42]),            c:CLR.pass,w:1,a:true},
    ],
  },

  /* ═══ PLAY-ACTION / CONSTRAINT 29-34 ══════════════════ */
  {
    id:29, name:'PA_Boot_Leak', label:'PA Boot + TE Leak', cat:'pa',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
    ],
    rt:[
      {d:P([106,78],[126,74]),   c:CLR.pa,    w:1.5,a:true,dsh:true},
      {d:CB([84,78],[106,80],[124,80],[136,78]),c:CLR.qbmove,w:2,a:true},
      {d:CB([118,LOS],[132,58],[148,42],[156,38]),c:CLR.pass,w:2.2,a:true},
      {d:CB([172,LOS],[182,46],[168,28],[152,26]),c:CLR.pass,w:1.8,a:true},
      {d:CB([12,LOS],[30,50],[62,50],[84,52]),  c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:30, name:'PA_Shot_Post', label:'PA Shot Post', cat:'pa',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
    ],
    rt:[
      {d:P([106,78],[126,74]),   c:CLR.pa,    w:1.5,a:true,dsh:true},
      {d:CB([12,LOS],[12,32],[46,22],[76,20]), c:CLR.pass,w:2.5,a:true},
      {d:CB([172,LOS],[172,36],[132,24],[104,22]),c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,30]),  c:CLR.pass,w:1.5,a:true},
      {d:P([32,LOS],[32,44],[32,50]),          c:CLR.pass,w:1,a:true},
    ],
  },
  {
    id:31, name:'PA_HalfRoll_Sail', label:'PA Half-Roll Sail', cat:'pa',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
    ],
    rt:[
      {d:P([106,78],[126,74]),    c:CLR.pa,    w:1.5,a:true,dsh:true},
      {d:CB([84,78],[98,82],[112,82],[120,80]), c:CLR.qbmove,w:2,a:true},
      {d:CB([172,LOS],[182,44],[166,24],[150,22]),c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,46],[148,46]),         c:CLR.pass,w:2.2,a:true},
      {d:QQ([106,78],[124,80],[140,82]),         c:CLR.pass,w:1.8,a:true},
      {d:CB([12,LOS],[28,50],[60,50],[84,52]),  c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:32, name:'RPO_SlantBubble', label:'RPO Slant + Bubble', cat:'pa',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
      {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
    ],
    rt:[
      {d:P([98,78],[106,70],[108,52]),   c:CLR.run,  w:2,a:true,dsh:true},
      {d:CB([32,LOS],[48,58],[64,54],[74,52]),    c:CLR.pass,w:2.2,a:true},
      {d:QQ([152,LOS],[140,74],[132,80]),         c:CLR.pa,  w:2,a:true},
      {d:QQ([176,LOS],[166,74],[154,80]),         c:CLR.pa,  w:1.5,a:true},
      {d:P([84,78],[84,70]),   c:CLR.rpo,  w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:33, name:'RPO_Glance', label:'RPO Glance', cat:'pa',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
    ],
    rt:[
      {d:P([98,78],[110,70],[118,52]),           c:CLR.run,  w:2,a:true,dsh:true},
      {d:CB([172,LOS],[166,56],[150,54],[134,54]),c:CLR.pass,w:2.2,a:true},
      {d:P([12,LOS],[12,28]),    c:CLR.pass,w:1,a:true},
      {d:P([32,LOS],[32,52],[32,56]),            c:CLR.pass,w:1,a:true},
      {d:P([84,78],[96,70]),     c:CLR.rpo,  w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:34, name:'Orbit_PlayAction_Shot', label:'Orbit PA Shot', cat:'pa',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
    ],
    rt:[
      {d:CB([32,LOS],[58,LOS+14],[84,LOS+18],[86,86]),c:CLR.motion,w:1.5,a:false,dsh:true},
      {d:CB([84,80],[100,84],[114,88],[118,90]),c:CLR.pa,  w:1.5,a:true,dsh:true},
      {d:CB([12,LOS],[8,36],[28,20],[50,18]),   c:CLR.pass,w:2.5,a:true},
      {d:CB([172,LOS],[160,38],[116,26],[90,26]),c:CLR.pass,w:2.2,a:true},
      {d:P([118,LOS],[118,40]),  c:CLR.pass,w:1.5,a:true},
    ],
  },

  /* ═══ SITUATIONAL / SCREENS 35-40 ══════════════════════ */
  {
    id:35, name:'TE_Screen', label:'TE Screen', cat:'situational',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:P([84,86],[84,98]),      c:CLR.qbmove,w:1.5,a:true,dsh:true},
      {d:CB([118,LOS],[132,78],[132,90],[130,94]),c:CLR.sit,w:2,a:true},
      {d:CB([84,98],[108,94],[124,94],[130,94]),  c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:QQ([94,LOS],[100,74],[112,70]),         c:CLR.block,w:1,a:true},
      {d:QQ([106,LOS],[114,72],[126,68]),        c:CLR.block,w:1,a:true},
      {d:P([12,LOS],[12,26]),    c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([172,LOS],[172,26]),  c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:36, name:'RB_Screen_Wide', label:'RB Screen Wide', cat:'situational',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:P([84,86],[84,100]),     c:CLR.qbmove,w:1.5,a:true,dsh:true},
      {d:CB([106,86],[136,86],[156,80],[162,76]),c:CLR.sit,w:2,a:true},
      {d:CB([84,100],[128,98],[152,86],[162,76]),c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:QQ([94,LOS],[102,74],[118,68]),        c:CLR.block,w:1,a:true},
      {d:QQ([106,LOS],[116,72],[132,66]),       c:CLR.block,w:1,a:true},
      {d:P([172,LOS],[172,26]),  c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:37, name:'WR_Tunnel', label:'WR Tunnel Screen', cat:'situational',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:P([84,86],[84,92]),     c:CLR.qbmove,w:1.5,a:true,dsh:true},
      {d:CB([32,LOS],[36,72],[40,78],[42,82]),  c:CLR.sit,w:2,a:true},
      {d:CB([84,92],[62,88],[52,84],[42,82]),   c:CLR.sit,w:1.8,a:true,dsh:true},
      {d:CB([12,LOS],[20,72],[34,78],[38,80]),  c:CLR.block,w:1.5,a:true},
      {d:CB([118,LOS],[102,68],[78,66],[58,66]),c:CLR.block,w:1.5,a:true},
      {d:P([172,LOS],[172,26]),  c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
  {
    id:38, name:'Shot_MaxProtect_Post', label:'Max Protect Post', cat:'situational',
    sk:[
      {x:12,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    ],
    rt:[
      {d:P([106,86],[106,84]),   c:CLR.protect,w:2,a:false},
      {d:P([118,LOS],[118,72]),  c:CLR.protect,w:2,a:false},
      {d:CB([12,LOS],[12,32],[50,20],[82,18]),   c:CLR.pass,w:2.5,a:true},
      {d:CB([172,LOS],[172,32],[132,20],[100,18]),c:CLR.pass,w:2.5,a:true},
      {d:P([84,86],[84,104]),    c:CLR.qbmove,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:39, name:'HardCount_GoBall', label:'Hard Count Go Ball', cat:'situational',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:74,t:'QB'},{x:106,y:74,t:'RB'},
    ],
    rt:[
      {d:P([12,LOS],[12,12]),    c:CLR.sit,w:2.2,a:true},
      {d:P([32,LOS],[32,12]),    c:CLR.sit,w:2.2,a:true},
      {d:P([118,LOS],[118,12]),  c:CLR.sit,w:2.2,a:true},
      {d:P([172,LOS],[172,12]),  c:CLR.sit,w:2.2,a:true},
      {d:CB([106,74],[106,82],[106,50],[106,28]),c:CLR.pass,w:1.5,a:true},
      {d:P([84,74],[84,92]),     c:CLR.qbmove,w:1.5,a:true,dsh:true},
    ],
  },
  {
    id:40, name:'QB_Boot_Run', label:'QB Boot Run', cat:'situational',
    sk:[
      {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
      {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
      {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
    ],
    rt:[
      {d:P([106,80],[128,76]),   c:CLR.pa,    w:1.5,a:true,dsh:true},
      {d:CB([84,80],[62,82],[36,72],[12,52]),   c:CLR.run,  w:2.8,a:true},
      {d:CB([70,LOS],[60,LOS+8],[36,LOS+2],[22,LOS-4]),c:CLR.pull,w:1.8,a:true},
      {d:P([12,LOS],[12,28]),    c:CLR.pass,w:1,a:true,dsh:true},
      {d:P([32,LOS],[32,28]),    c:CLR.pass,w:1,a:true,dsh:true},
    ],
  },
];

/* ── ARROW COLORS ────────────────────────────── */
const ARROW_COLORS = [
  '#00ff88','#38bdf8','#fbbf24','#f472b6',
  '#fb923c','#475569','#c084fc','#64748b','#ef4444',
];

/* ── SVG DEFS ────────────────────────────────── */
function SVGDefs() {
  return (
    <defs>
      {ARROW_COLORS.map(color => (
        <marker key={color}
          id={`arr-${color.replace('#','')}`}
          markerWidth="7" markerHeight="7"
          refX="6" refY="3.5"
          orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0.5 L0,6.5 L7,3.5 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

/* ── PLAYER SYMBOL ───────────────────────────── */
const PLAYER_COLORS = {
  WR:'#38bdf8', TE:'#34d399', QB:'#fbbf24', RB:'#f87171',
  FB:'#fb923c', H:'#c084fc', OL:'#8b9ab5',
};
function Player({x, y, t, large=false}) {
  const c = PLAYER_COLORS[t] || '#fff';
  const r = large ? 6.5 : 5;
  if (t === 'OL') {
    const s = large ? 10 : 8;
    return (
      <g>
        <rect x={x-s/2} y={y-s*0.45} width={s} height={s*0.9} fill={c} rx={1.5}
              opacity={0.9} />
        <rect x={x-s/2} y={y-s*0.45} width={s} height={s*0.9} fill="none"
              stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} rx={1.5} />
      </g>
    );
  }
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={c} opacity={0.92} />
      <circle cx={x} cy={y} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
      {large && (
        <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
              fontSize={5.5} fill="#000" fontWeight="800" fontFamily="monospace">
          {t}
        </text>
      )}
    </g>
  );
}

/* ── ROUTE LINE ──────────────────────────────── */
function Route({d, c, w=1.5, a=false, dsh=false}) {
  const arrowId = ARROW_COLORS.find(ac => ac === c);
  const markerEnd = a && arrowId ? `url(#arr-${c.replace('#','')})` : undefined;
  return (
    <path d={d} fill="none" stroke={c} strokeWidth={w}
          strokeDasharray={dsh ? '5,3' : undefined}
          markerEnd={markerEnd}
          strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
  );
}

/* ── PLAY FIELD SVG ──────────────────────────── */
function PlayField({ play, width = '100%', large = false }) {
  return (
    <svg viewBox="0 0 200 130" width={width} style={{ display: 'block' }}>
      <SVGDefs />
      {/* Field */}
      <rect width={200} height={130} fill="#071a0e" />
      <rect width={200} height={130} fill="url(#fieldGrad)" opacity={0.3} />

      {/* Yard lines */}
      {[20, 40, 60].map(yOff => (
        <line key={yOff}
          x1={0} y1={LOS - yOff} x2={200} y2={LOS - yOff}
          stroke="rgba(255,255,255,0.07)" strokeWidth={0.5}
          strokeDasharray="3,5" />
      ))}

      {/* Hash marks */}
      {[75, 126].map(hx => (
        [30, 40, 50, 60].map(hy => (
          <line key={`${hx}-${hy}`}
            x1={hx} y1={LOS - hy} x2={hx + 5} y2={LOS - hy}
            stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
        ))
      ))}

      {/* LOS */}
      <line x1={0} y1={LOS} x2={200} y2={LOS}
            stroke="rgba(255,255,255,0.45)" strokeWidth={0.8} />

      {/* Routes first (under players) */}
      {play.rt.map((r, i) => <Route key={i} {...r} />)}

      {/* OL */}
      {OL_X.map((x, i) => <Player key={i} x={x} y={LOS} t="OL" large={large} />)}

      {/* Skill */}
      {play.sk.map((p, i) => <Player key={i} x={p.x} y={p.y} t={p.t} large={large} />)}

      {/* Ball */}
      <ellipse cx={82} cy={LOS - 1.5} rx={3.5} ry={2.2}
               fill="#c97b2a" stroke="#f59e2e" strokeWidth={0.6} />
    </svg>
  );
}

/* ── LEGEND ──────────────────────────────────── */
const LEGENDS = {
  run:         [{c:CLR.run,l:'Ball Carrier'},{c:CLR.block,l:'Block'},{c:CLR.pull,l:'Pull'},{c:CLR.motion,l:'Motion'},{c:CLR.toss,l:'Toss'}],
  pass:        [{c:CLR.pass,l:'Route'},{c:CLR.qbmove,l:'QB Drop'},{c:CLR.block,l:'Protection'}],
  pa:          [{c:CLR.pa,l:'PA Fake'},{c:CLR.pass,l:'Route'},{c:CLR.rpo,l:'RPO Read'},{c:CLR.qbmove,l:'QB Move'}],
  situational: [{c:CLR.sit,l:'Screen'},{c:CLR.pass,l:'Route'},{c:CLR.block,l:'Release'},{c:CLR.protect,l:'Max Protect'}],
};

/* ── PLAY CARD ───────────────────────────────── */
function PlayCard({ play, onClick }) {
  const meta = CAT_META[play.cat];
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
         style={{
           cursor: 'pointer',
           background: hovered ? '#0f2240' : '#0b1a30',
           border: `1px solid ${hovered ? meta.accent + '50' : '#162236'}`,
           borderRadius: 10,
           overflow: 'hidden',
           transition: 'all 0.18s ease',
           transform: hovered ? 'translateY(-2px)' : 'none',
           boxShadow: hovered ? `0 6px 24px ${meta.accent}22` : '0 2px 8px rgba(0,0,0,0.4)',
         }}>
      <div style={{ padding: '0', position: 'relative' }}>
        <PlayField play={play} />
        {/* Category badge */}
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
        {/* Play number */}
        <div style={{
          position: 'absolute', top: 6, left: 7,
          color: 'rgba(255,255,255,0.3)',
          fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
        }}>
          {String(play.id).padStart(2, '0')}
        </div>
      </div>
      <div style={{
        padding: '6px 9px 8px',
        borderTop: `1px solid ${hovered ? meta.accent + '30' : '#162236'}`,
        background: hovered ? meta.bg : 'transparent',
      }}>
        <div style={{
          color: '#e8f0ff',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.3px',
          lineHeight: '1.3',
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
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,5,15,0.88)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #0d1f38 0%, #07111e 100%)',
        border: `1px solid ${meta.accent}45`,
        borderRadius: 18,
        overflow: 'hidden',
        width: '100%',
        maxWidth: 440,
        boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${meta.accent}18`,
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px 12px',
          background: `linear-gradient(90deg, ${meta.accent}12, transparent)`,
          borderBottom: `1px solid ${meta.accent}30`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                background: meta.accent,
                borderRadius: 4, padding: '2px 7px',
                fontSize: 9, fontWeight: 900, letterSpacing: '2px',
                color: '#000', fontFamily: 'monospace',
              }}>
                {meta.short}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}>
                PLAY #{String(play.id).padStart(2, '0')}
              </span>
            </div>
            <div style={{
              color: '#f0f6ff', fontSize: 20, fontWeight: 900,
              fontFamily: "'Courier New', monospace", letterSpacing: '-0.5px',
            }}>
              {play.name}
            </div>
            <div style={{
              color: meta.accent, fontSize: 11, fontWeight: 500,
              opacity: 0.8, marginTop: 2,
            }}>
              {play.label}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.5)',
            width: 30, height: 30, borderRadius: 15,
            cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>×</button>
        </div>

        {/* Field */}
        <div style={{ background: '#060f18', padding: '0 0 4px' }}>
          <PlayField play={play} large={true} />
        </div>

        {/* Legend */}
        <div style={{
          padding: '12px 16px 14px',
          borderTop: `1px solid ${meta.accent}20`,
        }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,0.3)', marginBottom: 8,
            fontFamily: 'monospace',
          }}>
            LEGEND
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
            {/* Players */}
            {[['WR','#38bdf8'],['TE','#34d399'],['QB','#fbbf24'],['RB','#f87171'],['FB/H','#fb923c'],['OL','#8b9ab5']].map(([t,c]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: t === 'OL' ? 2 : 5, background: c, opacity: 0.85 }} />
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontFamily: 'monospace' }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 14px' }}>
            {(LEGENDS[play.cat] || []).map(({ c, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width={18} height={6}>
                  <line x1={0} y1={3} x2={14} y2={3}
                        stroke={c} strokeWidth={2.5} strokeLinecap="round" />
                  <polygon points="12,0.5 12,5.5 18,3" fill={c} />
                </svg>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontFamily: 'monospace' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CATEGORY TABS ───────────────────────────── */
const CATS = [
  { id: 'all',         label: 'All 40',      accent: '#94a3b8' },
  { id: 'run',         label: 'Runs (12)',    accent: '#00ff88' },
  { id: 'pass',        label: 'Pass (16)',    accent: '#38bdf8' },
  { id: 'pa',          label: 'P-Action (6)',accent: '#fbbf24' },
  { id: 'situational', label: 'Situational (6)', accent: '#f472b6' },
];

/* ── MAIN APP ────────────────────────────────── */
export default function Playbook() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const displayed = filter === 'all'
    ? PLAYS
    : PLAYS.filter(p => p.cat === filter);

  return (
    <div style={{
      background: '#04090f',
      minHeight: '100vh',
      fontFamily: "'Courier New', monospace",
      maxWidth: 520,
      margin: '0 auto',
      position: 'relative',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(20px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes cardIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #04090f; }
        ::-webkit-scrollbar-thumb { background: #1e3050; border-radius: 2px; }
        * { box-sizing: border-box; }
      `}</style>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #06101c 100%)',
        borderBottom: '1px solid #162236',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            fontSize: 26, lineHeight: 1,
            filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))',
          }}>🏈</div>
          <div>
            <div style={{
              color: '#f0f6ff', fontWeight: 900, fontSize: 17,
              letterSpacing: '1px', lineHeight: 1.1,
            }}>
              SHANAHAN WIDE ZONE
            </div>
            <div style={{
              color: '#38bdf8', fontSize: 9, fontWeight: 700,
              letterSpacing: '3px', opacity: 0.8,
            }}>
              POWER / ZONE HYBRID PLAYBOOK
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{
              color: 'rgba(255,255,255,0.18)', fontSize: 10,
              letterSpacing: '1px',
            }}>
              {displayed.length} PLAYS
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 2, overflowX: 'auto',
          paddingBottom: 0,
          msOverflowStyle: 'none', scrollbarWidth: 'none',
        }}>
          {CATS.map(cat => {
            const active = filter === cat.id;
            return (
              <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
                background: active ? cat.accent + '18' : 'transparent',
                color: active ? cat.accent : 'rgba(255,255,255,0.35)',
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

      {/* PLAY GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        padding: 10,
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
        borderTop: '1px solid #0f1f30',
        color: 'rgba(255,255,255,0.15)',
        fontSize: 9, letterSpacing: '2px',
      }}>
        SHANAHAN SYSTEM · 40 PLAYS · TAP TO DETAIL
      </div>

      {/* MODAL */}
      {selected && (
        <PlayModal play={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
