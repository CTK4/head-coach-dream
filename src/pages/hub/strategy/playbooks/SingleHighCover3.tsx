/* ════════════════════════════════════════════════════════════════════════
   COVER 3 SINGLE-HIGH — DEFENSIVE CORE 40 (UI DATA)

   System Identity (MOFC / Post safety / rotation tags)
   - 3-deep / 4-under on base C3 (Sky/Buzz/Cloud)
   - Force player depends on rotation (Sky: SS force; Buzz: WS force; Cloud: CB force)
   - Seam collision priority (10–12y), hook droppers carry then sink
   - Pressure menu built around Fire Zone + Sim/Creeper while keeping C3 shell

   Categories mapped to your UI:
     pass         => Base Structure + Man-blended (coverage-first)
     run          => Front Variations + Fire Zone (pressure structures)
     pa           => Simulated Pressure (creepers/exchange)
     situational  => Dime + Red Zone + Goal Line

   Uses existing helpers/constants: CLR, P, QQ, CB, LOS
   Tokens (since defense icons may not exist):
     DL  => "OL"
     LB  => "FB"
     S   => "TE"
     CB  => "WR"

   Note: Diagrams are schematic, not literal leverage-perfect.
   ════════════════════════════════════════════════════════════════════════ */

export const DEF_C3_SINGLE_HIGH_CORE40 = [
/* ═══ I. BASE STRUCTURE (1-10) ══════════════════════════════════════════ */
/* 1 */
{
  id:1, name:"C3_Sky", label:"C3 Sky – SS force, curl/flat drop", cat:"pass",
  sk:[
    // 4-down front reference
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    // LBs (SAM/MIKE/WILL)
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    // CBs
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    // Post safety + strong safety down (Sky)
    {x:100,y:32,t:"TE"},{x:142,y:58,t:"TE"},
  ],
  rt:[
    // Deep thirds
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    // SS to curl/flat (force)
    {d:P([142,58],[150,66],[160,74]), c:CLR.pass,w:1.7,a:true,dsh:true},
    // Hook droppers
    {d:P([128,78],[126,62]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([54,78],[56,62]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 2 */
{
  id:2, name:"C3_Buzz", label:"C3 Buzz – WS hook buzz", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
    {x:58,y:54,t:"TE"}, // WS buzzing
  ],
  rt:[
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    // Buzz to hook
    {d:P([58,54],[72,58],[88,58]), c:CLR.pass,w:1.8,a:true,dsh:true},
    // Curl/flat by OLB/CB spacing
    {d:P([128,78],[138,66],[148,74]), c:CLR.pass,w:1.3,a:true,dsh:true},
    {d:P([54,78],[44,66],[34,74]), c:CLR.pass,w:1.3,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 3 */
{
  id:3, name:"C3_Cloud", label:"C3 Cloud – boundary squat corner", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    // Boundary CB squats; field CB plays deep third
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
    {x:32,y:54,t:"TE"}, // squat landmark (cloud)
  ],
  rt:[
    // Field deep third + post
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    // Boundary cloud squat
    {d:P([20,LOS],[20,44],[30,48]), c:CLR.pass,w:1.9,a:true},
    {d:P([32,54],[34,56],[38,58]), c:CLR.pass,w:1.2,a:false,dsh:true},
    // Hooks
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([128,78],[126,62]), c:CLR.pass,w:1.2,a:true,dsh:true},
    {d:P([54,78],[56,62]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 4 */
{
  id:4, name:"C3_PressBail", label:"C3 Press Bail – press outside then bail", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    // Press then bail to thirds (visual)
    {d:CB([20,LOS],[24,62],[22,44],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:CB([180,LOS],[176,62],[178,44],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([128,78],[126,62]), c:CLR.pass,w:1.3,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.3,a:true,dsh:true},
    {d:P([54,78],[56,62]), c:CLR.pass,w:1.3,a:true,dsh:true},
  ],
},

/* 5 */
{
  id:5, name:"C3_Off", label:"C3 Off – soft cushion zone", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    // CBs off
    {x:24,y:60,t:"WR"},{x:176,y:60,t:"WR"},
    {x:100,y:32,t:"TE"},
    {x:142,y:58,t:"TE"},
  ],
  rt:[
    {d:P([24,60],[22,44],[20,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([176,60],[178,44],[180,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([142,58],[150,66],[160,74]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.3,a:true,dsh:true},
  ],
},

/* 6 */
{
  id:6, name:"C3_Match", label:"C3 Match – pattern match vs 2x2", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},{x:70,y:38,t:"TE"},{x:130,y:38,t:"TE"},
  ],
  rt:[
    // Quarters-ish match landmarks but keep post
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([70,38],[72,26]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([130,38],[128,26]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.3,a:true,dsh:true},
  ],
},

/* 7 */
{
  id:7, name:"C3_SeamCarry", label:"C3 Seam Carry – LB carry #2 vertical", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    // Seam carry (SAM) to 10–12 then sink
    {d:CB([128,78],[126,62],[124,48],[126,56]), c:CLR.pass,w:1.9,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.3,a:true,dsh:true},
    {d:P([54,78],[56,62]), c:CLR.pass,w:1.3,a:true,dsh:true},
  ],
},

/* 8 */
{
  id:8, name:"C3_Lock", label:"C3 Lock – boundary man, field zone", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},{x:142,y:58,t:"TE"},
  ],
  rt:[
    // Boundary lock man (visual short trail)
    {d:P([20,LOS],[20,34]), c:CLR.pass,w:2.2,a:true},
    // Field C3 elements
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([142,58],[150,66],[160,74]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.3,a:true,dsh:true},
  ],
},

/* 9 */
{
  id:9, name:"C3_Invert", label:"C3 Invert – rotate corner as deep third", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    // Invert: boundary corner rotates deep third; safety down
    {x:40,y:54,t:"TE"}, {x:100,y:32,t:"TE"},
  ],
  rt:[
    // Inverted deep third from boundary corner (drawn as arrowed bail)
    {d:CB([20,LOS],[26,58],[24,42],[22,26]), c:CLR.pass,w:2.2,a:true},
    // Other deep third + post
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    // Safety down to curl/flat
    {d:P([40,54],[34,62],[28,72]), c:CLR.pass,w:1.7,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.3,a:true,dsh:true},
  ],
},

/* 10 */
{
  id:10, name:"C3_Robber", label:"C3 Robber – WS low hole lurk", cat:"pass",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
    {x:72,y:54,t:"TE"}, // robber
  ],
  rt:[
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    // Robber lurk
    {d:P([72,54],[84,52],[96,54]), c:CLR.pass,w:1.9,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.3,a:true,dsh:true},
  ],
},

/* ═══ II. FRONT VARIATIONS (11-15) ═════════════════════════════════════ */
/* 11 */
{
  id:11, name:"C3_OverFront", label:"C3 Over Front", cat:"run",
  sk:[
    // 4-3 Over-ish align
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.1,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.1,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
  ],
},

/* 12 */
{
  id:12, name:"C3_UnderFront", label:"C3 Under Front", cat:"run",
  sk:[
    // Under shift (3-tech away from strength conceptually)
    {x:62,y:LOS,t:"OL"},{x:80,y:LOS,t:"OL"},{x:100,y:LOS,t:"OL"},{x:122,y:LOS,t:"OL"},
    {x:126,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:50,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([80,LOS],[80,LOS-12]), c:CLR.run,w:2.1,a:true},
    {d:P([100,LOS],[100,LOS-12]), c:CLR.run,w:2.1,a:true},
    {d:CB([62,LOS],[56,62],[50,48],[48,36]), c:CLR.run,w:2.2,a:true},
    {d:CB([122,LOS],[144,64],[168,46],[186,34]), c:CLR.run,w:2.2,a:true},
  ],
},

/* 13 */
{
  id:13, name:"C3_Wide9_Rush", label:"C3 Wide 9 Rush", cat:"run",
  sk:[
    {x:52,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:126,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([126,LOS],[150,64],[170,46],[186,34]), c:CLR.run,w:2.6,a:true},
    {d:CB([52,LOS],[44,64],[40,50],[38,38]), c:CLR.run,w:2.2,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
  ],
},

/* 14 */
{
  id:14, name:"C3_TightFront_4i", label:"C3 Tight Front (4i look)", cat:"run",
  sk:[
    {x:60,y:LOS,t:"OL"},{x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:112,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:128,y:78,t:"FB"},{x:54,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([78,LOS],[78,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([60,LOS],[60,LOS-8]), c:CLR.run,w:1.8,a:true},
    {d:P([112,LOS],[112,LOS-8]), c:CLR.run,w:1.8,a:true},
  ],
},

/* 15 */
{
  id:15, name:"C3_Bear_Interior", label:"C3 Bear Interior", cat:"run",
  sk:[
    // Bear-ish interior cover (5-down feel)
    {x:46,y:LOS,t:"OL"},{x:62,y:LOS,t:"OL"},{x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:108,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([62,LOS],[62,LOS-12]), c:CLR.run,w:2.3,a:true},
    {d:P([78,LOS],[78,LOS-12]), c:CLR.run,w:2.3,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.3,a:true},
    {d:P([46,LOS],[46,LOS-10]), c:CLR.run,w:2.0,a:true},
    {d:P([108,LOS],[108,LOS-10]), c:CLR.run,w:2.0,a:true},
  ],
},

/* ═══ III. FIRE ZONE PACKAGE (16-20) ════════════════════════════════════ */
/* 16 */
{
  id:16, name:"Nickel_Fire_C3", label:"Nickel Fire (3-Under/3-Deep)", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:156,y:62,t:"TE"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([156,62],[166,58],[176,52],[184,44]), c:CLR.run,w:2.6,a:true}, // 5th
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    // 3-deep shell visual
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 17 */
{
  id:17, name:"Sam_FireZone_C3", label:"Sam Fire Zone", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([128,78],[140,70],[156,60],[172,46]), c:CLR.run,w:2.7,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 18 */
{
  id:18, name:"CrossDog_Zone_C3", label:"Cross Dog Zone (3-Deep)", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:128,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([84,74],[78,68],[74,58],[70,48]), c:CLR.run,w:2.6,a:true},
    {d:CB([128,78],[118,70],[108,60],[98,48]), c:CLR.run,w:2.6,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 19 */
{
  id:19, name:"Boundary_Cat_FireZone", label:"Boundary Cat Fire Zone", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:36,y:62,t:"TE"},{x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([36,62],[32,58],[26,52],[20,44]), c:CLR.run,w:2.7,a:true}, // cat
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 20 */
{
  id:20, name:"SS_FireZone", label:"Strong Safety Fire Zone", cat:"run",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:142,y:58,t:"TE"}, // SS
    {x:100,y:32,t:"TE"}, // post
  ],
  rt:[
    {d:CB([142,58],[150,54],[160,48],[170,40]), c:CLR.run,w:2.7,a:true}, // SS blitz
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* ═══ IV. SIMULATED PRESSURE (21-25) ════════════════════════════════════ */
/* 21 */
{
  id:21, name:"Nickel_Sim_Strong", label:"Nickel Sim Strong – Drop DE, bring nickel", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:156,y:62,t:"TE"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([156,62],[166,58],[176,52],[184,44]), c:CLR.run,w:2.5,a:true}, // nickel rush
    {d:CB([118,LOS],[130,58],[128,48],[122,44]), c:CLR.pass,w:1.9,a:true,dsh:true}, // DE drop
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 22 */
{
  id:22, name:"Mike_Mug_Sim", label:"Mike Mug Sim – A-gap show, rush 4", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:84,y:74,t:"FB"},{x:96,y:74,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:P([84,74],[84,62]), c:CLR.pa,w:1.6,a:true,dsh:true},
    {d:P([96,74],[96,62]), c:CLR.pa,w:1.6,a:true,dsh:true},
    {d:CB([84,74],[82,66],[80,58],[78,50]), c:CLR.run,w:2.3,a:true}, // one rushes
    {d:CB([96,74],[98,66],[100,58],[102,50]), c:CLR.pass,w:1.9,a:true,dsh:true}, // one drops
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 23 */
{
  id:23, name:"Boundary_Creeper", label:"Boundary Creeper – OLB replace edge", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:36,y:62,t:"TE"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([36,62],[32,58],[26,52],[20,44]), c:CLR.run,w:2.5,a:true}, // creeper rush
    {d:CB([54,LOS],[58,58],[60,48],[62,44]), c:CLR.pass,w:1.9,a:true,dsh:true}, // weak DE drops
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 24 */
{
  id:24, name:"Tackle_Drop_Sim", label:"Tackle Drop Sim – DT peel to hook", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([92,LOS],[98,58],[94,52],[86,48]), c:CLR.pass,w:2.0,a:true,dsh:true}, // DT peel
    {d:CB([128,78],[140,70],[156,60],[172,46]), c:CLR.run,w:2.4,a:true}, // replace rusher
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 25 */
{
  id:25, name:"Edge_Replace_Sim", label:"Edge Replace Sim – SAM drops, DE rush inside", cat:"pa",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:128,y:78,t:"FB"},
    {x:100,y:32,t:"TE"},
  ],
  rt:[
    {d:CB([128,78],[126,62],[124,50],[122,46]), c:CLR.pass,w:1.9,a:true,dsh:true}, // SAM drops
    {d:CB([118,LOS],[132,58],[120,48],[110,40]), c:CLR.run,w:2.4,a:true}, // DE inside lane
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.2,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* ═══ V. MAN-BLENDED VARIANTS (26-30) ═══════════════════════════════════ */
/* 26 */
{
  id:26, name:"C3_Match_Press", label:"C3 Match Press – pattern match outside", cat:"pass",
  sk:[
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
    {x:70,y:38,t:"TE"},{x:130,y:38,t:"TE"},
    {x:84,y:74,t:"FB"},
  ],
  rt:[
    {d:CB([20,LOS],[24,62],[22,44],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:CB([180,LOS],[176,62],[178,44],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([70,38],[72,26]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([130,38],[128,26]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 27 */
{
  id:27, name:"C3_Lock_1", label:"C3 Lock #1 – lock primary WR", cat:"pass",
  sk:[
    {x:20,y:LOS,t:"WR"}, {x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"}, {x:142,y:58,t:"TE"},
  ],
  rt:[
    // lock boundary X (visual)
    {d:P([20,LOS],[20,34]), c:CLR.pass,w:2.2,a:true},
    // still C3 elsewhere
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([142,58],[150,66],[160,74]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 28 */
{
  id:28, name:"C3_Bracket_Slot", label:"C3 Bracket Slot – double #2, zone elsewhere", cat:"pass",
  sk:[
    {x:100,y:32,t:"TE"}, // post
    // bracket slot pieces (nickel + safety)
    {x:156,y:62,t:"TE"}, {x:144,y:50,t:"TE"},
    {x:180,y:LOS,t:"WR"},{x:20,y:LOS,t:"WR"},
  ],
  rt:[
    // Bracket
    {d:P([156,62],[150,56],[144,50]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([144,50],[140,42]), c:CLR.pass,w:1.8,a:true,dsh:true},
    // Keep C3 thirds feel
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
  ],
},

/* 29 */
{
  id:29, name:"C3_Cut_Cross", label:"C3 Cut Cross – robber cut shallow cross", cat:"pass",
  sk:[
    {x:100,y:32,t:"TE"},
    {x:76,y:54,t:"TE"}, // robber
    {x:84,y:74,t:"FB"},
  ],
  rt:[
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    // robber cut path
    {d:CB([76,54],[86,54],[96,52],[108,50]), c:CLR.pass,w:2.1,a:true,dsh:true},
    {d:P([84,74],[84,58]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 30 */
{
  id:30, name:"C3_Double_X", label:"C3 Double X – bracket boundary WR", cat:"pass",
  sk:[
    {x:20,y:LOS,t:"WR"}, // X
    {x:32,y:54,t:"TE"},{x:52,y:44,t:"TE"}, // bracket pieces
    {x:100,y:32,t:"TE"},
    {x:180,y:LOS,t:"WR"},
  ],
  rt:[
    {d:P([32,54],[26,52],[20,50]), c:CLR.pass,w:1.9,a:true,dsh:true},
    {d:P([52,44],[40,44],[28,46]), c:CLR.pass,w:1.9,a:true,dsh:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* ═══ VI. DIME PACKAGE (31-35) ═════════════════════════════════════════= */
/* 31 */
{
  id:31, name:"Dime_C3_Sky", label:"Dime C3 Sky", cat:"situational",
  sk:[
    {x:70,y:38,t:"TE"},{x:130,y:38,t:"TE"}, // extra DB landmarks
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},{x:142,y:58,t:"TE"},
  ],
  rt:[
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([142,58],[150,66],[160,74]), c:CLR.pass,w:1.7,a:true,dsh:true},
    {d:P([70,38],[72,52]), c:CLR.pass,w:1.2,a:true,dsh:true},
    {d:P([130,38],[128,52]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 32 */
{
  id:32, name:"Dime_C3_Match", label:"Dime C3 Match", cat:"situational",
  sk:[
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:32,t:"TE"},
    {x:70,y:38,t:"TE"},{x:130,y:38,t:"TE"},
    {x:60,y:58,t:"TE"},{x:140,y:58,t:"TE"},
  ],
  rt:[
    {d:P([20,LOS],[20,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([180,LOS],[180,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([70,38],[72,26]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([130,38],[128,26]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([60,58],[60,44]), c:CLR.pass,w:1.4,a:true,dsh:true},
    {d:P([140,58],[140,44]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 33 */
{
  id:33, name:"Dime_C1_Robber", label:"Dime C1 Robber (changeup)", cat:"situational",
  sk:[
    {x:100,y:32,t:"TE"}, // post
    {x:76,y:54,t:"TE"},  // robber
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
  ],
  rt:[
    {d:P([100,32],[100,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([76,54],[88,52],[100,54]), c:CLR.pass,w:1.9,a:true,dsh:true},
    {d:P([20,LOS],[20,30]), c:CLR.pass,w:2.0,a:true},
    {d:P([180,LOS],[180,30]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* 34 */
{
  id:34, name:"Dime_2Man_Swap", label:"Dime 2-Man (situational swap)", cat:"situational",
  sk:[
    {x:70,y:34,t:"TE"},{x:130,y:34,t:"TE"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:84,y:62,t:"FB"},
  ],
  rt:[
    {d:P([70,34],[52,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([130,34],[148,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([20,LOS],[20,30]), c:CLR.pass,w:2.0,a:true},
    {d:P([180,LOS],[180,30]), c:CLR.pass,w:2.0,a:true},
    {d:P([84,62],[84,54]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 35 */
{
  id:35, name:"Dime_Drop8_Cloud", label:"Dime Drop-8 Cloud", cat:"situational",
  sk:[
    {x:32,y:54,t:"TE"},{x:168,y:54,t:"TE"},
    {x:70,y:34,t:"TE"},{x:130,y:34,t:"TE"},
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

/* ═══ VII. RED ZONE PACKAGE (36-40) ═════════════════════════════════════ */
/* 36 */
{
  id:36, name:"Red_C3_Match", label:"Red C3 Match – tight spacing", cat:"situational",
  sk:[
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:38,t:"TE"}, // post tighter
    {x:70,y:44,t:"TE"},{x:130,y:44,t:"TE"},
    {x:84,y:70,t:"FB"},
  ],
  rt:[
    {d:P([20,LOS],[20,32]), c:CLR.pass,w:2.0,a:true},
    {d:P([180,LOS],[180,32]), c:CLR.pass,w:2.0,a:true},
    {d:P([100,38],[100,22]), c:CLR.pass,w:2.0,a:true},
    {d:P([70,44],[74,34]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([130,44],[126,34]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([84,70],[84,54]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 37 */
{
  id:37, name:"Red_C3_CloudTrap", label:"Red C3 Cloud Trap – boundary squat hard", cat:"situational",
  sk:[
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:38,t:"TE"},
    {x:32,y:54,t:"TE"},
    {x:84,y:70,t:"FB"},
  ],
  rt:[
    {d:P([20,LOS],[20,44],[30,48]), c:CLR.pass,w:2.0,a:true}, // hard squat
    {d:P([180,LOS],[180,32]), c:CLR.pass,w:2.0,a:true},
    {d:P([100,38],[100,22]), c:CLR.pass,w:2.0,a:true},
    {d:P([32,54],[34,56],[38,58]), c:CLR.pass,w:1.2,a:false,dsh:true},
    {d:P([84,70],[84,54]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* 38 */
{
  id:38, name:"Red_C1_Robber", label:"Red C1 Robber – aggressive low-hole", cat:"situational",
  sk:[
    {x:100,y:38,t:"TE"},
    {x:76,y:54,t:"TE"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
  ],
  rt:[
    {d:P([100,38],[100,22]), c:CLR.pass,w:2.0,a:true},
    {d:P([76,54],[88,52],[100,54]), c:CLR.pass,w:2.0,a:true,dsh:true},
    {d:P([20,LOS],[20,36]), c:CLR.pass,w:2.0,a:true},
    {d:P([180,LOS],[180,36]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* 39 */
{
  id:39, name:"Red_FireZone", label:"Red Fire Zone – 5-man pressure", cat:"situational",
  sk:[
    {x:54,y:LOS,t:"OL"},{x:72,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:118,y:LOS,t:"OL"},
    {x:156,y:62,t:"TE"},
    {x:100,y:38,t:"TE"},
  ],
  rt:[
    {d:CB([156,62],[166,58],[176,52],[184,44]), c:CLR.run,w:2.8,a:true},
    {d:P([72,LOS],[72,LOS-12]), c:CLR.run,w:2.3,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.3,a:true},
    {d:CB([54,LOS],[44,62],[40,48],[38,36]), c:CLR.run,w:2.1,a:true},
    {d:CB([118,LOS],[140,64],[164,46],[184,34]), c:CLR.run,w:2.1,a:true},
    // compressed 3-deep landmark
    {d:P([100,38],[100,22]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 40 */
{
  id:40, name:"GoalLine_C3_Heavy_53", label:"Goal Line C3 Heavy (5-3 front)", cat:"situational",
  sk:[
    {x:46,y:LOS,t:"OL"},{x:62,y:LOS,t:"OL"},{x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:108,y:LOS,t:"OL"},
    {x:132,y:78,t:"FB"},{x:84,y:74,t:"FB"},{x:54,y:78,t:"FB"},
    {x:20,y:LOS,t:"WR"},{x:180,y:LOS,t:"WR"},
    {x:100,y:38,t:"TE"},
  ],
  rt:[
    // heavy interior fits
    {d:P([62,LOS],[62,LOS-12]), c:CLR.run,w:2.4,a:true},
    {d:P([78,LOS],[78,LOS-12]), c:CLR.run,w:2.4,a:true},
    {d:P([92,LOS],[92,LOS-12]), c:CLR.run,w:2.4,a:true},
    {d:P([46,LOS],[46,LOS-10]), c:CLR.run,w:2.0,a:true},
    {d:P([108,LOS],[108,LOS-10]), c:CLR.run,w:2.0,a:true},
    // keep C3 shell compressed
    {d:P([20,LOS],[20,34]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([180,LOS],[180,34]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([100,38],[100,22]), c:CLR.pass,w:1.8,a:true,dsh:true},
  ],
},
];
