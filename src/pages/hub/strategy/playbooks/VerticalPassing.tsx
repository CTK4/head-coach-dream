/* ═══ VERTICAL PASSING SYSTEM — CORE 40 ═══
   High-variance, 7-step base.
   Buckets: run (1-10), pass (11-35), pa (36-40)
   Uses your existing helpers/constants: P(), QQ(), CB(), LOS
*/

const VERTICAL_PLAYS = [
/* ═══ RUNS 1-10 ═══════════════════════════════════════ */
{
id:1, name:'IZ', label:'Inside Zone', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
],
rt:[
{d:P([84,84],[84,94]),                  c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([84,98],[84,88],[82,72],[82,48]), c:CLR.run,  w:2.8,a:true},
{d:P([58,LOS],[58,LOS-8]),              c:CLR.block,w:1,a:true},
{d:P([70,LOS],[70,LOS-10]),             c:CLR.block,w:1.6,a:true},
{d:P([82,LOS],[82,LOS-10]),             c:CLR.block,w:1.8,a:true},
{d:P([94,LOS],[94,LOS-10]),             c:CLR.block,w:1.8,a:true},
{d:P([106,LOS],[106,LOS-8]),            c:CLR.block,w:1,a:true},
],
},
{
id:2, name:'OZ', label:'Outside Zone', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:174,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:68,y:84,t:'RB'},
],
rt:[
{d:CB([68,84],[100,80],[136,68],[168,46]), c:CLR.run,w:2.8,a:true},
{d:P([58,LOS],[70,LOS-5]),                 c:CLR.block,w:1,a:true},
{d:P([70,LOS],[82,LOS-5]),                 c:CLR.block,w:1,a:true},
{d:P([82,LOS],[94,LOS-5]),                 c:CLR.block,w:1,a:true},
{d:P([94,LOS],[106,LOS-5]),                c:CLR.block,w:1,a:true},
{d:P([106,LOS],[118,LOS-5]),               c:CLR.block,w:1,a:true},
{d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]),  c:CLR.block,w:1,a:true},
],
},
{
id:3, name:'Duo', label:'Duo', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:84,y:98,t:'RB'},
],
rt:[
{d:CB([84,98],[84,84],[82,72],[80,50]),  c:CLR.run,  w:2.8,a:true},
{d:P([70,LOS],[70,LOS-10]),              c:CLR.block,w:1.8,a:true},
{d:P([82,LOS],[82,LOS-10]),              c:CLR.block,w:1.8,a:true},
{d:P([94,LOS],[94,LOS-10]),              c:CLR.block,w:1.8,a:true},
{d:P([58,LOS],[58,LOS-7]),               c:CLR.block,w:1,a:true},
{d:P([106,LOS],[106,LOS-7]),             c:CLR.block,w:1,a:true},
],
},
{
id:4, name:'Power', label:'Power', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
],
rt:[
{d:CB([106,84],[96,84],[92,72],[92,50]),              c:CLR.run,w:2.8,a:true},
{d:CB([70,LOS],[78,LOS+8],[96,LOS-2],[104,LOS-8]),    c:CLR.pull,w:1.8,a:true},
{d:P([58,LOS],[58,LOS-7]),                            c:CLR.block,w:1,a:true},
{d:P([82,LOS],[82,LOS-10]),                           c:CLR.block,w:1.8,a:true},
{d:P([94,LOS],[94,LOS-8]),                            c:CLR.block,w:1.2,a:true},
{d:QQ([118,LOS],[112,LOS-4],[104,LOS-8]),             c:CLR.block,w:1.2,a:true},
],
},
{
id:5, name:'Counter', label:'Counter', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
],
rt:[
{d:P([84,84],[84,94]),                   c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,84],[92,86],[78,76],[94,52]), c:CLR.run,  w:2.8,a:true},
{d:CB([58,LOS],[66,LOS+10],[92,LOS-2],[100,LOS-7]), c:CLR.pull,w:1.8,a:true},
{d:CB([70,LOS],[76,LOS+8],[98,LOS],[106,LOS-7]),    c:CLR.pull,w:1.6,a:true},
{d:QQ([118,LOS],[112,LOS-4],[104,LOS-8]), c:CLR.block,w:1.3,a:true},
],
},
{
id:6, name:'Draw', label:'Draw', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:172,y:LOS,t:'WR'},
{x:32,y:LOS,t:'WR'},{x:118,y:LOS,t:'TE'},
{x:84,y:82,t:'QB'},{x:84,y:96,t:'RB'},
],
rt:[
{d:P([84,82],[84,94]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([84,96],[84,86],[86,70],[88,48]),c:CLR.run,  w:2.8,a:true},
{d:P([70,LOS],[70,LOS-8]),             c:CLR.protect,w:1.2,a:false},
{d:P([82,LOS],[82,LOS-8]),             c:CLR.protect,w:1.2,a:false},
{d:P([94,LOS],[94,LOS-8]),             c:CLR.protect,w:1.2,a:false},
],
},
{
id:7, name:'Toss', label:'Toss', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
],
rt:[
{d:QQ([84,82],[120,78],[152,74]),        c:CLR.toss,w:1.5,a:true,dsh:true},
{d:CB([152,74],[166,66],[178,56],[186,42]),c:CLR.run,w:2.8,a:true},
{d:P([58,LOS],[70,LOS-5]),              c:CLR.block,w:1,a:true},
{d:P([70,LOS],[82,LOS-5]),              c:CLR.block,w:1,a:true},
{d:P([82,LOS],[94,LOS-5]),              c:CLR.block,w:1,a:true},
{d:P([94,LOS],[106,LOS-5]),             c:CLR.block,w:1,a:true},
{d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]),c:CLR.block,w:1,a:true},
],
},
{
id:8, name:'Trap', label:'Trap', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
],
rt:[
{d:P([84,84],[84,92]),                  c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([84,98],[84,88],[82,72],[80,50]), c:CLR.run,  w:2.8,a:true},
{d:CB([106,LOS],[98,LOS-2],[92,LOS-6],[86,LOS-10]), c:CLR.pull,w:1.7,a:true},
{d:P([70,LOS],[70,LOS-8]),              c:CLR.block,w:1.4,a:true},
{d:P([94,LOS],[94,LOS-6]),              c:CLR.block,w:1.2,a:true},
],
},
{
id:9, name:'Lead', label:'Lead', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
{x:66,y:84,t:'FB'},
],
rt:[
{d:CB([66,84],[74,78],[76,64],[76,48]), c:CLR.block,w:1.8,a:true},
{d:CB([84,98],[80,86],[78,66],[76,50]), c:CLR.run,  w:2.8,a:true},
{d:P([58,LOS],[58,LOS-10]),             c:CLR.block,w:1.8,a:true},
{d:P([70,LOS],[70,LOS-10]),             c:CLR.block,w:1.8,a:true},
{d:P([82,LOS],[82,LOS-10]),             c:CLR.block,w:1.8,a:true},
{d:P([94,LOS],[94,LOS-7]),              c:CLR.block,w:1,a:true},
{d:P([106,LOS],[106,LOS-7]),            c:CLR.block,w:1,a:true},
],
},
{
id:10, name:'Stretch', label:'Stretch', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:100,y:84,t:'RB'},
],
rt:[
{d:P([84,84],[84,92]),                     c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([100,84],[118,80],[148,66],[176,48]),c:CLR.run,  w:2.8,a:true},
{d:P([58,LOS],[70,LOS-6]),                 c:CLR.block,w:1.2,a:true},
{d:P([70,LOS],[82,LOS-6]),                 c:CLR.block,w:1.2,a:true},
{d:P([82,LOS],[94,LOS-6]),                 c:CLR.block,w:1.2,a:true},
{d:P([94,LOS],[106,LOS-6]),                c:CLR.block,w:1.2,a:true},
{d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]),  c:CLR.block,w:1.2,a:true},
],
},

