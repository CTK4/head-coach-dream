/* ════════════════════════════════════════════════════════════════════════
   POWER SPREAD — OFFENSE CORE 40 (UI DATA)

   Identity
   - Spread 10/11p, downhill power from gun
   - QB run threat integrated (read/Bash/Draw)
   - RPO layer attached to core runs (glance/bubble/hitch/stick/pop/now)
   - Vertical shots complement run gravity
   - Run-leaning ~60/40 (counting RPO decisions)

   Categories mapped to your UI:
     run   => core runs (incl. QB runs/reads)
     rpo   => attached RPO calls
     pass  => dropback concepts
     pa    => play-action shots
     screen=> screens

   Position Tokens (offense):
     OL => "OL"
     QB => "QB"   (use "TE" if your UI only supports OL/FB/TE/WR)
     RB => "FB"   (backfield)
     TE/H => "TE"
     WR => "WR"

   NOTE: Routes/paths are schematic and intentionally simplified.
   ════════════════════════════════════════════════════════════════════════ */

export const OFF_POWER_SPREAD_CORE40 = [
/* ═══ I. CORE RUN GAME (1-15) ══════════════════════════════════════════ */
/* 1 */ { id:1,  name:"IZ_Gun",            label:"Inside Zone (Gun)",                     cat:"run",
  sk:[ {x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:100,y:LOS,t:"OL"},{x:108,y:LOS,t:"OL"},{x:122,y:LOS,t:"OL"},
       {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},
       {x:40,y:84,t:"WR"},{x:60,y:66,t:"WR"},{x:140,y:66,t:"WR"},{x:160,y:84,t:"WR"} ],
  rt:[ {d:P([112,92],[102,82],[100,70],[100,58],[100,46]), c:CLR.run,w:2.6,a:true},
       {d:P([100,82],[100,74]), c:CLR.run,w:1.8,a:true,dsh:true} ] },

/* 2 */ { id:2,  name:"SplitZone_Slice",  label:"Split Zone (H-back slice)",             cat:"run",
  sk:[ {x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:100,y:LOS,t:"OL"},{x:108,y:LOS,t:"OL"},{x:122,y:LOS,t:"OL"},
       {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:84,y:86,t:"TE"} ],
  rt:[ {d:P([112,92],[102,82],[100,70],[100,56]), c:CLR.run,w:2.6,a:true},
       {d:P([84,86],[96,78],[108,70],[120,62]), c:CLR.run,w:2.2,a:true,dsh:true} ] },

/* 3 */ { id:3,  name:"Duo_Gun",          label:"Duo (Double teams vertical)",           cat:"run",
  sk:[ {x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:100,y:LOS,t:"OL"},{x:108,y:LOS,t:"OL"},{x:122,y:LOS,t:"OL"},
       {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"} ],
  rt:[ {d:P([112,92],[106,82],[104,72],[104,60],[104,48]), c:CLR.run,w:2.7,a:true} ] },

/* 4 */ { id:4,  name:"Power_Gun_Gpull",  label:"Power (Backside guard pull)",           cat:"run",
  sk:[ {x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:100,y:LOS,t:"OL"},{x:108,y:LOS,t:"OL"},{x:122,y:LOS,t:"OL"},
       {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"} ],
  rt:[ {d:P([112,92],[106,84],[102,76],[96,66],[90,58],[84,50]), c:CLR.run,w:2.7,a:true},
       {d:P([108,LOS],[100,LOS-6],[92,LOS-10]), c:CLR.run,w:2.0,a:true,dsh:true} ] },

/* 5 */ { id:5,  name:"Counter_GT",       label:"Counter (GT pull)",                     cat:"run",
  sk:[ {x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:100,y:LOS,t:"OL"},{x:108,y:LOS,t:"OL"},{x:122,y:LOS,t:"OL"},
       {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"} ],
  rt:[ {d:P([112,92],[110,86],[108,78],[100,66],[92,58],[84,50]), c:CLR.run,w:2.7,a:true},
       {d:P([122,LOS],[114,LOS-6],[106,LOS-10]), c:CLR.run,w:2.0,a:true,dsh:true} ] },

/* 6 */ { id:6,  name:"Counter_Bash",     label:"Counter Bash (QB keep backside)",       cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:84,y:86,t:"TE"} ],
  rt:[ {d:P([112,92],[110,86],[108,78],[100,66],[92,58]), c:CLR.run,w:2.3,a:true,dsh:true}, // RB counter action
       {d:P([100,82],[106,78],[114,72],[124,62],[134,52]), c:CLR.run,w:2.8,a:true} ] },     // QB keep

/* 7 */ { id:7,  name:"PowerRead",        label:"Power Read (DE read)",                  cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:60,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[106,86],[98,78],[90,70],[84,60]), c:CLR.run,w:2.5,a:true,dsh:true}, // RB sweep track
       {d:P([100,82],[100,74],[98,66],[96,58]), c:CLR.run,w:2.6,a:true} ] },                // QB downhill

/* 8 */ { id:8,  name:"ZoneRead_Weak",    label:"Zone Read (Weak DE read)",              cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"} ],
  rt:[ {d:P([112,92],[102,82],[100,70],[100,58]), c:CLR.run,w:2.6,a:true,dsh:true}, // RB give
       {d:P([100,82],[108,76],[118,68],[128,58]), c:CLR.run,w:2.6,a:true} ] },       // QB pull

/* 9 */ { id:9,  name:"QB_Draw_Spread",   label:"QB Draw (Spread set)",                  cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:40,y:84,t:"WR"},{x:160,y:84,t:"WR"} ],
  rt:[ {d:P([100,82],[100,74],[100,62],[100,50]), c:CLR.run,w:2.8,a:true},
       {d:P([112,92],[120,92]), c:CLR.run,w:1.6,a:true,dsh:true} ] },

