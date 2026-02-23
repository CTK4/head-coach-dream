/* ═══ CORYELL / AIR CORYELL — VERTICAL DIGIT SYSTEM (CORE 40) ═══
   Core philosophy: stretch deep thirds, attack intermediate dig windows, 7-step timing.
   Format: { id, name, label, cat, sk, rt }
   cat: 'run' | 'dropback' | 'playaction' | 'screen'
   Notes:
   - "Digits" here are conceptual route families (e.g., 9 = go, 8 = post, 7 = corner, etc.).
   - rt uses P() polylines for routes; LOS assumed global.
   - Keep consistent with prior pack conventions (no extra fields).
*/

const AIR_CORYELL_PLAYS = [
/* ═══════════════════════════════════════
   RUNS 1–10
   ═══════════════════════════════════════ */
{
  id:1, name:'R_InsideZone', label:'Inside Zone', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},{x:80,y:LOS-10,t:'TE'},
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
  ],
  rt:[
    {d:P([100,LOS-18],[96,LOS-14],[96,LOS-10]), c:'handoff',w:2.4,a:true},
    {d:P([92,LOS-16],[96,LOS-14],[98,LOS+10],[100,LOS+18]), c:'run',w:2.6,a:true},
    {d:P([60,LOS-12],[56,LOS-6],[54,LOS+10]), c:'stalk',w:1.6,a:true},
    {d:P([140,LOS-12],[146,LOS-6],[148,LOS+10]), c:'stalk',w:1.6,a:true},
    {d:P([118,LOS-10],[122,LOS-6],[130,LOS+8]), c:'seal',w:1.8,a:true},
    {d:P([80,LOS-10],[76,LOS-6],[70,LOS+6]), c:'hinge',w:1.7,a:true},
  ],
},
{
  id:2, name:'R_OutsideZone', label:'Outside Zone', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:58,y:LOS-12,t:'WR'},{x:142,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},{x:80,y:LOS-10,t:'TE'},
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[104,LOS-12]), c:'stretch',w:2.2,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[120,LOS+4],[138,LOS+10]), c:'run',w:2.6,a:true},
    {d:P([58,LOS-12],[52,LOS-6],[46,LOS+8]), c:'reach',w:1.6,a:true},
    {d:P([142,LOS-12],[150,LOS-6],[156,LOS+6]), c:'stalk',w:1.6,a:true},
    {d:P([118,LOS-10],[126,LOS-6],[140,LOS+6]), c:'reach',w:1.8,a:true},
    {d:P([80,LOS-10],[74,LOS-6],[62,LOS+4]), c:'cutoff',w:1.7,a:true},
  ],
},
{
  id:3, name:'R_Duo', label:'Duo', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[98,LOS-10]), c:'handoff',w:2.4,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[100,LOS+10],[100,LOS+18]), c:'run',w:2.7,a:true},
    {d:P([118,LOS-10],[118,LOS-6],[122,LOS+6]), c:'double',w:1.8,a:true},
    {d:P([60,LOS-12],[56,LOS-6],[54,LOS+10]), c:'stalk',w:1.6,a:true},
    {d:P([140,LOS-12],[146,LOS-6],[148,LOS+10]), c:'stalk',w:1.6,a:true},
  ],
},
{
  id:4, name:'R_Power', label:'Power', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
    {x:84,y:LOS-8,t:'H'}, // pulling/lead
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[96,LOS-10]), c:'handoff',w:2.4,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[92,LOS+6],[90,LOS+16]), c:'run',w:2.7,a:true},
    {d:P([84,LOS-8],[92,LOS-6],[92,LOS+8]), c:'lead',w:2.0,a:true},
    {d:P([118,LOS-10],[118,LOS-6],[112,LOS+6]), c:'down',w:1.8,a:true},
    {d:P([60,LOS-12],[56,LOS-6],[52,LOS+10]), c:'stalk',w:1.6,a:true},
    {d:P([140,LOS-12],[148,LOS-6],[154,LOS+8]), c:'stalk',w:1.6,a:true},
  ],
},
{
  id:5, name:'R_CounterOF', label:'Counter OF', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
    {x:84,y:LOS-8,t:'H'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[104,LOS-12],[98,LOS-10]), c:'counter_mesh',w:2.4,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[88,LOS-8],[114,LOS+6],[128,LOS+14]), c:'run',w:2.7,a:true},
    {d:P([84,LOS-8],[92,LOS-6],[120,LOS+6]), c:'kickout',w:2.0,a:true},
    {d:P([118,LOS-10],[118,LOS-6],[126,LOS+6]), c:'wrap',w:1.8,a:true},
    {d:P([60,LOS-12],[56,LOS-6],[52,LOS+10]), c:'stalk',w:1.6,a:true},
    {d:P([140,LOS-12],[148,LOS-6],[154,LOS+8]), c:'stalk',w:1.6,a:true},
  ],
},
{
  id:6, name:'R_DrawGun', label:'Draw (Gun)', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-18,t:'RB'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-14],[100,LOS-10]), c:'show_pass',w:2.0,a:true},
    {d:P([92,LOS-18],[96,LOS-16],[100,LOS-14],[100,LOS+12]), c:'run',w:2.8,a:true},
    {d:P([60,LOS-12],[60,LOS+20]), c:'clear',w:1.4,a:true},
    {d:P([140,LOS-12],[140,LOS+20]), c:'clear',w:1.4,a:true},
    {d:P([118,LOS-10],[118,LOS+6]), c:'seal',w:1.6,a:true},
  ],
},
{
  id:7, name:'R_StretchWeak', label:'Stretch Weak', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:58,y:LOS-12,t:'WR'},{x:142,y:LOS-12,t:'WR'},
    {x:80,y:LOS-10,t:'TE'}, // weak TE
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[92,LOS-12]), c:'stretch',w:2.2,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[74,LOS+2],[52,LOS+10]), c:'run',w:2.6,a:true},
    {d:P([80,LOS-10],[74,LOS-6],[60,LOS+6]), c:'reach',w:1.8,a:true},
    {d:P([58,LOS-12],[52,LOS-6],[44,LOS+8]), c:'crack_or_reach',w:1.6,a:true},
    {d:P([142,LOS-12],[150,LOS-6],[156,LOS+6]), c:'stalk',w:1.6,a:true},
  ],
},
{
  id:8, name:'R_LeadStrong', label:'Lead Strong', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},
    {x:108,y:LOS-12,t:'FB'},
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[100,LOS-10]), c:'handoff',w:2.4,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[110,LOS+10],[112,LOS+18]), c:'run',w:2.7,a:true},
    {d:P([108,LOS-12],[112,LOS-6],[116,LOS+8]), c:'lead',w:2.1,a:true},
    {d:P([118,LOS-10],[118,LOS-6],[126,LOS+6]), c:'seal',w:1.8,a:true},
    {d:P([60,LOS-12],[56,LOS-6],[54,LOS+10]), c:'stalk',w:1.6,a:true},
    {d:P([140,LOS-12],[146,LOS-6],[148,LOS+10]), c:'stalk',w:1.6,a:true},
  ],
},
{
  id:9, name:'R_TossCrack', label:'Toss Crack', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:58,y:LOS-12,t:'WR'},{x:142,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},{x:80,y:LOS-10,t:'TE'},
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
  ],
  rt:[
    {d:P([100,LOS-18],[96,LOS-14],[88,LOS-10]), c:'toss',w:2.2,a:true},
    {d:P([92,LOS-16],[88,LOS-14],[60,LOS-6],[40,LOS+8]), c:'run',w:2.8,a:true},
    {d:P([58,LOS-12],[70,LOS-6],[80,LOS+2]), c:'crack',w:1.8,a:true},
    {d:P([80,LOS-10],[72,LOS-6],[60,LOS+6]), c:'reach',w:1.7,a:true},
    {d:P([142,LOS-12],[150,LOS-6],[156,LOS+6]), c:'stalk',w:1.6,a:true},
    {d:P([118,LOS-10],[126,LOS-6],[138,LOS+6]), c:'escort',w:1.7,a:true},
  ],
},
{
  id:10, name:'R_DelayTrap', label:'Delay Trap', cat:'run',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-18,t:'RB'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},
    {x:88,y:LOS-6,t:'LT'},{x:94,y:LOS-6,t:'LG'},{x:100,y:LOS-6,t:'C'},{x:106,y:LOS-6,t:'RG'},{x:112,y:LOS-6,t:'RT'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-14],[100,LOS-10]), c:'delay_show',w:2.0,a:true},
    {d:P([92,LOS-18],[94,LOS-16],[96,LOS-14],[100,LOS+12]), c:'run',w:2.8,a:true},
    {d:P([118,LOS-10],[118,LOS-6],[112,LOS+4]), c:'trap',w:1.9,a:true},
    {d:P([60,LOS-12],[60,LOS+20]), c:'clear',w:1.4,a:true},
    {d:P([140,LOS-12],[140,LOS+20]), c:'clear',w:1.4,a:true},
  ],
},

