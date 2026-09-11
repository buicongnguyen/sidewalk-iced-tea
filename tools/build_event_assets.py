"""Original street encounter kit, Blender 4.5. Game coordinates are Y-up."""
import math
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'client/public/assets/3d'
SPRITES = OUT / 'events'
SPRITES.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def xyz(p):
    return (p[0], -p[2], p[1])

def mat(name, color, rough=.5, metal=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    return m

red = mat('Cherry lacquer', (.62,.055,.08), .24,.3)
blue = mat('Sea enamel', (.035,.33,.4), .25,.25)
metal = mat('Machined aluminum', (.48,.54,.57), .22,.85)
black = mat('Tire rubber', (.018,.024,.028), .88)
glass = mat('Blue tinted automotive glass', (.055,.14,.18), .13,.35)
white = mat('Ivory fabric', (.88,.9,.86), .85)
lamp = mat('Headlamp lens', (.85,.95,.96), .13,.2)
amber = mat('Amber lamp', (.98,.43,.04), .25)
gold = mat('Gold jewelry', (.78,.5,.13), .17,.8)
gem = mat('Faceted jade', (.06,.72,.5), .12,.2)
fur = mat('Dog coat', (.5,.27,.13), .95)
cream = mat('Chest fur', (.89,.79,.59), .98)
catfur = mat('Cat gray', (.29,.35,.39), .95)
pink = mat('Inner ear', (.67,.34,.39), .88)
card = mat('Corrugated cardboard', (.53,.34,.16), .92)
tape = mat('Packing tape', (.78,.64,.38), .45)
wood = mat('Guitar walnut', (.22,.078,.024), .38)
cloth = mat('Umbrella red', (.64,.12,.2), .9)
shirt_red = mat('Cotton coral', (.58,.13,.18), .92)
shirt_blue = mat('Cotton teal', (.05,.3,.34), .92)
silver_hair = mat('Silver hair', (.55,.57,.56), .9)

def group(name, parent=None, pos=(0,0,0)):
    o = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(o)
    o.parent = parent
    o.location = xyz(pos)
    return o

def finish(o, name, parent, pos, material):
    o.name = name
    o.parent = parent
    o.location = xyz(pos)
    o.data.materials.append(material)
    return o

def box(name, parent, size, pos, material, bevel=.018):
    bpy.ops.mesh.primitive_cube_add()
    o = bpy.context.object
    o.dimensions = (size[0],size[2],size[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new('Edge highlights', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod = o.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,parent,pos,material)

def sphere(name,parent,size,pos,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12)
    o=bpy.context.object
    o.scale=(size[0],size[2],size[1])
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for p in o.data.polygons:p.use_smooth=True
    return finish(o,name,parent,pos,material)

def rod(name,parent,a,b,r,material):
    av,bv=Vector(xyz(a)),Vector(xyz(b))
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=r,depth=(bv-av).length)
    o=bpy.context.object
    finish(o,name,parent,tuple((Vector(a)+Vector(b))*.5),material)
    o.rotation_euler=(bv-av).to_track_quat('Z','Y').to_euler()
    for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
    return o

def ring(name,parent,r,t,pos,material,axis='y'):
    bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=8,major_radius=r,minor_radius=t)
    o=bpy.context.object
    if axis=='z':o.rotation_euler.x=math.pi/2
    if axis=='x':o.rotation_euler.y=math.pi/2
    for p in o.data.polygons:p.use_smooth=True
    return finish(o,name,parent,pos,material)

def descendants(root):
    return [root]+list(root.children_recursive)

# Reuse the existing authored human anatomy and joints, then dress each role.
with bpy.data.libraries.load(str(OUT/'shop-kit.blend'),link=False) as (source,target):
    target.objects=list(source.objects)
human=next(o for o in target.objects if o and o.name.startswith('Customer'))
def actor(name,parent=None,pos=(0,0,0),color=None,scale=1):
    mapping={}
    for source in descendants(human):
        o=source.copy()
        if source.data:o.data=source.data.copy()
        bpy.context.collection.objects.link(o)
        mapping[source]=o
    for source,o in mapping.items():
        o.parent=mapping.get(source.parent)
        if o.type=='MESH' and color:
            for slot in o.material_slots:
                if slot.material.name.startswith('Shirt'):slot.material=shirt_red if color==red else shirt_blue if color==blue else color
                if slot.material.name.startswith('Hair') and name=='Elder':slot.material=silver_hair
    root=mapping[human]
    root.name=name
    root.parent=parent
    root.location=xyz(pos)
    root.scale=(scale,)*3
    return root

car=group('Car')
box('Sculpted lower body',car,(2.35,.43,1.04),(0,.43,0),red,.12)
box('Cabin glass',car,(1.18,.4,.91),(-.12,.78,0),glass,.13)
box('Roof',car,(1.01,.065,.88),(-.12,1.00,0),red,.045)
for z in [-.46,.46]:
    for x in [-.57,.15,.43]:box('Window pillar',car,(.04,.32,.035),(x,.8,z),red,.01)
    for x in [-.37,.27]:box('Door handle',car,(.11,.018,.03),(x,.59,z*1.13),metal,.008)
    box('Door sill trim',car,(1.56,.035,.03),(0,.29,z*1.15),metal,.008)
    sphere('Wing mirror',car,(.10,.055,.07),(.4,.72,z*1.28),red)
    for x in [-.75,.72]:
        wheel=group('CarWheel',car,(x,.25,z*1.14))
        ring('Radial tire',wheel,.19,.065,(0,0,0),black,'z')
        ring('Rim lip',wheel,.135,.014,(0,0,z*.08),metal,'z')
        for i in range(8):
            a=i*math.tau/8
            rod('Alloy spoke',wheel,(0,0,z*.09),(.12*math.sin(a),.12*math.cos(a),z*.09),.012,metal)
        for i in range(24):
            a=i*math.tau/24
            tread=box('Tire siping',wheel,(.024,.014,.1),(.25*math.sin(a),.25*math.cos(a),0),black,.003)
            tread.rotation_euler.y=-a
for x in [-1.17,1.17]:
    box('Bumper',car,(.045,.065,.9),(x,.32,0),metal,.02)
    box('Number plate',car,(.014,.1,.25),(x*1.03,.41,0),white,.008)
    for z in [-.35,.35]:box('Lamp cluster',car,(.04,.10,.24),(x,.58,z),lamp if x>0 else red,.025)
box('Grille',car,(.03,.1,.43),(1.18,.49,0),black,.008)
for z in [-.16,-.08,0,.08,.16]:box('Grille slat',car,(.035,.08,.012),(1.197,.49,z),metal,.001)

scooter=group('Scooter')
for z in [-.53,.53]:
    wheel=group('BikeWheel',scooter,(0,.23,z))
    ring('Scooter tire',wheel,.18,.047,(0,0,0),black,'x')
    ring('Scooter rim',wheel,.13,.012,(.04,0,0),metal,'x')
    for i in range(12):
        a=i*math.tau/12
        rod('Wire spoke',wheel,(.045,0,0),(.045,.125*math.cos(a),.125*math.sin(a)),.006,metal)
box('Step through footboard',scooter,(.31,.08,.68),(0,.3,0),blue,.04)
sphere('Engine fairing',scooter,(.22,.23,.28),(0,.47,-.4),blue)
box('Stitched saddle',scooter,(.32,.10,.51),(0,.69,-.26),black,.05)
box('Leg shield',scooter,(.38,.42,.1),(0,.53,.31),blue,.06)
rod('Steering column',scooter,(0,.23,.53),(0,.93,.3),.034,metal)
rod('Handlebar',scooter,(-.29,.95,.33),(.29,.95,.33),.026,metal)
for x in [-.27,.27]:
    rod('Rubber grip',scooter,(x*.72,.95,.33),(x,.95,.33),.034,black)
    rod('Mirror stem',scooter,(x*.65,.97,.33),(x,1.15,.31),.008,metal)
    sphere('Mirror',scooter,(.069,.041,.016),(x,1.16,.32),glass)
sphere('Headlight',scooter,(.115,.08,.041),(0,.95,.4),lamp)
for x in [-.15,.15]:sphere('Turn signal',scooter,(.035,.027,.028),(x,.88,.4),amber)
rod('Exhaust',scooter,(.22,.28,-.1),(.22,.31,-.62),.04,metal)
rider=actor('Rider',scooter,(0,.45,-.17),white,.78)
sphere('Helmet shell',rider,(.126,.115,.12),(0,1.03,0),red)
box('Helmet visor',rider,(.17,.05,.025),(0,1.01,.105),glass,.015)
for child in rider.children:
    if 'Leg' in child.name:child.rotation_euler.x=-1.0
    if 'Arm' in child.name:child.rotation_euler.x=-.7

def animal(name,coat,is_cat=False):
    root=group(name)
    sphere('Body',root,(.19,.20,.37),(0,.39,0),coat)
    sphere('Chest patch',root,(.135,.16,.12),(0,.39,.29),cream)
    head=group(name+'Head',root,(0,.62,.33))
    sphere('Head',head,(.18,.18,.17),(0,0,0),coat)
    sphere('Muzzle',head,(.11,.073,.09),(0,-.055,.14),cream)
    sphere('Nose',head,(.041,.027,.021),(0,-.024,.216),pink if is_cat else black)
    for x in [-.076,.076]:
        sphere('Eye',head,(.031,.034,.016),(x,.033,.143),gold if is_cat else black)
        sphere('Pupil',head,(.012,.024,.009),(x,.033,.158),black)
        sphere('Catchlight',head,(.006,.006,.005),(x-.008,.045,.164),lamp)
        if is_cat:
            bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=.105,radius2=0,depth=.19)
            finish(bpy.context.object,'Pointed ear',head,(x*1.55,.18,-.015),coat)
            sphere('Ear pink',head,(.036,.052,.015),(x*1.55,.155,.029),pink)
            for y in [-.06,-.035]:rod('Whisker',head,(x,y,.2),(x*2.3,y+.01,.17),.002,white)
        else:
            ear=sphere('Floppy ear',head,(.064,.15,.069),(x*2,.015,-.015),coat)
            ear.rotation_euler.y=x*3
    ring('Collar',root,.135,.023,(0,.51,.32),red if is_cat else blue,'z')
    sphere('Name tag',root,(.027,.038,.008),(0,.38,.35),gold)
    for i,(x,z) in enumerate([(-.12,-.24),(.12,-.24),(-.12,.24),(.12,.24)]):
        leg=group(name+'Leg'+str(i),root,(x,.37,z))
        sphere('Upper leg',leg,(.063,.11,.066),(0,-.075,0),coat)
        sphere('Ankle',leg,(.042,.10,.041),(0,-.22,0),coat)
        sphere('Paw',leg,(.056,.035,.081),(0,-.325,.024),cream)
        for toe in [-.02,.02]:rod('Toe line',leg,(toe,-.317,.066),(toe,-.317,.09),.003,coat)
    tail=group(name+'Tail',root,(0,.46,-.3))
    rod('Tail lower',tail,(0,0,0),(0,.23,-.15),.028 if is_cat else .055,coat)
    rod('Tail tip',tail,(0,.23,-.15),(.035,.38,-.11),.023 if is_cat else .038,coat)
    if is_cat:root.scale=(.7,)*3
    return root

