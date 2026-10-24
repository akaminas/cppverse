// The nautilus: a small companion that drifts behind the page in muted
// colours, mostly out of sight. It swims the way tracked fish do (and the
// way a real nautilus jets): a burst, a long coast, a turn, another burst.
// Now and then it comes forward to offer a tip, to congratulate the learner
// on finishing a lesson, and, after an hour of reading, to suggest a break.
//
// Everything is local: the timers live in localStorage, nothing is sent
// anywhere. With reduced motion the nautilus does not swim; it fades in and
// out in a corner.

import { load, subscribe, type LearnerState } from '../../lib/persistence/store';
import { tipsFor } from '../../data/tips';

const KEY = {
  muted: 'nautilus:muted-tips',
  lastTip: 'nautilus:last-tip',
  active: 'nautilus:active-ms',
  tick: 'nautilus:last-tick',
} as const;

const MIN = 60_000;
const TIP_FIRST_AFTER = 45_000;
const TIP_EVERY = 9 * MIN;
const BREAK_EVERY = 60 * MIN;
const BREAK_GAP = 15 * MIN; // away this long counts as a break already taken
const SHOW_FOR = 14_000;

type Kind = 'tip' | 'cheer' | 'break';

const store = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* storage unavailable: forget between pages */
    }
  },
};

