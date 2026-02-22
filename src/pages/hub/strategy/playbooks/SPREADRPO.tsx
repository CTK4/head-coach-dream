/* ═══ SPREAD RPO — CORE 40 PLAYS ═══
   Same PLAYS format.
   Categories: run (12) | pass (16) | pa (6) | situational (6)
   Notes:
   - Uses CLR.rpo for read lines, CLR.motion for jet/orbit, CLR.run for run path.
*/

const SPREAD_RPO_PLAYS = [
/* ═══ RUNS 1-12 ═══════════════════════════════════════ */
{
  id:1, name:'InsideZone_RPO_Base', label:'Inside Zone (RPO Base)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
  ],
  rt:[
    {d:CB([84,98],[84,88],[84,72],[84,52]), c:CLR.run,w:2.8,a:true},
    {d:P([84,84],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true}, // read mesh
    {d:P([58,LOS],[58,LOS-8]), c:CLR.block,w:1.1,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:2.0,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([106,LOS],[106,LOS-8]), c:CLR.block,w:1.1,a:true},
  ],
},
{
  id:2, name:'InsideZone_RPO_Split', label:'Inside Zone Split (H Slice)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
    {x:60,y:80,t:'H'},
  ],
  rt:[
    {d:CB([84,98],[84,88],[84,72],[84,52]), c:CLR.run,w:2.8,a:true},
    {d:CB([60,80],[74,76],[88,72],[100,LOS-6]), c:CLR.block,w:1.6,a:true}, // split/slice
    {d:P([84,84],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:2.0,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.6,a:true},
  ],
},
{
  id:3, name:'OutsideZone_RPO_Right', label:'Outside Zone Right (RPO)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:68,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([68,84],[100,80],[136,68],[168,46]), c:CLR.run,w:2.8,a:true},
    {d:P([84,84],[96,74]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([58,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([70,LOS],[82,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([82,LOS],[94,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([94,LOS],[106,LOS-5]), c:CLR.block,w:1,a:true},
    {d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]), c:CLR.block,w:1,a:true},
  ],
},
{
  id:4, name:'QB_Draw_Spread', label:'QB Draw (Spread)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([84,86],[84,78],[84,64],[84,44]), c:CLR.run,w:2.8,a:true}, // QB run
    {d:P([106,86],[106,84]), c:CLR.protect,w:2,a:false},
    {d:P([58,LOS],[58,LOS-10]), c:CLR.block,w:1.5,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.5,a:true},
    {d:P([82,LOS],[82,LOS-10]), c:CLR.block,w:1.5,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.5,a:true},
    {d:P([106,LOS],[106,LOS-10]), c:CLR.block,w:1.5,a:true},
  ],
},
{
  id:5, name:'ReadOption_Right', label:'Zone Read Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:100,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([100,84],[114,82],[136,70],[156,54]), c:CLR.run,w:2.8,a:true}, // RB keep track
    {d:CB([84,84],[76,84],[70,70],[66,52]), c:CLR.run,w:2.4,a:true,dsh:true}, // QB keep alt
    {d:P([84,84],[92,74]), c:CLR.rpo,w:1.5,a:true,dsh:true}, // read indicator
    {d:P([70,LOS],[82,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([82,LOS],[94,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([94,LOS],[106,LOS-5]), c:CLR.block,w:1,a:true},
  ],
},
{
  id:6, name:'ReadOption_Left', label:'Zone Read Left', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:70,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([70,84],[54,82],[34,70],[18,54]), c:CLR.run,w:2.8,a:true},
    {d:CB([84,84],[92,84],[98,70],[102,52]), c:CLR.run,w:2.4,a:true,dsh:true},
    {d:P([84,84],[76,74]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([58,LOS],[46,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([70,LOS],[58,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([82,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
  ],
},
{
  id:7, name:'JetSweep_RPO', label:'Jet Sweep (RPO Look)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:82,t:'QB'},{x:100,y:82,t:'RB'},
  ],
  rt:[
    {d:CB([34,LOS],[58,LOS+14],[84,LOS+16],[132,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([84,82],[100,74]), c:CLR.toss,w:1.2,a:true,dsh:true},
    {d:CB([132,LOS+2],[156,56],[174,46],[188,38]), c:CLR.run,w:2.8,a:true},
    {d:P([84,82],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:QQ([100,82],[84,80],[62,76]), c:CLR.block,w:1,a:true,dsh:true},
    {d:P([70,LOS],[82,LOS-5]), c:CLR.block,w:1,a:true},
  ],
},
{
  id:8, name:'Orbit_RPO_Run', label:'Orbit Motion (Run Constraint)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
  ],
  rt:[
    {d:CB([34,LOS],[60,LOS+14],[84,LOS+18],[86,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([106,82],[90,80],[84,68],[84,52]), c:CLR.run,w:2.8,a:true}, // inside handoff path
    {d:P([84,82],[96,74]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:2.0,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.6,a:true},
  ],
},
{
  id:9, name:'QB_Power_Read_Right', label:'QB Power Read Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:102,y:84,t:'RB'},
    {x:60,y:80,t:'H'},
  ],
  rt:[
    {d:CB([84,84],[74,84],[70,70],[70,50]), c:CLR.run,w:2.6,a:true}, // QB keep/power
    {d:CB([102,84],[118,82],[142,70],[162,54]), c:CLR.run,w:2.4,a:true,dsh:true}, // RB sweep alt
    {d:CB([60,80],[72,76],[86,72],[98,LOS-6]), c:CLR.pull,w:1.6,a:true}, // H kick
    {d:P([84,84],[92,74]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([82,LOS],[82,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([94,LOS],[94,LOS-8]), c:CLR.block,w:1.2,a:true},
  ],
},
{
  id:10, name:'Counter_Bash_RPO', label:'Counter Bash (QB/ RB Swap)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([106,84],[96,86],[92,72],[96,52]), c:CLR.run,w:2.6,a:true}, // RB counter
    {d:CB([84,84],[98,84],[104,70],[104,52]), c:CLR.run,w:2.4,a:true,dsh:true}, // QB sweep alt
    {d:CB([82,LOS],[78,LOS+10],[90,LOS+2],[102,LOS-6]), c:CLR.pull,w:1.8,a:true},
    {d:CB([70,LOS],[66,LOS+8],[82,LOS+2],[94,LOS-6]), c:CLR.pull,w:1.6,a:true},
    {d:P([84,84],[92,74]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:11, name:'Draw_RPO_LightBox', label:'RB Draw (Light Box)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([84,86],[84,100]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([106,86],[106,78],[102,68],[96,52]), c:CLR.run,w:2.8,a:true},
    {d:P([84,86],[84,72]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([58,LOS],[58,LOS-8]), c:CLR.protect,w:1.6,a:false},
    {d:P([70,LOS],[70,LOS-8]), c:CLR.protect,w:1.6,a:false},
    {d:P([82,LOS],[82,LOS-8]), c:CLR.protect,w:1.6,a:false},
    {d:P([94,LOS],[94,LOS-8]), c:CLR.protect,w:1.6,a:false},
    {d:P([106,LOS],[106,LOS-8]), c:CLR.protect,w:1.6,a:false},
  ],
},
{
  id:12, name:'SpeedOption_RPO', label:'Speed Option (Pitch Threat)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:102,y:84,t:'RB'},
  ],
  rt:[
    {d:QQ([84,84],[110,82],[138,80]), c:CLR.toss,w:1.3,a:true,dsh:true}, // pitch path
    {d:CB([84,84],[100,82],[124,70],[146,56]), c:CLR.run,w:2.6,a:true},  // QB path
    {d:CB([102,84],[120,82],[150,68],[170,54]), c:CLR.run,w:2.4,a:true,dsh:true}, // RB path
    {d:P([84,84],[92,74]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},

/* ═══ PASS CONCEPTS 13-28 ══════════════════════════════ */
{
  id:13, name:'RPO_Slant_Bubble', label:'RPO Slant + Bubble', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
  ],
  rt:[
    {d:P([98,78],[110,70],[118,52]), c:CLR.run,w:2,a:true,dsh:true},
    {d:CB([12,LOS],[28,54],[44,50],[58,50]), c:CLR.pass,w:2.2,a:true},      // slant
    {d:QQ([32,LOS],[44,74],[56,80]), c:CLR.pa,w:1.8,a:true},                 // bubble
    {d:QQ([176,LOS],[166,74],[154,80]), c:CLR.pa,w:1.8,a:true},              // bubble
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:14, name:'RPO_Glance', label:'RPO Glance (Skinny Post)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
  ],
  rt:[
    {d:P([98,78],[110,70],[118,52]), c:CLR.run,w:2,a:true,dsh:true},
    {d:CB([176,LOS],[168,52],[152,34],[136,30]), c:CLR.pass,w:2.2,a:true}, // glance
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
    {d:P([32,LOS],[32,52],[32,56]), c:CLR.pass,w:1.4,a:true},
    {d:P([84,78],[96,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:15, name:'RPO_Hitch_Screen', label:'RPO Hitch + Now Screen', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
  ],
  rt:[
    {d:P([98,78],[110,70],[118,52]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([12,LOS],[12,52],[12,56]), c:CLR.pass,w:2.0,a:true}, // hitch
    {d:CB([32,LOS],[36,72],[40,78],[42,82]), c:CLR.sit,w:2.0,a:true}, // now screen
    {d:CB([84,78],[62,76],[52,72],[42,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:16, name:'RPO_DoubleSlant', label:'RPO Double Slant', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
  ],
  rt:[
    {d:P([98,78],[110,70],[118,52]), c:CLR.run,w:2,a:true,dsh:true},
    {d:CB([12,LOS],[26,54],[48,50],[58,50]), c:CLR.pass,w:2.2,a:true},
    {d:CB([32,LOS],[46,54],[68,50],[78,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([152,LOS],[152,24]), c:CLR.pass,w:1.4,a:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:17, name:'RPO_Snag', label:'RPO Snag', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},
    {x:176,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
  ],
  rt:[
    {d:P([98,78],[110,70],[118,52]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([32,LOS],[32,56],[32,60]), c:CLR.pass,w:2.0,a:true}, // snag sit
    {d:CB([118,LOS],[118,46],[130,34],[146,30]), c:CLR.pass,w:2.2,a:true}, // corner
    {d:QQ([12,LOS],[10,56],[2,60]), c:CLR.pass,w:1.8,a:true}, // flat
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:18, name:'RPO_Stick', label:'RPO Stick', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
  ],
  rt:[
    {d:P([98,78],[110,70],[118,52]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:2.2,a:true}, // stick
    {d:QQ([152,LOS],[140,74],[132,80]), c:CLR.pass,w:1.8,a:true}, // quick out
    {d:P([176,LOS],[176,24]), c:CLR.pass,w:1.4,a:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:19, name:'RPO_Slant_Flat', label:'RPO Slant + Flat (Trips)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:170,y:LOS,t:'WR'},{x:188,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
  ],
  rt:[
    {d:P([98,78],[110,70],[118,52]), c:CLR.run,w:2,a:true,dsh:true},
    {d:CB([152,LOS],[166,56],[150,54],[134,54]), c:CLR.pass,w:2.2,a:true}, // slant
    {d:QQ([170,LOS],[176,74],[186,80]), c:CLR.pass,w:1.8,a:true}, // bubble
    {d:P([188,LOS],[188,22]), c:CLR.pass,w:1.4,a:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:20, name:'Quick_Game_Hitches', label:'Hitches (Spread)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,52],[12,56]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,52],[32,56]), c:CLR.pass,w:2.2,a:true},
    {d:P([152,LOS],[152,52],[152,56]), c:CLR.pass,w:2.2,a:true},
    {d:P([176,LOS],[176,52],[176,56]), c:CLR.pass,w:2.2,a:true},
    {d:P([106,86],[106,72],[116,72]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:21, name:'Mesh', label:'Mesh', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([34,LOS],[62,62],[100,62],[120,64]), c:CLR.pass,w:2.2,a:true},
    {d:CB([152,LOS],[122,60],[82,60],[60,62]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
    {d:P([176,LOS],[186,44],[176,28],[166,26]), c:CLR.pass,w:1.4,a:true},
    {d:QQ([98,86],[92,80],[84,78]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:22, name:'FourVerts', label:'Four Verts', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,12]), c:CLR.pass,w:2.4,a:true},
    {d:P([32,LOS],[32,12]), c:CLR.pass,w:2.4,a:true},
    {d:P([152,LOS],[152,12]), c:CLR.pass,w:2.4,a:true},
    {d:P([176,LOS],[176,12]), c:CLR.pass,w:2.4,a:true},
    {d:QQ([106,86],[132,82],[150,80]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:23, name:'Dagger', label:'Dagger', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,36],[86,36]), c:CLR.pass,w:2.2,a:true},
    {d:CB([32,LOS],[32,46],[54,34],[70,28]), c:CLR.pass,w:2.2,a:true},
    {d:P([152,LOS],[152,50],[120,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([176,LOS],[176,22]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:24, name:'Sail', label:'Sail', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([176,LOS],[186,44],[168,28],[152,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([152,LOS],[152,48],[120,48]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[132,82],[150,78]), c:CLR.pass,w:1.8,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:25, name:'Y_Cross', label:'Y Cross', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,22]), c:CLR.pass,w:1.6,a:true},
    {d:CB([118,LOS],[140,52],[110,38],[82,34]), c:CLR.pass,w:2.2,a:true},
    {d:CB([152,LOS],[156,60],[132,60],[108,60]), c:CLR.pass,w:2.0,a:true},
    {d:P([176,LOS],[176,18]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[92,82],[78,80]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},
{
  id:26, name:'AllGo', label:'All Go', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,12]), c:CLR.pass,w:2.4,a:true},
    {d:P([32,LOS],[32,12]), c:CLR.pass,w:2.4,a:true},
    {d:P([152,LOS],[152,14]), c:CLR.pass,w:2.4,a:true},
    {d:P([176,LOS],[176,12]), c:CLR.pass,w:2.4,a:true},
    {d:CB([106,86],[106,64],[92,58],[78,54]), c:CLR.pass,w:2.0,a:true},
  ],
},
{
  id:27, name:'Spacing', label:'Spacing', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,44],[12,48]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([118,LOS],[118,54],[132,54]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([152,LOS],[142,74],[132,80]), c:CLR.pass,w:1.8,a:true},
    {d:QQ([176,LOS],[166,74],[154,80]), c:CLR.pass,w:1.8,a:true},
    {d:QQ([106,86],[92,82],[78,80]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:28, name:'Shallow_Cross', label:'Shallow Cross', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([12,LOS],[36,62],[90,62],[136,62]), c:CLR.pass,w:2.2,a:true},
    {d:CB([176,LOS],[156,48],[112,48],[72,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([152,LOS],[152,26]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,86],[120,82],[134,80]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},

/* ═══ PLAY-ACTION / RPO PACKAGE 29-34 ══════════════════ */
{
  id:29, name:'RPO_Bubble_Sweep', label:'RPO Bubble Sweep', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
  ],
  rt:[
    {d:P([106,80],[120,76],[140,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:CB([34,LOS],[58,LOS+14],[84,LOS+18],[86,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:QQ([12,LOS],[22,74],[36,80]), c:CLR.pa,w:1.8,a:true}, // bubble
    {d:P([84,80],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([176,LOS],[176,24]), c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:30, name:'RPO_Glance_Orbit', label:'RPO Glance + Orbit', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
  ],
  rt:[
    {d:P([106,80],[118,72],[126,54]), c:CLR.run,w:2,a:true,dsh:true},
    {d:CB([34,LOS],[60,LOS+14],[84,LOS+18],[86,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([176,LOS],[168,52],[152,34],[136,30]), c:CLR.pass,w:2.2,a:true},
    {d:P([84,80],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:31, name:'PA_RPO_Sail', label:'PA RPO Sail (Tag)', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
  ],
  rt:[
    {d:P([106,80],[124,76]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([176,LOS],[186,44],[168,24],[152,22]), c:CLR.pass,w:2.2,a:true},
    {d:P([152,LOS],[152,46],[120,46]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,80],[132,82],[150,84]), c:CLR.pass,w:1.8,a:true},
    {d:P([84,80],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:32, name:'PA_RPO_Yankee', label:'PA RPO Yankee', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
  ],
  rt:[
    {d:P([106,80],[126,76]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([12,LOS],[12,32],[46,22],[76,20]), c:CLR.pass,w:2.5,a:true},
    {d:CB([176,LOS],[176,36],[132,24],[104,22]), c:CLR.pass,w:2.2,a:true},
    {d:P([152,LOS],[152,30]), c:CLR.pass,w:1.6,a:true},
    {d:P([84,80],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:33, name:'RPO_Peek', label:'RPO Peek (TE Pop)', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:80,t:'QB'},{x:98,y:80,t:'RB'},
  ],
  rt:[
    {d:P([98,80],[110,72],[118,54]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([118,LOS],[118,44],[118,46]), c:CLR.pass,w:2.2,a:true}, // pop
    {d:P([152,LOS],[152,24]), c:CLR.pass,w:1.4,a:true},
    {d:P([176,LOS],[176,18]), c:CLR.pass,w:2.2,a:true},
    {d:P([84,80],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},
{
  id:34, name:'RPO_Swing', label:'RPO Swing (RB Out)', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
  ],
  rt:[
    {d:P([106,80],[118,72],[126,54]), c:CLR.run,w:2,a:true,dsh:true},
    {d:CB([106,80],[128,80],[152,76],[166,72]), c:CLR.pass,w:2.0,a:true}, // swing
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
    {d:P([176,LOS],[176,24]), c:CLR.pass,w:1.4,a:true},
    {d:P([84,80],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
  ],
},

/* ═══ SITUATIONAL / SCREENS 35-40 ══════════════════════ */
{
  id:35, name:'RB_Screen_Wide', label:'RB Screen Wide', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([84,86],[84,100]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([106,86],[136,86],[156,80],[162,76]), c:CLR.sit,w:2,a:true},
    {d:CB([84,100],[128,98],[152,86],[162,76]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:QQ([94,LOS],[102,74],[118,68]), c:CLR.block,w:1,a:true},
    {d:QQ([106,LOS],[116,72],[132,66]), c:CLR.block,w:1,a:true},
    {d:P([176,LOS],[176,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:36, name:'WR_Tunnel', label:'WR Tunnel Screen', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([84,86],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([34,LOS],[36,72],[40,78],[42,82]), c:CLR.sit,w:2,a:true},
    {d:CB([84,92],[62,88],[52,84],[42,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:CB([12,LOS],[20,72],[34,78],[38,80]), c:CLR.block,w:1.5,a:true},
    {d:CB([152,LOS],[140,68],[120,66],[100,66]), c:CLR.block,w:1.5,a:true},
    {d:P([176,LOS],[176,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:37, name:'TE_Screen', label:'TE Screen', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([84,86],[84,98]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([118,LOS],[132,78],[132,90],[130,94]), c:CLR.sit,w:2,a:true},
    {d:CB([84,98],[108,94],[124,94],[130,94]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:QQ([94,LOS],[100,74],[112,70]), c:CLR.block,w:1,a:true},
    {d:QQ([106,LOS],[114,72],[126,68]), c:CLR.block,w:1,a:true},
    {d:P([12,LOS],[12,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:38, name:'2Min_Spike', label:'2-Minute Spike', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:74,t:'QB'},{x:106,y:74,t:'RB'},
  ],
  rt:[
    {d:P([84,74],[84,88]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:P([12,LOS],[12,58]), c:CLR.sit,w:1.6,a:true,dsh:true},
    {d:P([32,LOS],[32,58]), c:CLR.sit,w:1.6,a:true,dsh:true},
    {d:P([152,LOS],[152,58]), c:CLR.sit,w:1.6,a:true,dsh:true},
    {d:P([176,LOS],[176,58]), c:CLR.sit,w:1.6,a:true,dsh:true},
  ],
},
{
  id:39, name:'MaxProtect_Verts', label:'Max Protect Verts', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
    {x:118,y:LOS,t:'TE'},
  ],
  rt:[
    {d:P([106,86],[106,84]), c:CLR.protect,w:2,a:false},
    {d:P([118,LOS],[118,72]), c:CLR.protect,w:2,a:false},
    {d:P([12,LOS],[12,12]), c:CLR.pass,w:2.5,a:true},
    {d:P([152,LOS],[152,14]), c:CLR.pass,w:2.5,a:true},
    {d:P([176,LOS],[176,12]), c:CLR.pass,w:2.5,a:true},
    {d:P([84,86],[84,104]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
  ],
},
{
  id:40, name:'HardCount_Go', label:'Hard Count Go', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:74,t:'QB'},{x:106,y:74,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,12]), c:CLR.sit,w:2.2,a:true},
    {d:P([32,LOS],[32,12]), c:CLR.sit,w:2.2,a:true},
    {d:P([152,LOS],[152,12]), c:CLR.sit,w:2.2,a:true},
    {d:P([176,LOS],[176,12]), c:CLR.sit,w:2.2,a:true},
    {d:CB([106,74],[106,82],[106,50],[106,28]), c:CLR.pass,w:1.5,a:true},
    {d:P([84,74],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
  ],
},
];
