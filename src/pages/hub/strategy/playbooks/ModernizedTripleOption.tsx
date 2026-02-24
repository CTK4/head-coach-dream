/* ════════════════════════════════════════════════════════════════════════
   MODERNIZED TRIPLE OPTION — CORE 40 (UI DATA)
   Identity: option/run-first with modern spread elements (zone read, RPO-ish tags,
             arc/insert, glance/over PA shots, perimeter screens).
   Categories mapped to your UI:
     run         => Runs (25)
     pa          => Play-Action (10)
     situational => Screens (5)
   Requires your existing helpers/constants: CLR, P, QQ, CB, LOS, OL_X
   ════════════════════════════════════════════════════════════════════════ */

export const MODERN_TRIPLE_OPTION_CORE40 = [
/* ═══ RUNS (1-25) ═══════════════════════════════════════ */

/* 1 */
{
  id:1, name:"Inside_Veer", label:"Inside Veer (Dive / Keep / Pitch)", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:100,y:86,t:"RB"},{x:130,y:82,t:"H"}],
  rt:[
    {d:CB([100,86],[96,82],[92,74],[90,56]), c:CLR.run,w:2.8,a:true},                 // dive
    {d:CB([84,82],[92,78],[104,72],[116,56]), c:CLR.run,w:2.6,a:true,dsh:true},       // keep
    {d:CB([130,82],[150,74],[170,62],[188,48]), c:CLR.toss,w:1.6,a:true,dsh:true},    // pitch relation
    {d:P([172,LOS],[172,LOS-9]), c:CLR.block,w:1,a:true},                              // stalk
  ],
},

/* 2 */
{
  id:2, name:"Midline", label:"Midline Option (Read 3-tech)", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:84,y:82,t:"QB"},{x:92,y:96,t:"RB"},{x:132,y:82,t:"H"}],
  rt:[
    {d:CB([92,96],[90,86],[86,74],[84,56]), c:CLR.run,w:2.8,a:true},                   // midline dive
    {d:CB([84,82],[92,76],[104,68],[118,52]), c:CLR.run,w:2.6,a:true,dsh:true},       // keep
    {d:CB([132,82],[150,72],[170,60],[188,46]), c:CLR.toss,w:1.6,a:true,dsh:true},    // pitch
    {d:QQ([118,LOS],[112,LOS-6],[104,LOS-8]), c:CLR.block,w:1,a:true},                 // TE arc-ish block cue
  ],
},

/* 3 */
{
  id:3, name:"Outside_Veer", label:"Outside Veer (Wide Dive / Keep / Pitch)", cat:"run",
  sk:[{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"},{x:126,y:82,t:"H"}],
  rt:[
    {d:CB([106,86],[112,82],[124,74],[136,56]), c:CLR.run,w:2.8,a:true},               // wide dive path
    {d:CB([84,82],[96,78],[112,70],[128,56]), c:CLR.run,w:2.6,a:true,dsh:true},       // keep wider
    {d:CB([126,82],[146,74],[168,60],[188,44]), c:CLR.toss,w:1.6,a:true,dsh:true},    // pitch
    {d:P([172,LOS],[172,LOS-9]), c:CLR.block,w:1,a:true},
  ],
},

/* 4 */
{
  id:4, name:"Speed_Option_R", label:"Speed Option Right", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:112,y:84,t:"RB"}],
  rt:[
    {d:CB([84,82],[100,80],[120,72],[140,56]), c:CLR.run,w:2.8,a:true},                // QB keep speed
    {d:CB([112,84],[128,80],[152,68],[188,50]), c:CLR.toss,w:1.6,a:true,dsh:true},    // pitch trail
    {d:P([172,LOS],[172,LOS-10]), c:CLR.block,w:1,a:true},
    {d:P([12,LOS],[12,LOS-10]), c:CLR.block,w:1,a:true},
  ],
},

/* 5 */
{
  id:5, name:"Speed_Option_L", label:"Speed Option Left", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:56,y:84,t:"RB"}],
  rt:[
    {d:CB([84,82],[68,80],[48,72],[28,56]), c:CLR.run,w:2.8,a:true},
    {d:CB([56,84],[40,80],[22,68],[8,50]), c:CLR.toss,w:1.6,a:true,dsh:true},
    {d:P([12,LOS],[12,LOS-10]), c:CLR.block,w:1,a:true},
    {d:P([172,LOS],[172,LOS-10]), c:CLR.block,w:1,a:true},
  ],
},