/* ═══════════════════════════════════════
   DROPBACK PASS 11–30
   Timing: 7-step / deep drop. Default protection implied.
   ═══════════════════════════════════════ */
{
  id:11, name:'P_989', label:'989 (Go/Go/Go)', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y(TE)'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,18]), c:'9_go',w:2.2,a:true},
    {d:P([140,LOS-12],[140,18]), c:'9_go',w:2.2,a:true},
    {d:P([118,LOS-10],[118,22]), c:'8_post',w:2.1,a:true},
    {d:P([86,LOS-10],[86,46],[96,54]), c:'check_shallow',w:1.7,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,56]), c:'check_release',w:1.6,a:true},
  ],
},
{
  id:12, name:'P_Mills', label:'Mills (Post-Dig)', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,20],[72,18]), c:'8_post',w:2.2,a:true},
    {d:P([118,LOS-10],[118,38],[92,38]), c:'dig_12',w:2.1,a:true},
    {d:P([140,LOS-12],[140,50],[132,52]), c:'comeback',w:2.0,a:true},
    {d:P([86,LOS-10],[86,48],[96,54]), c:'hook',w:1.7,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:13, name:'P_Yankee', label:'Yankee (Post-Cross)', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,20],[72,18]), c:'8_post',w:2.2,a:true},
    {d:P([140,LOS-12],[140,40],[92,46]), c:'deep_cross',w:2.1,a:true},
    {d:P([118,LOS-10],[118,56],[112,58]), c:'curl',w:1.8,a:true},
    {d:P([86,LOS-10],[86,46],[96,54]), c:'check_hook',w:1.7,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:14, name:'P_Dagger', label:'Dagger', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([140,LOS-12],[140,18]), c:'9_clear',w:2.2,a:true},
    {d:P([86,LOS-10],[86,38],[104,38]), c:'dig_15',w:2.1,a:true},
    {d:P([60,LOS-12],[60,50],[52,52]), c:'comeback',w:2.0,a:true},
    {d:P([118,LOS-10],[118,48],[112,54]), c:'hook',w:1.7,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:15, name:'P_Levels', label:'Levels', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([118,LOS-10],[118,40],[92,40]), c:'in_12',w:2.0,a:true},
    {d:P([86,LOS-10],[86,52],[104,52]), c:'dig_18',w:2.0,a:true},
    {d:P([60,LOS-12],[60,56],[52,58]), c:'curl',w:1.8,a:true},
    {d:P([140,LOS-12],[140,22],[128,20]), c:'out',w:1.8,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:16, name:'P_DeepComeback', label:'Deep Comeback', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,24],[52,22]), c:'comeback',w:2.2,a:true},
    {d:P([140,LOS-12],[140,24],[148,22]), c:'comeback',w:2.2,a:true},
    {d:P([118,LOS-10],[118,44],[112,50]), c:'hook',w:1.8,a:true},
    {d:P([86,LOS-10],[86,48],[96,54]), c:'hook',w:1.7,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:17, name:'P_4VertsSwitch', label:'4 Verts Switch', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,18]), c:'9_go',w:2.2,a:true},
    {d:P([140,LOS-12],[140,18]), c:'9_go',w:2.2,a:true},
    // switch stems inside
    {d:P([118,LOS-10],[112,LOS-2],[108,18]), c:'seam_switch',w:2.1,a:true},
    {d:P([86,LOS-10],[92,LOS-2],[96,18]), c:'seam_switch',w:2.1,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:18, name:'P_Scissors', label:'Scissors', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([140,LOS-12],[140,18],[124,22]), c:'post',w:2.2,a:true},
    {d:P([86,LOS-10],[86,20],[104,22]), c:'corner',w:2.2,a:true},
    {d:P([60,LOS-12],[60,56],[52,58]), c:'curl',w:1.8,a:true},
    {d:P([118,LOS-10],[118,48],[112,54]), c:'hook',w:1.7,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:19, name:'P_SailFlood', label:'Sail Flood', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([140,LOS-12],[140,26],[122,22]), c:'sail_corner',w:2.2,a:true},
    {d:P([118,LOS-10],[118,46],[130,52]), c:'out_10',w:2.0,a:true},
    {d:P([86,LOS-10],[86,LOS-2],[94,LOS+4],[104,LOS+8]), c:'flat',w:1.9,a:true},
    {d:P([60,LOS-12],[60,18]), c:'go_clear',w:1.8,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:20, name:'P_Smash', label:'Smash', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([140,LOS-12],[140,56],[132,58]), c:'hitch',w:1.9,a:true},
    {d:P([118,LOS-10],[118,26],[132,22]), c:'corner',w:2.1,a:true},
    {d:P([60,LOS-12],[60,18]), c:'go_clear',w:1.8,a:true},
    {d:P([86,LOS-10],[86,46],[96,54]), c:'hook',w:1.7,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:21, name:'P_Drive', label:'Drive', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([140,LOS-12],[140,40],[100,46]), c:'deep_in',w:2.0,a:true},
    {d:P([86,LOS-10],[86,LOS-2],[104,LOS+2]), c:'shallow',w:2.0,a:true},
    {d:P([118,LOS-10],[118,56],[112,58]), c:'dig_stop',w:1.9,a:true},
    {d:P([60,LOS-12],[60,18]), c:'go_clear',w:1.8,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:22, name:'P_ShallowCross', label:'Shallow Cross', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,40],[76,40]), c:'dig_12',w:2.0,a:true},
    {d:P([140,LOS-12],[140,LOS-2],[108,LOS+2]), c:'shallow',w:2.0,a:true},
    {d:P([118,LOS-10],[118,52],[112,56]), c:'curl',w:1.8,a:true},
    {d:P([86,LOS-10],[86,18]), c:'seam',w:1.8,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:23, name:'P_Mesh', label:'Mesh', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.2,a:true},
    {d:P([60,LOS-12],[60,LOS-2],[104,LOS+2]), c:'mesh',w:2.0,a:true},
    {d:P([140,LOS-12],[140,LOS-2],[96,LOS+2]), c:'mesh',w:2.0,a:true},
    {d:P([118,LOS-10],[118,40],[104,40]), c:'sit',w:1.9,a:true},
    {d:P([86,LOS-10],[86,48],[96,54]), c:'corner_settle',w:1.9,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:24, name:'P_PostWheel', label:'Post-Wheel', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},
    {x:86,y:LOS-10,t:'H'},
    {x:118,y:LOS-10,t:'Y'},
    {x:92,y:LOS-18,t:'RB'},
    {x:140,y:LOS-12,t:'Z'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,22],[74,18]), c:'post',w:2.2,a:true},
    {d:P([86,LOS-10],[86,LOS-2],[74,LOS+2]), c:'under',w:1.8,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[88,LOS+2],[76,14]), c:'wheel',w:2.1,a:true},
    {d:P([118,LOS-10],[118,56],[112,58]), c:'curl',w:1.8,a:true},
    {d:P([140,LOS-12],[140,18]), c:'go_clear',w:1.8,a:true},
  ],
},
{
  id:25, name:'P_Divide', label:'Divide', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([86,LOS-10],[86,18]), c:'seam',w:2.2,a:true},
    {d:P([118,LOS-10],[118,18]), c:'seam',w:2.2,a:true},
    {d:P([60,LOS-12],[60,56],[52,58]), c:'curl',w:1.8,a:true},
    {d:P([140,LOS-12],[140,56],[148,58]), c:'curl',w:1.8,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:26, name:'P_DeepOver', label:'Deep Over', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,26],[108,32]), c:'deep_over',w:2.2,a:true},
    {d:P([140,LOS-12],[140,18]), c:'go_clear',w:2.0,a:true},
    {d:P([118,LOS-10],[118,56],[112,58]), c:'dig_stop',w:1.9,a:true},
    {d:P([86,LOS-10],[86,46],[96,54]), c:'hook',w:1.7,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:27, name:'P_3LevelFlood', label:'3-Level Flood', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},
    {x:86,y:LOS-10,t:'H'},
    {x:118,y:LOS-10,t:'Y'},
    {x:140,y:LOS-12,t:'Z'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,18]), c:'go_clear',w:2.0,a:true},
    {d:P([140,LOS-12],[140,28],[122,22]), c:'corner',w:2.1,a:true},
    {d:P([118,LOS-10],[118,46],[130,52]), c:'out_10',w:2.0,a:true},
    {d:P([86,LOS-10],[86,LOS-2],[94,LOS+4],[104,LOS+8]), c:'flat',w:1.9,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:28, name:'P_SlotFade', label:'Slot Fade', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:86,y:LOS-10,t:'H(slot)'},
    {x:118,y:LOS-10,t:'Y'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([86,LOS-10],[92,LOS-2],[100,18]), c:'slot_fade',w:2.2,a:true},
    {d:P([60,LOS-12],[60,56],[52,58]), c:'curl',w:1.8,a:true},
    {d:P([140,LOS-12],[140,18]), c:'go_clear',w:1.9,a:true},
    {d:P([118,LOS-10],[118,40],[92,40]), c:'dig_12',w:2.0,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:29, name:'P_DoublePost', label:'Double Post', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},
    {x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,22],[74,18]), c:'post',w:2.2,a:true},
    {d:P([140,LOS-12],[140,22],[126,18]), c:'post',w:2.2,a:true},
    {d:P([118,LOS-10],[118,56],[112,58]), c:'curl',w:1.8,a:true},
    {d:P([86,LOS-10],[86,46],[96,54]), c:'hook',w:1.7,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},
{
  id:30, name:'P_DeepCurlFlat', label:'Deep Curl/Flat', cat:'dropback',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},
    {x:86,y:LOS-10,t:'H'},
    {x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-34]), c:'drop7',w:2.3,a:true},
    {d:P([60,LOS-12],[60,56],[52,58]), c:'curl',w:2.0,a:true},
    {d:P([86,LOS-10],[86,LOS-2],[94,LOS+4],[104,LOS+8]), c:'flat',w:1.9,a:true},
    {d:P([140,LOS-12],[140,56],[148,58]), c:'curl',w:2.0,a:true},
    {d:P([118,LOS-10],[118,40],[92,40]), c:'dig_12',w:2.0,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,58]), c:'check',w:1.6,a:true},
  ],
},

