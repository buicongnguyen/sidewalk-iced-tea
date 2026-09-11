import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const server = spawn(process.execPath, ['server.js'], {env: {...process.env, PORT:'0'}, stdio:['ignore','pipe','inherit']});
let browser;
try {
  const url = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server timeout')), 12000);
    server.stdout.on('data', data => {
      const match = String(data).match(/http:\/\/\S+/);
      if (match) { clearTimeout(timer); resolve(match[0]); }
    });
  });
  browser = await chromium.launch({headless:true});
  for (const viewport of [{width:1280,height:900},{width:390,height:844}]) {
    const page = await browser.newPage({viewport});
    const errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    await page.goto(url);
    await page.click('#start-button');
    await page.waitForFunction(()=>window.__planBGame.getSnapshot().customers.some(c=>c.phase==='waiting'));
    await page.screenshot({path:`test-results/scene-${viewport.width}.png`,fullPage:true});
    const check=await page.evaluate(()=>{
      const canvas=document.querySelector('canvas');
      const pixels=canvas.getContext('2d').getImageData(0,0,960,540).data;
      const colors=new Set();
      for(let i=0;i<pixels.length;i+=400) colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);
      return {colors:colors.size,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    if(check.colors<20 || check.overflow || errors.length) throw new Error(JSON.stringify({check,errors}));
    console.log(JSON.stringify({viewport, ...check,errors}));
    await page.selectOption('#view-mode','3d');
    await page.waitForFunction(()=>window.__planBGame.getSnapshot().view==='3d');
    await page.waitForTimeout(150);
    const before=await page.evaluate(()=>window.__planBGame.getSnapshot());
    assert.equal(before.renderer.people,before.customers.length);
    assert.equal(before.renderer.cups,before.customers.filter(c=>c.phase==='enjoying').length);
    const target=before.customers.find(c=>c.phase==='waiting');
    assert.ok(target);
    const point=await page.evaluate(id=>window.__planBGame.tablePoint(id),target.tableId);
    const bounds=await page.locator('#game-canvas-3d').boundingBox();
    await page.mouse.click(bounds.x+point.x/960*bounds.width,bounds.y+point.y/540*bounds.height);
    await page.waitForFunction(id=>window.__planBGame.getSnapshot().customers.some(c=>c.id===id&&c.phase==='enjoying'),target.id);
    await page.screenshot({path:`test-results/scene-3d-playing-${viewport.width}.png`,fullPage:true});
    await page.click('#pause-button');
    const served=await page.evaluate(()=>window.__planBGame.getSnapshot());
    assert.ok(served.renderer.cups>0);
    const nonblank=await page.evaluate(()=>{
      const c=document.querySelector('#game-canvas-3d');
      const copy=document.createElement('canvas');copy.width=c.width;copy.height=c.height;
      const context=copy.getContext('2d');context.drawImage(c,0,0);
      const data=context.getImageData(0,0,copy.width,copy.height).data;
      const colors=new Set();for(let i=0;i<data.length;i+=400)colors.add(`${data[i]},${data[i+1]},${data[i+2]}`);
      return colors.size;
    });
    assert.ok(nonblank>20);
    if(viewport.width===1280) {
      const glb=await page.evaluate(async()=>Array.from(new Uint8Array(await window.__planBGame.exportGLB())));
      const bytes=Buffer.from(glb);assert.equal(bytes.toString('ascii',0,4),'glTF');
      await writeFile('test-results/shop-prototype.glb',bytes);
    }
    await page.screenshot({path:`test-results/scene-3d-${viewport.width}.png`,fullPage:true});
    await page.waitForTimeout(250);
    await page.selectOption('#view-mode','2d');
    const after=await page.evaluate(()=>window.__planBGame.getSnapshot());
    assert.equal(after.levelElapsed,served.levelElapsed);
    assert.deepEqual(after.customers,served.customers);
    assert.equal(after.coins,served.coins);
    assert.deepEqual(errors,[]);
    const contract=await page.evaluate(async()=>{
      const {createScene3D}=await import('./scene3d.js');
      const canvas=document.createElement('canvas');
      const state=window.__planBGame.getSnapshot();
      const scene=createScene3D(canvas,state.layout,()=>{},()=>{},18);
      const sample=structuredClone(state.customers[0]);
      const frames=[];
      for(const phase of ['walking_to_table','waiting','being_served','enjoying','walking_out']) {
        state.customers=[{...sample,phase,rainUmbrella:true}];state.weatherState='rain';
        const before=JSON.stringify(state);
        scene.render(state,1000,true);const first=canvas.toDataURL();
        scene.render(state,1300,true);const second=canvas.toDataURL();
        scene.render(state,1600,false);const paused=canvas.toDataURL();
        frames.push({phase,cups:scene.diagnostics().cups,moving:first!==second,paused:second===paused,unchanged:before===JSON.stringify(state)});
      }
      return frames;
    });
    for(const frame of contract) {
      assert.equal(frame.cups,frame.phase==='enjoying'?1:0);
      assert.ok(frame.moving && frame.paused && frame.unchanged);
    }
    await page.selectOption('#view-mode','3d');
    await page.waitForFunction(()=>window.__planBGame.getSnapshot().view==='3d');
    await page.evaluate(()=>document.querySelector('#game-canvas-3d').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(()=>window.__planBGame.getSnapshot().view==='2d');
    assert.equal(await page.locator('#game-canvas').isVisible(),true);
    console.log(JSON.stringify({view:'3d',viewport,nonblank,renderer:served.renderer,errors}));
    await page.close();
  }
} finally {
  await browser?.close();
  server.kill();
}