/* 6 */
{
  id:6, name:"Counter_Option", label:"Counter Option (counter step + option)", cat:"run",
  sk:[{x:32,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"},{x:54,y:82,t:"H"}],
  rt:[
    {d:CB([84,82],[78,84],[72,84],[70,82]), c:CLR.pull,w:1.8,a:false,dsh:true},        // counter step
    {d:CB([84,82],[98,80],[118,72],[136,56]), c:CLR.run,w:2.8,a:true},                 // keep after counter
    {d:CB([106,86],[126,82],[154,68],[188,50]), c:CLR.toss,w:1.6,a:true,dsh:true},    // pitch
    {d:QQ([118,LOS],[110,LOS-6],[100,LOS-8]), c:CLR.block,w:1,a:true},
  ],
},

/* 7 */
{
  id:7, name:"Trap_Option", label:"Trap Option (inside trap + keep/pitch)", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:92,y:96,t:"RB"},{x:130,y:82,t:"H"}],
  rt:[
    {d:CB([92,96],[90,86],[86,74],[84,58]), c:CLR.run,w:2.8,a:true},                   // trap dive
    {d:CB([84,82],[92,78],[104,70],[116,56]), c:CLR.run,w:2.6,a:true,dsh:true},       // keep
    {d:CB([130,82],[150,74],[170,62],[188,48]), c:CLR.toss,w:1.6,a:true,dsh:true},    // pitch
    {d:CB([70,LOS],[78,LOS+8],[92,LOS-2],[98,LOS-8]), c:CLR.pull,w:1.6,a:true},       // pull/trap cue
  ],
},

/* 8 */
{
  id:8, name:"QB_Power_Read_R", label:"QB Power Read Right", cat:"run",
  sk:[{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"}],
  rt:[
    {d:CB([84,82],[92,78],[96,70],[100,52]), c:CLR.run,w:2.8,a:true},                 // QB power downhill
    {d:CB([70,LOS],[78,LOS+8],[96,LOS-2],[104,LOS-10]), c:CLR.pull,w:1.8,a:true},     // puller
    {d:CB([106,86],[130,84],[156,76],[186,62]), c:CLR.motion,w:1.5,a:false,dsh:true}, // RB widen for read
  ],
},

/* 9 */
{
  id:9, name:"Zone_Read_R", label:"Zone Read Right", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"}],
  rt:[
    {d:CB([106,86],[114,82],[126,74],[140,58]), c:CLR.run,w:2.8,a:true},               // RB zone path
    {d:CB([84,82],[92,80],[108,72],[124,58]), c:CLR.run,w:2.4,a:true,dsh:true},       // QB keep if pull
    {d:P([12,LOS],[12,LOS-9]), c:CLR.block,w:1,a:true},
    {d:P([172,LOS],[172,LOS-9]), c:CLR.block,w:1,a:true},
  ],
},

/* 10 */
{
  id:10, name:"Zone_Read_L", label:"Zone Read Left", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:84,y:82,t:"QB"},{x:62,y:86,t:"RB"}],
  rt:[
    {d:CB([62,86],[54,82],[42,74],[28,58]), c:CLR.run,w:2.8,a:true},
    {d:CB([84,82],[76,80],[60,72],[44,58]), c:CLR.run,w:2.4,a:true,dsh:true},
    {d:QQ([118,LOS],[110,LOS-6],[100,LOS-8]), c:CLR.block,w:1,a:true},
  ],
},

