/* ═══ PRO-STYLE BALANCED — CORE 40 ═══
   15 run / 20 pass / 5 PA
   Buckets: run (1-15), pass (16-35), pa (36-40)
   Uses your existing helpers/constants: P(), QQ(), CB(), LOS
*/

const PROSTYLE_PLAYS = [
/* ═══ RUNS 1-15 ═══════════════════════════════════════ */
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
id:6, name:'Iso', label:'Iso', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
{x:66,y:84,t:'FB'},
],
rt:[
{d:CB([66,84],[72,78],[74,66],[74,52]), c:CLR.block,w:1.8,a:true}, // lead iso
{d:CB([84,98],[82,86],[80,68],[78,50]), c:CLR.run,  w:2.8,a:true},
{d:P([58,LOS],[58,LOS-9]),              c:CLR.block,w:1.5,a:true},
{d:P([70,LOS],[70,LOS-10]),             c:CLR.block,w:1.8,a:true},
{d:P([82,LOS],[82,LOS-10]),             c:CLR.block,w:1.8,a:true},
{d:P([94,LOS],[94,LOS-8]),              c:CLR.block,w:1.2,a:true},
],
},
{
id:7, name:'Lead_Weak', label:'Lead Weak', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
{x:102,y:84,t:'FB'},
],
rt:[
{d:CB([102,84],[96,78],[90,66],[88,50]), c:CLR.block,w:1.8,a:true},
{d:CB([84,98],[86,86],[88,66],[88,50]),  c:CLR.run,  w:2.8,a:true},
{d:P([106,LOS],[106,LOS-9]),             c:CLR.block,w:1.5,a:true},
{d:P([94,LOS],[94,LOS-10]),              c:CLR.block,w:1.8,a:true},
{d:P([82,LOS],[82,LOS-10]),              c:CLR.block,w:1.8,a:true},
{d:P([70,LOS],[70,LOS-8]),               c:CLR.block,w:1.2,a:true},
],
},
{
id:8, name:'Toss', label:'Toss', cat:'run',
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
id:9, name:'Stretch', label:'Stretch', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:100,y:84,t:'RB'},
],
rt:[
{d:P([84,84],[84,92]),                      c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([100,84],[118,80],[148,66],[176,48]), c:CLR.run,  w:2.8,a:true},
{d:P([58,LOS],[70,LOS-6]),                 c:CLR.block,w:1.2,a:true},
{d:P([70,LOS],[82,LOS-6]),                 c:CLR.block,w:1.2,a:true},
{d:P([82,LOS],[94,LOS-6]),                 c:CLR.block,w:1.2,a:true},
{d:P([94,LOS],[106,LOS-6]),                c:CLR.block,w:1.2,a:true},
{d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]),  c:CLR.block,w:1.2,a:true},
],
},
{
id:10, name:'Trap', label:'Trap', cat:'run',
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
id:11, name:'Draw', label:'Draw', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:172,y:LOS,t:'WR'},
{x:32,y:LOS,t:'WR'},{x:118,y:LOS,t:'TE'},
{x:84,y:82,t:'QB'},{x:84,y:96,t:'RB'},
],
rt:[
{d:P([84,82],[84,94]),                  c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([84,96],[84,86],[86,70],[88,48]), c:CLR.run,  w:2.8,a:true},
{d:P([70,LOS],[70,LOS-8]),              c:CLR.protect,w:1.2,a:false},
{d:P([82,LOS],[82,LOS-8]),              c:CLR.protect,w:1.2,a:false},
{d:P([94,LOS],[94,LOS-8]),              c:CLR.protect,w:1.2,a:false},
],
},
{
id:12, name:'Split_Zone', label:'Split Zone', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
{x:56,y:80,t:'H'},
],
rt:[
{d:CB([106,84],[126,80],[148,68],[168,46]), c:CLR.run,w:2.8,a:true},
{d:CB([56,80],[72,76],[96,72],[110,LOS+2]),c:CLR.pull,w:1.8,a:true}, // slice/insert
{d:P([58,LOS],[70,LOS-5]),                 c:CLR.block,w:1,a:true},
{d:P([70,LOS],[82,LOS-5]),                 c:CLR.block,w:1,a:true},
{d:P([82,LOS],[94,LOS-5]),                 c:CLR.block,w:1,a:true},
{d:P([94,LOS],[106,LOS-5]),                c:CLR.block,w:1,a:true},
{d:P([106,LOS],[118,LOS-5]),               c:CLR.block,w:1,a:true},
],
},
{
id:13, name:'Counter_Trey', label:'Counter Trey', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
],
rt:[
{d:P([84,84],[84,94]),                   c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,84],[94,86],[78,76],[92,50]), c:CLR.run,  w:2.8,a:true},
{d:CB([58,LOS],[66,LOS+10],[90,LOS-2],[98,LOS-9]), c:CLR.pull,w:1.9,a:true},
{d:CB([70,LOS],[78,LOS+8],[98,LOS],[104,LOS-9]),   c:CLR.pull,w:1.7,a:true},
{d:QQ([118,LOS],[112,LOS-4],[104,LOS-8]),           c:CLR.block,w:1.3,a:true},
],
},
{
id:14, name:'Sweep', label:'Sweep', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
],
rt:[
{d:QQ([84,82],[110,80],[136,78]),            c:CLR.toss,w:1.3,a:true,dsh:true},
{d:CB([136,78],[156,64],[174,52],[186,44]),  c:CLR.run,w:2.8,a:true},
{d:CB([118,LOS],[136,LOS-4],[150,LOS-8],[162,LOS-10]), c:CLR.block,w:1.6,a:true},
{d:P([12,LOS],[12,LOS-9]),                   c:CLR.block,w:1,a:true},
],
},
{
id:15, name:'Pin_Pull', label:'Pin-Pull', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
],
rt:[
{d:P([84,84],[84,92]),                       c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,84],[128,78],[154,64],[178,46]),  c:CLR.run,w:2.8,a:true},
{d:CB([70,LOS],[86,LOS+8],[110,LOS],[126,LOS-8]), c:CLR.pull,w:1.8,a:true},
{d:CB([82,LOS],[96,LOS+6],[122,LOS-2],[140,LOS-8]),c:CLR.pull,w:1.6,a:true},
{d:P([58,LOS],[58,LOS-7]),                   c:CLR.block,w:1.2,a:true},
{d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]),    c:CLR.block,w:1.2,a:true},
],
},

