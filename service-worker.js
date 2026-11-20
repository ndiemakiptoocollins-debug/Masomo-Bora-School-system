const CACHE='masomo-bora-shell-v32';
const BASE=self.registration.scope;
const SHELL=['','index.html','style.css','app.js','manifest.webmanifest'].map(path=>new URL(path,BASE).toString());

self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.allSettled(SHELL.map(async url=>{
   const response=await fetch(url,{cache:'reload'});
   if(response.ok) await cache.put(url,response);
  }));
  await self.skipWaiting();
 })());
});

self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('masomo-bora-shell-')&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});

self.addEventListener('fetch',event=>{
 const request=event.request;
 const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==location.origin||!url.href.startsWith(BASE)||url.pathname.includes('/api/')) return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response.ok) await cache.put(request,response.clone());
  return response;
 })());
});
