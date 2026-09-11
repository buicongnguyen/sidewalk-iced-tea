import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createCampaign} from './campaign.mjs';
import {createStreet,startEvent,EVENTS,PORTRAITS} from './events.mjs';

const server=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','inherit']});
let browser;
try {
  const url=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('server timeout')),12000);
    server.stdout.on('data',data=>{const match=String(data).match(/http:\/\/\S+/);if(match){clearTimeout(timer);resolve(match[0]);}});
  });
  browser=await chromium.launch({headless:true});
  await mkdir('test-results',{recursive:true});
  const errors=[];
  const snap=page=>page.evaluate(()=>window.__planBGame.getSnapshot());
  async function open(id,viewport={width:390,height:844},three=true,coins=30,overrides={}) {
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    const save={dayNumber:5,levelElapsed:40,coins,levelCoinsEarned:0,nextWeatherRollIn:999,spawnTimer:999,customers:[],campaign:createCampaign(),street:createStreet({day:5,slots:1})};
    Object.assign(save,overrides);
    if(id){startEvent(save,id);save.street.active.variant=0;}
    await context.addInitScript(value=>{
      if(sessionStorage.getItem('event-seeded'))return;
      sessionStorage.setItem('event-seeded','1');
      localStorage.setItem('sidewalk-iced-tea:save-backup:story',JSON.stringify(value));
    },save);
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+(three?'':'/?view=2d'));
    await page.waitForFunction(()=>window.__planBGame);
    if(three)await page.waitForFunction(()=>window.__planBGame.getSnapshot().view==='3d');
    await page.click('#start-button');return page;
  }
  const imagePage=await browser.newPage({viewport:{width:1200,height:970}});
  const assets=PORTRAITS;
  await imagePage.goto(url+'/?view=2d');
  await imagePage.setContent(`<body style="margin:0;background:#e9f1ee;font:16px sans-serif"><main style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px">${assets.map(a=>`<figure style="margin:0;text-align:center"><img src="${url}/public/assets/3d/events/${a}.png" style="width:100%;height:260px;object-fit:contain"><figcaption>${a}</figcaption></figure>`).join('')}</main></body>`);
  await imagePage.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
  await imagePage.screenshot({path:'test-results/event-art-contact.png',fullPage:true});await imagePage.close();
  for(const id of ['fight','racing','parking','girl','payment','meal','alert-dog','cat','music','parcel','umbrella','chess']) {
    const page=await open(id);
    await page.waitForFunction(()=>window.__planBGame.getSnapshot().renderer.street.asset);
    let state=await snap(page),d=state.renderer.street;
    assert.equal(d.asset,EVENTS[id].asset);
    assert.ok(d.bounds.left>-1&&d.bounds.right<1&&d.bounds.top<1&&d.bounds.bottom>-1,id+JSON.stringify(d.bounds));
    await page.screenshot({path:`test-results/event-3d-${id}.png`});
    if(['racing','cat','alert-dog','fight','umbrella'].includes(id)) {
      const before=await page.locator('#game-canvas-3d').screenshot();
      await page.waitForTimeout(380);
      const after=await page.locator('#game-canvas-3d').screenshot();
      assert.ok(!before.equals(after),'visible animation '+id);
    }
    await page.click('#street-event');
    state=await snap(page);assert.equal(state.eventOpen,true);
    await page.waitForTimeout(220);
    assert.equal((await snap(page)).levelElapsed,state.levelElapsed);
    assert.equal((await snap(page)).renderer.street.motion,state.renderer.street.motion);
    assert.equal(await page.locator('#event-portrait').evaluate(i=>i.complete&&i.naturalWidth>0),true);
    await page.screenshot({path:`test-results/event-dialog-${id}.png`});
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!window.__planBGame.getSnapshot().eventOpen);
    await page.waitForFunction(t=>window.__planBGame.getSnapshot().levelElapsed>t,state.levelElapsed);
    await page.context().close();
    console.log('PASS rendered asset, framing, animation and paused event dialog',id);
  }
  for(const [width,height] of [[320,568],[844,390],[568,320]]) {
    const page=await open('fight',{width,height});
    await page.click('#street-event');
    const dialog=await page.locator('#event-dialog').boundingBox();
    assert.ok(dialog.x>=0&&dialog.y>=0&&dialog.x+dialog.width<=width+1&&dialog.y+dialog.height<=height+1);
    await page.locator('[data-choice="police"]').click();
    assert.equal((await snap(page)).street.trust,2);
    await page.click('#event-continue');
    await page.click('#open-preparation');
    await page.locator('.recipe-picker label:has(input[value="tea"])').click();
    const drawer=await page.locator('#preparation-dialog').boundingBox();
    assert.ok(drawer.y>=0&&drawer.y+drawer.height<=height+1);
    await page.screenshot({path:`test-results/preparation-${width}x${height}.png`});
    await page.click('#prepare-drink');assert.equal(await page.locator('#preparation-dialog').isVisible(),false);
    await page.waitForFunction(()=>window.__planBGame.getSnapshot().campaign.batches[0]?.elapsed>=2);
    await page.context().close();console.log('PASS narrow/landscape choices and preparation drawer',width,height);
  }
  let page=await open('friendly-dog',{width:390,height:844},false,0);
  await page.click('#street-event');assert.equal(await page.locator('[data-choice="chew"]').isDisabled(),true);
  await page.click('[data-choice="owner"]');assert.equal((await snap(page)).street.trust,2);
  await page.click('#event-continue');assert.equal((await snap(page)).street.active,null);await page.context().close();
  page=await open('cat',{width:390,height:844},false);
  await page.click('#street-event');await page.click('[data-choice="inspect"]');
  await page.reload();await page.waitForFunction(()=>window.__planBGame);await page.click('#start-button');
  await page.click('#street-event');assert.equal((await snap(page)).street.active.node,'shiny');
  await page.click('[data-choice="return"]');
  const resolved=await snap(page);assert.equal(resolved.street.pending.length,1);
  await page.reload();await page.waitForFunction(()=>window.__planBGame);await page.click('#start-button');await page.click('#street-event');
  assert.equal((await snap(page)).street.active.phase,'result');assert.equal((await snap(page)).street.trust,resolved.street.trust);
  assert.equal((await snap(page)).street.pending.length,1);await page.click('#event-continue');
  await page.context().close();
  page=await open(null,{width:390,height:844},false,30,{...resolved,levelComplete:true,levelElapsed:180,street:{...resolved.street,active:null}});
  await page.waitForFunction(()=>window.__planBGame.getSnapshot().street.active?.followup);
  assert.equal((await snap(page)).dayNumber,6);
  assert.equal((await snap(page)).coins,resolved.coins+5);
  await page.reload();await page.waitForFunction(()=>window.__planBGame);await page.click('#start-button');
  assert.equal((await snap(page)).coins,resolved.coins+5);
  assert.equal((await snap(page)).street.pending.length,0);await page.context().close();
  page=await open(null,{width:390,height:844},false,30,{levelElapsed:31.9,street:createStreet({day:5})});
  await page.waitForFunction(()=>window.__planBGame.getSnapshot().street.active);
  assert.equal((await snap(page)).street.slots,1);await page.context().close();
  const variant=createStreet({day:5,slots:1});
  const sample={street:variant,dayNumber:5,levelElapsed:40};startEvent(sample,'cat');variant.active.variant=1;
  page=await open(null,{width:390,height:844},true,30,{street:variant});
  await page.click('#street-event');await page.click('[data-choice="inspect"]');
  assert.ok((await page.locator('#event-text').innerText()).includes('nắp chai'));
  assert.ok((await page.locator('#event-portrait').getAttribute('src')).endsWith('CatCap.png'));
  await page.context().close();
  assert.deepEqual(errors,[]);console.log('EVENT_BROWSER_TESTS_PASSED');
} finally {await browser?.close();server.kill();}
