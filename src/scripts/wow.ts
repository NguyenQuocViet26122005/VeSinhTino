import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let initializedHero: HTMLElement | null = null;
let currentMm: gsap.MatchMedia | null = null;
let dragFrame = 0;
let cleanupGesture: (() => void) | undefined;

function initWow() {
  const root = document.querySelector<HTMLElement>('.wow-hero');
  if (!root || initializedHero === root) return;
  initializedHero = root;
  cleanupGesture?.();
  cleanupGesture = undefined;

  if (currentMm) {
    currentMm.revert();
  }

  const slider = document.querySelector<HTMLInputElement>('#hero-wipe');
  const readout = document.querySelector<HTMLOutputElement>('#wipe-readout');
  const haze = document.querySelector<HTMLElement>('.window-haze');
  const squeegee = document.querySelector<HTMLElement>('.hero-squeegee');
  let manual = false;
  let dragging = false;
  const touch = document.querySelector<HTMLElement>('.glass-touch');
  const status = document.querySelector<HTMLElement>('#wipe-status');
  const daylight = document.querySelector<HTMLElement>('.daylight-field');
  let completed = false;
  let lastWipe = -1;
  let lastReadout = -1;

  function wipe(value: number) {
    const v = Math.min(100, Math.max(0, value));
    if (v === lastWipe) return;
    lastWipe = v;
    if (haze) haze.style.clipPath = 'inset(0 0 0 ' + v + '%)';
    if (squeegee) squeegee.style.transform = 'translateX(' + v + '%)';
    const rounded = Math.round(v);
    if (rounded !== lastReadout) {
      lastReadout = rounded;
      if (readout) readout.textContent = rounded + '%';
      if (slider) slider.value = String(rounded);
      touch?.setAttribute('aria-valuenow', String(rounded));
    }
    // Keep the same daylight effect without invalidating inherited styles for the entire hero.
    if (daylight) daylight.style.opacity = String(.4 + v / 100 * .6);
    const next = v >= 97;
    root?.classList.toggle('is-clean', next);
    if (next !== completed) {
      completed = next;
      if (status) status.textContent = next ? 'Trong hơn. Sáng hơn.' : 'Mở ra một góc nhìn mới.';
    }
  }

  slider?.addEventListener('input', () => {
    manual = true;
    cancelMotion();
    wipe(Number(slider.value));
  });

  const mm = gsap.matchMedia();
  currentMm = mm;

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const opening = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (document.querySelector('.hero-word')) {
      opening.from('.hero-word', { y: 35, opacity: 0, duration: 0.8, clearProps: 'opacity' });
    }
    if (document.querySelector('.hero-line')) {
      opening.from('.hero-line', { y: 22, opacity: 0, duration: 0.65, clearProps: 'opacity' }, 0.1);
    }
    if (document.querySelector('.wow-hero-description, .hero-actions')) {
      opening.from(
        '.wow-hero-description, .hero-actions',
        { y: 16, opacity: 0, stagger: 0.08, duration: 0.5, clearProps: 'opacity' },
        0.25
      );
    }
    if (document.querySelector('.window-perspective')) {
      opening.from('.window-perspective', { y: 40, opacity: 0, duration: 0.9, clearProps: 'opacity' }, 0.1);
    }

    const motion = { progress: 35 };
    gsap.to(motion, {
      progress: 100,
      ease: 'none',
      onUpdate: () => {
        if (!manual) wipe(motion.progress);
      },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'center top',
        scrub: 0.35
      }
    });

    const captionEl = document.querySelector('.glass-caption');
    if (captionEl) {
      gsap.to(captionEl, {
        y: -35,
        rotation: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }

    for (const sel of [
      '.wow-intro h2',
      '.wow-section-top h2',
      '.wow-work-heading h2',
      '.price-heading h2',
      '.faq-section h2',
      '.wow-close h2'
    ]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      gsap.from(el, {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        clearProps: 'transform,opacity'
      });
    }

    document.querySelectorAll('.work-shot').forEach((el, i) =>
      gsap.from(el, {
        y: 28 + i * 14,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        clearProps: 'transform,opacity'
      })
    );

    const processList = document.querySelector('.wow-process ol');
    const processItems = document.querySelectorAll('.wow-process li');
    if (processList && processItems.length > 0) {
      processItems.forEach((el, i) =>
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: processList, start: 'top 88%', once: true },
          clearProps: 'transform,opacity'
        })
      );
    }

    const priceContent = document.querySelector('.price-content');
    if (priceContent) {
      gsap.from(priceContent, {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: priceContent, start: 'top 90%', once: true },
        clearProps: 'transform,opacity'
      });
    }
  });

  mm.add(
    '(min-width: 1001px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    () => {
      const world = document.querySelector<HTMLElement>('.glass-world');
      const pane = document.querySelector<HTMLElement>('.window-perspective');
      if (!world || !pane) return;

      let cachedRect: DOMRect | null = null;
      let tiltFrame = 0;
      let latestPoint = { x: 0, y: 0 };
      const getRect = () => {
        if (!cachedRect) cachedRect = world.getBoundingClientRect();
        return cachedRect;
      };

      const move = (e: PointerEvent) => {
        if (dragging) return;
        latestPoint = { x: e.clientX, y: e.clientY };
        if (tiltFrame) return;
        tiltFrame = requestAnimationFrame(() => {
          tiltFrame = 0;
          const r = getRect();
          const x = (latestPoint.x - r.left) / r.width - 0.5;
          const y = (latestPoint.y - r.top) / r.height - 0.5;
          gsap.to(pane, {
            rotationY: -12 + x * 8,
            rotationX: -y * 5,
            rotationZ: -6,
            x: x * 8,
            y: y * 6,
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });
      };

      const enter = () => {
        cachedRect = world.getBoundingClientRect();
        gsap.to(pane, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      };

      const leave = () => {
        cancelAnimationFrame(tiltFrame); tiltFrame = 0;
        cachedRect = null;
        gsap.to(pane, {
          rotationY: -12,
          rotationX: 0,
          rotationZ: -6,
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      };

      world.addEventListener('pointerenter', enter, { passive: true });
      world.addEventListener('pointermove', move, { passive: true });
      world.addEventListener('pointerleave', leave);
      const invalidateRect = () => { cachedRect = null; };
      window.addEventListener('scroll', invalidateRect, { passive: true });
      window.addEventListener('resize', invalidateRect, { passive: true });
      return () => {
        cancelAnimationFrame(tiltFrame);
        window.removeEventListener('scroll', invalidateRect);
        window.removeEventListener('resize', invalidateRect);
        world.removeEventListener('pointerenter', enter);
        world.removeEventListener('pointermove', move);
        world.removeEventListener('pointerleave', leave);
      };
    }
  );

  const selections = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-service-select]'));
  selections.forEach((btn) =>
    btn.addEventListener('click', () => {
      const selected = btn.dataset.serviceSelect;
      if (window.matchMedia('(max-width: 600px)').matches)
        document.querySelector('.service-display')?.scrollIntoView({
          block: 'start',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth'
        });
      selections.forEach((b) => {
        const active = b === btn;
        b.setAttribute('aria-pressed', String(active));
        b.closest('.service-index-row')?.classList.toggle('is-active', active);
      });
      document.querySelectorAll<HTMLElement>('[data-service-scene]').forEach((scene) => {
        const active = scene.dataset.serviceScene === selected;
        scene.hidden = !active;
        if (active && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
          scene.animate([{ opacity: 0.3, transform: 'scale(1.015)' }, { opacity: 1, transform: 'scale(1)' }], {
            duration: 240,
            easing: 'cubic-bezier(.23,1,.32,1)'
          });
      });
    })
  );

  document.fonts.ready.then(() => ScrollTrigger.refresh());

  let pendingValue = Number(slider?.value ?? 35);
  let touchRect: DOMRect | null = null;
  let activePointer: number | null = null;
  let startX = 0;
  let startValue = 35;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let moved = false;
  let springFrame = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function cancelMotion() {
    cancelAnimationFrame(springFrame);
    springFrame = 0;
  }
  function settle(releaseVelocity: number) {
    cancelMotion();
    if (reduced.matches || Math.abs(releaseVelocity) < 3) return;
    let value = Number(slider?.value ?? pendingValue);
    const target = Math.max(0, Math.min(100, value + releaseVelocity * .08));
    let speed = releaseVelocity;
    let previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, .032);
      previous = now;
      // Critically damped spring; small substeps keep it stable after a slow frame.
      for (let i = 0; i < 4; i++) {
        speed += ((target - value) * 400 - speed * 40) * dt / 4;
        value += speed * dt / 4;
      }
      value = Math.max(0, Math.min(100, value));
      wipe(value);
      if (Math.abs(target - value) < .05 && Math.abs(speed) < .5) {
        wipe(target); springFrame = 0; return;
      }
      springFrame = requestAnimationFrame(tick);
    };
    springFrame = requestAnimationFrame(tick);
  }
  touch?.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || activePointer !== null) return;
    cancelMotion();
    manual = true; dragging = true; moved = false;
    activePointer = event.pointerId;
    touchRect = touch.getBoundingClientRect();
    startX = lastX = event.clientX; lastTime = event.timeStamp; velocity = 0;
    startValue = Number(slider?.value ?? 35); pendingValue = startValue;
    touch.setPointerCapture(event.pointerId);
    root.classList.add('is-dragging');
  });
  touch?.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer || !touchRect) return;
    const width = touchRect.width;
    const delta = event.clientX - startX;
    moved ||= Math.abs(delta) > 5;
    const dt = event.timeStamp - lastTime;
    if (dt > 0) velocity = .5 * velocity + .5 * (event.clientX - lastX) / width * 100000 / dt;
    lastX = event.clientX; lastTime = event.timeStamp;
    pendingValue = Math.max(0, Math.min(100, startValue + delta / width * 100));
    if (!dragFrame) dragFrame = requestAnimationFrame(() => { wipe(pendingValue); dragFrame = 0; });
  });
  function finishDrag(event: PointerEvent) {
    if (event.pointerId !== activePointer) return;
    cancelAnimationFrame(dragFrame); dragFrame = 0;
    const released = event.type === 'pointerup';
    if (released && !moved && touchRect) pendingValue = (event.clientX - touchRect.left) / touchRect.width * 100;
    wipe(pendingValue);
    dragging = false; activePointer = null; touchRect = null;
    root?.classList.remove('is-dragging');
    if (released && moved && event.timeStamp - lastTime < 80) settle(Math.max(-150, Math.min(150, velocity)));
  }
  touch?.addEventListener('pointerup', finishDrag);
  touch?.addEventListener('pointercancel', finishDrag);
  touch?.addEventListener('lostpointercapture', finishDrag);
  const stopWhenHidden = () => { if (document.hidden) cancelMotion(); };
  const stopForPreference = () => { if (reduced.matches) cancelMotion(); };
  document.addEventListener('visibilitychange', stopWhenHidden);
  reduced.addEventListener('change', stopForPreference);
  cleanupGesture = () => {
    cancelMotion(); cancelAnimationFrame(dragFrame); dragFrame = 0;
    document.removeEventListener('visibilitychange', stopWhenHidden);
    reduced.removeEventListener('change', stopForPreference);
  };

  touch?.addEventListener('keydown', (event) => {
    let v = Number(slider?.value ?? 35);
    if (event.key === 'Home') v = 0;
    else if (event.key === 'End') v = 100;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') v += 5;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') v -= 5;
    else return;
    event.preventDefault();
    cancelMotion();
    manual = true;
    wipe(v);
  });

  document.querySelector('#wipe-reset')?.addEventListener('click', () => {
    manual = true;
    cancelMotion();
    wipe(0);
  });
}

let hasWowLoaded = false;
document.addEventListener('astro:page-load', () => {
  hasWowLoaded = true;
  initWow();
});

if (!hasWowLoaded && document.readyState === 'complete') {
  initWow();
}
document.addEventListener('astro:before-swap', () => {
  initializedHero = null;
  cleanupGesture?.();
  cleanupGesture = undefined;
  if (currentMm) {
    currentMm.revert();
    currentMm = null;
  }
});
