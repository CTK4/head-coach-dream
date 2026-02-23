/* ════════════════════════════════════════════════════════════════════════
   BUDDY RYAN NICKEL PRESSURE — DEFENSE CORE 40 (UI DATA)

   Identity
   - MOFC / single-high backbone (C1/C0)
   - 5-man rush is the "normal" pressure state
   - Green-dog rules (Dog Alert) as a core tag
   - Fire-zone changeups to punish hot answers
   - Stunt/loop layer to keep 4-man looks threatening

   Categories mapped to your UI:
     base        -> base man shells (C1 family)
     pressure    -> core 5-man pressures (still C1 unless noted)
     zero        -> Cover 0 all-out
     firezone    -> 3-deep / 3-under changeups
     stunt       -> stunt/loop variations (rush plan)
     situational -> dime / 3rd down / goal line

   Player tokens (defense):
     DL  => "OL" (use your OL icon as generic down-lineman)
     LB  => "FB" (use FB icon as generic linebacker)
     NB  => "H"  (nickel/STAR)
     CB/S => "WR" (DBs)

   NOTE: Diagram paths are schematic and intentionally simplified.
   ════════════════════════════════════════════════════════════════════════ */

export const DEF_BUDDY_RYAN_NICKEL_PRESSURE_CORE40 = [
/* ═══ I. BASE MAN STRUCTURE (1-10) ════════════════════════════════════ */
/* 1 */ { id:1, name:"Nickel_C1_Base", label:"Nickel C1 Base — 4-man rush, post safety", cat:"base",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"}, // DL (4)
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},                                         // MIKE/WILL
    {x:110,y:78,t:"H"},                                                             // Nickel/Star
    {x:24,y:LOS,t:"WR"},{x:48,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"}, // CBs
    {x:100,y:30,t:"WR"}                                                             // Post S
  ],
  rt:[
    {d:P([58,LOS],[52,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([70,LOS],[66,LOS-12]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[86,LOS-12]), c:CLR.block,w:1.8,a:true},
    {d:P([94,LOS],[100,LOS-10]),c:CLR.block,w:1.8,a:true},
    {d:P([100,30],[100,20]),    c:CLR.pass,w:1.2,a:true,dsh:true} // post safety landmark
  ]},

/* 2 */ { id:2, name:"Nickel_C1_Press", label:"Nickel C1 Press — Tight leverage outside", cat:"base",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:110,y:78,t:"H"},
    {x:24,y:LOS,t:"WR"},{x:48,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([24,LOS],[20,LOS-8]),   c:CLR.pass,w:1.6,a:true,dsh:true}, // press leverage cue
    {d:P([176,LOS],[180,LOS-8]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([100,30],[100,20]),     c:CLR.pass,w:1.2,a:true,dsh:true},
  ]},

/* 3 */ { id:3, name:"Nickel_C1_Robber", label:"Nickel C1 Robber — Weak safety low hole", cat:"base",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:110,y:78,t:"H"},
    {x:24,y:LOS,t:"WR"},{x:48,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:100,y:30,t:"WR"},{x:84,y:52,t:"WR"} // robber
  ],
  rt:[
    {d:P([84,52],[96,56],[108,60]), c:CLR.pass,w:1.6,a:true}, // robber lurk
    {d:P([100,30],[100,20]),        c:CLR.pass,w:1.2,a:true,dsh:true},
  ]},

/* 4 */ { id:4, name:"Nickel_C1_DoubleX", label:"Nickel C1 Double X — Bracket boundary WR", cat:"base",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:110,y:78,t:"H"},
    {x:24,y:LOS,t:"WR"},{x:48,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:100,y:30,t:"WR"},{x:34,y:50,t:"WR"} // bracket helper
  ],
  rt:[
    {d:P([34,50],[28,46],[24,42]), c:CLR.pass,w:1.6,a:true}, // cone/down
    {d:P([100,30],[70,28],[44,26]),c:CLR.pass,w:1.6,a:true}, // over top help
  ]},

