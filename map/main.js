// Generated by LiveScript 1.6.0
(function(){
  $(function(){
    var CACHED, GET, longMIN, longMAX, latMIN, latMAX, origin, DATA, STR2GEO, GEO2STR;
    CACHED = {};
    window.GET = GET = function(url, data, onSuccess, dataType){
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
    longMIN = 120;
    longMAX = 122;
    latMIN = 22;
    latMAX = 25;
    origin = "http://direct.moedict.tw/";
    window.id = 'map';
    $('body').on('click', 'a.poi', function(){
      return output($(this).text() + "");
    });
    $('#submitStr').click(function(){
      var geo;
      geo = STR2GEO($('#inputStr').val());
      $('#inputX').val(geo.x);
      $('#spanLong').text(geo.longitude);
      $('#inputY').val(geo.y);
      return $('#spanLat').text(geo.latitude);
    });
    $(window).resize(function(){
      $('#map').width('100%');
      return $('#map').height('100%');
    });
    $('#submitGeo').click(function(){
      return $('#inputStr').val(GEO2STR({
        x: parseInt($('#inputX').val()),
        y: parseInt($('#inputY').val())
      }));
    });
    window.input = function(it){
      return fill(it);
    };
    window.output = function(it){
      var ref$;
      input(it);
      if (window.muted) {
        return;
      }
      return typeof (ref$ = window.parent).post == 'function' ? ref$.post(it, window.id) : void 8;
    };
    DATA = {};
    window.STR2GEO = STR2GEO = function(it){
      var long, lat, i$, to$, i, char, high, low, rX, rY, rLong, rLat;
      long = DATA['j'].indexOf(it[0]);
      lat = DATA['j'].indexOf(it[1]);
      for (i$ = 2, to$ = it.length; i$ < to$; ++i$) {
        i = i$;
        char = DATA['j'].indexOf(it[i]);
        high = Math.floor(char / 64);
        low = char % 64;
        long = long * 64 + high;
        lat = lat * 64 + low;
      }
      rX = long;
      rY = lat;
      rLong = rX / Math.pow(2, it.length * 6);
      rLat = rY / Math.pow(2, it.length * 6);
      return {
        longitude: longMIN + (longMAX - longMIN) * rLong,
        latitude: latMIN + (latMAX - latMIN) * rLat,
        x: rX,
        y: rY
      };
    };
    window.GEO2STR = GEO2STR = function(it){
      var long, lat, long_parts, lat_parts, i$, to$, result, c1, c2, i;
      long = it.x;
      lat = it.y;
      long_parts = [];
      lat_parts = [];
      if (long >= lat) {
        while (long > 0) {
          long_parts.unshift((long % 64).toString(2));
          long = Math.floor(long / 64);
          lat_parts.unshift((lat % 64).toString(2));
          lat = Math.floor(lat / 64);
        }
      } else {
        while (lat > 0) {
          long_parts.unshift((long % 64).toString(2));
          long = Math.floor(long / 64);
          lat_parts.unshift((lat % 64).toString(2));
          lat = Math.floor(lat / 64);
        }
      }
      if (long_parts.length < 3) {
        for (i$ = 0, to$ = 3 - long_parts.length; i$ < to$; ++i$) {
          long_parts.unshift("0");
        }
      }
      if (lat_parts.length < 3) {
        for (i$ = 0, to$ = 3 - lat_parts.length; i$ < to$; ++i$) {
          lat_parts.unshift("0");
        }
      }
      result = "";
      c1 = DATA['j'][parseInt(long_parts[0], 2) * 64 + parseInt(long_parts[1], 2)];
      long_parts.shift();
      long_parts.shift();
      result += c1;
      c2 = DATA['j'][parseInt(lat_parts[0], 2) * 64 + parseInt(lat_parts[1], 2)];
      lat_parts.shift();
      lat_parts.shift();
      result += c2;
      for (i$ = 0, to$ = long_parts.length; i$ < to$; ++i$) {
        i = i$;
        result += DATA['j'][parseInt(long_parts[i], 2) * 64 + parseInt(lat_parts[i], 2)];
      }
      return result;
    };
    return fill('萌');
  });
}).call(this);
