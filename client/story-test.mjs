import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import * as rules from './campaign.mjs';

const server=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','inherit']});
let browser;
const errors=[];
const customer=(id=1,order={drink:'lime',ice:'less',sugar:'normal'})=>({id,type:id===1?'asian_woman_mint':'man',tableId:'table-story-0',seatIndex:id-1,phase:'waiting',x:id===1?398:454,y:278,waitElapsed:0,order});
const base=(overrides={})=>({dayNumber:2,levelElapsed:0,nextCustomerId:3,spawnTimer:999,coins:50,nextWeatherRollIn:60,campaign:rules.createCampaign(),customers:[customer()],...overrides});
try {
  const url=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('server timeout')),12000);
    server.stdout.on('data',data=>{const match=String(data).match(/http:\/\/\S+/);if(match){clearTimeout(timer);resolve(match[0]);}});
  });
  browser=await chromium.launch({headless:true});
  await mkdir('test-results',{recursive:true});
  async function open(state,viewport={width:1280,height:950},three=false,fallback=false) {
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    if(fallback)await context.addInitScript(()=>Object.defineProperty(window,'indexedDB',{value:undefined}));
    await context.addInitScript(value=>{
      if(sessionStorage.getItem('story-test-seeded'))return;
      sessionStorage.setItem('story-test-seeded','1');
      localStorage.setItem('sidewalk-iced-tea:save-backup:story',JSON.stringify(value));
      localStorage.setItem('sidewalk-iced-tea:save-backup',JSON.stringify({coins:777}));
    },state);
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url+(three?'':'/?view=2d'));
    await page.waitForFunction(()=>window.__planBGame);
    if(three)await page.waitForFunction(()=>window.__planBGame.getSnapshot().view==='3d');
    return page;
  }
  const snapshot=page=>page.evaluate(()=>window.__planBGame.getSnapshot());
  async function choose(page,drink,ice='normal',sugar='normal',servings=1) {
    await page.click('#open-preparation');
    await page.locator(`.recipe-picker label:has(input[value="${drink}"])`).click();
    if(await page.locator('#recipe-ice').isEnabled())await page.selectOption('#recipe-ice',ice);
    if(await page.locator('#recipe-sugar').isEnabled())await page.selectOption('#recipe-sugar',sugar);
    await page.locator(`.serving-picker label:has(input[value="${servings}"])`).click();
  }
  let page=await open(base());
  await page.click('#start-button');
  await choose(page,'tea');await page.click('#prepare-drink');
  await page.waitForFunction(()=>!document.querySelector('#deliver-drink').disabled);
  await page.click('#deliver-drink');
  let state=await snapshot(page);assert.equal(state.totalServed,0);assert.equal(state.campaign.batches.length,1);assert.equal(state.campaign.mistakes,1);
  await page.click('#discard-drink');await choose(page,'lime','less');await page.click('#prepare-drink');
  await page.waitForFunction(()=>!document.querySelector('#deliver-drink').disabled);
  await page.click('#pause-button');const paused=await snapshot(page);
  await page.waitForTimeout(350);assert.deepEqual((await snapshot(page)).campaign,paused.campaign);
  await page.click('#start-button');await page.click('#deliver-drink');
  await page.waitForFunction(()=>window.__planBGame.getSnapshot().totalServed===1);
  state=await snapshot(page);assert.equal(state.campaign.batches.length,0);assert.ok(state.coins>50);
  await page.click('#settings-button');
  await page.click('#upgrade-slot');assert.equal((await snapshot(page)).campaign.extraSlot,true);
  await page.reload();await page.waitForFunction(()=>window.__planBGame);
  state=await snapshot(page);assert.equal(state.totalServed,1);assert.equal(state.campaign.extraSlot,true);
  await page.goto(url+'/?mode=classic');await page.waitForFunction(()=>window.__planBGame);
  assert.equal((await snapshot(page)).coins,777);await page.context().close();
  console.log('PASS recipe mismatch, remake, pause, delivery, upgrade, reload and Classic isolation');

  for(const quantity of [2,3]) {
    const recipe={drink:'lime',ice:'less',sugar:'less'};
    const guests=[1,2,3,4].map((id,index)=>({...customer(id, id===2?{drink:'coffee',ice:'normal',sugar:'less'}:recipe),
      type:['asian_woman_mint','man','woman','old_man'][index],tableId:`table-story-${index<2?0:1}`,seatIndex:index%2,
      x:(index<2?360:640)+(index%2?94:38),y:278}));
    if(quantity===2)guests.pop();
    const campaign=rules.createCampaign({extraSlot:true,batches:[{id:1,drink:'tea',remaining:1,elapsed:2,duration:2}]});
    page=await open(base({dayNumber:3,nextCustomerId:5,customers:guests,campaign}),{width:quantity===2?320:390,height:quantity===2?568:844},quantity===3,quantity===2);
    await page.click('#start-button');
    await choose(page,'lime','less','less',quantity);
    await page.screenshot({path:`test-results/batch-preparation-${quantity}.png`});
    await page.click('#prepare-drink');
    await page.waitForFunction(()=>window.__planBGame.getSnapshot().campaign.batches[1]?.elapsed>=window.__planBGame.getSnapshot().campaign.batches[1]?.duration);
    assert.deepEqual(rules.recipe((await snapshot(page)).campaign.batches[1]),recipe);
    await page.click('[data-customer-id="2"]');await page.click('#deliver-drink');
    state=await snapshot(page);assert.equal(state.totalServed,0);assert.equal(state.campaign.batches[1].remaining,quantity);
    await page.click('[data-customer-id="1"]');await page.click('#deliver-drink');
    await page.click('#pause-button');
    state=await snapshot(page);const coins=state.coins,batchId=state.campaign.batches[1].id;
    assert.equal(state.selectedCustomerId,3);assert.equal(await page.locator('#batch-1').getAttribute('aria-pressed'),'true');
    assert.equal(state.campaign.batches[1].remaining,quantity-1);assert.equal(state.totalServed,1);
    assert.ok((await page.locator('#batch-1').innerText()).includes(`${quantity-1} ly`));
    await page.screenshot({path:`test-results/batch-remaining-${quantity}.png`,style:'#title-overlay,#toast {visibility:hidden!important}'});
    await page.reload();await page.waitForFunction(()=>window.__planBGame);
    state=await snapshot(page);assert.equal(state.campaign.batches[1].remaining,quantity-1);assert.equal(state.campaign.batches[1].id,batchId);assert.equal(state.coins,coins);
    await page.click('#start-button');await page.click('#batch-1');await page.click('[data-customer-id="3"]');
    for(let served=2;served<=quantity;served++) {
      await page.click('#deliver-drink');state=await snapshot(page);
      assert.equal(state.totalServed,served);
      if(served<quantity) {
        assert.equal(state.selectedCustomerId,4);assert.equal(await page.locator('#batch-1').getAttribute('aria-pressed'),'true');
        assert.equal(state.campaign.batches[1].remaining,quantity-served);
      }
    }
    assert.equal(state.campaign.batches.length,1);assert.equal(state.campaign.batches[0].id,1);assert.equal(state.campaign.batches[0].remaining,1);
    assert.equal(state.customers.find(c=>c.id===2).phase,'waiting');
    await page.click('#discard-drink');assert.equal((await snapshot(page)).campaign.batches.length,0);
    await page.context().close();console.log('PASS multi-cup preparation, exact matching, selected batch, reload and depletion',quantity);
  }

  const campaign=rules.createCampaign({batches:[{id:1,drink:'lime',ice:'normal',sugar:'normal',remaining:3,elapsed:6,duration:5.25}]});
  page=await open(base({dayNumber:1,levelElapsed:179.8,campaign,customers:[customer(1,{drink:'lime',ice:'normal',sugar:'normal'})]}));
  await page.click('#start-button');
  await page.waitForFunction(()=>window.__planBGame.getSnapshot().campaign.closing);
  assert.equal((await snapshot(page)).levelComplete,false);
  await page.click('#deliver-drink');
  await page.waitForFunction(()=>window.__planBGame.getSnapshot().levelComplete);
  state=await snapshot(page);assert.equal(state.totalServed,1);assert.equal(state.campaign.batches.length,0);
  await page.click('#start-button');state=await snapshot(page);assert.equal(state.dayNumber,2);assert.equal(state.campaign.closing,false);
  await page.context().close();console.log('PASS closing drains accepted orders and next day resets');

  for(let day=2;day<=5;day++) {
    page=await open(base({dayNumber:day,levelElapsed:179.9,levelServed:rules.chapter(day).target,customers:[],campaign:rules.createCampaign({bestStreak:3})}));
    await page.click('#start-button');await page.waitForFunction(()=>window.__planBGame.getSnapshot().levelComplete);
    state=await snapshot(page);assert.equal(state.campaign.stars[day-1],3);assert.equal(state.coins,55);
    await page.reload();await page.waitForFunction(()=>window.__planBGame);
    assert.equal((await snapshot(page)).coins,55);
    await page.click('#start-button');assert.equal((await snapshot(page)).dayNumber,day+1);
    if(day===2) {
      await page.waitForFunction(()=>window.__planBGame.getSnapshot().customers.length>0);
      assert.equal((await snapshot(page)).customers[0].order.regularId,'lan');
    }
    await page.context().close();
  }
  page=await open(base({dayNumber:4,nextWeatherRollIn:.2,customers:[]}));
  await page.click('#start-button');await page.waitForFunction(()=>window.__planBGame.getSnapshot().weatherState==='rain');
  await page.click('#settings-button');
  await page.click('#upgrade-umbrella');assert.equal((await snapshot(page)).umbrellaOwned,true);
  await page.context().close();console.log('PASS five-day progression, single bonuses, regular arrival and forecast rain');

  for(const viewport of [{width:1280,height:950},{width:390,height:844}]) {
    page=await open(base({dayNumber:3,customers:[customer(1,{...rules.recipe(rules.REGULARS.lan),regularId:'lan'}),customer(2,{drink:'coffee',ice:'normal',sugar:'less'})]}),viewport,true);
    await page.click('#start-button');await choose(page,'lime','less');await page.click('#prepare-drink');
    await page.waitForFunction(()=>!document.querySelector('#deliver-drink').disabled);
    await page.evaluate(()=>{document.querySelector('#deliver-drink').click();document.querySelector('#pause-button').click();});
    await page.waitForFunction(()=>window.__planBGame.getSnapshot().renderer.cups===1);
    state=await snapshot(page);assert.equal(state.campaign.relationships.lan,1);assert.equal(state.renderer.cups,1);
    assert.equal(state.layout.length,3);assert.equal(state.renderer.assetKit,'blender-v1');
    const pixels=await page.evaluate(()=>{
      const source=document.querySelector('#game-canvas-3d'),canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
      const ctx=canvas.getContext('2d');ctx.drawImage(source,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,colors=new Set();
      for(let i=0;i<data.length;i+=400)colors.add(`${data[i]},${data[i+1]},${data[i+2]}`);return colors.size;
    });
    assert.ok(pixels>20);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:`test-results/story-${viewport.width}.png`,fullPage:true,style:'#title-overlay {visibility:hidden!important}'});
    await page.reload();await page.waitForFunction(()=>window.__planBGame);
    assert.equal((await snapshot(page)).campaign.relationships.lan,1);
    await page.context().close();console.log('PASS story 3D visual and regular persistence',viewport.width,pixels);
  }
  assert.deepEqual(errors,[]);console.log('STORY_TESTS_PASSED');
} finally {await browser?.close();server.kill();}
