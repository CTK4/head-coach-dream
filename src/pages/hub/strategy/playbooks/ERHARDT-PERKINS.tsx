/* ═══ VERTICAL ERHARDT-PERKINS — CORE 40 ═══
   Core philosophy: concept language, option routes, vertical isolation.
   Format matches prior: { id, name, label, cat, sk, rt }
   cat: 'run' | 'pass' | 'pa' | 'situational'  (use 'situational' for screens to match your legend buckets)

   NOTE: route coloring/keys should map to your existing CLR.* in your renderer.
   - Runs use CLR.run / CLR.block / CLR.pull / CLR.toss
   - Pass uses CLR.pass / CLR.qbmove
   - PA uses CLR.pa / CLR.rpo (if you want) / CLR.qbmove
   - Screens use CLR.sit / CLR.block / CLR.protect as needed

   Assumes helpers exist: P(), QQ(), CB(), LOS constant.
*/

const EP_PLAYS = [
/* ═══ RUNS 1-10 ═══════════════════════════════════════ */
{
id:1, name:'IZ', label:'Inside Zone', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
],
rt:[
{d:P([84,84],[84,94]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([84,98],[84,88],[82,72],[82,48]),c:CLR.run,  w:2.8,a:true},
{d:P([58,LOS],[58,LOS-8]),             c:CLR.block,w:1,a:true},
{d:P([70,LOS],[70,LOS-10]),            c:CLR.block,w:1.6,a:true},
{d:P([82,LOS],[82,LOS-10]),            c:CLR.block,w:1.8,a:true},
{d:P([94,LOS],[94,LOS-10]),            c:CLR.block,w:1.8,a:true},
{d:P([106,LOS],[106,LOS-8]),           c:CLR.block,w:1,a:true},
],
},
{
id:2, name:'Duo', label:'Duo', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:84,y:98,t:'RB'},
],
rt:[
{d:P([84,84],[84,94]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([84,98],[84,88],[84,70],[84,48]),c:CLR.run,  w:2.8,a:true},
{d:P([58,LOS],[58,LOS-10]),            c:CLR.block,w:1.8,a:true},
{d:P([70,LOS],[70,LOS-10]),            c:CLR.block,w:1.8,a:true},
{d:P([82,LOS],[82,LOS-10]),            c:CLR.block,w:1.8,a:true},
{d:P([94,LOS],[94,LOS-10]),            c:CLR.block,w:1.8,a:true},
{d:P([106,LOS],[106,LOS-8]),           c:CLR.block,w:1.2,a:true},
{d:QQ([118,LOS],[110,LOS-6],[100,LOS-8]), c:CLR.block,w:1.2,a:true},
],
},
{
id:3, name:'Power_R', label:'Power', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
{x:66,y:82,t:'H'},
],
rt:[
{d:P([84,84],[84,94]),                         c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,84],[96,84],[92,70],[90,48]),       c:CLR.run,  w:2.8,a:true},
{d:CB([66,82],[78,78],[88,66],[92,52]),        c:CLR.pull, w:1.9,a:true},
{d:P([58,LOS],[70,LOS-7]),                     c:CLR.block,w:1.3,a:true},
{d:P([70,LOS],[82,LOS-7]),                     c:CLR.block,w:1.3,a:true},
{d:P([82,LOS],[82,LOS-10]),                    c:CLR.block,w:1.3,a:true},
{d:P([94,LOS],[94,LOS-7]),                     c:CLR.block,w:1.1,a:true},
{d:P([106,LOS],[106,LOS-7]),                   c:CLR.block,w:1.1,a:true},
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
{d:P([84,84],[84,94]),                    c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,84],[92,86],[78,76],[94,52]),  c:CLR.run,  w:2.8,a:true},
{d:CB([58,LOS],[66,LOS+10],[92,LOS-2],[100,LOS-7]), c:CLR.pull,w:1.8,a:true},
{d:CB([70,LOS],[76,LOS+8],[98,LOS],[106,LOS-7]),    c:CLR.pull,w:1.6,a:true},
{d:QQ([118,LOS],[112,LOS-4],[104,LOS-8]), c:CLR.block,w:1.3,a:true},
{d:P([82,LOS],[82,LOS-8]),                c:CLR.block,w:1.1,a:true},
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
{d:P([84,84],[84,92]),                    c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([100,84],[118,80],[148,66],[176,48]),c:CLR.run,w:2.8,a:true},
{d:P([58,LOS],[70,LOS-6]),                c:CLR.block,w:1.2,a:true},
{d:P([70,LOS],[82,LOS-6]),                c:CLR.block,w:1.2,a:true},
{d:P([82,LOS],[94,LOS-6]),                c:CLR.block,w:1.2,a:true},
{d:P([94,LOS],[106,LOS-6]),               c:CLR.block,w:1.2,a:true},
{d:P([106,LOS],[118,LOS-6]),              c:CLR.block,w:1.2,a:true},
{d:QQ([118,LOS],[132,LOS-8],[148,LOS-6]), c:CLR.block,w:1.2,a:true},
],
},
{
id:6, name:'Draw_Gun', label:'Draw', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:82,t:'QB'},{x:84,y:96,t:'RB'},
],
rt:[
{d:P([84,82],[84,94]),                   c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([84,96],[84,86],[86,70],[88,48]),  c:CLR.run,  w:2.8,a:true},
{d:P([70,LOS],[70,LOS-8]),               c:CLR.protect,w:1.2,a:false},
{d:P([82,LOS],[82,LOS-8]),               c:CLR.protect,w:1.2,a:false},
{d:P([94,LOS],[94,LOS-8]),               c:CLR.protect,w:1.2,a:false},
{d:P([12,LOS],[12,22]),                  c:CLR.pass,w:1,a:true,dsh:true},
{d:P([172,LOS],[172,22]),                c:CLR.pass,w:1,a:true,dsh:true},
],
},
{
id:7, name:'Lead_Weak', label:'Lead Weak', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:70,y:84,t:'RB'},
{x:96,y:84,t:'FB'},
],
rt:[
{d:P([84,84],[84,92]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([70,84],[62,84],[58,68],[56,48]), c:CLR.run,w:2.8,a:true},
{d:CB([96,84],[82,82],[68,66],[60,52]), c:CLR.block,w:1.9,a:true},
{d:P([58,LOS],[46,LOS-7]),             c:CLR.block,w:1.2,a:true},
{d:P([70,LOS],[58,LOS-7]),             c:CLR.block,w:1.2,a:true},
{d:P([82,LOS],[70,LOS-7]),             c:CLR.block,w:1.2,a:true},
{d:P([94,LOS],[82,LOS-7]),             c:CLR.block,w:1.2,a:true},
{d:P([106,LOS],[94,LOS-7]),            c:CLR.block,w:1.2,a:true},
],
},
{
id:8, name:'Toss', label:'Toss', cat:'run',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:82,t:'QB'},{x:106,y:82,t:'RB'},
],
rt:[
{d:QQ([84,82],[110,78],[140,74]),        c:CLR.toss,w:1.6,a:true,dsh:true},
{d:CB([140,74],[160,62],[176,52],[188,40]),c:CLR.run,w:2.8,a:true},
{d:P([58,LOS],[70,LOS-5]),              c:CLR.block,w:1.1,a:true},
{d:P([70,LOS],[82,LOS-5]),              c:CLR.block,w:1.1,a:true},
{d:P([82,LOS],[94,LOS-5]),              c:CLR.block,w:1.1,a:true},
{d:P([94,LOS],[106,LOS-5]),             c:CLR.block,w:1.1,a:true},
{d:QQ([118,LOS],[132,LOS-8],[150,LOS-6]),c:CLR.block,w:1.1,a:true},
],
},
{
id:9, name:'Iso', label:'Iso', cat:'run',
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
{d:QQ([118,LOS],[110,LOS-6],[100,LOS-8]), c:CLR.block,w:1.2,a:true},
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
{d:CB([84,98],[84,88],[82,72],[80,50]),  c:CLR.run,w:2.8,a:true},
{d:CB([106,LOS],[98,LOS-2],[92,LOS-6],[86,LOS-10]), c:CLR.pull,w:1.7,a:true},
{d:P([70,LOS],[70,LOS-8]),              c:CLR.block,w:1.4,a:true},
{d:P([82,LOS],[82,LOS-6]),              c:CLR.block,w:1.2,a:true},
{d:P([94,LOS],[94,LOS-6]),              c:CLR.block,w:1.2,a:true},
],
},

