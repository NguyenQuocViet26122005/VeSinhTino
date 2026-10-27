import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let currentMm: gsap.MatchMedia | null = null;
let dragFrame = 0;

function initWow() {
  const root = document.querySelector<HTMLElement>('.wow-hero');
  if (!root) return; // Not on home page

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
  let completed = false;

  function wipe(value: number) {
    const v = Math.min(100, Math.max(0, value));
    if (haze) haze.style.clipPath = 'inset(0 0 0 ' + v + '%)';
    if (squeegee) squeegee.style.transform = 'translateX(' + v + '%)';
    if (readout) readout.textContent = Math.round(v) + '%';
    if (slider) slider.value = String(Math.round(v));
    touch?.setAttribute('aria-valuenow', String(Math.round(v)));
    root?.style.setProperty('--clean', String(v / 100));
    const next = v >= 97;
    root?.classList.toggle('is-clean', next);
    if (next !== completed) {
      completed = next;
      if (status) status.textContent = next ? 'Trong hơn. Sáng hơn.' : 'Mở ra một góc nhìn mới.';
    }
  }

  slider?.addEventListener('input', () => {
    manual = true;
    wipe(Number(slider.value));
  });

  const mm = gsap.matchMedia();
  currentMm = mm;

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const opening = gsap.timeline({ defaults: { ease: 'power3.out' } });
    opening
      .from('.hero-word', { y: 35, opacity: 0, duration: 0.8, clearProps: 'opacity' })
      .from('.hero-line', { y: 22, opacity: 0, duration: 0.65, clearProps: 'opacity' }, 0.1)
      .from(
        '.wow-hero-description, .hero-actions',
        { y: 16, opacity: 0, stagger: 0.08, duration: 0.5, clearProps: 'opacity' },
        0.25
      )
      .from('.window-perspective', { y: 40, opacity: 0, duration: 0.9, clearProps: 'opacity' }, 0.1);

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

    gsap.to('.glass-caption', {
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

    for (const sel of [
      '.wow-intro h2',
      '.wow-section-top h2',
      '.wow-work-heading h2',
      '.price-heading h2',
      '.wow-process > h2',
      '.faq-section h2',
      '.wow-close h2'
    ]) {
      gsap.from(sel, {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: sel, start: 'top 92%', once: true },
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

    document.querySelectorAll('.wow-process li').forEach((el, i) =>
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        delay: i * 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.wow-process ol', start: 'top 88%', once: true },
        clearProps: 'transform,opacity'
      })
    );

    gsap.from('.price-content', {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.price-content', start: 'top 90%', once: true },
      clearProps: 'transform,opacity'
    });
  });

  mm.add(
    '(min-width: 1001px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    () => {
      const world = document.querySelector<HTMLElement>('.glass-world');
      const pane = document.querySelector<HTMLElement>('.window-perspective');
      if (!world || !pane) return;

      let cachedRect: DOMRect | null = null;
      const getRect = () => {
        if (!cachedRect) cachedRect = world.getBoundingClientRect();
        return cachedRect;
      };

      const move = (e: PointerEvent) => {
        if (dragging) return;
        const r = getRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
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
      };

      const enter = () => {
        cachedRect = world.getBoundingClientRect();
        gsap.to(pane, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      };

      const leave = () => {
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
      return () => {
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

  let pendingValue = 35;
  let touchRect: DOMRect | null = null;
  function fromPointer(event: PointerEvent) {
    if (!touch) return;
    if (!touchRect) touchRect = touch.getBoundingClientRect();
    const rect = touchRect;
    pendingValue = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    if (!dragFrame)
      dragFrame = requestAnimationFrame(() => {
        wipe(pendingValue);
        dragFrame = 0;
      });
  }

  touch?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    manual = true;
    dragging = true;
    touchRect = touch.getBoundingClientRect();
    touch.setPointerCapture(event.pointerId);
    root?.classList.add('is-dragging');
    fromPointer(event);
  });

  touch?.addEventListener('pointermove', (event) => {
    if (dragging) fromPointer(event);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && touch) {
      const r = touchRect || (touchRect = touch.getBoundingClientRect());
      touch.parentElement?.style.setProperty('--light-x', ((event.clientX - r.left) / r.width) * 100 + '%');
      touch.parentElement?.style.setProperty('--light-y', ((event.clientY - r.top) / r.height) * 100 + '%');
    }
  });

  function finishDrag() {
    touchRect = null;
    if (dragFrame) {
      cancelAnimationFrame(dragFrame);
      dragFrame = 0;
      wipe(pendingValue);
    }
    dragging = false;
    root?.classList.remove('is-dragging');
  }

  touch?.addEventListener('pointerup', finishDrag);
  touch?.addEventListener('pointercancel', finishDrag);
  touch?.addEventListener('lostpointercapture', finishDrag);

  touch?.addEventListener('keydown', (event) => {
    let v = Number(slider?.value ?? 35);
    if (event.key === 'Home') v = 0;
    else if (event.key === 'End') v = 100;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') v += 5;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') v -= 5;
    else return;
    event.preventDefault();
    manual = true;
    wipe(v);
  });

  document.querySelector('#wipe-reset')?.addEventListener('click', () => {
    manual = true;
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
  if (currentMm) {
    currentMm.revert();
    currentMm = null;
  }
});
