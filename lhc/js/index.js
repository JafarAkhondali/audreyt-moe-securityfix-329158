// Generated by LiveScript 1.2.0
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
(function(){
  var buffer, bufferedMsgsFirst, split$ = ''.split, join$ = [].join;
  buffer = [];
  bufferedMsgsFirst = function(arg$){
    var data;
    data = arg$.data;
    return buffer.push(data);
  };
  window.input = function(it){
    return bufferedMsgsFirst({
      data: it
    });
  };
  window.addEventListener('message', bufferedMsgsFirst);
  $.get('./data/char_comp_simple.json', function(CharComp){
    return $.get('./data/comp_char_sorted.json', function(CompChar){
      return $.get('./data/orig-chars.json', function(OrigChars){
        var origin, $input, $output, uniq, main, i$, ref$, len$, data;
        origin = "http://127.0.0.1:8888/";
        window.id = 'lhc';
        window.reset = function(){
          return $input.val("");
        };
        window.output = function(it){
          if (window.muted) {
            return;
          }
          return window.top.postMessage(it, origin);
        };
        $input = $('#input');
        $output = $('#output');
        window.uniq = uniq = function(it){
          var seen, i$, ref$, len$, w;
          seen = {};
          for (i$ = 0, len$ = (ref$ = split$.call(it, '')).length; i$ < len$; ++i$) {
            w = ref$[i$];
            seen[w] = true;
          }
          return join$.call(Object.keys(seen).sort(), '');
        };
        main = function(arg$){
          var data, comps, getComps, seen, i$, len$, ch, scanned, queue, callback, count, ref$, taken, rest, c, head, keys, char;
          data = arg$.data;
          data = uniq($input.val() + data);
          $input.val(data);
          comps = [];
          getComps = function(it){
            var out, i$, len$, char, comps;
            out = "";
            for (i$ = 0, len$ = it.length; i$ < len$; ++i$) {
              char = it[i$];
              comps = CharComp[char];
              out += CharComp[char] ? getComps(CharComp[char]) : char;
            }
            return it + out;
          };
          comps = uniq(getComps(data));
          seen = {};
          for (i$ = 0, len$ = comps.length; i$ < len$; ++i$) {
            ch = comps[i$];
            if (in$(ch, OrigChars)) {
              seen[ch] = true;
            }
          }
          scanned = {
            '': true
          };
          queue = [];
          callback = null;
          queue = [['', comps]];
          count = 0;
          while (queue.length) {
            if (count++ > 1000) {
              break;
            }
            ref$ = queue.shift(), taken = ref$[0], rest = ref$[1];
            if (!scanned[taken]) {
              scanned[taken] = true;
              c = CompChar[taken];
              if (c && in$(c, OrigChars)) {
                seen[c] = true;
              }
            }
            if (rest.length === 0) {
              break;
            }
            head = rest[0];
            rest = rest.substr(1);
            queue.push([taken, rest]);
            queue.push([taken + head, rest]);
          }
          keys = Object.keys(seen);
          $output.empty();
          for (i$ = 0, len$ = keys.length; i$ < len$; ++i$) {
            char = keys[i$];
            $output.append($('<li/>').append($('<a/>', {
              href: '#'
            }).text(char)).click(fn$));
          }
          return JSON.stringify(keys, void 8, 2);
          function fn$(){
            return window.output($(this).text());
          }
        };
        window.input = function(it){
          return main({
            data: it
          });
        };
        window.removeEventListener('message', bufferedMsgsFirst);
        for (i$ = 0, len$ = (ref$ = buffer).length; i$ < len$; ++i$) {
          data = ref$[i$];
          main({
            data: data
          });
        }
        return window.addEventListener('message', main);
      });
    });
  });
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);