/* ═══ PASS 11-30 ══════════════════════════════════════ */
{
id:11, name:'Option_Choice', label:'Option (Choice)', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,102]),                  c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([32,LOS],[32,46],[40,40],[52,38]), c:CLR.pass,w:2.2,a:true},      // option stem (breaks in/out)
{d:CB([118,LOS],[118,44],[132,36],[146,34]), c:CLR.pass,w:2.2,a:true},  // seam/choice
{d:P([12,LOS],[12,22]),                  c:CLR.pass,w:1.6,a:true},      // clear
{d:P([172,LOS],[172,18]),                c:CLR.pass,w:1.8,a:true},      // vertical iso
{d:QQ([106,86],[96,84],[84,82]),         c:CLR.pass,w:1.6,a:true},      // check release
],
},
{
id:12, name:'Seam_Read', label:'Seam Read', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),            c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([118,LOS],[118,18]),          c:CLR.pass,w:2.4,a:true}, // seam read
{d:P([172,LOS],[172,18]),          c:CLR.pass,w:2.2,a:true}, // outside vertical
{d:P([32,LOS],[32,52],[44,52]),    c:CLR.pass,w:2.0,a:true}, // speed out
{d:P([12,LOS],[12,24]),            c:CLR.pass,w:1.4,a:true,dsh:true}, // clear / backside
{d:QQ([106,86],[96,84],[84,82]),   c:CLR.pass,w:1.6,a:true}, // check
],
},
{
id:13, name:'Deep_Post', label:'Deep Post', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[12,34],[26,22],[50,20]),     c:CLR.pass,w:2.5,a:true},  // deep post
{d:P([172,LOS],[172,18]),                    c:CLR.pass,w:2.2,a:true},  // clear iso
{d:P([118,LOS],[118,50],[150,50]),           c:CLR.pass,w:1.8,a:true},  // sail/bench
{d:QQ([106,86],[96,84],[84,82]),             c:CLR.pass,w:1.6,a:true},  // check
],
},
{
id:14, name:'Dagger', label:'Dagger', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                        c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([172,LOS],[172,18]),                      c:CLR.pass,w:2.3,a:true},      // clear 9
{d:P([32,LOS],[32,46],[52,34],[68,28]),        c:CLR.pass,w:2.2,a:true},      // dagger dig
{d:P([118,LOS],[118,50],[148,50]),             c:CLR.pass,w:1.8,a:true},      // intermediate out
{d:P([12,LOS],[12,24]),                        c:CLR.pass,w:1.4,a:true,dsh:true},
{d:QQ([106,86],[96,84],[84,82]),               c:CLR.pass,w:1.6,a:true},
],
},
{
id:15, name:'Divide', label:'Divide', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([32,LOS],[32,18]),                   c:CLR.pass,w:2.3,a:true}, // seam
{d:P([118,LOS],[118,18]),                 c:CLR.pass,w:2.3,a:true}, // seam
{d:P([12,LOS],[12,56],[2,56]),            c:CLR.pass,w:1.8,a:true}, // hitch/alert
{d:P([172,LOS],[172,56],[184,56]),        c:CLR.pass,w:1.8,a:true}, // hitch/alert
{d:QQ([106,86],[96,84],[84,82]),          c:CLR.pass,w:1.6,a:true},
],
},
{
id:16, name:'Smash', label:'Smash', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[8,42],[24,26],[36,24]),      c:CLR.pass,w:2.2,a:true}, // corner
{d:P([32,LOS],[32,52],[32,56]),              c:CLR.pass,w:2.2,a:true}, // hitch
{d:CB([172,LOS],[180,42],[166,26],[152,24]), c:CLR.pass,w:2.2,a:true}, // corner
{d:P([118,LOS],[118,52],[118,56]),           c:CLR.pass,w:2.2,a:true}, // hitch
{d:QQ([106,86],[96,84],[84,82]),             c:CLR.pass,w:1.6,a:true},
],
},
{
id:17, name:'Sail', label:'Sail', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,104]),                        c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[182,44],[164,28],[148,26]),   c:CLR.pass,w:2.2,a:true}, // corner
{d:P([118,LOS],[118,48],[150,48]),             c:CLR.pass,w:2.2,a:true}, // out
{d:QQ([106,86],[132,82],[150,78]),             c:CLR.pass,w:1.8,a:true}, // flat
{d:P([12,LOS],[12,28]),                        c:CLR.pass,w:1.2,a:true,dsh:true},
{d:P([32,LOS],[32,36]),                        c:CLR.pass,w:1.2,a:true,dsh:true},
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
{d:P([84,86],[84,104]),                        c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([172,LOS],[172,18]),                      c:CLR.pass,w:2.2,a:true},    // clear
{d:P([118,LOS],[118,44],[150,44]),             c:CLR.pass,w:2.2,a:true},    // out
{d:QQ([106,86],[132,82],[150,78]),             c:CLR.pass,w:1.8,a:true},    // flat
{d:CB([32,LOS],[42,54],[64,50],[86,48]),       c:CLR.pass,w:1.8,a:true},    // intermediate
{d:P([12,LOS],[12,28]),                        c:CLR.pass,w:1.1,a:true,dsh:true},
],
},
{
id:19, name:'Dig_Post', label:'Dig-Post', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                       c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[172,34],[150,22],[124,20]),  c:CLR.pass,w:2.4,a:true}, // post
{d:P([32,LOS],[32,40],[92,40]),               c:CLR.pass,w:2.2,a:true}, // dig
{d:P([118,LOS],[118,52],[118,56]),            c:CLR.pass,w:1.8,a:true}, // sit
{d:P([12,LOS],[12,28]),                       c:CLR.pass,w:1.2,a:true,dsh:true},
{d:QQ([106,86],[96,84],[84,82]),              c:CLR.pass,w:1.6,a:true},
],
},
{
id:20, name:'Cross_Country', label:'Cross Country', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                      c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[12,30],[70,28],[128,26]),    c:CLR.pass,w:2.3,a:true}, // deep over
{d:CB([172,LOS],[172,40],[112,40],[64,42]),  c:CLR.pass,w:2.3,a:true}, // counter over
{d:P([118,LOS],[118,24]),                    c:CLR.pass,w:1.7,a:true}, // checkdown
{d:P([32,LOS],[32,52],[44,52]),              c:CLR.pass,w:1.8,a:true}, // out
{d:QQ([106,86],[96,84],[84,82]),             c:CLR.pass,w:1.6,a:true},
],
},
{
id:21, name:'Drive', label:'Drive', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,102]),                    c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([32,LOS],[52,44],[88,44],[108,46]),  c:CLR.pass,w:2.2,a:true}, // shallow
{d:P([12,LOS],[12,18]),                    c:CLR.pass,w:2.0,a:true}, // clear
{d:P([118,LOS],[118,50],[148,50]),         c:CLR.pass,w:2.0,a:true}, // dig/set
{d:P([172,LOS],[172,56],[184,56]),         c:CLR.pass,w:1.8,a:true}, // hitch
{d:QQ([106,86],[96,84],[84,82]),           c:CLR.pass,w:1.6,a:true},
],
},
{
id:22, name:'Levels', label:'Levels', cat:'pass',
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
{d:QQ([106,86],[96,84],[84,82]),           c:CLR.pass,w:1.6,a:true},
],
},
{
id:23, name:'Four_Verts', label:'4 Verts', cat:'pass',
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
id:24, name:'Comeback', label:'Comeback', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                  c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,34],[6,34]),           c:CLR.pass,w:2.2,a:true},   // comeback
{d:P([172,LOS],[172,34],[180,34]),       c:CLR.pass,w:2.2,a:true},   // comeback
{d:P([32,LOS],[32,52],[32,56]),          c:CLR.pass,w:1.8,a:true},
{d:P([118,LOS],[118,52],[118,56]),       c:CLR.pass,w:1.8,a:true},
{d:QQ([106,86],[96,84],[84,82]),         c:CLR.pass,w:1.6,a:true},
],
},
{
id:25, name:'Double_In', label:'Double In', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,38],[82,38]),         c:CLR.pass,w:2.2,a:true},
{d:P([172,LOS],[172,38],[102,38]),      c:CLR.pass,w:2.2,a:true},
{d:P([32,LOS],[32,56],[40,56]),         c:CLR.pass,w:1.8,a:true},
{d:P([118,LOS],[118,56],[110,56]),      c:CLR.pass,w:1.8,a:true},
{d:QQ([106,86],[96,84],[84,82]),        c:CLR.pass,w:1.6,a:true},
],
},
{
id:26, name:'Wheel_Seam', label:'Wheel Seam', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([106,86],[124,82],[140,64],[156,28]), c:CLR.pass,w:2.2,a:true}, // wheel
{d:P([118,LOS],[118,18]),               c:CLR.pass,w:2.2,a:true},     // seam
{d:P([12,LOS],[12,18]),                 c:CLR.pass,w:1.8,a:true},     // clear
{d:P([172,LOS],[172,56],[184,56]),      c:CLR.pass,w:1.8,a:true},     // hitch
{d:P([32,LOS],[32,52],[44,52]),         c:CLR.pass,w:1.8,a:true},     // out
],
},
{
id:27, name:'Slot_Fade', label:'Slot Fade', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:34,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:152,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:98,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,106]),               c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([34,LOS],[34,22],[46,18]),       c:CLR.pass,w:2.3,a:true}, // slot fade
{d:P([12,LOS],[12,56],[2,56]),        c:CLR.pass,w:1.8,a:true}, // hitch
{d:P([118,LOS],[118,24]),             c:CLR.pass,w:1.8,a:true}, // seam check
{d:P([152,LOS],[152,18]),             c:CLR.pass,w:2.2,a:true}, // clear
{d:QQ([98,86],[110,84],[120,82]),     c:CLR.pass,w:1.8,a:true},
],
},
{
id:28, name:'China_InOut', label:'China (In-Out)', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,102]),                       c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([32,LOS],[32,50],[44,50]),               c:CLR.pass,w:2.1,a:true}, // out
{d:P([118,LOS],[118,44],[92,44]),             c:CLR.pass,w:2.1,a:true}, // in
{d:P([12,LOS],[12,18]),                       c:CLR.pass,w:1.8,a:true}, // clear
{d:P([172,LOS],[172,56],[184,56]),            c:CLR.pass,w:1.8,a:true}, // hitch
{d:QQ([106,86],[96,84],[84,82]),              c:CLR.pass,w:1.6,a:true},
],
},
{
id:29, name:'Stick_Nod', label:'Stick Nod', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
],
rt:[
{d:P([84,84],[84,100]),                       c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([118,LOS],[118,52],[118,46],[128,34]),   c:CLR.pass,w:2.2,a:true}, // stick nod
{d:P([32,LOS],[32,52],[32,56]),               c:CLR.pass,w:2.0,a:true}, // stick/out
{d:P([172,LOS],[172,18]),                     c:CLR.pass,w:2.2,a:true}, // clear
{d:P([12,LOS],[12,56],[2,56]),                c:CLR.pass,w:1.8,a:true}, // hitch
{d:QQ([106,84],[96,82],[84,80]),              c:CLR.pass,w:1.6,a:true},
],
},
{
id:30, name:'All_Hitches', label:'All Hitches', cat:'pass',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:84,t:'QB'},{x:106,y:84,t:'RB'},
],
rt:[
{d:P([84,84],[84,98]),                 c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([12,LOS],[12,56],[6,56]),         c:CLR.pass,w:2.2,a:true},
{d:P([32,LOS],[32,56],[26,56]),        c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,56],[124,56]),     c:CLR.pass,w:2.2,a:true},
{d:P([172,LOS],[172,56],[178,56]),     c:CLR.pass,w:2.2,a:true},
{d:QQ([106,84],[96,82],[84,80]),       c:CLR.pass,w:1.6,a:true},
],
},

