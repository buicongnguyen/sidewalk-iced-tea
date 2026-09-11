import assert from 'node:assert/strict';
import * as rules from './events.mjs';
const shop=()=>({coins:30,levelCoinsEarned:0,dayNumber:5,levelElapsed:33,levelComplete:false,campaign:{closing:false},street:rules.createStreet({day:5})});
let cases=0;
for(const id of rules.EVENT_IDS)for(const variant of [0,1]) {
  const event=rules.EVENTS[id];
  for(const [nodeId,node] of Object.entries(event.nodes)) {
    assert.ok(node.choices.some(c=>!c.cost),`${id}/${nodeId} needs a free option`);
    for(const choice of node.choices)for(const coins of [0,30]) {
      const state=shop();state.coins=coins;
      rules.startEvent(state,id);Object.assign(state.street.active,{node:nodeId,variant});
      const a=structuredClone(state.street.active),before=structuredClone(state);
      const ok=rules.chooseEvent(state,a.token,nodeId,choice.id);
      assert.equal(ok,coins>=choice.cost,`${id}/${nodeId}/${choice.id}`);
      if(!ok)assert.deepEqual(state,before);
      else {
        assert.ok(state.coins>=0);
        const after=structuredClone(state);
        assert.equal(rules.chooseEvent(state,a.token,nodeId,choice.id),false,'double resolution');
        assert.deepEqual(state,after);
        state.street=rules.createStreet(state.street);
        assert.deepEqual(state.street,after.street,'restore must preserve choices and variants');
        assert.ok(rules.presentation(state.street).text.length>0);
        if(choice.next)assert.equal(state.street.active.node,choice.next);
        else {
          const effect=rules.variantValue(choice.outcome,variant);
          assert.equal(state.coins,Math.max(0,coins-choice.cost+effect.coins));
          assert.equal(rules.presentation(state.street).effect.coins,state.coins-coins);
          assert.equal(state.street.history.length,1);
          rules.dismissEvent(state,a.token);
          if(effect.later) {
            state.dayNumber++;
            state.levelElapsed=8;
            assert.equal(rules.tickStreet(state,.1),true);
            assert.equal(state.coins,Math.max(0,after.coins+effect.later.coins));
            assert.equal(state.street.pending.length,0);
            const paid=state.coins;
            for(let i=0;i<20;i++)rules.tickStreet(state,.1);
            assert.equal(state.coins,paid,'follow-up pays exactly once');
            state.street=rules.createStreet(state.street);
            assert.equal(rules.presentation(state.street).text,effect.later.text);
          }
        }
      }
      cases++;
    }
  }
}
for(const malformed of [null,{},[],{pending:[null,{},'x',{id:'cat',node:'__proto__'}]},
  {active:{id:'cat',node:'constructor',token:'x'}},{active:{id:'__proto__',node:'start',token:'x'}},
  {modifier:{value:999,left:Infinity},history:[null],pending:[{id:'cat',node:'shiny',choice:'return',variant:Infinity}]}]) {
  const restored=rules.createStreet(malformed);
  assert.doesNotThrow(()=>rules.presentation(restored));
  assert.ok(restored.pending.length<=8&&restored.history.length<=24);
}
const deterministic=shop(),copy=shop();
for(let day=1;day<=40;day++) {
  for(const state of [deterministic,copy]) {
    state.dayNumber=day;
    for(const time of [0,32,80,112,160,180]) {
      state.levelElapsed=time;state.campaign.closing=time===180;
      rules.tickStreet(state,40);
      if(state.street.active) {
        const p=rules.presentation(state.street),a=state.street.active;
        assert.equal(state.campaign.closing,false);
        if(a.phase==='choice')rules.chooseEvent(state,a.token,a.node,p.choices.find(c=>!c.cost).id);
        rules.dismissEvent(state,a.token);
      }
    }
  }
  assert.deepEqual(deterministic,copy);
}
const expiry=shop();rules.startEvent(expiry,'cat');expiry.levelElapsed=179;
rules.tickStreet(expiry,50);assert.equal(expiry.street.active,null);assert.equal(expiry.street.history[0].choice,'ignored');
expiry.campaign.closing=true;assert.equal(rules.startEvent(expiry,'cat'),false);
assert.ok(new Set(deterministic.street.history.map(r=>r.id)).size>=10,'event variety');
const capped=shop();capped.street.trust=10;rules.startEvent(capped,'fight');
rules.chooseEvent(capped,capped.street.active.token,'start','police');
assert.equal(rules.presentation(capped.street).effect.trust,0,'display actual capped trust');
const variantShop=shop();rules.startEvent(variantShop,'cat');variantShop.street.active.variant=1;
assert.equal(rules.presentation(variantShop.street).portrait,'CatCap');
console.log(`EVENT_RULES_PASSED: ${cases} choice/variant/budget cases, follow-ups, saves, malformed input, expiry and 40-day deterministic simulation`);