/* 10 */{ id:10, name:"PinPull_Sweep",    label:"Pin-Pull Sweep",                         cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:84,y:86,t:"TE"} ],
  rt:[ {d:P([112,92],[106,88],[98,84],[90,78],[80,70],[70,62]), c:CLR.run,w:2.7,a:true},
       {d:P([84,86],[72,78],[62,70],[54,62]), c:CLR.run,w:2.1,a:true,dsh:true} ] },

/* 11 */{ id:11, name:"JetSweep_Orbit",   label:"Jet Sweep (Orbit motion)",              cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:60,y:66,t:"WR"} ],
  rt:[ {d:P([60,66],[70,74],[82,80],[96,84],[112,86]), c:CLR.run,w:2.6,a:true},
       {d:P([100,82],[104,80],[108,78]), c:CLR.run,w:1.6,a:true,dsh:true} ] },

/* 12 */{ id:12, name:"Trap_Gun",         label:"Trap (Quick-hitting interior)",         cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"} ],
  rt:[ {d:P([112,92],[106,84],[104,76],[104,66],[104,56]), c:CLR.run,w:2.7,a:true} ] },

/* 13 */{ id:13, name:"Stretch_Gun",      label:"Stretch (Wide zone variant)",           cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:84,y:86,t:"TE"} ],
  rt:[ {d:P([112,92],[106,90],[98,86],[88,80],[76,72],[66,64]), c:CLR.run,w:2.7,a:true},
       {d:P([84,86],[72,80],[62,72]), c:CLR.run,w:2.0,a:true,dsh:true} ] },

/* 14 */{ id:14, name:"LeadDraw",         label:"Lead Draw (RB delay downhill)",         cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:84,y:86,t:"TE"} ],
  rt:[ {d:P([112,92],[112,92],[110,84],[108,74],[106,62],[104,50]), c:CLR.run,w:2.7,a:true}, // delay then downhill
       {d:P([84,86],[92,80],[100,72],[104,64]), c:CLR.run,w:2.0,a:true,dsh:true} ] },

/* 15 */{ id:15, name:"SweepRead_Orbit",  label:"Sweep Read (Slot orbit + QB option)",   cat:"run",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:60,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[106,88],[98,84],[90,78],[80,70]), c:CLR.run,w:2.4,a:true,dsh:true}, // RB sweep action
       {d:P([100,82],[106,80],[114,76],[124,68],[136,58]), c:CLR.run,w:2.7,a:true} ] },     // QB option keep

/* ═══ II. RPO LAYER (16-25) ════════════════════════════════════════════ */
/* 16 */{ id:16, name:"RPO_IZ_Glance",     label:"IZ Glance (Slant read off LB)",         cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:160,y:84,t:"WR"},{x:140,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[102,82],[100,70],[100,58]), c:CLR.run,w:2.2,a:true,dsh:true},      // run mesh
       {d:P([140,66],[150,58],[160,50]), c:CLR.pass,w:2.2,a:true},                      // glance/slant
       {d:P([160,84],[168,78],[176,72]), c:CLR.pass,w:1.6,a:true,dsh:true} ] },         // clear/hold

