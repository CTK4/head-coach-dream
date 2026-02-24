/* ═══ RUN-AND-SHOOT — CORE 40 ═══
   Core philosophy: option routes vs coverage leverage.
   Uses your existing helpers/constants: P(), QQ(), CB(), LOS
   Buckets: run (1-10), pass (11-35), situational/screens (36-40)
*/

const RNS_PLAYS = [
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
id:2, name:'Draw', label:'Draw', cat:'run',
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
{d:P([12,LOS],[12,22]),                c:CLR.pass,w:1,a:true,dsh:true},
{d:P([172,LOS],[172,22]),              c:CLR.pass,w:1,a:true,dsh:true},
],
},
{
id:3, name:'Trap', label:'Trap', cat:'run',
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
{d:P([82,LOS],[82,LOS-6]),              c:CLR.block,w:1.2,a:true},
{d:P([94,LOS],[94,LOS-6]),              c:CLR.block,w:1.2,a:true},
],
},
{
id:4, name:'Counter', label:'Counter', cat:'run',
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
id:5, name:'Stretch', label:'Stretch', cat:'run',
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
{
id:6, name:'Iso', label:'Iso', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
{x:96,y:84,t:'FB'},
],
rt:[
{d:P([84,84],[84,92]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([84,98],[84,88],[84,70],[84,48]), c:CLR.run,w:2.8,a:true},
{d:CB([96,84],[90,80],[88,64],[88,50]), c:CLR.block,w:2.0,a:true},
{d:P([70,LOS],[70,LOS-10]),            c:CLR.block,w:1.8,a:true},
{d:P([82,LOS],[82,LOS-10]),            c:CLR.block,w:1.8,a:true},
{d:P([94,LOS],[94,LOS-7]),             c:CLR.block,w:1.2,a:true},
],
},
{
id:7, name:'QB_Draw', label:'QB Draw', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:172,y:LOS,t:'WR'},
{x:32,y:LOS,t:'WR'},{x:118,y:LOS,t:'TE'},
{x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
],
rt:[
{d:P([106,82],[120,76]),               c:CLR.protect,w:1.6,a:false},
{d:P([84,82],[84,92],[86,72],[88,48]), c:CLR.run,    w:2.8,a:true},
{d:P([70,LOS],[70,LOS-8]),             c:CLR.protect,w:1.2,a:false},
{d:P([82,LOS],[82,LOS-8]),             c:CLR.protect,w:1.2,a:false},
{d:P([94,LOS],[94,LOS-8]),             c:CLR.protect,w:1.2,a:false},
{d:P([12,LOS],[12,22]),                c:CLR.pass,w:1,a:true,dsh:true},
{d:P([172,LOS],[172,22]),              c:CLR.pass,w:1,a:true,dsh:true},
],
},
{
id:8, name:'Delay', label:'Delay', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:172,y:LOS,t:'WR'},
{x:32,y:LOS,t:'WR'},{x:118,y:LOS,t:'TE'},
{x:84,y:82,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,82],[84,102]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([106,86],[106,92],[94,72],[88,52]),c:CLR.run,  w:2.8,a:true,dsh:true},
{d:P([70,LOS],[70,LOS-8]),              c:CLR.protect,w:1.2,a:false},
{d:P([82,LOS],[82,LOS-8]),              c:CLR.protect,w:1.2,a:false},
{d:P([94,LOS],[94,LOS-8]),              c:CLR.protect,w:1.2,a:false},
],
},
{
id:9, name:'Sweep', label:'Sweep', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
],
rt:[
{d:QQ([84,82],[118,78],[150,74]),        c:CLR.toss,w:1.4,a:true,dsh:true},
{d:CB([150,74],[166,64],[178,54],[188,42]),c:CLR.run,w:2.8,a:true},
{d:P([58,LOS],[70,LOS-5]),              c:CLR.block,w:1.1,a:true},
{d:P([70,LOS],[82,LOS-5]),              c:CLR.block,w:1.1,a:true},
{d:P([82,LOS],[94,LOS-5]),              c:CLR.block,w:1.1,a:true},
{d:P([94,LOS],[106,LOS-5]),             c:CLR.block,w:1.1,a:true},
{d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]),c:CLR.block,w:1.1,a:true},
],
},
{
id:10, name:'Split_Zone', label:'Split Zone', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
{x:56,y:80,t:'H'},
],
rt:[
{d:P([84,84],[84,92]),                         c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,84],[126,80],[148,68],[168,46]),     c:CLR.run,  w:2.8,a:true},
{d:CB([56,80],[72,76],[96,72],[110,LOS+2]),     c:CLR.pull, w:1.8,a:true},
{d:P([58,LOS],[70,LOS-5]),                     c:CLR.block,w:1,a:true},
{d:P([70,LOS],[82,LOS-5]),                     c:CLR.block,w:1,a:true},
{d:P([82,LOS],[94,LOS-5]),                     c:CLR.block,w:1,a:true},
{d:P([94,LOS],[106,LOS-5]),                    c:CLR.block,w:1,a:true},
{d:P([106,LOS],[118,LOS-5]),                   c:CLR.block,w:1,a:true},
],
},

