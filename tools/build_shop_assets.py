"""Rebuild the original shop kit with Blender 4.5 in background mode."""
import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'client/public/assets/3d'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, roughness=0.5, metal=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metal
    return mat

steel = material('Brushed steel', (.38,.43,.46), .27, .82)
rim = material('Polished rim', (.72,.77,.8), .17, .9)
rubber = material('Rubber feet', (.025,.032,.035), .9)
wood = material('Honey timber', (.32,.16,.075), .48)
grain = material('Timber seams', (.095,.045,.025), .7)
teal = material('Enamel teal', (.035,.29,.25), .32, .15)
canvas = material('Awning green', (.045,.23,.18), .92)
cream = material('Awning stripe', (.83,.85,.74), .92)
clay = material('Glazed ceramic', (.16,.24,.27), .23)
leaf = material('Leaves', (.075,.24,.08), .72)
leaf_light = material('Leaf tips', (.19,.38,.12), .66)
soil = material('Potting soil', (.04,.027,.015), 1)
skin = material('Skin', (.64,.36,.22), .68)
shirt = material('Shirt', (.045,.26,.32), .82)
trousers = material('Trousers', (.075,.105,.15), .92)
hair = material('Hair', (.035,.02,.014), .94)
white = material('Porcelain', (.91,.92,.85), .22)
eye = material('Eyes', (.012,.009,.008), .36)
tea = material('Tea', (.27,.09,.02), .19)
glass = material('Glass', (.8,.94,.93), .12)
glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value = .7
glass.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value = 1.45

timber = bpy.data.images.new('Original timber grain', width=256, height=256)
pixels = []
for y in range(256):
    for x in range(256):
        streak = math.sin(y*.53 + math.sin(x*.035)*1.8)*.035
        fine = math.sin(y*3.7 + x*.13)*.018
        pixels.extend((.47+streak+fine,.29+streak+fine,.15+streak,1))