/* ═══════════════════════════════════════
   PLAY-ACTION 31–35
   ═══════════════════════════════════════ */
{
  id:31, name:'PA_PostDig', label:'PA Post-Dig', cat:'playaction',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[96,LOS-12],[100,LOS-28],[100,LOS-34]), c:'PA_drop',w:2.4,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[98,LOS-10],[92,LOS-6]), c:'fake',w:2.2,a:true},
    {d:P([60,LOS-12],[60,22],[74,18]), c:'post',w:2.2,a:true},
    {d:P([118,LOS-10],[118,38],[92,38]), c:'dig_12',w:2.1,a:true},
    {d:P([140,LOS-12],[140,18]), c:'go_clear',w:1.9,a:true},
    {d:P([86,LOS-10],[86,46],[96,54]), c:'hook',w:1.7,a:true},
  ],
},
{
  id:32, name:'PA_Yankee', label:'PA Yankee', cat:'playaction',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[96,LOS-12],[100,LOS-28],[100,LOS-34]), c:'PA_drop',w:2.4,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[98,LOS-10],[92,LOS-6]), c:'fake',w:2.2,a:true},
    {d:P([60,LOS-12],[60,20],[72,18]), c:'post',w:2.2,a:true},
    {d:P([140,LOS-12],[140,40],[92,46]), c:'deep_cross',w:2.1,a:true},
    {d:P([118,LOS-10],[118,56],[112,58]), c:'curl',w:1.8,a:true},
    {d:P([86,LOS-10],[86,46],[96,54]), c:'hook',w:1.7,a:true},
  ],
},
{
  id:33, name:'PA_DeepOver', label:'PA Deep Over', cat:'playaction',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[96,LOS-12],[100,LOS-28],[100,LOS-34]), c:'PA_drop',w:2.4,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[98,LOS-10],[92,LOS-6]), c:'fake',w:2.2,a:true},
    {d:P([60,LOS-12],[60,26],[108,32]), c:'deep_over',w:2.2,a:true},
    {d:P([140,LOS-12],[140,18]), c:'go_clear',w:2.0,a:true},
    {d:P([118,LOS-10],[118,56],[112,58]), c:'dig_stop',w:1.9,a:true},
    {d:P([86,LOS-10],[86,46],[96,54]), c:'hook',w:1.7,a:true},
  ],
},
{
  id:34, name:'PA_Sail', label:'PA Sail', cat:'playaction',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[96,LOS-12],[104,LOS-28],[104,LOS-34]), c:'PA_roll_set',w:2.4,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[98,LOS-10],[92,LOS-6]), c:'fake',w:2.2,a:true},
    {d:P([140,LOS-12],[140,26],[122,22]), c:'sail_corner',w:2.2,a:true},
    {d:P([118,LOS-10],[118,46],[130,52]), c:'out_10',w:2.0,a:true},
    {d:P([86,LOS-10],[86,LOS-2],[94,LOS+4],[104,LOS+8]), c:'flat',w:1.9,a:true},
    {d:P([60,LOS-12],[60,18]), c:'go_clear',w:1.8,a:true},
  ],
},
{
  id:35, name:'PA_BootShot', label:'PA Boot Shot', cat:'playaction',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-16,t:'RB'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:86,y:LOS-10,t:'H'},
  ],
  rt:[
    {d:P([100,LOS-18],[98,LOS-14],[96,LOS-12],[88,LOS-10],[74,LOS-6],[70,LOS-2]), c:'boot',w:2.4,a:true},
    {d:P([92,LOS-16],[98,LOS-14],[98,LOS-10],[92,LOS-6]), c:'fake',w:2.2,a:true},
    {d:P([140,LOS-12],[140,18]), c:'go_clear',w:2.0,a:true},
    {d:P([60,LOS-12],[60,56],[52,58]), c:'deep_comeback',w:2.0,a:true},
    {d:P([118,LOS-10],[118,28],[132,22]), c:'corner',w:2.1,a:true},
    {d:P([86,LOS-10],[86,LOS-2],[78,LOS+4],[70,LOS+10]), c:'flat',w:1.8,a:true},
  ],
},