/* ═══ PASS 11-35 ══════════════════════════════════════ */
{
id:11, name:'Choice', label:'Choice', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[34,46],[40,40],[52,38]),     c:CLR.pass,w:2.2,a:true}, // slot choice stem
{d:CB([152,LOS],[152,46],[146,40],[134,38]), c:CLR.pass,w:2.2,a:true}, // slot choice stem
{d:P([118,LOS],[118,18]),                    c:CLR.pass,w:2.1,a:true}, // seam
{d:P([12,LOS],[12,18]),                      c:CLR.pass,w:1.8,a:true}, // clear
{d:QQ([98,86],[110,84],[120,82]),            c:CLR.pass,w:1.8,a:true}, // check
],
},
{
id:12, name:'Seam_Read', label:'Seam Read', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([34,LOS],[34,18]),    c:CLR.pass,w:2.3,a:true},   // seam read
{d:P([118,LOS],[118,18]),  c:CLR.pass,w:2.3,a:true},   // seam read
{d:P([152,LOS],[152,18]),  c:CLR.pass,w:2.1,a:true},   // clear
{d:P([12,LOS],[12,56],[2,56]), c:CLR.pass,w:1.8,a:true}, // hitch
{d:QQ([98,86],[110,84],[120,82]), c:CLR.pass,w:1.8,a:true},
],
},
{
id:13, name:'Switch_Verts', label:'Switch Verticals', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[40,58],[46,44],[46,18]),c:CLR.pass,w:2.3,a:true}, // inside goes outside
{d:CB([12,LOS],[18,58],[28,44],[28,18]),c:CLR.pass,w:2.3,a:true}, // outside switches inside
{d:P([152,LOS],[152,18]),               c:CLR.pass,w:2.3,a:true},
{d:P([118,LOS],[118,18]),               c:CLR.pass,w:2.3,a:true},
{d:QQ([98,86],[110,84],[120,82]),       c:CLR.pass,w:1.8,a:true},
],
},
{
id:14, name:'Four_Verts', label:'4 Verts', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,18]),   c:CLR.pass,w:2.3,a:true},
{d:P([34,LOS],[34,18]),   c:CLR.pass,w:2.3,a:true},
{d:P([118,LOS],[118,18]), c:CLR.pass,w:2.3,a:true},
{d:P([152,LOS],[152,18]), c:CLR.pass,w:2.3,a:true},
{d:QQ([98,86],[110,84],[120,82]), c:CLR.pass,w:1.8,a:true},
],
},
{
id:15, name:'Go_Choice', label:'Go-Choice', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                  c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([172,LOS],[172,18]),                c:CLR.pass,w:2.5,a:true}, // go
{d:CB([34,LOS],[34,40],[40,32],[54,28]), c:CLR.pass,w:2.3,a:true}, // choice
{d:P([118,LOS],[118,18]),                c:CLR.pass,w:2.2,a:true}, // seam
{d:P([12,LOS],[12,56],[2,56]),           c:CLR.pass,w:1.8,a:true}, // hitch
{d:QQ([98,86],[110,84],[120,82]),        c:CLR.pass,w:1.8,a:true},
],
},
{
id:16, name:'Double_Choice', label:'Double Choice', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[34,46],[40,40],[52,38]),     c:CLR.pass,w:2.3,a:true},
{d:CB([152,LOS],[152,46],[146,40],[134,38]), c:CLR.pass,w:2.3,a:true},
{d:P([12,LOS],[12,18]),                      c:CLR.pass,w:2.2,a:true},
{d:P([176,LOS],[176,18]),                    c:CLR.pass,w:2.2,a:true},
{d:QQ([98,86],[110,84],[120,82]),            c:CLR.pass,w:1.8,a:true},
],
},
{
id:17, name:'Divide', label:'Divide', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([34,LOS],[34,18]),      c:CLR.pass,w:2.3,a:true},
{d:P([118,LOS],[118,18]),    c:CLR.pass,w:2.3,a:true},
{d:P([152,LOS],[152,18]),    c:CLR.pass,w:2.2,a:true},
{d:P([12,LOS],[12,56],[2,56]),c:CLR.pass,w:1.8,a:true},
{d:QQ([98,86],[110,84],[120,82]), c:CLR.pass,w:1.8,a:true},
],
},
{
id:18, name:'Post_Wheel', label:'Post-Wheel', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([176,LOS],[176,34],[154,22],[126,20]),c:CLR.pass,w:2.4,a:true}, // post
{d:CB([98,86],[120,82],[142,64],[156,28]),  c:CLR.pass,w:2.2,a:true}, // wheel
{d:P([34,LOS],[34,56],[26,56]),            c:CLR.pass,w:1.8,a:true},  // hitch
{d:P([12,LOS],[12,18]),                    c:CLR.pass,w:2.1,a:true},  // clear
],
},
{
id:19, name:'Dig_Choice', label:'Dig-Choice', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([34,LOS],[34,40],[92,40]),             c:CLR.pass,w:2.2,a:true}, // dig
{d:CB([118,LOS],[118,46],[112,40],[100,38]),c:CLR.pass,w:2.2,a:true}, // choice hook/out
{d:P([176,LOS],[176,18]),                   c:CLR.pass,w:2.2,a:true}, // clear
{d:P([12,LOS],[12,56],[2,56]),              c:CLR.pass,w:1.8,a:true}, // hitch
{d:QQ([98,86],[110,84],[120,82]),           c:CLR.pass,w:1.8,a:true},
],
},
{
id:20, name:'Shallow', label:'Shallow Cross', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,102]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[52,44],[88,44],[108,46]),   c:CLR.pass,w:2.2,a:true},
{d:P([176,LOS],[176,18]),                   c:CLR.pass,w:2.1,a:true},
{d:P([118,LOS],[118,50],[148,50]),          c:CLR.pass,w:2.0,a:true},
{d:P([12,LOS],[12,28]),                     c:CLR.pass,w:1.6,a:true,dsh:true},
{d:QQ([98,86],[110,84],[120,82]),           c:CLR.pass,w:1.8,a:true},
],
},
{
id:21, name:'Smash_Option', label:'Smash Option', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                       c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[8,42],[24,26],[36,24]),       c:CLR.pass,w:2.2,a:true}, // corner
{d:CB([34,LOS],[34,52],[40,46],[50,44]),      c:CLR.pass,w:2.2,a:true}, // option hitch/out
{d:CB([176,LOS],[180,42],[166,26],[152,24]),  c:CLR.pass,w:2.2,a:true}, // corner
{d:CB([152,LOS],[152,52],[146,46],[136,44]),  c:CLR.pass,w:2.2,a:true}, // option hitch/in
{d:QQ([98,86],[110,84],[120,82]),             c:CLR.pass,w:1.8,a:true},
],
},
{
id:22, name:'Curl_Flat', label:'Curl-Flat', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,44],[12,48]),        c:CLR.pass,w:2.2,a:true}, // curl
{d:QQ([34,LOS],[44,60],[58,60]),       c:CLR.pass,w:2.0,a:true}, // flat
{d:P([118,LOS],[118,18]),              c:CLR.pass,w:2.1,a:true}, // seam
{d:P([176,LOS],[176,18]),              c:CLR.pass,w:2.2,a:true}, // clear
{d:QQ([98,86],[110,84],[120,82]),      c:CLR.pass,w:1.8,a:true},
],
},
{
id:23, name:'Out_Option', label:'Out-Option', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,56],[2,56]),              c:CLR.pass,w:2.2,a:true}, // quick out
{d:CB([34,LOS],[34,46],[40,42],[52,40]),    c:CLR.pass,w:2.2,a:true}, // option
{d:P([176,LOS],[176,18]),                   c:CLR.pass,w:2.2,a:true}, // clear
{d:P([152,LOS],[152,56],[162,56]),          c:CLR.pass,w:2.0,a:true}, // out
{d:QQ([98,86],[110,84],[120,82]),           c:CLR.pass,w:1.8,a:true},
],
},
{
id:24, name:'Mesh_Read', label:'Mesh Read', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[62,62],[100,62],[120,64]),  c:CLR.pass,w:2.2,a:true},
{d:CB([152,LOS],[122,60],[82,60],[60,62]),  c:CLR.pass,w:2.2,a:true},
{d:P([12,LOS],[12,18]),                     c:CLR.pass,w:2.0,a:true}, // clear
{d:P([176,LOS],[176,18]),                   c:CLR.pass,w:2.0,a:true}, // clear
{d:QQ([98,86],[110,84],[120,82]),           c:CLR.pass,w:1.8,a:true},
],
},
{
id:25, name:'Slot_Option', label:'Slot Option', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[34,46],[40,40],[52,38]),   c:CLR.pass,w:2.3,a:true}, // slot option
{d:P([12,LOS],[12,18]),                    c:CLR.pass,w:2.2,a:true}, // clear
{d:P([176,LOS],[176,18]),                  c:CLR.pass,w:2.2,a:true}, // clear
{d:P([152,LOS],[152,56],[144,56]),         c:CLR.pass,w:1.8,a:true}, // hitch
{d:QQ([98,86],[110,84],[120,82]),          c:CLR.pass,w:1.8,a:true},
],
},
{
id:26, name:'Fade_Stop', label:'Fade-Stop', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([176,LOS],[176,26],[186,26]),         c:CLR.pass,w:2.2,a:true}, // stop
{d:P([12,LOS],[12,18]),                    c:CLR.pass,w:2.3,a:true}, // fade
{d:CB([34,LOS],[34,46],[40,40],[52,38]),   c:CLR.pass,w:2.0,a:true}, // option
{d:QQ([98,86],[110,84],[120,82]),          c:CLR.pass,w:1.8,a:true},
],
},
{
id:27, name:'Deep_Comeback', label:'Deep Comeback', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:34,y:LOS,t:'WR'},{x:152,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),               c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,34],[6,34]),        c:CLR.pass,w:2.2,a:true},
{d:P([176,LOS],[176,34],[184,34]),    c:CLR.pass,w:2.2,a:true},
{d:P([34,LOS],[34,18]),               c:CLR.pass,w:2.0,a:true}, // clear
{d:P([152,LOS],[152,18]),             c:CLR.pass,w:2.0,a:true}, // clear
{d:QQ([98,86],[110,84],[120,82]),     c:CLR.pass,w:1.8,a:true},
],
},
{
id:28, name:'Corner_Option', label:'Corner-Option', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[34,46],[48,32],[68,28]),     c:CLR.pass,w:2.2,a:true}, // corner option
{d:P([12,LOS],[12,56],[2,56]),               c:CLR.pass,w:1.8,a:true}, // hitch
{d:P([176,LOS],[176,18]),                    c:CLR.pass,w:2.2,a:true}, // clear
{d:P([152,LOS],[152,56],[162,56]),           c:CLR.pass,w:1.8,a:true},
{d:QQ([98,86],[110,84],[120,82]),            c:CLR.pass,w:1.8,a:true},
],
},
{
id:29, name:'Texas', label:'Texas', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:34,y:LOS,t:'WR'},{x:118,y:LOS,t:'TE'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([98,86],[92,78],[96,70],[108,64]),    c:CLR.pass,w:2.2,a:true}, // texas angle
{d:P([118,LOS],[118,18]),                   c:CLR.pass,w:2.1,a:true},
{d:P([12,LOS],[12,18]),                     c:CLR.pass,w:2.0,a:true},
{d:P([176,LOS],[176,18]),                   c:CLR.pass,w:2.0,a:true},
{d:CB([34,LOS],[34,46],[40,40],[52,38]),    c:CLR.pass,w:1.8,a:true},
],
},
{
id:30, name:'Seam_Post', label:'Seam-Post', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([118,LOS],[118,22],[132,18]),          c:CLR.pass,w:2.3,a:true}, // seam-post bend
{d:CB([176,LOS],[176,34],[154,22],[126,20]),c:CLR.pass,w:2.3,a:true}, // post
{d:P([12,LOS],[12,56],[2,56]),              c:CLR.pass,w:1.8,a:true},
{d:CB([34,LOS],[34,46],[40,40],[52,38]),    c:CLR.pass,w:1.8,a:true},
{d:QQ([98,86],[110,84],[120,82]),           c:CLR.pass,w:1.8,a:true},
],
},
{
id:31, name:'All_Go_Special', label:'All Go Special', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,18]),   c:CLR.pass,w:2.5,a:true},
{d:P([34,LOS],[34,18]),   c:CLR.pass,w:2.5,a:true},
{d:P([118,LOS],[118,18]), c:CLR.pass,w:2.5,a:true},
{d:P([152,LOS],[152,18]), c:CLR.pass,w:2.5,a:true},
{d:QQ([98,86],[110,84],[120,82]), c:CLR.pass,w:1.8,a:true},
],
},
{
id:32, name:'Quick_Out_Read', label:'Quick Out Read', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:34,y:LOS,t:'WR'},{x:152,y:LOS,t:'WR'},
{x:84,y:80,t:'QB'},{x:98,y:80,t:'RB'},
],
rt:[
{d:P([84,80],[84,92]),               c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,57],[2,57]),       c:CLR.pass,w:2.2,a:true},
{d:P([176,LOS],[176,57],[186,57]),   c:CLR.pass,w:2.2,a:true},
{d:CB([34,LOS],[34,46],[40,40],[52,38]), c:CLR.pass,w:2.0,a:true}, // option
{d:P([152,LOS],[152,56],[162,56]),   c:CLR.pass,w:2.0,a:true},
{d:QQ([98,80],[110,78],[120,76]),    c:CLR.pass,w:1.6,a:true},
],
},
{
id:33, name:'Choice_Screen', label:'Choice Screen', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,98]),                  c:CLR.qbmove,w:1.4,a:true,dsh:true},
{d:CB([34,LOS],[36,72],[40,78],[42,82]), c:CLR.sit,w:2,a:true},     // screen target
{d:CB([84,98],[62,94],[52,88],[42,82]),  c:CLR.sit,w:1.8,a:true,dsh:true},
{d:CB([12,LOS],[20,72],[34,78],[38,80]), c:CLR.block,w:1.5,a:true},
{d:P([176,LOS],[176,18]),                c:CLR.pass,w:2.2,a:true},
],
},
{
id:34, name:'Wheel_Choice', label:'Wheel Choice', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([106,86],[128,82],[148,64],[160,28]),c:CLR.pass,w:2.2,a:true}, // wheel
{d:CB([34,LOS],[34,46],[40,40],[52,38]),   c:CLR.pass,w:2.2,a:true}, // choice
{d:P([12,LOS],[12,18]),                    c:CLR.pass,w:2.1,a:true},
{d:P([176,LOS],[176,18]),                  c:CLR.pass,w:2.1,a:true},
],
},
{
id:35, name:'Pivot_Option', label:'Pivot Option', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[34,52],[40,50],[54,52]),     c:CLR.pass,w:2.2,a:true}, // pivot
{d:CB([152,LOS],[152,52],[146,50],[132,52]), c:CLR.pass,w:2.2,a:true}, // pivot
{d:P([12,LOS],[12,18]),                      c:CLR.pass,w:2.1,a:true},
{d:P([176,LOS],[176,18]),                    c:CLR.pass,w:2.1,a:true},
{d:QQ([98,86],[110,84],[120,82]),            c:CLR.pass,w:1.8,a:true},
],
},

