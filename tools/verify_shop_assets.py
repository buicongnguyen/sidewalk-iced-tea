"""Validate the saved Blender source and re-import the runtime kit."""
import bpy
from pathlib import Path

assets = Path(__file__).resolve().parents[1] / 'client/public/assets/3d'
required = ['Table', 'TableTop', 'Customer', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg', 'LeftKnee', 'RightKnee', 'Drink', 'Stool', 'Stall', 'Planter']
bpy.ops.wm.open_mainfile(filepath=str(assets / 'shop-kit.blend'))
assert all(bpy.data.objects.get(name) for name in required)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(assets / 'shop-kit.glb'))
assert all(bpy.data.objects.get(name) for name in required)
assert bpy.data.objects['LeftKnee'].parent.name == 'LeftLeg'
assert bpy.data.objects['RightKnee'].parent.name == 'RightLeg'
meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
assert meshes and all(len(obj.data.polygons) > 0 for obj in meshes)
print('BLENDER_ROUND_TRIP_OK', len(meshes), 'mesh groups')
