/* ════════════════════════════════════════════════════════════════════════
   MOTION-BASED / MISDIRECTION OFFENSE — CORE 40 (UI DATA)
   Identity: Jet/orbit motion, eye-discipline stress, constraint layering.
   Categories mapped to your UI:
     run  => Runs (15)
     pass => Pass (15)
     pa   => Play-Action (5)
     situational => Screens (5)
   Uses your existing helpers/constants: CLR, P, QQ, CB, LOS, OL_X
   Notes:
     - Motion is drawn as dashed orange (CLR.motion) pre-snap path.
     - Many plays include “orbit/jet” motion plus run/pass action.
   ════════════════════════════════════════════════════════════════════════ */

export const MOTION_MISDIRECTION_CORE40 = [
/* ═══ RUNS (1-15) ═══════════════════════════════════════ */

/* 1 */
{
  id:1, name:"Jet_Sweep_R", label:"Jet Sweep Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:106,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[58,LOS+14],[84,LOS+16],[132,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([84,82],[100,74]), c:CLR.toss,w:1.2,a:true,dsh:true},
    {d:CB([132,LOS+2],[156,56],[174,46],[188,38]), c:CLR.run,w:2.8,a:true},
    {d:QQ([106,82],[84,80],[62,76]), c:CLR.block,w:1,a:true,dsh:true},
    {d:P([58,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([106,LOS],[118,LOS-5]), c:CLR.block,w:1,a:true},
  ],
},

/* 2 */
{
  id:2, name:"Jet_Sweep_L", label:"Jet Sweep Left", cat:"run",
  sk:[
    {x:168,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:32,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:62,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([152,LOS],[130,LOS+14],[104,LOS+16],[56,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([84,82],[70,74]), c:CLR.toss,w:1.2,a:true,dsh:true},
    {d:CB([56,LOS+2],[34,56],[18,46],[6,38]), c:CLR.run,w:2.8,a:true},
    {d:QQ([62,82],[84,80],[106,76]), c:CLR.block,w:1,a:true,dsh:true},
    {d:P([106,LOS],[94,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([58,LOS],[46,LOS-5]), c:CLR.block,w:1,a:true},
  ],
},

/* 3 */
{
  id:3, name:"Orbit_Sweep_R", label:"Orbit Sweep Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:106,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[60,LOS+14],[96,LOS+18],[98,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:QQ([84,82],[114,80],[148,76]), c:CLR.toss,w:1.2,a:true,dsh:true},
    {d:CB([148,76],[166,66],[178,56],[188,42]), c:CLR.run,w:2.8,a:true},
    {d:QQ([106,LOS],[116,72],[134,66]), c:CLR.block,w:1,a:true},
    {d:QQ([118,LOS],[132,LOS-6],[150,LOS-10]), c:CLR.block,w:1,a:true},
  ],
},

/* 4 */
{
  id:4, name:"Orbit_Sweep_L", label:"Orbit Sweep Left", cat:"run",
  sk:[
    {x:168,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:32,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:62,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([152,LOS],[124,LOS+14],[88,LOS+18],[86,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:QQ([84,82],[54,80],[22,76]), c:CLR.toss,w:1.2,a:true,dsh:true},
    {d:CB([22,76],[14,66],[10,56],[8,42]), c:CLR.run,w:2.8,a:true},
    {d:QQ([70,LOS],[60,72],[44,66]), c:CLR.block,w:1,a:true},
    {d:QQ([48,LOS],[34,LOS-6],[18,LOS-12]), c:CLR.block,w:1,a:true},
  ],
},

/* 5 */
{
  id:5, name:"Counter_Jet_R", label:"Counter Jet Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[58,LOS+14],[84,LOS+16],[132,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([106,84],[90,84],[96,70],[96,50]), c:CLR.run,w:2.8,a:true},
    {d:CB([58,LOS],[66,LOS+10],[92,LOS-2],[100,LOS-7]), c:CLR.pull,w:1.8,a:true},
    {d:QQ([118,LOS],[108,LOS-5],[98,LOS-9]), c:CLR.block,w:1.5,a:true},
    {d:P([12,LOS],[12,LOS-9]), c:CLR.block,w:1,a:true},
  ],
},

/* 6 */
{
  id:6, name:"Counter_Jet_L", label:"Counter Jet Left", cat:"run",
  sk:[
    {x:168,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:32,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:62,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([152,LOS],[126,LOS+14],[104,LOS+16],[56,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([62,84],[78,84],[72,70],[72,50]), c:CLR.run,w:2.8,a:true},
    {d:CB([94,LOS],[86,LOS+10],[62,LOS-2],[54,LOS-7]), c:CLR.pull,w:1.8,a:true},
    {d:QQ([48,LOS],[58,LOS-5],[68,LOS-9]), c:CLR.block,w:1.5,a:true},
  ],
},

/* 7 */
{
  id:7, name:"SplitZone_Motion_R", label:"Split Zone + Motion Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
    {x:56,y:80,t:"H"},
  ],
  rt:[
    {d:P([12,LOS],[66,LOS+10],[110,LOS+2],[172,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([106,84],[126,80],[148,68],[168,46]), c:CLR.run,w:2.8,a:true},
    {d:CB([56,80],[72,76],[96,72],[110,LOS+2]), c:CLR.pull,w:1.8,a:true},
    {d:P([58,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([106,LOS],[118,LOS-5]), c:CLR.block,w:1,a:true},
  ],
},

/* 8 */
{
  id:8, name:"Duo_Motion", label:"Duo + Motion (shift strength)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:48,y:LOS,t:"H"},
    {x:84,y:86,t:"QB"},{x:84,y:98,t:"RB"},
  ],
  rt:[
    {d:P([48,LOS],[84,LOS+14],[124,LOS+6],[138,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([84,98],[84,84],[82,72],[80,50]), c:CLR.run,w:2.8,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[82,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.8,a:true},
  ],
},

/* 9 */
{
  id:9, name:"PinPull_Motion_R", label:"Pin-Pull Motion Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:P([32,LOS],[84,LOS+14],[128,LOS+4],[152,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([106,84],[132,82],[156,68],[178,56]), c:CLR.run,w:2.8,a:true},
    {d:CB([70,LOS],[78,LOS+10],[108,LOS-2],[126,LOS-10]), c:CLR.pull,w:1.8,a:true},
    {d:QQ([118,LOS],[126,LOS-6],[134,LOS-10]), c:CLR.block,w:1,a:true},
    {d:P([12,LOS],[12,LOS-9]), c:CLR.block,w:1,a:true},
  ],
},

/* 10 */
{
  id:10, name:"Toss_Orbit_R", label:"Toss Orbit Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:106,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[60,LOS+14],[96,LOS+18],[98,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:QQ([84,82],[120,78],[152,74]), c:CLR.toss,w:1.5,a:true,dsh:true},
    {d:CB([152,74],[166,66],[178,56],[186,42]), c:CLR.run,w:2.8,a:true},
    {d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]), c:CLR.block,w:1,a:true},
    {d:P([58,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
  ],
},

/* 11 */
{
  id:11, name:"Trap_Motion", label:"Trap + Motion (influence)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:84,y:98,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[60,LOS+12],[112,LOS+4],[172,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([84,98],[84,86],[82,74],[80,56]), c:CLR.run,w:2.8,a:true},
    {d:CB([70,LOS],[78,LOS+10],[92,LOS-2],[98,LOS-8]), c:CLR.pull,w:1.8,a:true},
    {d:QQ([118,LOS],[110,LOS-4],[98,LOS-8]), c:CLR.block,w:1.3,a:true},
  ],
},

/* 12 */
{
  id:12, name:"Stretch_Motion_R", label:"Stretch Motion Right", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[64,LOS+14],[118,LOS+6],[172,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([106,84],[128,82],[150,70],[176,54]), c:CLR.run,w:2.8,a:true},
    {d:QQ([118,LOS],[132,LOS-6],[152,LOS-10]), c:CLR.block,w:1.2,a:true},
    {d:P([32,LOS],[32,LOS-9]), c:CLR.block,w:1,a:true},
  ],
},

/* 13 */
{
  id:13, name:"Counter_Bash", label:"Counter Bash (jet fake + counter)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[58,LOS+14],[84,LOS+16],[132,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([106,84],[90,84],[96,70],[96,50]), c:CLR.run,w:2.8,a:true},
    {d:CB([58,LOS],[66,LOS+10],[92,LOS-2],[100,LOS-7]), c:CLR.pull,w:1.8,a:true},
    {d:QQ([118,LOS],[108,LOS-5],[98,LOS-9]), c:CLR.block,w:1.3,a:true},
  ],
},

/* 14 */
{
  id:14, name:"Reverse_Threat", label:"Reverse Threat (hold backside)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:106,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([172,LOS],[140,LOS+14],[108,LOS+18],[98,88]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([106,82],[130,80],[156,68],[178,52]), c:CLR.run,w:2.8,a:true},
    {d:P([84,82],[100,74]), c:CLR.toss,w:1.2,a:true,dsh:true},
    {d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]), c:CLR.block,w:1,a:true},
  ],
},

/* 15 */
{
  id:15, name:"QB_Keep_Orbit", label:"QB Keep + Orbit", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:80,t:"QB"},{x:106,y:80,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[60,LOS+14],[96,LOS+18],[98,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([106,80],[128,76]), c:CLR.pa,w:1.5,a:true,dsh:true},              // fake mesh
    {d:CB([84,80],[62,82],[36,72],[12,52]), c:CLR.run,w:2.8,a:true},       // QB keep
    {d:CB([70,LOS],[60,LOS+8],[36,LOS+2],[22,LOS-4]), c:CLR.pull,w:1.8,a:true},
  ],
},

/* ═══ PASS (16-30) ═════════════════════════════════════ */

/* 16 */
{
  id:16, name:"Jet_PA_Over", label:"Jet Play-Action Over", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[58,LOS+14],[84,LOS+16],[132,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([106,78],[128,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([12,LOS],[22,42],[70,48],[112,48]), c:CLR.pass,w:2.2,a:true},     // over
    {d:P([118,LOS],[118,46],[148,46]), c:CLR.pass,w:2.2,a:true},            // out
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1.8,a:true},                     // clear
  ],
},

/* 17 */
{
  id:17, name:"Orbit_Flood", label:"Orbit Flood", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[60,LOS+14],[96,LOS+18],[98,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([172,LOS],[172,20]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,48],[150,48]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[132,82],[150,78]), c:CLR.pass,w:1.8,a:true},
    {d:P([12,LOS],[12,30]), c:CLR.pass,w:1.4,a:true},
  ],
},

/* 18 */
{
  id:18, name:"Boot_Cross", label:"Boot Cross (motion influence)", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[72,LOS+12],[128,LOS+4],[172,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([84,84],[60,82],[44,80],[36,76]), c:CLR.qbmove,w:2,a:true},
    {d:CB([172,LOS],[148,52],[90,52],[52,54]), c:CLR.pass,w:2.2,a:true},
    {d:CB([118,LOS],[96,56],[68,56],[46,58]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,84],[80,80],[50,78]), c:CLR.pass,w:1.8,a:true},
  ],
},

/* 19 */
{
  id:19, name:"Dagger_Motion", label:"Dagger + Motion", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([32,LOS],[84,LOS+12],[140,LOS+2],[152,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([12,LOS],[12,36],[82,36]), c:CLR.pass,w:2.2,a:true},               // dig
    {d:CB([32,LOS],[32,46],[52,34],[68,28]), c:CLR.pass,w:2.2,a:true},      // dagger
    {d:P([118,LOS],[118,50],[148,50]), c:CLR.pass,w:1.6,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 20 */
{
  id:20, name:"Mesh_Motion", label:"Mesh + Motion", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:98,y:86,t:"RB"},
  ],
  rt:[
    {d:P([176,LOS],[138,LOS+14],[104,LOS+18],[98,88]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([34,LOS],[62,62],[100,62],[120,64]), c:CLR.pass,w:2.2,a:true},
    {d:CB([152,LOS],[122,60],[82,60],[60,62]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.2,a:true},
    {d:P([118,LOS],[118,50]), c:CLR.pass,w:1.2,a:true},
  ],
},

/* 21 */
{
  id:21, name:"SlotFade_Motion", label:"Slot Fade + Motion", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:98,y:86,t:"RB"},
  ],
  rt:[
    {d:P([152,LOS],[112,LOS+14],[88,LOS+18],[72,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([72,LOS+2],[72,44],[92,28],[112,22]), c:CLR.pass,w:2.5,a:true},    // slot fade-ish
    {d:P([176,LOS],[176,26]), c:CLR.pass,w:1.8,a:true},
    {d:P([118,LOS],[118,46],[150,46]), c:CLR.pass,w:2.0,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.2,a:true},
  ],
},

/* 22 */
{
  id:22, name:"Orbit_Stick", label:"Orbit Stick", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[60,LOS+14],[96,LOS+18],[98,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,84],[132,82],[150,78]), c:CLR.pass,w:1.8,a:true},
    {d:P([32,LOS],[32,56],[32,60]), c:CLR.pass,w:1.5,a:true},
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:1.2,a:true},
  ],
},

