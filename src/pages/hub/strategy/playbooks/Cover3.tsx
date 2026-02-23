/* ═══ COVER 3 SYSTEM — CORE 40 (Match / Fire Zones / Pressures) ═══
   Same format: { id, name, label, cat, sk, rt }
   Uses cat: 'coverage' | 'sim' | 'pressure' | 'situational'
   Colors assumed from prior:
     DCLR.zone, DCLR.man, DCLR.pressure, DCLR.sim, DCLR.disguise, DCLR.spy, DCLR.contain
*/

const COVER3_SYSTEM_PLAYS = [
/* ═══════════════════════════════════════════════
   BASE COVER 3 (SPOT DROP / MATCH) 1–16
   ═══════════════════════════════════════════════ */
{
  id:1, name:'C3_SpotDrop', label:'Cover 3 Spot Drop (3 Deep / 4 Under)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // 4 under
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,52],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    // rush lanes
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.contain,w:1.4,a:true},
    {d:P([156,LOS-6],[162,LOS+6]), c:DCLR.contain,w:1.4,a:true},
  ],
},
{
  id:2, name:'C3_Match_Rip', label:'Cover 3 Match (Rip)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // match hooks (rip = strong safety/overhang pushes)
    {d:CB([62,LOS-14],[74,44],[90,48],[104,52]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([58,LOS-8],[72,52],[90,56],[106,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([118,LOS-8],[110,52],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    // rush
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:3, name:'C3_Match_Liz', label:'Cover 3 Match (Liz)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // liz = opposite rotation emphasis
    {d:CB([138,LOS-14],[126,44],[110,48],[96,52]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([118,LOS-8],[108,52],[92,56],[78,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:4, name:'C3_Buzz', label:'Cover 3 Buzz (Safety Down / Middle Hook)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // rotate/buzz
    {d:P([138,LOS-18],[112,LOS-6]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // buzz hook
    {d:CB([112,LOS-6],[108,44],[106,52],[100,56]), c:DCLR.zone,w:2.0,a:true},
    // other under
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,52],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    // rush
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:5, name:'C3_Cloud', label:'Cover 3 Cloud (CB Squat to One Side)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-18,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // cloud side corner squat
    {d:P([26,LOS-10],[22,52],[30,56]), c:DCLR.zone,w:2.0,a:true},
    // 3 deep (post + other deep third)
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([62,LOS-18],[62,18]), c:DCLR.zone,w:2.0,a:true},
    // under
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,52],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    // rush
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:6, name:'C3_Sky', label:'Cover 3 Sky (Strong Safety Down)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // safety down (sky)
    {d:P([62,LOS-14],[54,LOS-6]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    // deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // sky curl/flat
    {d:CB([54,LOS-6],[52,44],[64,52],[78,56]), c:DCLR.zone,w:1.8,a:true},
    // under
    {d:CB([138,LOS-18],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,52],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    // rush
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:7, name:'C3_Press', label:'Cover 3 Press (Bail Corners)', cat:'coverage',
  sk:[
    {x:26,y:LOS-8,t:'CB'},{x:150,y:LOS-8,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // bail corners
    {d:CB([26,LOS-8],[26,48],[26,40],[26,34]), c:DCLR.man,w:2.0,a:true,dsh:true},
    {d:CB([150,LOS-8],[150,48],[150,40],[150,34]), c:DCLR.man,w:2.0,a:true,dsh:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,52],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:8, name:'C3_SeamMatch', label:'Seam Match (Carry #2)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
  ],
  rt:[
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // seam-carry by safeties
    {d:CB([62,LOS-14],[66,40],[76,34],[86,30]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([138,LOS-14],[134,40],[124,34],[114,30]), c:DCLR.zone,w:2.0,a:true},
    // hooks
    {d:CB([92,LOS-10],[92,46],[98,52],[104,56]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([108,LOS-10],[108,46],[102,52],[96,56]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:9, name:'C3_Mable', label:'Mable (Man Outside, 3 Deep)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
  ],
  rt:[
    // outside man
    {d:P([26,LOS-10],[26,26]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-10],[150,26]), c:DCLR.man,w:2.2,a:true},
    // deep post
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // other deep thirds via safeties (push wide)
    {d:CB([62,LOS-14],[58,38],[46,32],[34,28]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([138,LOS-14],[142,38],[154,32],[166,28]), c:DCLR.zone,w:2.0,a:true},
    // hooks
    {d:CB([92,LOS-10],[92,46],[98,52],[104,56]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([108,LOS-10],[108,46],[102,52],[96,56]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:10, name:'C3_WeakRotation', label:'Weak Rotation (Safety Rolls Weak)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-18,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
  ],
  rt:[
    {d:P([62,LOS-18],[52,LOS-6]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([52,LOS-6],[48,44],[60,52],[74,56]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([92,LOS-10],[92,46],[98,52],[104,56]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([108,LOS-10],[108,46],[102,52],[96,56]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:11, name:'C3_3Buzz', label:'3-Buzz (3 Deep / 3 Under Buzz)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
  ],
  rt:[
    {d:P([138,LOS-18],[112,LOS-6]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // 3 under (buzz + 2 hooks)
    {d:CB([112,LOS-6],[108,44],[106,52],[100,56]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([92,LOS-10],[92,46],[98,52],[104,56]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([108,LOS-10],[108,46],[102,52],[96,56]), c:DCLR.zone,w:1.8,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:12, name:'C3_Cut', label:'Cover 3 Cut (CB Cut Crossers)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
  ],
  rt:[
    {d:CB([26,LOS-10],[30,46],[44,52],[58,54]), c:DCLR.zone,w:2.0,a:true}, // cut in
    {d:CB([150,LOS-10],[146,46],[132,52],[118,54]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([92,LOS-10],[92,46],[98,52],[104,56]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([108,LOS-10],[108,46],[102,52],[96,56]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:13, name:'C3_2Read', label:'3 w/ 2-Read (Palms-ish to One Side)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
  ],
  rt:[
    // 2-read side corner squat
    {d:P([26,LOS-10],[22,52],[30,56]), c:DCLR.zone,w:2.0,a:true},
    // deep
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // seam safety
    {d:CB([62,LOS-14],[66,40],[76,34],[86,30]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([138,LOS-18],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    // hooks
    {d:CB([92,LOS-10],[92,46],[98,52],[104,56]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([108,LOS-10],[108,46],[102,52],[96,56]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:14, name:'C3_Tampa', label:'Tampa 2 (Middle Runner) — 3 Deep Feel', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:100,y:LOS-10,t:'LB'}, // runner
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // runner
    {d:P([100,LOS-10],[100,18]), c:DCLR.zone,w:2.2,a:true},
    // corners deep outside
    {d:P([26,LOS-10],[26,26]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,26]), c:DCLR.zone,w:2.0,a:true},
    // safeties halves
    {d:P([62,LOS-18],[62,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([138,LOS-18],[138,18]), c:DCLR.zone,w:2.0,a:true},
    // hooks/flat
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,52],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    // rush
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:15, name:'C3_Spy', label:'Cover 3 Spy (QB Contain + Spy)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:100,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([100,LOS-8],[98,46],[98,38],[100,34]), c:DCLR.spy,w:1.8,a:true}, // spy
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.contain,w:1.6,a:true},
    {d:P([156,LOS-6],[162,LOS+6]), c:DCLR.contain,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:16, name:'C3_Robber', label:'Cover 3 Robber (Low Hole)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
  ],
  rt:[
    {d:P([138,LOS-18],[100,56]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:CB([100,56],[92,44],[92,34],[100,30]), c:DCLR.spy,w:1.8,a:true},
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([58,LOS-8],[70,52],[84,56],[96,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-8],[110,52],[96,56],[84,58]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.pressure,w:1.4,a:true},
  ],
},

/* ═══════════════════════════════════════════════
   SIM PRESSURE / CREEPERS (STILL 3 BEHIND) 17–28
   ═══════════════════════════════════════════════ */
{
  id:17, name:'C3_Creeper_Sam', label:'C3 Creeper: SAM Adds, End Drops', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // rush 4 (DT/DT + SAM + one edge), drop other edge
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([58,LOS-8],[70,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([156,LOS-6],[162,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([44,LOS-6],[52,44],[66,46],[78,50]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    // cover 3 shell
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:18, name:'C3_Creeper_Will', label:'C3 Creeper: WILL Adds, Nickel Drops', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:60,y:LOS-10,t:'N'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([118,LOS-8],[110,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([60,LOS-10],[70,44],[88,50],[100,54]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:19, name:'C3_Sim_MugDrop', label:'C3 Sim: Double Mug → Dropper', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:92,y:LOS-12,t:'LB'},{x:108,y:LOS-12,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([92,LOS-12],[92,LOS-2]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([108,LOS-12],[108,LOS-2]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    // rush 4 (DT/DT + one mug + one edge), drop other mug
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([92,LOS-12],[92,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([156,LOS-6],[162,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([108,LOS-12],[108,44],[102,52],[96,56]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
  ],
},
{
  id:20, name:'C3_FireZone_3Under3Deep', label:'Fire Zone 3 Under / 3 Deep (5 Rush)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},
    {x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // rush 5 (both edges + both DT + one LB)
    {d:P([44,LOS-6],[38,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([156,LOS-6],[162,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([58,LOS-8],[70,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // 3 under
    {d:CB([62,LOS-14],[72,44],[88,50],[100,54]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([138,LOS-14],[128,44],[112,50],[100,54]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([118,LOS-8],[110,46],[98,52],[90,56]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:21, name:'C3_FireZone_SamSeam', label:'Fire Zone: SAM Seam Drop', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},
    {x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // rush 5, drop SAM to seam
    {d:P([44,LOS-6],[38,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([156,LOS-6],[162,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([118,LOS-8],[110,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:CB([58,LOS-8],[62,40],[76,34],[88,30]), c:DCLR.zone,w:1.9,a:true,dsh:true},
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
  ],
},
{
  id:22, name:'C3_CrossDog_Sim', label:'Sim: Cross Dog (ILB Exchange) + C3', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:92,y:LOS-12,t:'LB'},{x:108,y:LOS-12,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
  ],
  rt:[
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([92,LOS-12],[96,LOS+2],[104,LOS+6],[112,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([108,LOS-12],[104,LOS+2],[96,LOS+6],[88,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // curl/flat by safeties
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:23, name:'C3_Sim_ZoneExchange', label:'Sim: Zone Exchange (End Drop / LB Rush)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:CB([156,LOS-6],[148,44],[134,46],[122,50]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    {d:P([118,LOS-8],[110,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:24, name:'C3_Sim_RatReplace', label:'Sim: Rat Replace (Robber w/ 4 Rush)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},
    {x:60,y:LOS-10,t:'N'},{x:118,y:LOS-10,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    // robber down
    {d:P([138,LOS-18],[100,56]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:CB([100,56],[92,44],[92,34],[100,30]), c:DCLR.spy,w:1.8,a:true},
    // rush 4
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([44,LOS-8],[38,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:P([156,LOS-8],[162,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
  ],
},
{
  id:25, name:'C3_Creeper_Field', label:'C3 Creeper: Field Pressure (Nickel Add)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:152,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:60,y:LOS-10,t:'N'},{x:118,y:LOS-10,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([60,LOS-10],[72,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([156,LOS-8],[162,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([44,LOS-8],[54,44],[66,48],[78,52]), c:DCLR.zone,w:1.8,a:true,dsh:true}, // edge drop
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([152,LOS-10],[152,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:26, name:'C3_Sim_Boundary', label:'C3 Creeper: Boundary Add (SS Adds)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:152,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-18,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([62,LOS-18],[70,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([44,LOS-8],[38,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([156,LOS-8],[148,44],[134,46],[122,50]), c:DCLR.zone,w:1.8,a:true,dsh:true}, // edge drop
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([152,LOS-10],[152,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:27, name:'C3_FireZone_Weak', label:'Fire Zone: Weak Pressure (5 Rush)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},
    {x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([44,LOS-6],[38,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([156,LOS-6],[162,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([118,LOS-8],[110,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,44],[88,50],[100,54]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([138,LOS-14],[128,44],[112,50],[100,54]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([58,LOS-8],[70,46],[86,52],[96,56]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:28, name:'C3_FireZone_Field', label:'Fire Zone: Field Pressure (5 Rush)', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:152,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},
    {x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:60,y:LOS-10,t:'N'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([60,LOS-10],[72,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([44,LOS-6],[38,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([156,LOS-6],[162,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([152,LOS-10],[152,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,44],[88,50],[100,54]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([138,LOS-14],[128,44],[112,50],[100,54]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([118,LOS-8],[110,46],[98,52],[90,56]), c:DCLR.zone,w:1.8,a:true},
  ],
},

/* ═══════════════════════════════════════════════
   TRUE PRESSURES 29–34
   ═══════════════════════════════════════════════ */
{
  id:29, name:'C3_SlotBlitz', label:'Slot Blitz + C3 Behind', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:152,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:60,y:LOS-10,t:'N'},{x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([60,LOS-10],[66,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-6],[38,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([156,LOS-6],[162,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([152,LOS-10],[152,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // rotate replace (safety to curl/flat)
    {d:P([62,LOS-14],[54,LOS-6]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:CB([54,LOS-6],[52,44],[64,52],[78,56]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:30, name:'C3_DoubleA', label:'Double A-Gap Pressure + 3 Deep', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:92,y:LOS-12,t:'LB'},{x:108,y:LOS-12,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([92,LOS-12],[92,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([108,LOS-12],[108,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    // 3 deep behind pressure
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
  ],
},
{
  id:31, name:'C3_CornerCat', label:'Corner Cat + 3 Deep (Boundary)', cat:'pressure',
  sk:[
    {x:22,y:LOS-10,t:'CB'},{x:154,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([22,LOS-10],[16,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-6],[38,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([156,LOS-6],[162,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([154,LOS-10],[154,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([62,LOS-14],[62,30]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:32, name:'C3_SafetyBlitz', label:'Safety Blitz + Buzz Replace', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-10,t:'LB'},{x:108,y:LOS-10,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([138,LOS-18],[126,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([44,LOS-6],[38,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([156,LOS-6],[162,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    // buzz replace by ILB
    {d:CB([108,LOS-10],[106,44],[104,52],[100,56]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    // 3 deep
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
  ],
},
{
  id:33, name:'C3_ZeroTo3', label:'Disguise: Zero Look → Rotate to 3', cat:'pressure',
  sk:[
    {x:26,y:LOS-8,t:'CB'},{x:150,y:LOS-8,t:'CB'},
    {x:60,y:LOS-10,t:'N'},{x:118,y:LOS-10,t:'LB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-18,t:'S'},{x:138,y:LOS-18,t:'S'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    // show press-man then bail/rotate
    {d:P([26,LOS-8],[26,34]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([150,LOS-8],[150,34]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([62,LOS-18],[62,30]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    // final 3 deep
    {d:P([26,34],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,34],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // rush
    {d:P([82,LOS-6],[82,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([94,LOS-6],[94,LOS+10]), c:DCLR.pressure,w:2.0,a:true},
  ],
},
{
  id:34, name:'C3_AllOut', label:'All-Out Pressure (Short Yardage) + 3-Behind', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:92,y:LOS-12,t:'LB'},{x:108,y:LOS-12,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:60,y:LOS-10,t:'N'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([60,LOS-10],[60,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([58,LOS-8],[70,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([92,LOS-12],[92,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([108,LOS-12],[108,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([118,LOS-8],[110,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-6],[38,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([156,LOS-6],[162,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([82,LOS-6],[82,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([94,LOS-6],[94,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    // 3 behind leverage
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true,dsh:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true,dsh:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true,dsh:true},
  ],
},

/* ═══════════════════════════════════════════════
   SITUATIONAL 35–40
   ═══════════════════════════════════════════════ */
{
  id:35, name:'3rdLong_C3_Prevent', label:'3rd & Long: C3 Prevent (Deep Leverage)', cat:'situational',
  sk:[
    {x:18,y:LOS-16,t:'CB'},{x:182,y:LOS-16,t:'CB'},
    {x:100,y:LOS-26,t:'S'},{x:62,y:LOS-22,t:'S'},{x:138,y:LOS-22,t:'S'},
    {x:48,y:LOS-16,t:'N'},{x:132,y:LOS-16,t:'N'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([18,LOS-16],[18,20]), c:DCLR.zone,w:2.0,a:true},
    {d:P([182,LOS-16],[182,20]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-26],[100,12]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-22],[72,40],[88,46],[100,50]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-22],[128,40],[112,46],[100,50]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([48,LOS-16],[60,44],[82,50],[100,54]), c:DCLR.zone,w:1.4,a:true},
    {d:CB([132,LOS-16],[120,44],[98,50],[84,54]), c:DCLR.zone,w:1.4,a:true},
    {d:P([82,LOS-6],[82,LOS+4]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+4]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:36, name:'RedZone_C3_Match', label:'Red Zone: C3 Match (Cut Crossers)', cat:'situational',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:60,y:LOS-10,t:'N'},{x:118,y:LOS-10,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
  ],
  rt:[
    {d:CB([26,LOS-10],[30,46],[44,52],[58,54]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([150,LOS-10],[146,46],[132,52],[118,54]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([60,LOS-10],[72,50],[90,54],[106,56]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([118,LOS-10],[110,50],[98,54],[88,56]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+6]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+6]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:37, name:'2Min_C3_Buzz', label:'2-Minute: C3 Buzz (Rob Middle)', cat:'situational',
  sk:[
    {x:18,y:LOS-16,t:'CB'},{x:182,y:LOS-16,t:'CB'},
    {x:100,y:LOS-26,t:'S'},{x:62,y:LOS-22,t:'S'},{x:138,y:LOS-22,t:'S'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
    {x:112,y:LOS-10,t:'S'},
  ],
  rt:[
    {d:P([112,LOS-10],[100,56]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:CB([100,56],[92,44],[92,34],[100,30]), c:DCLR.spy,w:1.8,a:true},
    {d:P([18,LOS-16],[18,20]), c:DCLR.zone,w:2.0,a:true},
    {d:P([182,LOS-16],[182,20]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-26],[100,12]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-22],[72,40],[88,46],[100,50]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-22],[128,40],[112,46],[100,50]), c:DCLR.zone,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+4]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+4]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
{
  id:38, name:'GoalLine_C3', label:'Goal Line: Tight C3 (Force Outside)', cat:'situational',
  sk:[
    {x:22,y:LOS-6,t:'EDGE'},{x:44,y:LOS-6,t:'DT'},{x:68,y:LOS-6,t:'DT'},{x:92,y:LOS-6,t:'DT'},{x:116,y:LOS-6,t:'DT'},{x:140,y:LOS-6,t:'DT'},{x:162,y:LOS-6,t:'EDGE'},
    {x:26,y:LOS-12,t:'CB'},{x:150,y:LOS-12,t:'CB'},
    {x:100,y:LOS-18,t:'S'},
    {x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
  ],
  rt:[
    {d:P([22,LOS-6],[14,LOS+10]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-6],[44,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([68,LOS-6],[68,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([92,LOS-6],[92,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([116,LOS-6],[116,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([140,LOS-6],[140,LOS+12]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([162,LOS-6],[170,LOS+10]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([26,LOS-12],[26,34]), c:DCLR.zone,w:2.0,a:true,dsh:true},
    {d:P([150,LOS-12],[150,34]), c:DCLR.zone,w:2.0,a:true,dsh:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true,dsh:true},
  ],
},
{
  id:39, name:'3rdMedium_C3_Sim', label:'3rd & Medium: C3 Sim (Edge Drop)', cat:'situational',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:152,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:60,y:LOS-10,t:'N'},{x:118,y:LOS-10,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-8,t:'EDGE'},{x:156,y:LOS-8,t:'EDGE'},
  ],
  rt:[
    {d:P([60,LOS-10],[72,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([82,LOS-6],[82,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([94,LOS-6],[94,LOS+8]), c:DCLR.sim,w:1.8,a:true},
    {d:P([156,LOS-8],[162,LOS+6]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([44,LOS-8],[54,44],[66,48],[78,52]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([152,LOS-10],[152,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
  ],
},
{
  id:40, name:'RedZone_C3_Spy', label:'Red Zone: C3 Spy (Mobile QB)', cat:'situational',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},{x:62,y:LOS-14,t:'S'},{x:138,y:LOS-14,t:'S'},
    {x:58,y:LOS-8,t:'LB'},{x:100,y:LOS-8,t:'LB'},{x:118,y:LOS-8,t:'LB'},
    {x:82,y:LOS-6,t:'DT'},{x:94,y:LOS-6,t:'DT'},
    {x:44,y:LOS-6,t:'EDGE'},{x:156,y:LOS-6,t:'EDGE'},
  ],
  rt:[
    {d:P([26,LOS-10],[26,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[150,34]), c:DCLR.zone,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([62,LOS-14],[72,46],[86,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([138,LOS-14],[128,46],[114,54],[100,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([100,LOS-8],[98,46],[98,38],[100,34]), c:DCLR.spy,w:1.8,a:true},
    {d:P([44,LOS-6],[38,LOS+6]), c:DCLR.contain,w:1.6,a:true},
    {d:P([156,LOS-6],[162,LOS+6]), c:DCLR.contain,w:1.6,a:true},
    {d:P([82,LOS-6],[82,LOS+6]), c:DCLR.pressure,w:1.4,a:true},
    {d:P([94,LOS-6],[94,LOS+6]), c:DCLR.pressure,w:1.4,a:true},
  ],
},
];
