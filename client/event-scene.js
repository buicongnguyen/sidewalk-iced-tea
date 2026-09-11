import {EVENTS} from './event-data.mjs';

// These props are presentation only and never take part in table picking.
export function createEventScene(THREE,scene,kit,modelScale=1) {
  const stage=new THREE.Group();stage.name='StreetEncounter';scene.add(stage);
  stage.scale.setScalar(modelScale);
  let token=null,asset=null,figures=[],motion=0;
  function clear() {stage.clear();figures=[];}
  function add(name) {
    const source=kit.getObjectByName(name);
    if(!source)throw new Error(`Missing event asset: ${name}`);
    const object=source.clone(true),joints=[];
    object.traverse(o=>{
      if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}
      if(/^(Dog|Cat)(Leg|Tail|Head)|^(Left|Right)Arm/.test(o.name))joints.push({object:o,rotation:o.rotation.clone()});
    });
    stage.add(object);figures.push({object,joints});return object;
  }
  return {
    update(street,clock,portrait) {
      const active=street?.active;
      if(active?.token!==token) {
        clear();token=active?.token;asset=EVENTS[active?.id]?.asset||null;
        if(asset){add(asset);if(asset==='Scooter')add(asset);}
      }
      if(!asset)return;
      motion=clock/1000;
      // The front sidewalk stays clear of the customer aisle and table seats.
      stage.position.set(portrait?-.35:-1.65,-.02,portrait?3.7:2.2);
      if(asset==='Car')stage.position.set(portrait?1.0:1.2,-.075,-3.65);
      if(asset==='Scooter')stage.position.set(portrait?.1:0,-.075,-3.65);
      figures.forEach(({object,joints},index)=>{
        if(asset==='Scooter') {
          const path=portrait?2.8:6.2;
          object.position.set(((motion*1.5+index*path/2)%path)-path/2,0,index*.32);
          object.rotation.y=Math.PI/2;
          object.traverse(o=>{if(o.name.startsWith('BikeWheel'))o.rotation.x=motion*7;});
        } else if(asset==='Dog'||asset==='Cat') {
          const turn=motion*.45;
          const alert=active.id==='alert-dog';
          const radiusX=portrait?1.1:1.5,radiusZ=.28;
          object.position.set(Math.sin(turn)*(alert?.03:radiusX),0,alert?0:Math.cos(turn)*radiusZ);
          object.rotation.y=alert?.6:Math.atan2(Math.cos(turn)*radiusX,-Math.sin(turn)*radiusZ);
          for(const {object:o,rotation} of joints) {
            o.rotation.copy(rotation);
            if(o.name.includes('Leg'))o.rotation.x+=Math.sin(motion*7+Number(o.name.slice(-1))*Math.PI/2)*.25;
            if(o.name.includes('Tail')) {o.rotation.y+=Math.sin(motion*9)*(alert?.05:.4);if(alert)o.rotation.x=2.2;}
            if(o.name.includes('Head'))o.rotation.y+=Math.sin(motion*1.5)*.13;
          }
          object.getObjectByName('Chew')?.traverse(o=>{o.visible=active.id==='friendly-dog'&&active.phase==='result'&&active.choice==='chew';});
          if(asset==='Cat') {
            object.getObjectByName('Jewel').visible=active.variant===0;
            object.getObjectByName('BottleCap').visible=active.variant===1;
          }
        } else if(asset==='Umbrella')object.rotation.z=Math.sin(motion*4)*.09;
        else for(const {object:o,rotation} of joints) {o.rotation.copy(rotation);o.rotation.x+=Math.sin(motion*2+index)*.08;}
      });
    },
    diagnostics(camera){
      let bounds=null,worldBounds=null;
      if(figures.length) {
        const box=new THREE.Box3().setFromObject(stage),points=[];
        worldBounds={min:box.min.toArray(),max:box.max.toArray()};
        for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));
        bounds={left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.max(...points.map(p=>p.y)),bottom:Math.min(...points.map(p=>p.y))};
      }
      return {asset,instances:figures.length,motion,bounds,worldBounds,modelScale,kit:'blender-events-v1'};
    },
  };
}