/* ═══ PLAY-ACTION 31-35 ═══════════════════════════════ */
{
id:31, name:'PA_Cross', label:'PA Cross', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                 c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[84,92]),                   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([172,LOS],[148,52],[90,52],[52,54]), c:CLR.pass,w:2.2,a:true}, // deep cross
{d:P([118,LOS],[118,28]),                c:CLR.pass,w:1.8,a:true},
{d:P([32,LOS],[32,52],[44,52]),          c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,18]),                  c:CLR.pass,w:1.6,a:true},
],
},
{
id:32, name:'PA_Post', label:'PA Post', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                 c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[84,92]),                   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:CB([12,LOS],[12,34],[26,22],[50,20]), c:CLR.pass,w:2.5,a:true}, // post
{d:P([172,LOS],[172,18]),                c:CLR.pass,w:2.2,a:true},
{d:P([118,LOS],[118,50],[150,50]),       c:CLR.pass,w:1.8,a:true},
],
},
{
id:33, name:'PA_Divide', label:'PA Divide', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:98,y:78,t:'RB'},
],
rt:[
{d:P([98,78],[110,70],[118,52]),         c:CLR.run,w:2,a:true,dsh:true},
{d:P([84,78],[84,92]),                   c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([32,LOS],[32,18]),                  c:CLR.pass,w:2.3,a:true},
{d:P([118,LOS],[118,18]),                c:CLR.pass,w:2.3,a:true},
{d:P([172,LOS],[172,56],[184,56]),       c:CLR.pass,w:1.8,a:true},
{d:P([12,LOS],[12,56],[2,56]),           c:CLR.pass,w:1.8,a:true},
],
},
{
id:34, name:'PA_Shot', label:'PA Shot', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                   c:CLR.pa,w:1.5,a:true,dsh:true},
{d:P([84,78],[84,92]),                     c:CLR.qbmove,w:1.2,a:true,dsh:true},
{d:P([172,LOS],[172,18]),                  c:CLR.pass,w:2.5,a:true}, // go ball
{d:CB([12,LOS],[12,30],[40,20],[68,18]),   c:CLR.pass,w:2.3,a:true}, // post-ish
{d:P([118,LOS],[118,30]),                  c:CLR.pass,w:1.8,a:true},
],
},
{
id:35, name:'PA_Leak', label:'PA Leak', cat:'pa',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:78,t:'QB'},{x:106,y:78,t:'RB'},
],
rt:[
{d:P([106,78],[126,74]),                 c:CLR.pa,w:1.5,a:true,dsh:true},
{d:CB([84,78],[106,80],[124,80],[136,78]),c:CLR.qbmove,w:1.6,a:true},
{d:CB([118,LOS],[132,58],[148,42],[156,38]),c:CLR.pass,w:2.2,a:true}, // leak
{d:P([172,LOS],[172,18]),                c:CLR.pass,w:2.0,a:true},
{d:P([32,LOS],[32,52],[44,52]),          c:CLR.pass,w:1.6,a:true,dsh:true},
{d:P([12,LOS],[12,28]),                  c:CLR.pass,w:1.4,a:true,dsh:true},
],
},

