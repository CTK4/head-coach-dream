/* ═══ WEST COAST (Classic Walsh) — CORE 40 PLAYS ═══
   Format matches your existing PLAYS objects.
   Categories: run (12) | pass (16) | pa (6) | situational (6)
*/

const WEST_COAST_PLAYS = [
/* ═══ RUNS 1-12 ═══════════════════════════════════════ */
{
  id:1, name:'InsideZone_Left', label:'Inside Zone Left', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:84,y:98,t:'RB'},
  ],
  rt:[
    {d:CB([84,98],[78,88],[70,76],[62,52]), c:CLR.run,   w:2.8,a:true},
    {d:P([58,LOS],[58,LOS-8]), c:CLR.block,w:1.2,a:true},
    {d:P([70,LOS],[70,LOS-10]),c:CLR.block,w:1.4,a:true},
    {d:P([82,LOS],[82,LOS-10]),c:CLR.block,w:1.4,a:true},
    {d:P([94,LOS],[94,LOS-10]),c:CLR.block,w:1.4,a:true},
    {d:P([106,LOS],[106,LOS-8]),c:CLR.block,w:1.2,a:true},
    {d:QQ([118,LOS],[108,LOS-6],[96,LOS-6]), c:CLR.block,w:1.1,a:true},
  ],
},
{
  id:2, name:'InsideZone_Right', label:'Inside Zone Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:84,y:98,t:'RB'},
  ],
  rt:[
    {d:CB([84,98],[90,88],[100,76],[110,52]), c:CLR.run,   w:2.8,a:true},
    {d:P([58,LOS],[58,LOS-8]), c:CLR.block,w:1.2,a:true},
    {d:P([70,LOS],[70,LOS-10]),c:CLR.block,w:1.4,a:true},
    {d:P([82,LOS],[82,LOS-10]),c:CLR.block,w:1.4,a:true},
    {d:P([94,LOS],[94,LOS-10]),c:CLR.block,w:1.4,a:true},
    {d:P([106,LOS],[106,LOS-8]),c:CLR.block,w:1.2,a:true},
    {d:QQ([118,LOS],[128,LOS-6],[140,LOS-6]), c:CLR.block,w:1.1,a:true},
  ],
},
{
  id:3, name:'Duo_Left', label:'Duo Left', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:84,y:98,t:'RB'},
  ],
  rt:[
    {d:CB([84,98],[78,90],[74,74],[70,54]), c:CLR.run,w:2.8,a:true},
    {d:P([70,LOS],[70,LOS-12]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:1.8,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.3,a:true},
    {d:P([58,LOS],[58,LOS-8]),  c:CLR.block,w:1.1,a:true},
    {d:P([106,LOS],[106,LOS-8]),c:CLR.block,w:1.1,a:true},
  ],
},
{
  id:4, name:'Duo_Right', label:'Duo Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:84,y:98,t:'RB'},
  ],
  rt:[
    {d:CB([84,98],[90,90],[96,74],[100,54]), c:CLR.run,w:2.8,a:true},
    {d:P([94,LOS],[94,LOS-12]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:1.8,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.3,a:true},
    {d:P([58,LOS],[58,LOS-8]),  c:CLR.block,w:1.1,a:true},
    {d:P([106,LOS],[106,LOS-8]),c:CLR.block,w:1.1,a:true},
  ],
},
{
  id:5, name:'Power_O_Right', label:'Power O Right (G Pull)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:100,y:84,t:'RB'},
    {x:66,y:84,t:'FB'},
  ],
  rt:[
    {d:CB([100,84],[94,82],[96,66],[102,50]), c:CLR.run,w:2.8,a:true},
    {d:CB([82,LOS],[78,LOS+10],[90,LOS+2],[100,LOS-6]), c:CLR.pull,w:1.8,a:true},
    {d:CB([66,84],[74,78],[84,66],[94,54]), c:CLR.block,w:1.8,a:true},
    {d:P([58,LOS],[58,LOS-10]), c:CLR.block,w:1.2,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.2,a:true},
    {d:P([94,LOS],[94,LOS-6]),  c:CLR.block,w:1.0,a:true},
    {d:P([106,LOS],[106,LOS-6]),c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:6, name:'Counter_GT_Left', label:'Counter GT Left', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([106,84],[94,86],[86,70],[78,52]), c:CLR.run,w:2.8,a:true},
    {d:CB([82,LOS],[88,LOS+10],[78,LOS+2],[70,LOS-6]), c:CLR.pull,w:1.8,a:true},
    {d:CB([94,LOS],[104,LOS+8],[90,LOS+2],[78,LOS-6]), c:CLR.pull,w:1.6,a:true},
    {d:P([58,LOS],[58,LOS-8]), c:CLR.block,w:1.1,a:true},
    {d:P([70,LOS],[70,LOS-8]), c:CLR.block,w:1.1,a:true},
    {d:QQ([118,LOS],[108,LOS-6],[96,LOS-6]), c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:7, name:'Sweep_Toss_Right', label:'Toss Sweep Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
  ],
  rt:[
    {d:QQ([84,82],[118,78],[146,74]), c:CLR.toss,w:1.5,a:true,dsh:true},
    {d:CB([146,74],[162,64],[176,52],[186,42]), c:CLR.run,w:2.8,a:true},
    {d:P([58,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
    {d:P([70,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
    {d:P([82,LOS],[94,LOS-5]),  c:CLR.block,w:1,a:true},
    {d:P([94,LOS],[106,LOS-5]), c:CLR.block,w:1,a:true},
    {d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]), c:CLR.block,w:1,a:true},
  ],
},
{
  id:8, name:'Sweep_Toss_Left', label:'Toss Sweep Left', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:82,t:'QB'},{x:70,y:82,t:'RB'},
  ],
  rt:[
    {d:QQ([84,82],[56,78],[34,74]), c:CLR.toss,w:1.5,a:true,dsh:true},
    {d:CB([34,74],[22,64],[14,54],[10,42]), c:CLR.run,w:2.8,a:true},
    {d:P([58,LOS],[46,LOS-5]),  c:CLR.block,w:1,a:true},
    {d:P([70,LOS],[58,LOS-5]),  c:CLR.block,w:1,a:true},
    {d:P([82,LOS],[70,LOS-5]),  c:CLR.block,w:1,a:true},
    {d:P([94,LOS],[82,LOS-5]),  c:CLR.block,w:1,a:true},
    {d:QQ([118,LOS],[104,LOS-8],[90,LOS-6]), c:CLR.block,w:1,a:true},
  ],
},
{
  id:9, name:'Trap_Right', label:'Trap Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:84,y:98,t:'RB'},
  ],
  rt:[
    {d:CB([84,98],[86,86],[92,72],[98,52]), c:CLR.run,w:2.8,a:true},
    {d:CB([70,LOS],[70,LOS+8],[84,LOS-2],[92,LOS-8]), c:CLR.pull,w:1.6,a:true},
    {d:P([58,LOS],[58,LOS-8]), c:CLR.block,w:1.1,a:true},
    {d:P([82,LOS],[82,LOS-10]),c:CLR.block,w:1.5,a:true},
    {d:P([94,LOS],[94,LOS-8]), c:CLR.block,w:1.1,a:true},
    {d:QQ([118,LOS],[128,LOS-6],[140,LOS-6]), c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:10, name:'Draw_Shotgun', label:'Draw (Shotgun)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:90,t:'QB'},{x:84,y:106,t:'RB'},
  ],
  rt:[
    {d:P([84,90],[84,104]), c:CLR.qbmove,w:1.2,a:true,dsh:true},
    {d:CB([84,106],[84,94],[86,78],[88,56]), c:CLR.run,w:2.8,a:true},
    {d:P([58,LOS],[58,LOS-4]), c:CLR.block,w:1.0,a:true,dsh:true},
    {d:P([70,LOS],[70,LOS-4]), c:CLR.block,w:1.0,a:true,dsh:true},
    {d:P([82,LOS],[82,LOS-4]), c:CLR.block,w:1.0,a:true,dsh:true},
    {d:P([94,LOS],[94,LOS-4]), c:CLR.block,w:1.0,a:true,dsh:true},
    {d:P([106,LOS],[106,LOS-4]),c:CLR.block,w:1.0,a:true,dsh:true},
  ],
},
{
  id:11, name:'JetSweep_Right', label:'Jet Sweep Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
  ],
  rt:[
    {d:CB([32,LOS],[56,LOS+14],[84,LOS+16],[118,LOS+2]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:P([84,82],[98,74]), c:CLR.toss,w:1.2,a:true,dsh:true},
    {d:CB([118,LOS+2],[140,58],[164,46],[186,40]), c:CLR.run,w:2.8,a:true},
    {d:QQ([106,82],[86,80],[66,76]), c:CLR.block,w:1,a:true,dsh:true},
    {d:P([58,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([106,LOS],[118,LOS-5]),c:CLR.block,w:1,a:true},
  ],
},
{
  id:12, name:'FB_Dive', label:'FB Dive', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:84,y:98,t:'FB'},
    {x:106,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([84,98],[84,88],[84,72],[84,52]), c:CLR.run,w:2.8,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:1.8,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:QQ([106,84],[98,82],[90,80]), c:CLR.block,w:1.2,a:true},
    {d:QQ([118,LOS],[110,LOS-6],[98,LOS-6]), c:CLR.block,w:1.0,a:true},
  ],
},

/* ═══ PASS CONCEPTS 13-28 ══════════════════════════════ */
{
  id:13, name:'Quick_SlantFlat', label:'Quick Slant + Flat', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([12,LOS],[28,54],[50,50],[62,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,56],[16,56]),          c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,52],[132,52]),       c:CLR.pass,w:1.8,a:true},
    {d:CB([172,LOS],[156,54],[136,50],[124,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([106,84],[110,84]), c:CLR.block,w:1.0,a:false},
  ],
},
{
  id:14, name:'Quick_HitchSeam', label:'Hitch + Seam', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,56],[12,60]),        c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,56],[32,60]),        c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,18]),             c:CLR.pass,w:2.4,a:true},
    {d:CB([172,LOS],[176,44],[164,30],[150,26]), c:CLR.pass,w:2.0,a:true},
    {d:P([106,86],[106,84]), c:CLR.block,w:1.0,a:false},
  ],
},
{
  id:15, name:'Stick', label:'Stick', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
  ],
  rt:[
    {d:P([32,LOS],[32,52],[32,56]),            c:CLR.pass,w:2.2,a:true},
    {d:QQ([118,LOS],[118,54],[130,54]),        c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]),                    c:CLR.pass,w:1.4,a:true},
    {d:P([172,LOS],[172,28]),                  c:CLR.pass,w:1.4,a:true},
    {d:QQ([106,84],[92,80],[74,78]),           c:CLR.pass,w:1.8,a:true},
  ],
},
{
  id:16, name:'Spacing', label:'Spacing (Hook/Curl Spread)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,52],[12,56]),           c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,46],[32,50]),           c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,46],[118,50]),        c:CLR.pass,w:2.2,a:true},
    {d:P([152,LOS],[152,52],[152,56]),        c:CLR.pass,w:2.2,a:true},
    {d:P([98,86],[98,62],[112,62]),           c:CLR.pass,w:1.8,a:true},
  ],
},
{
  id:17, name:'Hank', label:'Hank (Curl + Flat)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,44],[12,48]),            c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,56],[32,60]),            c:CLR.pass,w:1.8,a:true},
    {d:P([118,LOS],[118,44],[118,48]),         c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,56],[172,60]),         c:CLR.pass,w:1.8,a:true},
    {d:QQ([106,86],[92,80],[74,76]),           c:CLR.pass,w:1.8,a:true},
  ],
},
{
  id:18, name:'Drive', label:'Drive (Shallow + Dig)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([32,LOS],[54,56],[86,56],[110,56]),   c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]),                     c:CLR.pass,w:1.6,a:true},
    {d:P([118,LOS],[118,38],[150,38]),          c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,18]),                   c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,86],[92,82],[78,80]),            c:CLR.pass,w:1.5,a:true,dsh:true},
  ],
},
{
  id:19, name:'Dragon', label:'Dragon (Slant + Flat)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([12,LOS],[26,54],[44,50],[58,50]),    c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,52],[18,52]),             c:CLR.pass,w:2.0,a:true},
    {d:P([118,LOS],[118,48],[134,48]),          c:CLR.pass,w:1.8,a:true},
    {d:CB([172,LOS],[160,54],[140,50],[126,50]),c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,84],[92,80],[74,78]),            c:CLR.pass,w:1.8,a:true},
  ],
},
{
  id:20, name:'Texas', label:'Texas (RB Angle)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,22]),                   c:CLR.pass,w:1.6,a:true},
    {d:P([32,LOS],[32,50],[32,56]),           c:CLR.pass,w:1.8,a:true},
    {d:P([118,LOS],[118,30]),                 c:CLR.pass,w:1.8,a:true},
    {d:P([172,LOS],[172,22]),                 c:CLR.pass,w:1.6,a:true},
    {d:CB([106,86],[106,64],[86,58],[74,52]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:21, name:'Y_Cross', label:'Y Cross', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:88,t:'QB'},{x:106,y:88,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,22]),                   c:CLR.pass,w:1.6,a:true},
    {d:CB([32,LOS],[56,60],[92,60],[120,60]), c:CLR.pass,w:2.2,a:true},
    {d:CB([118,LOS],[140,52],[110,38],[82,34]),c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,18]),                 c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,88],[128,84],[146,80]),        c:CLR.pass,w:1.8,a:true},
  ],
},
{
  id:22, name:'Y_Option', label:'Y Option', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,24]),                 c:CLR.pass,w:1.6,a:true},
    {d:P([32,LOS],[32,56],[32,60]),         c:CLR.pass,w:1.8,a:true},
    {d:CB([118,LOS],[118,52],[126,44],[118,38]), c:CLR.pass,w:2.3,a:true},
    {d:P([172,LOS],[172,24]),               c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,86],[92,80],[74,76]),        c:CLR.pass,w:1.8,a:true},
  ],
},
{
  id:23, name:'Dagger', label:'Dagger', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,36],[82,36]),             c:CLR.pass,w:2.2,a:true},
    {d:CB([32,LOS],[32,46],[54,34],[70,28]),    c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,50],[148,50]),          c:CLR.pass,w:1.8,a:true},
    {d:P([172,LOS],[172,22]),                   c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,86],[92,82],[78,80]),            c:CLR.pass,w:1.5,a:true,dsh:true},
  ],
},
{
  id:24, name:'Sail', label:'Sail (3-Level Flood)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([172,LOS],[182,44],[164,28],[148,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,48],[150,48]),           c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[132,82],[150,78]),           c:CLR.pass,w:1.8,a:true},
    {d:CB([12,LOS],[10,46],[28,48],[46,48]),     c:CLR.pass,w:1.6,a:true},
    {d:P([32,LOS],[32,36]),                      c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:25, name:'Levels', label:'Levels', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,38],[88,38]),              c:CLR.pass,w:2.2,a:true},
    {d:CB([32,LOS],[50,62],[82,62],[110,62]),    c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,24]),                    c:CLR.pass,w:1.6,a:true},
    {d:P([172,LOS],[172,26]),                    c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,86],[92,82],[78,80]),             c:CLR.pass,w:1.5,a:true,dsh:true},
  ],
},
{
  id:26, name:'Smash', label:'Smash', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([12,LOS],[8,42],[24,26],[36,24]),      c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,52],[32,56]),              c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,52],[118,56]),           c:CLR.pass,w:2.2,a:true},
    {d:CB([172,LOS],[180,42],[166,26],[152,24]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[120,82],[132,80]),           c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},
{
  id:27, name:'Curl_Flat', label:'Curl + Flat', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,44],[12,48]),              c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,56],[32,60]),              c:CLR.pass,w:1.8,a:true},
    {d:P([118,LOS],[118,44],[118,48]),           c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,56],[172,60]),           c:CLR.pass,w:1.8,a:true},
    {d:P([106,86],[106,56],[124,56]),            c:CLR.pass,w:2.0,a:true},
  ],
},
{
  id:28, name:'AllGo_Seams', label:'All Go (Seams)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,12]),  c:CLR.pass,w:2.4,a:true},
    {d:P([32,LOS],[32,12]),  c:CLR.pass,w:2.4,a:true},
    {d:P([118,LOS],[118,14]),c:CLR.pass,w:2.4,a:true},
    {d:P([172,LOS],[172,12]),c:CLR.pass,w:2.4,a:true},
    {d:P([106,86],[106,60],[126,60]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* ═══ PLAY-ACTION 29-34 ═══════════════════════════════ */
{
  id:29, name:'PA_Slide_Sail', label:'PA Slide Sail', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([84,78],[92,82],[106,84],[116,82]), c:CLR.qbmove,w:2,a:true},
    {d:CB([172,LOS],[182,44],[166,24],[150,22]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,46],[148,46]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([12,LOS],[26,54],[42,54]), c:CLR.pass,w:1.6,a:true,dsh:true},
    {d:QQ([32,LOS],[46,58],[62,58]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},
{
  id:30, name:'PA_Yankee', label:'PA Yankee (Post + Deep Over)', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([12,LOS],[12,32],[46,22],[76,20]), c:CLR.pass,w:2.5,a:true},
    {d:CB([172,LOS],[168,46],[124,34],[92,30]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,30]), c:CLR.pass,w:1.8,a:true},
    {d:P([32,LOS],[32,44],[32,50]), c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:31, name:'PA_Boot_Flood', label:'PA Boot Flood', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([84,78],[62,80],[46,78],[36,74]), c:CLR.qbmove,w:2,a:true},
    {d:CB([172,LOS],[182,48],[162,28],[148,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,50],[150,50]), c:CLR.pass,w:2.2,a:true},
    {d:CB([32,LOS],[52,62],[82,62],[110,62]), c:CLR.pass,w:2.0,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:32, name:'PA_Leak', label:'PA TE Leak', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([84,78],[62,80],[46,78],[36,74]), c:CLR.qbmove,w:2,a:true},
    {d:CB([118,LOS],[120,76],[132,70],[146,62]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1.4,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
    {d:QQ([32,LOS],[52,56],[70,56]), c:CLR.pass,w:1.6,a:true,dsh:true},
  ],
},
{
  id:33, name:'PA_Shot_Post', label:'PA Shot Post', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([12,LOS],[12,32],[50,20],[82,18]), c:CLR.pass,w:2.5,a:true},
    {d:CB([172,LOS],[172,36],[132,20],[100,18]), c:CLR.pass,w:2.5,a:true},
    {d:P([118,LOS],[118,40]), c:CLR.pass,w:1.8,a:true},
    {d:P([32,LOS],[32,50],[32,56]), c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:34, name:'PA_HalfRoll_CurlFlat', label:'PA Half-Roll Curl/Flat', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([84,78],[98,82],[112,82],[120,80]), c:CLR.qbmove,w:2,a:true},
    {d:P([12,LOS],[12,44],[12,48]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,44],[118,48]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,56],[172,60]), c:CLR.pass,w:1.8,a:true},
    {d:P([32,LOS],[32,56],[18,56]), c:CLR.pass,w:1.8,a:true},
  ],
},

