// The nautilus: a small companion that drifts behind the page in muted
// colours, mostly out of sight. It swims the way tracked fish do (and the
// way a real nautilus jets): a burst, a long coast, a turn, another burst.
// It comes forward to welcome the learner to a lesson (and, once, to the
// site), to offer a tip every few minutes, to congratulate the learner on
// finishing a lesson, and, after an hour of reading, to suggest a break.
// Once every course is finished it offers a last, optional quest and, if
// the learner accepts, dives with them into the deep; a learner who passes
// the trial there crowns it for good.
//
// Everything is local: the timers live in localStorage, nothing is sent
// anywhere. With reduced motion the nautilus does not swim; it fades in and
// out in a corner.

import { actions, load, subscribe, type LearnerState } from '../../lib/persistence/store';
import { pickTip, VOICE_LABEL, type Tip } from '../../data/tips';
import { LESSON_GUIDES } from '../../data/lesson-tips';

const KEY = {
  muted: 'nautilus:muted-tips',
  lastTip: 'nautilus:last-tip',
  seen: 'nautilus:seen-tips',
  welcomed: 'nautilus:welcomed',
  siteWelcome: 'nautilus:site-welcome',
  active: 'nautilus:active-ms',
  tick: 'nautilus:last-tick',
  dive: 'nautilus:dive',
  spur: 'nautilus:last-spur',
  pointers: 'nautilus:pointers',
} as const;

const MIN = 60_000;
const WELCOME_AFTER = 1_800;
const WELCOME_AGAIN = 12 * 60 * MIN; // a lesson greets you again after half a day away
const TIP_FIRST_AFTER = 35_000;
const TIP_EVERY = 4 * MIN;
const SEEN_MAX = 300;
const BREAK_EVERY = 60 * MIN;
const BREAK_GAP = 15 * MIN; // away this long counts as a break already taken
const SHOW_FOR = 14_000;
const DIVE_FOR = 2_600;
const SPUR_EVERY = 8.5 * MIN; // while a quest is under way, a word of encouragement every 8½ minutes
const POINTER_GAP = 75_000; // pointers to earlier courses are spaced out
const POINTER_AGAIN = 30 * MIN;