/* ═══ SCREENS 36-40 ═══════════════════════════════════ */
{
id:36, name:'Slip', label:'Slip', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,100]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,86],[118,90],[130,92],[140,92]),c:CLR.sit,w:2,a:true},
{d:CB([84,100],[110,98],[128,94],[140,92]),c:CLR.sit,w:1.8,a:true,dsh:true},
{d:P([118,LOS],[118,72]),               c:CLR.block,w:1.2,a:false},
{d:P([12,LOS],[12,26]),                 c:CLR.pass,w:1,a:true,dsh:true},
{d:P([176,LOS],[176,26]),               c:CLR.pass,w:1,a:true,dsh:true},
],
},
{
id:37, name:'Tunnel', label:'Tunnel', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,92]),                  c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([34,LOS],[36,72],[40,78],[42,82]),c:CLR.sit,w:2,a:true},
{d:CB([84,92],[62,88],[52,84],[42,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
{d:P([12,LOS],[20,72],[34,78]),         c:CLR.block,w:1.4,a:true},
{d:P([176,LOS],[176,26]),               c:CLR.pass,w:1,a:true,dsh:true},
],
},
{
id:38, name:'Bubble', label:'Bubble', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:80,t:'QB'},{x:98,y:80,t:'RB'},
],
rt:[
{d:P([84,80],[84,90]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([152,LOS],[160,LOS+10],[172,LOS+12]), c:CLR.sit,w:2,a:true}, // bubble
{d:P([176,LOS],[176,26]),              c:CLR.pass,w:1.6,a:true,dsh:true},
{d:P([12,LOS],[12,26]),                c:CLR.pass,w:1.6,a:true,dsh:true},
{d:P([34,LOS],[34,52],[44,52]),        c:CLR.block,w:1.2,a:true},
],
},
{
id:39, name:'Swing', label:'Swing', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:34,y:LOS,t:'WR'},{x:118,y:LOS,t:'TE'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,100]),                  c:CLR.qbmove,w:1.4,a:true,dsh:true},
{d:QQ([106,86],[128,86],[152,84]),        c:CLR.sit,w:2,a:true}, // swing
{d:P([12,LOS],[12,18]),                   c:CLR.pass,w:2.0,a:true},
{d:P([176,LOS],[176,18]),                 c:CLR.pass,w:2.0,a:true},
{d:P([118,LOS],[118,50],[148,50]),        c:CLR.pass,w:1.8,a:true},
],
},
{
id:40, name:'Middle_Screen', label:'Middle Screen', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,100]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,86],[96,90],[92,94],[96,96]),c:CLR.sit,w:2,a:true},
{d:CB([84,100],[92,98],[94,97],[96,96]),c:CLR.sit,w:1.8,a:true,dsh:true},
{d:P([118,LOS],[118,72]),               c:CLR.block,w:1.2,a:false},
{d:P([12,LOS],[12,26]),                 c:CLR.pass,w:1,a:true,dsh:true},
{d:P([176,LOS],[176,26]),               c:CLR.pass,w:1,a:true,dsh:true},
],
},
];
