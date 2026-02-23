/* ════════════════════════════════════════════════════════════════════════
   POWER I / TWO-TE BASE — CORE 40 (UI DATA)
   Identity: 21/12 personnel, downhill gap, two-TE edges, FB lead.
   Categories mapped to your UI:
     run  => Runs (20)
     pass => Pass (15)
     pa   => Play-Action (5)
   Uses your existing helpers/constants: CLR, P, QQ, CB, LOS, OL_X
   Notes:
     - Formations are implied by skill placements (2 TE + FB).
     - Use H as second TE / wing when needed.
   ════════════════════════════════════════════════════════════════════════ */

export const POWER_I_TWO_TE_CORE40 = [
/* ═══ RUNS (1-20) ═══════════════════════════════════════ */

/* 1 */
{
  id:1, name:"Iso_Strong", label:"Iso Strong (FB lead)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:84,y:100,t:"RB"},{x:74,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([74,92],[76,82],[78,66],[78,50]), c:CLR.block,w:2,a:true},         // FB lead
    {d:CB([84,100],[84,86],[82,72],[80,52]), c:CLR.run,w:2.8,a:true},        // RB iso
    {d:QQ([118,LOS],[126,LOS-6],[136,LOS-10]), c:CLR.block,w:1,a:true},      // TE seal
    {d:QQ([138,LOS],[146,LOS-6],[156,LOS-12]), c:CLR.block,w:1,a:true},
    {d:P([12,LOS],[12,LOS-9]), c:CLR.block,w:1,a:true},
    {d:P([172,LOS],[172,LOS-9]), c:CLR.block,w:1,a:true},
  ],
},

/* 2 */
{
  id:2, name:"Iso_Weak", label:"Iso Weak (FB lead)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:84,y:100,t:"RB"},{x:94,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([94,92],[92,82],[90,66],[90,50]), c:CLR.block,w:2,a:true},
    {d:CB([84,100],[86,86],[88,72],[90,52]), c:CLR.run,w:2.8,a:true},
    {d:QQ([48,LOS],[42,LOS-6],[34,LOS-12]), c:CLR.block,w:1,a:true},
    {d:QQ([118,LOS],[112,LOS-6],[104,LOS-10]), c:CLR.block,w:1,a:true},
  ],
},

/* 3 */
{
  id:3, name:"Power_R", label:"Power Right (G pull + FB)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:98,y:100,t:"RB"},{x:74,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([98,100],[94,90],[98,74],[104,54]), c:CLR.run,w:2.8,a:true},        // RB power track
    {d:CB([74,92],[86,82],[96,68],[104,54]), c:CLR.block,w:2,a:true},         // FB lead to hole
    {d:CB([70,LOS],[78,LOS+8],[96,LOS-2],[106,LOS-12]), c:CLR.pull,w:1.9,a:true}, // puller cue
    {d:QQ([118,LOS],[126,LOS-6],[138,LOS-12]), c:CLR.block,w:1,a:true},
    {d:QQ([138,LOS],[150,LOS-6],[162,LOS-14]), c:CLR.block,w:1,a:true},
  ],
},

/* 4 */
{
  id:4, name:"Power_L", label:"Power Left (G pull + FB)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:70,y:100,t:"RB"},{x:94,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([70,100],[74,90],[72,74],[66,54]), c:CLR.run,w:2.8,a:true},
    {d:CB([94,92],[82,82],[72,68],[66,54]), c:CLR.block,w:2,a:true},
    {d:CB([94,LOS],[86,LOS+8],[72,LOS-2],[62,LOS-12]), c:CLR.pull,w:1.9,a:true},
    {d:QQ([48,LOS],[36,LOS-6],[24,LOS-14]), c:CLR.block,w:1,a:true},
    {d:QQ([118,LOS],[110,LOS-6],[100,LOS-12]), c:CLR.block,w:1,a:true},
  ],
},

/* 5 */
{
  id:5, name:"Counter_R", label:"Counter Right (step + kick)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:98,y:100,t:"RB"},{x:74,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([98,100],[90,100],[86,92],[88,78]), c:CLR.run,w:1.6,a:false,dsh:true}, // counter step cue
    {d:CB([98,100],[112,92],[128,78],[140,58]), c:CLR.run,w:2.8,a:true},        // counter hit
    {d:CB([70,LOS],[78,LOS+10],[102,LOS-2],[118,LOS-12]), c:CLR.pull,w:1.9,a:true},
    {d:CB([74,92],[88,84],[108,70],[120,58]), c:CLR.block,w:1.8,a:true},
  ],
},