/* 11 */
{
  id:11, name:"Power_Read_R", label:"Power Read Right (RB keep / QB give)", cat:"run",
  sk:[{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"}],
  rt:[
    {d:CB([106,86],[122,84],[146,76],[176,60]), c:CLR.run,w:2.8,a:true},               // RB power sweep keep
    {d:CB([84,82],[92,78],[96,70],[100,52]), c:CLR.run,w:2.4,a:true,dsh:true},        // QB keep constraint
    {d:CB([70,LOS],[78,LOS+8],[96,LOS-2],[104,LOS-10]), c:CLR.pull,w:1.8,a:true},
  ],
},

/* 12 */
{
  id:12, name:"Bash_R", label:"BASH Right (Back Away Sweep / QB Power)", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"}],
  rt:[
    {d:CB([106,86],[130,86],[158,80],[186,68]), c:CLR.run,w:2.6,a:true},               // RB away sweep path
    {d:CB([84,82],[92,78],[96,70],[100,52]), c:CLR.run,w:2.8,a:true,dsh:true},        // QB bash keep downhill
    {d:CB([70,LOS],[78,LOS+8],[96,LOS-2],[104,LOS-10]), c:CLR.pull,w:1.8,a:true},
  ],
},

/* 13 */
{
  id:13, name:"Arc_Read_R", label:"Arc Read Right (TE/H arcs to second level)", cat:"run",
  sk:[{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"},{x:56,y:80,t:"H"}],
  rt:[
    {d:CB([106,86],[114,82],[126,74],[140,58]), c:CLR.run,w:2.8,a:true},
    {d:CB([84,82],[92,80],[108,72],[124,58]), c:CLR.run,w:2.4,a:true,dsh:true},
    {d:CB([118,LOS],[132,LOS-4],[148,LOS-10],[160,LOS-20]), c:CLR.block,w:1.6,a:true}, // arc
    {d:CB([56,80],[66,74],[78,70],[92,66]), c:CLR.block,w:1.3,a:true},                 // lead insert-ish
  ],
},

/* 14 */
{
  id:14, name:"Triple_R", label:"Triple Option Right (full triple)", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:100,y:86,t:"RB"},{x:130,y:82,t:"H"}],
  rt:[
    {d:CB([100,86],[98,82],[94,74],[92,56]), c:CLR.run,w:2.8,a:true},                 // dive
    {d:CB([84,82],[92,78],[104,70],[116,56]), c:CLR.run,w:2.6,a:true,dsh:true},       // keep
    {d:CB([130,82],[150,74],[170,62],[188,48]), c:CLR.toss,w:1.6,a:true,dsh:true},    // pitch
  ],
},

/* 15 */
{
  id:15, name:"Load_Option_R", label:"Load Option Right (WR loads force)", cat:"run",
  sk:[{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:112,y:84,t:"RB"}],
  rt:[
    {d:CB([84,82],[100,80],[120,72],[140,56]), c:CLR.run,w:2.8,a:true},
    {d:CB([112,84],[128,80],[152,68],[188,50]), c:CLR.toss,w:1.6,a:true,dsh:true},
    {d:CB([172,LOS],[176,60],[164,52],[150,48]), c:CLR.block,w:1.6,a:true},          // load block path cue
  ],
},

/* 16 */
{
  id:16, name:"Pitch_R", label:"Pitch Right (quick pitch)", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:112,y:84,t:"RB"}],
  rt:[
    {d:QQ([84,82],[118,78],[150,74]), c:CLR.toss,w:1.6,a:true,dsh:true},              // pitch action
    {d:CB([112,84],[140,78],[166,64],[188,48]), c:CLR.run,w:2.8,a:true},              // RB on edge
    {d:P([12,LOS],[12,LOS-9]), c:CLR.block,w:1,a:true},
    {d:P([172,LOS],[172,LOS-9]), c:CLR.block,w:1,a:true},
  ],
},

/* 17 */
{
  id:17, name:"Toss_Read_R", label:"Toss Read Right", cat:"run",
  sk:[{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:112,y:84,t:"RB"}],
  rt:[
    {d:QQ([84,82],[124,78],[156,74]), c:CLR.toss,w:1.6,a:true,dsh:true},
    {d:CB([156,74],[170,66],[182,56],[190,44]), c:CLR.run,w:2.8,a:true},
    {d:CB([84,82],[92,78],[96,70],[100,52]), c:CLR.run,w:2.2,a:true,dsh:true},       // keep if squeeze
  ],
},

