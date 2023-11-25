const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => r.querySelectorAll(s);
const toggle = (e, d = 'block') => {
  e.style.display = getComputedStyle(e).display == 'none' ? d : 'none';
};

const toggle_help = () => toggle(qs('#help'));

const link_reciprocals = () => {
  Array.from(qsa('.clipped')).forEach(t => {
    let move;
    const r = Array.from(qsa('.res', t));
    r.forEach(c => {
      const pair = c.getAttribute('data-pair');
      const recip = r.find(e => e.getAttribute('data-pair') == pair.split('-').reverse().join('-'));
      if (!recip) return;

      c.addEventListener('pointerenter', () => {
        const ours = c.getElementsByClassName('tip')[0];
        const theirs = recip.getElementsByClassName('tip')[0];
        move = c.cellIndex < recip.cellIndex ? ours : theirs;
        move.classList.add('hl');
        recip.classList.add('shadow');
      });

      c.addEventListener('pointerleave', () => {
        recip.classList.remove('shadow');
        if (move) { move.classList.remove('hl'); move = null; }
      });
    });
  });
};

const expand_all = () => {
  Array.from(qsa('.expando')).forEach(e => e.click());
}

const load = async () => {
  for (let i = 1; i <= 19; ++i) {
    const e = document.createElement('template');
    e.innerHTML = await fetch(`tables/${i}?cb=${Date.now()}`).then(r => r.text());
    const t = e.content.firstChild;
    document.body.appendChild(t);
    const w = qs('.wins', t);
    w.click(); w.click();
    if (i == localStorage.look) t.children[0].scrollIntoView();
  }
}

const init = () => {
  Array.from(qsa('.expando')).forEach(e => {
    e.addEventListener('click', () => {
      e.parentNode.classList.remove('clipped');
      e.remove();
    });
  });

  Array.from(qsa('.res, .no-res')).forEach(c => {
    const ct = c.closest('table');
    c.addEventListener('pointerenter', (ev) => {
      const bcr = ev.target.getBoundingClientRect();
      const tcr = ct.getBoundingClientRect();
      qs('tr', ct).children[c.cellIndex].style.fontWeight = 'bold';
      ct.style.backgroundSize = `${bcr.width}px 999px`;
      ct.style.backgroundPosition = `${bcr.x - tcr.x}px 6.25em`;
    });
    c.addEventListener('pointerleave', () => {
      ct.style.backgroundSize = 0;
      qs('tr', ct).children[c.cellIndex].style.fontWeight = 'normal';
    });
  });

  link_reciprocals();
};

load().then(init);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState == 'hidden')
    localStorage.look = Array.from(qsa('.sh')).findIndex(e => e.offsetTop > scrollY) + 1;
});
