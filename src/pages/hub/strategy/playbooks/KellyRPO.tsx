/* ═══ CHIP KELLY RPO OFFENSE — CORE 40 ═════════════════════════════════════
   Identity: Tempo, inside zone base, bubble/glance tags, fast conflict reads.
   Category counts: Runs 15 · RPO 15 · Pass 5 · Screens 5

   Uses your existing helpers:
   - CLR, CAT_META, P/QQ/CB, LOS, OL_X
   - sk[] (skill players) and rt[] (routes/paths)

   Formation assumptions:
   - Mostly 11p (3WR/1TE/1RB) gun, with occasional H/TE sniffer.
   - RPOs use CLR.rpo (read) + CLR.run (run path) + CLR.pass (quick route).

   ═════════════════════════════════════════════════════════════════════════ */

export const CHIP_KELLY_RPO_CORE40 = [
/* ═══ RUNS 1-15 ═══════════════════════════════════════ */
{
  id:1, name:"IZ_Base", label:"Inside Zone", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:84,y:98,t:"RB"},
  ],
  rt:[
    {d:CB([84,98],[84,86],[82,72],[80,52]), c:CLR.run, w:2.8,a:true},
    {d:P([58,LOS],[58,LOS-8]), c:CLR.block,w:1.4,a:true},
    {d:P([70,LOS],[70,LOS-10]),c:CLR.block,w:1.6,a:true},
    {d:P([82,LOS],[82,LOS-10]),c:CLR.block,w:1.6,a:true},
    {d:P([94,LOS],[94,LOS-10]),c:CLR.block,w:1.6,a:true},
    {d:P([106,LOS],[106,LOS-8]),c:CLR.block,w:1.4,a:true},
  ],
},
{
  id:2, name:"SplitZone", label:"Split Zone", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:84,y:98,t:"RB"},
    {x:132,y:80,t:"H"},
  ],
  rt:[
    {d:CB([84,98],[84,86],[82,72],[80,52]), c:CLR.run, w:2.8,a:true},
    {d:CB([132,80],[108,78],[90,74],[76,LOS+2]), c:CLR.pull,w:1.8,a:true},
    {d:P([70,LOS],[70,LOS-10]),c:CLR.block,w:1.6,a:true},
    {d:P([82,LOS],[82,LOS-10]),c:CLR.block,w:1.6,a:true},
    {d:P([94,LOS],[94,LOS-10]),c:CLR.block,w:1.6,a:true},
  ],
},
{
  id:3, name:"OZ_Left", label:"Outside Zone Left", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([106,84],[82,80],[50,68],[18,46]), c:CLR.run,w:2.8,a:true},
    {d:P([58,LOS],[46,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([70,LOS],[58,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([82,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([94,LOS],[82,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([106,LOS],[94,LOS-5]),c:CLR.block,w:1,a:true},
  ],
},
{
  id:4, name:"Duo", label:"Duo", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:84,y:100,t:"RB"},
  ],
  rt:[
    {d:CB([84,100],[84,88],[84,72],[84,52]), c:CLR.run,w:2.8,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([82,LOS],[82,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([94,LOS],[94,LOS-10]), c:CLR.block,w:1.8,a:true},
    {d:P([58,LOS],[58,LOS-7]),  c:CLR.block,w:1,a:true},
    {d:P([106,LOS],[106,LOS-7]),c:CLR.block,w:1,a:true},
  ],
},
{
  id:5, name:"Counter", label:"Counter", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
    {x:56,y:80,t:"H"},
  ],
  rt:[
    {d:CB([106,84],[92,84],[92,70],[92,50]), c:CLR.run,w:2.8,a:true},
    {d:CB([56,80],[66,LOS+10],[90,LOS-2],[96,LOS-7]), c:CLR.pull,w:1.8,a:true},
    {d:QQ([118,LOS],[108,LOS-5],[98,LOS-9]), c:CLR.block,w:1.2,a:true},
    {d:P([82,LOS],[82,LOS-8]), c:CLR.block,w:1,a:true},
  ],
},
{
  id:6, name:"QB_Draw", label:"QB Draw", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([84,84],[84,78],[84,64],[84,46]), c:CLR.run,w:2.8,a:true},
    {d:QQ([106,84],[112,78],[118,74]), c:CLR.block,w:1.2,a:true},
    {d:P([12,LOS],[12,30]), c:CLR.pass,w:1,a:true,dsh:true},
    {d:P([176,LOS],[176,30]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:7, name:"PowerRead", label:"Power Read", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([106,84],[134,80],[156,70],[168,56]), c:CLR.run,w:2.8,a:true},
    {d:P([84,84],[84,76]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([70,LOS],[78,LOS+10],[98,LOS],[104,LOS-7]), c:CLR.pull,w:1.6,a:true},
    {d:P([118,LOS],[118,LOS-9]), c:CLR.block,w:1.2,a:true},
  ],
},
{
  id:8, name:"Sweep", label:"Sweep", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:106,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([106,82],[126,78],[152,64],[170,48]), c:CLR.run,w:2.8,a:true},
    {d:P([58,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([70,LOS],[82,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([82,LOS],[94,LOS-5]), c:CLR.block,w:1,a:true},
    {d:QQ([12,LOS],[30,LOS-5],[52,LOS-7]), c:CLR.block,w:1.5,a:true},
  ],
},
{
  id:9, name:"Trap", label:"Trap", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:84,y:98,t:"RB"},
  ],
  rt:[
    {d:CB([84,98],[84,86],[80,72],[74,54]), c:CLR.run,w:2.8,a:true},
    {d:CB([70,LOS],[72,LOS+10],[80,LOS+2],[82,LOS-6]), c:CLR.pull,w:1.6,a:true},
    {d:P([58,LOS],[58,LOS-7]), c:CLR.block,w:1.2,a:true},
    {d:P([94,LOS],[94,LOS-7]), c:CLR.block,w:1.2,a:true},
  ],
},
{
  id:10, name:"Stretch", label:"Stretch", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:100,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([100,84],[70,80],[40,66],[12,46]), c:CLR.run,w:2.8,a:true},
    {d:P([58,LOS],[46,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([70,LOS],[58,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([82,LOS],[70,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([94,LOS],[82,LOS-5]), c:CLR.block,w:1,a:true},
    {d:P([106,LOS],[94,LOS-5]),c:CLR.block,w:1,a:true},
  ],
},
{
  id:11, name:"Bash", label:"Bash (Back Away Sweep Handoff)", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:84,y:98,t:"RB"},
    {x:56,y:82,t:"H"},
  ],
  rt:[
    {d:CB([56,82],[42,78],[28,66],[16,54]), c:CLR.run,w:2.8,a:true},
    {d:P([84,82],[84,74]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:QQ([84,98],[98,92],[112,88]), c:CLR.block,w:1.2,a:true},
    {d:P([118,LOS],[118,LOS-9]), c:CLR.block,w:1.2,a:true},
  ],
},
{
  id:12, name:"PinPull", label:"Pin-Pull", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:CB([106,84],[128,80],[154,66],[170,50]), c:CLR.run,w:2.8,a:true},
    {d:CB([82,LOS],[90,LOS+10],[112,LOS+4],[124,LOS-4]), c:CLR.pull,w:1.8,a:true},
    {d:CB([94,LOS],[102,LOS+8],[126,LOS+2],[140,LOS-6]), c:CLR.pull,w:1.6,a:true},
    {d:P([58,LOS],[58,LOS-7]), c:CLR.block,w:1.2,a:true},
  ],
},
{
  id:13, name:"LeadDraw", label:"Lead Draw", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:84,y:100,t:"RB"},
    {x:66,y:86,t:"H"},
  ],
  rt:[
    {d:CB([66,86],[72,80],[74,66],[76,52]), c:CLR.block,w:1.8,a:true},
    {d:CB([84,100],[84,88],[82,72],[80,52]), c:CLR.run,w:2.8,a:true},
    {d:P([70,LOS],[70,LOS-10]), c:CLR.block,w:1.6,a:true},
    {d:P([82,LOS],[82,LOS-10]), c:CLR.block,w:1.6,a:true},
  ],
},
{
  id:14, name:"SweepRead", label:"Sweep Read", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:106,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([106,82],[132,78],[156,64],[172,50]), c:CLR.run,w:2.8,a:true},
    {d:P([84,82],[84,74]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([118,LOS],[118,LOS-9]), c:CLR.block,w:1.2,a:true},
    {d:QQ([34,LOS],[58,LOS+14],[84,LOS+16]), c:CLR.motion,w:1.5,a:false,dsh:true},
  ],
},
{
  id:15, name:"CounterRead", label:"Counter Read", cat:"run",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:82,t:"QB"},{x:106,y:82,t:"RB"},
  ],
  rt:[
    {d:CB([106,82],[92,82],[96,68],[96,52]), c:CLR.run,w:2.8,a:true},
    {d:P([84,82],[84,74]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([70,LOS],[76,LOS+10],[100,LOS],[106,LOS-7]), c:CLR.pull,w:1.6,a:true},
    {d:QQ([118,LOS],[108,LOS-5],[98,LOS-9]), c:CLR.block,w:1.2,a:true},
  ],
},

/* ═══ RPO 16-30 ═══════════════════════════════════════ */
{
  id:16, name:"RPO_IZ_Glance", label:"IZ Glance (conflict LB)", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:84,y:94,t:"RB"},
  ],
  rt:[
    {d:P([84,94],[84,84],[82,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([172,LOS],[160,56],[146,54],[132,54]), c:CLR.pass,w:2.2,a:true}, // glance
    {d:P([34,LOS],[34,56],[34,60]), c:CLR.pass,w:1.2,a:true},
    {d:P([118,LOS],[118,28]), c:CLR.block,w:1,a:true,dsh:true},
  ],
},
{
  id:17, name:"RPO_IZ_Bubble", label:"IZ Bubble", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:84,y:94,t:"RB"},
  ],
  rt:[
    {d:P([84,94],[84,84],[82,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:QQ([176,LOS],[166,74],[154,80]), c:CLR.pa,w:1.5,a:true}, // bubble
    {d:P([152,LOS],[152,30]), c:CLR.pass,w:1,a:true,dsh:true},
    {d:P([34,LOS],[34,50]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:18, name:"RPO_OZ_Stick", label:"OZ Stick", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"},
  ],
  rt:[
    {d:P([106,78],[128,74],[146,66]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[96,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:2.2,a:true}, // stick
    {d:P([152,LOS],[152,56],[168,56]), c:CLR.pass,w:1.6,a:true}, // flat/out
    {d:P([176,LOS],[176,28]), c:CLR.pass,w:1,a:true},
  ],
},
{
  id:19, name:"RPO_Duo_Slant", label:"Duo Slant", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:84,y:94,t:"RB"},
  ],
  rt:[
    {d:P([84,94],[84,84],[84,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([12,LOS],[26,54],[48,50],[58,50]), c:CLR.pass,w:2.2,a:true}, // slant
    {d:P([34,LOS],[34,56],[34,60]), c:CLR.pass,w:1.2,a:true},
  ],
},
{
  id:20, name:"RPO_Counter_Hitch", label:"Counter Hitch", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"},
    {x:56,y:80,t:"H"},
  ],
  rt:[
    {d:CB([106,78],[92,78],[94,66],[94,52]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([172,LOS],[172,52],[172,56]), c:CLR.pass,w:2.2,a:true}, // hitch
    {d:CB([56,80],[66,LOS+10],[90,LOS-2],[96,LOS-7]), c:CLR.pull,w:1.8,a:true},
    {d:P([32,LOS],[32,30]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:21, name:"RPO_PowerRead_Bubble", label:"Power Read Bubble", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"},
  ],
  rt:[
    {d:P([106,78],[132,74],[156,62]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:QQ([176,LOS],[166,74],[154,80]), c:CLR.pa,w:1.5,a:true},
    {d:P([152,LOS],[152,30]), c:CLR.pass,w:1,a:true,dsh:true},
    {d:P([118,LOS],[118,LOS-9]), c:CLR.block,w:1.2,a:true},
  ],
},
{
  id:22, name:"RPO_GlanceSeam", label:"Glance + Seam (stress hook safety)", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:84,y:94,t:"RB"},
  ],
  rt:[
    {d:P([84,94],[84,84],[82,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([172,LOS],[160,56],[146,54],[132,54]), c:CLR.pass,w:2.2,a:true}, // glance
    {d:P([118,LOS],[118,20]), c:CLR.pass,w:2.2,a:true}, // seam
    {d:P([34,LOS],[34,56],[34,60]), c:CLR.pass,w:1.2,a:true},
  ],
},
{
  id:23, name:"RPO_SlotFade", label:"Slot Fade RPO (2-high beater)", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:84,y:94,t:"RB"},
  ],
  rt:[
    {d:P([84,94],[84,84],[82,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([152,LOS],[152,34],[168,22],[182,18]), c:CLR.pass,w:2.4,a:true}, // slot fade
    {d:P([176,LOS],[176,56],[188,56]), c:CLR.pa,w:1.5,a:true}, // bubble hold
    {d:P([34,LOS],[34,30]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:24, name:"RPO_Choice", label:"Choice RPO (slot option)", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"},
  ],
  rt:[
    {d:P([106,78],[120,70],[124,54]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[94,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([152,LOS],[152,56],[164,46],[156,40]), c:CLR.pass,w:2.2,a:true}, // choice-ish
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:1.6,a:true},
    {d:P([176,LOS],[176,28]), c:CLR.pass,w:1,a:true},
  ],
},
{
  id:25, name:"RPO_Smash", label:"Smash RPO", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:84,y:94,t:"RB"},
  ],
  rt:[
    {d:P([84,94],[84,84],[84,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([12,LOS],[8,42],[24,26],[36,24]), c:CLR.pass,w:2.2,a:true}, // corner
    {d:P([32,LOS],[32,52],[32,56]), c:CLR.pass,w:2.2,a:true}, // hitch
    {d:P([172,LOS],[172,28]), c:CLR.pass,w:1,a:true},
  ],
},
{
  id:26, name:"RPO_Curl", label:"Curl RPO", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"},
  ],
  rt:[
    {d:P([106,78],[120,70],[124,54]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[94,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([152,LOS],[152,44],[152,48]), c:CLR.pass,w:2.2,a:true}, // curl
    {d:QQ([176,LOS],[166,74],[154,80]), c:CLR.pa,w:1.5,a:true}, // bubble hold
    {d:P([118,LOS],[118,56],[134,56]), c:CLR.pass,w:1.4,a:true}, // flat
  ],
},
{
  id:27, name:"RPO_SpeedOut", label:"Speed Out RPO", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:84,y:94,t:"RB"},
  ],
  rt:[
    {d:P([84,94],[84,84],[82,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([172,LOS],[172,56],[184,56]), c:CLR.pass,w:2.2,a:true}, // speed out
    {d:P([34,LOS],[34,28]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:28, name:"RPO_PopPass", label:"Pop Pass (TE pop)", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:84,y:94,t:"RB"},
  ],
  rt:[
    {d:P([84,94],[84,84],[84,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:2.4,a:true}, // pop
    {d:P([12,LOS],[12,30]), c:CLR.pass,w:1,a:true,dsh:true},
    {d:P([172,LOS],[172,30]), c:CLR.pass,w:1,a:true,dsh:true},
  ],
},
{
  id:29, name:"RPO_Screen", label:"Screen RPO (run + quick screen tag)", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:84,y:94,t:"RB"},
  ],
  rt:[
    {d:P([84,94],[84,84],[82,70]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[84,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([176,LOS],[182,72],[180,80],[176,84]), c:CLR.sit,w:2,a:true}, // quick screen
    {d:CB([152,LOS],[160,72],[170,78],[174,80]), c:CLR.block,w:1.6,a:true},
    {d:P([118,LOS],[118,28]), c:CLR.block,w:1,a:true,dsh:true},
  ],
},
{
  id:30, name:"RPO_Texas", label:"Texas RPO (RB angle)", cat:"pa",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:78,t:"QB"},{x:106,y:78,t:"RB"},
  ],
  rt:[
    {d:P([106,78],[120,70],[124,54]), c:CLR.run,w:2,a:true,dsh:true},
    {d:P([84,78],[94,70]), c:CLR.rpo,w:1.5,a:true,dsh:true},
    {d:CB([106,78],[96,70],[88,60],[96,54]), c:CLR.pass,w:2.2,a:true}, // texas/angle
    {d:P([152,LOS],[152,28]), c:CLR.pass,w:1,a:true},
    {d:P([118,LOS],[118,52],[118,56]), c:CLR.pass,w:1.4,a:true},
  ],
},

/* ═══ PASS 31-35 ══════════════════════════════════════ */
{
  id:31, name:"4_Verts", label:"4 Verts", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[12,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([34,LOS],[34,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,12]), c:CLR.pass,w:2.2,a:true},
    {d:P([176,LOS],[176,12]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[124,82],[142,78]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},
{
  id:32, name:"Dagger", label:"Dagger", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([12,LOS],[12,36],[82,36]), c:CLR.pass,w:2.2,a:true},
    {d:CB([32,LOS],[32,46],[52,34],[68,28]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,50],[148,50]), c:CLR.pass,w:1.5,a:true},
    {d:P([172,LOS],[172,26]), c:CLR.pass,w:1,a:true},
  ],
},
{
  id:33, name:"Mesh", label:"Mesh", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:98,y:86,t:"RB"},
  ],
  rt:[
    {d:CB([34,LOS],[62,62],[100,62],[120,64]), c:CLR.pass,w:2.2,a:true},
    {d:CB([152,LOS],[122,60],[82,60],[60,62]), c:CLR.pass,w:2.2,a:true},
    {d:P([12,LOS],[12,28]), c:CLR.pass,w:1,a:true},
    {d:P([118,LOS],[118,50]), c:CLR.pass,w:1.2,a:true},
    {d:CB([98,86],[120,86],[134,80],[140,76]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},
{
  id:34, name:"Sail", label:"Sail", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:CB([172,LOS],[182,44],[164,28],[148,26]), c:CLR.pass,w:2.2,a:true},
    {d:P([118,LOS],[118,48],[150,48]), c:CLR.pass,w:2.2,a:true},
    {d:QQ([106,86],[132,82],[150,78]), c:CLR.pass,w:1.8,a:true},
    {d:CB([12,LOS],[10,46],[28,48],[46,48]), c:CLR.pass,w:1,a:true},
  ],
},
{
  id:35, name:"Drive", label:"Drive", cat:"pass",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:98,y:86,t:"RB"},
  ],
  rt:[
    {d:CB([34,LOS],[58,58],[96,56],[120,56]), c:CLR.pass,w:2.2,a:true}, // shallow
    {d:P([12,LOS],[12,32],[60,32]), c:CLR.pass,w:2.2,a:true}, // dig
    {d:P([118,LOS],[118,20]), c:CLR.pass,w:2.2,a:true}, // seam clear
    {d:CB([98,86],[120,86],[136,80],[144,74]), c:CLR.pass,w:1.2,a:true,dsh:true},
  ],
},

/* ═══ SCREENS 36-40 ═══════════════════════════════════ */
{
  id:36, name:"WR_Tunnel", label:"Tunnel Screen", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([84,86],[84,92]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([34,LOS],[38,72],[42,78],[44,82]), c:CLR.sit,w:2,a:true},
    {d:CB([84,92],[64,88],[54,84],[44,82]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:CB([12,LOS],[20,72],[34,78],[40,80]), c:CLR.block,w:1.5,a:true},
    {d:CB([118,LOS],[102,68],[78,66],[58,66]), c:CLR.block,w:1.5,a:true},
  ],
},
{
  id:37, name:"Jailbreak", label:"Jailbreak Screen", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([84,86],[84,100]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([176,LOS],[184,74],[182,84],[176,90]), c:CLR.sit,w:2,a:true},
    {d:CB([152,LOS],[164,70],[174,78],[180,82]), c:CLR.block,w:1.6,a:true},
    {d:CB([118,LOS],[134,70],[154,78],[168,82]), c:CLR.block,w:1.6,a:true},
    {d:CB([84,100],[132,96],[162,90],[176,90]), c:CLR.sit,w:1.8,a:true,dsh:true},
  ],
},
{
  id:38, name:"RB_Slip", label:"RB Slip Screen", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:32,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:172,y:LOS,t:"WR"},
    {x:84,y:86,t:"QB"},{x:106,y:86,t:"RB"},
  ],
  rt:[
    {d:P([84,86],[84,100]), c:CLR.qbmove,w:1.5,a:true,dsh:true},
    {d:CB([106,86],[118,90],[136,90],[150,86]), c:CLR.sit,w:2,a:true},
    {d:CB([84,100],[118,98],[140,92],[150,86]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:QQ([94,LOS],[104,72],[118,68]), c:CLR.block,w:1,a:true},
    {d:QQ([106,LOS],[118,70],[132,66]), c:CLR.block,w:1,a:true},
  ],
},
{
  id:39, name:"Bubble", label:"Bubble Screen", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},{x:34,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:P([84,84],[84,76]), c:CLR.qbmove,w:1.2,a:true,dsh:true},
    {d:QQ([176,LOS],[166,74],[154,80]), c:CLR.sit,w:2,a:true},
    {d:CB([152,LOS],[164,72],[172,78],[176,80]), c:CLR.block,w:1.5,a:true},
    {d:P([12,LOS],[12,30]), c:CLR.pass,w:1,a:true,dsh:true},
    {d:QQ([106,84],[94,82],[80,80]), c:CLR.block,w:1,a:true,dsh:true},
  ],
},
{
  id:40, name:"Swing", label:"RB Swing Screen", cat:"situational",
  sk:[
    {x:12,y:LOS,t:"WR"},
    {x:118,y:LOS,t:"TE"},{x:152,y:LOS,t:"WR"},{x:176,y:LOS,t:"WR"},
    {x:84,y:84,t:"QB"},{x:106,y:84,t:"RB"},
  ],
  rt:[
    {d:P([84,84],[84,94]), c:CLR.qbmove,w:1.2,a:true,dsh:true},
    {d:CB([106,84],[140,86],[162,84],[176,80]), c:CLR.sit,w:2,a:true},
    {d:CB([84,94],[128,92],[160,86],[176,80]), c:CLR.sit,w:1.8,a:true,dsh:true},
    {d:CB([152,LOS],[164,70],[174,78],[180,82]), c:CLR.block,w:1.6,a:true},
    {d:CB([118,LOS],[134,70],[154,78],[168,82]), c:CLR.block,w:1.6,a:true},
  ],
},
];
