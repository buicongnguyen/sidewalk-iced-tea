import * as THREE from './vendor/three.module.js';

// Rendering consumes snapshots. It never advances simulation or grants rewards.
export function createScene3D(canvas, layout, onTable, onFailure, maxWaitSeconds) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(960, 540, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#a9d8dc');
  const camera = new THREE.OrthographicCamera(-6.8,6.8,3.825,-3.825,0.1,60);
  camera.position.set(0,9,8);
  camera.lookAt(0,0,0);
  const ambient = new THREE.HemisphereLight(0xffffff,0x52694a,2.4);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff,2.5);
  sun.position.set(-3,8,4);
  scene.add(sun);
  const materials = new Map();
  const box = new THREE.BoxGeometry(1,1,1);
  const ball = new THREE.SphereGeometry(1,8,6);
  const cylinder = new THREE.CylinderGeometry(1,1,1,8);
  function material(color) {
    if (!materials.has(color)) materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.85}));
    return materials.get(color);
  }
  function mesh(parent, geometry, color, size, position) {
    const item = new THREE.Mesh(geometry,material(color));
    item.scale.set(...size); item.position.set(...position); parent.add(item); return item;
  }
  const world = (x,y)=>new THREE.Vector3((x-480)/90,0,(y-270)/90);
  mesh(scene,box,'#c9c8ba',[10.8,.16,6.1],[0,-.16,0]);
  mesh(scene,box,'#75818a',[10.8,.1,.8],[0,-.12,-3.5]);
  mesh(scene,box,'#c95152',[1.65,.8,1.1],[-4.2,.4,-1.7]);
  mesh(scene,box,'#eee5d3',[1.9,.12,1.3],[-4.2,.86,-1.7]);
  mesh(scene,box,'#388278',[2.1,.14,1.8],[-4.2,2.0,-1.7]);
  for(const x of [-5,-3.4]) mesh(scene,box,'#455354',[.06,2,.06],[x,1,-2.3]);
  for(const x of [-5,5]) for(const z of [-2.6,2.6]) {
    mesh(scene,cylinder,'#805b69',[.2,.35,.2],[x,.17,z]);
    mesh(scene,ball,'#3f855d',[.36,.48,.36],[x,.58,z]);
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
  label(scene,'TRÀ ĐÁ',-4.2,1.35,-1.1);
  for(const table of layout) {
    const group=new THREE.Group(); group.position.copy(world(table.x+table.width/2,table.y+45)); scene.add(group);
    const top=mesh(group,box,'#cc9363',[1.1,.12,.65],[0,.67,0]); top.userData.tableId=table.id; tableMeshes.push(top);
    mesh(group,box,'#535963',[.12,.64,.12],[0,.32,0]);
    for(const seat of table.seats) {
      const pos=world(seat.x,seat.y).sub(group.position);
      mesh(group,box,'#378d7e',[.3,.08,.32],[pos.x,.28,pos.z]);
      mesh(group,box,'#535963',[.09,.28,.09],[pos.x,.14,pos.z]);
    }
    const updateLabel=label(group,`B${table.index+1}`,0,1.18,0);
    tableGroups.set(table.id,{group,top,updateLabel,index:table.index});
  }
  const people=new Map();
  function person(customer) {
    const root=new THREE.Group(); scene.add(root);
    let hash=0; for(const char of customer.type)hash=(hash*31+char.charCodeAt(0))>>>0;
    const colors=['#428e98','#cd607b','#7f995e','#dbb951','#805fa6','#d78862'];
    const skin=['#e0ad85','#f2c59e','#b98263'][hash%3];
    const hair=customer.type.includes('old')?'#c7c7c7':['#3c2c27','#624434','#222b32'][hash%3];
    mesh(root,box,colors[hash%6],[.3,.36,.18],[0,.58,0]);
    mesh(root,ball,skin,[.14,.17,.13],[0,.91,0]);
    mesh(root,ball,hair,[.145,.09,.135],[0,1.02,-.02]);
    if(customer.type.includes('helmet'))mesh(root,ball,['#252525','#eeeeee','#c84646','#477bb2'][hash%4],[.17,.13,.17],[0,1.03,0]);
    if(customer.type.includes('mask'))mesh(root,box,['#eeeeee','#252525','#7fa589'][hash%3],[.19,.08,.025],[0,.86,.13]);
    if(customer.type.includes('hippie'))mesh(root,box,'#e9c64e',[.29,.035,.27],[0,.98,0]);
    const limb=(x,y,color,length)=>{
      const pivot=new THREE.Group();pivot.position.set(x,y,0);root.add(pivot);
      mesh(pivot,box,color,[.09,length,.1],[0,-length/2,0]);return pivot;
    };
    const leftLeg=limb(-.09,.41,'#364e68',.16),rightLeg=limb(.09,.41,'#364e68',.16);
    const knees=[leftLeg,rightLeg].map(leg=>{
      const knee=new THREE.Group();knee.position.y=-.16;leg.add(knee);
      mesh(knee,box,'#364e68',[.09,.25,.1],[0,-.125,0]);return knee;
    });
    const leftArm=limb(-.2,.74,skin,.3),rightArm=limb(.2,.74,skin,.3);
    const cup=mesh(rightArm,cylinder,'#d7964b',[.065,.13,.065],[0,-.3,.03]);
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
  return {
    render(state, timestamp, playing) {
      if(playing && previousTimestamp!==null)clock+=Math.max(0,Math.min(100,timestamp-previousTimestamp));
      previousTimestamp=timestamp;
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
        record.top.material=material(seconds===null?'#cc9363':seconds<6?'#d65c58':'#63ad8a');
      }
      rain.visible=state.weatherState==='rain';
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
    diagnostics(){return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,people:people.size,cups:[...people.values()].filter(p=>p.cup.visible).length};},
  };
}
