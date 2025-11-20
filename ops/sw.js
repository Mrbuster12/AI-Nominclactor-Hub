self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

const SHOULD_INJECT = (url) => {
  try {
    const u = new URL(url);
    return u.pathname === '/' ||
           u.pathname.endsWith('/index.html') ||
           u.pathname.endsWith('/hub.html') ||
           u.pathname === '/index.html';
  } catch { return false; }
};

async function injectLabels(resp) {
  const ct = resp.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return resp;

  const text = await resp.text();
  const loader = '<script src="/ops/hub_label_roles.js?v=1"></script>';
  let injected;

  if (text.includes('</head>')) injected = text.replace('</head>', loader + '\n</head>');
  else if (text.includes('</body>')) injected = text.replace('</body>', loader + '\n</body>');
  else injected = loader + '\n' + text;

  return new Response(injected, {
    status: resp.status,
    statusText: resp.statusText,
    headers: { 'content-type': ct }
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isDoc = req.mode === 'navigate' || (req.destination === 'document');
  if (isDoc && SHOULD_INJECT(req.url)) {
    event.respondWith((async () => {
      const resp = await fetch(req, { cache: 'no-store' });
      return injectLabels(resp);
    })());
  }
});
