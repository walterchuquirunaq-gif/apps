/* Service worker de la app "Calistenia general".
   Primero la red (siempre lo más nuevo). Si no hay internet, o la red tarda más de 4 segundos,
   usa la copia guardada. El avance NO pasa por aquí: vive en el navegador (localStorage). */
var CACHE = "calgeneral-v1";
var BASE = ["./", "index.html", "manifest.webmanifest", "icono-180.png", "icono-192.png", "icono-512.png", "icono-maskable-512.png"];
var RAIZ = new URL("./", self.location).href;

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE)
    .then(function(c){ return c.addAll(BASE.map(function(u){ return new Request(u, {cache: "reload"}); })); })
    .then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys()
    .then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf("calgeneral-") === 0 && k !== CACHE; })
      .map(function(k){ return caches.delete(k); })); })
    .then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== self.location.origin || req.url.indexOf(RAIZ) !== 0) return;
  var clave = u.origin + u.pathname;
  if (clave === RAIZ + "index.html") clave = RAIZ;   // la portada y index.html son la misma página

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
      caches.match(clave).then(function(c){ entregar(c || Response.error()); });
    });
  }));
});