/* ═══ PASS 11-35 ══════════════════════════════════════ */
{
id:11, name:'4_Verts', label:'4 Verts', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),   c:CLR.qbmove,w:1.2,a:true,dsh:true}, // deeper drop
{d:P([12,LOS],[12,18]),   c:CLR.pass,w:2.6,a:true},
{d:P([34,LOS],[34,18]),   c:CLR.pass,w:2.6,a:true},
{d:P([118,LOS],[118,18]), c:CLR.pass,w:2.6,a:true},
{d:P([152,LOS],[152,18]), c:CLR.pass,w:2.6,a:true},
{d:QQ([98,86],[112,84],[124,82]), c:CLR.pass,w:1.8,a:true},
],
},
{
id:12, name:'989', label:'989 (Go/Go/Go)', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,18]),   c:CLR.pass,w:2.7,a:true}, // 9
{d:P([172,LOS],[172,18]), c:CLR.pass,w:2.7,a:true}, // 9
{d:P([118,LOS],[118,18]), c:CLR.pass,w:2.4,a:true}, // 8-ish seam
{d:P([32,LOS],[32,36],[86,36]), c:CLR.pass,w:2.2,a:true}, // dig 9->8->9 family feel
],
},
{
id:13, name:'Mills', label:'Mills (Post-Dig)', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[172,34],[154,22],[126,20]), c:CLR.pass,w:2.6,a:true}, // post
{d:P([32,LOS],[32,40],[96,40]),              c:CLR.pass,w:2.4,a:true}, // dig
{d:P([118,LOS],[118,24]),                    c:CLR.pass,w:2.0,a:true}, // clear/hold
{d:P([12,LOS],[12,56],[2,56]),               c:CLR.pass,w:1.6,a:true}, // hitch
{d:QQ([98,86],[112,84],[124,82]),            c:CLR.pass,w:1.8,a:true},
],
},
{
id:14, name:'Yankee', label:'Yankee (Post-Cross)', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[172,34],[154,22],[126,20]), c:CLR.pass,w:2.6,a:true}, // post
{d:CB([32,LOS],[52,48],[96,44],[130,42]),    c:CLR.pass,w:2.4,a:true}, // deep cross
{d:P([118,LOS],[118,24]),                    c:CLR.pass,w:2.0,a:true},
{d:P([12,LOS],[12,56],[2,56]),               c:CLR.pass,w:1.6,a:true},
{d:QQ([98,86],[112,84],[124,82]),            c:CLR.pass,w:1.8,a:true},
],
},
{
id:15, name:'Dagger', label:'Dagger', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),              c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,36],[82,36]),      c:CLR.pass,w:2.6,a:true}, // deep in
{d:CB([32,LOS],[32,46],[52,34],[68,28]), c:CLR.pass,w:2.2,a:true}, // dagger clear-out
{d:P([118,LOS],[118,50],[148,50]),   c:CLR.pass,w:1.8,a:true},
{d:P([172,LOS],[172,18]),            c:CLR.pass,w:2.3,a:true},
],
},
{
id:16, name:'Divide', label:'Divide', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([34,LOS],[34,18]),      c:CLR.pass,w:2.6,a:true},
{d:P([118,LOS],[118,18]),    c:CLR.pass,w:2.6,a:true},
{d:P([152,LOS],[152,18]),    c:CLR.pass,w:2.4,a:true},
{d:P([12,LOS],[12,56],[2,56]),c:CLR.pass,w:1.6,a:true},
{d:QQ([98,86],[112,84],[124,82]), c:CLR.pass,w:1.8,a:true},
],
},
{
id:17, name:'Scissors', label:'Scissors', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([176,LOS],[176,34],[154,22],[126,20]), c:CLR.pass,w:2.6,a:true}, // post
{d:CB([152,LOS],[152,34],[166,24],[182,22]), c:CLR.pass,w:2.6,a:true}, // corner/over
{d:P([12,LOS],[12,18]),                      c:CLR.pass,w:2.3,a:true},
{d:QQ([98,86],[112,84],[124,82]),            c:CLR.pass,w:1.8,a:true},
],
},
{
id:18, name:'Double_Post', label:'Double Post', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:34,y:LOS,t:'WR'},{x:152,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[12,34],[36,22],[62,20]),    c:CLR.pass,w:2.6,a:true},
{d:CB([176,LOS],[176,34],[150,22],[124,20]),c:CLR.pass,w:2.6,a:true},
{d:P([34,LOS],[34,18]),                     c:CLR.pass,w:2.2,a:true}, // clear
{d:P([152,LOS],[152,18]),                   c:CLR.pass,w:2.2,a:true}, // clear
{d:QQ([98,86],[112,84],[124,82]),           c:CLR.pass,w:1.8,a:true},
],
},
{
id:19, name:'Deep_Comeback', label:'Deep Comeback', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:34,y:LOS,t:'WR'},{x:152,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),           c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,34],[6,34]),    c:CLR.pass,w:2.4,a:true},
{d:P([176,LOS],[176,34],[184,34]),c:CLR.pass,w:2.4,a:true},
{d:P([34,LOS],[34,18]),           c:CLR.pass,w:2.2,a:true},
{d:P([152,LOS],[152,18]),         c:CLR.pass,w:2.2,a:true},
{d:QQ([98,86],[112,84],[124,82]), c:CLR.pass,w:1.8,a:true},
],
},
{
id:20, name:'Slot_Fade', label:'Slot Fade', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[36,56],[44,40],[56,18]),   c:CLR.pass,w:2.6,a:true}, // slot fade
{d:P([176,LOS],[176,18]),                  c:CLR.pass,w:2.4,a:true},
{d:P([12,LOS],[12,56],[2,56]),             c:CLR.pass,w:1.6,a:true},
{d:P([152,LOS],[152,56],[144,56]),         c:CLR.pass,w:1.8,a:true},
{d:QQ([98,86],[112,84],[124,82]),          c:CLR.pass,w:1.8,a:true},
],
},
{
id:21, name:'Sail', label:'Sail', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[96,106]),                       c:CLR.qbmove,w:1.2,a:true,dsh:true}, // deeper drift
{d:CB([172,LOS],[182,44],[164,28],[148,26]),  c:CLR.pass,w:2.4,a:true},
{d:P([118,LOS],[118,48],[150,48]),            c:CLR.pass,w:2.4,a:true},
{d:QQ([106,86],[132,82],[150,78]),            c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,18]),                       c:CLR.pass,w:2.0,a:true},
],
},
{
id:22, name:'Smash', label:'Smash', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[8,42],[24,26],[36,24]),      c:CLR.pass,w:2.4,a:true}, // corner
{d:P([32,LOS],[32,52],[32,56]),              c:CLR.pass,w:2.2,a:true}, // hitch
{d:CB([172,LOS],[180,42],[166,26],[152,24]), c:CLR.pass,w:2.4,a:true}, // corner
{d:P([118,LOS],[118,52],[118,56]),           c:CLR.pass,w:2.2,a:true}, // hitch
{d:QQ([106,86],[120,84],[134,82]),           c:CLR.pass,w:1.8,a:true},
],
},
{
id:23, name:'Post_Wheel', label:'Post-Wheel', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([176,LOS],[176,34],[154,22],[126,20]), c:CLR.pass,w:2.6,a:true}, // post
{d:CB([98,86],[120,82],[142,64],[156,28]),   c:CLR.pass,w:2.3,a:true}, // wheel
{d:P([34,LOS],[34,56],[26,56]),              c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,18]),                      c:CLR.pass,w:2.3,a:true},
],
},
{
id:24, name:'Flood', label:'Flood', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[98,106]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([172,LOS],[172,28]),                    c:CLR.pass,w:2.4,a:true}, // go/clear
{d:P([118,LOS],[118,46],[148,46]),           c:CLR.pass,w:2.4,a:true}, // out
{d:QQ([106,86],[132,84],[150,82]),           c:CLR.pass,w:2.0,a:true}, // flat
{d:P([12,LOS],[12,56],[2,56]),               c:CLR.pass,w:1.6,a:true},
{d:P([32,LOS],[32,36]),                      c:CLR.pass,w:1.8,a:true,dsh:true},
],
},
{
id:25, name:'Deep_Over', label:'Deep Over', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[12,28],[60,28],[108,28]), c:CLR.pass,w:2.6,a:true},
{d:CB([172,LOS],[172,34],[120,34],[80,36]),c:CLR.pass,w:2.6,a:true},
{d:P([118,LOS],[118,18]),                 c:CLR.pass,w:2.1,a:true},
{d:P([32,LOS],[32,52],[32,56]),           c:CLR.pass,w:1.8,a:true},
],
},
{
id:26, name:'Curl_Flat', label:'Curl-Flat', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),             c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,44],[12,48]),     c:CLR.pass,w:2.3,a:true},
{d:QQ([34,LOS],[44,60],[58,60]),    c:CLR.pass,w:2.1,a:true},
{d:P([118,LOS],[118,18]),           c:CLR.pass,w:2.4,a:true},
{d:P([176,LOS],[176,18]),           c:CLR.pass,w:2.4,a:true},
{d:QQ([98,86],[112,84],[124,82]),   c:CLR.pass,w:1.8,a:true},
],
},
{
id:27, name:'China', label:'China', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,56],[2,56]),              c:CLR.pass,w:2.2,a:true}, // out
{d:CB([32,LOS],[40,52],[54,48],[54,44]),    c:CLR.pass,w:2.3,a:true}, // china pivot-in
{d:P([118,LOS],[118,18]),                   c:CLR.pass,w:2.4,a:true},
{d:P([172,LOS],[172,18]),                   c:CLR.pass,w:2.4,a:true},
{d:QQ([106,86],[120,84],[134,82]),          c:CLR.pass,w:1.8,a:true},
],
},
{
id:28, name:'Dig', label:'Dig', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),              c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([34,LOS],[34,40],[92,40]),      c:CLR.pass,w:2.6,a:true}, // dig
{d:P([176,LOS],[176,18]),            c:CLR.pass,w:2.4,a:true}, // clear
{d:P([118,LOS],[118,24]),            c:CLR.pass,w:2.2,a:true},
{d:P([12,LOS],[12,56],[2,56]),       c:CLR.pass,w:1.6,a:true},
{d:QQ([98,86],[112,84],[124,82]),    c:CLR.pass,w:1.8,a:true},
],
},
{
id:29, name:'Levels', label:'Levels', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,38],[88,38]),             c:CLR.pass,w:2.4,a:true},
{d:CB([32,LOS],[50,62],[82,62],[110,62]),   c:CLR.pass,w:2.4,a:true},
{d:P([118,LOS],[118,24]),                   c:CLR.pass,w:2.1,a:true},
{d:P([172,LOS],[172,18]),                   c:CLR.pass,w:2.4,a:true},
],
},
{
id:30, name:'Drive', label:'Drive', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[52,48],[88,48],[116,50]),    c:CLR.pass,w:2.4,a:true}, // shallow
{d:P([12,LOS],[12,36],[86,36]),              c:CLR.pass,w:2.4,a:true}, // dig behind
{d:P([118,LOS],[118,18]),                    c:CLR.pass,w:2.2,a:true}, // seam
{d:P([176,LOS],[176,18]),                    c:CLR.pass,w:2.2,a:true}, // clear
{d:QQ([98,86],[112,84],[124,82]),            c:CLR.pass,w:1.8,a:true},
],
},
{
id:31, name:'Go_Bender', label:'Go-Bender', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,18]),                      c:CLR.pass,w:2.6,a:true}, // go
{d:CB([34,LOS],[34,34],[44,22],[62,18]),     c:CLR.pass,w:2.6,a:true}, // bender
{d:P([118,LOS],[118,56],[126,56]),           c:CLR.pass,w:1.8,a:true}, // hitch
{d:P([176,LOS],[176,18]),                    c:CLR.pass,w:2.4,a:true}, // clear
{d:QQ([98,86],[112,84],[124,82]),            c:CLR.pass,w:1.8,a:true},
],
},
{
id:32, name:'Bench', label:'Bench', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,56],[2,56]),             c:CLR.pass,w:2.2,a:true},  // out
{d:P([34,LOS],[34,56],[44,56]),            c:CLR.pass,w:2.2,a:true},  // out
{d:P([176,LOS],[176,18]),                  c:CLR.pass,w:2.4,a:true},  // clear/go
{d:P([152,LOS],[152,18]),                  c:CLR.pass,w:2.4,a:true},
{d:QQ([98,86],[112,84],[124,82]),          c:CLR.pass,w:1.8,a:true},
],
},
{
id:33, name:'Deep_Corner', label:'Deep Corner', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[34,40],[56,26],[86,22]),   c:CLR.pass,w:2.6,a:true}, // deep corner
{d:P([176,LOS],[176,18]),                  c:CLR.pass,w:2.4,a:true}, // clear
{d:P([12,LOS],[12,56],[2,56]),             c:CLR.pass,w:1.6,a:true},
{d:P([152,LOS],[152,40],[110,40]),         c:CLR.pass,w:2.2,a:true}, // dig/hold
{d:QQ([98,86],[112,84],[124,82]),          c:CLR.pass,w:1.8,a:true},
],
},
{
id:34, name:'Cross', label:'Cross', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([176,LOS],[160,44],[120,40],[82,38]),c:CLR.pass,w:2.6,a:true}, // deep cross
{d:P([34,LOS],[34,18]),                    c:CLR.pass,w:2.4,a:true}, // clear
{d:P([118,LOS],[118,24]),                  c:CLR.pass,w:2.2,a:true},
{d:P([12,LOS],[12,56],[2,56]),             c:CLR.pass,w:1.6,a:true},
{d:QQ([98,86],[112,84],[124,82]),          c:CLR.pass,w:1.8,a:true},
],
},
{
id:35, name:'Switch_Vert', label:'Switch Vert', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,108]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[40,58],[46,44],[46,18]),c:CLR.pass,w:2.6,a:true},
{d:CB([12,LOS],[18,58],[28,44],[28,18]),c:CLR.pass,w:2.6,a:true},
{d:P([152,LOS],[152,18]),               c:CLR.pass,w:2.6,a:true},
{d:P([176,LOS],[176,18]),               c:CLR.pass,w:2.6,a:true},
{d:QQ([98,86],[112,84],[124,82]),       c:CLR.pass,w:1.8,a:true},
],
},

