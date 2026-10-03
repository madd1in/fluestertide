'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Story = require('../story.js');

const walkthrough = [
  ['perform', 'take', 'rope'], ['perform', 'take', 'bottle'],
  ['perform', 'walk', 'tavern'], ['perform', 'talk', 'bartender'],
  ['perform', 'walk', 'bazaar'], ['perform', 'take', 'fruit'],
  ['perform', 'use', 'parrot', 'fruit'], ['perform', 'use', 'merchant', 'bottle'],
  ['perform', 'walk', 'tavern'], ['perform', 'use', 'bartender', 'rhyme'],
  ['perform', 'talk', 'pirate'], ['choose', 'duel_begin'],
  ['choose', 'duel_0_moor'], ['choose', 'duel_1_echo'], ['choose', 'duel_2_idea'],
  ['perform', 'walk', 'lighthouse'], ['perform', 'use', 'mechanism', 'candle'],
  ['perform', 'use', 'lens', 'prism'], ['perform', 'talk', 'keeper'],
  ['perform', 'walk', 'lagoon'], ['perform', 'take', 'shell'],
  ['perform', 'use', 'spring', 'mug'], ['perform', 'use', 'gate', 'compass'],
  ['perform', 'use', 'ghost', 'water'], ['perform', 'take', 'chest'],
  ['combine', 'rope', 'shell'], ['combine', 'fork', 'pendulum'],
  ['perform', 'walk', 'vault'], ['perform', 'use', 'altar', 'instrument'],
  ['choose', 'tone_sea'], ['choose', 'tone_wind'], ['choose', 'tone_heart'],
  ['perform', 'use', 'bell', 'instrument'], ['choose', 'finale_gently'],
];

const clone = value => JSON.parse(JSON.stringify(value));
function run(state, steps) {
  for (const [method, ...args] of steps) {
    const result = Story[method](state, ...args);
    assert.ok(result && Array.isArray(result.lines), `${method} ${args.join(' ')} returns dialogue`);
    assert.ok(result.lines.every(line => typeof line.text === 'string' && typeof line.speaker === 'string'));
    assert.equal(new Set(state.inventory).size, state.inventory.length, 'inventory has no duplicate items');
    assert.ok(state.inventory.every(id => Story.items[id]), 'every inventory item is defined');
  }
  return state;
}
function checkpoints() {
  const state = Story.initialState();
  const snapshots = [clone(state)];
  for (const step of walkthrough) {
    run(state, [step]);
    snapshots.push(clone(state));
  }
  return snapshots;
}

test('initial saves are independent, complete, and serializable', () => {
  const first = Story.initialState();
  const second = Story.initialState();
  assert.equal(first.scene, 'harbor');
  assert.equal(first.chapter, 1);
  assert.equal(first.finished, false);
  assert.deepEqual(first.inventory, []);
  assert.deepEqual(first.flags, {});
  assert.ok(first.journal.length > 0);
  assert.deepEqual(clone(first), first);
  first.inventory.push('rope');
  first.flags.modified = true;
  first.journal.push('Unabhängig');
  assert.deepEqual(second.inventory, []);
  assert.deepEqual(second.flags, {});
  assert.equal(second.journal.length, 1);
});

test('full adventure visits all seven scenes and reaches each ending', () => {
  for (const ending of ['finale_gently', 'finale_loud']) {
    const state = Story.initialState();
    const visited = new Set([state.scene]);
    const steps = walkthrough.map(step => step[1] === 'finale_gently' ? ['choose', ending] : step);
    for (const step of steps) {
      run(state, [step]);
      visited.add(state.scene);
    }
    assert.deepEqual([...visited].sort(), Object.keys(Story.scenes).sort());
    assert.equal(state.finished, true);
    assert.equal(state.chapter, 3);
    assert.equal(state.flags.ending, ending === 'finale_loud' ? 'loud' : 'gentle');
    assert.ok(state.inventory.includes('instrument'), 'the finale never destroys its required instrument');
    assert.match(Story.objective(state), /gerettet/);
    for (const scene of Object.keys(Story.scenes)) {
      assert.equal(Story.canVisit(state, scene), true, `finished game can revisit ${scene}`);
      Story.perform(state, 'walk', scene);
      assert.equal(state.scene, scene);
    }
  }
});

test('all wrong duel answers preserve the current round and allow recovery', () => {
  const state = Story.initialState();
  Story.perform(state, 'walk', 'tavern');
  Story.perform(state, 'talk', 'pirate');
  let result = Story.choose(state, 'duel_begin');
  const correct = ['duel_0_moor', 'duel_1_echo', 'duel_2_idea'];
  for (let round = 0; round < correct.length; round++) {
    const wrongChoices = result.choices.filter(choice => choice.id !== correct[round]);
    assert.equal(wrongChoices.length, 2);
    for (const wrong of wrongChoices) {
      result = Story.choose(state, wrong.id);
      assert.equal(state.flags.duelStage, round);
      assert.equal(state.finished, false);
      assert.ok(result.choices.some(choice => choice.id === correct[round]));
    }
    result = Story.choose(state, correct[round]);
  }
  assert.equal(state.flags.duelWon, true);
  assert.ok(state.inventory.includes('mug'));
  assert.equal(Story.canVisit(state, 'lagoon'), true);
  Story.perform(state, 'talk', 'pirate');
  assert.equal(state.inventory.filter(id => id === 'mug').length, 1);
});