type Kind = 'welcome' | 'tip' | 'cheer' | 'break' | 'quest' | 'note' | 'spur' | 'pointer';

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
  const link = bubble.querySelector<HTMLAnchorElement>('.nb-link')!;

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const article = document.querySelector<HTMLElement>('article[data-slug]');
  const domain = article?.dataset.domain ?? null;
  const slug = article?.dataset.slug ?? null;
  const checkCount = Number(article?.dataset.checks ?? 0);
  const lessonTitle = article?.dataset.title ?? document.title;
  const minutes = Number(article?.dataset.minutes ?? 0);
  const deepPage = document.querySelector('[data-deep-page]') !== null;
  const required = (() => {
    try {
      return JSON.parse(root.dataset.lessons ?? '[]') as [string, number][];
    } catch {
      return [];
    }
  })();

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
    dive: 0,
  };
  const history: [number, number][] = [];
  let mode: 'ambient' | 'present' | 'dive' = 'ambient';
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
    const scale = mode === 'ambient' ? 1 : 2.1;
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
    if (mode === 'dive') {
      // Down into the deep: first to the middle of the screen, then a long sink that gathers speed.
      s.dive += 1;
      if (s.dive < 55) {
        s.vx = s.vx * 0.86 + (W() / 2 - s.x) * 0.012;
        s.vy = s.vy * 0.86 + (H() * 0.3 - s.y) * 0.012;
      } else {
        s.vx *= 0.9;
        s.vy = s.vy * 0.96 + 0.2;
      }
    } else if (mode === 'present') {
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
  const KIND_LABEL: Record<Kind, string> = {
    welcome: 'Welcome',
    tip: 'Tip from the nautilus',
    cheer: 'Well done',
    break: 'Time for a break',
    quest: 'A quest from the nautilus',
    note: 'The nautilus',
    spur: 'Keep going',
    pointer: 'A pointer from the nautilus',
  };
  const OK_LABEL: Partial<Record<Kind, string>> = { break: 'I will rest my eyes', welcome: 'Let us begin', quest: 'Yes, take me to the deep' };

  const hide = () => {
    window.clearTimeout(hideTimer);
    bubble.hidden = true;
    root.classList.remove('is-present');
    mode = 'ambient';
    if (still) draw();
  };

  const say = (kind: Kind, message: string, tip?: Tip, to?: { href: string; label: string }) => {
    window.clearTimeout(hideTimer);
    const heading = tip ? VOICE_LABEL[tip.voice] : KIND_LABEL[kind];
    label.textContent = heading;
    text.textContent = message;
    mute.hidden = kind !== 'tip' && kind !== 'welcome' && kind !== 'quest';
    mute.textContent = kind === 'quest' ? 'No, thank you' : 'Mute tips';
    ok.textContent = OK_LABEL[kind] ?? 'Thanks';
    link.hidden = !to;
    if (to) {
      link.href = to.href;
      link.textContent = to.label;
    }
    bubble.dataset.kind = kind;
    if (tip) bubble.dataset.voice = tip.voice;
    else delete bubble.dataset.voice;
    bubble.hidden = false;
    live.textContent = `${heading}. ${message}`;
    root.classList.add('is-present');
    mode = 'present';
    if (still) draw();
    // Break reminders and the quest stay until answered; the rest drift away.
    if (kind !== 'break' && kind !== 'quest') hideTimer = window.setTimeout(hide, SHOW_FOR);
  };

  const dive = () => {
    hide();
    store.set(KEY.dive, String(Date.now()));
    root.classList.add('is-present', 'is-diving');
    mode = 'dive';
    live.textContent = 'Diving into the deep.';
    window.setTimeout(() => location.assign(root.dataset.deep ?? '/'), still ? 700 : DIVE_FOR);
  };

  ok.addEventListener('click', () => {
    if (bubble.dataset.kind !== 'quest') return hide();
    actions.acceptQuest();
    dive();
  });
  mute.addEventListener('click', () => {
    if (bubble.dataset.kind === 'quest') {
      actions.declineQuest();
      hide();
      window.setTimeout(() => say('note', 'As you wish. The deep will keep. If you change your mind, it waits on your progress page.'), 500);
      return;
    }
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

  const readJson = <T,>(k: string, fallback: T): T => {
    try {
      return (JSON.parse(store.get(k) ?? '') as T) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const muted = () => store.get(KEY.muted) === '1';

  // Welcome: entering a lesson, the nautilus says what it is about. A lesson
  // greets you again only after half a day away. Elsewhere, the very first
  // visit to the site gets a single welcome.
  const guide = slug ? LESSON_GUIDES[slug] : undefined;
  const welcome = (): string | null => {
    if (slug && guide) {
      const length = minutes ? `In about ${minutes} minutes you will learn` : 'You will learn';
      return `Welcome to “${lessonTitle}”. ${length} ${guide.learn}.`;
    }
    return 'Welcome to C++ Atlas. Here you learn C++ by building biological models, from a first program to ODE solvers, stochastic and individual-based simulations. I will drop by with tips as you go.';
  };

  // The quest: offered once every required lesson is studied or demonstrated,
  // until the learner answers. Declining is respected; the progress page keeps the way open.
  const passed = (st: LearnerState, lesson: string) => Object.keys(st.checks).filter((k) => k.startsWith(`${lesson}/`)).length;
  const finished = (st: LearnerState) => required.length > 0 && required.every(([l, c]) => st.studied[l] || (c > 0 && passed(st, l) >= c));
  const shouldOffer = (st: LearnerState) => !deepPage && finished(st) && !st.quest.crowned && !st.quest.declined && !st.quest.accepted;
  const offer = () => {
    actions.offerQuest();
    say(
      'quest',
      `You have finished every course: ${required.length} lessons, from a first program to stochastic and individual-based models. I know a place in the deep where a last trial waits. Build a living cichlid lake in C++, its chemistry, its seasons and its food web, and prove you are truly a C++ pro. It is optional. Will you come?`,
    );
  };
  const crownState = (st: LearnerState) => root.classList.toggle('is-crowned', st.quest.crowned !== null);
  crownState(load());

  // Arriving in the deep after a dive: the water clears around the page.
  const arrived = Date.now() - Number(store.get(KEY.dive) ?? 0) < 20_000;
  if (arrived) {
    store.set(KEY.dive, '0');
    root.classList.add('is-arriving');
    window.setTimeout(() => root.classList.remove('is-arriving'), 1_900);
  }

  const tryWelcome = () => {
    if (shouldOffer(load())) return offer();
    if (deepPage) {
      const st = load();
      const seen = readJson<Record<string, number>>(KEY.welcomed, {});
      if (!arrived && Date.now() - (seen['/deep/'] ?? 0) < WELCOME_AGAIN) return;
      seen['/deep/'] = Date.now();
      store.set(KEY.welcomed, JSON.stringify(seen));
      return say(
        'welcome',
        st.quest.crowned
          ? 'Back in the deep, crowned. The lake is yours; run it again whenever you like.'
          : 'Here we are, in the deep. Below is the lake you will build. Take your time: run it, look at it, write down what you see. Every check says what it measured.',
      );
    }
    if (muted()) return;
    const message = welcome();
    if (!message) return;
    if (slug) {
      const seen = readJson<Record<string, number>>(KEY.welcomed, {});
      if (Date.now() - (seen[slug] ?? 0) < WELCOME_AGAIN) return;
      seen[slug] = Date.now();
      store.set(KEY.welcomed, JSON.stringify(seen));
    } else {
      if (store.get(KEY.siteWelcome)) return;
      store.set(KEY.siteWelcome, String(Date.now()));
    }
    say('welcome', message);
  };
  window.setTimeout(tryWelcome, WELCOME_AFTER);

  // Tips: one at a time, at most every four minutes across pages, preferring
  // the current lesson's own tips and never repeating one until its pool is used up.
  const nextTip = () => {
    const seen = readJson<string[]>(KEY.seen, []);
    const tip = pickTip(slug, domain, new Set(seen));
    const updated = [...seen.filter((t) => t !== tip.text), tip.text].slice(-SEEN_MAX);
    store.set(KEY.seen, JSON.stringify(updated));
    return tip;
  };
  const tryTip = () => {
    if (muted() || deepPage || mode !== 'ambient' || document.hidden) return;
    const last = Number(store.get(KEY.lastTip) ?? 0);
    if (Date.now() - last < TIP_EVERY) return;
    store.set(KEY.lastTip, String(Date.now()));
    const tip = nextTip();
    say('tip', tip.text, tip);
  };
  window.setTimeout(tryTip, TIP_FIRST_AFTER);
  window.setInterval(tryTip, 30_000);

  // Congratulations: a lesson marked as studied, or every check in it right.
  let prev: LearnerState = load();
  subscribe((next) => {
    const before = prev;
    prev = next;
    crownState(next);
    if (!before.quest.crowned && next.quest.crowned) {
      say('cheer', 'Your lake lives: its chemistry, its seasons, its food web and its cascade. You are truly a C++ pro. The crown is yours, and I will wear it on every page from now on.');
      return;
    }
    // The last lesson finished: congratulate first, then make the offer.
    if (!finished(before) && shouldOffer(next)) window.setTimeout(() => shouldOffer(load()) && offer(), 5_000);
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

  // Pointers: in the deep, the nautilus says when the trial calls for
  // something from an earlier course and links to the lesson. They follow what
  // is on screen (a section of the brief) and what the checker has found wrong.
  interface Pointer {
    id: string;
    section?: string;
    check?: string;
    href: string;
    title: string;
    text: string;
  }
  const pointers: Pointer[] = (() => {
    if (!deepPage) return [];
    try {
      return JSON.parse(document.getElementById('deep-pointers')?.textContent ?? '[]') as Pointer[];
    } catch {
      return [];
    }
  })();
  let lastPointer = Date.now() - POINTER_GAP + 25_000;
  const onScreen = new Set<string>();
  let failing: string[] = [];
  const showPointer = (p: Pointer): boolean => {
    const now = Date.now();
    if (mode !== 'ambient' || document.hidden || now - lastPointer < POINTER_GAP) return false;
    const seen = readJson<Record<string, number>>(KEY.pointers, {});
    if (now - (seen[p.id] ?? 0) < POINTER_AGAIN) return false;
    seen[p.id] = now;
    store.set(KEY.pointers, JSON.stringify(seen));
    lastPointer = now;
    say('pointer', p.text, undefined, { href: p.href, label: `Revisit: ${p.title}` });
    return true;
  };
  if (pointers.length) {
    window.addEventListener('deep:failing', (e) => {
      failing = (e as CustomEvent<string[]>).detail ?? [];
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) onScreen.add(en.target.id);
          else onScreen.delete(en.target.id);
        }
      },
      { threshold: 0.2 },
    );
    for (const p of pointers) {
      const el = p.section ? document.getElementById(p.section) : null;
      if (el) io.observe(el);
    }
    window.setInterval(() => {
      const byCheck = pointers.find((p) => p.check && failing.includes(p.check));
      if (byCheck && showPointer(byCheck)) return;
      for (const p of pointers) if (p.section && onScreen.has(p.section) && showPointer(p)) return;
    }, 8_000);
  }

  // Encouragement: while a quest is under way, a word every 8½ minutes of
  // reading time, wherever the learner is.
  const SPURS = [
    'Still swimming? Good. Every lake begins as one pool and one flux. Get the phosphorus to balance first.',
    'Plankton before fish, fish before the piscivore. After each layer you add, run six years before adding the next.',
    'If a number looks wrong, print it. Look at one day, one pool, one flux.',
    'A model that crashes is giving you information. Which pool went negative first?',
    'Seasons are the test of a lake. Plot temperature, oxygen and plankton against the day of the year.',
    'Coexistence is hard-won. Two guilds with the same niche cannot both stay: give each its own food.',
    'The deep takes time. Rest your eyes, then come back to the simplest check that still fails.',
    'The checker tells you what it measured, never what to change. That part is the science.',
    'Every good model was wrong at first. Keep going; the lake is closer than it looks.',
  ];
  const trySpur = () => {
    const st = load();
    if (!st.quest.accepted || st.quest.crowned || document.hidden || mode !== 'ambient') return;
    const last = Number(store.get(KEY.spur) ?? 0);
    // The clock starts at the first look, and again after a long absence.
    if (!last || Date.now() - last > 4 * SPUR_EVERY) return store.set(KEY.spur, String(Date.now()));
    if (Date.now() - last < SPUR_EVERY) return;
    store.set(KEY.spur, String(Date.now()));
    const n = Number(store.get(`${KEY.spur}-n`) ?? 0);
    store.set(`${KEY.spur}-n`, String(n + 1));
    say('spur', SPURS[n % SPURS.length]);
  };
  window.setInterval(trySpur, 20_000);

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

  // Preview any message with ?nautilus=welcome|tip|cheer|break|quest|crown.
  if (new URLSearchParams(location.search).get('nautilus') === 'quest') window.setTimeout(offer, 600);
  if (new URLSearchParams(location.search).get('nautilus') === 'crown') root.classList.add('is-crowned');
  const preview = new URLSearchParams(location.search).get('nautilus');
  if (preview === 'welcome') window.setTimeout(() => say('welcome', welcome()!), 600);
  if (preview === 'tip')
    window.setTimeout(() => {
      const tip = nextTip();
      say('tip', tip.text, tip);
    }, 600);
  if (preview === 'cheer') window.setTimeout(() => say('cheer', `“${lessonTitle}” is studied. Nicely done.`), 600);
  if (preview === 'break') window.setTimeout(() => say('break', 'You have been reading for an hour. Look at something far away for twenty seconds, stretch, drink some water. The atlas will wait.'), 600);
  document.addEventListener('visibilitychange', tickBreak);

  window.addEventListener('resize', () => {
    s.x = Math.min(s.x, W() + 100);
    s.y = Math.min(s.y, H() + 100);
  });

  return () => cancelAnimationFrame(raf);
}