/* ═══ PASS 16-35 ══════════════════════════════════════ */
{
id:16, name:'Stick', label:'Stick', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
],
rt:[
{d:P([84,84],[84,100]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([32,LOS],[32,52],[32,56]),         c:CLR.pass,w:2.2,a:true},
{d:QQ([106,84],[96,80],[78,78]),        c:CLR.pass,w:1.8,a:true}, // stick by RB
{d:P([118,LOS],[118,52],[118,56]),      c:CLR.pass,w:2.2,a:true},
{d:P([172,LOS],[172,28]),               c:CLR.pass,w:1.6,a:true},
{d:P([12,LOS],[12,28]),                 c:CLR.pass,w:1.6,a:true},
],
},
{
id:17, name:'Smash', label:'Smash', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                       c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[8,42],[24,26],[36,24]),       c:CLR.pass,w:2.2,a:true},
{d:P([32,LOS],[32,52],[32,56]),               c:CLR.pass,w:2.2,a:true},
{d:CB([172,LOS],[180,42],[166,26],[152,24]),  c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,52],[118,56]),            c:CLR.pass,w:2.2,a:true},
{d:QQ([106,86],[120,82],[132,80]),            c:CLR.pass,w:1.2,a:true,dsh:true},
],
},
{
id:18, name:'Flood', label:'Flood', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[98,102]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([172,LOS],[172,26]),               c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,46],[148,46]),      c:CLR.pass,w:2.2,a:true},
{d:QQ([106,86],[132,84],[150,82]),      c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,56],[2,56]),          c:CLR.pass,w:1.6,a:true},
{d:P([32,LOS],[32,36]),                 c:CLR.pass,w:1.6,a:true,dsh:true},
],
},
{
id:19, name:'Levels', label:'Levels', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,38],[88,38]),            c:CLR.pass,w:2.2,a:true},
{d:CB([32,LOS],[50,62],[82,62],[110,62]),  c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,24]),                  c:CLR.pass,w:1.8,a:true},
{d:P([172,LOS],[172,26]),                  c:CLR.pass,w:1.8,a:true},
],
},
{
id:20, name:'Drive', label:'Drive', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[52,48],[88,48],[116,50]),    c:CLR.pass,w:2.2,a:true},
{d:P([12,LOS],[12,36],[86,36]),              c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,24]),                    c:CLR.pass,w:1.8,a:true},
{d:P([176,LOS],[176,26]),                    c:CLR.pass,w:1.8,a:true},
{d:QQ([98,86],[112,84],[124,82]),            c:CLR.pass,w:1.6,a:true},
],
},
{
id:21, name:'Shallow', label:'Shallow', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,102]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[52,52],[88,52],[120,52]),    c:CLR.pass,w:2.2,a:true},
{d:CB([176,LOS],[154,48],[108,48],[72,50]),  c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,26]),                    c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,28]),                      c:CLR.pass,w:1.6,a:true},
],
},
{
id:22, name:'Mesh', label:'Mesh', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,102]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[62,62],[100,62],[120,64]),   c:CLR.pass,w:2.2,a:true},
{d:CB([152,LOS],[122,60],[82,60],[60,62]),   c:CLR.pass,w:2.2,a:true},
{d:P([12,LOS],[12,28]),                      c:CLR.pass,w:1.6,a:true},
{d:CB([176,LOS],[186,44],[176,28],[166,26]), c:CLR.pass,w:1.6,a:true},
{d:P([118,LOS],[118,50]),                    c:CLR.pass,w:1.6,a:true},
],
},
{
id:23, name:'Curl_Flat', label:'Curl-Flat', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),              c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,44],[12,48]),      c:CLR.pass,w:2.2,a:true},
{d:QQ([34,LOS],[44,60],[58,60]),     c:CLR.pass,w:2.0,a:true},
{d:P([118,LOS],[118,26]),            c:CLR.pass,w:1.8,a:true},
{d:P([176,LOS],[176,26]),            c:CLR.pass,w:1.8,a:true},
{d:QQ([98,86],[112,84],[124,82]),    c:CLR.pass,w:1.6,a:true},
],
},
{
id:24, name:'China', label:'China', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,56],[2,56]),               c:CLR.pass,w:2.1,a:true},
{d:CB([32,LOS],[40,52],[54,48],[54,44]),     c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,26]),                    c:CLR.pass,w:1.8,a:true},
{d:P([172,LOS],[172,26]),                    c:CLR.pass,w:1.8,a:true},
{d:QQ([106,86],[120,84],[134,82]),           c:CLR.pass,w:1.6,a:true},
],
},
{
id:25, name:'Sail', label:'Sail', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[96,104]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[182,44],[164,28],[148,26]), c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,48],[150,48]),           c:CLR.pass,w:2.2,a:true},
{d:QQ([106,86],[132,82],[150,78]),           c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,28]),                      c:CLR.pass,w:1.6,a:true},
],
},
{
id:26, name:'4_Verts', label:'4 Verts', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,18]),   c:CLR.pass,w:2.4,a:true},
{d:P([34,LOS],[34,18]),   c:CLR.pass,w:2.4,a:true},
{d:P([118,LOS],[118,18]), c:CLR.pass,w:2.4,a:true},
{d:P([152,LOS],[152,18]), c:CLR.pass,w:2.4,a:true},
{d:QQ([98,86],[112,84],[124,82]), c:CLR.pass,w:1.6,a:true},
],
},
{
id:27, name:'Dagger', label:'Dagger', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),               c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,36],[82,36]),       c:CLR.pass,w:2.2,a:true},
{d:CB([32,LOS],[32,46],[52,34],[68,28]), c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,50],[148,50]),    c:CLR.pass,w:1.8,a:true},
{d:P([172,LOS],[172,28]),             c:CLR.pass,w:1.6,a:true},
],
},
{
id:28, name:'Comeback', label:'Comeback', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:34,y:LOS,t:'WR'},{x:152,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,34],[6,34]),          c:CLR.pass,w:2.2,a:true},
{d:P([176,LOS],[176,34],[184,34]),      c:CLR.pass,w:2.2,a:true},
{d:P([34,LOS],[34,56],[26,56]),         c:CLR.pass,w:1.6,a:true},
{d:P([152,LOS],[152,56],[160,56]),      c:CLR.pass,w:1.6,a:true},
{d:QQ([98,86],[112,84],[124,82]),       c:CLR.pass,w:1.6,a:true},
],
},
{
id:29, name:'Dig', label:'Dig', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),            c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([34,LOS],[34,40],[92,40]),    c:CLR.pass,w:2.2,a:true},
{d:P([176,LOS],[176,18]),          c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,24]),          c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,56],[2,56]),     c:CLR.pass,w:1.6,a:true},
{d:QQ([98,86],[112,84],[124,82]),  c:CLR.pass,w:1.6,a:true},
],
},
{
id:30, name:'Post_Wheel', label:'Post-Wheel', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([176,LOS],[176,34],[154,22],[126,20]), c:CLR.pass,w:2.3,a:true},
{d:CB([98,86],[120,82],[142,64],[156,28]),   c:CLR.pass,w:2.0,a:true},
{d:P([34,LOS],[34,56],[26,56]),              c:CLR.pass,w:1.6,a:true},
{d:P([12,LOS],[12,28]),                      c:CLR.pass,w:1.6,a:true},
],
},
{
id:31, name:'Corner', label:'Corner', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[34,40],[56,26],[86,22]),  c:CLR.pass,w:2.2,a:true},
{d:P([176,LOS],[176,18]),                 c:CLR.pass,w:2.0,a:true},
{d:P([12,LOS],[12,56],[2,56]),            c:CLR.pass,w:1.6,a:true},
{d:P([152,LOS],[152,56],[160,56]),        c:CLR.pass,w:1.6,a:true},
{d:QQ([98,86],[112,84],[124,82]),         c:CLR.pass,w:1.6,a:true},
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
{d:P([84,86],[84,104]),                c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,56],[2,56]),         c:CLR.pass,w:2.1,a:true},
{d:P([34,LOS],[34,56],[44,56]),        c:CLR.pass,w:2.1,a:true},
{d:P([176,LOS],[176,18]),              c:CLR.pass,w:2.0,a:true},
{d:P([152,LOS],[152,18]),              c:CLR.pass,w:2.0,a:true},
{d:QQ([98,86],[112,84],[124,82]),      c:CLR.pass,w:1.6,a:true},
],
},
{
id:33, name:'Slot_Fade', label:'Slot Fade', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([34,LOS],[36,56],[44,40],[56,18]),   c:CLR.pass,w:2.3,a:true},
{d:P([176,LOS],[176,18]),                  c:CLR.pass,w:2.0,a:true},
{d:P([12,LOS],[12,56],[2,56]),             c:CLR.pass,w:1.6,a:true},
{d:P([152,LOS],[152,56],[144,56]),         c:CLR.pass,w:1.6,a:true},
{d:QQ([98,86],[112,84],[124,82]),          c:CLR.pass,w:1.6,a:true},
],
},
{
id:34, name:'Deep_Over', label:'Deep Over', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[12,28],[60,28],[108,28]), c:CLR.pass,w:2.2,a:true},
{d:CB([172,LOS],[172,34],[120,34],[80,36]),c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,26]),                 c:CLR.pass,w:1.8,a:true},
{d:P([32,LOS],[32,52],[32,56]),           c:CLR.pass,w:1.6,a:true},
],
},
{
id:35, name:'All_Hitches', label:'All Hitches', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},{x:176,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,102]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,52],[12,56]),         c:CLR.pass,w:2.2,a:true},
{d:P([34,LOS],[34,52],[34,56]),         c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,52],[118,56]),      c:CLR.pass,w:2.2,a:true},
{d:P([152,LOS],[152,52],[152,56]),      c:CLR.pass,w:2.2,a:true},
{d:P([176,LOS],[176,52],[176,56]),      c:CLR.pass,w:2.2,a:true},
],
},

