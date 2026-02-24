/* ════════════════════════════════════════════════════════════════════════
   4-3 OVER — DEFENSIVE CORE 40 (UI DATA)
   Structural Identity:
     - 3-tech to strength, 5-tech strong, 7/9 weak rush end
     - Single-gap penetration; SAM walked to strength; MIKE downhill; WILL scrape
     - Single-high / Tampa rotations; seam denial emphasis
   Categories mapped to your UI:
     run  => Front/pressure structures (fronts, rush/stunts, pressures)
     pass => Base coverages (shells/match)
     pa   => Sim pressures (creepers/replace)
     situational => Dime/3rd down & specialty calls
   Uses your existing helpers/constants: CLR, P, QQ, CB, LOS, OL_X
   NOTE: This is DEFENSE drawn on the same field.
     - "sk" uses defensive pieces as tokens:
         CB  (use WR color), S (use TE color), LB (use FB color), DL (use OL color)
       If you want true defensive icons, add to PLAYER_COLORS: {CB,S,LB,DL}
   ════════════════════════════════════════════════════════════════════════ */

export const DEF_43_OVER_CORE40 = [
/* ═══ I. BASE COVERAGE PACKAGE (1-10) ═══════════════════════════════════ */
/* Map to cat:"pass" */

/* 1 */
{
  id:1, name:"Over_C3_Sky", label:"Over C3 Sky – SS down, MOFC post", cat:"pass",
  sk:[
    // DL (aligned as 4-3 Over): 5T/3T/1T/7T
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    // LBs (SAM-MIKE-WILL)
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    // Secondary (CB/CB/FS/SS)
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"}, // FS post
    {x:142,y:58,t:"TE"}, // SS down (Sky)
  ],
  rt:[
    // Deep thirds (corners + FS)
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    // SS rotation down to curl/flat
    {d:P([142,58],[142,66],[150,72]), c:CLR.pass,w:1.6,a:true,dsh:true},
    // Hook/curl drops (SAM/MIKE/WILL)
    {d:P([128,78],[126,62]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([54,78],[56,62]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 2 */
{
  id:2, name:"Over_C3_Buzz", label:"Over C3 Buzz – WS buzz hook", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"}, // FS post
    {x:58,y:54,t:"TE"},  // WS buzz down
  ],
  rt:[
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([58,54],[70,60],[82,64]), c:CLR.pass,w:1.6,a:true,dsh:true}, // buzz path
    {d:P([128,78],[126,62]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([54,78],[56,62]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 3 */
{
  id:3, name:"Over_C3_Cloud", label:"Over C3 Cloud – boundary squat", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
    {x:32,y:54,t:"TE"}, // boundary cloud/squat
  ],
  rt:[
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true}, // field corner deep third
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},  // post
    {d:P([20,LOS],[20,42],[32,46]), c:CLR.pass,w:1.8,a:true}, // squat cloud
    {d:P([32,54],[34,56],[38,58]), c:CLR.pass,w:1.2,a:false,dsh:true},
    {d:P([128,78],[126,62]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([54,78],[56,62]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 4 */
{
  id:4, name:"Over_C1_Robber", label:"Over C1 Robber – WS low hole", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"}, // post
    {x:72,y:54,t:"TE"},  // robber
  ],
  rt:[
    {d:P([20,LOS],[20,28]), c:CLR.pass,w:2.2,a:true},   // man visual
    {d:P([180,LOS],[180,28]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true}, // post
    {d:P([72,54],[84,52],[96,54]), c:CLR.pass,w:1.8,a:true,dsh:true}, // robber roam
    {d:P([128,78],[128,60]), c:CLR.pass,w:1.2,a:true,dsh:true},
    {d:P([54,78],[54,60]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 5 */
{
  id:5, name:"Over_C1_Press", label:"Over C1 Press – tight outside leverage", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
    {x:142,y:60,t:"TE"},
  ],
  rt:[
    {d:P([20,LOS],[24,62]), c:CLR.pass,w:2.0,a:true},  // press trail visual
    {d:P([180,LOS],[176,62]), c:CLR.pass,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([142,60],[142,48]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 6 */
{
  id:6, name:"Over_Tampa2", label:"Over Tampa 2 – MIKE middle run", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:70,y:34,t:"TE"},{x:130,y:34,t:"TE"}, // two-deep halves
  ],
  rt:[
    {d:P([70,34],[52,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([130,34],[148,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([20,LOS],[32,56]), c:CLR.pass,w:1.6,a:true},  // corner squat/flat
    {d:P([180,LOS],[168,56]), c:CLR.pass,w:1.6,a:true},
    {d:P([84,74],[84,34]), c:CLR.pass,w:2.2,a:true,dsh:true}, // Mike run
    {d:P([128,78],[126,58]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([54,78],[56,58]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 7 */
{
  id:7, name:"Over_Quarters_Match", label:"Over Quarters Match – pattern read", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:70,y:38,t:"TE"},{x:130,y:38,t:"TE"},
  ],
  rt:[
    {d:P([20,LOS],[20,22]), c:CLR.pass,w:2.0,a:true},
    {d:P([180,LOS],[180,22]), c:CLR.pass,w:2.0,a:true},
    {d:P([70,38],[70,18]), c:CLR.pass,w:2.0,a:true},
    {d:P([130,38],[130,18]), c:CLR.pass,w:2.0,a:true},
    {d:P([84,74],[84,54]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 8 */
{
  id:8, name:"Over_C6_Field", label:"Over C6 Field – quarters to strength", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:132,y:38,t:"TE"}, // quarters safety to strength/field
    {x:72,y:34,t:"TE"},  // boundary half safety
  ],
  rt:[
    // Quarters side (field): corner + safety
    {d:P([180,LOS],[180,22]), c:CLR.pass,w:2.0,a:true},
    {d:P([132,38],[132,18]), c:CLR.pass,w:2.0,a:true},
    // Half side (boundary): corner squat + safety half
    {d:P([20,LOS],[20,42],[30,46]), c:CLR.pass,w:1.8,a:true},
    {d:P([72,34],[54,18]), c:CLR.pass,w:2.0,a:true},
    // Hooks
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 9 */
{
  id:9, name:"Over_C2_Press", label:"Over C2 Press – flat reroute", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:70,y:34,t:"TE"},{x:130,y:34,t:"TE"},
  ],
  rt:[
    {d:P([70,34],[52,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([130,34],[148,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([20,LOS],[24,62]), c:CLR.pass,w:2.0,a:true},  // press into flat
    {d:P([180,LOS],[176,62]), c:CLR.pass,w:2.0,a:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 10 */
{
  id:10, name:"Over_C3_SeamCarry", label:"Over C3 Seam Carry – SAM carry #2", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
    {x:128,y:78,t:"FB"}, // SAM emphasized
  ],
  rt:[
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:CB([128,78],[126,62],[124,46],[124,30]), c:CLR.pass,w:1.8,a:true,dsh:true}, // seam carry
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.2,a:true,dsh:true},
    {d:P([54,78],[56,62]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* ═══ II. FRONT VARIATIONS (11-15) ═════════════════════════════════════ */
/* Map to cat:"run" (front structure / run-fit emphasis) */

/* 11 */
{
  id:11, name:"Over_Wide9", label:"Over Wide 9 – weak DE in 9-tech", cat:"run",
  sk:[
    {x:52,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:126,y:LOS,t:"OL"}, // DL
    {x:140,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"}, // LBs
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    // Penetration arrows
    {d:P([72,LOS],[72,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([92,LOS],[92,LOS-10]), c:CLR.block,w:1.8,a:true},
    // Wide9 rush lane (weak end)
    {d:CB([126,LOS],[150,64],[170,46],[186,34]), c:CLR.run,w:2.6,a:true},
    // Strong end contain
    {d:CB([52,LOS],[44,64],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
  ],
},

/* 12 */
{
  id:12, name:"Over_TightFront", label:"Over Tight Front – reduced splits", cat:"run",
  sk:[
    {x:60,y:LOS,t:"OL"},{x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:112,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([78,LOS],[78,LOS-12]), c:CLR.block,w:2.0,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.block,w:2.0,a:true},
    {d:P([60,LOS],[60,LOS-8]), c:CLR.block,w:1.5,a:true},
    {d:P([112,LOS],[112,LOS-8]), c:CLR.block,w:1.5,a:true},
    {d:P([84,74],[84,60]), c:CLR.run,w:1.8,a:true}, // Mike downhill
  ],
},

/* 13 */
{
  id:13, name:"Over_Heavy", label:"Over Heavy – 5T strong, 4i weak", cat:"run",
  sk:[
    {x:50,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:120,y:LOS,t:"OL"},
    {x:136,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:56,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([72,LOS],[72,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([92,LOS],[92,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([50,LOS],[46,LOS-8]), c:CLR.block,w:1.6,a:true},
    {d:P([120,LOS],[116,LOS-8]), c:CLR.block,w:1.6,a:true},
    {d:P([136,78],[136,62]), c:CLR.run,w:1.8,a:true}, // SAM force/downhill
  ],
},

/* 14 */
{
  id:14, name:"Over_UnderShift", label:"Over Under Shift – slide front weak", cat:"run",
  sk:[
    {x:62,y:LOS,t:"OL"},{x:80,y:LOS,t:"OL"},{x:100,y:LOS,t:"OL"},{x:122,y:LOS,t:"OL"},
    {x:126,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:50,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([62,LOS],[58,LOS-8]), c:CLR.block,w:1.6,a:true},
    {d:P([80,LOS],[78,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([100,LOS],[98,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([122,LOS],[128,LOS-8]), c:CLR.block,w:1.6,a:true},
    {d:CB([50,78],[58,70],[70,64],[82,60]), c:CLR.run,w:1.8,a:true}, // WILL scrape flow
  ],
},

/* 15 */
{
  id:15, name:"Over_GoalLine_53", label:"Over Goal Line 5-3 – cover both guards", cat:"run",
  sk:[
    {x:46,y:LOS,t:"OL"},{x:62,y:LOS,t:"OL"},{x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:108,y:LOS,t:"OL"},
    {x:132,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},{x:100,y:36,t:"TE"},
  ],
  rt:[
    {d:P([62,LOS],[62,LOS-12]), c:CLR.block,w:2.2,a:true},
    {d:P([78,LOS],[78,LOS-12]), c:CLR.block,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.block,w:2.2,a:true},
    {d:P([46,LOS],[46,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([108,LOS],[108,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([84,74],[84,60]), c:CLR.run,w:2.0,a:true},
  ],
},

/* ═══ III. 4-MAN RUSH & STUNT MENU (16-20) ═════════════════════════════ */
/* Map to cat:"run" */

/* 16 */
{
  id:16, name:"TE_Twist_Strong", label:"T/E Twist Strong", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([72,LOS],[76,LOS-6],[84,LOS-10],[92,LOS-14]), c:CLR.pull,w:1.8,a:true}, // T loops
    {d:CB([92,LOS],[88,LOS-6],[80,LOS-10],[72,LOS-14]), c:CLR.pull,w:1.8,a:true}, // E wraps
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
  ],
},

/* 17 */
{
  id:17, name:"ET_Twist_Weak", label:"E/T Twist Weak", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([92,LOS],[96,LOS-6],[104,LOS-10],[112,LOS-14]), c:CLR.pull,w:1.8,a:true},
    {d:CB([118,LOS],[112,LOS-6],[104,LOS-10],[92,LOS-14]), c:CLR.pull,w:1.8,a:true},
    {d:CB([54,LOS],[44,64],[40,50],[38,38]), c:CLR.run,w:2.2,a:true},
    {d:CB([72,LOS],[74,LOS-10],[80,LOS-16],[90,LOS-22]), c:CLR.run,w:2.0,a:true},
  ],
},

/* 18 */
{
  id:18, name:"Interior_Pirate", label:"Interior Pirate – 3-tech loop", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([92,LOS],[88,LOS-6],[80,LOS-10],[72,LOS-14]), c:CLR.pull,w:2.0,a:true},  // 3-tech loops
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},                            // nose/1T pierce
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.0,a:true},
  ],
},

/* 19 */
{
  id:19, name:"Double_Edge_Contain", label:"Double Edge Contain", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([54,LOS],[44,64],[40,52],[38,42]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,52],[184,42]), c:CLR.run,w:2.2,a:true},
    {d:P([72,LOS],[72,LOS-10]), c:CLR.run,w:2.0,a:true},
    {d:P([92,LOS],[92,LOS-10]), c:CLR.run,w:2.0,a:true},
  ],
},

/* 20 */
{
  id:20, name:"NASCAR_Rush", label:"NASCAR Rush – nickel DE package", cat:"run",
  sk:[
    {x:52,y:LOS,t:"OL"},{x:74,y:LOS,t:"OL"},{x:96,y:LOS,t:"OL"},{x:132,y:LOS,t:"OL"},
    {x:100,y:32,t:"TE"},{x:84,y:74,t:"FB"},
  ],
  rt:[
    {d:CB([52,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.4,a:true},
    {d:CB([132,LOS],[152,62],[170,46],[186,34]), c:CLR.run,w:2.4,a:true},
    {d:P([74,LOS],[74,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([96,LOS],[96,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([84,74],[84,64]), c:CLR.block,w:1.2,a:true,dsh:true},
  ],
},

/* ═══ IV. FIRE ZONE PACKAGE (21-25) ═════════════════════════════════════ */
/* Map to cat:"run" (pressure structure with zone integrity) */

/* 21 */
{
  id:21, name:"Sam_Fire_C3", label:"Sam Fire C3 – SAM off edge", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    // 5th rusher (SAM)
    {d:CB([128,78],[140,70],[156,60],[172,46]), c:CLR.run,w:2.6,a:true},
    // 4 DL rush
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    // 3-deep / 3-under (visual)
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 22 */
{
  id:22, name:"Will_Fire_C3", label:"Will Fire C3 – boundary LB pressure", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([54,78],[44,70],[32,60],[22,46]), c:CLR.run,w:2.6,a:true}, // WILL fire
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 23 */
{
  id:23, name:"Nickel_Fire_Zone", label:"Nickel Fire 3-Under/3-Deep", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:74,t:"FB"},{x:84,y:74,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},{x:150,y:62,t:"TE"}, // nickel as S token
  ],
  rt:[
    {d:CB([150,62],[162,58],[174,52],[184,44]), c:CLR.run,w:2.6,a:true}, // nickel pressure
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 24 */
{
  id:24, name:"Strong_CrossDog_Zone", label:"Strong Cross Dog Zone", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([84,74],[78,68],[76,58],[72,46]), c:CLR.run,w:2.4,a:true}, // Mike cross
    {d:CB([128,78],[118,70],[108,60],[98,48]), c:CLR.run,w:2.4,a:true}, // Sam cross
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 25 */
{
  id:25, name:"Boundary_Cat_C3", label:"Boundary Cat C3", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},{x:28,y:62,t:"TE"}, // boundary cat
  ],
  rt:[
    {d:CB([28,62],[24,58],[20,52],[18,46]), c:CLR.run,w:2.6,a:true}, // corner cat
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* ═══ V. SIMULATED PRESSURE (26-30) ════════════════════════════════════ */
/* Map to cat:"pa" */

/* 26 */
{
  id:26, name:"Nickel_Sim_Strong", label:"Nickel Sim Strong – drop DE, bring nickel", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},
    {x:100,y:32,t:"TE"},{x:156,y:62,t:"TE"},
  ],
  rt:[
    {d:CB([156,62],[166,58],[176,52],[184,44]), c:CLR.run,w:2.4,a:true}, // nickel rush
    {d:CB([118,LOS],[130,58],[128,48],[122,44]), c:CLR.pass,w:1.8,a:true,dsh:true}, // DE drops
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 27 */
{
  id:27, name:"Mike_Mug_Sim", label:"Mike Mug Sim – A-gap show, rush 4", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:96,y:74,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([84,74],[84,62]), c:CLR.pa,w:1.6,a:true,dsh:true}, // mug show
    {d:P([96,74],[96,62]), c:CLR.pa,w:1.6,a:true,dsh:true},
    {d:CB([84,74],[82,66],[80,58],[78,50]), c:CLR.run,w:2.2,a:true}, // one rushes
    {d:CB([96,74],[98,66],[100,58],[102,50]), c:CLR.pass,w:1.8,a:true,dsh:true}, // one drops
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 28 */
{
  id:28, name:"Weak_Creeper", label:"Weak Creeper – boundary edge replace", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:54,y:78,t:"FB"},{x:84,y:74,t:"FB"},
    {x:100,y:32,t:"TE"},{x:36,y:62,t:"TE"},
  ],
  rt:[
    {d:CB([36,62],[32,58],[26,52],[20,44]), c:CLR.run,w:2.4,a:true}, // boundary creeper rush
    {d:CB([54,LOS],[58,58],[60,48],[62,44]), c:CLR.pass,w:1.8,a:true,dsh:true}, // weak DE drops
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 29 */
{
  id:29, name:"Tackle_Drop_Sim", label:"Tackle Drop Sim – 3-tech drops weak hook", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([92,LOS],[98,58],[94,52],[86,48]), c:CLR.pass,w:1.9,a:true,dsh:true}, // 3-tech drops
    {d:CB([128,78],[140,70],[156,60],[172,46]), c:CLR.run,w:2.4,a:true}, // replace rusher
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 30 */
{
  id:30, name:"Edge_Replace_Sim", label:"Edge Replace Sim – SAM drops, DE rush contain", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([128,78],[126,62],[124,50],[122,46]), c:CLR.pass,w:1.8,a:true,dsh:true}, // SAM drops
    {d:CB([118,LOS],[150,64],[172,48],[186,38]), c:CLR.run,w:2.4,a:true}, // DE rush contain lane
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* ═══ VI. MAN PRESSURE (31-35) ═════════════════════════════════════════ */
/* Map to cat:"run" (pressure) */

/* 31 */
{
  id:31, name:"Over_C1_CrossDog", label:"Over C1 Cross Dog", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([84,74],[78,68],[74,58],[70,48]), c:CLR.run,w:2.6,a:true},
    {d:CB([54,78],[62,70],[70,60],[78,50]), c:CLR.run,w:2.6,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.0,a:true}, // post
  ],
},

/* 32 */
{
  id:32, name:"Double_A_C1", label:"Double A Gap C1", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:96,y:74,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([84,74],[82,66],[80,58],[78,48]), c:CLR.run,w:2.8,a:true},
    {d:CB([96,74],[98,66],[100,58],[102,48]), c:CLR.run,w:2.8,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* 33 */
{
  id:33, name:"Nickel_Cat_C1", label:"Nickel Cat C1", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:156,y:62,t:"TE"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([156,62],[166,58],[176,52],[184,44]), c:CLR.run,w:2.8,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* 34 */
{
  id:34, name:"Over_C0_Edge", label:"Over C0 Edge", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:54,y:78,t:"FB"},
  ],
  rt:[
    {d:CB([128,78],[146,66],[168,50],[186,38]), c:CLR.run,w:2.8,a:true}, // edge blitz
    {d:CB([54,78],[44,70],[32,58],[22,46]), c:CLR.run,w:2.8,a:true},    // opposite pressure
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.4,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.4,a:true},
  ],
},

/* 35 */
{
  id:35, name:"Boundary_Zero_Cross", label:"Boundary Zero Cross", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:36,y:62,t:"TE"},
  ],
  rt:[
    {d:CB([36,62],[32,58],[26,52],[20,44]), c:CLR.run,w:2.8,a:true}, // boundary cat
    {d:CB([84,74],[78,68],[74,58],[70,48]), c:CLR.run,w:2.8,a:true}, // cross dog
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.4,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.4,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
  ],
},

/* ═══ VII. DIME & 3RD DOWN PACKAGE (36-40) ═════════════════════════════ */
/* Map to cat:"situational" */

/* 36 */
{
  id:36, name:"Dime_2Man", label:"Dime 2-Man", cat:"situational",
  sk:[
    {x:70,y:34,t:"TE"},{x:130,y:34,t:"TE"}, // two deep
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"}, // man visuals
    {x:84,y:62,t:"FB"}, // rat/low hole help
  ],
  rt:[
    {d:P([70,34],[52,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([130,34],[148,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([20,LOS],[20,30]), c:CLR.pass,w:2.0,a:true},
    {d:P([180,LOS],[180,30]), c:CLR.pass,w:2.0,a:true},
    {d:P([84,62],[84,54]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 37 */
{
  id:37, name:"Dime_C1_Robber", label:"Dime C1 Robber", cat:"situational",
  sk:[
    {x:100,y:32,t:"TE"}, // post
    {x:76,y:54,t:"TE"},  // robber
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
  ],
  rt:[
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([76,54],[88,52],[100,54]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([20,LOS],[20,28]), c:CLR.pass,w:2.0,a:true},
    {d:P([180,LOS],[180,28]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* 38 */
{
  id:38, name:"Dime_Drop8_Cloud", label:"Dime Drop-8 Cloud", cat:"situational",
  sk:[
    {x:32,y:54,t:"TE"},{x:168,y:54,t:"TE"}, // cloud squat corners
    {x:70,y:34,t:"TE"},{x:130,y:34,t:"TE"}, // two-deep-ish shells
    {x:84,y:58,t:"FB"},{x:60,y:58,t:"FB"},{x:108,y:58,t:"FB"},
  ],
  rt:[
    {d:P([32,54],[34,56],[38,58]), c:CLR.pass,w:1.6,a:false,dsh:true},
    {d:P([168,54],[166,56],[162,58]), c:CLR.pass,w:1.6,a:false,dsh:true},
    {d:P([70,34],[52,18]), c:CLR.pass,w:2.0,a:true},
    {d:P([130,34],[148,18]), c:CLR.pass,w:2.0,a:true},
    {d:P([84,58],[84,44]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([60,58],[60,44]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([108,58],[108,44]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 39 */
{
  id:39, name:"Dime_Sim_Bracket_Slot", label:"Dime Sim + Bracket Slot", cat:"situational",
  sk:[
    {x:100,y:32,t:"TE"}, // post
    {x:156,y:62,t:"TE"}, // nickel/slot bracket piece
    {x:144,y:54,t:"TE"}, // over-top bracket piece
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
  ],
  rt:[
    {d:CB([156,62],[166,58],[176,52],[184,44]), c:CLR.run,w:2.4,a:true}, // sim rusher
    {d:CB([118,LOS],[130,58],[128,48],[122,44]), c:CLR.pass,w:1.8,a:true,dsh:true}, // dropper
    {d:P([156,62],[150,58],[144,54]), c:CLR.pass,w:1.6,a:true,dsh:true}, // bracket in
    {d:P([144,54],[140,44]), c:CLR.pass,w:1.6,a:true,dsh:true},          // bracket top
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* 40 */
{
  id:40, name:"3L_DoubleThreat_Sim", label:"3rd Long Double Threat – Bracket X + interior sim", cat:"situational",
  sk:[
    {x:20,y:LOS,t:"WR"}, // X bracket target marker
    {x:32,y:54,t:"TE"},{x:52,y:44,t:"TE"}, // bracket pieces
    {x:84,y:74,t:"FB"},
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:100,y:32,t:"TE"}, // post
  ],
  rt:[
    // Bracket X
    {d:P([32,54],[26,52],[20,50]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([52,44],[40,44],[28,46]), c:CLR.pass,w:1.8,a:true,dsh:true},
    // Interior sim (show mug then drop one)
    {d:P([84,74],[84,62]), c:CLR.pa,w:1.6,a:true,dsh:true},
    {d:CB([84,74],[82,66],[80,58],[78,50]), c:CLR.run,w:2.2,a:true},
    {d:CB([92,LOS],[98,58],[94,52],[86,48]), c:CLR.pass,w:1.9,a:true,dsh:true}, // tackle drop
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.0,a:true},
  ],
},
];
