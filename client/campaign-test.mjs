import assert from 'node:assert/strict';
import * as game from './campaign.mjs';
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log('PASS',name);};
check('seeded orders replay and unlocks',()=>{
  const a=game.createCampaign(),b=game.createCampaign();
  for(let day=1;day<=5;day++)for(let i=0;i<50;i++) {
    const order=game.makeOrder(a,day);assert.deepEqual(order,game.makeOrder(b,day));
    assert.ok(game.DRINKS[order.drink].day<=day);
    if(day===1)assert.equal(order.ice,'normal');
    if(day<3)assert.equal(order.sugar,'normal');
  }
});
check('capacity counts ready and brewing cups',()=>{
  const state=game.createCampaign();
  assert.equal(game.prepare(state,{drink:'coffee'},1),null);
  assert.equal(game.prepare(state,{drink:'tea',ice:'less'},1),null);
  assert.ok(game.prepare(state,{drink:'tea'},1));
  game.advancePreparation(state,20);assert.ok(game.ready(state.batches[0]));
  assert.equal(game.prepare(state,{drink:'lime'},1),null);
  state.extraSlot=true;assert.ok(game.prepare(state,{drink:'lime'},2));
});
check('wrong orders preserve cup and patience, correct delivery is atomic',()=>{
  const state=game.createCampaign();const batch=game.prepare(state,{drink:'tea'},1);
  game.advancePreparation(state,3);
  const customer={phase:'waiting',waitElapsed:12,order:game.recipe({drink:'lime'})};
  assert.equal(game.deliver(state,customer,batch.id),'wrong');
  assert.equal(game.deliver(state,customer,batch.id),'wrong');
  assert.equal(state.mistakes,1);assert.equal(customer.waitElapsed,12);assert.equal(state.batches.length,1);
  customer.order=game.recipe(batch);assert.equal(game.deliver(state,customer,batch.id),'served');
  assert.equal(game.deliver(state,customer,batch.id),'unavailable');assert.equal(state.streak,1);
});
check('regular relationship grants once per day',()=>{
  const state=game.createCampaign();
  for(let i=0;i<2;i++) {
    const batch=game.prepare(state,game.REGULARS.lan,3);game.advancePreparation(state,10);
    const customer={phase:'waiting',order:{...game.recipe(game.REGULARS.lan),regularId:'lan'}};
    assert.equal(game.deliver(state,customer,batch.id),'served');
  }
  assert.equal(state.relationships.lan,1);game.resetDay(state);assert.deepEqual(state.visited,[]);assert.equal(state.relationships.lan,1);
});
check('saved batch progress, IDs and malformed saves',()=>{
  assert.doesNotThrow(()=>game.createCampaign(null));
  assert.doesNotThrow(()=>game.recipe(null));
  assert.equal(game.recipe({drink:'__proto__'}).drink,'tea');
  const state=game.createCampaign({batches:[null,{id:7,drink:'tea',elapsed:1,duration:2},{id:7,drink:'coffee'}]});
  assert.equal(state.batches.length,1);assert.equal(state.batches[0].elapsed,1);assert.equal(state.nextBatchId,8);
  assert.deepEqual(game.createCampaign(JSON.parse(JSON.stringify(state))),state);
});
check('stars reward target and accuracy without negative outcomes',()=>{
  const state=game.createCampaign({bestStreak:3});
  assert.equal(game.dayStars(state,0,0,1),0);
  assert.equal(game.dayStars(state,6,0,1),3);
  assert.equal(game.dayStars(state,6,1,1),2);
  assert.equal(game.dayStars(state,2,0,1),1);
});
console.log(JSON.stringify({checks}));
