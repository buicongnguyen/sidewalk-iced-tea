import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
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
    await page.close();
  }
} finally {
  await browser?.close();
  server.kill();
}
