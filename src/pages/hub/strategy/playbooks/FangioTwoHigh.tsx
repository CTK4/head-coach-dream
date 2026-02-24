/* ═══ FANGIO TWO-HIGH — MATCH / DISGUISE CORE 40 ═══
   Same shape: { id, name, label, cat, sk, rt }
   Suggested DEF categories (add to CAT_META if you want UI tabs):
     - 'coverage' (base calls)
     - 'sim'      (sim pressure / creepers)
     - 'pressure' (true pressures)
     - 'situational' (3rd/long, red zone, goal line, 2-min)
   For now, I’m using cat values: 'coverage' | 'sim' | 'pressure' | 'situational'

   You’ll need to extend PLAYER_COLORS with:
     CB, S, LB, EDGE, DT, N (nickel)
   Example:
     CB:'#38bdf8', S:'#a78bfa', LB:'#34d399', EDGE:'#fb923c', DT:'#94a3b8', N:'#f472b6'

   And add some line colors (or map them onto your existing CLR.*):
*/
const DCLR = {
  zone:    '#38bdf8',   // match-zone drops
  man:     '#fbbf24',   // lock/MEG
  pressure:'#ef4444',   // rush/pressure paths
  sim:     '#c084fc',   // sim / creeper paths
  disguise:'#ff7c2a',   // late rotation / stem
  contain: '#00ff88',   // contain/edge set
  spy:     '#f472b6',   // spy/rat
};

