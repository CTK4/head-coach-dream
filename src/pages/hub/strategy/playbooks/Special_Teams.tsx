// @ts-nocheck
import { useState, useEffect } from "react";

/* ── PALETTE ─────────────────────────────────── */
const CLR = {
  special: '#22c55e',
  kickoff: '#60a5fa',
  return: '#f59e0b',
  punt: '#a78bfa',
  fieldgoal: '#ef4444',
  block: '#f472b6',
  clock: '#fbbf24',
  twoMin: '#38bdf8',
  defense: '#fb7185',
  mode: '#34d399',
  line: '#64748b',
  arrow: '#e5e7eb',
};

const CAT_META = {
  kickoff:   { label: 'Kickoff',            short: 'KO',   accent: '#60a5fa', bg: '#60a5fa12' },
  kr:        { label: 'Kick Return',        short: 'KR',   accent: '#f59e0b', bg: '#f59e0b12' },
  punt:      { label: 'Punt Team',          short: 'PUNT', accent: '#a78bfa', bg: '#a78bfa12' },
  pr:        { label: 'Punt Return',        short: 'PR',   accent: '#8b5cf6', bg: '#8b5cf612' },
  fg:        { label: 'Field Goal / PAT',   short: 'FG',   accent: '#ef4444', bg: '#ef444412' },
  fgblock:   { label: 'FG Block',           short: 'BLK',  accent: '#f472b6', bg: '#f472b612' },
  fourmin:   { label: 'Four-Minute',        short: '4MIN', accent: '#fbbf24', bg: '#fbbf2412' },
  twomin:    { label: 'Two-Minute',         short: '2MIN', accent: '#38bdf8', bg: '#38bdf812' },
  killdef:   { label: 'Kill Clock Def',     short: 'KDEF', accent: '#fb7185', bg: '#fb718512' },
  stopdef:   { label: 'Need Stop Def',      short: 'STOP', accent: '#ef4444', bg: '#ef444412' },
  offmode:   { label: 'Offensive Mode',     short: 'OMOD', accent: '#34d399', bg: '#34d39912' },
  defmode:   { label: 'Defensive Mode',     short: 'DMOD', accent: '#10b981', bg: '#10b98112' },
};