/* 17 */{ id:17, name:"RPO_IZ_Bubble",    label:"IZ Bubble (Overhang conflict)",         cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:60,y:66,t:"WR"},{x:40,y:84,t:"WR"} ],
  rt:[ {d:P([112,92],[102,82],[100,70],[100,58]), c:CLR.run,w:2.2,a:true,dsh:true},
       {d:P([40,84],[52,84],[64,84]), c:CLR.pass,w:2.3,a:true},                         // bubble
       {d:P([60,66],[56,72],[52,78]), c:CLR.pass,w:1.6,a:true,dsh:true} ] },            // block/hold

/* 18 */{ id:18, name:"RPO_Duo_Hitch",    label:"Duo Hitch (Hook defender read)",        cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:140,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[106,82],[104,72],[104,60]), c:CLR.run,w:2.2,a:true,dsh:true},
       {d:P([140,66],[144,60],[148,60],[152,62]), c:CLR.pass,w:2.1,a:true} ] },         // hitch

/* 19 */{ id:19, name:"RPO_Power_Slant",  label:"Power Slant (Backside glance)",         cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:40,y:84,t:"WR"} ],
  rt:[ {d:P([112,92],[106,84],[102,76],[96,66],[90,58]), c:CLR.run,w:2.2,a:true,dsh:true}, // power mesh
       {d:P([40,84],[52,74],[64,66]), c:CLR.pass,w:2.3,a:true} ] },                        // backside slant

/* 20 */{ id:20, name:"RPO_Counter_Stick",label:"Counter Stick (Flat defender read)",     cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:140,y:66,t:"WR"},{x:122,y:74,t:"TE"} ],
  rt:[ {d:P([112,92],[110,86],[108,78],[100,66],[92,58]), c:CLR.run,w:2.1,a:true,dsh:true},
       {d:P([122,74],[132,66],[142,66]), c:CLR.pass,w:2.2,a:true},                      // stick
       {d:P([140,66],[150,66],[160,66]), c:CLR.pass,w:1.8,a:true,dsh:true} ] },         // spacing

/* 21 */{ id:21, name:"RPO_Bash_Bubble",  label:"Bash Bubble",                            cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:40,y:84,t:"WR"},{x:60,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[110,86],[108,78],[100,66],[92,58]), c:CLR.run,w:2.1,a:true,dsh:true}, // bash action
       {d:P([40,84],[52,84],[64,84]), c:CLR.pass,w:2.3,a:true} ] },                         // bubble

/* 22 */{ id:22, name:"RPO_Sweep_Out",    label:"Sweep Out RPO",                          cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:140,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[106,88],[98,84],[90,78],[80,70]), c:CLR.run,w:2.0,a:true,dsh:true}, // sweep action
       {d:P([140,66],[154,66],[168,66]), c:CLR.pass,w:2.2,a:true} ] },                      // quick out

/* 23 */{ id:23, name:"RPO_Trap_Seam",    label:"Trap Seam RPO",                          cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:122,y:74,t:"TE"} ],
  rt:[ {d:P([112,92],[106,84],[104,76],[104,66]), c:CLR.run,w:2.1,a:true,dsh:true},       // trap mesh
       {d:P([122,74],[122,56],[122,40],[122,24]), c:CLR.pass,w:2.4,a:true} ] },           // seam

/* 24 */{ id:24, name:"RPO_SplitZone_Pop",label:"Split Zone Pop Pass (TE seam)",         cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:84,y:86,t:"TE"} ],
  rt:[ {d:P([112,92],[102,82],[100,70],[100,58]), c:CLR.run,w:2.1,a:true,dsh:true},
       {d:P([84,86],[92,78],[100,64],[108,48],[116,32]), c:CLR.pass,w:2.4,a:true} ] },

/* 25 */{ id:25, name:"RPO_ZoneRead_Now", label:"Zone Read Now Screen",                    cat:"rpo",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:40,y:84,t:"WR"},{x:60,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[102,82],[100,70],[100,58]), c:CLR.run,w:2.0,a:true,dsh:true},
       {d:P([40,84],[52,84],[64,84]), c:CLR.pass,w:2.5,a:true} ] },

