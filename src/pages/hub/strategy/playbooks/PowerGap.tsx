/* ═══ POWER GAP — CORE 40 PLAYS ═══
   Same format as your PLAYS array.
   Categories: run (12) | pass (16) | pa (6) | situational (6)
*/

const POWER_GAP_PLAYS = [
/* ═══ RUNS 1-12 ═══════════════════════════════════════ */
{
  id:1, name:'Power_Gap_Right', label:'Power Gap Right (G Pull + Kick)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:102,y:84,t:'RB'},
    {x:66,y:84,t:'FB'},
  ],
  rt:[
    {d:CB([102,84],[96,82],[98,68],[104,50]), c:CLR.run,w:2.8,a:true},
    {d:CB([82,LOS],[78,LOS+10],[90,LOS+2],[102,LOS-6]), c:CLR.pull,w:1.8,a:true},      // RG pull
    {d:CB([66,84],[74,78],[86,66],[96,54]), c:CLR.block,w:1.8,a:true},                  // FB kick
    {d:P([58,LOS],[58,LOS-10]), c:CLR.block,w:1.2,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.2,a:true},
    {d:P([94,LOS],[94,LOS-6]),  c:CLR.block,w:1.0,a:true},
    {d:P([106,LOS],[106,LOS-6]),c:CLR.block,w:1.0,a:true},
    {d:QQ([118,LOS],[130,LOS-8],[142,LOS-7]), c:CLR.block,w:1.0,a:true},                 // TE down
  ],
},
{
  id:2, name:'Power_Gap_Left', label:'Power Gap Left (G Pull + Kick)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:70,y:84,t:'RB'},
    {x:102,y:84,t:'FB'},
  ],
  rt:[
    {d:CB([70,84],[76,82],[72,68],[66,50]), c:CLR.run,w:2.8,a:true},
    {d:CB([82,LOS],[86,LOS+10],[74,LOS+2],[66,LOS-6]), c:CLR.pull,w:1.8,a:true},        // LG pull
    {d:CB([102,84],[92,78],[80,66],[70,54]), c:CLR.block,w:1.8,a:true},                 // FB kick
    {d:P([58,LOS],[58,LOS-6]), c:CLR.block,w:1.0,a:true},
    {d:P([70,LOS],[70,LOS-10]),c:CLR.block,w:1.2,a:true},
    {d:P([94,LOS],[94,LOS-10]),c:CLR.block,w:1.2,a:true},
    {d:P([106,LOS],[106,LOS-10]),c:CLR.block,w:1.2,a:true},
    {d:QQ([118,LOS],[108,LOS-8],[96,LOS-7]), c:CLR.block,w:1.0,a:true},                  // TE down
  ],
},
{
  id:3, name:'Counter_GT_Right', label:'Counter GT Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([106,84],[96,86],[92,72],[96,52]), c:CLR.run,w:2.8,a:true},                    // RB counter path
    {d:CB([82,LOS],[78,LOS+10],[90,LOS+2],[102,LOS-6]), c:CLR.pull,w:1.8,a:true},        // G pull
    {d:CB([70,LOS],[66,LOS+8],[82,LOS+2],[94,LOS-6]),  c:CLR.pull,w:1.6,a:true},         // T pull
    {d:QQ([118,LOS],[108,LOS-6],[98,LOS-8]), c:CLR.block,w:1.2,a:true},                  // TE sift/hinge
    {d:P([58,LOS],[58,LOS-8]), c:CLR.block,w:1.1,a:true},
    {d:P([94,LOS],[94,LOS-6]), c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:4, name:'Counter_GT_Left', label:'Counter GT Left', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:70,y:84,t:'RB'},
  ],
  rt:[
    {d:CB([70,84],[80,86],[84,72],[80,52]), c:CLR.run,w:2.8,a:true},
    {d:CB([82,LOS],[86,LOS+10],[74,LOS+2],[62,LOS-6]), c:CLR.pull,w:1.8,a:true},         // G pull
    {d:CB([94,LOS],[100,LOS+8],[86,LOS+2],[72,LOS-6]), c:CLR.pull,w:1.6,a:true},         // T pull
    {d:QQ([118,LOS],[108,LOS-6],[96,LOS-8]), c:CLR.block,w:1.2,a:true},
    {d:P([106,LOS],[106,LOS-8]), c:CLR.block,w:1.1,a:true},
    {d:P([70,LOS],[70,LOS-6]),  c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:5, name:'Trap_Right', label:'Trap Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:84,y:98,t:'RB'},
  ],
  rt:[
    {d:CB([84,98],[86,86],[92,72],[98,52]), c:CLR.run,w:2.8,a:true},
    {d:CB([70,LOS],[70,LOS+8],[84,LOS-2],[92,LOS-8]), c:CLR.pull,w:1.6,a:true},          // trapper
    {d:P([58,LOS],[58,LOS-8]), c:CLR.block,w:1.1,a:true},
    {d:P([82,LOS],[82,LOS-10]),c:CLR.block,w:1.5,a:true},
    {d:P([94,LOS],[94,LOS-8]), c:CLR.block,w:1.1,a:true},
    {d:QQ([118,LOS],[128,LOS-6],[140,LOS-6]), c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:6, name:'Wham_Inside', label:'Wham (TE/FB Wham)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
    {x:66,y:82,t:'H'},
  ],
  rt:[
    {d:CB([84,98],[84,88],[84,72],[84,52]), c:CLR.run,w:2.8,a:true},
    {d:CB([66,82],[74,76],[82,72],[90,LOS-6]), c:CLR.block,w:1.8,a:true},                // wham
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:2.0,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:QQ([118,LOS],[132,LOS-8],[144,LOS-7]), c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:7, name:'Duo_Gap_Right', label:'Duo (Gap Emphasis) Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:84,y:98,t:'RB'},
  ],
  rt:[
    {d:CB([84,98],[88,88],[92,74],[96,54]), c:CLR.run,w:2.8,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:2.0,a:true}, // double team feel
    {d:P([94,LOS],[94,LOS-12]), c:CLR.block,w:2.0,a:true},
    {d:P([70,LOS],[70,LOS-9]),  c:CLR.block,w:1.3,a:true},
    {d:P([106,LOS],[106,LOS-9]),c:CLR.block,w:1.3,a:true},
    {d:QQ([118,LOS],[130,LOS-8],[142,LOS-7]), c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:8, name:'Iso_Lead_Right', label:'Iso Lead Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:100,y:84,t:'RB'},
    {x:66,y:84,t:'FB'},
  ],
  rt:[
    {d:CB([66,84],[74,78],[82,66],[90,52]), c:CLR.block,w:1.8,a:true},                    // lead
    {d:CB([100,84],[92,84],[92,70],[94,54]), c:CLR.run,w:2.8,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:2.0,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([58,LOS],[58,LOS-7]),  c:CLR.block,w:1.1,a:true},
    {d:QQ([118,LOS],[130,LOS-8],[142,LOS-7]), c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:9, name:'PinPull_Sweep_Right', label:'Pin-Pull Sweep Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
  ],
  rt:[
    {d:CB([106,82],[120,78],[144,66],[166,52]), c:CLR.run,w:2.8,a:true},
    {d:CB([70,LOS],[80,LOS+8],[102,LOS],[118,LOS-6]), c:CLR.pull,w:1.6,a:true},
    {d:CB([82,LOS],[92,LOS+10],[118,LOS+2],[136,LOS-6]), c:CLR.pull,w:1.8,a:true},
    {d:P([58,LOS],[50,LOS-6]), c:CLR.block,w:1.1,a:true},                                // pin
    {d:QQ([118,LOS],[132,LOS-6],[148,LOS-6]), c:CLR.block,w:1.1,a:true},                 // pin
  ],
},
{
  id:10, name:'Toss_Crack_Right', label:'Toss Crack Right', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
  ],
  rt:[
    {d:QQ([84,82],[118,78],[146,74]), c:CLR.toss,w:1.5,a:true,dsh:true},
    {d:CB([146,74],[164,64],[178,52],[186,42]), c:CLR.run,w:2.8,a:true},
    {d:QQ([12,LOS],[30,LOS-5],[52,LOS-7]), c:CLR.block,w:1.5,a:true},                    // crack
    {d:P([58,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([70,LOS],[82,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([82,LOS],[94,LOS-5]), c:CLR.block,w:1,a:true},
    {d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]), c:CLR.block,w:1,a:true},
  ],
},
{
  id:11, name:'QB_Sneak_TushPush', label:'QB Sneak (Tush Push)', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:84,y:104,t:'RB'},
    {x:94,y:104,t:'FB'},
  ],
  rt:[
    {d:CB([84,86],[84,78],[84,66],[84,52]), c:CLR.run,w:2.8,a:true},
    {d:P([84,104],[84,92]), c:CLR.block,w:1.8,a:true,dsh:true},                          // push
    {d:P([94,104],[90,92]), c:CLR.block,w:1.8,a:true,dsh:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:2.2,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.8,a:true},
  ],
},
{
  id:12, name:'Wildcat_Power', label:'Wildcat Power', cat:'run',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'RB'},{x:104,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([84,86],[92,84],[96,70],[102,52]), c:CLR.run,w:2.8,a:true},
    {d:CB([82,LOS],[78,LOS+10],[90,LOS+2],[102,LOS-6]), c:CLR.pull,w:1.8,a:true},
    {d:CB([104,86],[94,82],[86,76],[78,70]), c:CLR.motion,w:1.4,a:false,dsh:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([94,LOS],[94,LOS-6]),  c:CLR.block,w:1.0,a:true},
    {d:QQ([118,LOS],[130,LOS-8],[142,LOS-7]), c:CLR.block,w:1.0,a:true},
  ],
},