/* ═══════════════════════════════════════
   SCREENS 36–40
   ═══════════════════════════════════════ */
{
  id:36, name:'S_RBSlip', label:'RB Slip', cat:'screen',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-18,t:'RB'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},{x:86,y:LOS-10,t:'H'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-28],[100,LOS-24]), c:'set_screen',w:2.2,a:true},
    {d:P([92,LOS-18],[96,LOS-16],[96,LOS-10],[88,LOS-6],[78,LOS+2],[70,LOS+10]), c:'slip_screen',w:2.4,a:true},
    {d:P([60,LOS-12],[60,18]), c:'clear',w:1.6,a:true},
    {d:P([140,LOS-12],[140,18]), c:'clear',w:1.6,a:true},
    {d:P([118,LOS-10],[118,18]), c:'release',w:1.6,a:true},
    {d:P([86,LOS-10],[86,18]), c:'release',w:1.6,a:true},
  ],
},
{
  id:37, name:'S_MiddleScreen', label:'Middle Screen', cat:'screen',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:92,y:LOS-18,t:'RB'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:118,y:LOS-10,t:'TE'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-24]), c:'invite_rush',w:2.2,a:true},
    {d:P([92,LOS-18],[96,LOS-16],[100,LOS-12],[100,LOS+6],[100,LOS+14]), c:'middle_screen',w:2.4,a:true},
    {d:P([60,LOS-12],[60,18]), c:'clear',w:1.6,a:true},
    {d:P([140,LOS-12],[140,18]), c:'clear',w:1.6,a:true},
    {d:P([118,LOS-10],[118,24],[112,26]), c:'occupy',w:1.6,a:true},
  ],
},
{
  id:38, name:'S_WRTunnel', label:'WR Tunnel', cat:'screen',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:60,y:LOS-12,t:'WR(tunnel)'},
    {x:140,y:LOS-12,t:'WR'},{x:118,y:LOS-10,t:'TE'},
    {x:86,y:LOS-10,t:'H'},{x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-22]), c:'quick_set',w:1.8,a:true},
    {d:P([60,LOS-12],[60,LOS-4],[66,LOS+2],[74,LOS+10]), c:'tunnel',w:2.4,a:true},
    {d:P([140,LOS-12],[140,18]), c:'clear',w:1.6,a:true},
    {d:P([118,LOS-10],[118,LOS-2],[108,LOS+6]), c:'screen_block',w:1.8,a:true},
    {d:P([86,LOS-10],[86,LOS-2],[76,LOS+6]), c:'screen_block',w:1.8,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,LOS+2]), c:'seal',w:1.7,a:true},
  ],
},
{
  id:39, name:'S_TEDelay', label:'TE Delay', cat:'screen',
  sk:[
    {x:100,y:LOS-18,t:'QB'},{x:118,y:LOS-10,t:'TE(delay)'},
    {x:60,y:LOS-12,t:'WR'},{x:140,y:LOS-12,t:'WR'},
    {x:92,y:LOS-18,t:'RB'},{x:86,y:LOS-10,t:'H'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-30],[100,LOS-24]), c:'set_screen',w:2.2,a:true},
    {d:P([118,LOS-10],[118,LOS-6],[118,LOS-2],[112,LOS+4],[104,LOS+12]), c:'delay_screen',w:2.4,a:true},
    {d:P([60,LOS-12],[60,18]), c:'clear',w:1.6,a:true},
    {d:P([140,LOS-12],[140,18]), c:'clear',w:1.6,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,LOS+2]), c:'seal',w:1.7,a:true},
    {d:P([86,LOS-10],[86,18]), c:'occupy',w:1.6,a:true},
  ],
},
{
  id:40, name:'S_Bubble', label:'Bubble', cat:'screen',
  sk:[
    {x:100,y:LOS-18,t:'QB'},
    {x:86,y:LOS-10,t:'H(bubble)'},
    {x:60,y:LOS-12,t:'X'},{x:140,y:LOS-12,t:'Z'},
    {x:118,y:LOS-10,t:'Y'},{x:92,y:LOS-18,t:'RB'},
  ],
  rt:[
    {d:P([100,LOS-18],[100,LOS-22]), c:'catch_throw',w:1.8,a:true},
    {d:P([86,LOS-10],[78,LOS-8],[70,LOS-6],[62,LOS-4]), c:'bubble',w:2.4,a:true},
    {d:P([60,LOS-12],[60,LOS-6],[52,LOS+6]), c:'stalk',w:1.7,a:true},
    {d:P([118,LOS-10],[112,LOS-6],[100,LOS+6]), c:'screen_block',w:1.8,a:true},
    {d:P([140,LOS-12],[132,LOS-6],[120,LOS+6]), c:'screen_block',w:1.8,a:true},
    {d:P([92,LOS-18],[96,LOS-14],[96,LOS-6],[92,LOS+2]), c:'check',w:1.5,a:true},
  ],
},
];
