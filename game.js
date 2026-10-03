/* Flüstertide — original adventure runtime. No network or dependencies.
   Retro-Pipeline: intern 320×180, Bayer-Dithering, Pixel-Dissolve, Vollbild. */
(() => {
  'use strict';
  const Story = window.PirateStory;
  const Art = window.PirateArt;
  const $ = id => document.getElementById(id);
  if (!Story || !Art) {
    $('actionText').textContent = 'Die Spieldateien fehlen. Bitte den vollständigen Ordner öffnen.';
    return;
  }
  const SAVE_KEY = 'fluestertide.save.v1';
  const PREF_KEY = 'fluestertide.prefs.v1';
  const BASE_W = 1600, BASE_H = 900, PIX_W = 320, PIX_H = 180;
  const canvas = $('world'), ctx = canvas.getContext('2d', { willReadFrequently: true });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let prefs = { pixel: true, scanlines: true, voice: true };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch {}
  let pixelOn = prefs.pixel !== false, scanOn = prefs.scanlines !== false, voiceOn = prefs.voice !== false;
  const app = document.getElementById('app');
  function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify({ pixel: pixelOn, scanlines: scanOn, voice: voiceOn })); } catch {} }
  function applyRenderMode() {
    canvas.width = pixelOn ? PIX_W : BASE_W;
    canvas.height = pixelOn ? PIX_H : BASE_H;
    app.classList.toggle('scanlines-on', scanOn);
    app.classList.toggle('pixel-on', pixelOn);
  }
  /* 4x4-Bayer-Dithering + Farbreduktion: der Zak-McKracken-Look. */
  const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v => (v + .5) / 16);
  function postFX() {
    if (!pixelOn) return;
    const w = canvas.width, h = canvas.height, img = ctx.getImageData(0, 0, w, h), d = img.data;
    const L = 6, step = 255 / (L - 1);
    for (let y = 0; y < h; y++) {
      const row = (y & 3) << 2;
      for (let x = 0; x < w; x++) {
        const bias = (BAYER[row | (x & 3)] - .5) * step, i = (y * w + x) << 2;
        d[i] = Math.round(Math.max(0, Math.min(255, d[i] + bias)) / step) * step;
        d[i + 1] = Math.round(Math.max(0, Math.min(255, d[i + 1] + bias)) / step) * step;
        d[i + 2] = Math.round(Math.max(0, Math.min(255, d[i + 2] + bias)) / step) * step;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  /* Pixel-Dissolve: Szenenwechsel in klaren Blöcken statt weichem Blenden. */
  const snap = document.createElement('canvas'), snapCtx = snap.getContext('2d');
  let dissolve = null;
  function startDissolve() {
    if (reducedMotion) return;
    snap.width = canvas.width; snap.height = canvas.height;
    snapCtx.drawImage(canvas, 0, 0);
    const cols = 20, rows = 15, order = [...Array(cols * rows).keys()];
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    dissolve = { order, revealed: 0, cols, rows, bw: canvas.width / cols, bh: canvas.height / rows };
  }
  function stepDissolve() {
    const d = dissolve;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let k = d.revealed; k < d.order.length; k++) {
      const b = d.order[k], x = (b % d.cols) * d.bw, y = Math.floor(b / d.cols) * d.bh;
      ctx.drawImage(snap, x, y, d.bw, d.bh, x, y, d.bw + 1, d.bh + 1);
    }
    ctx.restore(); d.revealed += 24;
    if (d.revealed >= d.order.length) dissolve = null;
  }
  /* Bühne füllt das Fenster möglichst vollständig (16:9, eingepasst). */
  function fitStage() {
    const wrap = $('stageWrap'), stage = $('stage'); if (!wrap || !stage) return;
    const r = wrap.getBoundingClientRect(); if (!r.width || !r.height) return;
    let w = r.width, h = w * 9 / 16;
    if (h > r.height) { h = r.height; w = h * 16 / 9; }
    stage.style.width = Math.floor(w) + 'px'; stage.style.height = Math.floor(h) + 'px';
  }
  function showRoomTitle() {
    const el = $('roomTitle'); if (!el) return;
    el.textContent = Story.scenes[state.scene].name;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch {}
  }
  let state = Story.initialState(), active = false, verb = null, selected = null;
  let shownHotspots = false, lines = [], pendingChoices = [], hintTier = 0, hintObjective = '';
  let focusBeforeModal = null, lastScene = state.scene, lastFrame = 0, saveAvailable = false;
  let hero = { x: 870, y: 815, target: 870, facing: 1 };
  let stored = readSave();
  const verbLabels = { look:'Ansehen', talk:'Reden mit', take:'Nehmen', use:'Benutzen', walk:'Gehen zu' };

  function validateState(candidate) {
    if (!candidate || typeof candidate !== 'object' || !Story.scenes[candidate.scene]) throw new Error('Unbekannter Spielstand.');
    if (!Array.isArray(candidate.inventory) || candidate.inventory.some(id => !Object.prototype.hasOwnProperty.call(Story.items, id))) throw new Error('Ungültiges Inventar.');
    if (!candidate.flags || typeof candidate.flags !== 'object' || Array.isArray(candidate.flags)) throw new Error('Ungültiger Fortschritt.');
    if (!Array.isArray(candidate.journal) || candidate.journal.length > 1000) throw new Error('Ungültiges Logbuch.');
    if (JSON.stringify(candidate).length > 200000) throw new Error('Spielstand ist zu groß.');
    return { ...Story.initialState(), ...candidate, inventory:[...new Set(candidate.inventory)], flags:{...candidate.flags}, journal:[...candidate.journal] };
  }
  function readSave() {
    try { const raw = localStorage.getItem(SAVE_KEY); if (!raw) return null; const data = JSON.parse(raw); return validateState(data.state || data); }
    catch { return null; }
  }
  function save() {
    if (!active) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({version:1, savedAt:new Date().toISOString(),state}));
      saveAvailable = true; $('saveStatus').textContent = '◇ Lokal gespeichert';
    } catch { saveAvailable = false; $('saveStatus').textContent = '◇ Export im Menü möglich'; }
  }
  function normalLines(input) {
    if (!input) return [];
    return (Array.isArray(input) ? input : [input]).map(l => typeof l === 'string' ? {speaker:'Motte',text:l} : {speaker:l.speaker || 'Motte',text:l.text || ''});
  }
  function start(resume = false) {
    state = resume && stored ? validateState(stored) : Story.initialState();
    active = true; selected = null; verb = null; lastScene = state.scene;
    speech.stop();
    hero = {x:850,y:815,target:850,facing:1};
    $('titleScreen').hidden = true; $('ending').hidden = true;
    document.querySelector('.game-shell').classList.remove('inactive');
    $('stage').focus({preventScroll:true});
    refresh(); save();
    if (state.finished) showEnding();
    else if (!resume) present({lines:Story.intro});
    else present({lines:[{speaker:'Motte',text:'Wo war ich? Ach ja. Eine Insel retten. Ganz normaler Dienstag.'}]});
  }
  function reset() { closeModal(); stored=null; hintTier=0; start(false); }
  function refresh() {
    if (state.scene !== lastScene) {
      lastScene = state.scene; hero.x=850; hero.target=850; selected=null;
      speech.stop();
      if (active) showRoomTitle();
      if (pixelOn) startDissolve();
      else $('stage').animate([{opacity:.5},{opacity:1}],{duration:reducedMotion?0:320});
    }
    $('sceneName').textContent = Story.scenes[state.scene].name;
    $('chapterLabel').textContent = typeof Story.chapterTitle==='function' ? Story.chapterTitle(state) : `AKT ${state.chapter}`;
    $('itemCount').textContent=state.inventory.length;
    if (selected && !state.inventory.includes(selected)) selected=null;
    renderHotspots(); renderInventory(); updateActionText();
    document.querySelectorAll('[data-verb]').forEach(b=>{ const isActive = b.dataset.verb===verb; b.classList.toggle('active',isActive);b.setAttribute('aria-pressed',String(isActive)); });
  }
  function updateActionText(target=null) {
    if (!active) return;
    const item = selected ? Story.items[selected] : null;
    const targetName = target?.name;
    $('actionText').textContent = item ? `${item.name} benutzen${targetName ? ` mit ${targetName}` : ' · Ziel oder zweiten Gegenstand auswählen'}` : targetName ? `${verbLabels[verb || defaultVerb(target)]} ${targetName}` : verb ? `${verbLabels[verb]} · Wähle etwas in der Szene.` : Story.objective(state);
    $('inventoryTip').textContent = selected ? 'Zweiten Gegenstand wählen = kombinieren.' : 'Gegenstände lassen sich kombinieren.';
  }
  function defaultVerb(h) { return h.kind==='exit' ? 'walk' : h.kind==='npc' ? 'talk' : 'look'; }
  function renderHotspots() {
    $('hotspots').replaceChildren();
    if (!active || state.finished) return;
    const hs = typeof Story.availableHotspots==='function' ? Story.availableHotspots(state) : Story.scenes[state.scene].hotspots;
    for (const h of hs) {
      const button=document.createElement('button');button.className='hotspot';button.dataset.target=h.id;
      button.style.cssText=`left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%;`;
      button.setAttribute('aria-label',h.name);button.title=h.name;
      const marker=document.createElement('i');marker.className='marker';marker.setAttribute('aria-hidden','true');button.append(marker);
      const label=document.createElement('span');label.className='sr-only';label.textContent=h.name;button.append(label);
      button.addEventListener('pointerenter',()=>showLabel(h));button.addEventListener('focus',()=>showLabel(h));
      button.addEventListener('pointerleave',hideLabel);button.addEventListener('blur',hideLabel);
      button.addEventListener('click',e=>{e.stopPropagation(); interact(h);});
      $('hotspots').append(button);
    }
    $('hotspots').classList.toggle('reveal',shownHotspots);
  }
  function showLabel(h) {
    const label=$('hoverLabel');label.textContent=selected?`${Story.items[selected].name} → ${h.name}`:h.name;
    label.style.left=Math.min(88,Math.max(12,h.x+h.w/2))+'%';label.style.top=Math.max(9,h.y-1)+'%';label.style.opacity='1';updateActionText(h);
  }
  function hideLabel() { $('hoverLabel').style.opacity='0';updateActionText(); }
  function interact(h) {
    if (!active || state.finished) return;
    hideLabel();
    const actualVerb=selected?'use':verb || defaultVerb(h);
    const item=selected;
    hero.target=Math.max(145,Math.min(1470,(h.x+h.w/2)*16));hero.facing=hero.target>=hero.x?1:-1;
    selected=null;
    execute(()=>Story.perform(state,actualVerb,h.id,item));
  }
  function execute(fn) {
    try { const result=fn()||{};refresh();save();audio.effect(result.changed || state.finished ? 'success':'click');present(result);pad.rumble(result.changed || state.finished?150:45,result.changed || state.finished?.4:.12); }
    catch (error) { console.error(error);present({lines:[{speaker:'Motte',text:'Das hat nicht geklappt. Versuchen wir es mit etwas anderem.'}]});pad.rumble(240,.55); }
  }
  function renderInventory() {
    const container=$('inventory');container.replaceChildren();
    if (!state.inventory.length) { const p=document.createElement('p');p.className='empty-inventory';p.textContent='Noch nichts außer großen Plänen.';container.append(p);return; }
    for (const id of state.inventory) {
      const item=Story.items[id];if(!item)continue;
      const b=document.createElement('button');b.className='inventory-item';b.dataset.item=id;b.classList.toggle('selected',selected===id);
      b.setAttribute('aria-label',item.name);b.setAttribute('aria-pressed',String(selected===id));b.title=`${item.name} — ${item.description || 'Zum Benutzen anklicken. Doppelklick zum Ansehen.'}`;
      const c=document.createElement('canvas');c.width=80;c.height=80;c.setAttribute('aria-hidden','true');
      const ic=c.getContext('2d');
      if(typeof Art.drawItem==='function') {
        try {
          if(pixelOn) {
            const small=document.createElement('canvas');small.width=20;small.height=20;
            Art.drawItem(small.getContext('2d'),id,20);
            ic.imageSmoothingEnabled=false;ic.drawImage(small,0,0,20,20,0,0,80,80);
          } else Art.drawItem(ic,id,80);
        } catch { drawFallbackItem(ic,item); }
      }
      else drawFallbackItem(ic,item);
      const label=document.createElement('span');label.textContent=item.name;b.append(c,label);
      b.addEventListener('click',()=>{
        if (verb==='look') { present({lines:[{speaker:'Motte',text:item.description || item.name}]});return; }
        if(selected && selected!==id) { const first=selected;selected=null;execute(()=>Story.combine(state,first,id)); }
        else { selected=selected===id?null:id;verb=null;dismissDialog();refresh();audio.effect('click'); }
      });
      b.addEventListener('dblclick',()=>{selected=null;refresh();present({lines:[{speaker:'Motte',text:item.description || item.name}]});});
      container.append(b);
    }
  }
  function drawFallbackItem(context,item) { context.fillStyle='#e7bd70';context.font='38px Georgia';context.textAlign='center';context.fillText(item.icon || '✦',40,52); }
  function present(result) {
    lines=normalLines(result.lines);pendingChoices=result.choices || [];
    if (!lines.length && !pendingChoices.length) {dismissDialog();if(state.finished)showEnding();return;}
    $('conversation').hidden=false;$('stage').classList.add('talking');showNextLine();
  }
  function showNextLine() {
    $('choices').replaceChildren();
    if(lines.length) {
      const line=lines.shift();$('speakerName').textContent=line.speaker;$('speakerAvatar').textContent=line.speaker.charAt(0);$('dialogText').textContent=line.text;
      speech.speak(line.speaker,line.text);
    }
    if(!lines.length && pendingChoices.length) {
      for(const choice of pendingChoices) {
        const b=document.createElement('button');b.textContent=choice.text;b.dataset.choice=choice.id;
        b.addEventListener('click',()=>{pendingChoices=[];execute(()=>Story.choose(state,choice.id));});$('choices').append(b);
      }
      $('nextLine').hidden=true;
    } else $('nextLine').hidden=false;
  }
  function advanceDialog() {
    if($('conversation').hidden || pendingChoices.length && !lines.length)return;
    if(lines.length)showNextLine();else{dismissDialog();if(state.finished)showEnding();}
  }
  function dismissDialog() {lines=[];pendingChoices=[];$('conversation').hidden=true;$('stage').classList.remove('talking');speech.stop();}
  function showEnding() {
    dismissDialog();$('ending').hidden=false;
    const finale=normalLines(Story.outro);
    const narrative=finale.filter(l=>l.speaker==='Erzählung');
    $('endingText').textContent=finale.length ? (narrative.length?narrative:finale).map(l=>l.text).join(' ') : 'Krummwasser singt wieder. Der Wind ist zurück. Und Motte Morrow hat endlich eine Geschichte, die ihr niemand glauben wird.';
    renderHotspots();save();
  }
  function setVerb(next) { if(!active || state.finished)return;selected=null;verb=verb===next?null:next;dismissDialog();refresh(); }
  function toggleReveal() {shownHotspots=!shownHotspots;$('hotspots').classList.toggle('reveal',shownHotspots);$('revealBtn').setAttribute('aria-pressed',String(shownHotspots));}
  function openModal(title,kicker='FLÜSTERTIDE') {
    focusBeforeModal=document.activeElement;$('modalTitle').textContent=title;$('modalKicker').textContent=kicker;$('modalContent').replaceChildren();$('modalBackdrop').hidden=false;$('closeModal').focus();return $('modalContent');
  }
  function closeModal() {$('modalBackdrop').hidden=true;focusBeforeModal?.focus();}
  function paragraph(parent,text,className) {const p=document.createElement('p');p.textContent=text;if(className)p.className=className;parent.append(p);return p;}
  function addButton(parent,text,action,cls='secondary') {const b=document.createElement('button');b.textContent=text;b.className=cls;b.addEventListener('click',action);parent.append(b);return b;}
  function openMap() {
    const content=openModal('Die Insel Krummwasser','DEINE SEEKARTE');
    paragraph(content,active?'Wähle einen bekannten Ort. Das Meer hält die entlegenen Wege noch unter Verschluss.':'Deine Reise beginnt am Hafen. Neue Wege öffnen sich im Abenteuer.');
    const grid=document.createElement('div');grid.className='map-grid';content.append(grid);
    Object.entries(Story.scenes).forEach(([id,scene],index)=>{
      const b=document.createElement('button');b.className='map-card';b.dataset.scene=id;b.classList.toggle('current',state.scene===id);
      const can=active && (typeof Story.canVisit!=='function' || Story.canVisit(state,id));b.disabled=!can;
      const n=document.createElement('span');n.textContent=`0${index+1} / ${state.scene===id && active?'DU BIST HIER':can?'BEKANNTES FAHRWASSER':'NOCH VERBORGEN'}`;
      const name=document.createElement('b');name.textContent=scene.name;
      const sub=document.createElement('span');sub.textContent=scene.subtitle || '';
      b.append(n,name,sub);b.addEventListener('click',()=>{closeModal();selected=null;verb=null;execute(()=>Story.perform(state,'walk',id));});grid.append(b);
    });
  }
  function openJournal() {
    const content=openModal('Mottes Logbuch','GEDANKEN, GERÜCHTE & GROSSE PLÄNE');
    const objective=document.createElement('div');objective.className='journal-objective';
    const label=document.createElement('span');label.textContent=state.finished?'DIE REISE IST VOLLENDET':'DEIN NÄCHSTES ZIEL';objective.append(label);
    paragraph(objective,active?Story.objective(state):'Setze die Segel und finde heraus, warum Krummwasser schweigt.');content.append(objective);
    const entries=document.createElement('ul');entries.className='journal-entries';
    for(const entry of state.journal) {const li=document.createElement('li');li.textContent=typeof entry==='string'?entry:(entry.text || entry.description || entry.title || JSON.stringify(entry));entries.append(li);}
    if(!state.journal.length) paragraph(content,'Noch sind die Seiten leer. Die besten Geschichten beginnen mit leeren Taschen.');else content.append(entries);
  }
  function openHint() {
    if(!active) {const c=openModal('Eine kleine Starthilfe','DER WIND FLÜSTERT');paragraph(c,'Klicke auf „Segel setzen“. Danach kannst du hier Hinweise für das aktuelle Rätsel lesen.');return;}
    const objective=Story.objective(state);if(objective!==hintObjective){hintTier=0;hintObjective=objective;}
    const content=openModal('Der Wind flüstert …',`HINWEIS ${hintTier+1} VON 3`);
    paragraph(content,Story.hint(state,hintTier+1),'hint-text');
    if(hintTier<2)addButton(content,'Etwas deutlicher, bitte',()=>{hintTier++;openHint();});
    addButton(content,'Ich versuche es',closeModal,'primary');
  }
  function openHelp() {
    const content=openModal('Ein guter Anfang','SO SPIELST DU');
    paragraph(content,'Klicke Figuren an, um zu reden, und Ausgänge, um weiterzugehen. Für Gegenstände wählst du unten eine Aktion. Klicke neben eine Figur, um Motte laufen zu lassen.');
    paragraph(content,'Ein Gegenstand in deinen Taschen wird durch Anklicken ausgewählt. Klicke dann auf ein Ziel in der Szene — oder auf einen zweiten Gegenstand, um beide zu kombinieren. „Ansehen“ erklärt auch Inventargegenstände.');
    paragraph(content,'Dein Fortschritt wird automatisch in diesem Browser gespeichert. Karte, Logbuch und gestufte Hinweise helfen dir weiter. Es gibt keine Zeitlimits, Tode oder verlorenen Chancen.');
    [['Aktionen wählen','1 · 2 · 3 · 4'],['Karte / Logbuch / Hinweis','M · J · H'],['Vollbild an/aus','F'],['Stimme an/aus','V'],['Anklickbare Stellen zeigen','Leertaste'],['Dialog weiter','Enter'],['Auswahl / Fenster schließen','Esc']].forEach(([l,r])=>{const row=document.createElement('div');row.className='help-row';const left=document.createElement('span'),right=document.createElement('span');left.textContent=l;right.textContent=r;row.append(left,right);content.append(row);});
  }
  function openSettings() {
    const content=openModal('Unter Deck','DEIN ABENTEUER');
    paragraph(content,'Das Spiel läuft vollständig lokal. Musik, Geräusche und die vorgelesenen Dialoge entstehen im Browser. Die Reise bleibt auf diesem Gerät; einen Spielstand kannst du als Datei mitnehmen. Mit F schaltest du in den Vollbildmodus; Pixel-Optik, Scanlines und Stimme lassen sich hier ein- und ausschalten.');
    const actions=document.createElement('div');actions.className='settings-actions';content.append(actions);
    addButton(actions,'Pixel-Optik: '+(pixelOn?'AN':'AUS'),()=>{pixelOn=!pixelOn;savePrefs();applyRenderMode();refresh();renderInventory();openSettings();});
    addButton(actions,'Röhren-Scanlines: '+(scanOn?'AN':'AUS'),()=>{scanOn=!scanOn;savePrefs();applyRenderMode();openSettings();});
    addButton(actions,'Stimme: '+(voiceOn?'AN':'AUS'),()=>{toggleVoice();openSettings();});
    addButton(actions,'Vollbild an/aus',toggleFullscreen);
    addButton(actions,audio.enabled?'Musik ausschalten':'Musik einschalten',()=>{audio.toggle();openSettings();});
    addButton(actions,'Spielstand exportieren',exportSave);
    addButton(actions,'Spielstand importieren',importSave);
    addButton(actions,'Neues Abenteuer',()=>{
      const c=openModal('Noch einmal Segel setzen?','NEUES ABENTEUER');paragraph(c,'Der automatische Spielstand wird durch eine neue Reise ersetzt. Du kannst ihn vorher im Menü exportieren.');addButton(c,'Neue Reise beginnen',reset,'primary');addButton(c,'Zurück',openSettings);
    });
  }
  function exportSave() {
    const blob=new Blob([JSON.stringify({version:1,savedAt:new Date().toISOString(),state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='fluestertide-spielstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  function importSave() {
    const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
    input.addEventListener('change',async()=>{
      try {const file=input.files[0];if(!file)return;if(file.size>200000)throw new Error('Die Datei ist zu groß.');const data=JSON.parse(await file.text());stored=validateState(data.state || data);closeModal();start(true);}
      catch(error){const c=openModal('Spielstand nicht geladen','IMPORT');paragraph(c,error.message);addButton(c,'Zurück',openSettings);}
    });input.click();
  }

  const audio = {
    enabled:false, context:null, master:null, timer:null, step:0,
    async toggle() {
      if(this.enabled){this.enabled=false;clearInterval(this.timer);this.master.gain.setTargetAtTime(0,this.context.currentTime,.3);}
      else {try{const Audio=window.AudioContext || window.webkitAudioContext;if(!Audio)return;this.context ||= new Audio();await this.context.resume();if(!this.master){this.master=this.context.createGain();this.master.connect(this.context.destination);this.master.gain.value=0;}this.enabled=true;this.master.gain.setTargetAtTime(.17,this.context.currentTime,.35);this.tick();this.timer=setInterval(()=>this.tick(),200);}catch(error){console.warn('Musik nicht verfügbar',error);}}
      $('audioBtn').setAttribute('aria-pressed',String(this.enabled));$('audioBtn').querySelector('.button-label').textContent=this.enabled?'Ton an':'Ton aus';$('audioBtn').title=this.enabled?'Musik ausschalten':'Musik einschalten';
    },
    note(freq,duration=.45,type='sine',volume=.2,delay=0) {
      if(!this.enabled)return;const t=this.context.currentTime+delay,o=this.context.createOscillator(),g=this.context.createGain();o.type=type;o.frequency.value=freq;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.018);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.025);
    },
    tick() {
      if(document.hidden)return;
      /* Flotte Seemanns-Hornpipe: Staccato-Melodie in e-Moll, Oom-pah-Bass,
         Akkord-Schläge, leicht geschwungene Achtel und Percussion-Ticks. */
      const MEL=[64,0,67,64,66,0,71,0, 72,0,71,69,67,0,64,0, 72,0,76,72,79,0,76,0, 78,76,74,71,69,66,64,0];
      const ROOT=[40,48,50,47],FIFTH=[47,55,57,54],STAB=[[64,67],[72,76],[74,78],[66,71]];
      const s=this.step%32,bar=Math.floor(s/8),i=s%8,m=MEL[s];
      if(m){
        const f=440*2**((m-69)/12),d=MEL[(s+1)%32]?.16:.34,sw=(i%2)?.025:0;
        this.note(f,d,'square',.085,sw);this.note(f,d,'triangle',.13,sw);
      }
      if(i===0||i===4){this.note(440*2**(((i===0?ROOT:FIFTH)[bar]-69)/12),.2,'square',.11);this.note(58,.05,'sine',.14);}
      if(i===2||i===6){for(const c of STAB[bar])this.note(440*2**((c-69)/12),.1,'triangle',.05,.01);this.note(1150,.03,'triangle',.05);}
      if(i%2===1)this.note(5600,.015,'square',.028);
      this.step++;
    },
    effect(kind) {if(kind==='success'){this.note(587,.45,'sine',.3);this.note(740,.45,'sine',.23,.1);this.note(880,.7,'sine',.2,.2);}else this.note(660,.12,'sine',.18);},
    step() { this.note(96,.05,'triangle',.05); },
    gull() { this.note(1174,.16,'sawtooth',.04); this.note(880,.2,'sawtooth',.035,.19); }
  };
  let lastStepAt = 0, nextGullAt = 0;
  /* Sprachausgabe: liest Dialogzeilen mit der Browser-Stimme vor (offline, Web Speech API).
     Jede Figur bekommt ein eigenes Profil aus Tonhöhe und Tempo. */
  const speech = {
    supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    voice: null, token: 0,
    profiles: {
      mira:[1.15,1], motte:[1.15,1], erzaehlung:[1,.95], flint:[.72,.88], ada:[1,1], konrad:[.8,.95],
      odo:[.9,1.05], pippa:[1.5,1.25], jona:[1.05,.95], sela:[.95,.9], balthasar:[.6,.8], stillwasser:[.7,.85]
    },
    init() {
      if (!this.supported) return;
      const pick = () => {
        const vs = speechSynthesis.getVoices(); if (!vs.length) return;
        this.voice = vs.find(v => /^de/i.test(v.lang) && /katja|hedda|amala|anna|petra|female/i.test(v.name))
          || vs.find(v => /^de/i.test(v.lang)) || vs.find(v => /german|deutsch/i.test(v.name)) || null;
      };
      pick(); speechSynthesis.onvoiceschanged = pick;
    },
    speak(speaker, text) {
      if (!voiceOn || !this.supported) return;
      const token = ++this.token;
      try { speechSynthesis.cancel(); } catch {}
      let t = String(text || '').replace(/\s+/g, ' ').trim(); if (!t) return;
      if (t.length > 12 && t === t.toUpperCase()) t = t.charAt(0) + t.slice(1).toLowerCase();
      try {
        const u = new SpeechSynthesisUtterance(t);
        u.lang = 'de-DE'; if (this.voice) u.voice = this.voice;
        const p = this.profiles[(speaker || '').toLowerCase().replace(/[^a-z]/g, '')] || [1, 1];
        u.pitch = p[0]; u.rate = p[1]; u.volume = .95;
        setTimeout(() => { if (token === this.token) { try { speechSynthesis.speak(u); } catch {} } }, 40);
      } catch {}
    },
    stop() { if (!this.supported) return; this.token++; try { speechSynthesis.cancel(); } catch {} }
  };
  function toggleVoice() {
    voiceOn = !voiceOn; savePrefs();
    const b = $('voiceBtn'); b.setAttribute('aria-pressed', String(voiceOn)); b.title = (voiceOn ? 'Stimme ausschalten' : 'Stimme (Dialoge vorlesen)') + ' · V';
    if (!voiceOn) speech.stop();
  }
  /* Xbox-Controller: virtueller Cursor, Tastenbelegung und Rumble (Gamepad API).
     A klickt, B geht zurück, X zeigt Hotspots, Y schaltet das Verb weiter,
     LB/RB blättern im Inventar, LT öffnet die Karte, RT gibt einen Hinweis. */
  const pad = {
    cursor: null, x: .5, y: .66, index: -1, last: {},
    init() {
      this.cursor = document.createElement('div'); this.cursor.id = 'padCursor'; this.cursor.setAttribute('aria-hidden', 'true');
      $('stage').append(this.cursor);
      addEventListener('gamepadconnected', e => { this.index = e.gamepad.index; this.note('Controller verbunden · A klicken · B zurück'); });
      addEventListener('gamepaddisconnected', () => { this.index = -1; this.cursor.classList.remove('on'); this.note('Controller getrennt'); });
      $('stage').addEventListener('pointermove', () => this.cursor.classList.remove('on'), { passive: true });
    },
    note(text) { const el = $('actionText'); if (!el) return; el.textContent = text; setTimeout(updateActionText, 2600); },
    rumble(duration = 70, strong = .25) {
      if (this.index < 0) return;
      try { navigator.getGamepads()[this.index]?.vibrationActuator?.playEffect?.('dual-rumble', { duration, strongMagnitude: strong, weakMagnitude: strong * .5 }); } catch {}
    },
    on(gp, i) { return !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > .55)); },
    poll(dt) {
      if (this.index < 0 || !navigator.getGamepads) return;
      const gp = navigator.getGamepads()[this.index]; if (!gp) return;
      const dz = v => Math.abs(v) > .32 ? v : 0;
      const sx = dz(gp.axes[0] || 0), sy = dz(gp.axes[1] || 0);
      if (sx || sy) {
        const sp = .8 + Math.max(Math.abs(sx), Math.abs(sy)) * 1.1;
        this.x = Math.max(0, Math.min(1, this.x + sx * dt * sp));
        this.y = Math.max(0, Math.min(1, this.y + sy * dt * sp));
        this.place(); this.cursor.classList.add('on');
      }
      for (let i = 0; i < gp.buttons.length && i < 12; i++) {
        const p = this.on(gp, i), was = !!this.last[i]; this.last[i] = p;
        if (p && !was) { this.cursor.classList.add('on'); this.button(i); }
      }
    },
    place() { this.cursor.style.left = (this.x * 100) + '%'; this.cursor.style.top = (this.y * 100) + '%'; },
    button(i) {
      if (i === 0) { this.click(); return; }
      if (i === 1) { if (!$('modalBackdrop').hidden) closeModal(); else if (!$('conversation').hidden) { if (!pendingChoices.length) { dismissDialog(); if (state.finished) showEnding(); } } else if (selected || verb) { selected = null; verb = null; refresh(); } return; }
      if (!$('modalBackdrop').hidden) { if (i === 1) closeModal(); return; }
      if (i === 2) toggleReveal();
      else if (i === 3) { const order = [null, 'look', 'talk', 'take', 'use']; setVerb(order[(order.indexOf(verb) + 1) % order.length]); }
      else if (i === 4 || i === 5) this.cycleItem(i === 5 ? 1 : -1);
      else if (i === 6) openMap();
      else if (i === 7) openHint();
      else if (i === 8) audio.toggle();
      else if (i === 9) openSettings();
    },
    cycleItem(dir) {
      if (!active || state.finished || !state.inventory.length) return;
      const inv = state.inventory, slot = selected ? inv.indexOf(selected) : inv.length;
      const next = (slot + dir + inv.length + 1) % (inv.length + 1);
      selected = next < inv.length ? inv[next] : null; verb = null; dismissDialog(); refresh(); audio.effect('click');
    },
    click() {
      if (!$('conversation').hidden && !pendingChoices.length) { advanceDialog(); this.rumble(45, .1); return; }
      const r = $('stage').getBoundingClientRect(), px = r.left + this.x * r.width, py = r.top + this.y * r.height;
      const el = document.elementFromPoint(px, py);
      this.cursor.classList.add('press'); setTimeout(() => this.cursor.classList.remove('press'), 130);
      if (el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: px, clientY: py })); this.rumble(50, .12); }
    }
  };
  function gullTick(t) {
    if (!audio.enabled || t < nextGullAt) return;
    nextGullAt = t + 9000 + Math.random() * 15000;
    if (active && (state.finished || state.scene === 'harbor' || state.scene === 'bazaar')) audio.gull();
  }
  function animate(t) {
    requestAnimationFrame(animate);if(document.hidden || t-lastFrame<33)return;
    const dt=Math.min(.08,(t-lastFrame)/1000);lastFrame=t;
    const moving=Math.abs(hero.x-hero.target)>3;
    if(moving)hero.x+=(hero.target-hero.x)*Math.min(1,dt*6);
    pad.poll(dt);
    const artState=active?state:Story.initialState();
    const scale=pixelOn?PIX_W/BASE_W:1;
    ctx.setTransform(scale,0,0,scale,0,0);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.clearRect(0,0,BASE_W,BASE_H);
    Art.drawScene(ctx,active?state.scene:'harbor',artState,reducedMotion?0:t/1000);
    if(typeof Art.drawHero==='function')Art.drawHero(ctx,hero.x,hero.y,reducedMotion?0:t/1000,hero.facing,moving && !reducedMotion);
    ctx.setTransform(1,0,0,1,0,0);
    postFX();
    if(dissolve)stepDissolve();
    if(moving && audio.enabled && t-lastStepAt>300){lastStepAt=t;audio.step();}
    gullTick(t);
  }
  document.querySelectorAll('[data-verb]').forEach(b=>b.addEventListener('click',()=>setVerb(b.dataset.verb)));
  $('startBtn').addEventListener('click',()=>{if(stored){const c=openModal('Eine frische Brise?','NEUE REISE');paragraph(c,'Es gibt bereits einen gespeicherten Fortschritt. Eine neue Reise ersetzt diesen Spielstand.');addButton(c,'Neu beginnen',reset,'primary');addButton(c,'Reise fortsetzen',()=>{closeModal();start(true);});}else start(false);});
  $('continueBtn').addEventListener('click',()=>start(true));$('continueBtn').hidden=!stored;
  $('mapBtn').addEventListener('click',openMap);$('journalBtn').addEventListener('click',openJournal);$('hintBtn').addEventListener('click',openHint);$('menuBtn').addEventListener('click',openSettings);$('helpBtn').addEventListener('click',openHelp);$('audioBtn').addEventListener('click',()=>audio.toggle());$('voiceBtn').addEventListener('click',toggleVoice);$('fsBtn').addEventListener('click',toggleFullscreen);$('revealBtn').addEventListener('click',toggleReveal);$('nextLine').addEventListener('click',advanceDialog);$('closeModal').addEventListener('click',closeModal);$('endingJournal').addEventListener('click',openJournal);$('replayBtn').addEventListener('click',()=>{const c=openModal('Noch eine Runde?','NEUES ABENTEUER');paragraph(c,'Die abgeschlossene Reise wird durch einen neuen Spielstand ersetzt.');addButton(c,'Segel setzen',reset,'primary');addButton(c,'Zurück',closeModal);});
  document.addEventListener('fullscreenchange',()=>{const on=!!document.fullscreenElement,b=$('fsBtn');b.title=on?'Fenster · F':'Vollbild · F';const l=b.querySelector('.button-label');if(l)l.textContent=on?'Fenster':'Vollbild';});
  $('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))closeModal();});
  $('hotspots').addEventListener('click',e=>{
    if(e.target!==$('hotspots') || !active || state.finished)return;
    if(!$('conversation').hidden && !pendingChoices.length){advanceDialog();return;}
    const bounds=$('stage').getBoundingClientRect();hero.target=Math.max(110,Math.min(1480,(e.clientX-bounds.left)/bounds.width*1600));hero.facing=hero.target>=hero.x?1:-1;selected=null;verb=null;refresh();
  });
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    if(!$('modalBackdrop').hidden){
      if(e.key==='Escape')closeModal();
      if(e.key==='Tab'){const f=[...$('modalBackdrop').querySelectorAll('button:not(:disabled),input,a[href]')];const first=f[0],last=f[f.length-1];if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}}
      return;
    }
    const key=e.key.toLowerCase();
    if(key==='enter' && !$('conversation').hidden && !e.target.closest('[data-choice]')){
      e.preventDefault();advanceDialog();return;
    }
    if(key===' ' && active && e.target.closest('.hotspot')){
      e.preventDefault();toggleReveal();return;
    }
    if(key==='escape'){selected=null;verb=null;dismissDialog();refresh();if(state.finished)showEnding();}
    else if(key==='enter' && !e.target.closest('button,a'))advanceDialog();
    else if(key===' ' && !e.target.closest('button,a')){e.preventDefault();toggleReveal();}
    else if(key==='m')openMap();else if(key==='j')openJournal();else if(key==='h')openHint();
    else if(key==='f')toggleFullscreen();else if(key==='v')toggleVoice();
    else if(['1','2','3','4'].includes(key))setVerb(['look','talk','take','use'][Number(key)-1]);
  });
  window.addEventListener('beforeunload',()=>{save();speech.stop();});
  window.Fluestertide = {
    getState:()=>JSON.parse(JSON.stringify(state)),start:()=>start(false),resume:()=>start(true),
    perform:(v,id,item)=>execute(()=>Story.perform(state,v,id,item)),choose:id=>execute(()=>Story.choose(state,id)),combine:(a,b)=>execute(()=>Story.combine(state,a,b)),version:'1.1.0'
  };
  document.querySelector('.game-shell').classList.add('inactive');
  speech.init(); pad.init();
  { const vb=$('voiceBtn'); vb.setAttribute('aria-pressed',String(voiceOn)); vb.title=(voiceOn?'Stimme ausschalten':'Stimme (Dialoge vorlesen)')+' · V'; }
  applyRenderMode();refresh();
  if(typeof ResizeObserver==='function')new ResizeObserver(fitStage).observe($('stageWrap'));
  addEventListener('resize',fitStage);document.addEventListener('fullscreenchange',fitStage);fitStage();
  if(new URLSearchParams(location.search).has('spielstart')&&!stored)start(false);
  requestAnimationFrame(animate);
})();