dog=animal('Dog',fur)
cat=animal('Cat',catfur,True)
chew=group('Chew',dog,(.34,.07,.3))
rod('Dog safe chew',chew,(-.09,0,0),(.09,0,0),.034,cream)
for x in [-.095,.095]:
    for z in [-.025,.025]:sphere('Chew end',chew,(.047,.036,.033),(x,0,z),cream)
jewel=group('Jewel',cat,(.36,.06,.43))
ring('Ring',jewel,.072,.012,(0,0,0),gold)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.05)
finish(bpy.context.object,'Cut gemstone',jewel,(0,.034,-.057),gem)
cap=group('BottleCap',cat,(.36,.04,.43))
ring('Bottle cap rim',cap,.05,.008,(0,0,0),metal)
sphere('Stamped bottle cap',cap,(.05,.008,.05),(0,.005,0),red)
for i in range(16):
    a=i*math.tau/16
    rod('Crimp',cap,(math.sin(a)*.047,-.003,math.cos(a)*.047),(math.sin(a)*.052,.012,math.cos(a)*.052),.003,metal)

girl=actor('Girl',color=red,scale=.85)
box('Canvas backpack',girl,(.24,.27,.13),(0,.64,-.14),blue,.045)
box('Backpack pocket',girl,(.17,.12,.04),(0,.57,-.22),red,.025)
for x in [-.08,.08]:rod('Backpack strap',girl,(x,.78,-.1),(x,.5,.08),.013,blue)
for x in [-.115,.115]:sphere('Pigtail',girl,(.051,.09,.047),(x,.96,-.02),black)
visitor=actor('Visitor',color=blue)
phoneguest=actor('PhoneGuest',color=red)
arm=next(c for c in phoneguest.children if 'RightArm' in c.name)
arm.rotation_euler.x=-1.1
box('Phone case',arm,(.078,.135,.012),(0,-.3,.012),black,.009)
box('Phone screen',arm,(.066,.11,.003),(0,-.3,.021),glass,.004)
box('Receipt stripe',arm,(.05,.018,.002),(0,-.285,.024),white,.001)
argument=group('Argument')
for x,color in [(-.38,red),(.38,blue)]:
    person=actor('Neighbor',argument,(x,0,0),color)
    person.rotation_euler.z=math.pi/2 if x<0 else -math.pi/2
    for c in person.children:
        if 'Arm' in c.name:c.rotation_euler.x=-.7