/* 18 */
{
  id:18, name:"Split_Veer", label:"Split Veer (H-back slice)", cat:"run",
  sk:[{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"},{x:56,y:80,t:"H"}],
  rt:[
    {d:CB([106,86],[102,82],[96,74],[92,56]), c:CLR.run,w:2.8,a:true},                // dive
    {d:CB([84,82],[92,78],[104,70],[116,56]), c:CLR.run,w:2.6,a:true,dsh:true},      // keep
    {d:CB([56,80],[72,76],[96,72],[112,LOS+2]), c:CLR.pull,w:1.8,a:true},            // split slice
  ],
},

/* 19 */
{
  id:19, name:"Zone_Keep_Insert", label:"Zone Read Keep (Insert/Lead)", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"},{x:66,y:84,t:"FB"}],
  rt:[
    {d:CB([106,86],[114,82],[126,74],[140,58]), c:CLR.run,w:2.4,a:true,dsh:true},     // give look
    {d:CB([84,82],[92,78],[96,70],[100,52]), c:CLR.run,w:2.8,a:true},                // QB keep
    {d:CB([66,84],[74,78],[82,66],[90,52]), c:CLR.block,w:1.8,a:true},               // insert lead
  ],
},

/* 20 */
{
  id:20, name:"QB_Draw", label:"QB Draw (spread)", cat:"run",
  sk:[{x:32,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},{x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"}],
  rt:[
    {d:P([106,86],[124,86]), c:CLR.protect,w:2,a:false},                              // RB block
    {d:CB([84,86],[84,74],[84,62],[84,48]), c:CLR.run,w:2.8,a:true},                 // QB draw
    {d:P([32,LOS],[32,28]), c:CLR.pass,w:1,a:true,dsh:true},                         // clearouts
    {d:P([152,LOS],[152,28]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},

/* 21 */
{
  id:21, name:"Trap_Read", label:"Trap Read (read DE, trap inside)", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:84,y:82,t:"QB"},{x:92,y:96,t:"RB"}],
  rt:[
    {d:CB([92,96],[90,86],[86,74],[84,58]), c:CLR.run,w:2.8,a:true},
    {d:CB([84,82],[92,80],[108,72],[124,58]), c:CLR.run,w:2.4,a:true,dsh:true},
    {d:CB([70,LOS],[78,LOS+8],[92,LOS-2],[98,LOS-8]), c:CLR.pull,w:1.8,a:true},
  ],
},

/* 22 */
{
  id:22, name:"Speed_Sweep_Read", label:"Sweep Read (jet look + read)", cat:"run",
  sk:[{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:106,y:84,t:"RB"}],
  rt:[
    {d:CB([32,LOS],[58,LOS+14],[84,LOS+16],[132,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true}, // jet
    {d:CB([106,84],[134,84],[160,76],[186,62]), c:CLR.run,w:2.6,a:true},                      // sweep give
    {d:CB([84,82],[92,78],[96,70],[100,52]), c:CLR.run,w:2.4,a:true,dsh:true},                // keep
  ],
},

/* 23 */
{
  id:23, name:"Counter_Read", label:"Counter Read (RB counter / QB keep)", cat:"run",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:106,y:86,t:"RB"}],
  rt:[
    {d:CB([106,86],[92,86],[80,78],[72,64]), c:CLR.run,w:2.6,a:true},                 // RB counter track
    {d:CB([84,82],[92,78],[96,70],[100,52]), c:CLR.run,w:2.6,a:true,dsh:true},       // QB keep
    {d:CB([70,LOS],[78,LOS+8],[96,LOS-2],[104,LOS-10]), c:CLR.pull,w:1.8,a:true},
  ],
},

/* 24 */
{
  id:24, name:"QB_Power_L", label:"QB Power Left", cat:"run",
  sk:[{x:32,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:84,y:82,t:"QB"},{x:62,y:86,t:"RB"}],
  rt:[
    {d:CB([84,82],[76,78],[72,70],[68,52]), c:CLR.run,w:2.8,a:true},
    {d:CB([94,LOS],[86,LOS+8],[72,LOS-2],[66,LOS-10]), c:CLR.pull,w:1.8,a:true},
    {d:CB([62,86],[46,86],[30,80],[14,70]), c:CLR.motion,w:1.5,a:false,dsh:true},
  ],
},

/* 25 */
{
  id:25, name:"Option_ShortYard", label:"Option Short-Yard (tight keep/pitch)", cat:"run",
  sk:[{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},{x:84,y:82,t:"QB"},{x:100,y:86,t:"RB"},{x:130,y:82,t:"H"}],
  rt:[
    {d:CB([100,86],[96,82],[92,76],[90,62]), c:CLR.run,w:2.8,a:true},
    {d:CB([84,82],[92,80],[104,74],[116,62]), c:CLR.run,w:2.6,a:true,dsh:true},
    {d:CB([130,82],[150,76],[170,66],[188,56]), c:CLR.toss,w:1.6,a:true,dsh:true},
    {d:QQ([118,LOS],[126,LOS-6],[138,LOS-10]), c:CLR.block,w:1,a:true},
  ],
},

/* ═══ PLAY-ACTION (26-35) ══════════════════════════════ */

/* 26 */
{
  id:26, name:"PA_Post", label:"PA Post (option look)", cat:"pa",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([12,LOS],[12,32],[46,22],[76,20]), c:CLR.pass,w:2.5,a:true},
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,44]), c:CLR.pass,w:1.5,a:true},
    {d:P([84,78],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
  ],
},

/* 27 */
{
  id:27, name:"PA_Seam", label:"PA Seam (TE up seam)", cat:"pa",
  sk:[{x:32,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:P([118,LOS],[118,18]), c:CLR.pass,w:2.4,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,34]), c:CLR.pass,w:1.8,a:true},
  ],
},