/* ── SVG HELPERS ─────────────────────────────── */
const P  = (...pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const QQ = (s, c, e) => `M${s[0]} ${s[1]} Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
const CB = (s, c1, c2, e) => `M${s[0]} ${s[1]} C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${e[0]} ${e[1]}`;

/* ── ARROW REGISTRY ──────────────────────────── */
const ARROW_COLORS = [
  '#22c55e','#60a5fa','#f59e0b','#a78bfa','#ef4444',
  '#f472b6','#fbbf24','#38bdf8','#fb7185','#34d399',
  '#64748b','#e5e7eb','#10b981','#8b5cf6'
];

/* ── LIBRARY DATA ────────────────────────────── */
const ITEMS = [
  /* I. KICKOFF (8) */
  { id:1,  name:'DeepMiddleKick',         label:'Deep Middle Kick', cat:'kickoff', desc:'Standard touchback / return-force kick.', tags:['deep','middle','touchback'], visual:'kick_middle' },
  { id:2,  name:'DeepLeftDirectional',    label:'Deep Left Directional', cat:'kickoff', desc:'Pin return to left numbers.', tags:['deep','left','directional'], visual:'kick_left' },
  { id:3,  name:'DeepRightDirectional',   label:'Deep Right Directional', cat:'kickoff', desc:'Pin return to right numbers.', tags:['deep','right','directional'], visual:'kick_right' },
  { id:4,  name:'HighHangLeft',           label:'High Hang Left', cat:'kickoff', desc:'Sacrifice distance for coverage timing.', tags:['hang','left','coverage'], visual:'hang_left' },
  { id:5,  name:'HighHangRight',          label:'High Hang Right', cat:'kickoff', desc:'Force fair catch or shorter return.', tags:['hang','right','fair catch'], visual:'hang_right' },
  { id:6,  name:'SkyKickMiddle',          label:'Sky Kick Middle', cat:'kickoff', desc:'Shorter, higher ball to force decision.', tags:['sky','middle','decision'], visual:'sky_middle' },
  { id:7,  name:'MortarKick',             label:'Mortar Kick', cat:'kickoff', desc:'Land ball inside the 10–20 yard area.', tags:['mortar','short','placement'], visual:'mortar' },
  { id:8,  name:'SurpriseOnsideKick',     label:'Surprise Onside Kick', cat:'kickoff', desc:'Non-obvious onside look.', tags:['onside','surprise','recovery'], visual:'onside' },

  /* II. KICK RETURN (6) */
  { id:9,  name:'MiddleReturn',           label:'Middle Return', cat:'kr', desc:'Standard wedge / crease return.', tags:['middle','crease','standard'], visual:'kr_middle' },
  { id:10, name:'LeftReturn',             label:'Left Return', cat:'kr', desc:'Designed bounce left.', tags:['left','bounce','return'], visual:'kr_left' },
  { id:11, name:'RightReturn',            label:'Right Return', cat:'kr', desc:'Designed bounce right.', tags:['right','bounce','return'], visual:'kr_right' },
  { id:12, name:'ReverseReturn',          label:'Reverse Return', cat:'kr', desc:'Misdirection return with exchange action.', tags:['reverse','misdirection','exchange'], visual:'kr_reverse' },
  { id:13, name:'PoachAlertReturn',       label:'Poach Alert Return', cat:'kr', desc:'Safe-hands / hands team style return against onside risk.', tags:['poach','safe hands','onside alert'], visual:'kr_safe' },
  { id:14, name:'TakeKneeNoReturn',       label:'Take Knee / No Return', cat:'kr', desc:'Automatic touchback or no-risk decision.', tags:['knee','safe','no return'], visual:'kr_knee' },

  /* III. PUNT TEAM (10) */
  { id:15, name:'StandardPunt',           label:'Standard Punt', cat:'punt', desc:'Normal protection, standard launch.', tags:['standard','protection','launch'], visual:'punt_standard' },
  { id:16, name:'DirectionalPuntLeft',    label:'Directional Punt Left', cat:'punt', desc:'Aim outside left numbers.', tags:['left','directional','punt'], visual:'punt_left' },
  { id:17, name:'DirectionalPuntRight',   label:'Directional Punt Right', cat:'punt', desc:'Aim outside right numbers.', tags:['right','directional','punt'], visual:'punt_right' },
  { id:18, name:'CoffinCornerLeft',       label:'Coffin Corner Left', cat:'punt', desc:'Pin near left sideline inside 10.', tags:['left','coffin corner','pin'], visual:'coffin_left' },
  { id:19, name:'CoffinCornerRight',      label:'Coffin Corner Right', cat:'punt', desc:'Pin near right sideline inside 10.', tags:['right','coffin corner','pin'], visual:'coffin_right' },
  { id:20, name:'HighHangPunt',           label:'High Hang Punt', cat:'punt', desc:'Prioritize coverage over net distance.', tags:['hang','coverage','net'], visual:'punt_hang' },
  { id:21, name:'RugbyPuntLeft',          label:'Rugby Punt Left', cat:'punt', desc:'Roll left, alter rush angles.', tags:['rugby','left','roll'], visual:'rugby_left' },
  { id:22, name:'RugbyPuntRight',         label:'Rugby Punt Right', cat:'punt', desc:'Roll right, directional pressure counter.', tags:['rugby','right','roll'], visual:'rugby_right' },
  { id:23, name:'MaxProtectPunt',         label:'Max Protect Punt', cat:'punt', desc:'Extra protection against heavy rush.', tags:['max protect','anti-rush','shield'], visual:'punt_max' },
  { id:24, name:'FakePuntRunPass',        label:'Fake Punt Run / Pass', cat:'punt', desc:'Built-in fake package.', tags:['fake','run','pass'], visual:'punt_fake' },

  /* IV. PUNT RETURN (8) */
  { id:25, name:'SafeReturn',             label:'Safe Return', cat:'pr', desc:'Protect against fake, standard setup.', tags:['safe','return','fake alert'], visual:'pr_safe' },
  { id:26, name:'ReturnLeft',             label:'Return Left', cat:'pr', desc:'Aggressive left-side wall.', tags:['left','wall','aggressive'], visual:'pr_left' },
  { id:27, name:'ReturnRight',            label:'Return Right', cat:'pr', desc:'Aggressive right-side wall.', tags:['right','wall','aggressive'], visual:'pr_right' },
  { id:28, name:'MiddlePuntReturn',       label:'Middle Return', cat:'pr', desc:'Set vertical crease.', tags:['middle','crease','vertical'], visual:'pr_middle' },
  { id:29, name:'PuntBlockLoadLeft',      label:'Punt Block Load Left', cat:'pr', desc:'Pressure left edge.', tags:['block','left edge','pressure'], visual:'block_left' },
  { id:30, name:'PuntBlockLoadRight',     label:'Punt Block Load Right', cat:'pr', desc:'Pressure right edge.', tags:['block','right edge','pressure'], visual:'block_right' },
  { id:31, name:'AllOutPuntBlock',        label:'All-Out Punt Block', cat:'pr', desc:'High-risk block attempt.', tags:['all-out','block','high risk'], visual:'block_all' },
  { id:32, name:'PoisonNoReturn',         label:'Poison / No Return', cat:'pr', desc:'Conservative fielding, avoid muff risk.', tags:['poison','safe','muff avoidance'], visual:'pr_poison' },

  /* V. FIELD GOAL / PAT TEAM (8) */
  { id:33, name:'StandardFieldGoal',      label:'Standard Field Goal', cat:'fg', desc:'Normal operation.', tags:['field goal','standard','normal'], visual:'fg_std' },
  { id:34, name:'HashLeftFieldGoal',      label:'Hash-Left Field Goal', cat:'fg', desc:'Protection and aim tuned to left hash.', tags:['left hash','aim','protection'], visual:'fg_left' },
  { id:35, name:'HashRightFieldGoal',     label:'Hash-Right Field Goal', cat:'fg', desc:'Protection and aim tuned to right hash.', tags:['right hash','aim','protection'], visual:'fg_right' },
  { id:36, name:'LongFieldGoal',          label:'Long Field Goal', cat:'fg', desc:'Extended range, lower make probability.', tags:['long','range','risk'], visual:'fg_long' },
  { id:37, name:'PATStandard',            label:'PAT Standard', cat:'fg', desc:'Routine extra point.', tags:['pat','standard','routine'], visual:'pat_std' },
  { id:38, name:'PATSafe',                label:'PAT Safe', cat:'fg', desc:'Protection-first extra point.', tags:['pat','safe','protection'], visual:'pat_safe' },
  { id:39, name:'FakeFieldGoalRun',       label:'Fake Field Goal Run', cat:'fg', desc:'Direct run fake.', tags:['fake','run','hold'], visual:'fg_fake_run' },
  { id:40, name:'FakeFieldGoalPass',      label:'Fake Field Goal Pass', cat:'fg', desc:'Throw off fake hold / action.', tags:['fake','pass','hold'], visual:'fg_fake_pass' },

  /* VI. FIELD GOAL BLOCK (6) */
  { id:41, name:'StandardRush',           label:'Standard Rush', cat:'fgblock', desc:'Normal edge / internal push.', tags:['rush','standard','push'], visual:'fgb_std' },
  { id:42, name:'LoadLeftBlock',          label:'Load Left Block', cat:'fgblock', desc:'Attack left edge.', tags:['left','edge','block'], visual:'fgb_left' },
  { id:43, name:'LoadRightBlock',         label:'Load Right Block', cat:'fgblock', desc:'Attack right edge.', tags:['right','edge','block'], visual:'fgb_right' },
  { id:44, name:'MiddlePushBlock',        label:'Middle Push Block', cat:'fgblock', desc:'Interior surge.', tags:['middle','interior','surge'], visual:'fgb_middle' },
  { id:45, name:'SafeFGReturn',           label:'Safe FG Return', cat:'fgblock', desc:'Prioritize clean return if short kick.', tags:['safe return','short kick','clean field'], visual:'fgb_return' },
  { id:46, name:'WatchFakeSafe',          label:'Watch Fake / Safe', cat:'fgblock', desc:'Protect against fake.', tags:['fake alert','safe','contain'], visual:'fgb_safe' },

  /* FOUR-MINUTE OFFENSE (8) */
  { id:47, name:'InsideZoneBurnClock',    label:'Inside Zone Burn Clock', cat:'fourmin', desc:'Safe run, keep clock moving.', tags:['inside zone','clock','safe'], visual:'run_inside' },
  { id:48, name:'DuoBurnClock',           label:'Duo Burn Clock', cat:'fourmin', desc:'High-control downhill run.', tags:['duo','downhill','control'], visual:'run_duo' },
  { id:49, name:'PowerBurnClock',         label:'Power Burn Clock', cat:'fourmin', desc:'Physical short-yardage run.', tags:['power','short yardage','physical'], visual:'run_power' },
  { id:50, name:'StretchBurnClock',       label:'Stretch Burn Clock', cat:'fourmin', desc:'Force pursuit and keep bounds.', tags:['stretch','bounds','pursuit'], visual:'run_stretch' },
  { id:51, name:'BootSafeThrow',          label:'Boot Safe Throw', cat:'fourmin', desc:'Low-risk rollout with throwaway option.', tags:['boot','safe','throwaway'], visual:'pass_boot' },
  { id:52, name:'StickSafe',              label:'Stick Safe', cat:'fourmin', desc:'Quick chain-moving pass.', tags:['stick','chains','quick'], visual:'pass_stick' },
  { id:53, name:'SprintOutSafe',          label:'Sprint-Out Safe', cat:'fourmin', desc:'Half-field read, low sack risk.', tags:['sprint-out','half-field','low sack'], visual:'pass_sprint' },
  { id:54, name:'QBKneel',                label:'QB Kneel', cat:'fourmin', desc:'End-game clock kill.', tags:['kneel','clock kill','end game'], visual:'clock_kneel' },

  /* TWO-MINUTE OFFENSE (10) */
  { id:55, name:'SidelineOut',            label:'Sideline Out', cat:'twomin', desc:'Quick stop route to save time.', tags:['sideline','out','clock stop'], visual:'tm_out' },
  { id:56, name:'HurryUpStick',           label:'Hurry-Up Stick', cat:'twomin', desc:'Fast rhythm chain mover.', tags:['hurry','stick','chains'], visual:'tm_stick' },
  { id:57, name:'SmashSideline',          label:'Smash Sideline', cat:'twomin', desc:'Corner / hitch sideline stress.', tags:['smash','sideline','stress'], visual:'tm_smash' },
  { id:58, name:'FourVertsHurry',         label:'Four Verts Hurry', cat:'twomin', desc:'Explosive push when time is short.', tags:['verts','explosive','hurry'], visual:'tm_verts' },
  { id:59, name:'DaggerHurry',            label:'Dagger Hurry', cat:'twomin', desc:'Intermediate middle strike.', tags:['dagger','middle','intermediate'], visual:'tm_dagger' },
  { id:60, name:'MeshHurry',              label:'Mesh Hurry', cat:'twomin', desc:'Quick separation underneath.', tags:['mesh','underneath','separation'], visual:'tm_mesh' },
  { id:61, name:'SpikeBall',              label:'Spike Ball', cat:'twomin', desc:'Clock stop without timeout.', tags:['spike','clock stop','no timeout'], visual:'tm_spike' },
  { id:62, name:'BoundaryComeback',       label:'Boundary Comeback', cat:'twomin', desc:'Sideline-first stop route.', tags:['boundary','comeback','sideline'], visual:'tm_comeback' },
  { id:63, name:'QuickFieldGoalSetup',    label:'Quick Field Goal Setup', cat:'twomin', desc:'Gain manageable yards for kick team.', tags:['field goal','setup','manageable yards'], visual:'tm_fg' },
  { id:64, name:'HailMary',               label:'Hail Mary', cat:'twomin', desc:'Final-play desperation shot.', tags:['hail mary','desperation','final play'], visual:'tm_hail' },

  /* KILL CLOCK DEFENSE (6) */
  { id:65, name:'PreventDeep',            label:'Prevent Deep', cat:'killdef', desc:'Protect sideline and explosives.', tags:['prevent','deep','explosives'], visual:'def_prevent' },
  { id:66, name:'SidelineFunnel',         label:'Sideline Funnel', cat:'killdef', desc:'Force throws inside, tackle in bounds.', tags:['sideline','funnel','in bounds'], visual:'def_funnel' },
  { id:67, name:'TwoManLate',             label:'2-Man Late', cat:'killdef', desc:'Tight underneath, deep safety help.', tags:['2-man','late','deep help'], visual:'def_2man' },
  { id:68, name:'QuartersKeepTopOn',      label:'Quarters Keep-Top-On', cat:'killdef', desc:'Deny deep shots.', tags:['quarters','top on','deny deep'], visual:'def_quarters' },
  { id:69, name:'Rush3Drop8',             label:'Rush 3 Drop 8', cat:'killdef', desc:'Maximum coverage shell.', tags:['rush 3','drop 8','max coverage'], visual:'def_drop8' },
  { id:70, name:'BoundaryBracket',        label:'Boundary Bracket', cat:'killdef', desc:'Take away top outside threat late.', tags:['boundary','bracket','top threat'], visual:'def_bracket' },

  /* NEED-STOP DEFENSE (6) */
  { id:71, name:'PressureC1',             label:'Pressure C1', cat:'stopdef', desc:'Quick-pressure stop call.', tags:['pressure','cover 1','quick stop'], visual:'stop_c1' },
  { id:72, name:'DoubleAMug',             label:'Double A Mug', cat:'stopdef', desc:'Force rushed decision.', tags:['double a','mug','rush'], visual:'stop_doublea' },
  { id:73, name:'NickelFire',             label:'Nickel Fire', cat:'stopdef', desc:'5-man pressure with structure.', tags:['nickel','fire','5-man'], visual:'stop_fire' },
  { id:74, name:'RobberCutCross',         label:'Robber Cut Cross', cat:'stopdef', desc:'Attack middle game.', tags:['robber','cut','middle'], visual:'stop_robber' },
  { id:75, name:'TwoManBracket',          label:'2-Man Bracket', cat:'stopdef', desc:'Tight coverage on likely target.', tags:['2-man','bracket','target'], visual:'stop_2man' },
  { id:76, name:'ZeroPressure',           label:'Zero Pressure', cat:'stopdef', desc:'High-risk, immediate-stop attempt.', tags:['zero','all-out','must stop'], visual:'stop_zero' },

  /* OFFENSIVE TIME MODES (4) */
  { id:77, name:'ClockDrainMode',         label:'Clock Drain Mode', cat:'offmode', desc:'Chew clock, stay in bounds, low turnover risk, reduced explosive aggression.', tags:['chew clock','bounds','low risk'], visual:'mode_clock' },
  { id:78, name:'BalancedHurryMode',      label:'Balanced Hurry Mode', cat:'offmode', desc:'Moderate tempo, chains first, sideline awareness, preserve full playbook access.', tags:['balanced','tempo','chains'], visual:'mode_balanced' },
  { id:79, name:'EmergencyHurryMode',     label:'Emergency Hurry Mode', cat:'offmode', desc:'No huddle, sideline/middle split rules, spike enabled, throwaway bias increased.', tags:['emergency','no huddle','spike'], visual:'mode_emergency' },
  { id:80, name:'DesperationMode',        label:'Desperation Mode', cat:'offmode', desc:'Explosive-first, sidelines/deep seams prioritized, turnover tolerance increased.', tags:['desperation','explosive','tolerance'], visual:'mode_desperation' },

  /* DEFENSIVE TIME MODES (4) */
  { id:81, name:'ProtectLeadMode',        label:'Protect Lead Mode', cat:'defmode', desc:'Deny explosives, force in-bounds tackles, lighter blitz rate.', tags:['protect lead','deny explosive','lighter blitz'], visual:'mode_protect' },
  { id:82, name:'ForcePuntMode',          label:'Force Punt Mode', cat:'defmode', desc:'Balanced aggression, sticks awareness.', tags:['force punt','balanced','sticks'], visual:'mode_punt' },
  { id:83, name:'NeedBallBackMode',       label:'Need Ball Back Mode', cat:'defmode', desc:'Sideline pressure, sack / negative play hunt, moderate turnover aggression.', tags:['need ball','pressure','negative play'], visual:'mode_ballback' },
  { id:84, name:'MustStopMode',           label:'Must-Stop Mode', cat:'defmode', desc:'Blitz-heavy, bracket top threat, turnover over field position.', tags:['must stop','blitz heavy','turnover'], visual:'mode_muststop' },
];

/* ── ABSTRACT BOARD RENDERING ────────────────── */
function Diagram({ item }) {
  const meta = CAT_META[item.cat];
  const line = 'rgba(255,255,255,0.08)';
  const arrow = meta.accent;

  const commonField = (
    <>
      <rect x="0" y="0" width="200" height="130" fill="#0a0f14" />
      {[20, 40, 60, 80, 100].map(x => (
        <line key={x} x1={x} y1={0} x2={x} y2={130} stroke={line} strokeWidth="0.7" />
      ))}
      <line x1={0} y1={65} x2={200} y2={65} stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" />
    </>
  );

  const ball = <circle cx="28" cy="65" r="3.2" fill="#c97b2a" stroke="#f59e2e" strokeWidth="0.5" />;

  const sketches = {
    kick_middle: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[70,44],[130,36],[176,32])} fill="none" stroke={CLR.kickoff} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.kickoff.replace('#','')})`} />
        <path d={P([34,74],[64,86],[96,92],[126,88])} fill="none" stroke={CLR.special} strokeWidth="1.6" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
        <path d={P([34,56],[64,44],[96,38],[126,42])} fill="none" stroke={CLR.special} strokeWidth="1.6" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    kick_left: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[66,42],[116,22],[168,18])} fill="none" stroke={CLR.kickoff} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.kickoff.replace('#','')})`} />
        <path d={P([34,74],[68,86],[102,90],[132,84])} fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    kick_right: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[66,88],[116,108],[168,112])} fill="none" stroke={CLR.kickoff} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.kickoff.replace('#','')})`} />
        <path d={P([34,56],[68,44],[102,40],[132,46])} fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    hang_left: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[62,34],[98,18],[140,26])} fill="none" stroke={CLR.kickoff} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.kickoff.replace('#','')})`} />
        <circle cx="140" cy="26" r="7" fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="4,3" />
      </>
    ),
    hang_right: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[62,96],[98,112],[140,104])} fill="none" stroke={CLR.kickoff} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.kickoff.replace('#','')})`} />
        <circle cx="140" cy="104" r="7" fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="4,3" />
      </>
    ),
    sky_middle: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[68,18],[104,18],[142,65])} fill="none" stroke={CLR.kickoff} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.kickoff.replace('#','')})`} />
        <circle cx="142" cy="65" r="8" fill="none" stroke={CLR.special} strokeWidth="1.4" strokeDasharray="4,3" />
      </>
    ),
    mortar: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[60,26],[98,24],[126,52])} fill="none" stroke={CLR.kickoff} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.kickoff.replace('#','')})`} />
        <rect x="126" y="44" width="20" height="16" fill="none" stroke={CLR.special} strokeWidth="1.4" strokeDasharray="4,3" />
      </>
    ),
    onside: (
      <>
        {commonField}{ball}
        <path d={P([28,65],[56,62],[78,60],[96,58])} fill="none" stroke={CLR.kickoff} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.kickoff.replace('#','')})`} />
        <path d={P([34,54],[58,50],[82,46])} fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="5,3" />
        <path d={P([34,76],[58,80],[82,84])} fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="5,3" />
      </>
    ),

    kr_middle: (
      <>
        {commonField}
        <circle cx="170" cy="65" r="3.2" fill="#c97b2a" stroke="#f59e2e" strokeWidth="0.5" />
        <path d={P([170,65],[138,65],[106,65],[72,65],[40,65])} fill="none" stroke={CLR.return} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
        <path d={P([138,46],[120,56],[102,65])} fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="5,3" />
        <path d={P([138,84],[120,74],[102,65])} fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="5,3" />
      </>
    ),
    kr_left: (
      <>
        {commonField}
        <circle cx="170" cy="65" r="3.2" fill="#c97b2a" stroke="#f59e2e" strokeWidth="0.5" />
        <path d={CB([170,65],[134,48],[96,34],[48,24])} fill="none" stroke={CLR.return} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
      </>
    ),
    kr_right: (
      <>
        {commonField}
        <circle cx="170" cy="65" r="3.2" fill="#c97b2a" stroke="#f59e2e" strokeWidth="0.5" />
        <path d={CB([170,65],[134,82],[96,96],[48,106])} fill="none" stroke={CLR.return} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
      </>
    ),
    kr_reverse: (
      <>
        {commonField}
        <circle cx="170" cy="65" r="3.2" fill="#c97b2a" stroke="#f59e2e" strokeWidth="0.5" />
        <path d={P([170,65],[144,65],[124,72])} fill="none" stroke={CLR.return} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
        <path d={CB([124,72],[108,46],[86,34],[48,26])} fill="none" stroke={CLR.special} strokeWidth="2.0" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    kr_safe: (
      <>
        {commonField}
        <circle cx="170" cy="65" r="3.2" fill="#c97b2a" stroke="#f59e2e" strokeWidth="0.5" />
        <rect x="138" y="46" width="28" height="38" fill="none" stroke={CLR.special} strokeWidth="1.4" strokeDasharray="4,3" />
        <path d={P([170,65],[154,65],[138,65])} fill="none" stroke={CLR.return} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
      </>
    ),
    kr_knee: (
      <>
        {commonField}
        <circle cx="170" cy="65" r="3.2" fill="#c97b2a" stroke="#f59e2e" strokeWidth="0.5" />
        <circle cx="170" cy="65" r="10" fill="none" stroke={CLR.special} strokeWidth="1.6" />
        <path d={P([164,59],[176,71])} fill="none" stroke={CLR.special} strokeWidth="1.8" />
        <path d={P([176,59],[164,71])} fill="none" stroke={CLR.special} strokeWidth="1.8" />
      </>
    ),

    punt_standard: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[70,44],[122,40],[172,46])} fill="none" stroke={CLR.punt} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
      </>
    ),
    punt_left: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[64,42],[118,24],[176,18])} fill="none" stroke={CLR.punt} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
      </>
    ),
    punt_right: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[64,88],[118,106],[176,112])} fill="none" stroke={CLR.punt} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
      </>
    ),
    coffin_left: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[70,42],[128,20],[188,16])} fill="none" stroke={CLR.punt} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
        <rect x="176" y="8" width="16" height="20" fill="none" stroke={CLR.special} strokeWidth="1.4" strokeDasharray="4,3" />
      </>
    ),
    coffin_right: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[70,88],[128,110],[188,114])} fill="none" stroke={CLR.punt} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
        <rect x="176" y="102" width="16" height="20" fill="none" stroke={CLR.special} strokeWidth="1.4" strokeDasharray="4,3" />
      </>
    ),
    punt_hang: (
      <>
        {commonField}{ball}
        <path d={CB([28,65],[64,24],[106,20],[146,44])} fill="none" stroke={CLR.punt} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
        <circle cx="146" cy="44" r="8" fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="4,3" />
      </>
    ),
    rugby_left: (
      <>
        {commonField}{ball}
        <path d={P([28,65],[52,54],[72,50])} fill="none" stroke={CLR.special} strokeWidth="1.8" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
        <path d={CB([72,50],[102,36],[136,26],[176,22])} fill="none" stroke={CLR.punt} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
      </>
    ),
    rugby_right: (
      <>
        {commonField}{ball}
        <path d={P([28,65],[52,76],[72,80])} fill="none" stroke={CLR.special} strokeWidth="1.8" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
        <path d={CB([72,80],[102,94],[136,104],[176,108])} fill="none" stroke={CLR.punt} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
      </>
    ),
    punt_max: (
      <>
        {commonField}{ball}
        <rect x="18" y="46" width="28" height="38" fill="none" stroke={CLR.special} strokeWidth="1.4" strokeDasharray="4,3" />
        <path d={CB([28,65],[70,44],[122,40],[172,46])} fill="none" stroke={CLR.punt} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
      </>
    ),
    punt_fake: (
      <>
        {commonField}{ball}
        <path d={P([28,65],[58,65],[86,65])} fill="none" stroke={CLR.return} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
        <path d={CB([28,65],[52,40],[86,28],[126,24])} fill="none" stroke={CLR.punt} strokeWidth="2.0" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.punt.replace('#','')})`} />
      </>
    ),

    pr_safe: (
      <>
        {commonField}
        <path d={P([168,65],[144,65],[122,65],[100,65])} fill="none" stroke={CLR.return} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
        <rect x="130" y="44" width="36" height="42" fill="none" stroke={CLR.special} strokeWidth="1.4" strokeDasharray="4,3" />
      </>
    ),
    pr_left: (
      <>
        {commonField}
        <path d={CB([168,65],[146,52],[120,34],[84,26])} fill="none" stroke={CLR.return} strokeWidth="2.5" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
        <path d={P([132,80],[116,66],[98,56])} fill="none" stroke={CLR.special} strokeWidth="1.6" strokeDasharray="5,3" />
      </>
    ),
    pr_right: (
      <>
        {commonField}
        <path d={CB([168,65],[146,78],[120,96],[84,104])} fill="none" stroke={CLR.return} strokeWidth="2.5" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
        <path d={P([132,50],[116,64],[98,74])} fill="none" stroke={CLR.special} strokeWidth="1.6" strokeDasharray="5,3" />
      </>
    ),
    pr_middle: (
      <>
        {commonField}
        <path d={P([168,65],[138,65],[106,65],[72,65])} fill="none" stroke={CLR.return} strokeWidth="2.5" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
      </>
    ),
    block_left: (
      <>
        {commonField}
        <path d={P([170,65],[148,52],[126,40],[104,34])} fill="none" stroke={CLR.pr || '#8b5cf6'} strokeWidth="2.3" markerEnd={`url(#ar-${'#8b5cf6'.replace('#','')})`} />
        <path d={P([170,80],[148,64],[126,50])} fill="none" stroke={CLR.pr || '#8b5cf6'} strokeWidth="2.3" markerEnd={`url(#ar-${'#8b5cf6'.replace('#','')})`} />
      </>
    ),
    block_right: (
      <>
        {commonField}
        <path d={P([170,65],[148,78],[126,90],[104,96])} fill="none" stroke={'#8b5cf6'} strokeWidth="2.3" markerEnd={`url(#ar-${'#8b5cf6'.replace('#','')})`} />
        <path d={P([170,50],[148,66],[126,80])} fill="none" stroke={'#8b5cf6'} strokeWidth="2.3" markerEnd={`url(#ar-${'#8b5cf6'.replace('#','')})`} />
      </>
    ),
    block_all: (
      <>
        {commonField}
        {[[170,40],[170,65],[170,90],[154,50],[154,80]].map((pt,i)=>(
          <path key={i} d={P(pt,[132,65],[108,65],[84,65])} fill="none" stroke={'#8b5cf6'} strokeWidth="2.1" markerEnd={`url(#ar-${'#8b5cf6'.replace('#','')})`} />
        ))}
      </>
    ),
    pr_poison: (
      <>
        {commonField}
        <circle cx="156" cy="65" r="10" fill="none" stroke={'#8b5cf6'} strokeWidth="1.6" />
        <path d={P([150,59],[162,71])} fill="none" stroke={'#8b5cf6'} strokeWidth="1.8" />
        <path d={P([162,59],[150,71])} fill="none" stroke={'#8b5cf6'} strokeWidth="1.8" />
      </>
    ),

    fg_std: (
      <>
        {commonField}
        <line x1="32" y1="40" x2="32" y2="90" stroke={CLR.line} strokeWidth="3" />
        <line x1="32" y1="40" x2="46" y2="40" stroke={CLR.line} strokeWidth="3" />
        <line x1="32" y1="90" x2="46" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={CB([54,65],[88,50],[128,44],[178,48])} fill="none" stroke={CLR.fieldgoal} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.fieldgoal.replace('#','')})`} />
      </>
    ),
    fg_left: (
      <>
        {commonField}
        <line x1="32" y1="40" x2="32" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={CB([54,65],[86,46],[126,26],[180,18])} fill="none" stroke={CLR.fieldgoal} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.fieldgoal.replace('#','')})`} />
      </>
    ),
    fg_right: (
      <>
        {commonField}
        <line x1="32" y1="40" x2="32" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={CB([54,65],[86,84],[126,104],[180,112])} fill="none" stroke={CLR.fieldgoal} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.fieldgoal.replace('#','')})`} />
      </>
    ),
    fg_long: (
      <>
        {commonField}
        <line x1="24" y1="40" x2="24" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={CB([46,65],[92,36],[138,28],[188,34])} fill="none" stroke={CLR.fieldgoal} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.fieldgoal.replace('#','')})`} />
      </>
    ),
    pat_std: (
      <>
        {commonField}
        <line x1="32" y1="40" x2="32" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={CB([58,65],[90,58],[122,56],[154,58])} fill="none" stroke={CLR.fieldgoal} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.fieldgoal.replace('#','')})`} />
      </>
    ),
    pat_safe: (
      <>
        {commonField}
        <line x1="32" y1="40" x2="32" y2="90" stroke={CLR.line} strokeWidth="3" />
        <rect x="44" y="46" width="24" height="38" fill="none" stroke={CLR.special} strokeWidth="1.4" strokeDasharray="4,3" />
        <path d={CB([58,65],[90,58],[122,56],[154,58])} fill="none" stroke={CLR.fieldgoal} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.fieldgoal.replace('#','')})`} />
      </>
    ),
    fg_fake_run: (
      <>
        {commonField}
        <line x1="32" y1="40" x2="32" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={P([58,65],[88,65],[118,65])} fill="none" stroke={CLR.return} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
      </>
    ),
    fg_fake_pass: (
      <>
        {commonField}
        <line x1="32" y1="40" x2="32" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={P([58,65],[82,56])} fill="none" stroke={CLR.special} strokeWidth="1.8" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
        <path d={CB([82,56],[112,38],[146,26],[182,20])} fill="none" stroke={CLR.fieldgoal} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.fieldgoal.replace('#','')})`} />
      </>
    ),

    fgb_std: (
      <>
        {commonField}
        <line x1="168" y1="40" x2="168" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={P([32,65],[68,65],[104,65],[138,65])} fill="none" stroke={CLR.block} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.block.replace('#','')})`} />
      </>
    ),
    fgb_left: (
      <>
        {commonField}
        <line x1="168" y1="40" x2="168" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={P([32,40],[62,48],[98,56],[138,62])} fill="none" stroke={CLR.block} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.block.replace('#','')})`} />
      </>
    ),
    fgb_right: (
      <>
        {commonField}
        <line x1="168" y1="40" x2="168" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={P([32,90],[62,82],[98,74],[138,68])} fill="none" stroke={CLR.block} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.block.replace('#','')})`} />
      </>
    ),
    fgb_middle: (
      <>
        {commonField}
        <line x1="168" y1="40" x2="168" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={P([32,65],[64,65],[96,65],[128,65],[144,65])} fill="none" stroke={CLR.block} strokeWidth="2.8" markerEnd={`url(#ar-${CLR.block.replace('#','')})`} />
      </>
    ),
    fgb_return: (
      <>
        {commonField}
        <line x1="168" y1="40" x2="168" y2="90" stroke={CLR.line} strokeWidth="3" />
        <path d={CB([144,65],[120,52],[96,44],[54,40])} fill="none" stroke={CLR.return} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.return.replace('#','')})`} />
      </>
    ),
    fgb_safe: (
      <>
        {commonField}
        <line x1="168" y1="40" x2="168" y2="90" stroke={CLR.line} strokeWidth="3" />
        <rect x="124" y="44" width="26" height="42" fill="none" stroke={CLR.special} strokeWidth="1.4" strokeDasharray="4,3" />
      </>
    ),

    run_inside: (
      <>
        {commonField}
        <path d={P([36,65],[68,65],[100,65],[132,65])} fill="none" stroke={CLR.clock} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.clock.replace('#','')})`} />
        <circle cx="170" cy="22" r="10" fill="none" stroke={CLR.clock} strokeWidth="1.6" />
        <path d={P([170,22],[170,16])} fill="none" stroke={CLR.clock} strokeWidth="1.4" />
        <path d={P([170,22],[176,22])} fill="none" stroke={CLR.clock} strokeWidth="1.4" />
      </>
    ),
    run_duo: (
      <>
        {commonField}
        <path d={P([36,65],[74,65],[110,65],[144,65])} fill="none" stroke={CLR.clock} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.clock.replace('#','')})`} />
        <path d={P([54,54],[72,64],[90,65])} fill="none" stroke={CLR.special} strokeWidth="1.6" strokeDasharray="5,3" />
        <path d={P([54,76],[72,66],[90,65])} fill="none" stroke={CLR.special} strokeWidth="1.6" strokeDasharray="5,3" />
      </>
    ),
    run_power: (
      <>
        {commonField}
        <path d={P([36,65],[66,65],[96,65],[126,65])} fill="none" stroke={CLR.clock} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.clock.replace('#','')})`} />
        <path d={CB([54,88],[70,78],[84,70],[96,65])} fill="none" stroke={CLR.special} strokeWidth="1.8" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    run_stretch: (
      <>
        {commonField}
        <path d={CB([36,65],[64,50],[96,44],[144,42])} fill="none" stroke={CLR.clock} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.clock.replace('#','')})`} />
      </>
    ),
    pass_boot: (
      <>
        {commonField}
        <path d={P([34,65],[56,78],[74,84])} fill="none" stroke={CLR.clock} strokeWidth="1.8" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.clock.replace('#','')})`} />
        <path d={CB([74,84],[108,70],[136,58],[166,56])} fill="none" stroke={CLR.special} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    pass_stick: (
      <>
        {commonField}
        <path d={P([42,65],[84,65],[110,65])} fill="none" stroke={CLR.clock} strokeWidth="2.3" markerEnd={`url(#ar-${CLR.clock.replace('#','')})`} />
        <path d={P([110,65],[110,56])} fill="none" stroke={CLR.special} strokeWidth="1.6" />
      </>
    ),
    pass_sprint: (
      <>
        {commonField}
        <path d={P([34,65],[52,54],[68,52])} fill="none" stroke={CLR.clock} strokeWidth="1.8" strokeDasharray="5,3" markerEnd={`url(#ar-${CLR.clock.replace('#','')})`} />
        <path d={CB([68,52],[102,48],[136,44],[170,40])} fill="none" stroke={CLR.special} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    clock_kneel: (
      <>
        {commonField}
        <circle cx="70" cy="65" r="10" fill="none" stroke={CLR.clock} strokeWidth="1.8" />
        <path d={P([64,59],[76,71])} fill="none" stroke={CLR.clock} strokeWidth="2" />
        <path d={P([76,59],[64,71])} fill="none" stroke={CLR.clock} strokeWidth="2" />
      </>
    ),

    tm_out: (
      <>
        {commonField}
        <path d={P([36,65],[88,65],[110,65],[110,40])} fill="none" stroke={CLR.twoMin} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
      </>
    ),
    tm_stick: (
      <>
        {commonField}
        <path d={P([36,65],[88,65],[114,65])} fill="none" stroke={CLR.twoMin} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
        <path d={P([114,65],[114,56])} fill="none" stroke={CLR.special} strokeWidth="1.6" />
      </>
    ),
    tm_smash: (
      <>
        {commonField}
        <path d={P([36,65],[88,65],[110,65])} fill="none" stroke={CLR.twoMin} strokeWidth="2.2" />
        <path d={CB([56,65],[80,46],[110,34],[152,24])} fill="none" stroke={CLR.special} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    tm_verts: (
      <>
        {commonField}
        {[60,88,116,144].map((x,i)=>(
          <path key={i} d={P([x,96],[x,22])} fill="none" stroke={CLR.twoMin} strokeWidth="2.1" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
        ))}
      </>
    ),
    tm_dagger: (
      <>
        {commonField}
        <path d={P([48,86],[48,36],[100,36])} fill="none" stroke={CLR.twoMin} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
        <path d={CB([72,86],[86,56],[118,42],[166,30])} fill="none" stroke={CLR.special} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    tm_mesh: (
      <>
        {commonField}
        <path d={CB([44,50],[72,64],[98,66],[126,66])} fill="none" stroke={CLR.twoMin} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
        <path d={CB([44,80],[72,66],[98,64],[126,64])} fill="none" stroke={CLR.special} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    tm_spike: (
      <>
        {commonField}
        <circle cx="76" cy="65" r="11" fill="none" stroke={CLR.twoMin} strokeWidth="1.8" />
        <path d={P([76,52],[76,79])} fill="none" stroke={CLR.twoMin} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
      </>
    ),
    tm_comeback: (
      <>
        {commonField}
        <path d={P([42,86],[42,40],[74,40])} fill="none" stroke={CLR.twoMin} strokeWidth="2.3" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
      </>
    ),
    tm_fg: (
      <>
        {commonField}
        <path d={P([36,65],[84,65],[118,65])} fill="none" stroke={CLR.twoMin} strokeWidth="2.3" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
        <line x1="160" y1="44" x2="160" y2="86" stroke={CLR.fieldgoal} strokeWidth="2.8" />
      </>
    ),
    tm_hail: (
      <>
        {commonField}
        <path d={CB([36,65],[78,18],[130,18],[182,46])} fill="none" stroke={CLR.twoMin} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
        <circle cx="182" cy="46" r="9" fill="none" stroke={CLR.special} strokeWidth="1.5" strokeDasharray="4,3" />
      </>
    ),

    def_prevent: (
      <>
        {commonField}
        <path d={P([44,96],[44,24])} fill="none" stroke={CLR.defense} strokeWidth="2.1" />
        <path d={P([92,96],[92,24])} fill="none" stroke={CLR.defense} strokeWidth="2.1" />
        <path d={P([140,96],[140,24])} fill="none" stroke={CLR.defense} strokeWidth="2.1" />
      </>
    ),
    def_funnel: (
      <>
        {commonField}
        <path d={P([40,22],[84,54],[100,65])} fill="none" stroke={CLR.defense} strokeWidth="2.0" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
        <path d={P([160,22],[116,54],[100,65])} fill="none" stroke={CLR.defense} strokeWidth="2.0" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
      </>
    ),
    def_2man: (
      <>
        {commonField}
        <path d={CB([44,36],[68,24],[92,20],[120,24])} fill="none" stroke={CLR.defense} strokeWidth="2.2" />
        <path d={CB([44,94],[68,106],[92,110],[120,106])} fill="none" stroke={CLR.defense} strokeWidth="2.2" />
        <path d={P([146,65],[98,65],[56,65])} fill="none" stroke={CLR.bracket} strokeWidth="2.0" markerEnd={`url(#ar-${CLR.bracket.replace('#','')})`} />
      </>
    ),
    def_quarters: (
      <>
        {commonField}
        {[56,92,128,164].map((x,i)=>(
          <path key={i} d={P([x,100],[x,26])} fill="none" stroke={CLR.defense} strokeWidth="2.0" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
        ))}
      </>
    ),
    def_drop8: (
      <>
        {commonField}
        <path d={P([44,65],[76,65])} fill="none" stroke={CLR.defense} strokeWidth="2.4" />
        {[84,104,124,144,164].map((x,i)=>(
          <circle key={i} cx={x} cy={i % 2 === 0 ? 40 : 90} r="5" fill="none" stroke={CLR.defense} strokeWidth="1.6" />
        ))}
      </>
    ),
    def_bracket: (
      <>
        {commonField}
        <path d={CB([56,40],[80,24],[112,24],[142,40])} fill="none" stroke={CLR.bracket} strokeWidth="2.3" />
        <path d={CB([56,90],[80,106],[112,106],[142,90])} fill="none" stroke={CLR.bracket} strokeWidth="2.3" />
      </>
    ),

    stop_c1: (
      <>
        {commonField}
        <path d={P([36,65],[70,65],[102,65],[134,65])} fill="none" stroke={CLR.defense} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
        <path d={P([160,65],[124,65])} fill="none" stroke={CLR.zone} strokeWidth="2.0" markerEnd={`url(#ar-${CLR.zone.replace('#','')})`} />
      </>
    ),
    stop_doublea: (
      <>
        {commonField}
        <path d={P([70,36],[86,52],[100,65])} fill="none" stroke={CLR.defense} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
        <path d={P([70,94],[86,78],[100,65])} fill="none" stroke={CLR.defense} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
      </>
    ),
    stop_fire: (
      <>
        {commonField}
        <path d={P([42,65],[74,65],[106,65])} fill="none" stroke={CLR.defense} strokeWidth="2.5" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
        <path d={P([132,28],[132,102])} fill="none" stroke={CLR.zone} strokeWidth="2.0" />
      </>
    ),
    stop_robber: (
      <>
        {commonField}
        <path d={P([126,65],[100,65],[76,65])} fill="none" stroke={CLR.robber} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.robber.replace('#','')})`} />
        <path d={CB([46,50],[68,64],[92,66],[120,66])} fill="none" stroke={CLR.defense} strokeWidth="2.0" />
      </>
    ),
    stop_2man: (
      <>
        {commonField}
        <path d={CB([48,34],[76,20],[108,20],[138,34])} fill="none" stroke={CLR.bracket} strokeWidth="2.3" />
        <path d={CB([48,96],[76,110],[108,110],[138,96])} fill="none" stroke={CLR.bracket} strokeWidth="2.3" />
      </>
    ),
    stop_zero: (
      <>
        {commonField}
        {[36,52,68,84,100,116].map((x,i)=>(
          <path key={i} d={P([x, i % 2 === 0 ? 32 : 98],[100,65])} fill="none" stroke={CLR.defense} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
        ))}
      </>
    ),

    mode_clock: (
      <>
        {commonField}
        <circle cx="58" cy="65" r="18" fill="none" stroke={CLR.mode} strokeWidth="1.8" />
        <path d={P([58,65],[58,54])} fill="none" stroke={CLR.mode} strokeWidth="1.8" />
        <path d={P([58,65],[68,65])} fill="none" stroke={CLR.mode} strokeWidth="1.8" />
        <path d={P([92,65],[126,65],[156,65])} fill="none" stroke={CLR.clock} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.clock.replace('#','')})`} />
      </>
    ),
    mode_balanced: (
      <>
        {commonField}
        <path d={P([40,40],[88,40],[136,40])} fill="none" stroke={CLR.mode} strokeWidth="2.0" markerEnd={`url(#ar-${CLR.mode.replace('#','')})`} />
        <path d={P([40,90],[88,90],[136,90])} fill="none" stroke={CLR.twoMin} strokeWidth="2.0" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
      </>
    ),
    mode_emergency: (
      <>
        {commonField}
        {[40,64,88,112,136].map((x,i)=>(
          <path key={i} d={P([x,90],[x,30])} fill="none" stroke={CLR.twoMin} strokeWidth="2.0" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
        ))}
      </>
    ),
    mode_desperation: (
      <>
        {commonField}
        <path d={CB([34,65],[70,18],[124,18],[186,42])} fill="none" stroke={CLR.twoMin} strokeWidth="2.6" markerEnd={`url(#ar-${CLR.twoMin.replace('#','')})`} />
        <path d={CB([34,65],[70,112],[124,112],[186,88])} fill="none" stroke={CLR.special} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.special.replace('#','')})`} />
      </>
    ),
    mode_protect: (
      <>
        {commonField}
        {[48,84,120,156].map((x,i)=>(
          <path key={i} d={P([x,96],[x,24])} fill="none" stroke={CLR.mode} strokeWidth="2.0" />
        ))}
      </>
    ),
    mode_punt: (
      <>
        {commonField}
        <path d={P([34,65],[72,65],[110,65],[148,65])} fill="none" stroke={CLR.mode} strokeWidth="2.4" markerEnd={`url(#ar-${CLR.mode.replace('#','')})`} />
        <line x1="168" y1="42" x2="168" y2="88" stroke={CLR.punt} strokeWidth="2.6" />
      </>
    ),
    mode_ballback: (
      <>
        {commonField}
        <path d={P([34,40],[72,52],[100,65])} fill="none" stroke={CLR.mode} strokeWidth="2.3" markerEnd={`url(#ar-${CLR.mode.replace('#','')})`} />
        <path d={P([34,90],[72,78],[100,65])} fill="none" stroke={CLR.defense} strokeWidth="2.3" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
      </>
    ),
    mode_muststop: (
      <>
        {commonField}
        {[36,52,68,84,100,116,132].map((x,i)=>(
          <path key={i} d={P([x, i % 2 === 0 ? 30 : 100],[100,65])} fill="none" stroke={CLR.defense} strokeWidth="2.2" markerEnd={`url(#ar-${CLR.defense.replace('#','')})`} />
        ))}
      </>
    ),
  };

  return (
    <svg viewBox="0 0 200 130" width="100%" style={{ display: 'block' }}>
      <defs>
        {ARROW_COLORS.map(color => (
          <marker key={color}
            id={`ar-${color.replace('#','')}`}
            markerWidth="7" markerHeight="7"
            refX="6" refY="3.5"
            orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0.5 L0,6.5 L7,3.5 z" fill={color} />
          </marker>
        ))}
      </defs>
      {sketches[item.visual] || (
        <>
          {commonField}
          <path d={P([32,65],[84,65],[136,65])} fill="none" stroke={arrow} strokeWidth="2.4" markerEnd={`url(#ar-${arrow.replace('#','')})`} />
        </>
      )}
    </svg>
  );
}