parcel=group('Parcel')
box('Delivery carton',parcel,(.68,.5,.55),(0,.25,0),card,.018)
box('Tape top',parcel,(.065,.003,.55),(0,.503,0),tape,.001)
box('Tape front',parcel,(.065,.5,.003),(0,.25,.277),tape,.001)
box('Shipping label',parcel,(.26,.12,.003),(.14,.35,.281),white,.002)
for i in range(14):box('Barcode',parcel,(.005+(i%3)*.003,.045,.002),(.035+i*.014,.36,.284),black,0)

musician=actor('Musician',color=blue)
guitar=group('Guitar',musician,(.02,.45,.17))
guitar.rotation_euler.y=.65
for y,size in [(0,(.14,.15,.05)),(.15,(.1,.12,.045))]:sphere('Guitar body',guitar,size,(0,y,0),wood)
ring('Rosette',guitar,.044,.005,(0,.12,.048),gold,'z')
sphere('Sound hole',guitar,(.038,.038,.003),(0,.12,.05),black)
box('Neck',guitar,(.043,.36,.031),(0,.39,0),wood,.005)
box('Headstock',guitar,(.075,.1,.04),(0,.62,0),wood,.008)
for i in range(6):rod('String',guitar,(-.015+i*.006,-.07,.055),(-.015+i*.006,.65,.028),.0012,metal)
for y in [.26,.3,.34,.38,.42,.46,.5]:rod('Fret',guitar,(-.022,y,.019),(.022,y,.019),.002,metal)
for c in musician.children:
    if 'Arm' in c.name:c.rotation_euler.x=-.45

