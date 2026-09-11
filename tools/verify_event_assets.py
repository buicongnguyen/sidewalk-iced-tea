"""Reopen the Blender source and reimport the exported kit independently."""
from pathlib import Path
import bpy

root=Path(__file__).resolve().parents[1]/'client/public/assets/3d'
required=['Car','Scooter','Dog','Cat','Girl','Visitor','PhoneGuest','Argument','Parcel','Musician','Umbrella','Chess']
bpy.ops.wm.open_mainfile(filepath=str(root/'events-kit.blend'))
for name in required:
    obj=bpy.data.objects.get(name)
    assert obj and obj.type=='EMPTY', name
    assert any(c.type=='MESH' for c in obj.children_recursive), name+' empty'
    assert (root/'events'/(name+'.png')).stat().st_size>3000, name+' portrait'
for name in ['Dog','Cat']:
    for i in range(4):
        leg=bpy.data.objects.get(name+'Leg'+str(i))
        assert leg and leg.parent.name==name, 'leg joint hierarchy'
for name in ['Jewel','BottleCap','Chew']:assert bpy.data.objects.get(name), name
for name in ['CatCap','DogChew']:assert (root/'events'/(name+'.png')).stat().st_size>3000, name
for obj in list(bpy.data.objects):bpy.data.objects.remove(obj,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=str(root/'events-kit.glb'))
for name in required:assert bpy.data.objects.get(name), 'GLB root '+name
meshes=[o for o in bpy.data.objects if o.type=='MESH']
assert all(len(o.data.vertices)>0 for o in meshes)
assert (root/'events-kit.glb').stat().st_size<6000000
print('EVENT_ASSETS_VERIFIED',len(meshes),'meshes',sum(len(o.data.polygons) for o in meshes),'faces')