export function startNautilus(root: HTMLElement) {
  const body = root.querySelector<HTMLElement>('.nautilus')!;
  const flip = root.querySelector<HTMLElement>('.nautilus-flip')!;
  const tentacles = [...root.querySelectorAll<SVGPathElement>('.nt-tentacle')];
  const trail = root.querySelector<SVGPolylineElement>('.nautilus-trail polyline')!;
  const bubble = root.querySelector<HTMLElement>('.nautilus-bubble')!;
  const label = bubble.querySelector<HTMLElement>('.nb-kind')!;
  const text = bubble.querySelector<HTMLElement>('.nb-text')!;
  const ok = bubble.querySelector<HTMLButtonElement>('.nb-ok')!;
  const mute = bubble.querySelector<HTMLButtonElement>('.nb-mute')!;
  const live = root.querySelector<HTMLElement>('.nb-live')!;

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const article = document.querySelector<HTMLElement>('article[data-slug]');
  const domain = article?.dataset.domain ?? null;
  const slug = article?.dataset.slug ?? null;
  const checkCount = Number(article?.dataset.checks ?? 0);
  const lessonTitle = article?.dataset.title ?? document.title;

  // ── Motion ────────────────────────────────────────────────────────────────
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;
  const s = {
    x: W() * (0.2 + 0.6 * Math.random()),
    y: H() * (0.3 + 0.5 * Math.random()),
    vx: 0,
    vy: 0,
    heading: 0,
    tx: 0,
    ty: 0,
    nextBurst: 0,
    restUntil: 0,
    squash: 0,
    t: 0,
  };
  const history: [number, number][] = [];
  let mode: 'ambient' | 'present' = 'ambient';
  let hideTimer = 0;

  const pickTarget = () => {
    // Often the target lies just off screen, so the nautilus spends long
    // stretches out of sight and only drifts through now and then.
    const away = Math.random() < 0.4;
    if (away) {
      const side = Math.floor(Math.random() * 4);
      const m = 140;
      s.tx = side === 0 ? -m : side === 1 ? W() + m : Math.random() * W();
      s.ty = side === 2 ? -m : side === 3 ? H() + m : Math.random() * H();
    } else {
      s.tx = W() * (0.08 + 0.84 * Math.random());
      s.ty = H() * (0.12 + 0.76 * Math.random());
    }
  };
  pickTarget();

  const perch = () => ({ x: W() - (W() < 620 ? 80 : 120), y: H() - (W() < 620 ? 180 : 140) });

  const draw = () => {
    const speed = Math.hypot(s.vx, s.vy);
    const a = s.heading;
    const facingLeft = Math.cos(a) < 0;
    const scale = mode === 'present' ? 2.1 : 1;
    const sq = 1 - 0.08 * s.squash;
    body.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${a.toFixed(3)}rad) scale(${(scale * sq).toFixed(3)}, ${(scale * (2 - sq)).toFixed(3)})`;
    flip.style.transform = facingLeft ? 'scaleY(-1)' : '';
    // Tentacles stream straight in a burst and wave while coasting.
    const amp = 1.5 + 4.5 * Math.max(0, 1 - speed / 4);
    tentacles.forEach((el, i) => {
      const y0 = Number(el.dataset.y);
      const len = Number(el.dataset.len);
      const ph = s.t * 0.11 + i * 0.8;
      const w1 = amp * Math.sin(ph);
      const w2 = amp * 1.6 * Math.sin(ph - 1.3);
      el.setAttribute('d', `M-8,${y0} C${-8 - len * 0.35},${(y0 + w1).toFixed(2)} ${-8 - len * 0.7},${(y0 * 1.25 + w2 * 0.6).toFixed(2)} ${-8 - len},${(y0 * 1.4 + w2).toFixed(2)}`);
    });
    if (mode === 'ambient') {
      // The faint track is sampled every fourth frame: cheap, and it reads as a tracker's trace.
      if (s.t % 4 === 0) {
        history.push([s.x, s.y]);
        if (history.length > 24) history.shift();
        trail.setAttribute('points', history.map(([x, y]) => `${x.toFixed(0)},${y.toFixed(0)}`).join(' '));
      }
    } else if (history.length) {
      history.length = 0;
      trail.setAttribute('points', '');
    }
  };

  const step = (now: number) => {
    s.t += 1;
    s.squash *= 0.9;
    if (mode === 'present') {
      // Swim to the perch beside the speech bubble and hover there.
      const p = perch();
      const dx = p.x - s.x;
      const dy = p.y + Math.sin(s.t * 0.03) * 4 - s.y;
      s.vx = s.vx * 0.86 + dx * 0.012;
      s.vy = s.vy * 0.86 + dy * 0.012;
    } else if (now >= s.restUntil) {
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 40) {
        const offscreen = s.x < -60 || s.x > W() + 60 || s.y < -60 || s.y > H() + 60;
        // Linger out of sight for a while before coming back.
        if (offscreen) s.restUntil = now + 8_000 + Math.random() * 22_000;
        pickTarget();
      } else if (now >= s.nextBurst) {
        const jitter = (Math.random() - 0.5) * 0.9;
        const ang = Math.atan2(dy, dx) + jitter;
        const power = 2.6 + Math.random() * 2.6;
        s.vx += Math.cos(ang) * power;
        s.vy += Math.sin(ang) * power;
        s.squash = 1;
        s.nextBurst = now + 900 + Math.random() * 2600;
      }
      s.vx *= 0.968;
      s.vy *= 0.968;
    } else {
      s.vx *= 0.9;
      s.vy *= 0.9;
    }
    s.x += s.vx;
    s.y += s.vy;
    const speed = Math.hypot(s.vx, s.vy);
    // Resting out of sight: nothing to draw.
    const offscreen = s.x < -80 || s.x > W() + 80 || s.y < -80 || s.y > H() + 80;
    if (mode === 'ambient' && offscreen && speed < 0.05) return;
    if (mode === 'present') {
      // At the perch it turns to face the bubble (eye and tentacles forward).
      let d = -s.heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      s.heading += d * 0.06;
    } else if (speed > 0.25) {
      const want = Math.atan2(s.vy, s.vx);
      let d = want - s.heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      s.heading += d * 0.09;
    }
    draw();
  };

  let raf = 0;
  const loop = (now: number) => {
    if (!document.hidden) step(now);
    raf = requestAnimationFrame(loop);
  };

  if (still) {
    const p = perch();
    s.x = p.x;
    s.y = p.y;
    s.heading = Math.PI;
    draw();
  } else {
    draw();
    raf = requestAnimationFrame(loop);
  }

  // ── Speech ────────────────────────────────────────────────────────────────
  const KIND_LABEL: Record<Kind, string> = { tip: 'Tip from the nautilus', cheer: 'Well done', break: 'Time for a break' };

  const hide = () => {
    window.clearTimeout(hideTimer);
    bubble.hidden = true;
    root.classList.remove('is-present');
    mode = 'ambient';
    if (still) draw();
  };

  const say = (kind: Kind, message: string) => {
    window.clearTimeout(hideTimer);
    label.textContent = KIND_LABEL[kind];
    text.textContent = message;
    mute.hidden = kind !== 'tip';
    ok.textContent = kind === 'break' ? 'I will rest my eyes' : 'Thanks';
    bubble.dataset.kind = kind;
    bubble.hidden = false;
    live.textContent = `${KIND_LABEL[kind]}. ${message}`;
    root.classList.add('is-present');
    mode = 'present';
    if (still) draw();
    // Break reminders stay until acknowledged; the rest drift away.
    if (kind !== 'break') hideTimer = window.setTimeout(hide, SHOW_FOR);
  };

  ok.addEventListener('click', hide);
  mute.addEventListener('click', () => {
    store.set(KEY.muted, '1');
    hide();
  });
  bubble.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
  // Pause the auto-hide while the learner is reading the bubble.
  bubble.addEventListener('pointerenter', () => window.clearTimeout(hideTimer));
  bubble.addEventListener('pointerleave', () => {
    if (!bubble.hidden && bubble.dataset.kind !== 'break') hideTimer = window.setTimeout(hide, 6_000);
  });

  // Tips: one at a time, never more often than every nine minutes across pages.
  const tips = tipsFor(domain);
  const tryTip = () => {
    if (store.get(KEY.muted) === '1' || mode === 'present' || document.hidden) return;
    const last = Number(store.get(KEY.lastTip) ?? 0);
    if (Date.now() - last < TIP_EVERY) return;
    store.set(KEY.lastTip, String(Date.now()));
    // Topic tips first in a lesson; general ones elsewhere.
    const pool = domain && Math.random() < 0.7 ? tips.slice(0, Math.max(1, tips.length - 8)) : tips;
    say('tip', pool[Math.floor(Math.random() * pool.length)]);
  };
  window.setTimeout(tryTip, TIP_FIRST_AFTER);
  window.setInterval(tryTip, 60_000);

  // Congratulations: a lesson marked as studied, or every check in it right.
  let prev: LearnerState = load();
  subscribe((next) => {
    const before = prev;
    prev = next;
    const newlyStudied = Object.keys(next.studied).filter((k) => !before.studied[k]);
    if (newlyStudied.length) {
      const here = slug && newlyStudied.includes(slug);
      const done = Object.keys(next.studied).length;
      say('cheer', here ? `“${lessonTitle}” is studied. That is ${done} lesson${done === 1 ? '' : 's'} in your field guide.` : `Another lesson studied: ${done} so far.`);
      return;
    }
    if (slug && checkCount > 0) {
      const passed = (st: LearnerState) => Object.keys(st.checks).filter((k) => k.startsWith(`${slug}/`)).length;
      if (passed(before) < checkCount && passed(next) >= checkCount) {
        say('cheer', `Every check in “${lessonTitle}” answered correctly. You can explain this one now.`);
      }
    }
  });

  // Breaks: an hour of reading time (only while a page is visible), counted
  // across pages. Being away for a quarter of an hour resets the clock.
  const tickBreak = () => {
    const now = Date.now();
    const lastTick = Number(store.get(KEY.tick) ?? 0);
    let active = Number(store.get(KEY.active) ?? 0);
    const gap = now - lastTick;
    if (!lastTick || gap > BREAK_GAP) active = 0;
    else if (!document.hidden) active += gap;
    store.set(KEY.tick, String(now));
    if (active >= BREAK_EVERY) {
      active = 0;
      say('break', 'You have been reading for an hour. Look at something far away for twenty seconds, stretch, drink some water. The atlas will wait.');
    }
    store.set(KEY.active, String(active));
  };
  tickBreak();
  window.setInterval(tickBreak, 30_000);

  // Preview any message with ?nautilus=tip|cheer|break.
  const preview = new URLSearchParams(location.search).get('nautilus');
  if (preview === 'tip') window.setTimeout(() => say('tip', tips[0]), 600);
  if (preview === 'cheer') window.setTimeout(() => say('cheer', `“${lessonTitle}” is studied. Nicely done.`), 600);
  if (preview === 'break') window.setTimeout(() => say('break', 'You have been reading for an hour. Look at something far away for twenty seconds, stretch, drink some water. The atlas will wait.'), 600);
  document.addEventListener('visibilitychange', tickBreak);

  window.addEventListener('resize', () => {
    s.x = Math.min(s.x, W() + 100);
    s.y = Math.min(s.y, H() + 100);
  });

  return () => cancelAnimationFrame(raf);
}