/* 28 */
{
  id:28, name:"PA_Wheel", label:"PA Wheel (RB wheel)", cat:"pa",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([106,78],[132,76],[150,60],[160,30]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:2.0,a:true},
    {d:CB([172,LOS],[172,36],[150,26],[128,24]), c:CLR.pass,w:2.2,a:true},
  ],
},

/* 29 */
{
  id:29, name:"PA_Over", label:"PA Over (crossing shot)", cat:"pa",
  sk:[{x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([118,LOS],[108,46],[78,48],[50,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,24]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,34]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 30 */
{
  id:30, name:"PA_Fade", label:"PA Fade (boundary shot)", cat:"pa",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:P([172,LOS],[172,12]), c:CLR.pass,w:2.6,a:true},
    {d:CB([12,LOS],[12,36],[40,26],[64,22]), c:CLR.pass,w:2.2,a:true},
  ],
},

/* 31 */
{
  id:31, name:"PA_Switch", label:"PA Switch (switch verts)", cat:"pa",
  sk:[{x:32,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([152,LOS],[160,44],[150,28],[136,22]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,14]), c:CLR.pass,w:2.6,a:true},
    {d:P([32,LOS],[32,30]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 32 */
{
  id:32, name:"PA_Cross", label:"PA Cross (deep cross)", cat:"pa",
  sk:[{x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([172,LOS],[148,52],[90,52],[52,54]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([118,LOS],[118,46]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* 33 */
{
  id:33, name:"PA_Smash", label:"PA Smash (corner + hitch)", cat:"pa",
  sk:[{x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([12,LOS],[8,42],[24,26],[36,24]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,52],[32,56]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:2.0,a:true},
  ],
},

/* 34 */
{
  id:34, name:"PA_Boot", label:"PA Boot (option look boot)", cat:"pa",
  sk:[{x:12,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([84,78],[60,80],[44,80],[36,76]), c:CLR.qbmove,w:2,a:true},
    {d:P([118,LOS],[118,50],[150,50]), c:CLR.pass,w:2,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},

/* 35 */
{
  id:35, name:"PA_Pop", label:"PA Pop (quick TE pop)", cat:"pa",
  sk:[{x:32,y:LOS,t:"WR"},{x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},{x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"}],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:P([118,LOS],[118,54],[118,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,28]), c:CLR.pass,w:1.2,a:true,dsh:true},
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* ═══ SCREENS (36-40) ══════════════════════════════════ */

/* 36 */
{
  id:36, name:"Slip_Screen", label:"Slip Screen", cat:"situational",
  sk:[{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"}],
  rt:[
    {d:P([84,86],[84,100]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([106,86],[126,90],[146,90],[160,84]), c:CLR.sit,w:2,a:true},
    {d:CB([84,100],[124,98],[146,90],[160,84]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},

/* 37 */
{
  id:37, name:"WR_Tunnel", label:"WR Tunnel Screen", cat:"situational",
  sk:[{x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([84,86],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([32,LOS],[36,72],[40,78],[42,82]), c:CLR.sit,w:2,a:true},
    {d:CB([84,92],[62,88],[52,84],[42,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},

/* 38 */
{
  id:38, name:"Bubble_Screen", label:"Bubble Screen", cat:"situational",
  sk:[{x:32,y:LOS,t:"WR"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},{x:84,y:86,t:"QB"}],
  rt:[
    {d:P([84,86],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([176,LOS],[186,LOS+10],[186,LOS+18],[176,LOS+24]), c:CLR.sit,w:2,a:true},
    {d:P([152,LOS],[166,LOS+6]), c:CLR.block,w:1.6,a:true},
    {d:P([32,LOS],[32,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},

/* 39 */
{
  id:39, name:"Swing_Screen", label:"Swing Screen", cat:"situational",
  sk:[{x:12,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"}],
  rt:[
    {d:P([84,86],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([106,86],[132,88],[158,86],[176,80]), c:CLR.sit,w:2,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1,a:true,dsh:true},
    {d:P([12,LOS],[12,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},

/* 40 */
{
  id:40, name:"TE_Screen", label:"TE Screen", cat:"situational",
  sk:[{x:118,y:LOS,t:"TE"},{x:32,y:LOS,t:"WR"},{x:172,y:LOS,t:"WR"},{x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"}],
  rt:[
    {d:P([84,86],[84,98]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([118,LOS],[132,78],[132,90],[130,94]), c:CLR.sit,w:2,a:true},
    {d:CB([84,98],[108,94],[124,94],[130,94]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:P([32,LOS],[32,26]), c:CLR.pass,w:1,a:true,dsh:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
];