/* ═══ PLAY-ACTION 36-40 ═══════════════════════════════ */
{
id:36, name:'Boot_Flood', label:'Boot Flood', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                        c:CLR.pa,w:1.5,a:true,dsh:true},
{d:CB([84,78],[60,82],[44,80],[36,76]),         c:CLR.qbmove,w:2,a:true},
{d:CB([172,LOS],[182,44],[164,28],[148,26]),    c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,48],[150,48]),              c:CLR.pass,w:2.2,a:true},
{d:QQ([106,78],[132,82],[150,78]),              c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,28]),                         c:CLR.pass,w:1.4,a:true,dsh:true},
],
},
{
id:37, name:'PA_Cross', label:'PA Cross', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                   c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[84,92]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[154,48],[108,48],[72,50]),c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,26]),                  c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,18]),                    c:CLR.pass,w:2.0,a:true},
{d:QQ([106,78],[120,82],[134,84]),         c:CLR.pass,w:1.6,a:true},
],
},
{
id:38, name:'PA_Post', label:'PA Post', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                      c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[84,92]),                        c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[172,34],[154,22],[126,20]),  c:CLR.pass,w:2.3,a:true},
{d:P([32,LOS],[32,40],[96,40]),               c:CLR.pass,w:2.0,a:true},
{d:P([12,LOS],[12,56],[2,56]),                c:CLR.pass,w:1.6,a:true},
],
},
{
id:39, name:'PA_Sail', label:'PA Sail', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                      c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[98,92]),                        c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[182,44],[164,28],[148,26]),  c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,46],[148,46]),            c:CLR.pass,w:2.2,a:true},
{d:QQ([106,78],[132,82],[150,78]),            c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,28]),                       c:CLR.pass,w:1.4,a:true,dsh:true},
],
},
{
id:40, name:'PA_Leak', label:'PA Leak', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                   c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[98,92]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([172,LOS],[172,18]),                  c:CLR.pass,w:2.1,a:true}, // clear
{d:CB([118,LOS],[120,58],[140,42],[156,38]),c:CLR.pass,w:2.2,a:true}, // leak
{d:P([32,LOS],[32,56],[22,56]),            c:CLR.pass,w:1.6,a:true},
{d:P([12,LOS],[12,28]),                    c:CLR.pass,w:1.4,a:true,dsh:true},
],
},
];
