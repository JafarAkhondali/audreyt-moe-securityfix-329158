#window ?= -> { $: require(\jquery), addEventListener: -> }
/*
Array::powerset = String::powerset = ->
  return @ if @length <= 1
  xs = Array::slice.call @
  x = Array::pop.call xs
  p = xs.powerset!
  p.concat p.map -> it.concat [x]
String::permutate = ->
  return @ if @length is 1
  ret = []
  xs = @substr 1
  x = @.0
  p = xs.permutate!
  for set in p
    for i from 0 to set.length
      before = set.substring 0, i
      after = set.substring i
      ret.push before + x + after
  ret
*/
# buffered messages before data loaded
buffer = []
buffered-msgs-first = ({data}) -> buffer.push data
window.input = -> buffered-msgs-first {data: it}
window.addEventListener \message buffered-msgs-first


# initialize three.js and Physijs
Physijs.scripts.worker = \../js/physijs_worker.js
Physijs.scripts.ammo = \../js/ammo.js

renderer = new THREE.WebGLRenderer
renderer.setSize(window.innerWidth, window.innerHeight * 0.7)
#renderer.shadowMapEnabled = yes
#renderer.shadowMapSoft = yes
$(\body).prepend renderer.domElement

scene= new Physijs.Scene(fixedTimeStep: 1 / 120)
scene.addEventListener \update, ->
  scene.simulate(void, 2)
  controls.update!

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight / 0.7, 1, 100000)
camera.position.set(0, 2000, 4000)
camera.lookAt new THREE.Vector3(0, 0, 0)
scene.add camera

scene.add new THREE.AmbientLight(0x333333)
light = new THREE.DirectionalLight(0xffffff)
light.position.set(0, 2000, 500)
light.target.position.set(0, 0, 0)
scene.add light

render = !->
  requestAnimationFrame(render)
  renderer.render(scene, camera)
requestAnimationFrame(render)
scene.simulate!

controls = new THREE.OrbitControls camera

materialFront = new THREE.MeshLambertMaterial do
  map: THREE.ImageUtils.loadTexture \./images/wood.jpg
  color: 0x999999
  ambient: 0xF0F0F0
material = new Physijs.createMaterial(materialFront, 8, 0.4)
block-material = Physijs.createMaterial do
  new THREE.MeshLambertMaterial map: new THREE.ImageUtils.loadTexture \./images/plywood.jpg, ambient: 0xFF9999
  0.9 # medium friction
  0.5 # medium restitution
block-material.map.wrapS = block-material.map.wrapT = THREE.RepeatWrapping
block-material.map.repeat.set( 1, 0.5 )

extrusionSettings =
  amount: 100
  bevelEnabled: false
  material: block-material
  extrudeMaterial: block-material


# load data for chinese character composition/decomposition
CharComp  <- $.get \./data/char_comp_simple.json
CompChar  <- $.get \./data/comp_char_sorted.json
OrigChars <- $.get \./data/orig-chars.json
Outlines  <- $.get \./data/Outlines.json
Centroids <- $.get \./data/Centroids.json
#moe       <- $.get \./data/moe.json
###
# main function for Large Henzi Collider
###
# API
cTime = 3.0
cCounter = 0
origin = "http://127.0.0.1:8888/"
window.id = \lhc
window.reset = !->
  $input.val ""
  $output.empty!
window.output = ->
  return if window.muted
  window.top.postMessage it, origin
$input = $ \#input
$output = $ \#output
window.uniq = uniq = ->
  seen = {}
  for w in it / '' => seen[w] = true
  Object.keys(seen).sort! * ''
main = ({data}) ->
  $input.val $input.val! + data
  data = uniq($input.val!)
  cCounter := 0
  doAddChar(data)
  comps = []
  get-comps = ->
    out = ""
    for char in it
      comps = CharComp[char]
      out += if CharComp[char] then get-comps CharComp[char] else char
    it + out
  comps = uniq(get-comps data)
  seen = {}
  for ch in comps => seen[ch] = true if ch in OrigChars
  scanned = { '' : true }
  queue = []
  callback = null
  queue = [['', comps]]
  count = 0
  while queue.length
    break if count++ > 1000 # TODO: move to worker
    [taken, rest] = queue.shift!
    unless scanned[taken]
      scanned[taken] = true
      c = CompChar[taken]
      seen[c] = true if c and c in OrigChars
    break if rest.length == 0
    head = rest.0
    rest.=substr(1)
    queue.push [taken, rest]
    queue.push [taken + head, rest]
  keys = Object.keys(seen)
  $output.empty!
  for char in keys
    $output.append $(\<li/>).css(\width, ~~(window.innerWidth / keys.length) - 5).append $(\<a/> href: \#).text char .click -> window.output $(@).text!
  JSON.stringify keys,, 2
getShapeOf = ->
  ret = []
  for stroke in it
    shape = new THREE.Shape
    path = new THREE.Path
    tokens = stroke.split ' '
    shiftNum = -> parseInt tokens.shift!, 10
    isOutline = yes
    while tokens.length
      cmd = tokens.shift!
      switch cmd
        when \M
          if isOutline
            shape.moveTo shiftNum!, shiftNum!
          else
            path.moveTo shiftNum!, shiftNum!
        when \L
          while tokens.length > 1
            if isOutline
              shape.lineTo shiftNum!, shiftNum!
            else
              path.lineTo shiftNum!, shiftNum!
            if tokens.0 is \Z
              if not isOutline
                shape.holes.push path
                path = new THREE.Path
              isOutline = no
              break
    ret.push shape
  ret
doAddChar = ->
  for char in it
    console.log "creating geometry for #char"
    randX = Math.random() * 500 - 250
    randY = Math.random() * 500 - 250
    for i, shape of getShapeOf Outlines[char]
      geometry = new THREE.ExtrudeGeometry(shape, extrusionSettings)
      offset = new THREE.Vector3 do
        +Centroids[char][i].0
        -Centroids[char][i].1
        extrusionSettings.amount / 2
      m = new THREE.Matrix4
      m.makeTranslation(-offset.x, -offset.y, -offset.z)
      geometry.applyMatrix m
      mesh = new Physijs.ConvexMesh(geometry, block-material, 9)
      mesh.position = offset.clone!
      mesh.position.add new THREE.Vector3(randX - 1075, randY + 1075, 0)
      mesh.castShadow = yes
      mesh.receiveShadow = yes
      mesh._physijs.linearVelocity.x = 0
      mesh._physijs.linearVelocity.y = 0
      mesh._physijs.linearVelocity.z = 200
      scene.add mesh
scene.addEventListener \update, ->
  doAddChar uniq $input.val! if cCounter++ % ~~(cTime * 120) is 0
window.input := -> main {data: it}
window.removeEventListener \message, buffered-msgs-first
for data in buffer => main {data}
window.addEventListener \message, main

