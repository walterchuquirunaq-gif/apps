/* Service worker de la app "Devocional".
   - Primero la red (siempre lo más nuevo). Si no hay internet, o la red tarda más de 4 segundos,
     usa la copia guardada. Cada mes queda guardado la primera vez que se abre.
   - El avance y las notas NO pasan por aquí: viven en el navegador (localStorage).
   - Para subir un mes nuevo no hace falta tocar este archivo. */
var CACHE = "devocional-v1";
var BASE = ["./", "index.html", "manifest.webmanifest", "icono-180.png", "icono-192.png", "icono-512.png", "icono-maskable-512.png"];
var RAIZ = new URL("./", self.location).href;

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE)
    .then(function(c){ return c.addAll(BASE.map(function(u){ return new Request(u, {cache: "reload"}); })); })
    .then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys()
    .then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf("devocional-") === 0 && k !== CACHE; })
      .map(function(k){ return caches.delete(k); })); })
    .then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var req = e.request, u = new URL(req.url);
  if (u.origin !== self.location.origin || req.url.indexOf(RAIZ) !== 0) return;
  var clave = u.origin + u.pathname;   // sin ?… ni #…

  // HEAD: lo usan la portada y "Cambiar de mes" para saber qué meses hay
  // (si la red no contesta en 4 segundos, responde según lo guardado)
  if (req.method === "HEAD") {
    var segunGuardado = function(){
      return caches.match(clave).then(function(r){ return new Response(null, {status: r ? 200 : 504}); });
    };
    e.respondWith(new Promise(function(dar){
      var listo = false;
      function entregar(r){ if (!listo) { listo = true; dar(r); } }
      var reloj = setTimeout(function(){ segunGuardado().then(entregar); }, 4000);
      fetch(clave, {method: "HEAD", cache: "no-cache"}).then(function(r){ clearTimeout(reloj); entregar(r); },
        function(){ clearTimeout(reloj); segunGuardado().then(entregar); });
    }));
    return;
  }
  if (req.method !== "GET") return;

  var deRed = fetch(clave, {cache: "no-cache"}).then(function(r){
    if (r && r.ok) { var copia = r.clone(); caches.open(CACHE).then(function(c){ return c.put(clave, copia); }); }
    return r;
  });
  e.waitUntil(deRed.catch(function(){}));

  e.respondWith(new Promise(function(dar){
    var listo = false;
    function entregar(r){ if (!listo && r) { listo = true; dar(r); } }
    var reloj = setTimeout(function(){ caches.match(clave).then(entregar); }, 4000);
    deRed.then(function(r){
      clearTimeout(reloj);
      if (r.ok || r.status === 404) entregar(r);
      else caches.match(clave).then(function(c){ entregar(c || r); });
    }, function(){
      clearTimeout(reloj);
      caches.match(clave).then(function(c){
        if (c) return entregar(c);
        if (req.mode === "navigate") return caches.match(RAIZ).then(function(x){ entregar(x || Response.error()); });
        entregar(Response.error());
      });
    });
  }));
});
