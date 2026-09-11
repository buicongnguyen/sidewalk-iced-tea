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
  async function open(state,viewport={width:1280,height:950},three=false) {
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
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
  async function choose(page,drink,ice='normal',sugar='normal') {
    await page.locator(`.recipe-picker label:has(input[value="${drink}"])`).click();
    if(await page.locator('#recipe-ice').isEnabled())await page.selectOption('#recipe-ice',ice);
    if(await page.locator('#recipe-sugar').isEnabled())await page.selectOption('#recipe-sugar',sugar);
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
  await page.click('#upgrade-slot');assert.equal((await snapshot(page)).campaign.extraSlot,true);
  await page.reload();await page.waitForFunction(()=>window.__planBGame);
  state=await snapshot(page);assert.equal(state.totalServed,1);assert.equal(state.campaign.extraSlot,true);
  await page.goto(url+'/?mode=classic');await page.waitForFunction(()=>window.__planBGame);
  assert.equal((await snapshot(page)).coins,777);await page.context().close();
  console.log('PASS recipe mismatch, remake, pause, delivery, upgrade, reload and Classic isolation');

  const campaign=rules.createCampaign({batches:[{id:1,drink:'lime',ice:'normal',sugar:'normal',elapsed:4,duration:3.5}]});
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