/* ═══ PASS CONCEPTS 13-28 ══════════════════════════════ */
{
  id:13, name:'PlayPass_Stick', label:'Play Pass Stick', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
  ],
  rt:[
    {d:P([32,LOS],[32,52],[32,56]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([118,LOS],[118,54],[132,54]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:1.4,a:true},
    {d:P([106,84],[106,72],[116,72]), c:CLR.pass,w:1.8,a:true},
  ],
},
{
  id:14, name:'Y_Cross_Gap', label:'Y Cross (Gap Protect)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:88,t:'QB'},{x:106,y:88,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,22]), c:CLR.pass,w:1.6,a:true},
    {d:CB([32,LOS],[56,60],[92,60],[120,60]), c:CLR.pass,w:2.2,a:true},
    {d:CB([118,LOS],[140,52],[110,38],[82,34]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,18]), c:CLR.pass,w:1.6,a:true},
    {d:P([106,88],[106,76],[100,76]), c:CLR.block,w:1.2,a:true,dsh:true},
  ],
},
{
  id:15, name:'Dagger_Gap', label:'Dagger (Gap Set)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,36],[82,36]), c:CLR.pass,w:2.2,a:true},
    {d:CB([32,LOS],[32,46],[54,34],[70,28]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,50],[148,50]), c:CLR.pass,w:1.8,a:true},
    {d:P([172,LOS],[172,22]), c:CLR.pass,w:1.6,a:true},
    {d:P([106,86],[106,84]), c:CLR.protect,w:2,a:false},
  ],
},
{
  id:16, name:'Sail_Gap', label:'Sail (Gap Protect)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([172,LOS],[182,44],[164,28],[148,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,48],[150,48]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[132,82],[150,78]), c:CLR.pass,w:1.8,a:true},
    {d:CB([12,LOS],[10,46],[28,48],[46,48]), c:CLR.pass,w:1.6,a:true},
    {d:P([106,86],[106,84]), c:CLR.protect,w:2,a:false},
  ],
},
{
  id:17, name:'Mesh', label:'Mesh', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([34,LOS],[62,62],[100,62],[120,64]), c:CLR.pass,w:2.2,a:true},
    {d:CB([152,LOS],[122,60],[82,60],[60,62]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
    {d:CB([176,LOS],[186,44],[176,28],[166,26]), c:CLR.pass,w:1.4,a:true},
    {d:P([118,LOS],[118,50]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:18, name:'Smash', label:'Smash', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([12,LOS],[8,42],[24,26],[36,24]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,52],[32,56]), c:CLR.pass,w:2.2,a:true},
    {d:CB([172,LOS],[180,42],[166,26],[152,24]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[120,82],[132,80]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},
{
  id:19, name:'Hank', label:'Hank (Curl/Flat)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,44],[12,48]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,44],[118,48]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,56],[32,60]), c:CLR.pass,w:1.8,a:true},
    {d:P([172,LOS],[172,56],[172,60]), c:CLR.pass,w:1.8,a:true},
    {d:CB([106,86],[106,64],[92,58],[78,54]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:20, name:'Levels', label:'Levels', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,38],[88,38]), c:CLR.pass,w:2.2,a:true},
    {d:CB([32,LOS],[50,62],[82,62],[110,62]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,24]), c:CLR.pass,w:1.6,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:21, name:'China', label:'China (TE Corner + Flat)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([32,LOS],[32,56],[18,56]), c:CLR.pass,w:2.0,a:true},
    {d:CB([118,LOS],[118,46],[132,34],[148,30]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,24]), c:CLR.pass,w:1.6,a:true},
    {d:P([172,LOS],[172,24]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,86],[92,82],[78,80]), c:CLR.pass,w:1.5,a:true,dsh:true},
  ],
},
{
  id:22, name:'Quick_Outs', label:'Quick Outs', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,57],[2,57]), c:CLR.pass,w:2.2,a:true},
    {d:P([172,LOS],[172,57],[184,57]), c:CLR.pass,w:2.2,a:true},
    {d:P([32,LOS],[32,56],[20,56]), c:CLR.pass,w:1.8,a:true},
    {d:P([118,LOS],[118,56],[136,56]), c:CLR.pass,w:1.8,a:true},
    {d:P([84,80],[84,90]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
  ],
},
{
  id:23, name:'Deep_Cross', label:'Deep Cross', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([12,LOS],[12,28],[60,28],[108,28]), c:CLR.pass,w:2.2,a:true},
    {d:CB([172,LOS],[172,34],[120,34],[80,36]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,26]), c:CLR.pass,w:1.6,a:true},
    {d:P([32,LOS],[32,46],[32,50]), c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:24, name:'AllGo', label:'All Go', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,12]), c:CLR.pass,w:2.4,a:true},
    {d:P([32,LOS],[32,12]), c:CLR.pass,w:2.4,a:true},
    {d:P([118,LOS],[118,14]), c:CLR.pass,w:2.4,a:true},
    {d:P([172,LOS],[172,12]), c:CLR.pass,w:2.4,a:true},
    {d:P([106,86],[106,60],[126,60]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:25, name:'Post_Dig', label:'Post + Dig', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([12,LOS],[12,34],[36,22],[62,18]), c:CLR.pass,w:2.4,a:true},
    {d:P([32,LOS],[32,40],[92,40]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,24]), c:CLR.pass,w:1.6,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,86],[120,82],[134,80]), c:CLR.pass,w:1.4,a:true,dsh:true},
  ],
},
{
  id:26, name:'Flood', label:'Flood (3-Level)', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.6,a:true},
    {d:P([118,LOS],[118,50],[150,50]), c:CLR.pass,w:2.2,a:true},
    {d:CB([152,LOS],[162,46],[164,30],[152,26]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[132,82],[150,78]), c:CLR.pass,w:1.8,a:true},
    {d:P([176,LOS],[176,18]), c:CLR.pass,w:2.4,a:true},
  ],
},
{
  id:27, name:'Drive', label:'Drive', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([32,LOS],[54,56],[86,56],[110,56]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,38],[150,38]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.6,a:true},
    {d:P([172,LOS],[172,18]), c:CLR.pass,w:1.6,a:true},
    {d:QQ([106,86],[92,82],[78,80]), c:CLR.pass,w:1.5,a:true,dsh:true},
  ],
},
{
  id:28, name:'Shallow', label:'Shallow Cross', cat:'pass',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
  ],
  rt:[
    {d:CB([12,LOS],[36,62],[90,62],[136,62]), c:CLR.pass,w:2.2,a:true},
    {d:CB([172,LOS],[154,48],[108,48],[72,50]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,26]), c:CLR.pass,w:1.6,a:true},
    {d:P([32,LOS],[32,38],[32,42]), c:CLR.pass,w:1.4,a:true},
  ],
},

