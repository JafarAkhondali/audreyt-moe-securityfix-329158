// Generated by LiveScript 1.2.0
(function(){
  $(function(){
    var $in, $out, origin, CACHED, GET;
    $in = $('#input');
    $out = $('#output');
    $('#submit').click(function(){
      if ($in.val()) {
        return input($in.val());
      }
    });
    origin = "http://127.0.0.1:8888/";
    window.id = 'tmuse';
    window.colors = [[0, 0, 0], [87, 87, 87], [173, 35, 35], [42, 75, 215], [29, 105, 20], [129, 38, 192], [160, 160, 160], [129, 197, 122], [157, 175, 255], [41, 208, 208], [255, 146, 51], [255, 238, 51], [233, 222, 187], [255, 205, 243]];
    window.reset = function(){
      return $in.val('');
    };
    window.addEventListener("message", function(it){
      return window.input(it.data, false);
    });
    window.input = function(it){
      $in.val(it);
      return GET("a/" + it + ".json", function(json){
        var nodes, i$, ref$, len$, labels, $li, j$, len1$, ref1$, label, score, scene, camera, renderer, multiplier, objs, obj_coloring, obj_radius, clustering, i, cluster, c, l, n, coords, sphere_geo, mat, sphere, spritey, edges, edge, color, sv, tv, geometry, line, controls, render, light;
        nodes = json.graph_json.nodes;
        $out.empty();
        for (i$ = 0, len$ = (ref$ = json.clustering_json).length; i$ < len$; ++i$) {
          labels = ref$[i$].labels;
          $li = $('<li/>');
          for (j$ = 0, len1$ = labels.length; j$ < len1$; ++j$) {
            ref1$ = labels[j$], label = ref1$[0], score = ref1$[1];
            $li.append($('<a/>', {
              href: '#'
            }).text(label).click(fn$).css({
              fontSize: 15 * score + 'px'
            }));
            $li.append('&nbsp;');
          }
          $li.appendTo($out);
        }
        scene = new THREE.Scene();
        window.camera = camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        $('#canvas').html(renderer.domElement);
        camera.position.z = 5;
        multiplier = 5;
        objs = {};
        obj_coloring = {};
        obj_radius = {};
        clustering = json.clustering_json;
        for (i$ = 0, len$ = clustering.length; i$ < len$; ++i$) {
          i = i$;
          cluster = clustering[i$];
          labels = cluster.labels;
          c = i % window.colors.length;
          for (j$ = 0, len1$ = labels.length; j$ < len1$; ++j$) {
            l = labels[j$];
            obj_coloring[l[0]] = {
              r: window.colors[c][0] / 255,
              g: window.colors[c][1] / 255,
              b: window.colors[c][2] / 255
            };
            obj_radius[l[0]] = l[1];
          }
        }
        for (i$ = 0, len$ = nodes.length; i$ < len$; ++i$) {
          i = i$;
          n = nodes[i$];
          coords = n.coords;
          sphere_geo = new THREE.SphereGeometry(obj_radius[n.label] * 0.1 + 0.05, 10, 10);
          mat = new THREE.MeshBasicMaterial({
            color: 0x0000ff
          });
          mat.color.setRGB(obj_coloring[n.label].r, obj_coloring[n.label].g, obj_coloring[n.label].b);
          sphere = new THREE.Mesh(sphere_geo, mat);
          sphere.position.x = coords[0] * multiplier;
          sphere.position.y = coords[1] * multiplier;
          sphere.position.z = coords[2] * multiplier;
          spritey = makeTextSprite(" " + n.label + " ", obj_coloring[n.label]);
          spritey.position = sphere.position.clone().multiplyScalar(1.01);
          scene.add(spritey);
        }
        edges = json.graph_json.edges;
        for (i$ = 0, len$ = edges.length; i$ < len$; ++i$) {
          edge = edges[i$];
          mat = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 2
          });
          color = obj_coloring[nodes[edge.s].label];
          mat.color.setRGB(color.r, color.g, color.b);
          sv = nodes[edge.s].coords;
          tv = nodes[edge.t].coords;
          geometry = new THREE.Geometry();
          geometry.vertices.push(new THREE.Vector3(sv[0] * multiplier, sv[1] * multiplier, sv[2] * multiplier));
          geometry.vertices.push(new THREE.Vector3(tv[0] * multiplier, tv[1] * multiplier, tv[2] * multiplier));
          line = new THREE.Line(geometry, mat);
          scene.add(line);
        }
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        render = function(){
          requestAnimationFrame(render);
          return renderer.render(scene, camera);
        };
        renderer.setClearColor(0xdddddd, 1);
        light = new THREE.PointLight(0xffffff);
        light.position.set(-100, 200, 100);
        scene.add(light);
        return render();
        function fn$(){
          return window.output($(this).text());
        }
      });
    };
    window.output = function(it){
      if (window.muted) {
        return;
      }
      input(it);
      return window.top.postMessage(it, origin);
    };
    CACHED = {};
    GET = function(url, data, onSuccess, dataType){
      var ref$;
      if (data instanceof Function) {
        ref$ = [null, onSuccess, data], data = ref$[0], dataType = ref$[1], onSuccess = ref$[2];
      }
      if (CACHED[url]) {
        return onSuccess(CACHED[url]);
      }
      return $.get(url, data, function(it){
        return onSuccess(CACHED[url] = it);
      }, dataType || 'json').fail(function(){});
    };
    window.makeTextSprite = function(message, arg$, parameters){
      var r, g, b, fontface, fontsize, borderThickness, borderColor, backgroundColor, spriteAlignment, canvas, context, metrics, textWidth, texture, spriteMaterial, sprite;
      r = arg$.r, g = arg$.g, b = arg$.b;
      if (deepEq$(parameters, undefined, '===')) {
        parameters = {};
      }
      fontface = "Lantinghei TC";
      fontsize = 24;
      borderThickness = 1;
      borderColor = {
        r: 0,
        g: 0,
        b: 0,
        a: 1.0
      };
      backgroundColor = {
        r: Math.round(200 + r * 55),
        g: Math.round(200 + g * 55),
        b: Math.round(200 + b * 55),
        a: 1.0
      };
      console.log(JSON.stringify(backgroundColor, void 8, 2));
      spriteAlignment = THREE.SpriteAlignment.topLeft;
      canvas = document.createElement('canvas');
      context = canvas.getContext('2d');
      context.font = "Bold " + fontsize + "px " + fontface;
      metrics = context.measureText(message);
      textWidth = metrics.width;
      context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
      context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
      context.lineWidth = borderThickness;
      window.roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
      context.fillStyle = "rgba(0, 0, 0, 1.0)";
      context.fillText(message, borderThickness, fontsize + borderThickness);
      texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        alignment: spriteAlignment
      });
      sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2, 1, 0.04);
      return sprite;
    };
    return window.roundRect = function(ctx, x, y, w, h, r){
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      return ctx.stroke();
    };
  });
  function deepEq$(x, y, type){
    var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
        has = function (obj, key) { return hasOwnProperty.call(obj, key); };
    var first = true;
    return eq(x, y, []);
    function eq(a, b, stack) {
      var className, length, size, result, alength, blength, r, key, ref, sizeB;
      if (a == null || b == null) { return a === b; }
      if (a.__placeholder__ || b.__placeholder__) { return true; }
      if (a === b) { return a !== 0 || 1 / a == 1 / b; }
      className = toString.call(a);
      if (toString.call(b) != className) { return false; }
      switch (className) {
        case '[object String]': return a == String(b);
        case '[object Number]':
          return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
          return +a == +b;
        case '[object RegExp]':
          return a.source == b.source &&
                 a.global == b.global &&
                 a.multiline == b.multiline &&
                 a.ignoreCase == b.ignoreCase;
      }
      if (typeof a != 'object' || typeof b != 'object') { return false; }
      length = stack.length;
      while (length--) { if (stack[length] == a) { return true; } }
      stack.push(a);
      size = 0;
      result = true;
      if (className == '[object Array]') {
        alength = a.length;
        blength = b.length;
        if (first) { 
          switch (type) {
          case '===': result = alength === blength; break;
          case '<==': result = alength <= blength; break;
          case '<<=': result = alength < blength; break;
          }
          size = alength;
          first = false;
        } else {
          result = alength === blength;
          size = alength;
        }
        if (result) {
          while (size--) {
            if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
          }
        }
      } else {
        if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
          return false;
        }
        for (key in a) {
          if (has(a, key)) {
            size++;
            if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
          }
        }
        if (result) {
          sizeB = 0;
          for (key in b) {
            if (has(b, key)) { ++sizeB; }
          }
          if (first) {
            if (type === '<<=') {
              result = size < sizeB;
            } else if (type === '<==') {
              result = size <= sizeB
            } else {
              result = size === sizeB;
            }
          } else {
            first = false;
            result = size === sizeB;
          }
        }
      }
      stack.pop();
      return result;
    }
  }
}).call(this);