/* ═══ III. DROPBACK PASS (26-33) ═══════════════════════════════════════ */
/* 26 */{ id:26, name:"Verts_Spread",     label:"4 Verts (Spread)",                        cat:"pass",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:40,y:84,t:"WR"},{x:60,y:66,t:"WR"},{x:140,y:66,t:"WR"},{x:160,y:84,t:"WR"} ],
  rt:[ {d:P([40,84],[36,62],[34,40],[32,20]), c:CLR.pass,w:2.4,a:true},
       {d:P([60,66],[58,48],[56,30],[54,18]), c:CLR.pass,w:2.4,a:true},
       {d:P([140,66],[142,48],[144,30],[146,18]), c:CLR.pass,w:2.4,a:true},
       {d:P([160,84],[164,62],[166,40],[168,20]), c:CLR.pass,w:2.4,a:true},
       {d:P([112,92],[118,80],[126,74]), c:CLR.pass,w:1.5,a:true,dsh:true} ] },

/* 27 */{ id:27, name:"Dagger",          label:"Dagger (Dig + Clear)",                    cat:"pass",
  sk:[ {x:100,y:82,t:"QB"},{x:60,y:66,t:"WR"},{x:140,y:66,t:"WR"},{x:160,y:84,t:"WR"} ],
  rt:[ {d:P([160,84],[166,62],[170,40],[172,22]), c:CLR.pass,w:2.4,a:true},              // clear go
       {d:P([140,66],[140,54],[136,48],[120,44]), c:CLR.pass,w:2.4,a:true},              // dig
       {d:P([60,66],[64,54],[72,48],[86,44]), c:CLR.pass,w:2.0,a:true,dsh:true} ] },     // dagger in

/* 28 */{ id:28, name:"Mesh",            label:"Mesh (Shallow cross)",                    cat:"pass",
  sk:[ {x:100,y:82,t:"QB"},{x:60,y:66,t:"WR"},{x:140,y:66,t:"WR"},{x:122,y:74,t:"TE"} ],
  rt:[ {d:P([60,66],[80,60],[100,58],[120,56]), c:CLR.pass,w:2.3,a:true},
       {d:P([140,66],[120,60],[100,58],[80,56]), c:CLR.pass,w:2.3,a:true},
       {d:P([122,74],[122,62],[122,52]), c:CLR.pass,w:2.0,a:true,dsh:true} ] },

/* 29 */{ id:29, name:"Drive",           label:"Drive (Shallow + Dig)",                   cat:"pass",
  sk:[ {x:100,y:82,t:"QB"},{x:60,y:66,t:"WR"},{x:140,y:66,t:"WR"} ],
  rt:[ {d:P([60,66],[84,60],[108,58]), c:CLR.pass,w:2.2,a:true},                          // shallow
       {d:P([140,66],[140,54],[136,48],[118,44]), c:CLR.pass,w:2.4,a:true} ] },           // dig

/* 30 */{ id:30, name:"Levels",          label:"Levels (Hi/Low middle)",                  cat:"pass",
  sk:[ {x:100,y:82,t:"QB"},{x:60,y:66,t:"WR"},{x:140,y:66,t:"WR"},{x:122,y:74,t:"TE"} ],
  rt:[ {d:P([60,66],[84,60],[108,58]), c:CLR.pass,w:2.1,a:true},                          // low in
       {d:P([122,74],[122,56],[122,40],[122,30]), c:CLR.pass,w:2.3,a:true},               // mid
       {d:P([140,66],[136,54],[128,44],[116,36]), c:CLR.pass,w:2.2,a:true,dsh:true} ] },  // high cross

/* 31 */{ id:31, name:"Smash",           label:"Smash (Corner-flat)",                      cat:"pass",
  sk:[ {x:100,y:82,t:"QB"},{x:60,y:66,t:"WR"},{x:40,y:84,t:"WR"} ],
  rt:[ {d:P([60,66],[60,54],[54,44],[46,36]), c:CLR.pass,w:2.2,a:true},                   // corner
       {d:P([40,84],[46,82],[56,82]), c:CLR.pass,w:2.0,a:true,dsh:true} ] },              // flat

/* 32 */{ id:32, name:"Flood",           label:"Flood (3-level stretch)",                 cat:"pass",
  sk:[ {x:100,y:82,t:"QB"},{x:140,y:66,t:"WR"},{x:160,y:84,t:"WR"},{x:122,y:74,t:"TE"} ],
  rt:[ {d:P([160,84],[166,70],[172,54],[176,40]), c:CLR.pass,w:2.2,a:true},               // go/clear
       {d:P([140,66],[156,58],[170,52]), c:CLR.pass,w:2.1,a:true},                        // deep out
       {d:P([122,74],[136,72],[150,70]), c:CLR.pass,w:1.9,a:true,dsh:true} ] },           // flat

