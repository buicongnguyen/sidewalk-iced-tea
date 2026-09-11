import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createCampaign} from './campaign.mjs';

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
  const bootContext=await browser.newContext({serviceWorkers:'block'});
  await bootContext.addInitScript(()=>localStorage.setItem('sidewalk-iced-tea:save-backup:story',JSON.stringify({coins:17,saveRevision:99})));
  const bootPage=await bootContext.newPage();
  let releaseAsset;
  const assetGate=new Promise(resolve=>{releaseAsset=resolve;});
  await bootPage.route('**/bg-room.png',async route=>{await assetGate;await route.continue();});
  await bootPage.goto(url+'/?view=2d',{waitUntil:'domcontentloaded'});
  try {
    assert.equal(await bootPage.locator('#settings-button').isDisabled(),true);
    assert.equal(await bootPage.locator('#start-button').isDisabled(),true);
    await bootPage.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
    assert.equal(await bootPage.evaluate(()=>JSON.parse(localStorage.getItem('sidewalk-iced-tea:save-backup:story')).coins),17);
  } finally {releaseAsset();}
  await bootPage.waitForFunction(()=>window.__planBGame);
  assert.equal(await bootPage.evaluate(()=>window.__planBGame.getSnapshot().coins),17);
  await bootContext.close();
  console.log('PASS startup controls and lifecycle events preserve the existing save');
  const sizes=[[320,568],[360,640],[390,844],[430,932],[844,390],[568,320],[1280,900]];
  for(const [width,height] of sizes) {
    const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});
    await context.addInitScript(campaign=>{
      const types=['asian_woman_mint','man','woman','old_man','young_boy','young_girl'];
      const tables=[[360,190],[640,190],[500,350]];
      const customers=types.map((type,index)=>({id:index+1,type,tableId:`table-story-${Math.floor(index/2)}`,seatIndex:index%2,
        phase:'waiting',x:tables[Math.floor(index/2)][0]+(index%2?94:38),y:tables[Math.floor(index/2)][1]+88,
        waitElapsed:0,order:{drink:'coffee',ice:'less',sugar:'less'}}));
      localStorage.setItem('sidewalk-iced-tea:save-backup:story',JSON.stringify({coins:24680,dayNumber:3,nextCustomerId:7,spawnTimer:999,customers,campaign}));
    },createCampaign({extraSlot:true,batches:[{id:1,drink:'coffee',ice:'less',sugar:'less',elapsed:5,duration:5},{id:2,drink:'lime',ice:'normal',sugar:'normal',elapsed:1,duration:3.5}]}));
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url+'/?view=2d');await page.waitForFunction(()=>window.__planBGame);
    await page.click('#start-button');
    await page.click('#pause-button');
    const measure=await page.evaluate(()=>{
      const bounds=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
      const selectors=['.game-header','#chapter-band','.playfield-frame','#story-panel','#open-preparation','#deliver-drink','#settings-button'];
      const clipping=[...document.querySelectorAll('.game-header .status-chip,.batch-slot')].filter(el=>el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1).map(el=>el.id||el.className);
      return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,rects:Object.fromEntries(selectors.map(s=>[s,bounds(s)])),clipping};
    });
    assert.ok(measure.scrollWidth<=width,JSON.stringify(measure));
    assert.ok(measure.scrollHeight<=height,JSON.stringify(measure));
    assert.deepEqual(measure.clipping,[],JSON.stringify(measure));
    for(const [selector,rect] of Object.entries(measure.rects))assert.ok(rect.x>=0&&rect.y>=0&&rect.right<=width+1&&rect.bottom<=height+1,selector+JSON.stringify(measure));
    const frame=measure.rects['.playfield-frame'],panel=measure.rects['#story-panel'];
    assert.ok(frame.height/height>=(width<height?(height>=800?.70:.60):.60),'play area share '+JSON.stringify(measure));
    assert.ok(frame.right<=panel.x+1||frame.bottom<=panel.y+1,'scene must not overlap controls');
    await page.screenshot({path:`test-results/mobile-${width}x${height}.png`,fullPage:true,style:'#title-overlay {visibility:hidden!important}'});
    await page.click('#settings-button');
    assert.equal(await page.locator('#settings-dialog').isVisible(),true);
    const dialog=await page.locator('#settings-dialog').boundingBox();
    assert.ok(dialog.x>=0&&dialog.y>=0&&dialog.x+dialog.width<=width+1&&dialog.y+dialog.height<=height+1);
    await page.screenshot({path:`test-results/settings-${width}x${height}.png`,fullPage:true});
    for(let tab=0;tab<8;tab++) {
      await page.keyboard.press('Tab');
      // Native dialogs may yield focus to browser chrome, but never background controls.
      assert.equal(await page.evaluate(()=>document.activeElement===document.body||Boolean(document.activeElement.closest('#settings-dialog'))),true);
    }
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!window.__planBGame.getSnapshot().settingsOpen);
    assert.equal(await page.evaluate(()=>window.__planBGame.getSnapshot().mode),'paused');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'settings-button');
    await page.click('#pause-button');
    await page.click('#settings-button');
    const frozen=await page.evaluate(()=>window.__planBGame.getSnapshot());
    await page.waitForTimeout(250);
    const after=await page.evaluate(()=>window.__planBGame.getSnapshot());
    assert.equal(after.levelElapsed,frozen.levelElapsed);
    assert.deepEqual(after.customers,frozen.customers);
    assert.deepEqual(after.campaign.batches,frozen.campaign.batches);
    await page.click('#close-settings');
    await page.waitForFunction(t=>window.__planBGame.getSnapshot().levelElapsed>t,frozen.levelElapsed);
    console.log('PASS viewport, clipping, settings, focus and timer freeze',width,height);
    await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.addInitScript(()=>localStorage.setItem('sidewalk-iced-tea:save-backup:story',JSON.stringify({dayNumber:3,spawnTimer:999,nextCustomerId:3,customers:[
    {id:1,type:'man',tableId:'table-story-0',seatIndex:0,phase:'waiting',x:398,y:278,order:{drink:'tea',ice:'normal',sugar:'normal'}},
    {id:2,type:'woman',tableId:'table-story-2',seatIndex:0,phase:'waiting',x:538,y:438,order:{drink:'lime',ice:'normal',sugar:'normal'}},
  ]})));
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url);await page.waitForFunction(()=>window.__planBGame?.getSnapshot().view==='3d');
  await page.click('#start-button');await page.click('#pause-button');
  const frozen=await page.evaluate(()=>window.__planBGame.getSnapshot().customers);
  for(const [width,height] of [[390,844],[320,568],[844,390],[430,932]]) {
    await page.setViewportSize({width,height});
    await page.waitForFunction(()=>{
      const rect=document.querySelector('#game-canvas-3d').getBoundingClientRect();
      const frame=document.querySelector('.playfield-frame').getBoundingClientRect();
      const viewport=window.__planBGame.getSnapshot().renderer.viewport;
      return viewport.width===Math.round(rect.width)&&viewport.height===Math.round(rect.height)&&Math.abs(rect.width-frame.width)<1&&Math.abs(rect.height-frame.height)<1;
    });
    const check=await page.evaluate(()=>{
      const state=window.__planBGame.getSnapshot(),c=document.querySelector('#game-canvas-3d'),rect=c.getBoundingClientRect(),frame=c.parentElement.getBoundingClientRect();
      const copy=document.createElement('canvas');copy.width=c.width;copy.height=c.height;
      const ctx=copy.getContext('2d');ctx.drawImage(c,0,0);const data=ctx.getImageData(0,0,copy.width,copy.height).data,colors=new Set();
      for(let i=0;i<data.length;i+=400)colors.add(`${data[i]},${data[i+1]},${data[i+2]}`);
      return {colors:colors.size,points:state.layout.map(t=>window.__planBGame.tablePoint(t.id)),customers:state.customers,kit:state.renderer.assetKit,fill:Math.abs(rect.width-frame.width)<1&&Math.abs(rect.height-frame.height)<1,overflow:document.documentElement.scrollHeight>innerHeight||document.documentElement.scrollWidth>innerWidth};
    });
    assert.ok(check.fill&&!check.overflow&&check.colors>20,JSON.stringify(check));
    assert.equal(check.kit,'blender-v1');assert.deepEqual(check.customers,frozen);
    for(const point of check.points)assert.ok(point.x>0&&point.x<960&&point.y>0&&point.y<540,JSON.stringify(point));
    await page.screenshot({path:`test-results/mobile-3d-${width}x${height}.png`,style:'#title-overlay,#toast {visibility:hidden!important}'});
    console.log('PASS full-frame 3D resize, visible tables and unchanged game state',width,height);
  }
  await page.click('#pause-button');
  const point=await page.evaluate(()=>window.__planBGame.tablePoint('table-story-2'));
  const rect=await page.locator('#game-canvas-3d').boundingBox();
  await page.mouse.click(rect.x+point.x/960*rect.width,rect.y+point.y/540*rect.height);
  assert.equal(await page.evaluate(()=>window.__planBGame.getSnapshot().selectedCustomerId),2);
  await context.close();
  assert.deepEqual(errors,[]);
  console.log('MOBILE_TESTS_PASSED');
} finally {await browser?.close();server.kill();}
