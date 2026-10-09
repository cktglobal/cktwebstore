// Daftar service worker untuk PWA (Add to Home Screen).
// Diasingkan dari index.html supaya Content Security Policy (netlify.toml)
// boleh sekat semua skrip inline.
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(err=>console.warn('SW register failed:', err));
  });
}