/* 5 */ { id:5, name:"Nickel_C1_CutCross", label:"Nickel C1 Cut Cross — Rat cutting shallow", cat:"base",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:110,y:78,t:"H"},
    {x:24,y:LOS,t:"WR"},{x:48,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:100,y:30,t:"WR"},{x:100,y:56,t:"WR"} // rat
  ],
  rt:[
    {d:P([100,56],[80,58],[60,60]), c:CLR.pass,w:1.8,a:true}, // rat cut path
    {d:P([100,30],[100,20]),        c:CLR.pass,w:1.2,a:true,dsh:true},
  ]},

/* 6 */ { id:6, name:"Nickel_C1_StarLock", label:"Nickel C1 Star Lock — Nickel man on slot", cat:"base",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:110,y:78,t:"H"},
    {x:48,y:LOS,t:"WR"}, {x:120,y:LOS,t:"WR"}, // inside receivers as reference
    {x:24,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([110,78],[120,70],[128,62]), c:CLR.pass,w:1.8,a:true}, // star match trail
    {d:P([100,30],[100,20]),          c:CLR.pass,w:1.2,a:true,dsh:true},
  ]},

/* 7 */ { id:7, name:"Nickel_C1_InsideLev", label:"Nickel C1 Inside Leverage — Funnel outside", cat:"base",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:110,y:78,t:"H"},
    {x:24,y:LOS,t:"WR"},{x:48,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([48,LOS],[44,LOS-10]),  c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([152,LOS],[156,LOS-10]),c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([100,30],[100,20]),     c:CLR.pass,w:1.2,a:true,dsh:true},
  ]},

/* 8 */ { id:8, name:"Nickel_C1_Trail", label:"Nickel C1 Trail — Under leverage trail technique", cat:"base",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:110,y:78,t:"H"},
    {x:48,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},
    {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([110,78],[118,70],[126,62]), c:CLR.pass,w:1.7,a:true,dsh:true}, // trail cue
    {d:P([100,30],[100,20]),          c:CLR.pass,w:1.2,a:true,dsh:true},
  ]},

/* 9 */ { id:9, name:"Nickel_C1_PressBail", label:"Nickel C1 Press Bail — Show press, bail late", cat:"base",
  sk:[
    {x:24,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:110,y:78,t:"H"},
    {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([24,LOS],[24,LOS-8],[20,LOS-14]),   c:CLR.pass,w:1.8,a:true}, // bail
    {d:P([176,LOS],[176,LOS-8],[180,LOS-14]),c:CLR.pass,w:1.8,a:true},
    {d:P([100,30],[100,20]),                 c:CLR.pass,w:1.2,a:true,dsh:true},
  ]},

/* 10 */{ id:10,name:"Nickel_C1_DogAlert", label:"Nickel C1 Dog Alert — Auto green-dog if RB blocks", cat:"base",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:110,y:78,t:"H"},
    {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([72,88],[72,78],[74,66]), c:CLR.motion,w:1.8,a:true,dsh:true}, // green-dog trigger
    {d:P([92,88],[92,78],[90,66]), c:CLR.motion,w:1.8,a:true,dsh:true},
  ]},

/* ═══ II. CORE 5-MAN PRESSURE PACKAGE (11-20) ═════════════════════════ */
/* 11 */{ id:11,name:"Nickel_CrossDog", label:"Nickel Cross Dog — MIKE + WILL cross A-gaps", cat:"pressure",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"}, {x:110,y:78,t:"H"},
    {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([72,88],[78,78],[84,66],[90,54]), c:CLR.run,w:2.3,a:true},
    {d:P([92,88],[86,78],[80,66],[74,54]), c:CLR.run,w:2.3,a:true},
    {d:P([110,78],[118,70],[126,60]),      c:CLR.run,w:2.1,a:true,dsh:true},
  ]},

/* 12 */{ id:12,name:"DoubleA_Mug", label:"Double A Gap Mug — Both LBs threaten A", cat:"pressure",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:78,y:78,t:"FB"},{x:86,y:78,t:"FB"}, {x:110,y:78,t:"H"},
    {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([78,78],[80,66],[82,54]), c:CLR.run,w:2.4,a:true},
    {d:P([86,78],[84,66],[82,54]), c:CLR.run,w:2.4,a:true},
    {d:P([110,78],[118,70],[126,60]), c:CLR.run,w:2.0,a:true,dsh:true},
  ]},