/* 6 */
{
  id:6, name:"Counter_L", label:"Counter Left (step + kick)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:70,y:100,t:"RB"},{x:94,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([70,100],[78,100],[82,92],[80,78]), c:CLR.run,w:1.6,a:false,dsh:true},
    {d:CB([70,100],[56,92],[40,78],[28,58]), c:CLR.run,w:2.8,a:true},
    {d:CB([94,LOS],[86,LOS+10],[62,LOS-2],[46,LOS-12]), c:CLR.pull,w:1.9,a:true},
    {d:CB([94,92],[80,84],[60,70],[48,58]), c:CLR.block,w:1.8,a:true},
  ],
},

/* 7 */
{
  id:7, name:"Toss_Crack_R", label:"Toss Crack Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:82,t:"QB"},{x:106,y:84,t:"RB"},{x:74,y:92,t:"FB"},
  ],
  rt:[
    {d:QQ([84,82],[120,78],[152,74]), c:CLR.toss,w:1.5,a:true,dsh:true},
    {d:CB([152,74],[166,66],[178,56],[188,42]), c:CLR.run,w:2.8,a:true},
    {d:QQ([32,LOS],[48,LOS-6],[66,LOS-10]), c:CLR.block,w:1.5,a:true},         // crack cue
    {d:CB([74,92],[98,88],[126,80],[152,74]), c:CLR.block,w:1.6,a:true},
  ],
},

/* 8 */
{
  id:8, name:"Toss_Crack_L", label:"Toss Crack Left", cat:"run",
  sk:[
    {x:168,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:82,t:"QB"},{x:62,y:84,t:"RB"},{x:94,y:92,t:"FB"},
  ],
  rt:[
    {d:QQ([84,82],[52,78],[28,74]), c:CLR.toss,w:1.5,a:true,dsh:true},
    {d:CB([28,74],[16,66],[10,56],[8,44]), c:CLR.run,w:2.8,a:true},
    {d:QQ([152,LOS],[132,LOS-6],[114,LOS-10]), c:CLR.block,w:1.5,a:true},
    {d:CB([94,92],[70,88],[44,80],[28,74]), c:CLR.block,w:1.6,a:true},
  ],
},

/* 9 */
{
  id:9, name:"Lead_Sweep_R", label:"Lead Sweep Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:98,y:100,t:"RB"},{x:74,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([74,92],[96,86],[126,76],[162,62]), c:CLR.block,w:2,a:true},          // FB lead outside
    {d:CB([98,100],[116,92],[144,80],[176,62]), c:CLR.run,w:2.8,a:true},        // RB sweep
    {d:QQ([118,LOS],[130,LOS-6],[150,LOS-14]), c:CLR.block,w:1,a:true},
  ],
},

/* 10 */
{
  id:10, name:"Lead_Sweep_L", label:"Lead Sweep Left", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:70,y:100,t:"RB"},{x:94,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([94,92],[72,86],[42,76],[10,62]), c:CLR.block,w:2,a:true},
    {d:CB([70,100],[54,92],[26,80],[6,62]), c:CLR.run,w:2.8,a:true},
    {d:QQ([48,LOS],[34,LOS-6],[18,LOS-14]), c:CLR.block,w:1,a:true},
  ],
},

/* 11 */
{
  id:11, name:"Trap", label:"Trap (FB lead / quick hit)", cat:"run",
  sk:[
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:84,y:100,t:"RB"},{x:74,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([84,100],[84,86],[82,72],[80,54]), c:CLR.run,w:2.8,a:true},
    {d:CB([74,92],[76,82],[78,70],[78,54]), c:CLR.block,w:1.8,a:true},
    {d:CB([70,LOS],[78,LOS+10],[92,LOS-2],[98,LOS-8]), c:CLR.pull,w:1.8,a:true},
  ],
},

/* 12 */
{
  id:12, name:"Stretch_R", label:"Stretch Right (2-TE edge)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([106,84],[128,82],[150,70],[176,54]), c:CLR.run,w:2.8,a:true},
    {d:QQ([118,LOS],[132,LOS-6],[152,LOS-10]), c:CLR.block,w:1.2,a:true},
    {d:QQ([138,LOS],[156,LOS-6],[176,LOS-12]), c:CLR.block,w:1.2,a:true},
    {d:P([12,LOS],[12,LOS-9]), c:CLR.block,w:1,a:true},
  ],
},