test('every wrong altar tone can be recovered without losing the instrument', () => {
  const beforeAltar = walkthrough.findIndex(step => step[1] === 'use' && step[2] === 'altar');
  const correct = ['tone_sea', 'tone_wind', 'tone_heart'];
  for (let stage = 0; stage < 3; stage++) {
    for (const wrong of correct.filter(id => id !== correct[stage])) {
      const state = run(Story.initialState(), walkthrough.slice(0, beforeAltar + 1));
      run(state, correct.slice(0, stage).map(id => ['choose', id]));
      const result = Story.choose(state, wrong);
      assert.equal(state.flags.harmonyStep, 0);
      assert.ok(state.inventory.includes('instrument'));
      assert.equal(result.choices.length, 3);
      run(state, correct.map(id => ['choose', id]));
      assert.equal(state.flags.harmonyUnlocked, true);
      run(state, [['perform', 'use', 'bell', 'instrument'], ['choose', 'finale_gently']]);
      assert.equal(state.finished, true);
    }
  }
});

test('leaving a dialogue or an altar does not lock future attempts', () => {
  const state = Story.initialState();
  Story.perform(state, 'walk', 'tavern');
  Story.choose(state, 'duel_begin');
  Story.choose(state, 'duel_0_moor');
  Story.perform(state, 'walk', 'harbor');
  Story.choose(state, 'duel_1_echo');
  assert.equal(state.flags.duelWon, undefined);
  run(state, walkthrough);
  assert.equal(state.finished, true);

  const beforeAltar = walkthrough.findIndex(step => step[1] === 'use' && step[2] === 'altar');
  const altar = run(Story.initialState(), walkthrough.slice(0, beforeAltar + 1));
  Story.choose(altar, 'tone_sea');
  Story.perform(altar, 'walk', 'wreck');
  Story.choose(altar, 'tone_wind');
  assert.equal(altar.flags.harmonyUnlocked, undefined);
  run(altar, [['perform', 'walk', 'vault'], ...walkthrough.slice(beforeAltar)]);
  assert.equal(altar.finished, true);
});

test('every saved checkpoint resumes to a valid finale with useful three-tier hints', () => {
  const saves = checkpoints();
  saves.forEach((snapshot, index) => {
    const resumed = clone(snapshot);
    assert.ok(Story.objective(resumed).length > 10);
    assert.ok(Story.chapterTitle(resumed).length > 10);
    const hints = [1, 2, 3].map(tier => Story.hint(resumed, tier));
    assert.ok(hints.every(hint => typeof hint === 'string' && hint.length > 10));
    assert.equal(new Set(hints).size, 3, `checkpoint ${index} has distinct hint tiers`);
    run(resumed, walkthrough.slice(index));
    assert.equal(resumed.finished, true, `save at action ${index} can finish`);
  });
});

test('locked routes and premature finales cannot skip required puzzles', () => {
  const state = Story.initialState();
  for (const scene of ['lagoon', 'wreck', 'vault']) {
    assert.equal(Story.canVisit(state, scene), false);
    Story.perform(state, 'walk', scene);
    assert.equal(state.scene, 'harbor');
  }
  for (const choice of ['tone_sea', 'finale_gently', 'finale_loud', 'duel_2_idea']) Story.choose(state, choice);
  assert.equal(state.finished, false);
  assert.deepEqual(state.inventory, []);
  run(state, walkthrough);
  assert.equal(state.finished, true);
});

test('wrong item uses and incompatible combinations never consume puzzle items', () => {
  const validUses = new Set([
    'bazaar/parrot/fruit', 'bazaar/merchant/bottle', 'tavern/bartender/rhyme',
    'lighthouse/mechanism/candle', 'lighthouse/lens/prism', 'lagoon/spring/mug',
    'lagoon/spring/water', 'lagoon/gate/compass', 'wreck/ghost/water',
    'vault/altar/instrument', 'vault/bell/instrument',
  ]);
  const validPairs = new Set(['rope+shell', 'fork+pendulum']);
  checkpoints().forEach((checkpoint, index) => {
    for (const hotspot of Story.availableHotspots(checkpoint)) {
      for (const item of checkpoint.inventory) {
        if (validUses.has(`${checkpoint.scene}/${hotspot.id}/${item}`)) continue;
        const attempted = clone(checkpoint);
        Story.perform(attempted, 'use', hotspot.id, item);
        assert.deepEqual(attempted.inventory, checkpoint.inventory, `wrong use ${hotspot.id}/${item} at action ${index}`);
        run(attempted, walkthrough.slice(index));
        assert.equal(attempted.finished, true, 'wrong uses cannot prevent completing the adventure');
      }
    }
    for (const a of checkpoint.inventory) {
      for (const b of checkpoint.inventory) {
        if (validPairs.has([a, b].sort().join('+'))) continue;
        const attempted = clone(checkpoint);
        Story.combine(attempted, a, b);
        assert.deepEqual(attempted.inventory, checkpoint.inventory, `wrong pair ${a}/${b}`);
      }
    }
  });
});

test('lighthouse parts work in either order and recipes are symmetric', () => {
  const lighthouseIndex = walkthrough.findIndex(step => step[1] === 'use' && step[2] === 'mechanism');
  const state = run(Story.initialState(), walkthrough.slice(0, lighthouseIndex));
  run(state, [['perform', 'use', 'lens', 'prism'], ['perform', 'use', 'mechanism', 'candle']]);
  assert.equal(state.flags.beaconFixed, true);
  const reverse = walkthrough.slice(lighthouseIndex + 2).map(step => step[0] === 'combine' ? ['combine', step[2], step[1]] : step);
  run(state, reverse);
  assert.equal(state.finished, true);
});

module.exports = { walkthrough };