/* ── PLAY CARD ───────────────────────────────── */
function ItemCard({ item, onClick }) {
  const meta = CAT_META[item.cat];
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: 'pointer',
        background: hov ? '#1a1221' : '#110b16',
        border: `1px solid ${hov ? meta.accent + '55' : '#24182d'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'all 0.18s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 6px 24px ${meta.accent}28` : '0 2px 8px rgba(0,0,0,0.5)',
      }}>
      <div style={{ position: 'relative' }}>
        <Diagram item={item} />
        <div style={{
          position: 'absolute', top: 6, right: 7,
          background: meta.accent + '22',
          border: `1px solid ${meta.accent}55`,
          borderRadius: 4, padding: '2px 5px',
          fontSize: 8, fontWeight: 800, letterSpacing: '1.5px',
          color: meta.accent, fontFamily: 'monospace',
        }}>{meta.short}</div>
        <div style={{
          position: 'absolute', top: 6, left: 7,
          color: 'rgba(255,255,255,0.22)', fontSize: 9,
          fontWeight: 700, fontFamily: 'monospace',
        }}>{String(item.id).padStart(2,'0')}</div>
      </div>
      <div style={{
        padding: '6px 9px 8px',
        borderTop: `1px solid ${hov ? meta.accent + '35' : '#24182d'}`,
        background: hov ? meta.bg : 'transparent',
      }}>
        <div style={{
          color: '#f5ebff', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.3px', lineHeight: 1.3,
          fontFamily: "'Courier New', monospace",
        }}>{item.name}</div>
      </div>
    </div>
  );
}