/* ═══ SITUATIONAL / SCREENS 35-40 ══════════════════════ */
{
  id:35, name:'RB_Screen', label:'RB Screen', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([84,86],[84,100]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([106,86],[136,86],[156,80],[162,76]), c:CLR.sit,w:2,a:true},
    {d:CB([84,100],[128,98],[152,86],[162,76]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:QQ([94,LOS],[102,74],[118,68]), c:CLR.block,w:1,a:true},
    {d:QQ([106,LOS],[116,72],[132,66]), c:CLR.block,w:1,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:36, name:'TE_Screen', label:'TE Screen', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
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
  id:37, name:'WR_Tunnel', label:'WR Tunnel Screen', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([84,86],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([32,LOS],[36,72],[40,78],[42,82]), c:CLR.sit,w:2,a:true},
    {d:CB([84,92],[62,88],[52,84],[42,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:CB([12,LOS],[20,72],[34,78],[38,80]), c:CLR.block,w:1.5,a:true},
    {d:CB([118,LOS],[102,68],[78,66],[58,66]), c:CLR.block,w:1.5,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:38, name:'2Min_QuickOuts', label:'2-Min Quick Outs', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,57],[2,57]), c:CLR.sit,w:2.2,a:true},
    {d:P([32,LOS],[32,56],[20,56]), c:CLR.sit,w:2.2,a:true},
    {d:P([118,LOS],[118,56],[136,56]), c:CLR.sit,w:2.2,a:true},
    {d:P([172,LOS],[172,57],[184,57]), c:CLR.sit,w:2.2,a:true},
    {d:QQ([106,84],[92,80],[74,78]), c:CLR.pass,w:1.6,a:true},
    {d:P([84,84],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
  ],
},
{
  id:39, name:'MaxProtect_Shot', label:'Max Protect Shot (Post)', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([106,86],[106,84]), c:CLR.protect,w:2,a:false},
    {d:P([118,LOS],[118,72]), c:CLR.protect,w:2,a:false},
    {d:CB([12,LOS],[12,32],[50,20],[82,18]), c:CLR.pass,w:2.5,a:true},
    {d:CB([172,LOS],[172,32],[132,20],[100,18]), c:CLR.pass,w:2.5,a:true},
    {d:P([84,86],[84,104]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
  ],
},
{
  id:40, name:'QB_Sneak_Quick', label:'QB Sneak (Short Yardage)', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([84,86],[84,78],[84,66],[84,52]), c:CLR.run,w:2.8,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:2.0,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:QQ([106,86],[106,84],[106,82]), c:CLR.block,w:1.2,a:true,dsh:true},
  ],
},
];