const FANGIO_TWO_HIGH_PLAYS = [
/* ═══════════════════════════════════════════════
   BASE COVERAGE (MATCH / DISGUISE) 1–16
   ═══════════════════════════════════════════════ */
{
  id:1, name:'Quarters_Match_Stubbie', label:'Quarters Match (Stubbie / MEG)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // DL rush lanes (light)
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.contain,w:1.4,a:true},
    {d:P([156,LOS-6],[162,LOS+6]), c:DCLR.contain,w:1.4,a:true},

    // Quarters match drops
    {d:P([26,LOS-10],[26,28]), c:DCLR.man,w:2.0,a:true},     // CB MEG / press-man cue
    {d:P([150,LOS-10],[150,28]), c:DCLR.man,w:2.0,a:true},
    {d:CB([62,LOS-18],[62,46],[72,40],[82,36]), c:DCLR.zone,w:2.0,a:true},  // S match seam
    {d:CB([138,LOS-18],[138,46],[128,40],[118,36]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[62,46],[78,54],[92,56]), c:DCLR.zone,w:1.6,a:true},   // LB hook/curl match
    {d:CB([118,LOS-8],[114,46],[98,54],[84,56]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:2, name:'Quarters_Match_Palms', label:'Cover 2-Read / Palms (2x2)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.contain,w:1.4,a:true},
    {d:P([156,LOS-6],[162,LOS+6]), c:DCLR.contain,w:1.4,a:true},

    // CB squat + trap feel, S over top (2-read)
    {d:P([26,LOS-10],[22,52],[30,56]), c:DCLR.zone,w:2.0,a:true}, // CB squat/trap
    {d:P([150,LOS-10],[154,52],[146,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},         // S deep half/quarter
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[70,50],[82,54],[94,54]), c:DCLR.zone,w:1.6,a:true},   // hook/curl
    {d:CB([118,LOS-8],[106,50],[94,54],[82,54]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:3, name:'Cover6_QuarterQuarterHalf', label:'Cover 6 (Q/Q/H) — Boundary Half', cat:'coverage',
  sk:[
    {x:24,y:LOS-10,t:'CB'},{x:56,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:120,y:LOS-8,t:'LB'},{x:152,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.contain,w:1.4,a:true},
    {d:P([156,LOS-6],[162,LOS+6]), c:DCLR.contain,w:1.4,a:true},

    // Left side quarter, right side half
    {d:P([24,LOS-10],[24,30]), c:DCLR.man,w:2.0,a:true},      // CB MEG/quarter
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},     // S deep quarter
    {d:P([152,LOS-10],[152,54]), c:DCLR.zone,w:2.0,a:true},   // CB cloud/squat (half side)
    {d:P([138,LOS-18],[138,18]), c:DCLR.zone,w:2.0,a:true},   // S deep half
    {d:CB([56,LOS-8],[66,50],[82,56],[94,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([120,LOS-8],[112,48],[96,54],[84,56]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:4, name:'Cover7_Bracket_Stubbie', label:'Cover 7 Brackets (Stubbie)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-8,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:116,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},

    // Bracket left (CB outside, S inside)
    {d:CB([26,LOS-10],[28,44],[30,44],[34,40]), c:DCLR.man,w:2.0,a:true},
    {d:CB([62,LOS-18],[56,44],[50,44],[44,40]), c:DCLR.man,w:2.0,a:true},

    // Match right as quarters
    {d:P([150,LOS-10],[150,28]), c:DCLR.man,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},

    {d:CB([60,LOS-8],[70,56],[88,58],[100,60]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([116,LOS-8],[110,50],[94,54],[82,56]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:5, name:'2High_Shell_To_3Match', label:'Disguise: 2-High Shell → 3-Match', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // late rotation (one safety down to hook, other to middle third)
    {d:P([62,LOS-18],[78,LOS-6]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([138,LOS-18],[100,24]), c:DCLR.disguise,w:1.6,a:true,dsh:true},

    // 3-match landmarks
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},    // CB deep third
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,24],[100,14]), c:DCLR.zone,w:2.2,a:true},      // post safety
    {d:CB([58,LOS-8],[70,50],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,50],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},

    // rush lanes
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:6, name:'2High_Shell_To_1Robber', label:'Disguise: 2-High → Cover 1 Robber', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // rotation
    {d:P([62,LOS-18],[100,20]), c:DCLR.disguise,w:1.6,a:true,dsh:true}, // post
    {d:P([138,LOS-18],[100,56]), c:DCLR.disguise,w:1.6,a:true,dsh:true}, // robber down

    // man shells
    {d:P([26,LOS-10],[26,26]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-10],[150,26]), c:DCLR.man,w:2.2,a:true},
    {d:CB([58,LOS-8],[62,46],[80,52],[92,54]), c:DCLR.man,w:2.0,a:true},
    {d:CB([118,LOS-8],[114,46],[98,52],[88,54]), c:DCLR.man,w:2.0,a:true},
    {d:CB([100,56],[92,44],[92,34],[100,30]), c:DCLR.spy,w:1.8,a:true}, // robber/rat
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:7, name:'Tite_Front_Quarters', label:'Tite Front + Quarters Match', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:56,y:LOS-12,t:'EDGE'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:120,y:LOS-12,t:'EDGE'},{x:150,y:LOS-10,t:'CB'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    // tite front rush
    {d:P([82,LOS-6],[78,LOS+10]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[98,LOS+10]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([56,LOS-12],[46,LOS+6]), c:DCLR.contain,w:1.4,a:true},
    {d:P([120,LOS-12],[130,LOS+6]), c:DCLR.contain,w:1.4,a:true},

    // quarters
    {d:P([26,LOS-10],[26,28]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,28]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[66,50],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,50],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:8, name:'Nickel_Over_Quarters', label:'Nickel Over + Quarters', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:112,y:LOS-10,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([44,LOS-8],[38,LOS+6]), c:DCLR.contain,w:1.4,a:true},
    {d:P([156,LOS-8],[162,LOS+6]), c:DCLR.contain,w:1.4,a:true},

    {d:P([26,LOS-10],[26,28]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,28]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([60,LOS-10],[70,52],[86,56],[98,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([112,LOS-10],[106,52],[92,56],[82,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:9, name:'Cover8_Poach', label:'Poach (3x1) — Weak Safety Poach', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:120,y:LOS-10,t:'LB'},{x:152,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},

    // strong side match, weak safety poach cross
    {d:P([26,LOS-10],[26,34]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([152,LOS-10],[152,28]), c:DCLR.man,w:2.0,a:true},
    {d:CB([138,LOS-18],[126,26],[104,30],[92,28]), c:DCLR.zone,w:2.0,a:true}, // poach
    {d:CB([60,LOS-10],[70,56],[88,58],[104,60]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([120,LOS-10],[112,50],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:10, name:'Cover2_Trap', label:'Cover 2 Trap (Corner Trap)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([26,LOS-10],[22,52],[30,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[154,52],[146,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([62,LOS-18],[62,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,18]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,52],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:11, name:'Cover3_Match', label:'Cover 3 Match (Rip/Liz)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,44],[88,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([138,LOS-14],[128,44],[112,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:12, name:'Cover4_Quarters_Squeeze', label:'Quarters Squeeze (TE / Slot Heavy)', cat:'coverage',
  sk:[
    {x:28,y:LOS-10,t:'CB'},{x:62,y:LOS-12,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:110,y:LOS-12,t:'LB'},{x:148,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([28,LOS-10],[28,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([148,LOS-10],[148,30]), c:DCLR.man,w:2.0,a:true},
    {d:CB([62,LOS-18],[70,40],[78,38],[86,34]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([138,LOS-18],[130,40],[122,38],[114,34]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([62,LOS-12],[70,54],[86,58],[98,60]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([110,LOS-12],[104,50],[90,56],[82,58]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:13, name:'Cover6_Stump', label:'Cover 6 “Stump” (Trips Checks)', cat:'coverage',
  sk:[
    {x:24,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-10,t:'LB'},{x:152,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    // stump side (nickel + safety combo)
    {d:P([60,LOS-10],[60,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,18]), c:DCLR.zone,w:2.0,a:true},

    // opposite quarters
    {d:P([24,LOS-10],[24,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},

    {d:P([152,LOS-10],[152,30]), c:DCLR.man,w:2.0,a:true},
    {d:CB([118,LOS-10],[112,50],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:14, name:'2High_Shell_To_2Trap', label:'Disguise: 2-High → 2-Trap', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    // stem then trap
    {d:P([26,LOS-10],[26,36]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([150,LOS-10],[150,36]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([26,36],[22,52],[30,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,36],[154,52],[146,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([62,LOS-18],[62,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:15, name:'Quarters_Match_Red2', label:'Quarters “Red 2” (Cloud to Match)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([26,LOS-10],[22,54],[30,56]), c:DCLR.zone,w:2.0,a:true}, // cloud corner
    {d:P([150,LOS-10],[154,54],[146,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[66,48],[82,54],[94,56]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,48],[96,54],[84,56]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:16, name:'Cover1_Hole', label:'Cover 1 (Low Hole / Rat)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([26,LOS-10],[26,26]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-10],[150,26]), c:DCLR.man,w:2.2,a:true},
    {d:CB([58,LOS-8],[62,46],[80,52],[92,54]), c:DCLR.man,w:2.0,a:true},
    {d:CB([118,LOS-8],[114,46],[98,52],[88,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([100,LOS-18],[100,18]), c:DCLR.zone,w:2.2,a:true}, // post
    {d:CB([138,LOS-18],[128,46],[110,50],[100,54]), c:DCLR.spy,w:1.8,a:true}, // rat
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},

/* ═══════════════════════════════════════════════
   SIM PRESSURE / CREEPERS 17–28
   (4-man rush with late add/drop; Fangio staple)
   ═══════════════════════════════════════════════ */
{
  id:17, name:'Creeper_Sam_Add', label:'Creeper: SAM Adds, DE Drops', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // rush: DT/DT + SAM (LB) + one EDGE
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([58,LOS-8],[70,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:P([156,LOS-6],[162,LOS+6]), c:DCLR.sim,w:1.8,a:true},

    // dropper: opposite EDGE to hook
    {d:CB([44,LOS-6],[52,40],[66,46],[78,50]), c:DCLR.zone,w:1.8,a:true,dsh:true},

    // coverage: quarters shell
    {d:P([26,LOS-10],[26,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([118,LOS-8],[110,50],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:18, name:'Creeper_Will_Add', label:'Creeper: WILL Adds, N Drops', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([118,LOS-8],[106,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:P([44,LOS-8],[38,LOS+6]), c:DCLR.sim,w:1.8,a:true},

    {d:CB([60,LOS-10],[70,44],[88,50],[100,54]), c:DCLR.zone,w:1.8,a:true,dsh:true}, // nickel drop

    {d:P([26,LOS-10],[26,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
  ],
},
{
  id:19, name:'Sim_Pressure_Mug', label:'Sim: Double Mug → Drop Out', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:92,y:LOS-12,t:'LB'},{x:108,y:LOS-12,t:'LB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    // show mug (disguise)
    {d:P([92,LOS-12],[92,LOS-2]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([108,LOS-12],[108,LOS-2]), c:DCLR.disguise,w:1.6,a:true,dsh:true},

    // rush 4: DT/DT + one mug + one edge (implied)
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([92,LOS-12],[92,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([108,LOS-12],[108,44]), c:DCLR.zone,w:1.8,a:true,dsh:true}, // drop-out hook

    // quarters behind it
    {d:P([26,LOS-10],[26,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[66,50],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,50],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:20, name:'Creeper_Field', label:'Creeper: Field Pressure (3x1)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-10,t:'LB'},{x:152,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([60,LOS-10],[72,LOS+6]), c:DCLR.sim,w:1.8,a:true},     // nickel add
    {d:CB([44,LOS-8],[54,44],[66,48],[78,52]), c:DCLR.zone,w:1.8,a:true,dsh:true}, // edge drops

    {d:P([26,LOS-10],[26,34]), c:DCLR.man,w:2.0,a:true},
    {d:P([152,LOS-10],[152,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([138,LOS-18],[126,26],[104,30],[92,28]), c:DCLR.zone,w:2.0,a:true}, // poach
    {d:CB([118,LOS-10],[112,50],[98,56],[86,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:21, name:'Sim_5ManLook_4Rush', label:'Sim: 5-Man Look, 4 Rush', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-10,t:'N'},{x:78,y:LOS-6,t:'DT'},{x:90,y:LOS-6,t:'DT'},{x:104,y:LOS-6,t:'EDGE'},{x:120,y:LOS-10,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    // show 5, drop one
    {d:P([104,LOS-6],[110,44]), c:DCLR.zone,w:1.8,a:true,dsh:true}, // dropper

    {d:P([78,LOS-6],[78,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([90,LOS-6],[90,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([58,LOS-10],[66,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:P([120,LOS-10],[112,LOS+6]), c:DCLR.sim,w:1.8,a:true},

    {d:P([26,LOS-10],[26,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
  ],
},
{
  id:22, name:'Creeper_CrossDog', label:'Creeper: Cross-Dog (ILB Exchange)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([58,LOS-8],[70,LOS+4],[88,LOS+6],[100,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([118,LOS-8],[106,LOS+4],[88,LOS+6],[80,LOS+8]), c:DCLR.sim,w:1.8,a:true},

    {d:P([26,LOS-10],[26,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
  ],
},
{
  id:23, name:'Sim_Pressure_Tite', label:'Sim: Tite + Safety Replace', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:56,y:LOS-12,t:'EDGE'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:120,y:LOS-12,t:'EDGE'},{x:150,y:LOS-10,t:'CB'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    // safety replaces hook after ILB blitz
    {d:P([62,LOS-18],[78,LOS-6]), c:DCLR.disguise,w:1.6,a:true,dsh:true},

    {d:P([82,LOS-6],[78,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[98,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([58,LOS-8],[70,LOS+8]), c:DCLR.sim,w:1.8,a:true}, // ILB add
    {d:P([56,LOS-12],[46,LOS+6]), c:DCLR.contain,w:1.4,a:true},

    {d:CB([78,LOS-6],[74,44],[84,54],[96,58]), c:DCLR.zone,w:1.6,a:true}, // hook replace
    {d:P([26,LOS-10],[26,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
  ],
},
{
  id:24, name:'Creeper_Boundary', label:'Creeper: Boundary Pressure', cat:'sim',
  sk:[
    {x:22,y:LOS-10,t:'CB'},{x:56,y:LOS-10,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:120,y:LOS-10,t:'N'},{x:154,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([44,LOS-8],[38,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([120,LOS-10],[112,44],[96,52],[84,56]), c:DCLR.zone,w:1.8,a:true,dsh:true}, // nickel drops

    {d:P([22,LOS-10],[22,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([154,LOS-10],[154,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([56,LOS-10],[66,50],[82,56],[94,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:25, name:'Sim_ZoneDrop_Ends', label:'Sim: Zone Drop Ends (3-Under/3-Deep)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // ends drop, rush only 2 DT + 2 ILB (sim 4)
    {d:CB([44,LOS-6],[52,44],[66,46],[78,50]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    {d:CB([156,LOS-6],[148,44],[134,46],[122,50]), c:DCLR.zone,w:1.8,a:true,dsh:true},

    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([58,LOS-8],[70,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([118,LOS-8],[110,LOS+8]), c:DCLR.sim,w:1.8,a:true},

    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([62,LOS-18],[62,24]), c:DCLR.zone,w:1.6,a:true,dsh:true},
    {d:P([138,LOS-18],[138,24]), c:DCLR.zone,w:1.6,a:true,dsh:true},
  ],
},
{
  id:26, name:'Sim_Rat_Replace', label:'Sim: Rat Replace (Robber w/ 4 Rush)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-10,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([44,LOS-8],[38,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:P([156,LOS-8],[162,LOS+6]), c:DCLR.sim,w:1.8,a:true},

    // robber/rat safety down
    {d:P([138,LOS-18],[100,56]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:CB([100,56],[92,44],[92,34],[100,30]), c:DCLR.spy,w:1.8,a:true},

    // man shells
    {d:P([26,LOS-10],[26,26]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-10],[150,26]), c:DCLR.man,w:2.2,a:true},
    {d:CB([60,LOS-10],[70,50],[86,54],[98,56]), c:DCLR.man,w:2.0,a:true},
    {d:CB([118,LOS-10],[112,50],[98,54],[88,56]), c:DCLR.man,w:2.0,a:true},
    {d:P([100,LOS-18],[100,18]), c:DCLR.zone,w:2.2,a:true},
  ],
},
{
  id:27, name:'Creeper_FireZone', label:'Creeper: Fire Zone (3 Under / 3 Deep)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
    {x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
  ],
  rt:[
    // rush 4
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:P([118,LOS-8],[110,LOS+8]), c:DCLR.sim,w:1.8,a:true},

    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},

    // 3 under
    {d:CB([58,LOS-8],[66,50],[82,56],[94,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([156,LOS-6],[148,44],[134,46],[122,50]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    {d:CB([62,LOS-14],[72,44],[88,50],[100,54]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:28, name:'Sim_ZoneExchange', label:'Sim: Zone Exchange (Edge/LB Swap)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // exchange: edge drops, LB rush
    {d:CB([156,LOS-6],[148,44],[134,46],[122,50]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    {d:P([118,LOS-8],[110,LOS+8]), c:DCLR.sim,w:1.8,a:true},

    // rush rest
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.sim,w:1.8,a:true},

    // quarters behind
    {d:P([26,LOS-10],[26,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[66,50],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},

/* ═══════════════════════════════════════════════
   TRUE PRESSURES 29–34
   (still “Fangio style”: selective, leverage-based)
   ═══════════════════════════════════════════════ */
{
  id:29, name:'DB_Pressure_Field', label:'DB Pressure: Field Nickel', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-10,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([60,LOS-10],[72,LOS+10]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-8],[38,LOS+8]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([156,LOS-8],[162,LOS+8]), c:DCLR.pressure,w:2.0,a:true},

    // 2-high behind it
    {d:P([26,LOS-10],[26,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([150,LOS-10],[150,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,18]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([118,LOS-10],[112,50],[98,56],[86,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:30, name:'DoubleA_GreenDog', label:'Double A-Gap (Green Dog)', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:92,y:LOS-12,t:'LB'},{x:108,y:LOS-12,t:'LB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([92,LOS-12],[92,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([108,LOS-12],[108,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},

    // cover 1 behind
    {d:P([26,LOS-10],[26,26]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-10],[150,26]), c:DCLR.man,w:2.2,a:true},
    {d:P([62,LOS-18],[100,18]), c:DCLR.zone,w:2.0,a:true,dsh:true}, // rotate to post
    {d:CB([138,LOS-18],[110,50],[100,54],[92,54]), c:DCLR.spy,w:1.8,a:true}, // robber
  ],
},
{
  id:31, name:'Slot_Cat', label:'Slot Cat (Corner/Slot Pressure)', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:120,y:LOS-10,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([60,LOS-10],[66,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-8],[38,LOS+8]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([156,LOS-8],[162,LOS+8]), c:DCLR.pressure,w:2.0,a:true},

    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([62,LOS-18],[62,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,18]), c:DCLR.zone,w:2.0,a:true},
  ],
},
{
  id:32, name:'Safety_Blitz_Replace', label:'Safety Blitz + Replace Rotation', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([138,LOS-18],[126,LOS+10]), c:DCLR.pressure,w:2.2,a:true}, // safety blitz
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([44,LOS-8],[38,LOS+8]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([156,LOS-8],[162,LOS+8]), c:DCLR.pressure,w:2.0,a:true},

    // replace: LB rotates to half
    {d:P([118,LOS-8],[138,18]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([62,LOS-18],[62,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[66,50],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:33, name:'Edge_Pressure_Boundary', label:'Edge Pressure (Boundary) + Trap', cat:'pressure',
  sk:[
    {x:22,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:154,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([44,LOS-6],[34,LOS+10]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([156,LOS-6],[166,LOS+8]), c:DCLR.pressure,w:2.0,a:true},

    // trap behind it
    {d:P([22,LOS-10],[18,52],[26,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([154,LOS-10],[158,52],[150,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([62,LOS-18],[62,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,18]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:34, name:'Zero_Pressure', label:'Cover 0 (All Out / Short Yardage)', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:60,y:LOS-10,t:'N'},{x:120,y:LOS-10,t:'LB'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([44,LOS-6],[38,LOS+10]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([82,LOS-6],[82,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([94,LOS-6],[94,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([156,LOS-6],[162,LOS+10]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([58,LOS-8],[70,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([118,LOS-8],[110,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([60,LOS-10],[60,LOS+10]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([120,LOS-10],[120,LOS+10]), c:DCLR.pressure,w:2.2,a:true},

    // lock man (minimal)
    {d:P([26,LOS-10],[26,30]), c:DCLR.man,w:2.2,a:true,dsh:true},
    {d:P([150,LOS-10],[150,30]), c:DCLR.man,w:2.2,a:true,dsh:true},
  ],
},

/* ═══════════════════════════════════════════════
   SITUATIONAL 35–40 (3rd/long, red zone, goal line)
   ═══════════════════════════════════════════════ */
{
  id:35, name:'3rdLong_Dime_Quarters', label:'3rd & Long: Dime Quarters (2-Man Match)', cat:'situational',
  sk:[
    {x:22,y:LOS-12,t:'CB'},{x:52,y:LOS-12,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:124,y:LOS-12,t:'N'},{x:154,y:LOS-12,t:'CB'},
    {x:62,y:LOS-22,t:'S'},{x:138,y:LOS-22,t:'S'},
    {x:58,y:LOS-8,t:'EDGE'},{x:118,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+6]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+6]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([58,LOS-8],[52,LOS+4]), c:DCLR.contain,w:1.4,a:true},
    {d:P([118,LOS-8],[124,LOS+4]), c:DCLR.contain,w:1.4,a:true},

    {d:P([22,LOS-12],[22,24]), c:DCLR.man,w:2.0,a:true},
    {d:P([154,LOS-12],[154,24]), c:DCLR.man,w:2.0,a:true},
    {d:P([52,LOS-12],[52,34]), c:DCLR.man,w:2.0,a:true},
    {d:P([124,LOS-12],[124,34]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-22],[62,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([138,LOS-22],[138,14]), c:DCLR.zone,w:2.2,a:true},
  ],
},
{
  id:36, name:'RedZone_Palms', label:'Red Zone: Palms / 2-Read (Trap Ready)', cat:'situational',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:58,y:LOS-8,t:'LB'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-8,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([26,LOS-10],[22,52],[30,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[154,52],[146,56]), c:DCLR.zone,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[66,50],[82,54],[94,56]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,50],[96,54],[84,56]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+6]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+6]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:37, name:'GoalLine_6-1', label:'Goal Line: 6-1 (Spill/Force)', cat:'situational',
  sk:[
    {x:22,y:LOS-6,t:'EDGE'},{x:44,y:LOS-6,t:'DT'},{x:68,y:LOS-6,t:'DT'},{x:92,y:LOS-6,t:'DT'},{x:116,y:LOS-6,t:'DT'},{x:140,y:LOS-6,t:'DT'},{x:162,y:LOS-6,t:'EDGE'},
    {x:58,y:LOS-14,t:'LB'},{x:100,y:LOS-14,t:'LB'},{x:142,y:LOS-14,t:'LB'},
    {x:26,y:LOS-12,t:'CB'},{x:150,y:LOS-12,t:'CB'},
  ],
  rt:[
    {d:P([22,LOS-6],[14,LOS+10]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-6],[44,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([68,LOS-6],[68,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([92,LOS-6],[92,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([116,LOS-6],[116,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([140,LOS-6],[140,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([162,LOS-6],[170,LOS+10]), c:DCLR.pressure,w:2.2,a:true},

    {d:P([26,LOS-12],[26,46]), c:DCLR.man,w:2.0,a:true,dsh:true},
    {d:P([150,LOS-12],[150,46]), c:DCLR.man,w:2.0,a:true,dsh:true},
  ],
},
{
  id:38, name:'2Min_Prevent_Quarters', label:'2-Minute: Prevent Quarters (Deep Leverage)', cat:'situational',
  sk:[
    {x:18,y:LOS-16,t:'CB'},{x:48,y:LOS-16,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:132,y:LOS-16,t:'N'},{x:182,y:LOS-16,t:'CB'},
    {x:62,y:LOS-26,t:'S'},{x:138,y:LOS-26,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([18,LOS-16],[18,20]), c:DCLR.zone,w:2.0,a:true},
    {d:P([182,LOS-16],[182,20]), c:DCLR.zone,w:2.0,a:true},
    {d:P([62,LOS-26],[62,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([138,LOS-26],[138,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([48,LOS-16],[60,40],[82,46],[100,50]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([132,LOS-16],[120,40],[98,46],[84,50]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+4]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+4]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:39, name:'3rdMedium_Sim_Poach', label:'3rd & Medium: Sim Poach (3x1)', cat:'situational',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-10,t:'LB'},{x:152,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([60,LOS-10],[72,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([44,LOS-8],[54,44],[66,48],[78,52]), c:DCLR.zone,w:1.8,a:true,dsh:true},

    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([152,LOS-10],[152,30]), c:DCLR.man,w:2.0,a:true},
    {d:P([62,LOS-18],[62,22]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([138,LOS-18],[126,26],[104,30],[92,28]), c:DCLR.zone,w:2.0,a:true}, // poach
    {d:CB([118,LOS-10],[112,50],[98,56],[86,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:40, name:'RedZone_1Robber', label:'Red Zone: 1 Robber (Cut Crossers)', cat:'situational',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:60,y:LOS-10,t:'N'},{x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},{x:118,y:LOS-10,t:'LB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([138,LOS-18],[100,56]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:CB([100,56],[92,44],[92,34],[100,30]), c:DCLR.spy,w:1.8,a:true},

    {d:P([26,LOS-10],[26,26]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-10],[150,26]), c:DCLR.man,w:2.2,a:true},
    {d:P([60,LOS-10],[60,34]), c:DCLR.man,w:2.0,a:true},
    {d:P([118,LOS-10],[118,34]), c:DCLR.man,w:2.0,a:true},
    {d:P([100,LOS-18],[100,18]), c:DCLR.zone,w:2.2,a:true},

    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([44,LOS-8],[38,LOS+6]), c:DCLR.contain,w:1.4,a:true},
    {d:P([156,LOS-8],[162,LOS+6]), c:DCLR.contain,w:1.4,a:true},
  ],
},
];

/* If you want EXACT “40 in one array” consumption with your UI as-is:
   - Add CAT_META entries for 'coverage' and 'sim' and 'pressure'
   - Or remap:
       coverage -> 'pass'
       sim      -> 'pa'
       pressure -> 'run'
     (not ideal semantically, but zero UI changes)
*/
