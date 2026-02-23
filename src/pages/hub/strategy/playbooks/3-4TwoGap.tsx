/* ═══ 3-4 TWO-GAP (OKIE) SYSTEM — CORE 36 ═══
   Philosophy: control A/B gaps with 2-gapping DL (0/4i/4i), spill or box with OLBs,
   keep ILBs clean, pattern-match behind it.
   Format: { id, name, label, cat, sk, rt }
   cat: 'runfit' | 'coverage' | 'sim' | 'pressure' | 'situational'
   Assumes helpers: P(), CB(), LOS, DCLR.{zone,man,pressure,sim,disguise,spy,contain,runfit,fitA,fitB,fitC,fitD}
*/

const THREE_FOUR_TWOGAP_PLAYS = [
/* ═══════════════════════════════════════════════
   BASE FRONT / RUN-FIT CALLS 1–12
   (Okie / Tite-ish 3-4: 0 + 4i + 4i, OLBs set edge, ILBs scrape)
   ═══════════════════════════════════════════════ */
{
  id:1, name:'OKIE_Base_Box', label:'OKIE Base (3-4) — Box Fits / 2-Gap DL', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},          // 0-tech
    {x:78,y:LOS-6,t:'DE'},           // 4i
    {x:122,y:LOS-6,t:'DE'},          // 4i
    {x:44,y:LOS-6,t:'OLB'},          // edge
    {x:156,y:LOS-6,t:'OLB'},         // edge
    {x:88,y:LOS-10,t:'ILB'},
    {x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},
    {x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},
    {x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    // 2-gap responsibilities (modeled as short “strike + read”)
    {d:CB([100,LOS-6],[100,LOS+2],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.4,a:true}, // NT 2-gap
    {d:CB([78,LOS-6],[78,LOS+2],[74,LOS+6],[82,LOS+6]), c:DCLR.runfit,w:2.2,a:true},  // DE 2-gap
    {d:CB([122,LOS-6],[122,LOS+2],[118,LOS+6],[126,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    // edges set hard/soft depending on call (default box/contain)
    {d:P([44,LOS-6],[36,LOS+8]), c:DCLR.contain,w:2.1,a:true},
    {d:P([156,LOS-6],[164,LOS+8]), c:DCLR.contain,w:2.1,a:true},
    // ILBs scrape A/B based on flow (assign A/B fits)
    {d:CB([88,LOS-10],[92,LOS+10],[88,LOS+14]), c:DCLR.fitA,w:2.0,a:true},
    {d:CB([112,LOS-10],[108,LOS+10],[112,LOS+14]), c:DCLR.fitB,w:2.0,a:true},
    // simple quarters shell (safe behind run fits)
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:2, name:'OKIE_Spill', label:'OKIE Spill — Force Ball Outside (Edges Spill)', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([100,LOS-6],[100,LOS+2],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([78,LOS-6],[78,LOS+2],[74,LOS+6],[82,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([122,LOS-6],[122,LOS+2],[118,LOS+6],[126,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    // spill: attack inside shoulder to kick ball wider
    {d:P([44,LOS-6],[48,LOS+6],[38,LOS+10]), c:DCLR.runfit,w:2.2,a:true},
    {d:P([156,LOS-6],[152,LOS+6],[162,LOS+10]), c:DCLR.runfit,w:2.2,a:true},
    // ILBs scrape faster to alley
    {d:CB([88,LOS-10],[84,LOS+10],[72,LOS+16]), c:DCLR.fitC,w:2.0,a:true},
    {d:CB([112,LOS-10],[116,LOS+10],[128,LOS+16]), c:DCLR.fitD,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:3, name:'OKIE_Box', label:'OKIE Box — Keep Ball Inside (Edges Box)', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([100,LOS-6],[100,LOS+2],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([78,LOS-6],[78,LOS+2],[74,LOS+6],[82,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([122,LOS-6],[122,LOS+2],[118,LOS+6],[126,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    // box: keep outside shoulder free, maintain contain
    {d:P([44,LOS-6],[36,LOS+8],[34,LOS+12]), c:DCLR.contain,w:2.2,a:true},
    {d:P([156,LOS-6],[164,LOS+8],[166,LOS+12]), c:DCLR.contain,w:2.2,a:true},
    // ILBs plug downhill (A/B)
    {d:CB([88,LOS-10],[92,LOS+10],[96,LOS+14]), c:DCLR.fitA,w:2.0,a:true},
    {d:CB([112,LOS-10],[108,LOS+10],[104,LOS+14]), c:DCLR.fitB,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:4, name:'OKIE_Bear', label:'OKIE “Bear” Shift — Cover Both Guards (Heavy Interior)', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},
    {x:74,y:LOS-6,t:'DE'},{x:126,y:LOS-6,t:'DE'},
    {x:88,y:LOS-8,t:'ILB'},{x:112,y:LOS-8,t:'ILB'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([100,LOS-6],[100,LOS+2],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([74,LOS-6],[74,LOS+2],[70,LOS+6],[78,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([126,LOS-6],[126,LOS+2],[122,LOS+6],[130,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    // ILBs tighter fits (fast downhill)
    {d:CB([88,LOS-8],[92,LOS+12],[92,LOS+16]), c:DCLR.fitA,w:2.1,a:true},
    {d:CB([112,LOS-8],[108,LOS+12],[108,LOS+16]), c:DCLR.fitB,w:2.1,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:5, name:'OKIE_Tite', label:'OKIE Tite (0-4i-4i) — 2-Gap / No Bubbles', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},
    {x:82,y:LOS-6,t:'DE'},{x:118,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:90,y:LOS-10,t:'ILB'},{x:110,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([100,LOS-6],[100,LOS+2],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([82,LOS-6],[82,LOS+2],[78,LOS+6],[86,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([118,LOS-6],[118,LOS+2],[114,LOS+6],[122,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:CB([90,LOS-10],[92,LOS+10],[96,LOS+14]), c:DCLR.fitA,w:2.0,a:true},
    {d:CB([110,LOS-10],[108,LOS+10],[104,LOS+14]), c:DCLR.fitB,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:6, name:'OKIE_Wide9Edges', label:'OKIE Wide 9 Edges — Funnel to ILBs', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:36,y:LOS-6,t:'OLB'},{x:164,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([100,LOS-6],[100,LOS+2],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([78,LOS-6],[78,LOS+2],[74,LOS+6],[82,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([122,LOS-6],[122,LOS+2],[118,LOS+6],[126,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:P([36,LOS-6],[28,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:P([164,LOS-6],[172,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:CB([88,LOS-10],[92,LOS+10],[96,LOS+14]), c:DCLR.fitA,w:2.0,a:true},
    {d:CB([112,LOS-10],[108,LOS+10],[104,LOS+14]), c:DCLR.fitB,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:7, name:'OKIE_UnderShift', label:'OKIE Under Shift — Strength Call / 2-Gap', cat:'runfit',
  sk:[
    {x:98,y:LOS-6,t:'NT'},{x:76,y:LOS-6,t:'DE'},{x:120,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([98,LOS-6],[98,LOS+2],[96,LOS+6],[100,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([76,LOS-6],[76,LOS+2],[72,LOS+6],[80,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([120,LOS-6],[120,LOS+2],[116,LOS+6],[124,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:CB([88,LOS-10],[92,LOS+10],[96,LOS+14]), c:DCLR.fitA,w:2.0,a:true},
    {d:CB([112,LOS-10],[108,LOS+10],[104,LOS+14]), c:DCLR.fitB,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:8, name:'OKIE_OverShift', label:'OKIE Over Shift — Strength Call / 2-Gap', cat:'runfit',
  sk:[
    {x:102,y:LOS-6,t:'NT'},{x:80,y:LOS-6,t:'DE'},{x:124,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([102,LOS-6],[102,LOS+2],[100,LOS+6],[104,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([80,LOS-6],[80,LOS+2],[76,LOS+6],[84,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([124,LOS-6],[124,LOS+2],[120,LOS+6],[128,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:CB([88,LOS-10],[92,LOS+10],[96,LOS+14]), c:DCLR.fitA,w:2.0,a:true},
    {d:CB([112,LOS-10],[108,LOS+10],[104,LOS+14]), c:DCLR.fitB,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:9, name:'OKIE_Pinch', label:'OKIE Pinch — DL Squeeze / ILBs Over Top', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([100,LOS-6],[100,LOS+4],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([78,LOS-6],[84,LOS+4],[78,LOS+6],[82,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([122,LOS-6],[116,LOS+4],[118,LOS+6],[126,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:CB([88,LOS-10],[92,LOS+10],[96,LOS+14]), c:DCLR.fitA,w:2.0,a:true},
    {d:CB([112,LOS-10],[108,LOS+10],[104,LOS+14]), c:DCLR.fitB,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:10, name:'OKIE_SlantStrong', label:'OKIE Slant Strong — Angle DL / Keep 2-Gap Rules', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    // slant but still “read” (modeled as angled strike)
    {d:CB([100,LOS-6],[96,LOS+2],[96,LOS+6],[100,LOS+6]), c:DCLR.runfit,w:2.3,a:true},
    {d:CB([78,LOS-6],[74,LOS+2],[74,LOS+6],[78,LOS+6]), c:DCLR.runfit,w:2.1,a:true},
    {d:CB([122,LOS-6],[118,LOS+2],[118,LOS+6],[122,LOS+6]), c:DCLR.runfit,w:2.1,a:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.2,a:true},
    {d:CB([88,LOS-10],[92,LOS+10],[96,LOS+14]), c:DCLR.fitA,w:2.0,a:true},
    {d:CB([112,LOS-10],[108,LOS+10],[104,LOS+14]), c:DCLR.fitB,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:11, name:'OKIE_FireEdge', label:'OKIE Edge Fire — OLB Edge Attack / Inside Fits', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([100,LOS-6],[100,LOS+2],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([78,LOS-6],[78,LOS+2],[74,LOS+6],[82,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([122,LOS-6],[122,LOS+2],[118,LOS+6],[126,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    // edges attack upfield (more pass-like but still run-first)
    {d:P([44,LOS-6],[34,LOS+12]), c:DCLR.runfit,w:2.2,a:true},
    {d:P([156,LOS-6],[166,LOS+12]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([88,LOS-10],[92,LOS+10],[96,LOS+14]), c:DCLR.fitA,w:2.0,a:true},
    {d:CB([112,LOS-10],[108,LOS+10],[104,LOS+14]), c:DCLR.fitB,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:12, name:'OKIE_GapExchange', label:'OKIE Gap Exchange — ILB/OLB Swap Fits', cat:'runfit',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([100,LOS-6],[100,LOS+2],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([78,LOS-6],[78,LOS+2],[74,LOS+6],[82,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    {d:CB([122,LOS-6],[122,LOS+2],[118,LOS+6],[126,LOS+6]), c:DCLR.runfit,w:2.2,a:true},
    // exchange: edge crashes B/C while ILB scrapes wider
    {d:P([44,LOS-6],[54,LOS+8]), c:DCLR.fitB,w:2.1,a:true},
    {d:P([156,LOS-6],[146,LOS+8]), c:DCLR.fitA,w:2.1,a:true},
    {d:CB([88,LOS-10],[72,LOS+14],[62,LOS+18]), c:DCLR.fitC,w:2.0,a:true},
    {d:CB([112,LOS-10],[128,LOS+14],[138,LOS+18]), c:DCLR.fitD,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:1.8,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},

/* ═══════════════════════════════════════════════
   COVERAGE FAMILY (3-4 2-Gap Front + Shells) 13–22
   ═══════════════════════════════════════════════ */
{
  id:13, name:'OKIE_Cover3', label:'3-4 2-Gap + Cover 3 (Buzz Hook)', cat:'coverage',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'}, // post
    {x:72,y:LOS-12,t:'S'},  // buzz
    {x:128,y:LOS-12,t:'S'},
  ],
  rt:[
    // rush 4 (edges + two DL), keep 2-gap NT as “read” but pass rush lane
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:CB([100,LOS-6],[100,LOS+8]), c:DCLR.pressure,w:1.6,a:true}, // NT push
    // Cover 3
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([26,LOS-10],[18,14]), c:DCLR.zone,w:2.1,a:true},
    {d:P([150,LOS-10],[158,14]), c:DCLR.zone,w:2.1,a:true},
    // buzz/hook players
    {d:CB([72,LOS-12],[84,48],[96,54]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([128,LOS-12],[116,48],[104,54]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:14, name:'OKIE_Quarters', label:'3-4 2-Gap + Quarters (Run-First Match)', cat:'coverage',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    // Quarters landmarks
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([26,LOS-10],[24,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[152,18]), c:DCLR.zone,w:2.0,a:true},
    // ILBs hook
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:15, name:'OKIE_Tampa2', label:'3-4 2-Gap + Tampa 2 (MLB Runner)', cat:'coverage',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    // rush 4: edges + two DEs (NT read/spy push)
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    // halves
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.2,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.2,a:true},
    // corners squat/flat
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:2.0,a:true},
    // runner (choose one ILB as runner; other hook)
    {d:P([88,LOS-10],[88,18]), c:DCLR.zone,w:2.3,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:16, name:'OKIE_C2_Trap', label:'3-4 2-Gap + Cover 2 Trap (Corners Jump)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.2,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([26,LOS-10],[34,LOS-2],[22,56],[34,58]), c:DCLR.zone,w:2.1,a:true},
    {d:CB([150,LOS-10],[142,LOS-2],[154,56],[142,58]), c:DCLR.zone,w:2.1,a:true},
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:17, name:'OKIE_Cover1_Rat', label:'3-4 2-Gap + Cover 1 Rat (Low Hole)', cat:'coverage',
  sk:[
    {x:26,y:LOS-8,t:'CB'},{x:150,y:LOS-8,t:'CB'},
    {x:78,y:LOS-10,t:'N'},{x:122,y:LOS-10,t:'N'},
    {x:100,y:LOS-18,t:'S'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    // man coverage
    {d:P([26,LOS-8],[26,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-8],[150,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([78,LOS-10],[78,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([122,LOS-10],[122,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true}, // post
    // rat / low hole
    {d:CB([88,LOS-10],[100,46],[100,52]), c:DCLR.zone,w:2.0,a:true},
    // rush 4 (edges + one DE + NT push)
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:18, name:'OKIE_Cover0', label:'3-4 2-Gap + Cover 0 (Pressure Man)', cat:'coverage',
  sk:[
    {x:26,y:LOS-6,t:'CB'},{x:150,y:LOS-6,t:'CB'},
    {x:78,y:LOS-8,t:'N'},{x:122,y:LOS-8,t:'N'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    {d:P([26,LOS-6],[26,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-6],[150,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([78,LOS-8],[78,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([122,LOS-8],[122,54]), c:DCLR.man,w:2.0,a:true},
    // all-out-ish pressure (6)
    {d:P([44,LOS-6],[34,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([156,LOS-6],[166,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([78,LOS-6],[78,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([122,LOS-6],[122,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([100,LOS-6],[100,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([88,LOS-10],[92,LOS+14]), c:DCLR.pressure,w:2.0,a:true},
  ],
},
{
  id:19, name:'OKIE_Match2High', label:'3-4 2-Gap + 2-High Match (Palms/2-Read)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    // 2-high match landmarks
    {d:P([72,LOS-18],[66,22]), c:DCLR.zone,w:2.2,a:true},
    {d:P([128,LOS-18],[134,22]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([26,LOS-10],[24,18],[22,56]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([150,LOS-10],[152,18],[154,56]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:20, name:'OKIE_C3_Sky', label:'3-4 2-Gap + Cover 3 Sky (CBs Deep, SS Curl/Flat)', cat:'coverage',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:100,y:LOS-18,t:'S'},
    {x:72,y:LOS-12,t:'S'},{x:128,y:LOS-12,t:'S'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
    // deep thirds
    {d:P([26,LOS-10],[18,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([150,LOS-10],[158,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    // curl/flat
    {d:CB([72,LOS-12],[66,56],[78,56]), c:DCLR.zone,w:1.9,a:true},
    {d:CB([128,LOS-12],[134,56],[122,56]), c:DCLR.zone,w:1.9,a:true},
    // hooks
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:21, name:'OKIE_C1_Spy', label:'3-4 2-Gap + Cover 1 Spy (Mobile QB)', cat:'coverage',
  sk:[
    {x:26,y:LOS-8,t:'CB'},{x:150,y:LOS-8,t:'CB'},
    {x:78,y:LOS-10,t:'N'},{x:122,y:LOS-10,t:'N'},
    {x:100,y:LOS-18,t:'S'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    {d:P([26,LOS-8],[26,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-8],[150,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([78,LOS-10],[78,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([122,LOS-10],[122,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true}, // post
    // spy ILB
    {d:CB([112,LOS-10],[112,44],[110,40],[112,38]), c:DCLR.spy,w:2.0,a:true},
    // rush 4
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},
{
  id:22, name:'OKIE_Robber', label:'3-4 2-Gap + Robber (1-High, SS Drops)', cat:'coverage',
  sk:[
    {x:26,y:LOS-8,t:'CB'},{x:150,y:LOS-8,t:'CB'},
    {x:100,y:LOS-18,t:'S'},
    {x:112,y:LOS-12,t:'S'}, // robber
    {x:78,y:LOS-10,t:'N'},{x:122,y:LOS-10,t:'N'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    {d:P([26,LOS-8],[26,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-8],[150,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([78,LOS-10],[78,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([122,LOS-10],[122,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([112,LOS-12],[100,52]), c:DCLR.disguise,w:1.8,a:true,dsh:true},
    // rush 4
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.contain,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.pressure,w:1.6,a:true},
  ],
},

/* ═══════════════════════════════════════════════
   SIM PRESSURE / CREEPERS (4 RUSH, OKIE LOOK) 23–30
   ═══════════════════════════════════════════════ */
{
  id:23, name:'OKIE_Creeper_Sam', label:'Creeper: SAM Adds, DE Drops (Still 4 Rush)', cat:'sim',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:60,y:LOS-10,t:'SLOT'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    // rush 4: edges + SAM + one DE, drop other DE to hook
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([60,LOS-10],[72,LOS+12]), c:DCLR.sim,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:CB([122,LOS-6],[112,46],[104,52]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    // 2-high shell (safe)
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.1,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:24, name:'OKIE_Creeper_Will', label:'Creeper: WILL Adds, OLB Drops (4 Rush)', cat:'sim',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:150,y:LOS-10,t:'CB'},{x:26,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([112,LOS-10],[108,LOS+12]), c:DCLR.sim,w:2.0,a:true},
    {d:CB([156,LOS-6],[148,52],[140,56]), c:DCLR.zone,w:1.8,a:true,dsh:true}, // drop OLB
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.1,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:25, name:'OKIE_MugSim', label:'Sim: Double Mug A-Gaps → One Drops', cat:'sim',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:92,y:LOS-12,t:'ILB'},{x:108,y:LOS-12,t:'ILB'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([92,LOS-12],[92,LOS+12]), c:DCLR.sim,w:2.0,a:true},
    {d:P([108,LOS-12],[108,LOS+12]), c:DCLR.sim,w:2.0,a:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    // drop one mug
    {d:CB([108,LOS-12],[100,52],[96,56]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.1,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:26, name:'OKIE_Sim_ZoneExchange', label:'Sim: Zone Exchange (OLB Drops / ILB Rush)', cat:'sim',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:CB([44,LOS-6],[56,46],[78,52]), c:DCLR.zone,w:1.8,a:true,dsh:true}, // drop
    {d:P([88,LOS-10],[92,LOS+12]), c:DCLR.sim,w:2.0,a:true},            // rush
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.1,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:27, name:'OKIE_Sim_ContainSpy', label:'Sim: Contain + Spy (vs Scrambler)', cat:'sim',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([44,LOS-6],[36,LOS+6]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+6]), c:DCLR.contain,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.sim,w:1.6,a:true},
    {d:CB([112,LOS-10],[112,44],[110,40],[112,38]), c:DCLR.spy,w:2.0,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.1,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},
{
  id:28, name:'OKIE_Sim_Buzz', label:'Sim: Buzz Safety Down + 2-High Shell', cat:'sim',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
    {x:100,y:LOS-12,t:'S'}, // buzz down then rotate back
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    {d:P([100,LOS-12],[100,LOS-2]), c:DCLR.disguise,w:1.6,a:true,dsh:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.1,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:29, name:'OKIE_Sim_CrossDog', label:'Sim: Cross Dog (ILBs Exchange) + Quarters', cat:'sim',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:92,y:LOS-12,t:'ILB'},{x:108,y:LOS-12,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([92,LOS-12],[100,LOS+12]), c:DCLR.sim,w:2.0,a:true},
    {d:P([108,LOS-12],[100,LOS+12]), c:DCLR.sim,w:2.0,a:true},
    // keep 2 rush with OLBs as contain
    {d:P([44,LOS-6],[36,LOS+8]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-6],[164,LOS+8]), c:DCLR.contain,w:2.0,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.sim,w:1.6,a:true},
    // quarters behind it
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([26,LOS-10],[24,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([150,LOS-10],[152,18]), c:DCLR.zone,w:2.0,a:true},
  ],
},
{
  id:30, name:'OKIE_Sim_OverloadField', label:'Sim: Field Overload (4 Rush) + 2-High', cat:'sim',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:60,y:LOS-10,t:'SLOT'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([60,LOS-10],[72,LOS+12]), c:DCLR.sim,w:2.0,a:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.sim,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+10]), c:DCLR.sim,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+8]), c:DCLR.sim,w:1.6,a:true},
    {d:CB([156,LOS-6],[148,52],[140,56]), c:DCLR.zone,w:1.8,a:true,dsh:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.1,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.1,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.6,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.6,a:true},
  ],
},

/* ═══════════════════════════════════════════════
   PRESSURES (5–7 RUSH FROM 3-4 LOOK) 31–34
   ═══════════════════════════════════════════════ */
{
  id:31, name:'OKIE_DblEdgeFire', label:'Pressure: Double Edge Fire (5 Rush)', cat:'pressure',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
  ],
  rt:[
    {d:P([44,LOS-6],[34,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([156,LOS-6],[166,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([78,LOS-6],[78,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([122,LOS-6],[122,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([100,LOS-6],[100,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    // keep 2-high
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:32, name:'OKIE_DblA', label:'Pressure: Double A-Gap (ILBs) + Cover 1', cat:'pressure',
  sk:[
    {x:26,y:LOS-8,t:'CB'},{x:150,y:LOS-8,t:'CB'},
    {x:78,y:LOS-10,t:'N'},{x:122,y:LOS-10,t:'N'},
    {x:100,y:LOS-18,t:'S'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:92,y:LOS-12,t:'ILB'},{x:108,y:LOS-12,t:'ILB'},
  ],
  rt:[
    {d:P([26,LOS-8],[26,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([150,LOS-8],[150,56]), c:DCLR.man,w:2.2,a:true},
    {d:P([78,LOS-10],[78,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([122,LOS-10],[122,54]), c:DCLR.man,w:2.0,a:true},
    {d:P([100,LOS-18],[100,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([92,LOS-12],[92,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([108,LOS-12],[108,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-6],[34,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([156,LOS-6],[166,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
  ],
},
{
  id:33, name:'OKIE_CornerCat', label:'Pressure: Corner Cat (Boundary) + 2-High', cat:'pressure',
  sk:[
    {x:22,y:LOS-10,t:'CB'},{x:154,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    {d:P([22,LOS-10],[16,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-6],[34,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([78,LOS-6],[78,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([122,LOS-6],[122,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([156,LOS-6],[166,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([154,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-10],[108,46],[104,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},
{
  id:34, name:'OKIE_SafetyPressure', label:'Pressure: Safety Insert (5 Rush) + Rotate', cat:'pressure',
  sk:[
    {x:26,y:LOS-10,t:'CB'},{x:150,y:LOS-10,t:'CB'},
    {x:72,y:LOS-18,t:'S'},{x:128,y:LOS-18,t:'S'},
    {x:112,y:LOS-14,t:'S'}, // insert
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:88,y:LOS-10,t:'ILB'},{x:112,y:LOS-10,t:'ILB'},
  ],
  rt:[
    {d:P([112,LOS-14],[120,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([44,LOS-6],[34,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    {d:P([78,LOS-6],[78,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([122,LOS-6],[122,LOS+12]), c:DCLR.pressure,w:2.0,a:true},
    {d:P([156,LOS-6],[166,LOS+14]), c:DCLR.pressure,w:2.2,a:true},
    // rotate replace (simplified)
    {d:P([72,LOS-18],[72,18]), c:DCLR.zone,w:2.0,a:true},
    {d:P([128,LOS-18],[128,18]), c:DCLR.zone,w:2.0,a:true},
    {d:CB([26,LOS-10],[22,56],[34,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([150,LOS-10],[154,56],[142,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([88,LOS-10],[92,46],[96,52]), c:DCLR.zone,w:1.8,a:true},
  ],
},

/* ═══════════════════════════════════════════════
   SITUATIONAL 35–36
   ═══════════════════════════════════════════════ */
{
  id:35, name:'ShortYard_OKIE_Goal', label:'Goal Line OKIE — Heavy 2-Gap / Box', cat:'situational',
  sk:[
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-6,t:'OLB'},{x:156,y:LOS-6,t:'OLB'},
    {x:90,y:LOS-8,t:'ILB'},{x:110,y:LOS-8,t:'ILB'},
    {x:26,y:LOS-8,t:'CB'},{x:150,y:LOS-8,t:'CB'},
    {x:72,y:LOS-16,t:'S'},{x:128,y:LOS-16,t:'S'},
  ],
  rt:[
    {d:CB([100,LOS-6],[100,LOS+4],[98,LOS+6],[102,LOS+6]), c:DCLR.runfit,w:2.6,a:true},
    {d:CB([78,LOS-6],[78,LOS+4],[74,LOS+6],[82,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([122,LOS-6],[122,LOS+4],[118,LOS+6],[126,LOS+6]), c:DCLR.runfit,w:2.4,a:true},
    {d:P([44,LOS-6],[36,LOS+10]), c:DCLR.runfit,w:2.4,a:true},
    {d:P([156,LOS-6],[164,LOS+10]), c:DCLR.runfit,w:2.4,a:true},
    {d:CB([90,LOS-8],[92,LOS+14]), c:DCLR.fitA,w:2.2,a:true},
    {d:CB([110,LOS-8],[108,LOS+14]), c:DCLR.fitB,w:2.2,a:true},
    {d:CB([26,LOS-8],[22,58],[34,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([150,LOS-8],[154,58],[142,58]), c:DCLR.zone,w:1.8,a:true},
    {d:P([72,LOS-16],[72,22]), c:DCLR.zone,w:2.0,a:true},
    {d:P([128,LOS-16],[128,22]), c:DCLR.zone,w:2.0,a:true},
  ],
},
{
  id:36, name:'3rdLong_OKIE_2High', label:'3rd & Long OKIE — 2-High, Rush 4, Hooks Wide', cat:'situational',
  sk:[
    {x:26,y:LOS-16,t:'CB'},{x:150,y:LOS-16,t:'CB'},
    {x:72,y:LOS-26,t:'S'},{x:128,y:LOS-26,t:'S'},
    {x:100,y:LOS-6,t:'NT'},{x:78,y:LOS-6,t:'DE'},{x:122,y:LOS-6,t:'DE'},
    {x:44,y:LOS-8,t:'OLB'},{x:156,y:LOS-8,t:'OLB'},
    {x:88,y:LOS-14,t:'ILB'},{x:112,y:LOS-14,t:'ILB'},
  ],
  rt:[
    {d:P([44,LOS-8],[36,LOS+6]), c:DCLR.contain,w:2.0,a:true},
    {d:P([156,LOS-8],[164,LOS+6]), c:DCLR.contain,w:2.0,a:true},
    {d:P([78,LOS-6],[78,LOS+6]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([122,LOS-6],[122,LOS+6]), c:DCLR.pressure,w:1.8,a:true},
    {d:P([100,LOS-6],[100,LOS+6]), c:DCLR.pressure,w:1.6,a:true},
    {d:P([72,LOS-26],[72,14]), c:DCLR.zone,w:2.2,a:true},
    {d:P([128,LOS-26],[128,14]), c:DCLR.zone,w:2.2,a:true},
    {d:CB([26,LOS-16],[22,56],[34,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([150,LOS-16],[154,56],[142,58]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([88,LOS-14],[76,48],[90,54]), c:DCLR.zone,w:1.8,a:true},
    {d:CB([112,LOS-14],[124,48],[110,54]), c:DCLR.zone,w:1.8,a:true},
  ],
},
];