/* ═══ PLAY-ACTION 29-34 ═══════════════════════════════ */
{
  id:29, name:'PA_Power_Right', label:'PA Power Right (Pull Look)', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[128,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([82,LOS],[78,LOS+10],[90,LOS+2],[102,LOS-6]), c:CLR.pull,w:1.6,a:true,dsh:true},
    {d:CB([12,LOS],[12,32],[46,22],[76,20]), c:CLR.pass,w:2.5,a:true},
    {d:CB([172,LOS],[172,36],[132,24],[104,22]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,40]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:30, name:'PA_Counter_Yankee', label:'PA Counter Yankee', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([70,LOS],[66,LOS+8],[82,LOS+2],[94,LOS-6]), c:CLR.pull,w:1.4,a:true,dsh:true},
    {d:CB([12,LOS],[12,32],[46,22],[76,20]), c:CLR.pass,w:2.5,a:true},                 // post
    {d:CB([172,LOS],[168,46],[124,34],[92,30]), c:CLR.pass,w:2.2,a:true},               // deep over
    {d:P([118,LOS],[118,28]), c:CLR.pass,w:1.6,a:true},
  ],
},
{
  id:31, name:'Boot_Flood', label:'Boot Flood', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([84,78],[60,82],[44,80],[36,76]), c:CLR.qbmove,w:2,a:true},
    {d:CB([172,LOS],[182,48],[162,28],[148,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,50],[150,50]), c:CLR.pass,w:2.2,a:true},
    {d:CB([32,LOS],[52,62],[82,62],[110,62]), c:CLR.pass,w:2.0,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:32, name:'PA_Leak', label:'PA TE Leak', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
  ],
  rt:[
    {d:P([106,78],[126,74]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([84,78],[62,80],[46,78],[36,74]), c:CLR.qbmove,w:2,a:true},
    {d:CB([118,LOS],[120,76],[132,70],[146,62]), c:CLR.pass,w:2.2,a:true},
    {d:P([152,LOS],[152,28]), c:CLR.pass,w:1.6,a:true},
    {d:P([176,LOS],[176,18]), c:CLR.pass,w:2.2,a:true},
  ],
},
{
  id:33, name:'RPO_Power_Slant', label:'RPO Power + Slant', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
  ],
  rt:[
    {d:P([98,78],[110,70],[118,52]), c:CLR.run,w:2,a:true,dsh:true},                      // power read
    {d:CB([12,LOS],[28,54],[44,50],[58,50]), c:CLR.pass,w:2.2,a:true},                   // slant
    {d:P([118,LOS],[118,56],[134,56]), c:CLR.pa,w:1.6,a:true},                           // bubble/flat look
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([172,LOS],[172,24]), c:CLR.pass,w:1.4,a:true},
  ],
},
{
  id:34, name:'Orbit_PA_Shot', label:'Orbit PA Shot', cat:'pa',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:80,t:'QB'},{x:106,y:80,t:'RB'},
  ],
  rt:[
    {d:CB([32,LOS],[58,LOS+14],[84,LOS+18],[86,86]), c:CLR.motion,w:1.5,a:false,dsh:true},
    {d:CB([84,80],[100,84],[114,88],[118,90]), c:CLR.pa,w:1.5,a:true,dsh:true},
    {d:CB([12,LOS],[8,36],[28,20],[50,18]), c:CLR.pass,w:2.5,a:true},
    {d:CB([172,LOS],[160,38],[116,26],[90,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,40]), c:CLR.pass,w:1.6,a:true},
  ],
},