umbrella=group('Umbrella')
rod('Umbrella stem',umbrella,(0,0,0),(0,1.3,0),.018,metal)
ring('Base',umbrella,.2,.055,(0,.06,0),black)
vertices=[xyz((0,1.38,0))]+[xyz((math.cos(i*math.tau/12)*.65,1.13,math.sin(i*math.tau/12)*.65)) for i in range(12)]
faces=[(0,i+1,(i+1)%12+1) for i in range(12)]
mesh=bpy.data.meshes.new('Stitched canopy')
mesh.from_pydata(vertices,[],faces)
canopy=bpy.data.objects.new('Canopy',mesh)
bpy.context.collection.objects.link(canopy)
canopy.parent=umbrella
canopy.data.materials.append(cloth)
canopy.data.materials.append(white)
for i,p in enumerate(mesh.polygons):p.material_index=i%2
for i in range(12):rod('Canopy rib',umbrella,(0,1.37,0),(math.cos(i*math.tau/12)*.65,1.12,math.sin(i*math.tau/12)*.65),.005,metal)

chess=group('Chess')
box('Chess board',chess,(.68,.05,.68),(0,.4,0),wood,.012)
for x in range(8):
    for z in range(8):box('Chess square',chess,(.077,.002,.077),((x-3.5)*.078,.427,(z-3.5)*.078),white if (x+z)%2 else black,0)