/* 23 */
{
  id:23, name:"Jet_Drive", label:"Jet Drive", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:98,y:86,t:"RB"},
  ],
  rt:[
    {d:CB([34,LOS],[62,LOS+14],[92,LOS+18],[106,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([12,LOS],[36,62],[90,62],[136,62]), c:CLR.pass,w:2.2,a:true},
    {d:CB([172,LOS],[154,48],[108,48],[72,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,26]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 24 */
{
  id:24, name:"Orbit_Dagger", label:"Orbit Dagger", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[60,LOS+14],[96,LOS+18],[98,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([12,LOS],[12,36],[82,36]), c:CLR.pass,w:2.2,a:true},
    {d:CB([172,LOS],[172,34],[120,34],[80,36]), c:CLR.pass,w:2.2,a:true}, // deep over
    {d:P([118,LOS],[118,50],[148,50]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 25 */
{
  id:25, name:"Boot_Flood", label:"Boot Flood", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([84,84],[60,82],[44,80],[36,76]), c:CLR.qbmove,w:2,a:true},
    {d:CB([172,LOS],[180,48],[162,28],[148,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,50],[150,50]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,84],[124,82],[142,78]), c:CLR.pass,w:1.8,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* 26 */
{
  id:26, name:"Jet_CurlFlat", label:"Jet Curl-Flat", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([32,LOS],[84,LOS+12],[140,LOS+2],[152,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([12,LOS],[12,44]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,44]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,30]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,86],[132,82],[150,78]), c:CLR.pass,w:1.8,a:true},
  ],
},

/* 27 */
{
  id:27, name:"Orbit_Sail", label:"Orbit Sail", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[60,LOS+14],[96,LOS+18],[98,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([172,LOS],[182,44],[164,28],[148,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,48],[150,48]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[132,82],[150,78]), c:CLR.pass,w:1.8,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.2,a:true},
  ],
},

/* 28 */
{
  id:28, name:"Jet_Smash", label:"Jet Smash", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([32,LOS],[84,LOS+12],[140,LOS+2],[152,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([12,LOS],[8,42],[24,26],[36,24]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,52],[32,56]), c:CLR.pass,w:2.2,a:true},
    {d:CB([172,LOS],[180,42],[166,26],[152,24]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:2.2,a:true},
  ],
},

/* 29 */
{
  id:29, name:"Orbit_DeepOver", label:"Orbit Deep Over", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[60,LOS+14],[96,LOS+18],[98,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([12,LOS],[12,28],[60,28],[108,28]), c:CLR.pass,w:2.2,a:true},
    {d:CB([172,LOS],[172,34],[120,34],[80,36]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,26]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 30 */
{
  id:30, name:"All_Hitches_Motion", label:"All Hitches + Motion", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:98,y:86,t:"RB"},
  ],
  rt:[
    {d:P([176,LOS],[140,LOS+14],[104,LOS+18],[98,88]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([12,LOS],[12,46]), c:CLR.pass,w:2.0,a:true},
    {d:P([32,LOS],[32,46]), c:CLR.pass,w:2.0,a:true},
    {d:P([118,LOS],[118,46]), c:CLR.pass,w:2.0,a:true},
    {d:P([152,LOS],[152,46]), c:CLR.pass,w:2.0,a:true},
    {d:P([176,LOS],[176,46]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* ═══ PLAY-ACTION (31-35) ══════════════════════════════ */

/* 31 */
{
  id:31, name:"Jet_PA_Post", label:"Jet PA Post", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:90,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[58,LOS+14],[84,LOS+16],[132,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([106,90],[126,86]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([172,LOS],[172,34],[140,22],[112,18]), c:CLR.pass,w:2.5,a:true},
    {d:P([118,LOS],[118,44]), c:CLR.pass,w:1.6,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.2,a:true},
  ],
},

/* 32 */
{
  id:32, name:"Orbit_PA_Cross", label:"Orbit PA Cross", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:90,t:"RB"},
  ],
  rt:[
    {d:CB([32,LOS],[60,LOS+14],[96,LOS+18],[98,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([106,90],[126,86]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([172,LOS],[148,52],[90,52],[52,54]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,46]), c:CLR.pass,w:1.6,a:true},
    {d:P([12,LOS],[12,26]), c:CLR.pass,w:1.4,a:true},
  ],
},

/* 33 */
{
  id:33, name:"Boot_Shot", label:"Boot Shot", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:90,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[72,LOS+12],[128,LOS+4],[172,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([106,90],[126,86]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([84,78],[60,80],[44,80],[36,76]), c:CLR.qbmove,w:2,a:true},
    {d:CB([12,LOS],[8,36],[28,20],[50,18]), c:CLR.pass,w:2.5,a:true},
    {d:CB([172,LOS],[160,38],[116,26],[90,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,40]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 34 */
{
  id:34, name:"Leak", label:"Leak (TE delay/slide)", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:90,t:"RB"},
  ],
  rt:[
    {d:P([32,LOS],[84,LOS+12],[140,LOS+2],[152,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([106,90],[126,86]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:P([118,LOS],[118,74],[132,74],[150,60]), c:CLR.pass,w:2.2,a:true}, // leak
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1.8,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.2,a:true},
  ],
},

/* 35 */
{
  id:35, name:"Reverse_Pass", label:"Reverse Pass", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:80,t:"QB"},{x:106,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([172,LOS],[140,LOS+14],[108,LOS+18],[98,88]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:QQ([84,80],[116,82],[150,84]), c:CLR.pa,w:1.5,a:true,dsh:true},       // reverse exchange cue
    {d:CB([12,LOS],[12,28],[46,18],[76,16]), c:CLR.pass,w:2.5,a:true},
    {d:CB([32,LOS],[32,44],[56,34],[74,28]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,46],[150,46]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* ═══ SCREENS (36-40) ═══════════════════════════════════ */

/* 36 */
{
  id:36, name:"Tunnel_Motion", label:"Tunnel Screen + Motion", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[66,LOS+12],[120,LOS+4],[172,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([84,86],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([32,LOS],[36,72],[40,78],[42,82]), c:CLR.sit,w:2,a:true},
    {d:CB([84,92],[62,88],[52,84],[42,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:CB([118,LOS],[102,68],[78,66],[58,66]), c:CLR.block,w:1.5,a:true},
  ],
},

/* 37 */
{
  id:37, name:"Bubble_Motion", label:"Bubble + Motion", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:98,y:78,t:"RB"},
  ],
  rt:[
    {d:P([152,LOS],[112,LOS+14],[88,LOS+18],[72,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:QQ([176,LOS],[166,74],[154,80]), c:CLR.sit,w:1.8,a:true},
    {d:CB([152,LOS],[160,78],[168,84],[176,86]), c:CLR.sit,w:2,a:true},
  ],
},

/* 38 */
{
  id:38, name:"Slip_Motion", label:"RB Slip Screen + Motion", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([32,LOS],[84,LOS+12],[140,LOS+2],[152,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([84,86],[84,100]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([106,86],[96,92],[90,100],[86,104]), c:CLR.sit,w:2,a:true},
    {d:CB([84,100],[94,102],[104,104],[86,104]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:QQ([94,LOS],[102,74],[118,68]), c:CLR.block,w:1,a:true},
    {d:QQ([106,LOS],[116,72],[132,66]), c:CLR.block,w:1,a:true},
  ],
},

/* 39 */
{
  id:39, name:"Swing_Motion", label:"Swing Screen + Motion", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[66,LOS+12],[120,LOS+4],[172,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([84,86],[84,100]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([106,86],[132,88],[152,88],[166,82]), c:CLR.sit,w:2,a:true},
    {d:CB([84,100],[128,98],[152,88],[166,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:QQ([94,LOS],[102,74],[118,68]), c:CLR.block,w:1,a:true},
  ],
},

/* 40 */
{
  id:40, name:"TE_Delay_Motion", label:"TE Delay Screen + Motion", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([32,LOS],[84,LOS+12],[140,LOS+2],[152,LOS]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([84,86],[84,98]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([118,LOS],[132,78],[132,90],[130,94]), c:CLR.sit,w:2,a:true},
    {d:CB([84,98],[108,94],[124,94],[130,94]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:QQ([94,LOS],[100,74],[112,70]), c:CLR.block,w:1,a:true},
    {d:QQ([106,LOS],[114,72],[126,68]), c:CLR.block,w:1,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
];