/* 13 */{ id:13,name:"Nickel_Cat_Field", label:"Nickel Cat (Field) — Nickel edge pressure", cat:"pressure",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:132,y:78,t:"H"}, {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([132,78],[140,68],[150,56],[160,46]), c:CLR.run,w:2.5,a:true},
  ]},

/* 14 */{ id:14,name:"Boundary_Cat", label:"Boundary Cat — Weak slot blitz", cat:"pressure",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:68,y:78,t:"H"}, {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([68,78],[60,68],[50,56],[40,46]), c:CLR.run,w:2.5,a:true},
  ]},

/* 15 */{ id:15,name:"Strong_Edge_Overload", label:"Strong Edge Overload — 5-man to TE side", cat:"pressure",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:132,y:78,t:"H"}, {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([94,LOS],[110,LOS-10]), c:CLR.run,w:2.0,a:true,dsh:true}, // edge tilt
    {d:P([132,78],[146,64],[160,50]), c:CLR.run,w:2.4,a:true},    // nickel add
  ]},

/* 16 */{ id:16,name:"Weak_Edge_Loop", label:"Weak Edge Loop — DE loop inside", cat:"pressure",
  sk:[
    {x:58,y:LOS,t:"OL"},{x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"},
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:CB([58,LOS],[62,LOS-8],[72,LOS-16],[82,LOS-20]), c:CLR.run,w:2.2,a:true},
    {d:P([82,LOS],[74,LOS-10]), c:CLR.run,w:1.8,a:true,dsh:true},
  ]},

/* 17 */{ id:17,name:"Sam_Fire_C1", label:"Sam Fire C1 — SAM rush replace", cat:"pressure",
  sk:[
    {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},
    {x:46,y:78,t:"FB"}, {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:P([46,78],[52,68],[58,58],[64,48]), c:CLR.run,w:2.5,a:true}, // SAM fire
  ]},

/* 18 */{ id:18,name:"Mike_Plug", label:"Mike Plug — MIKE straight A-gap", cat:"pressure",
  sk:[ {x:82,y:78,t:"FB"},{x:100,y:30,t:"WR"} ],
  rt:[ {d:P([82,78],[82,66],[82,54],[82,44]), c:CLR.run,w:2.7,a:true} ] },

/* 19 */{ id:19,name:"Safety_Insert", label:"Safety Insert Blitz — Downhill SS pressure", cat:"pressure",
  sk:[ {x:112,y:52,t:"WR"},{x:100,y:30,t:"WR"} ],
  rt:[ {d:P([112,52],[104,60],[96,66],[88,72]), c:CLR.run,w:2.4,a:true} ] },

/* 20 */{ id:20,name:"TE_Stunt_LB_Add", label:"Interior Twist + LB Add — T/E stunt + add-on", cat:"pressure",
  sk:[
    {x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:92,y:88,t:"FB"}, {x:100,y:30,t:"WR"}
  ],
  rt:[
    {d:CB([70,LOS],[78,LOS-10],[90,LOS-16],[96,LOS-22]), c:CLR.run,w:2.2,a:true}, // twist
    {d:P([92,88],[90,74],[88,60]), c:CLR.run,w:2.3,a:true},                       // add-on
  ]},