for x in [-.23,.23]:
    for z in [-.23,.23]:rod('Folding leg',chess,(x,.025,z),(x,.4,z),.014,metal)
for i,(x,z) in enumerate([(-.19,-.19),(-.11,-.19),(.04,.04),(.19,.19),(.11,.19)]):
    rod('Chess piece stem',chess,(x,.43,z),(x,.49,z),.018,white if i%2 else black)
    sphere('Chess piece crown',chess,(.025,.028,.025),(x,.51,z),white if i%2 else black)
elder=actor('Elder',chess,(.59,0,-.1),white)

roots=[car,scooter,dog,cat,girl,visitor,phoneguest,argument,parcel,musician,umbrella,chess]
# Batch only within articulation groups; the joint empties remain editable.
for parent in [o for root in roots for o in descendants(root) if o.type=='EMPTY']:
    buckets={}
    for child in list(parent.children):
        if child.type=='MESH' and len(child.data.materials)==1:buckets.setdefault(child.active_material.name,[]).append(child)
    for items in buckets.values():
        if len(items)<2:continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in items:o.select_set(True)
        bpy.context.view_layer.objects.active=items[0]
        bpy.ops.object.join()
bpy.ops.object.select_all(action='DESELECT')
for root in roots:
    for o in descendants(root):o.select_set(True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'events-kit.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'events-kit.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True)

# Render the exact runtime models into transparent 2D fallback portraits.
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.render.resolution_x=384
scene.render.resolution_y=320
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.film_transparent=True
scene.world.color=(.25,.25,.25)
bpy.ops.object.camera_add(location=(2.6,-4.5,2.6))
camera=bpy.context.object
camera.data.type='ORTHO'
scene.camera=camera
for pos,power,size in [((2,-3,5),650,4),((-3,-1,3),400,3),((1,3,4),600,3)]:
    bpy.ops.object.light_add(type='AREA',location=pos)
    light=bpy.context.object
    light.data.energy=power
    light.data.shape='DISK'
    light.data.size=size
    light.rotation_euler=(Vector((0,0,.6))-light.location).to_track_quat('-Z','Y').to_euler()
for root in roots:
    for other in roots:
        for obj in descendants(other):obj.hide_render=other!=root
    if root==cat:
        for obj in descendants(cap):obj.hide_render=True
    if root==dog:
        for obj in descendants(chew):obj.hide_render=True
    bpy.context.view_layer.update()
    points=[o.matrix_world@Vector(c) for o in descendants(root) if o.type=='MESH' for c in o.bound_box]
    low=Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high=Vector(tuple(max(p[i] for p in points) for i in range(3)))
    center=(low+high)/2
    camera.location=center+Vector((2.6,-4.5,2.6))
    camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.ortho_scale=max(high-low)*1.7
    scene.render.filepath=str(SPRITES/(root.name+'.png'))
    bpy.ops.render.render(write_still=True)
    if root==cat:
        for obj in descendants(jewel):obj.hide_render=True
        for obj in descendants(cap):obj.hide_render=False
        scene.render.filepath=str(SPRITES/'CatCap.png')
        bpy.ops.render.render(write_still=True)
    if root==dog:
        for obj in descendants(chew):obj.hide_render=False
        scene.render.filepath=str(SPRITES/'DogChew.png')
        bpy.ops.render.render(write_still=True)
for root in roots:
    for o in descendants(root):o.hide_render=False
print('EVENT_KIT_BUILT', (OUT/'events-kit.glb').stat().st_size, [r.name for r in roots])
