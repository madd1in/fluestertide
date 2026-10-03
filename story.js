(function (root) {
  'use strict';

  const items = {
    rope: { name: 'Kurzes Tau', icon: '〰', description: 'Ein handfestes Tau. Es riecht nach Salz, Abenteuer und einem leicht enttäuschten Fisch.' },
    bottle: { name: 'Leere Flasche', icon: '♧', description: 'Eine wunderschön leere Flasche. Auf dem Etikett steht: „Jahrgang irgendwann“.' },
    fruit: { name: 'Knallmango', icon: '●', description: 'Die Lieblingsfrucht von Papageien. Menschen schmeckt sie wie ein überraschtes Sofa.' },
    rhyme: { name: 'Papageienreim', icon: '♫', description: '„Wenn Ebbe deine Pläne klaut, hilft Kerzenlicht und Seemannsbraut.“ Auf einer zerknitterten Federkarte.' },
    candle: { name: 'Sturmkerze', icon: '♨', description: 'Brennt sogar bei Gegenwind. Nur bei langweiligen Reden geht sie aus.' },
    mug: { name: 'Zinnbecher', icon: '▱', description: 'Die Aufschrift lautet: „Für hervorragende verbale Selbstverteidigung“.' },
    prism: { name: 'Sturmprisma', icon: '◇', description: 'Bricht Licht in sieben Farben und schlechten Geschmack in acht.' },
    shell: { name: 'Flüstermuschel', icon: '◉', description: 'Darin schlummert das Meer. Es klingt ein bisschen so, als müsste es niesen.' },
    pendulum: { name: 'Muschelpendel', icon: '◌', description: 'Tau und Muschel ergeben ein Pendel. Zum Ausschwingen fehlt noch der passende Ton.' },
    compass: { name: 'Windkompass', icon: '✥', description: 'Zeigt die Richtung des verschwundenen Windes. „Norden“ war ihm zu gewöhnlich.' },
    water: { name: 'Becher Quellwasser', icon: '≋', description: 'Klares Wasser aus der singenden Quelle. Ideal gegen trockene Kehlen, auch posthum.' },
    fork: { name: 'Stimmgabel', icon: '⋔', description: 'Eine silberne Stimmgabel. Ihre zwei Zinken sind sich ausnahmsweise einig.' },
    instrument: { name: 'Resonanzpendel', icon: '♬', description: 'Stimmgabel und Muschelpendel: ein tragbares Instrument gegen untragbare Stille.' }
  };

  const hotspot = (id, name, x, y, w, h, kind, to) => ({ id, name, x, y, w, h, kind, ...(to ? { to } : {}) });
  const scenes = {
    harbor: {
      name: 'Der Hafen von Krummwasser', subtitle: 'Das Meer schweigt. Das ist unhöflich.', chapter: 1,
      hotspots: [
        hotspot('ferryman', 'Fährmann Flint', 21, 55, 10, 30, 'npc'),
        hotspot('rope', 'Ein kurzes Tau', 8, 73, 12, 10, 'object'),
        hotspot('bottle', 'Leere Flasche', 47, 76, 6, 12, 'object'),
        hotspot('tavern', 'Taverne Zum schiefen Aal', 69, 39, 12, 27, 'exit', 'tavern'),
        hotspot('bazaar', 'Zum Basar', 90, 52, 9, 25, 'exit', 'bazaar'),
        hotspot('lighthouse', 'Zum Leuchtturm', 45, 12, 12, 27, 'exit', 'lighthouse')
      ]
    },
    tavern: {
      name: 'Zum schiefen Aal', subtitle: 'Die letzte laute Kneipe der Insel.', chapter: 1,
      hotspots: [
        hotspot('bartender', 'Wirtin Ada Anker', 67, 35, 12, 37, 'npc'),
        hotspot('pirate', 'Käpt’n Konrad Kante', 24, 49, 12, 30, 'npc'),
        hotspot('candle', 'Sturmkerze', 57, 55, 6, 13, 'object'),
        hotspot('mug', 'Siegesbecher', 77, 58, 6, 13, 'object'),
        hotspot('harbor', 'Zurück zum Hafen', 4, 34, 13, 44, 'exit', 'harbor')
      ]
    },
    bazaar: {
      name: 'Der Basar der krummen Dinge', subtitle: 'Preise verhandelbar. Physik weniger.', chapter: 1,
      hotspots: [
        hotspot('merchant', 'Händler Odo Glas', 64, 42, 12, 35, 'npc'),
        hotspot('parrot', 'Papagei Pippa', 19, 28, 10, 18, 'npc'),
        hotspot('fruit', 'Knallmango', 46, 61, 8, 12, 'object'),
        hotspot('sign', 'Basarschild', 82, 37, 9, 21, 'object'),
        hotspot('harbor', 'Zum Hafen', 2, 44, 9, 34, 'exit', 'harbor'),
        hotspot('lagoon', 'Zur Lagune', 88, 55, 10, 28, 'exit', 'lagoon')
      ]
    },
    lighthouse: {
      name: 'Der Leuchtturm der langen Nacht', subtitle: 'Eine Hoffnung mit kaputter Beleuchtung.', chapter: 1,
      hotspots: [
        hotspot('keeper', 'Leuchtwartin Jona Docht', 68, 58, 12, 24, 'npc'),
        hotspot('lens', 'Leere Prismenhülse', 48, 30, 8, 13, 'object'),
        hotspot('mechanism', 'Die kalte Laterne', 40, 54, 20, 20, 'object'),
        hotspot('harbor', 'Zum Hafen', 5, 60, 13, 28, 'exit', 'harbor')
      ]
    },
    lagoon: {
      name: 'Die singende Lagune', subtitle: 'Hier ist die Stille voller kleiner Geräusche.', chapter: 2,
      hotspots: [
        hotspot('hermit', 'Einsiedlerin Sela Seetang', 65, 53, 12, 30, 'npc'),
        hotspot('spring', 'Die singende Quelle', 34, 58, 18, 14, 'object'),
        hotspot('shell', 'Flüstermuschel', 48, 80, 8, 10, 'object'),
        hotspot('gate', 'Nebelpfad zum Wrack', 82, 38, 14, 40, 'exit', 'wreck'),
        hotspot('bazaar', 'Zum Basar', 3, 49, 12, 29, 'exit', 'bazaar')
      ]
    },
    wreck: {
      name: 'Das Wrack der Ungefähren Hoffnung', subtitle: 'Der Kiel knarzt. Der Geist leider nicht.', chapter: 2,
      hotspots: [
        hotspot('ghost', 'Geist Balthasar Brack', 65, 47, 12, 31, 'npc'),
        hotspot('chest', 'Die salzige Seekiste', 27, 62, 15, 16, 'object'),
        hotspot('bell', 'Eine stumme Schiffsglocke', 44, 24, 12, 24, 'object'),
        hotspot('vault', 'Zur Glockenkammer', 83, 52, 12, 28, 'exit', 'vault'),
        hotspot('lagoon', 'Zur Lagune', 4, 45, 13, 38, 'exit', 'lagoon')
      ]
    },
    vault: {
      name: 'Die Glockenkammer', subtitle: 'Ein ganzes Meer hält den Atem an.', chapter: 3,
      hotspots: [
        hotspot('antagonist', 'Kapitän Stillwasser', 64, 41, 12, 37, 'npc'),
        hotspot('bell', 'Die Schweigeglocke', 43, 22, 16, 30, 'object'),
        hotspot('altar', 'Der Dreiklangaltar', 36, 60, 24, 14, 'object'),
        hotspot('wreck', 'Zurück zum Wrack', 4, 49, 14, 34, 'exit', 'wreck')
      ]
    }
  };

  const intro = [
    { speaker: 'Mira', text: 'Ich bin Mira „Motte“ Morrow. Angehende Piratin. Fortgeschrittene Rechnungsignoriererin.' },
    { speaker: 'Mira', text: 'Ich kam nach Krummwasser, um ein Schiff zu finden. Stattdessen fand ich einen Hafen ohne Möwengekreisch, Wind oder Wellenrauschen.' },
    { speaker: 'Flint', text: 'Kapitän Stillwasser hat mit seiner Schweigeglocke die Stimmen des Meeres gestohlen. Seitdem zahle ich die Fähre pro peinlicher Pause.' },
    { speaker: 'Mira', text: 'Dann holen wir den Krach zurück. Mein erster großer Piratenplan: Ruhestörung!' }
  ];
  const outro = [
    { speaker: 'Erzählung', text: 'Der Wind kehrt nach Krummwasser zurück. Wellen lachen am Kai, Möwen beschweren sich über alles, und irgendwo knarrt endlich wieder eine Tür.' },
    { speaker: 'Stillwasser', text: 'Ich wollte nur einmal in Ruhe frühstücken.' },
    { speaker: 'Mira', text: 'Dafür gibt es Ohrstöpsel. Eine ganze Insel als Frühstücksproblem ist wirklich überdimensioniert.' },
    { speaker: 'Erzählung', text: 'Motte erhält ein Schiff, eine Crew und eine Rechnung für die Reparatur der Schweigeglocke. Zwei davon nimmt sie gern entgegen.' },
    { speaker: 'Mira', text: 'Krummwasser ist gerettet. Und meine Piratenkarriere? Die hat gerade erst abgelegt.' }
  ];

  function initialState() {
    return { scene: 'harbor', inventory: [], flags: {}, chapter: 1, finished: false, journal: ['Auf Krummwasser fehlen die Stimmen des Meeres. Die Schweigeglocke muss verstummen.'] };
  }
  function ensure(state) {
    if (!state || typeof state !== 'object') throw new Error('Ein Spielstand wird benötigt.');
    if (!scenes[state.scene]) state.scene = 'harbor';
    if (!Array.isArray(state.inventory)) state.inventory = [];
    if (!state.flags || typeof state.flags !== 'object') state.flags = {};
    if (!Array.isArray(state.journal)) state.journal = [];
    state.chapter = state.finished || state.flags.ghostHelped ? 3 : state.flags.beaconFixed || ['lagoon', 'wreck'].includes(state.scene) ? 2 : 1;
    return state;
  }
  const has = (s, id) => s.inventory.includes(id);
  const give = (s, id) => { if (!has(s, id)) s.inventory.push(id); };
  const remove = (s, id) => { s.inventory = s.inventory.filter(item => item !== id); };
  const note = (s, text) => { if (!s.journal.includes(text)) s.journal.push(text); };
  const line = (speaker, text) => ({ speaker, text });
  const reply = (...lines) => ({ lines: lines.map(value => typeof value === 'string' ? line('Mira', value) : value) });
  const withChoices = (lines, choices) => ({ lines, choices });

  function canVisit(state, id) {
    ensure(state);
    if (!scenes[id]) return false;
    if (id === 'lagoon') return !!state.flags.duelWon;
    if (id === 'wreck') return !!state.flags.fogCleared;
    if (id === 'vault') return !!state.flags.ghostHelped;
    return true;
  }

  function availableHotspots(state) {
    ensure(state);
    return scenes[state.scene].hotspots.filter(h => {
      if (state.scene === 'harbor' && ['rope', 'bottle'].includes(h.id)) return !state.flags[h.id + 'Taken'];
      if (state.scene === 'bazaar' && h.id === 'fruit') return !state.flags.fruitTaken;
      if (state.scene === 'lagoon' && h.id === 'shell') return !state.flags.shellTaken;
      if (state.scene === 'tavern' && h.id === 'candle') return !state.flags.candleReceived;
      if (state.scene === 'tavern' && h.id === 'mug') return !state.flags.duelWon;
      return true;
    });
  }

  function visit(state, destination) {
    if (!canVisit(state, destination)) {
      if (destination === 'lagoon') return reply('Konrad bewacht den Lagunenpfad. Wer ihn im Wortgefecht schlägt, darf hindurch. Seinen Becher gibt es obendrauf.');
      if (destination === 'wreck') return reply('Der Nebel legt den Weg in Schleifen. Der Leuchtturm und ein Windkompass könnten helfen.');
      return reply('Der Geist hält die Glockenkammer verschlossen. Erst müssen wir seiner trockenen Kehle helfen.');
    }
    state.scene = destination;
    state.flags.duelActive = false;
    state.flags.harmonyActive = false;
    state.flags.finaleReady = false;
    ensure(state);
    const arrival = {
      harbor: 'Zurück am Hafen. Die Möwen schweigen vorwurfsvoll.',
      tavern: 'Warmer Kerzenschein. Kalte Getränke. Eine erstaunlich lebendige Geräuschkulisse.',
      bazaar: 'Der Basar: Hier gibt es alles, außer nachvollziehbare Garantien.',
      lighthouse: 'Eine Lampe, ein fehlendes Prisma und eine Leuchtwartin mit sehr müden Augen.',
      lagoon: 'Die Lagune atmet. Unter der Stille höre ich ein kleines Summen.',
      wreck: 'Da liegt die Ungefähre Hoffnung. Der Name hat sich gründlich bewahrheitet.',
      vault: 'Die Schweigeglocke. Der gestohlene Wind zittert in ihrem Bauch.'
    };
    return reply(arrival[destination]);
  }

  function look(state, target) {
    const f = state.flags;
    const descriptions = {
      harbor: {
        ferryman: 'Flint trägt einen Bart, der vermutlich schon vor ihm zur See fuhr. Er wirkt besorgt.',
        rope: items.rope.description, bottle: items.bottle.description,
        tavern: 'Das Schild zeigt einen Aal in gefährlich schlechter Körperhaltung.',
        bazaar: 'Zwischen bunten Tüchern wartet Odo mit Dingen, die angeblich alle fast funktionieren.',
        lighthouse: 'Der Leuchtturm ist dunkel. Auf einer Insel ist das ungefähr so praktisch wie ein Unterwasserfeuer.'
      },
      tavern: {
        bartender: 'Ada poliert ein Glas. Es ist sauber genug, um seinen eigenen Stammbaum zu erkennen.',
        pirate: f.duelWon ? 'Konrad bewundert widerwillig meine Schlagfertigkeit.' : 'Konrad Kante. Wuchtige Stiefel, scharfe Zunge, ziemlich kleine Lesebrille.',
        candle: 'Eine Sturmkerze. Ada gibt sie nur für einen neuen guten Seemannsreim her.',
        mug: 'Konrads Siegesbecher. Man muss ihn sich mit Worten verdienen.',
        harbor: 'Die Tür zum Hafen. Sie knarzt sogar in der großen Stille. Eigensinniges Möbel.'
      },
      bazaar: {
        merchant: 'Odo Glas verkauft, tauscht und erzählt gern, was alles „antiquitätsnah“ ist.',
        parrot: 'Pippa kann Reime. Mit leerem Magen reimt sie allerdings nur „Hunger“ auf „Hunger“.',
        fruit: 'Ein Schild am Obst: „Knallmango für Pippa. Gratis. Bitte den Papagei nicht auf Kredit füttern.“',
        sign: '„Glas gegen Glas. Freie Mango für Pippa. Lagunenpfad nur mit Konrads Erlaubnis. Beschwerden bitte im Reim.“',
        harbor: 'Zum Hafen, an der unverhältnismäßig stillen See vorbei.',
        lagoon: f.duelWon ? 'Der Lagunenpfad steht mir offen.' : 'Ein Schild verbietet den Durchgang ohne Konrads Erlaubnis. Es hat sehr überzeugende Nägel.'
      },
      lighthouse: {
        keeper: 'Jona Docht wacht über das Licht. Gerade wacht sie eher über dessen Abwesenheit.',
        lens: f.lensSet ? 'Das Sturmprisma sitzt sicher in seiner Hülse.' : 'Die Hülse braucht ein Sturmprisma. Gewöhnliche Glasscherben haben zu wenig Berufserfahrung.',
        mechanism: f.beaconFixed ? 'Das Leuchtfeuer brennt. Endlich hat der Nebel etwas zu respektieren.' : f.lampLit ? 'Die Sturmkerze brennt. Jetzt fehlt das Prisma in der Hülse.' : 'Die Laterne ist kalt. Eine Sturmkerze könnte sie wieder entzünden.',
        harbor: 'Die Treppe zum Hafen. Dafür braucht man mehr Beine als Geduld.'
      },
      lagoon: {
        hermit: 'Sela trägt Seetang mit der Würde einer Königin. Eine sehr nasse Königin.',
        spring: 'Die Quelle summt mit winziger Stimme. Ihr Wasser ist gut gegen trockene Kehlen. Ein Becher wäre praktisch.',
        shell: items.shell.description,
        gate: f.fogCleared ? 'Der Windkompass hat einen sicheren Pfad durch den Nebel gefunden.' : 'Der Nebel ist ein Labyrinth ohne Wände. Hier sollte ich den Windkompass benutzen.',
        bazaar: 'Zurück zum Basar. Ich höre beinahe schon den Papagei. Beinahe.'
      },
      wreck: {
        ghost: f.ghostHelped ? 'Balthasar hat seine Stimme wieder. Sie klingt nach Holz, Salz und sehr alten Witzen.' : 'Der Geist deutet verzweifelt auf seine Kehle und eine winzige Quelle auf seiner Seekarte.',
        chest: f.forkTaken ? 'Die Kiste ist offen und leer. Sehr ehrlicher Zustand für eine Schatzkiste.' : f.ghostHelped ? 'Balthasars Kiste ist offen. Eine silberne Stimmgabel liegt darin.' : 'Die Kiste gehört Balthasar. Er hält den Schlüssel fest und seine Kehle noch fester.',
        bell: 'Eine stumme Schiffsglocke. Ihre große Schwester steht in der Glockenkammer.',
        vault: f.ghostHelped ? 'Balthasar hat den Eingang zur Glockenkammer geöffnet.' : 'Eine Geistersperre schützt die Glockenkammer. Sie sieht erstaunlich pflegeleicht aus.',
        lagoon: 'Der sichere Pfad führt zurück zur Lagune.'
      },
      vault: {
        antagonist: 'Kapitän Stillwasser sieht aus, als hätte ihn jemand mitten in einer erholsamen Bosheit gestört.',
        bell: state.finished ? 'Die Schweigeglocke ist gesprungen. Das Meer hat seine Stimme zurück.' : f.harmonyUnlocked ? 'Die Glocke ist empfänglich für das Resonanzpendel. Zeit für den letzten Schlag.' : 'In der Glocke wirbeln Wellenrauschen, Wind und Stimmen. Der Altar muss sie zuerst einstimmen.',
        altar: f.harmonyUnlocked ? 'Drei Zeichen glühen: Meer, Wind, Herz. Der Dreiklang ist vollständig.' : 'Drei Zeichen: eine Welle, ein wehendes Segel, ein Herz. Balthasar kennt die Reihenfolge.',
        wreck: 'Zurück zu Balthasar und der Ungefähren Hoffnung.'
      }
    };
    const description = descriptions[state.scene][target];
    if (description) return reply(description);
    if (items[target] && has(state, target)) return reply(items[target].description);
    return reply('Das sieht nach einer Gelegenheit aus, genauer hinzusehen.');
  }

  function talk(state, target) {
    const f = state.flags;
    if (target === 'ferryman') return reply(line('Flint', 'Stillwasser hat den Wind und alle Stimmen in seiner Glocke eingesperrt. Ohne Wind fahren meine Boote nur aus Höflichkeit.'), line('Flint', 'Ada im schiefen Aal weiß, wie man das Leuchtfeuer repariert. Und Odo tauscht Glas lieber gegen Glas als gegen Geld. Verrückter Mann.'), 'Dann beginne ich mit Kneipenrecherche. Eine unterschätzte Wissenschaft.');
    if (target === 'bartender') {
      f.recipeKnown = true;
      note(state, 'Für das Leuchtfeuer brauche ich Adas Sturmkerze und Odos Sturmprisma. Ada verlangt einen neuen Reim; Pippa kennt welche.');
      return reply(line('Ada', f.candleReceived ? 'Meine Sturmkerze gehört dir. Setz sie in die Laterne am Leuchtturm.' : 'Jona braucht eine Sturmkerze und ein Sturmprisma für ihr Leuchtfeuer. Meine Kerze bekommst du für einen neuen Seemannsreim. Pippa am Basar hat Talent – wenn sie satt ist.'), line('Ada', f.duelWon ? 'Konrad hat das Wortgefecht überlebt. Sein Stolz liegt noch unterm Tisch.' : 'Konrad vergibt den Lagunenzugang und seinen Becher im Wortgefecht. Antworte auf seine großspurigen Sprüche mit einem passenden Konter.'), 'Kerze, Prisma, scharfe Zunge. Typischer Einkaufszettel für eine Heldin.');
    }
    if (target === 'pirate') {
      if (f.duelWon) return reply(line('Konrad', 'Du hast gewonnen, Morrow. Der Lagunenpfad ist offen, und der Becher bleibt bei dir.'), 'Ich werde ihn nur für angemessene Siegesgetränke verwenden. Oder Wasser.');
      return withChoices([line('Konrad', 'Nur wer drei meiner Sprüche sauber pariert, darf zur Lagune. Mein Becher gehört dann auch dir. Bereit, kleine Hafenmotte?')], [{ id: 'duel_begin', text: 'Los. Mein Wortschatz hat heute keinen Landurlaub.' }, { id: 'duel_leave', text: 'Ich poliere erst meine verbalen Säbel.' }]);
    }
    if (target === 'merchant') return reply(line('Odo', f.prismReceived ? 'Eine vortreffliche Transaktion. Das Prisma passt in die Hülse am Leuchtturm.' : 'Ein Sturmprisma? Da hängt mein letztes. Für eine leere Flasche gebe ich es her. Geld raschelt so unangenehm.'), 'Ein Händler mit Glaswährung. Endlich jemand, dessen Geschäft ich durchschaue.');
    if (target === 'parrot') return reply(line('Pippa', f.parrotFed ? 'REIM ERHALTEN! ADA BEGEISTERN! NICHT AUF DIE FEDER SETZEN!' : 'HUNGER! KEIN REIM OHNE KNALLMANGO! GRATISOBST! DA UNTEN!'), 'Deine Gesprächsführung ist überraschend effizient.');
    if (target === 'keeper') {
      if (!f.beaconFixed) return reply(line('Jona', 'Die Laterne braucht eine Sturmkerze. Die Hülse braucht ein Sturmprisma. Ada und Odo können helfen.'), line('Jona', 'Wenn das Licht brennt, bekommst du meinen Windkompass. Zusammen schlagen die beiden Stillwassers Nebel.'), 'Ich repariere eine Lampe und bekomme eine Navigation. Fair.');
      if (!f.compassReceived) {
        f.compassReceived = true; give(state, 'compass');
        note(state, 'Der Windkompass zeigt durch den Nebelpfad an der Lagune.');
        return reply(line('Jona', 'Es leuchtet! Hier, mein Windkompass. Benutze ihn am Nebelpfad in der Lagune.'), 'Wenn ich zurückkomme, erzählst du mir, warum der Kompass „Frühstück“ anzeigt.', line('Jona', 'Windrichtungen sind komplizierter als man denkt.'));
      }
      return reply(line('Jona', 'Benutze den Windkompass am Nebelpfad in der Lagune. Das Leuchtfeuer hält den Weg offen.'));
    }
    if (target === 'hermit') {
      f.hermitMet = true;
      note(state, 'Sela: Quellwasser hilft dem trockenen Geist. Eine Muschel am Tau kann mit einer Stimmgabel zum Resonanzpendel werden.');
      return reply(line('Sela', 'Balthasar im Wrack kann nicht sprechen. Er ist tot, aber das ist diesmal nicht das Problem. Seine Kehle braucht singendes Quellwasser.'), line('Sela', 'Nimm die Flüstermuschel. Binde sie an ein Tau. Mit einer Stimmgabel wird daraus ein Resonanzpendel, das die Schweigeglocke brechen kann.'), 'Du machst aus Strandgut Instrumente?', line('Sela', 'Andere machen daraus Eintrittspreise.'));
    }
    if (target === 'ghost') {
      if (!f.ghostHelped) return reply(line('Balthasar', '…'), 'Du zeigst auf deine Kehle. Und auf die Quelle. Ein Becher singendes Wasser könnte helfen.');
      f.harmonyKnown = true;
      note(state, 'Balthasars Dreiklang: erst MEER, dann WIND, zuletzt HERZ. Das Resonanzpendel stimmt den Altar ein und bricht dann die Glocke.');
      return reply(line('Balthasar', 'Die Stimmgabel in meiner Kiste gehört dir. Verbinde sie mit einer Muschel am Tau.'), line('Balthasar', 'Am Altar musst du von außen nach innen spielen: erst MEER, dann WIND, zuletzt HERZ. Danach schlage mit dem Resonanzpendel die Schweigeglocke.'), 'Die Piraterie wird immer musikalischer.', line('Balthasar', 'Früher waren wir eine sehr schlechte Band. Deshalb ist das Schiff gesunken.'));
    }
    if (target === 'antagonist') return reply(line('Stillwasser', state.finished ? 'Die Möwen sind zurück. Mein Frühstück ist verloren.' : 'Du verstehst das nicht. Jahrzehntelang klirrende Säbel, schreiende Möwen, singende Matrosen. Ich wollte endlich RUHE.'), 'Und dafür hast du einer Insel die Stimme geklaut?', line('Stillwasser', 'Ich habe zuerst eine höfliche Beschwerde geschrieben. Niemand konnte sie über die Möwen hören.'), 'Der Altar hört wenigstens zu.');
    return reply('Ich spreche damit. Es erweist sich als ausgezeichnete Zuhörerschaft.');
  }

  function take(state, target) {
    const simple = { rope: 'harbor', bottle: 'harbor', fruit: 'bazaar', shell: 'lagoon' };
    if (simple[target] === state.scene) {
      if (state.flags[target + 'Taken']) return reply('Das habe ich bereits eingesteckt. Meine Taschen arbeiten schneller als mein Gedächtnis.');
      state.flags[target + 'Taken'] = true; give(state, target);
      return reply({ rope: 'Ein gutes Tau sollte man nie liegen lassen. Ein schlechtes übrigens auch nicht.', bottle: 'Eine leere Flasche. Abenteuer beginnen oft mit sehr niedrigen Füllständen.', fruit: 'Die Gratis-Knallmango wandert in meine Tasche. Pippa beobachtet mich mit kulinarischen Absichten.', shell: 'Eine Flüstermuschel. Wenn ich sie ans Ohr halte, klingt das Meer wieder ein winziges bisschen.' }[target]);
    }
    if (target === 'candle') return reply('Ada tauscht ihre Sturmkerze gegen einen neuen Seemannsreim. Einfach zugreifen wäre eine überraschend kurze Piratenkarriere.');
    if (target === 'mug') return reply('Den Becher gewinne ich im Wortgefecht gegen Konrad. Sprich mit ihm, um anzufangen.');
    if (target === 'chest' && state.scene === 'wreck') {
      if (!state.flags.ghostHelped) return reply('Balthasar hält den Schlüssel fest. Erst muss ich seiner Kehle helfen.');
      if (state.flags.forkTaken) return reply('Die Kiste ist schon leer. Die Stimmgabel habe ich mitgenommen.');
      state.flags.forkTaken = true; give(state, 'fork');
      note(state, 'Eine Stimmgabel aus Balthasars Kiste. Mit dem Muschelpendel kombinieren.');
      return reply('Eine Stimmgabel! Endlich ein Schatz, der nach dem Öffnen selbst etwas sagt.');
    }
    return reply('Das passt weder in meine Tasche noch in meinen aktuellen Plan.');
  }

  function fixBeacon(state) {
    if (state.flags.lampLit && state.flags.lensSet && !state.flags.beaconFixed) {
      state.flags.beaconFixed = true; ensure(state);
      note(state, 'Das Leuchtfeuer brennt. Jona hat mir den Windkompass versprochen.');
      return [line('Erzählung', 'Ein goldener Lichtstrahl schneidet durch den Nebel. Das erste Stück Krummwasser atmet auf.'), line('Jona', 'Das Licht lebt! Komm her, Motte. Mein Windkompass ist jetzt deiner.')];
    }
    return [];
  }

  const harmonyChoices = () => [{ id: 'tone_sea', text: 'Den Ton des Meeres spielen.' }, { id: 'tone_wind', text: 'Den Ton des Windes spielen.' }, { id: 'tone_heart', text: 'Den Ton des Herzens spielen.' }];
  const finaleChoices = () => [{ id: 'finale_gently', text: 'Die Stimmen sanft freilassen.' }, { id: 'finale_loud', text: 'Mit einem kräftigen Piratenfinale den Wind befreien!' }];

  function use(state, target, item) {
    const f = state.flags;
    if (!item) {
      if (target === 'chest') return take(state, target);
      if (state.scene === 'vault' && target === 'altar' && has(state, 'instrument')) return use(state, target, 'instrument');
      if (state.scene === 'vault' && target === 'bell' && f.harmonyUnlocked && has(state, 'instrument')) return use(state, target, 'instrument');
      return look(state, target);
    }
    if (!has(state, item)) return reply('Diesen Gegenstand habe ich gerade nicht dabei.');
    if (state.scene === 'bazaar' && target === 'parrot' && item === 'fruit') {
      remove(state, 'fruit'); give(state, 'rhyme'); f.parrotFed = true;
      note(state, 'Pippa hat mir einen neuen Seemannsreim gegeben. Ada wird ihn mögen.');
      return reply(line('Pippa', 'MANGO! POESIE! WENN EBBE DEINE PLÄNE KLAUT, HILFT KERZENLICHT UND SEEMANNSBRAUT!'), 'Pippa reicht mir eine Federkarte. Zum Glück muss ich mir die Aussprache nicht merken.');
    }
    if (state.scene === 'tavern' && target === 'bartender' && item === 'rhyme') {
      remove(state, 'rhyme'); give(state, 'candle'); f.candleReceived = true; f.recipeKnown = true;
      return reply(line('Ada', 'Ein frischer Reim! Herrlich. Hier ist die Sturmkerze. Setz sie in die Laterne des Leuchtturms.'), 'Ein Vogel bezahlt meine Beleuchtung. Das klingt nach guter Piratenwirtschaft.');
    }
    if (state.scene === 'bazaar' && target === 'merchant' && item === 'bottle') {
      remove(state, 'bottle'); give(state, 'prism'); f.prismReceived = true;
      return reply(line('Odo', 'Eine echte Leere-Flasche! Feine Luftführung. Hier, das Sturmprisma. Es passt in die Hülse am Leuchtturm.'), 'Ich werde nie wieder Luft kostenlos wegwerfen.');
    }
    if (state.scene === 'lighthouse' && ['mechanism', 'lens'].includes(target) && item === 'candle') {
      if (target === 'lens') return reply('Die Kerze gehört in die Laterne darunter. Die Hülse ist für das Prisma.');
      remove(state, 'candle'); f.lampLit = true;
      return reply('Die Sturmkerze entzündet die Laterne. Endlich eine warme Idee.', ...fixBeacon(state));
    }
    if (state.scene === 'lighthouse' && ['lens', 'mechanism'].includes(target) && item === 'prism') {
      if (target === 'mechanism') return reply('Das Prisma passt in die kleine Hülse über der Laterne.');
      remove(state, 'prism'); f.lensSet = true;
      return reply('Das Sturmprisma rastet in der Hülse ein. Sieben Farben, null Beschwerden.', ...fixBeacon(state));
    }
    if (state.scene === 'lagoon' && target === 'spring' && item === 'mug') {
      remove(state, 'mug'); give(state, 'water');
      return reply('Ich fülle den Becher mit singendem Quellwasser. Es summt einen überraschend guten Refrain.');
    }
    if (state.scene === 'lagoon' && target === 'spring' && item === 'water') return reply('Der Becher ist schon voll. Mehr Wasser würde nur meine Schuhe heilen.');
    if (state.scene === 'lagoon' && target === 'gate' && item === 'compass') {
      if (!f.beaconFixed) return reply('Der Kompass braucht das Licht des Leuchtturms, um einen sicheren Pfad zu zeigen.');
      f.fogCleared = true; note(state, 'Ein sicherer Nebelpfad führt von der Lagune zum Wrack.');
      const arrival = visit(state, 'wreck');
      arrival.lines.unshift(line('Mira', 'Die Nadel zeigt einen schmalen Pfad. Ich folge dem Wind, der eigentlich noch gar nicht da ist.'));
      return arrival;
    }
    if (state.scene === 'wreck' && target === 'ghost' && item === 'water') {
      if (f.ghostHelped) return reply(line('Balthasar', 'Danke, meine Kehle ist bereits in ausgezeichnetem untoten Zustand.'));
      remove(state, 'water'); give(state, 'mug'); f.ghostHelped = true; f.harmonyKnown = true; ensure(state);
      note(state, 'Balthasars Dreiklang: erst MEER, dann WIND, zuletzt HERZ. Das Resonanzpendel stimmt den Altar ein und bricht dann die Glocke.');
      return reply(line('Balthasar', 'Ahhh! Stimme! Endlich! Ich konnte seit dreizehn Jahren keinen schlechten Witz erzählen. Danke.'), line('Balthasar', 'Nimm die Stimmgabel aus meiner Kiste und verbinde sie mit einem Muschelpendel. Die Glockenkammer ist offen.'), line('Balthasar', 'Am Altar gilt: erst MEER, dann WIND, zuletzt HERZ. Danach kannst du mit dem Resonanzpendel die Schweigeglocke brechen.'), 'Du hast sicher auch eine sehr kurze Version davon.', line('Balthasar', 'Nein. Ich habe dreizehn Jahre Gesprächsrückstand.'));
    }
    if (state.scene === 'vault' && target === 'altar' && item === 'instrument') {
      if (f.harmonyUnlocked) return reply('Der Dreiklang stimmt bereits. Jetzt wartet die Schweigeglocke auf das Resonanzpendel.');
      f.harmonyActive = true; f.harmonyStep = 0;
      return withChoices([line('Mira', 'Das Pendel schwebt über dem Altar. Drei Töne. Balthasar sagte: erst Meer, dann Wind, zuletzt Herz.')], harmonyChoices());
    }
    if (state.scene === 'vault' && target === 'bell' && item === 'instrument') {
      if (state.finished) return reply('Die Stimmen sind frei. Noch ein Schlag wäre eine Zugabe auf Kosten der Architektur.');
      if (!f.harmonyUnlocked) return reply('Das Pendel prallt an der Stille ab. Erst muss ich damit den Dreiklangaltar einstimmen.');
      f.finaleReady = true;
      return withChoices([line('Stillwasser', 'Halt! Wenn die Glocke bricht, kommt der ganze Lärm zurück!'), line('Mira', 'Auch das Lachen. Und der Wind. Und die Stimme eines Freundes, der dreizehn Jahre auf einen schlechten Witz warten musste.')], finaleChoices());
    }
    if (items[target] && has(state, target)) return combine(state, item, target);
    return reply('Eine interessante Kombination. Leider teilen die beiden meine Begeisterung noch nicht.');
  }

  function perform(state, verb, targetId, itemId = null) {
    ensure(state);
    const target = scenes[state.scene].hotspots.find(h => h.id === targetId);
    if (verb === 'walk') {
      const destination = target && target.kind === 'exit' ? target.to : targetId;
      if (scenes[destination]) return visit(state, destination);
      return reply('Dorthin muss ich gerade nicht laufen. Meine Stiefel sind erfreut.');
    }
    if (!target && !(items[targetId] && has(state, targetId))) return reply('Das ist hier gerade nicht erreichbar.');
    if (verb === 'look') return look(state, targetId);
    if (verb === 'talk') return talk(state, targetId);
    if (verb === 'take') return take(state, targetId);
    if (verb === 'use') {
      if (target && target.kind === 'exit' && !itemId) return visit(state, target.to);
      return use(state, targetId, itemId);
    }
    return look(state, targetId);
  }

  const duelRounds = [
    { insult: 'Du steuerst ein Schiff wie ein Eimer mit Heimweh!', answers: [{ id: 'duel_0_bucket', text: 'Mein Eimer hat wenigstens einen Kurs.' }, { id: 'duel_0_moor', text: 'Und trotzdem lege ich an, während du nur angibst.' }, { id: 'duel_0_fish', text: 'Fische sind auch bloß nasse Gedanken.' }], correct: 'duel_0_moor', win: 'Anlegen, angeben … gut. Das saß.' },
    { insult: 'Dein Mut ist so klein, ich höre nur sein Echo!', answers: [{ id: 'duel_1_echo', text: 'Dann ist er immerhin lauter als deine Taten.' }, { id: 'duel_1_soup', text: 'Echo schmeckt schlecht in Suppe.' }, { id: 'duel_1_hat', text: 'Dein Hut beleidigt die Schwerkraft.' }], correct: 'duel_1_echo', win: 'Meine Taten sind … äh. Einverstanden. Nächster Spruch!' },
    { insult: 'Ich habe mehr Schätze versenkt, als du je Ideen haben wirst!', answers: [{ id: 'duel_2_map', text: 'Deine Schatzkarte hat bestimmt Fußnoten.' }, { id: 'duel_2_idea', text: 'Dann war eine gute Idee wohl nie darunter.' }, { id: 'duel_2_spoon', text: 'Ich besitze einen sehr überzeugenden Löffel.' }], correct: 'duel_2_idea', win: 'Autsch. Mein Stolz braucht ein Rettungsboot.' }
  ];
  function duelPrompt(state, lead = []) {
    const round = duelRounds[state.flags.duelStage || 0];
    return withChoices([...lead, line('Konrad', round.insult)], round.answers);
  }

  function choose(state, id) {
    ensure(state);
    const f = state.flags;
    if (id === 'duel_leave') return reply('Meine scharfe Zunge kommt gleich wieder. Sie muss noch kurz ihre Stiefel anziehen.');
    if (id === 'duel_begin' && state.scene === 'tavern') {
      if (f.duelWon) return reply(line('Konrad', 'Ein Sieg reicht. Ich habe nur einen Stolz.'));
      f.duelActive = true; f.duelStage = 0;
      return duelPrompt(state);
    }
    if (id.startsWith('duel_') && state.scene === 'tavern' && f.duelActive && !f.duelWon) {
      const round = duelRounds[f.duelStage || 0];
      if (!round.answers.some(answer => answer.id === id)) return duelPrompt(state, [line('Mira', 'Moment. Wir sind beim aktuellen Spruch geblieben.')]);
      const selected = round.answers.find(answer => answer.id === id);
      if (id !== round.correct) return duelPrompt(state, [line('Mira', selected.text), line('Konrad', 'Hübsch schräg. Aber ein Konter muss meinen Spruch treffen. Versuch es noch einmal.')]);
      const lead = [line('Mira', selected.text), line('Konrad', round.win)];
      f.duelStage = (f.duelStage || 0) + 1;
      if (f.duelStage < duelRounds.length) return duelPrompt(state, lead);
      f.duelWon = true; f.duelActive = false; give(state, 'mug');
      note(state, 'Konrad ist im Wortgefecht geschlagen. Der Lagunenpfad ist offen. Sein Zinnbecher gehört mir.');
      return reply(...lead, line('Konrad', 'Gewonnen, Hafenmotte! Der Lagunenpfad ist offen. Hier ist der Becher. Füll ihn lieber mit Wasser als mit Übermut.'), 'Beides in einem Becher wäre vermutlich zu viel.');
    }
    if (id.startsWith('tone_') && state.scene === 'vault' && f.harmonyActive && !f.harmonyUnlocked) {
      const tones = ['tone_sea', 'tone_wind', 'tone_heart'];
      if (!tones.includes(id)) return withChoices([line('Mira', 'Der Altar kennt nur Meer, Wind und Herz.')], harmonyChoices());
      if (id !== tones[f.harmonyStep || 0]) {
        f.harmonyStep = 0;
        return withChoices([line('Erzählung', 'Ein schiefer Ton hüpft gegen die Wand. Die Zeichen erlöschen, das Pendel bleibt heil.'), line('Mira', 'Noch einmal von vorn: von außen nach innen. Meer, Wind, Herz.')], harmonyChoices());
      }
      f.harmonyStep = (f.harmonyStep || 0) + 1;
      const toneLines = ['Das Meer antwortet mit einer tiefen, warmen Welle.', 'Der Wind zieht wie ein leiser Atem durch die Kammer.', 'Das Herz schlägt. Nicht nur meines. Das der ganzen Insel.'];
      if (f.harmonyStep < 3) return withChoices([line('Erzählung', toneLines[f.harmonyStep - 1]), line('Mira', f.harmonyStep === 1 ? 'Der erste Ton sitzt. Als Nächstes der Wind.' : 'Zwei Töne. Jetzt das Herz.')], harmonyChoices());
      f.harmonyUnlocked = true; f.harmonyActive = false;
      note(state, 'Meer, Wind und Herz bilden den Dreiklang. Das Resonanzpendel kann jetzt die Schweigeglocke brechen.');
      return reply(line('Erzählung', toneLines[2]), 'Alle drei Zeichen leuchten. Jetzt das Resonanzpendel an die Schweigeglocke.');
    }
    if (['finale_gently', 'finale_loud'].includes(id) && state.scene === 'vault' && f.finaleReady && f.harmonyUnlocked) {
      state.finished = true; state.chapter = 3; f.finaleReady = false; f.ending = id === 'finale_loud' ? 'loud' : 'gentle';
      note(state, 'Die Schweigeglocke ist gebrochen. Krummwasser hat seine Stimmen und seinen Wind zurück.');
      return reply(line('Mira', id === 'finale_loud' ? 'Für Krummwasser! Und für sämtliche ungehörten schlechten Witze!' : 'Keine Stimme gehört in einen Käfig. Kommt nach Hause.'), line('Erzählung', 'Das Resonanzpendel trifft die Glocke. Ein silberner Riss wächst durch das Metall. Wind und Stimmen strömen ins Freie.'), ...outro);
    }
    return reply('Dieser Gesprächsmoment ist vorbei. Ich kann jederzeit neu ansetzen.');
  }

  function combine(state, a, b) {
    ensure(state);
    if (!has(state, a) || !has(state, b)) return reply('Zum Kombinieren brauche ich beide Gegenstände in meiner Tasche.');
    if (a === b) return reply('Der Gegenstand ist schon ganz er selbst.');
    const pair = [a, b].sort().join('+');
    if (pair === 'rope+shell') {
      remove(state, 'rope'); remove(state, 'shell'); give(state, 'pendulum');
      note(state, 'Tau und Flüstermuschel ergeben ein Muschelpendel. Eine Stimmgabel macht daraus ein Instrument.');
      return reply('Ich binde die Muschel ans Tau. Ein Muschelpendel! Der Anfang eines Instruments und das Ende einer ordentlichen Seemannsknotenprüfung.');
    }
    if (pair === 'fork+pendulum') {
      remove(state, 'fork'); remove(state, 'pendulum'); give(state, 'instrument');
      note(state, 'Das Resonanzpendel ist fertig. In der Glockenkammer zuerst am Dreiklangaltar benutzen.');
      return reply('Die Stimmgabel sitzt am Muschelpendel. Es schwingt, summt und sieht heldenhaft improvisiert aus. Das Resonanzpendel ist fertig.');
    }
    return reply('Diese beiden ergeben noch keine überzeugende Erfindung. Ich behalte sie lieber einzeln.');
  }

  function stage(state) {
    ensure(state);
    const f = state.flags;
    if (state.finished) return 'finished';
    if (!f.recipeKnown) return 'recipe';
    if (!f.candleReceived) return f.parrotFed ? 'candle' : 'rhyme';
    if (!f.prismReceived) return 'prism';
    if (!f.duelWon) return 'duel';
    if (!f.beaconFixed) return !f.lampLit ? 'lamp' : 'lens';
    if (!f.compassReceived) return 'compass';
    if (!f.fogCleared) return 'fog';
    if (!f.ghostHelped) return 'ghost';
    if (!f.forkTaken) return 'fork';
    if (!has(state, 'instrument')) return has(state, 'pendulum') ? 'instrument' : 'pendulum';
    if (!f.harmonyUnlocked) return 'harmony';
    return 'finale';
  }

  const goals = {
    recipe: 'Sprich mit Ada in der Taverne über das verschwundene Licht.',
    rhyme: 'Besorge Pippas Seemannsreim für Adas Sturmkerze.',
    candle: 'Tausche den Papageienreim bei Ada gegen die Sturmkerze.',
    prism: 'Besorge Odos Sturmprisma für den Leuchtturm.',
    duel: 'Gewinne Konrads Wortgefecht und öffne den Weg zur Lagune.',
    lamp: 'Setze die Sturmkerze in die Laterne des Leuchtturms.',
    lens: 'Setze das Sturmprisma in die Hülse des Leuchtturms.',
    compass: 'Hole bei Jona den versprochenen Windkompass ab.',
    fog: 'Finde mit dem Windkompass den Nebelpfad zum Wrack.',
    ghost: 'Hilf Balthasars trockener Kehle mit singendem Quellwasser.',
    fork: 'Nimm die Stimmgabel aus Balthasars Seekiste.',
    pendulum: 'Baue aus einem Tau und einer Flüstermuschel ein Muschelpendel.',
    instrument: 'Verbinde Muschelpendel und Stimmgabel zum Resonanzpendel.',
    harmony: 'Stimme mit dem Resonanzpendel den Dreiklangaltar ein.',
    finale: 'Brich mit dem Resonanzpendel die Schweigeglocke.',
    finished: 'Krummwasser ist gerettet. Die Stimmen sind frei!'
  };
  const hints = {
    recipe: ['Eine dunkle Insel beginnt mit einer hellen Idee.', 'Ada in der Taverne kennt Jona und das Leuchtfeuer.', 'Gehe vom Hafen in die Taverne und sprich mit Wirtin Ada.'],
    rhyme: ['Eine Kerze kostet hier keine Münze, sondern ein gutes Wort.', 'Pippa am Basar reimt, sobald sie satt ist. Das Obst daneben ist gratis.', 'Nimm am Basar die Knallmango. Wähle sie im Inventar und benutze sie auf Pippa.'],
    candle: ['Gute Poesie macht den Weg heller.', 'Ada tauscht ihre Sturmkerze gegen Pippas Reim.', 'Gehe zur Taverne. Wähle den Papageienreim im Inventar und benutze ihn auf Ada.'],
    prism: ['Odo bevorzugt durchschaubare Geschäfte.', 'Eine leere Flasche ist für Odo wertvoller als Geld.', 'Nimm die leere Flasche im Hafen. Benutze sie am Basar auf Händler Odo.'],
    duel: ['Konrads Sprüche müssen genau dort getroffen werden, wo sie prahlen.', 'Sprich mit Konrad in der Taverne. Falsche Antworten darfst du wiederholen.', 'Beginne das Wortgefecht. Die Konter sind: „…während du nur angibst“, „…lauter als deine Taten“, „…eine gute Idee wohl nie darunter“.'],
    lamp: ['Das Licht braucht eine Flamme, die kein Wind verschreckt.', 'Adas Sturmkerze gehört in die kalte Laterne unter der Prismenhülse.', 'Gehe zum Leuchtturm, wähle die Sturmkerze und benutze sie auf die kalte Laterne.'],
    lens: ['Eine Flamme allein zeigt noch keinen Weg.', 'Das Sturmprisma gehört in die kleine Hülse über der Laterne.', 'Benutze das Sturmprisma auf die leere Prismenhülse am Leuchtturm.'],
    compass: ['Gute Arbeit verdient ein gutes Werkzeug.', 'Jona hat für das reparierte Leuchtfeuer einen Windkompass versprochen.', 'Sprich mit Jona am Leuchtturm. Sie gibt dir den Windkompass.'],
    fog: ['Der Nebel folgt Regeln, nur keinen sichtbaren.', 'Der Windkompass zeigt einen sicheren Pfad am rechten Rand der Lagune.', 'Gehe über den Basar zur Lagune. Benutze den Windkompass auf den Nebelpfad.'],
    ghost: ['Manche Stimmen brauchen einfach einen Schluck.', 'Die singende Quelle in der Lagune hilft. Konrads Becher kann Wasser tragen.', 'Gehe zur Lagune. Benutze den Zinnbecher auf die Quelle. Benutze den vollen Becher anschließend auf Balthasar im Wrack.'],
    fork: ['Balthasars Dank hat zwei silberne Zinken.', 'Der Geist hat seine Kiste geöffnet. Sie enthält eine Stimmgabel.', 'Benutze „Nehmen“ auf die Seekiste im Wrack, oder benutze die Kiste ohne Inventargegenstand.'],
    pendulum: ['Strandgut kann schwingen, wenn man es gut verbindet.', 'Sela kennt das Rezept: Muschel an Tau. Beides lässt sich frei mitnehmen.', 'Nimm das Tau im Hafen und die Flüstermuschel in der Lagune. Kombiniere die beiden im Inventar.'],
    instrument: ['Dem Pendel fehlt ein eigener Ton.', 'Die Stimmgabel macht aus dem Muschelpendel das Resonanzpendel.', 'Kombiniere Stimmgabel und Muschelpendel im Inventar.'],
    harmony: ['Die Insel singt von außen nach innen.', 'Balthasars Reihenfolge lautet Meer, Wind, Herz.', 'Benutze das Resonanzpendel auf den Altar in der Glockenkammer. Wähle Meer, danach Wind, danach Herz.'],
    finale: ['Die Stimme der Insel wartet im Metall.', 'Der eingestimmte Altar hat die Schweigeglocke verwundbar gemacht.', 'Benutze das Resonanzpendel auf die große Schweigeglocke. Wähle, wie du die Stimmen befreien möchtest.'],
    finished: ['Die Möwen sind wieder da. Sie danken dir durch Beschwerden.', 'Die Insel ist gerettet; du kannst alle Orte weiter besuchen.', 'Du hast das Abenteuer abgeschlossen. Ein neues Spiel beginnt die Geschichte erneut.']
  };
  function objective(state) { return goals[stage(state)]; }
  function hint(state, tier = 1) { return hints[stage(state)][Math.max(0, Math.min(2, Number(tier || 1) - 1))]; }
  function chapterTitle(state) {
    ensure(state);
    return ['Akt I · Ein Hafen ohne Pfeifen', 'Akt II · Die Stimmen unter dem Wasser', 'Akt III · Ein Herz für Krach'][state.chapter - 1];
  }

  const api = { initialState, scenes, items, availableHotspots, canVisit, perform, choose, combine, hint, objective, chapterTitle, intro, outro };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PirateStory = api;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);