/* 33 */{ id:33, name:"DeepOver",        label:"Deep Over (Cross-country)",               cat:"pass",
  sk:[ {x:100,y:82,t:"QB"},{x:60,y:66,t:"WR"},{x:160,y:84,t:"WR"} ],
  rt:[ {d:P([60,66],[76,60],[94,54],[112,48],[130,42],[148,36]), c:CLR.pass,w:2.4,a:true},
       {d:P([160,84],[166,62],[170,40],[172,22]), c:CLR.pass,w:2.3,a:true} ] },

/* ═══ IV. PLAY-ACTION SHOT PACKAGE (34-37) ═════════════════════════════ */
/* 34 */{ id:34, name:"PA_Post_Power",    label:"PA Post (Off Power)",                     cat:"pa",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:160,y:84,t:"WR"} ],
  rt:[ {d:P([112,92],[106,86],[102,78],[96,66]), c:CLR.pa,w:2.1,a:true,dsh:true},         // power action
       {d:P([160,84],[150,70],[138,56],[126,44],[114,32]), c:CLR.pass,w:2.5,a:true} ] },  // post

/* 35 */{ id:35, name:"PA_Yankee",        label:"PA Yankee (Post + Deep Over)",           cat:"pa",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:160,y:84,t:"WR"},{x:60,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[106,86],[102,78],[96,66]), c:CLR.pa,w:2.1,a:true,dsh:true},
       {d:P([160,84],[150,70],[138,56],[126,44],[114,32]), c:CLR.pass,w:2.5,a:true},      // post
       {d:P([60,66],[76,60],[94,54],[112,48],[130,42],[148,36]), c:CLR.pass,w:2.4,a:true} ] }, // over

/* 36 */{ id:36, name:"PA_Wheel_Counter", label:"PA Wheel (RB wheel off counter)",        cat:"pa",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:140,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[110,86],[108,78],[100,66]), c:CLR.pa,w:2.1,a:true,dsh:true},        // counter action
       {d:P([112,92],[120,82],[132,70],[148,56],[164,40]), c:CLR.pass,w:2.4,a:true},      // wheel
       {d:P([140,66],[140,54],[136,48],[118,44]), c:CLR.pass,w:2.2,a:true,dsh:true} ] },  // dig

/* 37 */{ id:37, name:"PA_SwitchVert_Motion", label:"PA Switch Vert (Motion-based shot)", cat:"pa",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:60,y:66,t:"WR"},{x:140,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[102,82],[100,70]), c:CLR.pa,w:2.1,a:true,dsh:true},
       {d:P([60,66],[62,48],[64,30],[66,18]), c:CLR.pass,w:2.5,a:true},                   // vert
       {d:P([140,66],[138,48],[136,30],[134,18]), c:CLR.pass,w:2.5,a:true} ] },           // vert (switch implied)

/* ═══ V. SCREEN GAME (38-40) ═══════════════════════════════════════════ */
/* 38 */{ id:38, name:"RB_Slip",          label:"RB Slip Screen",                           cat:"screen",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"},{x:108,y:LOS,t:"OL"} ],
  rt:[ {d:P([112,92],[110,86],[108,80],[106,74]), c:CLR.pass,w:2.2,a:true},
       {d:P([92,LOS],[84,64],[76,54],[70,46]), c:CLR.pass,w:1.8,a:true,dsh:true} ] },

/* 39 */{ id:39, name:"WR_Tunnel",        label:"WR Tunnel Screen",                        cat:"screen",
  sk:[ {x:100,y:82,t:"QB"},{x:60,y:66,t:"WR"},{x:78,y:LOS,t:"OL"},{x:92,y:LOS,t:"OL"} ],
  rt:[ {d:P([60,66],[62,72],[68,74],[76,74],[84,74]), c:CLR.pass,w:2.3,a:true},
       {d:P([92,LOS],[84,66],[76,56]), c:CLR.pass,w:1.8,a:true,dsh:true} ] },

/* 40 */{ id:40, name:"Swing_Trips",      label:"Swing Screen (Trips side)",              cat:"screen",
  sk:[ {x:100,y:82,t:"QB"},{x:112,y:92,t:"FB"},{x:160,y:84,t:"WR"},{x:140,y:66,t:"WR"} ],
  rt:[ {d:P([112,92],[126,90],[140,88],[154,86]), c:CLR.pass,w:2.3,a:true},
       {d:P([160,84],[166,82],[172,80]), c:CLR.pass,w:1.6,a:true,dsh:true},
       {d:P([140,66],[146,70],[152,74]), c:CLR.pass,w:1.6,a:true,dsh:true} ] },
];
