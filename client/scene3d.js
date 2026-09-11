import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { DRINKS } from './campaign.mjs';
import { createEventScene } from './event-scene.js';

let kitPromise;
let eventKitPromise;

// Rendering consumes snapshots. It never advances simulation or grants rewards.
export async function createScene3D(canvas, layout, onTable, onFailure, maxWaitSeconds) {
  kitPromise ??= new GLTFLoader().loadAsync(new URL('./public/assets/3d/shop-kit.glb', import.meta.url).href)
    .catch(error => { kitPromise = null; throw error; });
  const kit = (await kitPromise).scene;
  const storyView=layout[0]?.id.startsWith('table-story-');
  if(storyView)eventKitPromise??=new GLTFLoader().loadAsync(new URL('./public/assets/3d/events-kit.glb',import.meta.url).href)
    .catch(error=>{eventKitPromise=null;throw error;});
  const eventKit=storyView?(await eventKitPromise).scene:null;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(960, 540, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#a9d8dc');
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(environment, .04).texture;
  scene.environmentIntensity = .45;
  environment.dispose();
  pmrem.dispose();
  const camera = new THREE.OrthographicCamera(-6.8,6.8,3.825,-3.825,0.1,60);
  camera.position.set(0,7.8,9);
  camera.lookAt(0,.25,0);
  const ambient = new THREE.HemisphereLight(0xc7e6ff,0x66705a,.9);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff,2.5);
  sun.position.set(-3,8,4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-7,right:7,top:6,bottom:-6,near:.1,far:24});
  sun.shadow.normalBias = .025;
  sun.shadow.bias = -.0001;
  scene.add(sun);
  const materials = new Map();
  const box = new THREE.BoxGeometry(1,1,1);
  const ball = new THREE.SphereGeometry(1,20,14);
  const headband = new THREE.TorusGeometry(.106,.012,6,24);
  const cylinder = new THREE.CylinderGeometry(1,1,1,20);
  function material(color) {
    if (!materials.has(color)) materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.85}));
    return materials.get(color);
  }
  function mesh(parent, geometry, color, size, position) {
    const item = new THREE.Mesh(geometry,material(color));
    item.castShadow = true; item.receiveShadow = true;
    item.scale.set(...size); item.position.set(...position); parent.add(item); return item;
  }
  let portrait=false;
  const world = (x,y)=>new THREE.Vector3((x-480)/90*(portrait?.75:1),0,(y-270)/90*(portrait?1.4:1));
  const staticFurniture=[];
  function asset(name,parent,position=[0,0,0]) {
    const source=kit.getObjectByName(name);
    if(!source)throw new Error(`Missing Blender asset: ${name}`);
    const object=source.clone(true);
    object.position.set(...position);
    object.traverse(item=>{if(item.isMesh){item.castShadow=true;item.receiveShadow=true;}});
    parent.add(object);
    if(['Table','Stool','Planter'].includes(name))staticFurniture.push(object);
    return object;
  }
  const ground=mesh(scene,box,'#b0b5b3',[10.8,.16,6.1],[0,-.1,0]);
  const bitmap=document.createElement('canvas');bitmap.width=512;bitmap.height=512;
  const paint=bitmap.getContext('2d');
  paint.fillStyle='#a1aaa8';paint.fillRect(0,0,512,512);
  let seed=17;
  for(let i=0;i<16000;i++) {
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%512;
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%512;
    paint.fillStyle=i%2?'#b5bab3':'#8d9999';paint.fillRect(x,y,1,1);
  }
  paint.strokeStyle='#747f80';paint.lineWidth=3;
  for(let y=0;y<=512;y+=128){paint.beginPath();paint.moveTo(0,y);paint.lineTo(512,y);paint.stroke();}
  for(let row=0;row<4;row++)for(let x=(row%2)*64;x<=512;x+=128){paint.beginPath();paint.moveTo(x,row*128);paint.lineTo(x,row*128+128);paint.stroke();}
  const paving=new THREE.CanvasTexture(bitmap);paving.wrapS=paving.wrapT=THREE.RepeatWrapping;
  paving.repeat.set(3,2);paving.colorSpace=THREE.SRGBColorSpace;
  ground.material=new THREE.MeshStandardMaterial({map:paving,roughness:.92,bumpMap:paving,bumpScale:.025});
  if(!storyView)mesh(scene,box,'#75818a',[10.8,.1,.8],[0,-.12,-3.5]);
  if(storyView) {
    mesh(scene,box,'#626c72',[10.8,.1,1.9],[0,-.12,-3.65]);
    for(let x=-4.5;x<5;x+=1.5)mesh(scene,box,'#e6e2c9',[.65,.006,.035],[x,-.06,-4.2]);
  }
  const streetScene=eventKit?createEventScene(THREE,scene,eventKit):null;
  const stall=asset('Stall',scene,[-4.2,0,-1.7]);
  for(const x of [-5,5]) for(const z of [-2.6,2.6]) {
    asset('Planter',scene,[x,0,z]);
  }
  const tableMeshes=[];
  const tableGroups=new Map();
  const labelResources=[];
  function label(parent,text,x,y,z) {
    const bitmap=document.createElement('canvas'); bitmap.width=256; bitmap.height=64;
    const context=bitmap.getContext('2d');
    const texture=new THREE.CanvasTexture(bitmap);
    const mat=new THREE.SpriteMaterial({map:texture,depthTest:false});
    const sprite=new THREE.Sprite(mat); sprite.scale.set(1.3,.325,1); sprite.position.set(x,y,z); parent.add(sprite);
    let previous='';
    const update=value=>{
      if(value===previous)return;
      previous=value; context.clearRect(0,0,256,64); context.fillStyle='#fff9e9'; context.fillRect(0,0,256,64);
      context.fillStyle='#243c36'; context.font='bold 26px sans-serif'; context.textAlign='center';
      context.fillText(value,128,43,244); texture.needsUpdate=true;
    };
    update(text); labelResources.push({texture,mat}); return update;
  }
  const stallSign=new THREE.Group();scene.add(stallSign);
  label(stallSign,'TRÀ ĐÁ',0,1.35,.6);
  stallSign.position.copy(stall.position);
  for(const table of layout) {
    const group=new THREE.Group(); group.position.copy(world(table.x+table.width/2,table.y+45)); scene.add(group);
    const model=asset('Table',group);
    const top=model.getObjectByName('TableTop');top.userData.tableId=table.id;tableMeshes.push(top);
    for(const seat of table.seats) {
      const pos=world(seat.x,seat.y).sub(group.position);
      asset('Stool',group,[pos.x,0,pos.z]);
    }
    const updateLabel=label(group,`B${table.index+1}`,0,1.18,0);
    tableGroups.set(table.id,{group,top,updateLabel,index:table.index,layout:table});
  }
  const people=new Map();
  // Keep the table geometry for picking, but render shared furniture in batches.
  scene.updateMatrixWorld(true);
  const batches=new Map();
  for(const furniture of staticFurniture) furniture.traverse(item=>{
    if(!item.isMesh)return;
    const key=`${item.geometry.uuid}:${item.material.uuid}`;
    if(!batches.has(key))batches.set(key,[]);
    batches.get(key).push(item);
    item.visible=false;
  });
  for(const items of batches.values()) {
    const batch=new THREE.InstancedMesh(items[0].geometry,items[0].material,items.length);
    items.forEach((item,index)=>batch.setMatrixAt(index,item.matrixWorld));
    batch.castShadow=true;batch.receiveShadow=true;scene.add(batch);
  }
  function person(customer) {
    const root=asset('Customer',scene);
    let hash=0; for(const char of customer.type)hash=(hash*31+char.charCodeAt(0))>>>0;
    const colors=['#428e98','#cd607b','#7f995e','#dbb951','#805fa6','#d78862'];
    const skin=['#e0ad85','#f2c59e','#b98263'][hash%3];
    const hair=customer.type.includes('old')?'#c7c7c7':['#3c2c27','#624434','#222b32'][hash%3];
    root.traverse(item=>{
      if(!item.isMesh)return;
      const color={Shirt:colors[hash%6],Skin:skin,Hair:hair}[item.material.name];
      if(color)item.material=material(color);
    });
    if(/woman|girl/.test(customer.type))mesh(root,ball,hair,[.108,.13,.06],[0,.94,-.065]);
    if(customer.type.includes('helmet'))mesh(root,ball,['#252525','#eeeeee','#c84646','#477bb2'][hash%4],[.17,.13,.17],[0,1.03,0]);
    if(customer.type.includes('mask'))mesh(root,ball,['#eeeeee','#252525','#7fa589'][hash%3],[.085,.04,.025],[0,.895,.09]);
    if(customer.type.includes('hippie'))mesh(root,headband,'#e9c64e',[1,1,1],[0,1.01,0]).rotation.x=Math.PI/2;
    const leftLeg=root.getObjectByName('LeftLeg'),rightLeg=root.getObjectByName('RightLeg');
    const knees=[root.getObjectByName('LeftKnee'),root.getObjectByName('RightKnee')];
    const leftArm=root.getObjectByName('LeftArm'),rightArm=root.getObjectByName('RightArm');
    const cup=asset('Drink',rightArm,[0,-.3,.035]);
    const drink=customer.order?.drink||'tea';
    if(DRINKS[drink])cup.traverse(item=>{
      if(item.isMesh&&item.material.name==='Tea')item.material=material(DRINKS[drink].color);
    });
    if(drink==='lime')mesh(cup,ball,'#ec9f32',[.028,.028,.01],[.05,.065,0]);
    if(drink==='coffee')mesh(cup,cylinder,'#e8c79e',[.042,.025,.042],[0,-.042,0]);
    cup.visible=false;
    const umbrella=mesh(root,new THREE.ConeGeometry(.48,.2,12),'#379578',[1,1,1],[0,1.4,0]);
    umbrella.visible=false;
    people.set(customer.id,{root,leftLeg,rightLeg,knees,leftArm,rightArm,cup,umbrella});
    return people.get(customer.id);
  }
  const rainGeometry=new THREE.BufferGeometry();
  const drops=new Float32Array(180*3);
  for(let i=0;i<180;i++){drops[i*3]=(i*1.73%10)-5;drops[i*3+1]=i*.137%4;drops[i*3+2]=(i*.73%6)-3;}
  rainGeometry.setAttribute('position',new THREE.BufferAttribute(drops,3));
  const rainMaterial=new THREE.PointsMaterial({color:'#e2f5ff',size:.035});
  const rain=new THREE.Points(rainGeometry,rainMaterial);scene.add(rain);
  const raycaster=new THREE.Raycaster();
  function pointer(event) {
    const rect=canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);
    const hit=raycaster.intersectObjects(tableMeshes)[0];
    if(hit)onTable(hit.object.userData.tableId);
  }
  canvas.addEventListener('pointerdown',pointer);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();onFailure();});
  let clock=0;
  let previousTimestamp=null;
  let viewportWidth=0,viewportHeight=0;
  function resizeScene() {
    const rect=canvas.getBoundingClientRect();
    const width=Math.round(rect.width)||960,height=Math.round(rect.height)||540;
    if(width===viewportWidth&&height===viewportHeight)return;
    viewportWidth=width;viewportHeight=height;
    const scale=Math.min(1,960/Math.max(width,height));
    renderer.setSize(Math.round(width*scale),Math.round(height*scale),false);
    portrait=layout[0]?.id.startsWith('table-story-')&&width/height<1.3;
    const halfWidth=Math.max(portrait?2.9:6.8,storyView&&!portrait?width/height*3.9:0),focusX=portrait?.1:0;
    camera.left=-halfWidth;camera.right=halfWidth;
    camera.top=halfWidth*height/width;camera.bottom=-camera.top;
    camera.position.set(focusX,7.8,9);camera.lookAt(focusX,.25,0);
    camera.updateProjectionMatrix();
    // Keep the counter above the tables in portrait without moving gameplay seats.
    stall.position.set(portrait?-1.25:-4.2,0,portrait?-2.8:-1.7);
    stallSign.position.copy(stall.position);
    for(const record of tableGroups.values()) {
      const table=record.layout;
      record.group.position.copy(world(table.x+table.width/2,table.y+45));
      record.group.children.filter(o=>o.name==='Stool').forEach((stool,index)=>stool.position.copy(world(table.seats[index].x,table.seats[index].y).sub(record.group.position)));
    }
    scene.updateMatrixWorld(true);
    for(const batch of scene.children.filter(o=>o.isInstancedMesh)) {
      const items=batches.get(`${batch.geometry.uuid}:${batch.material.uuid}`);
      items.forEach((item,index)=>batch.setMatrixAt(index,item.matrixWorld));
      batch.instanceMatrix.needsUpdate=true;
      batch.computeBoundingSphere();
    }
    ground.scale.z=portrait?10.5:6.1;
    ground.position.z=(ground.scale.z-6.1)/2;
    paving.repeat.y=ground.scale.z/6.1*2;
  }
  return {
    render(state, timestamp, playing) {
      resizeScene();
      if(playing && previousTimestamp!==null)clock+=Math.max(0,Math.min(100,timestamp-previousTimestamp));
      previousTimestamp=timestamp;
      streetScene?.update(state.street,clock,portrait);
      scene.background.set(state.timeOfDay==='evening'?'#92859c':'#a9d8dc');
      sun.color.set(state.timeOfDay==='evening'?'#ffd0a1':'#fff5e0');
      sun.intensity=state.timeOfDay==='evening'?1.4:2.5;
      const active=new Set(state.customers.map(c=>c.id));
      for(const [id,figure] of people) if(!active.has(id)) {scene.remove(figure.root);figure.umbrella.geometry.dispose();people.delete(id);}
      for(const customer of state.customers) {
        const figure=people.get(customer.id)||person(customer);
        figure.root.position.copy(world(customer.x,customer.y));
        const walking=['walking_to_table','walking_out'].includes(customer.phase);
        const step=walking?Math.sin(clock/130+String(customer.id).length)*.6:0;
        figure.leftLeg.rotation.x=step; figure.rightLeg.rotation.x=-step;
        figure.knees.forEach(knee=>knee.rotation.x=walking?0:Math.PI/2);
        if(!walking) {
          figure.root.position.y=-.13;
          figure.leftLeg.rotation.x=figure.rightLeg.rotation.x=-Math.PI/2;
        }
        figure.leftArm.rotation.x=-step;figure.rightArm.rotation.x=step;
        figure.cup.visible=customer.phase==='enjoying';
        figure.umbrella.visible=customer.rainUmbrella&&state.weatherState==='rain';
        if(figure.cup.visible)figure.rightArm.rotation.x=-1.1+Math.sin(clock/650)*.12;
        const target=customer.waypoints?.[0];
        figure.root.rotation.y=walking&&target?Math.atan2(target.x-customer.x,target.y-customer.y):Math.PI;
      }
      for(const table of state.tables) {
        const record=tableGroups.get(table.id);
        const customers=state.customers.filter(c=>c.tableId===table.id&&c.phase==='waiting');
        const seconds=customers.length?Math.ceil(maxWaitSeconds-Math.max(...customers.map(c=>c.waitElapsed))):null;
        record.updateLabel(`B${record.index+1}${seconds===null?'':` · ${Math.max(0,seconds)}s`}`);
        // Keep authored timber visible; urgency belongs in the table label.
      }
      rain.visible=state.weatherState==='rain';
      ground.material.roughness=rain.visible?.35:.92;
      if(rain.visible) {
        for(let i=0;i<180;i++)drops[i*3+1]=4-((clock/600+i*.137)%4);
        rainGeometry.attributes.position.needsUpdate=true;
      }
      renderer.render(scene,camera);
    },
    tablePoint(id) {
      const record=tableGroups.get(id); const vector=record.group.position.clone();vector.y=.7;vector.project(camera);
      return {x:(vector.x+1)*480,y:(1-vector.y)*270};
    },
    setZoom(value) { camera.zoom=THREE.MathUtils.clamp(Number(value)||1,1,1.8);camera.updateProjectionMatrix(); },
    async exportGLB() {
      const {GLTFExporter}=await import('./vendor/GLTFExporter.js');
      const model=new THREE.Group();
      for(const child of scene.children) {
        if(!child.isMesh && !child.isGroup)continue;
        const clone=child.clone(true);
        const labels=[];clone.traverse(item=>{if(item.isSprite)labels.push(item);});
        labels.forEach(item=>item.removeFromParent());model.add(clone);
      }
      return new GLTFExporter().parseAsync(model,{binary:true});
    },
    diagnostics(){return {assetKit:'blender-v1',street:streetScene?.diagnostics(camera),viewport:{width:viewportWidth,height:viewportHeight,portrait},calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,people:people.size,cups:[...people.values()].filter(p=>p.cup.visible).length};},
  };
}