/* ═══ SCREENS 36-40 ═══════════════════════════════════ */
{
id:36, name:'RB_Screen', label:'RB Screen', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,100]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,86],[136,86],[156,80],[162,76]),c:CLR.sit,w:2,a:true},
{d:CB([84,100],[128,98],[152,86],[162,76]),c:CLR.sit,w:1.8,a:true,dsh:true},
{d:QQ([94,LOS],[102,74],[118,68]),      c:CLR.block,w:1,a:true},
{d:QQ([106,LOS],[116,72],[132,66]),     c:CLR.block,w:1,a:true},
{d:P([172,LOS],[172,26]),               c:CLR.pass,w:1,a:true,dsh:true},
],
},
{
id:37, name:'Slow_Screen', label:'Slow Screen', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,102]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([106,86],[120,88],[132,92],[140,96]),c:CLR.sit,w:2,a:true},
{d:CB([84,102],[112,100],[128,98],[140,96]),c:CLR.sit,w:1.8,a:true,dsh:true},
{d:P([118,LOS],[118,72]),               c:CLR.block,w:1.2,a:false},
{d:P([12,LOS],[12,22]),                 c:CLR.pass,w:1,a:true,dsh:true},
{d:P([172,LOS],[172,22]),               c:CLR.pass,w:1,a:true,dsh:true},
],
},
{
id:38, name:'Tunnel', label:'Tunnel', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,92]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([32,LOS],[36,72],[40,78],[42,82]),c:CLR.sit,w:2,a:true},
{d:CB([84,92],[62,88],[52,84],[42,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
{d:CB([118,LOS],[102,68],[78,66],[58,66]),c:CLR.block,w:1.5,a:true},
{d:P([172,LOS],[172,26]),              c:CLR.pass,w:1,a:true,dsh:true},
],
},
{
id:39, name:'Jailbreak', label:'Jailbreak', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,92]),                 c:CLR.qbmove,w:1.4,a:true,dsh:true},
{d:CB([12,LOS],[22,70],[30,80],[36,86]), c:CLR.sit,w:2,a:true},
{d:CB([84,92],[60,90],[46,88],[36,86]),  c:CLR.sit,w:1.8,a:true,dsh:true},
{d:P([118,LOS],[132,70]),              c:CLR.block,w:1.4,a:true},
{d:P([106,86],[116,80],[126,74]),      c:CLR.block,w:1.4,a:true},
],
},
{
id:40, name:'TE_Screen', label:'TE Screen', cat:'situational',
sk:[
{x:12,y:LOS,t:'WR'},{x:32,y:LOS,t:'WR'},
{x:118,y:LOS,t:'TE'},{x:172,y:LOS,t:'WR'},
{x:84,y:86,t:'QB'},{x:106,y:86,t:'RB'},
],
rt:[
{d:P([84,86],[84,98]),                 c:CLR.qbmove,w:1.5,a:true,dsh:true},
{d:CB([118,LOS],[132,78],[132,90],[130,94]), c:CLR.sit,w:2,a:true},
{d:CB([84,98],[108,94],[124,94],[130,94]),  c:CLR.sit,w:1.8,a:true,dsh:true},
{d:QQ([94,LOS],[100,74],[112,70]),     c:CLR.block,w:1,a:true},
{d:QQ([106,LOS],[114,72],[126,68]),    c:CLR.block,w:1,a:true},
{d:P([12,LOS],[12,26]),                c:CLR.pass,w:1,a:true,dsh:true},
{d:P([172,LOS],[172,26]),              c:CLR.pass,w:1,a:true,dsh:true},
],
},
];