/* 13 */
{
  id:13, name:"Stretch_L", label:"Stretch Left (2-TE edge)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:62,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([62,84],[40,82],[20,70],[8,54]), c:CLR.run,w:2.8,a:true},
    {d:QQ([48,LOS],[30,LOS-6],[14,LOS-12]), c:CLR.block,w:1.2,a:true},
    {d:QQ([118,LOS],[102,LOS-6],[86,LOS-10]), c:CLR.block,w:1.2,a:true},
  ],
},

/* 14 */
{
  id:14, name:"Duo", label:"Duo (downhill double teams)", cat:"run",
  sk:[
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:84,y:100,t:"RB"},
  ],
  rt:[
    {d:CB([84,100],[84,86],[82,72],[80,52]), c:CLR.run,w:2.8,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[82,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.8,a:true},
  ],
},

/* 15 */
{
  id:15, name:"FB_Dive", label:"FB Dive", cat:"run",
  sk:[
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:74,y:96,t:"FB"},{x:96,y:100,t:"RB"},
  ],
  rt:[
    {d:CB([74,96],[76,86],[78,72],[80,54]), c:CLR.run,w:2.8,a:true},           // FB dive
    {d:P([96,100],[112,100]), c:CLR.block,w:2,a:false},                        // RB lead/block
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[82,LOS-10]), c:CLR.block,w:1.8,a:true},
  ],
},

/* 16 */
{
  id:16, name:"Pin_Pull_R", label:"Pin-Pull Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([106,84],[128,82],[152,70],[178,56]), c:CLR.run,w:2.8,a:true},
    {d:CB([70,LOS],[78,LOS+10],[108,LOS-2],[126,LOS-10]), c:CLR.pull,w:1.8,a:true},  // pull
    {d:QQ([118,LOS],[126,LOS-6],[134,LOS-10]), c:CLR.block,w:1,a:true},              // pin
    {d:QQ([138,LOS],[152,LOS-6],[170,LOS-12]), c:CLR.block,w:1,a:true},
  ],
},

/* 17 */
{
  id:17, name:"Pin_Pull_L", label:"Pin-Pull Left", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:62,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([62,84],[40,82],[18,70],[6,56]), c:CLR.run,w:2.8,a:true},
    {d:CB([94,LOS],[86,LOS+10],[56,LOS-2],[38,LOS-10]), c:CLR.pull,w:1.8,a:true},
    {d:QQ([48,LOS],[36,LOS-6],[24,LOS-10]), c:CLR.block,w:1,a:true},
    {d:QQ([118,LOS],[110,LOS-6],[102,LOS-12]), c:CLR.block,w:1,a:true},
  ],
},

/* 18 */
{
  id:18, name:"Counter_Trey_R", label:"Counter Trey Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:98,y:100,t:"RB"},{x:74,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([98,100],[90,100],[86,92],[88,78]), c:CLR.run,w:1.5,a:false,dsh:true},
    {d:CB([98,100],[112,92],[128,78],[140,56]), c:CLR.run,w:2.8,a:true},
    {d:CB([82,LOS],[90,LOS+10],[112,LOS-2],[130,LOS-12]), c:CLR.pull,w:1.9,a:true}, // tackle pull cue
    {d:CB([70,LOS],[78,LOS+10],[102,LOS-2],[118,LOS-12]), c:CLR.pull,w:1.7,a:true}, // guard pull cue
    {d:CB([74,92],[90,84],[112,72],[126,56]), c:CLR.block,w:1.8,a:true},
  ],
},

/* 19 */
{
  id:19, name:"Counter_Trey_L", label:"Counter Trey Left", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:84,t:"QB"},{x:70,y:100,t:"RB"},{x:94,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([70,100],[78,100],[82,92],[80,78]), c:CLR.run,w:1.5,a:false,dsh:true},
    {d:CB([70,100],[56,92],[40,78],[28,56]), c:CLR.run,w:2.8,a:true},
    {d:CB([82,LOS],[74,LOS+10],[52,LOS-2],[34,LOS-12]), c:CLR.pull,w:1.9,a:true},
    {d:CB([94,LOS],[86,LOS+10],[64,LOS-2],[46,LOS-12]), c:CLR.pull,w:1.7,a:true},
    {d:CB([94,92],[78,84],[56,72],[42,56]), c:CLR.block,w:1.8,a:true},
  ],
},

/* 20 */
{
  id:20, name:"QB_Sneak_Power", label:"QB Sneak / Power (short yardage)", cat:"run",
  sk:[
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:80,t:"QB"},{x:84,y:98,t:"RB"},{x:74,y:90,t:"FB"},
  ],
  rt:[
    {d:CB([84,80],[84,70],[84,58],[84,46]), c:CLR.run,w:2.8,a:true},
    {d:P([84,98],[84,96]), c:CLR.block,w:2,a:false},
    {d:CB([74,90],[78,82],[82,66],[84,50]), c:CLR.block,w:1.8,a:true},
  ],
},