timber.pixels.foreach_set(pixels)
timber.pack()
texture = wood.node_tree.nodes.new('ShaderNodeTexImage')
texture.image = timber
wood.node_tree.links.new(texture.outputs['Color'], wood.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

# Author in game coordinates (Y up). The glTF exporter maps Blender Z up back to Y.
def xyz(pos):
    x,y,z = pos
    return x,-z,y

def group(name, parent=None, pos=(0,0,0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.location = xyz(pos)
    return obj

def finish(obj, name, parent, pos, mat):
    obj.name = name
    obj.parent = parent
    obj.location = xyz(pos)
    obj.data.materials.append(mat)
    return obj

def box(name, parent, size, pos, mat, bevel=.015):
    bpy.ops.mesh.primitive_cube_add()
    obj = bpy.context.object
    obj.dimensions = (size[0],size[2],size[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new('Soft manufactured edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod = obj.modifiers.new('Weighted corner normals', 'WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(obj,name,parent,pos,mat)

def sphere(name, parent, scale, pos, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10)
    obj = bpy.context.object
    obj.scale = (scale[0],scale[2],scale[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for poly in obj.data.polygons: poly.use_smooth=True
    return finish(obj,name,parent,pos,mat)

def cylinder(name, parent, radius, height, pos, mat, top=None):
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=radius, radius2=radius if top is None else top, depth=height)
    obj=bpy.context.object
    for poly in obj.data.polygons: poly.use_smooth=len(poly.vertices)==4
    return finish(obj,name,parent,pos,mat)

def torus(name, parent, radius, tube, pos, mat):
    bpy.ops.mesh.primitive_torus_add(major_segments=24,minor_segments=6,major_radius=radius,minor_radius=tube)
    obj=bpy.context.object
    for poly in obj.data.polygons: poly.use_smooth=True
    return finish(obj,name,parent,pos,mat)

table=group('Table')
box('TableTop',table,(1.12,.075,.66),(0,.67,0),wood,.025)
for z in [-.16,0,.16]: box('Board joint',table,(1.065,.002,.005),(0,.709,z),grain,.001)
for x in [-.46,.46]:
    for z in [-.23,.23]:
        cylinder('Tubular table leg',table,.021,.61,(x,.32,z),steel)
        cylinder('Foot cap',table,.025,.035,(x,.026,z),rubber)
box('Table brace',table,(.94,.035,.035),(0,.24,0),steel,.01)
for x in [-.36,.36]:
    for z in [-.23,.23]: cylinder('Recessed screw',table,.007,.002,(x,.709,z),rim)
cylinder('Condiment caddy',table,.055,.08,(.4,.751,0),teal)
for x in [.375,.395,.415]: cylinder('Bamboo stirrer',table,.004,.12,(x,.82,0),wood)

stool=group('Stool')
box('Rounded plastic seat',stool,(.33,.065,.34),(0,.29,0),teal,.027)
for x in [-.11,.11]:
    for z in [-.115,.115]:
        cylinder('Stool leg',stool,.018,.255,(x,.145,z),steel)
        cylinder('Stool rubber cap',stool,.022,.025,(x,.017,z),rubber)
for x in [-.11,.11]: box('Stool cross rail',stool,(.018,.018,.23),(x,.11,0),steel,.005)

stall=group('Stall')
box('Enamel cart',stall,(1.6,.72,1.0),(0,.4,0),teal,.045)
box('Steel countertop',stall,(1.8,.075,1.16),(0,.8,0),steel,.025)
for x in [-.72,.72]:
    for z in [-.4,.4]: sphere('Cart wheel',stall,(.08,.08,.03),(x,.09,z),rubber)
for x in [-.85,.85]: cylinder('Awning support',stall,.027,1.92,(x,.98,-.5),steel)
for i in range(10):
    x=-.945+i*.21
    box('Canvas canopy stripe',stall,(.21,.06,1.45),(x,2.05,-.05),canvas if i%2 else cream,.012)
    box('Scalloped valance',stall,(.21,.15,.025),(x,1.98,.67),canvas if i%2 else cream,.035)
for x in [-.55,-.25]:
    cylinder('Tea canister',stall,.11,.25,(x,.962,-.15),steel)
    torus('Canister lid',stall,.11,.012,(x,1.09,-.15),rim)
    sphere('Lid handle',stall,(.035,.023,.035),(x,1.115,-.15),rubber)
box('Preparation board',stall,(.45,.025,.32),(.38,.85,.1),wood,.01)
for x in [.23,.35,.47]: cylinder('Clean glass',stall,.039,.115,(x,.92,.12),glass)
box('Menu sign panel',stall,(.8,.28,.03),(0,1.55,-.49),cream,.015)

planter=group('Planter')
cylinder('Tapered ceramic pot',planter,.19,.36,(0,.19,0),clay,.235)
torus('Pot rolled rim',planter,.235,.018,(0,.37,0),clay)
cylinder('Soil surface',planter,.215,.02,(0,.35,0),soil)
for i in range(9):
    angle=i*2.399
    x,z=math.cos(angle)*.13,math.sin(angle)*.13
    cylinder('Stem',planter,.007,.39,(x,.53,z),leaf)
    obj=sphere('Pointed foliage',planter,(.075,.22,.03),(x*1.6,.7+(i%3)*.06,z*1.6),leaf if i%2 else leaf_light)
    obj.rotation_euler.y=math.sin(angle)*.55
    obj.rotation_euler.z=angle

drink=group('Drink')
cylinder('Tapered glass',drink,.044,.135,(0,0,0),glass,.057)
cylinder('Amber tea surface',drink,.049,.006,(0,.047,0),tea)
cylinder('Tea volume',drink,.041,.10,(0,-.007,0),tea)
torus('Glass rim',drink,.056,.004,(0,.068,0),rim)
for x,z in [(-.018,0),(.018,.015),(0,-.021)]:
    box('Ice cube',drink,(.027,.02,.026),(x,.056,z),white,.004)
cylinder('Straw',drink,.004,.17,(.029,.072,-.01),cream)

person=group('Customer')
sphere('Tailored torso',person,(.157,.195,.09),(0,.59,0),shirt)
box('Shirt placket',person,(.017,.25,.011),(0,.6,.085),shirt,.005)
for y in [.5,.56,.62,.68]: sphere('Button',person,(.006,.006,.003),(0,y,.097),white)
cylinder('Neck',person,.047,.07,(0,.805,0),skin)
sphere('Head',person,(.105,.137,.098),(0,.93,0),skin)
sphere('Hair cap',person,(.11,.073,.10),(0,1.018,-.012),hair)
for x in [-.045,.045]:
    sphere('Eye white',person,(.016,.01,.006),(x,.95,.09),white)
    sphere('Pupil',person,(.006,.007,.004),(x,.95,.096),eye)
    box('Eyebrow',person,(.031,.006,.006),(x,.972,.092),hair,.002)
    sphere('Ear',person,(.02,.032,.019),(x*2.4,.934,0),skin)
sphere('Nose',person,(.016,.025,.022),(0,.925,.10),skin)
box('Mouth',person,(.034,.004,.003),(0,.888,.092),hair,.002)
for side,x in [('Left',-.09),('Right',.09)]:
    leg=group(side+'Leg',person,(x,.41,0))
    sphere('Trouser thigh',leg,(.058,.105,.061),(0,-.08,0),trousers)
    knee=group(side+'Knee',leg,(0,-.16,0))
    sphere('Trouser shin',knee,(.047,.125,.049),(0,-.115,0),trousers)
    box('Shoe sole',knee,(.105,.023,.17),(0,-.237,.033),rubber,.01)
    sphere('Leather shoe',knee,(.052,.038,.077),(0,-.215,.035),rubber)
for side,x in [('Left',-.18),('Right',.18)]:
    arm=group(side+'Arm',person,(x,.735,0))
    sphere('Sleeve',arm,(.065,.082,.067),(0,-.047,0),shirt)
    sphere('Forearm',arm,(.035,.105,.038),(0,-.184,0),skin)
    sphere('Hand',arm,(.037,.045,.027),(0,-.282,.006),skin)

# Batch static pieces by material within each articulation node, not across joints.
for parent in [obj for obj in bpy.data.objects if obj.type == 'EMPTY']:
    buckets = {}
    for child in list(parent.children):
        if child.type == 'MESH':
            buckets.setdefault(child.active_material.name, []).append(child)
    for items in buckets.values():
        if len(items) < 2: continue
        bpy.ops.object.select_all(action='DESELECT')
        for obj in items: obj.select_set(True)
        bpy.context.view_layer.objects.active = next((obj for obj in items if obj.name == 'TableTop'), items[0])
        bpy.ops.object.join()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'shop-kit.blend'))
for name in ['Table','TableTop','Stool','Stall','Planter','Drink','Customer','LeftLeg','RightLeg','LeftArm','RightArm','LeftKnee','RightKnee']:
    assert bpy.data.objects.get(name), 'Missing runtime node: ' + name
bpy.ops.export_scene.gltf(filepath=str(OUT/'shop-kit.glb'),export_format='GLB',export_yup=True,export_apply=True)
print('SHOP_KIT_BUILT', (OUT/'shop-kit.glb').stat().st_size)