/* ═══ PLAY-ACTION 36-40 ═══════════════════════════════ */
{
id:36, name:'PA_Post', label:'PA Post', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                      c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[84,92]),                        c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[172,34],[154,22],[126,20]),  c:CLR.pass,w:2.6,a:true},
{d:P([32,LOS],[32,40],[96,40]),               c:CLR.pass,w:2.2,a:true},
{d:P([12,LOS],[12,18]),                       c:CLR.pass,w:2.2,a:true},
],
},
{
id:37, name:'PA_Mills', label:'PA Mills', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                      c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[84,92]),                        c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[172,34],[154,22],[126,20]),  c:CLR.pass,w:2.6,a:true}, // post
{d:P([32,LOS],[32,40],[96,40]),               c:CLR.pass,w:2.4,a:true}, // dig
{d:P([118,LOS],[118,24]),                     c:CLR.pass,w:2.0,a:true},
],
},
{
id:38, name:'PA_Yankee', label:'PA Yankee', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                   c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[84,92]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[172,34],[154,22],[126,20]),c:CLR.pass,w:2.6,a:true}, // post
{d:CB([32,LOS],[52,48],[96,44],[130,42]),  c:CLR.pass,w:2.4,a:true}, // cross
{d:P([12,LOS],[12,18]),                    c:CLR.pass,w:2.1,a:true},
],
},
{
id:39, name:'PA_Flood', label:'PA Flood', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                 c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[98,92]),                   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([172,LOS],[172,18]),                c:CLR.pass,w:2.5,a:true},
{d:P([118,LOS],[118,46],[148,46]),       c:CLR.pass,w:2.4,a:true},
{d:QQ([106,78],[132,80],[150,82]),       c:CLR.pass,w:2.0,a:true},
{d:P([12,LOS],[12,56],[2,56]),           c:CLR.pass,w:1.6,a:true},
],
},
{
id:40, name:'PA_Shot', label:'PA Shot', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                    c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[84,92]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,18]),                     c:CLR.pass,w:2.6,a:true},
{d:P([172,LOS],[172,18]),                   c:CLR.pass,w:2.6,a:true},
{d:P([118,LOS],[118,24]),                   c:CLR.pass,w:2.1,a:true},
{d:P([32,LOS],[32,56],[22,56]),             c:CLR.pass,w:1.6,a:true}, // outlet
],
},
];
