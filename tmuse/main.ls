<- $

$in = $ \#input
$out = $ \#output

origin = "http://127.0.0.1:8888/"
window.id = \tmuse
window.colors = [[0,0,0],[87,87,87],[173,35,35],[42,75,215],[29,105,20],[129,38,192],[160,160,160],[129,197,122],[157,175,255],[41,208,208],[255,146,51],[255,238,51],[233,222,187],[255,205,243]]
window.reset = -> $in.val ''
window.addEventListener("message", -> window.input it.data, false);
window.input = ->
  $in.val it
  json <- GET "a/#it.json"
#draw nodes
  nodes = json.graph_json.nodes
  $out.empty!
  #for {label} in nodes
  #  $out.append($(\<li/>).append $(\<a/> href: \#).text label .click -> window.output $(@).text!)

  scene = new THREE.Scene()
  window.camera = camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  $(\#canvas).html(renderer.domElement)

  camera.position.z = 5;
  multiplier = 5
  objs = {}
  for n,i in nodes
    coords = n.coords
    sphere_geo = new THREE.SphereGeometry(0.1,10,10)
    mat = new THREE.MeshBasicMaterial({color: 0x0000ff})
    sphere = new THREE.Mesh(sphere_geo, mat)
    sphere.position.x = coords[0]*multiplier
    sphere.position.y = coords[1]*multiplier
    sphere.position.z = coords[2]*multiplier
    scene.add(sphere)
    objs[n.label] = sphere

    spritey = makeTextSprite( " #{n.label} " );
    spritey.position = sphere.position.clone().multiplyScalar(1.1);
    scene.add( spritey );
#clustering & coloring
  obj_coloring = {}
  clustering = json.clustering_json
  for cluster,i in clustering
    labels = cluster.labels
    c = i % window.colors.length
    for l in labels
      obj_coloring[l[0]] = {r:window.colors[c][0]/255,g: window.colors[c][1]/255, b: window.colors[c][2]/255}
      objs[l[0]].material.color.setRGB(window.colors[c][0]/255, window.colors[c][1]/255, window.colors[c][2]/255)
#draw edges
  edges = json.graph_json.edges
  for edge in edges
    mat = new THREE.LineBasicMaterial({color: 0x000000, linewidth:2})
    color = obj_coloring[nodes[edge.s].label]
    mat.color.setRGB(color.r,color.g,color.b)
    sv = nodes[edge.s].coords
    tv = nodes[edge.t].coords
    geometry = new THREE.Geometry()
    geometry.vertices.push(new THREE.Vector3(sv[0]*multiplier, sv[1]*multiplier, sv[2]*multiplier))
    geometry.vertices.push(new THREE.Vector3(tv[0]*multiplier, tv[1]*multiplier, tv[2]*multiplier))

    line = new THREE.Line(geometry, mat)
    scene.add(line)
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  render = ->
    requestAnimationFrame(render);
    renderer.render(scene, camera);

  renderer.setClearColor(0xdddddd, 1);
  light = new THREE.PointLight(0xffffff);
  light.position.set(-100,200,100);
  scene.add(light);
  render!;

window.output = ->
  return if window.muted
  input it
  window.top.postMessage(it, origin)

CACHED = {}
GET = (url, data, onSuccess, dataType) ->
  if data instanceof Function
    [data, dataType, onSuccess] = [null, onSuccess, data]
  return onSuccess(CACHED[url]) if CACHED[url]
  $.get(url, data, (->
    onSuccess(CACHED[url] = it)
  ), (dataType || \json)).fail ->
    #x = decodeURIComponent(url) - /\.json$/ - /^\w/
    #window.input x


window.makeTextSprite = ( message, parameters ) ->
  parameters = {} if parameters === undefined

  fontface = "Arial";
  fontsize = 10;
  borderThickness = 1;
  borderColor = { r:0, g:0, b:0, a:1.0 };
  backgroundColor = { r:255, g:255, b:255, a:1.0 };

  spriteAlignment = THREE.SpriteAlignment.topLeft;

  canvas = document.createElement('canvas');
  context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px " + fontface;

  # get size data (height depends only on font size)
  metrics = context.measureText( message );
  textWidth = metrics.width;

  # background color
  context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
  # border color
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

  context.lineWidth = borderThickness;
  window.roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
  # 1.4 is extra height factor for text below baseline: g,j,p,q.

  # text color
  context.fillStyle = "rgba(0, 0, 0, 1.0)";

  context.fillText( message, borderThickness, fontsize + borderThickness);

  # canvas contents will be used for a texture
  texture = new THREE.Texture(canvas) 
  texture.needsUpdate = true;

  spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
  sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(4, 2, 0.04)
  return sprite

window.roundRect = (ctx, x, y, w, h, r) ->
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w - r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h - r);
  ctx.quadraticCurveTo(x+w, y+h, x+w - r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h - r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();   