/* ═══ III. ZERO PRESSURE TIER (21-27) ═════════════════════════════════ */
/* 21 */{ id:21,name:"Zero_CrossDog", label:"Zero Cross Dog — 6-man rush", cat:"zero",
  sk:[ {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"},{x:110,y:78,t:"H"} ],
  rt:[
    {d:P([72,88],[78,74],[84,60]), c:CLR.run,w:2.5,a:true},
    {d:P([92,88],[86,74],[80,60]), c:CLR.run,w:2.5,a:true},
    {d:P([110,78],[126,60],[140,46]), c:CLR.run,w:2.5,a:true},
  ]},

/* 22 */{ id:22,name:"Zero_DoubleA", label:"Zero Double A", cat:"zero",
  sk:[ {x:78,y:78,t:"FB"},{x:86,y:78,t:"FB"} ],
  rt:[ {d:P([78,78],[82,62],[84,46]), c:CLR.run,w:2.7,a:true},
       {d:P([86,78],[84,62],[84,46]), c:CLR.run,w:2.7,a:true} ] },

/* 23 */{ id:23,name:"Zero_NickelCat", label:"Zero Nickel Cat", cat:"zero",
  sk:[ {x:132,y:78,t:"H"} ],
  rt:[ {d:P([132,78],[148,60],[164,44]), c:CLR.run,w:2.8,a:true} ] },

/* 24 */{ id:24,name:"Zero_SafetyEdge", label:"Zero Safety Edge", cat:"zero",
  sk:[ {x:116,y:40,t:"WR"} ],
  rt:[ {d:P([116,40],[132,52],[150,64]), c:CLR.run,w:2.6,a:true} ] },

/* 25 */{ id:25,name:"Zero_BoundaryOverload", label:"Zero Boundary Overload", cat:"zero",
  sk:[ {x:68,y:78,t:"H"},{x:72,y:88,t:"FB"} ],
  rt:[ {d:P([68,78],[52,60],[40,46]), c:CLR.run,w:2.6,a:true},
       {d:P([72,88],[66,74],[60,60]), c:CLR.run,w:2.2,a:true} ] },

/* 26 */{ id:26,name:"Zero_SlotReplace", label:"Zero Slot Replace", cat:"zero",
  sk:[ {x:110,y:78,t:"H"},{x:100,y:56,t:"WR"} ],
  rt:[ {d:P([110,78],[118,66],[126,54]), c:CLR.run,w:2.6,a:true},
       {d:P([100,56],[92,58],[84,60]),   c:CLR.pass,w:1.6,a:true,dsh:true} ] },

/* 27 */{ id:27,name:"GoalLine_Zero", label:"Goal Line Zero", cat:"zero",
  sk:[ {x:82,y:LOS,t:"OL"},{x:72,y:78,t:"FB"},{x:92,y:78,t:"FB"} ],
  rt:[ {d:P([82,LOS],[82,LOS-10]), c:CLR.run,w:2.2,a:true},
       {d:P([72,78],[78,64],[84,50]), c:CLR.run,w:2.6,a:true},
       {d:P([92,78],[86,64],[84,50]), c:CLR.run,w:2.6,a:true} ] },

/* ═══ IV. FIRE ZONE CHANGEUPS (28-32) ═════════════════════════════════ */
/* 28 */{ id:28,name:"Nickel_FireZone_C3", label:"Nickel Fire Zone (3-Deep)", cat:"firezone",
  sk:[ {x:110,y:78,t:"H"},{x:100,y:30,t:"WR"} ],
  rt:[ {d:P([110,78],[126,60],[140,46]), c:CLR.run,w:2.4,a:true},
       {d:P([100,30],[100,20]),          c:CLR.pass,w:1.2,a:true,dsh:true} ] },

/* 29 */{ id:29,name:"CrossDog_FireZone", label:"Cross Dog Fire Zone", cat:"firezone",
  sk:[ {x:72,y:88,t:"FB"},{x:92,y:88,t:"FB"} ],
  rt:[ {d:P([72,88],[78,74],[84,60]), c:CLR.run,w:2.4,a:true},
       {d:P([92,88],[86,74],[80,60]), c:CLR.run,w:2.4,a:true} ] },

/* 30 */{ id:30,name:"BoundaryCat_FireZone", label:"Boundary Cat Fire Zone", cat:"firezone",
  sk:[ {x:68,y:78,t:"H"} ],
  rt:[ {d:P([68,78],[52,60],[40,46]), c:CLR.run,w:2.4,a:true} ] },

/* 31 */{ id:31,name:"Safety_FireZone", label:"Safety Fire Zone", cat:"firezone",
  sk:[ {x:116,y:40,t:"WR"} ],
  rt:[ {d:P([116,40],[126,52],[136,64]), c:CLR.run,w:2.4,a:true} ] },

/* 32 */{ id:32,name:"Overload_FireZone", label:"Overload Fire Zone", cat:"firezone",
  sk:[ {x:132,y:78,t:"H"},{x:92,y:88,t:"FB"} ],
  rt:[ {d:P([132,78],[146,62],[160,48]), c:CLR.run,w:2.4,a:true},
       {d:P([92,88],[96,74],[100,60]),   c:CLR.run,w:2.2,a:true} ] },

/* ═══ V. STUNT & LOOP VARIANTS (33-36) ════════════════════════════════ */
/* 33 */{ id:33,name:"EdgeLoop_Strong", label:"Edge Loop Strong", cat:"stunt",
  sk:[ {x:94,y:LOS,t:"OL"},{x:110,y:78,t:"H"} ],
  rt:[ {d:CB([94,LOS],[108,LOS-8],[124,LOS-18],[138,LOS-24]), c:CLR.run,w:2.2,a:true},
       {d:P([110,78],[126,62],[140,46]), c:CLR.run,w:2.0,a:true,dsh:true} ] },

/* 34 */{ id:34,name:"Interior_Pirate", label:"Interior Pirate — 3-tech loop", cat:"stunt",
  sk:[ {x:82,y:LOS,t:"OL"} ],
  rt:[ {d:CB([82,LOS],[90,LOS-10],[104,LOS-18],[114,LOS-24]), c:CLR.run,w:2.3,a:true} ] },

/* 35 */{ id:35,name:"DoubleEdge_Contain", label:"Double Edge Contain", cat:"stunt",
  sk:[ {x:58,y:LOS,t:"OL"},{x:94,y:LOS,t:"OL"} ],
  rt:[ {d:P([58,LOS],[48,LOS-10]), c:CLR.run,w:2.1,a:true},
       {d:P([94,LOS],[104,LOS-10]),c:CLR.run,w:2.1,a:true} ] },

/* 36 */{ id:36,name:"TE_Twist_Dog", label:"T/E Twist + Dog", cat:"stunt",
  sk:[ {x:70,y:LOS,t:"OL"},{x:82,y:LOS,t:"OL"},{x:92,y:88,t:"FB"} ],
  rt:[ {d:CB([70,LOS],[78,LOS-10],[90,LOS-18],[96,LOS-24]), c:CLR.run,w:2.2,a:true},
       {d:P([92,88],[90,74],[88,60]), c:CLR.motion,w:2.0,a:true,dsh:true} ] },

/* ═══ VI. DIME & 3RD DOWN (37-40) ═════════════════════════════════════ */
/* 37 */{ id:37,name:"Dime_C1_Pressure", label:"Dime C1 Pressure — 5-man", cat:"situational",
  sk:[ {x:110,y:78,t:"H"},{x:72,y:88,t:"FB"},{x:100,y:30,t:"WR"} ],
  rt:[ {d:P([110,78],[126,60],[140,46]), c:CLR.run,w:2.5,a:true},
       {d:P([72,88],[78,74],[84,60]),    c:CLR.run,w:2.3,a:true} ] },

/* 38 */{ id:38,name:"Dime_2Man", label:"Dime 2-Man (changeup)", cat:"situational",
  sk:[ {x:100,y:30,t:"WR"},{x:80,y:52,t:"WR"},{x:120,y:52,t:"WR"} ],
  rt:[ {d:P([100,30],[100,22]), c:CLR.pass,w:1.2,a:true,dsh:true},
       {d:P([80,52],[80,44]),   c:CLR.pass,w:1.2,a:true,dsh:true},
       {d:P([120,52],[120,44]), c:CLR.pass,w:1.2,a:true,dsh:true} ] },

/* 39 */{ id:39,name:"Dime_ZeroSimLook", label:"Dime Zero Sim Look — Show 6, rush 4", cat:"situational",
  sk:[ {x:78,y:78,t:"FB"},{x:86,y:78,t:"FB"},{x:110,y:78,t:"H"} ],
  rt:[ {d:P([78,78],[82,70]), c:CLR.motion,w:2.0,a:true,dsh:true},
       {d:P([86,78],[84,70]), c:CLR.motion,w:2.0,a:true,dsh:true},
       {d:P([110,78],[118,70]),c:CLR.motion,w:2.0,a:true,dsh:true} ] },

/* 40 */{ id:40,name:"Dime_Robber_Double", label:"Dime Robber Double", cat:"situational",
  sk:[ {x:100,y:30,t:"WR"},{x:100,y:56,t:"WR"},{x:34,y:50,t:"WR"} ],
  rt:[ {d:P([100,56],[80,58],[60,60]), c:CLR.pass,w:1.8,a:true},
       {d:P([34,50],[28,46],[24,42]),  c:CLR.pass,w:1.6,a:true},
       {d:P([100,30],[70,28],[44,26]), c:CLR.pass,w:1.6,a:true} ] },
];
