export const DRINKS = Object.freeze(Object.assign(Object.create(null),{
  tea: {name:'Trà đá', seconds:2, price:2, day:1, color:'#ba7937'},
  lime: {name:'Trà tắc', seconds:3.5, price:3, day:1, color:'#dfb432'},
  coffee: {name:'Cà phê sữa', seconds:5, price:4, day:3, color:'#794933'},
}));
export const CHAPTERS = [
  {title:'Quán nhỏ mở cửa', target:6, intro:'Một chiếc bàn sạch, bình trà mới và buổi sáng đầu tiên. Hôm nay quán có trà đá và trà tắc.', ending:'Những vị khách đầu tiên đã biết đến quán nhỏ của bạn.'},
  {title:'Mỗi người một vị', target:8, intro:'Khách bắt đầu gọi ít đá. Bạn có thể dành tiền mở thêm một chỗ pha, hoặc nâng cấp tốc độ.', ending:'Quán đã có những ly nước được pha theo ý khách.'},
  {title:'Một vị khách quen', target:9, intro:'Cô Lan ghé quán trước khi mở tiệm hoa. Cô thích trà tắc ít đá. Cà phê sữa cũng có mặt trong thực đơn hôm nay.', ending:'Cô Lan: “Mai cô lại ghé nhé. Quán mình dễ thương quá!”'},
  {title:'Một cơn mưa chiều', target:9, intro:'Dự báo có mưa sau khoảng một phút. Minh ghé quán trước chuyến giao hàng, gọi cà phê sữa ít ngọt.', ending:'Một chỗ ngồi khô ráo và ly nước đúng vị làm ngày mưa ấm hơn.'},
  {title:'Góc phố thân quen', target:12, intro:'Hôm nay cả góc phố hẹn nhau ghé quán. Cô Lan và Minh sẽ trở lại. Chuẩn bị cho một buổi trưa đông vui!', ending:'Từ một quán nhỏ, bạn đã tạo ra một nơi để mọi người gặp nhau. Ngày mai, câu chuyện vẫn tiếp tục.'},
];
export const REGULARS = Object.freeze(Object.assign(Object.create(null),{
  lan: {name:'Cô Lan', type:'asian_woman_mint', drink:'lime', ice:'less', sugar:'normal'},
  minh: {name:'Minh', type:'man_helmet_black', drink:'coffee', ice:'normal', sugar:'less'},
}));
export const chapter = day => CHAPTERS[Math.min(4,Math.max(0,Math.floor(day)-1))];
const number = (value, fallback, min=0, max=1e6) => Number.isFinite(value) ? Math.max(min,Math.min(max,value)) : fallback;
export function createCampaign(saved={}) {
  saved=saved&&typeof saved==='object'?saved:{};
  const state = {
    seed:number(saved.seed,314159,0,0xffffffff)>>>0,
    batches:[], nextBatchId:Math.floor(number(saved.nextBatchId,1,1)),
    extraSlot:Boolean(saved.extraSlot), streak:Math.floor(number(saved.streak,0)),
    bestStreak:Math.floor(number(saved.bestStreak,0)), mistakes:Math.floor(number(saved.mistakes,0)),
    orderCount:Math.floor(number(saved.orderCount,0)), closing:Boolean(saved.closing),
    relationships:{lan:Math.floor(number(saved.relationships?.lan,0)),minh:Math.floor(number(saved.relationships?.minh,0))},
    visited:[...new Set((Array.isArray(saved.visited)?saved.visited:[]).filter(id=>REGULARS[id]))],
    stars:(Array.isArray(saved.stars)?saved.stars:[]).slice(0,5).map(value=>Math.floor(number(value,0,0,3))),
  };
  const ids=new Set();
  for(const batch of Array.isArray(saved.batches)?saved.batches:[]) {
    if(!batch || typeof batch!=='object')continue;
    if(!DRINKS[batch.drink] || !Number.isInteger(batch.id) || batch.id<1 || ids.has(batch.id))continue;
    ids.add(batch.id);
    state.batches.push({...recipe(batch),id:batch.id,elapsed:number(batch.elapsed,0,0,10),duration:number(batch.duration,DRINKS[batch.drink].seconds,.5,10)});
  }
  state.batches=state.batches.slice(0,capacity(state));
  state.nextBatchId=Math.max(state.nextBatchId,...state.batches.map(b=>b.id+1));
  return state;
}
export function random(state) {
  state.seed=(Math.imul(state.seed,1664525)+1013904223)>>>0;
  return state.seed/4294967296;
}
export function recipe(value={}) {
  value=value&&typeof value==='object'?value:{};
  return {drink:DRINKS[value.drink]?value.drink:'tea',ice:value.ice==='less'?'less':'normal',sugar:value.sugar==='less'?'less':'normal'};
}
export function orderText(order) {
  return `${order.regularId?REGULARS[order.regularId].name+': ':''}Cho ${order.regularId==='lan'?'cô':'mình'} một ly ${DRINKS[order.drink].name.toLowerCase()}${order.ice==='less'?', ít đá':''}${order.sugar==='less'?', ít ngọt':''} nhé.`;
}
export function makeOrder(state,day) {
  const index=state.orderCount++;
  const regularId=day>=3&&index===0?(day===4?'minh':'lan'):day>=5&&index===6?'minh':null;
  const drinks=Object.keys(DRINKS).filter(id=>DRINKS[id].day<=day);
  const order=regularId ? {...recipe(REGULARS[regularId]),regularId} : {
    drink:drinks[Math.floor(random(state)*drinks.length)],
    ice:day>=2&&random(state)<.35?'less':'normal',
    sugar:day>=3&&random(state)<.3?'less':'normal',regularId:null,
  };
  if(order.drink==='tea')order.sugar='normal';
  return order;
}
export const capacity = state => state.extraSlot?2:1;
export const ready = batch => batch.elapsed>=batch.duration;
export const matches = (a,b) => ['drink','ice','sugar'].every(key=>a[key]===b[key]);
export function prepare(state,value,day,fast=false) {
  if(!DRINKS[value.drink] || DRINKS[value.drink].day>day || state.batches.length>=capacity(state))return null;
  const item=recipe(value);
  if(item.drink==='tea'&&item.sugar!=='normal')return null;
  if(day<2&&item.ice!=='normal' || day<3&&item.sugar!=='normal')return null;
  const batch={...item,id:state.nextBatchId++,elapsed:0,duration:DRINKS[item.drink].seconds*(fast?.65:1)};
  state.batches.push(batch);return batch;
}
export function advancePreparation(state,seconds) {
  const completed=[];
  for(const batch of state.batches) {
    const wasReady=ready(batch);
    batch.elapsed=Math.min(batch.duration,batch.elapsed+Math.max(0,seconds));
    if(!wasReady&&ready(batch))completed.push(batch);
  }
  return completed;
}
export function deliver(state,customer,batchId) {
  const index=state.batches.findIndex(batch=>batch.id===batchId);
  const batch=state.batches[index];
  if(!customer || customer.phase!=='waiting' || customer.rewardGranted || !customer.order || !batch || !ready(batch))return 'unavailable';
  if(!matches(batch,customer.order)) {
    if(!customer.rejectedBatches?.includes(batch.id)) {
      customer.rejectedBatches=[...(customer.rejectedBatches||[]),batch.id];
      state.mistakes++;state.streak=0;
    }
    return 'wrong';
  }
  state.batches.splice(index,1);
  // Consume the cup and lock the customer before any UI event can deliver twice.
  customer.phase='being_served';customer.serveElapsed=0;
  state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);
  const id=customer.order.regularId;
  if(id && REGULARS[id] && !state.visited.includes(id)) {state.relationships[id]++;state.visited.push(id);}
  return 'served';
}
export function dayStars(state,served,missed,day) {
  if(served===0)return 0;
  return 1+Number(served>=chapter(day).target)+Number(served>=chapter(day).target&&missed===0&&state.mistakes===0&&state.bestStreak>=3);
}
export function resetDay(state) {
  state.batches=[];state.streak=0;state.bestStreak=0;state.mistakes=0;state.orderCount=0;state.closing=false;state.visited=[];
}