/* ═══ PASS (21-35) ═════════════════════════════════════ */

/* 21 */
{
  id:21, name:"Smash", label:"Smash", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},{x:74,y:92,t:"FB"},
  ],
  rt:[
    {d:CB([12,LOS],[8,42],[24,26],[36,24]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,52],[32,56]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:2.0,a:true},
    {d:QQ([96,98],[110,96],[120,94]), c:CLR.pass,w:1.6,a:true,dsh:true}, // checkdown/flat
  ],
},

/* 22 */
{
  id:22, name:"Flood", label:"Flood (3-level)", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:P([172,LOS],[172,20]), c:CLR.pass,w:2.2,a:true},                      // go
    {d:P([138,LOS],[138,48],[168,48]), c:CLR.pass,w:2.2,a:true},             // out
    {d:QQ([96,98],[120,96],[148,90]), c:CLR.pass,w:1.8,a:true},              // flat
    {d:P([12,LOS],[12,30]), c:CLR.pass,w:1.6,a:true},
    {d:P([118,LOS],[118,34]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 23 */
{
  id:23, name:"Sail", label:"Sail (corner + flat)", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},{x:48,y:LOS,t:"H"},
  ],
  rt:[
    {d:CB([172,LOS],[182,44],[164,28],[148,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,48],[150,48]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([96,98],[122,96],[150,90]), c:CLR.pass,w:1.8,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.6,a:true},
    {d:P([48,LOS],[48,40]), c:CLR.pass,w:1.4,a:true},
  ],
},

/* 24 */
{
  id:24, name:"Dig", label:"Dig (deep in)", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:P([172,LOS],[172,32],[120,32]), c:CLR.pass,w:2.2,a:true},             // dig
    {d:P([12,LOS],[12,20]), c:CLR.pass,w:2.0,a:true},                        // clearout
    {d:P([118,LOS],[118,46]), c:CLR.pass,w:1.6,a:true},                      // hook
    {d:QQ([96,98],[112,96],[126,94]), c:CLR.pass,w:1.6,a:true,dsh:true},     // checkdown
  ],
},

