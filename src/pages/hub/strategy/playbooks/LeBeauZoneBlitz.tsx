/* ════════════════════════════════════════════════════════════════════════
   DICK LeBEAU 3–4 ZONE BLITZ (FIRE ZONE) — CORE 40 (UI DATA)
   Identity: 3–4 base, 3-deep/3-under fire zones, zone exchange droppers,
             controlled aggression, creepers that LOOK like fire.
   Categories: base(10) · fire(10) · exchange(5) · sim(5) · man(5) · red(3) · trap(2)

   Notes:
   - We keep your existing CAT_META keys: run/pass/pa/situational
   - Defensive plays mapped as:
       pass        => Base shells (coverage calls)
       pa          => Pressure / Fire Zone / Sim / Man-blended pressures
       situational => Red zone + Drop-8 / trap specials
   - Visuals are "concept diagrams" (not full 11 defenders). Intended for playbook UI.
   - If you want true defensive diagrams later: add DEF player types + a second renderer.

   Requires existing helpers/constants from your file:
   CLR, CAT_META, P, QQ, CB, LOS, OL_X
   ════════════════════════════════════════════════════════════════════════ */

export const LEBEAU_ZONE_BLITZ_CORE40 = [
/* ═══ I. BASE SHELLS (1-10) ══════════════════════════════════════════════ */
{
  id:1, name:"34_C3_Sky", label:"3-4 Cover 3 Sky (single-high)", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},   // left deep 1/3
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true}, // middle deep 1/3
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true}, // right deep 1/3
    {d:P([52,54],[52,36]), c:CLR.block,w:2,a:true,dsh:true}, // hook/curl
    {d:P([100,54],[100,36]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([148,54],[148,36]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:2, name:"34_C3_Buzz", label:"3-4 C3 Buzz (safety down)", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([120,26],[120,12]), c:CLR.pass,w:2.2,a:true}, // rotate post
    {d:CB([140,20],[122,32],[112,44],[108,56]), c:CLR.motion,w:1.8,a:true,dsh:true}, // "buzz" down
    {d:P([60,54],[60,36]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([120,54],[120,36]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:3, name:"34_C1_Robber", label:"3-4 C1 Robber (low hole)", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true}, // post safety
    {d:P([20,40],[20,18]), c:CLR.pass,w:1.8,a:true,dsh:true}, // man-ish lanes
    {d:P([180,40],[180,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:CB([100,44],[92,52],[82,56],[72,58]), c:CLR.motion,w:1.8,a:true}, // robber cut
    {d:P([60,54],[60,40]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([140,54],[140,40]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:4, name:"34_Quarters_Match", label:"3-4 Quarters Match", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([50,26],[50,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([150,26],[150,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true,dsh:true},   // corner carry
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true,dsh:true},
    {d:P([100,54],[100,36]), c:CLR.block,w:2,a:true,dsh:true},   // match hooks
  ],
},
{
  id:5, name:"34_C6_Field", label:"3-4 Cover 6 Field (split-field)", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([40,26],[40,12]), c:CLR.pass,w:2.2,a:true}, // quarters-side deep
    {d:P([80,26],[80,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([170,26],[170,12]), c:CLR.pass,w:2.2,a:true}, // half-side deep
    {d:P([150,54],[150,40]), c:CLR.block,w:2,a:true,dsh:true}, // half-side squat/flat
    {d:P([60,54],[60,36]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:6, name:"34_Press_C3", label:"3-4 Press Cover 3", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([20,28],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,28],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,28],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([20,70],[20,56]), c:CLR.motion,w:1.8,a:true}, // press->bail cue
    {d:P([180,70],[180,56]), c:CLR.motion,w:1.8,a:true},
  ],
},
{
  id:7, name:"34_Cloud_Boundary", label:"3-4 Cloud Boundary (squat CB)", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([170,26],[170,12]), c:CLR.pass,w:2.2,a:true}, // deep half-ish
    {d:P([180,58],[180,44]), c:CLR.block,w:2.2,a:true}, // cloud squat
    {d:P([40,26],[40,12]), c:CLR.pass,w:2.2,a:true,dsh:true},
    {d:P([80,26],[80,12]), c:CLR.pass,w:2.2,a:true,dsh:true},
    {d:P([120,54],[120,36]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:8, name:"34_Tampa2_Change", label:"3-4 Tampa 2 Changeup", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([60,26],[60,12]), c:CLR.pass,w:2.2,a:true},  // deep half
    {d:P([140,26],[140,12]), c:CLR.pass,w:2.2,a:true}, // deep half
    {d:P([100,54],[100,24]), c:CLR.block,w:2.2,a:true}, // middle run-through (Mike)
    {d:P([30,54],[30,40]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([170,54],[170,40]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:9, name:"34_C3_SeamCarry", label:"3-4 C3 Seam Carry", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([78,54],[78,26]), c:CLR.block,w:2.2,a:true,dsh:true}, // seam carry (curl->seam)
    {d:P([122,54],[122,26]), c:CLR.block,w:2.2,a:true,dsh:true},
  ],
},
{
  id:10, name:"34_Lock_Boundary", label:"3-4 Lock Boundary (MEG X)", cat:"pass",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true}, // post safety
    {d:P([180,66],[180,26]), c:CLR.pass,w:2.2,a:true,dsh:true}, // boundary lock lane
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([60,54],[60,36]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([140,54],[140,36]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},

/* ═══ II. CORE FIRE ZONE (11-20) — 5 rush / 3 deep / 3 under ════════════ */
{
  id:11, name:"FireX_Strong", label:"Fire X Strong (OLB rush, DE drop)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([160,LOS],[150,LOS-10],[140,LOS-22],[132,LOS-34]), c:CLR.pa,w:2.6,a:true}, // strong OLB rush
    {d:CB([58,LOS],[70,LOS-8],[86,LOS-10],[100,LOS-12]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop hook
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true}, // 3 deep
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([60,54],[60,38]), c:CLR.block,w:2,a:true,dsh:true}, // 3 under
    {d:P([140,54],[140,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:12, name:"FireX_Weak", label:"Fire X Weak (OLB rush, DE drop)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([40,LOS],[50,LOS-10],[60,LOS-22],[68,LOS-34]), c:CLR.pa,w:2.6,a:true}, // weak OLB rush
    {d:CB([106,LOS],[96,LOS-8],[84,LOS-10],[70,LOS-12]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([60,54],[60,38]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([140,54],[140,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:13, name:"Exchange_Strong", label:"Zone Exchange Strong (DE drop / OLB replace)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([58,LOS],[70,LOS-8],[86,LOS-14],[102,LOS-22]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop deeper hook
    {d:CB([160,LOS],[146,LOS-10],[136,LOS-22],[126,LOS-34]), c:CLR.pa,w:2.6,a:true}, // OLB replace rush
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,54],[100,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:14, name:"Exchange_Weak", label:"Zone Exchange Weak (DE drop / OLB replace)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([106,LOS],[96,LOS-8],[84,LOS-14],[68,LOS-22]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop
    {d:CB([40,LOS],[54,LOS-10],[64,LOS-22],[74,LOS-34]), c:CLR.pa,w:2.6,a:true}, // OLB replace rush
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,54],[100,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:15, name:"OLB_Under_Fire", label:"OLB Under Fire (inside loop)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([160,LOS],[148,LOS-4],[126,LOS-14],[110,LOS-30]), c:CLR.pa,w:2.6,a:true}, // OLB loop inside
    {d:CB([58,LOS],[72,LOS-6],[90,LOS-12],[106,LOS-16]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([60,54],[60,38]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([140,54],[140,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:16, name:"Nickel_FireZone", label:"Nickel Fire Zone", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([150,60],[142,52],[132,44],[120,34]), c:CLR.pa,w:2.6,a:true}, // nickel rush
    {d:CB([70,LOS],[78,LOS-8],[90,LOS-12],[102,LOS-16]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([60,54],[60,38]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([140,54],[140,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:17, name:"CrossDog_Zone", label:"Cross Dog Zone (ILB A-gap exchange)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([92,LOS+2],[88,LOS-8],[82,LOS-18],[74,LOS-30]), c:CLR.pa,w:2.6,a:true},  // ILB cross
    {d:CB([74,LOS+2],[80,LOS-8],[90,LOS-18],[98,LOS-30]), c:CLR.pa,w:2.6,a:true},  // ILB cross
    {d:CB([58,LOS],[70,LOS-8],[86,LOS-10],[100,LOS-12]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:18, name:"Boundary_FireZone", label:"Boundary Fire Zone", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([180,60],[170,52],[156,44],[140,34]), c:CLR.pa,w:2.6,a:true}, // boundary pressure
    {d:CB([58,LOS],[72,LOS-6],[90,LOS-12],[106,LOS-16]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([60,54],[60,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:19, name:"Field_FireZone", label:"Field Fire Zone", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([20,60],[30,52],[44,44],[60,34]), c:CLR.pa,w:2.6,a:true}, // field pressure
    {d:CB([106,LOS],[96,LOS-6],[84,LOS-12],[70,LOS-16]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([140,54],[140,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:20, name:"Bear_FireZone", label:"Bear Fire Zone (tight front + 3-deep/3-under)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([160,LOS],[148,LOS-6],[134,LOS-16],[120,LOS-30]), c:CLR.pa,w:2.6,a:true},
    {d:CB([40,LOS],[52,LOS-6],[66,LOS-16],[80,LOS-30]), c:CLR.pa,w:2.6,a:true},
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([60,54],[60,40]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([140,54],[140,40]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},

/* ═══ III. EDGE DROP / EXCHANGE (21-25) ══════════════════════════════════ */
{
  id:21, name:"EdgeDrop_Strong", label:"Edge Drop Strong (rush opposite OLB)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([160,LOS],[150,LOS-10],[138,LOS-22],[126,LOS-34]), c:CLR.pa,w:2.6,a:true}, // opposite rush
    {d:CB([40,LOS],[56,LOS-8],[74,LOS-6],[92,LOS-4]), c:CLR.block,w:2.2,a:true,dsh:true}, // edge drop to flat
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:22, name:"EdgeDrop_Weak", label:"Edge Drop Weak (rush opposite OLB)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([40,LOS],[50,LOS-10],[62,LOS-22],[74,LOS-34]), c:CLR.pa,w:2.6,a:true},
    {d:CB([160,LOS],[144,LOS-8],[126,LOS-6],[108,LOS-4]), c:CLR.block,w:2.2,a:true,dsh:true}, // edge drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:23, name:"DT_Peel_Exchange", label:"DT Peel Exchange (tackle drops hook)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([82,LOS],[82,LOS-10],[88,LOS-18],[96,LOS-24]), c:CLR.block,w:2.2,a:true,dsh:true}, // DT drop
    {d:CB([150,60],[140,52],[132,44],[124,34]), c:CLR.pa,w:2.6,a:true}, // nickel/OLB rush
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,54],[100,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:24, name:"DoubleEdge_Replace", label:"Double Edge Replace (one drops, one loops)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([40,LOS],[56,LOS-8],[74,LOS-6],[92,LOS-4]), c:CLR.block,w:2.2,a:true,dsh:true}, // edge drop
    {d:CB([160,LOS],[146,LOS-4],[126,LOS-14],[108,LOS-30]), c:CLR.pa,w:2.6,a:true}, // other loops inside
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:25, name:"InteriorLoop_Exchange", label:"Interior Loop Exchange", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([94,LOS],[98,LOS-10],[110,LOS-18],[122,LOS-30]), c:CLR.pa,w:2.6,a:true}, // interior loop
    {d:CB([58,LOS],[72,LOS-6],[90,LOS-12],[106,LOS-16]), c:CLR.block,w:2.2,a:true,dsh:true}, // DE drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
  ],
},

/* ═══ IV. SIMULATED FIRE (26-30) — show 5, rush 4 ═══════════════════════ */
{
  id:26, name:"SimFire_Strong", label:"Sim Fire Strong (show 5, rush 4)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([160,LOS],[150,LOS-8],[138,LOS-18],[126,LOS-30]), c:CLR.pa,w:2.4,a:true},
    {d:CB([92,LOS+2],[92,LOS-8],[92,LOS-18],[92,LOS-30]), c:CLR.pa,w:2.4,a:true,dsh:true}, // show mug then drop
    {d:P([92,LOS-8],[92,LOS+18]), c:CLR.block,w:2,a:true,dsh:true}, // dropper cue
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:27, name:"SimFire_Weak", label:"Sim Fire Weak (show 5, rush 4)", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([40,LOS],[50,LOS-8],[62,LOS-18],[74,LOS-30]), c:CLR.pa,w:2.4,a:true},
    {d:CB([74,LOS+2],[74,LOS-8],[74,LOS-18],[74,LOS-30]), c:CLR.pa,w:2.4,a:true,dsh:true},
    {d:P([74,LOS-8],[74,LOS+18]), c:CLR.block,w:2,a:true,dsh:true},
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:28, name:"Nickel_SimExchange", label:"Nickel Sim Exchange", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([150,60],[142,52],[132,44],[122,34]), c:CLR.pa,w:2.4,a:true}, // nickel rush
    {d:CB([106,LOS],[96,LOS-6],[84,LOS-10],[70,LOS-14]), c:CLR.block,w:2.0,a:true,dsh:true}, // end drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([120,54],[120,38]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:29, name:"MikeMug_Sim", label:"Mike Mug Sim", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([92,LOS+2],[92,LOS-6],[92,LOS-18],[92,LOS-30]), c:CLR.pa,w:2.4,a:true}, // mug show
    {d:P([92,LOS-6],[92,LOS+18]), c:CLR.block,w:2,a:true,dsh:true}, // drop out
    {d:CB([160,LOS],[150,LOS-10],[138,LOS-22],[126,LOS-34]), c:CLR.pa,w:2.4,a:true}, // edge rush
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:30, name:"Boundary_Creeper_Sim", label:"Boundary Creeper Sim", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([180,60],[170,52],[156,44],[140,34]), c:CLR.pa,w:2.4,a:true}, // boundary creeper
    {d:CB([58,LOS],[72,LOS-6],[90,LOS-12],[106,LOS-16]), c:CLR.block,w:2.0,a:true,dsh:true}, // end drop
    {d:P([20,26],[20,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,26],[180,12]), c:CLR.pass,w:2.2,a:true},
  ],
},

/* ═══ V. MAN-BLENDED PRESSURE (31-35) ════════════════════════════════════ */
{
  id:31, name:"C1_CrossDog", label:"C1 Cross Dog", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true}, // post safety
    {d:CB([92,LOS+2],[88,LOS-8],[82,LOS-18],[74,LOS-30]), c:CLR.pa,w:2.6,a:true},
    {d:CB([74,LOS+2],[80,LOS-8],[90,LOS-18],[98,LOS-30]), c:CLR.pa,w:2.6,a:true},
    {d:P([20,40],[20,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([180,40],[180,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
  ],
},
{
  id:32, name:"C1_OLB_Loop", label:"C1 OLB Loop", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:CB([160,LOS],[148,LOS-4],[126,LOS-14],[110,LOS-30]), c:CLR.pa,w:2.6,a:true},
    {d:P([20,40],[20,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([180,40],[180,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
  ],
},
{
  id:33, name:"C1_NickelCat", label:"C1 Nickel Cat", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:CB([150,60],[142,52],[132,44],[120,34]), c:CLR.pa,w:2.6,a:true},
    {d:P([20,40],[20,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([180,40],[180,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:CB([100,44],[92,52],[82,56],[72,58]), c:CLR.motion,w:1.6,a:true}, // robber help look
  ],
},
{
  id:34, name:"C1_DoubleA", label:"C1 Double A", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:CB([92,LOS+2],[92,LOS-8],[92,LOS-18],[92,LOS-34]), c:CLR.pa,w:2.6,a:true},
    {d:CB([74,LOS+2],[74,LOS-8],[74,LOS-18],[74,LOS-34]), c:CLR.pa,w:2.6,a:true},
    {d:P([20,40],[20,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([180,40],[180,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
  ],
},
{
  id:35, name:"C1_RobberFire", label:"C1 Robber Fire", cat:"pa",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:CB([160,LOS],[150,LOS-10],[138,LOS-22],[126,LOS-34]), c:CLR.pa,w:2.6,a:true},
    {d:CB([100,44],[92,52],[82,56],[72,58]), c:CLR.motion,w:2,a:true}, // robber cut
    {d:P([20,40],[20,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([180,40],[180,18]), c:CLR.pass,w:1.8,a:true,dsh:true},
  ],
},

/* ═══ VI. RED ZONE FIRE (36-38) ══════════════════════════════════════════ */
{
  id:36, name:"Red_Fire_Strong", label:"Red Fire Strong (compressed fire zone)", cat:"situational",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([160,LOS],[150,LOS-8],[138,LOS-18],[126,LOS-26]), c:CLR.pa,w:2.6,a:true},
    {d:CB([58,LOS],[70,LOS-6],[86,LOS-8],[100,LOS-10]), c:CLR.block,w:2.2,a:true,dsh:true}, // dropper tight
    {d:P([20,30],[20,14]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,30],[100,14]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,30],[180,14]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,54],[100,40]), c:CLR.block,w:2,a:true,dsh:true},
  ],
},
{
  id:37, name:"Red_Fire_Boundary", label:"Red Fire Boundary", cat:"situational",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([180,60],[170,52],[156,44],[140,34]), c:CLR.pa,w:2.6,a:true},
    {d:CB([106,LOS],[96,LOS-6],[84,LOS-8],[70,LOS-10]), c:CLR.block,w:2.2,a:true,dsh:true},
    {d:P([20,30],[20,14]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,30],[100,14]), c:CLR.pass,w:2.2,a:true},
    {d:P([180,30],[180,14]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:38, name:"Red_C1_Fire", label:"Red C1 Fire (man + robber help)", cat:"situational",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([100,26],[100,14]), c:CLR.pass,w:2.2,a:true},
    {d:CB([150,60],[142,52],[132,44],[120,34]), c:CLR.pa,w:2.6,a:true},
    {d:CB([100,44],[92,52],[84,56],[76,58]), c:CLR.motion,w:2,a:true}, // robber
    {d:P([20,38],[20,20]), c:CLR.pass,w:1.8,a:true,dsh:true},
    {d:P([180,38],[180,20]), c:CLR.pass,w:1.8,a:true,dsh:true},
  ],
},

/* ═══ VII. DROP-8 / TRAP (39-40) ═════════════════════════════════════════ */
{
  id:39, name:"Drop8_CloudFireLook", label:"Drop-8 Cloud Fire Look (show 5, rush 3)", cat:"situational",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([160,LOS],[150,LOS-8],[138,LOS-14],[126,LOS-18]), c:CLR.pa,w:2.2,a:true,dsh:true}, // show rush
    {d:CB([40,LOS],[50,LOS-8],[62,LOS-14],[74,LOS-18]), c:CLR.pa,w:2.2,a:true,dsh:true},
    {d:P([180,58],[180,44]), c:CLR.block,w:2.2,a:true}, // cloud squat
    {d:P([170,26],[170,12]), c:CLR.pass,w:2.2,a:true},  // deep half-ish
    {d:P([50,26],[50,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([150,26],[150,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([100,54],[100,32]), c:CLR.block,w:2.2,a:true,dsh:true}, // extra dropper
  ],
},
{
  id:40, name:"BracketPlus_Fire", label:"Bracket + Fire (slot double + 5-man)", cat:"situational",
  sk:[{x:84,y:86,t:"QB"}],
  rt:[
    {d:CB([150,60],[142,52],[132,44],[120,34]), c:CLR.pa,w:2.6,a:true}, // pressure
    {d:CB([92,LOS+2],[88,LOS-8],[82,LOS-18],[74,LOS-30]), c:CLR.pa,w:2.6,a:true}, // add-on
    {d:P([100,26],[100,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([60,30],[60,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([140,30],[140,18]), c:CLR.pass,w:2.2,a:true},
    {d:CB([120,40],[128,44],[138,44],[146,40]), c:CLR.motion,w:2,a:true}, // bracket "cone" cue
  ],
},
];
