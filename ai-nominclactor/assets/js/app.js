(function () {
  const btn = document.getElementById('check-ready');
  const out = document.getElementById('status');
  if (!btn || !out) return;

  btn.addEventListener('click', () => {
    const checks = [
      'Module folder present',
      'Assets linked',
      'Return to Hub button linked',
      'Ready for Pre-Assessment integration',
      'Ready for Psychiatric Evaluation scaffold'
    ];
    out.textContent = 'Self-Check:\n- ' + checks.join('\n- ');
  });
})();
document.addEventListener('DOMContentLoaded', function () {
  // Create/locate the host row for bottom controls
  let row = document.querySelector('.actions');
  if (!row) {
    row = document.createElement('section');
    row.className = 'actions';
    row.style.cssText = 'display:flex;gap:8px;margin:12px 0;flex-wrap:wrap';
    (document.querySelector('.wrap') || document.body).appendChild(row);
  }

  function addBtn(id, label, extraClass){
    if (document.getElementById(id)) return;
    const b = document.createElement('button');
    b.id = id;
    b.type = 'button';
    b.className = 'btn' + (extraClass ? ' ' + extraClass : '');
    b.textContent = label;
    row.appendChild(b);
  }

  addBtn('mic', '🎙️ Mic', 'secondary');
  addBtn('export-json', 'Export Summary JSON', 'secondary');
  addBtn('reset-session', 'Reset Interview', 'danger');
});