/* 25 */
{
  id:25, name:"Deep_Post", label:"Post (shot)", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},{x:48,y:LOS,t:"H"},
  ],
  rt:[
    {d:CB([172,LOS],[172,34],[140,22],[112,18]), c:CLR.pass,w:2.5,a:true},  // post
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:2.0,a:true},                        // underneath
    {d:P([118,LOS],[118,38]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([96,98],[112,96],[128,92]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 26 */
{
  id:26, name:"Comeback", label:"Comeback", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:CB([172,LOS],[172,30],[182,34],[188,38]), c:CLR.pass,w:2.2,a:true},   // comeback
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:2.0,a:true},
    {d:P([118,LOS],[118,50],[150,50]), c:CLR.pass,w:1.6,a:true},            // out
    {d:QQ([96,98],[116,96],[138,92]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 27 */
{
  id:27, name:"Levels", label:"Levels", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[12,38],[88,38]), c:CLR.pass,w:2.2,a:true},                // in
    {d:CB([32,LOS],[50,62],[82,62],[110,62]), c:CLR.pass,w:2.2,a:true},      // over
    {d:P([118,LOS],[118,24]), c:CLR.pass,w:1.6,a:true},                      // clear
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 28 */
{
  id:28, name:"Mesh", label:"Mesh", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"H"},{x:176,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:CB([34,LOS],[62,62],[100,62],[120,64]), c:CLR.pass,w:2.2,a:true},
    {d:CB([152,LOS],[122,60],[82,60],[60,62]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.6,a:true},
    {d:P([118,LOS],[118,50]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([96,98],[120,96],[144,92]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 29 */
{
  id:29, name:"Wheel", label:"Wheel (RB wheel)", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:CB([96,98],[120,94],[144,78],[156,34]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:2.0,a:true},
    {d:P([12,LOS],[12,32]), c:CLR.pass,w:1.6,a:true},
    {d:P([118,LOS],[118,44]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 30 */
{
  id:30, name:"Bench", label:"Bench (double outs)", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:P([32,LOS],[32,50],[12,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,50],[148,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.6,a:true},
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([96,98],[116,96],[136,94]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 31 */
{
  id:31, name:"Stick", label:"Stick (TE stick + flat)", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:96,y:98,t:"RB"},{x:74,y:92,t:"FB"},
  ],
  rt:[
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:2.2,a:true},              // stick
    {d:QQ([96,98],[118,94],[142,88]), c:CLR.pass,w:1.8,a:true},              // flat
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:1.6,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 32 */
{
  id:32, name:"Curl_Flat", label:"Curl-Flat", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[12,44]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,44]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([96,98],[118,96],[140,90]), c:CLR.pass,w:1.8,a:true},
    {d:P([118,LOS],[118,30]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 33 */
{
  id:33, name:"Shallow_Cross", label:"Shallow Cross", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:CB([12,LOS],[36,62],[90,62],[136,62]), c:CLR.pass,w:2.2,a:true},
    {d:CB([172,LOS],[154,48],[108,48],[72,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,26]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([96,98],[116,96],[138,92]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 34 */
{
  id:34, name:"All_Hitches", label:"All Hitches", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[12,46]), c:CLR.pass,w:2.0,a:true},
    {d:P([32,LOS],[32,46]), c:CLR.pass,w:2.0,a:true},
    {d:P([118,LOS],[118,46]), c:CLR.pass,w:2.0,a:true},
    {d:P([138,LOS],[138,46]), c:CLR.pass,w:2.0,a:true},
    {d:P([172,LOS],[172,46]), c:CLR.pass,w:2.0,a:true},
    {d:QQ([96,98],[120,96],[144,92]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},

/* 35 */
{
  id:35, name:"TE_Cross", label:"TE Cross (keeper outlet)", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:86,t:"QB"},{x:96,y:98,t:"RB"},
  ],
  rt:[
    {d:CB([118,LOS],[132,52],[90,52],[52,54]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([12,LOS],[12,30]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([96,98],[114,96],[134,92]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:P([138,LOS],[138,44]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* ═══ PLAY-ACTION (36-40) ══════════════════════════════ */

/* 36 */
{
  id:36, name:"PA_Post", label:"PA Post", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:78,t:"QB"},{x:96,y:90,t:"RB"},{x:74,y:88,t:"FB"},
  ],
  rt:[
    {d:P([96,90],[120,86]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([172,LOS],[172,34],[140,22],[112,18]), c:CLR.pass,w:2.5,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:2.0,a:true},
    {d:P([118,LOS],[118,44]), c:CLR.pass,w:1.6,a:true},
    {d:P([84,78],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
  ],
},

/* 37 */
{
  id:37, name:"PA_Boot", label:"PA Boot", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:78,t:"QB"},{x:96,y:90,t:"RB"},
  ],
  rt:[
    {d:P([96,90],[118,86]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([84,78],[60,80],[44,80],[36,76]), c:CLR.qbmove,w:2,a:true},
    {d:P([118,LOS],[118,50],[150,50]), c:CLR.pass,w:2,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},

/* 38 */
{
  id:38, name:"PA_Cross", label:"PA Cross", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:78,t:"QB"},{x:96,y:90,t:"RB"},
  ],
  rt:[
    {d:P([96,90],[118,86]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([172,LOS],[148,52],[90,52],[52,54]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([118,LOS],[118,46]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 39 */
{
  id:39, name:"PA_Flood", label:"PA Flood", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:78,t:"QB"},{x:96,y:90,t:"RB"},
  ],
  rt:[
    {d:P([96,90],[118,86]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:P([172,LOS],[172,20]), c:CLR.pass,w:2.2,a:true},
    {d:P([138,LOS],[138,48],[168,48]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([96,90],[120,88],[148,84]), c:CLR.pass,w:1.8,a:true},
    {d:P([12,LOS],[12,30]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 40 */
{
  id:40, name:"PA_Deep_Shot", label:"PA Deep Shot (max-ish)", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:138,y:LOS,t:"H"},
    {x:84,y:78,t:"QB"},{x:96,y:90,t:"RB"},{x:74,y:88,t:"FB"},
  ],
  rt:[
    {d:P([96,90],[118,86]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:P([74,88],[74,84]), c:CLR.protect,w:2,a:false},                // FB stay in
    {d:P([118,LOS],[118,72]), c:CLR.protect,w:2,a:false},              // TE stay in / chip cue
    {d:CB([12,LOS],[12,32],[50,20],[82,18]), c:CLR.pass,w:2.6,a:true},
    {d:CB([172,LOS],[172,32],[132,20],[100,18]), c:CLR.pass,w:2.6,a:true},
    {d:P([84,78],[84,96]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
  ],
},
];