/* ═══ SITUATIONAL / SCREENS 35-40 ══════════════════════ */
{
  id:35, name:'RB_Screen_Wide', label:'RB Screen Wide', cat:'situational',
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
  id:38, name:'GoalLine_Power', label:'Goal Line Power', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
    {x:66,y:84,t:'FB'},
  ],
  rt:[
    {d:CB([66,84],[74,78],[82,66],[90,52]), c:CLR.block,w:1.8,a:true},
    {d:CB([84,98],[86,88],[90,74],[94,56]), c:CLR.run,w:2.8,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[82,LOS-12]), c:CLR.block,w:2.2,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:QQ([118,LOS],[130,LOS-8],[142,LOS-7]), c:CLR.block,w:1.0,a:true},
  ],
},
{
  id:39, name:'MaxProtect_Shot', label:'Max Protect Shot', cat:'situational',
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
  id:40, name:'HardCount_Go', label:'Hard Count Go', cat:'situational',
  sk:[
    {x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
    {x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
    {x:84,y:74,t:'QB'},{x:106,y:74,t:'RB'},
  ],
  rt:[
    {d:P([12,LOS],[12,12]), c:CLR.sit,w:2.2,a:true},
    {d:P([32,LOS],[32,12]), c:CLR.sit,w:2.2,a:true},
    {d:P([118,LOS],[118,12]), c:CLR.sit,w:2.2,a:true},
    {d:P([172,LOS],[172,12]), c:CLR.sit,w:2.2,a:true},
    {d:CB([106,74],[106,82],[106,50],[106,28]), c:CLR.pass,w:1.5,a:true},
    {d:P([84,74],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
  ],
},
];
