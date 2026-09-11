import {EVENTS,EVENT_IDS,PORTRAITS,variantValue} from './event-data.mjs';
export {EVENTS,EVENT_IDS,PORTRAITS,variantValue};
const integer=(v,f=0,max=1000000)=>Number.isFinite(v)?Math.min(max,Math.max(0,Math.floor(v))):f;
const validNode=(id,node)=>EVENTS[id]&&Object.hasOwn(EVENTS[id].nodes,node)?EVENTS[id].nodes[node]:null;
const validRef=r=>r&&validNode(r.id,r.node)?.choices.find(c=>c.id===r.choice);
const outcome=r=>variantValue(validRef(r)?.outcome,r?.variant||0);
export function createStreet(saved={}) {
  saved=saved&&typeof saved==='object'?saved:{};
  const state={seed:integer(saved.seed,81931,0xffffffff),day:integer(saved.day),slots:integer(saved.slots,0,2),serial:integer(saved.serial),
    trust:Math.max(-10,Math.min(10,Number.isFinite(saved.trust)?Math.floor(saved.trust):0)),
    history:(Array.isArray(saved.history)?saved.history:[]).filter(r=>EVENTS[r?.id]).slice(-24).map(r=>({id:r.id,day:integer(r.day),choice:String(r.choice||'ignored').slice(0,30)})),
    pending:(Array.isArray(saved.pending)?saved.pending:[]).filter(r=>outcome(r)?.later).slice(-8).map(r=>({id:r.id,node:r.node,choice:r.choice,variant:integer(r.variant,0,1),due:integer(r.due)})),
    modifier:{value:[.8,1.15].includes(saved.modifier?.value)?saved.modifier.value:1,left:Math.min(45,Math.max(0,Number(saved.modifier?.left)||0))},active:null};
  const a=saved.active;
  if(a&&validNode(a.id,a.node)&&typeof a.token==='string') {
    const result=a.phase==='result'&&validRef(a)&&outcome(a);
    // Outcome text/effects are looked up from authored content, never from save data.
    state.active={id:a.id,node:a.node,token:a.token.slice(0,80),variant:integer(a.variant,0,1),expires:integer(a.expires,170,180),
      phase:result?'result':'choice',choice:result?a.choice:null,followup:Boolean(result&&a.followup&&outcome(a).later),
      deltaCoins:result&&Number.isFinite(a.deltaCoins)?Math.max(-20,Math.min(20,a.deltaCoins)):null,
      deltaTrust:result&&Number.isFinite(a.deltaTrust)?Math.max(-20,Math.min(20,a.deltaTrust)):null};
  }
  state.pending=state.pending.filter((r,index,all)=>all.findIndex(other=>other.id===r.id&&other.choice===r.choice&&other.due===r.due)===index);
  return state;
}
function random(s) {s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function remember(shop,choice) {
  const s=shop.street,a=s.active;
  s.history.push({id:a.id,day:shop.dayNumber,choice});s.history=s.history.slice(-24);
}
function apply(shop,effect) {
  const s=shop.street;
  shop.coins=Math.max(0,shop.coins+(effect.coins||0));
  shop.levelCoinsEarned+=(Math.max(0,effect.coins||0));
  s.trust=Math.max(-10,Math.min(10,s.trust+(effect.trust||0)));
  if(effect.traffic&&effect.traffic!==1)s.modifier={value:effect.traffic,left:45};
}
export function startEvent(shop,id) {
  const s=shop.street;
  if(s.active||!EVENTS[id]||shop.levelComplete||shop.campaign?.closing)return false;
  s.active={id,node:'start',token:`${shop.dayNumber}:${++s.serial}`,variant:random(s)<.5?0:1,expires:Math.min(175,shop.levelElapsed+45),phase:'choice',choice:null,followup:false,deltaCoins:null,deltaTrust:null};
  return true;
}
export function tickStreet(shop,dt) {
  const s=shop.street;
  if(!s||shop.levelComplete)return false;
  if(s.day!==shop.dayNumber){s.day=shop.dayNumber;s.slots=0;s.active=null;s.modifier={value:1,left:0};}
  s.modifier.left=Math.max(0,s.modifier.left-dt);
  if(!s.modifier.left)s.modifier.value=1;
  let changed=false;
  if(s.active&&shop.levelElapsed>=s.active.expires) {
    if(s.active.phase==='choice')remember(shop,'ignored');
    s.active=null;changed=true;
  }
  if(s.active||shop.campaign?.closing)return changed;
  const due=s.pending.findIndex(r=>r.due<=shop.dayNumber);
  if(due>=0&&shop.levelElapsed>=8&&shop.levelElapsed<150) {
    const r=s.pending.splice(due,1)[0];
    const before=shop.coins,trust=s.trust;
    apply(shop,outcome(r).later);
    s.active={id:r.id,node:r.node,choice:r.choice,variant:r.variant,token:`${shop.dayNumber}:${++s.serial}`,expires:Math.min(175,shop.levelElapsed+40),phase:'result',followup:true,deltaCoins:shop.coins-before,deltaTrust:s.trust-trust};
    return true;
  }
  const times=shop.dayNumber===1?[32]:[32,112];
  if(s.slots<times.length&&shop.levelElapsed>=times[s.slots]&&shop.levelElapsed<155) {
    const recent=new Set(s.history.slice(-4).map(r=>r.id));
    const eligible=EVENT_IDS.filter(id=>EVENTS[id].day<=shop.dayNumber&&!s.history.some(r=>r.day===shop.dayNumber&&r.id===id));
    const fresh=eligible.filter(id=>!recent.has(id));
    const pool=fresh.length?fresh:eligible;
    s.slots++;
    if(pool.length)startEvent(shop,pool[Math.floor(random(s)*pool.length)]);
    return true;
  }
  return changed;
}
export function chooseEvent(shop,token,nodeId,choiceId) {
  const s=shop.street,a=s?.active;
  if(!a||a.phase!=='choice'||a.token!==token||a.node!==nodeId)return false;
  const choice=EVENTS[a.id].nodes[a.node].choices.find(c=>c.id===choiceId);
  if(!choice||shop.coins<choice.cost)return false;
  if(choice.next){a.node=choice.next;return true;}
  const effect=variantValue(choice.outcome,a.variant);
  if(!effect)return false;
  const before=shop.coins,trust=s.trust;
  shop.coins-=choice.cost;
  apply(shop,effect);
  a.phase='result';a.choice=choice.id;a.deltaCoins=shop.coins-before;a.deltaTrust=s.trust-trust;
  remember(shop,choice.id);
  if(effect.later)s.pending.push({id:a.id,node:a.node,choice:a.choice,variant:a.variant,due:shop.dayNumber+1});
  s.pending=s.pending.slice(-8);
  return true;
}
export function dismissEvent(shop,token) {
  if(shop.street?.active?.token!==token)return false;
  if(shop.street.active.phase==='choice')remember(shop,'ignored');
  shop.street.active=null;return true;
}
export function presentation(s) {
  const a=s?.active;if(!a)return null;
  const event=EVENTS[a.id],n=event.nodes[a.node];
  const effect=a.phase==='result'?(a.followup?outcome(a)?.later:outcome(a)):null;
  const portrait=event.asset==='Cat'&&a.variant===1?'CatCap':a.id==='friendly-dog'&&a.phase==='result'&&a.choice==='chew'?'DogChew':event.asset;
  return {title:a.followup?'Chuyện hôm qua':event.title,asset:event.asset,portrait,text:effect?.text||variantValue(n.text,a.variant),
    choices:a.phase==='choice'?n.choices:[],effect:effect?{...effect,coins:a.deltaCoins??effect.coins,trust:a.deltaTrust??effect.trust}:null};
}
