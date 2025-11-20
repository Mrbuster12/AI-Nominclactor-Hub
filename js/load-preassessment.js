(async () => {
  const res = await fetch('/partials/preassessment-controls.html', {cache:'no-store'});
  const html = await res.text();

  let mount = document.getElementById('preassessment-mount');
  if (!mount) {
    mount = document.createElement('section');
    mount.id='preassessment-mount';
    (document.querySelector('main')||document.body).prepend(mount);
  }

  const wrap = document.createElement('div'); wrap.innerHTML = html;

  const prefix = 'preimp-';
  wrap.querySelectorAll('[id]').forEach(el => el.id = prefix + el.id);
  wrap.querySelectorAll('[for]').forEach(el => { const f=el.getAttribute('for'); if (f) el.setAttribute('for', prefix+f); });

  mount.innerHTML = '';
  mount.appendChild(wrap.firstElementChild);
})();