/* ── MODAL ───────────────────────────────────── */
function ItemModal({ item, onClose }) {
  const meta = CAT_META[item.cat];

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(6,2,10,0.9)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #170f1c 0%, #0d0811 100%)',
        border: `1px solid ${meta.accent}45`,
        borderRadius: 18,
        overflow: 'hidden',
        width: '100%', maxWidth: 460,
        boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${meta.accent}18`,
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{
          padding: '14px 16px 12px',
          background: `linear-gradient(90deg, ${meta.accent}14, transparent)`,
          borderBottom: `1px solid ${meta.accent}30`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{
                background: meta.accent, borderRadius: 4, padding: '2px 7px',
                fontSize: 9, fontWeight: 900, letterSpacing: '2px',
                color: '#000', fontFamily: 'monospace',
              }}>{meta.short}</div>
              <span style={{ color:'rgba(255,255,255,0.22)', fontSize:9, fontFamily:'monospace' }}>
                CALL #{String(item.id).padStart(2,'0')}
              </span>
            </div>
            <div style={{
              color: '#f5ebff', fontSize: 20, fontWeight: 900,
              fontFamily: "'Courier New', monospace", letterSpacing: '-0.5px',
            }}>{item.name}</div>
            <div style={{ color: meta.accent, fontSize: 11, fontWeight: 500, opacity: 0.82, marginTop: 2 }}>
              {item.label}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.5)',
            width: 30, height: 30, borderRadius: 15,
            cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>×</button>
        </div>

        <div style={{ background: '#09050d', padding: '0 0 4px' }}>
          <Diagram item={item} />
        </div>

        <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${meta.accent}20` }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,0.28)', marginBottom: 8, fontFamily: 'monospace',
          }}>DESCRIPTION</div>
          <div style={{
            color: 'rgba(255,255,255,0.78)',
            fontSize: 12,
            lineHeight: 1.45,
            marginBottom: 10,
          }}>
            {item.desc}
          </div>

          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,0.28)', marginBottom: 8, fontFamily: 'monospace',
          }}>TAGS</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {item.tags.map(tag => (
              <div key={tag} style={{
                padding: '4px 8px',
                borderRadius: 999,
                background: meta.accent + '18',
                border: `1px solid ${meta.accent}40`,
                color: meta.accent,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.4px',
                fontFamily: 'monospace',
              }}>
                {tag.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── TABS ────────────────────────────────────── */
const CATS = [
  { id:'all',      label:'All 84',      accent:'#94a3b8' },
  { id:'kickoff',  label:'KO (8)',      accent:'#60a5fa' },
  { id:'kr',       label:'KR (6)',      accent:'#f59e0b' },
  { id:'punt',     label:'Punt (10)',   accent:'#a78bfa' },
  { id:'pr',       label:'PR (8)',      accent:'#8b5cf6' },
  { id:'fg',       label:'FG (8)',      accent:'#ef4444' },
  { id:'fgblock',  label:'FG Block (6)',accent:'#f472b6' },
  { id:'fourmin',  label:'4-Min (8)',   accent:'#fbbf24' },
  { id:'twomin',   label:'2-Min (10)',  accent:'#38bdf8' },
  { id:'killdef',  label:'Kill Def (6)',accent:'#fb7185' },
  { id:'stopdef',  label:'Stop Def (6)',accent:'#ef4444' },
  { id:'offmode',  label:'Off Modes (4)',accent:'#34d399' },
  { id:'defmode',  label:'Def Modes (4)',accent:'#10b981' },
];

/* ── APP ─────────────────────────────────────── */
export default function SpecialTeamsAndTimeManagementLibrary() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const displayed = filter === 'all' ? ITEMS : ITEMS.filter(p => p.cat === filter);

  return (
    <div style={{
      background: '#07040a',
      minHeight: '100vh',
      fontFamily: "'Courier New', monospace",
      maxWidth: 560,
      margin: '0 auto',
      position: 'relative',
    }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes cardIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:#07040a }
        ::-webkit-scrollbar-thumb { background:#2b1237; border-radius:2px }
        * { box-sizing:border-box }
      `}</style>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(180deg, #160b1d 0%, #0d0712 100%)',
        borderBottom: '1px solid #24182d',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 16px 0',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 8px rgba(52,211,153,0.7))' }}>
            🏈
          </div>
          <div>
            <div style={{ color:'#f5ebff', fontWeight:900, fontSize:17, letterSpacing:'1px', lineHeight:1.1 }}>
              SPECIAL TEAMS + TIME MGMT
            </div>
            <div style={{ color:'#34d399', fontSize:9, fontWeight:700, letterSpacing:'3px', opacity:0.82 }}>
              BASIC PLAY LIBRARY · SITUATIONAL PACKAGE · DECISION MODES
            </div>
          </div>
          <div style={{ marginLeft:'auto', color:'rgba(255,255,255,0.18)', fontSize:10, letterSpacing:'1px' }}>
            {displayed.length} CALLS
          </div>
        </div>

        <div style={{ display:'flex', gap:2, overflowX:'auto', scrollbarWidth:'none' }}>
          {CATS.map(cat => {
            const active = filter === cat.id;
            return (
              <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
                background: active ? cat.accent + '18' : 'transparent',
                color: active ? cat.accent : 'rgba(255,255,255,0.3)',
                border: 'none',
                borderBottom: active ? `2px solid ${cat.accent}` : '2px solid transparent',
                padding: '7px 10px 9px',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap', letterSpacing: '0.5px',
                fontFamily: "'Courier New', monospace",
                transition: 'all 0.15s',
                flexShrink: 0,
              }}>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8, padding: 10,
      }}>
        {displayed.map((item, idx) => (
          <div key={item.id} style={{
            animation: `cardIn 0.25s ease both`,
            animationDelay: `${idx * 0.02}s`,
          }}>
            <ItemCard item={item} onClick={() => setSelected(item)} />
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{
        textAlign: 'center', padding: '12px 16px 20px',
        borderTop: '1px solid #160b1d',
        color: 'rgba(255,255,255,0.12)',
        fontSize: 9, letterSpacing: '2px',
      }}>
        SPECIAL TEAMS / TIME MGMT LIBRARY · 84 CALLS · TAP TO DETAIL
      </div>

      {/* MODAL */}
      {selected && <ItemModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}