(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, ARENA_PAD = 42, TOP_PAD = 98;

  const $ = (id) => document.getElementById(id);
  const onClick = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  const titleOverlay = $('title-overlay'), storyUI = $('story-ui'), readyOverlay = $('ready-overlay');
  const agentIntroOverlay = $('agent-intro-overlay');
  const hubUI = $('hub-ui'), hud = $('hud'), controlsHint = $('controls-hint');
  const metaOverlay = $('meta-overlay'), spritesOverlay = $('sprites-overlay');
  const shopOverlay = $('shop-overlay'), endOverlay = $('end-overlay'), bannerToast = $('banner-toast');

  const SPRITE_DEFS = [
    { key: 'agentPortrait', base: 'agentin', alt: ['frau','agentin_tierschutz','tierschutz','nova'], label: '[Shop] Agentin (Galactic Animal Protection)' },
    { key: 'scientist',   base: 'wissenschaftler',      label: '[Held] Dr. Schnurr' },
    { key: 'cat',         base: 'katze',                label: '[Held] Katze Mimi' },
    { key: 'catFriend',   base: 'katze_freundin',       label: '[Event] Mimis Freundin' },
    { key: 'houseLab',    base: 'haus_labor',           label: '[Kulisse] Dr. Schnurrs Labor-Haus' },
    { key: 'houseNeigh',  base: 'haus_nachbar',         label: '[Kulisse] Nachbarhaus' },
    { key: 'tree',        base: 'baum',                 label: '[Kulisse] Gartenbaum' },
    { key: 'propBush',    base: 'prop_gebuesch',        label: '[Boss-Spot] Gebüsch' },
    { key: 'propTrash',   base: 'prop_muelltonne',      label: '[Boss-Spot] Mülltonne' },
    { key: 'propBox',     base: 'prop_karton',          label: '[Boss-Spot] Labor-Karton' },
    { key: 'propLeaves',  base: 'prop_laubhaufen',      label: '[Boss-Spot] Laubhaufen' },
    { key: 'strayCat',    base: 'gegner_kater',         label: '[Gegner] Zombie-Kater' },
    { key: 'squirrel',    base: 'gegner_eichhoernchen', label: '[Gegner] Mutanten-Hörnchen' },
    { key: 'hedgehog',    base: 'gegner_igel',          label: '[Gegner] Bio-Stachel-Igel' },
    { key: 'megaCat',     base: 'boss_kater',           label: '[Boss] Alpha-Zombie-Kater' },
    { key: 'bossRaccoon', base: 'boss_waschbaer',       label: '[Boss] Zombie-Waschbär' },
    { key: 'corpBot',     base: 'gegner_roboter',       label: '[Firma] OmniCorp Roboter' },
    { key: 'corpBoss',    base: 'boss_firma',           label: '[Firma] Endboss-Mech' },
    { key: 'intro1',      base: 'intro_1',              label: '[Intro] Szene 1 (Konzern)' },
    { key: 'intro2',      base: 'intro_2',              label: '[Intro] Szene 2 (Explosion)' },
    { key: 'intro3',      base: 'intro_3',              label: '[Intro] Szene 3 (Mutation)' },
    { key: 'intro4',      base: 'intro_4',              label: '[Intro] Szene 4 (Bei Mimi)' },
   { key: 'labTable',  base: 'Mobel_labortisch', alt: ['mobel_labortisch','labortisch'], label: '[Labor] Labortisch' },
    { key: 'catTree',   base: 'mobel_kazenbett',  alt: ['mobel_katzenbett','mobel_katzenbaum','katzenbaum','katzenbett'], label: '[Labor] Katzenbett' },
    { key: 'labSofa',   base: 'mobel_sofa',       alt: ['sofa'], label: '[Labor] Sofa' },
    { key: 'labShelf',  base: 'mobel_regal',      alt: ['regal','buecherregal'], label: '[Labor] Labor-Regal' },


  ];
  const sprites = {};

  const AUDIO_DEFS = [
    { key:'music_hub',    isMusic:true,  label:'[Musik] Titel / Labor',      names:['musik_labor','musik_titel','titel','labor','menu'] },
    { key:'music_action', isMusic:true,  label:'[Musik] Spielfeld & Shop',   names:['musik_action','techno_kampf','action','musik_kampf','techno','musik'] },
    { key:'shoot',        isMusic:false, label:'[SFX] Laser-Schuss',         names:['laser','schuss','shoot'] },
    { key:'shield',       isMusic:false, label:'[SFX] Schutzschild',         names:['schild','shield'] },
    { key:'mautz',        isMusic:false, label:'[SFX] Mimis Mautz!',         names:['mautz','miau','meow'] },
    { key:'clang',        isMusic:false, label:'[SFX] Mülltonne/Scheppern',  names:['muelltonne','tonne','klirr','clang'] },
    { key:'hurt',         isMusic:false, label:'[SFX] Treffer/Autsch',       names:['autsch','treffer','hurt'] },
    { key:'orb',          isMusic:false, label:'[SFX] Energie-Orb',          names:['energie','orb','pickup'] },
    { key:'zap',          isMusic:false, label:'[SFX] Teslaspule',           names:['tesla','blitz','zap'] },
    { key:'dash',         isMusic:false, label:'[SFX] Jetpack-Dash',         names:['dash','jetpack'] },
    { key:'boss',         isMusic:false, label:'[SFX] Boss-Alarm',           names:['boss','alarm'] },
    { key:'count_5',      isMusic:false, label:'[Stimme] Countdown 5',       names:['count_5'] },
    { key:'count_4',      isMusic:false, label:'[Stimme] Countdown 4',       names:['count_4'] },
    { key:'count_3',      isMusic:false, label:'[Stimme] Countdown 3',       names:['count_3'] },
    { key:'count_2',      isMusic:false, label:'[Stimme] Countdown 2',       names:['count_2'] },
    { key:'count_1',      isMusic:false, label:'[Stimme] Countdown 1',       names:['count_1'] },
    { key:'shop_intro',   isMusic:false, label:'[Stimme] Tierschutz Intro',  names:['shop_intro','tierschutz_intro'] },
    { key:'shop_arrived', isMusic:false, label:'[Stimme] Supply Arrived',    names:['shop_arrived','supply','supplies'] },
    { key:'shop_1',       isMusic:false, label:'[Stimme] Shop Spruch 1',     names:['shop_1'] },
    { key:'shop_2',       isMusic:false, label:'[Stimme] Shop Spruch 2',     names:['shop_2'] },
    { key:'shop_3',       isMusic:false, label:'[Stimme] Shop Spruch 3',     names:['shop_3'] },
    { key:'shop_4',       isMusic:false, label:'[Stimme] Shop Spruch 4',     names:['shop_4'] },
    { key:'shop_5',       isMusic:false, label:'[Stimme] Shop Spruch 5',     names:['shop_5'] },
    { key:'shop_6',       isMusic:false, label:'[Stimme] Shop Spruch 6',     names:['shop_6'] },
    { key:'shop_7',       isMusic:false, label:'[Stimme] Shop Spruch 7',     names:['shop_7'] },
    { key:'shop_8',       isMusic:false, label:'[Stimme] Shop Spruch 8',     names:['shop_8'] },
    { key:'shop_scrap',   isMusic:false, label:'[Stimme] Zerlegen',          names:['shop_scrap','zerlegen'] },
    { key:'shop_omega',   isMusic:false, label:'[Stimme] Omega-Waffe',       names:['shop_omega','omega'] },
    { key:'shop_snack',   isMusic:false, label:'[Stimme] Fisch-Snack',       names:['shop_snack','snack'] }
  ];
  const customAudio = {};
  let activeVoice = null, audioUnlocked = false;

  function updateMediaBadges() {
    const imgC = Object.values(sprites).filter(s => s.loaded).length;
    const audC = Object.values(customAudio).filter(a => a.loaded).length;
    const txt = `🖼️ ${imgC}/${SPRITE_DEFS.length} · 🔊 ${audC}/${AUDIO_DEFS.length}`;
    $('sprites-check-btn').textContent = txt; $('title-sprites-btn').textContent = txt;
  }

  for (const def of SPRITE_DEFS) {
    const bases = [def.base, ...(def.alt || [])], paths = [];
    for (const b of bases) paths.push(`bilder/${b}.png`,`bilder/${b}.webp`,`bilder/${b}.jpg`,`bilder/${b}.png.png`,`${b}.png`);
    const entry = { img: new Image(), loaded: false, usedPath: '', def };
    let idx = 0;
    const tryNext = () => {
      if (idx >= paths.length) return;
      const p = paths[idx++], im = new Image();
      im.onload = () => {
        if (im.naturalWidth > 0) {
          entry.img = im; entry.loaded = true; entry.usedPath = p; updateMediaBadges();
          if (def.key === 'agentPortrait') {
            $('agent-intro-img').src = p; $('agent-intro-img').classList.remove('hidden'); $('agent-intro-fallback').classList.add('hidden');
            $('shop-agent-img').src = p; $('shop-agent-img').classList.remove('hidden'); $('shop-agent-fallback').classList.add('hidden');
          }
        } else tryNext();
      };
      im.onerror = tryNext; im.src = p;
    };
    sprites[def.key] = entry; tryNext();
  }

  for (const def of AUDIO_DEFS) {
    const paths = [];
    for (const nm of def.names) paths.push(`sounds/${nm}.mp3`, `sounds/${nm}.wav`, `${nm}.mp3`);
    const entry = { loaded: false, src: '', audio: null, pool: [], poolIdx: 0, lastPlayed: 0, def };
    let idx = 0;
    const tryNext = () => {
      if (idx >= paths.length) return;
      const p = paths[idx++], au = new Audio();
      au.preload = 'auto';
      au.oncanplaythrough = () => {
        if (entry.loaded) return;
        entry.loaded = true; entry.src = p;
        if (def.isMusic) { au.loop = true; entry.audio = au; }
        else entry.pool = [au, new Audio(p), new Audio(p)];
        updateMediaBadges();
        if (audioUnlocked) syncMusic();
      };
      au.onerror = () => tryNext();
      au.src = p;
    };
    customAudio[def.key] = entry; tryNext();
  }

  function openSpritesModal() {
    const grid = $('sprite-grid'); grid.innerHTML = '';
    for (const def of SPRITE_DEFS) {
      const e = sprites[def.key], row = document.createElement('div');
      row.className = `sprite-row ${e.loaded ? 'ok' : ''}`;
      row.innerHTML = `<div><strong>${def.label}</strong><div style="font-size:11px;color:#94a3b8;">${e.loaded ? e.usedPath : `bilder/${def.base}.png`}</div></div><span>${e.loaded ? '✅' : '❌'}</span>`;
      grid.appendChild(row);
    }
    for (const def of AUDIO_DEFS) {
      const e = customAudio[def.key], row = document.createElement('div');
      row.className = `sprite-row ${e.loaded ? 'ok' : ''}`;
      row.innerHTML = `<div><strong>${def.label}</strong><div style="font-size:11px;color:#94a3b8;">${e.loaded ? e.src : `sounds/${def.names[0]}.mp3`}</div></div><span>${e.loaded ? '✅' : '⚪'}</span>`;
      grid.appendChild(row);
    }
    spritesOverlay.classList.remove('hidden');
  }

  let saveData = { metaPoints: 0, hpLevel: 0, shieldLevel: 0, speedLevel: 0 };
  try { const raw = localStorage.getItem('drSchnurrSaveV3'); if (raw) saveData = { ...saveData, ...JSON.parse(raw) }; } catch (e) {}
  function persistSave() {
    try { localStorage.setItem('drSchnurrSaveV3', JSON.stringify(saveData)); } catch (e) {}
    $('meta-points-text').textContent = saveData.metaPoints;
  }
  $('meta-points-text').textContent = saveData.metaPoints;

  let audioCtx = null, muted = false;
  function initAudio() {
    audioUnlocked = true;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    syncMusic();
  }

  function syncMusic() {
    if (!audioUnlocked) return;
    const inRun = (state === 'PLAYING' || state === 'SHOP' || state === 'AGENT_INTRO' || state === 'READY_PROMPT');
    const wantKey = inRun
      ? (customAudio.music_action.loaded ? 'music_action' : null)
      : (customAudio.music_hub.loaded ? 'music_hub' : null);
    for (const k of ['music_hub','music_action']) {
      const m = customAudio[k];
      if (!m || !m.loaded || !m.audio) continue;
      if (!muted && k === wantKey) {
        m.audio.volume = 0.38;
        if (m.audio.paused) m.audio.play().catch(()=>{});
      } else {
        if (!m.audio.paused) m.audio.pause();
      }
    }
  }

  function playVoice(key, onFinish = null) {
    if (muted) { if (onFinish) setTimeout(onFinish, 1800); return false; }
    const custom = customAudio[key];
    if (!custom || !custom.loaded || custom.pool.length === 0) {
      if (onFinish) setTimeout(onFinish, 3200);
      return false;
    }
    if (activeVoice && !activeVoice.paused) { activeVoice.onended = null; activeVoice.pause(); activeVoice.currentTime = 0; }
    const snd = custom.pool[0];
    snd.currentTime = 0; snd.volume = 0.92;
    activeVoice = snd;
    if (onFinish) snd.onended = () => { snd.onended = null; onFinish(); };
    snd.play().catch(() => { if (onFinish) setTimeout(onFinish, 2500); });
    return true;
  }

  function playRandomShopVoice() {
    const loadedKeys = ['shop_1','shop_2','shop_3','shop_4','shop_5','shop_6','shop_7','shop_8'].filter(k => customAudio[k].loaded);
    if (loadedKeys.length > 0) playVoice(loadedKeys[Math.floor(Math.random()*loadedKeys.length)]);
  }

  function playSound(t) {
    if (muted) return;
    const custom = customAudio[t];
    if (custom && custom.loaded && custom.pool.length > 0) {
      const nowMs = performance.now();
      if (nowMs - custom.lastPlayed < ((t==='shoot'||t==='orb')?65:25)) return;
      custom.lastPlayed = nowMs;
      const snd = custom.pool[custom.poolIdx % custom.pool.length];
      custom.poolIdx++; snd.currentTime = 0; snd.volume = (t==='shoot'||t==='orb')?0.3:0.55;
      snd.play().catch(()=>{}); return;
    }
    if (!audioCtx) return;
    const n = audioCtx.currentTime, o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    if (t === 'mautz') {
      o.type='triangle'; o.frequency.setValueAtTime(520,n); o.frequency.linearRampToValueAtTime(860,n+0.14); o.frequency.exponentialRampToValueAtTime(420,n+0.42);
      g.gain.setValueAtTime(0.16,n); g.gain.exponentialRampToValueAtTime(0.001,n+0.45); o.start(n); o.stop(n+0.45); return;
    }
    if (t === 'purr') {
      o.type='sine'; o.frequency.setValueAtTime(580,n); o.frequency.linearRampToValueAtTime(760,n+0.18);
      g.gain.setValueAtTime(0.08,n); g.gain.exponentialRampToValueAtTime(0.001,n+0.22); o.start(n); o.stop(n+0.22); return;
    }
    const map = { shoot:['triangle',520,180,.08,.05], zap:['sawtooth',880,320,.11,.05], orb:['sine',660,990,.07,.05],
      dash:['sine',300,780,.14,.1], shield:['sine',280,620,.24,.12], hurt:['square',420,140,.2,.1], clang:['square',180,75,.28,.13],
      alarm:['square',340,110,.28,.11], boss:['sawtooth',150,360,.34,.12], buy:['triangle',440,660,.14,.09] };
    const s = map[t]; if (!s) return;
    o.type = s[0]; o.frequency.setValueAtTime(s[1], n); o.frequency.exponentialRampToValueAtTime(s[2], n + s[3]);
    g.gain.setValueAtTime(s[4], n); g.gain.exponentialRampToValueAtTime(0.001, n + s[3]);
    o.start(n); o.stop(n + s[3]);
  }
  onClick('mute-btn', () => { muted = !muted; $('mute-btn').textContent = muted ? '🔇' : '🔊'; if (muted && activeVoice) activeVoice.pause(); syncMusic(); });

  const STORY_PACKS = {
    INTRO: [
      { spk:'Dr. Schnurr', tag:'SZENE 1 / 4 · OMNICORP GEHEIMLABOR', text:'Bei OmniCorp arbeiten der gierige Boss und ein verrückter Professor an einem „Ewiges-Leben“-Virus. Dr. Schnurr warnt sie: „Stoppt das sofort! Es ist völlig unkontrollierbar!“' },
      { spk:'Alarm-System', tag:'SZENE 2 / 4 · DER LABORUNFALL', text:'Doch der Konzernboss dreht den Regler voll auf! Mit einem gewaltigen Knall zerplatzt der Virus-Tank – grüne Mutanten-Sporen strömen unaufhaltsam nach draußen!' },
      { spk:'Erzähler', tag:'SZENE 3 / 4 · DIE MUTATION', text:'Die giftige Wolke fegt über den Nachbarschafts-Park. Alle Tiere draußen – Kater, Eichhörnchen, Igel und Waschbären – verwandeln sich in wilde Zombie-Mutanten!' },
      { spk:'Dr. Schnurr', tag:'SZENE 4 / 4 · ZURÜCK BEI MIMI', text:'Dr. Schnurr flieht nach Hause. Bloß nicht rausgehen! Doch seine kleine Katze Mimi ahnt nichts von der Gefahr – und schielt schon ungeduldig zur Gartentür…' }
    ],
    CORP: [
      { spk:'Dr. Schnurr', tag:'ZWISCHENSEQUENZ · AM RAND DES PARKS', text:'Dr. Schnurr blickt erschöpft auf und sagt zu Mimi: „Wir sind ja so nah am Labor meiner ehemaligen Firma OmniCorp!“' },
      { spk:'Mimi', tag:'ZWISCHENSEQUENZ · KAMPFMUT', text:'Mimi sträubt ihr Fell, blickt entschlossen auf das dunkle OmniCorp-Gebäude und stößt ein riesiges, lautes „MAUTZ!!“ aus!' }
    ],
    CURE: [
      { spk:'Dr. Schnurr', tag:'FINALE · DAS HEILMITTEL!', text:'Der OmniCorp-Mech bricht zusammen! Dr. Schnurr schnappt sich das leuchtende Heilmittel-Serum aus dem Tresor und aktiviert die Luft-Düse!' },
      { spk:'Erzähler', tag:'WELT GERETTET!', text:'Eine blaue Heil-Wolke fegt über das ganze Land. Alle mutierten Tiere werden wieder gesund – und Mimi schnurrt stolz zuhause auf dem Sofa!' }
    ]
  };

  const WEAPON_DEFS = {
    laser:     { id:'laser',     name:'Laser-Pistole',     icon:'🔫', cost:8,  damage:13, cooldown:0.42, range:320, knockback:95,  speed:640, color:'#38bdf8', desc:'Präzise Laser. (OMEGA: 3-fach Fächer-Laser!)' },
    aircannon: { id:'aircannon', name:'Druckluft-Kanone',  icon:'💨', cost:11, damage:18, cooldown:0.92, range:270, knockback:410, speed:480, color:'#bae6fd', desc:'Starker Rückstoß! (OMEGA: Riesen-Schockwelle!)' },
    tesla:     { id:'tesla',     name:'Teslaspule',        icon:'⚡', cost:14, damage:15, cooldown:0.84, range:250, knockback:75,  speed:0,   color:'#fde047', desc:'Kettenblitz auf 3 Feinde. (OMEGA: 6 Ziele!)' },
    acid:      { id:'acid',      name:'Anti-Virus-Kolben', icon:'🧪', cost:12, damage:11, cooldown:1.30, range:280, knockback:45,  speed:380, color:'#4ade80', desc:'Desinfektions-Pfütze. (OMEGA: Riesen-Säure-See!)' },
    catnip:    { id:'catnip',    name:'Katzenminze-Bombe', icon:'🌿', cost:13, damage:24, cooldown:1.45, range:275, knockback:170, speed:360, color:'#c084fc', desc:'Flächen-Explosion. (OMEGA: Mega-Katzenminze-Nova!)' }
  };
  const GADGET_DEFS = [
    { id:'treat',     name:'Heil-Leckerli',      icon:'🐟', cost:7,  desc:'Heilt Mimi +4 HP und +1 Max-HP.', apply: g => { g.cat.maxHp++; g.cat.hp = Math.min(g.cat.maxHp, g.cat.hp + 4); } },
    { id:'shieldDur', name:'Schild-Kondensator', icon:'🛡️', cost:10, desc:'Schutzschild hält +1.0s länger.', apply: g => { g.stats.shieldDuration += 1.0; } },
    { id:'shieldCd',  name:'Turbo-Akku',         icon:'🔋', cost:10, desc:'Schutzschild lädt 15% schneller.', apply: g => { g.stats.shieldCooldown = Math.max(3.5, g.stats.shieldCooldown * 0.85); } },
    { id:'boots',     name:'Labor-Turbo-Schuhe', icon:'👟', cost:8,  desc:'Wissenschaftler +12% Tempo & kürzerer Dash.', apply: g => { g.stats.playerSpeed *= 1.12; g.stats.dashCooldown = Math.max(1.2, g.stats.dashCooldown * 0.88); } },
    { id:'magnet',    name:'Energie-Magnet',     icon:'🧲', cost:7,  desc:'Größerer Sammelradius für Energie & Fische.', apply: g => { g.stats.pickupRange += 65; } },
    { id:'overclock', name:'Waffen-Übertakter',  icon:'⚙️', cost:13, desc:'+18% Schaden & +12% Feuerrate.', apply: g => { g.stats.damageMult += 0.18; g.stats.fireRateMult += 0.12; } },
    { id:'vest',      name:'Bio-Schutz-Weste',   icon:'🦺', cost:12, desc:'+3 Max-HP & +1 HP Heilung pro Welle.', apply: g => { g.cat.maxHp += 3; g.cat.hp += 3; g.stats.catRegen++; } },
    { id:'robomouse', name:'Robo-Maus-Köder',    icon:'🐭', cost:14, desc:'Lenkt Feinde von Mimi ab!', apply: g => { g.stats.roboMice++; } },
    { id:'turret',    name:'Auto-Geschützturm',  icon:'🤖', cost:15, desc:'Stellt jede Welle einen Mini-Laserturm auf die Wiese!', apply: g => { g.stats.turrets++; } },
    { id:'collar',    name:'Elektro-Halsband',   icon:'📿', cost:12, desc:'Verpasst Gegnern bei Kontakt mit Mimi/Schild einen Stromschlag!', apply: g => { g.stats.collarDmg += 28; } },
    { id:'harvest',   name:'Energie-Generator',  icon:'💎', cost:11, desc:'+25% mehr Energie-Drops von allen Gegnern (Ernte)!', apply: g => { g.stats.energyMult += 0.25; } }
  ];

  const PROP_POOL = [
    { type:'bush',     name:'Verseuchtes Gebüsch',    bossType:'megaCat',      bossName:'Mutierter Zombie-Kater' },
    { type:'trashcan', name:'Bio-Mülltonne',          bossType:'bossRaccoon',  bossName:'Zombie-Waschbär „Hugo“' },
    { type:'box',      name:'Labor-Karton',           bossType:'squirrelPack', bossName:'Mutanten-Eichhörnchen-Bande' },
    { type:'leafpile', name:'Raschelnder Laubhaufen', bossType:'megaHedgehog', bossName:'Gepanzerter Bio-Stachel-Igel' }
  ];
  const ALLEY_SPAWNS = [{ x:315,y:102 },{ x:785,y:102 },{ x:52,y:330 },{ x:948,y:330 },{ x:500,y:582 }];

  let state = 'TITLE', storyMode = 'INTRO', storyScene = 0, storyTimer = 0;
  let keys = {}, lastTime = performance.now(), rerollCost = 4, shopOffers = [], bannerTimer = 0;
  let hubTimer = 0, mimiDoorUrge = false, introTimer = 0, introBeakerTipped = false, doorSlamProgress = 0, game = null;
  const hubPlayer = { x:400, y:350, r:20, facing:1, walkPhase:0, emote:'', emoteTimer:0 };
  const hubCat = { x:220, y:390, r:14, targetX:220, targetY:390, wait:1, facing:1, walkPhase:0, emote:'', emoteTimer:0 };
  const meadowDetails = Array.from({length:34}, () => ({ x:ARENA_PAD+30+Math.random()*(W-ARENA_PAD*2-60), y:TOP_PAD+25+Math.random()*(H-TOP_PAD-ARENA_PAD-55), type:Math.random()<0.28?'flower':'blade', col:Math.random()<0.5?'#fef9c3':'#f1f5f9' }));
  const titleSpores = Array.from({length:28}, () => ({ x:Math.random()*W, y:Math.random()*H, r:2+Math.random()*5, spd:14+Math.random()*24 }));

  function showBanner(text, dur = 3.0) { bannerToast.textContent = text; bannerToast.classList.remove('hidden'); bannerTimer = dur; }

  function createNewGame() {
    return {
      wave:1, waveTimer:33, spawnTimer:0.6, energy:0, shake:0,
      corpPromptShown:false, isCorpFinale:false, boughtItemsCount:0, lastPropType:'',
      shopIntroPlayed:false, lastCountdownSec:6,
      research: { laser:0, aircannon:0, tesla:0, acid:0, catnip:0 },
      romance: { done:false, pending:false, delay:0, active:false, phase:'ENTER', timer:0, heartTimer:0, speechStep:0, gf:null },
      stats: { playerSpeed:260*(1+saveData.speedLevel*0.08), pickupRange:115, damageMult:1, fireRateMult:1, energyMult:1, shieldDuration:3+saveData.shieldLevel*0.6, shieldCooldown:8.5, dashCooldown:2.4, catRegen:0, roboMice:0, turrets:0, collarDmg:0 },
      player: { x:185, y:245, r:20, facing:1, walkPhase:0, emote:'', emoteTimer:0, dashTimer:0, dashCd:0, dashVx:0, dashVy:0 },
      cat: { x:225, y:285, r:14, hp:10+saveData.hpLevel*2, maxHp:10+saveData.hpLevel*2, speed:92, targetX:480, targetY:330, waitTimer:0.3, invulnTimer:0, shieldTimer:0, shieldCdTimer:0, lureTimer:0, tripTimer:0, emote:'🎉 Parkzeit!', emoteTimer:1.4, walkPhase:0, facing:1 },
      activeProp:null, propSpawnCd:999, bossesAlive:0, laserDot:null,
      weapons: [{ defId:'laser', tier:1, resLvl:0, omega:false, cd:0 }],
      turretsList:[], roboMiceList:[], enemies:[], spawns:[], projectiles:[], puddles:[], explosions:[], particles:[], lightnings:[], orbs:[], fishDrops:[], texts:[]
    };
  }

  function startStoryPack(mode) {
    initAudio(); state = 'STORY'; storyMode = mode; storyScene = 0; storyTimer = 0;
    titleOverlay.classList.add('hidden'); hubUI.classList.add('hidden'); hud.classList.add('hidden');
    shopOverlay.classList.add('hidden'); readyOverlay.classList.add('hidden'); controlsHint.classList.add('hidden');
    storyUI.classList.remove('hidden'); updateStoryUI(); syncMusic();
  }
  function updateStoryUI() {
    const list = STORY_PACKS[storyMode], item = list[storyScene];
    $('story-speaker').textContent = item.spk; $('story-scene-tag').textContent = item.tag; $('story-text').textContent = item.text;
    const dots = $('story-dots'); dots.innerHTML = '';
    list.forEach((_, idx) => { const d = document.createElement('div'); d.className = `dot ${idx===storyScene?'active':''}`; dots.appendChild(d); });
    const isLast = storyScene >= list.length - 1;
    $('story-next-btn').textContent = !isLast ? 'Weiter ▶' : (storyMode === 'INTRO' ? 'Ins Labor ▶' : storyMode === 'CORP' ? 'Bereit? ▶' : 'Zur Feier ▶');
    if (storyMode === 'CORP' && storyScene === 1) playSound('mautz');
    if (storyMode === 'CURE' && storyScene === 0) playSound('shield');
  }
  function advanceStoryScene() {
    const list = STORY_PACKS[storyMode];
    if (storyScene < list.length - 1) {
      storyScene++; storyTimer = 0;
      if (storyMode === 'INTRO' && storyScene === 1) playSound('alarm');
      if (storyMode === 'INTRO' && storyScene === 2) playSound('boss');
      updateStoryUI();
    } else finishStoryPack();
  }
  function finishStoryPack() {
    storyUI.classList.add('hidden');
    if (storyMode === 'INTRO') enterHub();
    else if (storyMode === 'CORP') { state = 'READY_PROMPT'; readyOverlay.classList.remove('hidden'); syncMusic(); }
    else if (storyMode === 'CURE') triggerGameOver(true);
  }

  function enterHub() {
    state = 'HUB'; hubTimer = 0; mimiDoorUrge = false; doorSlamProgress = 0;
    hubPlayer.x = 400; hubPlayer.y = 350; hubPlayer.emote = '🔒 Tür abschließen!'; hubPlayer.emoteTimer = 2.5;
    hubCat.x = 220; hubCat.y = 390; hubCat.targetX = 250; hubCat.targetY = 380; hubCat.emote = '♥ Miau?'; hubCat.emoteTimer = 1.6;
    introBeakerTipped = false;
    $('hub-status-msg').textContent = '⚠️ Lauf schnell zur Gartentür rechts & schließ sie ab, bevor Mimi abhaut!';
    titleOverlay.classList.add('hidden'); storyUI.classList.add('hidden'); readyOverlay.classList.add('hidden'); agentIntroOverlay.classList.add('hidden');
    hubUI.classList.remove('hidden'); controlsHint.classList.remove('hidden');
    hud.classList.add('hidden'); shopOverlay.classList.add('hidden'); endOverlay.classList.add('hidden'); metaOverlay.classList.add('hidden'); spritesOverlay.classList.add('hidden'); bannerToast.classList.add('hidden');
    syncMusic();
  }
  function startRun() { initAudio(); game = createNewGame(); startWave(1); }

  function triggerDoorEscape(catReachedFirst) {
    initAudio(); state = 'INTRO_ESCAPE'; introTimer = 0; introBeakerTipped = false; doorSlamProgress = 0;
    hubUI.classList.add('hidden'); metaOverlay.classList.add('hidden'); spritesOverlay.classList.add('hidden');
    hubCat.emote = catReachedFirst ? '💨 *PFOTE AUF KLINKE* Miau!!' : '⚡ *FLITZ!*'; hubCat.emoteTimer = 1.2;
    hubPlayer.emote = catReachedFirst ? '😱 NEIN! TÜR OFFEN!!' : '🔒 Schnell zumachen!!'; hubPlayer.emoteTimer = 1.2;
    playSound('shield');
  }
  function finishIntroAndStartWave1() {
    game = createNewGame(); startWave(1);
    showBanner('😱 Mimi ist in den Park entwischt! Welle 1 zum Aufwärmen – ab Welle 2 lauern Bosse!', 3.6);
  }

  function spawnRandomProp() {
    const choices = PROP_POOL.filter(p => p.type !== game.lastPropType);
    const pick = choices[Math.floor(Math.random()*choices.length)];
    game.lastPropType = pick.type;
    let px = 500, py = 320;
    for (let tries = 0; tries < 12; tries++) {
      px = 140 + Math.random()*(W - 280); py = 175 + Math.random()*(H - 310);
      if (Math.hypot(px - game.cat.x, py - game.cat.y) > 135) break;
    }
    game.activeProp = { ...pick, x:px, y:py, r:28, tipped:false, shake:0, stage:0, animTimer:0, triggered:false, vanishTimer:0, scale:0.15 };
    for (let i=0;i<10;i++) { const a=Math.random()*Math.PI*2; game.particles.push({x:px,y:py,vx:Math.cos(a)*50,vy:Math.sin(a)*50,color:'#fde68a',r:4,life:0.45}); }
    $('wave-event-hint').textContent = `🔍 Ein „${pick.name}“ ist im Park aufgetaucht!`;
    $('wave-event-hint').classList.remove('hidden');
    showBanner(`👀 „${pick.name}“ entdeckt! Mimi will schnüffeln!`, 3.0);
    playSound('orb');
  }

  function startWave(waveNum) {
    game.wave = waveNum; game.isCorpFinale = false; game.lastCountdownSec = 6;
    game.enemies = []; game.spawns = []; game.projectiles = []; game.puddles = [];
    game.explosions = []; game.particles = []; game.lightnings = []; game.fishDrops = []; game.bossesAlive = 0;
    game.roboMiceList = []; game.turretsList = []; game.activeProp = null;
    game.player.emote = ''; game.player.emoteTimer = 0; game.player.dashCd = 0;

    for (let i = 0; i < game.stats.roboMice; i++) game.roboMiceList.push({ x:500+(Math.random()-0.5)*200, y:340+(Math.random()-0.5)*140, tx:200+Math.random()*600, ty:180+Math.random()*280, walkPhase:0 });
    for (let i = 0; i < game.stats.turrets; i++) {
      const ang = (i / Math.max(1, game.stats.turrets)) * Math.PI * 2;
      game.turretsList.push({ x: W/2 + Math.cos(ang)*85, y: 335 + Math.sin(ang)*65, cd: 0.4 });
    }
    game.propSpawnCd = waveNum === 1 ? 999 : (waveNum === 2 ? 3.5 : 4.5 + Math.random()*4.5);
    $('wave-event-hint').classList.add('hidden'); $('wave-timer').classList.remove('urgent');

    const rm = game.romance;
    rm.active = false; rm.pending = false; rm.gf = null;
    if (!rm.done && waveNum >= 5 && (game.boughtItemsCount >= 3 || game.weapons.length >= 3 || waveNum >= 8)) {
      rm.pending = true; rm.delay = 5.0; game.propSpawnCd = 16.0;
    }

    game.cat.shieldCdTimer = Math.min(game.cat.shieldCdTimer, 1.5);
    game.waveTimer = Math.min(60, 32 + waveNum * 1.4);
    game.spawnTimer = 0.6;
    state = 'PLAYING';
    titleOverlay.classList.add('hidden'); storyUI.classList.add('hidden'); readyOverlay.classList.add('hidden'); agentIntroOverlay.classList.add('hidden');
    hubUI.classList.add('hidden'); metaOverlay.classList.add('hidden'); spritesOverlay.classList.add('hidden'); shopOverlay.classList.add('hidden'); endOverlay.classList.add('hidden');
    hud.classList.remove('hidden'); controlsHint.classList.remove('hidden');
    updateHUD(); syncMusic();
  }

  function startCorpFinale() {
    initAudio(); game.isCorpFinale = true; game.lastCountdownSec = 6;
    game.activeProp = null; game.romance.active = false; game.romance.pending = false;
    game.enemies = []; game.spawns = []; game.projectiles = []; game.puddles = [];
    game.explosions = []; game.particles = []; game.lightnings = []; game.fishDrops = []; game.bossesAlive = 0;
    game.roboMiceList = []; game.turretsList = [];
    for (let i = 0; i < game.stats.roboMice; i++) game.roboMiceList.push({ x:500+(Math.random()-0.5)*200, y:340+(Math.random()-0.5)*140, tx:200+Math.random()*600, ty:180+Math.random()*280, walkPhase:0 });
    for (let i = 0; i < game.stats.turrets; i++) {
      const ang = (i / Math.max(1, game.stats.turrets)) * Math.PI * 2;
      game.turretsList.push({ x: W/2 + Math.cos(ang)*85, y: 335 + Math.sin(ang)*65, cd: 0.4 });
    }
    game.player.x = 160; game.player.y = 330; game.cat.x = 220; game.cat.y = 330; game.cat.emote = '😾 MAUTZ!'; game.cat.emoteTimer = 1.6;
    game.cat.shieldCdTimer = 0; game.waveTimer = 60; game.spawnTimer = 1.0;

    const hpScale = Math.max(1, 1 + (game.wave - 20) * 0.12);
    spawnBoss('corpBoss', 780, 320, Math.round(1600 * hpScale), 40, 88, 3, 60);
    playSound('boss');
    $('wave-event-hint').textContent = '⚔️ Besiege den OmniCorp Endboss-Mech für das Heilmittel!';
    $('wave-event-hint').classList.remove('hidden');
    showBanner('🏢 FINALE IN DER FIRMA! Besiege den Endboss & seine Roboter!', 3.8);
    state = 'PLAYING'; readyOverlay.classList.add('hidden'); shopOverlay.classList.add('hidden');
    hud.classList.remove('hidden'); controlsHint.classList.remove('hidden'); updateHUD(); syncMusic();
  }

  function spawnPropBoss(prop) {
    prop.tipped = true; game.shake = 0.35; playSound('boss');
    const pCol = prop.type === 'leafpile' ? '#f59e0b' : '#4ade80';
    for (let i = 0; i < 22; i++) { const a = Math.random()*Math.PI*2, s = 70+Math.random()*150; game.particles.push({ x:prop.x, y:prop.y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, color:pCol, r:4+Math.random()*4, life:0.7 }); }
    const sc = 1 + (game.wave - 1) * 0.13;
    if (prop.bossType === 'squirrelPack') {
      for (let k = 0; k < 4; k++) {
        const a = (k/4)*Math.PI*2;
        game.enemies.push({ type:'squirrel', isBoss:true, x:prop.x+Math.cos(a)*22, y:prop.y+Math.sin(a)*22, r:19, hp:Math.round(70*sc), maxHp:Math.round(70*sc), speed:135, damage:1, energy:6, vx:Math.cos(a)*140, vy:Math.sin(a)*140, slowTimer:0, hitFlash:0, walkPhase:0, facing:1 });
        game.bossesAlive++;
      }
    } else {
      const m = { megaCat:[130*sc,26,100,2,14], bossRaccoon:[220*sc,30,95,2,20], megaHedgehog:[270*sc,28,82,2,22] }[prop.bossType] || [200*sc,28,95,2,18];
      spawnBoss(prop.bossType, prop.x, prop.y, Math.round(m[0]), m[1], m[2], m[3], m[4]);
    }
    showBanner(`🚨 ${prop.bossName} springt heraus!`, 3.2);
    $('wave-event-hint').textContent = `⚔️ Besiege: ${prop.bossName}!`;
  }
  function spawnBoss(type, x, y, hp, r, speed, damage, energy) {
    game.enemies.push({ type, isBoss:true, x, y, r, hp, maxHp:hp, speed, damage, energy, vx:0, vy:-60, slowTimer:0, hitFlash:0, walkPhase:0, facing:1 });
    game.bossesAlive++;
  }

  function queueEnemySpawn() {
    if (game.isCorpFinale) {
      const s = Math.floor(Math.random()*4), pad = ARENA_PAD + 20;
      const x = s===1 ? W-pad : s===3 ? pad : pad+Math.random()*(W-pad*2);
      const y = s===0 ? TOP_PAD+10 : s===2 ? H-pad : TOP_PAD+10+Math.random()*(H-TOP_PAD-pad-10);
      game.spawns.push({ x, y, type:'corpBot', timer:0.7 }); return;
    }
    const alley = ALLEY_SPAWNS[Math.floor(Math.random()*ALLEY_SPAWNS.length)];
    const x = alley.x + (Math.random()-0.5)*26, y = alley.y + (Math.random()-0.5)*16;
    const w = game.wave, r = Math.random();
    let type = 'strayCat';
    if (w >= 2 && r < 0.42) type = 'squirrel';
    if (w >= 4 && r >= 0.42 && r < 0.72) type = 'hedgehog';
    game.spawns.push({ x, y, type, timer:0.7 });
  }
  function createEnemy(type, x, y) {
    const sc = 1 + (game.wave - 1) * 0.14;
    const d = { strayCat:{r:16,hp:18,spd:92,dmg:1,en:2}, squirrel:{r:13,hp:12,spd:126,dmg:1,en:2}, hedgehog:{r:17,hp:36,spd:68,dmg:2,en:3}, corpBot:{r:19,hp:45,spd:118,dmg:2,en:4} }[type];
    return { type, x, y, r:d.r, hp:Math.round(d.hp*sc), maxHp:Math.round(d.hp*sc), speed:d.spd+Math.min(34,game.wave*1.3), damage:d.dmg, energy:d.en, vx:0, vy:0, slowTimer:0, hitFlash:0, walkPhase:Math.random()*6, facing:1 };
  }

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (!audioUnlocked) initAudio();
    if (state === 'PLAYING') {
      if (e.code === 'Space') { e.preventDefault(); activateShield(); }
      else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { e.preventDefault(); activateDash(); }
      else if (e.code === 'KeyE') placeLaserDot(game.player.x, game.player.y);
    } else if (state === 'STORY' && e.code === 'Space') { e.preventDefault(); advanceStoryScene(); }
    else if (state === 'INTRO_ESCAPE' && e.code === 'Space') { e.preventDefault(); finishIntroAndStartWave1(); }
    else if (state === 'HUB' && e.code === 'KeyE' && Math.hypot(hubPlayer.x-165, hubPlayer.y-250) < 95) openMetaModal();
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  canvas.addEventListener('mousedown', (e) => {
    initAudio();
    if (state !== 'PLAYING') return;
    const r = canvas.getBoundingClientRect();
    placeLaserDot((e.clientX-r.left)*(W/r.width), (e.clientY-r.top)*(H/r.height));
  });

  function activateDash() {
    const p = game.player;
    if (p.dashCd > 0) return;
    let dx = (keys['KeyD']||keys['ArrowRight']?1:0)-(keys['KeyA']||keys['ArrowLeft']?1:0);
    let dy = (keys['KeyS']||keys['ArrowDown']?1:0)-(keys['KeyW']||keys['ArrowUp']?1:0);
    if (!dx && !dy) dx = p.facing;
    const l = Math.hypot(dx, dy) || 1;
    p.dashVx = (dx/l)*780; p.dashVy = (dy/l)*780;
    p.dashTimer = 0.18; p.dashCd = game.stats.dashCooldown;
    playSound('dash');
  }
  function activateShield() {
    if (game.romance.active) { addFloatingText(game.cat.x, game.cat.y - 30, '🚫 Zu verliebt für Schild!', '#fda4af', 14); playSound('hurt'); return; }
    if (game.cat.shieldCdTimer > 0) return;
    game.cat.shieldTimer = game.stats.shieldDuration; game.cat.shieldCdTimer = game.stats.shieldCooldown;
    game.cat.emote = '🛡️ Sicher!'; game.cat.emoteTimer = 1.2; playSound('shield');
  }
  function placeLaserDot(x, y) {
    if (game.romance.active) { addFloatingText(game.cat.x, game.cat.y - 26, '😍 Sie hat nur Augen für sie!', '#fda4af', 13); return; }
    const cx = Math.max(ARENA_PAD+20, Math.min(W-ARENA_PAD-20, x)), cy = Math.max(TOP_PAD+15, Math.min(H-ARENA_PAD-20, y));
    game.laserDot = { x:cx, y:cy, timer:2.6 };
    game.cat.lureTimer = 2.6; game.cat.targetX = cx; game.cat.targetY = cy;
    game.cat.emote = '🔴 Oh!!'; game.cat.emoteTimer = 0.9;
  }

  function addFloatingText(x, y, text, color = '#fff', size = 14) { game.texts.push({ x, y, text, color, size, life: 0.95 }); }
  function damageEnemy(e, dmg, kx = 0, ky = 0) {
    e.hp -= dmg; e.hitFlash = 0.1; e.vx += kx; e.vy += ky;
    addFloatingText(e.x+(Math.random()-0.5)*14, e.y-e.r, Math.round(dmg), '#fff', 13);
    if (e.hp <= 0) {
      const enVal = Math.max(1, Math.round(e.energy * game.stats.energyMult));
      const cnt = e.isBoss ? 10 : Math.max(1, Math.round(enVal/2));
      const val = Math.max(1, Math.ceil(enVal/cnt));
      for (let i = 0; i < cnt; i++) { const a = Math.random()*Math.PI*2; game.orbs.push({ x:e.x+Math.cos(a)*10, y:e.y+Math.sin(a)*10, val }); }
      if (e.isBoss || Math.random() < 0.06) game.fishDrops.push({ x: e.x, y: e.y });
      if (e.isBoss) game.bossesAlive = Math.max(0, game.bossesAlive - 1);
    }
  }
  function findNearestEnemy(x, y, maxR, excl = []) {
    let best = null, bd = maxR;
    for (const e of game.enemies) { if (e.hp <= 0 || excl.includes(e)) continue; const d = Math.hypot(e.x-x, e.y-y); if (d < bd) { bd = d; best = e; } }
    return best;
  }

  // === ENDE TEIL 1 ===
// === START TEIL 2 ===
  function startAgentIntro() {
    state = 'AGENT_INTRO';
    game.shopIntroPlayed = true;
    hud.classList.add('hidden'); controlsHint.classList.add('hidden'); bannerToast.classList.add('hidden');
    agentIntroOverlay.classList.remove('hidden');
    syncMusic();
    playVoice('shop_intro', () => {
      if (state === 'AGENT_INTRO') openShop(true);
    });
  }

  function update(dt) {
    if (bannerTimer > 0) { bannerTimer -= dt; if (bannerTimer <= 0) bannerToast.classList.add('hidden'); }
    if (state === 'TITLE') { for (const s of titleSpores) { s.y -= s.spd*dt; if (s.y < -10) { s.y = H+10; s.x = Math.random()*W; } } return; }
    if (state === 'STORY') { storyTimer += dt; if (storyTimer >= 8.5) advanceStoryScene(); return; }
    if (state === 'HUB') { updateHub(dt); return; }
    if (state === 'INTRO_ESCAPE') { updateIntroEscape(dt); return; }
    if (state !== 'PLAYING') return;

    const p = game.player, c = game.cat, rm = game.romance;
    if (p.emoteTimer > 0) p.emoteTimer -= dt;
    if (p.dashCd > 0) p.dashCd = Math.max(0, p.dashCd - dt);

    if (rm.pending) {
      rm.delay -= dt;
      if (rm.delay <= 0) {
        rm.pending = false; rm.active = true; rm.phase = 'ENTER'; rm.timer = 0; rm.heartTimer = 0; rm.speechStep = 0;
        rm.gf = { x: 610, y: 102, r: 14, facing: -1, walkPhase: 0, emote: '💕 Miau~!', emoteTimer: 1.8 };
        c.shieldTimer = 0; c.emote = '😍 OH!!'; c.emoteTimer = 1.6;
        p.emote = '😳 DEIN ERNST JETZT?!'; p.emoteTimer = 2.4;
        $('wave-event-hint').textContent = '💘 MIMI FLIRTET! KEIN SCHILD & MEHR ZOMBIES!';
        $('wave-event-hint').classList.remove('hidden');
        showBanner('💘 Mimis Freundin kommt aus dem Nachbarhaus! Kein Schild möglich!', 3.6);
        playSound('purr');
      }
    }

    if (rm.active && rm.gf) {
      const gf = rm.gf; if (gf.emoteTimer > 0) gf.emoteTimer -= dt;
      c.shieldTimer = 0;
      if (rm.phase === 'ENTER') {
        const tx = Math.max(160, Math.min(W - 160, c.x + 36)), ty = c.y, dx = tx - gf.x, dy = ty - gf.y, d = Math.hypot(dx, dy) || 1;
        gf.x += (dx/d)*150*dt; gf.y += (dy/d)*150*dt; gf.walkPhase += dt*15; gf.facing = dx >= 0 ? 1 : -1; c.facing = gf.x >= c.x ? 1 : -1;
        if (d < 22) { rm.phase = 'FLIRT'; rm.timer = 0; }
      } else if (rm.phase === 'FLIRT') {
        rm.timer += dt; rm.heartTimer -= dt; c.walkPhase += dt*10; gf.walkPhase += dt*10; c.facing = 1; gf.facing = -1;
        if (rm.heartTimer <= 0) {
          rm.heartTimer = 0.42;
          addFloatingText((c.x+gf.x)/2+(Math.random()-0.5)*26, c.y-20, ['♥','💕','💖','💘'][Math.floor(Math.random()*4)], '#fb7185', 18);
          if (Math.random() < 0.45) playSound('purr');
        }
        if (rm.speechStep === 0 && rm.timer > 0.2) { rm.speechStep = 1; p.emote = '🙄 Jetzt wirst du noch romantisch?! HIER SIND ZOMBIES!!'; p.emoteTimer = 2.4; }
        else if (rm.speechStep === 1 && rm.timer > 2.6) { rm.speechStep = 2; p.emote = '🤦‍♂️ Ich kämpf ums Überleben & du machst ein Date?!'; p.emoteTimer = 2.5; c.emote = '😻 *Schnurr...*'; c.emoteTimer = 1.6; }
        else if (rm.speechStep === 2 && rm.timer > 4.8) { rm.speechStep = 3; p.emote = '😤 LOS, VERSTECK DICH WIEDER IM HAUS!'; p.emoteTimer = 2.0; }
        if (rm.timer >= 6.2) { rm.phase = 'LEAVE'; gf.emote = '🙀 Huch, Zombies! Tschüssi!'; gf.emoteTimer = 1.8; c.emote = '😍 *Seufz...* ♥'; c.emoteTimer = 1.8; }
      } else if (rm.phase === 'LEAVE') {
        const dx = 610 - gf.x, dy = 96 - gf.y, d = Math.hypot(dx, dy) || 1;
        gf.x += (dx/d)*250*dt; gf.y += (dy/d)*250*dt; gf.walkPhase += dt*20; gf.facing = dx >= 0 ? 1 : -1;
        if (d < 18) {
          rm.active = false; rm.done = true; rm.gf = null;
          c.hp = Math.min(c.maxHp, c.hp + 2); game.energy += 12;
          addFloatingText(c.x, c.y - 30, '💕 Verliebte Power! +2 HP & +12 ⚡', '#4ade80', 15);
          p.emote = '😅 Puh! Endlich wieder konzentrieren!'; p.emoteTimer = 2.0;
          $('wave-event-hint').classList.add('hidden');
        }
      }
    }

    if (!game.isCorpFinale) {
      if (!game.activeProp && game.bossesAlive === 0 && !rm.active && !rm.pending) {
        game.propSpawnCd -= dt;
        if (game.propSpawnCd <= 0 && game.waveTimer > 9) {
          spawnRandomProp();
          game.propSpawnCd = 5.5 + Math.random() * 5.0;
        }
      }
      if (game.activeProp) {
        const ap = game.activeProp;
        if (ap.scale < 1) ap.scale = Math.min(1, ap.scale + dt * 5);
        if (ap.triggered && game.bossesAlive === 0) {
          ap.vanishTimer -= dt;
          if (ap.vanishTimer <= 0) {
            for (let i=0;i<12;i++) { const a=Math.random()*Math.PI*2; game.particles.push({x:ap.x,y:ap.y,vx:Math.cos(a)*65,vy:Math.sin(a)*65,color:'#cbd5e1',r:4,life:0.45}); }
            game.activeProp = null;
            if (!rm.active) $('wave-event-hint').classList.add('hidden');
          }
        }
      }
    }

    game.waveTimer -= dt;
    const propGagActive = game.activeProp && game.activeProp.stage > 0 && !game.activeProp.triggered;

    if (!game.isCorpFinale && game.bossesAlive === 0 && !propGagActive && !rm.active && !rm.pending) {
      const sec = Math.ceil(game.waveTimer);
      if (sec >= 1 && sec <= 5 && sec < game.lastCountdownSec) {
        game.lastCountdownSec = sec;
        playVoice(`count_${sec}`);
      }
    }

    if (game.isCorpFinale) {
      if (game.bossesAlive <= 0) { startStoryPack('CURE'); return; }
      if (game.waveTimer < 0) game.waveTimer = 0;
    } else {
      if (game.waveTimer <= 0 && game.bossesAlive <= 0 && !propGagActive && !rm.active && !rm.pending) {
        game.activeProp = null; endWave(); return;
      }
      if (game.waveTimer < 0) game.waveTimer = 0;
    }

    game.spawnTimer -= dt;
    const maxEnemies = rm.active ? 55 : 40;
    if (game.spawnTimer <= 0 && game.enemies.length < maxEnemies) {
      queueEnemySpawn(); if (rm.active || (game.wave >= 7 && Math.random() < 0.38)) queueEnemySpawn();
      const baseInt = game.isCorpFinale ? 1.5 : Math.max(0.3, 1.45 - game.wave * 0.055);
      game.spawnTimer = rm.active ? baseInt * 0.45 : baseInt;
    }
    for (let i = game.spawns.length-1; i >= 0; i--) {
      game.spawns[i].timer -= dt;
      if (game.spawns[i].timer <= 0) { const s = game.spawns[i]; game.enemies.push(createEnemy(s.type, s.x, s.y)); game.spawns.splice(i,1); }
    }

    if (p.dashTimer > 0) {
      p.dashTimer -= dt; p.x += p.dashVx * dt; p.y += p.dashVy * dt;
      game.particles.push({ x:p.x, y:p.y+10, vx:(Math.random()-0.5)*30, vy:(Math.random()-0.5)*30, color:'#38bdf8', r:5, life:0.25 });
    } else {
      let mx = (keys['KeyD']||keys['ArrowRight']?1:0)-(keys['KeyA']||keys['ArrowLeft']?1:0);
      let my = (keys['KeyS']||keys['ArrowDown']?1:0)-(keys['KeyW']||keys['ArrowUp']?1:0);
      if (mx || my) {
        const l = Math.hypot(mx, my); p.x += (mx/l)*game.stats.playerSpeed*dt; p.y += (my/l)*game.stats.playerSpeed*dt;
        p.walkPhase += dt*14; if (mx) p.facing = mx > 0 ? 1 : -1;
      }
    }
    p.x = Math.max(ARENA_PAD+p.r, Math.min(W-ARENA_PAD-p.r, p.x));
    p.y = Math.max(TOP_PAD+p.r, Math.min(H-ARENA_PAD-p.r, p.y));

    if (c.invulnTimer > 0) c.invulnTimer -= dt;
    if (c.shieldTimer > 0 && !rm.active) c.shieldTimer -= dt;
    if (c.shieldCdTimer > 0) c.shieldCdTimer = Math.max(0, c.shieldCdTimer - dt);
    if (c.emoteTimer > 0) c.emoteTimer -= dt;
    if (game.laserDot) { game.laserDot.timer -= dt; if (game.laserDot.timer <= 0) game.laserDot = null; }

    const ap = game.activeProp;
    if (!(rm.active && (rm.phase === 'ENTER' || rm.phase === 'FLIRT'))) {
      if (ap && !ap.triggered && ap.stage > 0) {
        ap.animTimer += dt; c.invulnTimer = Math.max(c.invulnTimer, 0.4); ap.shake = Math.sin(ap.animTimer*35)*5;
        if (ap.stage === 1 && ap.animTimer >= 0.75) {
          ap.stage = 2;
          c.emote = ap.type==='bush' ? '😾 FAUCH!' : ap.type==='leafpile' ? '🍂 *HÜPF! RASCHEL!*' : '💥 *SCHEPPER!*';
          c.emoteTimer = 0.85; ap.tipped = true; playSound('clang');
        } else if (ap.stage === 2 && ap.animTimer >= 1.45) {
          ap.triggered = true; ap.stage = 3; ap.shake = 0; ap.vanishTimer = 1.0;
          const a = Math.atan2(c.y-ap.y, c.x-ap.x) || 0.8;
          c.x += Math.cos(a)*42; c.y += Math.sin(a)*42; c.emote = '🙀 MIAU!!'; c.emoteTimer = 1.4; c.invulnTimer = 1.8;
          spawnPropBoss(ap);
        }
      } else {
        if (c.tripTimer > 0) { c.tripTimer -= dt; c.walkPhase += dt*24; }
        else if (c.lureTimer > 0 && game.laserDot) { c.lureTimer -= dt; c.targetX = game.laserDot.x; c.targetY = game.laserDot.y; c.waitTimer = 0; }
        else if (ap && !ap.triggered) { c.targetX = ap.x + (ap.x > W/2 ? -34 : 34); c.targetY = ap.y + 12; c.waitTimer = 0; }

        if (c.tripTimer <= 0) {
          const d = Math.hypot(c.targetX - c.x, c.targetY - c.y);
          if (ap && !ap.triggered && Math.hypot(ap.x-c.x, ap.y-c.y) < 54) {
            ap.stage = 1; ap.animTimer = 0;
            c.emote = ap.type==='leafpile' ? '🐾 *Popo-Wackeln...*' : '👃 *Schnüffel...*';
            c.emoteTimer = 0.85;
          } else if (c.waitTimer > 0) {
            c.waitTimer -= dt;
            if (c.waitTimer <= 0) { c.targetX = ARENA_PAD+90+Math.random()*(W-(ARENA_PAD+90)*2); c.targetY = TOP_PAD+45+Math.random()*(H-TOP_PAD-ARENA_PAD-75); }
          } else if (d > 10) {
            const spd = c.lureTimer > 0 ? c.speed*1.45 : c.speed, vx = ((c.targetX-c.x)/d)*spd, vy = ((c.targetY-c.y)/d)*spd;
            c.x += vx*dt; c.y += vy*dt; c.walkPhase += dt*13; if (Math.abs(vx)>2) c.facing = vx>0?1:-1;
            if (Math.random() < 0.0022 && c.lureTimer <= 0) { c.tripTimer = 0.55; c.emote = ['🐾 Hoppla!','💫 Ups!','🦋 Schmetterling!'][Math.floor(Math.random()*3)]; c.emoteTimer = 1.0; }
          } else {
            c.waitTimer = c.lureTimer > 0 ? 0.2 : 1.0+Math.random()*1.1;
            if (c.emoteTimer <= 0) { c.emote = game.isCorpFinale ? ['Mautz!!','😾 Faucht Roboter an!'][Math.floor(Math.random()*2)] : ['Miau!','♥','🌸 *Schnupper*'][Math.floor(Math.random()*3)]; c.emoteTimer = 1.0; }
          }
        }
      }
    }

    for (const rmMouse of game.roboMiceList) {
      const d = Math.hypot(rmMouse.tx-rmMouse.x, rmMouse.ty-rmMouse.y);
      if (d < 12) { rmMouse.tx = ARENA_PAD+80+Math.random()*(W-(ARENA_PAD+80)*2); rmMouse.ty = TOP_PAD+40+Math.random()*(H-TOP_PAD-ARENA_PAD-70); }
      else { rmMouse.x += ((rmMouse.tx-rmMouse.x)/d)*125*dt; rmMouse.y += ((rmMouse.ty-rmMouse.y)/d)*125*dt; rmMouse.walkPhase += dt*18; }
    }

    for (const tu of game.turretsList) {
      tu.cd -= dt;
      if (tu.cd <= 0) {
        const tgt = findNearestEnemy(tu.x, tu.y, 290);
        if (tgt) {
          tu.cd = 0.65 / game.stats.fireRateMult;
          const a = Math.atan2(tgt.y-tu.y, tgt.x-tu.x);
          game.projectiles.push({ type:'laser', x:tu.x, y:tu.y-8, vx:Math.cos(a)*580, vy:Math.sin(a)*580, r:5, dmg:10*game.stats.damageMult, knockback:70, color:'#fbbf24', life:0.65, pierce:1, omega:false });
          playSound('shoot');
        }
      }
    }

    for (const w of game.weapons) {
      const def = WEAPON_DEFS[w.defId];
      const tierMult = 1 + (w.tier-1)*0.45;
      const resBonus = w.resLvl === 1 ? 1.35 : w.resLvl === 2 ? 1.75 : w.omega ? 2.2 : 1.0;
      const resRate = w.resLvl === 2 ? 1.2 : w.omega ? 1.35 : 1.0;
      w.cd -= dt;
      if (w.cd <= 0) {
        const tgt = findNearestEnemy(p.x, p.y, def.range);
        if (tgt) {
          w.cd = def.cooldown / (game.stats.fireRateMult * resRate * (1+(w.tier-1)*0.15));
          const dmg = def.damage * tierMult * resBonus * game.stats.damageMult;
          if (def.id === 'tesla') {
            const hit = []; let px = p.x, py = p.y, cur = tgt;
            const bounces = w.omega ? 6 : 3;
            for (let k = 0; k < bounces && cur; k++) {
              hit.push(cur); game.lightnings.push({ x1:px, y1:py, x2:cur.x, y2:cur.y, life:0.16, color:w.omega?'#e879f9':'#fde047' });
              const a = Math.atan2(cur.y-py, cur.x-px);
              damageEnemy(cur, dmg*(k===0?1:0.75), Math.cos(a)*def.knockback, Math.sin(a)*def.knockback);
              px = cur.x; py = cur.y; cur = findNearestEnemy(px, py, w.omega?185:130, hit);
            }
            playSound('zap');
          } else {
            const baseA = Math.atan2(tgt.y-p.y, tgt.x-p.x);
            const angles = (def.id === 'laser' && w.omega) ? [baseA - 0.18, baseA, baseA + 0.18] : [baseA];
            for (const a of angles) {
              game.projectiles.push({
                type:def.id, x:p.x, y:p.y, vx:Math.cos(a)*def.speed, vy:Math.sin(a)*def.speed,
                r: (def.id==='aircannon' && w.omega) ? 18 : def.id==='aircannon' ? 10 : def.id==='catnip' ? 8 : 6,
                dmg, knockback: def.knockback * (w.omega ? 1.4 : 1), color: w.omega ? '#e879f9' : def.color,
                life: def.range/def.speed+0.15, pierce: (def.id==='aircannon' && w.omega) ? 6 : def.id==='aircannon' ? 2 : 1, omega: w.omega
              });
            }
            playSound('shoot');
          }
        }
      }
    }

    for (let i = game.projectiles.length-1; i >= 0; i--) {
      const pr = game.projectiles[i]; pr.x += pr.vx*dt; pr.y += pr.vy*dt; pr.life -= dt;
      let hit = false;
      for (const e of game.enemies) {
        if (e.hp > 0 && Math.hypot(e.x-pr.x, e.y-pr.y) < e.r+pr.r) {
          const a = Math.atan2(pr.vy, pr.vx);
          if (pr.type === 'catnip') { triggerCatnip(pr.x, pr.y, pr.dmg, pr.knockback, pr.omega); hit = true; break; }
          damageEnemy(e, pr.dmg, Math.cos(a)*pr.knockback, Math.sin(a)*pr.knockback);
          if (pr.type === 'acid') game.puddles.push({ x:pr.x, y:pr.y, r:pr.omega?72:44, life:3.2, tick:0, dmg:pr.dmg*0.45 });
          if (--pr.pierce <= 0) { hit = true; break; }
        }
      }
      if (hit || pr.life <= 0) {
        if (pr.type === 'acid' && !hit) game.puddles.push({ x:pr.x, y:pr.y, r:pr.omega?72:44, life:3.2, tick:0, dmg:pr.dmg*0.45 });
        if (pr.type === 'catnip' && !hit) triggerCatnip(pr.x, pr.y, pr.dmg, pr.knockback, pr.omega);
        game.projectiles.splice(i, 1);
      }
    }

    for (let i = game.puddles.length-1; i >= 0; i--) {
      const pu = game.puddles[i]; pu.life -= dt; pu.tick -= dt;
      if (pu.tick <= 0) { pu.tick = 0.4; for (const e of game.enemies) if (e.hp>0 && Math.hypot(e.x-pu.x,e.y-pu.y)<pu.r+e.r) { damageEnemy(e, pu.dmg); e.slowTimer = 0.6; } }
      if (pu.life <= 0) game.puddles.splice(i, 1);
    }
    for (let i = game.explosions.length-1; i >= 0; i--) { game.explosions[i].life -= dt; if (game.explosions[i].life<=0) game.explosions.splice(i,1); }
    for (let i = game.particles.length-1; i >= 0; i--) { const pt = game.particles[i]; pt.x+=pt.vx*dt; pt.y+=pt.vy*dt; pt.life-=dt; if (pt.life<=0) game.particles.splice(i,1); }

    for (let i = game.enemies.length-1; i >= 0; i--) {
      const e = game.enemies[i]; if (e.hp <= 0) { game.enemies.splice(i,1); continue; }
      if (e.hitFlash > 0) e.hitFlash -= dt; if (e.slowTimer > 0) e.slowTimer -= dt;
      let tx = c.x, ty = c.y;
      for (const rmMouse of game.roboMiceList) if (Math.hypot(rmMouse.x-e.x, rmMouse.y-e.y) < 190) { tx = rmMouse.x; ty = rmMouse.y; break; }
      const dx = tx-e.x, dy = ty-e.y, dist = Math.hypot(dx, dy) || 1, spd = e.slowTimer>0 ? e.speed*0.45 : e.speed, sx = (dx/dist)*spd;
      e.x += sx*dt + e.vx*dt; e.y += (dy/dist)*spd*dt + e.vy*dt;
      e.vx *= Math.pow(0.05, dt); e.vy *= Math.pow(0.05, dt); e.walkPhase += dt*11; if (Math.abs(sx)>2) e.facing = sx>0?1:-1;

      const pdx = e.x-p.x, pdy = e.y-p.y, pD = Math.hypot(pdx, pdy) || 1, sep = e.r+p.r+4;
      if (pD < sep) {
        const nx = pdx/pD, ny = pdy/pD; e.x = p.x+nx*sep; e.y = p.y+ny*sep;
        e.vx += nx*320; e.vy += ny*320; e.slowTimer = Math.max(e.slowTimer, 0.45);
        if (p.dashTimer > 0) damageEnemy(e, 14*game.stats.damageMult); else e.hitFlash = 0.08;
      }

      const cD = Math.hypot(e.x-c.x, e.y-c.y) || 1;
      if (c.shieldTimer > 0 && cD < c.r+28+e.r) {
        const nx = (e.x-c.x)/cD, ny = (e.y-c.y)/cD; e.x = c.x+nx*(c.r+30+e.r); e.y = c.y+ny*(c.r+30+e.r); e.vx = nx*340; e.vy = ny*340;
        if (game.stats.collarDmg > 0) { damageEnemy(e, game.stats.collarDmg*game.stats.damageMult); game.lightnings.push({ x1:c.x, y1:c.y, x2:e.x, y2:e.y, life:0.12, color:'#38bdf8' }); }
      } else if (cD < c.r+e.r && c.invulnTimer <= 0 && c.shieldTimer <= 0) {
        c.hp -= e.damage; c.invulnTimer = 1.05; c.emote = '😿 Autsch!'; c.emoteTimer = 1.1; game.shake = 0.25; playSound('hurt');
        e.vx = ((e.x-c.x)/cD)*210; e.vy = ((e.y-c.y)/cD)*210;
        if (game.stats.collarDmg > 0) { damageEnemy(e, game.stats.collarDmg*game.stats.damageMult); game.lightnings.push({ x1:c.x, y1:c.y, x2:e.x, y2:e.y, life:0.14, color:'#fde047' }); }
        if (c.hp <= 0) { c.hp = 0; triggerGameOver(false); return; }
      }
    }

    for (let i = game.orbs.length-1; i >= 0; i--) {
      const o = game.orbs[i], dx = p.x-o.x, dy = p.y-o.y, d = Math.hypot(dx, dy);
      if (d < game.stats.pickupRange) { o.x += (dx/(d||1))*400*dt; o.y += (dy/(d||1))*400*dt; }
      if (d < p.r+12) { game.energy += o.val; playSound('orb'); game.orbs.splice(i,1); }
    }
    for (let i = game.fishDrops.length-1; i >= 0; i--) {
      const f = game.fishDrops[i], dx = p.x-f.x, dy = p.y-f.y, d = Math.hypot(dx, dy);
      if (d < game.stats.pickupRange) { f.x += (dx/(d||1))*360*dt; f.y += (dy/(d||1))*360*dt; }
      if (d < p.r+14) { c.hp = Math.min(c.maxHp, c.hp + 2); addFloatingText(c.x, c.y-24, '🐟 +2 HP!', '#4ade80', 14); playSound('buy'); game.fishDrops.splice(i,1); }
    }

    for (let i = game.lightnings.length-1; i >= 0; i--) { game.lightnings[i].life -= dt; if (game.lightnings[i].life<=0) game.lightnings.splice(i,1); }
    for (let i = game.texts.length-1; i >= 0; i--) { game.texts[i].y -= 28*dt; game.texts[i].life -= dt; if (game.texts[i].life<=0) game.texts.splice(i,1); }
    if (game.shake > 0) game.shake = Math.max(0, game.shake - dt);
    updateHUD();
  }

  function triggerCatnip(x, y, dmg, kb, omega) {
    const rad = omega ? 125 : 78;
    game.explosions.push({ x, y, r:rad, life:0.32 });
    for (const e of game.enemies) if (e.hp>0 && Math.hypot(e.x-x,e.y-y)<rad+e.r) {
      const a = Math.atan2(e.y-y, e.x-x); damageEnemy(e, dmg, Math.cos(a)*kb, Math.sin(a)*kb); e.slowTimer = omega ? 2.5 : 1.6;
    }
  }

  function updateHub(dt) {
    if (!metaOverlay.classList.contains('hidden') || !spritesOverlay.classList.contains('hidden')) return;
    hubTimer += dt;
    if (hubPlayer.emoteTimer > 0) hubPlayer.emoteTimer -= dt;
    if (hubCat.emoteTimer > 0) hubCat.emoteTimer -= dt;

    let mx = (keys['KeyD']||keys['ArrowRight']?1:0)-(keys['KeyA']||keys['ArrowLeft']?1:0);
    let my = (keys['KeyS']||keys['ArrowDown']?1:0)-(keys['KeyW']||keys['ArrowUp']?1:0);
    if (mx || my) {
      const l = Math.hypot(mx, my); hubPlayer.x += (mx/l)*245*dt; hubPlayer.y += (my/l)*245*dt;
      hubPlayer.walkPhase += dt*13; if (mx) hubPlayer.facing = mx>0?1:-1;
    }
    hubPlayer.x = Math.max(90, Math.min(W-85, hubPlayer.x)); hubPlayer.y = Math.max(120, Math.min(H-70, hubPlayer.y));

    if (!mimiDoorUrge && hubTimer > 3.0) {
      mimiDoorUrge = true; hubCat.emote = '🚪 Miau? Raus!'; hubCat.emoteTimer = 1.8;
      hubPlayer.emote = '❗ HALT MIMI! NICHT ZUR TÜR!'; hubPlayer.emoteTimer = 2.2;
      $('hub-status-msg').textContent = '🚨 SCHNELL! Lauf zur Tür rechts und schließ sie ab!'; playSound('alarm');
    }
    if (mimiDoorUrge) {
      const dx = (W - 105) - hubCat.x, dy = 340 - hubCat.y, d = Math.hypot(dx, dy) || 1;
      hubCat.x += (dx/d)*85*dt; hubCat.y += (dy/d)*85*dt; hubCat.facing = 1; hubCat.walkPhase += dt*13;
      if (d < 24) { triggerDoorEscape(true); return; }
    } else {
      const d = Math.hypot(hubCat.targetX-hubCat.x, hubCat.targetY-hubCat.y);
      if (hubCat.wait > 0) { hubCat.wait -= dt; if (hubCat.wait <= 0) { hubCat.targetX = 180+Math.random()*240; hubCat.targetY = 270+Math.random()*200; } }
      else if (d > 6) { const vx = ((hubCat.targetX-hubCat.x)/d)*65; hubCat.x += vx*dt; hubCat.y += ((hubCat.targetY-hubCat.y)/d)*65*dt; hubCat.walkPhase += dt*11; if (Math.abs(vx)>1) hubCat.facing = vx>0?1:-1; }
      else hubCat.wait = 1.2 + Math.random()*1.5;
    }
    if (hubPlayer.x > W - 160 && Math.abs(hubPlayer.y - 340) < 90) triggerDoorEscape(false);
  }

  function updateIntroEscape(dt) {
    introTimer += dt;
    if (introTimer < 0.8) {
      const pdx = (W-125)-hubPlayer.x, pdy = 340-hubPlayer.y, pd = Math.hypot(pdx, pdy)||1;
      if (pd > 8) { hubPlayer.x += (pdx/pd)*340*dt; hubPlayer.y += (pdy/pd)*340*dt; hubPlayer.walkPhase += dt*18; }
      hubPlayer.facing = 1;
      const cdx = (W-220)-hubCat.x, cdy = 345-hubCat.y, cd = Math.hypot(cdx, cdy)||1;
      if (cd > 10) { hubCat.x += (cdx/cd)*380*dt; hubCat.y += (cdy/cd)*380*dt; }
      hubCat.facing = 1; hubCat.walkPhase += dt*30;
    } else if (introTimer < 1.65) {
      doorSlamProgress = Math.min(0.75, (introTimer - 0.8) * 1.1);
      if (!introBeakerTipped && introTimer > 1.05) { introBeakerTipped = true; playSound('clang'); }
      hubCat.x += 460*dt; hubCat.y = 340 + Math.sin(introTimer*28)*10;
      hubCat.facing = 1; hubCat.walkPhase += dt*34; hubCat.emote = '💨 *FLUTSCH!* MIAU!!'; hubCat.emoteTimer = 1.0;
    } else if (introTimer < 2.65) {
      hubCat.x = W+80; hubPlayer.emote = '😱 NEIN! TÜR NICHT ZU!! MIMI!!'; hubPlayer.emoteTimer = 1.2;
      hubPlayer.x += 320*dt; hubPlayer.facing = 1; hubPlayer.walkPhase += dt*24;
    } else finishIntroAndStartWave1();
  }

  function endWave() {
    for (const o of game.orbs) game.energy += o.val; game.orbs = [];
    for (const f of game.fishDrops) game.cat.hp = Math.min(game.cat.maxHp, game.cat.hp + 2); game.fishDrops = [];
    saveData.metaPoints++; persistSave();
    if (game.stats.catRegen > 0) game.cat.hp = Math.min(game.cat.maxHp, game.cat.hp + game.stats.catRegen);
    if (game.wave === 20 && !game.corpPromptShown) { game.corpPromptShown = true; startStoryPack('CORP'); return; }
    if (!game.shopIntroPlayed) { startAgentIntro(); return; }
    openShop(false);
  }

  function triggerGameOver(vic) {
    state = 'END'; hud.classList.add('hidden'); controlsHint.classList.add('hidden'); bannerToast.classList.add('hidden'); endOverlay.classList.remove('hidden');
    syncMusic();
    $('end-title').textContent = vic ? '🎉 Welt gerettet! Heilmittel gefunden!' : '😿 Mimi wurde verjagt!';
    $('end-title').style.color = vic ? '#4ade80' : '#fb7185';
    $('end-desc').textContent = vic ? `Glückwunsch! Nach ${game.wave} Wellen habt ihr den OmniCorp-Boss besiegt und alle Tiere geheilt!` : `Ihr seid bis Welle ${game.wave} gekommen (+${game.wave-1} 🧬 Labor-Daten).`;
  }

  function openMetaModal() { renderMetaModal(); metaOverlay.classList.remove('hidden'); }
  function renderMetaModal() {
    const items = [
      { key:'hpLevel', name:'Katzen-Vitamin-Futter', icon:'❤️', cost:4+saveData.hpLevel*3, desc:`Mimi startet mit +2 Max-HP/Stufe (Aktuell: +${saveData.hpLevel*2} HP).` },
      { key:'shieldLevel', name:'Schild-Generator Mk.II', icon:'🛡️', cost:5+saveData.shieldLevel*4, desc:`Schutzschild hält +0.6s länger/Stufe (Aktuell: +${(saveData.shieldLevel*0.6).toFixed(1)}s).` },
      { key:'speedLevel', name:'Labor-Jetpack-Sohlen', icon:'👟', cost:4+saveData.speedLevel*3, desc:`Wissenschaftler +8% schneller/Stufe (Aktuell: +${saveData.speedLevel*8}%).` }
    ];
    const el = $('meta-cards'); el.innerHTML = '';
    for (const it of items) {
      const c = document.createElement('div'); c.className = 'shop-card gadget';
      c.innerHTML = `<div><div class="shop-card-top"><div class="shop-icon">${it.icon}</div><div><div class="shop-tag">Stufe ${saveData[it.key]}</div><div class="shop-title">${it.name}</div></div></div><p class="shop-desc" style="margin:10px 0 0;">${it.desc}</p></div><button class="btn btn-gold" ${saveData.metaPoints>=it.cost?'':'disabled'}>Verbessern (${it.cost} 🧬)</button>`;
      c.querySelector('button').onclick = () => { if (saveData.metaPoints<it.cost) return; saveData.metaPoints-=it.cost; saveData[it.key]++; persistSave(); playSound('buy'); renderMetaModal(); };
      el.appendChild(c);
    }
  }

  function openShop(skipArrivedVoice = false) {
    state = 'SHOP'; rerollCost = 4; generateShopOffers(); renderShop();
    agentIntroOverlay.classList.add('hidden');
    shopOverlay.classList.remove('hidden'); syncMusic();
    if (!skipArrivedVoice) {
      $('agent-text').textContent = '„Supply drop has arrived! Wähle weise, Doktor!“';
      if (customAudio.shop_arrived.loaded) playVoice('shop_arrived');
    } else {
      $('agent-text').textContent = '„Such dir starke Waffen aus – Galactic Animal Protection hilft dir!“';
    }
  }

  function generateShopOffers() {
    const wk = Object.keys(WEAPON_DEFS); shopOffers = [];
    for (let i = 0; i < 4; i++) {
      if (i < 2 || Math.random() < 0.35) { const d = WEAPON_DEFS[wk[Math.floor(Math.random()*wk.length)]]; shopOffers.push({ kind:'weapon', def:d, cost:d.cost, done:false, scrapped:false }); }
      else { const d = GADGET_DEFS[Math.floor(Math.random()*GADGET_DEFS.length)]; shopOffers.push({ kind:'gadget', def:d, cost:d.cost, done:false, scrapped:false }); }
    }
  }

  function buyOffer(idx) {
    const o = shopOffers[idx]; if (!o || o.done || game.energy < o.cost) return;
    let forgedOmega = false;
    if (o.kind === 'weapon') {
      const rLvl = game.research[o.def.id] || 0;
      forgedOmega = rLvl >= 3;
      const m = game.weapons.findIndex(w => w.defId===o.def.id && !w.omega && w.tier<4 && game.weapons.length>=6);
      if (game.weapons.length < 6) {
        game.energy -= o.cost;
        game.weapons.push({ defId:o.def.id, tier:1, resLvl:rLvl, omega:rLvl>=3, cd:0 });
        game.research[o.def.id] = 0;
      } else if (m !== -1) {
        game.energy -= o.cost;
        game.weapons[m].tier++; game.weapons[m].resLvl = Math.max(game.weapons[m].resLvl, rLvl);
        if (rLvl >= 3) game.weapons[m].omega = true;
        game.research[o.def.id] = 0;
      } else return;
    } else { game.energy -= o.cost; o.def.apply(game); }
    game.boughtItemsCount++; o.done = true; playSound('buy');
    if (forgedOmega && customAudio.shop_omega.loaded) {
      playVoice('shop_omega'); $('agent-text').textContent = '„OMEGA-WAFFE ONLINE! Maximaler Katzenschutz aktiviert!“';
    } else {
      playRandomShopVoice();
      const quotes = ['„Gute Wahl, Doktor!“','„Protect the cat at all costs!“','„Galactic Animal Protection unterstützt dieses Upgrade!“','„Für Mimi! Hol sie dir!“'];
      $('agent-text').textContent = quotes[Math.floor(Math.random()*quotes.length)];
    }
    renderShop();
  }

  function scrapOffer(idx) {
    const o = shopOffers[idx]; if (!o || o.done) return;
    game.energy += 2;
    if (o.kind === 'weapon') game.research[o.def.id] = Math.min(3, (game.research[o.def.id] || 0) + 1);
    o.done = true; o.scrapped = true; playSound('clang');
    if (customAudio.shop_scrap.loaded) playVoice('shop_scrap');
    $('agent-text').textContent = '„Für die Wissenschaft zerlegt! Weiter forschen, Doktor!“';
    renderShop();
  }

  function sellWeapon(i) {
    if (game.weapons.length <= 1) return;
    const w = game.weapons[i]; game.energy += Math.round(WEAPON_DEFS[w.defId].cost*0.6*w.tier*(w.omega?1.5:1));
    game.weapons.splice(i, 1); playSound('orb'); renderShop();
  }
  function findMergePair() {
    for (let i = 0; i < game.weapons.length; i++) {
      for (let j = i + 1; j < game.weapons.length; j++) {
        const a = game.weapons[i], b = game.weapons[j];
        if (!a.omega && !b.omega && a.defId === b.defId && a.tier === b.tier && a.tier < 4) return [i, j];
      }
    }
    return null;
  }
  function renderShop() {
    $('shop-energy').textContent = game.energy;
    $('cat-status-shop').textContent = `Mimi HP: ${game.cat.hp}/${game.cat.maxHp}`;
    $('feed-btn').disabled = game.energy < 5 || game.cat.hp >= game.cat.maxHp;
    $('reroll-btn').textContent = `🎲 Neu (${rerollCost} ⚡)`;
    $('reroll-btn').disabled = game.energy < rerollCost;
    if (game.corpPromptShown) $('shop-corp-btn').classList.remove('hidden'); else $('shop-corp-btn').classList.add('hidden');
    $('merge-btn').disabled = !findMergePair();

    $('shop-stats').innerHTML = `
      <span>Schaden: <strong>${Math.round(game.stats.damageMult*100)}%</strong></span>
      <span>Feuerrate: <strong>${Math.round(game.stats.fireRateMult*100)}%</strong></span>
      <span>Tempo: <strong>${Math.round(game.stats.playerSpeed)}</strong></span>
      <span>Schild: <strong>${game.stats.shieldDuration.toFixed(1)}s</strong></span>
      <span>Ernte: <strong>${Math.round(game.stats.energyMult*100)}% ⚡</strong></span>
      <span>Türme: <strong>${game.stats.turrets}</strong></span>
    `;

    const sc = $('shop-cards'); sc.innerHTML = '';
    shopOffers.forEach((o, i) => {
      const c = document.createElement('div');
      const rLvl = o.kind === 'weapon' ? (game.research[o.def.id] || 0) : 0;
      const isOmegaReady = o.kind === 'weapon' && rLvl >= 3;
      c.className = `shop-card ${o.kind} ${isOmegaReady ? 'omega-ready' : ''}`;
      const canM = o.kind==='weapon' && game.weapons.length>=6 && game.weapons.some(w=>w.defId===o.def.id && !w.omega && w.tier<4);
      const full = o.kind==='weapon' && game.weapons.length>=6 && !canM;
      const bpLabel = rLvl===0 ? 'Standard (0/3)' : rLvl===1 ? 'Prototyp +35% (1/3)' : rLvl===2 ? 'Mk.II +75% (2/3)' : '🔥 OMEGA BEREIT (3/3)!';

      c.innerHTML = `
        <div>
          <div class="shop-card-top">
            <div class="shop-icon">${o.def.icon}</div>
            <div>
              <div class="shop-tag">${o.kind==='weapon'?(isOmegaReady?'🔥 OMEGA-WAFFE':canM?'Waffe (Fusion)':'Labor-Waffe'):'Gadget'}</div>
              <div class="shop-title">${o.def.name}</div>
            </div>
          </div>
          <p class="shop-desc" style="margin:6px 0;">${o.def.desc}</p>
          ${o.kind === 'weapon' ? `
            <div class="bp-wrap">
              <div style="display:flex;justify-content:space-between;"><span>🔬 Bauplan:</span><strong style="color:${isOmegaReady?'#e879f9':'#7dd3fc'}">${bpLabel}</strong></div>
              <div class="bp-bar"><div class="bp-fill" style="width:${(rLvl/3)*100}%"></div></div>
            </div>` : ''}
        </div>
        <div class="card-actions">
          <button class="btn btn-small ${isOmegaReady?'btn-purple':'btn-gold'}" data-act="buy" ${o.done||game.energy<o.cost||full?'disabled':''}>
            ${o.done ? (o.scrapped?'♻️ Zerlegt':'✔ Gekauft') : full ? 'Slots voll' : `Kaufen (${o.cost} ⚡)`}
          </button>
          <button class="btn btn-small btn-slate" data-act="scrap" ${o.done?'disabled':''}>
            ${o.kind==='weapon' ? '🔬 Zerlegen (+2 ⚡ & +1 Bauplan)' : '♻️ Zerlegen (+2 ⚡)'}
          </button>
        </div>
      `;
      c.querySelector('[data-act="buy"]').onclick = () => buyOffer(i);
      c.querySelector('[data-act="scrap"]').onclick = () => scrapOffer(i);
      sc.appendChild(c);
    });

    const ws = $('weapon-slots'); ws.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('div'), w = game.weapons[i];
      if (w) {
        s.className = `w-slot filled ${w.omega?'omega':''}`;
        s.title = `${WEAPON_DEFS[w.defId].name}${w.omega?' (OMEGA!)':w.resLvl>0?` (+${w.resLvl} Bauplan)`:''} · Klick verkauft`;
        s.innerHTML = `${WEAPON_DEFS[w.defId].icon}<span class="tier">${w.omega?'Ω':'T'+w.tier}</span>`;
        s.onclick = () => sellWeapon(i);
      } else { s.className='w-slot'; s.innerHTML='<span style="font-size:12px;color:#4f6087;">+</span>'; }
      ws.appendChild(s);
    }
  }

  function updateHUD() {
    const c = game.cat, p = game.player;
    $('cat-hp-text').textContent = `${c.hp}/${c.maxHp}`;
    $('cat-hp-fill').style.width = `${(c.hp/c.maxHp)*100}%`;
    $('dash-fill').style.width = `${Math.max(0,Math.min(100,(1-p.dashCd/game.stats.dashCooldown)*100))}%`;
    if (game.romance.active) {
      $('shield-label').innerHTML = '<span style="color:#fda4af;">💕 ROMANTIK-SPERRE!</span>';
      $('shield-fill').style.background = 'linear-gradient(90deg, #fb7185, #f472b6)';
      $('shield-fill').style.width = '100%';
    } else {
      $('shield-label').innerHTML = 'Schild <span style="color:#67e8f9">[Space]</span>';
      $('shield-fill').style.background = 'linear-gradient(90deg, #0ea5e9, #67e8f9)';
      $('shield-fill').style.width = `${Math.max(0,Math.min(100,(1-c.shieldCdTimer/game.stats.shieldCooldown)*100))}%`;
    }
    $('wave-title').textContent = game.isCorpFinale ? '🏢 OMNICORP FINALE' : (game.wave > 20 ? `♾️ ENDLOS-MODUS · WELLE ${game.wave}` : `NACHBARSCHAFTS-PARK · WELLE ${game.wave} / 20`);
    const wt = Math.max(0, Math.ceil(game.waveTimer));
    $('wave-timer').textContent = wt;
    if (!game.isCorpFinale && wt <= 5 && wt >= 1 && game.bossesAlive === 0) $('wave-timer').classList.add('urgent');
    else $('wave-timer').classList.remove('urgent');
    $('energy-text').textContent = game.energy;
  }

  function drawCustomSprite(key, x, y, size, facing, walkPhase, flash, rot = 0) {
    const entry = sprites[key];
    if (!entry || !entry.loaded || !entry.img.naturalWidth) return false;
    const img = entry.img, sc = size / Math.max(img.width, img.height), dw = img.width*sc, dh = img.height*sc;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(x, y+dh*0.42, dw*0.36, dh*0.14, 0, 0, Math.PI*2); ctx.fill();
    ctx.translate(x, y - Math.abs(Math.sin(walkPhase))*4);
    ctx.rotate(Math.sin(walkPhase)*0.09 + rot); ctx.scale(facing || 1, 1);
    if (flash) { ctx.scale(1.12, 1.12); ctx.globalAlpha = 0.7; }
    ctx.drawImage(img, -dw/2, -dh/2, dw, dh); ctx.restore();
    return true;
  }
  function drawStaticProp(key, x, y, size, rot = 0) {
    const entry = sprites[key];
    if (!entry || !entry.loaded || !entry.img.naturalWidth) return false;
    const img = entry.img, sc = size / Math.max(img.width, img.height), dw = img.width*sc, dh = img.height*sc;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(0,0,0,0.26)';
    ctx.beginPath(); ctx.ellipse(x, y+dh*0.4, dw*0.42, dh*0.14, 0, 0, Math.PI*2); ctx.fill();
    ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(img, -dw/2, -dh/2, dw, dh); ctx.restore();
    return true;
  }

  function drawParkBench(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle='rgba(0,0,0,0.26)'; ctx.fillRect(-26,8,52,10);
    ctx.fillStyle='#334155'; ctx.fillRect(-22,4,5,10); ctx.fillRect(17,4,5,10);
    ctx.fillStyle='#92400e'; ctx.fillRect(-25,-8,50,7);
    ctx.fillStyle='#b45309'; ctx.fillRect(-26,0,52,8);
    ctx.fillStyle='#78350f'; ctx.fillRect(-25,-1,50,2);
    ctx.restore();
  }

  function drawNeighborhoodArena() {
    ctx.fillStyle = '#346644'; ctx.fillRect(0, 0, W, H);
    const centerGlow = ctx.createRadialGradient(W/2, H/2+20, 60, W/2, H/2+20, 480);
    centerGlow.addColorStop(0, 'rgba(72, 148, 92, 0.34)'); centerGlow.addColorStop(1, 'rgba(22, 48, 32, 0.25)');
    ctx.fillStyle = centerGlow; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(130, 126, 102, 0.38)'; ctx.lineWidth = 34; ctx.lineJoin = 'round';
    ctx.strokeRect(86, 122, W - 172, H - 196);

    for (const d of meadowDetails) {
      if (d.type === 'blade') { ctx.fillStyle='#295337'; ctx.fillRect(d.x,d.y,2,5); ctx.fillRect(d.x+4,d.y+1,2,4); }
      else { ctx.fillStyle=d.col; ctx.fillRect(d.x,d.y,3,3); }
    }

    ctx.fillStyle = '#475569';
    ctx.fillRect(292,74,46,46); ctx.fillRect(762,74,46,46);
    ctx.fillRect(0,302,70,56); ctx.fillRect(W-70,302,70,56); ctx.fillRect(470,H-74,60,74);

    for (const [fx, fy] of [[84,122],[W-84,122],[84,H-78],[W-84,H-78]]) {
      ctx.fillStyle='#5c4033'; ctx.beginPath(); ctx.arc(fx,fy,18,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#166534'; ctx.beginPath(); ctx.arc(fx,fy,15,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fb7185'; ctx.fillRect(fx-6,fy-5,4,4); ctx.fillRect(fx+4,fy+2,4,4);
      ctx.fillStyle='#fde047'; ctx.fillRect(fx+3,fy-6,4,4); ctx.fillRect(fx-5,fy+4,4,4);
    }
    drawParkBench(390, 108); drawParkBench(710, 108); drawParkBench(300, H-64);

    for (const [lx, ly] of [[348,110],[748,110]]) {
      const g = ctx.createRadialGradient(lx,ly,3,lx,ly,48);
      g.addColorStop(0,'rgba(253,224,71,0.16)'); g.addColorStop(1,'rgba(253,224,71,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(lx,ly,48,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1e293b'; ctx.fillRect(lx-2,ly-14,4,16);
      ctx.fillStyle='#fef08a'; ctx.beginPath(); ctx.arc(lx,ly-15,4,0,Math.PI*2); ctx.fill();
    }

    ctx.fillStyle = 'rgba(12,24,16,0.26)'; ctx.fillRect(0,82,W,22);
    const drawHedge = (x,y,w,h) => { ctx.fillStyle='#1b4332'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#2d6a4f'; ctx.fillRect(x+3,y+2,w-6,h-6); };
    drawHedge(0,56,110,34); drawHedge(245,56,47,34); drawHedge(338,56,200,34);
    drawHedge(685,56,77,34); drawHedge(808,56,192,34);
    drawHedge(0,88,34,214); drawHedge(0,358,34,244); drawHedge(W-34,88,34,214); drawHedge(W-34,358,34,244);
    ctx.fillStyle='#4b5563'; ctx.fillRect(0,H-36,470,18); ctx.fillRect(530,H-36,470,18);
    ctx.fillStyle='#64748b'; ctx.fillRect(0,H-36,470,5); ctx.fillRect(530,H-36,470,5);
    ctx.fillStyle='#1e293b'; ctx.fillRect(0,H-18,470,18); ctx.fillRect(530,H-18,470,18);

    drawHouseFallback('houseLab',175,50,true); drawTreeFallback(455,50);
    drawHouseFallback('houseNeigh',610,50,false); drawTreeFallback(905,50);
    drawTreeFallback(26,150); drawTreeFallback(W-26,150);
  }

  function drawHouseFallback(key, x, y, isLab) {
    if (drawStaticProp(key, x, y, 130)) return;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillRect(-58,22,116,16);
    ctx.fillStyle=isLab?'#cbd5e1':'#e2d5c1'; ctx.fillRect(-54,-10,108,42);
    ctx.strokeStyle='#1e293b'; ctx.lineWidth=2; ctx.strokeRect(-54,-10,108,42);
    ctx.fillStyle=isLab?'#334155':'#b45309'; ctx.beginPath(); ctx.moveTo(-62,-10); ctx.lineTo(0,-44); ctx.lineTo(62,-10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#451a03'; ctx.fillRect(-10,8,20,24);
    ctx.fillStyle=isLab?'#38bdf8':'#fef08a'; ctx.fillRect(-40,2,18,16); ctx.fillRect(22,2,18,16);
    if (isLab) { ctx.fillStyle='#0284c7'; ctx.fillRect(14,-34,24,14); }
    ctx.restore();
  }
  function drawTreeFallback(x, y) {
    if (drawStaticProp('tree', x, y, 92)) return;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle='rgba(0,0,0,0.26)'; ctx.beginPath(); ctx.ellipse(0,28,28,9,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#451a03'; ctx.fillRect(-6,6,12,24);
    ctx.fillStyle='#166534'; ctx.beginPath(); ctx.arc(0,-8,28,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(-6,-14,16,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (state === 'TITLE') { drawTitleBg(); return; }
    if (state === 'STORY' || state === 'READY_PROMPT') { drawStory(); return; }
    if (state === 'HUB' || state === 'INTRO_ESCAPE') { drawHub(); return; }

    ctx.save();
    if (game && game.shake > 0) ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
    if (game && game.isCorpFinale) drawCorpArena(); else drawNeighborhoodArena();

    if (!game) { ctx.restore(); return; }
    if (!game.isCorpFinale && game.activeProp) drawLandmark(game.activeProp, !game.activeProp.triggered);
    for (const pu of game.puddles) { ctx.fillStyle=`rgba(74,222,128,${Math.min(0.45,pu.life*0.25)})`; ctx.beginPath(); ctx.arc(pu.x,pu.y,pu.r,0,Math.PI*2); ctx.fill(); }
    for (const ex of game.explosions) { ctx.fillStyle=`rgba(192,132,252,${ex.life*1.5})`; ctx.beginPath(); ctx.arc(ex.x,ex.y,ex.r*(1.2-ex.life),0,Math.PI*2); ctx.fill(); }
    for (const pt of game.particles) { ctx.globalAlpha=Math.max(0,pt.life/0.7); ctx.fillStyle=pt.color; ctx.beginPath(); ctx.arc(pt.x,pt.y,pt.r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }
    if (game.laserDot) { ctx.fillStyle='rgba(255,50,80,0.35)'; ctx.beginPath(); ctx.arc(game.laserDot.x,game.laserDot.y,13,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#ff2a55'; ctx.beginPath(); ctx.arc(game.laserDot.x,game.laserDot.y,5,0,Math.PI*2); ctx.fill(); }
    for (const s of game.spawns) { ctx.strokeStyle='#fb7185'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(s.x,s.y,16,0,Math.PI*2); ctx.stroke(); ctx.fillStyle='#fb7185'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText('!',s.x,s.y+6); }
    for (const o of game.orbs) { ctx.fillStyle='#4ade80'; ctx.beginPath(); ctx.arc(o.x,o.y,6,0,Math.PI*2); ctx.fill(); }
    for (const f of game.fishDrops) { ctx.font='20px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🐟', f.x, f.y+Math.sin(performance.now()/200)*3); }
    for (const tu of game.turretsList) {
      ctx.fillStyle='#334155'; ctx.beginPath(); ctx.arc(tu.x,tu.y,14,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#fbbf24'; ctx.lineWidth=2; ctx.stroke();
      ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🤖', tu.x, tu.y-2);
    }
    for (const rmMouse of game.roboMiceList) { ctx.font='22px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🐭',rmMouse.x,rmMouse.y+Math.sin(rmMouse.walkPhase)*2); }
    for (const e of game.enemies) drawEnemy(e);
    if (game.romance.active && game.romance.gf) drawGirlfriendCat(game.romance.gf);
    drawCat(game.cat);
    drawScientist(game.player, game.weapons);
    for (const pr of game.projectiles) { ctx.fillStyle=pr.color; ctx.beginPath(); ctx.arc(pr.x,pr.y,pr.r,0,Math.PI*2); ctx.fill(); }
    for (const l of game.lightnings) { ctx.strokeStyle=l.color||'#fde047'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(l.x1,l.y1); ctx.lineTo((l.x1+l.x2)/2+(Math.random()-0.5)*24,(l.y1+l.y2)/2+(Math.random()-0.5)*24); ctx.lineTo(l.x2,l.y2); ctx.stroke(); }
    for (const t of game.texts) { ctx.globalAlpha=Math.max(0,t.life/0.95); ctx.fillStyle=t.color; ctx.font=`900 ${t.size}px sans-serif`; ctx.textAlign='center'; ctx.fillText(t.text,t.x,t.y); ctx.globalAlpha=1; }
    ctx.restore();
  }

  function drawGirlfriendCat(gf) {
    if (!drawCustomSprite('catFriend', gf.x, gf.y, 48, gf.facing, gf.walkPhase, false)) {
      ctx.save(); ctx.translate(gf.x, gf.y + Math.sin(gf.walkPhase)*2);
      ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0,gf.r,14,5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fef3c7'; ctx.beginPath(); ctx.moveTo(-10,-6); ctx.lineTo(-12,-18); ctx.lineTo(-2,-11); ctx.fill();
      ctx.beginPath(); ctx.moveTo(10,-6); ctx.lineTo(12,-18); ctx.lineTo(2,-11); ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,gf.r,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#f472b6'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#f472b6'; ctx.beginPath(); ctx.arc(-7,-12,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1e293b'; ctx.beginPath(); ctx.arc(-4.5,-2,2.2,0,Math.PI*2); ctx.arc(4.5,-2,2.2,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    if (gf.emoteTimer > 0 && gf.emote) { ctx.fillStyle='#f9a8d4'; ctx.font='bold 13px sans-serif'; ctx.textAlign='center'; ctx.fillText(gf.emote, gf.x, gf.y - gf.r - 22); }
  }

  function drawCorpArena() {
    ctx.fillStyle = '#182030'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'; ctx.lineWidth = 2;
    for (let x=0; x<W; x+=64) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y=0; y<H; y+=64) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.font = '900 44px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('☣️ OMNICORP ZENTRALE ☣️', W/2, H/2);
    ctx.fillStyle = '#0e1420'; ctx.fillRect(0,0,W,TOP_PAD-10); ctx.fillRect(0,H-ARENA_PAD,W,ARENA_PAD);
    ctx.fillStyle = '#4ade80'; ctx.font = 'bold 14px sans-serif'; ctx.fillText('💊 HEILMITTEL-TRESOR 💊', W/2, 55);
  }

  function drawTitleBg() {
    ctx.fillStyle = '#0c1320'; ctx.fillRect(0,0,W,H);
    for (const s of titleSpores) { ctx.fillStyle='rgba(74,222,128,0.35)'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); }
    drawScientist({ x:160, y:500, r:20, facing:1, walkPhase:performance.now()/280 }, [{ defId:'laser' }, { defId:'tesla', omega:true }]);
    drawCat({ x:240, y:515, r:14, invulnTimer:0, shieldTimer:1, tripTimer:0, walkPhase:performance.now()/240, facing:1, emoteTimer:0 });
  }

  function drawStory() {
    const t = storyTimer;
    if (storyMode === 'INTRO') {
      const imgKey = ['intro1','intro2','intro3','intro4'][storyScene];
      if (sprites[imgKey] && sprites[imgKey].loaded && sprites[imgKey].img.naturalWidth > 0) {
        ctx.save(); ctx.imageSmoothingEnabled = false;
        const zoom = 1 + Math.min(0.06, t * 0.008);
        ctx.translate(W/2, H/2); ctx.scale(zoom, zoom);
        ctx.drawImage(sprites[imgKey].img, -W/2, -H/2, W, H);
        ctx.restore(); return;
      }
      if (storyScene === 0) {
        ctx.fillStyle='#141b2d'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#0d1322'; ctx.fillRect(0,0,W,110);
        ctx.fillStyle='#334155'; ctx.font='900 28px sans-serif'; ctx.textAlign='center'; ctx.fillText('OMNICORP BIO-LAB', W/2, 68);
        ctx.fillStyle='rgba(74,222,128,0.18)'; ctx.fillRect(W/2-65,135,130,220); ctx.strokeStyle='#4ade80'; ctx.lineWidth=4; ctx.strokeRect(W/2-65,135,130,220);
        ctx.fillStyle='#86efac'; for(let b=0;b<5;b++){ ctx.beginPath(); ctx.arc(W/2-30+b*15, 320-((t*45+b*35)%160), 5, 0, Math.PI*2); ctx.fill(); }
        drawScientist({ x:270, y:340, r:22, facing:1, walkPhase:t*6 }, []);
        ctx.fillStyle='#fbbf24'; ctx.font='bold 14px sans-serif'; ctx.fillText('⚠️ Zu gefährlich! Stoppen!', 270, 275);
        drawSuitChar(680, 340, '#1e293b', '#ef4444', 'Boss'); drawSuitChar(770, 340, '#e2e8f0', '#a855f7', 'Prof');
        ctx.fillStyle='#fb7185'; ctx.font='bold 14px sans-serif'; ctx.fillText('Mehr Power = Mehr Profit!', 725, 275);
      } else if (storyScene === 1) {
        ctx.save(); if (t<1.4) ctx.translate((Math.random()-0.5)*14, (Math.random()-0.5)*14);
        ctx.fillStyle='#1f1224'; ctx.fillRect(0,0,W,H);
        const rad = Math.min(420, 45 + t*150);
        ctx.fillStyle='rgba(74,222,128,0.22)'; ctx.beginPath(); ctx.arc(W/2,240,rad,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#4ade80'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(W/2,240,rad*0.7,0,Math.PI*2); ctx.stroke();
        drawScientist({ x:Math.max(85,270-t*80), y:360, r:22, facing:-1, walkPhase:t*16 }, []);
        ctx.fillStyle='#fff'; ctx.font='bold 15px sans-serif'; ctx.textAlign='center'; ctx.fillText('😱 ES IST FREI!!', Math.max(120,270-t*80), 300);
        ctx.restore();
      } else if (storyScene === 2) {
        drawNeighborhoodArena();
        ctx.fillStyle='rgba(74,222,128,0.16)'; ctx.fillRect(0, 50+Math.sin(t*2)*15, W, 170);
        ctx.fillStyle='#4ade80'; ctx.font='900 20px sans-serif'; ctx.textAlign='center'; ctx.fillText('☣️ VIRUS-WOLKE INFIZIERT DEN PARK! ☣️', W/2, 130);
        drawEnemy({ type:'strayCat', isBoss:false, x:240, y:300, r:24, facing:1, walkPhase:t*10, hitFlash:0 });
        drawEnemy({ type:'squirrel', isBoss:false, x:420, y:320, r:19, facing:-1, walkPhase:t*14, hitFlash:0 });
        drawEnemy({ type:'bossRaccoon', isBoss:false, x:610, y:295, r:30, facing:-1, walkPhase:t*8, hitFlash:0 });
        drawEnemy({ type:'hedgehog', isBoss:false, x:790, y:320, r:23, facing:-1, walkPhase:t*9, hitFlash:0 });
      } else {
        drawHub(); ctx.fillStyle='rgba(74,222,128,0.22)'; ctx.fillRect(W-60,0,60,H);
      }
      return;
    }
    if (storyMode === 'CORP') {
      ctx.fillStyle = '#15202b'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(660, 80, 240, 340);
      ctx.fillStyle = '#fb7185'; ctx.font = '900 24px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('☣️ OMNICORP', 780, 140);
      ctx.fillStyle = '#1e293b'; for (let y=175; y<370; y+=45) { ctx.fillRect(695,y,55,24); ctx.fillRect(795,y,55,24); }
      drawScientist({ x:280, y:350, r:20, facing:1, walkPhase:t*4 }, []);
      drawCat({ x:365, y:365, r:14, invulnTimer:0, shieldTimer:0, tripTimer:0, walkPhase:storyScene===1?t*20:t*6, facing:1, emoteTimer:storyScene===1?1:0, emote:'💢 MAUTZ!!' });
      return;
    }
    if (storyMode === 'CURE') {
      ctx.fillStyle = '#0f2933'; ctx.fillRect(0,0,W,H);
      const r = (t * 220) % 700;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(W/2, 270, r, 0, Math.PI*2); ctx.stroke();
      ctx.font = '58px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('💊', W/2, 245);
      drawScientist({ x:430, y:360, r:20, facing:1, walkPhase:t*6 }, []);
      drawCat({ x:520, y:375, r:14, invulnTimer:0, shieldTimer:1, tripTimer:0, walkPhase:t*10, facing:-1, emoteTimer:1, emote:'♥ Schnurr!' });
    }
  }

  function drawSuitChar(x, y, coatCol, accentCol, label) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle=coatCol; ctx.beginPath(); ctx.arc(0,0,22,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#0f172a'; ctx.lineWidth=3; ctx.stroke();
    ctx.fillStyle=accentCol; ctx.fillRect(-10,-8,20,7);
    ctx.fillStyle='#94a3b8'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.fillText(label,0,36);
    ctx.restore();
  }

  function drawLandmark(lm, isTarget) {
    ctx.save(); ctx.translate(lm.x + (lm.shake || 0), lm.y);
    ctx.scale(lm.scale || 1, lm.scale || 1);
    if (isTarget) {
      ctx.strokeStyle='#fbbf24'; ctx.fillStyle='rgba(251,191,36,0.22)'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(0,0,36+Math.sin(performance.now()/160)*5,0,Math.PI*2); ctx.fill(); ctx.stroke();
    }
    const rot = (lm.tipped && lm.type !== 'leafpile') ? 1.25 : 0;
    const propKey = { bush:'propBush', trashcan:'propTrash', box:'propBox', leafpile:'propLeaves' }[lm.type];
    if (!drawStaticProp(propKey, 0, 0, 62, rot)) {
      ctx.rotate(rot);
      if (lm.type === 'trashcan') {
        ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(0,18,20,7,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#8d99ae'; ctx.fillRect(-15,-16,30,34); ctx.strokeStyle='#2b2d42'; ctx.lineWidth=2; ctx.strokeRect(-15,-16,30,34);
        ctx.fillStyle='#adb5bd'; ctx.fillRect(-18,-22,36,7); ctx.strokeRect(-18,-22,36,7);
      } else if (lm.type === 'bush') {
        ctx.fillStyle='#1b4332'; ctx.beginPath(); ctx.arc(-12,4,16,0,Math.PI*2); ctx.arc(12,4,16,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#2d6a4f'; ctx.beginPath(); ctx.arc(0,-8,19,0,Math.PI*2); ctx.fill();
      } else if (lm.type === 'box') {
        ctx.fillStyle='#d4a373'; ctx.fillRect(-18,-14,36,28); ctx.strokeStyle='#7f5539'; ctx.lineWidth=2.5; ctx.strokeRect(-18,-14,36,28);
        ctx.fillStyle='#bc4749'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText('?',0,6);
      } else {
        const sc = lm.tipped ? 1.35 : 1; ctx.scale(sc, lm.tipped ? 0.7 : 1);
        ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(0,12,26,10,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#92400e'; ctx.beginPath(); ctx.ellipse(-8,4,15,10,0.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#d97706'; ctx.beginPath(); ctx.ellipse(9,5,15,10,-0.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.ellipse(0,-4,17,12,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(-4,-7,6,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
    if (isTarget) { ctx.fillStyle='#fde68a'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText('🔍 Schnüffel-Ziel!', lm.x, lm.y-38); }
  }

  // NEUES HAUS & LABOR mit Holzdielen, Fenstern & deinen Möbel-PNGs!
  function drawHub() {
    ctx.fillStyle = '#4a3525'; ctx.fillRect(0, 0, 440, H);
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 2;
    for (let y = 90; y < H - 45; y += 26) { ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(440, y); ctx.stroke(); }

    ctx.fillStyle = '#1e293b'; ctx.fillRect(440, 0, W - 440, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let x = 440; x < W - 60; x += 48) { ctx.beginPath(); ctx.moveTo(x, 90); ctx.lineTo(x, H - 45); ctx.stroke(); }
    for (let y = 90; y < H - 45; y += 48) { ctx.beginPath(); ctx.moveTo(440, y); ctx.lineTo(W - 60, y); ctx.stroke(); }

    ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, W, 92); ctx.fillRect(0, H - 45, W, 45);
    ctx.fillRect(0, 0, 60, H); ctx.fillRect(W - 60, 0, 60, H);
    for (const wx of [340, 740]) {
      ctx.fillStyle = '#346644'; ctx.fillRect(wx, 22, 92, 48);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.strokeRect(wx, 22, 92, 48);
      ctx.beginPath(); ctx.moveTo(wx + 46, 22); ctx.lineTo(wx + 46, 70); ctx.stroke();
    }

    ctx.fillStyle = '#4c1d4b'; ctx.beginPath(); ctx.ellipse(245, 420, 130, 82, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#831843'; ctx.lineWidth = 3; ctx.stroke();

    if (!drawStaticProp('labSofa', 150, 485, 110)) {
      ctx.fillStyle = '#991b1b'; ctx.fillRect(95, 458, 110, 44);
      ctx.fillStyle = '#b91c1c'; ctx.fillRect(95, 448, 110, 16);
      ctx.fillStyle = '#fca5a5'; ctx.fillRect(108, 466, 20, 14); ctx.fillRect(170, 466, 20, 14);
    }

    if (!drawStaticProp('catTree', 155, 355, 95)) {
      ctx.fillStyle = '#fb7185'; ctx.beginPath(); ctx.ellipse(220, 395, 32, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#78350f'; ctx.fillRect(142, 345, 28, 22);
      ctx.fillStyle = '#d6d3d1'; ctx.fillRect(151, 300, 10, 50);
      ctx.fillStyle = '#b45309'; ctx.fillRect(132, 294, 48, 12);
      ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(174, 320, 5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = '#24334d'; ctx.fillRect(105, 165, 120, 60);
    ctx.fillStyle = '#0ea5e9'; ctx.fillRect(120, 175, 90, 28);
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🔬 [E] Labor-Upgrades', 165, 150);

    if (!drawStaticProp('labShelf', 475, 140, 105)) {
      ctx.fillStyle = '#475569'; ctx.fillRect(430, 105, 95, 58);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(436, 112, 83, 20); ctx.fillRect(436, 137, 83, 20);
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(442, 116, 10, 14);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(458, 116, 10, 14);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(475, 140, 12, 14);
    }

    if (!drawStaticProp('labTable', 595, 195, 120)) {
      ctx.fillStyle = '#334155'; ctx.fillRect(535, 170, 120, 56);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.strokeRect(535, 170, 120, 56);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(550, 182, 10, 20);
      ctx.fillStyle = '#fb7185'; ctx.fillRect(566, 184, 10, 18);
    }
    ctx.save(); ctx.translate(612, 195); if (introBeakerTipped) ctx.rotate(1.3);
    ctx.fillStyle = '#4ade80'; ctx.fillRect(-6, -14, 12, 22); ctx.restore();
    if (introBeakerTipped) { ctx.fillStyle = 'rgba(74,222,128,0.45)'; ctx.beginPath(); ctx.ellipse(634, 206, 22, 10, 0, 0, Math.PI * 2); ctx.fill(); }

    const doorH = 150, gapOffset = doorSlamProgress * 55;
    ctx.fillStyle = mimiDoorUrge ? 'rgba(251,113,133,0.28)' : 'rgba(251,191,36,0.22)';
    ctx.fillRect(W - 130, 265, 70, doorH);
    ctx.fillStyle = '#334155';
    if (doorSlamProgress > 0) ctx.fillRect(W - 75, 265, 16, gapOffset);
    ctx.strokeStyle = mimiDoorUrge ? '#fb7185' : '#fbbf24'; ctx.lineWidth = 4;
    ctx.strokeRect(W - 130, 265, 70, doorH);
    ctx.fillStyle = mimiDoorUrge ? '#fda4af' : '#fde68a'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText(mimiDoorUrge ? '🚨 TÜR ZUMACHEN!' : '🔓 TÜR UNVERSCHLOSSEN', W - 138, 250);

    drawCat({ ...hubCat, hp: 10, maxHp: 10, invulnTimer: 0, shieldTimer: 0, tripTimer: 0 });
    drawScientist(hubPlayer, [{ defId: 'laser' }]);
    if (state === 'INTRO_ESCAPE') {
      ctx.fillStyle = 'rgba(8,12,20,0.75)'; ctx.fillRect(W/2 - 170, H - 42, 340, 28);
      ctx.fillStyle = '#fde68a'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Mimi flutscht durch die Tür! [Leertaste = Skip]', W/2, H - 24);
    }
  }

  function drawCat(c) {
    if (c.shieldTimer > 0) {
      ctx.save(); ctx.strokeStyle='#67e8f9'; ctx.fillStyle='rgba(56,189,248,0.22)'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(c.x,c.y,c.r+24,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    const blink = c.invulnTimer>0 && Math.floor(c.invulnTimer*16)%2===0, trip = c.tripTimer>0 ? Math.sin(c.tripTimer*20)*0.65 : 0;
    if (!drawCustomSprite('cat', c.x, c.y, 48, c.facing, c.walkPhase, blink, trip)) {
      ctx.save(); ctx.translate(c.x, c.y+Math.sin(c.walkPhase)*2); ctx.rotate(trip); if (blink) ctx.globalAlpha=0.45;
      ctx.fillStyle='#ff9f43'; ctx.beginPath(); ctx.moveTo(-10,-6); ctx.lineTo(-12,-18); ctx.lineTo(-2,-11); ctx.fill();
      ctx.beginPath(); ctx.moveTo(10,-6); ctx.lineTo(12,-18); ctx.lineTo(2,-11); ctx.fill();
      ctx.fillStyle='#ffb86c'; ctx.beginPath(); ctx.arc(0,0,c.r,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#c4721d'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#1e2433'; ctx.beginPath(); ctx.arc(-4.5,-2,2.2,0,Math.PI*2); ctx.arc(4.5,-2,2.2,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    if (c.emoteTimer > 0 && c.emote) { ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif'; ctx.textAlign='center'; ctx.fillText(c.emote, c.x, c.y-c.r-22); }
  }

  function drawScientist(p, weapons) {
    if (!drawCustomSprite('scientist', p.x, p.y, 64, p.facing, p.walkPhase, false)) {
      ctx.save(); ctx.translate(p.x, p.y+Math.sin(p.walkPhase)*2);
      ctx.fillStyle='#f8fafc'; ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2.5; ctx.stroke();
      ctx.fillStyle='#38bdf8'; ctx.fillRect(-10,-7,8,6); ctx.fillRect(2,-7,8,6);
      ctx.restore();
    }
    if (p.emoteTimer > 0 && p.emote) { ctx.fillStyle='#fde68a'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText(p.emote, p.x, p.y-p.r-30); }
    weapons.forEach((w, i) => {
      const a = (i/Math.max(1,weapons.length))*Math.PI*2 + performance.now()/1600;
      const wx = p.x+Math.cos(a)*(p.r+18), wy = p.y+Math.sin(a)*(p.r+18);
      if (w.omega) { ctx.fillStyle='rgba(192,132,252,0.38)'; ctx.beginPath(); ctx.arc(wx,wy,12,0,Math.PI*2); ctx.fill(); }
      ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(WEAPON_DEFS[w.defId].icon, wx, wy);
    });
  }

  function drawEnemy(e) {
    const size = e.isBoss ? e.r*2.5 : e.r*2.7;
    const spriteKey = e.type === 'megaHedgehog' ? 'hedgehog' : e.type;
    if (!drawCustomSprite(spriteKey, e.x, e.y, size, e.facing, e.walkPhase, e.hitFlash > 0)) {
      ctx.save(); ctx.translate(e.x, e.y);
      if (e.type === 'corpBot' || e.type === 'corpBoss') {
        ctx.fillStyle = e.hitFlash > 0 ? '#fff' : (e.type === 'corpBoss' ? '#be185d' : '#64748b');
        ctx.fillRect(-e.r*0.8, -e.r*0.8, e.r*1.6, e.r*1.6);
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3; ctx.strokeRect(-e.r*0.8, -e.r*0.8, e.r*1.6, e.r*1.6);
        ctx.fillStyle = '#ff2a55'; ctx.fillRect(-e.r*0.45, -e.r*0.25, e.r*0.9, e.r*0.26);
      } else {
        const col = { strayCat:'#4b8f5e', squirrel:'#744c8c', hedgehog:'#5e3a6e', megaHedgehog:'#7c3aed', megaCat:'#397a49', bossRaccoon:'#5e8f66' }[e.type] || '#4b8f5e';
        ctx.fillStyle = e.hitFlash > 0 ? '#fff' : col;
        ctx.beginPath(); ctx.arc(0,0,e.r,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#141824'; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle = '#4ade80'; ctx.beginPath(); ctx.arc(-e.r*0.3,-e.r*0.2,e.r*0.18,0,Math.PI*2); ctx.arc(e.r*0.3,-e.r*0.2,e.r*0.18,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
    if (e.isBoss) {
      ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.fillText('👑', e.x, e.y-e.r-24);
      ctx.fillStyle='#090d16'; ctx.fillRect(e.x-40, e.y-e.r-18, 80, 8);
      ctx.fillStyle='#fb7185'; ctx.fillRect(e.x-40, e.y-e.r-18, 80*Math.max(0,e.hp/e.maxHp), 8);
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000); lastTime = now;
    update(dt); draw(); requestAnimationFrame(loop);
  }

  onClick('title-play-story-btn', () => startStoryPack('INTRO'));
  onClick('title-skip-to-lab-btn', () => { initAudio(); enterHub(); });
  onClick('title-sprites-btn', openSpritesModal);
  onClick('story-next-btn', advanceStoryScene);
  onClick('story-skip-btn', finishStoryPack);
  onClick('agent-skip-btn', () => {
    if (activeVoice && !activeVoice.paused) { activeVoice.onended = null; activeVoice.pause(); activeVoice.currentTime = 0; }
    openShop(true);
  });
  onClick('ready-yes-btn', startCorpFinale);
  onClick('ready-endless-btn', () => { readyOverlay.classList.add('hidden'); openShop(true); });
  onClick('shop-corp-btn', startCorpFinale);
  onClick('sprites-check-btn', openSpritesModal);
  onClick('close-sprites-btn', () => spritesOverlay.classList.add('hidden'));
  onClick('replay-story-btn', () => startStoryPack('INTRO'));
  onClick('open-meta-btn', () => { initAudio(); openMetaModal(); });
  onClick('close-meta-btn', () => metaOverlay.classList.add('hidden'));
  onClick('quick-start-btn', () => triggerDoorEscape(false));
  onClick('reroll-btn', () => { if (game.energy>=rerollCost) { game.energy-=rerollCost; rerollCost+=2; generateShopOffers(); playSound('buy'); renderShop(); } });
  onClick('merge-btn', () => {
    const pair = findMergePair(); if (!pair) return;
    const [i, j] = pair, a = game.weapons[i], b = game.weapons[j];
    a.tier++; a.resLvl = Math.max(a.resLvl, b.resLvl);
    game.weapons.splice(j, 1); playSound('buy'); renderShop();
  });
  onClick('feed-btn', () => {
    if (game.energy < 5 || game.cat.hp >= game.cat.maxHp) return;
    game.energy -= 5; game.cat.hp = Math.min(game.cat.maxHp, game.cat.hp + 2);
    playSound('purr');
    if (customAudio.shop_snack.loaded) playVoice('shop_snack');
    $('agent-text').textContent = '„Notfall-Thunfisch-Snack abgeworfen! Glückliches Kätzchen!“';
    renderShop();
  });
  onClick('next-wave-btn', () => {
    if (activeVoice && !activeVoice.paused) { activeVoice.onended = null; activeVoice.pause(); activeVoice.currentTime = 0; }
    startWave(game.wave + 1);
  });
  onClick('retry-btn', startRun);
  onClick('back-hub-btn', enterHub);

  requestAnimationFrame(loop);
})();